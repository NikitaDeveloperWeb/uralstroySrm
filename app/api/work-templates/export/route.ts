import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    console.log('[Export API] Starting work types export...');
    
    const rates = await prisma.unitRate.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
    });
    
    console.log('[Export API] Found', rates.length, 'active rates');

    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');

    // Группируем по категориям
    const byCategory: Record<string, typeof rates> = {};
    for (const rate of rates) {
      const cat = rate.category || 'Без категории';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(rate);
    }

    const rows: (string | null)[][] = [
      [null, null, null, `Дата формирования: ${dateStr}`, null, null, null, null, null],
      [],
      ['#', 'Вид работ', 'Категория', 'Ед. изм.', 'Цена клиент (₽)', 'Цена сотрудник (₽)', 'Описание', 'Есть в наличии', 'Статус']
    ];

    let rowNum = 1;
    const categories = Object.keys(byCategory).sort();
    
    for (const cat of categories) {
      rows.push([`📁 ${cat}`, '', '', '', '', '', '', '', '']);
      
      // Собираем пары (client + employee)
      const processed = new Set<number>();
      for (const rate of byCategory[cat]) {
        if (processed.has(rate.id)) continue;
        
        // Находим пару (client или employee)
        const clientRate = rate.targetType === 'client' ? rate : null;
        const employeeRate = rate.targetType === 'employee' ? rate : null;
        
        // Ищем пару с тем же именем
        const pair = byCategory[cat].find(r => 
          r.id !== rate.id && 
          r.name === rate.name && 
          !processed.has(r.id)
        );
        
        if (pair) {
          const client = rate.targetType === 'client' ? rate : pair;
          const employee = rate.targetType === 'employee' ? rate : pair;
          processed.add(rate.id);
          processed.add(pair.id);
          
          rows.push([
            String(rowNum++),
            rate.name,
            rate.category || '—',
            rate.unit || '—',
            client.pricePerUnit ? client.pricePerUnit.toLocaleString('ru-RU') : '—',
            employee.pricePerUnit ? employee.pricePerUnit.toLocaleString('ru-RU') : '—',
            rate.description || '—',
            'Да',
            'Активен'
          ]);
        } else {
          processed.add(rate.id);
          rows.push([
            String(rowNum++),
            rate.name,
            rate.category || '—',
            rate.unit || '—',
            rate.targetType === 'client' ? rate.pricePerUnit.toLocaleString('ru-RU') : '—',
            rate.targetType === 'employee' ? rate.pricePerUnit.toLocaleString('ru-RU') : '—',
            rate.description || '—',
            'Да',
            'Активен'
          ]);
        }
      }
      rows.push([]);
    }

    const totalRates = rates.length / 2;
    const avgClientPrice = rates.filter(r => r.targetType === 'client').reduce((sum, r) => sum + r.pricePerUnit, 0) / (rates.filter(r => r.targetType === 'client').length || 1);

    rows.push([]);
    rows.push(['', '', '', '', '', '', `ИТОГО: ${totalRates} видов работ, средн. цена: ${Math.round(avgClientPrice).toLocaleString('ru-RU')} ₽`, '', '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 },   // #
      { wch: 40 },  // Вид работ
      { wch: 25 },  // Категория
      { wch: 12 },  // Ед. изм.
      { wch: 18 },  // Цена клиент
      { wch: 18 },  // Цена сотрудник
      { wch: 35 },  // Описание
      { wch: 15 },  // Есть в наличии
      { wch: 12 },  // Статус
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Виды работ');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="work_types_${now.toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Export work types error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Ошибка экспорта', details: errorMsg },
      { status: 500 }
    );
  }
}
