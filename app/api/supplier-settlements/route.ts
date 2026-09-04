import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';

// GET /api/supplier-settlements - получить балансы всех поставщиков
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Если указан конкретный поставщик - возвращаем детали
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: Number(supplierId) },
      });

      if (!supplier) {
        return errorResponse('Поставщик не найден', 404);
      }

      const where: any = { supplierId: Number(supplierId) };

      if (from && to) {
        where.date = {
          gte: new Date(from),
          lte: new Date(to),
        };
      }

      const movements = await prisma.warehouseMovement.findMany({
        where: { ...where, type: 'income' },
        include: { item: true },
        orderBy: { date: 'desc' },
      });

      const payments = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
      });

      const totalReceived = movements.reduce((sum, m) => sum + (m.amount || 0), 0);
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalReceived - totalPaid;

      return successResponse({
        supplier,
        summary: {
          totalReceived,
          totalPaid,
          balance,
        },
        movements,
        payments,
      });
    }

    // Иначе возвращаем список всех поставщиков с балансами
    const suppliers = await prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: { companyName: 'asc' },
    });

    const result = await Promise.all(
      suppliers.map(async (supplier) => {
        const movements = await prisma.warehouseMovement.findMany({
          where: {
            supplierId: supplier.id,
            type: 'income',
            ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
          },
          include: { item: true },
        });

        const payments = await prisma.expense.findMany({
          where: {
            supplierId: supplier.id,
            ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
          },
        });

        const totalReceived = movements.reduce((sum, m) => sum + (m.amount || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = totalReceived - totalPaid;

        return {
          supplierId: supplier.id,
          companyName: supplier.companyName,
          category: supplier.category,
          totalReceived,
          totalPaid,
          balance,
        };
      }),
    );

    return successResponse(result);
  } catch (error) {
    console.error('GET /api/supplier-settlements error:', error);
    return handlePrismaError(error);
  }
}
