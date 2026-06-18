import { FullConfig } from '@playwright/test';

/**
 * Global teardown file that runs after all tests
 * Can be used for cleanup tasks
 */
async function globalTeardown(config: FullConfig) {
  console.log('Global teardown completed');
}

export default globalTeardown;

