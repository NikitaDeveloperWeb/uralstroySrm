import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createSupplierSchema, updateSupplierSchema } from '@/shared/lib/validators';

// GET /api/suppliers - получить список поставщиков
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(suppliers);
  } catch (error) {
    console.error('GET /api/suppliers error:', error);
    return errorResponse('Не удалось получить поставщиков', 500);
  }
}

// POST /api/suppliers - создать поставщика
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSupplierSchema.parse(body);

    const supplier = await prisma.supplier.create({
      data: validated,
    });

    return successResponse(supplier, 201);
  } catch (error) {
    console.error('POST /api/suppliers error:', error);
    return handlePrismaError(error);
  }
}
