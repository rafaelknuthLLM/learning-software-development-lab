// API Utility Functions
/**
 * API utility functions for HTTP requests and response handling
 */
export class ApiUtils {
    /**
     * Default request configuration
     */
    static defaultConfig = {
        timeout: 10000,
        retries: 3,
        retryDelay: 1000,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    /**
     * Make HTTP request with error handling and retries
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    static async request(url, options = {}) {
        const config = {
            ...this.defaultConfig,
            ...options
        };

        let lastError;

        for (let attempt = 0; attempt <= config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), config.timeout);

                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new ApiError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        response
                    );
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }

                return await response.text();

            } catch (error) {
                lastError = error;

                // Don't retry on certain errors
                if (error.name === 'AbortError') {
                    throw new ApiError('Request timeout', 408);
                }

                if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                    // Client errors (4xx) shouldn't be retried
                    throw error;
                }

                // Retry on network errors and 5xx server errors
                if (attempt < config.retries) {
                    console.warn(`Request failed, retrying in ${config.retryDelay}ms... (attempt ${attempt + 1}/${config.retries})`);
                    await this.delay(config.retryDelay);
                    config.retryDelay *= 2; // Exponential backoff
                }
            }
        }

        throw lastError || new ApiError('Request failed after all retries');
    }

    /**
     * Make GET request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    static async get(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * Make POST request
     * @param {string} url - Request URL
     * @param {*} data - Request body data
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    static async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: typeof data === 'string' ? data : JSON.stringify(data)
        });
    }

    /**
     * Make PUT request
     * @param {string} url - Request URL
     * @param {*} data - Request body data
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    static async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: typeof data === 'string' ? data : JSON.stringify(data)
        });
    }

    /**
     * Make DELETE request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    static async delete(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * Build URL with query parameters
     * @param {string} baseUrl - Base URL
     * @param {Object} params - Query parameters
     * @returns {string} Complete URL with query parameters
     */
    static buildUrl(baseUrl, params = {}) {
        const url = new URL(baseUrl);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(item => url.searchParams.append(key, item));
                } else {
                    url.searchParams.set(key, value);
                }
            }
        });

        return url.toString();
    }

    /**
     * Parse query parameters from URL
     * @param {string} url - URL to parse
     * @returns {Object} Parsed query parameters
     */
    static parseQuery(url) {
        const urlObj = new URL(url);
        const params = {};

        for (const [key, value] of urlObj.searchParams) {
            if (params[key]) {
                // Handle multiple values for same key
                if (Array.isArray(params[key])) {
                    params[key].push(value);
                } else {
                    params[key] = [params[key], value];
                }
            } else {
                params[key] = value;
            }
        }

        return params;
    }

    /**
     * Check if URL is valid
     * @param {string} url - URL to validate
     * @returns {boolean} Whether URL is valid
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create rate limiter for API requests
     * @param {number} maxRequests - Maximum requests per time window
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Function} Rate limited request function
     */
    static createRateLimiter(maxRequests, timeWindow) {
        const requests = [];

        return async (url, options) => {
            const now = Date.now();

            // Remove old requests outside time window
            while (requests.length > 0 && requests[0] <= now - timeWindow) {
                requests.shift();
            }

            // Check if we've exceeded the rate limit
            if (requests.length >= maxRequests) {
                const oldestRequest = requests[0];
                const waitTime = timeWindow - (now - oldestRequest);

                console.warn(`Rate limit exceeded. Waiting ${waitTime}ms...`);
                await this.delay(waitTime);
            }

            requests.push(now);
            return this.request(url, options);
        };
    }

    /**
     * Create request interceptor
     * @param {Function} onRequest - Request interceptor function
     * @param {Function} onResponse - Response interceptor function
     * @param {Function} onError - Error interceptor function
     * @returns {Function} Intercepted request function
     */
    static createInterceptor(onRequest, onResponse, onError) {
        return async (url, options) => {
            try {
                // Request interceptor
                if (onRequest) {
                    const result = await onRequest(url, options);
                    if (result) {
                        url = result.url || url;
                        options = result.options || options;
                    }
                }

                const response = await this.request(url, options);

                // Response interceptor
                if (onResponse) {
                    const result = await onResponse(response, url, options);
                    return result !== undefined ? result : response;
                }

                return response;

            } catch (error) {
                // Error interceptor
                if (onError) {
                    const result = await onError(error, url, options);
                    if (result !== undefined) {
                        return result;
                    }
                }

                throw error;
            }
        };
    }

    /**
     * Cache API responses
     * @param {number} ttl - Time to live in milliseconds
     * @param {number} maxSize - Maximum cache size
     * @returns {Function} Cached request function
     */
    static createCache(ttl = 300000, maxSize = 100) { // 5 minutes default TTL
        const cache = new Map();

        const cleanup = () => {
            const now = Date.now();
            for (const [key, value] of cache) {
                if (now > value.expires) {
                    cache.delete(key);
                }
            }
        };

        return async (url, options = {}) => {
            // Only cache GET requests
            if (options.method && options.method !== 'GET') {
                return this.request(url, options);
            }

            const cacheKey = JSON.stringify({ url, options });
            const now = Date.now();

            // Check cache
            if (cache.has(cacheKey)) {
                const cached = cache.get(cacheKey);
                if (now <= cached.expires) {
                    console.log('Returning cached response for:', url);
                    return cached.data;
                } else {
                    cache.delete(cacheKey);
                }
            }

            // Make request
            const response = await this.request(url, options);

            // Cache response
            if (cache.size >= maxSize) {
                // Remove oldest entry
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }

            cache.set(cacheKey, {
                data: response,
                expires: now + ttl
            });

            // Cleanup expired entries occasionally
            if (Math.random() < 0.1) {
                cleanup();
            }

            return response;
        };
    }

    /**
     * Delay execution for specified time
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>} Promise that resolves after delay
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Convert response to different formats
     * @param {Response} response - Fetch Response object
     * @param {string} format - Desired format ('json', 'text', 'blob', 'arrayBuffer')
     * @returns {Promise<*>} Converted response data
     */
    static async convertResponse(response, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return await response.json();
            case 'text':
                return await response.text();
            case 'blob':
                return await response.blob();
            case 'arraybuffer':
                return await response.arrayBuffer();
            default:
                throw new Error(`Unsupported response format: ${format}`);
        }
    }

    /**
     * Check network connectivity
     * @returns {Promise<boolean>} Whether network is available
     */
    static async checkConnectivity() {
        if (!navigator.onLine) {
            return false;
        }

        try {
            // Try to fetch a small resource
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create mock response for testing
     * @param {*} data - Mock response data
     * @param {number} status - HTTP status code
     * @param {Object} headers - Response headers
     * @param {number} delay - Simulated delay in milliseconds
     * @returns {Promise<*>} Mock response
     */
    static async createMockResponse(data, status = 200, headers = {}, delay = 0) {
        if (delay > 0) {
            await this.delay(delay);
        }

        if (status >= 400) {
            throw new ApiError(`Mock error ${status}`, status);
        }

        return data;
    }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message, status = 0, response = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }

    /**
     * Check if error is a network error
     * @returns {boolean} Whether this is a network error
     */
    isNetworkError() {
        return this.status === 0 || this.message.includes('Failed to fetch');
    }

    /**
     * Check if error is a timeout error
     * @returns {boolean} Whether this is a timeout error
     */
    isTimeoutError() {
        return this.status === 408 || this.message.includes('timeout');
    }

    /**
     * Check if error is a client error (4xx)
     * @returns {boolean} Whether this is a client error
     */
    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Check if error is a server error (5xx)
     * @returns {boolean} Whether this is a server error
     */
    isServerError() {
        return this.status >= 500 && this.status < 600;
    }
}