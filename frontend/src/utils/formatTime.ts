export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return 'calculating...';
  if (seconds < 60) {
    return `~${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.round(seconds % 60);
  if (mins < 60) {
    return `~${mins}m ${remSecs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `~${hours}h ${remMins}m`;
}
