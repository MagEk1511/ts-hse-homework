import { ApplicationController } from './classes/ApplicationController.js';
import { setDecoratorLogging } from './decorators/logging.js';
import { setInitialState } from './initial-state.js';
import { errorMessage } from './utils/validation.js';

setDecoratorLogging(process.argv.includes('--logs'));
if (process.argv.includes('--help')) {
  console.log('Budget Tracker CLI\nЗапуск: npm start [-- --demo] [--logs]\n--demo: заполнить два счёта примерами\n--logs: показать работу декораторов\nДанные хранятся в памяти; CSV сохраняется в exports/.');
} else {
  const controller = new ApplicationController();
  if (process.argv.includes('--demo')) setInitialState(controller);
  try {
    await controller.start();
  } catch (error: unknown) {
    console.error('Ошибка приложения:', errorMessage(error));
    process.exitCode = 1;
  }
}
