"use client";

import Image from "next/image";

import { Clock, Target, CheckCircle } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/src/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function MiniGamesSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col justify-center">
        {/* Visual Example */}
        <div className="mb-6 flex justify-center">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { img: "/mock/mini-games/captcha/rocket.webp", name: "Captcha" },
              { img: "/mock/mini-games/captcha/astronaut.webp", name: "Astronauts" },
            ].map((game) => (
              <div
                key={game.name}
                className="relative w-32 overflow-hidden rounded-2xl sm:w-40"
                style={{
                  background: colors.panelMuted,
                  border: `1px solid ${colors.lineSubtle}`,
                  aspectRatio: "1",
                }}
              >
                <div className="relative h-full w-full p-4">
                  <Image
                    src={game.img}
                    alt={game.name}
                    fill
                    className="object-contain"
                    sizes="160px"
                  />
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center text-xs font-semibold"
                  style={{
                    background: colors.panelActive,
                    color: colors.textPrimary,
                  }}
                >
                  {game.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: colors.textPrimary }}>
            Quick missions, big rewards
          </h2>
          <p
            className="mx-auto max-w-md text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Each game is designed to be completed in under 2 minutes. Play whenever you have a
            moment.
          </p>

          <div className="mx-auto grid max-w-sm gap-3 pt-2">
            {[
              { icon: Target, text: "Test your reflexes and memory" },
              { icon: Clock, text: "Complete in 1-2 minutes" },
              { icon: CheckCircle, text: "Earn 25-50 points per game" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl p-3 text-left"
                style={{
                  background: colors.panelMuted,
                  border: `1px solid ${colors.lineSubtle}`,
                }}
              >
                <item.icon
                  size={20}
                  weight="bold"
                  style={{ color: colors.accent, flexShrink: 0 }}
                />
                <span className="text-sm" style={{ color: colors.textPrimary }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
