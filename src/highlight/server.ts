import { AppRouterHighlight } from "@highlight-run/next/server";

import { highlightBackendServiceName, highlightProjectId, isHighlightEnabled } from "./config";

const passthrough = <T extends (...args: never[]) => unknown>(handler: T): T => handler;

export const withAppRouterHighlight = isHighlightEnabled()
  ? AppRouterHighlight({
      projectID: highlightProjectId,
      serviceName: highlightBackendServiceName,
    })
  : passthrough;
