#!/usr/bin/env node

/**
 * Build script for Weather Forecast App
 * Handles production builds, optimization, and deployment preparation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  distDir: path.join(__dirname, '../dist'),
  nodeEnv: process.env.NODE_ENV || 'production',
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  analyze: process.argv.includes('--analyze'),
  watch: process.argv.includes('--watch'),
  serve: process.argv.includes('--serve')
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log message with color and timestamp
 */
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString().substr(11, 8);
  console.log(`${colors.blue}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

/**
 * Execute command with error handling
 */
function execCommand(command, options = {}) {
  try {
    if (CONFIG.verbose) {
      log(`Executing: ${command}`, colors.cyan);
    }

    const result = execSync(command, {
      encoding: 'utf8',
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
      ...options
    });

    return result;
  } catch (error) {
    log(`Command failed: ${command}`, colors.red);
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Check if directory exists, create if it doesn't
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, colors.green);
  }
}

/**
 * Clean build directory
 */
function cleanBuild() {
  log('Cleaning build directory...', colors.yellow);

  if (fs.existsSync(CONFIG.distDir)) {
    execCommand(`rm -rf ${CONFIG.distDir}`);
  }

  ensureDir(CONFIG.distDir);
  log('Build directory cleaned', colors.green);
}

/**
 * Lint code
 */
function lintCode() {
  log('Running ESLint...', colors.yellow);

  try {
    execCommand('npm run lint', { cwd: path.join(__dirname, '..') });
    log('Code linting passed', colors.green);
  } catch (error) {
    log('Linting failed - continuing with warnings', colors.yellow);
  }
}

/**
 * Run tests
 */
function runTests() {
  log('Running tests...', colors.yellow);

  try {
    execCommand('npm run test -- --coverage --watchAll=false', {
      cwd: path.join(__dirname, '..')
    });
    log('All tests passed', colors.green);
  } catch (error) {
    log('Tests failed', colors.red);
    process.exit(1);
  }
}

/**
 * Build application using Vite
 */
function buildApp() {
  log('Building application...', colors.yellow);

  const buildCommand = CONFIG.analyze
    ? 'npx vite build --config config/vite.config.js -- --analyze'
    : 'npx vite build --config config/vite.config.js';

  execCommand(buildCommand, {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_ENV: CONFIG.nodeEnv }
  });

  log('Application built successfully', colors.green);
}

/**
 * Optimize build output
 */
function optimizeBuild() {
  log('Optimizing build...', colors.yellow);

  // Gzip static files for better compression
  const staticFiles = ['css', 'js', 'html'];

  staticFiles.forEach(ext => {
    try {
      execCommand(`find ${CONFIG.distDir} -name "*.${ext}" -exec gzip -k {} \\;`);
      log(`Compressed .${ext} files`, colors.green);
    } catch (error) {
      log(`Could not compress .${ext} files (gzip may not be available)`, colors.yellow);
    }
  });

  log('Build optimization completed', colors.green);
}

/**
 * Generate build report
 */
function generateReport() {
  log('Generating build report...', colors.yellow);

  const stats = {
    buildTime: new Date().toISOString(),
    nodeEnv: CONFIG.nodeEnv,
    files: {},
    totalSize: 0
  };

  // Analyze build files
  function analyzeDir(dir, prefix = '') {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const relativePath = path.join(prefix, file);

      if (stat.isDirectory()) {
        analyzeDir(filePath, relativePath);
      } else if (!file.endsWith('.gz')) { // Exclude gzipped files from size calculation
        stats.files[relativePath] = {
          size: stat.size,
          formattedSize: formatBytes(stat.size)
        };
        stats.totalSize += stat.size;
      }
    });
  }

  analyzeDir(CONFIG.distDir);
  stats.formattedTotalSize = formatBytes(stats.totalSize);

  // Write report
  const reportPath = path.join(CONFIG.distDir, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));

  log(`Build report generated: ${reportPath}`, colors.green);
  log(`Total build size: ${stats.formattedTotalSize}`, colors.cyan);
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Start development server
 */
function startDevServer() {
  log('Starting development server...', colors.yellow);

  execCommand('npx vite --config config/vite.config.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
}

/**
 * Start preview server
 */
function startPreviewServer() {
  log('Starting preview server...', colors.yellow);

  execCommand('npx vite preview --config config/vite.config.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
}

/**
 * Validate build
 */
function validateBuild() {
  log('Validating build...', colors.yellow);

  const requiredFiles = [
    'index.html',
    'manifest.json'
  ];

  const missingFiles = requiredFiles.filter(file =>
    !fs.existsSync(path.join(CONFIG.distDir, file))
  );

  if (missingFiles.length > 0) {
    log(`Missing required files: ${missingFiles.join(', ')}`, colors.red);
    process.exit(1);
  }

  // Validate HTML
  const indexPath = path.join(CONFIG.distDir, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (!indexContent.includes('<title>') || !indexContent.includes('<meta')) {
    log('Invalid HTML structure in index.html', colors.red);
    process.exit(1);
  }

  log('Build validation passed', colors.green);
}

/**
 * Main build process
 */
async function main() {
  const startTime = Date.now();

  log('Starting build process...', colors.magenta);
  log(`Environment: ${CONFIG.nodeEnv}`, colors.cyan);
  log(`Build directory: ${CONFIG.distDir}`, colors.cyan);

  try {
    // Handle different modes
    if (CONFIG.watch) {
      startDevServer();
      return;
    }

    if (CONFIG.serve) {
      startPreviewServer();
      return;
    }

    // Production build process
    cleanBuild();
    lintCode();

    // Skip tests in CI or if explicitly disabled
    if (!process.env.CI && !process.argv.includes('--skip-tests')) {
      runTests();
    }

    buildApp();
    validateBuild();
    optimizeBuild();
    generateReport();

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Build completed successfully in ${buildTime}s`, colors.green);

  } catch (error) {
    log(`Build failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('Build process interrupted', colors.yellow);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Build process terminated', colors.yellow);
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main().catch(error => {
    log(`Unexpected error: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = {
  cleanBuild,
  lintCode,
  runTests,
  buildApp,
  optimizeBuild,
  generateReport,
  validateBuild
};