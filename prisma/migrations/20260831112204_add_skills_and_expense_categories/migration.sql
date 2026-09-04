/*
  Warnings:

  - You are about to drop the column `skills` on the `brigades` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `employees` table. All the data in the column will be lost.
  - Added the required column `skillIds` to the `brigades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skillIds` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "skills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_BrigadeSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BrigadeSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "brigades" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BrigadeSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EmployeeSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EmployeeSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmployeeSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_brigades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "leaderId" INTEGER NOT NULL,
    "memberIds" TEXT NOT NULL,
    "skillIds" TEXT NOT NULL,
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
    "skillIds" TEXT NOT NULL,
    "brigadeId" INTEGER,
    "hourlyRateId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "employees_hourlyRateId_fkey" FOREIGN KEY ("hourlyRateId") REFERENCES "hourly_rates" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employees_brigadeId_fkey" FOREIGN KEY ("brigadeId") REFERENCES "brigades" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_expenses" ("amount", "category", "createdAt", "date", "id", "purpose", "recipient") SELECT "amount", "category", "createdAt", "date", "id", "purpose", "recipient" FROM "expenses";
DROP TABLE "expenses";
ALTER TABLE "new_expenses" RENAME TO "expenses";
CREATE INDEX "expenses_date_idx" ON "expenses"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_name_key" ON "expense_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_BrigadeSkills_AB_unique" ON "_BrigadeSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_BrigadeSkills_B_index" ON "_BrigadeSkills"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeSkills_AB_unique" ON "_EmployeeSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeSkills_B_index" ON "_EmployeeSkills"("B");
