# Error Handling Strategy

## Error Classification and Handling

### 1. Error Categories

#### Network Errors
- **Connection timeouts**
- **Network unavailability**
- **DNS resolution failures**
- **SSL/TLS handshake failures**

#### API Errors
- **HTTP 4xx Client Errors**
  - 400: Bad Request (malformed parameters)
  - 404: Not Found (invalid endpoint)
  - 429: Too Many Requests (rate limiting)
- **HTTP 5xx Server Errors**
  - 500: Internal Server Error
  - 502: Bad Gateway
  - 503: Service Unavailable

#### Data Validation Errors
- **Invalid city names**
- **Empty search queries**
- **Special character handling**
- **Malformed API responses**

#### Application Errors
- **State management failures**
- **Component rendering errors**
- **Browser compatibility issues**
- **Memory/storage limitations**

### 2. Error Handling Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Error Boundary │───▶│  Error Handler   │───▶│  Error Recovery │
│  (React)        │    │  (Global)        │    │  (Strategies)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  UI Feedback    │    │  Logging         │    │  Retry Logic    │
│  (User)         │    │  (Monitoring)    │    │  (Automated)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 3. Global Error Handler Implementation

```typescript
class GlobalErrorHandler {
  private logger: Logger;
  private retryManager: RetryManager;
  private notificationService: NotificationService;

  constructor() {
    this.setupErrorListeners();
  }

  private setupErrorListeners() {
    // Unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandled-promise');
      event.preventDefault();
    });

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'javascript-error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  handleError(error: Error, context: string, metadata?: any): ErrorResponse {
    const errorInfo = this.classifyError(error);

    // Log error for monitoring
    this.logger.error(errorInfo.type, {
      error: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Determine recovery strategy
    const recovery = this.getRecoveryStrategy(errorInfo);

    // Notify user if necessary
    if (recovery.notifyUser) {
      this.notificationService.show({
        type: errorInfo.severity,
        message: this.getUserFriendlyMessage(errorInfo),
        actions: recovery.actions
      });
    }

    return {
      handled: true,
      recovery,
      errorInfo
    };
  }

  private classifyError(error: Error): ErrorInfo {
    if (error instanceof NetworkError) {
      return {
        type: 'network',
        severity: 'warning',
        recoverable: true,
        retryable: true
      };
    }

    if (error instanceof ApiError) {
      return {
        type: 'api',
        severity: error.status >= 500 ? 'error' : 'warning',
        recoverable: error.status < 500,
        retryable: error.status >= 500 || error.status === 429
      };
    }

    if (error instanceof ValidationError) {
      return {
        type: 'validation',
        severity: 'info',
        recoverable: true,
        retryable: false
      };
    }

    return {
      type: 'unknown',
      severity: 'error',
      recoverable: false,
      retryable: false
    };
  }

  private getRecoveryStrategy(errorInfo: ErrorInfo): RecoveryStrategy {
    switch (errorInfo.type) {
      case 'network':
        return {
          strategy: 'retry',
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          notifyUser: true,
          actions: ['retry', 'offline-mode']
        };

      case 'api':
        if (errorInfo.retryable) {
          return {
            strategy: 'retry',
            maxAttempts: 2,
            backoffStrategy: 'linear',
            notifyUser: true,
            actions: ['retry', 'try-different-city']
          };
        }
        return {
          strategy: 'fallback',
          fallbackAction: 'show-cached-data',
          notifyUser: true,
          actions: ['try-again-later']
        };

      case 'validation':
        return {
          strategy: 'user-correction',
          notifyUser: true,
          actions: ['fix-input', 'show-examples']
        };

      default:
        return {
          strategy: 'graceful-degradation',
          notifyUser: true,
          actions: ['reload-page', 'contact-support']
        };
    }
  }

  private getUserFriendlyMessage(errorInfo: ErrorInfo): string {
    const messages = {
      network: "We're having trouble connecting to the weather service. Please check your internet connection and try again.",
      api: "The weather service is temporarily unavailable. Please try again in a few moments.",
      validation: "Please enter a valid city name to get weather information.",
      unknown: "Something unexpected happened. Please refresh the page and try again."
    };

    return messages[errorInfo.type] || messages.unknown;
  }
}
```

### 4. Component-Level Error Boundaries

```typescript
class WeatherErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorInfo: {
        error,
        timestamp: new Date(),
        componentStack: ''
      }
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo: {
        error,
        timestamp: new Date(),
        componentStack: errorInfo.componentStack
      }
    });

    // Report to error handling service
    GlobalErrorHandler.getInstance().handleError(error, 'react-component', {
      componentStack: errorInfo.componentStack,
      component: this.props.componentName
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.errorInfo?.error}
          onRetry={() => this.setState({ hasError: false, errorInfo: null })}
          onReport={() => this.reportError()}
        />
      );
    }

    return this.props.children;
  }
}
```

### 5. API Error Handling Patterns

```typescript
class WeatherApiService {
  async getWeather(cityName: string): Promise<WeatherData> {
    try {
      const result = await this.makeApiCall(cityName);
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 404:
            throw new CityNotFoundError(cityName);
          case 429:
            throw new RateLimitError('Too many requests. Please wait a moment.');
          case 500:
          case 502:
          case 503:
            throw new ServiceUnavailableError('Weather service is temporarily down.');
          default:
            throw new UnknownApiError('An unexpected error occurred.');
        }
      }

      if (error instanceof NetworkError) {
        throw new ConnectionError('Unable to connect to weather service.');
      }

      throw error;
    }
  }

  private async makeApiCall(cityName: string): Promise<WeatherData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(this.buildUrl(cityName), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
      }

      const data = await response.json();
      return this.transformData(data);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new NetworkError('Request timed out');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }

      throw error;
    }
  }
}
```

### 6. User Experience Error States

#### Loading States
```typescript
const LoadingStates = {
  idle: 'Ready to search',
  loading: 'Getting weather data...',
  retrying: 'Retrying connection...',
  error: 'Something went wrong',
  offline: 'Working offline'
};
```

#### Error UI Components
```typescript
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onDismiss }) => {
  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network': return <WifiOffIcon />;
      case 'api': return <CloudOffIcon />;
      case 'validation': return <WarningIcon />;
      default: return <ErrorIcon />;
    }
  };

  return (
    <div className="error-display" role="alert">
      {getErrorIcon(error.type)}
      <div className="error-content">
        <h3>{error.title}</h3>
        <p>{error.message}</p>
        <div className="error-actions">
          {error.retryable && (
            <button onClick={onRetry} className="retry-button">
              Try Again
            </button>
          )}
          <button onClick={onDismiss} className="dismiss-button">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 7. Offline Support Strategy

```typescript
class OfflineManager {
  private cache: Map<string, WeatherData> = new Map();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.setupOfflineListeners();
    this.loadCachedData();
  }

  private setupOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOfflineMode();
    });
  }

  async getWeather(cityName: string): Promise<WeatherData> {
    if (this.isOnline) {
      try {
        const data = await this.fetchFreshData(cityName);
        this.cache.set(cityName, data);
        return data;
      } catch (error) {
        // Fall back to cache if online request fails
        const cachedData = this.cache.get(cityName);
        if (cachedData) {
          this.notifyCachedDataUsed();
          return cachedData;
        }
        throw error;
      }
    } else {
      const cachedData = this.cache.get(cityName);
      if (cachedData) {
        this.notifyOfflineData();
        return cachedData;
      }
      throw new OfflineError('No cached data available for this city.');
    }
  }
}
```

### 8. Error Recovery Actions

#### Automatic Recovery
- **Retry with exponential backoff**
- **Circuit breaker pattern**
- **Fallback to cached data**
- **Graceful degradation**

#### User-Initiated Recovery
- **Manual retry button**
- **Clear cache and retry**
- **Switch to different city**
- **Refresh application**

### 9. Error Monitoring and Logging

```typescript
interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  type: string;
  message: string;
  stack?: string;
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId: string;
  };
  metadata?: any;
}

class ErrorLogger {
  private buffer: ErrorLogEntry[] = [];
  private maxBufferSize: number = 100;

  log(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: ErrorLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry
    };

    this.buffer.push(logEntry);

    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Send to monitoring service (debounced)
    this.debouncedSend();
  }

  private debouncedSend = debounce(() => {
    this.sendToMonitoring();
  }, 5000);

  private async sendToMonitoring(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: [...this.buffer] })
      });

      this.buffer.length = 0;
    } catch (error) {
      // Failed to send logs - they'll be retried on next batch
      console.warn('Failed to send error logs:', error);
    }
  }
}
```

This comprehensive error handling strategy ensures that users have a smooth experience even when things go wrong, with appropriate feedback and recovery options for different types of errors.