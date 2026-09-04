import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateBrigadeSchema } from '@/shared/lib/validators';

// GET /api/brigades/[id] - получить бригаду по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brigade = await prisma.brigade.findUnique({
      where: { id: Number(id) },
      include: {
        employees: true,
        projects: true,
      },
    });

    if (!brigade) {
      return errorResponse('Бригада не найдена', 404);
    }

    return successResponse(brigade);
  } catch (error) {
    console.error('GET /api/brigades/[id] error:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/brigades/[id] - обновить бригаду
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateBrigadeSchema.parse(body);

    const brigade = await prisma.brigade.update({
      where: { id: Number(id) },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.leaderId !== undefined && { leaderId: validated.leaderId }),
        ...(validated.memberIds !== undefined && { memberIds: validated.memberIds }),
        ...(validated.skillIds && validated.skillIds.length > 0 && { skills: { connect: validated.skillIds.map((id: number) => ({ id })) } }),
      },
      include: {
        employees: true,
        projects: true,
      },
    });

    return successResponse(brigade);
  } catch (error) {
    console.error('PATCH /api/brigades/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/brigades/[id] - удалить бригаду
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.brigade.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/brigades/[id] error:', error);
    return handlePrismaError(error);
  }
}
