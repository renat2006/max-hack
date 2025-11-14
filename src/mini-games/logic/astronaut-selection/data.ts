// Astronaut Selection Game Data
// База данных кандидатов и правил для игры

import type { Rule, PersonTraits } from "./types";
import { generateCandidatePool } from "./person-generator";

export const CANDIDATE_POOL = generateCandidatePool(50);

// Генератор правил для раундов - МАКСИМАЛЬНО СБАЛАНСИРОВАННЫЙ
// СТРАТЕГИЯ: широкие диапазоны + смесь require/exclude = 40-50% acceptance rate
export const RULE_TEMPLATES: Omit<Rule, "id">[] = [
  // Specialty rules - ШИРОКИЕ (3 из 5 специальностей)
  {
    type: "require-specialty",
    value: "pilot",
    description: "PILOT specialty only",
  },
  {
    type: "require-specialty",
    value: "engineer",
    description: "ENGINEER specialty only",
  },
  {
    type: "require-specialty",
    value: "scientist",
    description: "SCIENTIST specialty only",
  },

  // Age rules - ОЧЕНЬ ШИРОКИЕ (охватывают 90%+ кандидатов)
  {
    type: "require-age-range",
    value: [22, 50], // Почти все
    description: "Age: 22-50 years",
  },
  {
    type: "require-age-range",
    value: [25, 45], // Большинство
    description: "Age: 25-45 years",
  },
  {
    type: "exclude-age-group",
    value: "young", // Исключает <28 (~30% кандидатов)
    description: "NO young candidates (under 28)",
  },

  // Education rules - ШИРОКИЕ (bachelor = большинство)
  {
    type: "require-education",
    value: "bachelor",
    description: "Bachelor's degree minimum",
  },
  {
    type: "require-education",
    value: "master",
    description: "Master's degree minimum",
  },

  // Profession rules - ВАРЬИРУЕТСЯ
  {
    type: "require-profession",
    value: "pilot",
    description: "PILOTS only",
  },
  {
    type: "require-profession",
    value: "engineer",
    description: "ENGINEERS only",
  },
  {
    type: "require-profession",
    value: "scientist",
    description: "SCIENTISTS only",
  },

  // Physical characteristics - ШИРОЧАЙШИЕ (охватывают 95%+)
  {
    type: "require-height-range",
    value: [155, 195], // Почти все
    description: "Height: 155-195 cm",
  },
  {
    type: "require-height-range",
    value: [160, 190], // Большинство
    description: "Height: 160-190 cm",
  },

  // Experience rules - НИЗКИЕ ТРЕБОВАНИЯ (3-5 лет = большинство)
  {
    type: "require-experience-min",
    value: 3,
    description: "At least 3 years experience",
  },
  {
    type: "require-experience-min",
    value: 5,
    description: "At least 5 years experience",
  },

  // Languages - НИЗКИЕ (2-3 языка = большинство)
  {
    type: "require-languages-min",
    value: 2,
    description: "At least 2 languages",
  },
  {
    type: "require-languages-min",
    value: 3,
    description: "At least 3 languages",
  },

  // Special attributes - EXCLUDE (отсеивают ~20-30%)
  {
    type: "require-no-glasses",
    value: true,
    description: "NO glasses",
  },
  {
    type: "require-no-tattoos",
    value: true,
    description: "NO tattoos",
  },

  // Avatar rules - EXCLUDE (отсеивают ~30-40%)
  {
    type: "exclude-beard",
    value: true,
    description: "NO beard",
  },
  {
    type: "exclude-gesture",
    value: true,
    description: "NO hand gesture",
  },
  {
    type: "exclude-body-icon",
    value: true,
    description: "NO body icon",
  },

  // Name rules - EXCLUDE конкретные буквы (~10-15% каждая)
  {
    type: "exclude-name-starts-with",
    value: "J",
    description: "NO names starting with 'J'",
  },
  {
    type: "exclude-name-starts-with",
    value: "A",
    description: "NO names starting with 'A'",
  },
  {
    type: "exclude-name-starts-with",
    value: "M",
    description: "NO names starting with 'M'",
  },

  // Citizenship rules - ВАРЬИРУЕТСЯ (~15-20% каждая)
  {
    type: "require-citizenship",
    value: "usa",
    description: "USA citizens only",
  },
  {
    type: "require-citizenship",
    value: "europe",
    description: "European citizens only",
  },
  {
    type: "require-citizenship",
    value: "china",
    description: "Chinese citizens only",
  },
];

// Функция для генерации СБАЛАНСИРОВАННЫХ правил раунда
// НОВЫЙ АЛГОРИТМ: комбинирует require и exclude чтобы ~40-50% кандидатов проходили
export function generateRoundRules(): Rule[] {
  const count = Math.floor(Math.random() * 2) + 2; // 2 или 3 правила (не 4!)

  // Разделяем правила на категории для баланса
  const requireRules = RULE_TEMPLATES.filter(
    (r) => r.type.startsWith("require-") && !r.type.includes("no-"),
  );
  const excludeRules = RULE_TEMPLATES.filter(
    (r) => r.type.startsWith("exclude-") || r.type.includes("no-"),
  );

  const selectedRules: Omit<Rule, "id">[] = [];
  const usedCategories = new Set<string>();

  // СТРАТЕГИЯ БАЛАНСА:
  // - Если 2 правила: 1 require + 1 exclude (50% баланс)
  // - Если 3 правила: 2 require + 1 exclude ИЛИ 1 require + 2 exclude (варьируется)

  const requireCount = count === 2 ? 1 : Math.random() > 0.5 ? 2 : 1;
  // excludeCount вычисляется неявно через count - requireCount

  // Выбираем require правила
  const shuffledRequire = [...requireRules].sort(() => Math.random() - 0.5);
  for (const rule of shuffledRequire) {
    if (selectedRules.length >= requireCount) break;

    const category = getCategory(rule.type);
    if (usedCategories.has(category)) continue;

    usedCategories.add(category);
    selectedRules.push(rule);
  }

  // Выбираем exclude правила (из ДРУГИХ категорий)
  const shuffledExclude = [...excludeRules].sort(() => Math.random() - 0.5);
  for (const rule of shuffledExclude) {
    if (selectedRules.length >= count) break;

    const category = getCategory(rule.type);
    if (usedCategories.has(category)) continue;

    usedCategories.add(category);
    selectedRules.push(rule);
  }

  // Перемешиваем чтобы порядок был случайным
  const finalRules = selectedRules.sort(() => Math.random() - 0.5);

  return finalRules.map((template, index) => ({
    ...template,
    id: `rule-${Date.now()}-${index}`,
  }));
}

// Вспомогательная функция - определяет категорию правила
function getCategory(ruleType: string): string {
  if (ruleType.includes("specialty")) return "specialty";
  if (ruleType.includes("age")) return "age";
  if (ruleType.includes("education")) return "education";
  if (ruleType.includes("profession")) return "profession";
  if (ruleType.includes("citizenship")) return "citizenship";
  if (ruleType.includes("height")) return "height";
  if (ruleType.includes("experience")) return "experience";
  if (ruleType.includes("languages")) return "languages";
  if (ruleType.includes("glasses")) return "glasses";
  if (ruleType.includes("tattoos")) return "tattoos";
  if (ruleType.includes("beard")) return "beard";
  if (ruleType.includes("gesture")) return "gesture";
  if (ruleType.includes("body-icon")) return "body-icon";
  if (ruleType.includes("name")) return "name";
  return ruleType;
}

// Функция для выбора случайных кандидатов
export function selectRandomCandidates(count: number): PersonTraits[] {
  const shuffled = [...CANDIDATE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
