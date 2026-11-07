export function formatNumber(value: number): string | number {
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value;
}

export function getStaticAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (
    path.startsWith("blob:") ||
    path.startsWith("data:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (backendUrl) {
    const cleanBase = backendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }

  return path;
}

export function getClientLocaleContext(): { timezone?: string; locale?: string } {
  const timezone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
  const locale = typeof navigator !== "undefined" ? navigator.language : undefined;
  return { timezone, locale };
}
