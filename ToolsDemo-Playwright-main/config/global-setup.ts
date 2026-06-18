import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup file that runs before all tests
 * This ensures all necessary directories exist
 */
async function globalSetup(config: FullConfig) {
  // Create necessary directories
  const directories = [
    'screenshots',
    'reports',
    'allure-results',
    'test-results',
  ];

  directories.forEach(dir => {
    const dirPath = path.resolve(dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  });

  console.log('Global setup completed');
}

export default globalSetup;

