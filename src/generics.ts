export interface Identifiable { id: number; }
export interface Describable { describe(): string; }

export class GenericStorage<T extends Identifiable> {
  readonly #items: T[] = [];
  add(item: T): void {
    if (this.getById(item.id)) throw new Error(`Элемент с id ${item.id} уже существует.`);
    this.#items.push(item);
  }
  removeById(id: number): boolean {
    const index = this.#items.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.#items.splice(index, 1);
    return true;
  }
  getById(id: number): T | undefined { return this.#items.find(item => item.id === id); }
  getAll(): T[] { return [...this.#items]; }
  describeAll(): void {
    for (const item of this.#items) {
      if ('describe' in item && typeof item.describe === 'function') console.log((item as T & Describable).describe());
      else console.log(`Элемент id: ${item.id} не содержит описания.`);
    }
  }
}

export class Product implements Identifiable, Describable {
  constructor(public id: number, public name: string, public price: number) {}
  describe(): string { return `Product #${this.id}: ${this.name}, price: $${this.price}`; }
}
