// Тема 3: функции используют только примитивные типы и массивы.
import sum from 'lodash/sum.js';

export function calculateTotal(values: number[]): number {
  // Тема 8: JS-библиотека с декларациями из @types/lodash.
  return sum(values);
}

export function calculateAverage(values: number[]): number {
  return values.length === 0 ? 0 : calculateTotal(values) / values.length;
}

export function formatCurrency(amount: number, symbol: string): string {
  return `${amount} ${symbol}`;
}

export function getTopValues(values: number[], count: number): number[] {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Количество элементов должно быть неотрицательным целым числом.');
  }
  return [...values].sort((left, right) => right - left).slice(0, count);
}

export function printSummary(values: number[]): void {
  console.log(`Всего записей: ${values.length}`);
  console.log(`Сумма: ${calculateTotal(values)}`);
  console.log(`Среднее: ${calculateAverage(values)}`);
}

// По условию примеры запускаются командой node dist/functions.js.
console.log('Сумма:', calculateTotal([1000, 2000, 3000]));
console.log('Среднее:', calculateAverage([1000, 2000, 3000]));
console.log('Формат валюты:', formatCurrency(1000, '₽'));
console.log('Два наибольших значения:', getTopValues([100, 500, 200, 800], 2));
printSummary([100, 500, 1000, 2000, 800]);
