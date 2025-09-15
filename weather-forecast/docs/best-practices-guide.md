# Open-Meteo API Best Practices Guide

## Integration Strategy

### 1. Architecture Recommendations

#### Service Layer Pattern
```javascript
// Recommended service architecture
class WeatherAPIService {
  constructor(options = {}) {
    this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
    this.geocodeUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    this.cacheTimeout = options.cacheTimeout || 30 * 60 * 1000; // 30 minutes
    this.maxRetries = options.maxRetries || 3;

    // Initialize caches
    this.locationCache = new Map();
    this.weatherCache = new Map();
  }
}
```

#### Repository Pattern for Data Access
```javascript
class WeatherRepository {
  constructor(apiService, cacheService) {
    this.apiService = apiService;
    this.cacheService = cacheService;
  }

  async getWeatherByCity(cityName, options = {}) {
    // Implementation with caching, error handling, and transformation
  }
}
```

### 2. Performance Optimization

#### Caching Strategy
```javascript
class CacheManager {
  constructor() {
    this.locationCache = new Map(); // Cache coordinates for 24 hours
    this.weatherCache = new Map();  // Cache weather for 30 minutes
  }

  // Location caching (coordinates don't change frequently)
  getCachedLocation(cityName) {
    const cached = this.locationCache.get(cityName.toLowerCase());
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }
    return null;
  }

  // Weather caching (should be fresh)
  getCachedWeather(lat, lon) {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.weatherCache.get(key);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      return cached.data;
    }
    return null;
  }
}
```

#### Request Optimization
```javascript
// Minimize API calls by requesting only needed data
const optimizedRequest = {
  // Only essential variables for basic weather display
  hourly: ['temperature_2m', 'weather_code', 'wind_speed_10m'],
  daily: ['temperature_2m_max', 'temperature_2m_min', 'weather_code'],
  forecast_days: 5, // Don't request more days than needed
  timezone: 'auto'  // Automatic timezone detection
};
```

### 3. Error Handling Best Practices

#### Comprehensive Error Handling
```javascript
class WeatherAPIError extends Error {
  constructor(message, code, originalError) {
    super(message);
    this.name = 'WeatherAPIError';
    this.code = code;
    this.originalError = originalError;
  }
}

class ErrorHandler {
  static handleAPIError(error, context) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new WeatherAPIError('Network connection failed', 'NETWORK_ERROR', error);
    }

    if (error.status === 429) {
      return new WeatherAPIError('Rate limit exceeded', 'RATE_LIMIT', error);
    }

    if (error.status >= 500) {
      return new WeatherAPIError('Server error', 'SERVER_ERROR', error);
    }

    return new WeatherAPIError(`API request failed: ${error.message}`, 'API_ERROR', error);
  }
}
```

#### Retry Logic with Exponential Backoff
```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10-second timeout
      });

      if (response.status === 429) {
        // Rate limited - wait longer
        const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff for other errors
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 4. Data Validation and Sanitization

#### Input Validation
```javascript
class InputValidator {
  static validateCityName(cityName) {
    if (!cityName || typeof cityName !== 'string') {
      throw new WeatherAPIError('City name must be a non-empty string', 'INVALID_INPUT');
    }

    if (cityName.length < 2) {
      throw new WeatherAPIError('City name must be at least 2 characters long', 'INVALID_INPUT');
    }

    if (cityName.length > 100) {
      throw new WeatherAPIError('City name too long', 'INVALID_INPUT');
    }

    return cityName.trim();
  }

  static validateCoordinates(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new WeatherAPIError('Coordinates must be numbers', 'INVALID_INPUT');
    }

    if (lat < -90 || lat > 90) {
      throw new WeatherAPIError('Latitude must be between -90 and 90', 'INVALID_INPUT');
    }

    if (lon < -180 || lon > 180) {
      throw new WeatherAPIError('Longitude must be between -180 and 180', 'INVALID_INPUT');
    }

    return { lat, lon };
  }
}
```

#### Response Validation
```javascript
class ResponseValidator {
  static validateWeatherResponse(data) {
    if (!data || typeof data !== 'object') {
      throw new WeatherAPIError('Invalid API response format', 'INVALID_RESPONSE');
    }

    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      throw new WeatherAPIError('Missing or invalid coordinates in response', 'INVALID_RESPONSE');
    }

    return data;
  }

  static validateGeocodingResponse(data) {
    if (!data || !Array.isArray(data.results)) {
      throw new WeatherAPIError('Invalid geocoding response format', 'INVALID_RESPONSE');
    }

    return data;
  }
}
```

### 5. Rate Limiting Compliance

#### Rate Limiter Implementation
```javascript
class RateLimiter {
  constructor(maxRequests = 10000, windowMs = 24 * 60 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async checkRateLimit() {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new WeatherAPIError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`,
        'RATE_LIMIT'
      );
    }

    this.requests.push(now);
  }
}
```

### 6. Data Transformation and Presentation

#### Weather Code Interpretation
```javascript
class WeatherInterpreter {
  static getWeatherInfo(code) {
    const weatherMap = {
      0: { description: 'Clear sky', severity: 'good', icon: 'sunny' },
      1: { description: 'Mainly clear', severity: 'good', icon: 'mostly-sunny' },
      2: { description: 'Partly cloudy', severity: 'fair', icon: 'partly-cloudy' },
      3: { description: 'Overcast', severity: 'fair', icon: 'cloudy' },
      45: { description: 'Fog', severity: 'poor', icon: 'fog' },
      48: { description: 'Depositing rime fog', severity: 'poor', icon: 'fog' },
      51: { description: 'Light drizzle', severity: 'fair', icon: 'drizzle' },
      53: { description: 'Moderate drizzle', severity: 'fair', icon: 'drizzle' },
      55: { description: 'Dense drizzle', severity: 'poor', icon: 'rain' },
      61: { description: 'Slight rain', severity: 'fair', icon: 'rain' },
      63: { description: 'Moderate rain', severity: 'poor', icon: 'rain' },
      65: { description: 'Heavy rain', severity: 'poor', icon: 'heavy-rain' },
      71: { description: 'Slight snow fall', severity: 'fair', icon: 'snow' },
      73: { description: 'Moderate snow fall', severity: 'poor', icon: 'snow' },
      75: { description: 'Heavy snow fall', severity: 'poor', icon: 'heavy-snow' },
      95: { description: 'Thunderstorm', severity: 'severe', icon: 'thunderstorm' }
    };

    return weatherMap[code] || {
      description: 'Unknown weather condition',
      severity: 'unknown',
      icon: 'unknown'
    };
  }
}
```

#### Data Transformation Utilities
```javascript
class WeatherTransformer {
  static transformForecastData(apiResponse) {
    const { hourly, daily, current_weather, timezone } = apiResponse;

    return {
      location: {
        latitude: apiResponse.latitude,
        longitude: apiResponse.longitude,
        timezone: timezone,
        elevation: apiResponse.elevation
      },
      current: current_weather ? {
        time: new Date(current_weather.time),
        temperature: current_weather.temperature,
        windSpeed: current_weather.windspeed,
        windDirection: current_weather.winddirection,
        weather: WeatherInterpreter.getWeatherInfo(current_weather.weathercode)
      } : null,
      hourlyForecast: hourly ? this.transformHourlyData(hourly) : null,
      dailyForecast: daily ? this.transformDailyData(daily) : null
    };
  }

  static transformHourlyData(hourly) {
    return hourly.time.map((time, index) => ({
      time: new Date(time),
      temperature: hourly.temperature_2m?.[index],
      precipitation: hourly.precipitation?.[index] || 0,
      windSpeed: hourly.wind_speed_10m?.[index],
      weather: hourly.weather_code?.[index] ?
        WeatherInterpreter.getWeatherInfo(hourly.weather_code[index]) : null
    }));
  }
}
```

### 7. Testing Strategy

#### Unit Tests
```javascript
describe('WeatherService', () => {
  let weatherService;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    weatherService = new WeatherService();
  });

  describe('getCoordinates', () => {
    test('should return coordinates for valid city', async () => {
      const mockResponse = {
        results: [{
          name: 'Berlin',
          latitude: 52.52,
          longitude: 13.41,
          country: 'Germany'
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await weatherService.getCoordinates('Berlin');
      expect(result.name).toBe('Berlin');
      expect(result.latitude).toBe(52.52);
    });

    test('should handle city not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      });

      await expect(weatherService.getCoordinates('NonexistentCity'))
        .rejects.toThrow('Location not found');
    });
  });
});
```

#### Integration Tests
```javascript
describe('Weather API Integration', () => {
  test('should get real weather data for Berlin', async () => {
    const weatherService = new WeatherService();

    const result = await weatherService.getCityWeather('Berlin');

    expect(result.location.name).toBe('Berlin');
    expect(result.weather.latitude).toBeCloseTo(52.52, 1);
    expect(result.weather.current_weather).toBeDefined();
  }, 10000); // 10 second timeout for real API calls
});
```

### 8. Security Considerations

#### Environment Configuration
```javascript
// config/weather.js
const config = {
  api: {
    baseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1/forecast',
    geocodeUrl: process.env.GEOCODE_API_BASE_URL || 'https://geocoding-api.open-meteo.com/v1/search',
    timeout: parseInt(process.env.API_TIMEOUT) || 10000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3
  },
  cache: {
    weatherTtl: parseInt(process.env.WEATHER_CACHE_TTL) || 30 * 60 * 1000,
    locationTtl: parseInt(process.env.LOCATION_CACHE_TTL) || 24 * 60 * 60 * 1000
  }
};
```

#### Input Sanitization
```javascript
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 100);   // Limit length
}
```

### 9. Monitoring and Logging

#### Request Logging
```javascript
class APILogger {
  static logRequest(url, options = {}) {
    console.log(`[${new Date().toISOString()}] API Request: ${url}`, {
      method: options.method || 'GET',
      timestamp: Date.now()
    });
  }

  static logResponse(url, response, duration) {
    console.log(`[${new Date().toISOString()}] API Response: ${url}`, {
      status: response.status,
      duration: `${duration}ms`,
      timestamp: Date.now()
    });
  }

  static logError(url, error) {
    console.error(`[${new Date().toISOString()}] API Error: ${url}`, {
      message: error.message,
      code: error.code,
      timestamp: Date.now()
    });
  }
}
```

### 10. Production Deployment Checklist

#### Configuration
- [ ] Environment variables configured
- [ ] Rate limiting implemented
- [ ] Caching strategy in place
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring set up

#### Performance
- [ ] Response compression enabled
- [ ] CDN configured for static assets
- [ ] Database indexes optimized
- [ ] Cache TTL values tuned
- [ ] Load testing completed

#### Security
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Headers security configured
- [ ] Error messages sanitized

## Summary

This guide provides a comprehensive approach to integrating the Open-Meteo API with focus on:

1. **Reliability**: Robust error handling and retry logic
2. **Performance**: Intelligent caching and request optimization
3. **Maintainability**: Clean architecture and comprehensive testing
4. **Security**: Input validation and safe error handling
5. **Monitoring**: Logging and performance tracking

Following these practices will ensure a production-ready weather application that provides reliable service to users while respecting API limits and maintaining good performance.