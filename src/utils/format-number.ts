/**
 * Форматирует большие числа в компактный вид
 * @param num - Число для форматирования
 * @param precision - Количество знаков после запятой (по умолчанию 1)
 * @returns Отформатированная строка (например, 1000 -> "1k", 1500000 -> "1.5M")
 */
export function formatNumber(num: number, precision: number = 1): string {
  if (num < 1000) {
    return num.toString();
  }

  const units = [
    { value: 1_000_000_000, suffix: "B" }, // Billion
    { value: 1_000_000, suffix: "M" }, // Million
    { value: 1_000, suffix: "k" }, // Thousand
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = num / unit.value;
      // Убираем .0 если число целое
      const rounded = Number(formatted.toFixed(precision));
      return rounded % 1 === 0
        ? `${Math.floor(rounded)}${unit.suffix}`
        : `${rounded}${unit.suffix}`;
    }
  }

  return num.toString();
}

/**
 * Форматирует время в секундах в читаемый вид
 * @param seconds - Время в секундах
 * @returns Отформатированная строка (например, 125 -> "2:05")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Форматирует процент с одним знаком после запятой
 * @param value - Значение процента
 * @returns Отформатированная строка (например, 95.5 -> "95.5%")
 */
export function formatPercent(value: number): string {
  return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(1)}%`;
}
