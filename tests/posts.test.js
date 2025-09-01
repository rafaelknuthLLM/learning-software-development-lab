const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Post = require('../src/models/Post');

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/restapi_test';

describe('Posts Routes', () => {
  let accessToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    // Create test user and get token
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    };

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    accessToken = registerResponse.body.data.accessToken;
    userId = registerResponse.body.data.user._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/posts', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content that is long enough to meet requirements.'
      };

      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe(postData.title);
      expect(response.body.data.post.content).toBe(postData.content);
      expect(response.body.data.post.author._id).toBe(userId);
    });

    it('should not create post without authentication', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content.'
      };

      const response = await request(app)
        .post('/api/v1/posts')
        .send(postData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/posts', () => {
    beforeEach(async () => {
      // Create test posts
      await Post.create([
        {
          title: 'Published Post 1',
          content: 'Content for published post 1',
          author: userId,
          status: 'published',
          publishedAt: new Date()
        },
        {
          title: 'Published Post 2',
          content: 'Content for published post 2',
          author: userId,
          status: 'published',
          publishedAt: new Date()
        },
        {
          title: 'Draft Post',
          content: 'Content for draft post',
          author: userId,
          status: 'draft'
        }
      ]);
    });

    it('should get published posts', async () => {
      const response = await request(app)
        .get('/api/v1/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(2);
      expect(response.body.data.posts[0].status).toBe('published');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/posts?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test content for the post',
        author: userId,
        status: 'published',
        publishedAt: new Date()
      });
      postId = post._id;
    });

    it('should get a specific post', async () => {
      const response = await request(app)
        .get(`/api/v1/posts/${postId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe('Test Post');
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/posts/:id', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original content for the post',
        author: userId,
        status: 'draft'
      });
      postId = post._id;
    });

    it('should update own post', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content for the post'
      };

      const response = await request(app)
        .patch(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe(updateData.title);
      expect(response.body.data.post.content).toBe(updateData.content);
    });

    it('should not update without authentication', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .patch(`/api/v1/posts/${postId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        title: 'Post to Delete',
        content: 'Content of post to be deleted',
        author: userId,
        status: 'draft'
      });
      postId = post._id;
    });

    it('should delete own post', async () => {
      const response = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify post is deleted
      const deletedPost = await Post.findById(postId);
      expect(deletedPost).toBeNull();
    });

    it('should not delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});