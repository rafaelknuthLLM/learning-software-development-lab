// Unit tests for Weather API integration
const WeatherAPI = require('../../src/weatherApi');

describe('WeatherAPI', () => {
    let weatherAPI;

    beforeEach(() => {
        weatherAPI = new WeatherAPI('test-api-key');
        fetch.mockClear();
    });

    describe('validateCity', () => {
        it('should validate correct city names', () => {
            expect(() => weatherAPI.validateCity('London')).not.toThrow();
            expect(() => weatherAPI.validateCity('New York')).not.toThrow();
            expect(() => weatherAPI.validateCity('São Paulo')).not.toThrow();
        });

        it('should reject invalid city names', () => {
            expect(() => weatherAPI.validateCity('')).toThrow('City name cannot be empty');
            expect(() => weatherAPI.validateCity('   ')).toThrow('City name cannot be empty');
            expect(() => weatherAPI.validateCity(null)).toThrow('City name is required and must be a string');
            expect(() => weatherAPI.validateCity(123)).toThrow('City name is required and must be a string');
        });

        it('should reject city names that are too long', () => {
            const longCity = 'a'.repeat(101);
            expect(() => weatherAPI.validateCity(longCity)).toThrow('City name is too long');
        });

        it('should reject city names with invalid characters', () => {
            expect(() => weatherAPI.validateCity('London<script>')).toThrow('City name contains invalid characters');
            expect(() => weatherAPI.validateCity('Paris&destroy')).toThrow('City name contains invalid characters');
            expect(() => weatherAPI.validateCity('Rome"hack"')).toThrow('City name contains invalid characters');
        });
    });

    describe('caching functionality', () => {
        const mockWeatherData = {
            city: 'London',
            country: 'GB',
            temperature: 20,
            description: 'sunny',
            humidity: 65,
            windSpeed: 3.5,
            pressure: 1013,
            icon: '01d',
            responseTime: 150,
            timestamp: Date.now()
        };

        it('should cache weather data', () => {
            weatherAPI.setCachedWeather('London', mockWeatherData);
            const cached = weatherAPI.getCachedWeather('London');
            expect(cached).toEqual(mockWeatherData);
        });

        it('should return null for expired cache', () => {
            const oldTimestamp = Date.now() - (10 * 60 * 1000); // 10 minutes ago
            weatherAPI.cache.set('london', {
                data: mockWeatherData,
                timestamp: oldTimestamp
            });

            const cached = weatherAPI.getCachedWeather('London');
            expect(cached).toBeNull();
        });

        it('should return cached data if not expired', () => {
            const recentTimestamp = Date.now() - (2 * 60 * 1000); // 2 minutes ago
            weatherAPI.cache.set('london', {
                data: mockWeatherData,
                timestamp: recentTimestamp
            });

            const cached = weatherAPI.getCachedWeather('London');
            expect(cached).toEqual(mockWeatherData);
        });

        it('should clear cache', () => {
            weatherAPI.setCachedWeather('London', mockWeatherData);
            weatherAPI.setCachedWeather('Paris', mockWeatherData);

            expect(weatherAPI.getCacheStats().size).toBe(2);

            weatherAPI.clearCache();
            expect(weatherAPI.getCacheStats().size).toBe(0);
        });
    });

    describe('fetchWeatherData', () => {
        const mockApiResponse = {
            name: 'London',
            sys: { country: 'GB' },
            main: { temp: 20.5, humidity: 65, pressure: 1013 },
            weather: [{ description: 'clear sky', icon: '01d' }],
            wind: { speed: 3.5 }
        };

        it('should fetch weather data successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const result = await weatherAPI.fetchWeatherData('London');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('London'),
                undefined
            );
            expect(result.city).toBe('London');
            expect(result.temperature).toBe(21); // rounded
            expect(result.description).toBe('clear sky');
        });

        it('should return cached data when available', async () => {
            const cachedData = { city: 'London', temperature: 25 };
            weatherAPI.setCachedWeather('London', cachedData);

            const result = await weatherAPI.fetchWeatherData('London');

            expect(fetch).not.toHaveBeenCalled();
            expect(result).toEqual(cachedData);
        });

        it('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            await expect(weatherAPI.fetchWeatherData('London'))
                .rejects.toThrow('Network error: Unable to connect to weather service');
        });

        it('should handle 404 city not found', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'city not found' })
            });

            await expect(weatherAPI.fetchWeatherData('InvalidCity'))
                .rejects.toThrow('City not found. Please check the spelling and try again.');
        });

        it('should handle 401 unauthorized', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid API key' })
            });

            await expect(weatherAPI.fetchWeatherData('London'))
                .rejects.toThrow('Invalid API key');
        });

        it('should handle 429 rate limit', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                json: () => Promise.resolve({ message: 'Rate limit exceeded' })
            });

            await expect(weatherAPI.fetchWeatherData('London'))
                .rejects.toThrow('Too many requests. Please try again later.');
        });

        it('should handle 500 server error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ message: 'Internal server error' })
            });

            await expect(weatherAPI.fetchWeatherData('London'))
                .rejects.toThrow('Weather service is temporarily unavailable');
        });
    });

    describe('processWeatherData', () => {
        it('should process valid weather data', () => {
            const rawData = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20.7, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            const processed = weatherAPI.processWeatherData(rawData, 150);

            expect(processed).toMatchObject({
                city: 'London',
                country: 'GB',
                temperature: 21,
                description: 'clear sky',
                humidity: 65,
                windSpeed: 3.5,
                pressure: 1013,
                icon: '01d',
                responseTime: 150
            });
            expect(processed.timestamp).toBeDefined();
        });

        it('should handle missing wind data', () => {
            const rawData = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }]
                // wind is missing
            };

            const processed = weatherAPI.processWeatherData(rawData);
            expect(processed.windSpeed).toBe(0);
        });

        it('should handle missing country data', () => {
            const rawData = {
                name: 'London',
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            const processed = weatherAPI.processWeatherData(rawData);
            expect(processed.country).toBe('Unknown');
        });

        it('should reject invalid weather data', () => {
            expect(() => weatherAPI.processWeatherData(null))
                .toThrow('Invalid weather data received from API');

            expect(() => weatherAPI.processWeatherData({}))
                .toThrow('Invalid weather data received from API');

            expect(() => weatherAPI.processWeatherData({ main: {} }))
                .toThrow('Invalid weather data received from API');
        });
    });

    describe('performance tracking', () => {
        it('should track API response time', async () => {
            const mockApiResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            let callCount = 0;
            performance.now.mockImplementation(() => {
                callCount++;
                return callCount === 1 ? 1000 : 1150; // 150ms response time
            });

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const result = await weatherAPI.fetchWeatherData('London');
            expect(result.responseTime).toBe(150);
        });
    });

    describe('edge cases and security', () => {
        it('should encode city names in URL', async () => {
            const mockApiResponse = {
                name: 'São Paulo',
                sys: { country: 'BR' },
                main: { temp: 25, humidity: 70, pressure: 1015 },
                weather: [{ description: 'sunny', icon: '01d' }],
                wind: { speed: 2.0 }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            await weatherAPI.fetchWeatherData('São Paulo');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('S%C3%A3o%20Paulo'),
                undefined
            );
        });

        it('should handle concurrent requests', async () => {
            const mockApiResponse = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 20, humidity: 65, pressure: 1013 },
                weather: [{ description: 'clear sky', icon: '01d' }],
                wind: { speed: 3.5 }
            };

            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const promises = Array(5).fill(null).map(() =>
                weatherAPI.fetchWeatherData('London')
            );

            const results = await Promise.all(promises);

            // First call should hit API, rest should use cache
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result.city).toBe('London');
            });
        });
    });

    describe('getCacheStats', () => {
        it('should return cache statistics', () => {
            weatherAPI.setCachedWeather('London', { temperature: 20 });
            weatherAPI.setCachedWeather('Paris', { temperature: 15 });

            const stats = weatherAPI.getCacheStats();
            expect(stats.size).toBe(2);
            expect(stats.keys).toContain('london');
            expect(stats.keys).toContain('paris');
        });
    });
});