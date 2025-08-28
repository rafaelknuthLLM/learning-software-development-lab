# Anthropic API Integration Debugging Resolution

## Issue Summary
The FACT system was experiencing authentication and API integration errors when trying to use Anthropic Claude models through LiteLLM. This document outlines the root causes identified and solutions implemented.

## Root Causes Identified

### 1. LiteLLM Import Error
**Error**: `module aiohttp has no attribute ConnectionTimeoutError`
**Cause**: LiteLLM was attempting to access `aiohttp.ConnectionTimeoutError` which doesn't exist in the public API
**Impact**: Complete system failure during initialization

### 2. Duplicate Property Decorator
**Error**: `'property' object is not callable`
**Cause**: Duplicate `@property` decorators on the `claude_model` method in `src/core/config.py`
**Impact**: Configuration validation failures

### 3. Anthropic API Message Format
**Error**: `Unexpected role "system". The Messages API accepts a top-level 'system' parameter, not "system" as an input message role.`
**Cause**: System prompt was being passed incorrectly in the messages array instead of as a separate parameter
**Impact**: All LLM calls failing with 400 errors

### 4. Missing Import Dependencies
**Error**: `NameError: name 'ArcadeClient' is not defined`
**Cause**: Missing import for ArcadeClient in the tools executor module
**Impact**: Import failures preventing system initialization

## Solutions Implemented

### 1. Replaced LiteLLM with Direct Anthropic SDK
**Change**: Switched from LiteLLM to direct Anthropic SDK usage in `src/core/driver.py`
**Reason**: Eliminated the aiohttp compatibility issues and provided better control over API calls
**Files Modified**:
- `src/core/driver.py`: Updated imports and API call methods
- `.env`: Updated model name to `claude-3-haiku-20240307`
- `src/core/config.py`: Updated default model name

### 2. Fixed Configuration Property Issues
**Change**: Removed duplicate `@property` decorator from `claude_model` method
**Files Modified**:
- `src/core/config.py`: Line 113-114 fixed

### 3. Corrected Anthropic API Usage
**Change**: Updated API call to use `system` parameter instead of system role in messages
**Implementation**:
```python
# Before (incorrect)
formatted_messages = [
    {"role": "system", "content": self.config.system_prompt},
    *messages
]
response = client.messages.create(messages=formatted_messages, ...)

# After (correct)
response = client.messages.create(
    system=self.config.system_prompt,
    messages=messages,
    ...
)
```

### 4. Fixed Import Dependencies
**Change**: Added proper imports for ArcadeClient in both relative and absolute import sections
**Files Modified**:
- `src/tools/executor.py`: Added ArcadeClient imports

### 5. Updated Package Versions
**Change**: Upgraded aiohttp and other dependencies to compatible versions
**Packages Updated**:
- `aiohttp`: 3.9.5 → 3.11.18
- `anthropic`: 0.19.1 → 0.52.0
- `litellm`: 1.0.0 → 1.71.0 (later replaced with direct SDK)

## Verified Working Configuration

### Model Names (2025)
- ✅ `claude-3-haiku-20240307` (currently used)
- ✅ `claude-3-sonnet-20240229`
- ✅ `claude-3-opus-20240229`

### API Integration
- ✅ Direct Anthropic SDK usage
- ✅ Proper system prompt parameter usage
- ✅ Correct message format for conversations
- ✅ Error handling and graceful degradation

### Test Results
```
✅ Driver initialized successfully
✅ LLM connection test passed
✅ Query processed successfully
Response: 2 + 2 = 4.
```

## Lessons Learned

1. **Direct SDK vs. Abstraction Libraries**: While LiteLLM provides useful abstractions, using the direct Anthropic SDK offered better compatibility and control
2. **API Format Changes**: Anthropic's API evolved to require system prompts as separate parameters, not message roles
3. **Version Compatibility**: Always ensure dependency versions are compatible, especially for async libraries like aiohttp
4. **Property Decorators**: Python property decorators should not be duplicated and can cause cryptic errors
5. **Import Dependencies**: Complex module hierarchies require careful import management for all dependencies

## Future Maintenance

1. **Model Updates**: Monitor Anthropic's documentation for new model names and API changes
2. **Dependency Management**: Keep dependencies updated but test thoroughly after updates
3. **Error Handling**: The current implementation includes proper error classification and graceful degradation
4. **Monitoring**: Log analysis shows successful query processing with proper latency tracking

## Key Files Modified

- `src/core/driver.py` - API integration fixes
- `src/core/config.py` - Property decorator and model name fixes  
- `src/tools/executor.py` - Import dependency fixes
- `.env` - Model name configuration update

## Testing Commands

To verify the fixes:
```bash
cd /workspaces/FACT
python -c "
import asyncio
from src.core.driver import get_driver

async def test_driver():
    driver = await get_driver()
    response = await driver.process_query('What is 2 + 2?')
    print(f'Response: {response}')

asyncio.run(test_driver())
"
```

Expected output: `Response: 2 + 2 = 4.`