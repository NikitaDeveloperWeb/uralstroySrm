import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// GET /api/supplier-settlements/export - экспорт выписки поставщика в Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!supplierId) {
      return NextResponse.json(
        { success: false, message: 'Не указан supplierId' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(supplierId) },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'Поставщик не найден' },
        { status: 404 }
      );
    }

    // Получаем материалы от поставщика
    const movementsWhere: any = { supplierId: Number(supplierId), type: 'income' };
    if (from && to) {
      movementsWhere.date = { gte: new Date(from), lte: new Date(to) };
    }

    const movements = await prisma.warehouseMovement.findMany({
      where: movementsWhere,
      include: { item: true, project: true },
      orderBy: { date: 'asc' },
    });

    // Получаем оплаты поставщику
    const paymentsWhere: any = { supplierId: Number(supplierId) };
    if (from && to) {
      paymentsWhere.date = { gte: new Date(from), lte: new Date(to) };
    }

    const payments = await prisma.expense.findMany({
      where: paymentsWhere,
      orderBy: { date: 'asc' },
    });

    // Формируем данные для Excel
    const wb = XLSX.utils.book_new();

    // Лист 1: Материалы
    const materialsData: any[] = movements.map((m) => ({
      'Дата': new Date(m.date).toLocaleDateString('ru-RU'),
      'Наименование': m.item?.name || '—',
      'Категория': m.item?.category || '—',
      'Количество': m.item?.quantity || 0,
      'Ед. измерения': m.item?.unit || '—',
      'Сумма (₽)': m.amount || 0,
      'Проект': m.project?.name || '—',
      'Комментарий': m.comment || '—',
    }));

    materialsData.push({
      'Дата': '',
      'Наименование': 'ИТОГО',
      'Категория': '',
      'Количество': '',
      'Ед. измерения': '',
      'Сумма (₽)': movements.reduce((sum, m) => sum + (m.amount || 0), 0),
      'Проект': '',
      'Комментарий': '',
    });

    const ws1 = XLSX.utils.json_to_sheet(materialsData);
    ws1['!cols'] = [
      { wch: 12 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Материалы');

    // Лист 2: Оплата
    const paymentsData: any[] = payments.map((p) => ({
      'Дата': new Date(p.date).toLocaleDateString('ru-RU'),
      'Сумма (₽)': p.amount,
      'Получатель': p.recipient,
      'Назначение': p.purpose,
      'Категория': p.category || '—',
      'Комментарий': '—',
    }));

    paymentsData.push({
      'Дата': 'ИТОГО',
      'Сумма (₽)': payments.reduce((sum, p) => sum + p.amount, 0),
      'Получатель': '',
      'Назначение': '',
      'Категория': '',
      'Комментарий': '',
    });

    const ws2 = XLSX.utils.json_to_sheet(paymentsData);
    ws2['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 30 },
      { wch: 40 },
      { wch: 20 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Оплата');

    // Генерируем Excel файл
    const fileName = `Выписка_${supplier.companyName}_${from || 'начало'}_${to || 'настоящее_время'}.xlsx`;
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer as unknown as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    console.error('GET /api/supplier-settlements/export error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при генерации выписки' },
      { status: 500 }
    );
  }
}
