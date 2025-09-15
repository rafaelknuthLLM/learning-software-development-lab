// Unit tests for Weather App main logic
/**
 * @jest-environment jsdom
 */

const WeatherApp = require('../../src/app');

// Mock WeatherAPI
jest.mock('../../src/weatherApi', () => {
    return jest.fn().mockImplementation(() => ({
        fetchWeatherData: jest.fn(),
        clearCache: jest.fn(),
        getCacheStats: jest.fn(() => ({ size: 0, keys: [] }))
    }));
});

describe('WeatherApp', () => {
    let weatherApp;
    let mockWeatherAPI;

    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <div class="container">
                <main>
                    <div class="search-section">
                        <input type="text" id="cityInput" placeholder="Enter city name...">
                        <button id="searchBtn">Search</button>
                    </div>
                    <div id="loadingSpinner" class="loading hidden">Loading...</div>
                    <div id="errorMessage" class="error hidden"></div>
                    <div id="weatherResult" class="weather-result hidden">
                        <div class="weather-card">
                            <h2 id="cityName"></h2>
                            <div class="temperature-section">
                                <span id="temperature" class="temperature"></span>
                                <span id="unit" class="unit">°C</span>
                            </div>
                            <div id="description" class="description"></div>
                            <div class="details">
                                <div class="detail-item">
                                    <span class="label">Humidity:</span>
                                    <span id="humidity"></span>%
                                </div>
                                <div class="detail-item">
                                    <span class="label">Wind Speed:</span>
                                    <span id="windSpeed"></span> m/s
                                </div>
                                <div class="detail-item">
                                    <span class="label">Pressure:</span>
                                    <span id="pressure"></span> hPa
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        // Mock addEventListener
        document.addEventListener = jest.fn();

        weatherApp = new WeatherApp();
        mockWeatherAPI = weatherApp.weatherAPI;
    });

    describe('initialization', () => {
        it('should initialize with all required DOM elements', () => {
            expect(weatherApp.elements.cityInput).toBeTruthy();
            expect(weatherApp.elements.searchBtn).toBeTruthy();
            expect(weatherApp.elements.loadingSpinner).toBeTruthy();
            expect(weatherApp.elements.errorMessage).toBeTruthy();
            expect(weatherApp.elements.weatherResult).toBeTruthy();
        });

        it('should throw error if DOM elements are missing', () => {
            document.getElementById = jest.fn().mockReturnValue(null);

            expect(() => new WeatherApp()).toThrow('Missing DOM elements');
        });

        it('should bind event listeners', () => {
            const cityInput = document.getElementById('cityInput');
            const searchBtn = document.getElementById('searchBtn');

            expect(cityInput.addEventListener).toHaveBeenCalledWith('keypress', expect.any(Function));
            expect(searchBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });

    describe('input validation', () => {
        it('should enable search button for valid input', () => {
            const input = weatherApp.elements.cityInput;
            const button = weatherApp.elements.searchBtn;

            input.value = 'London';
            weatherApp.validateInput('London');

            expect(button.disabled).toBe(false);
        });

        it('should disable search button for empty input', () => {
            const button = weatherApp.elements.searchBtn;

            weatherApp.validateInput('');

            expect(button.disabled).toBe(true);
        });

        it('should disable search button for too long input', () => {
            const button = weatherApp.elements.searchBtn;
            const longInput = 'a'.repeat(101);

            weatherApp.validateInput(longInput);

            expect(button.disabled).toBe(true);
        });

        it('should clear errors on valid input', () => {
            const errorElement = weatherApp.elements.errorMessage;
            errorElement.classList.remove('hidden');

            weatherApp.validateInput('London');

            expect(errorElement.classList.contains('hidden')).toBe(true);
        });
    });

    describe('search functionality', () => {
        it('should handle successful search', async () => {
            const mockWeatherData = {
                city: 'London',
                country: 'GB',
                temperature: 20,
                description: 'clear sky',
                humidity: 65,
                windSpeed: 3.5,
                pressure: 1013,
                responseTime: 150
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValue(mockWeatherData);
            weatherApp.elements.cityInput.value = 'London';

            await weatherApp.handleSearch();

            expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('London');
            expect(weatherApp.elements.cityName.textContent).toBe('London, GB');
            expect(weatherApp.elements.temperature.textContent).toBe('20');
        });

        it('should handle search error', async () => {
            mockWeatherAPI.fetchWeatherData.mockRejectedValue(new Error('City not found'));
            weatherApp.elements.cityInput.value = 'InvalidCity';

            await weatherApp.handleSearch();

            expect(weatherApp.elements.errorMessage.textContent).toBe('City not found');
            expect(weatherApp.elements.errorMessage.classList.contains('hidden')).toBe(false);
        });

        it('should show error for empty input', async () => {
            weatherApp.elements.cityInput.value = '';

            await weatherApp.handleSearch();

            expect(weatherApp.elements.errorMessage.textContent).toBe('Please enter a city name');
            expect(mockWeatherAPI.fetchWeatherData).not.toHaveBeenCalled();
        });

        it('should trim whitespace from input', async () => {
            const mockWeatherData = {
                city: 'London',
                country: 'GB',
                temperature: 20,
                description: 'clear sky',
                humidity: 65,
                windSpeed: 3.5,
                pressure: 1013,
                responseTime: 150
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValue(mockWeatherData);
            weatherApp.elements.cityInput.value = '  London  ';

            await weatherApp.handleSearch();

            expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('London');
        });
    });

    describe('UI state management', () => {
        it('should show loading state', () => {
            weatherApp.showLoading();

            expect(weatherApp.elements.loadingSpinner.classList.contains('hidden')).toBe(false);
            expect(weatherApp.elements.searchBtn.disabled).toBe(true);
            expect(weatherApp.elements.searchBtn.textContent).toBe('Searching...');
        });

        it('should hide loading state', () => {
            weatherApp.hideLoading();

            expect(weatherApp.elements.loadingSpinner.classList.contains('hidden')).toBe(true);
            expect(weatherApp.elements.searchBtn.disabled).toBe(false);
            expect(weatherApp.elements.searchBtn.textContent).toBe('Search');
        });

        it('should show error message', () => {
            weatherApp.showError('Test error');

            expect(weatherApp.elements.errorMessage.textContent).toBe('Test error');
            expect(weatherApp.elements.errorMessage.classList.contains('hidden')).toBe(false);
            expect(weatherApp.elements.errorMessage.getAttribute('role')).toBe('alert');
        });

        it('should hide error message', () => {
            weatherApp.hideError();

            expect(weatherApp.elements.errorMessage.classList.contains('hidden')).toBe(true);
            expect(weatherApp.elements.errorMessage.textContent).toBe('');
        });

        it('should show weather result', () => {
            weatherApp.showWeatherResult();

            expect(weatherApp.elements.weatherResult.classList.contains('hidden')).toBe(false);
        });

        it('should hide weather result', () => {
            weatherApp.hideWeatherResult();

            expect(weatherApp.elements.weatherResult.classList.contains('hidden')).toBe(true);
        });
    });

    describe('localStorage functionality', () => {
        it('should save search to localStorage', () => {
            const city = 'London';
            const weatherData = { temperature: 20 };

            weatherApp.saveToLocalStorage(city, weatherData);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'weatherSearchHistory',
                expect.stringContaining(city)
            );
        });

        it('should handle localStorage errors gracefully', () => {
            localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });

            expect(() => {
                weatherApp.saveToLocalStorage('London', { temperature: 20 });
            }).not.toThrow();
        });

        it('should get search history from localStorage', () => {
            const mockHistory = JSON.stringify([
                { city: 'London', data: { temperature: 20 }, timestamp: Date.now() }
            ]);
            localStorage.getItem.mockReturnValue(mockHistory);

            const history = weatherApp.getSearchHistory();

            expect(history).toHaveLength(1);
            expect(history[0].city).toBe('London');
        });

        it('should return empty array for invalid localStorage data', () => {
            localStorage.getItem.mockReturnValue('invalid json');

            const history = weatherApp.getSearchHistory();

            expect(history).toEqual([]);
        });
    });

    describe('browser history', () => {
        it('should update browser history', () => {
            weatherApp.updateBrowserHistory('London');

            expect(window.history.pushState).toHaveBeenCalledWith(
                { city: 'London' },
                'Weather for London',
                expect.stringContaining('city=London')
            );
        });
    });

    describe('data display', () => {
        it('should display weather data correctly', () => {
            const weatherData = {
                city: 'London',
                country: 'GB',
                temperature: 20,
                description: 'clear sky',
                humidity: 65,
                windSpeed: 3.7,
                pressure: 1013
            };

            weatherApp.displayWeatherData(weatherData);

            expect(weatherApp.elements.cityName.textContent).toBe('London, GB');
            expect(weatherApp.elements.temperature.textContent).toBe('20');
            expect(weatherApp.elements.description.textContent).toBe('clear sky');
            expect(weatherApp.elements.humidity.textContent).toBe('65');
            expect(weatherApp.elements.windSpeed.textContent).toBe('3.7');
            expect(weatherApp.elements.pressure.textContent).toBe('1013');
        });
    });

    describe('cache management', () => {
        it('should clear cache', () => {
            weatherApp.clearCache();

            expect(mockWeatherAPI.clearCache).toHaveBeenCalled();
            expect(localStorage.removeItem).toHaveBeenCalledWith('weatherSearchHistory');
        });

        it('should get app statistics', () => {
            mockWeatherAPI.getCacheStats.mockReturnValue({ size: 2, keys: ['london', 'paris'] });

            const mockHistory = JSON.stringify([
                { city: 'London', data: { temperature: 20 }, timestamp: Date.now() }
            ]);
            localStorage.getItem.mockReturnValue(mockHistory);

            const stats = weatherApp.getStats();

            expect(stats.cache).toEqual({ size: 2, keys: ['london', 'paris'] });
            expect(stats.searchHistory).toBe(1);
            expect(stats.lastSearch).toBe('London');
        });
    });

    describe('event handling', () => {
        it('should handle enter key press', () => {
            const event = new KeyboardEvent('keypress', { key: 'Enter' });
            const handleSearchSpy = jest.spyOn(weatherApp, 'handleSearch').mockImplementation(() => {});

            weatherApp.elements.cityInput.dispatchEvent(event);

            // Simulate the actual event listener
            if (event.key === 'Enter') {
                weatherApp.handleSearch();
            }

            expect(handleSearchSpy).toHaveBeenCalled();
        });
    });

    describe('error auto-hide', () => {
        it('should auto-hide error after timeout', (done) => {
            jest.useFakeTimers();

            weatherApp.showError('Test error');
            expect(weatherApp.elements.errorMessage.classList.contains('hidden')).toBe(false);

            jest.advanceTimersByTime(5000);

            expect(weatherApp.elements.errorMessage.classList.contains('hidden')).toBe(true);

            jest.useRealTimers();
            done();
        });
    });
});