// Тема 2: базовые типы и вычисления для Budget Tracker.
const income: number = 100_000;
const expenses: number = 60_000;
const savings: number = 15_000;
const netIncome: number = income - expenses;
const remaining: number = netIncome - savings;

console.log('Доход за месяц:', income);
console.log('Расход за месяц:', expenses);
console.log('Планируемые сбережения:', savings);
console.log('Чистый доход:', netIncome);
console.log('Остаток после сбережений:', remaining);
