import sharp from "sharp";

import type { NotificationType, NotificationTemplate } from "./notification-config";
import {
  NOTIFICATIONS,
  ACHIEVEMENT_DEFINITIONS,
  BUTTON_LABELS,
  formatMessage,
} from "./notification-config";
import { generateNotificationSVG } from "./image-generator";
import { logger } from "../utils/logger";

type SendNotificationParams = {
  chatId: string | number;
  type: NotificationType;
  params?: Record<string, string | number>;
  achievementId?: keyof typeof ACHIEVEMENT_DEFINITIONS;
  withImage?: boolean;
  messageOverride?: string;
};

type PhotoUpload = {
  data: Uint8Array;
  filename: string;
  mimeType: string;
};

type TelegramMessage = {
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  replyMarkup?: {
    inline_keyboard: Array<
      Array<{
        text: string;
        url?: string;
        web_app?: { url: string };
        callback_data?: string;
      }>
    >;
  };
  photo?: string | PhotoUpload;
};

const sendTelegramMessage = async (
  chatId: string | number,
  message: TelegramMessage,
): Promise<void> => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    logger.error("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    const method = message.photo ? "sendPhoto" : "sendMessage";
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;

    let response: Response;

    if (message.photo && typeof message.photo !== "string") {
      const formData = new FormData();
      formData.append("chat_id", String(chatId));
      formData.append("parse_mode", message.parseMode || "HTML");
      formData.append("caption", message.text);

      const arrayBuffer = message.photo.data.buffer.slice(
        message.photo.data.byteOffset,
        message.photo.data.byteOffset + message.photo.data.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: message.photo.mimeType });
      formData.append("photo", blob, message.photo.filename);

      if (message.replyMarkup) {
        formData.append("reply_markup", JSON.stringify(message.replyMarkup));
      }

      logger.debug("[Telegram API] Sending message", {
        chatId,
        method,
        hasPhoto: true,
        hasButtons: !!message.replyMarkup,
        uploadType: "multipart",
      });

      response = await fetch(url, {
        method: "POST",
        body: formData,
      });
    } else {
      const body: Record<string, unknown> = {
        chat_id: chatId,
        parse_mode: message.parseMode || "HTML",
      };

      if (message.photo) {
        body.photo = message.photo;
        body.caption = message.text;
      } else {
        body.text = message.text;
      }

      if (message.replyMarkup) {
        body.reply_markup = message.replyMarkup;
      }

      logger.debug("[Telegram API] Sending message", {
        chatId,
        method,
        hasPhoto: !!message.photo,
        hasButtons: !!message.replyMarkup,
        uploadType: "json",
      });

      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      logger.error("Telegram API error", { error, status: response.status });
    } else {
      logger.debug("[Telegram API] Message sent successfully", { chatId });
    }
  } catch (error) {
    logger.error("Failed to send Telegram message", { error });
  }
};

const buildMessage = (
  template: NotificationTemplate,
  params: Record<string, string | number> | undefined,
  override?: string,
): string => {
  const rawMessage = override ?? template.message;
  const message = params ? formatMessage(rawMessage, params) : rawMessage;
  return `<b>${template.emoji} ${template.title}</b>\n\n${message}`;
};

const buildInlineKeyboard = (type: NotificationType) => {
  const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "your_bot";
  const WEBAPP_URL = process.env.NEXT_PUBLIC_TELEGRAM_WEBAPP_URL || "https://your-app.com";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `https://t.me/${BOT_NAME}`;

  const buttons: Array<Array<{ text: string; url?: string; web_app?: { url: string } }>> = [];

  if (type === "game_complete" || type === "first_game") {
    buttons.push([{ text: BUTTON_LABELS.play_now, web_app: { url: WEBAPP_URL } }]);
  }

  if (type === "score_milestone" || type === "achievement_unlock") {
    buttons.push([
      { text: BUTTON_LABELS.view_stats, web_app: { url: `${WEBAPP_URL}?startapp=profile` } },
      {
        text: BUTTON_LABELS.share,
        url: `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=Join%20me%20in%20Satellite%20AI!`,
      },
    ]);
  }

  if (type === "leaderboard_rank") {
    buttons.push([
      { text: BUTTON_LABELS.leaderboard, web_app: { url: `${WEBAPP_URL}?startapp=leaderboard` } },
    ]);
  }

  if (type === "daily_reminder") {
    buttons.push([{ text: BUTTON_LABELS.play_now, web_app: { url: WEBAPP_URL } }]);
  }

  return buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
};

export const sendNotification = async (params: SendNotificationParams): Promise<void> => {
  const template = NOTIFICATIONS[params.type];

  if (!template) {
    logger.error("Unknown notification type", { type: params.type });
    return;
  }

  let messageParams = params.params || {};

  if (params.achievementId) {
    const achievement = ACHIEVEMENT_DEFINITIONS[params.achievementId];
    if (achievement) {
      messageParams = {
        ...messageParams,
        achievementName: `${achievement.emoji} ${achievement.name}`,
        achievementDescription: achievement.description,
      };
    }
  }

  const text = buildMessage(template, messageParams, params.messageOverride);

  let photoPayload: TelegramMessage["photo"];

  if (template.withImage && params.withImage !== false && template.imageType) {
    try {
      const imageParams = {
        type: template.imageType,
        data: {
          title: template.title,
          emoji: template.emoji,
          ...messageParams,
        },
      };

      const svg = generateNotificationSVG(imageParams);
      const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
      photoPayload = {
        data: new Uint8Array(pngBuffer),
        filename: `${template.imageType}-${Date.now()}.png`,
        mimeType: "image/png",
      };
    } catch (error) {
      logger.error("Failed to generate notification image", { error });
    }
  }

  const replyMarkup = buildInlineKeyboard(params.type);

  await sendTelegramMessage(params.chatId, {
    text,
    parseMode: "HTML",
    replyMarkup,
    photo: photoPayload,
  });
};

export const sendBatchNotifications = async (
  notifications: Array<SendNotificationParams>,
): Promise<void> => {
  const BATCH_DELAY = 50;

  for (const notification of notifications) {
    await sendNotification(notification);
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
  }
};
