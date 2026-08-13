import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateMaterialEstimateSchema } from '@/shared/lib/validators';

// GET /api/material-estimates/[id] - получить смету материала по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estimate = await prisma.materialEstimate.findUnique({
      where: { id: Number(id) },
      include: {
        project: true,
      },
    });

    if (!estimate) {
      return errorResponse('Смета материала не найдена', 404);
    }

    return successResponse(estimate);
  } catch (error) {
    console.error('GET /api/material-estimates/[id] error:', error);
    return errorResponse('Не удалось получить смету материала', 500);
  }
}

// PATCH /api/material-estimates/[id] - обновить смету материала
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateMaterialEstimateSchema.parse(body);

    const estimate = await prisma.materialEstimate.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(estimate);
  } catch (error) {
    console.error('PATCH /api/material-estimates/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/material-estimates/[id] - удалить смету материала
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.materialEstimate.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/material-estimates/[id] error:', error);
    return handlePrismaError(error);
  }
}
