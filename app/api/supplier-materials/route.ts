import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { calculateStockStatus } from '@/shared/lib/warehouse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, name, category, quantity, unit, price, amount, discount, date, comment, projectId, stage } = body;

    if (!supplierId || !name || !category || !quantity || !unit) {
      return errorResponse('Укажите обязательные поля: поставщик, название, категория, количество и единица', 400);
    }

    const qty = Number(quantity);
    const amt = Number(amount);
    const prc = price ? Number(price) : null;
    const disc = discount ? Number(discount) : 0;

    if (isNaN(qty) || qty <= 0) {
      return errorResponse('Некорректное значение количества', 400);
    }

    const calculatedAmount = qty * (prc || 0) * (1 - disc / 100);
    const finalAmount = amt > 0 ? amt : Math.round(calculatedAmount * 100) / 100;

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
          amount: finalAmount,
          date: dateParsed,
          comment: comment || null,
          supplierId,
          projectId: projectId || null,
        },
        include: { item: true, supplier: true, project: true },
      });

      // If project is specified, add to project material estimate (merge if exists)
      if (projectId) {
        const existing = await tx.materialEstimate.findFirst({
          where: {
            projectId: Number(projectId),
            name,
            category: category || null,
            stage: stage || null,
          },
        });

        if (existing) {
          // Sum quantities and costs
          const existingCost = Number(existing.cost) || 0;
          await tx.materialEstimate.update({
            where: { id: existing.id },
            data: {
              cost: existingCost + finalAmount,
            },
          });
        } else {
          await tx.materialEstimate.create({
            data: {
              projectId: Number(projectId),
              name,
              quantity: `${qty} ${unit}`,
              cost: finalAmount,
              category: category || null,
              stage: stage || null,
            },
          });
        }
      }

      return m;
    });

    return successResponse(movement, 201);
  } catch (error) {
    console.error('POST /api/supplier-materials error:', error);
    return handlePrismaError(error);
  }
}
