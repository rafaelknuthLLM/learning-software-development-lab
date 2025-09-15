// Weather UI Component - Handles all user interface interactions
import { EventEmitter } from '../utils/events.js';
import { DOMUtils } from '../utils/dom.js';

/**
 * Weather User Interface Component
 * Manages all DOM interactions and UI updates
 */
export class WeatherUI extends EventEmitter {
    constructor() {
        super();

        // DOM element references
        this.elements = {
            // Loading and error states
            loading: null,
            error: null,
            errorMessage: null,
            retryBtn: null,

            // Search components
            locationInput: null,
            searchBtn: null,
            currentLocationBtn: null,

            // Current weather display
            currentWeatherCard: null,
            currentLocation: null,
            currentDate: null,
            currentTemp: null,
            currentCondition: null,
            currentIcon: null,
            feelsLikeTemp: null,
            currentHumidity: null,
            currentWind: null,
            currentPressure: null,
            currentVisibility: null,

            // Forecast displays
            forecastGrid: null,
            hourlyGrid: null
        };

        this.isInitialized = false;
        this.animations = new Map();

        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleCurrentLocation = this.handleCurrentLocation.bind(this);
        this.handleRetry = this.handleRetry.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    /**
     * Initialize UI components and event listeners
     */
    async init() {
        try {
            await this.cacheElements();
            this.setupEventListeners();
            this.setupKeyboardNavigation();
            this.initializeAnimations();

            this.isInitialized = true;
            console.log('WeatherUI initialized successfully');

        } catch (error) {
            console.error('Failed to initialize WeatherUI:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements for efficient access
     */
    async cacheElements() {
        const elementMap = {
            // Loading and error states
            loading: '#loading',
            error: '#error',
            errorMessage: '#error-message',
            retryBtn: '#retry-btn',

            // Search components
            locationInput: '#location-input',
            searchBtn: '#search-btn',
            currentLocationBtn: '#current-location-btn',

            // Current weather display
            currentWeatherCard: '#current-weather-card',
            currentLocation: '#current-location',
            currentDate: '#current-date',
            currentTemp: '#current-temp',
            currentCondition: '#current-condition',
            currentIcon: '#current-weather-icon',
            feelsLikeTemp: '#feels-like-temp',
            currentHumidity: '#current-humidity',
            currentWind: '#current-wind',
            currentPressure: '#current-pressure',
            currentVisibility: '#current-visibility',

            // Forecast displays
            forecastGrid: '#forecast-grid',
            hourlyGrid: '#hourly-grid'
        };

        // Wait for DOM to be ready
        await DOMUtils.waitForDOM();

        // Cache all elements
        for (const [key, selector] of Object.entries(elementMap)) {
            const element = document.querySelector(selector);
            if (!element) {
                console.warn(`Element not found: ${selector}`);
            }
            this.elements[key] = element;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search functionality
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', this.handleSearch);
        }

        if (this.elements.currentLocationBtn) {
            this.elements.currentLocationBtn.addEventListener('click', this.handleCurrentLocation);
        }

        if (this.elements.locationInput) {
            this.elements.locationInput.addEventListener('keypress', this.handleKeyPress);
        }

        // Error retry
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', this.handleRetry);
        }
    }

    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
        // Focus management for accessibility
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }

            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        this.animations.set('fadeIn', {
            duration: 500,
            easing: 'ease-out',
            keyframes: [
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ]
        });

        this.animations.set('slideIn', {
            duration: 300,
            easing: 'ease-out',
            keyframes: [
                { transform: 'translateX(-100%)' },
                { transform: 'translateX(0)' }
            ]
        });
    }

    /**
     * Handle search button click
     */
    handleSearch() {
        const query = this.elements.locationInput?.value.trim();
        if (query) {
            this.emit('search', query);
        }
    }

    /**
     * Handle current location button click
     */
    handleCurrentLocation() {
        this.emit('currentLocation');
    }

    /**
     * Handle retry button click
     */
    handleRetry() {
        this.emit('retry');
    }

    /**
     * Handle key press events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSearch();
        }
    }

    /**
     * Handle tab navigation for accessibility
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleTabNavigation(event) {
        // Focus trap implementation could go here
        // For now, we rely on natural tab order
    }

    /**
     * Handle escape key press
     */
    handleEscapeKey() {
        // Clear focus from input if focused
        if (document.activeElement === this.elements.locationInput) {
            this.elements.locationInput.blur();
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'flex';
            this.elements.loading.setAttribute('aria-hidden', 'false');
        }

        this.hideError();
        this.disableSearchControls();
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
            this.elements.loading.setAttribute('aria-hidden', 'true');
        }

        this.enableSearchControls();
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        if (this.elements.error && this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
            this.elements.error.style.display = 'block';
            this.elements.error.setAttribute('aria-hidden', 'false');

            // Announce error to screen readers
            this.announceToScreenReader(message);
        }

        this.hideLoading();
        this.enableSearchControls();
    }

    /**
     * Hide error message
     */
    hideError() {
        if (this.elements.error) {
            this.elements.error.style.display = 'none';
            this.elements.error.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Display weather data
     * @param {Object} weatherData - Complete weather data
     * @param {boolean} isCached - Whether data is from cache
     */
    displayWeatherData(weatherData, isCached = false) {
        this.hideLoading();
        this.hideError();

        // Display current weather
        this.displayCurrentWeather(weatherData.current, weatherData.location);

        // Display daily forecast
        this.displayDailyForecast(weatherData.daily);

        // Display hourly forecast
        this.displayHourlyForecast(weatherData.hourly);

        // Show weather card with animation
        if (this.elements.currentWeatherCard) {
            this.elements.currentWeatherCard.style.display = 'block';
            this.animateElement(this.elements.currentWeatherCard, 'fadeIn');
        }

        // Show cache indicator if data is cached
        if (isCached) {
            this.showCacheIndicator();
        }
    }

    /**
     * Display current weather conditions
     * @param {Object} current - Current weather data
     * @param {Object} location - Location data
     */
    displayCurrentWeather(current, location) {
        // Update location and date
        if (this.elements.currentLocation) {
            const locationText = location.region
                ? `${location.name}, ${location.region}`
                : location.name;
            this.elements.currentLocation.textContent = locationText;
        }

        if (this.elements.currentDate) {
            this.elements.currentDate.textContent = new Date().toLocaleDateString('en', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Update temperature
        if (this.elements.currentTemp) {
            this.animateTemperature(this.elements.currentTemp, current.temperature);
        }

        // Update condition and icon
        if (this.elements.currentCondition) {
            this.elements.currentCondition.textContent = current.condition;
        }

        if (this.elements.currentIcon) {
            this.updateWeatherIcon(this.elements.currentIcon, current.icon, current.condition);
        }

        // Update feels like temperature
        if (this.elements.feelsLikeTemp) {
            this.elements.feelsLikeTemp.textContent = current.apparentTemperature;
        }

        // Update weather details
        if (this.elements.currentHumidity) {
            this.elements.currentHumidity.textContent = `${current.humidity}%`;
        }

        if (this.elements.currentWind) {
            this.elements.currentWind.textContent = `${current.windSpeed} km/h`;
        }

        if (this.elements.currentPressure) {
            this.elements.currentPressure.textContent = `${current.pressure} hPa`;
        }

        if (this.elements.currentVisibility) {
            this.elements.currentVisibility.textContent = `${current.visibility} km`;
        }
    }

    /**
     * Display daily forecast
     * @param {Array} dailyData - Daily forecast data
     */
    displayDailyForecast(dailyData) {
        if (!this.elements.forecastGrid) return;

        this.elements.forecastGrid.innerHTML = '';

        dailyData.forEach((day, index) => {
            const forecastCard = this.createDailyForecastCard(day, index === 0);
            this.elements.forecastGrid.appendChild(forecastCard);
        });

        // Animate forecast cards
        this.animateCards(this.elements.forecastGrid.children);
    }

    /**
     * Create daily forecast card
     * @param {Object} day - Daily weather data
     * @param {boolean} isToday - Whether this is today's forecast
     * @returns {HTMLElement} Forecast card element
     */
    createDailyForecastCard(day, isToday = false) {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Weather for ${day.dayName}`);

        card.innerHTML = `
            <div class="forecast-card__header">
                <h3 class="forecast-card__day">${isToday ? 'Today' : day.shortDayName}</h3>
                <p class="forecast-card__date">${new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div class="forecast-card__icon">
                <img src="./assets/icons/weather/${day.icon}.svg" alt="${day.condition}" class="weather-icon">
            </div>
            <div class="forecast-card__temperatures">
                <span class="forecast-card__temp-max">${day.temperatureMax}°</span>
                <span class="forecast-card__temp-min">${day.temperatureMin}°</span>
            </div>
            <p class="forecast-card__condition">${day.condition}</p>
            ${day.precipitationSum > 0 ? `
                <div class="forecast-card__precipitation">
                    <span class="forecast-card__rain">${day.precipitationSum}mm</span>
                    <span class="forecast-card__rain-chance">${day.precipitationProbability}%</span>
                </div>
            ` : ''}
        `;

        return card;
    }

    /**
     * Display hourly forecast
     * @param {Array} hourlyData - Hourly forecast data
     */
    displayHourlyForecast(hourlyData) {
        if (!this.elements.hourlyGrid) return;

        this.elements.hourlyGrid.innerHTML = '';

        hourlyData.slice(0, 24).forEach((hour) => {
            const hourlyCard = this.createHourlyForecastCard(hour);
            this.elements.hourlyGrid.appendChild(hourlyCard);
        });

        // Animate hourly cards
        this.animateCards(this.elements.hourlyGrid.children);
    }

    /**
     * Create hourly forecast card
     * @param {Object} hour - Hourly weather data
     * @returns {HTMLElement} Hourly card element
     */
    createHourlyForecastCard(hour) {
        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Weather for ${hour.hour}:00`);

        card.innerHTML = `
            <div class="hourly-card__time">${hour.hour}:00</div>
            <div class="hourly-card__icon">
                <img src="./assets/icons/weather/${hour.icon}.svg" alt="${hour.condition}" class="weather-icon weather-icon--small">
            </div>
            <div class="hourly-card__temp">${hour.temperature}°</div>
            ${hour.precipitationProbability > 0 ? `
                <div class="hourly-card__precipitation">${hour.precipitationProbability}%</div>
            ` : ''}
        `;

        return card;
    }

    /**
     * Animate temperature change
     * @param {HTMLElement} element - Temperature element
     * @param {number} newTemperature - New temperature value
     */
    animateTemperature(element, newTemperature) {
        if (!element) return;

        const currentTemp = parseInt(element.textContent) || 0;
        const increment = newTemperature > currentTemp ? 1 : -1;
        let current = currentTemp;

        const animateStep = () => {
            if (current !== newTemperature) {
                current += increment;
                element.textContent = current;
                requestAnimationFrame(animateStep);
            }
        };

        animateStep();
    }

    /**
     * Update weather icon
     * @param {HTMLElement} iconElement - Icon image element
     * @param {string} iconName - Icon name/identifier
     * @param {string} altText - Alt text for accessibility
     */
    updateWeatherIcon(iconElement, iconName, altText) {
        if (!iconElement) return;

        const iconPath = `./assets/icons/weather/${iconName}.svg`;
        iconElement.src = iconPath;
        iconElement.alt = altText;

        // Add loading and error handling
        iconElement.onerror = () => {
            iconElement.src = './assets/icons/weather/unknown.svg';
            iconElement.alt = 'Weather condition unknown';
        };
    }

    /**
     * Animate element with specified animation
     * @param {HTMLElement} element - Element to animate
     * @param {string} animationName - Animation name
     */
    animateElement(element, animationName) {
        if (!element || !this.animations.has(animationName)) return;

        const animation = this.animations.get(animationName);
        element.animate(animation.keyframes, {
            duration: animation.duration,
            easing: animation.easing,
            fill: 'forwards'
        });
    }

    /**
     * Animate multiple cards with stagger effect
     * @param {HTMLCollection|Array} cards - Cards to animate
     */
    animateCards(cards) {
        Array.from(cards).forEach((card, index) => {
            setTimeout(() => {
                this.animateElement(card, 'fadeIn');
            }, index * 100);
        });
    }

    /**
     * Disable search controls during loading
     */
    disableSearchControls() {
        if (this.elements.searchBtn) {
            this.elements.searchBtn.disabled = true;
        }
        if (this.elements.currentLocationBtn) {
            this.elements.currentLocationBtn.disabled = true;
        }
        if (this.elements.locationInput) {
            this.elements.locationInput.disabled = true;
        }
    }

    /**
     * Enable search controls
     */
    enableSearchControls() {
        if (this.elements.searchBtn) {
            this.elements.searchBtn.disabled = false;
        }
        if (this.elements.currentLocationBtn) {
            this.elements.currentLocationBtn.disabled = false;
        }
        if (this.elements.locationInput) {
            this.elements.locationInput.disabled = false;
        }
    }

    /**
     * Show cache indicator
     */
    showCacheIndicator() {
        // Create or show cache indicator
        let indicator = document.querySelector('.cache-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'cache-indicator';
            indicator.innerHTML = '📱 Offline data';
            indicator.setAttribute('role', 'status');
            indicator.setAttribute('aria-label', 'Using cached weather data');

            if (this.elements.currentWeatherCard) {
                this.elements.currentWeatherCard.appendChild(indicator);
            }
        }

        indicator.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 3000);
    }

    /**
     * Show offline message
     */
    showOfflineMessage() {
        // Implementation for offline message
        console.log('Offline mode activated');
    }

    /**
     * Hide offline message
     */
    hideOfflineMessage() {
        // Implementation for hiding offline message
        console.log('Online mode activated');
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove event listeners
        this.removeAllListeners();

        // Clear element references
        this.elements = {};
        this.animations.clear();

        this.isInitialized = false;
        console.log('WeatherUI destroyed');
    }
}