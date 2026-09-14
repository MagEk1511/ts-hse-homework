import type { IAccount, IAccountManager, ITransaction, ISummary } from './types.js';

const account: IAccount & { transactions: ITransaction[] } = {
  id: 1, name: 'Личный бюджет', transactions: [],
  addTransaction(transaction: ITransaction): void { this.transactions.push(transaction); },
  removeTransactionById(id: number): boolean {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index < 0) return false;
    this.transactions.splice(index, 1);
    return true;
  },
  getTransactions(): ITransaction[] { return [...this.transactions]; },
};
const manager: IAccountManager & { accounts: IAccount[] } = {
  accounts: [],
  addAccount(item: IAccount): void { this.accounts.push(item); },
  removeAccountById(id: number): boolean {
    const index = this.accounts.findIndex(item => item.id === id);
    if (index < 0) return false;
    this.accounts.splice(index, 1);
    return true;
  },
  getAccounts(): IAccount[] { return [...this.accounts]; },
  getAccountById(id: number): IAccount | undefined { return this.accounts.find(item => item.id === id); },
  getSummary(id: number): ISummary {
    const item = this.getAccountById(id);
    if (!item) throw new Error('Счёт не найден.');
    const transactions = item.getTransactions();
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  },
};
account.addTransaction({ id: 1, amount: 1000, type: 'income', date: '2023-01-01', description: 'Зарплата' });
account.addTransaction({ id: 2, amount: 200, type: 'expense', date: '2023-01-05', description: 'Продукты' });
account.addTransaction({ id: 3, amount: 150, type: 'expense', date: '2023-01-10', description: 'Коммунальные услуги' });
manager.addAccount(account);
console.log('Счета:', manager.getAccounts());
console.log('Поиск:', manager.getAccountById(1)?.name);
console.log('Сводка:', manager.getSummary(1));
console.log('Удаление транзакции:', account.removeTransactionById(3));
console.log('Оставшиеся транзакции:', account.getTransactions());
console.log('Удаление счёта:', manager.removeAccountById(1));
console.log('Оставшиеся счета:', manager.getAccounts());
