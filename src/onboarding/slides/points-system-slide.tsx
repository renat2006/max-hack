"use client";

import { TrendUp, Lightning, Trophy } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/lib/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function PointsSystemSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col justify-center">
        {/* Visual Example */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="relative w-full max-w-sm rounded-3xl p-6"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
              border: `2px solid ${colors.accent}40`,
            }}
          >
            <div className="mb-4 text-center">
              <div className="mb-1 text-sm font-medium" style={{ color: colors.textMuted }}>
                Your Balance
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold" style={{ color: colors.textPrimary }}>
                  1,247
                </span>
                <span className="text-2xl font-semibold" style={{ color: colors.accent }}>
                  pts
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-center gap-2 rounded-xl py-2"
              style={{
                background: colors.success + "20",
              }}
            >
              <TrendUp size={18} weight="bold" style={{ color: colors.success }} />
              <span className="text-sm font-semibold" style={{ color: colors.success }}>
                +125 today
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: colors.textPrimary }}>
            Everything adds up
          </h2>
          <p
            className="mx-auto max-w-md text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Play games, build your farm, come back daily — all activities contribute to one score.
          </p>

          <div className="mx-auto grid max-w-md gap-3 pt-2">
            {[
              { icon: Lightning, label: "Mini-games", desc: "25-50 pts per mission" },
              { icon: TrendUp, label: "Solar panels", desc: "Passive energy flow" },
              { icon: Trophy, label: "Daily streak", desc: "Bonus multipliers" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: colors.panelMuted,
                  border: `1px solid ${colors.lineSubtle}`,
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: colors.accent + "20" }}
                >
                  <item.icon size={20} weight="bold" style={{ color: colors.accent }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {item.label}
                  </div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
