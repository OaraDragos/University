// Simple cookie-based tracking: stores a JSON object under 'app_tracking' cookie
export function getTracking() {
  try {
    const m = document.cookie.match(/(^|;)\s*app_tracking=([^;]+)/);
    if (!m) return {};
    return JSON.parse(decodeURIComponent(m[2]));
  } catch (e) {
    return {};
  }
}

export function setTracking(partial: Record<string, any>) {
  const current = getTracking();
  const next = { ...current, ...partial };
  document.cookie = `app_tracking=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

