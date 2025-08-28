# Basic Arcade.dev Integration Example

This example demonstrates how to integrate with Arcade.dev's tool calling platform using the official Python SDK within the FACT framework.

## Overview

Arcade.dev is a tool calling platform that enables AI agents to securely perform real-world actions through pre-built integrations. This example shows:

- Real API integration using the official `arcadepy` SDK
- Demo mode with realistic mock responses when no API key is available
- FACT cache integration for performance optimization
- Robust error handling and retry logic
- Async/await patterns for non-blocking operations

## Prerequisites

1. **Install Dependencies**:
   ```bash
   pip install arcadepy python-dotenv
   ```

2. **Optional: Get Arcade.dev API Key**:
   - Visit [Arcade.dev](https://www.arcade.dev) to sign up
   - Generate an API key from your dashboard
   - Set environment variables (see Configuration section)

## Configuration

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Required for real API calls
ARCADE_API_KEY=your_actual_api_key_here

# Optional configuration
ARCADE_USER_ID=your@email.com
ARCADE_TIMEOUT=30
ARCADE_MAX_RETRIES=3
```

### Demo Mode

If no `ARCADE_API_KEY` is provided (or it's invalid/placeholder), the example automatically runs in demo mode with realistic mock responses.

## Usage

### Run the Example

```bash
cd examples/arcade-dev/01_basic_integration
python basic_arcade_client.py
```

### Expected Output

**Demo Mode** (no API key):
```
🎮 Arcade.dev Python SDK Integration Example
==================================================
🎭 Demo Mode: No API key found - using mock responses
💡 To use real API: Set ARCADE_API_KEY environment variable

🔍 Checking API health...
🎭 API Status: healthy
   (Demo response)

👤 Getting user information...
🎭 User: demo@example.com
   Tools available: 100
   Quota remaining: 95
   (Demo response)

🛠️  Listing available tools...
🎭 Found 3 tools
   (Demo response)

📋 Available Tools:
  1. Math.Sqrt - Calculate square root of a number
  2. Google.ListEmails - List emails from Gmail
  3. Slack.PostMessage - Post message to Slack channel

🔧 Tool Execution Examples:

1. Math.Sqrt - Calculate square root of 625...
🎭 Status: completed
   Result: √625 = 25.0
   Execution time: 150ms
   (Demo response)

2. Google.ListEmails - List 3 emails...
🎭 Status: completed
   Found 3 emails
   1. Demo Email 1 from sender1@example.com
   2. Demo Email 2 from sender2@example.com
   Execution time: 1200ms
   (Demo response)

==================================================
🎭 Basic integration example completed successfully in demo mode!
💡 To test with real API, set ARCADE_API_KEY environment variable
📖 Learn more: https://docs.arcade.dev
```

**Real API Mode** (with valid API key):
```
🎮 Arcade.dev Python SDK Integration Example
==================================================
🔑 Using API key: arc_o1JbtH...
👤 User ID: demo@example.com

🔍 Checking API health...
✅ API Status: healthy

👤 Getting user information...
✅ User: demo@example.com

🛠️  Listing available tools...
✅ Found 0 tools

🔧 Tool Execution Examples:

1. Math.Sqrt - Calculate square root of 625...
✅ Status: success
   Execution time: Nonems

2. Google.ListEmails - List 3 emails...
✅ Status: success
   Execution time: Nonems

==================================================
🎉 Basic integration example completed successfully!
📖 Learn more: https://docs.arcade.dev
```

## Code Structure

### Key Components

1. **ArcadeConfig**: Configuration dataclass for API settings
2. **BasicArcadeClient**: Main client class with async context manager support
3. **FACT Integration**: Cache manager integration for performance
4. **Demo Mode**: Mock responses for testing without API credentials

### Key Features

- **Automatic Demo Mode**: Detects missing/invalid API keys and uses mock data
- **Caching**: FACT cache integration for improved performance
- **Retry Logic**: Exponential backoff for failed requests
- **Error Handling**: Comprehensive exception handling with informative messages
- **Async Support**: Full async/await pattern implementation

## Integration with FACT

This example demonstrates several FACT framework patterns:

1. **Import Helper**: Uses `utils.import_helper` for proper module loading
2. **Cache Manager**: Integrates with FACT's caching system
3. **Logging**: Follows FACT logging conventions
4. **Configuration**: Environment-based configuration patterns

## API Endpoints Used

When running with a real API key, the example uses:

- `POST https://api.arcade-ai.com/v1/tools/execute` - Execute tools
- Health check via tool listing (no dedicated endpoint in SDK)

## Error Handling

The example includes robust error handling for:

- Missing/invalid API keys (automatic demo mode)
- Network connectivity issues (retry with exponential backoff)
- Invalid tool names or parameters (graceful error messages)
- SDK import failures (clear installation instructions)

## Security Considerations

- API keys are loaded from environment variables
- Demo mode prevents accidental real API calls
- Input validation through the official SDK
- No hardcoded credentials in source code

## Extending the Example

To add more functionality:

1. **Custom Tools**: Add more tool execution examples
2. **User Authentication**: Implement user-specific configurations
3. **Real-time Updates**: Add webhook or polling for tool status
4. **Advanced Caching**: Implement more sophisticated caching strategies

## Troubleshooting

### Common Issues

1. **Import Error**: `arcadepy not installed`
   ```bash
   pip install arcadepy
   ```

2. **API Key Issues**: Example automatically falls back to demo mode

3. **Network Issues**: Retry logic handles temporary connectivity problems

4. **Tool Not Found**: Check available tools via `list_tools()` method

### Debug Mode

Enable debug logging:
```python
logging.basicConfig(level=logging.DEBUG)
```

## References

- [Arcade.dev Official Documentation](https://docs.arcade.dev)
- [arcadepy GitHub Repository](https://github.com/ArcadeAI/arcade-ai)
- [arcadepy PyPI Package](https://pypi.org/project/arcade-ai/)
- [FACT Framework Documentation](../../docs/)