// Smoke test for the application
const { spawn } = require('child_process');
const path = require('path');

console.log('Running smoke tests...\n');

// Test 1: Verify the application runs
function testApplicationRuns() {
    return new Promise((resolve, reject) => {
        const appPath = path.join(__dirname, '../../src/index.js');
        const child = spawn('node', [appPath]);
        
        let output = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            console.error('Error:', data.toString());
            reject(new Error('Application produced error output'));
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Application exited with code ${code}`));
            } else if (output.includes('test')) {
                console.log('✅ Test 1 Passed: Application runs and outputs "test"');
                resolve();
            } else {
                reject(new Error('Application did not output "test"'));
            }
        });
    });
}

// Test 2: Verify configuration loading
function testConfigurationLoading() {
    try {
        const config = require('../../config/config');
        if (config && config.NODE_ENV) {
            console.log('✅ Test 2 Passed: Configuration loads successfully');
            return Promise.resolve();
        } else {
            return Promise.reject(new Error('Configuration did not load properly'));
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

// Run all tests
async function runTests() {
    try {
        await testApplicationRuns();
        await testConfigurationLoading();
        console.log('\n🎉 All smoke tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests();