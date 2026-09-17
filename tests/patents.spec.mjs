import { test, expect } from '@playwright/test';
import { scrapePatents } from '../scripts/update-patents.mjs';

async function mockSearch(page, { status = 200, summary = 'Showing 1 to 4 of 4 records', titleMismatch = false } = {}) {
  const names = ['Duggaraju; Prakash', 'Duggaraju; Krishna Prakash', 'Duggaraju; Krishna', 'Duggaraju; Someone Else'];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/searches/generic') {
      await route.fulfill({ status, contentType: 'application/json', body: '{}' });
    } else if (url.pathname.startsWith('/document/')) {
      const index = Number(url.pathname.split('/').pop());
      await route.fulfill({ contentType: 'text/html', body: `<h2>${titleMismatch ? 'Wrong title' : `Patent ${index}`}</h2><p>Inventors:</p><p><strong>${names[index]}</strong></p>` });
    } else if (url.pathname === '/basic/') {
      await route.fulfill({ contentType: 'text/html', body: `
        <select id="searchField1"><option>Inventor name</option></select>
        <input id="searchText1">
        <button id="basicSearchBtn" onclick="fetch('/api/searches/generic')">Search</button>
        <div id="searchResults_info">${summary}</div>
        <table id="searchResults"><tbody>${names.map((name, index) => `
          <tr><td>${index}</td><td>US-${11063999 + index}-B2</td>
          <td><a aria-label="Open text link" href="/document/${index}">Text</a></td>
          <td>Patent ${index}</td><td></td><td>2021-07-13</td></tr>`).join('')}</tbody></table>` });
    } else {
      await route.abort();
    }
  });
}

test('patent scraper accepts confirmed aliases and excludes other inventors', async ({ page }) => {
  await mockSearch(page);
  const items = await scrapePatents(page);
  expect(items).toHaveLength(3);
  expect(items.map(item => item.inventors[0])).toEqual([
    'Duggaraju; Prakash', 'Duggaraju; Krishna Prakash', 'Duggaraju; Krishna',
  ]);
  expect(items[0]).toMatchObject({
    authority: 'US-11063999-B2', publicationDate: '2021-07-13', rightSide: '2021',
    authorityWebSite: 'https://patents.google.com/patent/US11063999B2/en',
  });
});

test('patent scraper stops on rate limits without retrying', async ({ page }) => {
  let searches = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/searches/generic') searches++; });
  await mockSearch(page, { status: 429 });
  await expect(scrapePatents(page)).rejects.toThrow('HTTP 429; cache unchanged');
  expect(searches).toBe(1);
});

test('patent scraper refuses incomplete results', async ({ page }) => {
  await mockSearch(page, { summary: 'Showing 1 to 4 of 5 records' });
  await expect(scrapePatents(page)).rejects.toThrow('Incomplete or paginated results');
});

test('patent scraper refuses mismatched document titles', async ({ page }) => {
  await mockSearch(page, { titleMismatch: true });
  await expect(scrapePatents(page)).rejects.toThrow('Title mismatch');
});