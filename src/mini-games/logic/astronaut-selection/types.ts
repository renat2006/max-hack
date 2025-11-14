// Astronaut Selection Game Types (Papers, Please style)
// Игра на быструю проверку признаков для отбора космонавтов

export type Specialty = "pilot" | "engineer" | "scientist" | "medic" | "navigator";
export type HairColor = "black" | "brown" | "blonde" | "red" | "gray" | "bald";
export type EyeColor = "brown" | "blue" | "green" | "gray" | "hazel";
export type AgeGroup = "young" | "middle" | "senior"; // 20-30, 31-45, 46-60
export type Education = "high-school" | "bachelor" | "master" | "phd";
export type Profession =
  | "pilot"
  | "engineer"
  | "scientist"
  | "doctor"
  | "teacher"
  | "athlete"
  | "military";
export type Citizenship = "usa" | "russia" | "china" | "europe" | "india" | "japan";

export type PersonTraits = {
  id: string;
  name: string;
  age: number;
  specialty: Specialty; // ЗАМЕНИЛИ gender на specialty!
  hairColor: HairColor;
  eyeColor: EyeColor;
  education: Education;
  profession: Profession;
  citizenship: Citizenship;
  height: number; // в см
  weight: number; // в кг
  experience: number; // лет опыта
  hasGlasses: boolean;
  hasTattoos: boolean;
  hasAllergies: boolean;
  languages: number; // количество языков
  // Avatar-specific traits for notionists style
  avatarBeard?: string; // variant01-variant12 or undefined
  avatarGlasses?: string; // variant01-variant11 or undefined
  avatarGesture?: string; // hand, handPhone, ok, etc.
  avatarBodyIcon?: string; // electric, galaxy, saturn or undefined
  // Техническая информация (не показывается игроку)
  description: string;
  imageId: string; // ID картинки персонажа
};

export type RuleType =
  | "require-specialty"
  | "require-age-range"
  | "require-education"
  | "require-profession"
  | "require-citizenship"
  | "exclude-age-group"
  | "exclude-profession"
  | "require-no-glasses"
  | "require-no-tattoos"
  | "require-height-range"
  | "require-languages-min"
  | "require-experience-min"
  | "exclude-specialty"
  | "exclude-name-starts-with"
  // Notionists avatar rules
  | "require-beard"
  | "exclude-beard"
  | "require-glasses-avatar"
  | "exclude-glasses-avatar"
  | "require-gesture"
  | "exclude-gesture"
  | "require-body-icon"
  | "exclude-body-icon"
  | "exclude-hair-color";

export type Rule = {
  id: string;
  type: RuleType;
  value: string | number | boolean | [number, number];
  description: string; // Как показывать игроку
};

export type Round = {
  roundNumber: number;
  rules: Rule[];
  candidates: PersonTraits[];
};

export type GameState = {
  currentRound: number;
  totalRounds: number;
  timeLeft: number; // секунды
  correctDecisions: number;
  totalDecisions: number;
  currentCandidateIndex: number;
  gameOver: boolean;
  showFeedback: boolean;
  lastDecisionCorrect: boolean;
};

export type DecisionResult = {
  correct: boolean;
  expectedDecision: "approve" | "reject";
  actualDecision: "approve" | "reject";
  explanation: string;
};
