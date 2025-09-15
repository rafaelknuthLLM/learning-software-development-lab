// Jest test setup file
import { TextEncoder, TextDecoder } from 'util';
import fetchMock from 'jest-fetch-mock';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Enable fetch mocking
fetchMock.enableMocks();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock geolocation
const geolocationMock = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};
global.navigator.geolocation = geolocationMock;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  };
};

// Mock console methods for cleaner test output
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning:')) {
    return;
  }
  originalError.call(console, ...args);
};

// Setup custom jest matchers
expect.extend({
  toBeValidUrl(received) {
    const pass = typeof received === 'string' && /^https?:\/\/.+/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false
      };
    }
  },

  toBeValidWeatherData(received) {
    const hasRequired = received &&
      typeof received === 'object' &&
      received.current &&
      received.daily &&
      received.hourly;

    const pass = hasRequired &&
      typeof received.current.temperature === 'number' &&
      Array.isArray(received.daily) &&
      Array.isArray(received.hourly);

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid weather data`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid weather data`,
        pass: false
      };
    }
  }
});

// Global test cleanup
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();

  // Reset localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Reset sessionStorage mock
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();

  // Reset fetch mock
  if (global.fetch.mockClear) {
    global.fetch.mockClear();
  }

  // Reset geolocation mock
  geolocationMock.getCurrentPosition.mockClear();
  geolocationMock.watchPosition.mockClear();
  geolocationMock.clearWatch.mockClear();
});

// Global error handler for unhandled rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});