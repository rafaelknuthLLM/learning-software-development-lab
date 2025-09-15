// Main application logic
class WeatherApp {
    constructor() {
        this.weatherAPI = new WeatherAPI();
        this.initializeElements();
        this.bindEvents();
        this.loadFromLocalStorage();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            errorMessage: document.getElementById('errorMessage'),
            weatherResult: document.getElementById('weatherResult'),
            cityName: document.getElementById('cityName'),
            temperature: document.getElementById('temperature'),
            description: document.getElementById('description'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            pressure: document.getElementById('pressure')
        };

        // Validate all elements exist
        const missingElements = Object.entries(this.elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            throw new Error(`Missing DOM elements: ${missingElements.join(', ')}`);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Input validation and formatting
        this.elements.cityInput.addEventListener('input', (e) => {
            this.validateInput(e.target.value);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.city) {
                this.elements.cityInput.value = e.state.city;
                this.searchWeather(e.state.city, false);
            }
        });
    }

    /**
     * Validate user input in real-time
     * @param {string} value - Input value
     */
    validateInput(value) {
        const isValid = value.length > 0 && value.length <= 100;
        this.elements.searchBtn.disabled = !isValid;

        // Clear previous errors on input change
        if (value.length > 0) {
            this.hideError();
        }
    }

    /**
     * Handle search button click or enter key
     */
    async handleSearch() {
        const city = this.elements.cityInput.value.trim();

        if (!city) {
            this.showError('Please enter a city name');
            this.elements.cityInput.focus();
            return;
        }

        await this.searchWeather(city, true);
    }

    /**
     * Search for weather data
     * @param {string} city - City name
     * @param {boolean} updateHistory - Whether to update browser history
     */
    async searchWeather(city, updateHistory = true) {
        try {
            this.showLoading();
            this.hideError();
            this.hideWeatherResult();

            const weatherData = await this.weatherAPI.fetchWeatherData(city);

            this.displayWeatherData(weatherData);
            this.saveToLocalStorage(city, weatherData);

            if (updateHistory) {
                this.updateBrowserHistory(city);
            }

            // Analytics/logging
            this.logSearchEvent(city, weatherData.responseTime);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
            this.logErrorEvent(city, error.message);
        }
    }

    /**
     * Display weather data in UI
     * @param {Object} data - Weather data
     */
    displayWeatherData(data) {
        this.hideLoading();

        this.elements.cityName.textContent = `${data.city}, ${data.country}`;
        this.elements.temperature.textContent = data.temperature;
        this.elements.description.textContent = data.description;
        this.elements.humidity.textContent = data.humidity;
        this.elements.windSpeed.textContent = data.windSpeed.toFixed(1);
        this.elements.pressure.textContent = data.pressure;

        this.showWeatherResult();
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.loadingSpinner.classList.remove('hidden');
        this.elements.searchBtn.disabled = true;
        this.elements.searchBtn.textContent = 'Searching...';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.elements.loadingSpinner.classList.add('hidden');
        this.elements.searchBtn.disabled = false;
        this.elements.searchBtn.textContent = 'Search';
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        this.elements.errorMessage.setAttribute('role', 'alert');

        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    /**
     * Hide error message
     */
    hideError() {
        this.elements.errorMessage.classList.add('hidden');
        this.elements.errorMessage.textContent = '';
    }

    /**
     * Show weather result
     */
    showWeatherResult() {
        this.elements.weatherResult.classList.remove('hidden');
    }

    /**
     * Hide weather result
     */
    hideWeatherResult() {
        this.elements.weatherResult.classList.add('hidden');
    }

    /**
     * Save search data to localStorage
     * @param {string} city - City name
     * @param {Object} data - Weather data
     */
    saveToLocalStorage(city, data) {
        try {
            const searchHistory = this.getSearchHistory();
            const searchEntry = {
                city,
                data,
                timestamp: Date.now()
            };

            // Add to beginning of array and limit to 10 entries
            searchHistory.unshift(searchEntry);
            const limitedHistory = searchHistory.slice(0, 10);

            localStorage.setItem('weatherSearchHistory', JSON.stringify(limitedHistory));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromLocalStorage() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const cityFromUrl = urlParams.get('city');

            if (cityFromUrl) {
                this.elements.cityInput.value = cityFromUrl;
                this.searchWeather(cityFromUrl, false);
                return;
            }

            // Load last search from history
            const searchHistory = this.getSearchHistory();
            if (searchHistory.length > 0) {
                const lastSearch = searchHistory[0];
                this.elements.cityInput.value = lastSearch.city;
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }

    /**
     * Get search history from localStorage
     * @returns {Array} - Search history array
     */
    getSearchHistory() {
        try {
            const history = localStorage.getItem('weatherSearchHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Update browser history
     * @param {string} city - City name
     */
    updateBrowserHistory(city) {
        const url = new URL(window.location);
        url.searchParams.set('city', city);
        window.history.pushState({ city }, `Weather for ${city}`, url.toString());
    }

    /**
     * Log search event for analytics
     * @param {string} city - City name
     * @param {number} responseTime - API response time
     */
    logSearchEvent(city, responseTime) {
        // In a real app, this would send to analytics service
        console.log('Search Event:', {
            city,
            responseTime,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }

    /**
     * Log error event for monitoring
     * @param {string} city - City name
     * @param {string} error - Error message
     */
    logErrorEvent(city, error) {
        // In a real app, this would send to error monitoring service
        console.error('Error Event:', {
            city,
            error,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.weatherAPI.clearCache();
        localStorage.removeItem('weatherSearchHistory');
    }

    /**
     * Get app statistics
     * @returns {Object} - App statistics
     */
    getStats() {
        return {
            cache: this.weatherAPI.getCacheStats(),
            searchHistory: this.getSearchHistory().length,
            lastSearch: this.getSearchHistory()[0]?.city || 'None'
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.weatherApp = new WeatherApp();
    } catch (error) {
        console.error('Failed to initialize Weather App:', error);
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 50px; color: red;">
                <h2>Application Error</h2>
                <p>Failed to load the weather application. Please refresh the page.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherApp;
}