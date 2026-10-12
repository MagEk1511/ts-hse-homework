export function ReadOnly(target: object, property: string | symbol): void {
  Object.defineProperty(target, property, {
    configurable: false,
    set(this: object, value: unknown): void {
      // Первая запись инициализирует собственное неизменяемое поле экземпляра.
      Object.defineProperty(this, property, {
        value,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    },
  });
}
