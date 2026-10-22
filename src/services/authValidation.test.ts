import { describe, it, expect } from 'vitest';

export const validateRegistrationInput = (username: string, email: string, pass: string, confirm: string) => {
  if (!username || username.trim().length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!email || !email.includes('@') || !email.includes('.')) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (!pass || pass.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  if (pass !== confirm) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true, error: null };
};

describe('Authentication Validation Tests', () => {
  it('validates a correct registration payload', () => {
    const res = validateRegistrationInput('sridharan', 'sridharan@campus.edu', 'SecurePass123', 'SecurePass123');
    expect(res.valid).toBe(true);
    expect(res.error).toBeNull();
  });

  it('rejects short usernames', () => {
    const res = validateRegistrationInput('ab', 'test@campus.edu', 'SecurePass123', 'SecurePass123');
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/at least 3 characters/i);
  });

  it('rejects invalid email formats', () => {
    const res = validateRegistrationInput('sridharan', 'not-an-email', 'SecurePass123', 'SecurePass123');
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/valid email/i);
  });

  it('rejects passwords shorter than policy', () => {
    const res = validateRegistrationInput('sridharan', 'test@campus.edu', '12345', '12345');
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/at least 6 characters/i);
  });

  it('rejects mismatched password and confirm password', () => {
    const res = validateRegistrationInput('sridharan', 'test@campus.edu', 'SecurePass123', 'DifferentPass456');
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/passwords do not match/i);
  });
});
