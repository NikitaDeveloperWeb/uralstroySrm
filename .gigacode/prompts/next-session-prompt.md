# Промт для следующей сессии

## Выполненные задачи

### 1. Привязка расходов к проектам ✅
- Добавлено `projectId Int?` в модель Expense
- Обновлены API (GET, POST, PATCH)
- Добавлен выбор проекта в AddExpenseModal
- Отображение проекта в ExpenseReportModal
- При удалении проекта расходы остаются с `projectId = null`

### 2. Привязка материалов от поставщиков к проектам ✅
- Добавлено `projectId Int?` в WarehouseMovement
- При добавлении материала с проектом — автоматически создаётся запись в смете проекта
- Выпадающий список проектов в форме добавления материала

### 3. Исправление удаления финансовых планов ✅
- PATCH и DELETE теперь используют query params (`?id=:id`) вместо `context.params`
- Обновлён хук useFinancialPlans

### 4. Улучшение модалки финансового планирования ✅
- Увеличена модалка (max-w-2xl)
- Добавлены иконки и градиенты
- Фильтр завершённых проектов (status !== 'completed')

### 5. Исправление потери фокуса в сметах ✅
- Создан EditableCell с локальным state и debounce 300мс
- React.memo на EstimateTable
- useMemo для mergedItems

### 6. Исправление удаления сотрудников ✅
- Добавлен onDelete: Cascade для всех связей Employee
- EmployeeWorkReport, Penalty, Bonus, Schedule, ShopReport

### 7. Исправление фильтрации приходов за месяц ✅
- Сравнение дат по строкам вместо Date объектов
- Проблема: new Date('2026-09-31') → 2026-10-01

## Задача для выполнения

### Добавить расходы в смету проекта при создании расхода с проектом

**Контекст:** Уже реализована аналогичная логика для материалов от поставщиков. Нужно сделать то же для расходов.

**Файл:** `app/api/expenses/route.ts`

В методе `POST`, после создания расхода, добавить создание записи в `materialEstimate` (смета расходов проекта):

```typescript
// Внутри create({ data: { ... } })
const expense = await prisma.expense.create({
  data: {
    date: new Date(date),
    amount,
    recipient,
    purpose,
    category,
    supplierId,
    projectId,
  },
  include: {
    supplier: true,
    project: true,
  },
});

// Если указан проект — добавить в смету
if (projectId) {
  await prisma.materialEstimate.create({
    data: {
      projectId,
      name: purpose,
      quantity: '',
      cost: amount,
      category: category || null,
      stage: null,
    },
  });
}
```

**Важно:** Создать в одной транзакции с созданием расхода.

**Проверить:** `npx next build`

---

## Дополнительные задачи (опционально)

### 1. Уникальность в сметах
- Проверять перед созданием materialEstimate, нет ли уже такой записи для этого проекта
- Избегать дублирования

### 2. Полное тестирование
- Проверить все исправления в UI
- Проверить удаление сотрудников с связями
- Проверить фильтрацию периодов
