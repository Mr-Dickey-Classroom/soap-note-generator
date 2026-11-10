import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}/`, trace: 'off' },
  webServer: {
    command: `node tests/support/server.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'node', testMatch: /.*\.unit\.spec\.js/ },
    { name: 'chromium', testIgnore: /.*\.unit\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
  ],
});
