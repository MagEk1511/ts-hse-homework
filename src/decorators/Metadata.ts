import 'reflect-metadata';

export function Metadata(key: string, value: unknown): PropertyDecorator {
  return (target: object, property: string | symbol): void => {
    Reflect.defineMetadata(key, value, target, property);
  };
}
