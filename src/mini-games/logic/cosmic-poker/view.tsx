"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Lightning, Eye, Info, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { animated, useSpring } from "@react-spring/web";

import { useThemeColors } from "@/src/max/use-theme-colors";
import { useMax } from "@/src/max/max-context"";
import { triggerHapticFeedback } from "@/lib/mini-games/core";
import { GameRulesModal, useGameRules } from "@/lib/mini-games/components";
import { COSMIC_POKER_RULES } from "@/lib/mini-games/game-rules-configs";
import { submitProgressEvent } from "@/lib/mini-games/utils/progress";
import { getMiniGameById } from "@/lib/mini-games/catalog";
import {
  createInitialState,
  flipCard,
  checkMatch,
  resetFlippedCards,
  hideInitialCards,
  updateTimer,
  createGameSummary,
  createNextLevel,
  INITIAL_TIME,
} from "./engine";
import type { GameState, GameSummary, MemoryCard } from "./types";
import type { MiniGameHudState } from "@/lib/mini-games/types";

interface CosmicPokerViewProps {
  onComplete: (summary: GameSummary) => void;
  onHudUpdate?: (hud: MiniGameHudState | null) => void;
  onExit?: () => void;
}

// ===================================================================
// Helpers

// Правильные паттерны созвездий для узнаваемости
function getConstellationPattern(
  constellationId: string,
): Array<{ left: number; top: number; size: number; opacity: number }> {
  switch (constellationId) {
    case "orion-forge": {
      // Орион - характерный пояс из 3 звезд по диагонали, плечи, ноги
      return [
        { left: 45, top: 25, size: 5, opacity: 1.0 }, // Бетельгейзе (левое плечо)
        { left: 55, top: 25, size: 4, opacity: 0.9 }, // Правое плечо
        { left: 40, top: 50, size: 6, opacity: 1.0 }, // Пояс 1 (Альнитак)
        { left: 50, top: 52, size: 5, opacity: 1.0 }, // Пояс 2 (Альнилам)
        { left: 60, top: 54, size: 5, opacity: 1.0 }, // Пояс 3 (Минтака)
        { left: 45, top: 70, size: 4, opacity: 0.8 }, // Левая нога
        { left: 55, top: 72, size: 4, opacity: 0.8 }, // Правая нога
        { left: 30, top: 30, size: 3, opacity: 0.7 }, // Левая рука
        { left: 70, top: 30, size: 3, opacity: 0.7 }, // Правая рука
      ];
    }
    case "lyra-symphony": {
      // Лира - характерный ромб с Вегой в центре
      return [
        { left: 50, top: 35, size: 6, opacity: 1.0 }, // Вега (яркая центральная)
        { left: 45, top: 25, size: 4, opacity: 0.9 }, // Верх левый (ε Лиры)
        { left: 55, top: 25, size: 4, opacity: 0.9 }, // Верх правый (ζ Лиры)
        { left: 45, top: 45, size: 4, opacity: 0.8 }, // Низ левый (δ Лиры)
        { left: 55, top: 45, size: 4, opacity: 0.8 }, // Низ правый (β Лиры)
        { left: 50, top: 15, size: 3, opacity: 0.7 }, // Верхняя звезда
        { left: 50, top: 60, size: 3, opacity: 0.7 }, // Нижняя звезда
      ];
    }
    case "draco-sentinel": {
      // Дракон - извилистая форма змеи/дракона
      return [
        { left: 25, top: 20, size: 5, opacity: 0.9 }, // Голова (Этамин)
        { left: 35, top: 28, size: 4, opacity: 0.8 }, // Шея
        { left: 45, top: 35, size: 4, opacity: 0.8 }, // Тело 1
        { left: 55, top: 42, size: 4, opacity: 0.8 }, // Тело 2
        { left: 65, top: 48, size: 4, opacity: 0.8 }, // Тело 3
        { left: 70, top: 58, size: 4, opacity: 0.7 }, // Хвост 1
        { left: 65, top: 68, size: 3, opacity: 0.7 }, // Хвост 2
        { left: 60, top: 72, size: 3, opacity: 0.6 }, // Конец хвоста
      ];
    }
    case "phoenix-ascent": {
      // Феникс - форма птицы с распростертыми крыльями
      return [
        { left: 50, top: 30, size: 5, opacity: 1.0 }, // Тело/грудь
        { left: 50, top: 15, size: 3, opacity: 0.8 }, // Голова
        { left: 30, top: 20, size: 4, opacity: 0.8 }, // Крыло левое верх
        { left: 70, top: 20, size: 4, opacity: 0.8 }, // Крыло правое верх
        { left: 30, top: 40, size: 4, opacity: 0.8 }, // Крыло левое низ
        { left: 70, top: 40, size: 4, opacity: 0.8 }, // Крыло правое низ
        { left: 50, top: 55, size: 4, opacity: 0.7 }, // Хвост верх
        { left: 45, top: 65, size: 3, opacity: 0.7 }, // Хвост левый
        { left: 55, top: 65, size: 3, opacity: 0.7 }, // Хвост правый
      ];
    }
    case "cassiopeia-crown": {
      // Кассиопея - форма W/М (трон)
      return [
        { left: 30, top: 30, size: 5, opacity: 1.0 },
        { left: 45, top: 20, size: 4, opacity: 0.9 },
        { left: 50, top: 35, size: 5, opacity: 1.0 },
        { left: 55, top: 20, size: 4, opacity: 0.9 },
        { left: 70, top: 30, size: 4, opacity: 0.8 },
      ];
    }
    case "ursa-major-guard": {
      // Большая Медведица - форма ковша
      return [
        { left: 30, top: 25, size: 5, opacity: 1.0 },
        { left: 45, top: 20, size: 4, opacity: 0.9 },
        { left: 60, top: 25, size: 4, opacity: 0.9 },
        { left: 70, top: 30, size: 4, opacity: 0.8 },
        { left: 35, top: 50, size: 4, opacity: 0.8 },
        { left: 50, top: 55, size: 4, opacity: 0.8 },
        { left: 65, top: 60, size: 4, opacity: 0.7 },
      ];
    }
    case "cygnus-swift": {
      // Лебедь - форма креста
      return [
        { left: 50, top: 40, size: 6, opacity: 1.0 },
        { left: 50, top: 20, size: 4, opacity: 0.9 },
        { left: 50, top: 60, size: 4, opacity: 0.9 },
        { left: 35, top: 40, size: 4, opacity: 0.8 },
        { left: 65, top: 40, size: 4, opacity: 0.8 },
      ];
    }
    case "perseus-strike": {
      // Персей - форма меча
      return [
        { left: 50, top: 20, size: 5, opacity: 1.0 },
        { left: 50, top: 35, size: 4, opacity: 0.9 },
        { left: 50, top: 50, size: 4, opacity: 0.9 },
        { left: 45, top: 65, size: 4, opacity: 0.8 },
        { left: 55, top: 65, size: 4, opacity: 0.8 },
        { left: 40, top: 30, size: 3, opacity: 0.7 },
        { left: 60, top: 30, size: 3, opacity: 0.7 },
      ];
    }
    case "andromeda-spiral": {
      // Андромеда - спиральная форма
      return [
        { left: 50, top: 30, size: 5, opacity: 1.0 },
        { left: 40, top: 25, size: 4, opacity: 0.9 },
        { left: 60, top: 25, size: 4, opacity: 0.9 },
        { left: 35, top: 45, size: 4, opacity: 0.8 },
        { left: 65, top: 45, size: 4, opacity: 0.8 },
        { left: 30, top: 60, size: 3, opacity: 0.7 },
        { left: 70, top: 60, size: 3, opacity: 0.7 },
      ];
    }
    case "scorpius-sting": {
      // Скорпион - изогнутая форма с жалом
      return [
        { left: 30, top: 20, size: 5, opacity: 1.0 },
        { left: 40, top: 30, size: 4, opacity: 0.9 },
        { left: 50, top: 40, size: 4, opacity: 0.9 },
        { left: 60, top: 50, size: 4, opacity: 0.8 },
        { left: 65, top: 60, size: 4, opacity: 0.8 },
        { left: 70, top: 70, size: 4, opacity: 0.7 },
        { left: 68, top: 75, size: 3, opacity: 0.7 },
      ];
    }
    case "sagittarius-archer": {
      // Стрелец - форма лука и стрелы
      return [
        { left: 50, top: 30, size: 5, opacity: 1.0 },
        { left: 40, top: 25, size: 4, opacity: 0.9 },
        { left: 60, top: 25, size: 4, opacity: 0.9 },
        { left: 50, top: 50, size: 4, opacity: 0.8 },
        { left: 45, top: 65, size: 4, opacity: 0.8 },
        { left: 55, top: 65, size: 4, opacity: 0.7 },
        { left: 50, top: 15, size: 3, opacity: 0.7 },
      ];
    }
    case "capricornus-gate": {
      // Козерог - форма ворот
      return [
        { left: 40, top: 30, size: 5, opacity: 1.0 },
        { left: 60, top: 30, size: 5, opacity: 1.0 },
        { left: 50, top: 45, size: 4, opacity: 0.9 },
        { left: 35, top: 50, size: 4, opacity: 0.8 },
        { left: 65, top: 50, size: 4, opacity: 0.8 },
        { left: 50, top: 60, size: 4, opacity: 0.7 },
      ];
    }
    case "aquarius-flow": {
      // Водолей - волнистая форма
      return [
        { left: 30, top: 30, size: 4, opacity: 0.9 },
        { left: 45, top: 35, size: 4, opacity: 0.9 },
        { left: 50, top: 40, size: 5, opacity: 1.0 },
        { left: 55, top: 45, size: 4, opacity: 0.9 },
        { left: 70, top: 50, size: 4, opacity: 0.8 },
        { left: 40, top: 60, size: 3, opacity: 0.7 },
        { left: 60, top: 65, size: 3, opacity: 0.7 },
      ];
    }
    case "pisces-twin": {
      // Рыбы - две связанные формы
      return [
        { left: 35, top: 30, size: 5, opacity: 1.0 },
        { left: 30, top: 45, size: 4, opacity: 0.9 },
        { left: 40, top: 50, size: 4, opacity: 0.8 },
        { left: 65, top: 30, size: 5, opacity: 1.0 },
        { left: 70, top: 45, size: 4, opacity: 0.9 },
        { left: 60, top: 50, size: 4, opacity: 0.8 },
        { left: 50, top: 40, size: 3, opacity: 0.7 },
      ];
    }
    case "taurus-bull": {
      // Телец - форма головы быка
      return [
        { left: 50, top: 30, size: 6, opacity: 1.0 },
        { left: 35, top: 25, size: 4, opacity: 0.9 },
        { left: 65, top: 25, size: 4, opacity: 0.9 },
        { left: 40, top: 45, size: 4, opacity: 0.8 },
        { left: 60, top: 45, size: 4, opacity: 0.8 },
        { left: 50, top: 60, size: 4, opacity: 0.7 },
      ];
    }
    case "gemini-twin": {
      // Близнецы - две параллельные формы
      return [
        { left: 35, top: 25, size: 5, opacity: 1.0 },
        { left: 35, top: 45, size: 4, opacity: 0.9 },
        { left: 35, top: 65, size: 4, opacity: 0.8 },
        { left: 65, top: 25, size: 5, opacity: 1.0 },
        { left: 65, top: 45, size: 4, opacity: 0.9 },
        { left: 65, top: 65, size: 4, opacity: 0.8 },
      ];
    }
    case "cancer-shell": {
      // Рак - форма краба
      return [
        { left: 50, top: 40, size: 5, opacity: 1.0 },
        { left: 35, top: 30, size: 4, opacity: 0.9 },
        { left: 65, top: 30, size: 4, opacity: 0.9 },
        { left: 30, top: 50, size: 4, opacity: 0.8 },
        { left: 70, top: 50, size: 4, opacity: 0.8 },
        { left: 40, top: 60, size: 3, opacity: 0.7 },
        { left: 60, top: 60, size: 3, opacity: 0.7 },
      ];
    }
    case "leo-king": {
      // Лев - форма головы льва
      return [
        { left: 50, top: 30, size: 6, opacity: 1.0 },
        { left: 40, top: 20, size: 4, opacity: 0.9 },
        { left: 60, top: 20, size: 4, opacity: 0.9 },
        { left: 35, top: 40, size: 4, opacity: 0.8 },
        { left: 65, top: 40, size: 4, opacity: 0.8 },
        { left: 50, top: 50, size: 4, opacity: 0.8 },
        { left: 45, top: 60, size: 3, opacity: 0.7 },
        { left: 55, top: 60, size: 3, opacity: 0.7 },
      ];
    }
    default: {
      // Fallback для неизвестных созвездий
      return [
        { left: 50, top: 40, size: 5, opacity: 0.9 },
        { left: 40, top: 30, size: 4, opacity: 0.8 },
        { left: 60, top: 30, size: 4, opacity: 0.8 },
        { left: 40, top: 50, size: 4, opacity: 0.8 },
        { left: 60, top: 50, size: 4, opacity: 0.8 },
      ];
    }
  }
}

// Карточка с анимацией переворота в стиле grid-tile
function ConstellationCard({
  card,
  onClick,
  disabled,
}: {
  card: MemoryCard;
  onClick: () => void;
  disabled: boolean;
}) {
  const colors = useThemeColors();
  const { webApp } = useMax();
  const isFaceUp = card.isFlipped || card.isMatched;
  const stars = getConstellationPattern(card.constellationId);
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Правильная логика: 0 = рубашка видна, 180 = лицо видно
  const flipSpring = useSpring({
    rotateY: isFaceUp ? 180 : 0,
    config: { mass: 4, tension: 440, friction: 55 },
  });

  const matchSpring = useSpring({
    scale: card.isMatched ? 1.02 : 1,
    config: { tension: 260, friction: 14 },
  });

  const handleClick = () => {
    if (!disabled && !card.isMatched) {
      triggerHapticFeedback(webApp ?? undefined, "light");
      onClick();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsPressed(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Если движение было больше 10px или длилось больше 200ms - это скролл, не клик
    if (distance > 10 || deltaTime > 200) {
      touchStartRef.current = null;
      return;
    }

    // Это клик, а не скролл
    touchStartRef.current = null;
    handleClick();
  };

  // Тени в стиле grid-tile
  const getCardShadow = () => {
    if (card.isMatched) {
      return `0 0 24px rgba(72, 224, 181, 0.5), inset 0 0 0 2px ${colors.success}, inset 0 2px 8px rgba(72, 224, 181, 0.3)`;
    }
    if (isFaceUp && !card.isMatched) {
      return `0 0 20px rgba(97, 247, 255, 0.4), inset 0 0 0 2px rgba(97, 247, 255, 0.3), inset 0 2px 10px rgba(97, 247, 255, 0.15)`;
    }
    return `inset 0 0 0 1.5px rgba(97, 247, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.3)`;
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || card.isMatched}
      className="group relative aspect-[3/4] w-full transition-all duration-200 ease-out active:scale-95 disabled:cursor-not-allowed"
      style={{ perspective: "1200px" }}
    >
      <animated.div
        style={{
          transform: flipSpring.rotateY.to((deg) => `perspective(1200px) rotateY(${deg}deg)`),
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-0"
      >
        {/* Рубашка - сочная и аппетитная */}
        <div
          className="absolute inset-0 rounded-[16px]"
          style={{
            transform: "rotateY(0deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[16px] transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${colors.panelMuted}, ${colors.panel})`,
              boxShadow: getCardShadow(),
              transform: isPressed ? "scale(0.98)" : "scale(1)",
            }}
          >
            {/* Яркий градиентный фон */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colors.accent}30, transparent 60%), 
                            radial-gradient(circle at 70% 70%, ${colors.accent}20, transparent 50%)`,
              }}
            />

            {/* Паттерн звезд на рубашке - более яркий */}
            {[...Array(16)].map((_, i) => {
              const size = 2 + (i % 3);
              const opacity = 0.4 + (i % 4) * 0.15;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `${8 + ((i * 7) % 84)}%`,
                    left: `${12 + ((i * 23) % 76)}%`,
                    background: colors.accent,
                    opacity,
                    boxShadow: `0 0 ${size * 2}px ${colors.accent}, 0 0 ${size * 4}px ${colors.accent}80`,
                  }}
                />
              );
            })}

            {/* Центральная иконка с ярким свечением */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all relative"
                style={{
                  background: `radial-gradient(circle, ${colors.accent}40, ${colors.accent}20, transparent)`,
                  boxShadow: `0 0 20px ${colors.accent}60, 0 0 40px ${colors.accent}40, inset 0 0 20px ${colors.accent}20`,
                }}
              >
                <Eye
                  size={24}
                  weight="fill"
                  style={{
                    color: colors.accent,
                    filter: `drop-shadow(0 0 8px ${colors.accent})`,
                  }}
                />
              </div>
            </div>

            {/* Дополнительное свечение по краям */}
            <div
              className="absolute inset-0 rounded-[16px] pointer-events-none"
              style={{
                boxShadow: `inset 0 0 0 1.5px rgba(97, 247, 255, 0.3), 
                           inset 0 2px 4px rgba(255,255,255,0.1)`,
              }}
            />
          </div>
        </div>

        {/* Лицевая сторона с созвездием - яркая и контрастная */}
        <animated.div
          style={{
            ...matchSpring,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="absolute inset-0 rounded-[16px]"
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[16px] transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${colors.panelMuted}, ${colors.panel})`,
              boxShadow: getCardShadow(),
              transform: isPressed ? "scale(0.98)" : "scale(1)",
            }}
          >
            {/* Яркий градиентный фон с акцентом созвездия */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${card.accent}25, ${card.accent}10, transparent 70%),
                            linear-gradient(135deg, ${card.accent}15, transparent)`,
              }}
            />

            {/* Дополнительное свечение */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${card.aura}, transparent 60%)`,
              }}
            />

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-1">
              {/* Название созвездия - улучшенная читаемость */}
              <div className="mb-0.5 text-center pt-1.5 px-1">
                <div
                  className="text-[11px] sm:text-xs font-bold leading-tight"
                  style={{
                    color: card.accent,
                    textShadow: `0 2px 4px rgba(0,0,0,0.8), 0 0 8px ${card.accent}80, 0 0 12px ${card.accent}60`,
                    filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.9))`,
                  }}
                >
                  {card.constellationAlias}
                </div>
                <div
                  className="text-[9px] sm:text-[10px] font-medium mt-0.5"
                  style={{
                    color: colors.textPrimary,
                    textShadow: `0 1px 2px rgba(0,0,0,0.7)`,
                  }}
                >
                  {card.quadrant}
                </div>
              </div>

              {/* Созвездие из звезд - яркие и контрастные */}
              <div
                className="relative flex flex-1 w-full items-center justify-center"
                style={{ minHeight: 0 }}
              >
                {/* Звезды - более яркие, крупные и контрастные */}
                {stars.map((star, idx) => {
                  const starSize = Math.max(star.size * 1.2, 5);
                  return (
                    <span
                      key={idx}
                      className="absolute rounded-full"
                      style={{
                        width: `${starSize}px`,
                        height: `${starSize}px`,
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                        transform: "translate(-50%, -50%)",
                        background: card.accent,
                        opacity: Math.max(star.opacity, 0.95),
                        boxShadow: `0 0 ${starSize * 3}px ${card.accent}, 
                                   0 0 ${starSize * 5}px ${card.accent}90,
                                   0 0 ${starSize * 8}px ${card.accent}60,
                                   inset 0 0 ${starSize}px rgba(255,255,255,0.3)`,
                        border: `1.5px solid rgba(255,255,255,0.4)`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Индикатор совпадения */}
              {card.isMatched && (
                <div
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full animate-pulse"
                  style={{
                    background: colors.success,
                    boxShadow: `0 0 16px ${colors.success}80`,
                  }}
                >
                  <Lightning size={14} weight="fill" color={colors.accentText} />
                </div>
              )}
            </div>
          </div>
        </animated.div>
      </animated.div>
    </button>
  );
}

export function CosmicPokerView({ onComplete, onHudUpdate, onExit }: CosmicPokerViewProps) {
  void onExit;

  const colors = useThemeColors();
  const { webApp, user, isMock } = useMax();
  const gameDefinition = useMemo(() => getMiniGameById("constellation-memory"), []);
  const userId = user?.id;
  const username = user?.username ?? null;
  const fullName = useMemo(() => {
    if (!user) {
      return null;
    }

    const compositeName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    if (compositeName.length > 0) {
      return compositeName;
    }

    return user.username ?? null;
  }, [user]);

  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const flipBackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialCardsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const levelTransitionRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartRef = useRef<number>(Date.now());
  const runIdRef = useRef<string>(
    `constellation-run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const submittedProgressRef = useRef(false);

  const { showRules: rulesOpen, setShowRules } = useGameRules("constellation-memory");
  const openRules = () => setShowRules(true);
  const closeRules = () => setShowRules(false);

  // Обновление HUD с таймером
  useEffect(() => {
    if (!onHudUpdate) return;

    onHudUpdate({
      metrics: [
        {
          label: "Score",
          value: gameState.score.toString(),
          tone: "success" as const,
          icon: "score" as const,
        },
        {
          label: "Level",
          value: gameState.level.toString(),
          tone: "neutral" as const,
        },
        {
          label: "Pairs",
          value: `${gameState.matchedPairs}/${gameState.pairsInLevel}`,
          tone: "neutral" as const,
          icon: "combo" as const,
        },
      ],
      timer: {
        remainingSeconds: gameState.timeRemaining,
        totalSeconds: INITIAL_TIME,
      },
    });
  }, [
    gameState.score,
    gameState.matchedPairs,
    gameState.pairsInLevel,
    gameState.level,
    gameState.timeRemaining,
    onHudUpdate,
  ]);

  // Таймер
  useEffect(() => {
    if (gameState.gameOver || gameState.showInitialCards) {
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => updateTimer(prev, 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.gameOver, gameState.showInitialCards]);

  // Скрытие начальных карт через 3 секунды
  useEffect(() => {
    if (gameState.showInitialCards) {
      initialCardsTimeoutRef.current = setTimeout(() => {
        setGameState(hideInitialCards);
        triggerHapticFeedback(webApp ?? undefined, "medium");
      }, 3000);

      return () => {
        if (initialCardsTimeoutRef.current) {
          clearTimeout(initialCardsTimeoutRef.current);
        }
      };
    }
  }, [gameState.showInitialCards, webApp]);

  // Проверка совпадения при переворачивании 2-й карты
  useEffect(() => {
    if (gameState.flippedCards.length === 2 && !gameState.isProcessing) {
      const firstCard = gameState.cards.find((c) => c.uniqueId === gameState.flippedCards[0]);
      const secondCard = gameState.cards.find((c) => c.uniqueId === gameState.flippedCards[1]);

      if (firstCard && secondCard) {
        const isMatch = firstCard.pairId === secondCard.pairId;
        setGameState((prev) => ({ ...prev, isProcessing: true }));
        // Задержка перед проверкой для показа карт
        setTimeout(() => {
          setGameState((prev) => checkMatch(prev));

          if (isMatch) {
            triggerHapticFeedback(webApp ?? undefined, "success");
          } else {
            triggerHapticFeedback(webApp ?? undefined, "error");

            // Переворачиваем карты обратно через 1 секунду
            flipBackTimeoutRef.current = setTimeout(() => {
              setGameState((prev) => resetFlippedCards(prev));
            }, 1000);
          }
        }, 300);
      }
    }

    return () => {
      if (flipBackTimeoutRef.current) {
        clearTimeout(flipBackTimeoutRef.current);
      }
    };
  }, [gameState.flippedCards, gameState.cards, gameState.isProcessing, webApp]);

  // Автопереход на следующий уровень при завершении текущего
  useEffect(() => {
    if (gameState.levelComplete && !gameState.gameOver && !gameState.showInitialCards) {
      // Очищаем предыдущий таймер если есть
      if (levelTransitionRef.current) {
        clearTimeout(levelTransitionRef.current);
      }

      triggerHapticFeedback(webApp ?? undefined, "success");
      // Автопереход на следующий уровень через 1.5 секунды
      levelTransitionRef.current = setTimeout(() => {
        setGameState((prev) => createNextLevel(prev));
        triggerHapticFeedback(webApp ?? undefined, "medium");
      }, 1500);
    }

    return () => {
      if (levelTransitionRef.current) {
        clearTimeout(levelTransitionRef.current);
      }
    };
  }, [gameState.levelComplete, gameState.gameOver, gameState.showInitialCards, webApp]);

  // Сброс gameStartRef и runIdRef при рестарте игры
  useEffect(() => {
    if (gameState.level === 1 && gameState.showInitialCards && !submittedProgressRef.current) {
      gameStartRef.current = Date.now();
      runIdRef.current = `constellation-run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }, [gameState.level, gameState.showInitialCards]);

  // Завершение игры (окончание времени) + отправка прогресса в БД
  useEffect(() => {
    if (!gameState.gameOver || submittedProgressRef.current) {
      if (!gameState.gameOver) {
        submittedProgressRef.current = false;
      }
      return;
    }

    const summary = createGameSummary(gameState);
    const durationMs = Math.max(0, Date.now() - gameStartRef.current);
    const status: "success" | "error" = summary.score > 0 ? "success" : "error";
    const totalPairs = gameState.matchedPairs;
    const totalAttempts = gameState.totalAttempts;
    // Правильный подсчет accuracy: количество правильных попыток / общее количество попыток
    // totalPairs - это количество правильных пар (правильных попыток)
    // totalAttempts - это общее количество попыток (правильных + неправильных)
    const accuracyPercent =
      totalAttempts === 0 ? 0 : Math.round((totalPairs / totalAttempts) * 100);

    // Отправка прогресса в БД
    if (gameDefinition) {
      submitProgressEvent({
        userId,
        game: gameDefinition,
        challengeId: runIdRef.current,
        status,
        score: summary.score,
        selected: [],
        missing: 0,
        extra: 0,
        totalCorrect: totalPairs,
        isMock,
        sessionSummary: {
          completedChallenges: totalPairs,
          totalChallenges: totalAttempts,
          accuracyPercent,
          durationMs,
          totalScore: summary.score,
        },
        username,
        fullName,
      });
    }

    submittedProgressRef.current = true;

    // Небольшая задержка для завершения анимаций
    const timeoutId = setTimeout(() => {
      triggerHapticFeedback(webApp ?? undefined, "heavy");
      onComplete(summary);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    gameState.gameOver,
    gameState.matchedPairs,
    gameState.totalAttempts,
    gameState.score,
    onComplete,
    gameState,
    webApp,
    gameDefinition,
    userId,
    username,
    fullName,
    isMock,
  ]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (gameState.showInitialCards) {
        return;
      }
      // Haptic feedback уже в handleClick карточки
      setGameState((prev) => flipCard(prev, cardId));
    },
    [gameState.showInitialCards],
  );

  const progress = (gameState.matchedPairs / gameState.pairsInLevel) * 100;

  return (
    <div
      className="flex h-full w-full flex-col gap-1.5 p-1.5 sm:gap-2 sm:p-2"
      style={{ background: colors.canvas }}
    >
      <GameRulesModal
        gameMode="constellation-memory"
        isOpen={rulesOpen}
        onClose={closeRules}
        config={COSMIC_POKER_RULES}
      />

      {/* Top bar */}
      <div
        className="flex items-center justify-between rounded-xl p-2 sm:p-2.5 flex-shrink-0"
        style={{
          background: colors.panelMuted,
          border: `1px solid ${colors.lineSoft}`,
          boxShadow: colors.shadowSoft,
        }}
      >
        <button
          onClick={openRules}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-colors"
          style={{
            background: colors.panel,
            color: colors.textPrimary,
          }}
        >
          <Info size={16} weight="bold" />
          Rules
        </button>

        {/* Прогресс пар и уровень - увеличенный */}
        <div className="flex-1 mx-3 sm:mx-4">
          <div className="text-center mb-1.5">
            <div className="text-sm sm:text-base font-bold" style={{ color: colors.textPrimary }}>
              Level {gameState.level} • {gameState.matchedPairs} / {gameState.pairsInLevel} Pairs
            </div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: colors.panel }}>
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${colors.accent}, ${colors.success})`,
              }}
            />
          </div>
        </div>

        {/* Комбо - увеличенный */}
        {gameState.combo > 0 && (
          <div
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
            style={{
              background: colors.warning,
              color: colors.accentText,
            }}
          >
            <Lightning size={14} weight="fill" />x{gameState.combo}
          </div>
        )}
      </div>

      {/* Уведомление о завершении уровня - увеличенное */}
      {gameState.levelComplete && !gameState.showInitialCards && (
        <div
          className="rounded-xl p-2.5 text-center animate-pulse flex-shrink-0 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.success}25, transparent)`,
            border: `1px solid ${colors.success}`,
          }}
        >
          <CheckCircle size={18} weight="fill" style={{ color: colors.success }} />
          <div className="text-sm sm:text-base font-bold" style={{ color: colors.success }}>
            Level {gameState.level} Complete! → Level {gameState.level + 1}
          </div>
        </div>
      )}

      {/* Подсказка в начале - увеличенная */}
      {gameState.showInitialCards && (
        <div
          className="rounded-xl p-2.5 text-center animate-pulse flex-shrink-0 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}25, transparent)`,
            border: `1px solid ${colors.lineAccent}`,
          }}
        >
          <Eye size={18} weight="fill" style={{ color: colors.accent }} />
          <div className="text-sm sm:text-base font-bold" style={{ color: colors.textPrimary }}>
            Remember! Cards flip in 3s...
          </div>
        </div>
      )}

      {/* Сетка карт - всегда 3 колонки, фиксированный размер */}
      <div
        className="flex-1 grid content-start overflow-y-auto overflow-x-hidden p-0.5 min-h-0"
        style={{
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.375rem",
        }}
      >
        {gameState.cards.map((card) => (
          <ConstellationCard
            key={card.uniqueId}
            card={card}
            onClick={() => handleCardClick(card.uniqueId)}
            disabled={gameState.isProcessing || gameState.showInitialCards}
          />
        ))}
      </div>
    </div>
  );
}
