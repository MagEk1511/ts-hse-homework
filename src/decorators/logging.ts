let enabled = true;

export function setDecoratorLogging(value: boolean): void {
  enabled = value;
}

export function decoratorLog(message: string, ...values: unknown[]): void {
  if (enabled) console.log(message, ...values);
}
