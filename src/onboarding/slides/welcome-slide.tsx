"use client";

import Image from "next/image";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/lib/max/use-theme-colors";

import { SlideFrame } from "../components/slide-frame";
import type { OnboardingSlideProps } from "../types";

export function WelcomeSlide({ isActive, direction }: OnboardingSlideProps) {
  const colors = useThemeColors();

  return (
    <SlideFrame isActive={isActive} direction={direction}>
      <div className="flex h-full flex-col">
        {/* Hero Image */}
        <div className="relative mb-6 flex flex-1 items-center justify-center">
          <div className="relative h-64 w-64 sm:h-80 sm:w-80">
            <Image
              src="/3d-objects/rocket.webp"
              alt="Space station"
              fill
              priority
              className="object-contain"
              sizes="320px"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-center">
          <div>
            <h1
              className="mb-2 text-3xl font-bold sm:text-4xl"
              style={{ color: colors.textPrimary }}
            >
              Welcome to Satellite
            </h1>
            <p
              className="text-base leading-relaxed sm:text-lg"
              style={{ color: colors.textSecondary }}
            >
              Your orbital mission control center
            </p>
          </div>

          <div
            className="mx-auto max-w-sm space-y-3 rounded-2xl p-4"
            style={{
              background: colors.panelMuted,
              border: `1px solid ${colors.lineSubtle}`,
            }}
          >
            {[
              "Build & upgrade your solar station",
              "Complete quick space missions",
              "Compete on the global leaderboard",
            ].map((text) => (
              <div key={text} className="flex items-start gap-3">
                <CheckCircle
                  size={20}
                  weight="fill"
                  style={{ color: colors.accent, flexShrink: 0, marginTop: 2 }}
                />
                <span
                  className="text-left text-sm sm:text-base"
                  style={{ color: colors.textPrimary }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
