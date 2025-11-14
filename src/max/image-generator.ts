type ImageGeneratorParams = {
  type: "achievement" | "stats" | "streak" | "rank";
  data: {
    title: string;
    value?: string | number;
    subtitle?: string;
    emoji?: string;
    rank?: number;
    score?: number;
    streakDays?: number;
    totalGames?: number;
    accuracy?: number;
    completionTime?: number;
  };
};

// Форматирование больших чисел
const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    return millions % 1 === 0 ? `${Math.floor(millions)}M` : `${millions.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const thousands = num / 1_000;
    return thousands % 1 === 0 ? `${Math.floor(thousands)}k` : `${thousands.toFixed(1)}k`;
  }
  return num.toString();
};

const COLORS = {
  background: "#050b18",
  backgroundAlt: "#0a1628",
  primary: "#3b82f6",
  primaryBright: "#60a5fa",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
  success: "#10b981",
  text: "#ffffff",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  border: "rgba(148, 163, 184, 0.2)",
  glow: "rgba(59, 130, 246, 0.3)",
};

// Шрифты доступные в Ubuntu Server (fonts-liberation, fonts-dejavu)
// DejaVu Sans - гарантированно установлен на всех Ubuntu системах
const FONTS = `
  <style>
    .title {
      font-family: 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif;
      font-weight: bold;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    
    .body {
      font-family: 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif;
      font-weight: normal;
    }
    
    .body-bold {
      font-family: 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif;
      font-weight: bold;
    }
  </style>
`;

export const generateNotificationSVG = (params: ImageGeneratorParams): string => {
  const width = 1080;
  const height = 1080;

  const gradients = `
    <defs>
      ${FONTS}
      <linearGradient id="bg-main" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0a1628;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#050b18;stop-opacity:1" />
      </linearGradient>
      
      <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
    </defs>
  `;

  let content = "";

  switch (params.type) {
    case "stats":
      content = generateStatsContent(params.data, width);
      break;
    case "achievement":
      content = generateAchievementContent(params.data, width, height);
      break;
    case "streak":
      content = generateStreakContent(params.data, width);
      break;
    case "rank":
      content = generateRankContent(params.data, width);
      break;
  }

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${gradients}
      
      <rect width="${width}" height="${height}" fill="url(#bg-main)"/>
      
      ${content}
      
      <text x="${width - 60}" y="${height - 50}" class="body" font-size="22" text-anchor="end" fill="${COLORS.textMuted}" opacity="0.5">
        SATELLITE AI
      </text>
    </svg>
  `;
};

const generateStatsContent = (data: ImageGeneratorParams["data"], width: number): string => {
  const centerX = width / 2;
  const topY = 180;

  const totalGames = data.totalGames || 0;
  const accuracy = data.accuracy || 0;
  const timeMinutes = data.completionTime ? Math.floor(data.completionTime / 60) : 0;
  const timeSeconds = data.completionTime ? data.completionTime % 60 : 0;
  const scoreFormatted = formatNumber(data.score || 0);

  return `
    <text x="${centerX}" y="${topY}" class="title" font-size="56" text-anchor="middle" fill="${COLORS.textDim}">
      MISSION
    </text>
    <text x="${centerX}" y="${topY + 70}" class="title" font-size="56" text-anchor="middle" fill="${COLORS.text}">
      COMPLETE
    </text>
    
    <text x="${centerX}" y="${topY + 230}" class="title" font-size="160" text-anchor="middle" fill="url(#accent-gradient)">
      ${scoreFormatted}
    </text>
    <text x="${centerX}" y="${topY + 290}" class="body" font-size="28" text-anchor="middle" fill="${COLORS.textDim}" opacity="0.8">
      POINTS
    </text>
    
    <g transform="translate(${centerX - 300}, ${topY + 380})">
      <rect x="0" y="0" width="180" height="140" fill="${COLORS.backgroundAlt}" rx="20" opacity="0.5"/>
      <text x="90" y="55" class="body" font-size="22" text-anchor="middle" fill="${COLORS.textMuted}">
        LEVELS
      </text>
      <text x="90" y="105" class="title" font-size="52" text-anchor="middle" fill="${COLORS.primaryBright}">
        ${formatNumber(totalGames)}
      </text>
    </g>
    
    <g transform="translate(${centerX - 90}, ${topY + 380})">
      <rect x="0" y="0" width="180" height="140" fill="${COLORS.backgroundAlt}" rx="20" opacity="0.5"/>
      <text x="90" y="55" class="body" font-size="22" text-anchor="middle" fill="${COLORS.textMuted}">
        ACCURACY
      </text>
      <text x="90" y="105" class="title" font-size="52" text-anchor="middle" fill="${COLORS.success}">
        ${accuracy}%
      </text>
    </g>
    
    <g transform="translate(${centerX + 120}, ${topY + 380})">
      <rect x="0" y="0" width="180" height="140" fill="${COLORS.backgroundAlt}" rx="20" opacity="0.5"/>
      <text x="90" y="55" class="body" font-size="22" text-anchor="middle" fill="${COLORS.textMuted}">
        TIME
      </text>
      <text x="90" y="105" class="title" font-size="52" text-anchor="middle" fill="${COLORS.accent}">
        ${timeMinutes}:${timeSeconds.toString().padStart(2, "0")}
      </text>
    </g>
  `;
};

const generateAchievementContent = (
  data: ImageGeneratorParams["data"],
  width: number,
  height: number,
): string => {
  const centerX = width / 2;
  const centerY = height / 2;

  return `
    <circle cx="${centerX}" cy="${centerY - 80}" r="120" fill="url(#accent-gradient)" opacity="0.15"/>
    <circle cx="${centerX}" cy="${centerY - 80}" r="100" fill="none" stroke="url(#accent-gradient)" stroke-width="3"/>
    
    <text x="${centerX}" y="${centerY - 20}" font-size="100" text-anchor="middle">
      ${data.emoji || "🏆"}
    </text>
    
    <text x="${centerX}" y="${centerY + 130}" class="title" font-size="64" text-anchor="middle" fill="${COLORS.text}">
      ${escapeXml(data.title)}
    </text>
    
    ${
      data.subtitle
        ? `
      <text x="${centerX}" y="${centerY + 200}" class="body" font-size="28" text-anchor="middle" fill="${COLORS.textDim}">
        ${escapeXml(data.subtitle)}
      </text>
    `
        : ""
    }
    
    <rect x="${centerX - 140}" y="${centerY + 250}" width="280" height="60" fill="${COLORS.backgroundAlt}" rx="30" opacity="0.6"/>
    <text x="${centerX}" y="${centerY + 290}" class="body" font-size="24" text-anchor="middle" fill="${COLORS.accent}">
      ✨ UNLOCKED ✨
    </text>
  `;
};

const generateStreakContent = (data: ImageGeneratorParams["data"], width: number): string => {
  const centerX = width / 2;
  const topY = 220;
  const flames = "🔥".repeat(Math.min(data.streakDays || 1, 5));

  return `
    <text x="${centerX}" y="${topY}" class="title" font-size="52" text-anchor="middle" fill="${COLORS.textDim}">
      YOUR STREAK
    </text>
    
    <text x="${centerX}" y="${topY + 140}" font-size="90" text-anchor="middle">
      ${flames}
    </text>
    
    <text x="${centerX}" y="${topY + 340}" class="title" font-size="180" text-anchor="middle" fill="url(#accent-gradient)">
      ${data.streakDays || 0}
    </text>
    
    <text x="${centerX}" y="${topY + 420}" class="body" font-size="36" text-anchor="middle" fill="${COLORS.text}">
      DAYS IN A ROW
    </text>
  `;
};

const generateRankContent = (data: ImageGeneratorParams["data"], width: number): string => {
  const centerX = width / 2;
  const topY = 200;
  const rankEmoji = data.rank === 1 ? "👑" : data.rank === 2 ? "🥈" : data.rank === 3 ? "🥉" : "⭐";
  const scoreFormatted = formatNumber(data.score || 0);

  return `
    <text x="${centerX}" y="${topY}" class="title" font-size="48" text-anchor="middle" fill="${COLORS.textDim}">
      LEADERBOARD
    </text>
    <text x="${centerX}" y="${topY + 64}" class="title" font-size="48" text-anchor="middle" fill="${COLORS.text}">
      POSITION
    </text>
    
    <text x="${centerX}" y="${topY + 220}" font-size="130" text-anchor="middle">
      ${rankEmoji}
    </text>
    
    <text x="${centerX}" y="${topY + 420}" class="title" font-size="150" text-anchor="middle" fill="url(#accent-gradient)">
      #${data.rank || 0}
    </text>
    
    <text x="${centerX}" y="${topY + 510}" class="body" font-size="32" text-anchor="middle" fill="${COLORS.success}">
      ${scoreFormatted} POINTS
    </text>
  `;
};

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};
