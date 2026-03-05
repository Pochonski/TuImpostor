import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'node server-dev.js',
    port: 5174,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    ...devices['iPhone 13'],
  },
});
