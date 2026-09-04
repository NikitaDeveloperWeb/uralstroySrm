-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_salary_report_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "grossSalary" INTEGER,
    "advances" INTEGER,
    "penalties" INTEGER,
    "days" INTEGER,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "salary_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "salary_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_salary_report_items" ("advances", "amount", "days", "employeeId", "employeeName", "grossSalary", "id", "period", "reportId") SELECT "advances", "amount", "days", "employeeId", "employeeName", "grossSalary", "id", "period", "reportId" FROM "salary_report_items";
DROP TABLE "salary_report_items";
ALTER TABLE "new_salary_report_items" RENAME TO "salary_report_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
