import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';

// GET /api/warehouse-items - получить список материалов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.warehouseItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.warehouseItem.count({ where }),
    ]);

    return successResponse({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('GET /api/warehouse-items error:', error);
    return errorResponse('Не удалось получить материалы', 500);
  }
}

// POST /api/warehouse-items - создать материал
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const item = await prisma.warehouseItem.create({
      data: {
        name: body.name,
        category: body.category,
        quantity: body.quantity || 0,
        unit: body.unit,
        price: body.price,
        lotNumber: body.lotNumber,
        cost: body.cost,
        location: body.location,
        status: body.status || 'in-stock',
        supplierId: body.supplierId || null,
        lastUpdate: new Date(),
      },
    });

    return successResponse(item, 201);
  } catch (error) {
    console.error('POST /api/warehouse-items error:', error);
    return handlePrismaError(error);
  }
}
