#!/usr/bin/env node

const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

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

const migrations = [
  {
    version: '1.0.0',
    description: 'Initial database setup',
    up: async () => {
      winston.info('Running initial database setup...');
      // Add any initial migration logic here
      winston.info('Initial setup completed');
    },
    down: async () => {
      winston.info('Reverting initial database setup...');
      // Add rollback logic here
      winston.info('Initial setup reverted');
    }
  },
  {
    version: '1.1.0',
    description: 'Add indexes for performance',
    up: async () => {
      winston.info('Adding performance indexes...');
      
      const db = mongoose.connection.db;
      
      // User indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ isActive: 1 });
      
      // Post indexes
      await db.collection('posts').createIndex({ author: 1, status: 1 });
      await db.collection('posts').createIndex({ status: 1, publishedAt: -1 });
      await db.collection('posts').createIndex({ tags: 1 });
      await db.collection('posts').createIndex({ 'seo.slug': 1 }, { unique: true, sparse: true });
      await db.collection('posts').createIndex({ 
        title: 'text', 
        content: 'text', 
        tags: 'text' 
      });
      
      winston.info('Performance indexes added successfully');
    },
    down: async () => {
      winston.info('Removing performance indexes...');
      
      const db = mongoose.connection.db;
      
      // Drop custom indexes (keep default _id indexes)
      try {
        await db.collection('users').dropIndex({ email: 1 });
        await db.collection('users').dropIndex({ username: 1 });
        await db.collection('users').dropIndex({ role: 1 });
        await db.collection('users').dropIndex({ isActive: 1 });
        
        await db.collection('posts').dropIndex({ author: 1, status: 1 });
        await db.collection('posts').dropIndex({ status: 1, publishedAt: -1 });
        await db.collection('posts').dropIndex({ tags: 1 });
        await db.collection('posts').dropIndex({ 'seo.slug': 1 });
        await db.collection('posts').dropIndex({ 
          title: 'text', 
          content: 'text', 
          tags: 'text' 
        });
      } catch (error) {
        winston.warn('Some indexes may not exist:', error.message);
      }
      
      winston.info('Performance indexes removed');
    }
  }
];

// Migration tracking collection
const MigrationSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  description: String,
  appliedAt: { type: Date, default: Date.now }
});

const Migration = mongoose.model('Migration', MigrationSchema);

const getAppliedMigrations = async () => {
  return await Migration.find({}).sort({ version: 1 });
};

const markMigrationApplied = async (version, description) => {
  await Migration.create({ version, description });
};

const markMigrationReverted = async (version) => {
  await Migration.deleteOne({ version });
};

const runMigrations = async (direction = 'up') => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restapi');
    winston.info('Connected to MongoDB for migrations');

    const appliedMigrations = await getAppliedMigrations();
    const appliedVersions = appliedMigrations.map(m => m.version);

    if (direction === 'up') {
      // Apply pending migrations
      let appliedCount = 0;
      
      for (const migration of migrations) {
        if (!appliedVersions.includes(migration.version)) {
          winston.info(`Applying migration ${migration.version}: ${migration.description}`);
          await migration.up();
          await markMigrationApplied(migration.version, migration.description);
          appliedCount++;
          winston.info(`✓ Migration ${migration.version} applied successfully`);
        } else {
          winston.info(`- Migration ${migration.version} already applied`);
        }
      }
      
      if (appliedCount === 0) {
        winston.info('No pending migrations to apply');
      } else {
        winston.info(`Applied ${appliedCount} migration(s) successfully`);
      }
      
    } else if (direction === 'down') {
      // Revert the last migration
      if (appliedMigrations.length === 0) {
        winston.info('No migrations to revert');
        return;
      }
      
      const lastMigration = appliedMigrations[appliedMigrations.length - 1];
      const migrationToRevert = migrations.find(m => m.version === lastMigration.version);
      
      if (migrationToRevert) {
        winston.info(`Reverting migration ${migrationToRevert.version}: ${migrationToRevert.description}`);
        await migrationToRevert.down();
        await markMigrationReverted(migrationToRevert.version);
        winston.info(`✓ Migration ${migrationToRevert.version} reverted successfully`);
      } else {
        winston.error(`Migration ${lastMigration.version} not found in migration files`);
      }
    }

  } catch (error) {
    winston.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    winston.info('Database connection closed');
    process.exit(0);
  }
};

const showMigrationStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restapi');
    
    const appliedMigrations = await getAppliedMigrations();
    const appliedVersions = appliedMigrations.map(m => m.version);
    
    winston.info('Migration Status:');
    winston.info('================');
    
    migrations.forEach(migration => {
      const status = appliedVersions.includes(migration.version) ? '✓ Applied' : '✗ Pending';
      const appliedDate = appliedMigrations.find(m => m.version === migration.version)?.appliedAt || '';
      winston.info(`${migration.version}: ${status} - ${migration.description}${appliedDate ? ` (${appliedDate})` : ''}`);
    });
    
  } catch (error) {
    winston.error('Failed to get migration status:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'up':
    runMigrations('up');
    break;
  case 'down':
    runMigrations('down');
    break;
  case 'status':
    showMigrationStatus();
    break;
  default:
    winston.info('Usage: node migrate.js [command]');
    winston.info('Commands:');
    winston.info('  up     - Apply pending migrations');
    winston.info('  down   - Revert last migration');
    winston.info('  status - Show migration status');
    process.exit(0);
}