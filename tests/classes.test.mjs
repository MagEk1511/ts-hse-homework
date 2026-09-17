import assert from 'node:assert/strict';
import test from 'node:test';
import { Account, AccountManager, BudgetSummary, Transaction } from '../dist/classes.js';

function transaction(id = 1, amount = 1000, type = 'income') {
  return new Transaction(id, amount, type, '2023-01-01T00:00:00Z', 'Пример');
}

function personalAccount() {
  const account = new Account(1, 'Личный бюджет');
  account.addTransaction(transaction(1, 1000, 'income'));
  account.addTransaction(transaction(2, 200, 'expense'));
  account.addTransaction(transaction(3, 150, 'expense'));
  return account;
}

test('транзакция сохраняет все данные и выводится в читаемом формате', () => {
  const item = new Transaction(7, 200, 'expense', '2023-01-05T00:00:00Z', 'Продукты');
  assert.equal(item.id, 7);
  assert.equal(item.amount, 200);
  assert.equal(item.type, 'expense');
  assert.equal(item.date, '2023-01-05T00:00:00Z');
  assert.equal(item.description, 'Продукты');
  for (const text of ['7)', '200', 'расход', 'Продукты', item.date]) {
    assert.ok(item.toString().includes(text));
  }
  assert.match(transaction().toString(), /доход/);
});

test('пустые счёт и менеджер имеют нулевые сводки', () => {
  for (const budget of [new Account(1, 'Пустой'), new AccountManager()]) {
    assert.deepEqual(budget.getSummary(), { income: 0, expenses: 0, balance: 0 });
  }
  assert.deepEqual(new Account(1, 'Пустой').transactions, []);
  assert.deepEqual(new AccountManager().accounts, []);
});

test('счёт правильно считает пример из задания: 1000 - 200 - 150 = 650', () => {
  const account = personalAccount();
  assert.equal(account.income, 1000);
  assert.equal(account.expenses, 350);
  assert.equal(account.balance, 650);
  assert.deepEqual(account.getSummary(), { income: 1000, expenses: 350, balance: 650 });
});

test('дробные суммы вычисляются в копейках без ошибки плавающей точки', () => {
  const first = new Account(1, 'Первый');
  first.addTransaction(transaction(1, 0.1));
  first.addTransaction(transaction(2, 0.2));
  first.addTransaction(transaction(3, 0.1, 'expense'));
  const second = new Account(2, 'Второй');
  second.addTransaction(transaction(1, 0.1, 'expense'));
  const manager = new AccountManager();
  manager.addAccount(first);
  manager.addAccount(second);
  assert.deepEqual(first.getSummary(), { income: 0.3, expenses: 0.1, balance: 0.2 });
  assert.deepEqual(manager.getSummary(), { income: 0.3, expenses: 0.2, balance: 0.1 });
});

test('расходы могут превышать доходы', () => {
  const account = new Account(1, 'Расходы');
  account.addTransaction(transaction(1, 75, 'expense'));
  assert.equal(account.balance, -75);
});

test('удаление транзакции возвращает результат и обновляет баланс', () => {
  const account = personalAccount();
  assert.equal(account.removeTransactionById(2), true);
  assert.equal(account.balance, 850);
  assert.equal(account.removeTransactionById(2), false);
  assert.equal(account.removeTransactionById(999), false);
  assert.equal(account.getTransactions().length, 2);
});

test('менеджер добавляет, находит и перечисляет счета', () => {
  const manager = new AccountManager();
  const account = personalAccount();
  manager.addAccount(account);
  assert.equal(manager.getAccountById(1), account);
  assert.equal(manager.getAccountById(999), undefined);
  assert.deepEqual(manager.getAllAccounts(), [account]);
  assert.deepEqual(manager.getAccounts(), [account]);
  assert.deepEqual(manager.accounts, [account]);
});

test('менеджер агрегирует несколько счетов и видит новые транзакции', () => {
  const manager = new AccountManager();
  const first = personalAccount();
  const second = new Account(2, 'Накопления');
  second.addTransaction(transaction(1, 500));
  manager.addAccount(first);
  manager.addAccount(second);
  assert.deepEqual(manager.getSummary(), { income: 1500, expenses: 350, balance: 1150 });
  second.addTransaction(transaction(2, 50, 'expense'));
  assert.equal(manager.balance, 1100);
  assert.equal(manager.expenses, 400);
});

test('удаление счёта обновляет итоги и возвращает false для отсутствующего id', () => {
  const manager = new AccountManager();
  manager.addAccount(personalAccount());
  assert.equal(manager.removeAccountById(1), true);
  assert.equal(manager.removeAccountById(1), false);
  assert.equal(manager.getAccountById(1), undefined);
  assert.deepEqual(manager.getSummary(), { income: 0, expenses: 0, balance: 0 });
});

test('нельзя добавить повторяющийся id счёта или транзакции в один список', () => {
  const manager = new AccountManager();
  const account = personalAccount();
  manager.addAccount(account);
  assert.throws(() => manager.addAccount(new Account(1, 'Дубликат')), /уже существует/);
  assert.throws(() => account.addTransaction(transaction(1)), /уже существует/);
  assert.equal(manager.accounts.length, 1);
  assert.equal(account.transactions.length, 3);
});

test('полученные массивы не позволяют изменить внутренние списки', () => {
  const account = personalAccount();
  const manager = new AccountManager();
  manager.addAccount(account);
  account.transactions.length = 0;
  account.getTransactions().pop();
  manager.accounts.length = 0;
  manager.getAllAccounts().pop();
  manager.getAccounts().pop();
  assert.equal(account.getTransactions().length, 3);
  assert.equal(manager.getAllAccounts().length, 1);
  assert.equal(manager.balance, 650);
});

test('получение сводки возвращает независимый объект', () => {
  const account = personalAccount();
  const summary = account.getSummary();
  summary.balance = 9999;
  assert.equal(account.balance, 650);
});

test('строки счёта и менеджера содержат названия, суммы и транзакции', () => {
  const account = personalAccount();
  const manager = new AccountManager();
  manager.addAccount(account);
  for (const text of [account.getSummaryString(), manager.getSummaryString()]) {
    assert.match(text, /Личный бюджет/);
    assert.match(text, /650/);
    assert.match(text, /Транзакций: 3/);
  }
  assert.match(account.toString(), /Список транзакций/);
  assert.match(manager.toString(), /Пример/);
  assert.match(manager.toString(), /расход/);
  assert.match(new Account(1, 'Пустой').toString(), /Транзакций пока нет/);
  assert.match(new AccountManager().toString(), /Счетов пока нет/);
});

test('наследники используют общий контракт сводки полиморфно', () => {
  const account = personalAccount();
  const manager = new AccountManager();
  manager.addAccount(account);
  for (const budget of [account, manager]) {
    assert.ok(budget instanceof BudgetSummary);
    assert.equal(budget.getSummary().balance, 650);
    assert.match(budget.getSummaryString(), /650/);
  }
});

test('невалидные id отклоняются при создании объектов', () => {
  for (const id of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => new Account(id, 'Пример'), RangeError);
    assert.throws(() => transaction(id), RangeError);
  }
});

test('невалидные суммы и неизвестный тип транзакции отклоняются', () => {
  for (const amount of [0, -1, NaN, Infinity, -Infinity, 1.001, 0.00000000001, Number.MAX_VALUE]) {
    assert.throws(() => transaction(1, amount), RangeError);
  }
  assert.throws(() => transaction(1, 10, 'transfer'), TypeError);
});

test('переполнение безопасного диапазона итоговой суммы вызывает ошибку', () => {
  const account = new Account(1, 'Большие суммы');
  account.addTransaction(transaction(1, 50_000_000_000_000));
  account.addTransaction(transaction(2, 50_000_000_000_000));
  assert.throws(() => account.income, RangeError);
});

test('даты проверяются по формату ISO и календарю', () => {
  for (const date of ['2024-02-29', '2023-01-01T00:00:00Z', '2023-01-01T10:00:00.123+03:00']) {
    assert.equal(new Transaction(1, 1, 'income', date, 'Дата').date, date);
  }
  for (const date of ['', '01.01.2023', '2023-02-29', '2023-02-30', '2023-13-01', '2023-01-01T00:00:00']) {
    assert.throws(() => new Transaction(1, 1, 'income', date, 'Дата'), RangeError);
  }
});
