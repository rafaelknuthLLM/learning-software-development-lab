# Open-Meteo API Integration Examples

## Basic Integration Patterns

### 1. City-Based Weather Query

#### Step 1: Get Coordinates from City Name
```javascript
async function getCoordinates(cityName) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        country: location.country,
        timezone: location.timezone
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
}
```

#### Step 2: Get Weather Data
```javascript
async function getWeatherData(latitude, longitude, options = {}) {
  const baseUrl = 'https://api.open-meteo.com/v1/forecast';
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: options.timezone || 'auto',
    current_weather: 'true'
  });

  // Add optional parameters
  if (options.hourly) {
    params.append('hourly', options.hourly.join(','));
  }
  if (options.daily) {
    params.append('daily', options.daily.join(','));
  }

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason || 'API request failed');
    }

    return data;
  } catch (error) {
    throw new Error(`Weather API failed: ${error.message}`);
  }
}
```

#### Step 3: Complete City Weather Function
```javascript
async function getCityWeather(cityName) {
  try {
    // Get coordinates
    const location = await getCoordinates(cityName);

    // Get weather data
    const weatherData = await getWeatherData(
      location.latitude,
      location.longitude,
      {
        timezone: location.timezone,
        hourly: ['temperature_2m', 'precipitation', 'wind_speed_10m', 'weather_code'],
        daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'weather_code']
      }
    );

    return {
      location: location,
      weather: weatherData
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

// Usage
getCityWeather('Berlin')
  .then(result => {
    console.log('Location:', result.location.name, result.location.country);
    console.log('Current Temperature:', result.weather.current_weather.temperature, '°C');
  })
  .catch(error => {
    console.error('Failed to get weather:', error.message);
  });
```

### 2. Advanced Integration with Caching

```javascript
class WeatherService {
  constructor() {
    this.locationCache = new Map();
    this.weatherCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  async getCoordinatesWithCache(cityName) {
    const cacheKey = cityName.toLowerCase();
    const cached = this.locationCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // Cache for 24 hours
      return cached.data;
    }

    const location = await this.getCoordinates(cityName);
    this.locationCache.set(cacheKey, {
      data: location,
      timestamp: Date.now()
    });

    return location;
  }

  async getWeatherWithCache(latitude, longitude, options = {}) {
    const cacheKey = `${latitude},${longitude}`;
    const cached = this.weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const weather = await this.getWeatherData(latitude, longitude, options);
    this.weatherCache.set(cacheKey, {
      data: weather,
      timestamp: Date.now()
    });

    return weather;
  }

  async getCityWeatherWithCache(cityName) {
    const location = await this.getCoordinatesWithCache(cityName);
    const weather = await this.getWeatherWithCache(
      location.latitude,
      location.longitude,
      {
        timezone: location.timezone,
        hourly: ['temperature_2m', 'precipitation', 'wind_speed_10m', 'weather_code'],
        daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum']
      }
    );

    return { location, weather };
  }
}
```

### 3. Error Handling and Retry Logic

```javascript
class RobustWeatherService extends WeatherService {
  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, wait and retry
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retry
        const delay = Math.min(1000 * attempt, 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getCoordinates(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

    const data = await this.fetchWithRetry(url);

    if (!data.results || data.results.length === 0) {
      throw new Error(`Location "${cityName}" not found`);
    }

    const location = data.results[0];
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name,
      country: location.country,
      timezone: location.timezone
    };
  }
}
```

## Example API Requests and Responses

### 1. Current Weather Request
```http
GET https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&timezone=Europe/Berlin
```

**Response:**
```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "generationtime_ms": 0.12304688,
  "utc_offset_seconds": 3600,
  "timezone": "Europe/Berlin",
  "timezone_abbreviation": "CET",
  "elevation": 38.0,
  "current_weather": {
    "time": "2024-01-15T15:00",
    "interval": 900,
    "temperature": 7.8,
    "windspeed": 15.5,
    "winddirection": 230,
    "weathercode": 3,
    "is_day": 1
  }
}
```

### 2. Hourly Forecast Request
```http
GET https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation,wind_speed_10m&timezone=auto&forecast_days=3
```

**Response:**
```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "generationtime_ms": 0.234375,
  "utc_offset_seconds": 3600,
  "timezone": "Europe/Berlin",
  "timezone_abbreviation": "CET",
  "elevation": 38.0,
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "km/h"
  },
  "hourly": {
    "time": [
      "2024-01-15T00:00",
      "2024-01-15T01:00",
      "2024-01-15T02:00"
    ],
    "temperature_2m": [6.8, 6.5, 6.2],
    "precipitation": [0.0, 0.0, 0.1],
    "wind_speed_10m": [12.3, 11.8, 13.2]
  }
}
```

### 3. Daily Forecast Request
```http
GET https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=7
```

**Response:**
```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "generationtime_ms": 0.15625,
  "utc_offset_seconds": 3600,
  "timezone": "Europe/Berlin",
  "timezone_abbreviation": "CET",
  "elevation": 38.0,
  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C",
    "precipitation_sum": "mm",
    "weather_code": "wmo code"
  },
  "daily": {
    "time": [
      "2024-01-15",
      "2024-01-16",
      "2024-01-17"
    ],
    "temperature_2m_max": [8.9, 10.2, 7.1],
    "temperature_2m_min": [3.1, 4.5, 2.8],
    "precipitation_sum": [0.2, 5.1, 0.0],
    "weather_code": [3, 61, 1]
  }
}
```

### 4. Geocoding Request
```http
GET https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=3&language=en&format=json
```

**Response:**
```json
{
  "results": [
    {
      "id": 2950159,
      "name": "Berlin",
      "latitude": 52.52437,
      "longitude": 13.41053,
      "elevation": 74.0,
      "feature_code": "PPLC",
      "country_code": "DE",
      "admin1_id": 2944388,
      "timezone": "Europe/Berlin",
      "population": 3426354,
      "country_id": 2921044,
      "country": "Germany",
      "admin1": "Berlin"
    }
  ],
  "generationtime_ms": 1.2340545
}
```

## React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ cityName }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!cityName) return;

      setLoading(true);
      setError(null);

      try {
        const weatherService = new WeatherService();
        const result = await weatherService.getCityWeatherWithCache(cityName);
        setWeather(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [cityName]);

  if (loading) return <div>Loading weather data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weather) return <div>No weather data available</div>;

  const current = weather.weather.current_weather;
  const location = weather.location;

  return (
    <div className="weather-widget">
      <h3>{location.name}, {location.country}</h3>
      <div className="current-weather">
        <span className="temperature">{current.temperature}°C</span>
        <span className="wind">Wind: {current.windspeed} km/h</span>
        <span className="weather-code">Code: {current.weathercode}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
```

## Weather Code Interpretation

Open-Meteo uses WMO weather codes. Here's a mapping helper:

```javascript
const weatherCodeMap = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '🌨️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' }
};

function getWeatherDescription(code) {
  return weatherCodeMap[code] || { description: 'Unknown', icon: '❓' };
}
```

## Testing and Validation

```javascript
// Test suite for weather service
describe('WeatherService', () => {
  const service = new WeatherService();

  test('should get coordinates for valid city', async () => {
    const location = await service.getCoordinates('Berlin');
    expect(location.name).toBe('Berlin');
    expect(location.latitude).toBeCloseTo(52.52, 1);
    expect(location.longitude).toBeCloseTo(13.41, 1);
  });

  test('should get weather data for coordinates', async () => {
    const weather = await service.getWeatherData(52.52, 13.41);
    expect(weather.latitude).toBe(52.52);
    expect(weather.longitude).toBe(13.41);
    expect(weather.current_weather).toBeDefined();
  });

  test('should handle invalid city name', async () => {
    await expect(service.getCoordinates('InvalidCityXYZ123'))
      .rejects.toThrow('Location not found');
  });
});
```