import { Account, AccountManager, BudgetSummary, Transaction } from './classes.js';

console.log('🚀 Budget Tracker CLI');

const personalAccount = new Account(1, 'Личный бюджет');
personalAccount.addTransaction(new Transaction(1, 1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
personalAccount.addTransaction(new Transaction(2, 200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
personalAccount.addTransaction(new Transaction(3, 150, 'expense', '2023-01-10T00:00:00Z', 'Коммунальные услуги'));

const savings = new Account(2, 'Накопления');
savings.addTransaction(new Transaction(4, 500, 'income', '2023-01-02T00:00:00Z', 'Премия'));

const manager = new AccountManager();
manager.addAccount(personalAccount);
manager.addAccount(savings);

console.log(manager.toString());
console.log('\nОбщий баланс всех бюджетов:', manager.balance, '₽');
console.log('Доходы:', manager.income, '₽; расходы:', manager.expenses, '₽');
console.log('Сводка личного счёта:', personalAccount.getSummary());
console.log('Сводка всех счетов:', manager.getSummary());
console.log('Краткая сводка:\n' + manager.getSummaryString());
console.log('Получение счёта #1:', manager.getAccountById(1)?.name);
console.log('Несуществующий счёт:', manager.getAccountById(999));
console.log('Все счета:', manager.getAllAccounts().map(account => account.name));
console.log('Все счета (метод из темы 4):', manager.getAccounts().length);
console.log('\nТранзакции личного бюджета:');
personalAccount.getTransactions().forEach(transaction => console.log(transaction.toString()));

// Один общий контракт работает со счётом и со всем менеджером (полиморфизм).
function printSummary(label: string, budget: BudgetSummary): void {
  console.log(`${label}: ${budget.getSummaryString()}`);
}
console.log('\nОбщий интерфейс сводки:');
printSummary('Счёт', personalAccount);
printSummary('Менеджер', manager);

// Временные данные позволяют показать удаление, сохранив исходный пример.
personalAccount.addTransaction(new Transaction(5, 10, 'expense', '2023-01-11', 'Пробная покупка'));
console.log('\nУдаление транзакции #5:', personalAccount.removeTransactionById(5));
console.log('Повторное удаление транзакции #5:', personalAccount.removeTransactionById(5));
const temporaryAccount = new Account(3, 'Временный счёт');
manager.addAccount(temporaryAccount);
console.log('Удаление счёта #3:', manager.removeAccountById(3));
console.log('Повторное удаление счёта #3:', manager.removeAccountById(3));
console.log('Итоговая сводка:\n' + manager.getSummaryString());
