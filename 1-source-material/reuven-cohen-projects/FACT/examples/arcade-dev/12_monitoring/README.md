# Monitoring Example

This example demonstrates comprehensive monitoring and observability for Arcade.dev integration with the FACT SDK.

## Features

- **System Monitoring**: CPU, memory, disk, and network metrics
- **API Health Checks**: Arcade.dev API availability and performance
- **Performance Tracking**: Response times and throughput metrics
- **Alert Management**: Configurable thresholds and notifications
- **Telemetry Collection**: Metrics aggregation and export
- **Real-time Dashboard**: Live system status and analytics

## Monitoring Components

### SystemMonitor
Tracks system resources:
- CPU usage percentage
- Memory utilization
- Disk space monitoring
- Network I/O statistics
- Load average tracking

### ArcadeAPIMonitor
Monitors API operations:
- Health check endpoints
- Operation-specific testing
- Response time tracking
- Error rate monitoring
- Service availability

### AlertManager
Manages alerts and notifications:
- Configurable thresholds
- Severity levels (info, warning, critical)
- Alert resolution tracking
- Notification callbacks
- Alert history and analytics

### TelemetryCollector
Collects and exports metrics:
- Time-series data collection
- Metrics buffering and aggregation
- Export in multiple formats
- Real-time data streaming

## Key Metrics

### Performance Metrics
- **Response Time**: API call latency
- **Throughput**: Requests per second
- **Error Rate**: Failed operations percentage
- **Cache Hit Rate**: Cache effectiveness
- **Resource Usage**: System utilization

### Health Indicators
- **Service Status**: healthy, degraded, unhealthy
- **Availability**: Uptime percentage
- **SLA Compliance**: Performance against targets
- **Capacity Planning**: Resource trend analysis

## Configuration

Monitoring can be customized:

```python
config = MonitoringConfig(
    health_check_interval_seconds=30,
    cpu_usage_threshold=80.0,
    memory_usage_threshold=85.0,
    response_time_threshold_ms=5000,
    error_rate_threshold=0.05,  # 5%
    enable_alerting=True
)
```

## Usage

```python
from arcade_monitoring import ArcadeMonitoringDashboard, MonitoringConfig

# Configure monitoring
config = MonitoringConfig(
    health_check_interval_seconds=30,
    enable_alerting=True,
    cpu_usage_threshold=75.0
)

# Create dashboard
dashboard = ArcadeMonitoringDashboard(config)

# Start monitoring
await dashboard.start_monitoring()

# Get real-time data
data = dashboard.get_dashboard_data()
print(f"System CPU: {data['system_metrics']['cpu_usage_percent']:.1f}%")
print(f"API Response: {data['performance_metrics']['avg_api_response_time']:.1f}ms")

# Stop monitoring
await dashboard.stop_monitoring()
```

## Alert Types

### System Alerts
- High CPU usage (>80%)
- High memory usage (>85%)
- Low disk space (<10%)
- High load average

### API Alerts
- Slow response times (>5s)
- High error rates (>5%)
- Service unavailability
- Rate limit exceeded

### Performance Alerts
- Cache hit rate below threshold
- Request queue backup
- Timeout increases
- SLA violations

## Dashboard Features

### Real-time Display
```
🖥️  ARCADE.DEV MONITORING DASHBOARD
============================================================

📊 System Metrics:
   CPU Usage: 45.2%
   Memory Usage: 67.8%
   Disk Usage: 34.1%
   Load Average: 1.23

⚡ Performance:
   Avg System Response: 12.3ms
   Avg API Response: 234.5ms

🚨 Alerts:
   Active: 0
   Last Hour: 2
   Last Day: 15
```

### Historical Analysis
- Trend analysis over time
- Performance regression detection
- Capacity planning data
- SLA compliance reporting

## Running the Example

```bash
cd examples/arcade-dev/08_monitoring
python arcade_monitoring.py
```

The demo will show:
1. Monitoring system startup
2. Real-time metrics collection
3. Health check execution
4. Alert generation (simulated)
5. Performance analytics
6. Dashboard display updates

## Integration Points

### FACT SDK Components
- [`CacheManager`](../../../src/cache/manager.py) - Cache performance monitoring
- [`MetricsCollector`](../../../src/monitoring/metrics.py) - Core metrics collection
- [`PerformanceOptimizer`](../../../src/monitoring/performance_optimizer.py) - Performance tuning

### External Services
- **Prometheus**: Metrics export and storage
- **Grafana**: Visualization and alerting
- **PagerDuty**: Alert notification
- **ELK Stack**: Log aggregation and analysis

## Monitoring Best Practices

1. **Set Realistic Thresholds**: Based on baseline performance
2. **Monitor Leading Indicators**: Not just lagging metrics
3. **Implement Gradual Alerts**: Info → Warning → Critical
4. **Regular Baseline Updates**: Adjust thresholds as system evolves
5. **Alert Fatigue Prevention**: Avoid too many low-priority alerts
6. **Comprehensive Coverage**: System, application, and business metrics
7. **Incident Response**: Clear escalation procedures

## Performance Optimization

The monitoring system helps identify:
- **Bottlenecks**: Slow operations and resource constraints
- **Inefficiencies**: Poor cache usage or redundant calls
- **Scaling Needs**: When to add resources
- **Error Patterns**: Recurring issues requiring fixes

## Security Monitoring

Additional security-focused monitoring:
- Failed authentication attempts
- Unusual access patterns
- Permission violations
- Data access anomalies
- Rate limiting triggers

## Scaling Considerations

For high-volume environments:
- **Metrics Sampling**: Reduce data volume
- **Distributed Monitoring**: Multiple monitoring nodes
- **Async Processing**: Non-blocking metrics collection
- **Data Retention**: Archive old metrics
- **Query Optimization**: Efficient dashboard queries