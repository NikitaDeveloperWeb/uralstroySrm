import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateClientSchema } from '@/shared/lib/validators';

// GET /api/clients/[id] - получить клиента по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id: Number(id) },
      include: {
        projects: true,
      },
    });

    if (!client) {
      return errorResponse('Клиент не найден', 404);
    }

    return successResponse(client);
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error);
    return errorResponse('Не удалось получить клиента', 500);
  }
}

// PATCH /api/clients/[id] - обновить клиента
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateClientSchema.parse(body);

    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        projects: true,
      },
    });

    return successResponse(client);
  } catch (error) {
    console.error('PATCH /api/clients/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/clients/[id] - удалить клиента
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.client.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);
    return handlePrismaError(error);
  }
}
