-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_warehouse_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER,
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "supplierId" INTEGER,
    "projectId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "warehouse_movements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "warehouse_movements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "warehouse_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "warehouse_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_warehouse_movements" ("amount", "comment", "createdAt", "date", "id", "itemId", "quantity", "supplierId", "type") SELECT "amount", "comment", "createdAt", "date", "id", "itemId", "quantity", "supplierId", "type" FROM "warehouse_movements";
DROP TABLE "warehouse_movements";
ALTER TABLE "new_warehouse_movements" RENAME TO "warehouse_movements";
CREATE INDEX "warehouse_movements_projectId_idx" ON "warehouse_movements"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
