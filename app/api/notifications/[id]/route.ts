import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateNotificationSchema } from '@/shared/lib/validators';

// GET /api/notifications/[id] - получить уведомление по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      return errorResponse('Уведомление не найдено', 404);
    }

    return successResponse(notification);
  } catch (error) {
    console.error('GET /api/notifications/[id] error:', error);
    return errorResponse('Не удалось получить уведомление', 500);
  }
}

// PATCH /api/notifications/[id] - обновить уведомление
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateNotificationSchema.parse(body);

    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(notification);
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/notifications/[id] - удалить уведомление
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.notification.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return handlePrismaError(error);
  }
}
