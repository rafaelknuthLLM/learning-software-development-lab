# Data Flow and State Management Architecture

## State Management Overview

### Architecture Principles
1. **Unidirectional Data Flow**: Data flows in one direction through the application
2. **Single Source of Truth**: Centralized state management with local component state for UI-specific data
3. **Predictable Updates**: State changes through well-defined actions and reducers
4. **Separation of Concerns**: Business logic separated from UI logic
5. **Optimistic Updates**: UI updates immediately with rollback capability

### State Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                        │
│  (Local State for UI concerns only)                     │
└────────────────┬────────────────────────────────────────┘
                 │ Actions & Selectors
                 ▼
┌─────────────────────────────────────────────────────────┐
│                Global State Store                       │
│  • Weather Data    • UI State    • Cache               │
│  • Location Data   • Errors      • Settings            │
└────────────────┬────────────────────────────────────────┘
                 │ Side Effects
                 ▼
┌─────────────────────────────────────────────────────────┐
│                Service Layer                            │
│  • API Calls      • Cache Management                   │
│  • Data Transform • Error Handling                     │
└─────────────────────────────────────────────────────────┘
```

## Global State Structure

### 1. State Schema
```typescript
interface AppState {
  // Weather-related data
  weather: WeatherState;

  // Location and search
  location: LocationState;

  // UI state
  ui: UIState;

  // Application settings
  settings: SettingsState;

  // Cache management
  cache: CacheState;

  // Error handling
  errors: ErrorState;
}

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: DailyForecast[];
  loading: boolean;
  lastUpdated: Date | null;
  selectedLocation: Location | null;
}

interface LocationState {
  searchQuery: string;
  searchResults: Location[];
  searchLoading: boolean;
  recentSearches: string[];
  currentLocation: GeolocationPosition | null;
  geolocationPermission: PermissionState;
}

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  activeView: 'current' | 'forecast' | 'settings';
  notifications: Notification[];
  modals: {
    settings: boolean;
    about: boolean;
    error: boolean;
  };
}

interface SettingsState {
  units: 'metric' | 'imperial';
  language: string;
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  defaultLocation: string | null;
}

interface CacheState {
  weather: Map<string, CachedWeatherData>;
  locations: Map<string, CachedLocationData>;
  lastCleanup: Date;
  maxAge: number;
  maxEntries: number;
}

interface ErrorState {
  current: AppError | null;
  history: AppError[];
  dismissed: string[];
}
```

### 2. Action Types and Creators
```typescript
// Weather Actions
enum WeatherActionType {
  FETCH_WEATHER_START = 'weather/fetchStart',
  FETCH_WEATHER_SUCCESS = 'weather/fetchSuccess',
  FETCH_WEATHER_FAILURE = 'weather/fetchFailure',
  CLEAR_WEATHER = 'weather/clear',
  REFRESH_WEATHER = 'weather/refresh'
}

interface FetchWeatherStartAction {
  type: WeatherActionType.FETCH_WEATHER_START;
  payload: {
    location: Location;
    refreshing: boolean;
  };
}

interface FetchWeatherSuccessAction {
  type: WeatherActionType.FETCH_WEATHER_SUCCESS;
  payload: {
    location: Location;
    weather: WeatherData;
    forecast: DailyForecast[];
    timestamp: Date;
  };
}

interface FetchWeatherFailureAction {
  type: WeatherActionType.FETCH_WEATHER_FAILURE;
  payload: {
    error: AppError;
    location: Location;
  };
}

// Action Creators
const weatherActions = {
  fetchWeatherStart: (location: Location, refreshing = false): FetchWeatherStartAction => ({
    type: WeatherActionType.FETCH_WEATHER_START,
    payload: { location, refreshing }
  }),

  fetchWeatherSuccess: (
    location: Location,
    weather: WeatherData,
    forecast: DailyForecast[]
  ): FetchWeatherSuccessAction => ({
    type: WeatherActionType.FETCH_WEATHER_SUCCESS,
    payload: {
      location,
      weather,
      forecast,
      timestamp: new Date()
    }
  }),

  fetchWeatherFailure: (error: AppError, location: Location): FetchWeatherFailureAction => ({
    type: WeatherActionType.FETCH_WEATHER_FAILURE,
    payload: { error, location }
  })
};

// Location Actions
enum LocationActionType {
  SEARCH_LOCATIONS_START = 'location/searchStart',
  SEARCH_LOCATIONS_SUCCESS = 'location/searchSuccess',
  SEARCH_LOCATIONS_FAILURE = 'location/searchFailure',
  UPDATE_SEARCH_QUERY = 'location/updateSearchQuery',
  SELECT_LOCATION = 'location/select',
  ADD_RECENT_SEARCH = 'location/addRecentSearch',
  REQUEST_GEOLOCATION = 'location/requestGeolocation',
  GEOLOCATION_SUCCESS = 'location/geolocationSuccess',
  GEOLOCATION_FAILURE = 'location/geolocationFailure'
}
```

### 3. Reducers
```typescript
const weatherReducer = (
  state: WeatherState = initialWeatherState,
  action: WeatherAction
): WeatherState => {
  switch (action.type) {
    case WeatherActionType.FETCH_WEATHER_START:
      return {
        ...state,
        loading: true,
        selectedLocation: action.payload.location
      };

    case WeatherActionType.FETCH_WEATHER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentWeather: action.payload.weather,
        forecast: action.payload.forecast,
        lastUpdated: action.payload.timestamp,
        selectedLocation: action.payload.location
      };

    case WeatherActionType.FETCH_WEATHER_FAILURE:
      return {
        ...state,
        loading: false,
        currentWeather: null,
        forecast: []
      };

    case WeatherActionType.CLEAR_WEATHER:
      return {
        ...state,
        currentWeather: null,
        forecast: [],
        selectedLocation: null
      };

    default:
      return state;
  }
};

const locationReducer = (
  state: LocationState = initialLocationState,
  action: LocationAction
): LocationState => {
  switch (action.type) {
    case LocationActionType.UPDATE_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload.query
      };

    case LocationActionType.SEARCH_LOCATIONS_START:
      return {
        ...state,
        searchLoading: true
      };

    case LocationActionType.SEARCH_LOCATIONS_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchResults: action.payload.locations
      };

    case LocationActionType.ADD_RECENT_SEARCH:
      const newRecentSearches = [
        action.payload.search,
        ...state.recentSearches.filter(s => s !== action.payload.search)
      ].slice(0, 10); // Keep only last 10 searches

      return {
        ...state,
        recentSearches: newRecentSearches
      };

    default:
      return state;
  }
};
```

## Data Flow Patterns

### 1. Async Data Flow (Weather Fetch)
```typescript
// Thunk Action Creator
const fetchWeather = (location: Location) => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();

    // Check cache first
    const cachedData = selectCachedWeather(state, location);
    if (cachedData && !isExpired(cachedData)) {
      dispatch(weatherActions.fetchWeatherSuccess(
        location,
        cachedData.weather,
        cachedData.forecast
      ));
      return;
    }

    dispatch(weatherActions.fetchWeatherStart(location));

    try {
      // Make API calls
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(location),
        weatherService.getForecast(location)
      ]);

      // Cache the results
      dispatch(cacheActions.storeWeatherData({
        location,
        weather,
        forecast,
        timestamp: new Date()
      }));

      dispatch(weatherActions.fetchWeatherSuccess(location, weather, forecast));
      dispatch(locationActions.addRecentSearch(location.name));

    } catch (error) {
      const appError = createAppError(error, 'WEATHER_FETCH_ERROR');
      dispatch(weatherActions.fetchWeatherFailure(appError, location));
      dispatch(errorActions.addError(appError));
    }
  };
};
```

### 2. Location Search Flow
```typescript
const searchLocations = (query: string) => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    if (query.length < 2) {
      dispatch(locationActions.searchLocationsSuccess([]));
      return;
    }

    const state = getState();
    const cachedResults = selectCachedLocationSearch(state, query);

    if (cachedResults) {
      dispatch(locationActions.searchLocationsSuccess(cachedResults));
      return;
    }

    dispatch(locationActions.searchLocationsStart(query));

    try {
      const locations = await locationService.searchLocations(query);

      dispatch(cacheActions.storeLocationSearch(query, locations));
      dispatch(locationActions.searchLocationsSuccess(locations));

    } catch (error) {
      const appError = createAppError(error, 'LOCATION_SEARCH_ERROR');
      dispatch(locationActions.searchLocationsFailure(appError));
    }
  };
};
```

### 3. Optimistic Update Pattern
```typescript
const refreshWeather = (location: Location) => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const currentWeather = selectCurrentWeather(state);

    // Optimistic update - show refreshing state
    dispatch(weatherActions.fetchWeatherStart(location, true));

    try {
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(location),
        weatherService.getForecast(location)
      ]);

      dispatch(weatherActions.fetchWeatherSuccess(location, weather, forecast));
      dispatch(uiActions.showNotification({
        type: 'success',
        message: 'Weather data updated',
        duration: 3000
      }));

    } catch (error) {
      // Rollback optimistic update
      if (currentWeather) {
        dispatch(weatherActions.fetchWeatherSuccess(
          location,
          currentWeather,
          state.weather.forecast
        ));
      } else {
        dispatch(weatherActions.fetchWeatherFailure(
          createAppError(error, 'WEATHER_REFRESH_ERROR'),
          location
        ));
      }

      dispatch(uiActions.showNotification({
        type: 'error',
        message: 'Failed to refresh weather data',
        duration: 5000
      }));
    }
  };
};
```

## Selectors and Derived State

### 1. Memoized Selectors
```typescript
import { createSelector } from 'reselect';

// Base selectors
const selectWeatherState = (state: AppState) => state.weather;
const selectLocationState = (state: AppState) => state.location;
const selectSettingsState = (state: AppState) => state.settings;
const selectCacheState = (state: AppState) => state.cache;

// Derived selectors
export const selectCurrentWeather = createSelector(
  [selectWeatherState],
  (weather) => weather.currentWeather
);

export const selectWeatherForecast = createSelector(
  [selectWeatherState],
  (weather) => weather.forecast
);

export const selectIsWeatherLoading = createSelector(
  [selectWeatherState],
  (weather) => weather.loading
);

export const selectFormattedWeather = createSelector(
  [selectCurrentWeather, selectSettingsState],
  (weather, settings) => {
    if (!weather) return null;

    return {
      ...weather,
      temperature: formatTemperature(weather.temperature, settings.units),
      windSpeed: formatWindSpeed(weather.windSpeed, settings.units),
      visibility: formatDistance(weather.visibility, settings.units)
    };
  }
);

export const selectWeatherWithForecast = createSelector(
  [selectCurrentWeather, selectWeatherForecast],
  (current, forecast) => ({
    current,
    forecast,
    hasData: current !== null,
    forecastAvailable: forecast.length > 0
  })
);

// Complex selectors
export const selectLocationSearchResults = createSelector(
  [selectLocationState, selectSettingsState],
  (location, settings) => {
    return location.searchResults.map(result => ({
      ...result,
      displayName: formatLocationName(result, settings.language),
      distance: calculateDistance(result, location.currentLocation)
    })).sort((a, b) => a.distance - b.distance);
  }
);

export const selectCachedWeather = createSelector(
  [selectCacheState, (_, location: Location) => location],
  (cache, location) => {
    const cacheKey = `${location.latitude},${location.longitude}`;
    const cached = cache.weather.get(cacheKey);

    if (!cached || isExpired(cached)) {
      return null;
    }

    return cached;
  }
);
```

### 2. Performance Optimizations
```typescript
// Memoized weather formatting
const formatWeatherMemoized = memoize(
  (weather: WeatherData, units: Units, language: string) => ({
    temperature: formatTemperature(weather.temperature, units),
    condition: translateCondition(weather.condition, language),
    windDirection: formatWindDirection(weather.windDirection, language),
    time: formatTime(weather.time, language)
  })
);

// Debounced search selector
export const selectDebouncedSearchQuery = createSelector(
  [selectLocationState],
  (location) => location.searchQuery
);

// Cached derived state
const weatherStatsCache = new Map();

export const selectWeatherStats = createSelector(
  [selectWeatherForecast],
  (forecast) => {
    const cacheKey = forecast.map(f => f.date.getTime()).join(',');

    if (weatherStatsCache.has(cacheKey)) {
      return weatherStatsCache.get(cacheKey);
    }

    const stats = {
      averageTemp: calculateAverageTemperature(forecast),
      maxTemp: Math.max(...forecast.map(f => f.maxTemperature)),
      minTemp: Math.min(...forecast.map(f => f.minTemperature)),
      rainDays: forecast.filter(f => f.precipitation > 0).length,
      sunnyDays: forecast.filter(f => f.condition.includes('sunny')).length
    };

    weatherStatsCache.set(cacheKey, stats);
    return stats;
  }
);
```

## Local Component State

### 1. UI State Management
```typescript
// Search component local state
const useSearchState = () => {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          onSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [selectedIndex, suggestions, onSelectSuggestion]);

  return {
    focused,
    setFocused,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown
  };
};

// Weather card animation state
const useWeatherCardState = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'idle' | 'exit'>('idle');

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimationPhase('enter');
        } else {
          setIsVisible(false);
          setAnimationPhase('exit');
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    isVisible,
    animationPhase,
    className: `weather-card weather-card--${animationPhase}`
  };
};
```

### 2. Form State Management
```typescript
const useWeatherSearchForm = () => {
  const dispatch = useDispatch();
  const { searchQuery, searchResults, searchLoading } = useSelector(selectLocationState);

  const [debouncedQuery, setDebouncedQuery] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      dispatch(searchLocations(debouncedQuery));
    } else {
      dispatch(locationActions.searchLocationsSuccess([]));
    }
  }, [debouncedQuery, dispatch]);

  const handleQueryChange = useCallback((query: string) => {
    dispatch(locationActions.updateSearchQuery(query));
  }, [dispatch]);

  const handleLocationSelect = useCallback((location: Location) => {
    dispatch(locationActions.selectLocation(location));
    dispatch(fetchWeather(location));
    dispatch(locationActions.updateSearchQuery(''));
  }, [dispatch]);

  return {
    searchQuery,
    searchResults,
    searchLoading,
    handleQueryChange,
    handleLocationSelect
  };
};
```

## Data Synchronization and Cache Management

### 1. Cache Strategy
```typescript
class WeatherCacheManager {
  private weatherCache = new Map<string, CachedWeatherData>();
  private locationCache = new Map<string, CachedLocationData>();

  private readonly WEATHER_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly LOCATION_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_ENTRIES = 100;

  storeWeatherData(location: Location, data: WeatherData): void {
    const key = this.getLocationKey(location);
    const cached: CachedWeatherData = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.WEATHER_TTL
    };

    this.weatherCache.set(key, cached);
    this.cleanupCache();
  }

  getWeatherData(location: Location): WeatherData | null {
    const key = this.getLocationKey(location);
    const cached = this.weatherCache.get(key);

    if (!cached || cached.expires < Date.now()) {
      this.weatherCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private cleanupCache(): void {
    // Remove expired entries
    const now = Date.now();

    for (const [key, cached] of this.weatherCache.entries()) {
      if (cached.expires < now) {
        this.weatherCache.delete(key);
      }
    }

    // Enforce max entries (LRU eviction)
    if (this.weatherCache.size > this.MAX_ENTRIES) {
      const sortedEntries = Array.from(this.weatherCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const toRemove = sortedEntries.slice(0, this.weatherCache.size - this.MAX_ENTRIES);
      toRemove.forEach(([key]) => this.weatherCache.delete(key));
    }
  }

  private getLocationKey(location: Location): string {
    return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
  }
}
```

This comprehensive data flow and state management architecture provides a solid foundation for handling complex application state while maintaining performance and user experience.