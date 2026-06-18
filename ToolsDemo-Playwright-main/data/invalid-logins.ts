export interface InvalidLoginCase {
  description: string;
  email: string;
  password: string;
  expectedError: RegExp | string;
}

export const INVALID_LOGIN_CASES: InvalidLoginCase[] = [
  {
    description: 'wrong password for valid account',
    email: 'customer@practicesoftwaretesting.com',
    password: 'wrongpassword',
    expectedError: /invalid email or password/i,
  },
  {
    description: 'non-existent account',
    email: 'nobody@example.com',
    password: 'welcome01',
    expectedError: /invalid email or password/i,
  },
  {
    description: 'SQL injection attempt in email',
    email: "' OR '1'='1",
    password: 'welcome01',
    expectedError: /invalid email or password|email.*invalid/i,
  },
  {
    description: 'blank email',
    email: '',
    password: 'welcome01',
    expectedError: /email.*required|please fill/i,
  },
  {
    description: 'blank password',
    email: 'customer@practicesoftwaretesting.com',
    password: '',
    expectedError: /password.*required|please fill/i,
  },
  {
    description: 'both fields blank',
    email: '',
    password: '',
    expectedError: /required|please fill/i,
  },
] as const;
