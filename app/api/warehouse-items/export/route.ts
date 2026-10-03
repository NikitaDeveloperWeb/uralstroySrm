import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const items = await prisma.warehouseItem.findMany({
      orderBy: { category: 'asc', name: 'asc' },
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');

    // Группируем по категориям
    const byCategory: Record<string, typeof items> = {};
    for (const item of items) {
      const cat = item.category || 'Без категории';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    }

    const rows: (string | null)[][] = [
      [null, null, null, `Дата формирования: ${dateStr}`, null, null, null],
      [],
      ['#', 'Наименование', 'Категория', 'Количество', 'Ед. изм.', 'Цена (₽)', 'Местоположение', 'Статус']
    ];

    let rowNum = 1;
    const categories = Object.keys(byCategory).sort();
    
    for (const cat of categories) {
      rows.push([`📁 ${cat}`, '', '', '', '', '', '', '']);
      for (const item of byCategory[cat]) {
        rows.push([
          String(rowNum++),
          item.name,
          item.category || '—',
          String(item.quantity),
          item.unit || '—',
          item.price ? item.price.toLocaleString('ru-RU') : '—',
          item.location || '—',
          item.status || '—'
        ]);
      }
      rows.push([]);
    }

    const totalItems = items.length;
    const totalValue = items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 0)), 0);

    rows.push([]);
    rows.push(['', '', '', '', '', '', 'ИТОГО:', `${totalItems} поз. на ${totalValue.toLocaleString('ru-RU')} ₽`]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 },   // #
      { wch: 40 },  // Наименование
      { wch: 25 },  // Категория
      { wch: 12 },  // Количество
      { wch: 10 },  // Ед. изм.
      { wch: 15 },  // Цена
      { wch: 20 },  // Местоположение
      { wch: 12 },  // Статус
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Материалы');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="materials_${now.toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Export materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка экспорта' },
      { status: 500 }
    );
  }
}
