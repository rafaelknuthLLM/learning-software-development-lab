// Test utilities and helper functions

/**
 * Mock Weather API responses for testing
 */
export const mockWeatherResponses = {
    london: {
        name: 'London',
        sys: { country: 'GB' },
        main: { temp: 20.5, humidity: 65, pressure: 1013 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        wind: { speed: 3.5 }
    },
    paris: {
        name: 'Paris',
        sys: { country: 'FR' },
        main: { temp: 18.2, humidity: 72, pressure: 1008 },
        weather: [{ description: 'light rain', icon: '10d' }],
        wind: { speed: 2.8 }
    },
    tokyo: {
        name: 'Tokyo',
        sys: { country: 'JP' },
        main: { temp: 15.7, humidity: 58, pressure: 1025 },
        weather: [{ description: 'partly cloudy', icon: '02d' }],
        wind: { speed: 4.2 }
    },
    invalidCity: {
        status: 404,
        message: 'city not found'
    },
    serverError: {
        status: 500,
        message: 'internal server error'
    },
    rateLimited: {
        status: 429,
        message: 'rate limit exceeded'
    }
};

/**
 * Creates a mock fetch function with predefined responses
 * @param {string} responseType - Type of response to mock
 * @returns {jest.MockedFunction}
 */
export function createMockFetch(responseType = 'london') {
    const mockResponse = mockWeatherResponses[responseType];

    if (mockResponse.status) {
        // Error response
        return jest.fn().mockResolvedValue({
            ok: false,
            status: mockResponse.status,
            json: () => Promise.resolve({ message: mockResponse.message })
        });
    }

    // Success response
    return jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
    });
}

/**
 * Creates a delayed mock fetch for performance testing
 * @param {number} delay - Delay in milliseconds
 * @param {string} responseType - Type of response to mock
 * @returns {jest.MockedFunction}
 */
export function createDelayedMockFetch(delay = 100, responseType = 'london') {
    const mockResponse = mockWeatherResponses[responseType];

    return jest.fn().mockImplementation(() =>
        new Promise(resolve => {
            setTimeout(() => {
                if (mockResponse.status) {
                    resolve({
                        ok: false,
                        status: mockResponse.status,
                        json: () => Promise.resolve({ message: mockResponse.message })
                    });
                } else {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve(mockResponse)
                    });
                }
            }, delay);
        })
    );
}

/**
 * Performance testing helper
 */
export class PerformanceTester {
    constructor() {
        this.measurements = [];
    }

    start() {
        this.startTime = performance.now();
    }

    end(label = 'measurement') {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        this.measurements.push({ label, duration, timestamp: endTime });
        return duration;
    }

    getStats() {
        if (this.measurements.length === 0) return null;

        const durations = this.measurements.map(m => m.duration);
        return {
            count: durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
            avg: durations.reduce((a, b) => a + b, 0) / durations.length,
            total: durations.reduce((a, b) => a + b, 0)
        };
    }

    clear() {
        this.measurements = [];
    }
}

/**
 * DOM testing utilities
 */
export const DOMUtils = {
    /**
     * Creates a complete DOM structure for testing
     */
    setupDOM() {
        document.body.innerHTML = `
            <div class="container">
                <header>
                    <h1>Weather Forecast</h1>
                </header>
                <main>
                    <div class="search-section">
                        <input
                            type="text"
                            id="cityInput"
                            placeholder="Enter city name..."
                            aria-label="City name input"
                            data-testid="city-input"
                        >
                        <button
                            id="searchBtn"
                            data-testid="search-button"
                            aria-label="Search weather"
                        >
                            Search
                        </button>
                    </div>
                    <div id="loadingSpinner" class="loading hidden" data-testid="loading-spinner">
                        Loading...
                    </div>
                    <div id="errorMessage" class="error hidden" data-testid="error-message">
                    </div>
                    <div id="weatherResult" class="weather-result hidden" data-testid="weather-result">
                        <div class="weather-card">
                            <h2 id="cityName" data-testid="city-name"></h2>
                            <div class="temperature-section">
                                <span id="temperature" class="temperature" data-testid="temperature"></span>
                                <span id="unit" class="unit">°C</span>
                            </div>
                            <div id="description" class="description" data-testid="description"></div>
                            <div class="details">
                                <div class="detail-item">
                                    <span class="label">Humidity:</span>
                                    <span id="humidity" data-testid="humidity"></span>%
                                </div>
                                <div class="detail-item">
                                    <span class="label">Wind Speed:</span>
                                    <span id="windSpeed" data-testid="wind-speed"></span> m/s
                                </div>
                                <div class="detail-item">
                                    <span class="label">Pressure:</span>
                                    <span id="pressure" data-testid="pressure"></span> hPa
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Cleans up DOM after tests
     */
    cleanup() {
        document.body.innerHTML = '';
    },

    /**
     * Simulates user typing with proper events
     * @param {HTMLElement} element - Input element
     * @param {string} text - Text to type
     */
    async typeText(element, text) {
        element.focus();
        element.value = '';

        for (const char of text) {
            element.value += char;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    },

    /**
     * Simulates button click with proper events
     * @param {HTMLElement} button - Button element
     */
    clickButton(button) {
        button.dispatchEvent(new Event('click', { bubbles: true }));
    },

    /**
     * Waits for an element to become visible
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForVisible(selector, timeout = 5000) {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            const element = document.querySelector(selector);
            if (element && !element.classList.contains('hidden')) {
                return element;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        throw new Error(`Element ${selector} did not become visible within ${timeout}ms`);
    }
};

/**
 * Accessibility testing utilities
 */
export const A11yUtils = {
    /**
     * Checks if an element has proper ARIA attributes
     * @param {HTMLElement} element - Element to check
     */
    checkARIA(element) {
        const checks = {
            hasLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
            hasRole: element.hasAttribute('role'),
            isInteractive: element.tagName.toLowerCase() === 'button' ||
                          element.tagName.toLowerCase() === 'input' ||
                          element.hasAttribute('role'),
            isFocusable: element.tabIndex >= 0 ||
                        ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase())
        };

        return checks;
    },

    /**
     * Simulates screen reader navigation
     * @param {HTMLElement} container - Container to navigate
     */
    simulateScreenReaderNavigation(container) {
        const focusableElements = container.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );

        const navigation = [];
        focusableElements.forEach((element, index) => {
            navigation.push({
                index,
                tagName: element.tagName.toLowerCase(),
                label: element.getAttribute('aria-label') ||
                       element.textContent?.trim() ||
                       element.getAttribute('placeholder') ||
                       'Unlabeled element',
                role: element.getAttribute('role'),
                focusable: true
            });
        });

        return navigation;
    },

    /**
     * Checks color contrast (basic implementation)
     * @param {HTMLElement} element - Element to check
     */
    checkColorContrast(element) {
        const styles = getComputedStyle(element);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;

        // Basic check - both should be defined and different
        return {
            hasBackgroundColor: backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent',
            hasTextColor: color !== 'rgba(0, 0, 0, 0)',
            colorsAreDifferent: backgroundColor !== color
        };
    }
};

/**
 * Browser compatibility testing utilities
 */
export const BrowserUtils = {
    /**
     * Detects browser capabilities
     */
    getCapabilities() {
        return {
            fetch: typeof fetch === 'function',
            localStorage: typeof localStorage === 'object',
            sessionStorage: typeof sessionStorage === 'object',
            webWorkers: typeof Worker === 'function',
            serviceWorker: 'serviceWorker' in navigator,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            webSockets: typeof WebSocket === 'function',
            indexedDB: 'indexedDB' in window,
            webGL: !!document.createElement('canvas').getContext('webgl'),
            webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            touchEvents: 'ontouchstart' in window,
            pointerEvents: 'onpointerdown' in window,
            customElements: 'customElements' in window,
            shadowDOM: 'attachShadow' in Element.prototype,
            css: {
                grid: CSS.supports('display', 'grid'),
                flexbox: CSS.supports('display', 'flex'),
                variables: CSS.supports('color', 'var(--test)'),
                transforms: CSS.supports('transform', 'rotate(45deg)')
            }
        };
    },

    /**
     * Simulates different network conditions
     * @param {string} condition - 'fast', 'slow', 'offline'
     */
    simulateNetworkCondition(condition) {
        const originalFetch = window.fetch;

        switch (condition) {
            case 'slow':
                window.fetch = (...args) => {
                    return new Promise(resolve => {
                        setTimeout(() => resolve(originalFetch(...args)), 2000);
                    });
                };
                break;
            case 'offline':
                window.fetch = () => Promise.reject(new Error('Network error'));
                break;
            case 'fast':
            default:
                window.fetch = originalFetch;
                break;
        }

        // Return cleanup function
        return () => {
            window.fetch = originalFetch;
        };
    }
};

/**
 * Error testing utilities
 */
export const ErrorUtils = {
    /**
     * Creates common error scenarios
     */
    scenarios: {
        networkError: () => new TypeError('Failed to fetch'),
        timeoutError: () => new Error('Request timeout'),
        parseError: () => new SyntaxError('Unexpected token'),
        validationError: (field) => new Error(`Invalid ${field}`),
        notFoundError: () => new Error('City not found. Please check the spelling and try again.'),
        serverError: () => new Error('Weather service is temporarily unavailable'),
        rateLimitError: () => new Error('Too many requests. Please try again later.'),
        authError: () => new Error('Invalid API key')
    },

    /**
     * Captures and analyzes errors
     */
    createErrorCapture() {
        const errors = [];
        const originalConsoleError = console.error;

        console.error = (...args) => {
            errors.push({
                timestamp: Date.now(),
                message: args.join(' '),
                stack: new Error().stack
            });
            originalConsoleError(...args);
        };

        return {
            getErrors: () => errors,
            clear: () => errors.length = 0,
            restore: () => {
                console.error = originalConsoleError;
            }
        };
    }
};

/**
 * Data generators for testing
 */
export const DataGenerators = {
    /**
     * Generates random city names
     * @param {number} count - Number of cities to generate
     */
    generateCities(count = 10) {
        const cities = [
            'London', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Berlin', 'Rome', 'Madrid',
            'Amsterdam', 'Vienna', 'Prague', 'Dublin', 'Stockholm', 'Oslo', 'Helsinki',
            'Copenhagen', 'Brussels', 'Zurich', 'Barcelona', 'Milan', 'Munich', 'Hamburg'
        ];

        return Array.from({ length: count }, () =>
            cities[Math.floor(Math.random() * cities.length)]
        );
    },

    /**
     * Generates weather data for testing
     * @param {string} city - City name
     */
    generateWeatherData(city = 'Test City') {
        return {
            name: city,
            sys: { country: 'TC' },
            main: {
                temp: Math.round(Math.random() * 30 + 5), // 5-35°C
                humidity: Math.round(Math.random() * 40 + 30), // 30-70%
                pressure: Math.round(Math.random() * 100 + 980) // 980-1080 hPa
            },
            weather: [{
                description: ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'shower rain', 'rain', 'thunderstorm', 'snow', 'mist'][Math.floor(Math.random() * 9)],
                icon: '01d'
            }],
            wind: {
                speed: Math.round(Math.random() * 10 * 10) / 10 // 0-10 m/s with 1 decimal
            }
        };
    },

    /**
     * Generates test user interactions
     * @param {number} count - Number of interactions
     */
    generateUserInteractions(count = 5) {
        const actions = ['search', 'clear', 'refresh', 'back'];
        const cities = this.generateCities(10);

        return Array.from({ length: count }, () => ({
            action: actions[Math.floor(Math.random() * actions.length)],
            city: cities[Math.floor(Math.random() * cities.length)],
            timestamp: Date.now() + Math.random() * 1000000,
            delay: Math.round(Math.random() * 2000 + 500) // 500-2500ms delay
        }));
    }
};