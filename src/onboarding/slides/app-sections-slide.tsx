"use client";

import {
  GameController,
  House,
  Planet,
  RocketLaunch,
  Trophy,
  User,
} from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/src/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function AppSectionsSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  const tabs = [
    { icon: House, label: "Home", active: true },
    { icon: Planet, label: "Farm", active: false },
    { icon: GameController, label: "Games", active: false },
    { icon: Trophy, label: "Top", active: false },
    { icon: User, label: "Profile", active: false },
  ];

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col justify-center">
        {/* Navigation Bar Example */}
        <div className="mb-6 flex flex-col items-center gap-4">
          {/* Mock Screen Content */}
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl"
            style={{
              background: colors.panel,
              border: `1px solid ${colors.lineSubtle}`,
            }}
          >
            {/* Header */}
            <div
              className="border-b px-4 py-3"
              style={{
                borderColor: colors.lineSubtle,
              }}
            >
              <div className="flex items-center gap-2">
                <RocketLaunch size={20} weight="fill" style={{ color: colors.accent }} />
                <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Satellite Mission Control
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-2 p-4">
              <div className="h-3 w-3/4 rounded-full" style={{ background: colors.panelMuted }} />
              <div className="h-3 w-1/2 rounded-full" style={{ background: colors.panelMuted }} />
              <div className="mt-3 h-20 rounded-xl" style={{ background: colors.panelMuted }} />
            </div>

            {/* Bottom Navigation Bar */}
            <div
              className="flex items-center justify-around border-t px-2 py-2"
              style={{
                borderColor: colors.lineSubtle,
                background: colors.canvas,
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    className="flex flex-col items-center gap-1 rounded-xl px-3 py-2"
                    style={{
                      background: tab.active ? colors.accent + "15" : "transparent",
                      color: tab.active ? colors.accent : colors.textMuted,
                    }}
                  >
                    <Icon size={20} weight={tab.active ? "fill" : "regular"} />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="grid w-full max-w-sm grid-cols-3 gap-2">
            <div
              className="rounded-xl p-2 text-center"
              style={{
                background: colors.panelMuted,
                border: `1px solid ${colors.lineSubtle}`,
              }}
            >
              <div className="mb-1 text-xl">🏠</div>
              <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Dashboard
              </div>
            </div>
            <div
              className="rounded-xl p-2 text-center"
              style={{
                background: colors.panelMuted,
                border: `1px solid ${colors.lineSubtle}`,
              }}
            >
              <div className="mb-1 text-xl">⚡</div>
              <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Quick Stats
              </div>
            </div>
            <div
              className="rounded-xl p-2 text-center"
              style={{
                background: colors.panelMuted,
                border: `1px solid ${colors.lineSubtle}`,
              }}
            >
              <div className="mb-1 text-xl">🎯</div>
              <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                All Tabs
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: colors.textPrimary }}>
            Everything in reach
          </h2>
          <p
            className="mx-auto max-w-md text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Navigate between sections with the bottom bar. All features are just one tap away.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
