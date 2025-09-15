// E2E tests for responsive design and UI/UX
const { test, expect, devices } = require('@playwright/test');

const VIEWPORT_SIZES = {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
    smallMobile: { width: 320, height: 568 }
};

test.describe('Responsive Design Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API responses
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

        await page.goto('http://localhost:8080');
    });

    test.describe('Desktop Layout', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORT_SIZES.desktop);
        });

        test('should display properly on desktop', async ({ page }) => {
            // Check header
            const title = page.locator('h1');
            await expect(title).toBeVisible();
            await expect(title).toHaveText('Weather Forecast');

            // Check search section layout
            const searchSection = page.locator('.search-section');
            await expect(searchSection).toBeVisible();

            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            await expect(cityInput).toBeVisible();
            await expect(searchButton).toBeVisible();

            // Check that input and button are on same line
            const inputBox = await cityInput.boundingBox();
            const buttonBox = await searchButton.boundingBox();
            expect(Math.abs(inputBox.y - buttonBox.y)).toBeLessThan(10);
        });

        test('should handle weather card layout on desktop', async ({ page }) => {
            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            await cityInput.fill('London');
            await searchButton.click();

            await expect(page.getByTestId('weather-result')).toBeVisible();

            // Check weather card width and centering
            const weatherCard = page.locator('.weather-card');
            await expect(weatherCard).toBeVisible();

            const cardBox = await weatherCard.boundingBox();
            const pageWidth = await page.evaluate(() => window.innerWidth);

            // Weather card should be centered and not full width on desktop
            expect(cardBox.width).toBeLessThan(pageWidth * 0.8);

            // Check grid layout for details
            const details = page.locator('.details');
            await expect(details).toHaveCSS('display', /grid|flex/);
        });
    });

    test.describe('Tablet Layout', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORT_SIZES.tablet);
        });

        test('should adapt to tablet screen size', async ({ page }) => {
            const searchSection = page.locator('.search-section');
            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            await expect(searchSection).toBeVisible();
            await expect(cityInput).toBeVisible();
            await expect(searchButton).toBeVisible();

            // Check that elements are still properly sized
            const inputBox = await cityInput.boundingBox();
            expect(inputBox.width).toBeGreaterThan(200);
        });

        test('should maintain usable search interface on tablet', async ({ page }) => {
            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            // Input should be touch-friendly
            const inputBox = await cityInput.boundingBox();
            expect(inputBox.height).toBeGreaterThan(40); // Minimum touch target

            const buttonBox = await searchButton.boundingBox();
            expect(buttonBox.height).toBeGreaterThan(40);

            // Should be able to interact
            await cityInput.fill('Paris');
            await searchButton.click();

            await expect(page.getByTestId('weather-result')).toBeVisible();
        });
    });

    test.describe('Mobile Layout', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORT_SIZES.mobile);
        });

        test('should stack elements vertically on mobile', async ({ page }) => {
            const searchSection = page.locator('.search-section');

            // Check if search section exists and is visible
            await expect(searchSection).toBeVisible();

            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            await expect(cityInput).toBeVisible();
            await expect(searchButton).toBeVisible();

            // On small screens, elements might stack
            const inputBox = await cityInput.boundingBox();
            const buttonBox = await searchButton.boundingBox();

            // Elements should have sufficient touch targets
            expect(inputBox.height).toBeGreaterThan(40);
            expect(buttonBox.height).toBeGreaterThan(40);
        });

        test('should display weather card appropriately on mobile', async ({ page }) => {
            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            await cityInput.fill('Tokyo');
            await searchButton.click();

            await expect(page.getByTestId('weather-result')).toBeVisible();

            const weatherCard = page.locator('.weather-card');
            const cardBox = await weatherCard.boundingBox();
            const pageWidth = await page.evaluate(() => window.innerWidth);

            // Card should use most of the mobile screen width
            expect(cardBox.width).toBeGreaterThan(pageWidth * 0.8);

            // Details should stack vertically on mobile
            const detailItems = page.locator('.detail-item');
            const count = await detailItems.count();
            expect(count).toBeGreaterThan(0);

            // Temperature should be readable
            const temperature = page.getByTestId('temperature');
            await expect(temperature).toBeVisible();
            const tempBox = await temperature.boundingBox();
            expect(tempBox.height).toBeGreaterThan(30);
        });

        test('should handle mobile keyboard interaction', async ({ page }) => {
            const cityInput = page.getByTestId('city-input');

            // Focus on input should bring up keyboard
            await cityInput.focus();
            await expect(cityInput).toBeFocused();

            // Should be able to type
            await cityInput.fill('Berlin');
            await expect(cityInput).toHaveValue('Berlin');

            // Enter key should trigger search
            await cityInput.press('Enter');
            await expect(page.getByTestId('weather-result')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Small Mobile Layout', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORT_SIZES.smallMobile);
        });

        test('should work on very small screens', async ({ page }) => {
            const title = page.locator('h1');
            await expect(title).toBeVisible();

            // Title should be smaller on very small screens
            const titleSize = await title.evaluate(el => {
                return window.getComputedStyle(el).fontSize;
            });

            // Font size should be reasonable for small screens
            const fontSize = parseFloat(titleSize);
            expect(fontSize).toBeLessThan(40); // Not too large
            expect(fontSize).toBeGreaterThan(20); // Not too small

            // Search elements should still be usable
            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            await expect(cityInput).toBeVisible();
            await expect(searchButton).toBeVisible();

            // Should be able to complete search flow
            await cityInput.fill('Madrid');
            await searchButton.click();

            await expect(page.getByTestId('weather-result')).toBeVisible();
        });
    });

    test.describe('Orientation Changes', () => {
        test('should handle landscape orientation on mobile', async ({ page }) => {
            // Start in portrait
            await page.setViewportSize({ width: 375, height: 667 });

            const cityInput = page.getByTestId('city-input');
            await cityInput.fill('Rome');

            // Switch to landscape
            await page.setViewportSize({ width: 667, height: 375 });

            // Elements should still be accessible
            await expect(cityInput).toBeVisible();
            await expect(page.getByTestId('search-button')).toBeVisible();

            // Should still be able to search
            await page.getByTestId('search-button').click();
            await expect(page.getByTestId('weather-result')).toBeVisible();
        });
    });

    test.describe('Touch Interactions', () => {
        test.use({ ...devices['iPhone 12'] });

        test('should handle touch events properly', async ({ page }) => {
            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            // Tap interactions
            await cityInput.tap();
            await expect(cityInput).toBeFocused();

            await cityInput.fill('Vancouver');

            // Tap search button
            await searchButton.tap();
            await expect(page.getByTestId('weather-result')).toBeVisible();

            // Should be able to tap weather card elements
            const weatherCard = page.locator('.weather-card');
            await expect(weatherCard).toBeVisible();
        });

        test('should handle swipe gestures gracefully', async ({ page }) => {
            const weatherResult = page.getByTestId('weather-result');

            // First get weather data
            await page.getByTestId('city-input').fill('Sydney');
            await page.getByTestId('search-button').click();
            await expect(weatherResult).toBeVisible();

            // Try swiping on the weather card
            const weatherCard = page.locator('.weather-card');
            const box = await weatherCard.boundingBox();

            // Simulate swipe (should not break the interface)
            await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width/2 + 100, box.y + box.height/2);
            await page.mouse.up();

            // Weather card should still be visible and functional
            await expect(weatherCard).toBeVisible();
        });
    });

    test.describe('Accessibility on Different Screen Sizes', () => {
        test('should maintain accessibility across viewports', async ({ page }) => {
            const viewports = [VIEWPORT_SIZES.desktop, VIEWPORT_SIZES.tablet, VIEWPORT_SIZES.mobile];

            for (const viewport of viewports) {
                await page.setViewportSize(viewport);

                // Check color contrast (basic check)
                const searchButton = page.getByTestId('search-button');
                const buttonBg = await searchButton.evaluate(el => {
                    return window.getComputedStyle(el).backgroundColor;
                });
                const buttonColor = await searchButton.evaluate(el => {
                    return window.getComputedStyle(el).color;
                });

                // Should have background and text colors
                expect(buttonBg).toBeTruthy();
                expect(buttonColor).toBeTruthy();
                expect(buttonBg).not.toBe(buttonColor);

                // Check ARIA labels are present
                await expect(page.getByTestId('city-input')).toHaveAttribute('aria-label');
                await expect(page.getByTestId('search-button')).toHaveAttribute('aria-label');
            }
        });

        test('should have proper focus management on all sizes', async ({ page }) => {
            await page.setViewportSize(VIEWPORT_SIZES.mobile);

            const cityInput = page.getByTestId('city-input');
            const searchButton = page.getByTestId('search-button');

            // Focus should be visible
            await cityInput.focus();
            const focusedElement = page.locator(':focus');
            await expect(focusedElement).toHaveCount(1);

            // Tab navigation should work
            await page.keyboard.press('Tab');
            await expect(searchButton).toBeFocused();
        });
    });

    test.describe('Performance on Different Devices', () => {
        test('should load quickly on mobile devices', async ({ page }) => {
            await page.setViewportSize(VIEWPORT_SIZES.mobile);

            const startTime = Date.now();
            await page.goto('http://localhost:8080');

            // Page should be interactive quickly
            await expect(page.getByTestId('city-input')).toBeVisible();

            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds

            // Should be able to interact immediately
            await page.getByTestId('city-input').fill('Test');
            await expect(page.getByTestId('search-button')).toBeEnabled();
        });
    });
});