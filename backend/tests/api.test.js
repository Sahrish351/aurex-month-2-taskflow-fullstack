import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { createApp } from '../src/app.js';

let server;
let baseUrl;
let tokenA;
let tokenB;
let userAId;
let taskAId;
let taskBId;

before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

describe('Week 4 TaskFlow API — Auth, CRUD, Validation & User Isolation', () => {
  it('GET /api/health confirms connected database', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.database, 'connected');
  });

  it('POST /api/auth/register creates User A, hashes password, and hides passwordHash', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ayesha Khan',
        email: 'ayesha@example.com',
        password: 'StrongPassword123',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.token);
    assert.equal(body.user.email, 'ayesha@example.com');
    assert.equal(body.user.passwordHash, undefined);
    tokenA = body.token;
    userAId = body.user.id;
  });

  it('POST /api/auth/register rejects duplicate email (409) and weak/invalid inputs (400)', async () => {
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ayesha Duplicate',
        email: 'AYESHA@example.com',
        password: 'StrongPassword123',
      }),
    });
    assert.equal(dupRes.status, 409);

    const shortPwRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short PW',
        email: 'short@example.com',
        password: '123',
      }),
    });
    assert.equal(shortPwRes.status, 400);
  });

  it('POST /api/auth/login succeeds with valid credentials and rejects wrong password', async () => {
    const okRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ayesha@example.com',
        password: 'StrongPassword123',
      }),
    });
    assert.equal(okRes.status, 200);
    const okBody = await okRes.json();
    assert.ok(okBody.token);
    assert.equal(okBody.user.passwordHash, undefined);

    const badRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ayesha@example.com',
        password: 'WrongPassword999',
      }),
    });
    assert.equal(badRes.status, 401);
  });

  it('Protected routes reject missing or invalid tokens (401) and accept valid JWT', async () => {
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(noTokenRes.status, 401);

    const badTokenRes = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: 'Bearer invalid.jwt.token' },
    });
    assert.equal(badTokenRes.status, 401);

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(meRes.status, 200);
    const meBody = await meRes.json();
    assert.equal(meBody.user.id, userAId);
  });

  it('Task CRUD: create, read, update, toggle status, search, filter, and delete', async () => {
    const createRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Finalize MongoDB Atlas indexes',
        description: 'Add compound index on owner and createdAt',
        priority: 'high',
        dueDate: '2026-12-05',
      }),
    });
    assert.equal(createRes.status, 201);
    const createdBody = await createRes.json();
    taskAId = createdBody.task.id;
    assert.equal(createdBody.task.owner, userAId);

    const listRes = await fetch(`${baseUrl}/api/tasks?search=Atlas&priority=high`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.tasks.length, 1);
    assert.equal(listBody.stats.total, 1);
    assert.equal(listBody.stats.active, 1);

    const toggleRes = await fetch(`${baseUrl}/api/tasks/${taskAId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(toggleRes.status, 200);
    const toggleBody = await toggleRes.json();
    assert.equal(toggleBody.task.status, 'completed');

    const updateRes = await fetch(`${baseUrl}/api/tasks/${taskAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Finalize MongoDB Atlas compound indexes',
        priority: 'medium',
      }),
    });
    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.equal(updateBody.task.title, 'Finalize MongoDB Atlas compound indexes');
    assert.equal(updateBody.task.priority, 'medium');

    // Create an overdue active task and verify ?overdue=true and stats.overdue
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const overdueCreateRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Follow up on overdue sprint item',
        priority: 'high',
        dueDate: pastDate,
      }),
    });
    assert.equal(overdueCreateRes.status, 201);
    const overdueCreated = await overdueCreateRes.json();

    const overdueListRes = await fetch(`${baseUrl}/api/tasks?overdue=true`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(overdueListRes.status, 200);
    const overdueListBody = await overdueListRes.json();
    assert.equal(overdueListBody.tasks.length, 1);
    assert.equal(overdueListBody.tasks[0].id, overdueCreated.task.id);
    assert.equal(overdueListBody.stats.overdue, 1);

    await fetch(`${baseUrl}/api/tasks/${overdueCreated.task.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
  });

  it('User data isolation: User A cannot read, edit, toggle, or delete User B tasks', async () => {
    const regBRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bilal Ahmed',
        email: 'bilal@example.com',
        password: 'AnotherStrongPassword123',
      }),
    });
    assert.equal(regBRes.status, 201);
    const regBBody = await regBRes.json();
    tokenB = regBBody.token;

    // Even if User B sends a spoofed owner field, backend derives owner from JWT
    const createBRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        title: 'Bilal Private Architecture Review',
        priority: 'high',
        owner: userAId,
      }),
    });
    assert.equal(createBRes.status, 201);
    const createBBody = await createBRes.json();
    taskBId = createBBody.task.id;
    assert.equal(createBBody.task.owner, regBBody.user.id);

    // User A lists tasks -> must not include Bilal's task
    const listARes = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listABody = await listARes.json();
    assert.equal(listABody.tasks.some((t) => t.id === taskBId), false);

    // User A tries GET / PUT / PATCH / DELETE on User B's task ID
    const readBAsA = await fetch(`${baseUrl}/api/tasks/${taskBId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(readBAsA.status, 404);

    const updateBAsA = await fetch(`${baseUrl}/api/tasks/${taskBId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ title: 'Tampered by User A' }),
    });
    assert.equal(updateBAsA.status, 404);

    const toggleBAsA = await fetch(`${baseUrl}/api/tasks/${taskBId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(toggleBAsA.status, 404);

    const deleteBAsA = await fetch(`${baseUrl}/api/tasks/${taskBId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(deleteBAsA.status, 404);

    // Verify User B's task remains completely intact
    const verifyB = await fetch(`${baseUrl}/api/tasks/${taskBId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(verifyB.status, 200);
    const verifyBBody = await verifyB.json();
    assert.equal(verifyBBody.task.title, 'Bilal Private Architecture Review');
  });

  it('DELETE /api/tasks/:id removes owner task', async () => {
    const delRes = await fetch(`${baseUrl}/api/tasks/${taskAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(delRes.status, 200);

    const getRes = await fetch(`${baseUrl}/api/tasks/${taskAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(getRes.status, 404);
  });
});
