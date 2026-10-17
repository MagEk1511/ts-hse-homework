import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import inquirer from 'inquirer';
import { Account } from '../dist/classes/Account.js';
import { AccountManager } from '../dist/classes/AccountManager.js';
import { Transaction } from '../dist/classes/Transaction.js';
import { ApplicationController } from '../dist/classes/ApplicationController.js';
import { setDecoratorLogging } from '../dist/decorators/logging.js';
import { setInitialState } from '../dist/initial-state.js';
setDecoratorLogging(false);

function scripted(steps) {
  const queue = [...steps];
  const ask = async questions => {
    for (const question of questions) assert.ok(question.type in inquirer.prompt.prompts, `Тип prompt ${question.type} не зарегистрирован`);
    assert.ok(queue.length > 0, 'Неожиданный дополнительный запрос');
    const step = queue.shift();
    return typeof step === 'function' ? step(questions) : step;
  };
  return { ask, done: () => assert.equal(queue.length, 0, 'Не все вопросы были показаны') };
}
function silence(context) {
  context.mock.method(console, 'log', () => {});
  context.mock.method(console, 'error', () => {});
}
const fields = { amount: '12,50', type: 'expense', date: '2024-02-29', description: 'Покупка' };

test('полный маршрут: создать счёт, добавить операцию, вернуться и выйти', async context => {
  silence(context); const manager = new AccountManager();
  const script = scripted([
    { action: '__create' }, { name: 'Основной' }, () => ({ action: manager.accounts[0].id }),
    { action: 'add' }, fields, { action: 'back' }, { action: '__exit' },
  ]);
  await new ApplicationController(manager, script.ask).start(); script.done();
  assert.equal(manager.accounts[0].name, 'Основной'); assert.equal(manager.balance, -12.5);
});
test('валидация вопросов отклоняет пустое имя, неверные сумму и дату', async context => {
  silence(context);
  const script = scripted([
    questions => { assert.notEqual(questions[0].validate('  '), true); return { name: 'Счёт' }; },
    questions => {
      assert.notEqual(questions[0].validate('-1'), true);
      assert.notEqual(questions[0].validate('0'), true);
      assert.equal(questions[0].validate('12,50'), true);
      assert.notEqual(questions[2].validate('2023-02-30'), true);
      assert.notEqual(questions[2].validate('2023-01-01T00:00:00Z'), true);
      assert.equal(questions[2].validate('2024-02-29'), true);
      assert.match(questions[2].default, /^\d{4}-\d{2}-\d{2}$/);
      return fields;
    },
  ]);
  const controller = new ApplicationController(new AccountManager(), script.ask);
  await controller.createAccount(); await controller.addTransaction(controller.accountManager.accounts[0]); script.done();
});
test('переименование и редактирование сохраняют идентификаторы', async context => {
  silence(context); const account = new Account('До'); const item = new Transaction(100, 'income', '2023-01-01', 'До'); account.addTransaction(item);
  const script = scripted([{ name: 'После' }, { id: item.id }, fields]);
  const controller = new ApplicationController(new AccountManager(), script.ask);
  const id = item.id; await controller.renameAccount(account); await controller.editTransaction(account); script.done();
  assert.equal(account.name, 'После'); assert.equal(item.id, id); assert.equal(item.amount, 12.5); assert.equal(item.type, 'expense');
});
test('удаление транзакции запрашивает подтверждение и поддерживает отказ', async context => {
  silence(context); const account = new Account('Счёт'); const item = new Transaction(1, 'income', '2023-01-01', ''); account.addTransaction(item);
  const script = scripted([{ id: item.id }, { confirmed: false }, { id: item.id }, { confirmed: true }]);
  const controller = new ApplicationController(new AccountManager(), script.ask);
  await controller.removeTransaction(account); assert.equal(account.transactions.length, 1);
  await controller.removeTransaction(account); assert.equal(account.transactions.length, 0); script.done();
});
test('пустой список и отмена выбора транзакции не запускают удаление', async context => {
  silence(context); const script = scripted([{ id: '__back' }]);
  const controller = new ApplicationController(new AccountManager(), script.ask); const account = new Account('Счёт');
  await controller.removeTransaction(account);
  account.addTransaction(new Transaction(1, 'income', '2023-01-01', ''));
  await controller.removeTransaction(account); script.done(); assert.equal(account.transactions.length, 1);
});
test('удаление счёта поддерживает отказ и возвращает из вложенного меню', async context => {
  silence(context); const account = new Account('Счёт'); const manager = new AccountManager(); manager.addAccount(account);
  const script = scripted([{ confirmed: false }, { action: 'removeAccount' }, { confirmed: true }]);
  const controller = new ApplicationController(manager, script.ask);
  await controller.removeAccount(account); assert.equal(manager.accounts.length, 1);
  await controller.watchAccount(account); assert.equal(manager.accounts.length, 0); script.done();
});
test('ошибка операции не завершает меню счёта', async context => {
  silence(context); const account = new Account('Счёт'); const manager = new AccountManager(); manager.addAccount(account);
  const script = scripted([{ action: 'add' }, { ...fields, amount: '-1' }, { action: 'back' }]);
  await new ApplicationController(manager, script.ask).watchAccount(account); script.done(); assert.equal(account.transactions.length, 0);
});
test('экспорт добавляет расширение и спрашивает о перезаписи', async context => {
  silence(context); const directory = await mkdtemp(join(tmpdir(), 'budget-controller-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const account = new Account('Счёт'); const path = join(directory, 'sample.csv');
  const script = scripted([{ filename: 'sample' }, { filename: 'sample' }, { confirmed: false }, { filename: 'sample.csv' }, { confirmed: true }]);
  const controller = new ApplicationController(new AccountManager(), script.ask, directory);
  await controller.exportTransactionsToCSV(account); assert.match(await readFile(path, 'utf8'), /^id,amount/);
  await writeFile(path, 'сохранить');
  await controller.exportTransactionsToCSV(account); assert.equal(await readFile(path, 'utf8'), 'сохранить');
  await controller.exportTransactionsToCSV(account); assert.match(await readFile(path, 'utf8'), /^id,amount/); script.done();
});
test('экспорт запрещает выход за пределы каталога', async context => {
  silence(context); const script = scripted([{ filename: '../escape' }]);
  await assert.rejects(new ApplicationController(new AccountManager(), script.ask).exportTransactionsToCSV(new Account('Счёт')), /Некорректное имя/);
  script.done();
});
test('Ctrl+C завершает приложение без необработанного исключения', async context => {
  silence(context); const error = new Error('cancel'); error.name = 'ExitPromptError';
  await new ApplicationController(new AccountManager(), async () => { throw error; }).start();
});
test('начальное состояние содержит два счёта и семь транзакций', () => {
  const controller = new ApplicationController(); setInitialState(controller);
  assert.equal(controller.accountManager.accounts.length, 2);
  assert.equal(controller.accountManager.accounts.flatMap(account => account.transactions).length, 7);
  assert.deepEqual(controller.accountManager.getSummary(), { income: 2100, expenses: 850, balance: 1250 });
});
