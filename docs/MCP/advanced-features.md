# MCP Advanced Features

This document covers advanced MCP capabilities to help you build more complex and intelligent applications.

## Custom Tool Implementations

Beyond basic tools, you can build more powerful custom tools.

### Complex Parameter Handling

For tools that require richer input, define custom parameter types:

```csharp
public class ComplexRequestType
{
    [Required]
    [Description("User query")]
    public string Query { get; set; }

    [Description("Maximum search depth")]
    [DefaultValue(3)]
    public int MaxDepth { get; set; }

    [Description("Whether to include historical data")]
    [DefaultValue(false)]
    public bool IncludeHistory { get; set; }

    [Description("Sort mode: relevance, date, popularity")]
    [DefaultValue("relevance")]
    public string SortBy { get; set; }

    [Description("Filter conditions with multiple tags")]
    public List<string> Tags { get; set; } = new List<string>();
}

[McpServerTool, Description("Advanced search tool with complex parameters")]
public async Task<string> AdvancedSearch(ComplexRequestType request)
{
    // Implement advanced search logic
    // ...

    return "Search results...";
}
```

### Tool Chains and Compositions

You can provide coordinated tool sets for multi-step AI workflows:

```csharp
[McpServerTool, Description("Get available data sources")]
public async Task<string> GetDataSources()
{
    // Return a list of available sources
    return "DataSource1, DataSource2, DataSource3";
}

[McpServerTool, Description("Fetch data from the specified source")]
public async Task<string> FetchData(string dataSource, string query)
{
    // Fetch data from source
    return $"Data fetched from {dataSource}: ...";
}

[McpServerTool, Description("Analyze data and generate reports")]
public async Task<string> AnalyzeData(string data, string analysisType)
{
    // Analyze data
    return "Analysis result: ...";
}
```

## Semantic Kernel Integration

MCP can be deeply integrated with Microsoft Semantic Kernel.

### Plugin Registration

Register MCP tools as Semantic Kernel plugins:

```csharp
// Build Semantic Kernel
var kernel = Kernel.CreateBuilder()
    .WithAzureOpenAIChatCompletion(
        "gpt-4o",
        new AzureOpenAIClient(
            new Uri(azureEndpoint),
            new ApiKeyCredential(apiKey)))
    .Build();

// Add functions from MCP server
await kernel.Plugins.AddMcpFunctionsFromSseServerAsync(
    "MyMcpPlugin",
    "http://localhost:5000/sse/sse");
```

### Chained Operations

You can combine MCP tools into step-based plans:

```csharp
// Create an execution plan
var plan = kernel.CreatePlan("Search data from the web, analyze it, and generate a report");

// Add plan steps
plan.AddStep("WebSpider", new Dictionary<string, object> {
    { "url", "https://example.com" },
    { "deepth", 2 },
    { "pageNumber", 10 }
});

plan.AddStep("AnalyzeData", new Dictionary<string, object> {
    { "analysisType", "sentiment" }
});

plan.AddStep("GenerateReport");

// Execute plan
var result = await plan.InvokeAsync(kernel, cancellationToken: CancellationToken.None);
```

## Custom Transport Protocols

MCP supports multiple transport options.

### HTTP Transport

The default transport uses HTTP Server-Sent Events (SSE):

```csharp
services.AddMcpServer(opt => {
    opt.ServerInfo = new Implementation() {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
})
.WithHttpTransport();
```

### Standard IO Transport

For specific scenarios, you can use stdio transport:

```csharp
services.AddMcpServer(opt => {
    opt.ServerInfo = new Implementation() {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
})
.WithStdioServerTransport();
```

### Custom Transport Implementation

You can implement your own transport:

```csharp
// Custom transport
public class CustomTransport : ITransport
{
    // Implement ITransport members
    // ...
}

// Register custom transport
services.AddMcpServer(opt => {
    // Config...
})
.AddSingleton<ITransport, CustomTransport>();
```

## Security and Authentication

Security is critical in production MCP environments.

### Token Authentication

Add token-based protection:

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapMcp("sse", async (context, options, ct) =>
    {
        // Get configured token
        var configuredToken = Senparc.Ncf.Core.Config.SiteConfig.SenparcCoreSetting.McpAccessToken;

        if (string.IsNullOrEmpty(configuredToken))
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync("MCP access token is not configured");
            return;
        }

        // Validate request token
        if (!context.Request.Query.TryGetValue("token", out var requestToken) ||
            requestToken != configuredToken)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized");
            return;
        }
    });
});
```

### CORS Configuration

For cross-origin requests, configure CORS policy:

```csharp
services.AddCors(options =>
{
    options.AddPolicy("McpCorsPolicy", builder =>
    {
        builder.WithOrigins("https://your-allowed-domain.com")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

app.UseCors("McpCorsPolicy");
```

## Performance Optimization

### Asynchronous Processing

Make sure expensive operations are asynchronous:

```csharp
[McpServerTool, Description("Process large data")]
public async Task<string> ProcessLargeData(string dataSource)
{
    // Async long-running work
    var data = await FetchLargeDataAsync(dataSource);
    var result = await ProcessDataAsync(data);
    return result;
}
```

### Response Caching

For frequently called tools with stable results, add caching:

```csharp
private static readonly MemoryCache _cache = new MemoryCache(new MemoryCacheOptions());

[McpServerTool, Description("Get cached data")]
public async Task<string> GetCachedData(string key)
{
    // Try cache first
    if (_cache.TryGetValue(key, out string cachedResult))
    {
        return cachedResult;
    }

    // Fetch fresh data
    var result = await FetchNewDataAsync(key);

    // Store in cache
    _cache.Set(key, result, TimeSpan.FromMinutes(30));

    return result;
}
```

## Monitoring and Logging

### Integrate Logging

Use NCF logging to track MCP activity:

```csharp
[McpServerTool, Description("Execute action with logging")]
public async Task<string> PerformActionWithLogging(string action)
{
    try
    {
        _logger.LogInformation($"MCP tool execution started: {action}");

        // Execute action
        var result = await ExecuteActionAsync(action);

        _logger.LogInformation($"MCP tool execution succeeded: {action}");
        return result;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"MCP tool execution failed: {action}");
        throw;
    }
}
```

### Collect Performance Metrics

Collect metrics for monitoring and optimization:

```csharp
[McpServerTool, Description("Sample tool")]
public async Task<string> SampleTool(string input)
{
    var stopwatch = Stopwatch.StartNew();

    try
    {
        // Execute operation
        var result = await ProcessInputAsync(input);

        // Track metrics
        stopwatch.Stop();
        _telemetry.TrackMetric("MCP.SampleTool.ExecutionTime", stopwatch.ElapsedMilliseconds);
        _telemetry.TrackEvent("MCP.SampleTool.Success");

        return result;
    }
    catch (Exception ex)
    {
        stopwatch.Stop();
        _telemetry.TrackException(ex);
        _telemetry.TrackEvent("MCP.SampleTool.Failure");
        throw;
    }
}
```

## Example Scenarios

### Intelligent Customer Service Assistant

Build a smart customer support workflow with MCP and AI:

```csharp
[McpServerTool, Description("Get customer information")]
public async Task<string> GetCustomerInfo(string customerId)
{
    // Get customer data from CRM
}

[McpServerTool, Description("Get product information")]
public async Task<string> GetProductInfo(string productId)
{
    // Get product data from database
}

[McpServerTool, Description("Create support ticket")]
public async Task<string> CreateSupportTicket(string customerId, string issue, int priority)
{
    // Create ticket in support system
}
```

### Data Analysis Assistant

Build a data assistant for advanced workflows:

```csharp
[McpServerTool, Description("Connect to database")]
public async Task<string> ConnectToDatabase(string connectionString)
{
    // Create DB connection
}

[McpServerTool, Description("Execute SQL query")]
public async Task<string> ExecuteQuery(string query)
{
    // Execute SQL and return result
}

[McpServerTool, Description("Generate data visualization")]
public async Task<string> GenerateVisualization(string data, string chartType)
{
    // Generate chart
}
```

With these advanced features and examples, you can unlock MCP's full potential and build truly intelligent, interactive applications.
