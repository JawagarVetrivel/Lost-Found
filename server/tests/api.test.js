import request from 'supertest';
import app from '../src/app.js';

describe('Campus Lost & Found - REST API Integration Tests', () => {
  let studentToken;
  let secondStudentToken;
  let adminToken;
  let createdLostItemId;
  let createdFoundItemId;
  let createdClaimId;

  const testId = Date.now();
  const studentEmail = `student_${testId}@university.edu`;
  const secondStudentEmail = `finder_${testId}@university.edu`;
  const adminEmail = `admin_${testId}@university.edu`;

  // 1. Health check
  test('GET /api/health returns status 200 and healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  // 2. Authentication
  test('POST /api/auth/register creates user accounts for student and admin', async () => {
    // Register Student 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      studentId: 'STU998877',
      email: studentEmail,
      password: 'password123',
    });
    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.token).toBeDefined();
    studentToken = res1.body.data.token;

    // Register Student 2 (Finder)
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Second Student',
      studentId: 'STU998878',
      email: secondStudentEmail,
      password: 'password123',
    });
    expect(res2.status).toBe(201);
    secondStudentToken = res2.body.data.token;

    // Register Admin
    const resAdmin = await request(app).post('/api/auth/register').send({
      name: 'System Admin',
      studentId: 'ADM00001',
      email: adminEmail,
      password: 'password123',
      role: 'admin',
    });
    expect(resAdmin.status).toBe(201);
    adminToken = resAdmin.body.data.token;
  });

  test('POST /api/auth/login logs in successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: studentEmail,
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('GET /api/auth/me returns the current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(studentEmail);
  });

  // 3. Item Management & Reporting
  test('POST /api/items/lost creates a lost item report', async () => {
    const res = await request(app)
      .post('/api/items/lost')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Dell XPS 15 Laptop',
        category: 'Electronics',
        description: 'Silver Dell XPS laptop with university sticker on the lid',
        brand: 'Dell',
        color: 'Silver',
        date: '2026-09-12',
        time: '11:00',
        location: 'Library',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('lost');
    createdLostItemId = res.body.data.id;
  });

  test('POST /api/items/found creates a found item report and runs matching engine', async () => {
    const res = await request(app)
      .post('/api/items/found')
      .set('Authorization', `Bearer ${secondStudentToken}`)
      .send({
        title: 'Silver Dell Notebook Computer',
        category: 'Electronics',
        description: 'Found a silver Dell XPS laptop with stickers on lid near 1st floor study tables',
        brand: 'Dell',
        color: 'Silver',
        date: '2026-09-12',
        time: '11:20',
        location: 'Library',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('found');
    createdFoundItemId = res.body.data.id;
  });

  test('GET /api/items supports search and filters', async () => {
    const res = await request(app).get('/api/items?category=Electronics&location=Library');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/items/:id returns specific item details', async () => {
    const res = await request(app).get(`/api/items/${createdLostItemId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdLostItemId);
  });

  // 4. Claims System
  test('POST /api/claims submits a claim for a found item', async () => {
    const res = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        itemId: createdFoundItemId,
        message: 'This is my Dell laptop that I left in the library at 11am today.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    createdClaimId = res.body.data.id;
  });

  test('GET /api/claims/my retrieves claims submitted by the user', async () => {
    const res = await request(app)
      .get('/api/claims/my')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((c) => c.id === createdClaimId)).toBe(true);
  });

  test('PATCH /api/claims/:id updates claim status by item owner', async () => {
    const res = await request(app)
      .patch(`/api/claims/${createdClaimId}`)
      .set('Authorization', `Bearer ${secondStudentToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('approved');
  });

  // 5. Notifications
  test('GET /api/notifications returns user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 6. Security and Admin Authorization
  test('A regular student CANNOT access admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin CAN access admin dashboard statistics and users', async () => {
    const resStats = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resStats.status).toBe(200);
    expect(resStats.body.success).toBe(true);
    expect(resStats.body.data.totalLost).toBeDefined();

    const resUsers = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resUsers.status).toBe(200);
    expect(resUsers.body.success).toBe(true);
    expect(Array.isArray(resUsers.body.data)).toBe(true);
  });

  test('A student cannot delete an item they do not own', async () => {
    const res = await request(app)
      .delete(`/api/items/${createdFoundItemId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});
