// Astronaut Selection Game Engine
// Логика проверки правил и принятия решений

import type { PersonTraits, Rule, DecisionResult } from "../../logic/astronaut-selection/types";

// Проверка одного правила для кандидата
export function checkRule(candidate: PersonTraits, rule: Rule): boolean {
  switch (rule.type) {
    case "require-specialty":
      return candidate.specialty === rule.value;

    case "require-age-range": {
      const [min, max] = rule.value as [number, number];
      return candidate.age >= min && candidate.age <= max;
    }

    case "require-education": {
      const educationOrder = ["high-school", "bachelor", "master", "phd"];
      const requiredIndex = educationOrder.indexOf(rule.value as string);
      const candidateIndex = educationOrder.indexOf(candidate.education);
      return candidateIndex >= requiredIndex;
    }

    case "require-profession":
      return candidate.profession === rule.value;

    case "require-citizenship":
      return candidate.citizenship === rule.value;

    case "exclude-hair-color":
      return candidate.hairColor !== rule.value;

    case "exclude-age-group": {
      const ageGroup = rule.value as string;
      if (ageGroup === "young") return candidate.age >= 30;
      if (ageGroup === "middle") return candidate.age < 31 || candidate.age > 45;
      if (ageGroup === "senior") return candidate.age <= 45;
      return true;
    }

    case "exclude-profession":
      return candidate.profession !== rule.value;

    case "require-no-glasses":
      return !candidate.hasGlasses;

    case "require-no-tattoos":
      return !candidate.hasTattoos;

    case "require-height-range": {
      const [min, max] = rule.value as [number, number];
      return candidate.height >= min && candidate.height <= max;
    }

    case "require-languages-min":
      return candidate.languages >= (rule.value as number);

    case "require-experience-min":
      return candidate.experience >= (rule.value as number);

    case "exclude-name-starts-with": {
      const letter = rule.value as string;
      return !candidate.name.toUpperCase().startsWith(letter.toUpperCase());
    }

    default:
      return true;
  }
}

// Проверка всех правил для кандидата
export function checkAllRules(candidate: PersonTraits, rules: Rule[]): boolean {
  return rules.every((rule) => checkRule(candidate, rule));
}

// Проверка решения игрока
export function checkDecision(
  candidate: PersonTraits,
  rules: Rule[],
  playerDecision: "approve" | "reject",
): DecisionResult {
  const shouldApprove = checkAllRules(candidate, rules);
  const expectedDecision: "approve" | "reject" = shouldApprove ? "approve" : "reject";
  const correct = expectedDecision === playerDecision;

  // Генерация объяснения
  let explanation = "";
  if (correct) {
    explanation = shouldApprove
      ? "✅ Correct! Candidate meets all requirements"
      : "✅ Correct! Candidate violates mission rules";
  } else {
    // Найти нарушенное правило
    const violatedRule = rules.find((rule) => !checkRule(candidate, rule));
    if (violatedRule) {
      explanation = `❌ Wrong! ${getViolationExplanation(candidate, violatedRule)}`;
    } else {
      explanation = "❌ Wrong! Candidate actually meets all requirements";
    }
  }

  return {
    correct,
    expectedDecision,
    actualDecision: playerDecision,
    explanation,
  };
}

// Получить объяснение нарушения конкретного правила
function getViolationExplanation(candidate: PersonTraits, rule: Rule): string {
  switch (rule.type) {
    case "require-specialty":
      return `Specialty must be ${rule.value}, but candidate is ${candidate.specialty}`;

    case "require-age-range": {
      const [min, max] = rule.value as [number, number];
      return `Age must be ${min}-${max}, but candidate is ${candidate.age}`;
    }

    case "require-education":
      return `Requires ${rule.value}, but candidate has ${candidate.education}`;

    case "require-profession":
      return `Must be ${rule.value}, but candidate is ${candidate.profession}`;

    case "require-citizenship":
      return `Must be ${rule.value} citizen`;

    case "exclude-hair-color":
      return `${rule.value} hair not allowed`;

    case "exclude-age-group":
      return `Age group ${rule.value} excluded`;

    case "exclude-profession":
      return `${rule.value} profession not allowed`;

    case "require-no-glasses":
      return "Glasses wearers not allowed";

    case "require-no-tattoos":
      return "Tattoos not allowed";

    case "require-height-range": {
      const [min, max] = rule.value as [number, number];
      return `Height must be ${min}-${max}cm, but is ${candidate.height}cm`;
    }

    case "require-languages-min":
      return `Must speak ${rule.value}+ languages, but only speaks ${candidate.languages}`;

    case "require-experience-min":
      return `Requires ${rule.value}+ years experience, but has ${candidate.experience}`;

    case "exclude-name-starts-with":
      return `Names starting with '${rule.value}' not allowed`;

    default:
      return "Rule violation";
  }
}

// Генерация подсказки для игрока (выделить важные поля)
export function getImportantFields(rules: Rule[]): string[] {
  const fields: string[] = [];

  rules.forEach((rule) => {
    switch (rule.type) {
      case "require-specialty":
      case "require-age-range":
      case "exclude-age-group":
        fields.push("age", "specialty");
        break;
      case "require-education":
        fields.push("education");
        break;
      case "require-profession":
      case "exclude-profession":
        fields.push("profession");
        break;
      case "require-citizenship":
        fields.push("citizenship");
        break;
      case "exclude-hair-color":
        fields.push("hairColor");
        break;
      case "require-no-glasses":
        fields.push("hasGlasses");
        break;
      case "require-no-tattoos":
        fields.push("hasTattoos");
        break;
      case "require-height-range":
        fields.push("height");
        break;
      case "require-languages-min":
        fields.push("languages");
        break;
      case "require-experience-min":
        fields.push("experience");
        break;
      case "exclude-name-starts-with":
        fields.push("name");
        break;
    }
  });

  return [...new Set(fields)]; // Remove duplicates
}
