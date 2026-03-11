/**
 * Sanitize user input to prevent XSS and other attacks.
 */

const MAX_NAME_LENGTH = 50;
const DANGEROUS_CHARS = /[<>"'`\\;(){}[\]|&$#!*^~]/g;

export function sanitizeName(raw: string): string {
  // Decode URI component
  let name: string;
  try {
    name = decodeURIComponent(raw);
  } catch {
    name = raw;
  }

  // Trim whitespace
  name = name.trim();

  // Remove dangerous characters
  name = name.replace(DANGEROUS_CHARS, "");

  // Remove control characters
  name = name.replace(/[\x00-\x1F\x7F]/g, "");

  // Limit length
  if (name.length > MAX_NAME_LENGTH) {
    name = name.substring(0, MAX_NAME_LENGTH);
  }

  // Remove multiple spaces
  name = name.replace(/\s+/g, " ");

  return name;
}

/**
 * Capitalize the first letter of each word in the name for display.
 */
export function displayName(name: string): string {
  if (!name) return "";
  // For Bangla names, just return as-is
  if (/[\u0980-\u09FF]/.test(name)) return name;
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
