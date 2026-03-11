/**
 * Deterministic hash function for generating consistent predictions from a name.
 * Uses a simple but effective string hashing algorithm.
 */
export function hashName(name: string): number {
  const normalized = name.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic index from a name for a given array length.
 */
export function getIndexFromName(name: string, arrayLength: number): number {
  return hashName(name) % arrayLength;
}
