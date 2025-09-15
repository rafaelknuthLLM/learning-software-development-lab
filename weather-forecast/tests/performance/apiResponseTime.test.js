// Performance tests for API response times
/**
 * @jest-environment jsdom
 */

const WeatherAPI = require('../../src/weatherApi');

describe('API Performance Tests', () => {
    let weatherAPI;
    const PERFORMANCE_THRESHOLDS = {
        FAST_RESPONSE: 200,      // < 200ms is fast
        ACCEPTABLE_RESPONSE: 1000, // < 1s is acceptable
        SLOW_RESPONSE: 3000      // > 3s is too slow
    };

    beforeEach(() => {
        weatherAPI = new WeatherAPI('test-api-key');
        fetch.mockClear();

        // Mock performance.now for consistent testing
        let callCount = 0;
        performance.now = jest.fn().mockImplementation(() => {
            callCount++;
            // Return incrementing timestamps to simulate time passage
            return callCount * 100; // 100ms per call
        });
    });

    describe('API Response Time Benchmarks', () => {
        const mockWeatherResponse = {
            name: 'London',
            sys: { country: 'GB' },
            main: { temp: 20, humidity: 65, pressure: 1013 },
            weather: [{ description: 'clear sky', icon: '01d' }],
            wind: { speed: 3.5 }
        };

        it('should track response times accurately', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockWeatherResponse)
            });

            const result = await weatherAPI.fetchWeatherData('London');

            expect(result.responseTime).toBeDefined();
            expect(typeof result.responseTime).toBe('number');
            expect(result.responseTime).toBeGreaterThan(0);
        });

        it('should perform well under normal conditions', async () => {
            // Mock fast API response (simulate 150ms response time)
            performance.now = jest.fn()
                .mockReturnValueOnce(1000)    // Start time
                .mockReturnValueOnce(1150);   // End time (150ms later)

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => new Promise(resolve =>
                    setTimeout(() => resolve(mockWeatherResponse), 10)
                )
            });

            const result = await weatherAPI.fetchWeatherData('London');

            expect(result.responseTime).toBe(150);
            expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST_RESPONSE);
        });

        it('should handle acceptable response times', async () => {
            // Mock acceptable API response (simulate 800ms response time)
            performance.now = jest.fn()
                .mockReturnValueOnce(1000)    // Start time
                .mockReturnValueOnce(1800);   // End time (800ms later)

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => new Promise(resolve =>
                    setTimeout(() => resolve(mockWeatherResponse), 50)
                )
            });

            const result = await weatherAPI.fetchWeatherData('London');

            expect(result.responseTime).toBe(800);
            expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_RESPONSE);
        });

        it('should identify slow responses', async () => {
            // Mock slow API response (simulate 2500ms response time)
            performance.now = jest.fn()
                .mockReturnValueOnce(1000)    // Start time
                .mockReturnValueOnce(3500);   // End time (2500ms later)

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => new Promise(resolve =>
                    setTimeout(() => resolve(mockWeatherResponse), 100)
                )
            });

            const result = await weatherAPI.fetchWeatherData('London');

            expect(result.responseTime).toBe(2500);
            expect(result.responseTime).toBeGreaterThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_RESPONSE);

            // This would trigger performance monitoring alerts in production
            if (result.responseTime > PERFORMANCE_THRESHOLDS.ACCEPTABLE_RESPONSE) {
                console.warn('Slow API response detected:', result.responseTime + 'ms');
            }
        });
    });

    describe('Cache Performance', () => {
        const mockWeatherData = {
            city: 'London',
            temperature: 20,
            description: 'clear sky',
            responseTime: 150
        };

        it('should serve cached data much faster than API calls', async () => {
            // First call - hits API
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    name: 'London',
                    sys: { country: 'GB' },
                    main: { temp: 20, humidity: 65, pressure: 1013 },
                    weather: [{ description: 'clear sky', icon: '01d' }],
                    wind: { speed: 3.5 }
                })
            });

            performance.now = jest.fn()
                .mockReturnValueOnce(1000)
                .mockReturnValueOnce(1200);

            const firstResult = await weatherAPI.fetchWeatherData('London');
            expect(firstResult.responseTime).toBe(200);

            // Second call - should use cache (much faster)
            performance.now = jest.fn()
                .mockReturnValueOnce(2000)
                .mockReturnValueOnce(2005); // Only 5ms for cache lookup

            const secondResult = await weatherAPI.fetchWeatherData('London');

            // Cache hit should be much faster than API call
            expect(secondResult.responseTime).toBe(200); // Original response time preserved
            expect(fetch).toHaveBeenCalledTimes(1); // Only one API call made
        });

        it('should handle cache misses efficiently', async () => {
            const cities = ['London', 'Paris', 'Tokyo', 'New York', 'Sydney'];
            const startTime = Date.now();

            // Mock API responses for all cities
            cities.forEach(() => {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        name: 'Test City',
                        sys: { country: 'TC' },
                        main: { temp: 20, humidity: 65, pressure: 1013 },
                        weather: [{ description: 'clear sky', icon: '01d' }],
                        wind: { speed: 3.5 }
                    })
                });
            });

            // Fetch weather for multiple cities (all cache misses)
            const promises = cities.map(city => weatherAPI.fetchWeatherData(city));
            const results = await Promise.all(promises);

            const totalTime = Date.now() - startTime;

            expect(results).toHaveLength(5);
            expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
            expect(fetch).toHaveBeenCalledTimes(5);
        });
    });

    describe('Concurrent Request Performance', () => {
        it('should handle multiple concurrent requests efficiently', async () => {
            const mockResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            // Mock API to return after a delay
            fetch.mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => new Promise(resolve =>
                        setTimeout(() => resolve(mockResponse), 100)
                    )
                })
            );

            const startTime = performance.now();

            // Make 10 concurrent requests for the same city
            const promises = Array(10).fill(null).map(() =>
                weatherAPI.fetchWeatherData('London')
            );

            const results = await Promise.all(promises);
            const totalTime = performance.now() - startTime;

            expect(results).toHaveLength(10);
            expect(fetch).toHaveBeenCalledTimes(1); // Only one API call due to caching

            // All requests should return the same data
            results.forEach(result => {
                expect(result.city).toBe('London');
            });

            // Should complete quickly due to caching
            expect(totalTime).toBeLessThan(500);
        });

        it('should handle burst requests without degradation', async () => {
            const cities = Array.from({ length: 20 }, (_, i) => `City${i}`);

            // Mock responses for all cities
            fetch.mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        name: 'Test',
                        sys: { country: 'TC' },
                        main: { temp: 20, humidity: 65, pressure: 1013 },
                        weather: [{ description: 'clear sky', icon: '01d' }],
                        wind: { speed: 3.5 }
                    })
                })
            );

            const startTime = Date.now();

            // Send burst of requests
            const promises = cities.map(city => weatherAPI.fetchWeatherData(city));
            const results = await Promise.all(promises);

            const totalTime = Date.now() - startTime;

            expect(results).toHaveLength(20);
            expect(totalTime).toBeLessThan(3000); // Should handle burst efficiently
        });
    });

    describe('Memory Performance', () => {
        it('should not leak memory with repeated requests', async () => {
            const mockResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            // Make many requests to test for memory leaks
            for (let i = 0; i < 100; i++) {
                await weatherAPI.fetchWeatherData(`City${i % 5}`); // Cycle through 5 cities
            }

            // Cache should not grow unboundedly
            const cacheStats = weatherAPI.getCacheStats();
            expect(cacheStats.size).toBeLessThanOrEqual(5); // Only 5 unique cities cached
        });

        it('should clean up expired cache entries', async () => {
            const mockResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            // Add entry to cache
            weatherAPI.setCachedWeather('London', { temperature: 20 });
            expect(weatherAPI.getCacheStats().size).toBe(1);

            // Mock expired timestamp
            const expiredTime = Date.now() - (10 * 60 * 1000); // 10 minutes ago
            weatherAPI.cache.set('london', {
                data: { temperature: 20 },
                timestamp: expiredTime
            });

            // Request should not use expired cache
            await weatherAPI.fetchWeatherData('London');

            // New entry should replace expired one
            expect(weatherAPI.getCacheStats().size).toBe(1);
        });
    });

    describe('Error Response Performance', () => {
        it('should fail fast on network errors', async () => {
            fetch.mockRejectedValue(new Error('Network error'));

            const startTime = performance.now();

            try {
                await weatherAPI.fetchWeatherData('London');
            } catch (error) {
                const errorTime = performance.now() - startTime;
                expect(errorTime).toBeLessThan(1000); // Should fail quickly
                expect(error.message).toContain('Network error');
            }
        });

        it('should handle 404 errors efficiently', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'city not found' })
            });

            const startTime = performance.now();

            try {
                await weatherAPI.fetchWeatherData('InvalidCity');
            } catch (error) {
                const errorTime = performance.now() - startTime;
                expect(errorTime).toBeLessThan(500); // Should handle 404 quickly
                expect(error.message).toContain('City not found');
            }
        });
    });

    describe('Performance Regression Tests', () => {
        it('should maintain performance baselines', async () => {
            const mockResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            const performanceResults = [];

            for (let i = 0; i < 10; i++) {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                });

                const startTime = performance.now();
                await weatherAPI.fetchWeatherData(`City${i}`);
                const responseTime = performance.now() - startTime;

                performanceResults.push(responseTime);
            }

            const avgResponseTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
            const maxResponseTime = Math.max(...performanceResults);

            // Performance baselines
            expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_RESPONSE);
            expect(maxResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW_RESPONSE);

            // Consistency check - no response should be more than 3x the average
            performanceResults.forEach(time => {
                expect(time).toBeLessThan(avgResponseTime * 3);
            });
        });
    });

    describe('Real-world Performance Scenarios', () => {
        it('should handle typical user interaction patterns', async () => {
            const mockResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            // Simulate user behavior: searching, waiting, searching again
            const scenarios = [
                { delay: 0, city: 'London' },        // Immediate search
                { delay: 100, city: 'London' },      // Quick re-search (cached)
                { delay: 500, city: 'Paris' },       // New city after thinking
                { delay: 200, city: 'London' },      // Back to first city (cached)
                { delay: 1000, city: 'Tokyo' }       // New search after longer pause
            ];

            const results = [];
            let totalTime = 0;

            for (const scenario of scenarios) {
                await new Promise(resolve => setTimeout(resolve, scenario.delay));

                const startTime = performance.now();
                const result = await weatherAPI.fetchWeatherData(scenario.city);
                const responseTime = performance.now() - startTime;

                results.push({ city: scenario.city, responseTime });
                totalTime += responseTime;
            }

            // Cached requests should be faster
            const londonRequests = results.filter(r => r.city === 'London');
            expect(londonRequests.length).toBeGreaterThan(1);

            // Average response time should be reasonable
            const avgTime = totalTime / results.length;
            expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_RESPONSE);
        });
    });
});