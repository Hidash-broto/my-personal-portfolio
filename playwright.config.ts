import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3470);

export default defineConfig({
    testDir: "e2e",
    timeout: 60_000,
    fullyParallel: true,
    reporter: [["list"]],
    use: { baseURL: `http://localhost:${PORT}`, colorScheme: "dark" },
    webServer: {
        command: `npm run build && npx next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
        env: { SHARE_SECRET: process.env.SHARE_SECRET ?? "e2e-secret-e2e-secret-e2e-secret-0123" },
    },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
        { name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    ],
});
