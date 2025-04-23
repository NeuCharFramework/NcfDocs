# MCP API参考

本文档提供MCP模块中主要类和接口的API参考，帮助开发者更深入地了解MCP的功能和使用方法。

## 核心组件

### McpServer

MCP服务器是处理AI模型请求和工具调用的核心组件。

#### 主要方法和属性

| 名称 | 类型 | 描述 |
|------|------|------|
| `RunAsync` | 方法 | 启动MCP服务器并开始监听请求 |
| `RegisterTool` | 方法 | 注册一个可被AI调用的工具 |
| `UnregisterTool` | 方法 | 注销一个已注册的工具 |
| `ListTools` | 方法 | 获取所有已注册工具的列表 |
| `AllTools` | 属性 | 获取所有已注册工具的集合 |
| `Options` | 属性 | 获取服务器配置选项 |

#### 示例用法

```csharp
// 创建MCP服务器
var transport = new SseResponseStreamTransport(httpResponse.Body);
var server = McpServerFactory.Create(
    transport, 
    mcpServerOptions, 
    loggerFactory, 
    serviceProvider);

// 运行服务器
await server.RunAsync(cancellationToken);
```

### McpClient

MCP客户端用于向MCP服务器发送请求并调用工具。

#### 主要方法和属性

| 名称 | 类型 | 描述 |
|------|------|------|
| `ListToolsAsync` | 方法 | 异步获取服务器上可用工具的列表 |
| `CallToolAsync` | 方法 | 异步调用指定的工具并获取结果 |
| `IsConnected` | 属性 | 检查客户端是否已连接到服务器 |
| `Transport` | 属性 | 获取客户端使用的传输实例 |

#### 示例用法

```csharp
// 创建MCP客户端
var clientTransport = new SseClientTransport(new SseClientTransportOptions()
{
    Endpoint = new Uri("http://localhost:5000/sse/sse"),
    Name = "NCF-Server"
});

var client = await McpClientFactory.CreateAsync(clientTransport);

// 调用工具
var result = await client.CallToolAsync(
    "Echo",
    new Dictionary<string, object?>() { ["message"] = "Hello MCP!" });
```

## 注解和属性

### McpServerToolType

用于标记包含MCP工具的类。

```csharp
[AttributeUsage(AttributeTargets.Class)]
public class McpServerToolTypeAttribute : Attribute
{
    public McpServerToolTypeAttribute();
}
```

#### 示例用法

```csharp
[McpServerToolType()]
public static class MyTools
{
    // 工具方法...
}
```

### McpServerTool

用于标记作为MCP工具的方法。

```csharp
[AttributeUsage(AttributeTargets.Method)]
public class McpServerToolAttribute : Attribute
{
    public McpServerToolAttribute();
    public string Name { get; set; }
}
```

#### 示例用法

```csharp
[McpServerTool(Name = "CustomEcho")]
public static string Echo(string message)
{
    return $"Echo: {message}";
}
```

## 配置选项

### McpServerOptions

配置MCP服务器的选项类。

#### 主要属性

| 名称 | 类型 | 描述 |
|------|------|------|
| `ServerInfo` | `Implementation` | 服务器实现信息，包括名称和版本 |
| `TimeoutMilliseconds` | `int` | 请求超时时间（毫秒） |
| `MaxRequestSize` | `int` | 最大请求大小（字节） |

#### 示例用法

```csharp
services.AddMcpServer(opt =>
{
    opt.ServerInfo = new Implementation()
    {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
    opt.TimeoutMilliseconds = 30000; // 30秒超时
    opt.MaxRequestSize = 1024 * 1024; // 1MB
})
```

### SseClientTransportOptions

配置SSE客户端传输的选项类。

#### 主要属性

| 名称 | 类型 | 描述 |
|------|------|------|
| `Endpoint` | `Uri` | SSE服务端点URL |
| `Name` | `string` | 传输名称 |
| `ConnectTimeout` | `TimeSpan` | 连接超时时间 |
| `RequestTimeout` | `TimeSpan` | 请求超时时间 |

#### 示例用法

```csharp
var options = new SseClientTransportOptions()
{
    Endpoint = new Uri("http://localhost:5000/sse/sse"),
    Name = "NCF-Server",
    ConnectTimeout = TimeSpan.FromSeconds(10),
    RequestTimeout = TimeSpan.FromSeconds(30)
};
```

## 扩展方法

### IServiceCollection扩展

用于在依赖注入容器中注册MCP服务。

#### AddMcpServer

```csharp
public static IMcpServerBuilder AddMcpServer(
    this IServiceCollection services, 
    Action<McpServerOptions> configureOptions = null);
```

#### 示例用法

```csharp
services.AddMcpServer(opt =>
{
    opt.ServerInfo = new Implementation()
    {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
})
.WithHttpTransport()
.WithToolsFromAssembly();
```

### IMcpServerBuilder扩展

用于配置MCP服务器构建器。

#### WithHttpTransport

```csharp
public static IMcpServerBuilder WithHttpTransport(
    this IMcpServerBuilder builder);
```

#### WithStdioServerTransport

```csharp
public static IMcpServerBuilder WithStdioServerTransport(
    this IMcpServerBuilder builder);
```

#### WithToolsFromAssembly

```csharp
public static IMcpServerBuilder WithToolsFromAssembly(
    this IMcpServerBuilder builder,
    Assembly assembly = null);
```

#### WithTools

```csharp
public static IMcpServerBuilder WithTools<T>(
    this IMcpServerBuilder builder);
```

#### 示例用法

```csharp
services.AddMcpServer(/* ... */)
    .WithHttpTransport()
    .WithToolsFromAssembly()
    .WithTools<MyCustomToolsClass>();
```

### IEndpointRouteBuilder扩展

用于配置MCP端点路由。

#### MapMcp

```csharp
public static IEndpointConventionBuilder MapMcp(
    this IEndpointRouteBuilder endpoints,
    string pattern,
    Func<HttpContext, IMcpServerOptions, CancellationToken, Task> configureServerBeforeRunAsync = null,
    Func<HttpContext, IMcpServer, CancellationToken, Task> configureServerAfterRunAsync = null);
```

#### 示例用法

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapMcp("sse", async (context, options, ct) =>
    {
        // 服务器运行前的配置
        var token = context.Request.Query["token"];
        if (token != "your-secret-token")
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized");
            return;
        }
    });
});
```

## Semantic Kernel集成

### KernelExtensions

用于将MCP功能集成到Semantic Kernel中。

#### AddMcpFunctionsFromSseServerAsync

```csharp
public static Task<KernelPlugin> AddMcpFunctionsFromSseServerAsync(
    this IKernelPluginCollection plugins,
    string pluginName,
    string sseUrl,
    CancellationToken cancellationToken = default);
```

#### 示例用法

```csharp
// 创建Semantic Kernel实例
var kernel = Kernel.CreateBuilder()
    .WithAzureOpenAIChatCompletion(/* ... */)
    .Build();

// 添加MCP函数
await kernel.Plugins.AddMcpFunctionsFromSseServerAsync(
    "NCF-MCP", 
    "http://localhost:5000/sse/sse");
```

## 传输接口

### ITransport

MCP传输的基础接口，定义了传输层的基本功能。

#### 主要方法

| 名称 | 类型 | 描述 |
|------|------|------|
| `RunAsync` | 方法 | 启动传输并处理通信 |
| `OnMessageReceivedAsync` | 方法 | 接收消息并处理 |
| `SendMessageAsync` | 方法 | 发送消息 |
| `ShutdownAsync` | 方法 | 关闭传输 |

### 内置传输实现

MCP提供了几种内置的传输实现：

1. **SseResponseStreamTransport** - 用于HTTP Server-Sent Events传输
2. **SseClientTransport** - SSE客户端传输
3. **StdioServerTransport** - 标准IO服务器传输
4. **StdioClientTransport** - 标准IO客户端传输

## 工具模型

### ToolModel

表示MCP工具的模型类。

#### 主要属性

| 名称 | 类型 | 描述 |
|------|------|------|
| `Name` | `string` | 工具名称 |
| `Description` | `string` | 工具描述 |
| `Parameters` | `ParameterModel[]` | 工具参数模型数组 |
| `ReturnType` | `string` | 返回类型 |

### ParameterModel

表示MCP工具参数的模型类。

#### 主要属性

| 名称 | 类型 | 描述 |
|------|------|------|
| `Name` | `string` | 参数名称 |
| `Description` | `string` | 参数描述 |
| `Type` | `string` | 参数类型 |
| `Required` | `bool` | 是否必需 |
| `DefaultValue` | `object` | 默认值 |

通过这些API，开发者可以充分利用MCP模块提供的功能，实现与AI模型的深度集成和交互。