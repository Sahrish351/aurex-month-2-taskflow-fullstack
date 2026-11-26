import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');
const PDF_OUT = path.join(ROOT, 'TaskFlow_AUREX_Month2_Submission_Report.pdf');
const CHROME_PATH =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

function imgDataUri(filename) {
  const full = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(full)) return '';
  const b64 = fs.readFileSync(full).toString('base64');
  return `data:image/png;base64,${b64}`;
}

function figureHtml(filename, caption) {
  const src = imgDataUri(filename);
  if (!src) return '';
  return `
    <figure class="shot">
      <img src="${src}" alt="${caption}" />
      <figcaption>${caption}</figcaption>
    </figure>
  `;
}

async function main() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>TaskFlow — AUREX Month 2 Submission Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #183C32;
      background: #FFFFFF;
      font-size: 11px;
      line-height: 1.55;
    }
    h1, h2, h3 {
      color: #183C32;
      margin-top: 0;
    }
    .cover {
      background: #FAF8F3;
      border: 1px solid #E6E7E0;
      border-radius: 14px;
      padding: 36px 32px;
      margin-bottom: 24px;
      page-break-after: always;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      background: #E6EFE8;
      color: #2F6B52;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .cover h1 {
      font-family: Georgia, serif;
      font-size: 30px;
      line-height: 1.15;
      margin: 16px 0 10px;
    }
    .cover p.subtitle {
      font-size: 13px;
      color: #56635C;
      margin: 0 0 24px;
      max-width: 520px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 18px;
    }
    .meta-card {
      background: #FFFFFF;
      border: 1px solid #E6E7E0;
      border-radius: 10px;
      padding: 12px;
    }
    .meta-label { font-size: 9px; text-transform: uppercase; color: #68746D; font-weight: 700; }
    .meta-val { font-size: 12px; font-weight: 700; margin-top: 4px; color: #183C32; }
    .toc {
      margin-top: 26px;
      background: #FFFFFF;
      border: 1px solid #E6E7E0;
      border-radius: 10px;
      padding: 16px 20px;
    }
    .toc h2 { font-size: 14px; margin-bottom: 10px; }
    .toc ol { margin: 0; padding-left: 18px; columns: 2; gap: 24px; }
    .toc li { margin-bottom: 5px; font-size: 10.5px; color: #364B43; }
    section { margin-bottom: 22px; }
    .section-title {
      font-family: Georgia, serif;
      font-size: 18px;
      border-bottom: 2px solid #E6EFE8;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px;
      font-size: 10px;
    }
    th, td {
      border: 1px solid #E6E7E0;
      padding: 7px 9px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #FAF8F3;
      font-weight: 700;
      color: #183C32;
    }
    pre {
      background: #142822;
      color: #E6EFE8;
      padding: 12px 14px;
      border-radius: 8px;
      font-family: ui-monospace, Menlo, monospace;
      font-size: 9.5px;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .shot {
      margin: 0 0 14px;
      background: #FAF8F3;
      border: 1px solid #E6E7E0;
      border-radius: 10px;
      padding: 8px;
      break-inside: avoid;
    }
    .shot img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
      border: 1px solid #E6E7E0;
    }
    .shot figcaption {
      margin-top: 6px;
      font-size: 9.5px;
      font-weight: 600;
      color: #4D6358;
      text-align: center;
    }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="cover">
    <span class="badge">AUREX Month 2 · Full-Stack Engineering Internship</span>
    <h1>TaskFlow — Full-Stack Task &amp; Productivity SaaS Submission Report</h1>
    <p class="subtitle">
      Complete architecture, security controls, Week 1–4 deliverables, automated verification, and live browser visual evidence.
    </p>

    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label">Frontend Stack</div>
        <div class="meta-val">React 19 · Vite · Router · Tailwind CSS</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Backend &amp; Database</div>
        <div class="meta-val">Node.js · Express · MongoDB · Mongoose</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Security &amp; Verification</div>
        <div class="meta-val">bcrypt · JWT · 15/15 API Tests · Playwright</div>
      </div>
    </div>

    <div class="toc">
      <h2>Table of Contents</h2>
      <ol>
        <li>Executive Summary &amp; Architecture</li>
        <li>MongoDB Schema &amp; Owner Isolation</li>
        <li>API Endpoints &amp; Security Controls</li>
        <li>Week 1–4 Deliverables Matrix</li>
        <li>Redesigned Homepage &amp; Auth Screens</li>
        <li>Expanded 7-View Workspace Showcase</li>
        <li>Mobile Responsiveness &amp; Calendar</li>
        <li>Automated Verification &amp; Test Evidence</li>
      </ol>
    </div>
  </div>

  <section>
    <h2 class="section-title">1. Executive Summary &amp; System Architecture</h2>
    <p>
      <strong>TaskFlow</strong> delivers a complete, authenticated, user-isolated full-stack task management platform alongside all three prerequisite weekly deliverables (Week 1 React Task Manager, Week 2 Public REST API Dashboard, and Week 3 Express + Mongoose CRUD API).
    </p>
    <pre>+-------------------------------------------------------------------------+
|                 React 19 + Vite SPA (src/ &amp; frontend/)                  |
|  Public: / (SaaS Landing), /login, /register                            |
|  Protected: /dashboard, /tasks, /today, /upcoming, /completed,          |
|             /calendar, /settings                                        |
+------------------------------------+------------------------------------+
                                     | Fetch API (HttpOnly Cookie + Bearer JWT)
                                     v
+-------------------------------------------------------------------------+
|                Express.js API Server (server.ts / backend/)             |
|  Auth Middleware (JWT) · CSRF Guard · Auth Rate Limit · Error Handler   |
+------------------------------------+------------------------------------+
                                     | Mongoose ODM (owner: req.user._id)
                                     v
+-------------------------------------------------------------------------+
|           MongoDB Atlas / In-Memory MongoDB (Non-Prod Fallback)         |
|  users (email unique index) · tasks (owner + createdAt compound index)  |
+-------------------------------------------------------------------------+</pre>
  </section>

  <section>
    <h2 class="section-title">2. Database Schema &amp; User Isolation Design</h2>
    <table>
      <thead>
        <tr>
          <th>Collection</th>
          <th>Fields</th>
          <th>Indexes &amp; Integrity Guarantees</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>users</strong></td>
          <td><code>name</code>, <code>email</code>, <code>passwordHash</code>, <code>createdAt</code>, <code>updatedAt</code></td>
          <td>Unique lowercase index on <code>email</code>. <code>passwordHash</code> uses 12-round <code>bcryptjs</code> and is omitted in JSON output.</td>
        </tr>
        <tr>
          <td><strong>tasks</strong></td>
          <td><code>title</code>, <code>description</code>, <code>status</code> (<code>active|completed</code>), <code>priority</code> (<code>low|medium|high</code>), <code>dueDate</code>, <code>completedAt</code>, <code>owner</code></td>
          <td>Compound index <code>{ owner: 1, createdAt: -1 }</code>. Every query scopes strictly by <code>req.user._id</code>; cross-user ID lookups return <code>404</code>.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2 class="section-title">3. Week 1–4 Deliverables &amp; API Surface</h2>
    <table>
      <thead>
        <tr>
          <th>Deliverable</th>
          <th>Directory</th>
          <th>Verified Capabilities</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Week 1</strong></td>
          <td><code>week-1-react-task-manager/</code></td>
          <td>Standalone React + Vite JS app (<code>Header</code>, <code>TaskForm</code>, <code>TaskList</code>, <code>TaskItem</code>), controlled inputs, add/complete/delete, <code>localStorage</code> persistence.</td>
        </tr>
        <tr>
          <td><strong>Week 2</strong></td>
          <td><code>week-2-api-dashboard/</code></td>
          <td>JSONPlaceholder <code>/todos</code> &amp; <code>/users</code> integration, <code>useEffect</code>, search, filters, detail modal, loading/error/empty states.</td>
        </tr>
        <tr>
          <td><strong>Week 3</strong></td>
          <td><code>week-3-crud-api/</code></td>
          <td>Standalone Express + Mongoose CRUD API on <code>/api/items</code> (GET, POST, PUT, DELETE) — <strong>7/7 automated tests pass</strong>.</td>
        </tr>
        <tr>
          <td><strong>Week 4</strong></td>
          <td><code>backend/</code> + <code>src/</code> + <code>frontend/</code></td>
          <td>Auth endpoints (<code>register</code>, <code>login</code>, <code>logout</code>, <code>me</code>, <code>profile</code>), owner-scoped task CRUD (including <code>?overdue=true</code>), 7 workspace views, responsive mobile UI — <strong>8/8 automated tests pass</strong>.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="page-break"></div>
  <section>
    <h2 class="section-title">4. Redesigned Homepage &amp; Standalone Auth Pages</h2>
    ${figureHtml('01_landing_desktop.png', 'Figure 1 — Redesigned SaaS Landing Page (1440x900) with Interactive Workspace Preview')}
    <div class="grid-2">
      ${figureHtml('03_register_page.png', 'Figure 2 — Standalone Centered Registration Card')}
      ${figureHtml('04_login_page.png', 'Figure 3 — Standalone Centered Login Card')}
    </div>
  </section>

  <div class="page-break"></div>
  <section>
    <h2 class="section-title">5. Expanded SaaS Workspace Views</h2>
    ${figureHtml('08_dashboard_populated.png', 'Figure 4 — Overview Dashboard with 5 KPI Cards, Quick Filter Chips, Due Today/Overdue Card & Completion Ring')}
    <div class="grid-2">
      ${figureHtml('18_today_view.png', 'Figure 5 — Today Focus View (Overdue & Due Today)')}
      ${figureHtml('21_calendar_view.png', 'Figure 6 — Monthly Calendar & Selected Date Agenda')}
    </div>
  </section>

  <div class="page-break"></div>
  <section>
    <h2 class="section-title">6. Mobile Responsiveness, Board &amp; Settings</h2>
    <div class="grid-2">
      ${figureHtml('11_tasks_board_view.png', 'Figure 7 — My Tasks Two-Column Board View')}
      ${figureHtml('16_profile_settings.png', 'Figure 8 — Settings (Account, Password, Workspace Preferences)')}
    </div>
    <div class="grid-2">
      ${figureHtml('02_landing_mobile.png', 'Figure 9 — Mobile Landing Page (375x812)')}
      ${figureHtml('17_dashboard_mobile.png', 'Figure 10 — Mobile Overview Dashboard (375x812)')}
    </div>
  </section>

  <div class="page-break"></div>
  <section>
    <h2 class="section-title">7. Week 1–3 Deliverables &amp; Security Isolation Evidence</h2>
    <div class="grid-2">
      ${figureHtml('12_week1_task_manager.png', 'Figure 11 — Week 1 Standalone React Task Manager')}
      ${figureHtml('13_week2_api_dashboard.png', 'Figure 12 — Week 2 Public REST API Dashboard')}
    </div>
    <div class="grid-2">
      ${figureHtml('14_week3_api_evidence.png', 'Figure 13 — Week 3 CRUD API Verification (7/7 Passed)')}
      ${figureHtml('15_user_isolation_evidence.png', 'Figure 14 — Week 4 Auth, CRUD & User Isolation Results (8/8 Passed)')}
    </div>
  </section>
</body>
</html>`;

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: PDF_OUT,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="font-size:9px;color:#68746D;width:100%;text-align:center;font-family:sans-serif;">TaskFlow · AUREX Month 2 Full-Stack Submission · Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    });
    console.log('Generated PDF:', PDF_OUT);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
