import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',

  browser: {
    name: process.env.BROWSER || 'chromium',
    headless: process.env.HEADLESS !== 'false',
  },

  timeouts: {
    navigation: 30_000,
    action: 30_000,
    assertion: 15_000,
  },

  users: {
    customer: {
      email: process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com',
      password: process.env.CUSTOMER_PASSWORD || 'welcome01',
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com',
      password: process.env.ADMIN_PASSWORD || 'welcome01',
    },
  },

  authStatePath: path.join(process.env.AUTH_STATE_DIR || '.auth', 'customer.json'),
};
