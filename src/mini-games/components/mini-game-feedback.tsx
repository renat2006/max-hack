"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";

interface MiniGameFeedbackOverlayProps {
  show: boolean;
  success: boolean;
  message: string;
  onComplete?: () => void;
  duration?: number;
}

export function MiniGameFeedbackOverlay({
  show,
  success,
  message,
  onComplete,
  duration = 1200,
}: MiniGameFeedbackOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (onComplete) {
        const timer = setTimeout(onComplete, duration);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  // Показываем только при успехе
  if (!isVisible || !success) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm"
      style={{
        background: show ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)",
        transition: "background 0.3s ease",
      }}
    >
      <div
        className="relative mx-4 max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          animation: show
            ? "feedbackEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "feedbackExit 0.3s ease-out",
          transformOrigin: "center",
        }}
      >
        {/* Премиум декоративные линии */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )
            `,
          }}
        />

        {/* Glow эффект */}
        <div
          className="absolute -inset-1 -z-10 rounded-3xl opacity-50 blur-xl"
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
          }}
        />

        <div className="relative z-10 px-8 py-10 text-center text-white">
          {/* Иконка с элегантной анимацией */}
          <div
            className="mb-5 inline-flex items-center justify-center"
            style={{
              animation: "successScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div
              className="rounded-full bg-white/20 p-4 backdrop-blur-sm"
              style={{
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 8px rgba(255, 255, 255, 0.2)",
              }}
            >
              <CheckCircle size={64} weight="fill" className="drop-shadow-xl" />
            </div>
          </div>

          {/* Сообщение */}
          <p className="text-lg font-bold leading-relaxed drop-shadow-lg">{message}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes feedbackEnter {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes feedbackExit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        @keyframes successScale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
