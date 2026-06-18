import { config } from '../config/config';

export const users = {
  customer: config.users.customer,
  admin: config.users.admin,
} as const;
