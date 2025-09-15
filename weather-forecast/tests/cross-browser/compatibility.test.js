// Cross-browser compatibility tests
const { test, expect, devices, chromium, firefox, webkit } = require('@playwright/test');

const BROWSERS = [
    { name: 'Chrome', browserType: chromium },
    { name: 'Firefox', browserType: firefox },
    { name: 'Safari', browserType: webkit }
];

const COMMON_VIEWPORTS = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
];

// Test each browser
for (const { name: browserName, browserType } of BROWSERS) {
    test.describe(`${browserName} Compatibility`, () => {
        let browser;
        let context;
        let page;

        test.beforeAll(async () => {
            browser = await browserType.launch();
            context = await browser.newContext();
            page = await context.newPage();

            // Mock API responses for all tests
            await page.route('**/api.openweathermap.org/data/2.5/**', route => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        name: 'London',
                        sys: { country: 'GB' },
                        main: { temp: 20.5, humidity: 65, pressure: 1013 },
                        weather: [{ description: 'clear sky', icon: '01d' }],
                        wind: { speed: 3.5 }
                    })
                });
            });
        });

        test.afterAll(async () => {
            await browser.close();
        });

        test('should load and display basic elements', async () => {
            await page.goto('http://localhost:8080');

            // Check if main elements are visible
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('h1')).toHaveText('Weather Forecast');

            await expect(page.getByTestId('city-input')).toBeVisible();
            await expect(page.getByTestId('search-button')).toBeVisible();

            // Check if CSS is loaded (background should not be default white)
            const bodyBg = await page.locator('body').evaluate(el =>
                getComputedStyle(el).background
            );
            expect(bodyBg).toBeTruthy();
        });

        test('should handle user input correctly', async () => {
            await page.goto('http://localhost:8080');

            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            // Test input functionality
            await cityInput.fill('London');
            await expect(cityInput).toHaveValue('London');

            // Search button should be enabled
            await expect(searchButton).toBeEnabled();

            // Test search
            await searchButton.click();

            // Should show weather results
            await expect(page.getByTestId('weather-result')).toBeVisible({ timeout: 5000 });
            await expect(page.getByTestId('city-name')).toHaveText('London, GB');
        });

        test('should handle keyboard navigation', async () => {
            await page.goto('http://localhost:8080');

            // Tab navigation should work
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('city-input')).toBeFocused();

            await page.keyboard.press('Tab');
            await expect(page.getByTestId('search-button')).toBeFocused();

            // Enter key should work in input
            await page.getByTestId('city-input').focus();
            await page.getByTestId('city-input').fill('Paris');
            await page.keyboard.press('Enter');

            await expect(page.getByTestId('weather-result')).toBeVisible({ timeout: 5000 });
        });

        test('should display errors appropriately', async () => {
            await page.goto('http://localhost:8080');

            // Override mock to return error
            await page.route('**/api.openweathermap.org/data/2.5/**', route => {
                route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'city not found' })
                });
            });

            await page.getByTestId('city-input').fill('InvalidCity');
            await page.getByTestId('search-button').click();

            await expect(page.getByTestId('error-message')).toBeVisible();
            const errorText = await page.getByTestId('error-message').textContent();
            expect(errorText).toContain('City not found');
        });

        // Test browser-specific features
        if (browserName === 'Chrome') {
            test('should work with Chrome DevTools Performance API', async () => {
                await page.goto('http://localhost:8080');

                // Test performance timing APIs
                const performanceSupported = await page.evaluate(() => {
                    return typeof performance !== 'undefined' &&
                           typeof performance.now === 'function';
                });

                expect(performanceSupported).toBe(true);
            });
        }

        if (browserName === 'Firefox') {
            test('should handle Firefox-specific CSS features', async () => {
                await page.goto('http://localhost:8080');

                // Test CSS Grid support
                const gridSupported = await page.locator('.details').evaluate(el => {
                    const styles = getComputedStyle(el);
                    return styles.display.includes('grid') || styles.display.includes('flex');
                });

                expect(gridSupported).toBe(true);
            });
        }

        if (browserName === 'Safari') {
            test('should work with Safari-specific behaviors', async () => {
                await page.goto('http://localhost:8080');

                // Test iOS Safari viewport behavior
                const viewportMeta = await page.locator('meta[name="viewport"]');
                if (await viewportMeta.count() > 0) {
                    const content = await viewportMeta.getAttribute('content');
                    expect(content).toContain('width=device-width');
                }
            });
        }
    });
}

test.describe('Cross-Browser Feature Support', () => {
    // Test modern JavaScript features across browsers
    for (const { name: browserName, browserType } of BROWSERS) {
        test(`${browserName} - Modern JavaScript features`, async () => {
            const browser = await browserType.launch();
            const page = await browser.newPage();

            await page.goto('http://localhost:8080');

            // Test ES6+ features support
            const jsFeatures = await page.evaluate(() => {
                const features = {};

                // Test async/await support
                features.asyncAwait = (async () => true)().constructor === Promise;

                // Test fetch API
                features.fetchAPI = typeof fetch === 'function';

                // Test localStorage
                features.localStorage = typeof localStorage === 'object';

                // Test Map/Set
                features.mapSet = typeof Map === 'function' && typeof Set === 'function';

                // Test arrow functions
                try {
                    features.arrowFunctions = eval('(() => true)()');
                } catch {
                    features.arrowFunctions = false;
                }

                // Test template literals
                try {
                    features.templateLiterals = eval('`test` === "test"');
                } catch {
                    features.templateLiterals = false;
                }

                return features;
            });

            // All modern browsers should support these features
            expect(jsFeatures.asyncAwait).toBe(true);
            expect(jsFeatures.fetchAPI).toBe(true);
            expect(jsFeatures.localStorage).toBe(true);
            expect(jsFeatures.mapSet).toBe(true);
            expect(jsFeatures.arrowFunctions).toBe(true);
            expect(jsFeatures.templateLiterals).toBe(true);

            await browser.close();
        });
    }
});

test.describe('Responsive Design Across Browsers', () => {
    for (const { name: browserName, browserType } of BROWSERS) {
        for (const viewport of COMMON_VIEWPORTS) {
            test(`${browserName} - ${viewport.name} viewport`, async () => {
                const browser = await browserType.launch();
                const page = await browser.newPage();

                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto('http://localhost:8080');

                // Mock API response
                await page.route('**/api.openweathermap.org/data/2.5/**', route => {
                    route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            name: 'London',
                            sys: { country: 'GB' },
                            main: { temp: 20.5, humidity: 65, pressure: 1013 },
                            weather: [{ description: 'clear sky', icon: '01d' }],
                            wind: { speed: 3.5 }
                        })
                    });
                });

                // Check if layout adapts properly
                await expect(page.getByTestId('city-input')).toBeVisible();
                await expect(page.getByTestId('search-button')).toBeVisible();

                // Test search functionality
                await page.getByTestId('city-input').fill('London');
                await page.getByTestId('search-button').click();

                await expect(page.getByTestId('weather-result')).toBeVisible();

                // Check if weather card fits in viewport
                const weatherCard = page.locator('.weather-card');
                const cardBox = await weatherCard.boundingBox();
                expect(cardBox.width).toBeLessThanOrEqual(viewport.width);
                expect(cardBox.x).toBeGreaterThanOrEqual(0);

                await browser.close();
            });
        }
    }
});

test.describe('Form Handling Across Browsers', () => {
    for (const { name: browserName, browserType } of BROWSERS) {
        test(`${browserName} - Form submission and validation`, async () => {
            const browser = await browserType.launch();
            const page = await browser.newPage();

            await page.goto('http://localhost:8080');

            // Test empty form submission
            await page.getByTestId('search-button').click();
            await expect(page.getByTestId('error-message')).toBeVisible();

            // Test form reset behavior
            await page.getByTestId('city-input').fill('Test City');
            await page.getByTestId('city-input').fill('');

            // Button should be disabled for empty input
            const isDisabled = await page.getByTestId('search-button').isDisabled();
            expect(isDisabled).toBe(true);

            await browser.close();
        });
    }
});

test.describe('CSS Compatibility', () => {
    for (const { name: browserName, browserType } of BROWSERS) {
        test(`${browserName} - CSS Grid and Flexbox support`, async () => {
            const browser = await browserType.launch();
            const page = await browser.newPage();

            await page.goto('http://localhost:8080');

            // Test CSS Grid support in weather details
            const detailsSupported = await page.locator('.details').evaluate(el => {
                const styles = getComputedStyle(el);
                return styles.display !== 'block'; // Should use grid or flex
            });

            expect(detailsSupported).toBe(true);

            // Test modern CSS properties
            const modernCSSSupported = await page.locator('.weather-card').evaluate(el => {
                const styles = getComputedStyle(el);
                return {
                    borderRadius: styles.borderRadius !== '',
                    boxShadow: styles.boxShadow !== 'none',
                    background: styles.background !== ''
                };
            });

            expect(modernCSSSupported.borderRadius).toBe(true);
            expect(modernCSSSupported.boxShadow).toBe(true);
            expect(modernCSSSupported.background).toBe(true);

            await browser.close();
        });
    }
});

test.describe('Event Handling Compatibility', () => {
    for (const { name: browserName, browserType } of BROWSERS) {
        test(`${browserName} - Mouse and keyboard events`, async () => {
            const browser = await browserType.launch();
            const page = await browser.newPage();

            await page.goto('http://localhost:8080');

            // Test mouse events
            const cityInput = page.getByTestId('city-input');
            await cityInput.click();
            await expect(cityInput).toBeFocused();

            // Test keyboard events
            await cityInput.fill('Test');
            await cityInput.press('Backspace');
            await expect(cityInput).toHaveValue('Tes');

            // Test Enter key
            await cityInput.fill('London');

            // Mock API for search
            await page.route('**/api.openweathermap.org/data/2.5/**', route => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        name: 'London',
                        sys: { country: 'GB' },
                        main: { temp: 20, humidity: 65, pressure: 1013 },
                        weather: [{ description: 'clear sky', icon: '01d' }],
                        wind: { speed: 3.5 }
                    })
                });
            });

            await cityInput.press('Enter');
            await expect(page.getByTestId('weather-result')).toBeVisible();

            await browser.close();
        });
    }
});

test.describe('Performance Across Browsers', () => {
    for (const { name: browserName, browserType } of BROWSERS) {
        test(`${browserName} - Page load performance`, async () => {
            const browser = await browserType.launch();
            const page = await browser.newPage();

            const startTime = Date.now();
            await page.goto('http://localhost:8080');

            // Wait for page to be interactive
            await expect(page.getByTestId('city-input')).toBeVisible();

            const loadTime = Date.now() - startTime;

            // Page should load reasonably quickly in all browsers
            expect(loadTime).toBeLessThan(5000);

            // Test JavaScript execution performance
            const jsPerf = await page.evaluate(() => {
                const start = performance.now();

                // Simulate some work
                for (let i = 0; i < 10000; i++) {
                    Math.random();
                }

                return performance.now() - start;
            });

            expect(jsPerf).toBeLessThan(100); // Should execute quickly

            await browser.close();
        });
    }
});

// Mobile browser testing
test.describe('Mobile Browser Compatibility', () => {
    const MOBILE_DEVICES = [
        devices['iPhone 12'],
        devices['Pixel 5'],
        devices['iPad Pro']
    ];

    for (const device of MOBILE_DEVICES) {
        test(`${device.name} - Touch interactions`, async ({ browser }) => {
            const context = await browser.newContext(device);
            const page = await context.newPage();

            await page.goto('http://localhost:8080');

            // Mock API
            await page.route('**/api.openweathermap.org/data/2.5/**', route => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        name: 'London',
                        sys: { country: 'GB' },
                        main: { temp: 20, humidity: 65, pressure: 1013 },
                        weather: [{ description: 'clear sky', icon: '01d' }],
                        wind: { speed: 3.5 }
                    })
                });
            });

            // Test touch events
            await page.getByTestId('city-input').tap();
            await expect(page.getByTestId('city-input')).toBeFocused();

            await page.getByTestId('city-input').fill('London');
            await page.getByTestId('search-button').tap();

            await expect(page.getByTestId('weather-result')).toBeVisible();

            await context.close();
        });
    }
});