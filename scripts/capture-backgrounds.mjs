import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch();
const output = new URL('../public/backgrounds/', import.meta.url);
await mkdir(output, { recursive: true });

try {
  for (const [layout, viewport] of Object.entries({
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  })) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
      await page.addInitScript(theme => localStorage.setItem('dark', JSON.stringify(theme === 'dark')), theme);
      await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
      await page.clock.pauseAt(new Date('2026-09-16T12:00:01Z'));
      await page.goto(process.env.SITE_URL || 'http://127.0.0.1:5175/');
      await page.clock.runFor(5000);
      const frame = await page.locator('canvas').screenshot({
        animations: 'disabled',
        style: 'body *:not(:has(.displacement-sphere)):not(.displacement-sphere) { opacity: 0 !important; transition: none !important; animation: none !important; }',
      });
      const encoded = await page.evaluate(async png => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', 0.85).split(',')[1];
      }, frame.toString('base64'));
      const bytes = Buffer.from(encoded, 'base64');
      await writeFile(new URL(`sphere-${layout}-${theme}.webp`, output), bytes);
      console.log(`${layout} ${theme}: ${bytes.length} bytes`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}