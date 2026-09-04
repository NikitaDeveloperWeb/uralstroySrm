# Контекст для следующей сессии

## Проект
Next.js 16 CRM для строительной компании (Уралстрой).
Стек: Next.js 16 (App Router, Turbopack), Prisma + SQLite, Zustand, Tailwind CSS, Lucide, xlsx.

## Что сделано в текущей сессии
- ✅ Удалён общий экспорт PDF в отчетах
- ✅ Каждый отчет цеха теперь можно экспортировать в Excel по отдельности (кнопка FileText рядом с кнопкой удаления)
- ✅ В финансах (ЕОТ) каждый отчет можно экспортировать в Excel по отдельности
- ✅ Общая кнопка "Экспорт PDF" убрана из страницы отчетов
- ✅ На странице отчетов осталась только кнопка "Экспорт в Excel" для всех отчетов сразу

## Что нужно сделать в следующей сессии
1. **Финансы — ExpenseReportModal**: Добавить кнопку экспорта каждого расхода в Excel (аналогично отчетам цеха)
2. **Финансы — SalaryReportModal / AdvanceReportCombinedModal**: Добавить экспорт каждого отчета в Excel
3. **Финансы — SummaryReportModal**: Добавить экспорт в Excel
4. **Проверить все страницы**: Убедиться, что общий экспорт PDF удалён везде, где он был

## Текущая проблема (исправлено в прошлой сессии)
- ❌ В ReportModal суммы материалов/работ показывали "Не число" (NaN)
- ✅ Исправлено: extractNumber использует match[0] вместо match[1]

## Ключевые файлы
- `shared/components/projects/ReportModal.tsx` — отчет по объекту (экспорт в Excel)
- `shared/components/finance/ExpenseReportModal.tsx` — отчет по расходам (нужен экспорт каждого расхода)
- `shared/components/finance/SalaryReportModal.tsx` — зарплатные отчеты (нужен экспорт каждого)
- `shared/components/finance/AdvanceReportCombinedModal.tsx` — авансовые отчеты (нужен экспорт каждого)
- `shared/components/finance/SummaryReportModal.tsx` — сводный отчет (нужен экспорт)
- `app/reports/page.tsx` — страница отчетов (общий PDF удалён, остался экспорт каждого)
- `app/finance/page.tsx` — страница финансов (ЕОТ можно экспортировать)
- `app/employees/page.tsx` — сотрудники (есть экспорт в Excel)
- `app/tech-equipment/page.tsx` — техника (есть экспорт в Excel)
- `app/subcontractors/page.tsx` — подрядчики/поставщики (есть экспорт в Excel)
- `shared/lib/estimatePdfExport.ts` — экспорт смет в PDF (12 позиций на страницу, итог на последней)
- `shared/components/projects/EditableTable.tsx` — смета материалов (экспорт в Excel)
- `shared/components/projects/WorkTable.tsx` — смета работ (экспорт в Excel)
- `shared/components/projects/OverheadTable.tsx` — общие расходы (экспорт в Excel)

## Рекомендации
- Следовать правилу минималистичного кода
- Использовать xlsx для экспорта (уже установлен)
- Не менять архитектуру экспорта без крайней необходимости
- Все числовые вычисления проверять через isNaN()

## Данные для входа
- Email: admin@example.com
- Пароль: admin123
