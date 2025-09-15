// Weather API integration module
class WeatherAPI {
    constructor(apiKey = 'demo-key') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Validates city name input
     * @param {string} city - City name to validate
     * @returns {boolean} - True if valid
     */
    validateCity(city) {
        if (!city || typeof city !== 'string') {
            throw new Error('City name is required and must be a string');
        }

        const trimmedCity = city.trim();
        if (trimmedCity.length === 0) {
            throw new Error('City name cannot be empty');
        }

        if (trimmedCity.length > 100) {
            throw new Error('City name is too long');
        }

        // Basic validation for malicious input
        const invalidChars = /[<>\"'&]/;
        if (invalidChars.test(trimmedCity)) {
            throw new Error('City name contains invalid characters');
        }

        return true;
    }

    /**
     * Gets cached weather data if available and not expired
     * @param {string} city - City name
     * @returns {Object|null} - Cached data or null
     */
    getCachedWeather(city) {
        const cacheKey = city.toLowerCase();
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        return null;
    }

    /**
     * Caches weather data
     * @param {string} city - City name
     * @param {Object} data - Weather data to cache
     */
    setCachedWeather(city, data) {
        const cacheKey = city.toLowerCase();
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Fetches weather data from API
     * @param {string} city - City name
     * @returns {Promise<Object>} - Weather data
     */
    async fetchWeatherData(city) {
        this.validateCity(city);

        // Check cache first
        const cachedData = this.getCachedWeather(city);
        if (cachedData) {
            return cachedData;
        }

        const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

        try {
            const startTime = performance.now();
            const response = await fetch(url);
            const endTime = performance.now();

            // Track API response time
            const responseTime = endTime - startTime;

            if (!response.ok) {
                await this.handleApiError(response);
            }

            const data = await response.json();
            const processedData = this.processWeatherData(data, responseTime);

            // Cache successful response
            this.setCachedWeather(city, processedData);

            return processedData;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to weather service');
            }
            throw error;
        }
    }

    /**
     * Handles API error responses
     * @param {Response} response - Fetch response object
     */
    async handleApiError(response) {
        let errorMessage = 'Unknown error occurred';

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
            // If we can't parse JSON, use status-based messages
        }

        switch (response.status) {
            case 401:
                throw new Error('Invalid API key');
            case 404:
                throw new Error('City not found. Please check the spelling and try again.');
            case 429:
                throw new Error('Too many requests. Please try again later.');
            case 500:
            case 502:
            case 503:
                throw new Error('Weather service is temporarily unavailable');
            default:
                throw new Error(`API Error: ${errorMessage}`);
        }
    }

    /**
     * Processes and normalizes weather data
     * @param {Object} rawData - Raw API response
     * @param {number} responseTime - API response time in ms
     * @returns {Object} - Processed weather data
     */
    processWeatherData(rawData, responseTime = 0) {
        if (!rawData || !rawData.main || !rawData.weather || !Array.isArray(rawData.weather)) {
            throw new Error('Invalid weather data received from API');
        }

        return {
            city: rawData.name,
            country: rawData.sys?.country || 'Unknown',
            temperature: Math.round(rawData.main.temp),
            description: rawData.weather[0].description,
            humidity: rawData.main.humidity,
            windSpeed: rawData.wind?.speed || 0,
            pressure: rawData.main.pressure,
            icon: rawData.weather[0].icon,
            responseTime,
            timestamp: Date.now()
        };
    }

    /**
     * Clears the weather data cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Gets cache statistics
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Make WeatherAPI available globally for testing
if (typeof window !== 'undefined') {
    window.WeatherAPI = WeatherAPI;
}

// Export for Node.js environment (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherAPI;
}