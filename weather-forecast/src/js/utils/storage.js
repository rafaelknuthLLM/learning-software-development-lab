// Local Storage Management Utility
/**
 * Storage Manager for handling localStorage operations
 * with error handling and data validation
 */
export class StorageManager {
    static keys = {
        LOCATION: 'weather_app_location',
        WEATHER_DATA: 'weather_app_weather_data',
        SETTINGS: 'weather_app_settings',
        SEARCH_HISTORY: 'weather_app_search_history'
    };

    /**
     * Initialize storage manager
     */
    static init() {
        try {
            // Test localStorage availability
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('Storage manager initialized');
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Whether localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Save data to localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @returns {boolean} Whether save was successful
     */
    static setItem(key, data) {
        if (!this.isAvailable()) {
            console.warn('localStorage not available');
            return false;
        }

        try {
            const jsonData = JSON.stringify({
                data,
                timestamp: Date.now(),
                version: '1.0'
            });

            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);

            // Try to free up space if quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                // Try again after cleanup
                try {
                    const jsonData = JSON.stringify({
                        data,
                        timestamp: Date.now(),
                        version: '1.0'
                    });
                    localStorage.setItem(key, jsonData);
                    return true;
                } catch {
                    console.error('Failed to save even after cleanup');
                }
            }

            return false;
        }
    }

    /**
     * Get data from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Retrieved data or default value
     */
    static getItem(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);

            if (!item) {
                return defaultValue;
            }

            const parsed = JSON.parse(item);

            // Validate data structure
            if (typeof parsed === 'object' && parsed.data !== undefined) {
                return parsed.data;
            }

            // Handle legacy data (direct values)
            return parsed;

        } catch (error) {
            console.error('Failed to retrieve from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Whether removal was successful
     */
    static removeItem(key) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all storage
     * @returns {boolean} Whether clear was successful
     */
    static clear() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            // Only clear our app's keys
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Storage usage information
     */
    static getStorageInfo() {
        if (!this.isAvailable()) {
            return { available: false };
        }

        try {
            let totalSize = 0;
            let itemCount = 0;
            const appKeys = Object.values(this.keys);

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (appKeys.includes(key)) {
                    const value = localStorage.getItem(key);
                    totalSize += (key.length + value.length) * 2; // rough byte estimate
                    itemCount++;
                }
            }

            return {
                available: true,
                totalItems: itemCount,
                estimatedSize: totalSize,
                formattedSize: this.formatBytes(totalSize)
            };

        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Cleanup old or invalid storage items
     */
    static cleanup() {
        if (!this.isAvailable()) {
            return;
        }

        try {
            const now = Date.now();
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

            Object.values(this.keys).forEach(key => {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const parsed = JSON.parse(item);
                        if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
                            console.log(`Removing expired item: ${key}`);
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // Remove invalid JSON items
                    console.log(`Removing invalid item: ${key}`);
                    localStorage.removeItem(key);
                }
            });

        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    /**
     * Format bytes to human readable string
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Specific storage methods for weather app data

    /**
     * Save user's current location
     * @param {Object} location - Location data
     * @returns {boolean} Whether save was successful
     */
    static saveLocation(location) {
        if (!location || !location.latitude || !location.longitude) {
            console.warn('Invalid location data');
            return false;
        }

        return this.setItem(this.keys.LOCATION, {
            ...location,
            savedAt: Date.now()
        });
    }

    /**
     * Get saved location
     * @returns {Object|null} Location data or null
     */
    static getLocation() {
        return this.getItem(this.keys.LOCATION);
    }

    /**
     * Save weather data
     * @param {Object} weatherData - Weather data
     * @returns {boolean} Whether save was successful
     */
    static saveWeatherData(weatherData) {
        if (!weatherData) {
            console.warn('No weather data to save');
            return false;
        }

        return this.setItem(this.keys.WEATHER_DATA, {
            ...weatherData,
            savedAt: Date.now()
        });
    }

    /**
     * Get saved weather data
     * @returns {Object|null} Weather data or null
     */
    static getWeatherData() {
        const data = this.getItem(this.keys.WEATHER_DATA);

        // Check if data is not too old (max 1 hour)
        if (data && data.savedAt) {
            const maxAge = 60 * 60 * 1000; // 1 hour
            if (Date.now() - data.savedAt > maxAge) {
                console.log('Weather data is too old, removing...');
                this.removeItem(this.keys.WEATHER_DATA);
                return null;
            }
        }

        return data;
    }

    /**
     * Save app settings
     * @param {Object} settings - App settings
     * @returns {boolean} Whether save was successful
     */
    static saveSettings(settings) {
        return this.setItem(this.keys.SETTINGS, {
            temperatureUnit: 'celsius',
            theme: 'auto',
            notifications: false,
            ...settings
        });
    }

    /**
     * Get app settings
     * @returns {Object} App settings with defaults
     */
    static getSettings() {
        return this.getItem(this.keys.SETTINGS, {
            temperatureUnit: 'celsius',
            theme: 'auto',
            notifications: false
        });
    }

    /**
     * Add to search history
     * @param {string} query - Search query
     * @param {Object} location - Location result
     */
    static addToSearchHistory(query, location) {
        if (!query || !location) return;

        const history = this.getSearchHistory();
        const entry = {
            query: query.trim(),
            location,
            timestamp: Date.now()
        };

        // Remove duplicate entries
        const filtered = history.filter(item =>
            item.query.toLowerCase() !== entry.query.toLowerCase()
        );

        // Add new entry at the beginning
        filtered.unshift(entry);

        // Keep only last 10 entries
        const trimmed = filtered.slice(0, 10);

        this.setItem(this.keys.SEARCH_HISTORY, trimmed);
    }

    /**
     * Get search history
     * @returns {Array} Search history
     */
    static getSearchHistory() {
        return this.getItem(this.keys.SEARCH_HISTORY, []);
    }

    /**
     * Clear search history
     */
    static clearSearchHistory() {
        this.removeItem(this.keys.SEARCH_HISTORY);
    }

    /**
     * Export all app data
     * @returns {Object} All app data
     */
    static exportData() {
        return {
            location: this.getLocation(),
            weatherData: this.getWeatherData(),
            settings: this.getSettings(),
            searchHistory: this.getSearchHistory(),
            exportedAt: Date.now()
        };
    }

    /**
     * Import app data
     * @param {Object} data - Data to import
     * @returns {boolean} Whether import was successful
     */
    static importData(data) {
        if (!data || typeof data !== 'object') {
            console.error('Invalid import data');
            return false;
        }

        try {
            let success = true;

            if (data.location) {
                success = this.saveLocation(data.location) && success;
            }

            if (data.settings) {
                success = this.saveSettings(data.settings) && success;
            }

            if (data.searchHistory) {
                success = this.setItem(this.keys.SEARCH_HISTORY, data.searchHistory) && success;
            }

            console.log('Data import completed:', success ? 'success' : 'partial failure');
            return success;

        } catch (error) {
            console.error('Data import failed:', error);
            return false;
        }
    }
}