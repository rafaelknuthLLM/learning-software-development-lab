# Component Interaction Diagrams

## High-Level Component Interaction Flow

### User Search Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        User Search Interaction Flow                         │
│                                                                             │
│  ┌─────────────┐    user types     ┌──────────────────┐                     │
│  │    User     │──────────────────▶│   SearchForm     │                     │
│  └─────────────┘                   │                  │                     │
│                                    │ • Input field    │                     │
│                                    │ • Validation     │                     │
│                                    │ • Debouncing     │                     │
│                                    └─────────┬────────┘                     │
│                                              │ onChange                     │
│                                              ▼                              │
│                                    ┌──────────────────┐                     │
│                                    │  useSearchHook   │                     │
│                                    │                  │                     │
│                                    │ • Debounced input│                     │
│                                    │ • Dispatch action│                     │
│                                    └─────────┬────────┘                     │
│                                              │ dispatch(searchCity)         │
│                                              ▼                              │
│                                    ┌──────────────────┐                     │
│                                    │   Redux Store    │                     │
│                                    │                  │                     │
│                                    │ • Update loading │                     │
│                                    │ • Store query    │                     │
│                                    └─────────┬────────┘                     │
│                                              │ triggers middleware          │
│                                              ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Redux Thunk Middleware                        │    │
│  │                                                                     │    │
│  │  async searchCity(query) {                                          │    │
│  │    dispatch(setLoading(true));                                      │    │
│  │    try {                                                            │    │
│  │      const locations = await locationService.search(query); ───────┼────┤
│  │      dispatch(setSearchResults(locations));                         │    │
│  │      if (locations.length > 0) {                                    │    │
│  │        const weather = await weatherService.get(locations[0]); ────┼────┤
│  │        dispatch(setWeather(weather));                               │    │
│  │      }                                                              │    │
│  │    } catch (error) {                                                │    │
│  │      dispatch(setError(error));                                     │    │
│  │    } finally {                                                      │    │
│  │      dispatch(setLoading(false));                                   │    │
│  │    }                                                                │    │
│  │  }                                                                  │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Service Layer                                   │    │
│  │                                                                     │    │
│  │  ┌─────────────────┐           ┌─────────────────────────────────┐   │    │
│  │  │ LocationService │           │        WeatherService           │   │    │
│  │  │                 │           │                                 │   │    │
│  │  │ • Geocoding API │           │ • Weather API                   │   │    │
│  │  │ • Caching       │           │ • Data transformation          │   │    │
│  │  │ • Error handling│           │ • Error handling                │   │    │
│  │  └─────────────────┘           └─────────────────────────────────┘   │    │
│  └─────────────────────────┬───────────────────────┬───────────────────┘    │
│                            │                       │                        │
│                            ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Open-Meteo API                                  │    │
│  │                                                                     │    │
│  │  • Geocoding endpoint: /v1/search?name=...                          │    │
│  │  • Weather endpoint: /v1/forecast?latitude=...&longitude=...        │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │ API responses                                  │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Data Flow Back to UI                             │    │
│  │                                                                     │    │
│  │  API Response → Service Layer → Redux Store → React Components      │    │
│  │       │              │              │              │                │    │
│  │       ▼              ▼              ▼              ▼                │    │
│  │  Raw JSON     Transformed     State Update    Component           │    │
│  │  from API     Data Objects    with New Data   Re-render            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## React Component Hierarchy and Data Flow

### Component Tree Structure

```
App
├── ErrorBoundary
│   ├── Router
│   │   ├── Header
│   │   │   ├── Navigation
│   │   │   ├── ThemeToggle
│   │   │   └── SettingsButton
│   │   ├── Main
│   │   │   ├── SearchContainer
│   │   │   │   ├── SearchForm
│   │   │   │   │   ├── SearchInput
│   │   │   │   │   ├── SearchButton
│   │   │   │   │   └── ClearButton
│   │   │   │   └── SearchResults
│   │   │   │       ├── LocationItem (multiple)
│   │   │   │       └── LoadingSpinner
│   │   │   ├── WeatherDashboard
│   │   │   │   ├── CurrentWeather
│   │   │   │   │   ├── WeatherCard
│   │   │   │   │   │   ├── LocationDisplay
│   │   │   │   │   │   ├── TemperatureDisplay
│   │   │   │   │   │   ├── WeatherIcon
│   │   │   │   │   │   ├── ConditionText
│   │   │   │   │   │   ├── WeatherDetails
│   │   │   │   │   │   │   ├── HumidityDisplay
│   │   │   │   │   │   │   ├── WindDisplay
│   │   │   │   │   │   │   └── PressureDisplay
│   │   │   │   │   │   └── LastUpdated
│   │   │   │   │   └── RefreshButton
│   │   │   │   └── WeatherForecast
│   │   │   │       ├── ForecastHeader
│   │   │   │       ├── ForecastGrid
│   │   │   │       │   └── ForecastCard (multiple)
│   │   │   │       │       ├── DayDisplay
│   │   │   │       │       ├── WeatherIcon
│   │   │   │       │       ├── HighLowTemp
│   │   │   │       │       └── PrecipitationInfo
│   │   │   │       └── ForecastDetails
│   │   │   ├── LoadingState
│   │   │   │   └── SkeletonLoader
│   │   │   ├── ErrorState
│   │   │   │   ├── ErrorMessage
│   │   │   │   ├── RetryButton
│   │   │   │   └── SuggestedActions
│   │   │   └── EmptyState
│   │   │       ├── WelcomeMessage
│   │   │       ├── SearchPrompt
│   │   │       └── RecentSearches
│   │   └── Footer
│   │       ├── AppInfo
│   │       ├── DataSource
│   │       └── Links
│   └── Notifications
│       └── Toast (multiple)
└── ServiceWorkerRegistration
```

## State Flow and Component Communication

### Redux State to Component Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      State-to-Component Mapping                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Redux Store                                  │    │
│  │                                                                     │    │
│  │  state.weather: {                                                   │    │
│  │    currentWeather: WeatherData | null,                              │    │
│  │    forecast: DailyForecast[],                                       │    │
│  │    loading: boolean,                                                 │    │
│  │    error: Error | null,                                             │    │
│  │    lastUpdated: Date | null                                         │    │
│  │  }                                                                  │    │
│  │                                                                     │    │
│  │  state.location: {                                                  │    │
│  │    searchQuery: string,                                             │    │
│  │    searchResults: Location[],                                       │    │
│  │    searchLoading: boolean,                                          │    │
│  │    recentSearches: string[]                                         │    │
│  │  }                                                                  │    │
│  │                                                                     │    │
│  │  state.ui: {                                                        │    │
│  │    theme: 'light' | 'dark',                                         │    │
│  │    notifications: Notification[],                                   │    │
│  │    modals: { settings: boolean }                                    │    │
│  │  }                                                                  │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │ useSelector                                    │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Component Selectors                              │    │
│  │                                                                     │    │
│  │  SearchForm:                                                        │    │
│  │    const { query, results, loading } = useSelector(                 │    │
│  │      state => ({                                                    │    │
│  │        query: state.location.searchQuery,                           │    │
│  │        results: state.location.searchResults,                       │    │
│  │        loading: state.location.searchLoading                        │    │
│  │      })                                                             │    │
│  │    );                                                               │    │
│  │                                                                     │    │
│  │  WeatherCard:                                                       │    │
│  │    const weather = useSelector(selectFormattedCurrentWeather);      │    │
│  │    const isLoading = useSelector(state => state.weather.loading);   │    │
│  │                                                                     │    │
│  │  ForecastGrid:                                                      │    │
│  │    const forecast = useSelector(selectFormattedForecast);           │    │
│  │    const units = useSelector(state => state.settings.units);        │    │
│  │                                                                     │    │
│  │  ThemeToggle:                                                       │    │
│  │    const theme = useSelector(state => state.ui.theme);              │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │ Component renders                              │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Component Actions                                 │    │
│  │                                                                     │    │
│  │  SearchForm:                                                        │    │
│  │    const dispatch = useDispatch();                                  │    │
│  │    const handleSearch = (query) => {                                │    │
│  │      dispatch(updateSearchQuery(query));                            │    │
│  │      dispatch(searchLocations(query));                              │    │
│  │    };                                                               │    │
│  │                                                                     │    │
│  │  WeatherCard:                                                       │    │
│  │    const handleRefresh = () => {                                    │    │
│  │      dispatch(refreshWeather(currentLocation));                     │    │
│  │    };                                                               │    │
│  │                                                                     │    │
│  │  LocationItem:                                                      │    │
│  │    const handleSelect = () => {                                     │    │
│  │      dispatch(selectLocation(location));                            │    │
│  │      dispatch(fetchWeather(location));                              │    │
│  │    };                                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Service Layer Interactions

### API Service Communication Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Service Layer Interaction                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Component Layer                                │    │
│  │                                                                     │    │
│  │  SearchForm → dispatch(searchCity("New York"))                      │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Redux Thunk                                    │    │
│  │                                                                     │    │
│  │  async function searchCity(query) {                                 │    │
│  │    dispatch(setLoading(true));                                      │    │
│  │                                                                     │    │
│  │    try {                                                            │    │
│  │      // Step 1: Search for locations                                │    │
│  │      const locations = await LocationService.search(query); ───────┼────┤
│  │      dispatch(setSearchResults(locations));                         │    │
│  │                                                                     │    │
│  │      if (locations.length > 0) {                                    │    │
│  │        // Step 2: Get weather for first result                      │    │
│  │        const weather = await WeatherService.getWeather( ────────────┼────┤
│  │          locations[0]                                               │    │
│  │        );                                                           │    │
│  │        dispatch(setCurrentWeather(weather));                        │    │
│  │                                                                     │    │
│  │        // Step 3: Get forecast                                      │    │
│  │        const forecast = await WeatherService.getForecast( ──────────┼────┤
│  │          locations[0]                                               │    │
│  │        );                                                           │    │
│  │        dispatch(setForecast(forecast));                             │    │
│  │      }                                                              │    │
│  │    } catch (error) {                                                │    │
│  │      dispatch(setError(error));                                     │    │
│  │    } finally {                                                      │    │
│  │      dispatch(setLoading(false));                                   │    │
│  │    }                                                                │    │
│  │  }                                                                  │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Service Classes                                │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                  LocationService                            │    │    │
│  │  │                                                             │    │    │
│  │  │  async search(query: string): Promise<Location[]> {         │    │    │
│  │  │    // Check cache first                                     │    │    │
│  │  │    const cached = this.cache.get(`search:${query}`);        │    │    │
│  │  │    if (cached && !this.isExpired(cached)) {                 │    │    │
│  │  │      return cached.data;                                    │    │    │
│  │  │    }                                                        │    │    │
│  │  │                                                             │    │    │
│  │  │    // Make API call                                         │    │    │
│  │  │    const response = await this.apiClient.get(               │    │    │
│  │  │      '/geocoding/v1/search',                                │    │    │
│  │  │      { name: query, count: 10, language: 'en' }            │    │    │
│  │  │    );                                                       │    │    │
│  │  │                                                             │    │    │
│  │  │    // Transform and cache                                   │    │    │
│  │  │    const locations = this.transformLocations(response);     │    │    │
│  │  │    this.cache.set(`search:${query}`, locations, '1h');      │    │    │
│  │  │                                                             │    │    │
│  │  │    return locations;                                        │    │    │
│  │  │  }                                                          │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                  WeatherService                             │    │    │
│  │  │                                                             │    │    │
│  │  │  async getWeather(location: Location): Promise<Weather> {    │    │    │
│  │  │    // Check cache                                           │    │    │
│  │  │    const cacheKey = this.getCacheKey(location);             │    │    │
│  │  │    const cached = this.cache.get(cacheKey);                 │    │    │
│  │  │    if (cached && !this.isExpired(cached)) {                 │    │    │
│  │  │      return cached.data;                                    │    │    │
│  │  │    }                                                        │    │    │
│  │  │                                                             │    │    │
│  │  │    // Parallel API calls                                    │    │    │
│  │  │    const [current, forecast] = await Promise.all([          │    │    │
│  │  │      this.getCurrentWeather(location),                      │    │    │
│  │  │      this.getForecast(location)                             │    │    │
│  │  │    ]);                                                      │    │    │
│  │  │                                                             │    │    │
│  │  │    const weather = this.combineWeatherData(current, forecast);│    │    │
│  │  │    this.cache.set(cacheKey, weather, '10m');                │    │    │
│  │  │                                                             │    │    │
│  │  │    return weather;                                          │    │    │
│  │  │  }                                                          │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      HTTP Client                                    │    │
│  │                                                                     │    │
│  │  class ApiClient {                                                  │    │
│  │    async get(endpoint: string, params: object): Promise<any> {      │    │
│  │      const url = this.buildUrl(endpoint, params);                   │    │
│  │      const controller = new AbortController();                      │    │
│  │      const timeout = setTimeout(() => controller.abort(), 10000);   │    │
│  │                                                                     │    │
│  │      try {                                                          │    │
│  │        const response = await fetch(url, {                          │    │
│  │          signal: controller.signal,                                 │    │
│  │          headers: {                                                 │    │
│  │            'Accept': 'application/json',                            │    │
│  │            'User-Agent': 'WeatherApp/1.0'                           │    │
│  │          }                                                          │    │
│  │        });                                                          │    │
│  │                                                                     │    │
│  │        if (!response.ok) {                                          │    │
│  │          throw new ApiError(response.status, response.statusText);  │    │
│  │        }                                                            │    │
│  │                                                                     │    │
│  │        return await response.json();                                │    │
│  │      } catch (error) {                                              │    │
│  │        if (error.name === 'AbortError') {                           │    │
│  │          throw new TimeoutError('Request timed out');               │    │
│  │        }                                                            │    │
│  │        throw error;                                                 │    │
│  │      } finally {                                                    │    │
│  │        clearTimeout(timeout);                                       │    │
│  │      }                                                              │    │
│  │    }                                                                │    │
│  │  }                                                                  │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Open-Meteo API                                 │    │
│  │                                                                     │    │
│  │  GET https://geocoding-api.open-meteo.com/v1/search                 │    │
│  │      ?name=New York&count=10&language=en                            │    │
│  │                                                                     │    │
│  │  GET https://api.open-meteo.com/v1/forecast                         │    │
│  │      ?latitude=40.7143&longitude=-74.006                            │    │
│  │      &current=temperature_2m,weather_code,wind_speed_10m            │    │
│  │      &daily=weather_code,temperature_2m_max,temperature_2m_min      │    │
│  │      &timezone=auto                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Error Propagation and Handling Flow

### Error Boundary and Recovery Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Error Handling Flow                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Error Sources                                  │    │
│  │                                                                     │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │    │
│  │  │  Network Error  │  │   API Error     │  │  Component Error    │   │    │
│  │  │                 │  │                 │  │                     │   │    │
│  │  │ • Timeout       │  │ • 4xx status    │  │ • Render crash      │   │    │
│  │  │ • No connection │  │ • 5xx status    │  │ • State corruption  │   │    │
│  │  │ • DNS failure   │  │ • Invalid data  │  │ • Props mismatch    │   │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │    │
│  └─────────────────────────────────┬───────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Error Capture Layer                              │    │
│  │                                                                     │    │
│  │  try {                                                              │    │
│  │    const weather = await weatherService.getWeather(location);       │    │
│  │    dispatch({ type: 'FETCH_SUCCESS', payload: weather });           │    │
│  │  } catch (error) {                                                  │    │
│  │    const appError = ErrorHandler.classify(error);                   │    │
│  │    dispatch({ type: 'FETCH_ERROR', payload: appError });            │    │
│  │    ErrorHandler.report(appError, { context: 'weather-fetch' });     │    │
│  │  }                                                                  │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   Error Classification                              │    │
│  │                                                                     │    │
│  │  class ErrorHandler {                                               │    │
│  │    static classify(error: Error): AppError {                        │    │
│  │      if (error instanceof NetworkError) {                           │    │
│  │        return {                                                     │    │
│  │          type: 'network',                                           │    │
│  │          severity: 'warning',                                       │    │
│  │          message: 'Connection problem. Please try again.',          │    │
│  │          recoverable: true,                                         │    │
│  │          retryable: true                                            │    │
│  │        };                                                           │    │
│  │      }                                                              │    │
│  │                                                                     │    │
│  │      if (error instanceof ApiError) {                               │    │
│  │        if (error.status === 404) {                                  │    │
│  │          return {                                                   │    │
│  │            type: 'not-found',                                       │    │
│  │            severity: 'info',                                        │    │
│  │            message: 'City not found. Please try a different name.', │    │
│  │            recoverable: true,                                       │    │
│  │            retryable: false                                         │    │
│  │          };                                                         │    │
│  │        }                                                            │    │
│  │      }                                                              │    │
│  │                                                                     │    │
│  │      return {                                                       │    │
│  │        type: 'unknown',                                             │    │
│  │        severity: 'error',                                           │    │
│  │        message: 'Something went wrong. Please try again.',          │    │
│  │        recoverable: false,                                          │    │
│  │        retryable: true                                              │    │
│  │      };                                                             │    │
│  │    }                                                                │    │
│  │  }                                                                  │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   UI Error Display                                  │    │
│  │                                                                     │    │
│  │  const ErrorDisplay = ({ error, onRetry, onDismiss }) => {          │    │
│  │    const getErrorIcon = () => {                                     │    │
│  │      switch (error.type) {                                          │    │
│  │        case 'network': return <WifiOffIcon />;                      │    │
│  │        case 'not-found': return <SearchIcon />;                     │    │
│  │        default: return <ErrorIcon />;                               │    │
│  │      }                                                              │    │
│  │    };                                                               │    │
│  │                                                                     │    │
│  │    return (                                                         │    │
│  │      <div className="error-display" role="alert">                   │    │
│  │        {getErrorIcon()}                                             │    │
│  │        <h3>{error.message}</h3>                                     │    │
│  │        <div className="error-actions">                              │    │
│  │          {error.retryable && (                                      │    │
│  │            <button onClick={onRetry}>Try Again</button>             │    │
│  │          )}                                                         │    │
│  │          <button onClick={onDismiss}>Dismiss</button>               │    │
│  │        </div>                                                       │    │
│  │      </div>                                                         │    │
│  │    );                                                               │    │
│  │  };                                                                 │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   Error Recovery Actions                            │    │
│  │                                                                     │    │
│  │  const handleRetry = () => {                                        │    │
│  │    if (error.type === 'network') {                                  │    │
│  │      // Exponential backoff retry                                   │    │
│  │      setTimeout(() => {                                             │    │
│  │        dispatch(retryLastAction());                                 │    │
│  │      }, Math.pow(2, retryAttempt) * 1000);                          │    │
│  │    } else if (error.type === 'not-found') {                         │    │
│  │      // Clear search and show suggestions                           │    │
│  │      dispatch(clearSearch());                                       │    │
│  │      dispatch(showSearchSuggestions());                             │    │
│  │    } else {                                                         │    │
│  │      // Generic retry                                               │    │
│  │      dispatch(retryLastAction());                                   │    │
│  │    }                                                                │    │
│  │  };                                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

These component interaction diagrams provide a comprehensive view of how the different parts of the weather forecast application communicate with each other, handle data flow, and manage errors throughout the system lifecycle.