import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createNotificationSchema, updateNotificationSchema } from '@/shared/lib/validators';

// GET /api/notifications - получить список уведомлений
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const isArchived = searchParams.get('isArchived');

    const where: any = {};
    if (isRead !== null) where.isRead = isRead === 'true';
    if (isArchived !== null) where.isArchived = isArchived === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return errorResponse('Не удалось получить уведомления', 500);
  }
}

// POST /api/notifications - создать уведомление
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: validated,
    });

    return successResponse(notification, 201);
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return handlePrismaError(error);
  }
}
