# FACT System - User Guide

## Getting Started

This guide provides practical examples and workflows for using FACT effectively. Whether you're a financial analyst, data scientist, or developer, you'll find step-by-step instructions for common tasks.

## Basic Usage

### Starting FACT

#### Interactive CLI Mode
```bash
# Start the interactive command-line interface
python main.py cli

# You'll see the FACT prompt:
FACT> 
```

#### Single Query Mode
```bash
# Execute a single query and exit
python main.py cli --query "What companies are in the technology sector?"
```

#### Demo Mode
```bash
# Run demonstration with sample queries
python main.py demo
```

### Your First Query

Let's start with a simple query to get familiar with FACT:

```
FACT> What companies are in our database?
```

**Expected Response:**
```
I found 5 companies in the database:

1. TechCorp (TECH) - Technology sector
2. HealthPlus (HLTH) - Healthcare sector  
3. FinanceFirst (FINF) - Finance sector
4. EnergyPro (ENRG) - Energy sector
5. RetailMax (RETL) - Retail sector

Each company has financial data for multiple quarters. Would you like to explore specific company details or financial metrics?
```

## Essential Commands

### CLI Navigation

```bash
# Show help and available commands
FACT> help

# Display system status
FACT> status

# List available tools
FACT> tools

# Show database schema
FACT> schema

# View sample queries
FACT> samples

# Check performance metrics
FACT> metrics

# Exit the system
FACT> exit
```

### System Information Queries

```bash
# Check what data is available
FACT> What data do you have access to?

# Get sample queries to try
FACT> What are some example queries I can try?

# Check system performance
FACT> How is the system performing?

# View cache statistics
FACT> What's the current cache hit rate?
```

## Financial Data Queries

### Company Information

#### Basic Company Queries
```bash
# Get all companies
FACT> Show me all companies

# Companies by sector
FACT> What companies are in the technology sector?

# Company details
FACT> Tell me about TechCorp

# Companies by size
FACT> Which companies have more than 1000 employees?
```

#### Advanced Company Queries
```bash
# Market capitalization analysis
FACT> Show me companies ranked by market cap

# Company founding timeline
FACT> List companies founded after 2010

# Sector distribution
FACT> How many companies are in each sector?

# Employee statistics
FACT> What's the average number of employees per sector?
```

### Financial Performance Queries

#### Revenue Analysis
```bash
# Single company revenue
FACT> What was TechCorp's Q1 2025 revenue?

# Revenue comparison
FACT> Compare Q1 2025 revenue across all companies

# Revenue trends
FACT> Show me quarterly revenue trends for 2024

# Top performers
FACT> Which company had the highest revenue in Q1 2025?
```

#### Profitability Analysis
```bash
# Profit margins
FACT> What's TechCorp's profit margin for Q1 2025?

# Profit comparison
FACT> Compare profit margins across technology companies

# Most profitable companies
FACT> Which companies have the highest profit margins?

# Profitability trends
FACT> How have profit margins changed over time?
```

#### Financial Ratios and KPIs
```bash
# Revenue growth
FACT> What's the revenue growth rate for TechCorp?

# Sector performance
FACT> Which sector has the best financial performance?

# Expense analysis
FACT> Show me the expense breakdown for Q1 2025

# ROI calculations
FACT> Calculate return on investment for each company
```

## Advanced Query Patterns

### Comparative Analysis

#### Cross-Company Comparisons
```bash
# Performance benchmarking
FACT> Compare TechCorp and HealthPlus financial performance

# Sector leaders
FACT> Who are the top 3 companies in each sector by revenue?

# Market share analysis
FACT> What's each company's market share by revenue?

# Growth comparison
FACT> Which companies have the highest growth rates?
```

#### Time-Series Analysis
```bash
# Quarterly trends
FACT> Show me quarterly revenue trends for the past year

# Year-over-year growth
FACT> Compare 2024 vs 2023 financial performance

# Seasonal patterns
FACT> Are there seasonal patterns in our financial data?

# Long-term trends
FACT> What are the long-term growth trends by sector?
```

### Data Exploration

#### Schema Discovery
```bash
# Understand data structure
FACT> What tables and columns are available?

# Data quality assessment
FACT> How complete is our financial data?

# Data coverage
FACT> What time periods do we have data for?

# Missing data analysis
FACT> Are there any gaps in the financial data?
```

#### Statistical Analysis
```bash
# Descriptive statistics
FACT> Give me summary statistics for revenue data

# Distribution analysis
FACT> What's the distribution of market cap across companies?

# Correlation analysis
FACT> Is there correlation between company size and profitability?

# Outlier detection
FACT> Are there any unusual values in the financial data?
```

## Workflow Examples

### Financial Analyst Workflow

#### Monthly Report Generation
```bash
# 1. Get latest quarter results
FACT> What are the Q1 2025 results for all companies?

# 2. Identify top performers
FACT> Which companies exceeded revenue expectations?

# 3. Analyze sector trends
FACT> How did each sector perform in Q1 2025?

# 4. Calculate key metrics
FACT> What are the key financial ratios for Q1 2025?

# 5. Generate summary
FACT> Give me an executive summary of Q1 2025 performance
```

#### Investment Research
```bash
# 1. Company screening
FACT> Find companies with revenue growth > 10%

# 2. Financial health check
FACT> What's the debt-to-equity ratio for technology companies?

# 3. Valuation analysis
FACT> Calculate price-to-earnings ratios

# 4. Risk assessment
FACT> Which companies have volatile earnings?

# 5. Recommendation
FACT> Based on financials, which companies look promising?
```

### Data Scientist Workflow

#### Exploratory Data Analysis
```bash
# 1. Data overview
FACT> Describe the structure and contents of our dataset

# 2. Data quality
FACT> Check for missing values and data quality issues

# 3. Statistical summary
FACT> Provide statistical summaries for all numeric columns

# 4. Correlation analysis
FACT> What correlations exist between financial metrics?

# 5. Visualization prep
FACT> What would be good visualizations for this data?
```

#### Predictive Modeling Prep
```bash
# 1. Feature selection
FACT> What features would be good predictors of revenue?

# 2. Data preparation
FACT> How should I prepare this data for machine learning?

# 3. Historical patterns
FACT> What historical patterns can help predict future performance?

# 4. Model validation
FACT> What would be good validation approaches for this data?
```

## Performance Optimization

### Using Cache Effectively

#### Cache Warming
```bash
# Pre-load common queries
FACT> What are the most common financial queries?

# The system will cache responses for faster future access
```

#### Cache Status Monitoring
```bash
# Check cache performance
FACT> metrics

# Look for:
# - Cache hit rate (target: >80%)
# - Response times (target: <100ms)
# - Cost savings (target: >70%)
```

### Query Optimization Tips

#### Efficient Query Patterns
```bash
# Good: Specific queries
FACT> What was TechCorp's Q1 2025 revenue?

# Better: Batch similar queries
FACT> Show me Q1 2025 revenue for all technology companies

# Best: Use cached common queries
FACT> Show me the quarterly summary dashboard
```

#### Avoiding Slow Queries
```bash
# Avoid: Very broad queries
FACT> Tell me everything about all companies

# Better: Focused queries
FACT> Give me key metrics for technology companies

# Best: Specific analysis
FACT> Compare Q1 2025 revenue growth rates
```

## Error Handling and Troubleshooting

### Common Error Scenarios

#### Query Format Issues
```bash
# Problem: Ambiguous query
FACT> Show me stuff

# Solution: Be specific
FACT> Show me company revenue data
```

#### Data Availability Issues
```bash
# Problem: Requesting unavailable data
FACT> What's the 2030 revenue forecast?

# Response: "I don't have forecast data for 2030. I can show you historical data through Q1 2025."
```

#### System Issues
```bash
# Problem: API or database errors
# Response: "I'm experiencing technical difficulties. Trying cached responses..."

# Recovery: System automatically retries and uses fallbacks
```

### Getting Help

#### Built-in Help
```bash
# General help
FACT> help

# Query suggestions
FACT> What can I ask you about?

# System status
FACT> status

# Performance check
FACT> How are you performing?
```

#### Troubleshooting Commands
```bash
# Validate system
python main.py validate

# Check logs
tail -f logs/fact.log

# Reset cache
python main.py --reset-cache

# Restart system
python main.py cli --fresh-start
```

## Best Practices

### Query Writing

#### Clear and Specific
```bash
# Good
FACT> What was TechCorp's revenue in Q1 2025?

# Better
FACT> Compare TechCorp's Q1 2025 revenue to Q1 2024

# Best
FACT> Show me TechCorp's quarterly revenue trend and growth rate
```

#### Natural Language Tips
- Use company names exactly as they appear in the database
- Specify time periods clearly (Q1 2025, 2024, etc.)
- Ask for specific metrics rather than general information
- Break complex questions into simpler parts

### Performance Best Practices

#### Session Management
- Keep sessions active to benefit from cache warming
- Use `status` command to monitor system health
- Exit cleanly with `exit` command

#### Query Patterns
- Start with broad queries, then drill down
- Use cache-friendly repeated patterns
- Batch related queries in a session

#### Resource Usage
- Monitor memory usage with `metrics` command
- Clear cache if performance degrades
- Restart sessions for long-running analysis

## Integration Examples

### Programmatic Usage

#### Python Script Example
```python
from src.core.driver import get_driver
import asyncio

async def analyze_company(company_name):
    driver = await get_driver()
    
    # Get basic info
    info = await driver.process_query(f"Tell me about {company_name}")
    
    # Get financial metrics
    metrics = await driver.process_query(
        f"What are {company_name}'s key financial metrics?"
    )
    
    # Cleanup
    await driver.shutdown()
    
    return {"info": info, "metrics": metrics}

# Run analysis
result = asyncio.run(analyze_company("TechCorp"))
print(result)
```

#### API Integration
```bash
# REST API call example
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "query": "What was Q1 2025 revenue for TechCorp?",
    "user_id": "analyst@company.com"
  }'
```

## Next Steps

Now that you're familiar with basic usage:

1. **Explore Advanced Features**: Check [Advanced Usage Guide](7_advanced_usage.md)
2. **API Development**: Review [API Reference](5_api_reference.md)
3. **Performance Tuning**: See [Performance Optimization](docs/performance-optimization.md)
4. **Security**: Read [Security Best Practices](docs/security-guidelines.md)

---

**Ready for advanced features?** Continue to the [API Reference](5_api_reference.md) for programmatic integration.