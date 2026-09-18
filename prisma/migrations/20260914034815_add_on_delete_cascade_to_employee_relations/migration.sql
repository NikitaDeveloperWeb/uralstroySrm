-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bonuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bonuses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bonuses" ("amount", "createdAt", "date", "employeeId", "id", "reason") SELECT "amount", "createdAt", "date", "employeeId", "id", "reason" FROM "bonuses";
DROP TABLE "bonuses";
ALTER TABLE "new_bonuses" RENAME TO "bonuses";
CREATE TABLE "new_employee_work_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workType" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_work_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_work_reports_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_employee_work_reports" ("amount", "comment", "createdAt", "date", "employeeId", "id", "projectId", "quantity", "rate", "workType") SELECT "amount", "comment", "createdAt", "date", "employeeId", "id", "projectId", "quantity", "rate", "workType" FROM "employee_work_reports";
DROP TABLE "employee_work_reports";
ALTER TABLE "new_employee_work_reports" RENAME TO "employee_work_reports";
CREATE TABLE "new_penalties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "penalties_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_penalties" ("amount", "createdAt", "date", "employeeId", "id", "reason") SELECT "amount", "createdAt", "date", "employeeId", "id", "reason" FROM "penalties";
DROP TABLE "penalties";
ALTER TABLE "new_penalties" RENAME TO "penalties";
CREATE TABLE "new_schedules" (
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
    CONSTRAINT "schedules_brigadeId_fkey" FOREIGN KEY ("brigadeId") REFERENCES "brigades" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "schedules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "schedules_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_schedules" ("brigadeId", "comment", "createdAt", "date", "employeeId", "hours", "id", "projectId", "status", "updatedAt", "workType") SELECT "brigadeId", "comment", "createdAt", "date", "employeeId", "hours", "id", "projectId", "status", "updatedAt", "workType" FROM "schedules";
DROP TABLE "schedules";
ALTER TABLE "new_schedules" RENAME TO "schedules";
CREATE INDEX "schedules_date_idx" ON "schedules"("date");
CREATE INDEX "schedules_employeeId_idx" ON "schedules"("employeeId");
CREATE INDEX "schedules_projectId_idx" ON "schedules"("projectId");
CREATE TABLE "new_shop_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "date" DATETIME NOT NULL,
    "periodFrom" DATETIME NOT NULL,
    "periodTo" DATETIME NOT NULL,
    "comment" TEXT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shop_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "shop_reports_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_shop_reports" ("comment", "createdAt", "date", "employeeId", "id", "periodFrom", "periodTo", "projectId", "totalAmount", "updatedAt") SELECT "comment", "createdAt", "date", "employeeId", "id", "periodFrom", "periodTo", "projectId", "totalAmount", "updatedAt" FROM "shop_reports";
DROP TABLE "shop_reports";
ALTER TABLE "new_shop_reports" RENAME TO "shop_reports";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
