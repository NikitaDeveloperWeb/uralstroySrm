/**
 * Вычисление статуса товара на основе остатка
 */
export function calculateStockStatus(quantity: number): string {
  if (quantity <= 0) return 'нет в наличии';
  if (quantity <= 5) return 'критически мало';
  if (quantity <= 20) return 'мало';
  return 'достаточно';
}
