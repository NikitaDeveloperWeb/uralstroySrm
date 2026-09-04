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

    // Маппинг статусов из БД на фронтенд
    const statusMap: Record<string, string> = {
      'достаточно': 'in-stock',
      'мало': 'in-stock',
      'критически мало': 'in-stock',
      'нет в наличии': 'in-stock',
      'ordered': 'ordered',
    };

    const mapped = items.map((item: any) => ({
      ...item,
      status: statusMap[item.status] || 'in-stock',
    }));

    return successResponse(mapped);
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

    // Маппинг статусов на значения БД
    const dbStatusMap: Record<string, string> = {
      'in-stock': 'достаточно',
      'ordered': 'ordered',
    };

    const item = await prisma.warehouseItem.create({
      data: {
        name: validated.name,
        category: validated.category,
        quantity: validated.quantity,
        unit: validated.unit,
        price: validated.price,
        lotNumber: validated.lotNumber || null,
        cost: validated.cost,
        location: validated.location || 'Склад',
        status: dbStatusMap[validated.status] || 'достаточно',
        supplierId: validated.supplierId || null,
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
