# REST API Backend

A production-ready REST API backend built with Node.js, Express.js, and MongoDB. Features comprehensive authentication, authorization, CRUD operations, and extensive middleware for security and performance.

## Features

### Core Functionality
- **User Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (user, admin, moderator)
  - Secure password hashing with bcrypt
  - Account management (registration, login, profile updates)

- **Post Management System**
  - Full CRUD operations for posts
  - Draft/Published/Archived status management
  - Rich content support with SEO fields
  - Like system and view tracking
  - Tag-based categorization

- **Advanced Features**
  - Comprehensive input validation
  - Rate limiting for API protection
  - Full-text search capabilities
  - Pagination and sorting
  - File upload support (configurable)
  - Logging with Winston

### Security & Performance
- **Security Middleware**
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting (API: 100/15min, Auth: 5/15min)
  - Input sanitization and validation
  - JWT token security

- **Performance Features**
  - Database indexing for optimal queries
  - Response compression
  - Efficient pagination
  - Connection pooling
  - Graceful shutdown handling

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `GET /profile` - Get current user profile
- `PATCH /profile` - Update user profile
- `PATCH /change-password` - Change password
- `POST /logout` - Logout current session
- `POST /logout-all` - Logout all sessions
- `DELETE /deactivate` - Deactivate account

### Posts (`/api/v1/posts`)
- `GET /` - Get all posts (with filtering, pagination)
- `GET /search` - Search posts
- `GET /:id` - Get specific post
- `POST /` - Create new post (auth required)
- `PATCH /:id` - Update post (auth required)
- `DELETE /:id` - Delete post (auth required)
- `POST /:id/like` - Toggle post like (auth required)
- `GET /:id/stats` - Get post statistics (author/admin)

### Users (`/api/v1/users`)
- `GET /:userId` - Get user profile
- `GET /:userId/posts` - Get user's posts
- `GET /:userId/activity` - Get user activity
- `GET /dashboard/stats` - Get dashboard stats (auth required)
- `GET /` - Get all users (admin only)
- `PATCH /:userId` - Update user (admin only)
- `DELETE /:userId` - Delete user (admin only)

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   cd src
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate

   # Create admin user
   node scripts/setup.js admin

   # Seed sample data (optional)
   node scripts/setup.js seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3000`

### Production Deployment

1. **Build and start**
   ```bash
   npm run build
   npm start
   ```

2. **Environment Variables**
   Set production environment variables:
   ```bash
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/restapi_prod
   JWT_SECRET=your-production-jwt-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   ```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3000 | Server port |
| `MONGODB_URI` | mongodb://localhost:27017/restapi | MongoDB connection string |
| `JWT_SECRET` | (required) | JWT signing secret |
| `JWT_REFRESH_SECRET` | (required) | Refresh token secret |
| `JWT_EXPIRES_IN` | 15m | Access token expiration |
| `ALLOWED_ORIGINS` | localhost:3000 | CORS allowed origins |
| `API_RATE_LIMIT` | 100 | API requests per window |
| `AUTH_RATE_LIMIT` | 5 | Auth requests per window |

### Rate Limiting
- API endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Configurable per endpoint

### Database Indexes
Optimized indexes for performance:
- User: email, username, role, isActive
- Post: author+status, status+publishedAt, tags, slug
- Full-text search on title, content, tags

## Development

### Project Structure
```
src/
├── controllers/         # Request handlers
├── middleware/         # Custom middleware
├── models/            # Database models
├── routes/            # Route definitions
├── utils/             # Helper functions
├── scripts/           # Database scripts
└── server.js          # Main server file

tests/                 # Test files
config/               # Configuration files
```

### Scripts
```bash
npm run dev           # Development server with nodemon
npm test              # Run test suite
npm run test:watch    # Watch mode testing
npm run test:coverage # Coverage report
npm run lint          # ESLint
npm run migrate       # Run migrations
```

### Testing
Comprehensive test suite with Jest and Supertest:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Generate coverage report
npm run test:coverage
```

### Database Scripts
```bash
# Create admin user
node scripts/setup.js admin

# Seed sample data
node scripts/setup.js seed

# Drop database (with confirmation)
node scripts/setup.js drop

# Run migrations
node scripts/migrate.js up

# Revert last migration
node scripts/migrate.js down

# Check migration status
node scripts/migrate.js status
```

## API Documentation

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": [ ... ]
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Authentication
Use Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Pagination
```
GET /api/v1/posts?page=1&limit=10&sort=-createdAt
```

Response includes pagination metadata:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Monitoring & Health

### Health Check
- `GET /health` - Server health status
- `GET /api/docs` - API documentation (development)

### Logging
Winston logger with configurable levels:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

### Error Handling
- Graceful error handling with custom error classes
- Async error wrapper for controllers
- Global error middleware
- Development vs production error responses

## License

MIT License - see LICENSE file for details