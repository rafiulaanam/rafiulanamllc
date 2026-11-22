import {expect,test} from '@playwright/test';

const routes = [
  ['/', 'Building Businesses. Connecting Opportunities.'],
  ['/about','Building Businesses. Connecting Markets. Creating Digital Solutions.'],
  ['/businesses','Independent businesses. A shared vision.'],
  ['/businesses/ecommerce','E-commerce & Amazon Marketplace'],
  ['/businesses/anamigo-fleet','ANAMIGO Fleet'],
  ['/businesses/anamsoft','ANAMSOFT'],
  ['/businesses/anamcart','ANAMCART'],
  ['/products','Product catalogue.'],
  ['/ceo','Rafiul Anam'],
  ['/contact','Let’s talk.'],
  ['/privacy-policy','Privacy Policy'],
  ['/terms-and-conditions','Terms and Conditions'],
];
test('public routes, canonical and social metadata, sitemap, and missing product', async ({page,request}) => {
  for (const [url,name] of routes) {
    const response = await page.goto(url);
    expect(response?.status(),url).toBe(200);
    await expect(page.getByRole('heading',{level:1,name})).toBeVisible();
    const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
    expect(new URL(canonical ?? 'missing').pathname).toBe(url);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/RAFIUL ANAM LLC/);
  }
  const missing = await request.get('/products/unknown-item');
  expect(missing.status()).toBe(404);
  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain('/businesses/anamigo-fleet');
  expect(await sitemap.text()).toContain('/businesses/anamcart');
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin');
});
test('menu keyboard operation, catalogue empty state and unconfigured links', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Business profiles'}).click();
  const nav = page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.getByRole('link',{name:'ANAMIGO Fleet'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav.getByRole('link',{name:'ANAMIGO Fleet'})).toBeHidden();
  await expect(page.getByRole('button',{name:'Business profiles'})).toBeFocused();
  await page.getByRole('link',{name:'Explore Our Businesses',exact:true}).click();
  await expect(page).toHaveURL(/#businesses$/);
  await page.getByRole('link',{name:'View all businesses'}).click();
  await expect(page).toHaveURL('/businesses');
  await page.getByRole('link',{name:'Explore Products',exact:true}).click();
  await expect(page.getByText('Product listings are coming soon')).toBeVisible();
  await page.getByRole('searchbox').fill('unlisted');
  await page.getByRole('button',{name:'Apply filters'}).click();
  await expect(page.getByText('No matching products')).toBeVisible();
  await page.goto('/businesses/anamsoft');
  await expect(page.getByText('Official website link pending.')).toBeVisible();
  await expect(page.getByRole('link',{name:/visit anamsoft/i})).toHaveCount(0);
});
test('unconfigured contact and admin have explicit states and protected URLs redirect', async ({page,request}) => {
  await page.goto('/contact');
  await expect(page.getByText('The online inquiry form is currently unavailable.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Send inquiry'})).toHaveCount(0);
  for (const route of ['/admin','/admin/inquiries','/admin/products/new']) {
    await page.goto(route);
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByRole('heading',{name:'Admin sign-in'})).toBeVisible();
    await expect(page.getByText('Connect Neon and Clerk to enable administrator sign-in.')).toBeVisible();
  }
  const anonymous = await request.get('/api/admin/products');
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()['www-authenticate']).toBe('Bearer');
  const unconfigured = await request.get('/api/admin/products',{headers:{Authorization:'Bearer fixture.invalid'}});
  expect(unconfigured.status()).toBe(503);
});
for (const width of [320,375,430,768,1024,1440,1920]) {
  test('responsive public layout at ' + width + 'px', async ({page}) => {
    await page.setViewportSize({width,height:900});
    for (const route of ['/','/businesses','/products','/contact']) {
      await page.goto(route);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth),route).toBeLessThanOrEqual(width);
    }
    if (width <= 720) {
      await page.goto('/');
      const toggle = page.getByRole('button',{name:'Open navigation'});
      await toggle.click();
      await page.getByRole('button',{name:'Business profiles'}).click();
      await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'ANAMSOFT',exact:true}).click();
      await expect(page).toHaveURL('/businesses/anamsoft');
      await expect(page.getByRole('button',{name:'Open navigation'})).toBeVisible();
    }
  });
}
