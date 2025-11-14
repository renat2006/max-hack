export const highlightProjectId = process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID ?? "";

export const highlightEnvironment =
  process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development";

export const highlightFrontendServiceName =
  process.env.NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME ?? "satellite-ai-telegram-webapp";

export const highlightBackendServiceName =
  process.env.HIGHLIGHT_BACKEND_SERVICE_NAME ?? `${highlightFrontendServiceName}-backend`;

export const highlightVersion =
  process.env.NEXT_PUBLIC_APP_VERSION ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GIT_COMMIT_SHA ??
  "dev";

export const isHighlightEnabled = () => highlightProjectId.length > 0;

type PrimitiveHighlightValue = string | number | boolean | undefined;

export type HighlightMetadataValue =
  | PrimitiveHighlightValue
  | null
  | Date
  | Record<string, unknown>
  | Array<unknown>;

export type HighlightMetadata = Record<string, HighlightMetadataValue>;

export const highlightBaseMetadata: Record<string, PrimitiveHighlightValue> = {
  environment: highlightEnvironment,
  service_name: highlightFrontendServiceName,
  version: highlightVersion,
};
