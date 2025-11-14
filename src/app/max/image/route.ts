import { NextRequest, NextResponse } from "next/server";
import { generateNotificationSVG } from "@/src/max/image-generator";
import sharp from "sharp";

export const runtime = "nodejs"; // Изменено с edge на nodejs для sharp
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "achievement" | "stats" | "streak" | "rank";
    const dataStr = searchParams.get("data");
    const format = searchParams.get("format") || "png"; // png по умолчанию

    if (!type || !dataStr) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const data = JSON.parse(dataStr);
    const svg = generateNotificationSVG({ type, data });

    if (format === "svg") {
      // Возвращаем SVG как есть
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Конвертируем SVG в PNG
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
