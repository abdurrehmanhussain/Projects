/**
 * Configuration file for the Playwright automation framework
 * Modify these values according to your environment needs
 */

// Load environment variables from .env file if it exists
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional, continue without it
}

export const config = {
  // Base URL for the application under test
  baseURL: process.env.BASE_URL || 'https://www.automationexercise.com',

  // Browser configuration
  browser: {
    // Options: 'chromium', 'firefox', 'webkit', or 'all'
    name: process.env.BROWSER || 'chromium',
    headless: process.env.HEADLESS !== 'false',
  },

  // Timeout configurations (in milliseconds)
  timeouts: {
    navigation: 30000,
    action: 10000,
    assertion: 5000,
  },

  // Test data for Automation Exercise
  testData: {
    user: {
      name: 'Abdur Rehman Hussain',
      email: 'it.abdurrehmanhussain@gmail.com',
      password: 'Test@123',
      firstName: 'Abdur Rehman',
      lastName: 'Hussain',
      company: 'Tech Solutions',
      address: 'Lahore',
      address2: 'Near Model Town',
      country: 'United States',
      state: 'Punjab',
      city: 'Lahore',
      zipcode: '54000',
      mobileNumber: '03001234567',
    },
    searchProduct: 'Blue Top',
    productToAdd: 'Blue Top',
  },

  // Environment-specific configurations
  environments: {
    dev: {
      baseURL: 'https://www.automationexercise.com',
    },
    staging: {
      baseURL: 'https://www.automationexercise.com',
    },
    prod: {
      baseURL: 'https://www.automationexercise.com',
    },
  },
};

