SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%advance%' OR name LIKE '%salary%' OR name = 'expenses' OR name = 'funds');
