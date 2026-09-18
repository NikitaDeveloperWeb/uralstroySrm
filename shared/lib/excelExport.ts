import * as XLSX from 'xlsx';

interface ExpenseItem {
  id: number;
  date: string;
  amount: number;
  recipient: string;
  purpose: string;
  category: string;
}

/**
 * Экспорт расходов в Excel файл
 * @param expenses - массив расходов
 * @param period - период для названия файла
 */
export function exportExpensesToExcel(
  expenses: ExpenseItem[],
  period: 'day' | 'week' | 'month' | 'year' = 'month'
) {
  if (!expenses || expenses.length === 0) {
    console.warn('Нет данных для экспорта в Excel');
    return;
  }

  // Формируем данные для Excel
  const data = expenses.map((expense, index) => ({
    '№': index + 1,
    'Дата': new Date(expense.date).toLocaleDateString('ru-RU'),
    'Категория': expense.category || 'Без категории',
    'Назначение': expense.purpose,
    'Получатель': expense.recipient,
    'Сумма, ₽': expense.amount,
  }));

  // Добавляем итоговую строку
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  data.push({
    '№': 0,
    'Дата': '',
    'Категория': '',
    'Назначение': '',
    'Получатель': 'ИТОГО:',
    'Сумма, ₽': totalAmount,
  });

  // Создаём workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Настраиваем ширину колонок
  ws['!cols'] = [
    { wch: 5 },   // №
    { wch: 12 },  // Дата
    { wch: 20 },  // Категория
    { wch: 40 },  // Назначение
    { wch: 30 },  // Получатель
    { wch: 15 },  // Сумма
  ];

  // Добавляем лист в workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Расходы');

  // Формируем имя файла с датой и периодом
  const periodLabels: Record<string, string> = {
    day: 'день',
    week: 'неделя',
    month: 'месяц',
    year: 'год',
  };

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const fileName = `Расходы_${periodLabels[period]}_${dateStr}.xlsx`;

  // Скачиваем файл
  XLSX.writeFile(wb, fileName);
}

/**
 * Экспорт расходов в Excel с группировкой по категориям
 * @param expenses - массив расходов
 * @param period - период для названия файла
 */
export function exportExpensesGroupedByCategory(
  expenses: ExpenseItem[],
  period: 'day' | 'week' | 'month' | 'year' = 'month'
) {
  if (!expenses || expenses.length === 0) {
    console.warn('Нет данных для экспорта в Excel');
    return;
  }

  // Группируем по категориям
  const categoriesMap = new Map<string, ExpenseItem[]>();
  expenses.forEach(expense => {
    const cat = expense.category || 'Без категории';
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)!.push(expense);
  });

  // Создаём workbook
  const wb = XLSX.utils.book_new();

  // Добавляем общий лист
  const data = expenses.map((expense, index) => ({
    '№': index + 1,
    'Дата': new Date(expense.date).toLocaleDateString('ru-RU'),
    'Категория': expense.category || 'Без категории',
    'Назначение': expense.purpose,
    'Получатель': expense.recipient,
    'Сумма, ₽': expense.amount,
  }));

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  data.push({
    '№': 0,
    'Дата': '',
    'Категория': '',
    'Назначение': '',
    'Получатель': 'ИТОГО:',
    'Сумма, ₽': totalAmount,
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 20 },
    { wch: 40 },
    { wch: 30 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Все расходы');

  // Добавляем лист по каждой категории
  categoriesMap.forEach((catExpenses, categoryName) => {
    const catData = catExpenses.map((expense, index) => ({
      '№': index + 1,
      'Дата': new Date(expense.date).toLocaleDateString('ru-RU'),
      'Назначение': expense.purpose,
      'Получатель': expense.recipient,
      'Сумма, ₽': expense.amount,
    }));

    const catTotal = catExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    catData.push({
      '№': 0,
      'Дата': '',
      'Назначение': '',
      'Получатель': 'ИТОГО:',
      'Сумма, ₽': catTotal,
    });

    const catWs = XLSX.utils.json_to_sheet(catData);
    catWs['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 40 },
      { wch: 30 },
      { wch: 15 },
    ];

    // Безопасное имя листа (до 31 символа)
    const safeName = categoryName.length > 31 
      ? categoryName.substring(0, 31) 
      : categoryName;
    XLSX.utils.book_append_sheet(wb, catWs, safeName);
  });

  // Формируем имя файла
  const periodLabels: Record<string, string> = {
    day: 'день',
    week: 'неделя',
    month: 'месяц',
    year: 'год',
  };

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const fileName = `Расходы_по_категориям_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
