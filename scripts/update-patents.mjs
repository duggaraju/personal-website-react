import { chromium } from '@playwright/test';
import { readFile, writeFile, rename, rm } from 'node:fs/promises';

const resumePath = new URL('../src/settings/resume.json', import.meta.url);
const searchUrl = 'https://ppubs.uspto.gov/basic/';
const lastName = 'Duggaraju';
const expectedInventors = ['Duggaraju; Prakash', 'Duggaraju; Krishna Prakash', 'Duggaraju; Krishna'];

export async function scrapePatents(page) {
  page.setDefaultTimeout(30000);
  await page.goto(searchUrl);
  await page.locator('#searchField1').selectOption({ label: 'Inventor name' });
  await page.locator('#searchText1').fill(lastName);
  const [searchResponse] = await Promise.all([
    page.waitForResponse(response => new URL(response.url()).pathname === '/api/searches/generic'),
    page.locator('#basicSearchBtn').click(),
  ]);
  if (!searchResponse.ok()) {
    throw new Error(`USPTO search returned HTTP ${searchResponse.status()}; cache unchanged. Retry later, not in a loop.`);
  }
  await page.locator('#searchResults tbody tr').first().waitFor();
  const summary = await page.locator('#searchResults_info').innerText();
  const counts = summary.match(/Showing ([\d,]+) to ([\d,]+) of ([\d,]+) records/);
  if (!counts || counts[1] !== '1' || counts[2] !== counts[3]) {
    throw new Error('Incomplete or paginated results; cache unchanged. Review the USPTO search manually.');
  }
  const records = await page.locator('#searchResults tbody tr').evaluateAll(rows => rows.map(row => {
    const cells = [...row.querySelectorAll('td')];
    return {
      authority: cells[1]?.textContent.trim(),
      title: cells[3]?.textContent.trim(),
      publicationDate: cells[5]?.textContent.trim(),
      textUrl: cells[2]?.querySelector('a[aria-label^="Open text link"]')?.href,
    };
  }));
  if (!records.length || records.length !== Number(counts[3].replaceAll(',', '')) ||
      new Set(records.map(record => record.authority)).size !== records.length) {
    throw new Error('Missing or duplicate records; cache unchanged.');
  }

  const items = [];
  for (const record of records) {
    if (!/^US-\d+-(A1|B1|B2)$/.test(record.authority) || !record.title ||
        !/^\d{4}-\d{2}-\d{2}$/.test(record.publicationDate) ||
        !record.textUrl || new URL(record.textUrl).origin !== 'https://ppubs.uspto.gov') {
      throw new Error('Unexpected USPTO record format; cache unchanged.');
    }
    const response = await page.goto(record.textUrl);
    if (!response?.ok()) {
      throw new Error(`USPTO document returned HTTP ${response?.status()}; cache unchanged. Retry later.`);
    }
    const inventors = await page.getByText('Inventors:', { exact: true }).evaluate(label =>
      [...label.nextElementSibling.querySelectorAll('strong')].map(element => element.textContent.trim()));
    if (!inventors.length) throw new Error(`Missing inventor names for ${record.authority}; cache unchanged.`);
    if (!inventors.some(inventor => expectedInventors.some(expected => inventor.toLowerCase() === expected.toLowerCase()))) {
      console.log(`Excluded ${record.authority}: no confirmed inventor name.`);
      continue;
    }
    const title = (await page.locator('h2').first().innerText()).trim();
    if (title.toLowerCase() !== record.title.toLowerCase()) {
      throw new Error(`Title mismatch for ${record.authority}; cache unchanged.`);
    }
    items.push({
      title,
      authority: record.authority,
      authorityWebSite: `https://patents.google.com/patent/${record.authority.replaceAll('-', '')}/en`,
      rightSide: record.publicationDate.slice(0, 4),
      publicationDate: record.publicationDate,
      inventors,
    });
    console.log(`${record.authority} | ${record.publicationDate} | ${title} | inventor verified`);
  }
  if (!items.length) throw new Error('No verified inventor records; cache unchanged.');
  return items.sort((first, second) => second.publicationDate.localeCompare(first.publicationDate) || first.authority.localeCompare(second.authority));
}

async function main() {
  const options = process.argv.slice(2);
  if (options.some(option => !['--write', '--allow-removals'].includes(option))) {
    throw new Error('Usage: node scripts/update-patents.mjs [--write] [--allow-removals]');
  }
  const original = await readFile(resumePath, 'utf8');
  const resume = JSON.parse(original);
  const browser = await chromium.launch();
  try {
    const items = await scrapePatents(await browser.newPage());
    const removed = resume.patents.items.filter(item => !items.some(record => record.authority === item.authority));
    const added = items.filter(item => !resume.patents.items.some(record => record.authority === item.authority));
    console.log(`Verified ${items.length} records. Added: ${added.map(item => item.authority).join(', ') || 'none'}`);
    console.log(`Removed: ${removed.map(item => item.authority).join(', ') || 'none'}`);
    if (options.includes('--write')) {
      if (removed.length && !options.includes('--allow-removals')) {
        throw new Error('Review missing records before using --write --allow-removals; cache unchanged.');
      }
      resume.patents.items = items;
      resume.patents.description = 'Patents and published applications';
      resume.patents.source = { url: searchUrl, query: `(${lastName}).in.`, inventorNames: expectedInventors, checkedAt: new Date().toISOString(), verification: 'Search results and individual document inventor sections' };
      if (await readFile(resumePath, 'utf8') !== original) {
        throw new Error('Resume changed during lookup; cache unchanged.');
      }
      const temporary = new URL(`../src/settings/resume.${process.pid}.tmp`, import.meta.url);
      try {
        await writeFile(temporary, `${JSON.stringify(resume, null, 4)}\n`, { flag: 'wx' });
        await rename(temporary, resumePath);
      } finally {
        await rm(temporary, { force: true });
      }
      console.log('Updated cached patent records in resume.json. Review the diff before publishing.');
    } else {
      console.log('Preview only; no files changed. Use --write to update the cache.');
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.main) {
  main().catch(error => {
    console.error(error.message.replace(/https:\/\/\S+/g, '[URL omitted]'));
    process.exitCode = 1;
  });
}