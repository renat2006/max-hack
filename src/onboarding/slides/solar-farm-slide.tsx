"use client";

import Image from "next/image";

import { Lightning, TrendUp } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/src/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function SolarFarmSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  // Get panel image based on level
  const getPanelImage = (level: number) => {
    const images = [
      "/solar-panels-game/no-background----isometric-rhombus-tile--128x64px-.svg", // Level 0: Upgraded platform
      "/solar-panels-game/no-background----isometric-reinforced-concrete-til.svg", // Level 1: Empty platform
      "/solar-panels-game/no-background----isometric-advanced-solar-panel-le.svg", // Level 2: First panel
      "/solar-panels-game/no-background----isometric-advanced-solar-panel-le (1).svg", // Level 3: Second panel
    ];
    return images[level] || images[0];
  };

  // Mock panel grid levels
  const panels = [
    { level: 3, hasPanel: true },
    { level: 2, hasPanel: true },
    { level: 1, hasPanel: true },
    { level: 2, hasPanel: true },
    { level: 0, hasPanel: true }, // Level 0 panel
    { level: 1, hasPanel: true },
    { level: 3, hasPanel: true },
    { level: 1, hasPanel: true },
    { level: 0, hasPanel: false }, // Empty slot
  ];

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col justify-center gap-3 sm:gap-4">
        {/* Panel Grid Example */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Energy Stats */}
          <div
            className="flex w-full max-w-sm items-center justify-between rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
              border: `1px solid ${colors.accent}40`,
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Lightning
                size={18}
                weight="fill"
                className="sm:hidden flex-shrink-0"
                style={{ color: colors.accent }}
              />
              <Lightning
                size={20}
                weight="fill"
                className="hidden sm:block flex-shrink-0"
                style={{ color: colors.accent }}
              />
              <span
                className="text-xs sm:text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Energy Production
              </span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <span
                className="text-lg sm:text-xl font-bold tabular-nums"
                style={{ color: colors.accent }}
              >
                +42
              </span>
              <span className="text-[10px] sm:text-xs" style={{ color: colors.textMuted }}>
                pts/h
              </span>
            </div>
          </div>

          {/* 3x3 Panel Grid */}
          <div className="grid w-full max-w-[280px] sm:max-w-xs grid-cols-3 gap-1.5 sm:gap-2">
            {panels.map((panel, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-xl"
                style={{
                  background: panel.hasPanel ? colors.panel : colors.panelMuted,
                  border: `1px solid ${panel.hasPanel ? colors.accent + "60" : colors.lineSubtle}`,
                }}
              >
                {panel.hasPanel ? (
                  <>
                    {/* Panel Image */}
                    <Image
                      src={getPanelImage(panel.level)}
                      alt={`Panel level ${panel.level}`}
                      fill
                      className="object-contain opacity-80"
                      sizes="100px"
                    />
                    {/* Level Badge */}
                    <div
                      className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-bold"
                      style={{
                        background: colors.accent,
                        color: colors.canvas,
                      }}
                    >
                      L{panel.level}
                    </div>
                  </>
                ) : (
                  /* Empty Slot */
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="text-xl sm:text-2xl opacity-30"
                      style={{ color: colors.textMuted }}
                    >
                      +
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upgrade Hint */}
          <div
            className="flex w-full max-w-sm items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2"
            style={{
              background: colors.success + "15",
              border: `1px solid ${colors.success}40`,
            }}
          >
            <TrendUp
              size={14}
              weight="bold"
              className="sm:hidden flex-shrink-0"
              style={{ color: colors.success }}
            />
            <TrendUp
              size={16}
              weight="bold"
              className="hidden sm:block flex-shrink-0"
              style={{ color: colors.success }}
            />
            <span
              className="text-[11px] sm:text-xs font-medium leading-tight"
              style={{ color: colors.success }}
            >
              Upgrade panels to boost passive income
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 sm:space-y-3 text-center">
          <h2
            className="text-xl sm:text-2xl font-bold leading-tight"
            style={{ color: colors.textPrimary }}
          >
            Build your solar farm
          </h2>
          <p
            className="mx-auto max-w-md text-sm sm:text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Place panels, upgrade them to higher levels, and earn passive points even when
            you&apos;re away.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
