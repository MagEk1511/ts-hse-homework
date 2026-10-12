import 'reflect-metadata';
import { Account } from '../classes/Account.js';
import { Transaction } from '../classes/Transaction.js';
import { setDecoratorLogging } from '../decorators/logging.js';

setDecoratorLogging(true);
const account = new Account('Демонстрация декораторов');
const transaction = new Transaction(1000, 'income', '2023-01-01', 'Зарплата');
account.addTransaction(transaction);
account.getTransactions();
account.removeTransactionById(transaction.id);
console.log(account.getSummaryString());
try { account.id = 'новый-id'; } catch (error: unknown) {
  console.log('Изменение id запрещено:', error instanceof Error ? error.message : String(error));
}
console.log('Метаданные:', Reflect.getMetadata('description', account, 'transactions'));
setDecoratorLogging(false);
