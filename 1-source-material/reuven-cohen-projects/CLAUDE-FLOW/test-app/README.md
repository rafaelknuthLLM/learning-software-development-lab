# Test App

A simple Node.js application that outputs 'test' to the console.

## Features

- Clean architecture with modular structure
- Environment-based configuration
- Error handling and graceful degradation
- Smoke tests for basic functionality
- No hardcoded values - all configuration via environment variables

## Project Structure

```
test-app/
├── src/
│   └── index.js          # Main application entry point
├── config/
│   └── config.js         # Configuration management
├── tests/
│   └── smoke/
│       └── test.js       # Basic smoke tests
├── .env.example          # Environment variables template
├── package.json          # Project dependencies
└── README.md            # This file
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd test-app
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env file if needed
   ```

3. **Run the Application**
   ```bash
   npm start
   ```
   
   Expected output:
   ```
   test
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Configuration

All configuration is managed through environment variables. See `.env.example` for available options:

- `NODE_ENV` - Application environment (development/production)
- `VERBOSE_LOGGING` - Enable verbose logging (true/false)

## Development

The application follows clean architecture principles:
- All configuration is externalized
- Modular code structure (< 500 lines per file)
- Comprehensive error handling
- Environment-based configuration

## License

MIT