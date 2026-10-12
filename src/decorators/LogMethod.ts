import { decoratorLog } from './logging.js';

export function LogMethod(_target: object, property: string | symbol, descriptor: PropertyDescriptor): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (this: object, ...args: unknown[]): unknown {
    decoratorLog(`Вызов метода ${String(property)} с аргументами:`, ...args);
    const result: unknown = Reflect.apply(original, this, args);
    if (result instanceof Promise) {
      return result.then((value: unknown) => {
        decoratorLog(`Метод ${String(property)} вернул:`, value);
        return value;
      });
    }
    decoratorLog(`Метод ${String(property)} вернул:`, result);
    return result;
  };
}
