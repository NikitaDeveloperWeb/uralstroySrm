import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const typeOrder: Record<string, number> = {
      'дом': 1,
      'баня': 2,
      'туалет': 3,
      'хозблок': 4,
      'веранда': 5
    };

    const projects = await prisma.project.findMany({
      where: {
        status: { not: 'завершен' }
      },
      include: {
        client: true,
        transactions: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    projects.sort((a, b) => {
      // Сначала сортируем по типу
      const typeA = typeOrder[a.type] ?? 99;
      const typeB = typeOrder[b.type] ?? 99;
      if (typeA !== typeB) return typeA - typeB;
      // Внутри типа — по дедлайну (сначала ближайшие)
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dateA - dateB;
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');

    const rows: (string | null)[][] = [
      [null, null, null, `Дата формирования: ${dateStr}`, null, null, null, null, null, null],
      [],
      ['#', 'Тип объекта', 'ФИО клиента', 'Телефон', 'Название объекта', 'Адрес', 'Дедлайн', 'Сумма договора', 'Список платежей', 'Остаток платежа', 'Примечания']
    ];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const client = project.client;
      
      const totalPaid = project.transactions.reduce((sum, t) => sum + t.amount, 0);
      const contractSum = project.cost || 0;
      const remaining = contractSum - totalPaid;

      const paymentList = project.transactions.length > 0
        ? `${project.transactions.length} платеж(ей) на сумму ${totalPaid.toLocaleString('ru-RU')} ₽`
        : 'Нет платежей';

      rows.push([
        String(i + 1),
        project.type,
        client?.name || '—',
        client?.phone || '—',
        project.name,
        project.address || '—',
        project.deadline ? new Date(project.deadline).toLocaleDateString('ru-RU') : '—',
        contractSum.toLocaleString('ru-RU') + ' ₽',
        paymentList,
        remaining.toLocaleString('ru-RU') + ' ₽',
        project.description || '—'
      ]);
    }

    const totalContract = projects.reduce((sum, p) => sum + (p.cost || 0), 0);
    const totalPaid = projects.reduce((sum, p) => sum + p.transactions.reduce((s, t) => s + t.amount, 0), 0);
    const totalRemaining = totalContract - totalPaid;

    rows.push([]);
    rows.push(['', '', '', 'Платежи', '0', '01.01.1', '0 ₽', `${projects.reduce((s, p) => s + p.transactions.length, 0)} платеж(ей) на сумму ${totalPaid.toLocaleString('ru-RU')} ₽`, totalRemaining.toLocaleString('ru-RU') + ' ₽', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 },   // #
      { wch: 15 },  // Тип объекта
      { wch: 25 },  // ФИО клиента
      { wch: 15 },  // Телефон
      { wch: 30 },  // Название объекта
      { wch: 30 },  // Адрес
      { wch: 12 },  // Дедлайн
      { wch: 18 },  // Сумма договора
      { wch: 40 },  // Список платежей
      { wch: 18 },  // Остаток
      { wch: 30 }   // Примечания
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Объекты');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="objects_${now.toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Export objects error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка экспорта' },
      { status: 500 }
    );
  }
}
