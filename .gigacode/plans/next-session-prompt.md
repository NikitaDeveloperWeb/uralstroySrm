# Контекст для следующей сессии

## Проект
Next.js 16 приложение для управления строительной компанией (Уралстрой).

## Стек
- Next.js 16 (App Router, Turbopack)
- Prisma + SQLite
- Zustand (state management)
- Tailwind CSS
- Lucide React (иконки)

## Что было сделано в текущей сессии

### 1. Исправление дублирующихся ключей (app/employees/page.tsx)
- Проблема: React Warning "Encountered two children with the same key, `2`"
- Решение: Изменён key с `member!.id` на `${member!.id}-${index}` в map

### 2. Добавление статуса "На паузе" для объектов
- `shared/components/projects/projectDetailUtils.ts`: добавлен 'на паузе' в STATUS_COLORS
- `shared/lib/validators.ts`: добавлен 'на паузе' в z.enum для status
- `shared/components/projects/ProjectDetailHeader.tsx`: добавлена кнопка статуса "на паузе"

### 3. Переделка ReportModal (shared/components/projects/ReportModal.tsx)
- Добавлена информация об объекте: адрес, стоимость, статус, дни в работе
- Добавлены раскрывающиеся списки смет: материалы, работы, расходы
- Добавлена сумма по каждой смете и общая сумма
- Добавлен блок "Расчет прибыли" с маржинальностью и слайдером
- Добавлена кнопка создания отчета (сохраняет в БД, показывает порядковый номер)
- Размер модалки: 80vw x 80vh

### 4. Список отчетов на странице объекта
- Добавлен CollapsibleSection "📄 Отчеты" с списком созданных отчетов
- Каждый отчет: номер, дата, кнопка просмотра и удаления
- Просмотр открывает ReportModal с данными отчета

### 5. Код объекта при создании
- Упрощен: теперь это простое число (001, 002, 003...)
- `app/projects/page.tsx`: code: String(projects.length + 1).padStart(3, '0')

### 6. Техника и оборудование в расходах
- `shared/components/finance/AddExpenseModal.tsx`: добавлена категория "Техника и оборудование"
- При выборе категории показывается выпадающий список техники из БД
- Выбранная техника добавляется к описанию расхода
- Размер модалки: 80vw

### 7. Поиск и фильтрация в ExpenseReportModal
- Добавлено поле поиска (по названию, получателю, категории)
- Добавлен фильтр по категориям (dropdown)
- Статистика фильтруется по выбранным критериям
- Раскрывающиеся категории в блоке "По категориям"

### 8. Пагинация
- Создан компонент `shared/components/ui/Pagination.tsx`
- Добавлена на страницы:
  - `app/projects/page.tsx` (12 объектов на странице)
  - `app/employees/page.tsx` (12 сотрудников/бригад на странице)

### 9. Сидинг данных
- База данных заполнена через `npx tsx prisma/seed.ts`
- Данные: сотрудники, бригады, проекты, клиенты, расходы, отчеты и т.д.

### 10. Пагинация добавлена на (но не завершена):
- `app/work-types/page.tsx` ✅
- `app/subcontractors/page.tsx` (подрядчики + поставщики) ✅
- `app/tech-equipment/page.tsx` ✅

## Структура проекта
```
app/
  api/           # API routes
  projects/      # Страница проектов + [id]/page.tsx (детали объекта)
  employees/     # Страница сотрудников и бригад
  finance/       # Финансы
  reports/       # Отчеты
  tech-equipment/ # Техника и оборудование
  subcontractors/ # Подрядчики
  ...
shared/
  components/
    projects/    # Компоненты для проектов
    finance/     # Компоненты для финансов
    ui/          # UI компоненты (Modal, Pagination, Button)
  stores/        # Zustand stores
  lib/           # Утилиты (api-client, api-response, validators)
  types/         # TypeScript типы
prisma/
  schema.prisma  # Схема базы данных
  seed.ts        # Сидинг данных
```

## Текущие задачи
- Пагинация добавлена на основные страницы
- Все основные функции работают
- База данных заполнена тестовыми данными

## Известные проблемы
- Нет пагинации на странице warehouse
- Нет пагинации в ExpenseReportModal
- Некоторые страницы могут не иметь пагинации

## API Endpoints
- `/api/projects` - проекты
- `/api/projects/[id]` - детали проекта
- `/api/project-reports` - отчеты по проектам
- `/api/expenses` - расходы
- `/api/tech-equipment` - техника
- `/api/subcontractors` - подрядчики
- `/api/suppliers` - поставщики
- `/api/unit-rates` - расценки

## Рекомендации
- Следовать минималистичному стилю кода
- Использовать существующие компоненты из shared/components/ui/
- Использовать существующие stores для state management
- Соблюдать цветовую схему: primary #1976d2, accent #8e24aa
