import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { calculateStockStatus } from '@/shared/lib/warehouse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, name, category, quantity, unit, price, amount, date, comment } = body;

    if (!supplierId || !name || !category || !quantity || !unit || !amount) {
      return errorResponse('Укажите обязательные поля: поставщик, название, категория, количество, единица и сумма', 400);
    }

    const qty = Number(quantity);
    const amt = Number(amount);
    const prc = price ? Number(price) : null;

    if (isNaN(qty) || isNaN(amt) || qty <= 0 || amt <= 0) {
      return errorResponse('Некорректные значения количества или суммы', 400);
    }

    const dateParsed = date ? new Date(date) : new Date();

    let item = await prisma.warehouseItem.findFirst({
      where: { name, category },
    });

    const newQuantity = item
      ? item.quantity + qty
      : qty;

    const status = calculateStockStatus(newQuantity);

    const movement = await prisma.$transaction(async (tx) => {
      if (!item) {
        item = await tx.warehouseItem.create({
          data: {
            name,
            category,
            quantity: qty,
            unit,
            price: prc,
            cost: amt,
            location: 'Склад',
            status,
            supplierId,
            lastUpdate: dateParsed,
          },
        });
      } else {
        await tx.warehouseItem.update({
          where: { id: item.id },
          data: {
            quantity: newQuantity,
            lastUpdate: dateParsed,
            status,
          },
        });
      }

      const m = await tx.warehouseMovement.create({
        data: {
          itemId: item.id,
          type: 'income',
          quantity: qty,
          amount: amt,
          date: dateParsed,
          comment: comment || null,
          supplierId,
        },
        include: { item: true, supplier: true },
      });

      return m;
    });

    return successResponse(movement, 201);
  } catch (error) {
    console.error('POST /api/supplier-materials error:', error);
    return handlePrismaError(error);
  }
}
