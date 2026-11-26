import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { createApp } from '../src/app.js';

let server;
let baseUrl;
let createdId;

before(async () => {
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

describe('Week 3 CRUD API (/api/items)', () => {
  it('GET /api/health returns connected status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.database, 'connected');
  });

  it('POST /api/items creates a valid record (201)', async () => {
    const res = await fetch(`${baseUrl}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Configure Mongoose schema indexes',
        description: 'Ensure unique and validated fields.',
        priority: 'high',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.item._id);
    assert.equal(body.item.status, 'active');
    createdId = body.item._id;
  });

  it('POST /api/items rejects invalid/empty payload (400)', async () => {
    const res = await fetch(`${baseUrl}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });
    assert.equal(res.status, 400);
  });

  it('GET /api/items lists persisted records (200)', async () => {
    const res = await fetch(`${baseUrl}/api/items`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.count, 1);
    assert.equal(body.items[0]._id, createdId);
  });

  it('GET /api/items/:id retrieves single record and handles invalid/missing IDs', async () => {
    const okRes = await fetch(`${baseUrl}/api/items/${createdId}`);
    assert.equal(okRes.status, 200);

    const badIdRes = await fetch(`${baseUrl}/api/items/not-an-object-id`);
    assert.equal(badIdRes.status, 400);

    const missingRes = await fetch(`${baseUrl}/api/items/507f1f77bcf86cd799439011`);
    assert.equal(missingRes.status, 404);
  });

  it('PUT /api/items/:id updates record and validates fields (200)', async () => {
    const res = await fetch(`${baseUrl}/api/items/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', priority: 'low' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.item.status, 'completed');
    assert.equal(body.item.priority, 'low');
  });

  it('DELETE /api/items/:id deletes record and returns 404 afterwards', async () => {
    const delRes = await fetch(`${baseUrl}/api/items/${createdId}`, { method: 'DELETE' });
    assert.equal(delRes.status, 200);

    const checkRes = await fetch(`${baseUrl}/api/items/${createdId}`);
    assert.equal(checkRes.status, 404);
  });
});
