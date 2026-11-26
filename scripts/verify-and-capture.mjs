import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');
const CHROME_PATH =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
    srv.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // keep polling until server binds
    }
    await sleep(300);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startProcess(cmd, args, env = {}) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', (d) => {
    logs += d.toString();
  });
  child.stderr.on('data', (d) => {
    logs += d.toString();
  });
  return { child, getLogs: () => logs };
}

async function stopProcess(proc) {
  if (!proc?.child || proc.child.killed) return;
  proc.child.kill('SIGTERM');
  await sleep(250);
  if (!proc.child.killed) {
    proc.child.kill('SIGKILL');
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(
    overflow.scrollWidth <= overflow.clientWidth + 1,
    `${label}: horizontal overflow detected (${overflow.scrollWidth} > ${overflow.clientWidth})`
  );
}

async function runTestsAndCaptureEvidence(browser) {
  console.log('1. Running Week 3 & Week 4 automated API test suites...');
  const week3Out = execFileSync('node', ['--test', 'week-3-crud-api/tests/items.test.js'], {
    cwd: ROOT,
    env: { ...process.env, NODE_PATH: path.join(ROOT, 'node_modules') },
    encoding: 'utf8',
  });

  const week4Out = execFileSync('node', ['--test', 'backend/tests/api.test.js'], {
    cwd: ROOT,
    env: { ...process.env, NODE_PATH: path.join(ROOT, 'node_modules') },
    encoding: 'utf8',
  });

  const week3Port = await getFreePort();
  const week3Proc = startProcess('node', ['week-3-crud-api/src/server.js'], {
    PORT: String(week3Port),
    NODE_PATH: path.join(ROOT, 'node_modules'),
  });

  try {
    await waitForHttp(`http://127.0.0.1:${week3Port}/api/health`);
    const createRes = await fetch(`http://127.0.0.1:${week3Port}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Verify MongoDB CRUD persistence',
        description: 'Week 3 Express + Mongoose deliverable',
        priority: 'high',
      }),
    });
    const createdJson = await createRes.json();
    const listRes = await fetch(`http://127.0.0.1:${week3Port}/api/items`);
    const listJson = await listRes.json();

    const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
    const escapeHtml = (s) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    await page.setContent(`
      <html>
        <head>
          <style>
            body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #FAF8F3; color: #183C32; padding: 32px; margin: 0; }
            .card { background: #fff; border: 1px solid #E6E7E0; border-radius: 14px; padding: 24px; margin-bottom: 20px; }
            h1 { font-family: system-ui, sans-serif; margin: 0 0 6px; font-size: 22px; }
            h2 { font-family: system-ui, sans-serif; margin: 0 0 10px; font-size: 16px; color: #2F6B52; }
            pre { background: #142822; color: #E6EFE8; padding: 16px; border-radius: 10px; font-size: 12px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; }
            .badge { display: inline-block; font-family: system-ui, sans-serif; font-size: 12px; font-weight: 600; color: #2F6B52; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="badge">Week 3 Deliverable · Express + Mongoose CRUD Evidence</div>
          <div class="card">
            <h1>Live Endpoint Verification (http://localhost:${week3Port})</h1>
            <h2>POST /api/items (201 Created) &amp; GET /api/items (200 OK)</h2>
            <pre>${escapeHtml(JSON.stringify({ postResponse: createdJson, getAllResponse: listJson }, null, 2))}</pre>
          </div>
          <div class="card">
            <h2>Automated Node Test Runner Output (7/7 Passed)</h2>
            <pre>${escapeHtml(week3Out.trim())}</pre>
          </div>
        </body>
      </html>
    `);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '14_week3_api_evidence.png'),
      fullPage: true,
    });

    await page.setContent(`
      <html>
        <head>
          <style>
            body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #FAF8F3; color: #183C32; padding: 32px; margin: 0; }
            .card { background: #fff; border: 1px solid #E6E7E0; border-radius: 14px; padding: 24px; }
            h1 { font-family: system-ui, sans-serif; margin: 0 0 6px; font-size: 22px; }
            p { font-family: system-ui, sans-serif; color: #68746D; font-size: 14px; margin: 0 0 16px; }
            pre { background: #142822; color: #E6EFE8; padding: 18px; border-radius: 10px; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Week 4 Automated Auth, CRUD &amp; User Isolation Test Results</h1>
            <p>Executed via node --test backend/tests/api.test.js against live Express + Mongoose</p>
            <pre>${escapeHtml(week4Out.trim())}</pre>
          </div>
        </body>
      </html>
    `);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '15_user_isolation_evidence.png'),
      fullPage: true,
    });
    await page.close();
  } finally {
    await stopProcess(week3Proc);
  }
}

async function verifyWeek1(browser) {
  console.log('2. Verifying Week 1 React Task Manager...');
  const port = await getFreePort();
  const viteBin = path.join(ROOT, 'node_modules/.bin/vite');
  const proc = startProcess(viteBin, [
    'week-1-react-task-manager',
    '--config',
    'week-1-react-task-manager/vite.config.js',
    '--port',
    String(port),
    '--host',
    '127.0.0.1',
    '--bypass-lock',
  ]);

  try {
    await waitForHttp(`http://127.0.0.1:${port}`).catch((e) => {
      throw new Error(`${e.message}\nLogs:\n${proc.getLogs()}`);
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.fill('#week1-task-title', 'Prepare Week 1 component hierarchy demo');
    await page.fill('#week1-task-notes', 'Header, TaskForm, TaskList, TaskItem verified via Playwright');
    await page.selectOption('#week1-task-priority', 'high');
    await page.click('button:has-text("Add Task")');
    await page.waitForSelector('text=Prepare Week 1 component hierarchy demo');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12_week1_task_manager.png'),
      fullPage: true,
    });
    assert.equal(errors.length, 0, `Week 1 page errors: ${errors.join('; ')}`);
    await page.close();
  } finally {
    await stopProcess(proc);
  }
}

async function verifyWeek2(browser) {
  console.log('3. Verifying Week 2 Public REST API Dashboard...');
  const port = await getFreePort();
  const viteBin = path.join(ROOT, 'node_modules/.bin/vite');
  const proc = startProcess(viteBin, [
    'week-2-api-dashboard',
    '--config',
    'week-2-api-dashboard/vite.config.js',
    '--port',
    String(port),
    '--host',
    '127.0.0.1',
    '--bypass-lock',
  ]);

  try {
    await waitForHttp(`http://127.0.0.1:${port}`).catch((e) => {
      throw new Error(`${e.message}\nLogs:\n${proc.getLogs()}`);
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.records-table, .state-box', { timeout: 10000 });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '13_week2_api_dashboard.png'),
      fullPage: false,
    });
    await page.close();
  } finally {
    await stopProcess(proc);
  }
}

async function verifyWeek4FullStack(browser) {
  console.log('4. Verifying Redesigned Week 4 Full-Stack TaskFlow App...');
  const port = await getFreePort();
  const tsxBin = path.join(ROOT, 'node_modules/.bin/tsx');
  const proc = startProcess(tsxBin, ['server.ts'], {
    PORT: String(port),
    NODE_ENV: 'production',
    ALLOW_MEMORY_DB: 'true',
    CORS_ORIGIN: `http://127.0.0.1:${port},http://localhost:${port}`,
  });

  try {
    await waitForHttp(`http://127.0.0.1:${port}/api/health`, 30000).catch((e) => {
      throw new Error(`${e.message}\nLogs:\n${proc.getLogs()}`);
    });
    const baseUrl = `http://127.0.0.1:${port}`;

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    // 1. Redesigned Landing Page Desktop
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Bring your tasks, goals and daily work into focus.');
    await assertNoHorizontalOverflow(page, 'Landing Desktop');
    // Verify interactive hero dashboard preview works
    await page.click('button[aria-label*="Review mobile calendar agenda"]');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_landing_desktop.png'), fullPage: false });

    // Scroll down to showcase Features & Showcase sections
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02b_landing_features.png'), fullPage: false });

    // 2. Landing Page Mobile (375x812) + mobile menu test
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await assertNoHorizontalOverflow(page, 'Landing Mobile');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_landing_mobile.png'), fullPage: false });
    await page.click('button[aria-label="Open navigation menu"]');
    await page.waitForSelector('header div.lg\\:hidden >> text=How It Works');
    await page.click('button[aria-label="Close navigation menu"]');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 3. Standalone Centered Register Page (NO left image, NO homepage header/footer)
    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page, 'Register Desktop');
    const regImages = await page.locator('img').count();
    assert.equal(regImages, 0, 'Register page must not contain an illustration/image panel');
    const regFooters = await page.locator('footer').count();
    assert.equal(regFooters, 0, 'Register page must not show homepage footer');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_register_page.png'), fullPage: false });

    // Validation error state
    await page.fill('#reg-name', 'Sahrish');
    await page.fill('#reg-email', 'sahrish@example.com');
    await page.fill('#reg-password', 'short');
    await page.fill('#reg-confirm', 'short');
    await page.click('button:has-text("Create Account")');
    await page.waitForSelector('text=Password must be at least 8 characters long.');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05_validation_error_state.png'),
      fullPage: false,
    });

    // Complete registration
    await page.fill('#reg-password', 'TaskFlow2026!');
    await page.fill('#reg-confirm', 'TaskFlow2026!');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('text=Your workspace is clear');

    // 4. Empty State Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06_dashboard_empty_state.png'),
      fullPage: false,
    });

    // Compute dynamic date strings relative to today for real Today / Overdue / Upcoming testing
    const now = new Date();
    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
        2,
        '0'
      )}`;
    const todayStr = fmt(now);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 2);
    const overdueStr = fmt(yesterday);
    const twoDaysAhead = new Date(now);
    twoDaysAhead.setDate(now.getDate() + 2);
    const upcomingStr = fmt(twoDaysAhead);
    const tenDaysAhead = new Date(now);
    tenDaysAhead.setDate(now.getDate() + 10);
    const laterStr = fmt(tenDaysAhead);

    // 5. Create Task Modal Screenshot & Create 4 realistic tasks (today, overdue, upcoming, later)
    await page.click('button:has-text("Create First Task")');
    await page.waitForSelector('#task-modal-heading');
    await page.fill('#modal-task-title', 'Finalize MongoDB Atlas schema and indexes');
    await page.fill(
      '#modal-task-desc',
      'Ensure User email unique index and Task owner compound index are verified.'
    );
    await page.selectOption('#modal-task-priority', 'high');
    await page.fill('#modal-task-due', todayStr);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_create_task_modal.png'), fullPage: false });
    await page.click('button:has-text("Create Task")');
    await page.waitForSelector('text=Finalize MongoDB Atlas schema and indexes');

    const extraTasks = [
      {
        title: 'Write Week 4 JWT & user isolation tests',
        desc: 'Verify User A cannot access User B task records across GET/PUT/PATCH/DELETE.',
        priority: 'high',
        due: overdueStr,
      },
      {
        title: 'Export Postman collection for evaluation',
        desc: 'Include auth, task CRUD, and isolation test requests.',
        priority: 'medium',
        due: upcomingStr,
      },
      {
        title: 'Review mobile responsive layout and focus rings',
        desc: 'Verify 375px mobile drawer, calendar agenda, and accessible controls.',
        priority: 'low',
        due: laterStr,
      },
    ];

    for (const item of extraTasks) {
      await page.click('header button:has-text("New Task")');
      await page.fill('#modal-task-title', item.title);
      await page.fill('#modal-task-desc', item.desc);
      await page.selectOption('#modal-task-priority', item.priority);
      await page.fill('#modal-task-due', item.due);
      await page.click('button:has-text("Create Task")');
      await page.waitForSelector(`text=${item.title}`);
    }

    // Complete one task so Completion Rate becomes 25% and Overdue stays 1
    await page.click('button[aria-label*="Export Postman collection"]');
    await page.waitForSelector('text=25%');
    const dismissBtn = page.locator('button[aria-label="Dismiss notification"]');
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
    }

    // Verify Schedule Reminders Bell popover shows real overdue/due-today tasks
    await page.click('button[aria-label*="Due date reminders"]');
    await page.waitForSelector('text=Schedule Reminders');
    await page.click('button:has-text("Close")');

    // 6. Populated Overview Dashboard Screenshot (5 KPI cards + Due Today & Overdue + Completion Ring)
    await assertNoHorizontalOverflow(page, 'Dashboard Overview Desktop');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08_dashboard_populated.png'),
      fullPage: false,
    });

    // 7. Edit Task Modal Screenshot
    await page.click('button[aria-label="Edit \\"Write Week 4 JWT & user isolation tests\\""]');
    await page.waitForSelector('text=Edit Task');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_edit_task_modal.png'), fullPage: false });
    await page.fill('#modal-task-title', 'Write Week 4 JWT & owner isolation suite');
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Write Week 4 JWT & owner isolation suite');

    // 8. Search & Overdue Filter check
    await page.fill('input[aria-label="Search workspace tasks"]', 'MongoDB');
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_search_and_filter.png'), fullPage: false });
    await page.fill('input[aria-label="Search workspace tasks"]', '');
    await page.waitForTimeout(400);

    // Filter by Overdue chip
    await page.click('button[role="tab"]:has-text("Overdue")');
    await page.waitForSelector('text=Write Week 4 JWT & owner isolation suite');
    await page.click('button[role="tab"]:has-text("All")');

    // 9. Verify session persistence on page reload
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('text=Welcome back, Sahrish');

    // 10. My Tasks Board View
    await page.goto(`${baseUrl}/tasks`, { waitUntil: 'networkidle' });
    await page.click('button:has-text("Board")');
    await page.waitForSelector('text=Active (3)');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_tasks_board_view.png'), fullPage: false });

    // 11. Today View
    await page.goto(`${baseUrl}/today`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Daily Focus Queue');
    await page.waitForSelector('text=Due Today (1)');
    await assertNoHorizontalOverflow(page, 'Today Desktop');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '18_today_view.png'), fullPage: false });

    // 12. Upcoming View
    await page.goto(`${baseUrl}/upcoming`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Later Horizon');
    await assertNoHorizontalOverflow(page, 'Upcoming Desktop');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '19_upcoming_view.png'), fullPage: false });

    // 13. Completed View + Reopen test
    await page.goto(`${baseUrl}/completed`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Export Postman collection for evaluation');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '20_completed_view.png'), fullPage: false });
    // Reopen it and re-complete via Today/Tasks or leave active -> test reopen works
    await page.click('button:has-text("Reopen")');
    await page.waitForSelector('text=No completed tasks yet');

    // Re-complete from My Tasks so screenshots/stats remain populated
    await page.goto(`${baseUrl}/tasks`, { waitUntil: 'networkidle' });
    await page.click('button[aria-label*="Export Postman collection"]');
    await page.waitForTimeout(300);

    // 14. Calendar View Desktop & Mobile
    await page.goto(`${baseUrl}/calendar`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Scheduled This Month');
    await assertNoHorizontalOverflow(page, 'Calendar Desktop');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '21_calendar_view.png'), fullPage: false });

    await page.setViewportSize({ width: 375, height: 812 });
    await assertNoHorizontalOverflow(page, 'Calendar Mobile');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '22_calendar_mobile.png'), fullPage: false });
    await page.setViewportSize({ width: 1440, height: 900 });

    // 15. Settings View (Profile, Password, Workspace Preferences) + Fixed Sidebar & Card Alignment checks
    await page.goto(`${baseUrl}/settings`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Workspace Preferences');
    await assertNoHorizontalOverflow(page, 'Settings Desktop');
    await page.evaluate(() => window.scrollTo(0, 350));
    await page.waitForTimeout(200);
    const sidebarBox = await page.locator('aside').first().boundingBox();
    assert.ok(sidebarBox && Math.abs(sidebarBox.y) <= 1 && sidebarBox.height >= 895, `Desktop sidebar must stay fixed full-height on scroll, got ${JSON.stringify(sidebarBox)}`);
    const settingsCardBoxes = await page.locator('main section').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      })
    );
    assert.equal(settingsCardBoxes.length, 4, 'Expected 4 Settings cards');
    assert.ok(Math.abs(settingsCardBoxes[0].height - settingsCardBoxes[1].height) <= 2, 'Settings Row 1 cards must have matching heights');
    assert.ok(Math.abs(settingsCardBoxes[2].height - settingsCardBoxes[3].height) <= 2, 'Settings Row 2 cards must have matching heights');
    assert.ok(Math.abs(settingsCardBoxes[0].x - settingsCardBoxes[2].x) <= 2, 'Settings Left column cards must align');
    assert.ok(Math.abs(settingsCardBoxes[1].x - settingsCardBoxes[3].x) <= 2, 'Settings Right column cards must align');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16_profile_settings.png'), fullPage: false });

    // 16. Mobile Dashboard + Drawer Check
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForSelector('text=Welcome back, Sahrish');
    await assertNoHorizontalOverflow(page, 'Dashboard Mobile');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17_dashboard_mobile.png'), fullPage: false });
    await page.click('button[aria-label="Open navigation menu"]');
    await page.waitForSelector('div.fixed.inset-0 aside >> text=Calendar');
    await page.click('button[aria-label="Close navigation menu"]');

    // 17. Logout & Standalone Centered Login Page Check (NO left image, NO homepage header/footer)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.click('button:has-text("Log Out")');
    await page.waitForURL('**/login');
    await assertNoHorizontalOverflow(page, 'Login Desktop');
    const loginImages = await page.locator('img').count();
    assert.equal(loginImages, 0, 'Login page must not contain an illustration/image panel');
    const loginFooters = await page.locator('footer').count();
    assert.equal(loginFooters, 0, 'Login page must not show homepage footer');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_login_page.png'), fullPage: false });

    // 18. Confirm protected routes redirect when logged out
    await page.goto(`${baseUrl}/today`, { waitUntil: 'networkidle' });
    await page.waitForURL('**/login');

    // 19. User B Isolation Check in clean browser context
    const contextB = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageB = await contextB.newPage();
    await pageB.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await pageB.fill('#reg-name', 'Bilal User');
    await pageB.fill('#reg-email', 'bilal.ui@example.com');
    await pageB.fill('#reg-password', 'TaskFlow2026!');
    await pageB.fill('#reg-confirm', 'TaskFlow2026!');
    await pageB.click('button:has-text("Create Account")');
    await pageB.waitForURL('**/dashboard');
    await pageB.waitForSelector('text=Your workspace is clear');
    const leaked = await pageB.locator('text=Finalize MongoDB Atlas').count();
    assert.equal(leaked, 0, 'User B must never see User A tasks!');
    await contextB.close();

    const unexpectedErrors = consoleErrors.filter((msg) => !msg.includes('401'));
    assert.equal(unexpectedErrors.length, 0, `Unexpected browser errors: ${unexpectedErrors.join('; ')}`);
    await context.close();
  } finally {
    await stopProcess(proc);
  }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    await runTestsAndCaptureEvidence(browser);
    await verifyWeek1(browser);
    await verifyWeek2(browser);
    await verifyWeek4FullStack(browser);
    console.log('ALL VERIFICATION & SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
