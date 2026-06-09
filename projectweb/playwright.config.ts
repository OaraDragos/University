import { defineConfig } from '@playwright/test';

const devCommand =
  process.platform === 'win32'
    ? 'npm.cmd run dev -- --host 127.0.0.1 --port 4173'
    : 'npm run dev -- --host 127.0.0.1 --port 4173';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  webServer: {
    command: devCommand,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
