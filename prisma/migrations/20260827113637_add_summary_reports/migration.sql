-- CreateTable
CREATE TABLE "summary_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "periodFrom" DATETIME NOT NULL,
    "periodTo" DATETIME NOT NULL,
    "totalIncome" REAL NOT NULL,
    "totalExpense" REAL NOT NULL,
    "profit" REAL NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
