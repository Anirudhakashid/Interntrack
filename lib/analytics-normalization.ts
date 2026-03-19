const DEFAULT_FALLBACK = "Not Specified";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getLabelScore(value: string) {
  const trimmed = collapseWhitespace(value);
  if (!trimmed) return 0;

  let score = 0;
  if (trimmed === toTitleCase(trimmed)) score += 3;
  if (/^[A-Z0-9&().,\- ]+$/.test(trimmed) && trimmed.length <= 10) score += 3;
  if (/^[A-Z]/.test(trimmed)) score += 1;
  if (trimmed === trimmed.toLowerCase()) score -= 1;

  return score;
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getNormalizedAnalyticsKey(
  value: string | null | undefined,
  fallback = DEFAULT_FALLBACK,
) {
  const normalized = collapseWhitespace(value ?? "");
  return normalized ? normalized.toLowerCase() : fallback.toLowerCase();
}

export function getAnalyticsDisplayLabel(
  value: string | null | undefined,
  fallback = DEFAULT_FALLBACK,
) {
  const normalized = collapseWhitespace(value ?? "");
  return normalized || fallback;
}

export function getPreferredAnalyticsLabel(
  current: string | undefined,
  candidate: string | null | undefined,
  fallback = DEFAULT_FALLBACK,
) {
  const nextLabel = getAnalyticsDisplayLabel(candidate, fallback);
  if (!current) return nextLabel;

  const currentScore = getLabelScore(current);
  const nextScore = getLabelScore(nextLabel);

  if (nextScore > currentScore) return nextLabel;
  if (nextScore === currentScore && nextLabel.length < current.length) {
    return nextLabel;
  }

  return current;
}
