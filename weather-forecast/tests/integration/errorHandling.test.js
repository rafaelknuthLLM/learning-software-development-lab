// Integration tests for error handling with invalid cities
/**
 * @jest-environment jsdom
 */

const { fireEvent, waitFor, screen } = require('@testing-library/dom');
const userEvent = require('@testing-library/user-event');

// Mock the weatherApi module
jest.mock('../../src/weatherApi', () => {
    return jest.fn().mockImplementation(() => ({
        fetchWeatherData: jest.fn(),
        clearCache: jest.fn(),
        getCacheStats: jest.fn(() => ({ size: 0, keys: [] }))
    }));
});

const WeatherApp = require('../../src/app');

describe('Error Handling Integration Tests', () => {
    let weatherApp;
    let mockWeatherAPI;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="container">
                <main>
                    <div class="search-section">
                        <input type="text" id="cityInput" data-testid="city-input" placeholder="Enter city name...">
                        <button id="searchBtn" data-testid="search-button">Search</button>
                    </div>
                    <div id="loadingSpinner" class="loading hidden" data-testid="loading-spinner">Loading...</div>
                    <div id="errorMessage" class="error hidden" data-testid="error-message"></div>
                    <div id="weatherResult" class="weather-result hidden" data-testid="weather-result">
                        <div class="weather-card">
                            <h2 id="cityName" data-testid="city-name"></h2>
                            <div id="temperature" data-testid="temperature"></div>
                            <div id="description" data-testid="description"></div>
                            <div id="humidity" data-testid="humidity"></div>
                            <div id="windSpeed" data-testid="wind-speed"></div>
                            <div id="pressure" data-testid="pressure"></div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        weatherApp = new WeatherApp();
        mockWeatherAPI = weatherApp.weatherAPI;
    });

    describe('Invalid City Name Handling', () => {
        it('should handle 404 city not found error', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('City not found. Please check the spelling and try again.')
            );

            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            await user.type(cityInput, 'NonExistentCity123');
            await user.click(searchButton);

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('City not found. Please check the spelling and try again.');
                expect(errorMessage.classList.contains('hidden')).toBe(false);
                expect(errorMessage.getAttribute('role')).toBe('alert');
            });

            // Loading should be hidden
            expect(screen.getByTestId('loading-spinner').classList.contains('hidden')).toBe(true);

            // Weather result should remain hidden
            expect(screen.getByTestId('weather-result').classList.contains('hidden')).toBe(true);

            // Search button should be re-enabled
            expect(searchButton.disabled).toBe(false);
            expect(searchButton.textContent).toBe('Search');
        });

        it('should handle malformed city names gracefully', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('City name contains invalid characters')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'City<script>alert("xss")</script>');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('City name contains invalid characters');
            });
        });

        it('should handle empty or whitespace-only input', async () => {
            const user = userEvent.setup();
            const searchButton = screen.getByTestId('search-button');

            // Test completely empty input
            await user.click(searchButton);

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Please enter a city name');
            });

            // Should not call API
            expect(mockWeatherAPI.fetchWeatherData).not.toHaveBeenCalled();

            // Test whitespace-only input
            const cityInput = screen.getByTestId('city-input');
            await user.type(cityInput, '   ');
            await user.click(searchButton);

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Please enter a city name');
            });
        });

        it('should handle very long city names', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('City name is too long')
            );

            const cityInput = screen.getByTestId('city-input');
            const longCityName = 'a'.repeat(101);

            await user.type(cityInput, longCityName);
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('City name is too long');
            });
        });
    });

    describe('Network and API Error Handling', () => {
        it('should handle network connectivity errors', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('Network error: Unable to connect to weather service')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'London');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Network error: Unable to connect to weather service');
                expect(errorMessage.classList.contains('hidden')).toBe(false);
            });
        });

        it('should handle API authentication errors', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('Invalid API key')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'London');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Invalid API key');
            });
        });

        it('should handle rate limiting errors', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('Too many requests. Please try again later.')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'London');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Too many requests. Please try again later.');
            });
        });

        it('should handle server errors', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('Weather service is temporarily unavailable')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'London');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Weather service is temporarily unavailable');
            });
        });

        it('should handle timeout errors', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockImplementation(() => {
                return new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 100);
                });
            });

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'London');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.textContent).toBe('Request timeout');
            }, { timeout: 3000 });
        });
    });

    describe('Error State Recovery', () => {
        it('should clear error when new valid search is performed', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');

            // First search with error
            mockWeatherAPI.fetchWeatherData.mockRejectedValueOnce(
                new Error('City not found. Please check the spelling and try again.')
            );

            await user.type(cityInput, 'InvalidCity');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.classList.contains('hidden')).toBe(false);
            });

            // Second search with success
            const mockWeatherData = {
                city: 'London',
                country: 'GB',
                temperature: 20,
                description: 'clear sky',
                humidity: 65,
                windSpeed: 3.5,
                pressure: 1013
            };

            mockWeatherAPI.fetchWeatherData.mockResolvedValueOnce(mockWeatherData);

            await user.clear(cityInput);
            await user.type(cityInput, 'London');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                // Error should be hidden
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.classList.contains('hidden')).toBe(true);

                // Weather result should be shown
                const weatherResult = screen.getByTestId('weather-result');
                expect(weatherResult.classList.contains('hidden')).toBe(false);
            });
        });

        it('should clear error when user starts typing', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');

            // Show error first
            weatherApp.showError('Previous error message');

            const errorMessage = screen.getByTestId('error-message');
            expect(errorMessage.classList.contains('hidden')).toBe(false);

            // Start typing
            await user.type(cityInput, 'L');

            // Error should be cleared
            expect(errorMessage.classList.contains('hidden')).toBe(true);
        });

        it('should auto-hide error message after timeout', async () => {
            jest.useFakeTimers();

            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('Test error for timeout')
            );

            await user.type(cityInput, 'TestCity');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.classList.contains('hidden')).toBe(false);
            });

            // Fast-forward time by 5 seconds
            jest.advanceTimersByTime(5000);

            const errorMessage = screen.getByTestId('error-message');
            expect(errorMessage.classList.contains('hidden')).toBe(true);

            jest.useRealTimers();
        });
    });

    describe('Error Logging and Monitoring', () => {
        it('should log error events for monitoring', async () => {
            const user = userEvent.setup();
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('Test error for logging')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'TestCity');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Error Event:',
                    expect.objectContaining({
                        city: 'TestCity',
                        error: 'Test error for logging',
                        timestamp: expect.any(Number),
                        userAgent: expect.any(String)
                    })
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Accessibility in Error States', () => {
        it('should announce errors to screen readers', async () => {
            const user = userEvent.setup();

            mockWeatherAPI.fetchWeatherData.mockRejectedValue(
                new Error('City not found')
            );

            const cityInput = screen.getByTestId('city-input');

            await user.type(cityInput, 'InvalidCity');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.getAttribute('role')).toBe('alert');
                expect(errorMessage.getAttribute('aria-live')).toBe('polite');
            });
        });

        it('should maintain keyboard focus after error', async () => {
            const user = userEvent.setup();
            const searchButton = screen.getByTestId('search-button');
            const cityInput = screen.getByTestId('city-input');

            // Search with empty input
            await user.click(searchButton);

            await waitFor(() => {
                expect(screen.getByTestId('error-message').textContent).toBe('Please enter a city name');
            });

            // Focus should return to input
            expect(document.activeElement).toBe(cityInput);
        });
    });

    describe('Multiple Error Scenarios', () => {
        it('should handle rapid successive errors', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');

            // First error
            mockWeatherAPI.fetchWeatherData.mockRejectedValueOnce(
                new Error('First error')
            );

            await user.type(cityInput, 'City1');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                expect(screen.getByTestId('error-message').textContent).toBe('First error');
            });

            // Second error immediately
            mockWeatherAPI.fetchWeatherData.mockRejectedValueOnce(
                new Error('Second error')
            );

            await user.clear(cityInput);
            await user.type(cityInput, 'City2');
            await user.keyboard('[Enter]');

            await waitFor(() => {
                expect(screen.getByTestId('error-message').textContent).toBe('Second error');
            });
        });

        it('should handle errors during loading state', async () => {
            const user = userEvent.setup();
            const cityInput = screen.getByTestId('city-input');
            const searchButton = screen.getByTestId('search-button');

            // Mock slow API response followed by error
            mockWeatherAPI.fetchWeatherData.mockImplementation(() => {
                return new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Delayed error')), 100);
                });
            });

            await user.type(cityInput, 'TestCity');
            await user.click(searchButton);

            // Should show loading initially
            expect(screen.getByTestId('loading-spinner').classList.contains('hidden')).toBe(false);
            expect(searchButton.disabled).toBe(true);

            // Wait for error
            await waitFor(() => {
                expect(screen.getByTestId('error-message').textContent).toBe('Delayed error');
            });

            // Loading should be hidden, button re-enabled
            expect(screen.getByTestId('loading-spinner').classList.contains('hidden')).toBe(true);
            expect(searchButton.disabled).toBe(false);
        });
    });
});