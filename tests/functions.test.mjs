import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTotal, calculateAverage, formatCurrency, getTopValues, printSummary } from '../dist/functions.js';

test('сумма и среднее работают для обычного и пустого массива', () => {
  assert.equal(calculateTotal([1000, 2000, 3000]), 6000);
  assert.equal(calculateAverage([1000, 2000, 3000]), 2000);
  assert.equal(calculateTotal([]), 0);
  assert.equal(calculateAverage([]), 0);
  assert.equal(calculateTotal([-50, 20, 40]), 10);
});

test('форматирование использует переданный символ валюты', () => {
  assert.equal(formatCurrency(1000, '₽'), '1000 ₽');
  assert.equal(formatCurrency(-12.5, '€'), '-12.5 €');
});

test('выбор наибольших значений сортирует числа и сохраняет исходный массив', () => {
  const values = [100, 500, 200, 800];
  assert.deepEqual(getTopValues(values, 2), [800, 500]);
  assert.deepEqual(values, [100, 500, 200, 800]);
  assert.deepEqual(getTopValues([2, 11, 11, -1], 3), [11, 11, 2]);
  assert.deepEqual(getTopValues(values, 0), []);
  assert.deepEqual(getTopValues([], 3), []);
  assert.deepEqual(getTopValues([1, 2], 10), [2, 1]);
  assert.throws(() => getTopValues(values, -1), RangeError);
  assert.throws(() => getTopValues(values, 1.5), RangeError);
});

test('сводка выводит количество, сумму и среднее из примера задания', context => {
  const log = context.mock.method(console, 'log', () => {});
  assert.equal(printSummary([100, 500, 1000, 2000, 800]), undefined);
  assert.deepEqual(log.mock.calls.map(call => call.arguments[0]), [
    'Всего записей: 5',
    'Сумма: 4400',
    'Среднее: 880',
  ]);
});
