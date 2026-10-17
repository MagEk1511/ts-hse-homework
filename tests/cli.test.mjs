import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';

async function runCli(context, args, steps) {
  const child = spawn(process.execPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  context.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  let transcript = '', buffer = '', position = 0;
  child.stdout.on('data', chunk => {
    transcript += chunk;
    buffer += chunk;
    const step = steps[position];
    if (step && step[0].test(buffer)) {
      position++;
      buffer = '';
      setTimeout(() => { if (!child.killed) child.stdin.write(step[1]); }, 40);
    }
  });
  child.stderr.on('data', chunk => { transcript += chunk; });
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  assert.equal(code, 0, transcript);
  assert.equal(position, steps.length, transcript);
  assert.match(transcript, /До свидания!/);
  return transcript;
}

const createAndAdd = [
  [/\? Счета/, '\r'],
  [/\? Название нового счёта:/, 'Smoke\r'],
  [/\? Счета/, '\r'],
  [/\? Действия со счётом/, '\r'],
  [/\? Сумма \(больше нуля\):/, '12,50\r'],
  [/\? Тип операции:/, '\r'],
  [/\? Дата \(YYYY-MM-DD\):/, '\r'],
  [/\? Описание:/, 'Smoke\r'],
  [/\? Действия со счётом/, '\x1b[A\r'],
  [/\? Счета/, '\x1b[A\r'],
];

for (const [label, args] of [
  ['собранный JavaScript', ['dist/index.js']],
  ['исходный TypeScript через tsx', ['--import', 'tsx', 'src/index.ts']],
]) {
  test(`настоящее меню Inquirer: создание, операция, возврат и выход (${label})`, { timeout: 10000 }, async context => {
    const transcript = await runCli(context, args, createAndAdd);
    assert.match(transcript, /Транзакция добавлена\./);
    assert.match(transcript, /12\.50 ₽/);
  });
}
test('настоящее меню с демоданными поддерживает Ctrl+C', { timeout: 10000 }, async context => {
  const transcript = await runCli(context, ['dist/index.js', '--demo'], [[/\? Счета/, '\x03']]);
  assert.match(transcript, /Личный бюджет/);
  assert.match(transcript, /Копилка на отпуск/);
  assert.match(transcript, /1250\.00/);
});
