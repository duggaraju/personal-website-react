import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import resume from '../src/settings/resume.json' with { type: 'json' };

const screenshotRoot = path.resolve('screenshots');
const browserErrors = new WeakMap();

async function capture(page, name, testInfo) {
  await page.evaluate(() => document.fonts.ready);
  const directory = path.join(screenshotRoot, 'checks');
  await mkdir(directory, { recursive: true });
  const filename = `${name}-${testInfo.project.name}-${testInfo.title.includes('dark') ? 'dark' : 'light'}.png`;
  const screenshot = await page.screenshot({ path: path.join(directory, filename), fullPage: true });
  await testInfo.attach(filename, { body: screenshot, contentType: 'image/png' });
  return { filename, screenshot };
}

async function pixelStats(page, screenshot) {
  return page.evaluate(async encoded => {
    const image = new Image();
    image.src = `data:image/png;base64,${encoded}`;
    await image.decode();
    const sample = document.createElement('canvas');
    sample.width = 64;
    sample.height = 64;
    const context = sample.getContext('2d');
    context.drawImage(image, 0, 0, 64, 64);
    const pixels = context.getImageData(0, 0, 64, 64).data;
    const colors = new Set();
    for (let offset = 0; offset < pixels.length; offset += 4) {
      colors.add(`${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]}`);
    }
    return colors.size;
  }, screenshot.toString('base64'));
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'warning' && /^\[\.WebGL-0x[\da-f]+\]GL Driver Message \(OpenGL, Performance, GL_CLOSE_PATH_NV, High\): GPU stall due to ReadPixels(?: \(this message will no longer repeat\))?$/.test(message.text())) return;
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  await page.emulateMedia({ colorScheme: 'light' });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

for (const theme of ['light', 'dark']) {
  test(`home ${theme}: render, canvas, theme persistence and navigation`, async ({ page }, testInfo) => {
    await page.goto('/');
    if (theme === 'dark') await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText("Hey, I'm Prakash");
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Software Engineer and Video Developer');
    await expect(page.locator('canvas')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const canvas = page.locator('canvas');
    const firstFrame = await canvas.screenshot();
    expect(await pixelStats(page, firstFrame)).toBeGreaterThan(32);
    await page.mouse.move(100, 100);
    await page.mouse.move(300, 250);
    const nextFrame = await canvas.screenshot();
    expect(nextFrame.equals(firstFrame)).toBe(false);
    await capture(page, 'home', testInfo);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dark')))).toBe(theme === 'dark');
    await page.getByRole('link', { name: 'Prakash Duggaraju', exact: true }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('background-color', theme === 'dark' ? /^rgba?\(17, 17, 17(?:, 1)?\)$/ : /^rgba?\(250, 250, 250(?:, 1)?\)$/);
    await page.goBack();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
  });

  test(`resume ${theme}: sections, assets, links and screenshot`, async ({ page }, testInfo) => {
    await page.addInitScript(theme => localStorage.setItem('dark', JSON.stringify(theme === 'dark')), theme);
    await page.goto('/resume');
    for (const name of ['Profile', 'Experience', 'Education', 'Skills', 'Languages', 'Interests', 'Patents']) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.getByRole('link', { name: 'duggaraju@gmail.com' })).toHaveAttribute('href', 'mailto:duggaraju@gmail.com');
    const patents = page.getByRole('table', { name: 'Patents and publications' });
    await expect(patents.locator('tbody tr')).toHaveCount(11);
    await expect(patents.getByText('US-20190342360-A1', { exact: true })).toHaveCount(0);
    await expect(patents.getByText('US-11063999-B2', { exact: true })).toBeVisible();
    await expect(patents.getByText('US-10382512-B2', { exact: true })).toBeVisible();
    await expect(patents.getByRole('cell', {
      name: 'US-20140351871-A1 Published application',
      exact: true,
    })).toBeVisible();
    const hiddenPublications = Object.entries(resume.patents.publicationGrants).filter(([, grant]) =>
      resume.patents.items.some(item => item.authority === grant && /-B[12]$/.test(item.authority))
    ).map(([publication]) => publication);
    const visibleItems = resume.patents.items.filter(item => !hiddenPublications.includes(item.authority));
    await expect(patents.locator('tbody tr')).toHaveCount(visibleItems.length);
    await expect(patents.getByRole('link')).toHaveCount(visibleItems.length);
    await expect(patents.getByText('Published application', { exact: true })).toHaveCount(visibleItems.filter(item => item.authority.endsWith('-A1')).length);
    for (const item of resume.patents.items) {
      const row = patents.locator('tbody tr').filter({ hasText: item.authority });
      if (hiddenPublications.includes(item.authority)) {
        await expect(row).toHaveCount(0);
        continue;
      }
      await expect(row.getByRole('link')).toHaveAttribute('href', `https://patents.google.com/patent/${item.authority.replaceAll('-', '')}/en`);
      await expect(row).toContainText(item.publicationDate.slice(0, 4));
    }
    await expect(patents.locator('tbody tr').first()).toHaveCSS('display', testInfo.project.name === 'mobile' ? 'grid' : 'table-row');
    await capture(page, 'resume', testInfo);
    await page.evaluate(() => { window.print = () => { window.printRequested = true; }; });
    await page.getByRole('button', { name: 'Print or save resume as PDF' }).click();
    expect(await page.evaluate(() => window.printRequested)).toBe(true);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('navigation', { name: 'Resume actions' })).toBeHidden();
    await expect(page.getByRole('main')).toHaveCSS('color', 'rgb(17, 17, 17)');
    await expect(page.getByRole('main')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await expect(patents.getByRole('columnheader', { name: 'Patent / Publication' })).toBeVisible();
    await expect(patents.locator('tbody tr').first()).toHaveCSS('display', 'table-row');
    if (testInfo.project.name === 'desktop') {
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
      await testInfo.attach(`resume-${theme}.pdf`, { body: pdf, contentType: 'application/pdf' });
    }
    await page.emulateMedia({ media: 'screen' });
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dark')))).toBe(theme === 'dark');
  });

  test(`not-found ${theme}: render and return home`, async ({ page }, testInfo) => {
    await page.addInitScript(theme => localStorage.setItem('dark', JSON.stringify(theme === 'dark')), theme);
    await page.goto('/missing-page');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await capture(page, 'not-found', testInfo);
    await page.getByRole('link', { name: 'Return home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
  });
}

test('background fallback: reduced motion and live preference changes', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    window.webglRequests = 0;
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl2') window.webglRequests++;
      return getContext.call(this, type, ...args);
    };
  });
  await page.goto('/');
  const fallback = page.locator('img.displacement-sphere--fallback');
  await expect(fallback).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.evaluate(() => window.webglRequests)).toBe(0);
  for (const theme of ['light', 'dark']) {
    await expect(fallback).toHaveJSProperty('complete', true);
    await expect.poll(() => fallback.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await expect.poll(() => fallback.evaluate(image => image.currentSrc)).toContain(`sphere-${testInfo.project.name}-${theme}.webp`);
    const screenshotOptions = {
      style: 'body *:not(:has(.displacement-sphere)):not(.displacement-sphere) { opacity: 0 !important; transition: none !important; animation: none !important; }',
    };
    const firstFrame = await page.screenshot(screenshotOptions);
    expect(await pixelStats(page, firstFrame)).toBeGreaterThan(32);
    await page.mouse.move(100, 100);
    const nextFrame = await page.screenshot(screenshotOptions);
    await testInfo.attach(`static-${theme}-first`, { body: firstFrame, contentType: 'image/png' });
    await testInfo.attach(`static-${theme}-next`, { body: nextFrame, contentType: 'image/png' });
    expect(nextFrame.equals(firstFrame)).toBe(true);
    await page.screenshot({ animations: 'disabled' });
    await capture(page, `fallback-${theme}`, testInfo);
    if (theme === 'light') await page.getByRole('button', { name: 'Toggle theme' }).click();
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('canvas')).toBeVisible();
  await expect(fallback).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(fallback).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Prakash Duggaraju', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
});

for (const failure of ['unavailable', 'throws']) {
  test(`background fallback: WebGL ${failure}`, async ({ page }) => {
    await page.addInitScript(failure => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type === 'webgl2') {
          if (failure === 'throws') throw new Error('WebGL disabled');
          return null;
        }
        return getContext.call(this, type, ...args);
      };
    }, failure);
    await page.goto('/');
    const fallback = page.locator('img.displacement-sphere--fallback');
    await expect(fallback).toBeVisible();
    await expect.poll(() => fallback.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(fallback).toHaveAttribute('src', /dark\.webp$/);
    await page.getByRole('link', { name: 'Prakash Duggaraju', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  });
}

test('background fallback: context loss', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCSS('opacity', '1');
  await page.locator('canvas').evaluate(canvas => {
    const extension = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Context-loss simulation unavailable');
    extension.loseContext();
  });
  const fallback = page.locator('img.displacement-sphere--fallback');
  await expect(fallback).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(fallback).toHaveAttribute('src', /dark\.webp$/);
});

test('background fallback: missing image retains usable themed page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/backgrounds/*.webp', route => route.fulfill({ contentType: 'image/webp', body: '' }));
  await page.goto('/');
  await expect(page.locator('img.displacement-sphere--fallback')).toHaveCSS('visibility', 'hidden');
  await expect(page.getByRole('heading', { level: 1 })).toContainText("Hey, I'm Prakash");
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('body')).toHaveCSS('background-color', /^rgba?\(17, 17, 17(?:, 1)?\)$/);
  await page.getByRole('link', { name: 'Prakash Duggaraju', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
});

test('mobile social links: accessible names and destinations', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await page.getByRole('button', { name: 'SpeedDial', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/duggaraju');
  for (const name of ['Google', 'LinkedIn', 'GitHub', 'Twitter']) {
    const action = page.getByRole('menuitem', { name, exact: true });
    await expect(action).toBeVisible();
    await expect(action).toHaveAttribute('href', /^(https?:|mailto:)/);
    await expect(action).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'SpeedDial', exact: true })).toHaveAttribute('aria-expanded', 'false');
});