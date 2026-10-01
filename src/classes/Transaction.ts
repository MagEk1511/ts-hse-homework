import type { TransactionUpdate } from '../interfaces/utility-types.js';
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
    public amount: number,
    public type: TransactionType,
    public date: string,
    public description: string,
  ) {
    validateAmount(amount);
    validateTransactionType(type);
    validateDate(date);
    if (typeof description !== 'string') throw new TypeError('Описание должно быть строкой.');
    this.#id = uuidv4();
  }


  update(update: TransactionUpdate): void {
    if ('id' in update) throw new TypeError('Идентификатор транзакции нельзя изменять.');
    const amount = update.amount !== undefined ? update.amount : this.amount;
    const type = update.type !== undefined ? update.type : this.type;
    const date = update.date !== undefined ? update.date : this.date;
    const description = update.description !== undefined ? update.description : this.description;
    validateAmount(amount);
    validateTransactionType(type);
    validateDate(date);
    if (typeof description !== 'string') throw new TypeError('Описание должно быть строкой.');
    // Проверки завершены до изменения любого поля.
    this.amount = amount;
    this.type = type;
    this.date = date;
    this.description = description;
  }

  toString(): string {
    const type = this.type === 'income' ? 'доход' : 'расход';
    const date = moment.parseZone(this.date).locale('ru').format('LL');
    return `${this.id.slice(0, 8)}) ${this.description} (${type} ${formatCurrency(this.amount)}) | ${date}`;
  }
}
