/*
  Warnings:

  - You are about to drop the column `skillIds` on the `brigades` table. All the data in the column will be lost.
  - You are about to drop the column `skillIds` on the `employees` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "financial_plans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "periodFrom" DATETIME NOT NULL,
    "periodTo" DATETIME NOT NULL,
    "plannedAmount" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "financial_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_brigades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "leaderId" INTEGER NOT NULL,
    "memberIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_brigades" ("createdAt", "id", "leaderId", "memberIds", "name", "updatedAt") SELECT "createdAt", "id", "leaderId", "memberIds", "name", "updatedAt" FROM "brigades";
DROP TABLE "brigades";
ALTER TABLE "new_brigades" RENAME TO "brigades";
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
    "brigadeId" INTEGER,
    "hourlyRateId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "employees_brigadeId_fkey" FOREIGN KEY ("brigadeId") REFERENCES "brigades" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employees_hourlyRateId_fkey" FOREIGN KEY ("hourlyRateId") REFERENCES "hourly_rates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_employees" ("address", "birthDate", "brigadeId", "createdAt", "employmentType", "fullName", "hireDate", "hourlyRateId", "id", "paymentType", "phone", "updatedAt", "workplace") SELECT "address", "birthDate", "brigadeId", "createdAt", "employmentType", "fullName", "hireDate", "hourlyRateId", "id", "paymentType", "phone", "updatedAt", "workplace" FROM "employees";
DROP TABLE "employees";
ALTER TABLE "new_employees" RENAME TO "employees";
CREATE TABLE "new_expenses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "recipient" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "categoryId" INTEGER,
    "category" TEXT NOT NULL,
    "supplierId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expenses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_expenses" ("amount", "category", "categoryId", "createdAt", "date", "id", "purpose", "recipient") SELECT "amount", "category", "categoryId", "createdAt", "date", "id", "purpose", "recipient" FROM "expenses";
DROP TABLE "expenses";
ALTER TABLE "new_expenses" RENAME TO "expenses";
CREATE INDEX "expenses_date_idx" ON "expenses"("date");
CREATE TABLE "new_warehouse_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lastUpdate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "supplierId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cost" INTEGER,
    "lotNumber" TEXT,
    "price" INTEGER,
    CONSTRAINT "warehouse_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_warehouse_items" ("category", "cost", "createdAt", "id", "lastUpdate", "location", "lotNumber", "name", "price", "quantity", "status", "unit", "updatedAt") SELECT "category", "cost", "createdAt", "id", "lastUpdate", "location", "lotNumber", "name", "price", "quantity", "status", "unit", "updatedAt" FROM "warehouse_items";
DROP TABLE "warehouse_items";
ALTER TABLE "new_warehouse_items" RENAME TO "warehouse_items";
CREATE TABLE "new_warehouse_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER,
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "supplierId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "warehouse_movements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "warehouse_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "warehouse_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_warehouse_movements" ("comment", "createdAt", "date", "id", "itemId", "quantity", "type") SELECT "comment", "createdAt", "date", "id", "itemId", "quantity", "type" FROM "warehouse_movements";
DROP TABLE "warehouse_movements";
ALTER TABLE "new_warehouse_movements" RENAME TO "warehouse_movements";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "financial_plans_periodFrom_periodTo_idx" ON "financial_plans"("periodFrom", "periodTo");

-- CreateIndex
CREATE INDEX "financial_plans_projectId_idx" ON "financial_plans"("projectId");
