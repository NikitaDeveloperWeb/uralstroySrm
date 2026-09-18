import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateEmployeeWorkReportSchema } from '@/shared/lib/validators';

// GET /api/employee-work-reports/[id] - получить служебную записку по ID
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const report = await prisma.employeeWorkReport.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        project: true,
      },
    });

    if (!report) {
      return errorResponse('Служебная записка не найдена', 404);
    }

    return successResponse(report);
  } catch (error) {
    console.error('GET /api/employee-work-reports/[id] error:', error);
    return errorResponse('Не удалось получить служебную записку', 500);
  }
}

// PATCH /api/employee-work-reports/[id] - обновить служебную записку
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updateEmployeeWorkReportSchema.parse(body);

    // Transform validated data for Prisma: convert undefined to omit, null to null
    const updateData: any = {};
    if (validated.employeeId !== undefined) updateData.employeeId = validated.employeeId;
    if (validated.projectId !== undefined) updateData.projectId = validated.projectId ?? null;
    if (validated.workType !== undefined) updateData.workType = validated.workType;
    if (validated.quantity !== undefined) updateData.quantity = validated.quantity;
    if (validated.rate !== undefined) updateData.rate = validated.rate;
    if (validated.amount !== undefined) updateData.amount = validated.amount;
    if (validated.date !== undefined) updateData.date = validated.date;
    if (validated.comment !== undefined) updateData.comment = validated.comment;
    if (validated.stage !== undefined) updateData.stage = validated.stage;

    const report = await prisma.$transaction(async (tx) => {
      // Получаем старый отчет
      const oldReport = await tx.employeeWorkReport.findUnique({
        where: { id: Number(id) },
        select: { projectId: true, workType: true, quantity: true, amount: true, stage: true },
      });

      const updated = await tx.employeeWorkReport.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
          employee: true,
          project: true,
        },
      });

      // Обновляем смету выполненных работ, если был проект
      if (oldReport?.projectId && updated.projectId) {
        const oldStage = oldReport.stage || null;
        const newStage = updated.stage || null;
        const oldName = oldReport.workType;
        const newName = updated.workType;

        // Если изменился stage или name — удаляем из старой записи сметы
        if (oldStage !== newStage || oldName !== newName) {
          const oldOverhead = await tx.completedWork.findFirst({
            where: {
              projectId: oldReport.projectId,
              name: oldName,
              stage: oldStage,
            },
          });

          if (oldOverhead) {
            const oldQty = parseFloat(String(oldOverhead.quantity)) || 0;
            const removeQty = parseFloat(String(oldReport.quantity)) || 0;
            const removeCost = Math.round(Number(oldReport.amount) || 0);

            if (Math.abs(oldQty - removeQty) < 0.01) {
              // Полное совпадение количества — удаляем
              await tx.completedWork.delete({ where: { id: oldOverhead.id } });
            } else {
              // Уменьшаем количество и стоимость
              await tx.completedWork.update({
                where: { id: oldOverhead.id },
                data: {
                  quantity: String(Math.max(0, oldQty - removeQty)),
                  cost: Math.max(0, oldOverhead.cost - removeCost),
                },
              });
            }
          }
        }

        // Добавляем в новую запись сметы
        const existing = await tx.completedWork.findFirst({
          where: {
            projectId: updated.projectId,
            name: updated.workType,
            stage: newStage,
          },
        });

        if (existing) {
          const existingCost = Number(existing.cost) || 0;
          const existingQty = parseFloat(String(existing.quantity)) || 0;
          await tx.completedWork.update({
            where: { id: existing.id },
            data: {
              quantity: String(existingQty + updated.quantity),
              cost: existingCost + Math.round(updated.amount || 0),
            },
          });
        } else {
          await tx.completedWork.create({
            data: {
              projectId: updated.projectId,
              name: updated.workType,
              quantity: String(updated.quantity),
              cost: Math.round(updated.amount || 0),
              category: null,
              stage: newStage,
            },
          });
        }
      }

      return updated;
    });

    return successResponse(report);
  } catch (error) {
    console.error('PATCH /api/employee-work-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/employee-work-reports/[id] - удалить служебную записку
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    await prisma.$transaction(async (tx) => {
      // Получаем отчет перед удалением
      const report = await tx.employeeWorkReport.findUnique({
        where: { id: Number(id) },
        select: { projectId: true, workType: true, quantity: true, amount: true, stage: true },
      });

      if (!report) {
        throw new Error('Служебная записка не найдена');
      }

      // Удаляем из сметы выполненных работ, если был проект
      if (report.projectId) {
        const overhead = await tx.completedWork.findFirst({
          where: {
            projectId: report.projectId,
            name: report.workType,
            stage: report.stage || null,
          },
        });

        if (overhead) {
          const removeCost = Math.round(Number(report.amount) || 0);
          const removeQty = parseFloat(String(report.quantity)) || 0;

          // Проверяем совпадение количества
          const existingQty = parseFloat(String(overhead.quantity)) || 0;
          if (Math.abs(existingQty - removeQty) < 0.01) {
            // Полное совпадение — удаляем запись из сметы
            await tx.completedWork.delete({
              where: { id: overhead.id },
            });
          } else {
            // Уменьшаем количество и стоимость
            await tx.completedWork.update({
              where: { id: overhead.id },
              data: {
                quantity: String(Math.max(0, existingQty - removeQty)),
                cost: Math.max(0, overhead.cost - removeCost),
              },
            });
          }
        }
      }

      // Удаляем отчет
      await tx.employeeWorkReport.delete({
        where: { id: Number(id) },
      });
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/employee-work-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}
