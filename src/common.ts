export function formatNumber(value: number): string | number {
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value;
}
