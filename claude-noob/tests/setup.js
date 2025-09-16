/**
 * Jest test setup for Claude-Flow application
 */

// Polyfill for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Setup DOM environment
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

// Set up test timeouts
jest.setTimeout(15000);

// Setup after JSDOM is available
beforeEach(() => {
    if (typeof window !== 'undefined') {
        // Mock window.performance
        Object.defineProperty(window, 'performance', {
            writable: true,
            value: {
                now: jest.fn(() => Date.now()),
            },
        });

        // Mock scrollTo
        window.scrollTo = jest.fn();

        // Mock prompt
        window.prompt = jest.fn();
    }
});