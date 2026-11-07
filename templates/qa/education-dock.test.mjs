// Run where playwright-core resolves; CHROME may override the executable.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(process.env.DIORAMA_TEST_PACKAGE || import.meta.url);
const { chromium } = require('playwright-core');
const source = await readFile(new URL('../education-dock.mjs', import.meta.url), 'utf8');
const css = await readFile(new URL('../education-dock.css', import.meta.url), 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
 for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setContent('<main id="mount"></main>'); await page.addStyleTag({ content: css });
  await page.evaluate(async ({ source }) => {
    const { createEducationDock } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
    window.calls = []; document.body.addEventListener('pointerdown', () => calls.push('leaked'));
    const steps = [{ id: 'a', title: 'Input moves', phase: 0, partId: 'input', result: 'The input pushes the link.' },
      { id: 'b', title: 'Output follows', phase: 1, partId: 'output', result: 'The link moves the output.' }];
    window.dock = createEducationDock({ mount: document.querySelector('#mount'), title: 'Link lesson',
      summary: 'Input → link → output', steps, parts: [{ id: 'input', label: 'Input' }, { id: 'output', label: 'Output' }],
      freeze(phase) { calls.push(['freeze', phase]); return { phase, stepId: phase < .5 ? 'a' : 'b', readout: `Phase ${phase}` }; },
      selectPart(id) { calls.push(['select', id]); }, setPlaying(p) { calls.push(['playing', p]); }, resetView() { calls.push('reset'); } });
    dock.sync({ phase: 0, stepId: 'a', readout: 'Phase 0' });
  }, { source });
  const disclosure = page.getByText('How it works', { exact: true });
  await disclosure.focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Output follows', exact: true }).focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('output').textContent(), 'Phase 1');
  assert.equal(await page.locator('[aria-current=step]').textContent(), 'Output follows');
  assert.equal(await page.locator('select').inputValue(), 'output');
  await page.locator('input').fill('0');
  assert.equal(await page.locator('output').textContent(), 'Phase 0');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Pause', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Reset view' }).click();
  await page.locator('select').selectOption('output');
  assert(await page.evaluate(() => calls.some(c => c[0] === 'select' && c[1] === 'output')));
  assert(await page.evaluate(() => calls.includes('reset')));
  assert(!await page.evaluate(() => calls.includes('leaked')));
  if (process.env.DIORAMA_SHOTS) await page.screenshot({ path: `${process.env.DIORAMA_SHOTS}/dock-${viewport.width}.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false);
  assert(await page.locator('input').evaluate(e => e.labels.length === 1));
  await page.evaluate(() => { dock.dispose(); });
  assert.equal(await page.locator('.education-dock').count(), 0);
  assert.deepEqual(errors, []); await page.close();
 }
 console.log('PASS: 1280/390/320px, keyboard disclosure/step, frozen state sync, scrub, play, picker, reset, event isolation, disposal, reduced-motion');
} finally { await browser.close(); }
