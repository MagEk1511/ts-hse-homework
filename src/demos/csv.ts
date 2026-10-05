import { mkdir } from 'node:fs/promises';
import { Account } from '../classes/Account.js';
import { Transaction } from '../classes/Transaction.js';

const account = new Account('CSV-пример');
account.addTransaction(new Transaction(1000, 'income', '2023-01-01', 'Зарплата'));
account.addTransaction(new Transaction(200, 'expense', '2023-01-05', 'Продукты, "магазин"\nПокупка'));
await mkdir('exports', { recursive: true });
await account.exportTransactionsToCSV('exports/demo.csv');
console.log('CSV сохранён: exports/demo.csv');
