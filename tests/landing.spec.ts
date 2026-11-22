import { expect, test } from '@playwright/test';

test.use({reducedMotion:'reduce'});

const widths = [320, 375, 390, 430, 768, 1024, 1440, 1920, 3840];
const values = [
  'Vision Beyond Boundaries', 'Innovation & Technology', 'Integrity & Responsibility',
  'Excellence in Execution', 'Continuous Growth', 'Collaboration & Opportunity',
];

for (const width of widths) {
  test('landing content fits at ' + width + 'px', async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await expect(page.getByRole('heading',{level:1,name:/Building Businesses/})).toBeVisible();
    for (const value of values) await expect(page.getByRole('heading',{name:value,exact:true})).toBeVisible();
    const expected = ['landing-title','company-introduction','ecosystem-title','featured-title',
      'showcase-title','presence-title','philosophy-title','leadership-title','contact-title'];
    const order = await page.locator('.immersive-home > section').evaluateAll(sections =>
      sections.map(section => section.getAttribute('aria-labelledby') || section.id || section.querySelector('h2')?.textContent));
    expect(order).toEqual(expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width <= 920) {
      await page.getByRole('button',{name:'Open navigation'}).click();
      await expect(page.getByRole('link',{name:'Let’s Talk',exact:true})).toBeVisible();
      await page.getByRole('button',{name:'Business profiles'}).click();
      await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'ANAMSOFT'}).click();
      await expect(page).toHaveURL('/businesses/anamsoft');
    }
  });
}

test('landing anchor targets, primary CTAs and all internal link destinations resolve', async ({page,request}) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Built on Vision. Driven by Innovation.'})).toBeVisible();
  await expect(page.locator('.philosophy-section .home-editorial > div:nth-child(2) p')).toHaveText([
    'We believe entrepreneurship is more than starting businesses. It is about recognizing opportunities, solving real problems, and continuously creating value.',
    'Our philosophy is built around exploring new possibilities, developing meaningful business ventures, and embracing technology as a driver of progress.',
    'We bring together different business activities under one entrepreneurial vision while allowing each venture to develop its own identity, capabilities, and direction.',
  ]);
  await expect(page.locator('.landing-values-grid li p')).toHaveText([
    'We believe in thinking beyond traditional limitations, exploring new markets, and identifying opportunities across industries.',
    'We embrace modern technology, creativity, and forward-thinking approaches to build better solutions and business opportunities.',
    'We value honesty, transparency, accountability, and responsible business practices in every professional relationship.',
    'We believe strong ideas require thoughtful planning, consistent effort, and attention to detail to become meaningful results.',
    'We believe learning, adapting, and improving are essential to building sustainable businesses in a changing world.',
    'We value meaningful partnerships, professional relationships, and collaboration that create mutual opportunities.',
  ]);
  const localLinks = await page.locator('header a[href], main a[href], footer a[href]').evaluateAll(links =>
    [...new Set(links.map(link => link.getAttribute('href')).filter((href): href is string => Boolean(href?.startsWith('/'))))]);
  for (const href of localLinks) expect((await request.get(href)).status(),href).toBe(200);
  const jumps = page.getByRole('navigation',{name:'Main navigation'});
  for (const [label,id] of [
    ['About','about'],['Our Businesses','businesses'],['Products','featured-products'],
    ['CEO','leadership'],['Contact','contact'],['Home','home'],
  ]) {
    await jumps.getByRole('link',{name:label,exact:true}).click();
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    await expect(page.locator('#' + id)).toBeInViewport();
    await expect(jumps.getByRole('link',{name:label,exact:true})).toHaveAttribute('aria-current','location');
  }
  for (const [label,id] of [['Explore Our Businesses','businesses'],['Discover Our Story','about'],['Let’s Talk','contact']]) {
    await page.goto('/');
    await page.getByRole('link',{name:label,exact:true}).click();
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
  }
  for (const [label,path] of [
    ['View all businesses','/businesses'],['Read our story','/about'],
    ['Explore Our Products','/products'],['Explore Profile','/ceo'],['Get in Touch','/contact'],
    ['Privacy Policy','/privacy-policy'],['Terms and Conditions','/terms-and-conditions'],
  ]) {
    await page.goto('/');
    await page.getByRole('link',{name:label,exact:true}).click();
    await expect(page).toHaveURL(path);
  }
});

test('mobile links work without JavaScript and desktop disclosures close on focus exit', async ({browser,page,baseURL}) => {
  const context = await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:850}});
  try {
    const mobile = await context.newPage();
    await mobile.goto('/');
    await expect(mobile.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About'})).toBeVisible();
    await mobile.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About'}).click();
    await expect(mobile).toHaveURL(/#about$/);
  } finally {
    await context.close();
  }
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const disclosure = page.getByRole('button',{name:'Business profiles'});
  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded','true');
  const businessLinks = await page.locator('#business-menu').getByRole('link').all();
  expect(businessLinks.length).toBeGreaterThan(0);
  for (const link of businessLinks) {
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Products',exact:true})).toBeFocused();
  await expect(disclosure).toHaveAttribute('aria-expanded','false');
  expect(await page.locator('.landing-enter').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await expect(page.locator('.earth-poster img')).toBeVisible();
  await expect(page.locator('.earth-canvas')).toHaveCount(0);
});

test('market explorer responds to its markers, keyboard controls, and direct section links', async ({page}) => {
  const errors:string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const showcase = page.locator('#business-showcase');
  const detail = showcase.locator('.ecosystem-detail');
  await expect(page.getByRole('heading',{name:'Four Businesses. One Growing Ecosystem.'})).toBeVisible();
  const anamcart = page.locator('#businesses').getByRole('link',{name:'Visit ANAMCART',exact:true});
  await expect(anamcart).toHaveAttribute('href','https://anamcart.com/');
  await expect(anamcart).toHaveAttribute('rel','noopener noreferrer');
  await expect(detail.getByRole('link')).toHaveAttribute('href','/products');
  await showcase.getByRole('button',{name:'Select Spain'}).click();
  await expect(detail.getByRole('heading',{name:'ANAMIGO Fleet'})).toBeVisible();
  await expect(detail.getByRole('link')).toHaveAttribute('href','/businesses/anamigo-fleet');
  await showcase.getByRole('button',{name:'Select Bangladesh'}).click();
  await expect(detail.getByRole('heading',{name:'ANAMCART'})).toBeVisible();
  await expect(detail.getByRole('link')).toHaveAttribute('href','https://anamcart.com/');
  await showcase.getByRole('button',{name:'International / Remote'}).focus();
  await page.keyboard.press('Enter');
  await expect(detail.getByRole('heading',{name:'ANAMSOFT'})).toBeVisible();
  await page.locator('#global-presence').getByRole('link',{name:/United States/}).click();
  await expect(page).toHaveURL(/#market-ecommerce$/);
  await expect(showcase.getByRole('button',{name:'Amazon E-commerce'})).toHaveAttribute('aria-pressed','true');
  await showcase.getByRole('button',{name:'Select Spain'}).click();
  await page.locator('#global-presence').getByRole('link',{name:/United States/}).click();
  await expect(showcase.getByRole('button',{name:'Amazon E-commerce'})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('link',{name:'Home',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('Earth renders, responds to motion controls and falls back without WebGL', async ({page}) => {
  const errors:string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /THREE|hydrat/i.test(message.text())) errors.push(message.text());
  });
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(() => Object.defineProperty(navigator,'hardwareConcurrency',{get:() => 8}));
  await page.goto('/');
  const stage = page.locator('[data-earth-stage]');
  await expect(stage).toHaveAttribute('data-earth-state','live',{timeout:20_000});
  await expect(stage.locator('canvas')).toBeVisible();
  await page.getByRole('button',{name:'Pause background motion'}).click();
  await expect(stage.locator('canvas')).toHaveCount(0);
  await expect(stage.locator('.earth-poster')).toHaveCSS('opacity','1');
  await page.getByRole('button',{name:'Resume background motion'}).click();
  await expect(stage).toHaveAttribute('data-earth-state','live',{timeout:20_000});
  expect(errors).toEqual([]);

  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{
      value(this: HTMLCanvasElement,type: string,options?: unknown) {
        if (type === 'webgl2') {
          document.documentElement.dataset.webglChecked = 'true';
          return null;
        }
        return Reflect.apply(getContext,this,[type,options]);
      },
    });
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-webgl-checked','true');
  await expect(stage.locator('img')).toBeVisible();
  await expect.poll(() => stage.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(stage.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});
