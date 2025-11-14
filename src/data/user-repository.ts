import { getSqlClient } from "@/lib/db/postgres";

export type TelegramUserUpsert = {
  userId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  languageCode?: string | null;
  isPremium?: boolean | null;
  photoUrl?: string | null;
};

type UserEvent = "bot_start" | "webapp_open" | "progress_event";

type SqlClient = ReturnType<typeof getSqlClient>;

let schemaReady: Promise<void> | null = null;

const ensureSchema = async (sql: SqlClient): Promise<void> => {
  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS telegram_users (
            user_id TEXT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            language_code TEXT,
            is_premium BOOLEAN DEFAULT FALSE,
            photo_url TEXT,
            added_via_start BOOLEAN DEFAULT FALSE,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
            last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
            last_webapp_open_at TIMESTAMPTZ,
            last_bot_start_at TIMESTAMPTZ
          )
        `;

        await sql`CREATE INDEX IF NOT EXISTS idx_telegram_users_last_seen ON telegram_users(last_seen_at DESC)`;
      } catch (error) {
        schemaReady = null;
        throw error;
      }
    })();
  }

  await schemaReady;
};

const toNullableText = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  return null;
};

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 1 || value === "1") {
    return true;
  }
  if (value === 0 || value === "0") {
    return false;
  }
  return null;
};

const buildUpdateFragments = (
  sql: SqlClient,
  event: UserEvent,
  metadata?: Record<string, unknown>,
) => {
  const now = sql`timezone('utc', now())`;
  const fragments = [
    sql`username = COALESCE(EXCLUDED.username, telegram_users.username)`,
    sql`first_name = COALESCE(EXCLUDED.first_name, telegram_users.first_name)`,
    sql`last_name = COALESCE(EXCLUDED.last_name, telegram_users.last_name)`,
    sql`language_code = COALESCE(EXCLUDED.language_code, telegram_users.language_code)`,
    sql`is_premium = COALESCE(EXCLUDED.is_premium, telegram_users.is_premium)`,
    sql`photo_url = COALESCE(EXCLUDED.photo_url, telegram_users.photo_url)`,
    sql`last_seen_at = ${now}`,
  ];

  if (event === "bot_start") {
    fragments.push(sql`last_bot_start_at = ${now}`);
    fragments.push(sql`added_via_start = TRUE`);
  }

  if (event === "webapp_open") {
    fragments.push(sql`last_webapp_open_at = ${now}`);
  }

  if (metadata) {
    fragments.push(sql`metadata = ${sql.json(metadata as never)}`);
  }

  return { now, fragments };
};

export const upsertTelegramUser = async (
  input: TelegramUserUpsert,
  options: { event?: UserEvent; metadata?: Record<string, unknown> } = {},
): Promise<void> => {
  if (!input.userId) {
    throw new Error("userId is required to upsert telegram user");
  }

  const sql = getSqlClient();
  await ensureSchema(sql);

  const event: UserEvent = options.event ?? "progress_event";
  const metadata = options.metadata;

  const username = toNullableText(input.username);
  const firstName = toNullableText(input.firstName);
  const lastName = toNullableText(input.lastName);
  const languageCode = toNullableText(input.languageCode);
  const isPremium = toBoolean(input.isPremium);
  const photoUrl = toNullableText(input.photoUrl);

  const { fragments } = buildUpdateFragments(sql, event, metadata);

  let updateSet = fragments[0];
  for (let index = 1; index < fragments.length; index += 1) {
    updateSet = sql`${updateSet}, ${fragments[index]}`;
  }

  await sql`
    INSERT INTO telegram_users (
      user_id,
      username,
      first_name,
      last_name,
      language_code,
      is_premium,
      photo_url,
      metadata
    ) VALUES (
      ${input.userId},
      ${username},
      ${firstName},
      ${lastName},
      ${languageCode},
      ${isPremium},
      ${photoUrl},
      ${metadata ? sql.json(metadata as never) : sql`'{}'::jsonb`}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      ${updateSet}
  `;
};

export const recordBotStart = async (
  input: TelegramUserUpsert,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  await upsertTelegramUser(input, { event: "bot_start", metadata });
};

export const recordWebAppVisit = async (
  input: TelegramUserUpsert,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  await upsertTelegramUser(input, { event: "webapp_open", metadata });
};

export const touchUserActivity = async (
  input: TelegramUserUpsert,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  await upsertTelegramUser(input, { event: "progress_event", metadata });
};
