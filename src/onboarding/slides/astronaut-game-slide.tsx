"use client";

import Image from "next/image";

import { CheckCircle, Path, XCircle } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/lib/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function AstronautGameSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col justify-center">
        {/* Decision Tree Example */}
        <div className="mb-6 flex flex-col items-center gap-4">
          {/* Candidate Card */}
          <div
            className="flex w-full max-w-sm items-center gap-3 rounded-2xl p-4"
            style={{
              background: colors.panelMuted,
              border: `1px solid ${colors.lineSubtle}`,
            }}
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <Image
                src="/mock/mini-games/captcha/astronaut.webp"
                alt="Candidate"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1">
              <div className="mb-1 text-base font-semibold" style={{ color: colors.textPrimary }}>
                Alex Chen
              </div>
              <div className="text-xs" style={{ color: colors.textMuted }}>
                Кандидат в специалисты миссии
              </div>
            </div>
          </div>

          {/* Decision Question */}
          <div
            className="w-full max-w-sm rounded-2xl p-4"
            style={{
              background: colors.accent + "15",
              border: `1px solid ${colors.accent}40`,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Path size={18} weight="bold" style={{ color: colors.accent }} />
              <span className="text-sm font-semibold" style={{ color: colors.accent }}>
                Точка принятия решения
              </span>
            </div>
            <p className="mb-3 text-sm" style={{ color: colors.textPrimary }}>
              Имеет 5+ лет опыта полётов?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="rounded-xl px-4 py-2 text-sm font-semibold"
                style={{
                  background: colors.success + "20",
                  color: colors.success,
                  border: `1px solid ${colors.success}`,
                }}
              >
                ДА
              </button>
              <button
                className="rounded-xl px-4 py-2 text-sm font-semibold"
                style={{
                  background: colors.panelMuted,
                  color: colors.textMuted,
                  border: `1px solid ${colors.lineSubtle}`,
                }}
              >
                НЕТ
              </button>
            </div>
          </div>

          {/* Final Decision */}
          <div className="grid w-full max-w-sm grid-cols-2 gap-2">
            <button
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                background: colors.success + "20",
                color: colors.success,
                border: `2px solid ${colors.success}`,
              }}
            >
              <CheckCircle size={18} weight="fill" />
              Одобрить
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                background: colors.danger + "15",
                color: colors.danger,
                border: `1px solid ${colors.danger}40`,
              }}
            >
              <XCircle size={18} weight="fill" />
              Отклонить
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: colors.textPrimary }}>
            Примите решение
          </h2>
          <p
            className="mx-auto max-w-md text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Отвечайте на вопросы о каждом кандидате, затем одобряйте или отклоняйте их для миссии.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
