import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Account } from '../dist/classes/Account.js';
import { Transaction } from '../dist/classes/Transaction.js';
import { escapeCsvValue } from '../dist/utils/escapeCsvValue.js';

async function directory(context) {
  const path = await mkdtemp(join(tmpdir(), 'budget-csv-'));
  context.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test('CSV-экранирование покрывает запятые, кавычки и оба перевода строки', () => {
  assert.equal(escapeCsvValue(12.5), '12.5');
  assert.equal(escapeCsvValue('Текст'), 'Текст');
  assert.equal(escapeCsvValue('а,б'), '"а,б"');
  assert.equal(escapeCsvValue('"магазин"'), '"""магазин"""');
  assert.equal(escapeCsvValue("O'Brien"), '"O\'Brien"');
  assert.equal(escapeCsvValue('а\nб'), '"а\nб"');
  assert.equal(escapeCsvValue('а\rб'), '"а\rб"');
});
test('пустой счёт экспортируется с заголовками', async context => {
  const path = join(await directory(context), 'empty.csv');
  const result = new Account('Пустой').exportTransactionsToCSV(path);
  assert.ok(result instanceof Promise);
  await result;
  assert.equal(await readFile(path, 'utf8'), 'id,amount,type,date,description\r\n');
});
test('экспорт сохраняет порядок полей, UUID, Unicode и экранированное описание', async context => {
  const path = join(await directory(context), 'account.csv');
  const account = new Account('Основной');
  const first = new Transaction(1000, 'income', '2023-01-01', 'Зарплата');
  const second = new Transaction(12.5, 'expense', '2023-01-02', 'Кофе, "капучино"\nЧек');
  account.addTransaction(first); account.addTransaction(second);
  await account.exportTransactionsToCSV(path);
  assert.equal(await readFile(path, 'utf8'),
    `id,amount,type,date,description\r\n${first.id},1000,income,2023-01-01,Зарплата\r\n${second.id},12.5,expense,2023-01-02,"Кофе, ""капучино""\nЧек"\r\n`);
});
test('ошибка записи возвращается как отклонённый Promise с контекстом', async context => {
  const path = join(await directory(context), 'missing', 'account.csv');
  await assert.rejects(new Account('Ошибка').exportTransactionsToCSV(path), error => {
    assert.match(error.message, /Не удалось экспортировать CSV/);
    assert.equal(error.cause.code, 'ENOENT');
    return true;
  });
});
