import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string) || "https://app.posthog.com";

let initialized = false;

function init(): void {
  if (initialized || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, autocapture: false });
  initialized = true;
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  try {
    init();
    if (!POSTHOG_KEY) return;
    posthog.capture(event, properties);
  } catch {
    // analytics errors must never crash the app
  }
}
