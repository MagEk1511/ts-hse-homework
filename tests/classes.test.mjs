import assert from 'node:assert/strict';
import test from 'node:test';
import { Account } from '../dist/classes/Account.js';
import { AccountManager } from '../dist/classes/AccountManager.js';
import { BudgetSummary } from '../dist/classes/BudgetSummary.js';
import { Transaction } from '../dist/classes/Transaction.js';

const transaction = (amount = 1000, type = 'income') => new Transaction(amount, type, '2023-01-01', 'Пример');
function personalAccount() {
  const account = new Account('Личный бюджет');
  account.addTransaction(transaction());
  account.addTransaction(transaction(200, 'expense'));
  account.addTransaction(transaction(150, 'expense'));
  return account;
}

test('UUID генерируются внутри конструкторов и уникальны', () => {
  const ids = [new Account('Первый').id, new Account('Второй').id, transaction().id, transaction().id];
  assert.equal(new Set(ids).size, 4);
  ids.forEach(id => assert.match(id, /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/));
});
test('транзакция сохраняет данные и форматирует дату и сумму по-русски', () => {
  const item = new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты');
  assert.equal(item.amount, 200);
  assert.equal(item.description, 'Продукты');
  assert.equal(item.date, '2023-01-05T00:00:00Z');
  for (const text of [item.id.slice(0, 8), '200.00 ₽', 'расход', 'Продукты', '5 января 2023']) assert.ok(item.toString().includes(text));
  assert.match(transaction().toString(), /доход/);
});
test('пустые списки дают нулевую сводку', () => {
  for (const budget of [new Account('Пустой'), new AccountManager()]) assert.deepEqual(budget.getSummary(), { income: 0, expenses: 0, balance: 0 });
  assert.deepEqual(new Account('Пустой').transactions, []);
  assert.deepEqual(new AccountManager().accounts, []);
});
test('пример задания даёт 1000 - 200 - 150 = 650', () => {
  const account = personalAccount();
  assert.equal(account.income, 1000);
  assert.equal(account.expenses, 350);
  assert.equal(account.balance, 650);
  assert.deepEqual(account.getSummary(), { income: 1000, expenses: 350, balance: 650 });
});
test('суммы считаются в копейках на уровне счёта и менеджера', () => {
  const first = new Account('Первый');
  first.addTransaction(transaction(0.1));
  first.addTransaction(transaction(0.2));
  first.addTransaction(transaction(0.1, 'expense'));
  const second = new Account('Второй');
  second.addTransaction(transaction(0.1, 'expense'));
  const manager = new AccountManager();
  manager.addAccount(first); manager.addAccount(second);
  assert.deepEqual(first.getSummary(), { income: 0.3, expenses: 0.1, balance: 0.2 });
  assert.deepEqual(manager.getSummary(), { income: 0.3, expenses: 0.2, balance: 0.1 });
});
test('поддерживается отрицательный баланс', () => {
  const account = new Account('Расходы'); account.addTransaction(transaction(75, 'expense'));
  assert.equal(account.balance, -75);
});
test('удаление транзакции обновляет баланс и сообщает результат', () => {
  const account = personalAccount(); const expense = account.transactions[1];
  assert.equal(account.removeTransactionById(expense.id), true);
  assert.equal(account.balance, 850);
  assert.equal(account.removeTransactionById(expense.id), false);
  assert.equal(account.getTransactions().length, 2);
});
test('менеджер находит, перечисляет и удаляет счета', () => {
  const manager = new AccountManager(); const account = personalAccount(); manager.addAccount(account);
  assert.equal(manager.getAccountById(account.id), account);
  assert.equal(manager.getAccountById('missing'), undefined);
  assert.deepEqual(manager.getAllAccounts(), [account]);
  assert.deepEqual(manager.getAccounts(), [account]);
  assert.equal(manager.removeAccountById(account.id), true);
  assert.equal(manager.removeAccountById(account.id), false);
  assert.equal(manager.getAccountById(account.id), undefined);
  assert.equal(manager.balance, 0);
});
test('повторное добавление объекта с тем же ID запрещено', () => {
  const manager = new AccountManager(); const account = personalAccount(); manager.addAccount(account);
  assert.throws(() => manager.addAccount(account), /уже существует/);
  assert.throws(() => account.addTransaction(account.transactions[0]), /уже существует/);
  assert.equal(manager.accounts.length, 1); assert.equal(account.transactions.length, 3);
});
test('полученные массивы не изменяют внутренние списки', () => {
  const account = personalAccount(); const manager = new AccountManager(); manager.addAccount(account);
  account.transactions.length = 0; account.getTransactions().pop(); manager.accounts.length = 0;
  manager.getAllAccounts().pop(); manager.getAccounts().pop();
  assert.equal(account.transactions.length, 3); assert.equal(manager.accounts.length, 1); assert.equal(manager.balance, 650);
});
test('текстовая сводка и полный вывод содержат данные и историю', () => {
  const account = personalAccount(); const manager = new AccountManager(); manager.addAccount(account);
  for (const text of [account.getSummaryString(), manager.getSummaryString()]) {
    assert.match(text, /Личный бюджет/); assert.match(text, /650/); assert.match(text, /Транзакций: 3/);
  }
  assert.match(account.toString(), /Список транзакций/); assert.match(manager.toString(), /расход/);
  assert.match(new Account('Пустой').toString(), /Транзакций пока нет/);
  assert.match(new AccountManager().toString(), /Счетов пока нет/);
});
test('наследники работают через общий контракт сводки', () => {
  const account = personalAccount(); const manager = new AccountManager(); manager.addAccount(account);
  for (const budget of [account, manager]) { assert.ok(budget instanceof BudgetSummary); assert.equal(budget.getSummary().balance, 650); }
});
test('невалидные суммы и типы отклоняются', () => {
  for (const amount of [0, -1, NaN, Infinity, -Infinity, 1.001, 1e-11, Number.MAX_VALUE]) assert.throws(() => transaction(amount), RangeError);
  assert.throws(() => transaction(10, 'transfer'), TypeError);
});
test('существование календарной даты проверяется отдельно от ISO-формата', () => {
  for (const date of ['2024-02-29', '2023-01-01T00:00:00Z', '2023-01-01T10:00:00.123+03:00']) assert.equal(new Transaction(1, 'income', date, '').date, date);
  for (const date of ['', '01.01.2023', '2023-02-29', '2023-02-30', '2023-13-01', '2023-01-01T00:00:00']) assert.throws(() => new Transaction(1, 'income', date, ''), RangeError);
});
test('пустое имя и переполнение суммы отклоняются', () => {
  assert.throws(() => new Account('  '), RangeError);
  const account = new Account('Большие суммы');
  account.addTransaction(transaction(50_000_000_000_000)); account.addTransaction(transaction(50_000_000_000_000));
  assert.throws(() => account.income, RangeError);
});
