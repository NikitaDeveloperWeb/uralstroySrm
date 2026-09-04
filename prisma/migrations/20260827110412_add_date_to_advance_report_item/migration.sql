-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_advance_report_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "advance_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "advance_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_advance_report_items" ("amount", "employeeId", "employeeName", "id", "purpose", "reportId") SELECT "amount", "employeeId", "employeeName", "id", "purpose", "reportId" FROM "advance_report_items";
DROP TABLE "advance_report_items";
ALTER TABLE "new_advance_report_items" RENAME TO "advance_report_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
