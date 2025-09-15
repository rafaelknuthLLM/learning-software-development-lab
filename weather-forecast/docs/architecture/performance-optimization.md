# Performance Optimization Strategy

## Performance Goals and Metrics

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Time to Interactive (TTI)**: < 3.5 seconds

### Application-Specific Metrics
- **API Response Time**: < 2 seconds (95th percentile)
- **Search Autocomplete**: < 200ms response time
- **Route Transition**: < 300ms
- **Bundle Size**: < 250KB initial load
- **Memory Usage**: < 50MB steady state

## Loading Performance Optimization

### 1. Bundle Optimization

#### Code Splitting Strategy
```typescript
// Route-based code splitting
const WeatherDashboard = lazy(() => import('./pages/WeatherDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));

// Component-based code splitting
const WeatherChart = lazy(() => import('./components/WeatherChart'));
const LocationMap = lazy(() => import('./components/LocationMap'));

// Feature-based code splitting
const AdvancedFeatures = lazy(() => import('./features/AdvancedFeatures'));

// Dynamic imports for heavy utilities
const loadWeatherUtils = () => import('./utils/weatherCalculations');
const loadMapLibrary = () => import('./utils/mapIntegration');
```

#### Bundle Analysis Configuration
```javascript
// webpack-bundle-analyzer configuration
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          enforce: true
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        },
        weather: {
          test: /[\\/]src[\\/](components|utils)[\\/]weather/,
          name: 'weather',
          priority: 8
        }
      }
    }
  }
};
```

### 2. Asset Optimization

#### Image Optimization
```typescript
// Responsive image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty'
}) => {
  // Generate WebP and fallback URLs
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/, '.avif');

  return (
    <picture>
      <source srcSet={generateSrcSet(avifSrc, width)} type="image/avif" />
      <source srcSet={generateSrcSet(webpSrc, width)} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{ aspectRatio: `${width}/${height}` }}
      />
    </picture>
  );
};

const generateSrcSet = (baseSrc: string, baseWidth: number): string => {
  const sizes = [0.5, 1, 1.5, 2].map(ratio => Math.round(baseWidth * ratio));
  return sizes
    .map(size => `${baseSrc}?w=${size} ${size}w`)
    .join(', ');
};
```

#### SVG Icon Optimization
```typescript
// Icon sprite system
const IconSprite: React.FC = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      <symbol id="sun" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </symbol>
      <symbol id="cloud" viewBox="0 0 24 24">
        <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </symbol>
    </defs>
  </svg>
);

const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name,
  size = 24,
  className
}) => (
  <svg
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <use href={`#${name}`} />
  </svg>
);
```

### 3. Critical Path Optimization

#### Critical CSS Strategy
```css
/* Critical CSS - inlined in HTML head */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

.header {
  height: 64px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Non-critical CSS loaded asynchronously */
```

#### Resource Preloading
```html
<!-- DNS prefetch for API domains -->
<link rel="dns-prefetch" href="//api.open-meteo.com">
<link rel="dns-prefetch" href="//geocoding-api.open-meteo.com">

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/css/critical.css" as="style">

<!-- Preconnect for third-party resources -->
<link rel="preconnect" href="https://api.open-meteo.com">

<!-- Module preload for critical JavaScript -->
<link rel="modulepreload" href="/js/app.js">
<link rel="modulepreload" href="/js/weather-service.js">
```

## Runtime Performance Optimization

### 1. React Performance Patterns

#### Component Memoization
```typescript
// Memo wrapper for expensive components
const WeatherCard = React.memo<WeatherCardProps>(
  ({ weather, forecast, onRefresh }) => {
    const memoizedStats = useMemo(
      () => calculateWeatherStats(weather, forecast),
      [weather.temperature, weather.humidity, forecast.length]
    );

    const handleRefresh = useCallback(() => {
      onRefresh(weather.location);
    }, [onRefresh, weather.location.id]);

    return (
      <div className="weather-card">
        <WeatherDisplay weather={weather} />
        <WeatherStats stats={memoizedStats} />
        <RefreshButton onClick={handleRefresh} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.weather.lastUpdated === nextProps.weather.lastUpdated &&
      prevProps.forecast.length === nextProps.forecast.length
    );
  }
);

// useMemo for expensive calculations
const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      x: point.time.getTime(),
      y: point.temperature,
      label: formatTemperature(point.temperature)
    }));
  }, [data]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.label}°`
        }
      }
    }
  }), []);

  return <Chart data={chartData} options={chartOptions} />;
};
```

#### Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

const LocationSearchResults: React.FC<{ results: Location[] }> = ({ results }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <LocationItem location={results[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={results.length}
      itemSize={60}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};
```

### 2. State Management Performance

#### Selector Optimization
```typescript
import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';

// Memoized selectors prevent unnecessary re-renders
const selectWeatherDisplay = createSelector(
  [selectCurrentWeather, selectSettings],
  (weather, settings) => {
    if (!weather) return null;

    return {
      temperature: formatTemperature(weather.temperature, settings.units),
      condition: weather.condition,
      icon: getWeatherIcon(weather.code),
      lastUpdated: formatTime(weather.lastUpdated, settings.locale)
    };
  }
);

// Custom hook with shallow equality check
const useWeatherData = () => {
  return useSelector(selectWeatherDisplay, shallowEqual);
};

// Normalized state structure for efficient updates
interface NormalizedState {
  locations: {
    byId: { [id: string]: Location };
    allIds: string[];
  };
  weather: {
    byLocationId: { [locationId: string]: WeatherData };
  };
  ui: {
    selectedLocationId: string | null;
    loading: boolean;
  };
}
```

### 3. API Request Optimization

#### Request Batching and Deduplication
```typescript
class RequestBatcher {
  private pendingRequests = new Map<string, Promise<any>>();
  private batchQueue = new Map<string, Array<{ resolve: Function; reject: Function }>>();
  private batchTimeout: NodeJS.Timeout | null = null;

  async batchedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in progress
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request promise
    const promise = new Promise<T>((resolve, reject) => {
      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, []);
      }

      this.batchQueue.get(key)!.push({ resolve, reject });

      // Schedule batch execution
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.executeBatch();
        }, 50); // 50ms batch window
      }
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  private async executeBatch() {
    const currentBatch = new Map(this.batchQueue);
    this.batchQueue.clear();
    this.batchTimeout = null;

    for (const [key, requests] of currentBatch) {
      try {
        const result = await this.executeRequest(key);
        requests.forEach(({ resolve }) => resolve(result));
      } catch (error) {
        requests.forEach(({ reject }) => reject(error));
      } finally {
        this.pendingRequests.delete(key);
      }
    }
  }

  private async executeRequest(key: string): Promise<any> {
    // Implementation specific to request type
    if (key.startsWith('weather:')) {
      const locationId = key.split(':')[1];
      return weatherService.getWeather(locationId);
    }

    if (key.startsWith('geocoding:')) {
      const query = key.split(':')[1];
      return geocodingService.search(query);
    }

    throw new Error(`Unknown request type: ${key}`);
  }
}

const requestBatcher = new RequestBatcher();

// Usage in service layer
export const getWeather = async (locationId: string): Promise<WeatherData> => {
  return requestBatcher.batchedRequest(
    `weather:${locationId}`,
    () => fetchWeatherData(locationId)
  );
};
```

#### Intelligent Caching Strategy
```typescript
class SmartCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly STALE_WHILE_REVALIDATE = 5 * 60 * 1000; // 5 minutes

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Cache hit - return fresh data
    if (cached && cached.expires > now) {
      return cached.data as T;
    }

    // Stale-while-revalidate pattern
    if (cached && cached.expires + this.STALE_WHILE_REVALIDATE > now) {
      // Return stale data immediately
      const staleData = cached.data as T;

      // Revalidate in background
      this.revalidate(key, fetchFn, options).catch(console.error);

      return staleData;
    }

    // Cache miss or expired - fetch fresh data
    const freshData = await fetchFn();
    this.set(key, freshData, options);

    return freshData;
  }

  private async revalidate<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const freshData = await fetchFn();
      this.set(key, freshData, options);
    } catch (error) {
      // Log error but don't throw - stale data is better than no data
      console.warn(`Failed to revalidate cache for key: ${key}`, error);
    }
  }

  private set<T>(key: string, data: T, options: CacheOptions): void {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const entry: CacheEntry = {
      data,
      created: Date.now(),
      expires: Date.now() + ttl,
      size: this.estimateSize(data)
    };

    this.cache.set(key, entry);
    this.evictIfNeeded();
  }

  private evictIfNeeded(): void {
    const maxSize = 50 * 1024 * 1024; // 50MB
    let currentSize = 0;

    // Calculate total cache size
    for (const entry of this.cache.values()) {
      currentSize += entry.size;
    }

    if (currentSize > maxSize) {
      // LRU eviction
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.created - b.created);

      while (currentSize > maxSize * 0.8 && entries.length > 0) {
        const [key, entry] = entries.shift()!;
        this.cache.delete(key);
        currentSize -= entry.size;
      }
    }
  }
}
```

## Network Performance Optimization

### 1. Service Worker Implementation
```typescript
// service-worker.ts
const CACHE_NAME = 'weather-app-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // API requests - network first with cache fallback
  if (request.url.includes('api.open-meteo.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(API_CACHE)
            .then(cache => {
              // Cache successful responses for 10 minutes
              cache.put(request, responseClone);
              setTimeout(() => cache.delete(request), 10 * 60 * 1000);
            });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets - cache first
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }
});
```

### 2. HTTP/2 Optimization
```typescript
// Resource hints for HTTP/2 push
const ResourceHints: React.FC = () => (
  <Helmet>
    {/* HTTP/2 Server Push hints */}
    <link rel="preload" href="/api/weather/current" as="fetch" crossOrigin="anonymous" />
    <link rel="preload" href="/css/critical.css" as="style" />
    <link rel="preload" href="/js/app.bundle.js" as="script" />

    {/* Connection optimization */}
    <link rel="preconnect" href="https://api.open-meteo.com" />
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  </Helmet>
);
```

## Memory Management

### 1. Memory Leak Prevention
```typescript
// Cleanup hooks
const useAsyncEffect = (asyncFn: () => Promise<void>, deps: any[]) => {
  useEffect(() => {
    let cancelled = false;

    const runAsync = async () => {
      try {
        await asyncFn();
      } catch (error) {
        if (!cancelled) {
          console.error('Async effect error:', error);
        }
      }
    };

    runAsync();

    return () => {
      cancelled = true;
    };
  }, deps);
};

// WeakMap for component references
const componentCache = new WeakMap();

const useComponentCache = <T>(component: React.ComponentType<T>) => {
  return useMemo(() => {
    if (componentCache.has(component)) {
      return componentCache.get(component);
    }

    const memoized = React.memo(component);
    componentCache.set(component, memoized);
    return memoized;
  }, [component]);
};

// Event listener cleanup
const useEventListener = (
  eventName: string,
  handler: (event: Event) => void,
  element: EventTarget = window
) => {
  const savedHandler = useRef<(event: Event) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current?.(event);
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};
```

### 2. Efficient Data Structures
```typescript
// Immutable updates with structural sharing
import { produce } from 'immer';

const weatherReducer = (state: WeatherState, action: WeatherAction): WeatherState => {
  return produce(state, draft => {
    switch (action.type) {
      case 'UPDATE_WEATHER':
        draft.current = action.payload.weather;
        draft.lastUpdated = action.payload.timestamp;
        break;

      case 'UPDATE_FORECAST':
        // Only update changed items
        action.payload.forecast.forEach((item, index) => {
          if (!draft.forecast[index] ||
              draft.forecast[index].date !== item.date) {
            draft.forecast[index] = item;
          }
        });
        break;
    }
  });
};

// Object pooling for frequently created objects
class ObjectPool<T> {
  private available: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void) {
    this.createFn = createFn;
    this.resetFn = resetFn;
  }

  get(): T {
    return this.available.pop() || this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.available.push(obj);
  }
}

// Usage for weather data objects
const weatherDataPool = new ObjectPool(
  () => ({ temperature: 0, humidity: 0, condition: '', time: new Date() }),
  (obj) => {
    obj.temperature = 0;
    obj.humidity = 0;
    obj.condition = '';
    obj.time = new Date();
  }
);
```

## Performance Monitoring

### 1. Real User Monitoring (RUM)
```typescript
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver;

  constructor() {
    this.setupObserver();
    this.setupWebVitals();
  }

  private setupObserver() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: entry.name,
          type: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
          timestamp: Date.now()
        });
      }
    });

    this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  }

  private setupWebVitals() {
    // Core Web Vitals monitoring
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.onWebVital);
      getFID(this.onWebVital);
      getFCP(this.onWebVital);
      getLCP(this.onWebVital);
      getTTFB(this.onWebVital);
    });
  }

  private onWebVital = (metric: any) => {
    this.recordMetric({
      name: metric.name,
      type: 'web-vital',
      value: metric.value,
      timestamp: Date.now()
    });
  };

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Send to analytics (debounced)
    this.debouncedSend();
  }

  private debouncedSend = debounce(() => {
    this.sendMetrics();
  }, 5000);

  private async sendMetrics() {
    if (this.metrics.length === 0) return;

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify({ metrics: this.metrics }),
        headers: { 'Content-Type': 'application/json' }
      });

      this.metrics = [];
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();
```

### 2. Custom Performance Hooks
```typescript
const usePerformanceTracking = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const mountTime = useRef<number>();

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const lifecycleTime = unmountTime - (mountTime.current || 0);

      // Track component lifecycle performance
      analytics.track('component_lifecycle', {
        component: componentName,
        mountTime: mountTime.current,
        lifecycleTime
      });
    };
  }, [componentName]);

  const trackRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const trackRenderComplete = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      analytics.track('component_render', {
        component: componentName,
        renderTime
      });
    }
  }, [componentName]);

  return { trackRender, trackRenderComplete };
};

// Usage in components
const WeatherDashboard: React.FC = () => {
  const { trackRender, trackRenderComplete } = usePerformanceTracking('WeatherDashboard');

  useLayoutEffect(() => {
    trackRender();
  });

  useEffect(() => {
    trackRenderComplete();
  });

  return (
    <div className="weather-dashboard">
      {/* Component content */}
    </div>
  );
};
```

This comprehensive performance optimization strategy ensures the weather application delivers excellent user experience with fast loading times, smooth interactions, and efficient resource usage.