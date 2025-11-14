"use client";

import type { ReactNode } from "react";

import type { OnboardingSlideProps } from "../types";

interface SlideFrameProps extends OnboardingSlideProps {
  children: ReactNode;
}

export function SlideFrame({ isActive, direction, children }: SlideFrameProps) {
  return (
    <div
      className="flex h-full w-full flex-col justify-center px-4 py-2 sm:px-6 overflow-y-auto"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive
          ? "translateX(0px) scale(1)"
          : direction === "next"
            ? "translateX(32px) scale(0.96)"
            : "translateX(-32px) scale(0.96)",
        transition: "opacity 0.35s ease-out, transform 0.35s ease-out",
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div className="max-w-2xl mx-auto w-full">{children}</div>
    </div>
  );
}
