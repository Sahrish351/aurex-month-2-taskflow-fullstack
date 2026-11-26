export function isPlainString(value) {
  return typeof value === 'string';
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseOptionalDate(value) {
  if (value === null || value === undefined || value === '') {
    return { valid: true, date: null };
  }
  if (typeof value !== 'string' && !(value instanceof Date)) {
    return { valid: false, date: null };
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, date: null };
  }
  return { valid: true, date: parsed };
}
