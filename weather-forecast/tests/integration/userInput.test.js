// Integration tests for user input handling
/**
 * @jest-environment jsdom
 */

const { fireEvent, waitFor, screen } = require('@testing-library/dom');
const userEvent = require('@testing-library/user-event');

// Mock the entire weatherApi module
jest.mock('../../src/weatherApi', () => {
    return jest.fn().mockImplementation(() => ({
        fetchWeatherData: jest.fn(),
        clearCache: jest.fn(),
        getCacheStats: jest.fn(() => ({ size: 0, keys: [] }))
    }));
});

const WeatherApp = require('../../src/app');
const WeatherAPI = require('../../src/weatherApi');

describe('User Input Integration Tests', () => {
    let container;
    let weatherApp;
    let mockWeatherAPI;

    beforeEach(async () => {
        // Set up complete DOM structure
        document.body.innerHTML = `
            <div class="container">
                <header>
                    <h1>Weather Forecast</h1>
                </header>
                <main>
                    <div class="search-section">
                        <input
                            type="text"
                            id="cityInput"
                            placeholder="Enter city name..."
                            aria-label="City name input"
                            data-testid="city-input"
                        >
                        <button
                            id="searchBtn"
                            data-testid="search-button"
                            aria-label="Search weather"
                        >
                            Search
                        </button>
                    </div>
                    <div id="loadingSpinner" class="loading hidden" data-testid="loading-spinner">
                        Loading...
                    </div>
                    <div id="errorMessage" class="error hidden" data-testid="error-message">
                    </div>
                    <div id="weatherResult" class="weather-result hidden" data-testid="weather-result">
                        <div class="weather-card">
                            <h2 id="cityName" data-testid="city-name"></h2>
                            <div class="temperature-section">
                                <span id="temperature" class="temperature" data-testid="temperature"></span>
                                <span id="unit" class="unit">°C</span>
                            </div>
                            <div id="description" class="description" data-testid="description"></div>
                            <div class="details">
                                <div class="detail-item">
                                    <span class="label">Humidity:</span>
                                    <span id="humidity" data-testid="humidity"></span>%
                                </div>
                                <div class="detail-item">
                                    <span class="label">Wind Speed:</span>
                                    <span id="windSpeed" data-testid="wind-speed"></span> m/s
                                </div>
                                <div class="detail-item">
                                    <span class="label">Pressure:</span>
                                    <span id="pressure" data-testid="pressure"></span> hPa
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        container = document.body;
        weatherApp = new WeatherApp();
        mockWeatherAPI = weatherApp.weatherAPI;
    });

    describe('User Input Flow', () => {
        it('should handle complete user input flow successfully', async () => {
            const user = userEvent.setup();
            const mockWeatherData = {
                city: 'London',
                country: 'GB',
                temperature: 22,
                description: 'partly cloudy',
                humidity: 68,
                windSpeed: 4.2,
                pressure: 1015,
                responseTime: 180
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValue(mockWeatherData);

            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            // Initially search button should be disabled
            expect(searchButton.disabled).toBe(true);

            // Type city name
            await user.type(cityInput, 'London');
            expect(cityInput.value).toBe('London');

            // Search button should be enabled
            expect(searchButton.disabled).toBe(false);

            // Click search
            await user.click(searchButton);

            // Check loading state
            expect(searchButton.textContent).toBe('Searching...');
            expect(searchButton.disabled).toBe(true);

            // Wait for results
            await waitFor(() => {
                expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('London');
            });

            // Check final UI state
            await waitFor(() => {
                expect(screen.getByTestId('city-name').textContent).toBe('London, GB');
                expect(screen.getByTestId('temperature').textContent).toBe('22');
                expect(screen.getByTestId('description').textContent).toBe('partly cloudy');
                expect(screen.getByTestId('humidity').textContent).toBe('68');
                expect(screen.getByTestId('wind-speed').textContent).toBe('4.2');
                expect(screen.getByTestId('pressure').textContent).toBe('1015');
            });

            expect(searchButton.textContent).toBe('Search');
            expect(searchButton.disabled).toBe(false);
        });

        it('should handle Enter key press', async () => {
            const user = userEvent.setup();
            const mockWeatherData = {
                city: 'Paris',
                country: 'FR',
                temperature: 18,
                description: 'rainy',
                humidity: 75,
                windSpeed: 2.8,
                pressure: 1008
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValue(mockWeatherData);

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'Paris');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('Paris');
            });

            await waitFor(() => {
                expect(screen.getByTestId('city-name').textContent).toBe('Paris, FR');
            });
        });

        it('should handle input validation errors', async () => {
            const user = userEvent.setup();
            const searchButton = screen.getByTestId('search-button');

            // Try to search with empty input
            await user.click(searchButton);

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Please enter a city name');
                expect(errorMessage.classList.contains('hidden')).toBe(false);
            });

            expect(mockWeatherAPI.fetchWeatherData).not.toHaveBeenCalled();
        });

        it('should handle API errors gracefully', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('City not found. Please check the spelling and try again.')
            );

            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            await user.type(cityInput, 'InvalidCity');
            await user.click(searchButton);

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('City not found. Please check the spelling and try again.');
                expect(errorMessage.classList.contains('hidden')).toBe(false);
            });
        });

        it('should clear previous error when typing new input', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');

            // Show error first
            weatherApp.showError('Previous error');
            expect(screen.getByTestId('error-message').classList.contains('hidden')).toBe(false);

            // Type new input
            await user.type(cityInput, 'London');

            // Error should be cleared
            expect(screen.getByTestId('error-message').classList.contains('hidden')).toBe(true);
        });

        it('should handle special characters in city names', async () => {
            const user = userEvent.setup();
            const mockWeatherData = {
                city: 'São Paulo',
                country: 'BR',
                temperature: 28,
                description: 'sunny',
                humidity: 60,
                windSpeed: 3.1,
                pressure: 1020
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValue(mockWeatherData);

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'São Paulo');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('São Paulo');
            });

            await waitFor(() => {
                expect(screen.getByTestId('city-name').textContent).toBe('São Paulo, BR');
            });
        });

        it('should handle whitespace trimming', async () => {
            const user = userEvent.setup();
            const mockWeatherData = {
                city: 'Tokyo',
                country: 'JP',
                temperature: 15,
                description: 'cloudy',
                humidity: 55,
                windSpeed: 2.0,
                pressure: 1025
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValue(mockWeatherData);

            const cityInput = screen.getByTestId('city-input');

            // Input with leading and trailing spaces
            await user.type(cityInput, '   Tokyo   ');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                // Should be called with trimmed input
                expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('Tokyo');
            });
        });

        it('should disable/enable search button based on input length', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            // Initially disabled
            expect(searchButton.disabled).toBe(true);

            // Type one character
            await user.type(cityInput, 'L');
            expect(searchButton.disabled).toBe(false);

            // Clear input
            await user.clear(cityInput);
            expect(searchButton.disabled).toBe(true);

            // Type long input (over 100 chars)
            const longInput = 'a'.repeat(101);
            await user.type(cityInput, longInput);
            expect(searchButton.disabled).toBe(true);
        });

        it('should handle multiple rapid searches', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            // Mock delayed response
            mockWeatherAPI.fetchWeatherData.mockImplementation((city) => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve({
                        city,
                        country: 'Test',
                        temperature: 20,
                        description: 'test',
                        humidity: 50,
                        windSpeed: 2.0,
                        pressure: 1000
                    }), 100);
                });
            });

            await user.type(cityInput, 'London');
            await user.click(searchButton);

            // Immediately try another search
            await user.clear(cityInput);
            await user.type(cityInput, 'Paris');
            await user.click(searchButton);

            // Should handle both requests
            await waitFor(() => {
                expect(mockWeatherAPI.fetchWeatherData).toHaveBeenCalledWith('Paris');
            }, { timeout: 3000 });
        });

        it('should maintain focus on input after error', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            // Try empty search
            await user.click(searchButton);

            await waitFor(() => {
                expect(screen.getByTestId('error-message').textContent).toBe('Please enter a city name');
            });

            // Input should have focus
            expect(document.activeElement).toBe(cityInput);
        });
    });

    describe('Accessibility Features', () => {
        it('should have proper ARIA labels', () => {
            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            expect(cityInput.getAttribute('aria-label')).toBe('City name input');
            expect(searchButton.getAttribute('aria-label')).toBe('Search weather');
        });

        it('should set role="alert" on error messages', async () => {
            const user = userEvent.setup();
            const searchButton = screen.getByTestId('search-button');

            await user.click(searchButton);

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.getAttribute('role')).toBe('alert');
            });
        });
    });

    describe('Form Submission Handling', () => {
        it('should prevent default form submission', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');

            // Simulate form wrapper
            const form = document.createElement('form');
            form.appendChild(cityInput.parentElement);

            const preventDefault = jest.fn();
            const submitEvent = new Event('submit');
            submitEvent.preventDefault = preventDefault;

            await user.type(cityInput, 'London');
            form.dispatchEvent(submitEvent);

            // In real implementation, this would be handled by the form wrapper
            expect(preventDefault).toHaveBeenCalled();
        });
    });
});