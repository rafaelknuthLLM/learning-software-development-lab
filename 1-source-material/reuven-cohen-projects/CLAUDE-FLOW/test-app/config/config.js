// Configuration loader with environment variable support
require('dotenv').config();

const config = {
    // Application settings
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERBOSE_LOGGING: process.env.VERBOSE_LOGGING || 'false',
    
    // Additional configuration can be added here
    APP_NAME: process.env.APP_NAME || 'test-app',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Validation to ensure required configs are present
    validate() {
        const required = ['NODE_ENV'];
        const missing = required.filter(key => !this[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }
        
        return true;
    }
};

// Validate configuration on load
try {
    config.validate();
} catch (error) {
    console.error('Configuration error:', error.message);
    process.exit(1);
}

module.exports = config;