#!/usr/bin/env node

const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

const User = require('../models/User');

// Setup logger
winston.configure({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restapi');
    winston.info('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      winston.info('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator'
      }
    };

    const admin = await User.create(adminData);
    winston.info('Admin user created successfully:', {
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    winston.info('Setup completed successfully!');
    winston.info('Default admin credentials:');
    winston.info('Email: admin@example.com');
    winston.info('Password: Admin123!');
    winston.info('Please change these credentials after first login.');

  } catch (error) {
    winston.error('Setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    winston.info('Database connection closed');
    process.exit(0);
  }
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restapi');
    winston.info('Connected to MongoDB for seeding');

    // Create sample users
    const sampleUsers = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software developer and tech enthusiast'
        }
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'UX designer and content creator'
        }
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        winston.info(`Created sample user: ${user.username}`);
      } else {
        winston.info(`User already exists: ${userData.username}`);
      }
    }

    winston.info('Database seeding completed!');

  } catch (error) {
    winston.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

const dropDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restapi');
    winston.info('Connected to MongoDB for cleanup');

    await mongoose.connection.db.dropDatabase();
    winston.info('Database dropped successfully');

  } catch (error) {
    winston.error('Database cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'admin':
    createAdminUser();
    break;
  case 'seed':
    seedDatabase();
    break;
  case 'drop':
    winston.info('This will delete all data. Type "yes" to continue:');
    process.stdin.resume();
    process.stdin.on('data', (data) => {
      if (data.toString().trim() === 'yes') {
        dropDatabase();
      } else {
        winston.info('Database cleanup cancelled');
        process.exit(0);
      }
    });
    break;
  default:
    winston.info('Usage: node setup.js [command]');
    winston.info('Commands:');
    winston.info('  admin - Create admin user');
    winston.info('  seed  - Seed database with sample data');
    winston.info('  drop  - Drop entire database (requires confirmation)');
    process.exit(0);
}