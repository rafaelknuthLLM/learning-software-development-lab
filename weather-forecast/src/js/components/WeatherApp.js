// Weather Application Main Component
import { WeatherAPI } from '../services/WeatherAPI.js';
import { LocationService } from '../services/LocationService.js';
import { WeatherUI } from './WeatherUI.js';
import { StorageManager } from '../utils/storage.js';
import { EventEmitter } from '../utils/events.js';

/**
 * Main Weather Application Class
 * Coordinates between API, UI, and user interactions
 */
export class WeatherApp extends EventEmitter {
    constructor() {
        super();

        this.weatherAPI = new WeatherAPI();
        this.locationService = new LocationService();
        this.weatherUI = new WeatherUI();

        this.currentLocation = null;
        this.weatherData = null;
        this.isLoading = false;

        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleCurrentLocation = this.handleCurrentLocation.bind(this);
        this.handleRetry = this.handleRetry.bind(this);
        this.handleLocationUpdate = this.handleLocationUpdate.bind(this);
    }

    /**
     * Initialize the weather application
     */
    async init() {
        try {
            // Initialize UI components
            await this.weatherUI.init();

            // Set up event listeners
            this.setupEventListeners();

            // Load saved location or use default
            await this.loadInitialLocation();

            console.log('WeatherApp initialized successfully');

        } catch (error) {
            console.error('Failed to initialize WeatherApp:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // UI Events
        this.weatherUI.on('search', this.handleSearch);
        this.weatherUI.on('currentLocation', this.handleCurrentLocation);
        this.weatherUI.on('retry', this.handleRetry);

        // Location Service Events
        this.locationService.on('locationUpdate', this.handleLocationUpdate);
        this.locationService.on('error', (error) => this.handleError(error));

        // Weather API Events
        this.weatherAPI.on('dataReceived', (data) => this.handleWeatherData(data));
        this.weatherAPI.on('error', (error) => this.handleError(error));

        // App-level Events
        this.on('locationChanged', this.fetchWeatherData.bind(this));

        // Browser Events
        window.addEventListener('online', () => {
            this.weatherUI.hideOfflineMessage();
            if (this.currentLocation) {
                this.fetchWeatherData();
            }
        });

        window.addEventListener('offline', () => {
            this.weatherUI.showOfflineMessage();
        });
    }

    /**
     * Load initial location from storage or use default
     */
    async loadInitialLocation() {
        try {
            // Try to load saved location
            const savedLocation = StorageManager.getLocation();

            if (savedLocation) {
                this.currentLocation = savedLocation;
                this.emit('locationChanged', savedLocation);
            } else {
                // Try to get current location if geolocation is available
                if (this.locationService.isGeolocationAvailable()) {
                    await this.getCurrentLocation();
                } else {
                    // Use default location (London)
                    this.currentLocation = {
                        name: 'London',
                        latitude: 51.5074,
                        longitude: -0.1278,
                        country: 'UK'
                    };
                    this.emit('locationChanged', this.currentLocation);
                }
            }
        } catch (error) {
            console.error('Failed to load initial location:', error);
            // Fallback to default location
            this.currentLocation = {
                name: 'London',
                latitude: 51.5074,
                longitude: -0.1278,
                country: 'UK'
            };
            this.emit('locationChanged', this.currentLocation);
        }
    }

    /**
     * Handle search for new location
     * @param {string} query - Search query (city name)
     */
    async handleSearch(query) {
        if (!query || query.trim().length < 2) {
            this.handleError(new Error('Please enter a valid city name'));
            return;
        }

        try {
            this.setLoading(true);

            // Search for location
            const location = await this.locationService.searchLocation(query.trim());

            if (location) {
                this.currentLocation = location;
                StorageManager.saveLocation(location);
                this.emit('locationChanged', location);
            } else {
                throw new Error(`Could not find location: ${query}`);
            }

        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle request for current location
     */
    async handleCurrentLocation() {
        try {
            this.setLoading(true);
            await this.getCurrentLocation();
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Get user's current location
     */
    async getCurrentLocation() {
        const position = await this.locationService.getCurrentPosition();
        const location = await this.locationService.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
        );

        this.currentLocation = location;
        StorageManager.saveLocation(location);
        this.emit('locationChanged', location);
    }

    /**
     * Handle retry button click
     */
    async handleRetry() {
        if (this.currentLocation) {
            await this.fetchWeatherData();
        } else {
            await this.loadInitialLocation();
        }
    }

    /**
     * Handle location update from location service
     * @param {Object} location - Updated location data
     */
    handleLocationUpdate(location) {
        this.currentLocation = location;
        StorageManager.saveLocation(location);
        this.emit('locationChanged', location);
    }

    /**
     * Fetch weather data for current location
     */
    async fetchWeatherData() {
        if (!this.currentLocation) {
            console.warn('No location available for weather data fetch');
            return;
        }

        try {
            this.setLoading(true);
            this.weatherUI.hideError();

            // Fetch weather data
            const weatherData = await this.weatherAPI.getWeatherData(
                this.currentLocation.latitude,
                this.currentLocation.longitude
            );

            this.weatherData = {
                ...weatherData,
                location: this.currentLocation
            };

            // Update UI with weather data
            this.weatherUI.displayWeatherData(this.weatherData);

            // Save weather data for offline use
            StorageManager.saveWeatherData(this.weatherData);

            this.emit('dataUpdated', this.weatherData);

        } catch (error) {
            console.error('Failed to fetch weather data:', error);

            // Try to load cached data
            const cachedData = StorageManager.getWeatherData();
            if (cachedData && cachedData.location?.name === this.currentLocation.name) {
                console.log('Using cached weather data');
                this.weatherData = cachedData;
                this.weatherUI.displayWeatherData(this.weatherData, true); // true = cached data
            } else {
                this.handleError(error);
            }
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle weather data received from API
     * @param {Object} data - Weather data from API
     */
    handleWeatherData(data) {
        this.weatherData = {
            ...data,
            location: this.currentLocation
        };

        this.weatherUI.displayWeatherData(this.weatherData);
        StorageManager.saveWeatherData(this.weatherData);
        this.emit('dataUpdated', this.weatherData);
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.isLoading = loading;

        if (loading) {
            this.weatherUI.showLoading();
        } else {
            this.weatherUI.hideLoading();
        }

        this.emit('loadingChanged', loading);
    }

    /**
     * Handle errors
     * @param {Error} error - Error to handle
     */
    handleError(error) {
        console.error('WeatherApp Error:', error);
        this.weatherUI.showError(error.message || 'An unexpected error occurred');
        this.emit('error', error);
    }

    /**
     * Get current weather data
     * @returns {Object|null} Current weather data
     */
    getCurrentWeatherData() {
        return this.weatherData;
    }

    /**
     * Get current location
     * @returns {Object|null} Current location
     */
    getCurrentLocation() {
        return this.currentLocation;
    }

    /**
     * Refresh weather data
     */
    async refresh() {
        if (this.currentLocation) {
            await this.fetchWeatherData();
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove event listeners
        this.removeAllListeners();

        // Clean up components
        if (this.weatherUI) {
            this.weatherUI.destroy();
        }

        if (this.locationService) {
            this.locationService.destroy();
        }

        if (this.weatherAPI) {
            this.weatherAPI.destroy();
        }

        console.log('WeatherApp destroyed');
    }
}