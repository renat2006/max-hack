"use client";

import { memo, useMemo } from "react";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { Card } from "@/lib/ui/card";
import { useThemeColors } from "@/lib/max/use-theme-colors";
import type { PersonTraits } from "./types";
import { generateAvatarUrl } from "./avatar-generator";

interface CandidateProfileCardProps {
  candidate: PersonTraits;
  candidateIndex: number;
  totalCandidates: number;
  importantFields: string[];
  showHint: boolean;
  showFeedback: boolean;
  lastDecisionCorrect: boolean;
}

interface CandidateAttribute {
  key: string;
  label: string;
  icon: string;
  value: string;
  priority: number;
}

const SUCCESS_GRADIENT =
  "linear-gradient(135deg, rgba(72, 224, 181, 0.92) 0%, rgba(46, 183, 164, 0.78) 100%)";
const DANGER_GRADIENT =
  "linear-gradient(135deg, rgba(255, 122, 154, 0.95) 0%, rgba(214, 72, 118, 0.82) 100%)";

export const CandidateProfileCard = memo(({
  candidate,
  candidateIndex,
  totalCandidates,
  importantFields,
  showHint,
  showFeedback,
  lastDecisionCorrect,
}: CandidateProfileCardProps) => {
  const colors = useThemeColors();

  const avatarUrl = useMemo(() => generateAvatarUrl(candidate), [candidate]);

  // Выбираем только 4 ключевых атрибута (БЕЗ цвета волос - видно на аватаре)
  const keyAttributes = useMemo<CandidateAttribute[]>(() => {
    const allAttributes: CandidateAttribute[] = [
      { key: "age", label: "Возраст", icon: "⏱", value: `${candidate.age}`, priority: 10 },
      {
        key: "profession",
        label: "Роль",
        icon: "◆",
        value: formatToken(candidate.profession),
        priority: 9,
      },
      {
        key: "education",
        label: "Образование",
        icon: "■",
        value: formatToken(candidate.education),
        priority: 8,
      },
      {
        key: "experience",
        label: "Опыт",
        icon: "★",
        value: `${candidate.experience} лет`,
        priority: 7,
      },
      {
        key: "citizenship",
        label: "Происхождение",
        icon: "●",
        value: formatCountry(candidate.citizenship),
        priority: 6,
      },
      {
        key: "languages",
        label: "Языки",
        icon: "▲",
        value: `${candidate.languages} языков`,
        priority: 5,
      },
      { key: "height", label: "Рост", icon: "↕", value: `${candidate.height} см`, priority: 4 },
      {
        key: "hasGlasses",
        label: "Очки",
        icon: "○",
        value: candidate.hasGlasses ? "Да" : "Нет",
        priority: 2,
      },
      {
        key: "hasTattoos",
        label: "Татуировки",
        icon: "◈",
        value: candidate.hasTattoos ? "Да" : "Нет",
        priority: 1,
      },
      // gender убран - определяется только по аватару!
    ];

    const importantSet = new Set(importantFields);

    return allAttributes
      .map((attribute) => ({
        ...attribute,
        priority: attribute.priority + (importantSet.has(attribute.key) ? 30 : 0),
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4); // ТОЛЬКО 4 атрибута!
  }, [candidate, importantFields]);

  return (
    <Card variant="compact" className="flex flex-1 flex-col !p-0">
      {/* Header с индикатором - ФИКСИРОВАННАЯ ВЫСОТА */}
      <div
        className="flex items-center justify-center border-b px-3 py-2"
        style={{
          borderColor: colors.lineSubtle,
          minHeight: "40px", // Уменьшена высота для маленьких экранов
        }}
      >
        <span className="text-[11px] font-semibold" style={{ color: colors.textMuted }}>
          {totalCandidates === -1
            ? `Кандидат #${candidateIndex + 1}`
            : `Кандидат ${candidateIndex + 1} / ${totalCandidates}`}
        </span>
        {/* Индикатор всегда занимает место, но видим только при feedback */}
        <div
          className="ml-2 flex h-6 w-6 items-center justify-center rounded-full transition-opacity"
          style={{
            opacity: showFeedback ? 1 : 0, // Невидим но место занимает
            background: lastDecisionCorrect
              ? "rgba(72, 224, 181, 0.2)"
              : "rgba(255, 122, 154, 0.2)",
            color: lastDecisionCorrect ? "#48e0b5" : "#ff7a9a",
          }}
        >
          {lastDecisionCorrect ? (
            <CheckCircle size={14} weight="fill" />
          ) : (
            <XCircle size={14} weight="fill" />
          )}
        </div>
      </div>

      {/* БОЛЬШОЙ АВАТАР в центре */}
      <div className="flex flex-shrink-0 flex-col items-center gap-1.5 min-[390px]:gap-2 sm:gap-2 px-4 pt-2 pb-1.5 min-[390px]:pt-2.5 min-[390px]:pb-2 sm:pt-3 sm:pb-2">
        <div
          className="relative h-16 w-16 min-[390px]:h-20 min-[390px]:w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl"
          style={{
            background: colors.panelMuted,
            border: `2px solid ${colors.lineSubtle}`,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Image
            src={avatarUrl}
            alt={candidate.name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </div>

        {/* ИМЯ под аватаром - КОМПАКТНО */}
        <h2
          className="text-center font-bold leading-tight"
          style={{
            color: colors.textPrimary,
            fontSize:
              candidate.name.length > 20
                ? "0.75rem"
                : candidate.name.length > 15
                  ? "0.8rem"
                  : "0.875rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "95%",
          }}
        >
          {candidate.name}
        </h2>
      </div>

      {/* 4 КЛЮЧЕВЫХ АТРИБУТА - КОМПАКТНЫЕ с ЦВЕТОВОЙ АССОЦИАЦИЕЙ */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-1.5 min-[390px]:gap-2 sm:gap-2.5 px-2.5 min-[390px]:px-3 sm:px-4 pb-2.5 min-[390px]:pb-3 sm:pb-3">
        {keyAttributes.map((attribute) => {
          const shouldHighlight = showHint && importantFields.includes(attribute.key);

          // ЦВЕТОВАЯ АССОЦИАЦИЯ для каждого типа данных
          const getAttributeColor = () => {
            if (shouldHighlight) return colors.accent;

            switch (attribute.key) {
              case "age":
                return "#f59e0b"; // Желтый - время
              case "profession":
              case "education":
                return "#3b82f6"; // Синий - профессия/образование
              case "experience":
                return "#8b5cf6"; // Фиолетовый - опыт
              case "citizenship":
                return "#06b6d4"; // Голубой - страна
              case "languages":
                return "#10b981"; // Зеленый - языки
              case "height":
                return "#ec4899"; // Розовый - физические данные
              case "hasGlasses":
              case "hasTattoos":
                return "#ef4444"; // Красный - особые признаки
              default:
                return colors.textMuted;
            }
          };

          const attributeColor = getAttributeColor();

          return (
            <div
              key={attribute.key}
              className="flex items-center gap-1 min-[390px]:gap-1.5 sm:gap-2 rounded-lg border px-1.5 min-[390px]:px-2 sm:px-2.5 py-1 min-[390px]:py-1.5 sm:py-2 transition-all"
              style={{
                background: shouldHighlight
                  ? "linear-gradient(135deg, rgba(97, 247, 255, 0.18) 0%, rgba(72, 224, 181, 0.12) 100%)"
                  : colors.panelMuted,
                borderColor: shouldHighlight ? colors.accent : colors.lineSubtle,
                borderWidth: shouldHighlight ? "2px" : "1px",
                boxShadow: shouldHighlight
                  ? `0 0 16px ${colors.accent}35, inset 0 0 20px ${colors.accent}15`
                  : "none",
              }}
            >
              {/* ИКОНКА слева - КРУПНАЯ и ЦВЕТНАЯ */}
              <span
                className="flex-shrink-0 text-sm min-[390px]:text-base sm:text-lg"
                style={{
                  color: attributeColor,
                  filter: shouldHighlight ? `drop-shadow(0 0 8px ${attributeColor}80)` : "none",
                }}
              >
                {attribute.icon}
              </span>

              <div className="flex flex-col overflow-hidden">
                {/* LABEL - микро-размер */}
                <span
                  className="text-[6px] min-[390px]:text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider leading-tight"
                  style={{
                    color: colors.textMuted,
                    opacity: 0.65,
                  }}
                >
                  {attribute.label}
                </span>

                {/* VALUE - средний размер, контрастный */}
                <span
                  className="text-[11px] min-[390px]:text-xs sm:text-sm font-extrabold leading-tight truncate"
                  style={{
                    color: shouldHighlight ? colors.accent : colors.textPrimary,
                    textShadow: shouldHighlight ? `0 0 10px ${colors.accent}50` : "none",
                  }}
                >
                  {attribute.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

CandidateProfileCard.displayName = "CandidateProfileCard";

interface DecisionBarProps {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export function DecisionBar({ onApprove, onReject, disabled = false }: DecisionBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        className="group relative flex h-12 min-[390px]:h-13 sm:h-14 items-center justify-center gap-1.5 min-[390px]:gap-2 sm:gap-2 overflow-hidden rounded-2xl border text-xs min-[390px]:text-[13px] sm:text-sm font-semibold uppercase tracking-[0.15em] min-[390px]:tracking-[0.18em] sm:tracking-[0.2em] transition-all duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        style={{
          borderColor: "rgba(255, 122, 154, 0.45)",
          background: DANGER_GRADIENT,
          color: "white",
          boxShadow: "0 24px 48px -20px rgba(255, 122, 154, 0.55)",
        }}
      >
        <span className="flex items-center gap-1.5 min-[390px]:gap-2 sm:gap-2">
          <XCircle size={16} weight="fill" className="flex-shrink-0 min-[390px]:hidden" />
          <XCircle
            size={18}
            weight="fill"
            className="hidden min-[390px]:block sm:hidden flex-shrink-0"
          />
          <XCircle size={20} weight="fill" className="hidden sm:block flex-shrink-0" />
          Отклонить
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-150 group-hover:opacity-80 group-active:opacity-90"
          style={{
            background:
              "linear-gradient(120deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0))",
          }}
        />
      </button>

      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        className="group relative flex h-12 min-[390px]:h-13 sm:h-14 items-center justify-center gap-1.5 min-[390px]:gap-2 sm:gap-2 overflow-hidden rounded-2xl border text-xs min-[390px]:text-[13px] sm:text-sm font-semibold uppercase tracking-[0.15em] min-[390px]:tracking-[0.18em] sm:tracking-[0.2em] transition-all duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        style={{
          borderColor: "rgba(72, 224, 181, 0.5)",
          background: SUCCESS_GRADIENT,
          color: "#04101c",
          boxShadow: "0 24px 48px -20px rgba(72, 224, 181, 0.55)",
        }}
      >
        <span className="flex items-center gap-1.5 min-[390px]:gap-2 sm:gap-2">
          <CheckCircle size={16} weight="fill" className="flex-shrink-0 min-[390px]:hidden" />
          <CheckCircle
            size={18}
            weight="fill"
            className="hidden min-[390px]:block sm:hidden flex-shrink-0"
          />
          <CheckCircle size={20} weight="fill" className="hidden sm:block flex-shrink-0" />
          Одобрить
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-150 group-hover:opacity-85 group-active:opacity-95"
          style={{
            background:
              "linear-gradient(110deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0))",
          }}
        />
      </button>
    </div>
  );
}

function formatToken(token: string) {
  return token
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCountry(code: PersonTraits["citizenship"]) {
  const map: Record<PersonTraits["citizenship"], string> = {
    usa: "США",
    russia: "Россия",
    china: "Китай",
    europe: "ЕКА",
    india: "Индия",
    japan: "Япония",
  };

  return map[code] ?? formatToken(code);
}
