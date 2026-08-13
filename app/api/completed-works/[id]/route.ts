import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateCompletedWorkSchema } from '@/shared/lib/validators';

// GET /api/completed-works/[id] - получить выполненную работу по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const work = await prisma.completedWork.findUnique({
      where: { id: Number(id) },
      include: {
        project: true,
      },
    });

    if (!work) {
      return errorResponse('Выполненная работа не найдена', 404);
    }

    return successResponse(work);
  } catch (error) {
    console.error('GET /api/completed-works/[id] error:', error);
    return errorResponse('Не удалось получить выполненную работу', 500);
  }
}

// PATCH /api/completed-works/[id] - обновить выполненную работу
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateCompletedWorkSchema.parse(body);

    const work = await prisma.completedWork.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(work);
  } catch (error) {
    console.error('PATCH /api/completed-works/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/completed-works/[id] - удалить выполненную работу
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.completedWork.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/completed-works/[id] error:', error);
    return handlePrismaError(error);
  }
}
