-- CreateTable
CREATE TABLE "expenses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "recipient" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "advance_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "advance_report_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    CONSTRAINT "advance_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "advance_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "salary_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "salary_report_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    CONSTRAINT "salary_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "salary_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hourly_rates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "brigadeId" INTEGER,
    "workType" TEXT,
    "hours" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'план',
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedules_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "schedules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "schedules_brigadeId_fkey" FOREIGN KEY ("brigadeId") REFERENCES "brigades" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hireDate" DATETIME NOT NULL,
    "workplace" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "brigadeId" INTEGER,
    "hourlyRateId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "employees_brigadeId_fkey" FOREIGN KEY ("brigadeId") REFERENCES "brigades" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employees_hourlyRateId_fkey" FOREIGN KEY ("hourlyRateId") REFERENCES "hourly_rates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_employees" ("address", "birthDate", "brigadeId", "createdAt", "employmentType", "fullName", "hireDate", "id", "paymentType", "phone", "skills", "updatedAt", "workplace") SELECT "address", "birthDate", "brigadeId", "createdAt", "employmentType", "fullName", "hireDate", "id", "paymentType", "phone", "skills", "updatedAt", "workplace" FROM "employees";
DROP TABLE "employees";
ALTER TABLE "new_employees" RENAME TO "employees";
CREATE TABLE "new_unit_rates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'м²',
    "pricePerUnit" REAL NOT NULL,
    "targetType" TEXT NOT NULL DEFAULT 'client',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_unit_rates" ("category", "createdAt", "description", "id", "isActive", "name", "pricePerUnit", "unit", "updatedAt") SELECT "category", "createdAt", "description", "id", "isActive", "name", "pricePerUnit", "unit", "updatedAt" FROM "unit_rates";
DROP TABLE "unit_rates";
ALTER TABLE "new_unit_rates" RENAME TO "unit_rates";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "schedules_date_idx" ON "schedules"("date");

-- CreateIndex
CREATE INDEX "schedules_employeeId_idx" ON "schedules"("employeeId");

-- CreateIndex
CREATE INDEX "schedules_projectId_idx" ON "schedules"("projectId");
