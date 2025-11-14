import { faker } from "@faker-js/faker";
import type {
  PersonTraits,
  Specialty,
  HairColor,
  EyeColor,
  Education,
  Profession,
  Citizenship,
} from "./types";

const SPECIALTIES: Specialty[] = ["pilot", "engineer", "scientist", "medic", "navigator"];

const PROFESSIONS: Profession[] = ["pilot", "engineer", "scientist", "doctor", "military"];
const EDUCATIONS: Education[] = ["bachelor", "master", "phd"];
const CITIZENSHIPS: Citizenship[] = ["usa", "russia", "china", "europe", "india", "japan"];
const HAIR_COLORS: HairColor[] = ["black", "brown", "blonde", "red", "gray", "bald"];
const EYE_COLORS: EyeColor[] = ["brown", "blue", "green", "gray", "hazel"];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDescription(traits: PersonTraits): string {
  const templates = [
    `${traits.experience}+ years in ${traits.profession} field`,
    `Specialized ${traits.profession} with ${traits.education} degree`,
    `Experienced ${traits.profession} from ${traits.citizenship.toUpperCase()}`,
    `${traits.education.toUpperCase()} graduate, ${traits.experience} years experience`,
  ];
  return randomItem(templates);
}

export function generateCandidate(id: number): PersonTraits {
  const citizenship = randomItem(CITIZENSHIPS);

  // Генерация имён ТОЛЬКО на английском с faker.js
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;

  const age = randomRange(25, 50);
  const education = randomItem(EDUCATIONS);
  const profession = randomItem(PROFESSIONS);
  const specialty = randomItem(SPECIALTIES);
  const hairColor = randomItem(HAIR_COLORS);
  const eyeColor = randomItem(EYE_COLORS);

  const experience =
    age < 30 ? randomRange(2, 8) : age < 40 ? randomRange(8, 18) : randomRange(18, 28);

  const height = randomRange(160, 190);
  const weight = randomRange(55, 95);

  // Больше разнообразия в атрибутах (СНИЖЕНЫ вероятности для баланса)
  const hasGlasses = Math.random() > 0.75; // Было 0.65
  const hasTattoos = Math.random() > 0.8; // Было 0.75
  const hasAllergies = Math.random() > 0.85; // Было 0.80

  const languages =
    education === "phd"
      ? randomRange(3, 5)
      : education === "master"
        ? randomRange(2, 4)
        : randomRange(1, 3);

  // Notionists avatar attributes
  const AVATAR_BEARDS = [
    "stubble",
    "mediumBeard",
    "goatee1",
    "goatee2",
    "pyramidMoustache",
    "walrusMoustache",
    "handlebarMoustache",
    "shadowBeard",
    "circle",
  ];
  const AVATAR_GLASSES = ["round", "square", "retro", "sunglasses", "shades"];
  const AVATAR_GESTURES = ["wave", "thumbsUp", "peace", "handHeart"];
  const AVATAR_BODY_ICONS = ["star", "heart", "lightning", "moon", "sun"];

  const avatarBeard = Math.random() > 0.7 ? randomItem(AVATAR_BEARDS) : undefined;
  const avatarGlasses = hasGlasses ? randomItem(AVATAR_GLASSES) : undefined;
  const avatarGesture = Math.random() > 0.6 ? randomItem(AVATAR_GESTURES) : undefined;
  const avatarBodyIcon = Math.random() > 0.7 ? randomItem(AVATAR_BODY_ICONS) : undefined;

  const description = generateDescription({
    id: `candidate-${id}`,
    name,
    age,
    education,
    profession,
    experience,
    citizenship,
    specialty,
    hairColor,
    eyeColor,
    height,
    weight,
    hasGlasses,
    hasTattoos,
    hasAllergies,
    languages,
    avatarBeard,
    avatarGlasses,
    avatarGesture,
    avatarBodyIcon,
    description: "", // Temporary placeholder
    imageId: `candidate-${id}`,
  });

  return {
    id: `candidate-${id}`,
    name,
    age,
    specialty,
    hairColor,
    eyeColor,
    education,
    profession,
    citizenship,
    height,
    weight,
    experience,
    hasGlasses,
    hasTattoos,
    hasAllergies,
    languages,
    description,
    imageId: `candidate-${id}`,
    avatarBeard,
    avatarGlasses,
    avatarGesture,
    avatarBodyIcon,
  };
}

export function generateCandidatePool(count: number): PersonTraits[] {
  return Array.from({ length: count }, (_, i) => generateCandidate(i));
}

// Генерация нового кандидата с учетом предыдущих (для разнообразия)
export function generateDiverseCandidate(
  id: number,
  recentCandidates: PersonTraits[],
): PersonTraits {
  const MAX_ATTEMPTS = 10;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    const candidate = generateCandidate(id);

    // Проверяем что новый кандидат отличается от последних 3
    const isDifferent = recentCandidates.slice(-3).every((recent) => {
      // Должен отличаться хотя бы по 2 ключевым параметрам
      let differences = 0;

      if (candidate.specialty !== recent.specialty) differences++;
      if (candidate.profession !== recent.profession) differences++;
      if (candidate.citizenship !== recent.citizenship) differences++;
      if (Math.abs(candidate.age - recent.age) > 10) differences++;
      if (candidate.education !== recent.education) differences++;

      return differences >= 2;
    });

    if (isDifferent || attempts === MAX_ATTEMPTS - 1) {
      return candidate;
    }

    attempts++;
  }

  return generateCandidate(id);
}
