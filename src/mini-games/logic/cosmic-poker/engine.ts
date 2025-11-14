import { CONSTELLATIONS } from "./constants";
import type { GameState, GameSummary, MemoryCard } from "./types";

// Константы игры Memory
const INITIAL_TIME = 120; // 2 минуты
const TIME_BONUS_MATCH = 5; // +5 сек за правильную пару
const TIME_PENALTY_WRONG = 3; // -3 сек за неправильную пару

// Сбалансированная система очков
// Базовые очки за пару: 50 (было 100)
// Комбо множитель: 1.2 (было 1.5) - более умеренный рост
// Целевое значение: 400-800 очков за полную игру (2-5 пар)
const SCORE_PER_MATCH = 50;
const COMBO_MULTIPLIER = 1.2; // x1.2 за каждое следующее совпадение в комбо

// Генератор уровней: случайное количество пар от 2 до 5 с приоритетом на 3 и 4
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getLevelConfig = (_level: number): { pairs: number; gridCols: number } => {
  // Взвешенная случайность: 3 и 4 пары выпадают чаще
  // 2 пары: 15%, 3 пары: 35%, 4 пары: 35%, 5 пар: 15%
  const random = Math.random();
  let pairs: number;

  if (random < 0.15) {
    pairs = 2; // 15%
  } else if (random < 0.5) {
    pairs = 3; // 35%
  } else if (random < 0.85) {
    pairs = 4; // 35%
  } else {
    pairs = 5; // 15%
  }

  // Определяем количество колонок в зависимости от количества пар
  let gridCols: number;
  if (pairs === 2) {
    gridCols = 2; // 2x2 (4 карты)
  } else if (pairs === 3) {
    gridCols = 2; // 2x3 (6 карт)
  } else if (pairs === 4) {
    gridCols = 2; // 2x4 (8 карт) - 4 ряда
  } else {
    // pairs === 5
    gridCols = 4; // 4x3 (12 карт, используется 10) - 3 ряда
  }

  return { pairs, gridCols };
};

// Создание карт для Memory игры с заданным количеством пар
export const createMemoryCards = (pairsCount: number): MemoryCard[] => {
  // Перемешиваем все созвездия
  const shuffledConstellations = [...CONSTELLATIONS].sort(() => Math.random() - 0.5);

  // Если нужно больше пар, чем доступно созвездий, повторяем созвездия
  const selectedConstellations: typeof CONSTELLATIONS = [];
  for (let i = 0; i < pairsCount; i++) {
    selectedConstellations.push(shuffledConstellations[i % shuffledConstellations.length]);
  }

  // Перемешиваем еще раз, чтобы одинаковые созвездия не шли подряд
  const finalConstellations = selectedConstellations.sort(() => Math.random() - 0.5);

  // Счетчик повторений для каждого созвездия
  const constellationCounters = new Map<string, number>();

  const cards: MemoryCard[] = [];
  let id = 0;

  // Создаем по 2 карты каждого созвездия
  finalConstellations.forEach((constellation, index) => {
    // Получаем номер повторения для этого созвездия
    const currentCount = constellationCounters.get(constellation.id) || 0;
    constellationCounters.set(constellation.id, currentCount + 1);

    // Используем уникальный pairId для каждого повторения созвездия
    const uniquePairId =
      currentCount === 0 ? constellation.id : `${constellation.id}-${currentCount}`;

    for (let i = 0; i < 2; i++) {
      cards.push({
        id: `${constellation.id}-${index}-${i}`,
        uniqueId: id++,
        pairId: uniquePairId, // Используем уникальный pairId для каждой пары
        constellationId: constellation.id,
        constellationName: constellation.name,
        constellationAlias: constellation.alias,
        accent: constellation.accent,
        gradient: constellation.gradient,
        aura: constellation.aura,
        quadrant: constellation.quadrant,
        isFlipped: false,
        isMatched: false,
      });
    }
  });

  return shuffleCards(cards);
};

// Тасование карт
export const shuffleCards = (cards: MemoryCard[]): MemoryCard[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Создание начального состояния для уровня
export const createInitialState = (level: number = 1): GameState => {
  const { pairs } = getLevelConfig(level);
  const cards = createMemoryCards(pairs);

  // В начале открываем все карты на короткое время для запоминания
  const cardsWithInitialFlip = cards.map((card) => ({
    ...card,
    isFlipped: true,
  }));

  return {
    cards: cardsWithInitialFlip,
    flippedCards: [],
    matchedPairs: 0,
    score: 0,
    combo: 0,
    timeRemaining: INITIAL_TIME,
    totalAttempts: 0,
    wrongAttempts: 0,
    isProcessing: false,
    gameOver: false,
    showInitialCards: true,
    level,
    pairsInLevel: pairs,
    levelComplete: false,
  };
};

// Создание следующего уровня
export const createNextLevel = (currentState: GameState): GameState => {
  const nextLevel = currentState.level + 1;
  const { pairs } = getLevelConfig(nextLevel);
  const cards = createMemoryCards(pairs);

  const cardsWithInitialFlip = cards.map((card) => ({
    ...card,
    isFlipped: true,
  }));

  return {
    ...currentState,
    cards: cardsWithInitialFlip,
    flippedCards: [],
    matchedPairs: 0,
    combo: 0, // Сброс комбо при переходе на новый уровень
    level: nextLevel,
    pairsInLevel: pairs,
    levelComplete: false,
    showInitialCards: true,
    isProcessing: false,
  };
};

// Переворот карты
export const flipCard = (state: GameState, cardId: number): GameState => {
  // Нельзя переворачивать во время обработки или если игра окончена
  if (state.isProcessing || state.gameOver || state.showInitialCards) {
    return state;
  }

  const card = state.cards.find((c) => c.uniqueId === cardId);

  // Нельзя переворачивать уже совпавшую или уже перевернутую карту
  if (!card || card.isMatched || card.isFlipped) {
    return state;
  }

  // Нельзя переворачивать больше 2 карт
  if (state.flippedCards.length >= 2) {
    return state;
  }

  const newCards = state.cards.map((c) => (c.uniqueId === cardId ? { ...c, isFlipped: true } : c));

  const newFlippedCards = [...state.flippedCards, cardId];

  return {
    ...state,
    cards: newCards,
    flippedCards: newFlippedCards,
  };
};

// Проверка совпадения двух карт
export const checkMatch = (state: GameState): GameState => {
  if (state.flippedCards.length !== 2) {
    return state;
  }

  const [firstId, secondId] = state.flippedCards;
  const firstCard = state.cards.find((c) => c.uniqueId === firstId);
  const secondCard = state.cards.find((c) => c.uniqueId === secondId);

  if (!firstCard || !secondCard) {
    return state;
  }

  const isMatch = firstCard.pairId === secondCard.pairId;
  const newTotalAttempts = state.totalAttempts + 1;

  if (isMatch) {
    // Правильная пара!
    const newCombo = state.combo + 1;
    const comboMultiplier = Math.pow(COMBO_MULTIPLIER, newCombo - 1);
    const scoreGain = Math.round(SCORE_PER_MATCH * comboMultiplier);
    const newMatchedPairs = state.matchedPairs + 1;
    const newTimeRemaining = state.timeRemaining + TIME_BONUS_MATCH; // +5 сек за правильную пару

    const newCards = state.cards.map((c) =>
      c.uniqueId === firstId || c.uniqueId === secondId ? { ...c, isMatched: true } : c,
    );

    // Проверка на завершение уровня (все пары найдены)
    const levelComplete = newMatchedPairs === state.pairsInLevel;

    return {
      ...state,
      cards: newCards,
      flippedCards: [],
      matchedPairs: newMatchedPairs,
      score: state.score + scoreGain,
      combo: newCombo,
      timeRemaining: newTimeRemaining,
      totalAttempts: newTotalAttempts,
      isProcessing: false,
      levelComplete,
      // Игра не заканчивается, только уровень завершается
    };
  } else {
    // Неправильная пара
    const newTimeRemaining = Math.max(0, state.timeRemaining - TIME_PENALTY_WRONG);
    const newWrongAttempts = state.wrongAttempts + 1;

    // Карты нужно перевернуть обратно через задержку
    return {
      ...state,
      timeRemaining: newTimeRemaining,
      totalAttempts: newTotalAttempts,
      wrongAttempts: newWrongAttempts,
      combo: 0, // Сброс комбо
      isProcessing: true, // Блокируем действия на время показа
    };
  }
};

// Переворот карт обратно после неудачной попытки
export const resetFlippedCards = (state: GameState): GameState => {
  const newCards = state.cards.map((c) =>
    state.flippedCards.includes(c.uniqueId) && !c.isMatched ? { ...c, isFlipped: false } : c,
  );

  return {
    ...state,
    cards: newCards,
    flippedCards: [],
    isProcessing: false,
  };
};

// Скрытие начальных карт после показа
export const hideInitialCards = (state: GameState): GameState => {
  const newCards = state.cards.map((c) => ({
    ...c,
    isFlipped: c.isMatched,
  }));

  return {
    ...state,
    cards: newCards,
    showInitialCards: false,
  };
};

// Обновление таймера
export const updateTimer = (state: GameState, delta: number): GameState => {
  if (state.showInitialCards) {
    return state; // Таймер не идет пока показываются начальные карты
  }

  const newTime = Math.max(0, state.timeRemaining - delta);
  const gameOver = newTime <= 0 && !state.gameOver;

  return {
    ...state,
    timeRemaining: newTime,
    gameOver: state.gameOver || gameOver,
  };
};

// Создание итогового отчета
export const createGameSummary = (state: GameState): GameSummary => {
  const accuracy =
    state.totalAttempts > 0
      ? Math.round(((state.totalAttempts - state.wrongAttempts) / state.totalAttempts) * 100)
      : 0;

  // Умеренный бонус за оставшееся время: 2 очка за секунду (было 10)
  // Максимальный бонус: ~240 очков (если осталось 120 секунд)
  const timeBonus = state.levelComplete ? Math.round(state.timeRemaining * 2) : 0;

  const finalScore = state.score + timeBonus;

  return {
    score: finalScore,
    totalMatches: state.matchedPairs,
    bestMatch:
      state.matchedPairs >= state.pairsInLevel
        ? "quad"
        : state.matchedPairs >= state.pairsInLevel * 0.7
          ? "triple"
          : "pair",
    accuracy,
    timeBonus,
  };
};

export { INITIAL_TIME, TIME_BONUS_MATCH, TIME_PENALTY_WRONG, SCORE_PER_MATCH };
