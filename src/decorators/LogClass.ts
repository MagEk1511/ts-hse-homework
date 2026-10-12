import { decoratorLog } from './logging.js';

// any[] здесь требуется сигнатурой mixin-конструктора TypeScript.
export function LogClass<T extends new (...args: any[]) => object>(Target: T): T {
  const Logged = class extends Target {
    constructor(...args: any[]) {
      super(...args);
      decoratorLog(`Создан экземпляр класса ${Target.name} с аргументами:`, ...args);
    }
  };
  Object.defineProperty(Logged, 'name', { value: Target.name });
  return Logged;
}
