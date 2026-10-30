/**
 * Normalize a JSONB array column: node-postgres returns parsed arrays for JSONB,
 * but legacy TEXT-encoded values are parsed defensively. Malformed data yields [].
 */
export function parseJsonArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
