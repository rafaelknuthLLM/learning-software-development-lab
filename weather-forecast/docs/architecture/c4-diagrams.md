# C4 Architecture Diagrams

## System Context Diagram (Level 1)

### Overview
The System Context diagram shows the weather forecast application and its relationships with users and external systems.

```
┌─────────────────────────────────────────────────────────────────┐
│                        System Context                           │
│                                                                 │
│  ┌─────────────┐                                                │
│  │    User     │                                                │
│  │             │ Searches for weather                           │
│  │ • Web User  │ information by city                            │
│  │ • Mobile    │◄──────────────────────┐                       │
│  │   User      │                       │                       │
│  └─────────────┘                       │                       │
│                                        │                       │
│              ┌─────────────────────────▼─────────────────────┐  │
│              │        Weather Forecast Application          │  │
│              │                                              │  │
│              │  • Responsive web application                │  │
│              │  • City search functionality                 │  │
│              │  • Weather data display                      │  │
│              │  • Error handling & offline support          │  │
│              │  • Progressive Web App features              │  │
│              │                                              │  │
│              └─────────────┬────────────────────────────────┘  │
│                           │ HTTP requests                     │
│                           │ (weather data)                    │
│                           ▼                                   │
│              ┌──────────────────────────────────────────────┐  │
│              │           Open-Meteo API                     │  │
│              │                                              │  │
│              │  • Weather Forecast API                      │  │
│              │  • Geocoding API                             │  │
│              │  • Historical weather data                   │  │
│              │  • No authentication required                │  │
│              │  • Rate limit: Fair use policy               │  │
│              │                                              │  │
│              └──────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Container Diagram (Level 2)

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Container Diagram                              │
│                                                                             │
│  ┌─────────────┐                                                            │
│  │    User     │                                                            │
│  │             │ HTTPS                                                      │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        Web Browser                                   │  │
│  │                                                                      │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │  │
│  │  │   React App     │  │  Service Worker │  │   Local Storage     │  │  │
│  │  │                 │  │                 │  │                     │  │  │
│  │  │ • UI Components │  │ • Offline cache │  │ • Settings          │  │  │
│  │  │ • State mgmt    │  │ • Background    │  │ • Recent searches   │  │  │
│  │  │ • API clients   │  │   sync          │  │ • Cached weather    │  │  │
│  │  │ • Error handling│  │ • Push notif.   │  │                     │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │ HTTP/HTTPS                                  │
│                               │ Requests                                    │
│                               ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Static Web Server                               │  │
│  │                                                                      │  │
│  │ • Serves HTML, CSS, JavaScript bundles                              │  │
│  │ • CDN integration for global distribution                           │  │
│  │ • GZIP/Brotli compression                                          │  │
│  │ • HTTP/2 server push                                               │  │
│  │ • Security headers (CSP, HSTS)                                     │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│         ┌─────────────────────────────────────────────────────────────┐    │
│         │              API Integration Layer                          │    │
│         │                                                             │    │
│         │  ┌──────────────────┐      ┌──────────────────────────────┐ │    │
│         │  │  Weather Service │      │     Geocoding Service       │ │    │
│         │  │                  │      │                              │ │    │
│         │  │ • API client     │──────┤ • City name resolution      │ │    │
│         │  │ • Response cache │      │ • Coordinate conversion      │ │    │
│         │  │ • Error handling │      │ • Location suggestions      │ │    │
│         │  │ • Rate limiting  │      │ • Country/region data       │ │    │
│         │  └──────────────────┘      └──────────────────────────────┘ │    │
│         └─────────────┬───────────────────────────────────────────────┘    │
│                       │ HTTP requests                                      │
│                       ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Open-Meteo API                                   │  │
│  │                                                                      │  │
│  │  ┌─────────────────┐              ┌─────────────────────────────────┐ │  │
│  │  │ Weather Forecast│              │      Geocoding API              │ │  │
│  │  │       API       │              │                                 │ │  │
│  │  │                 │              │ • Search cities by name         │ │  │
│  │  │ • Current       │              │ • Return coordinates            │ │  │
│  │  │   conditions    │              │ • Country & timezone info       │ │  │
│  │  │ • Daily forecast│              │ • Administrative divisions      │ │  │
│  │  │ • Hourly data   │              │                                 │ │  │
│  │  └─────────────────┘              └─────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Diagram (Level 3) - React Application

### Frontend Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         React Application Components                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           App Shell                                 │    │
│  │                                                                     │    │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │    │
│  │  │ Error Boundary │  │  Router         │  │   Theme Provider      │ │    │
│  │  │                │  │                 │  │                       │ │    │
│  │  │ • Global error │  │ • Route matching│  │ • Light/dark themes   │ │    │
│  │  │   handling     │  │ • Code splitting│  │ • CSS variables       │ │    │
│  │  │ • Fallback UI  │  │ • Lazy loading  │  │ • System preferences  │ │    │
│  │  └────────────────┘  └─────────────────┘  └───────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        State Management                             │    │
│  │                                                                     │    │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │    │
│  │  │ Redux Store    │  │  Middleware     │  │      Selectors        │ │    │
│  │  │                │  │                 │  │                       │ │    │
│  │  │ • Weather data │  │ • Redux Thunk   │  │ • Memoized queries    │ │    │
│  │  │ • UI state     │  │ • Error logging │  │ • Derived state       │ │    │
│  │  │ • Cache        │  │ • Analytics     │  │ • Performance opts    │ │    │
│  │  │ • Settings     │  │ • Dev tools     │  │                       │ │    │
│  │  └────────────────┘  └─────────────────┘  └───────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           UI Components                             │    │
│  │                                                                     │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                       Pages                                    │ │    │
│  │  │                                                                │ │    │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │    │
│  │  │  │  Home/Dashboard │  │   Settings      │  │   About         │ │ │    │
│  │  │  │                 │  │                 │  │                 │ │ │    │
│  │  │  │ • Search form   │  │ • Units config  │  │ • App info      │ │ │    │
│  │  │  │ • Weather cards │  │ • Theme toggle  │  │ • Privacy       │ │ │    │
│  │  │  │ • Forecast      │  │ • Location      │  │ • Help          │ │ │    │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                     │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                      Organisms                                 │ │    │
│  │  │                                                                │ │    │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │    │
│  │  │  │ WeatherDashboard│  │  SearchResults  │  │  Navigation     │ │ │    │
│  │  │  │                 │  │                 │  │                 │ │ │    │
│  │  │  │ • Current data  │  │ • Location list │  │ • Menu items    │ │ │    │
│  │  │  │ • Forecast grid │  │ • Suggestions   │  │ • User actions  │ │ │    │
│  │  │  │ • Refresh logic │  │ • Loading state │  │ • Responsive    │ │ │    │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                     │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                      Molecules                                 │ │    │
│  │  │                                                                │ │    │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │    │
│  │  │  │  WeatherCard    │  │   SearchForm    │  │ ForecastItem    │ │ │    │
│  │  │  │                 │  │                 │  │                 │ │ │    │
│  │  │  │ • Temperature   │  │ • Input field   │  │ • Day/date      │ │ │    │
│  │  │  │ • Conditions    │  │ • Submit button │  │ • Hi/low temps  │ │ │    │
│  │  │  │ • Details       │  │ • Autocomplete  │  │ • Condition     │ │ │    │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                     │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                        Atoms                                   │ │    │
│  │  │                                                                │ │    │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │    │
│  │  │  │     Button      │  │     Input       │  │  WeatherIcon    │ │ │    │
│  │  │  │                 │  │                 │  │                 │ │ │    │
│  │  │  │ • Variants      │  │ • Validation    │  │ • Condition map │ │ │    │
│  │  │  │ • States        │  │ • Error states  │  │ • Animations    │ │ │    │
│  │  │  │ • Accessibility │  │ • Focus mgmt    │  │ • Accessibility │ │ │    │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Service Layer                               │    │
│  │                                                                     │    │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │    │
│  │  │ WeatherService │  │ LocationService │  │   CacheManager        │ │    │
│  │  │                │  │                 │  │                       │ │    │
│  │  │ • API calls    │  │ • Geocoding     │  │ • Storage strategy    │ │    │
│  │  │ • Data format  │  │ • Search        │  │ • Expiration logic    │ │    │
│  │  │ • Error handle │  │ • Suggestions   │  │ • Memory management   │ │    │
│  │  └────────────────┘  └─────────────────┘  └───────────────────────┘ │    │
│  │                                                                     │    │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │    │
│  │  │ ErrorHandler   │  │ AnalyticsService│  │  NotificationService  │ │    │
│  │  │                │  │                 │  │                       │ │    │
│  │  │ • Classification│  │ • Event tracking│  │ • Push notifications  │ │    │
│  │  │ • Recovery     │  │ • Performance   │  │ • In-app messages     │ │    │
│  │  │ • User feedback│  │ • User behavior │  │ • Permission mgmt     │ │    │
│  │  └────────────────┘  └─────────────────┘  └───────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Code Diagram (Level 4) - Key Components

### Weather Service Implementation

```typescript
┌─────────────────────────────────────────────────────────────────────────────┐
│                            WeatherService Class                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Properties                                  │    │
│  │                                                                     │    │
│  │  - apiClient: ApiClient                                             │    │
│  │  - cacheManager: CacheManager                                       │    │
│  │  - errorHandler: ErrorHandler                                       │    │
│  │  - rateLimiter: RateLimiter                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Methods                                     │    │
│  │                                                                     │    │
│  │  + getWeatherByCity(cityName: string): Promise<WeatherData>         │    │
│  │    ├─ validateInput(cityName)                                       │    │
│  │    ├─ checkCache(cityName)                                          │    │
│  │    ├─ geocodeCity(cityName) → coordinates                           │    │
│  │    ├─ getWeatherByCoordinates(lat, lon) → weather                   │    │
│  │    ├─ transformResponse(rawData) → WeatherData                      │    │
│  │    └─ cacheResult(cityName, weatherData)                           │    │
│  │                                                                     │    │
│  │  + getCurrentWeather(coordinates: Coordinates): Promise<Weather>     │    │
│  │    ├─ buildApiUrl(coordinates, params)                              │    │
│  │    ├─ makeRequest(url) → rawResponse                                │    │
│  │    ├─ validateResponse(rawResponse)                                 │    │
│  │    └─ parseWeatherData(rawResponse) → Weather                       │    │
│  │                                                                     │    │
│  │  + getForecast(coordinates: Coordinates): Promise<Forecast[]>       │    │
│  │    ├─ buildForecastUrl(coordinates, params)                         │    │
│  │    ├─ makeRequest(url) → rawResponse                                │    │
│  │    ├─ validateResponse(rawResponse)                                 │    │
│  │    └─ parseForecastData(rawResponse) → Forecast[]                   │    │
│  │                                                                     │    │
│  │  - geocodeCity(cityName: string): Promise<Coordinates>              │    │
│  │    ├─ buildGeocodingUrl(cityName)                                   │    │
│  │    ├─ makeRequest(url) → rawResponse                                │    │
│  │    ├─ validateGeocodingResponse(rawResponse)                        │    │
│  │    └─ extractCoordinates(rawResponse) → Coordinates                 │    │
│  │                                                                     │    │
│  │  - transformWeatherResponse(raw: any): WeatherData                  │    │
│  │    ├─ mapWeatherCodes(raw.current.weather_code)                     │    │
│  │    ├─ convertUnits(raw.current, targetUnits)                        │    │
│  │    ├─ formatTimestamps(raw.current.time)                            │    │
│  │    └─ createWeatherData(transformedData) → WeatherData              │    │
│  │                                                                     │    │
│  │  - handleApiError(error: any): AppError                             │    │
│  │    ├─ classifyError(error) → ErrorType                              │    │
│  │    ├─ createUserMessage(errorType) → string                         │    │
│  │    └─ logError(error, context)                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Dependencies                                   │    │
│  │                                                                     │    │
│  │  ApiClient ◄────────────── WeatherService                          │    │
│  │     │                            │                                 │    │
│  │     ▼                            ▼                                 │    │
│  │  HttpClient                 CacheManager                           │    │
│  │                                  │                                 │    │
│  │                                  ▼                                 │    │
│  │                            LocalStorage/Memory                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Redux State Management Flow                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         User Action                                 │    │
│  │                                                                     │    │
│  │  User types city name → Input onChange → debounced search           │    │
│  │                                      ↓                              │    │
│  │                              dispatch(searchCity)                   │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Action Creator                                 │    │
│  │                                                                     │    │
│  │  searchCity(cityName) {                                             │    │
│  │    return async (dispatch, getState) => {                          │    │
│  │      dispatch({ type: 'SEARCH_START', payload: cityName });         │    │
│  │                                                                     │    │
│  │      try {                                                          │    │
│  │        const weather = await weatherService.getWeather(cityName);   │    │
│  │        dispatch({                                                   │    │
│  │          type: 'SEARCH_SUCCESS',                                    │    │
│  │          payload: { cityName, weather }                             │    │
│  │        });                                                          │    │
│  │      } catch (error) {                                              │    │
│  │        dispatch({                                                   │    │
│  │          type: 'SEARCH_ERROR',                                      │    │
│  │          payload: { cityName, error }                               │    │
│  │        });                                                          │    │
│  │      }                                                              │    │
│  │    };                                                               │    │
│  │  }                                                                  │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Reducer                                      │    │
│  │                                                                     │    │
│  │  weatherReducer(state, action) {                                    │    │
│  │    switch (action.type) {                                           │    │
│  │      case 'SEARCH_START':                                           │    │
│  │        return {                                                     │    │
│  │          ...state,                                                  │    │
│  │          loading: true,                                             │    │
│  │          searchQuery: action.payload                                │    │
│  │        };                                                           │    │
│  │                                                                     │    │
│  │      case 'SEARCH_SUCCESS':                                         │    │
│  │        return {                                                     │    │
│  │          ...state,                                                  │    │
│  │          loading: false,                                            │    │
│  │          currentWeather: action.payload.weather,                    │    │
│  │          error: null                                                │    │
│  │        };                                                           │    │
│  │                                                                     │    │
│  │      case 'SEARCH_ERROR':                                           │    │
│  │        return {                                                     │    │
│  │          ...state,                                                  │    │
│  │          loading: false,                                            │    │
│  │          error: action.payload.error                                │    │
│  │        };                                                           │    │
│  │    }                                                                │    │
│  │  }                                                                  │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Store Update                                   │    │
│  │                                                                     │    │
│  │  Previous State         New State                                   │    │
│  │  {                      {                                           │    │
│  │    weather: {             weather: {                                │    │
│  │      loading: false,        loading: true,                          │    │
│  │      currentWeather: null,  currentWeather: null,                   │    │
│  │      error: null            searchQuery: "New York",                │    │
│  │    }                        error: null                             │    │
│  │  }                        }                                         │    │
│  │                         }                                           │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Selector                                       │    │
│  │                                                                     │    │
│  │  const selectWeatherState = (state) => state.weather;               │    │
│  │  const selectCurrentWeather = (state) => state.weather.current;     │    │
│  │  const selectIsLoading = (state) => state.weather.loading;          │    │
│  │                                                                     │    │
│  │  const selectFormattedWeather = createSelector(                     │    │
│  │    [selectCurrentWeather, selectSettings],                          │    │
│  │    (weather, settings) => {                                         │    │
│  │      if (!weather) return null;                                     │    │
│  │      return {                                                       │    │
│  │        ...weather,                                                  │    │
│  │        temperature: formatTemp(weather.temp, settings.units)        │    │
│  │      };                                                             │    │
│  │    }                                                                │    │
│  │  );                                                                 │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Component Re-render                            │    │
│  │                                                                     │    │
│  │  const WeatherDisplay = () => {                                     │    │
│  │    const weather = useSelector(selectFormattedWeather);             │    │
│  │    const isLoading = useSelector(selectIsLoading);                  │    │
│  │                                                                     │    │
│  │    if (isLoading) return <LoadingSpinner />;                        │    │
│  │    if (!weather) return <EmptyState />;                             │    │
│  │                                                                     │    │
│  │    return (                                                         │    │
│  │      <div className="weather-display">                              │    │
│  │        <h2>{weather.location}</h2>                                  │    │
│  │        <div className="temperature">{weather.temperature}</div>     │    │
│  │        <div className="condition">{weather.condition}</div>         │    │
│  │      </div>                                                         │    │
│  │    );                                                               │    │
│  │  };                                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

These C4 diagrams provide a comprehensive view of the weather forecast application architecture at different levels of abstraction, from the high-level system context down to the detailed code structure and data flow patterns.