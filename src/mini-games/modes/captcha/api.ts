import type {
  CaptchaChallengeDefinition,
  CaptchaRenderedImagePayload,
} from "./types";

type RenderRequestPayload = {
  includeImage?: boolean;
  format?: "png" | "webp";
  size?: number;
  backgroundBlur?: number;
};

type ComposeRequestPayload = {
  challenge: CaptchaChallengeDefinition;
  seed?: string;
  render?: RenderRequestPayload;
};

type ComposeResponsePayload = {
  challenge: CaptchaChallengeDefinition;
  image?: CaptchaRenderedImagePayload;
};

async function postComposeRequest(payload: ComposeRequestPayload, signal?: AbortSignal) {
  // Создаем timeout controller если не передан signal
  const timeoutMs = 30000; // 30 секунд
  const controller = signal ? null : new AbortController();
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  
  try {
    const response = await fetch("/api/captcha/level", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload satisfies ComposeRequestPayload),
      signal: signal ?? controller?.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to compose captcha level: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as ComposeResponsePayload;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export type FetchDynamicChallengeOptions = {
  signal?: AbortSignal;
  render?: RenderRequestPayload | null;
};

export async function fetchDynamicChallenge(
  baseChallenge: CaptchaChallengeDefinition,
  seed?: string,
  options?: FetchDynamicChallengeOptions,
): Promise<CaptchaChallengeDefinition> {
  const payload = await postComposeRequest(
    {
      challenge: baseChallenge,
      seed,
      render:
        options?.render === null
          ? undefined
          : {
              includeImage: true,
              format: "webp",
              size: 1024,
              backgroundBlur: 2,
              ...options?.render,
            },
    },
    options?.signal,
  );

  return payload.challenge;
}

export type FetchRenderedChallengeOptions = {
  seed?: string;
  size?: number;
  format?: "png" | "webp";
  backgroundBlur?: number;
  signal?: AbortSignal;
};

export async function fetchRenderedChallenge(
  baseChallenge: CaptchaChallengeDefinition,
  options?: FetchRenderedChallengeOptions,
): Promise<{ challenge: CaptchaChallengeDefinition; image?: CaptchaRenderedImagePayload }> {
  const payload = await postComposeRequest(
    {
      challenge: baseChallenge,
      seed: options?.seed,
      render: {
        includeImage: true,
        size: options?.size,
        format: options?.format,
        backgroundBlur: options?.backgroundBlur,
      },
    },
    options?.signal,
  );

  return {
    challenge: payload.challenge,
    image: payload.image,
  };
}
