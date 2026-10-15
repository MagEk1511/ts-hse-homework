import { access, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import inquirer from 'inquirer';
import moment from 'moment';
import type { TransactionConstructorParams } from '../interfaces/utility-types.js';
import type { TransactionType } from '../interfaces/TransactionType.js';
import { formatCurrency } from '../lib/budget-utils.js';
import { errorMessage, validateAmount, validateDate, validateName, validationMessage } from '../utils/validation.js';
import { Account } from './Account.js';
import { AccountManager } from './AccountManager.js';
import { Transaction } from './Transaction.js';

export function parseAmount(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

export class ApplicationController {
  constructor(
    public readonly accountManager: AccountManager = new AccountManager(),
    private readonly ask: typeof inquirer.prompt = inquirer.prompt,
    private readonly exportDirectory: string = resolve('exports'),
  ) {}

  async start(): Promise<void> {
    console.log('🚀 Budget Tracker CLI');
    try {
      while (true) {
        console.log('\n' + this.accountManager.getSummaryString());
        const { action } = await this.ask<{ action: string }>([{
          type: 'select', name: 'action', message: 'Счета',
          choices: [
            ...this.accountManager.getAllAccounts().map(account => ({
              name: `${account.name} — ${formatCurrency(account.balance)}`, value: account.id,
            })),
            { name: 'Создать счёт', value: '__create' }, { name: 'Выйти', value: '__exit' },
          ],
        }]);
        if (action === '__exit') break;
        try {
          if (action === '__create') await this.createAccount();
          else {
            const account = this.accountManager.getAccountById(action);
            if (account) await this.watchAccount(account);
          }
        } catch (error: unknown) {
          if (this.isCancellation(error)) throw error;
          console.error('Ошибка:', errorMessage(error));
        }
      }
    } catch (error: unknown) {
      if (!this.isCancellation(error)) throw error;
    }
    console.log('До свидания!');
  }

  async createAccount(): Promise<void> {
    const { name } = await this.ask<{ name: string }>([{
      type: 'input', name: 'name', message: 'Название нового счёта:',
      validate: (value: string) => validationMessage(() => validateName(value)),
    }]);
    this.accountManager.addAccount(new Account(name));
    console.log('Счёт создан.');
  }

  async watchAccount(account: Account): Promise<void> {
    while (this.accountManager.getAccountById(account.id)) {
      console.log('\n' + account.toString());
      const { action } = await this.ask<{ action: string }>([{
        type: 'select', name: 'action', message: 'Действия со счётом',
        choices: [
          { name: 'Добавить транзакцию', value: 'add' },
          { name: 'Изменить транзакцию', value: 'edit' },
          { name: 'Удалить транзакцию', value: 'removeTransaction' },
          { name: 'Переименовать счёт', value: 'rename' },
          { name: 'Экспортировать транзакции в CSV', value: 'export' },
          { name: 'Удалить счёт', value: 'removeAccount' },
          { name: 'Вернуться к списку счетов', value: 'back' },
        ],
      }]);
      if (action === 'back') return;
      try {
        switch (action) {
          case 'add': await this.addTransaction(account); break;
          case 'edit': await this.editTransaction(account); break;
          case 'removeTransaction': await this.removeTransaction(account); break;
          case 'rename': await this.renameAccount(account); break;
          case 'export': await this.exportTransactionsToCSV(account); break;
          case 'removeAccount': await this.removeAccount(account); break;
        }
      } catch (error: unknown) {
        if (this.isCancellation(error)) throw error;
        console.error('Ошибка:', errorMessage(error));
      }
    }
  }

  async removeAccount(account: Account): Promise<void> {
    const { confirmed } = await this.ask<{ confirmed: boolean }>([{
      type: 'confirm', name: 'confirmed', default: false,
      message: `Удалить счёт «${account.name}» со всеми транзакциями?`,
    }]);
    if (confirmed && this.accountManager.removeAccountById(account.id)) console.log('Счёт удалён.');
  }

  async addTransaction(account: Account): Promise<void> {
    const params = await this.readTransactionFields();
    account.addTransaction(new Transaction(...params));
    console.log('Транзакция добавлена.');
  }

  async removeTransaction(account: Account): Promise<void> {
    const transaction = await this.chooseTransaction(account, 'Какую транзакцию удалить?');
    if (!transaction) return;
    const { confirmed } = await this.ask<{ confirmed: boolean }>([{
      type: 'confirm', name: 'confirmed', message: 'Подтвердить удаление транзакции?', default: false,
    }]);
    if (confirmed && account.removeTransactionById(transaction.id)) console.log('Транзакция удалена.');
  }

  async renameAccount(account: Account): Promise<void> {
    const { name } = await this.ask<{ name: string }>([{
      type: 'input', name: 'name', message: 'Новое название:', default: account.name,
      validate: (value: string) => validationMessage(() => validateName(value)),
    }]);
    account.update({ name });
    console.log('Название изменено.');
  }

  async editTransaction(account: Account): Promise<void> {
    const transaction = await this.chooseTransaction(account, 'Какую транзакцию изменить?');
    if (!transaction) return;
    const [amount, type, date, description] = await this.readTransactionFields(transaction);
    transaction.update({ amount, type, date, description });
    console.log('Транзакция изменена.');
  }

  async exportTransactionsToCSV(account: Account): Promise<void> {
    const { filename } = await this.ask<{ filename: string }>([{
      type: 'input', name: 'filename', message: 'Имя CSV-файла без расширения:', default: 'transactions',
      validate: (value: string) => {
        const name = value.trim();
        return name.length > 0 && name !== '.' && name !== '..' && !/[\\/\x00-\x1f]/.test(name)
          ? true : 'Введите имя файла без пути и служебных символов.';
      },
    }]);
    const name = filename.trim();
    if (!name || name === '.' || name === '..' || /[\\/\x00-\x1f]/.test(name)) {
      throw new Error('Некорректное имя CSV-файла.');
    }
    const target = resolve(this.exportDirectory, name.endsWith('.csv') ? name : `${name}.csv`);
    await mkdir(this.exportDirectory, { recursive: true });
    let exists = false;
    try { await access(target); exists = true; } catch (error: unknown) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    }
    if (exists) {
      const { confirmed } = await this.ask<{ confirmed: boolean }>([{
        type: 'confirm', name: 'confirmed', message: 'Файл уже существует. Перезаписать?', default: false,
      }]);
      if (!confirmed) return;
    }
    await account.exportTransactionsToCSV(target);
    console.log(`CSV сохранён: ${target}`);
  }

  private async chooseTransaction(account: Account, message: string): Promise<Transaction | undefined> {
    const transactions = account.getTransactions();
    if (transactions.length === 0) {
      console.log('На счёте пока нет транзакций.');
      return undefined;
    }
    const { id } = await this.ask<{ id: string }>([{
      type: 'select', name: 'id', message,
      choices: [...transactions.map(t => ({ name: t.toString(), value: t.id })), { name: 'Отмена', value: '__back' }],
    }]);
    return transactions.find(t => t.id === id);
  }

  private async readTransactionFields(transaction?: Transaction): Promise<TransactionConstructorParams> {
    const answers = await this.ask<{ amount: string; type: TransactionType; date: string; description: string }>([
      {
        type: 'input', name: 'amount', message: 'Сумма (больше нуля):',
        default: transaction ? String(transaction.amount) : '',
        validate: (value: string) => validationMessage(() => validateAmount(parseAmount(value))),
      },
      {
        type: 'select', name: 'type', message: 'Тип операции:', default: transaction?.type ?? 'income',
        choices: [{ name: 'Доход', value: 'income' }, { name: 'Расход', value: 'expense' }],
      },
      {
        type: 'input', name: 'date', message: 'Дата (YYYY-MM-DD):',
        default: transaction?.date.slice(0, 10) ?? moment().format('YYYY-MM-DD'),
        validate: (value: string) => validationMessage(() => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Введите дату в формате YYYY-MM-DD.');
          validateDate(value);
        }),
      },
      { type: 'input', name: 'description', message: 'Описание:', default: transaction?.description ?? '' },
    ]);
    return [parseAmount(answers.amount), answers.type, answers.date, answers.description];
  }

  private isCancellation(error: unknown): boolean {
    return error instanceof Error && ['ExitPromptError', 'AbortPromptError'].includes(error.name);
  }
}
