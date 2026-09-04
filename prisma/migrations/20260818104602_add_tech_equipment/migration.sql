-- CreateTable
CREATE TABLE "tech_equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "inventoryNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'warehouse',
    "location" TEXT NOT NULL,
    "acquisitionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tech_equipment_inventoryNumber_key" ON "tech_equipment"("inventoryNumber");
