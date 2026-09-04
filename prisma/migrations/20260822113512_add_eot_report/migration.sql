-- CreateTable
CREATE TABLE "eot_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "eot_report_items" (
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
    "comment" TEXT,
    CONSTRAINT "eot_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "eot_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
