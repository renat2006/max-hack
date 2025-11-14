import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import type { PersonTraits } from "./types";

type HairVariant =
  | "variant01"
  | "variant02"
  | "variant03"
  | "variant04"
  | "variant05"
  | "variant06"
  | "variant07"
  | "variant08"
  | "variant09"
  | "variant10"
  | "variant11"
  | "variant12"
  | "variant13"
  | "variant14"
  | "variant15"
  | "variant16"
  | "hat";

type EyeVariant = "variant01" | "variant02" | "variant03" | "variant04" | "variant05";

type BrowVariant =
  | "variant01"
  | "variant02"
  | "variant03"
  | "variant04"
  | "variant05"
  | "variant06"
  | "variant07"
  | "variant08"
  | "variant09"
  | "variant10"
  | "variant11"
  | "variant12"
  | "variant13";

type BodyVariant =
  | "variant01"
  | "variant02"
  | "variant03"
  | "variant04"
  | "variant05"
  | "variant06"
  | "variant07"
  | "variant08"
  | "variant09"
  | "variant10"
  | "variant11"
  | "variant12"
  | "variant13"
  | "variant14"
  | "variant15"
  | "variant16"
  | "variant17"
  | "variant18"
  | "variant19"
  | "variant20"
  | "variant21"
  | "variant22"
  | "variant23"
  | "variant24"
  | "variant25";

type BeardVariant =
  | "variant01"
  | "variant02"
  | "variant03"
  | "variant04"
  | "variant05"
  | "variant06"
  | "variant07"
  | "variant08"
  | "variant09"
  | "variant10"
  | "variant11"
  | "variant12";

type GlassesVariant = "variant01" | "variant02" | "variant03" | "variant04" | "variant05";

type GestureVariant = "variant01" | "variant02" | "variant03" | "variant04" | "variant05";

type BodyIconVariant =
  | "variant01"
  | "variant02"
  | "variant03"
  | "variant04"
  | "variant05"
  | "variant06"
  | "variant07"
  | "variant08"
  | "variant09"
  | "variant10"
  | "variant11"
  | "variant12"
  | "variant13"
  | "variant14"
  | "variant15"
  | "variant16"
  | "variant17"
  | "variant18";

export function generateAvatarUrl(candidate: PersonTraits): string {
  // Seed основан на ID и имени
  const seed = `${candidate.id}-${candidate.name}`;

  // Прически: 16 вариантов + bald + hat
  const getHairStyle = (): HairVariant[] => {
    if (candidate.hairColor === "bald") {
      return ["variant01"]; // Один из коротких вариантов для лысых
    }

    return [
      "variant01",
      "variant02",
      "variant03",
      "variant04",
      "variant05",
      "variant06",
      "variant07",
      "variant08",
      "variant09",
      "variant10",
      "variant11",
      "variant12",
      "variant13",
      "variant14",
      "variant15",
      "variant16",
      "hat",
    ];
  };

  // Максимальное разнообразие глаз (5 вариантов)
  const allEyeVariants: EyeVariant[] = [
    "variant01",
    "variant02",
    "variant03",
    "variant04",
    "variant05",
  ];

  // Брови - 13 вариантов
  const allBrowVariants: BrowVariant[] = [
    "variant01",
    "variant02",
    "variant03",
    "variant04",
    "variant05",
    "variant06",
    "variant07",
    "variant08",
    "variant09",
    "variant10",
    "variant11",
    "variant12",
    "variant13",
  ];

  // Борода - использовать только если candidate.avatarBeard определен
  const getBeard = (): BeardVariant[] | undefined => {
    if (candidate.avatarBeard) {
      return [candidate.avatarBeard as BeardVariant];
    }
    return undefined;
  };

  // Тело - 25 вариантов
  const allBodyVariants: BodyVariant[] = [
    "variant01",
    "variant02",
    "variant03",
    "variant04",
    "variant05",
    "variant06",
    "variant07",
    "variant08",
    "variant09",
    "variant10",
    "variant11",
    "variant12",
    "variant13",
    "variant14",
    "variant15",
    "variant16",
    "variant17",
    "variant18",
    "variant19",
    "variant20",
    "variant21",
    "variant22",
    "variant23",
    "variant24",
    "variant25",
  ];

  // Очки - использовать только если candidate.avatarGlasses определен
  const getGlasses = (): GlassesVariant[] | undefined => {
    if (candidate.avatarGlasses) {
      return [candidate.avatarGlasses as GlassesVariant];
    }
    return undefined;
  };

  // Жесты - использовать если candidate.avatarGesture определен
  const getGesture = (): GestureVariant[] | undefined => {
    if (candidate.avatarGesture) {
      return [candidate.avatarGesture as GestureVariant];
    }
    return undefined;
  };

  // Иконки на одежде - использовать если candidate.avatarBodyIcon определен
  const getBodyIcon = (): BodyIconVariant[] | undefined => {
    if (candidate.avatarBodyIcon) {
      return [candidate.avatarBodyIcon as BodyIconVariant];
    }
    return undefined;
  };

  // @ts-expect-error - DiceBear types are too strict, but our variants are valid
  const avatar = createAvatar(notionists, {
    seed,
    size: 200,
    backgroundColor: ["0a1224"],

    // Прическа
    hair: getHairStyle(),

    // Максимум разнообразия
    eyes: allEyeVariants,
    brows: allBrowVariants,
    body: allBodyVariants,

    // Борода - точное соответствие avatarBeard
    ...(candidate.avatarBeard && {
      beard: getBeard(),
      beardProbability: 100,
    }),

    // Очки - точное соответствие avatarGlasses
    ...(candidate.avatarGlasses && {
      glasses: getGlasses(),
      glassesProbability: 100,
    }),

    // Жесты - точное соответствие avatarGesture
    ...(candidate.avatarGesture && {
      gesture: getGesture(),
      gestureProbability: 100,
    }),

    // Иконки на одежде - точное соответствие avatarBodyIcon
    ...(candidate.avatarBodyIcon && {
      bodyIcon: getBodyIcon(),
      bodyIconProbability: 100,
    }),
  });

  return avatar.toDataUri();
}
