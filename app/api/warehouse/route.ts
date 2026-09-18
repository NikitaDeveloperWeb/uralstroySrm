import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createWarehouseItemSchema, updateWarehouseItemSchema } from '@/shared/lib/validators';

// GET /api/warehouse - получить список товаров с пагинацией
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      const statusMap: Record<string, string> = {
        'in-stock': 'достаточно',
        'ordered': 'ordered',
      };
      where.status = statusMap[status] || status;
    }

    const [items, total] = await Promise.all([
      prisma.warehouseItem.findMany({
        where,
        include: {
          movements: true,
          notifications: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.warehouseItem.count({ where }),
    ]);

    // Маппинг статусов из БД на фронтенд
    const frontendStatusMap: Record<string, string> = {
      'достаточно': 'in-stock',
      'мало': 'in-stock',
      'критически мало': 'in-stock',
      'нет в наличии': 'in-stock',
      'ordered': 'ordered',
    };

    const mapped = items.map((item: any) => ({
      ...item,
      status: frontendStatusMap[item.status] || 'in-stock',
    }));

    return successResponse({
      items: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
