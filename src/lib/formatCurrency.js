// Учебная JavaScript-библиотека без встроенной типизации.
export function formatCurrency(amount, symbol = '₽') {
  return amount.toFixed(2) + ' ' + symbol;
}
