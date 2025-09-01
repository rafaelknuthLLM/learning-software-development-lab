const mongoose = require('mongoose');
const winston = require('winston');

const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restapi';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    
    winston.info('MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      winston.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      winston.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      winston.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    winston.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase };