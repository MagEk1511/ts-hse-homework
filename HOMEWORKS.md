# Домашние задания: условия и решения

Все 13 заданий просмотрены. Основное приложение соответствует последнему этапу; отдельные примеры сохраняют промежуточные реализации, которые следующие задания требуют заменить.

| № | Условие преподавателя | Реализация | Проверка / запуск |
| --- | --- | --- | --- |
| 1 | [Окружение и первый запуск](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw1.md) | `package.json`, `tsconfig.json`, `.gitignore`, приветствие в `src/classes/ApplicationController.ts` | `npm run build`, `npm start` |
| 2 | [Базовые типы и вычисления](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw2.md) | `src/calculation-demo.ts`: income, expenses, savings, netIncome, remaining | `npm run demo:calculations` |
| 3 | [Функции](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw3.md) | `src/functions.ts`: calculateTotal, calculateAverage, formatCurrency, getTopValues, printSummary и все вызовы | `npm run demo:functions`; `tests/functions.test.mjs` |
| 4 | [Интерфейсы и типы](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw4.md) | `examples/hw04/src/types.ts` и `index.ts`: объекты без классов; актуальные контракты в `src/interfaces/` | `npm run demo:interfaces` |
| 5 | [Классы и ООП](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw5.md) | Transaction, Account, AccountManager, общий BudgetSummary; инкапсуляция, наследование, полиморфизм | `npm run demo:oop`; `tests/classes.test.mjs`. Первоначальный вариант — в истории Git |
| 6 | [Generics](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw6.md) | `src/generics.ts`: Identifiable, Describable, GenericStorage<T>, Product; все методы и обработка объекта без describe | `npm run demo:generics`; `tests/generics-decorators.test.mjs` |
| 7 | [Namespace и организация файлов](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw7.md) | `examples/hw07/src/`: каждый интерфейс и класс в собственном файле, общий namespace BudgetTracker, объединение деклараций, единый выходной JS без ES-модулей | `npm run demo:namespaces` |
| 8 | [ES-модули и declaration files](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw8.md) | `src/classes/`, `src/interfaces/`; uuid, moment, lodash + @types/lodash; `src/lib/formatCurrency.js/.d.ts`, `budget-utils.js/.d.ts`; tsx | `npm start`; `npm run demo:oop`; `npm run typecheck` |
| 9 | [Utility types](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw9.md) | `src/interfaces/utility-types.ts`: все 10 требуемых типов; методы Transaction.update и Account.update | `npm run demo:types`; тесты обновлений и `tests/types.test.ts` |
| 10 | [Асинхронный CSV](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw10.md) | `src/utils/escapeCsvValue.ts`, Account.exportTransactionsToCSV(): Promise<void>, запись через node:fs/promises, контекст ошибки | `npm run demo:csv`; `tests/csv.test.mjs` |
| 11 | [Conditional и mapped types](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw11.md) | `src/interfaces/mapped-types.ts`: TransactionFieldType, OptionalTransaction, ReadonlyTransactionFields, IsIncome | `npm run demo:types`; положительные и отрицательные проверки компилятора в `tests/types.test.ts` |
| 12 | [Декораторы и метаданные](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw12.md) | `src/decorators/`: LogClass, LogMethod, ReadOnly, Metadata; reflect-metadata; применение к Account и его методам, ID и transactions | `npm run demo:decorators`; `tests/generics-decorators.test.mjs` |
| 13 | [Итоговый контроллер](https://github.com/vovachebr/TypeScript-homeworks/blob/master/hw13-final.md) | `src/classes/ApplicationController.ts`: start, createAccount, watchAccount, removeAccount, removeTransaction, addTransaction, exportTransactionsToCSV; также переименование и редактирование; `setInitialState` | `npm start -- --demo`; `tests/controller.test.mjs` |

## Уточнения к условиям

- В теме 7 основное описание смешивает ES-модули с namespace, но чек-лист требует namespace без import/export. Самостоятельный пример следует чек-листу. В теме 8 требуется обратный переход на ES-модули — так устроено итоговое приложение.
- Числовые ID относятся к темам 4–7. С темы 8 классы Account и Transaction генерируют строковый UUID сами; менеджер ищет и удаляет по строковому ID. У generic-продуктов ID остаётся числовым, как в теме 6.
- В теме 8 названы и `formatCurrency`, и `budget-utils`. Оба локальных модуля присутствуют с декларациями типов; классы используют `budget-utils`, который переэкспортирует `formatCurrency`.
- `AccountManager.getSummary()` возвращает числовую сводку согласно ISummary. Названия, балансы и количество транзакций по счетам выводятся методом getSummaryString().
- Partial-обновления исключают ID и методы: идентичность объекта неизменна, методы нельзя случайно заменить данными.
- В теме 12 защита свойства реализована для ID. Имя можно менять методом update, как требует тема 9 и назначение итогового приложения.
- В примере темы 10 отсутствует await перед экспортом. Здесь запись ожидается через await, чтобы исключение действительно попадало в обработчик ошибок.
- В Inquirer 14 используется зарегистрированный тип меню `select`; он выполняет роль `list` из примеров задания.

## Полный прогон

```bash
npm ci
npm test
npm run demo:all
npm start -- --demo
```

Все 45 автоматических тестов проходят. Они покрывают расчёты, UUID, частичные обновления и их атомарность, независимость списков, generic-хранилище, логи и метаданные, защиту ID, точное содержимое CSV, ошибки записи, навигацию и подтверждения в контроллере. Интеграционные тесты работают с настоящим Inquirer, создают счёт и транзакцию и возвращаются по меню в обоих режимах запуска. Тесты типов проверяют как разрешённые операции, так и ожидаемые ошибки компиляции.
