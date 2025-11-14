import postgres from "postgres";

const MAX_CONNECTIONS = 5;

declare global {
  // eslint-disable-next-line no-var
  var __SATELLITE_SQL__: ReturnType<typeof postgres> | undefined;
}

const createClient = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  // Debug: verify DATABASE_URL is loaded correctly
  console.log("[DB] DATABASE_URL loaded:", databaseUrl.substring(0, 40) + "...");

  return postgres(databaseUrl, {
    max: MAX_CONNECTIONS,
    idle_timeout: 30, // Увеличено с 20 до 30 секунд
    connect_timeout: 20, // Увеличено с 10 до 20 секунд для предотвращения ETIMEDOUT
    prepare: false,
    ssl: "require",
    // Дополнительные настройки для предотвращения таймаутов
    max_lifetime: 60 * 30, // 30 минут
  });
};

export const getSqlClient = () => {
  if (!global.__SATELLITE_SQL__) {
    global.__SATELLITE_SQL__ = createClient();
  }

  return global.__SATELLITE_SQL__;
};
