# Mini-Games Architecture

## 📁 Структура проекта

```
src/lib/mini-games/
├── core/                          # Общий движок и базовые типы
│   ├── engine.ts                  # Базовый класс MiniGameEngine
│   ├── session/                   # Общие типы/интерфейсы для сессий
│   ├── utils.ts                   # Общие утилиты
│   └── index.ts
│
├── components/                    # Библиотека компонентов
│   ├── mini-game-button.tsx      # Стилизованные кнопки
│   ├── mini-game-feedback-overlay.tsx # Оверлей с результатом (✓/✗)
│   ├── mini-game-action-buttons.tsx   # Кнопки Approve/Reject
│   └── index.ts
│
├── modes/                         # Модульная логика по режимам
│   ├── captcha/                   # Orbital Captcha
│   │   ├── api.ts                 # Клиент авторазметки
│   │   ├── challenges.ts          # Фабрика базовых челленджей
│   │   ├── hooks/                 # Специализированные хуки (prefetch и т.д.)
│   │   ├── scoring.ts             # Подсчет очков и проверка
│   │   ├── session.ts             # Логика сессии режима
│   │   ├── session-types.ts       # Состояние и фабрика state
│   │   └── view.tsx               # UI-обертка режима
│   └── ...                        # Другие режимы (astronaut-selection, cosmic-poker и т.д.)
│
├── types.ts                       # Общие типы мини-игр
├── catalog.ts                     # Каталог всех игр
└── use-mini-game-session.ts       # Каркас, делегирующий в режимные сессии
```

## 🎮 Как добавить новую мини-игру

### 1. Создать папку игры

```bash
mkdir src/lib/mini-games/games/my-new-game
```

#### `types.ts` - Типы игры

```typescript
export type MyGameData = {
  // Данные для игры
type MyGameViewProps = {
  onComplete: (score: number) => void;
  onHudUpdate?: (payload: MiniGameHudState) => void;
};

export function MyGameView({ onComplete, onHudUpdate }: MyGameViewProps) {
  // Обновляем AppHeader через onHudUpdate
  useEffect(() => {
    onHudUpdate?.({
      metrics: [
        { label: "Correct", value: "3", icon: "score", tone: "success" },
        { label: "Accuracy", value: "92%", icon: "accuracy", tone: "success" },
      ],
    });
  }, [onHudUpdate]);

export type MyGameState = {
  // Состояние игры
```

#### `data.ts` - Данные игры

````typescript
export const MY_GAME_DATA: MyGameData[] = [
  // Данные
];

#### `engine.ts` - Логика игры
```typescript
import { MiniGameEngine } from "@/lib/mini-games/core";

> Заголовок мини-игры теперь формируется `AppHeader`. Передавайте статусы и метрики через `onHudUpdate`, чтобы получить единый стиль для всех режимов.

export class MyGameEngine extends MiniGameEngine {
  validate(answer: any): boolean {
    // Логика проверки ответа
    return true;
  }
}
````

#### `view.tsx` - Компонент игры

```typescript
"use client";

import { useEffect } from "react";

import { MiniGameButton, MiniGameFeedbackOverlay, MiniGameResults } from "@/lib/mini-games/components";
import type { MiniGameHudState } from "@/lib/mini-games/types";

type MyGameViewProps = {
  onComplete: (score: number) => void;
  onHudUpdate?: (payload: MiniGameHudState) => void;
};

export function MyGameView({ onComplete, onHudUpdate }: MyGameViewProps) {
  useEffect(() => {
    onHudUpdate?.({
      metrics: [
        { label: "Correct", value: "3", icon: "score", tone: "success" },
        { label: "Accuracy", value: "92%", icon: "accuracy", tone: "success" },
      ],
    });
  }, [onHudUpdate]);

  return (
    <div>
      {/* ... */}
      <MiniGameButton variant="primary" onClick={() => onComplete(120)}>
        Finish
      </MiniGameButton>
      <MiniGameFeedbackOverlay show success message="Great job" />
      <MiniGameResults
        score={120}
        accuracy={92}
        correctAnswers={3}
        totalAnswers={4}
        passed
        passingScore={70}
        title="Mission Complete"
      />
    </div>
  );
}
```

#### `index.ts` - Экспорты

```typescript
export * from "./types";
export * from "./data";
export * from "./engine";
export { MyGameView } from "./view";
```

### 3. Добавить в типы

В `src/lib/mini-games/types.ts`:

```typescript
export type MiniGameMode = "captcha" | "astronaut-selection" | "my-new-game";

export type MyNewGameConfig = {
  mode: "my-new-game";
  // ...
};

export type GameConfig = CaptchaGameConfig | AstronautSelectionGameConfig | MyNewGameConfig;
```

### 4. Добавить в каталог

В `src/lib/mini-games/catalog.ts`:

```typescript
const buildMyNewGameDefinition = (): MiniGameDefinition => {
  return {
    id: "my-new-game",
    title: "My New Game",
    synopsis: "Description",
    // ...
  };
};

const registry: MiniGameRegistry = {
  "my-new-game": buildMyNewGameDefinition(),
  // ...
};
```

### 5. Добавить роутинг

В `src/app/components/mini-game-play.tsx`:

```typescript
if (session.definition.config.mode === "my-new-game") {
  return (
    <div className="flex h-full flex-col">
      <MyGameView onComplete={handleGameComplete} />
    </div>
  );
}
```

## 🎨 Библиотека компонентов

### Обязательно использовать для всех игр:

- **`<MiniGameHeader>`** - хедер с названием, таймером, прогрессом
- **`<MiniGameButton>`** - кнопки с единым стилем
- **`<MiniGameActionButtons>`** - APPROVE/REJECT кнопки
- **`<MiniGameFeedbackOverlay>`** - оверлей с результатом (зеленый/красный)
- **`<MiniGameResults>`** - финальный экран с результатами

### Все компоненты:

- Используют `useThemeColors()` для цветов
- Имеют единый стиль и анимации
- Адаптивны для мобильных
- Поддерживают вибрацию через Telegram WebApp

## ⚡ Core Utilities

### `MiniGameEngine`

Базовый класс для всех игр:

- Управление очками
- Подсчет прогресса
- Вибрация
- Обратная связь

### Утилиты из `core/utils.ts`:

- `triggerHapticFeedback()` - вибрация
- `shuffleArray()` - перемешать массив
- `selectRandom()` - выбрать N случайных
- `delay()` - задержка
- `formatTime()` - форматирование времени
- `formatPercent()` - форматирование процентов

## 🎯 Правила разработки

1. **Одна структура для всех игр** - все игры имеют одинаковую структуру файлов
2. **Общие компоненты** - используй только компоненты из библиотеки
3. **Никаких комментариев в коде** - код должен быть самодокументируемым
4. **Единый стиль** - все игры выглядят одинаково
5. **Вибрация и фидбек** - используй `triggerHapticFeedback()`
6. **Подсветка хедера** - хедер меняет цвет при success/failure

## 📝 Пример: Astronaut Selection

Смотри `src/lib/mini-games/games/astronaut-selection/` как reference implementation.

Это игра в стиле Papers, Please где игрок проверяет кандидатов по правилам миссии.
