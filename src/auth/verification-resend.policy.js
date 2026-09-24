export const VERIFICATION_CODE_TTL_SECONDS = 5 * 60;
export const VERIFICATION_RESEND_LIMIT = 3;
export const VERIFICATION_RESEND_WINDOW_SECONDS = 5 * 60;
export const VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

const STORAGE_PREFIX = 'furniture:verification-resend:v1:';
const memoryRecords = new Map();

const normalizeEmail = (email) => email.trim().toLowerCase();
const storageKey = (email) => `${STORAGE_PREFIX}${encodeURIComponent(normalizeEmail(email))}`;

function browserStorage() {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function sanitizeRecord(record) {
  return {
    attempts: Array.isArray(record?.attempts)
      ? record.attempts.filter((value) => Number.isFinite(value) && value >= 0)
      : [],
    lastSentAt: Number.isFinite(record?.lastSentAt) ? record.lastSentAt : null,
  };
}

function readRecord(email, storage) {
  const key = storageKey(email);
  try {
    const stored = storage?.getItem(key);
    if (stored) return sanitizeRecord(JSON.parse(stored));
  } catch {
    // Session storage can be unavailable in privacy-restricted browsers.
  }
  return sanitizeRecord(memoryRecords.get(key));
}

function writeRecord(email, record, storage) {
  const key = storageKey(email);
  const safeRecord = sanitizeRecord(record);
  memoryRecords.set(key, safeRecord);
  try {
    storage?.setItem(key, JSON.stringify(safeRecord));
  } catch {
    // The in-memory record still prevents accidental rapid repeats in this tab.
  }
}

export function getVerificationResendState(
  email,
  { now = Date.now(), storage = browserStorage() } = {},
) {
  const record = readRecord(email, storage);
  const windowStart = now - VERIFICATION_RESEND_WINDOW_SECONDS * 1000;
  const attempts = record.attempts.filter((timestamp) => timestamp > windowStart && timestamp <= now);
  const cooldownUntil = record.lastSentAt === null
    ? 0
    : record.lastSentAt + VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000;
  const limitUntil = attempts.length >= VERIFICATION_RESEND_LIMIT
    ? attempts[0] + VERIFICATION_RESEND_WINDOW_SECONDS * 1000
    : 0;
  const retryAt = Math.max(cooldownUntil, limitUntil);
  const retryAfterSeconds = Math.max(0, Math.ceil((retryAt - now) / 1000));

  return {
    canResend: retryAfterSeconds === 0 && attempts.length < VERIFICATION_RESEND_LIMIT,
    remaining: Math.max(0, VERIFICATION_RESEND_LIMIT - attempts.length),
    retryAfterSeconds,
  };
}

export function noteInitialVerificationCode(
  email,
  { sentAt = Date.now(), storage = browserStorage() } = {},
) {
  const record = readRecord(email, storage);
  if (record.lastSentAt === null || record.lastSentAt < sentAt) {
    writeRecord(email, { ...record, lastSentAt: sentAt }, storage);
  }
  return getVerificationResendState(email, { storage });
}

export function recordVerificationResend(
  email,
  { now = Date.now(), storage = browserStorage() } = {},
) {
  const state = getVerificationResendState(email, { now, storage });
  if (!state.canResend) return state;

  const record = readRecord(email, storage);
  const windowStart = now - VERIFICATION_RESEND_WINDOW_SECONDS * 1000;
  const attempts = record.attempts.filter((timestamp) => timestamp > windowStart && timestamp <= now);
  writeRecord(email, { attempts: [...attempts, now], lastSentAt: now }, storage);
  return getVerificationResendState(email, { now, storage });
}

export function clearVerificationResendState(email, storage = browserStorage()) {
  const key = storageKey(email);
  memoryRecords.delete(key);
  try {
    storage?.removeItem(key);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}
