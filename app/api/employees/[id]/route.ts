import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateEmployeeSchema } from '@/shared/lib/validators';

// GET /api/employees/[id] - получить сотрудника по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: {
        brigade: true,
        workReports: true,
      },
    });

    if (!employee) {
      return errorResponse('Сотрудник не найден', 404);
    }

    return successResponse(employee);
  } catch (error) {
    console.error('GET /api/employees/[id] error:', error);
    return errorResponse('Не удалось получить сотрудника', 500);
  }
}

// PATCH /api/employees/[id] - обновить сотрудника
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateEmployeeSchema.parse(body);

    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        ...(validated.fullName !== undefined && { fullName: validated.fullName }),
        ...(validated.birthDate !== undefined && { birthDate: validated.birthDate }),
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.hireDate !== undefined && { hireDate: validated.hireDate }),
        ...(validated.workplace !== undefined && { workplace: validated.workplace }),
        ...(validated.paymentType !== undefined && { paymentType: validated.paymentType }),
        ...(validated.employmentType !== undefined && { employmentType: validated.employmentType }),
        ...(validated.brigadeId !== undefined && { brigadeId: validated.brigadeId }),
        ...(validated.hourlyRateId !== undefined && { hourlyRateId: validated.hourlyRateId }),
        ...(validated.skillIds && validated.skillIds.length > 0 && { skills: { connect: validated.skillIds.map((id: number) => ({ id })) } }),
      },
      include: {
        brigade: true,
        workReports: true,
      },
    });

    return successResponse(employee);
  } catch (error) {
    console.error('PATCH /api/employees/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/employees/[id] - удалить сотрудника
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.employee.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/employees/[id] error:', error);
    return handlePrismaError(error);
  }
}
