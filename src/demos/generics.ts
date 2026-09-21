import { GenericStorage, Product } from '../generics.js';

const storage = new GenericStorage<Product>();
storage.add(new Product(1, 'Ноутбук', 150000));
storage.add(new Product(2, 'Смартфон', 80000));
storage.add(new Product(3, 'Планшет', 50000));
storage.describeAll();
// Приведение предусмотрено условием: во время выполнения describe может отсутствовать.
storage.add({ id: 4 } as Product);
storage.describeAll();
console.log('Поиск #2:', storage.getById(2)?.describe());
console.log('Все элементы:', storage.getAll().length);
console.log('Удаление #3:', storage.removeById(3));
console.log('Повторное удаление #3:', storage.removeById(3));
