import assert from 'node:assert/strict';
import test from 'node:test';
import 'reflect-metadata';
import { GenericStorage, Product } from '../dist/generics.js';
import { Account } from '../dist/classes/Account.js';
import { Transaction } from '../dist/classes/Transaction.js';
import { setDecoratorLogging } from '../dist/decorators/logging.js';
setDecoratorLogging(false);

test('generic-хранилище добавляет, ищет и удаляет продукты', () => {
  const storage = new GenericStorage(); const product = new Product(1, 'Ноутбук', 150000);
  storage.add(product);
  assert.equal(storage.getById(1), product); assert.equal(storage.getById(2), undefined);
  storage.getAll().pop(); assert.equal(storage.getAll().length, 1);
  assert.throws(() => storage.add(product), /уже существует/);
  assert.equal(storage.removeById(1), true); assert.equal(storage.removeById(1), false);
});
test('describeAll обрабатывает как описываемые элементы, так и объекты без метода', context => {
  const log = context.mock.method(console, 'log', () => {});
  const storage = new GenericStorage(); storage.add(new Product(1, 'Ноутбук', 150000)); storage.add({ id: 4 });
  storage.describeAll();
  assert.deepEqual(log.mock.calls.map(call => call.arguments[0]), [
    'Product #1: Ноутбук, price: $150000', 'Элемент id: 4 не содержит описания.',
  ]);
});
test('ReadOnly защищает ID каждого экземпляра после инициализации', () => {
  const first = new Account('Первый'); const second = new Account('Второй');
  for (const item of [first, second, new Transaction(1, 'income', '2023-01-01', '')]) {
    const id = item.id;
    assert.throws(() => { item.id = 'changed'; }, TypeError);
    assert.throws(() => Object.defineProperty(item, 'id', { value: 'changed' }), TypeError);
    assert.equal(item.id, id);
  }
  assert.notEqual(first.id, second.id);
  first.update({ name: 'Новое имя' }); assert.equal(first.name, 'Новое имя');
});
test('Metadata сохраняет описание и Account читает его в сводке', () => {
  const account = new Account('Метаданные');
  assert.equal(Reflect.getMetadata('description', account, 'transactions'), 'История операций счёта');
  assert.match(account.getSummaryString(), /История операций счёта/);
});
test('LogClass и LogMethod выводят создание, вызовы и результаты', context => {
  const log = context.mock.method(console, 'log', () => {});
  setDecoratorLogging(true);
  try {
    const account = new Account('Логирование');
    const transaction = new Transaction(1, 'income', '2023-01-01', '');
    account.addTransaction(transaction); account.getTransactions(); account.removeTransactionById(transaction.id);
    const messages = log.mock.calls.map(call => call.arguments[0]).join('\n');
    assert.match(messages, /Создан экземпляр класса Account с аргументами:/);
    for (const method of ['addTransaction', 'getTransactions', 'removeTransactionById']) {
      assert.ok(messages.includes(`Вызов метода ${method} с аргументами:`));
      assert.ok(messages.includes(`Метод ${method} вернул:`));
    }
  } finally { setDecoratorLogging(false); }
});
