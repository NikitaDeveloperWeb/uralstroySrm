import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateTechEquipmentSchema } from '@/shared/lib/validators';

export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const equipment = await prisma.techEquipment.findUnique({
      where: { id: Number(id) },
    });

    if (!equipment) {
      return errorResponse('Техника не найдена', 404);
    }

    return successResponse(equipment);
  } catch (error) {
    console.error('GET /api/tech-equipment/[id] error:', error);
    return handlePrismaError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updateTechEquipmentSchema.parse(body);

    const equipment = await prisma.techEquipment.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(equipment);
  } catch (error) {
    console.error('PATCH /api/tech-equipment/[id] error:', error);
    return handlePrismaError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    await prisma.techEquipment.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/tech-equipment/[id] error:', error);
    return handlePrismaError(error);
  }
}
