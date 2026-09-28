import moment from 'moment';
import 'moment/locale/ru.js';
import { v4 as uuidv4 } from 'uuid';
import type { ITransaction } from '../interfaces/ITransaction.js';
import type { TransactionType } from '../interfaces/TransactionType.js';
import { formatCurrency } from '../lib/budget-utils.js';
import { validateAmount, validateDate, validateTransactionType } from '../utils/validation.js';

export class Transaction implements ITransaction {
  readonly #id: string;
  get id(): string { return this.#id; }

  constructor(
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: string,
    public readonly description: string,
  ) {
    validateAmount(amount);
    validateTransactionType(type);
    validateDate(date);
    if (typeof description !== 'string') throw new TypeError('Описание должно быть строкой.');
    this.#id = uuidv4();
  }


  toString(): string {
    const type = this.type === 'income' ? 'доход' : 'расход';
    const date = moment.parseZone(this.date).locale('ru').format('LL');
    return `${this.id.slice(0, 8)}) ${this.description} (${type} ${formatCurrency(this.amount)}) | ${date}`;
  }
}
