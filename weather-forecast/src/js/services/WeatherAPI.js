// Weather API Service - Open-Meteo Integration
import { EventEmitter } from '../utils/events.js';
import { ApiUtils } from '../utils/api.js';

/**
 * Weather API Service for Open-Meteo integration
 * Handles all weather data requests and responses
 */
export class WeatherAPI extends EventEmitter {
    constructor() {
        super();

        this.baseUrl = 'https://api.open-meteo.com/v1';
        this.endpoints = {
            forecast: '/forecast',
            geocoding: '/geocoding'
        };

        this.requestQueue = [];
        this.isRateLimited = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests
    }

    /**
     * Get comprehensive weather data for coordinates
     * @param {number} latitude - Latitude coordinate
     * @param {number} longitude - Longitude coordinate
     * @returns {Promise<Object>} Weather data
     */
    async getWeatherData(latitude, longitude) {
        if (!latitude || !longitude) {
            throw new Error('Latitude and longitude are required');
        }

        try {
            const url = this.buildWeatherUrl(latitude, longitude);
            const response = await this.makeRequest(url);

            const weatherData = this.parseWeatherData(response);
            this.emit('dataReceived', weatherData);

            return weatherData;

        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Build weather API URL with parameters
     * @param {number} latitude - Latitude coordinate
     * @param {number} longitude - Longitude coordinate
     * @returns {string} Complete API URL
     */
    buildWeatherUrl(latitude, longitude) {
        const params = new URLSearchParams({
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4),
            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'apparent_temperature',
                'is_day',
                'precipitation',
                'rain',
                'showers',
                'snowfall',
                'weather_code',
                'cloud_cover',
                'pressure_msl',
                'surface_pressure',
                'wind_speed_10m',
                'wind_direction_10m',
                'wind_gusts_10m',
                'visibility'
            ].join(','),
            hourly: [
                'temperature_2m',
                'relative_humidity_2m',
                'apparent_temperature',
                'precipitation_probability',
                'precipitation',
                'rain',
                'showers',
                'snowfall',
                'weather_code',
                'cloud_cover',
                'pressure_msl',
                'surface_pressure',
                'wind_speed_10m',
                'wind_direction_10m',
                'wind_gusts_10m',
                'visibility',
                'is_day'
            ].join(','),
            daily: [
                'weather_code',
                'temperature_2m_max',
                'temperature_2m_min',
                'apparent_temperature_max',
                'apparent_temperature_min',
                'sunrise',
                'sunset',
                'daylight_duration',
                'sunshine_duration',
                'uv_index_max',
                'precipitation_sum',
                'rain_sum',
                'showers_sum',
                'snowfall_sum',
                'precipitation_hours',
                'precipitation_probability_max',
                'wind_speed_10m_max',
                'wind_gusts_10m_max',
                'wind_direction_10m_dominant'
            ].join(','),
            timezone: 'auto',
            forecast_days: 7
        });

        return `${this.baseUrl}${this.endpoints.forecast}?${params.toString()}`;
    }

    /**
     * Make HTTP request with rate limiting and error handling
     * @param {string} url - URL to request
     * @returns {Promise<Object>} Response data
     */
    async makeRequest(url) {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const delay = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        this.lastRequestTime = Date.now();

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'WeatherApp/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Check for API errors
            if (data.error) {
                throw new Error(`API Error: ${data.reason || data.error}`);
            }

            return data;

        } catch (error) {
            if (error.name === 'NetworkError' || error.name === 'TypeError') {
                throw new Error('Network error - please check your internet connection');
            }

            throw error;
        }
    }

    /**
     * Parse raw weather data from API response
     * @param {Object} response - Raw API response
     * @returns {Object} Parsed weather data
     */
    parseWeatherData(response) {
        const { current, hourly, daily, timezone, utc_offset_seconds } = response;

        return {
            current: this.parseCurrentWeather(current),
            hourly: this.parseHourlyForecast(hourly),
            daily: this.parseDailyForecast(daily),
            timezone,
            utcOffsetSeconds: utc_offset_seconds,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Parse current weather conditions
     * @param {Object} current - Current weather data from API
     * @returns {Object} Parsed current weather
     */
    parseCurrentWeather(current) {
        return {
            temperature: Math.round(current.temperature_2m),
            apparentTemperature: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            windDirection: current.wind_direction_10m,
            windGusts: Math.round(current.wind_gusts_10m || 0),
            pressure: Math.round(current.pressure_msl || current.surface_pressure),
            visibility: Math.round(current.visibility / 1000), // Convert to km
            cloudCover: current.cloud_cover,
            weatherCode: current.weather_code,
            isDay: Boolean(current.is_day),
            precipitation: current.precipitation || 0,
            rain: current.rain || 0,
            showers: current.showers || 0,
            snowfall: current.snowfall || 0,
            condition: this.getWeatherCondition(current.weather_code, current.is_day),
            icon: this.getWeatherIcon(current.weather_code, current.is_day)
        };
    }

    /**
     * Parse hourly forecast data
     * @param {Object} hourly - Hourly data from API
     * @returns {Array} Parsed hourly forecast
     */
    parseHourlyForecast(hourly) {
        const hours = [];
        const now = new Date();
        const next24Hours = 24;

        for (let i = 0; i < Math.min(next24Hours, hourly.time.length); i++) {
            const time = new Date(hourly.time[i]);

            // Only include future hours
            if (time > now) {
                hours.push({
                    time: time.toISOString(),
                    hour: time.getHours(),
                    temperature: Math.round(hourly.temperature_2m[i]),
                    apparentTemperature: Math.round(hourly.apparent_temperature[i]),
                    humidity: hourly.relative_humidity_2m[i],
                    precipitationProbability: hourly.precipitation_probability[i] || 0,
                    precipitation: hourly.precipitation[i] || 0,
                    windSpeed: Math.round(hourly.wind_speed_10m[i]),
                    weatherCode: hourly.weather_code[i],
                    isDay: Boolean(hourly.is_day[i]),
                    condition: this.getWeatherCondition(hourly.weather_code[i], hourly.is_day[i]),
                    icon: this.getWeatherIcon(hourly.weather_code[i], hourly.is_day[i])
                });
            }
        }

        return hours.slice(0, 24); // Return next 24 hours
    }

    /**
     * Parse daily forecast data
     * @param {Object} daily - Daily data from API
     * @returns {Array} Parsed daily forecast
     */
    parseDailyForecast(daily) {
        const days = [];

        for (let i = 0; i < daily.time.length; i++) {
            const date = new Date(daily.time[i]);

            days.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en', { weekday: 'long' }),
                shortDayName: date.toLocaleDateString('en', { weekday: 'short' }),
                temperatureMax: Math.round(daily.temperature_2m_max[i]),
                temperatureMin: Math.round(daily.temperature_2m_min[i]),
                apparentTemperatureMax: Math.round(daily.apparent_temperature_max[i]),
                apparentTemperatureMin: Math.round(daily.apparent_temperature_min[i]),
                weatherCode: daily.weather_code[i],
                precipitationSum: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
                precipitationProbability: daily.precipitation_probability_max[i] || 0,
                windSpeedMax: Math.round(daily.wind_speed_10m_max[i]),
                windGustsMax: Math.round(daily.wind_gusts_10m_max[i] || 0),
                uvIndexMax: daily.uv_index_max[i] || 0,
                sunrise: daily.sunrise[i],
                sunset: daily.sunset[i],
                condition: this.getWeatherCondition(daily.weather_code[i], true),
                icon: this.getWeatherIcon(daily.weather_code[i], true)
            });
        }

        return days;
    }

    /**
     * Get weather condition description from WMO code
     * @param {number} code - WMO weather code
     * @param {boolean} isDay - Whether it's daytime
     * @returns {string} Weather condition description
     */
    getWeatherCondition(code, isDay = true) {
        const conditions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };

        return conditions[code] || 'Unknown';
    }

    /**
     * Get weather icon identifier from WMO code
     * @param {number} code - WMO weather code
     * @param {boolean} isDay - Whether it's daytime
     * @returns {string} Weather icon identifier
     */
    getWeatherIcon(code, isDay = true) {
        const dayNightSuffix = isDay ? '-day' : '-night';

        const iconMap = {
            0: `clear${dayNightSuffix}`,
            1: `partly-cloudy${dayNightSuffix}`,
            2: `partly-cloudy${dayNightSuffix}`,
            3: 'cloudy',
            45: 'fog',
            48: 'fog',
            51: 'drizzle',
            53: 'drizzle',
            55: 'drizzle',
            56: 'sleet',
            57: 'sleet',
            61: 'rain',
            63: 'rain',
            65: 'rain-heavy',
            66: 'sleet',
            67: 'sleet',
            71: 'snow',
            73: 'snow',
            75: 'snow-heavy',
            77: 'snow',
            80: 'rain-showers',
            81: 'rain-showers',
            82: 'rain-heavy',
            85: 'snow-showers',
            86: 'snow-heavy',
            95: 'thunderstorm',
            96: 'thunderstorm-hail',
            99: 'thunderstorm-hail'
        };

        return iconMap[code] || 'unknown';
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.removeAllListeners();
        this.requestQueue = [];
    }
}