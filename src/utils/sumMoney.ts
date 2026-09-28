export function sumMoney(amounts: readonly number[]): number {
  let kopecks = 0;
  for (const amount of amounts) {
    kopecks += Math.round(amount * 100);
    if (!Number.isSafeInteger(kopecks)) {
      throw new RangeError('Сумма превышает допустимый диапазон.');
    }
  }
  return kopecks / 100;
}
