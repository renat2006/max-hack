const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  error: (...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },

  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
};
