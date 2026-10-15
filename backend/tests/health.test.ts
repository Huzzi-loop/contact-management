import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Health and 404 Integration Tests', () => {
  const app = createApp();

  it('GET /health should return 200 with standard ApiResponse envelope', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('CRM backend service is operational');
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('GET /non-existent should return 404 with structured error response', async () => {
    const res = await request(app).get('/non-existent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Cannot GET /non-existent');
  });
});
