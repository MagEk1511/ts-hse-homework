namespace BudgetTracker {
export const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
});

export function validateId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new RangeError('Идентификатор должен быть положительным целым числом.');
  }
}

// Сложение в копейках исключает ошибки вроде 0.1 + 0.2 = 0.30000000000000004.
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

export function validateDate(date: string): void {
  const isoPattern = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
  if (!isoPattern.test(date) || !Number.isFinite(Date.parse(date))) {
    throw new RangeError('Дата должна быть корректной строкой ISO 8601.');
  }

  // Date.parse нормализует 30 февраля, поэтому отдельно проверяем календарный день.
  const calendarDate = date.slice(0, 10);
  if (new Date(`${calendarDate}T00:00:00Z`).toISOString().slice(0, 10) !== calendarDate) {
    throw new RangeError('Указанной календарной даты не существует.');
  }
}

}
