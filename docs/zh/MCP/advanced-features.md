# MCP 高级特性

本文介绍MCP模块的高级特性和用法，帮助您充分利用MCP提供的强大功能，构建更加复杂和智能的应用程序。

## 自定义工具实现

除了基本的MCP工具实现，您还可以创建更加复杂和功能强大的自定义工具。

### 复杂参数处理

对于需要复杂参数的工具，可以使用自定义类型作为参数：

```csharp
public class ComplexRequestType
{
    [Required]
    [Description("用户的查询内容")]
    public string Query { get; set; }
    
    [Description("搜索的最大深度")]
    [DefaultValue(3)]
    public int MaxDepth { get; set; }
    
    [Description("是否包含历史数据")]
    [DefaultValue(false)]
    public bool IncludeHistory { get; set; }
    
    [Description("结果的排序方式: relevance, date, popularity")]
    [DefaultValue("relevance")]
    public string SortBy { get; set; }
    
    [Description("过滤条件，可以指定多个标签进行过滤")]
    public List<string> Tags { get; set; } = new List<string>();
}

[McpServerTool, Description("高级搜索工具，支持复杂的查询参数")]
public async Task<string> AdvancedSearch(ComplexRequestType request)
{
    // 实现高级搜索逻辑
    // ...
    
    return "搜索结果...";
}
```

### 工具链和组合

您可以创建相互配合的工具集，让AI能够执行复杂的多步骤操作：

```csharp
[McpServerTool, Description("获取数据源列表")]
public async Task<string> GetDataSources()
{
    // 返回可用的数据源列表
    return "数据源1, 数据源2, 数据源3";
}

[McpServerTool, Description("从指定数据源获取数据")]
public async Task<string> FetchData(string dataSource, string query)
{
    // 从指定数据源获取数据
    return $"从 {dataSource} 获取的数据: ...";
}

[McpServerTool, Description("分析数据并生成报表")]
public async Task<string> AnalyzeData(string data, string analysisType)
{
    // 分析数据
    return $"分析结果: ...";
}
```

## 与Semantic Kernel集成

MCP模块可以与Microsoft的Semantic Kernel深度集成，实现更强大的AI功能。

### 插件注册

您可以将MCP工具注册为Semantic Kernel插件：

```csharp
// 创建Semantic Kernel实例
var kernel = Kernel.CreateBuilder()
    .WithAzureOpenAIChatCompletion(
        "gpt-4o", 
        new AzureOpenAIClient(
            new Uri(azureEndpoint),
            new ApiKeyCredential(apiKey)))
    .Build();

// 从MCP服务器添加函数
await kernel.Plugins.AddMcpFunctionsFromSseServerAsync(
    "MyMcpPlugin", 
    "http://localhost:5000/sse/sse");
```

### 链式操作

结合Semantic Kernel的功能，您可以实现复杂的链式操作：

```csharp
// 创建一个执行计划
var plan = kernel.CreatePlan("从网络搜索数据，分析结果，并创建报表");

// 添加步骤
plan.AddStep("WebSpider", new Dictionary<string, object> { 
    { "url", "https://example.com" },
    { "deepth", 2 },
    { "pageNumber", 10 }
});

plan.AddStep("AnalyzeData", new Dictionary<string, object> { 
    { "analysisType", "sentiment" }
});

plan.AddStep("GenerateReport");

// 执行计划
var result = await plan.InvokeAsync(kernel, cancellationToken: CancellationToken.None);
```

## 自定义传输协议

MCP支持多种通信协议，您可以根据需要选择或实现自定义的传输协议。

### HTTP传输

默认的传输方式是基于HTTP的Server-Sent Events (SSE)：

```csharp
services.AddMcpServer(opt => {
    opt.ServerInfo = new Implementation() {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
})
.WithHttpTransport();
```

### 标准IO传输

对于某些场景，您可能需要使用标准IO通信：

```csharp
services.AddMcpServer(opt => {
    opt.ServerInfo = new Implementation() {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
})
.WithStdioServerTransport();
```

### 自定义传输实现

您还可以实现自定义的传输协议：

```csharp
// 自定义传输实现
public class CustomTransport : ITransport
{
    // 实现ITransport接口的方法
    // ...
}

// 注册自定义传输
services.AddMcpServer(opt => {
    // 配置...
})
.AddSingleton<ITransport, CustomTransport>();
```

## 安全与认证

在生产环境中，保护MCP服务的安全至关重要。

### 访问令牌认证

您可以实现基于令牌的认证：

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapMcp("sse", async (context, options, ct) =>
    {
        // 获取配置的Token
        var configuredToken = Senparc.Ncf.Core.Config.SiteConfig.SenparcCoreSetting.McpAccessToken;
        
        if (string.IsNullOrEmpty(configuredToken))
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync("MCP访问令牌未配置");
            return;
        }
        
        // 验证请求中的Token
        if (!context.Request.Query.TryGetValue("token", out var requestToken) ||
            requestToken != configuredToken)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("未授权");
            return;
        }
    });
});
```

### CORS配置

对于跨域访问，需要配置CORS策略：

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

## 性能优化

### 异步处理

确保所有耗时操作都使用异步方法实现：

```csharp
[McpServerTool, Description("处理大量数据")]
public async Task<string> ProcessLargeData(string dataSource)
{
    // 异步执行耗时操作
    var data = await FetchLargeDataAsync(dataSource);
    var result = await ProcessDataAsync(data);
    return result;
}
```

### 响应缓存

对于频繁调用且结果不常变化的工具，可以实现缓存：

```csharp
private static readonly MemoryCache _cache = new MemoryCache(new MemoryCacheOptions());

[McpServerTool, Description("获取缓存数据")]
public async Task<string> GetCachedData(string key)
{
    // 尝试从缓存获取
    if (_cache.TryGetValue(key, out string cachedResult))
    {
        return cachedResult;
    }
    
    // 如果缓存中没有，则获取新数据
    var result = await FetchNewDataAsync(key);
    
    // 保存到缓存
    _cache.Set(key, result, TimeSpan.FromMinutes(30));
    
    return result;
}
```

## 监控与日志

### 集成日志系统

使用NCF的日志系统记录MCP活动：

```csharp
[McpServerTool, Description("执行操作并记录日志")]
public async Task<string> PerformActionWithLogging(string action)
{
    try
    {
        _logger.LogInformation($"MCP工具开始执行: {action}");
        
        // 执行操作
        var result = await ExecuteActionAsync(action);
        
        _logger.LogInformation($"MCP工具执行成功: {action}");
        return result;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"MCP工具执行失败: {action}");
        throw;
    }
}
```

### 性能指标收集

收集性能指标以监控和优化MCP服务：

```csharp
[McpServerTool, Description("示例工具")]
public async Task<string> SampleTool(string input)
{
    var stopwatch = Stopwatch.StartNew();
    
    try
    {
        // 执行工具操作
        var result = await ProcessInputAsync(input);
        
        // 记录性能指标
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

## 示例应用场景

### 智能客服助手

结合MCP和AI能力创建智能客服系统：

```csharp
[McpServerTool, Description("获取客户信息")]
public async Task<string> GetCustomerInfo(string customerId)
{
    // 从CRM系统获取客户信息
}

[McpServerTool, Description("获取产品信息")]
public async Task<string> GetProductInfo(string productId)
{
    // 从产品数据库获取信息
}

[McpServerTool, Description("创建支持票据")]
public async Task<string> CreateSupportTicket(string customerId, string issue, int priority)
{
    // 在支持系统中创建票据
}
```

### 数据分析助手

构建一个数据分析助手，帮助用户执行复杂的数据操作：

```csharp
[McpServerTool, Description("连接数据库")]
public async Task<string> ConnectToDatabase(string connectionString)
{
    // 建立数据库连接
}

[McpServerTool, Description("执行SQL查询")]
public async Task<string> ExecuteQuery(string query)
{
    // 执行SQL查询并返回结果
}

[McpServerTool, Description("生成数据可视化")]
public async Task<string> GenerateVisualization(string data, string chartType)
{
    // 生成数据可视化
}
```

通过这些高级特性和示例，您可以充分发挥MCP模块的潜力，构建真正智能、交互性强的应用程序。