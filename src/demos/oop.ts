import { Account } from '../classes/Account.js';
import { AccountManager } from '../classes/AccountManager.js';
import type { BudgetSummary } from '../classes/BudgetSummary.js';
import { Transaction } from '../classes/Transaction.js';

const account = new Account('Личный бюджет');
const salary = new Transaction(1000, 'income', '2023-01-01', 'Зарплата');
account.addTransaction(salary);
account.addTransaction(new Transaction(200, 'expense', '2023-01-05', 'Продукты'));
account.addTransaction(new Transaction(150, 'expense', '2023-01-10', 'Коммунальные услуги'));
const manager = new AccountManager();
manager.addAccount(account);
console.log(String(manager));
console.log('Сводка:', manager.getSummary());
console.log('Доходы, расходы, баланс:', account.income, account.expenses, account.balance);
console.log('Поиск:', manager.getAccountById(account.id)?.name);
console.log('Нет счёта:', manager.getAccountById('missing'));
console.log('Счета:', manager.getAllAccounts().length, manager.getAccounts().length);
account.getTransactions().forEach(t => console.log(t.toString()));
function printSummary(budget: BudgetSummary): void { console.log(budget.getSummaryString()); }
printSummary(account);
printSummary(manager);
console.log('Удаление транзакции:', account.removeTransactionById(salary.id));
console.log('Повторное удаление:', account.removeTransactionById(salary.id));
console.log('Удаление счёта:', manager.removeAccountById(account.id));
console.log('Повторное удаление:', manager.removeAccountById(account.id));
