-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_eot_report_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "hours" REAL,
    "rate" REAL,
    "quantity" REAL,
    "workAmount" REAL,
    "salary" REAL NOT NULL,
    "shopReportId" INTEGER,
    "comment" TEXT,
    CONSTRAINT "eot_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "eot_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "eot_report_items_shopReportId_fkey" FOREIGN KEY ("shopReportId") REFERENCES "shop_reports" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_eot_report_items" ("comment", "employeeId", "employeeName", "hours", "id", "paymentType", "quantity", "rate", "reportId", "salary", "workAmount") SELECT "comment", "employeeId", "employeeName", "hours", "id", "paymentType", "quantity", "rate", "reportId", "salary", "workAmount" FROM "eot_report_items";
DROP TABLE "eot_report_items";
ALTER TABLE "new_eot_report_items" RENAME TO "eot_report_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
