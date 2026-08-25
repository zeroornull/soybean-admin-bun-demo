export const UPDATE_CHECK_INTERVAL = 3 * 60 * 1000;

export function parseHtmlBuildTime(html: string) {
  return html.match(/<meta\s+name=["']buildTime["']\s+content=["']([^"']+)["'][^>]*>/i)?.[1] ?? null;
}

export function shouldNotifyUpdate(currentBuildTime: string, remoteBuildTime: string | null) {
  return Boolean(currentBuildTime && remoteBuildTime && currentBuildTime !== remoteBuildTime);
}

export async function readRemoteBuildTime(baseUrl: string, fetchImpl: typeof fetch = fetch) {
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  try {
    const response = await fetchImpl(`${prefix}index.html?t=${Date.now()}`);

    if (!response.ok) return null;

    return parseHtmlBuildTime(await response.text());
  } catch {
    return null;
  }
}

export function setupAppVersionNotification(options: {
  enabled: boolean;
  currentBuildTime: string;
  baseUrl: string;
  onUpdate: () => void;
  intervalMs?: number;
  fetchImpl?: typeof fetch;
}) {
  if (!options.enabled || typeof document === 'undefined') {
    return () => undefined;
  }

  let visiblePrompt = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  async function check() {
    if (visiblePrompt) return;

    const remote = await readRemoteBuildTime(options.baseUrl, options.fetchImpl);
    if (!shouldNotifyUpdate(options.currentBuildTime, remote)) return;

    visiblePrompt = true;
    options.onUpdate();
  }

  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      void check();
    }, options.intervalMs ?? UPDATE_CHECK_INTERVAL);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = undefined;
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      void check();
      start();
      return;
    }

    stop();
  };

  document.addEventListener('visibilitychange', onVisibility);

  if (document.visibilityState === 'visible') start();

  return () => {
    stop();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
