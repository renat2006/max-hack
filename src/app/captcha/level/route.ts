import { NextResponse } from "next/server";

import type {
  CaptchaChallengeDefinition,
  CaptchaRenderedImagePayload,
} from "@/lib/mini-games/modes/captcha/types";
// TODO: Implement composeChallenge and renderChallengeBoard
// import { composeChallenge } from "@/server/captcha/generator";
// import { renderChallengeBoard } from "@/server/captcha/renderer";

function composeChallenge({ base }: { base: CaptchaChallengeDefinition; seed?: string }): CaptchaChallengeDefinition {
  return base;
}

async function renderChallengeBoard({ challenge }: {
  challenge: CaptchaChallengeDefinition;
  size?: number;
  format?: "png" | "webp";
  backgroundBlur?: number;
}): Promise<{ buffer: Buffer; contentType: string; width: number; height: number; format: string }> {
  throw new Error("renderChallengeBoard not implemented");
}

type RenderRequestOptions = {
  includeImage?: boolean;
  format?: "png" | "webp";
  size?: number;
  backgroundBlur?: number;
};

export const runtime = "nodejs";
export const revalidate = 0;

type ComposeRequestBody = {
  challenge: CaptchaChallengeDefinition;
  seed?: string;
  render?: RenderRequestOptions;
};

type ComposeResponseBody = {
  challenge: CaptchaChallengeDefinition;
  image?: CaptchaRenderedImagePayload;
};

export async function POST(request: Request): Promise<Response> {
  let payload: ComposeRequestBody;

  try {
    payload = (await request.json()) as ComposeRequestBody;
  } catch (error) {
    // Игнорируем ошибки от прерванных соединений
    if (error instanceof Error && (error.message.includes('aborted') || error.message.includes('ECONNRESET'))) {
      return new Response(null, { status: 499 }); // Client Closed Request
    }
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload?.challenge) {
    return NextResponse.json({ error: "Missing challenge blueprint" }, { status: 400 });
  }

  // Проверяем, не прервано ли соединение
  if (request.signal?.aborted) {
    return new Response(null, { status: 499 });
  }

  try {
    const challenge = composeChallenge({ base: payload.challenge, seed: payload.seed });

    let imagePayload: CaptchaRenderedImagePayload | undefined;

    if (payload.render?.includeImage) {
      // Проверяем снова перед тяжелой операцией
      if (request.signal?.aborted) {
        return new Response(null, { status: 499 });
      }
      
      try {
        const rendered = await renderChallengeBoard({
          challenge,
          size: payload.render.size,
          format: payload.render.format,
          backgroundBlur: payload.render.backgroundBlur,
        });

        imagePayload = {
          data: rendered.buffer.toString("base64"),
          contentType: rendered.contentType,
          width: rendered.width,
          height: rendered.height,
          format: rendered.format,
        } satisfies CaptchaRenderedImagePayload;
      } catch (renderError) {
        // Игнорируем ошибки от прерванных соединений
        if (renderError instanceof Error && (renderError.message.includes('aborted') || renderError.message.includes('ECONNRESET'))) {
          return new Response(null, { status: 499 });
        }
        console.error("[Captcha API] renderer", renderError);
      }
    }

    const challengeWithRender =
      imagePayload !== undefined
        ? {
            ...challenge,
            metadata: {
              ...challenge.metadata,
              renderedImage: imagePayload,
            },
          }
        : challenge;

    return NextResponse.json({ challenge: challengeWithRender, image: imagePayload } satisfies ComposeResponseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compose captcha challenge";
    console.error("[Captcha API]", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
