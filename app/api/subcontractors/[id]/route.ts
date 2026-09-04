import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateSubcontractorSchema } from '@/shared/lib/validators';

// GET /api/subcontractors/[id] - получить подрядчика по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id: Number(id) },
      include: {
        projects: true,
      },
    });

    if (!subcontractor) {
      return errorResponse('Подрядчик не найден', 404);
    }

    return successResponse(subcontractor);
  } catch (error) {
    console.error('GET /api/subcontractors/[id] error:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/subcontractors/[id] - обновить подрядчика
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSubcontractorSchema.parse(body);

    const subcontractor = await prisma.subcontractor.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        projects: true,
      },
    });

    return successResponse(subcontractor);
  } catch (error) {
    console.error('PATCH /api/subcontractors/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/subcontractors/[id] - удалить подрядчика
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.subcontractor.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/subcontractors/[id] error:', error);
    return handlePrismaError(error);
  }
}
