export type CaptchaGameMode = "sprites" | "full-images";

export type CaptchaSpriteSetId = string;
export type CaptchaBackgroundSetId = string;

export type CaptchaLayoutMode = "uniform" | "cluster" | "swarm" | "sweep" | "orbit";

export type CaptchaLayoutPreset = {
  mode: CaptchaLayoutMode;
  weight?: number;
  clusterCount?: [number, number];
  clusterSize?: [number, number];
  allowMultiSprite?: boolean;
  accentAffinity?: number;
};

export type CaptchaVisualPreset = {
  id: string;
  name: string;
  gradient: {
    start: string;
    end: string;
    accent?: string;
    angle?: number;
  };
  accentColor: string;
  saturation: number;
  brightness: number;
  hueShift?: number;
  vignetteStrength: number;
  glowIntensity: number;
  grainOpacity: number;
  gridOpacity: number;
  weight?: number;
};

export type CaptchaLayoutMetadata = {
  mode: CaptchaLayoutMode;
  clusters?: Array<{ center: number; members: number[] }>;
};

export type CaptchaBlueprint = {
  id: string;
  title: string;
  prompt: string;
  gridSize: number;
  difficulty: "casual" | "standard" | "hard";
  layouts?: CaptchaLayoutPreset[];
  visualStyles?: CaptchaVisualPreset[];
  target: {
    label: string;
    spriteSet: CaptchaSpriteSetId;
    min: number;
    max: number;
  };
  distractors: Array<{
    label: string;
    spriteSet: CaptchaSpriteSetId;
    weight: number;
  }>;
  distractorCount: {
    min: number;
    max: number;
  };
  backgrounds: CaptchaBackgroundSetId[];
  accents?: Array<{
    label: string;
    spriteSet: CaptchaSpriteSetId;
    min: number;
    max: number;
    layer?: number;
  }>;
};

export type CaptchaTileSprite = {
  id: string;
  spriteUrl: string;
  rotationDeg?: number;
  scale?: number;
  offsetPercent?: {
    x: number;
    y: number;
  };
  layer?: number;
  span?: {
    rows: number;
    cols: number;
  };
};

export type CaptchaChallengeMetadata = {
  seed: string | null;
  blueprintId: string;
  targetLabel: string;
  difficulty: "casual" | "standard" | "hard";
  backgroundId: string | null;
  blueprint: CaptchaBlueprint;
  layout?: CaptchaLayoutMetadata;
  visualStyleId?: string;
  visualStyle?: CaptchaVisualPreset;
  spriteSummary?: {
    targets: Record<string, number>;
    distractors: Record<string, number>;
    accents?: Record<string, number>;
    multiTile?: Array<{
      type: "target" | "distractor" | "accent";
      cells: number[];
      span: {
        rows: number;
        cols: number;
      };
    }>;
  };
  renderedImage?: CaptchaRenderedImagePayload;
};

export type CaptchaChallengeDefinition = {
  id: string;
  title: string;
  prompt: string;
  backgroundImage: string;
  alt: string;
  gridSize: number;
  correctCells: number[];
  tileSprites: Record<number, CaptchaTileSprite[]>;
  fact?: string;
  metadata: CaptchaChallengeMetadata;
};

export type CaptchaRenderedImagePayload = {
  data: string;
  contentType: "image/png" | "image/webp";
  width: number;
  height: number;
  format: "png" | "webp";
};

export type CaptchaSubmission = {
  challenge: CaptchaChallengeDefinition;
  selected: number[];
};

export type CaptchaEvaluation = {
  correctCount: number;
  missing: number;
  extra: number;
};

export type SessionScoreState = {
  totalScore: number;
  streak: number;
};
