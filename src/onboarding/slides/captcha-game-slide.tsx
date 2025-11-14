"use client";

import Image from "next/image";

import { CheckCircle, Crosshair } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/src/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function CaptchaGameSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col justify-center">
        {/* Interactive Grid Example */}
        <div className="mb-6 flex flex-col items-center">
          <div
            className="mb-3 rounded-xl px-4 py-2 text-center text-sm font-semibold"
            style={{
              background: colors.accent + "20",
              color: colors.accent,
            }}
          >
            <Crosshair size={16} weight="bold" className="mr-1 inline" />
            Select all: SATELLITES
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { img: "/mock/mini-games/captcha/rocket.webp", selected: true },
              { img: "/mock/mini-games/captcha/aliens.webp", selected: false },
              { img: "/mock/mini-games/captcha/astronaut.webp", selected: true },
              { img: "/mock/mini-games/captcha/UFO.webp", selected: false },
              { img: "/mock/mini-games/captcha/planets.webp", selected: true },
              { img: "/mock/mini-games/captcha/kristal.webp", selected: false },
            ].map((tile, idx) => (
              <div
                key={idx}
                className="relative aspect-square w-24 overflow-hidden rounded-xl sm:w-28"
                style={{
                  background: colors.panelMuted,
                  border: tile.selected
                    ? `2px solid ${colors.accent}`
                    : `1px solid ${colors.lineSubtle}`,
                  boxShadow: tile.selected ? `0 0 12px ${colors.accent}40` : "none",
                }}
              >
                <div className="relative h-full w-full p-2">
                  <Image
                    src={tile.img}
                    alt={`Tile ${idx}`}
                    fill
                    className="object-contain"
                    sizes="120px"
                  />
                </div>
                {tile.selected && (
                  <div
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full"
                    style={{
                      background: colors.accent,
                    }}
                  >
                    <CheckCircle size={16} weight="fill" style={{ color: "#fff" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: colors.textPrimary }}>
            Tap to find satellites
          </h2>
          <p
            className="mx-auto max-w-md text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Read the prompt, select matching tiles, then hit Verify. Perfect accuracy gives bonus
            points!
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
