export const PASSWORD_POLICY = Object.freeze({
  minLength: 8,
  maxLength: 128,
});

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  'qwerty123',
  'letmein',
  'admin123',
  'welcome123',
]);

export const getPasswordChecks = (password = '') => ({
  length: password.length >= PASSWORD_POLICY.minLength,
  letter: /[A-Za-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9\s]/.test(password),
  maximum: password.length <= PASSWORD_POLICY.maxLength,
});

export const getPasswordPolicyError = (password) => {
  if (typeof password !== 'string') return 'Enter a password.';
  const checks = getPasswordChecks(password);
  if (!checks.maximum) return `Use no more than ${PASSWORD_POLICY.maxLength} characters.`;
  if (!checks.length || !checks.letter || !checks.number || !checks.special) {
    return `Use ${PASSWORD_POLICY.minLength}–${PASSWORD_POLICY.maxLength} characters with at least one letter, number, and special character.`;
  }
  return null;
};

export const getPasswordStrength = (password = '') => {
  if (!password) return { level: 0, label: 'Enter a password', checks: getPasswordChecks(password) };

  const checks = getPasswordChecks(password);
  const normalized = password.toLowerCase();
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasLongRun = /(.)\1{2,}/.test(password);
  const hasSequence = /(?:1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwerty)/i.test(password);
  const isCommon = COMMON_PASSWORDS.has(normalized);

  let score = Object.values(checks).filter(Boolean).length;
  if (password.length >= 12) score += 2;
  if (password.length >= 16) score += 2;
  if (hasMixedCase) score += 1;
  if (hasLongRun) score -= 2;
  if (hasSequence) score -= 2;
  if (isCommon) score -= 4;

  const meetsPolicy = checks.length && checks.letter && checks.number && checks.special && checks.maximum;
  let level = 1;
  if (meetsPolicy && score >= 6) level = 2;
  if (meetsPolicy && password.length >= 12 && score >= 8) level = 3;
  if (meetsPolicy && password.length >= 16 && score >= 10 && !hasLongRun && !hasSequence && !isCommon) level = 4;

  return {
    level,
    label: ['Enter a password', 'Weak', 'Fair', 'Strong', 'Very strong'][level],
    checks,
  };
};
