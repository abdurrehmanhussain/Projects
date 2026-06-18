import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper utility functions for test automation
 */

/**
 * Generate a timestamp string for file naming
 * @returns Timestamp string in format: YYYY-MM-DD_HH-MM-SS
 */
export function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '-');
}

/**
 * Ensure a directory exists, create if it doesn't
 * @param dirPath - The directory path to ensure
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate a random string
 * @param length - The length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate a random email address
 * @returns Random email address
 */
export function generateRandomEmail(): string {
  return `test${generateRandomString(8)}@example.com`;
}

/**
 * Wait for a specific amount of time
 * @param milliseconds - Time to wait in milliseconds
 */
export async function waitFor(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Read JSON file
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON object
 */
export function readJSONFile<T>(filePath: string): T {
  const fullPath = path.resolve(filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(fileContent) as T;
}

/**
 * Write JSON file
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 */
export function writeJSONFile(filePath: string, data: any): void {
  const fullPath = path.resolve(filePath);
  ensureDirectoryExists(path.dirname(fullPath));
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

