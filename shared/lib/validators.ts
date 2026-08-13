import { z } from 'zod';

export { ZodError } from 'zod';

// ============================================================
// Project Schemas
// ============================================================

const emptyToNull = (v: unknown): unknown => v === '' || v == null || v === undefined ? null : v;
const emptyToZero = (v: unknown): unknown => v === '' || v == null || v === undefined ? 0 : Number(v);
const stringToDate = (v: unknown): unknown => {
  if (v === '' || v == null || v === undefined) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  area: z.string().min(1, 'Площадь обязательна'),
  address: z.string().min(1, 'Адрес обязателен'),
  type: z.string().min(1, 'Тип обязателен'),
  cost: z.coerce.number().min(0, 'Стоимость не может быть отрицательной'),
  deadline: z.coerce.date(),
  complexity: z.enum(['легкий', 'средний', 'сложный'], {
    message: 'Некорректная сложность',
  }),
  status: z.enum(['создан', 'в работе', 'завершен']).default('создан'),
  code: z.string().min(1, 'Код обязателен'),
  prepayment: z.preprocess(emptyToNull, z.number().min(0).nullable().optional()),
  prepaymentDate: z.preprocess(stringToDate, z.date().optional().nullable()),
  unitRateId: z.preprocess(emptyToNull, z.number().int().positive().nullable().optional()),
  brigadeId: z.preprocess(emptyToNull, z.number().int().positive().nullable().optional()),
  // Поля для карты объекта
  floors: z.preprocess(emptyToNull, z.number().int().positive().nullable().optional()),
  hasMansard: z.preprocess(emptyToNull, z.boolean().nullable().optional()),
  roofType: z.string().nullable().optional(),
  roofColor: z.string().nullable().optional(),
  hasVeranda: z.preprocess(emptyToNull, z.boolean().nullable().optional()),
  verandaSize: z.string().nullable().optional(),
  hasPorhch: z.preprocess(emptyToNull, z.boolean().nullable().optional()),
  foundations: z.string().nullable().optional(),
  walls: z.string().nullable().optional(),
  insulation: z.string().nullable().optional(),
  windows: z.string().nullable().optional(),
  doorType: z.string().nullable().optional(),
  roofMaterial: z.string().nullable().optional(),
  communication: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  layout: z.string().nullable().optional(),
  baseType: z.string().nullable().optional(),
  homeType: z.string().nullable().optional(),
  insulationThickness: z.string().nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ============================================================
// Brigade Schemas
// ============================================================

export const createBrigadeSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  leaderId: z.coerce.number().int().positive(),
  memberIds: z.union([z.array(z.coerce.number().int().positive()), z.string()]).transform((val) =>
    Array.isArray(val) ? JSON.stringify(val) : val
  ).default('[]'),
  skills: z.union([z.array(z.string()), z.string()]).transform((val) =>
    Array.isArray(val) ? JSON.stringify(val) : val
  ).default('[]'),
});

export const updateBrigadeSchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  leaderId: z.coerce.number().int().positive().optional(),
  memberIds: z.union([z.array(z.coerce.number().int().positive()), z.string()]).transform((val) =>
    Array.isArray(val) ? JSON.stringify(val) : val
  ).optional(),
  skills: z.union([z.array(z.string()), z.string()]).transform((val) =>
    Array.isArray(val) ? JSON.stringify(val) : val
  ).optional(),
});

// ============================================================
// Employee Schemas
// ============================================================

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, 'ФИО обязательно'),
  birthDate: z.coerce.date(),
  phone: z.string().min(1, 'Телефон обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  hireDate: z.coerce.date(),
  workplace: z.string().min(1, 'Рабочее место обязательно'),
  paymentType: z.string().min(1, 'Тип оплаты обязателен'),
  employmentType: z.string().min(1, 'Тип занятости обязателен'),
  skills: z.union([z.array(z.string()), z.string()]).transform((val) =>
    Array.isArray(val) ? JSON.stringify(val) : val
  ).default('[]'),
  brigadeId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1, 'ФИО обязательно').optional(),
  birthDate: z.coerce.date().optional(),
  phone: z.string().min(1, 'Телефон обязателен').optional(),
  address: z.string().min(1, 'Адрес обязателен').optional(),
  hireDate: z.coerce.date().optional(),
  workplace: z.string().min(1, 'Рабочее место обязательно').optional(),
  paymentType: z.string().min(1, 'Тип оплаты обязателен').optional(),
  employmentType: z.string().min(1, 'Тип занятости обязателен').optional(),
  skills: z.union([z.array(z.string()), z.string()]).transform((val) =>
    Array.isArray(val) ? JSON.stringify(val) : val
  ).optional(),
  brigadeId: z.coerce.number().int().positive().optional().nullable(),
});

// ============================================================
// WarehouseItem Schemas
// ============================================================

export const createWarehouseItemSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  quantity: z.coerce.number().int().nonnegative(),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  location: z.string().min(1, 'Расположение обязательно'),
  status: z
    .enum(['достаточно', 'мало', 'критически мало', 'нет в наличии'])
    .default('достаточно'),
});

export const updateWarehouseItemSchema = createWarehouseItemSchema.partial();

// ============================================================
// WarehouseMovement Schemas
// ============================================================

export const createWarehouseMovementSchema = z.object({
  itemId: z.coerce.number().int().positive(),
  type: z.enum(['income', 'expense'], {
    message: 'Тип должен быть income или expense',
  }),
  quantity: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  comment: z.string().optional().nullable(),
});

// ============================================================
// MaterialEstimate Schemas
// ============================================================

export const createMaterialEstimateSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  name: z.string().min(1, 'Название материала обязательно'),
  quantity: z.string().min(1, 'Количество обязательно'),
  cost: z.coerce.number().int().nonnegative(),
  category: z.string().optional().nullable(),
});

export const updateMaterialEstimateSchema = createMaterialEstimateSchema.partial();

// ============================================================
// CompletedWork Schemas
// ============================================================

export const createCompletedWorkSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  name: z.string().min(1, 'Название работы обязательно'),
  quantity: z.string().min(1, 'Количество обязательно'),
  cost: z.coerce.number().int().nonnegative(),
  category: z.string().optional().nullable(),
});

export const updateCompletedWorkSchema = createCompletedWorkSchema.partial();

// ============================================================
// MaterialTemplate Schemas
// ============================================================

export const createMaterialTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  quantity: z.string().min(1, 'Количество обязательно'),
  cost: z.coerce.number().int().nonnegative(),
  category: z.string().optional().nullable(),
});

export const updateMaterialTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  quantity: z.string().min(1, 'Количество обязательно').optional(),
  cost: z.coerce.number().int().nonnegative().optional(),
  category: z.string().optional().nullable(),
});

// ============================================================
// WorkTemplate Schemas
// ============================================================

export const createWorkTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  quantity: z.string().min(1, 'Количество обязательно'),
  cost: z.coerce.number().int().nonnegative(),
  category: z.string().optional().nullable(),
});

export const updateWorkTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  quantity: z.string().min(1, 'Количество обязательно').optional(),
  cost: z.coerce.number().int().nonnegative().optional(),
  category: z.string().optional().nullable(),
});

// ============================================================
// PaymentCategory Schemas
// ============================================================

export const createPaymentCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  percentage: z.coerce.number().int().min(0).max(100),
});

export const updatePaymentCategorySchema = createPaymentCategorySchema.partial();

// ============================================================
// Fund Schemas
// ============================================================

export const createFundSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional().nullable(),
  balance: z.coerce.number().default(0),
});

export const updateFundSchema = createFundSchema.partial();

// ============================================================
// FundTransaction Schemas
// ============================================================

export const createFundTransactionSchema = z.object({
  fundId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive(),
  type: z.enum(['income', 'expense']),
  description: z.string().optional().nullable(),
  date: z.coerce.date(),
});

// ============================================================
// FinanceReport Schemas
// ============================================================

export const createFinanceReportSchema = z.object({
  projectId: z.coerce.number().int().positive().optional().nullable(),
  date: z.coerce.date(),
  totalIncome: z.coerce.number().int().nonnegative(),
  totalExpense: z.coerce.number().int().nonnegative(),
  profit: z.coerce.number().int(),
  comment: z.string().optional().nullable(),
});

export const updateFinanceReportSchema = createFinanceReportSchema.partial();

// ============================================================
// ProjectReport Schemas
// ============================================================

export const createProjectReportSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  periodFrom: z.coerce.date(),
  periodTo: z.coerce.date(),
  comment: z.string().optional().nullable(),
}).refine((data) => data.periodTo >= data.periodFrom, {
  message: 'Конечная дата не может быть раньше начальной',
  path: ['periodTo'],
});

export const updateProjectReportSchema = z.object({
  projectId: z.coerce.number().int().positive().optional(),
  date: z.coerce.date().optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  comment: z.string().optional().nullable(),
}).refine((data) => !data.periodTo || !data.periodFrom || data.periodTo >= data.periodFrom, {
  message: 'Конечная дата не может быть раньше начальной',
  path: ['periodTo'],
});

// ============================================================
// EmployeeWorkReport Schemas
// ============================================================

export const createEmployeeWorkReportSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive(),
  workType: z.string().min(1, 'Тип работы обязателен'),
  quantity: z.coerce.number().positive('Количество должно быть больше 0'),
  rate: z.coerce.number().positive('Ставка должна быть больше 0'),
  amount: z.coerce.number().positive('Сумма должна быть больше 0'),
  date: z.coerce.date(),
  comment: z.string().optional().nullable(),
}).refine((data) => {
  const calculated = Math.round(data.quantity * data.rate * 100) / 100;
  const roundedAmount = Math.round(data.amount * 100) / 100;
  return Math.abs(calculated - roundedAmount) < 0.01;
}, {
  message: 'Сумма должна быть равна Количество × Ставка',
  path: ['amount'],
});

export const updateEmployeeWorkReportSchema = z.object({
  employeeId: z.coerce.number().int().positive().optional(),
  projectId: z.coerce.number().int().positive().optional(),
  workType: z.string().min(1, 'Тип работы обязателен').optional(),
  quantity: z.coerce.number().positive('Количество должно быть больше 0').optional(),
  rate: z.coerce.number().positive('Ставка должна быть больше 0').optional(),
  amount: z.coerce.number().positive('Сумма должна быть больше 0').optional(),
  date: z.coerce.date().optional(),
  comment: z.string().optional().nullable(),
}).refine((data) => {
  if (data.quantity === undefined && data.rate === undefined && data.amount === undefined) return true;
  const qty = data.quantity ?? 1;
  const rate = data.rate ?? 1;
  const amt = data.amount ?? (qty * rate);
  const calculated = Math.round(qty * rate * 100) / 100;
  const roundedAmount = Math.round(amt * 100) / 100;
  return Math.abs(calculated - roundedAmount) < 0.01;
}, {
  message: 'Сумма должна быть равна Количество × Ставка',
  path: ['amount'],
});

// ============================================================
// Notification Schemas
// ============================================================

export const createNotificationSchema = z.object({
  type: z.enum(['overdue', 'low-stock', 'out-of-stock']),
  message: z.string().min(1),
  priority: z.enum(['high', 'medium']).default('medium'),
  link: z.string().optional().nullable(),
  date: z.coerce.date(),
  projectId: z.coerce.number().int().positive().optional().nullable(),
  itemId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

// ============================================================
// User Schemas
// ============================================================

export const createUserSchema = z.object({
  email: z.string().email('Некорректный email'),
  name: z.string().optional().nullable(),
  role: z.enum(['admin', 'manager', 'worker']).default('admin'),
});

export const updateUserSchema = createUserSchema.partial();

// ============================================================
// Client Schemas
// ============================================================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createClientSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  email: z.string().regex(emailRegex, 'Некорректный email').or(z.literal('')).nullable().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ============================================================
// ProjectTransaction Schemas
// ============================================================

export const createProjectTransactionSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive('Сумма должна быть больше 0'),
  date: z.coerce.date(),
  comment: z.string().optional().nullable(),
});

export const updateProjectTransactionSchema = z.object({
  amount: z.coerce.number().int().positive('Сумма должна быть больше 0').optional(),
  date: z.coerce.date().optional(),
  comment: z.string().optional().nullable(),
});
