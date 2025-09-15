# Open-Meteo API Endpoints Specification

## 1. Weather Forecast API

### Base URL
```
https://api.open-meteo.com/v1/forecast
```

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `latitude` | Float | Latitude in decimal degrees (-90 to 90) | `52.52` |
| `longitude` | Float | Longitude in decimal degrees (-180 to 180) | `13.41` |

### Optional Parameters

#### Current Weather
| Parameter | Type | Description |
|-----------|------|-------------|
| `current_weather` | Boolean | Include current weather conditions |
| `current` | String Array | Current weather variables |

#### Forecast Data
| Parameter | Type | Description | Options |
|-----------|------|-------------|---------|
| `hourly` | String Array | Hourly weather variables | See weather variables below |
| `daily` | String Array | Daily weather aggregates | See daily variables below |
| `minutely_15` | String Array | 15-minute weather data | Limited variables |

#### Time Configuration
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `timezone` | String | Timezone for time values | `GMT` |
| `start_date` | String | Start date (YYYY-MM-DD) | Today |
| `end_date` | String | End date (YYYY-MM-DD) | +7 days |
| `past_days` | Integer | Include past days (0-92) | `0` |

### Weather Variables

#### Temperature Variables
- `temperature_2m` - Air temperature at 2 meters
- `apparent_temperature` - Perceived temperature
- `temperature_80m` - Temperature at 80m altitude
- `temperature_120m` - Temperature at 120m altitude
- `temperature_180m` - Temperature at 180m altitude

#### Precipitation Variables
- `precipitation` - Total precipitation (rain + snow)
- `rain` - Rain precipitation only
- `showers` - Shower precipitation
- `snowfall` - Snow precipitation
- `precipitation_probability` - Probability of precipitation

#### Wind Variables
- `wind_speed_10m` - Wind speed at 10m
- `wind_speed_80m` - Wind speed at 80m
- `wind_speed_120m` - Wind speed at 120m
- `wind_speed_180m` - Wind speed at 180m
- `wind_direction_10m` - Wind direction at 10m
- `wind_direction_80m` - Wind direction at 80m
- `wind_gusts_10m` - Wind gusts at 10m

#### Atmospheric Variables
- `surface_pressure` - Atmospheric pressure at surface
- `cloud_cover` - Total cloud cover percentage
- `cloud_cover_low` - Low altitude cloud cover
- `cloud_cover_mid` - Mid altitude cloud cover
- `cloud_cover_high` - High altitude cloud cover
- `relative_humidity_2m` - Relative humidity at 2m
- `dew_point_2m` - Dew point at 2m

#### Solar and UV
- `shortwave_radiation` - Solar radiation
- `direct_radiation` - Direct solar radiation
- `diffuse_radiation` - Diffuse solar radiation
- `direct_normal_irradiance` - Direct normal irradiance
- `global_tilted_irradiance` - Global tilted irradiance
- `uv_index` - UV index
- `uv_index_clear_sky` - UV index under clear sky
- `sunshine_duration` - Sunshine duration

#### Additional Variables
- `weather_code` - WMO weather interpretation code
- `visibility` - Visibility range
- `evapotranspiration` - Evapotranspiration
- `et0_fao_evapotranspiration` - Reference evapotranspiration
- `vapour_pressure_deficit` - Vapour pressure deficit
- `cape` - Convective available potential energy
- `freezing_level_height` - Freezing level height

### Daily Aggregates

When using `daily` parameter, available variables include:
- `temperature_2m_max` - Maximum daily temperature
- `temperature_2m_min` - Minimum daily temperature
- `apparent_temperature_max` - Maximum apparent temperature
- `apparent_temperature_min` - Minimum apparent temperature
- `sunrise` - Sunrise time
- `sunset` - Sunset time
- `daylight_duration` - Daylight duration
- `sunshine_duration` - Sunshine duration
- `uv_index_max` - Maximum UV index
- `precipitation_sum` - Total daily precipitation
- `rain_sum` - Total daily rain
- `showers_sum` - Total daily showers
- `snowfall_sum` - Total daily snowfall
- `precipitation_hours` - Hours with precipitation
- `precipitation_probability_max` - Maximum precipitation probability
- `wind_speed_10m_max` - Maximum wind speed
- `wind_gusts_10m_max` - Maximum wind gusts
- `wind_direction_10m_dominant` - Dominant wind direction
- `shortwave_radiation_sum` - Total solar radiation

### Response Format

```json
{
  "latitude": 52.52,
  "longitude": 13.41,
  "generationtime_ms": 0.123046875,
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
  },
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "km/h"
  },
  "hourly": {
    "time": ["2024-01-15T00:00", "2024-01-15T01:00", ...],
    "temperature_2m": [6.8, 6.5, 6.2, ...],
    "precipitation": [0.0, 0.0, 0.1, ...],
    "wind_speed_10m": [12.3, 11.8, 13.2, ...]
  },
  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C"
  },
  "daily": {
    "time": ["2024-01-15", "2024-01-16", ...],
    "temperature_2m_max": [8.9, 10.2, ...],
    "temperature_2m_min": [3.1, 4.5, ...]
  }
}
```

## 2. Geocoding API

### Base URL
```
https://geocoding-api.open-meteo.com/v1/search
```

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `name` | String | Yes | Location name to search | `Berlin` |
| `count` | Integer | No | Number of results (1-100) | `10` |
| `language` | String | No | Language code | `en` |
| `format` | String | No | Response format | `json` |

### Response Format

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
      "admin2_id": 0,
      "admin3_id": 6547383,
      "admin4_id": 6547539,
      "timezone": "Europe/Berlin",
      "population": 3426354,
      "postcodes": ["10115", "10117", ...],
      "country_id": 2921044,
      "country": "Germany",
      "admin1": "Berlin",
      "admin2": "",
      "admin3": "Berlin, Stadt",
      "admin4": "Berlin"
    }
  ],
  "generationtime_ms": 1.2340545
}
```

## 3. Historical Weather API

### Base URL
```
https://archive-api.open-meteo.com/v1/archive
```

### Additional Parameters
- `start_date` - Required start date (YYYY-MM-DD)
- `end_date` - Required end date (YYYY-MM-DD)
- Same weather variables as forecast API

## Error Handling

### Common Error Codes
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (invalid endpoint)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": true,
  "reason": "Invalid latitude or longitude"
}
```

## Rate Limits

- **Free Tier**: 10,000 requests per day
- **Commercial**: Contact for pricing
- **Recommendations**:
  - Cache responses when possible
  - Batch requests for multiple locations
  - Use appropriate time intervals