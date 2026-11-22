import { defineConfig } from '@playwright/test';
const externalUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalUrl ?? 'http://127.0.0.1:3100';

export default defineConfig({
  testDir:'./tests', testMatch:['site.spec.ts','landing.spec.ts'], workers:2, timeout:90_000,
  expect:{timeout:10_000}, outputDir:'test-results/production',
  use:{baseURL,channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? 'msedge',trace:'retain-on-failure',
    reducedMotion:'reduce',launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
  webServer:externalUrl ? undefined : {
    command:'npm run build && npm run start -- --hostname 127.0.0.1 --port 3100',url:baseURL,timeout:240_000,
    env:{PLAYWRIGHT_NEXT_OUTPUT:'unconfigured',DATABASE_URL:'',NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'',CLERK_SECRET_KEY:''},
  },
});
