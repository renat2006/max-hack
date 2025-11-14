// Astronaut Selection Game Constants

export const GAME_CONFIG = {
  INITIAL_TIME: 60, // Начальное время
  MAX_TIME: 60, // Максимум времени
  MIN_TIME: 0, // Минимум (игра заканчивается)
  TIME_BONUS_CORRECT: 3, // +3 сек за правильный ответ
  TIME_PENALTY_WRONG: 7, // -7 сек за неправильный ответ (ОБНОВЛЕНО с 5)
  MIN_RULES_PER_ROUND: 2, // Минимум правил за раунд
  MAX_RULES_PER_ROUND: 4, // Максимум правил за раунд
  CANDIDATES_UNTIL_RULE_CHANGE: 5, // Меняем правила каждые 5 кандидатов
  FEEDBACK_DURATION: 500,
  HINT_DELAY: 6000,
} as const;

// Правила с визуальными стильными иконками (unicode символы)
// КРАСНЫЙ = ИСКЛЮЧЕНИЕ/ЗАПРЕТ (exclude-)
// ЗЕЛЕНЫЙ/СИНИЙ = ТРЕБОВАНИЕ (require-)
export const RULE_VISUALS = {
  "require-specialty": { icon: "◐", color: "#10b981" }, // Зеленый - требование
  "exclude-specialty": { icon: "✕", color: "#ef4444" }, // Красный - исключение
  "require-age-range": { icon: "⏱", color: "#10b981" }, // Зеленый - требование
  "require-education": { icon: "■", color: "#10b981" }, // Зеленый - требование
  "require-profession": { icon: "◆", color: "#3b82f6" }, // Синий - требование
  "require-citizenship": { icon: "●", color: "#06b6d4" }, // Голубой - требование
  "exclude-age-group": { icon: "✕", color: "#ef4444" }, // Красный - исключение
  "exclude-profession": { icon: "✕", color: "#ef4444" }, // Красный - исключение
  "require-no-glasses": { icon: "○", color: "#ef4444" }, // Красный - запрет очков
  "require-no-tattoos": { icon: "◈", color: "#ef4444" }, // Красный - запрет татуировок
  "require-height-range": { icon: "↕", color: "#8b5cf6" }, // Фиолетовый - требование
  "require-languages-min": { icon: "▲", color: "#10b981" }, // Зеленый - требование
  "require-experience-min": { icon: "★", color: "#f59e0b" }, // Желтый - требование
  "exclude-name-starts-with": { icon: "▸", color: "#ef4444" }, // Красный - исключение
  "require-beard": { icon: "◐", color: "#10b981" }, // Зеленый - требование бороды
  "exclude-beard": { icon: "◑", color: "#ef4444" }, // Красный - запрет бороды
  "require-glasses-avatar": { icon: "◆", color: "#10b981" }, // Зеленый - требование очков на аватаре
  "exclude-glasses-avatar": { icon: "○", color: "#ef4444" }, // Красный - запрет очков на аватаре
  "require-gesture": { icon: "◓", color: "#10b981" }, // Зеленый - требование жеста
  "exclude-gesture": { icon: "◒", color: "#ef4444" }, // Красный - запрет жеста
  "require-body-icon": { icon: "◕", color: "#10b981" }, // Зеленый - требование иконки
  "exclude-body-icon": { icon: "◓", color: "#ef4444" }, // Красный - запрет иконки
  "exclude-hair-color": { icon: "✕", color: "#ef4444" }, // Красный - исключение цвета волос
} as const;
