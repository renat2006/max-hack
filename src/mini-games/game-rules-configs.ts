import { Eye, CheckCircle, Lightning, Target, Brain, X } from "@phosphor-icons/react/dist/ssr";

import type { GameRulesConfig } from "./components/game-rules-modal";

export const ASTRONAUT_SELECTION_RULES: GameRulesConfig = {
  title: "Astronaut Selection",
  description: "Review candidates against mission requirements",
  icon: Target,
  rules: [
    { icon: Eye, text: "Review candidate profiles carefully" },
    { icon: CheckCircle, text: "Check if they match all requirements" },
    { icon: Brain, text: "Approve matches, reject mismatches" },
    { icon: Lightning, text: "Correct: +3 sec • Wrong: -7 sec" },
    { icon: Target, text: "Rules rotate every 5 candidates" },
  ],
};

export const CAPTCHA_RULES: GameRulesConfig = {
  title: "Orbital Captcha",
  description: "Find the correct tiles on the grid",
  icon: Target,
  rules: [
    { icon: Eye, text: "Read the challenge text carefully" },
    { icon: CheckCircle, text: "Select all matching tiles" },
    { icon: X, text: "Wrong selections reduce your score" },
    { icon: Lightning, text: "Speed matters — faster is better" },
    { icon: Target, text: "Perfect accuracy gives bonus points" },
  ],
};

export const COSMIC_POKER_RULES: GameRulesConfig = {
  title: "Constellation Memory",
  description: "Find matching pairs of constellations!",
  icon: Lightning,
  rules: [
    { icon: Eye, text: "Remember the cards shown at the start (3 seconds)" },
    { icon: CheckCircle, text: "Flip cards to find matching constellation pairs" },
    { icon: Lightning, text: "Build combos for bonus multiplier (x1.5, x2.25...)" },
    { icon: Target, text: "Match: +5 sec & 100 pts • Wrong: -3 sec" },
    { icon: Brain, text: "2 minutes — find all 6 pairs!" },
  ],
};

