// Location Service for geocoding and geolocation
import { EventEmitter } from '../utils/events.js';

/**
 * Location Service handles geolocation and geocoding operations
 */
export class LocationService extends EventEmitter {
    constructor() {
        super();

        this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
        this.reverseGeocodingUrl = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

        this.lastSearchQuery = '';
        this.searchCache = new Map();
        this.maxCacheSize = 50;
    }

    /**
     * Check if geolocation is available
     * @returns {boolean} Whether geolocation is supported
     */
    isGeolocationAvailable() {
        return 'geolocation' in navigator;
    }

    /**
     * Get current position using browser geolocation
     * @returns {Promise<Position>} Current position
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!this.isGeolocationAvailable()) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Current position obtained:', position.coords);
                    resolve(position);
                },
                (error) => {
                    let errorMessage = 'Unable to get your location';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }

                    reject(new Error(errorMessage));
                },
                options
            );
        });
    }

    /**
     * Search for location by name
     * @param {string} query - Location search query
     * @returns {Promise<Object>} Location data
     */
    async searchLocation(query) {
        if (!query || query.trim().length < 2) {
            throw new Error('Search query must be at least 2 characters long');
        }

        const normalizedQuery = query.trim().toLowerCase();

        // Check cache first
        if (this.searchCache.has(normalizedQuery)) {
            console.log('Using cached location data for:', query);
            return this.searchCache.get(normalizedQuery);
        }

        try {
            const url = `${this.geocodingUrl}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                throw new Error(`No locations found for "${query}"`);
            }

            // Get the best match (first result)
            const result = data.results[0];

            const location = {
                name: result.name,
                latitude: result.latitude,
                longitude: result.longitude,
                country: result.country,
                countryCode: result.country_code,
                region: result.admin1 || result.admin2 || '',
                timezone: result.timezone || 'UTC',
                population: result.population || null,
                elevation: result.elevation || null
            };

            // Cache the result
            this.cacheLocation(normalizedQuery, location);

            this.lastSearchQuery = query;
            this.emit('locationUpdate', location);

            return location;

        } catch (error) {
            console.error('Location search failed:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Reverse geocode coordinates to location name
     * @param {number} latitude - Latitude coordinate
     * @param {number} longitude - Longitude coordinate
     * @returns {Promise<Object>} Location data
     */
    async reverseGeocode(latitude, longitude) {
        if (!latitude || !longitude) {
            throw new Error('Latitude and longitude are required');
        }

        try {
            const url = `${this.reverseGeocodingUrl}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Reverse geocoding API error: ${response.status}`);
            }

            const data = await response.json();

            const location = {
                name: data.city || data.locality || data.principalSubdivision || 'Unknown Location',
                latitude: latitude,
                longitude: longitude,
                country: data.countryName || '',
                countryCode: data.countryCode || '',
                region: data.principalSubdivision || data.principalSubdivisionCode || '',
                timezone: data.timezone || 'UTC'
            };

            this.emit('locationUpdate', location);

            return location;

        } catch (error) {
            console.error('Reverse geocoding failed:', error);

            // Fallback with coordinates only
            const fallbackLocation = {
                name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
                latitude: latitude,
                longitude: longitude,
                country: '',
                countryCode: '',
                region: '',
                timezone: 'UTC'
            };

            return fallbackLocation;
        }
    }

    /**
     * Get suggestions for location search
     * @param {string} query - Partial location query
     * @returns {Promise<Array>} Array of location suggestions
     */
    async getLocationSuggestions(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const url = `${this.geocodingUrl}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;

            const response = await fetch(url);

            if (!response.ok) {
                return [];
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                return [];
            }

            return data.results.map(result => ({
                name: result.name,
                displayName: this.formatLocationDisplayName(result),
                latitude: result.latitude,
                longitude: result.longitude,
                country: result.country,
                countryCode: result.country_code,
                region: result.admin1 || result.admin2 || ''
            }));

        } catch (error) {
            console.error('Failed to get location suggestions:', error);
            return [];
        }
    }

    /**
     * Format location display name for suggestions
     * @param {Object} location - Location data from geocoding API
     * @returns {string} Formatted display name
     */
    formatLocationDisplayName(location) {
        const parts = [location.name];

        if (location.admin1 && location.admin1 !== location.name) {
            parts.push(location.admin1);
        }

        if (location.country) {
            parts.push(location.country);
        }

        return parts.join(', ');
    }

    /**
     * Cache location data
     * @param {string} query - Search query
     * @param {Object} location - Location data
     */
    cacheLocation(query, location) {
        // Implement LRU cache behavior
        if (this.searchCache.size >= this.maxCacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }

        this.searchCache.set(query, location);
    }

    /**
     * Clear search cache
     */
    clearCache() {
        this.searchCache.clear();
    }

    /**
     * Get distance between two coordinates using Haversine formula
     * @param {number} lat1 - First latitude
     * @param {number} lon1 - First longitude
     * @param {number} lat2 - Second latitude
     * @param {number} lon2 - Second longitude
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees - Degrees to convert
     * @returns {number} Radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.removeAllListeners();
        this.clearCache();
    }
}