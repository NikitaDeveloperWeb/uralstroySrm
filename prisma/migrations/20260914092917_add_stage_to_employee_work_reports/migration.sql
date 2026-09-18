-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employee_work_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "workType" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "stage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_work_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employee_work_reports_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_employee_work_reports" ("amount", "comment", "createdAt", "date", "employeeId", "id", "projectId", "quantity", "rate", "workType") SELECT "amount", "comment", "createdAt", "date", "employeeId", "id", "projectId", "quantity", "rate", "workType" FROM "employee_work_reports";
DROP TABLE "employee_work_reports";
ALTER TABLE "new_employee_work_reports" RENAME TO "employee_work_reports";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
