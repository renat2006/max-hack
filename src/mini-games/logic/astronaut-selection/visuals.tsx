"use client";

import { useState, useEffect } from "react";
import { useThemeColors } from "@/src/max/use-theme-colors";
import type { Rule } from "./types";
import { RULE_VISUALS } from "./constants";

interface RuleCardProps {
  rule: Rule;
  isNew?: boolean;
}

export function RuleCard({ rule, isNew }: RuleCardProps) {
  const colors = useThemeColors();
  const visual = RULE_VISUALS[rule.type] ?? { icon: "✦", color: colors.accent };

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300"
      style={{
        background: colors.panelMuted,
        borderColor: isNew ? visual.color : colors.lineSubtle,
        borderWidth: "1px",
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-base font-bold"
        style={{
          background: `${visual.color}15`,
          color: visual.color,
        }}
      >
        {visual.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-relaxed" style={{ color: colors.textPrimary }}>
          {rule.description}
        </p>
      </div>
    </div>
  );
}

interface RulesDisplayProps {
  rules: Rule[];
  previousRules?: Rule[];
  candidatesUntilChange?: number;
  showModal?: boolean;
  onShowModalChange?: (show: boolean) => void;
}

export function RulesDisplay({
  rules,
  previousRules = [],
  candidatesUntilChange,
  showModal: externalShowModal,
  onShowModalChange,
}: RulesDisplayProps) {
  const colors = useThemeColors();
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [hasShownInitial, setHasShownInitial] = useState(false);

  // Используем внешнее состояние если передано, иначе внутреннее
  const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
  const setShowModal = onShowModalChange ?? setInternalShowModal;

  const newRuleIds = new Set(rules.map((r) => r.id));
  const previousRuleIds = new Set(previousRules.map((r) => r.id));
  const addedRuleIds = [...newRuleIds].filter((id) => !previousRuleIds.has(id));

  // Показываем модалку при первом заходе
  useEffect(() => {
    if (rules.length > 0 && !hasShownInitial) {
      setShowModal(true);
      setHasShownInitial(true);
    }
  }, [rules.length, hasShownInitial, setShowModal]);

  // Показываем модалку при смене правил
  useEffect(() => {
    if (addedRuleIds.length > 0 && previousRules.length > 0) {
      setShowModal(true);
    }
  }, [addedRuleIds.length, previousRules.length, setShowModal]);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-200 active:scale-95"
        style={{
          background: colors.panel,
          borderColor: colors.lineSubtle,
        }}
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: colors.accent }}
          >
            Mission Rules
          </span>

          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              background: `${colors.accent}20`,
              color: colors.accent,
            }}
          >
            {rules.length}
          </div>

          {/* Индикатор до смены правил */}
          {candidatesUntilChange !== undefined && candidatesUntilChange > 0 && (
            <span className="ml-1 text-[10px] font-medium" style={{ color: colors.textMuted }}>
              ({candidatesUntilChange} left)
            </span>
          )}
        </div>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              background: colors.panel,
              borderColor: colors.lineSoft,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="border-b px-6 py-5"
              style={{
                borderColor: colors.lineSoft,
              }}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                Mission Requirements
              </h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                Accept candidates who match ALL requirements below
              </p>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto p-5">
              {rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} isNew={addedRuleIds.includes(rule.id)} />
              ))}
            </div>

            <div className="border-t p-5" style={{ borderColor: colors.lineSoft }}>
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-95"
                style={{
                  background: colors.accent,
                  color: colors.accentText,
                }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
