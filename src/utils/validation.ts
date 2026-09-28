import type { TransactionType } from '../interfaces/TransactionType.js';

export function validateAmount(amount: number): void {
  const kopecks = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(kopecks) ||
    kopecks <= 0 || Math.abs(amount * 100 - kopecks) > 1e-7) {
    throw new RangeError('Сумма должна быть положительным числом с точностью до копеек.');
  }
}

export function validateTransactionType(type: string): asserts type is TransactionType {
  if (type !== 'income' && type !== 'expense') {
    throw new TypeError('Тип транзакции должен быть income или expense.');
  }
}

export function validateDate(date: string): void {
  const pattern = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
  if (!pattern.test(date) || !Number.isFinite(Date.parse(date))) {
    throw new RangeError('Дата должна быть корректной строкой ISO 8601.');
  }
  const calendarDate = date.slice(0, 10);
  if (new Date(`${calendarDate}T00:00:00Z`).toISOString().slice(0, 10) !== calendarDate) {
    throw new RangeError('Указанной календарной даты не существует.');
  }
}

export function validateName(name: string): void {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new RangeError('Название счёта не должно быть пустым.');
  }
}

export function validationMessage(check: () => void): true | string {
  try {
    check();
    return true;
  } catch (error: unknown) {
    return errorMessage(error);
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
