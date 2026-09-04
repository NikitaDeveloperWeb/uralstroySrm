-- CreateIndex
CREATE INDEX "advance_reports_date_idx" ON "advance_reports"("date");

-- CreateIndex
CREATE INDEX "eot_reports_date_idx" ON "eot_reports"("date");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "project_transactions_date_idx" ON "project_transactions"("date");

-- CreateIndex
CREATE INDEX "project_transactions_projectId_date_idx" ON "project_transactions"("projectId", "date");

-- CreateIndex
CREATE INDEX "salary_reports_date_idx" ON "salary_reports"("date");
