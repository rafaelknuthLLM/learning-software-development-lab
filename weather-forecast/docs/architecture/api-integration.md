# API Integration Architecture

## Open-Meteo API Integration Strategy

### Service Overview
Open-Meteo provides free weather forecasting APIs with no rate limits for non-commercial use, making it ideal for our weather application.

### API Endpoints Used

#### 1. Geocoding API
**Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
**Purpose**: Convert city names to coordinates
**Parameters**:
- `name`: City name (required)
- `count`: Number of results (default: 10)
- `language`: Response language (default: en)
- `format`: Response format (json)

```javascript
// Example request
const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;
```

#### 2. Weather Forecast API
**Endpoint**: `https://api.open-meteo.com/v1/forecast`
**Purpose**: Get current weather and forecast data
**Parameters**:
- `latitude`: Latitude coordinate (required)
- `longitude`: Longitude coordinate (required)
- `current`: Current weather variables
- `daily`: Daily forecast variables
- `timezone`: Timezone handling

```javascript
// Example request
const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
```

## API Integration Patterns

### 1. Service Layer Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   UI Component  │───▶│  Weather Service │───▶│  API Client    │
└─────────────────┘    └──────────────────┘    └────────────────┘
         ▲                       │                       │
         │                       ▼                       ▼
         │              ┌──────────────────┐    ┌────────────────┐
         └──────────────│  State Manager   │    │  HTTP Client   │
                        └──────────────────┘    └────────────────┘
```

### 2. Weather Service Implementation

```typescript
class WeatherService {
  private apiClient: ApiClient;
  private cacheManager: CacheManager;

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    try {
      // Step 1: Get coordinates from city name
      const coordinates = await this.geocodeCity(cityName);

      // Step 2: Get weather data using coordinates
      const weatherData = await this.getWeatherByCoordinates(
        coordinates.latitude,
        coordinates.longitude
      );

      // Step 3: Cache the result
      await this.cacheManager.set(cityName, weatherData, '10m');

      return weatherData;
    } catch (error) {
      throw new WeatherServiceError(error);
    }
  }

  private async geocodeCity(cityName: string): Promise<Coordinates> {
    const cachedCoords = await this.cacheManager.get(`coords:${cityName}`);
    if (cachedCoords) return cachedCoords;

    const response = await this.apiClient.get('/geocoding/v1/search', {
      name: cityName,
      count: 1,
      language: 'en'
    });

    if (!response.results || response.results.length === 0) {
      throw new CityNotFoundError(cityName);
    }

    const coords = {
      latitude: response.results[0].latitude,
      longitude: response.results[0].longitude,
      name: response.results[0].name,
      country: response.results[0].country
    };

    // Cache coordinates for 24 hours
    await this.cacheManager.set(`coords:${cityName}`, coords, '24h');

    return coords;
  }

  private async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `weather:${lat}:${lon}`;
    const cachedWeather = await this.cacheManager.get(cacheKey);
    if (cachedWeather) return cachedWeather;

    const response = await this.apiClient.get('/forecast/v1/forecast', {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum'
      ].join(','),
      timezone: 'auto'
    });

    return this.transformWeatherResponse(response);
  }
}
```

### 3. API Client Configuration

```typescript
class ApiClient {
  private baseURL: string = 'https://api.open-meteo.com';
  private geocodingURL: string = 'https://geocoding-api.open-meteo.com';
  private timeout: number = 10000; // 10 seconds
  private retryAttempts: number = 3;

  async get(endpoint: string, params: Record<string, any>): Promise<any> {
    const url = this.buildURL(endpoint, params);

    return await this.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WeatherForecastApp/1.0'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError(response.status, response.statusText);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });
  }

  private buildURL(endpoint: string, params: Record<string, any>): string {
    const baseURL = endpoint.includes('geocoding') ? this.geocodingURL : this.baseURL;
    const url = new URL(endpoint, baseURL);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.retryAttempts || !this.isRetriableError(error)) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        await this.delay(Math.pow(2, attempt - 1) * 1000);
      }
    }

    throw lastError!;
  }

  private isRetriableError(error: any): boolean {
    // Network errors, timeouts, and 5xx server errors are retriable
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      (error instanceof ApiError && error.status >= 500)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Caching Strategy

### 1. Multi-Level Caching

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│  Browser Cache  │    │  Memory Cache    │    │  API Response  │
│  (HTTP Cache)   │───▶│  (Application)   │───▶│  (Fresh Data)  │
└─────────────────┘    └──────────────────┘    └────────────────┘
```

### 2. Cache Configuration

```typescript
const cacheConfig = {
  coordinates: {
    ttl: '24h', // Coordinates rarely change
    storage: 'localStorage'
  },
  weather: {
    ttl: '10m', // Weather updates frequently
    storage: 'memory'
  },
  weatherCodes: {
    ttl: 'permanent', // Static mapping data
    storage: 'localStorage'
  }
};
```

### 3. Cache Invalidation Rules

- **Time-based**: Automatic expiration based on TTL
- **User-triggered**: Manual refresh functionality
- **Error-based**: Clear cache on repeated API failures
- **Storage-based**: localStorage for persistent data, memory for session data

## Rate Limiting and Quotas

### Open-Meteo Limits
- **Commercial use**: Requires subscription
- **Non-commercial use**: No rate limits
- **Fair use policy**: Reasonable request patterns expected

### Client-Side Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number = 100; // per minute
  private readonly windowMs: number = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old requests
    this.requests = this.requests.filter(time => time > windowStart);

    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}
```

## API Response Transformation

### Raw API Response Structure
```json
{
  "latitude": 52.52,
  "longitude": 13.419998,
  "generationtime_ms": 2.2119,
  "utc_offset_seconds": 3600,
  "timezone": "Europe/Berlin",
  "current": {
    "time": "2022-01-01T15:00",
    "temperature_2m": 2.4,
    "relative_humidity_2m": 100,
    "weather_code": 3
  },
  "daily": {
    "time": ["2022-01-01", "2022-01-02"],
    "weather_code": [3, 1],
    "temperature_2m_max": [2.4, 5.1],
    "temperature_2m_min": [-1.3, -2.8]
  }
}
```

### Transformed Application Data
```typescript
interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    condition: WeatherCondition;
    time: Date;
  };
  forecast: DailyForecast[];
  metadata: {
    timezone: string;
    lastUpdated: Date;
    source: 'open-meteo';
  };
}
```