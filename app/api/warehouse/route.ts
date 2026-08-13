import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createWarehouseItemSchema, updateWarehouseItemSchema } from '@/shared/lib/validators';

// GET /api/warehouse - получить список товаров
export async function GET() {
  try {
    const items = await prisma.warehouseItem.findMany({
      include: {
        movements: true,
        notifications: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(items);
  } catch (error) {
    console.error('GET /api/warehouse error:', error);
    return handlePrismaError(error);
  }
}

// POST /api/warehouse - создать товар
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createWarehouseItemSchema.parse(body);

    const item = await prisma.warehouseItem.create({
      data: {
        ...validated,
        lastUpdate: new Date(),
      },
      include: {
        movements: true,
        notifications: true,
      },
    });

    return successResponse(item, 201);
  } catch (error) {
    console.error('POST /api/warehouse error:', error);
    return handlePrismaError(error);
  }
}
