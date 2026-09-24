import { getPasswordPolicyError } from './password.policy.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const splitFullName = (fullName) => {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: nameParts[0] ?? '',
    lastName: nameParts.slice(1).join(' '),
  };
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Enter your password.';
  }

  return errors;
};

export const validateRegistration = ({ fullName, email, password, acceptedTerms }) => {
  const errors = validateLogin({ email, password });
  const normalizedEmail = email.trim();

  if (!normalizedEmail || normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Enter a valid email address you can access so we can send your verification code.';
  }

  if (!fullName.trim()) {
    errors.fullName = 'Enter your full name.';
  } else if (splitFullName(fullName).firstName.length > 100) {
    errors.fullName = 'Your first name must be 100 characters or fewer.';
  } else if (splitFullName(fullName).lastName.length > 100) {
    errors.fullName = 'Your last name must be 100 characters or fewer.';
  }

  const passwordError = password ? getPasswordPolicyError(password) : null;
  if (passwordError) errors.password = passwordError;

  if (!acceptedTerms) {
    errors.acceptedTerms = 'You must agree before creating an account.';
  }

  return errors;
};

const FIELD_NAMES = ['email', 'password', 'firstName', 'lastName'];

export const getServerFieldErrors = (error) => {
  const fieldErrors = {};

  for (const detail of error?.details ?? []) {
    if (detail && typeof detail === 'object') {
      const field = detail.field ?? detail.path?.[0];
      const message = detail.message;

      if (FIELD_NAMES.includes(field) && typeof message === 'string') {
        fieldErrors[field] = message;
      }
      continue;
    }

    if (typeof detail !== 'string') continue;

    const field = FIELD_NAMES.find((name) =>
      detail.toLowerCase().includes(name.toLowerCase()),
    );

    if (field) fieldErrors[field] = detail;
  }

  if (fieldErrors.firstName || fieldErrors.lastName) {
    fieldErrors.fullName = fieldErrors.firstName ?? fieldErrors.lastName;
    delete fieldErrors.firstName;
    delete fieldErrors.lastName;
  }

  return fieldErrors;
};
