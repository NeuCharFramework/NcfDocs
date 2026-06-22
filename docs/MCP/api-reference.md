# MCP API Reference

This document provides API references for key MCP classes and interfaces, helping developers better understand MCP capabilities and usage patterns.

## Core Components

### McpServer

The MCP server is the core component that processes model requests and tool invocations.

#### Main Methods and Properties

| Name | Type | Description |
|------|------|-------------|
| `RunAsync` | Method | Starts the MCP server and begins listening for requests |
| `RegisterTool` | Method | Registers a tool callable by AI |
| `UnregisterTool` | Method | Unregisters a previously registered tool |
| `ListTools` | Method | Returns all registered tools |
| `AllTools` | Property | Gets the complete tool collection |
| `Options` | Property | Gets server configuration options |

#### Example

```csharp
// Create MCP server
var transport = new SseResponseStreamTransport(httpResponse.Body);
var server = McpServerFactory.Create(
    transport,
    mcpServerOptions,
    loggerFactory,
    serviceProvider);

// Run server
await server.RunAsync(cancellationToken);
```

### McpClient

The MCP client sends requests to the MCP server and calls tools.

#### Main Methods and Properties

| Name | Type | Description |
|------|------|-------------|
| `ListToolsAsync` | Method | Asynchronously gets available tools from the server |
| `CallToolAsync` | Method | Asynchronously calls a tool and gets its result |
| `IsConnected` | Property | Checks whether the client is connected |
| `Transport` | Property | Gets the transport used by the client |

#### Example

```csharp
// Create MCP client
var clientTransport = new SseClientTransport(new SseClientTransportOptions()
{
    Endpoint = new Uri("http://localhost:5000/sse/sse"),
    Name = "NCF-Server"
});

var client = await McpClientFactory.CreateAsync(clientTransport);

// Call tool
var result = await client.CallToolAsync(
    "Echo",
    new Dictionary<string, object?>() { ["message"] = "Hello MCP!" });
```

## Attributes and Annotations

### McpServerToolType

Marks a class that contains MCP tools.

```csharp
[AttributeUsage(AttributeTargets.Class)]
public class McpServerToolTypeAttribute : Attribute
{
    public McpServerToolTypeAttribute();
}
```

#### Example

```csharp
[McpServerToolType()]
public static class MyTools
{
    // Tool methods...
}
```

### McpServerTool

Marks a method as an MCP tool.

```csharp
[AttributeUsage(AttributeTargets.Method)]
public class McpServerToolAttribute : Attribute
{
    public McpServerToolAttribute();
    public string Name { get; set; }
}
```

#### Example

```csharp
[McpServerTool(Name = "CustomEcho")]
public static string Echo(string message)
{
    return $"Echo: {message}";
}
```

## Configuration Options

### McpServerOptions

Options class used to configure the MCP server.

#### Main Properties

| Name | Type | Description |
|------|------|-------------|
| `ServerInfo` | `Implementation` | Server metadata such as name and version |
| `TimeoutMilliseconds` | `int` | Request timeout in milliseconds |
| `MaxRequestSize` | `int` | Maximum request size in bytes |

#### Example

```csharp
services.AddMcpServer(opt =>
{
    opt.ServerInfo = new Implementation()
    {
        Name = "ncf-mcp-server",
        Version = "1.0.0",
    };
    opt.TimeoutMilliseconds = 30000; // 30s timeout
    opt.MaxRequestSize = 1024 * 1024; // 1MB
})
```

### SseClientTransportOptions

Options class for SSE client transport.

#### Main Properties

| Name | Type | Description |
|------|------|-------------|
| `Endpoint` | `Uri` | SSE endpoint URL |
| `Name` | `string` | Transport name |
| `ConnectTimeout` | `TimeSpan` | Connection timeout |
| `RequestTimeout` | `TimeSpan` | Request timeout |

#### Example

```csharp
var options = new SseClientTransportOptions()
{
    Endpoint = new Uri("http://localhost:5000/sse/sse"),
    Name = "NCF-Server",
    ConnectTimeout = TimeSpan.FromSeconds(10),
    RequestTimeout = TimeSpan.FromSeconds(30)
};
```

## Extension Methods

### `IServiceCollection` Extensions

Used to register MCP services in dependency injection.

#### `AddMcpServer`

```csharp
public static IMcpServerBuilder AddMcpServer(
    this IServiceCollection services,
    Action<McpServerOptions> configureOptions = null);
```

#### Example

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

### `IMcpServerBuilder` Extensions

Used to configure the MCP server builder.

#### `WithHttpTransport`

```csharp
public static IMcpServerBuilder WithHttpTransport(
    this IMcpServerBuilder builder);
```

#### `WithStdioServerTransport`

```csharp
public static IMcpServerBuilder WithStdioServerTransport(
    this IMcpServerBuilder builder);
```

#### `WithToolsFromAssembly`

```csharp
public static IMcpServerBuilder WithToolsFromAssembly(
    this IMcpServerBuilder builder,
    Assembly assembly = null);
```

#### `WithTools`

```csharp
public static IMcpServerBuilder WithTools<T>(
    this IMcpServerBuilder builder);
```

#### Example

```csharp
services.AddMcpServer(/* ... */)
    .WithHttpTransport()
    .WithToolsFromAssembly()
    .WithTools<MyCustomToolsClass>();
```

### `IEndpointRouteBuilder` Extensions

Used to configure MCP route endpoints.

#### `MapMcp`

```csharp
public static IEndpointConventionBuilder MapMcp(
    this IEndpointRouteBuilder endpoints,
    string pattern,
    Func<HttpContext, IMcpServerOptions, CancellationToken, Task> configureServerBeforeRunAsync = null,
    Func<HttpContext, IMcpServer, CancellationToken, Task> configureServerAfterRunAsync = null);
```

#### Example

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapMcp("sse", async (context, options, ct) =>
    {
        // Configuration before server run
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

## Semantic Kernel Integration

### KernelExtensions

Used to integrate MCP functions into Semantic Kernel.

#### `AddMcpFunctionsFromSseServerAsync`

```csharp
public static Task<KernelPlugin> AddMcpFunctionsFromSseServerAsync(
    this IKernelPluginCollection plugins,
    string pluginName,
    string sseUrl,
    CancellationToken cancellationToken = default);
```

#### Example

```csharp
// Create Semantic Kernel instance
var kernel = Kernel.CreateBuilder()
    .WithAzureOpenAIChatCompletion(/* ... */)
    .Build();

// Add MCP functions
await kernel.Plugins.AddMcpFunctionsFromSseServerAsync(
    "NCF-MCP",
    "http://localhost:5000/sse/sse");
```

## Transport Interface

### ITransport

Base interface for MCP transport implementations.

#### Main Methods

| Name | Type | Description |
|------|------|-------------|
| `RunAsync` | Method | Starts transport and handles communication |
| `OnMessageReceivedAsync` | Method | Receives and processes messages |
| `SendMessageAsync` | Method | Sends messages |
| `ShutdownAsync` | Method | Shuts down transport |

### Built-in Transport Implementations

MCP includes several built-in transports:

1. **SseResponseStreamTransport**: HTTP SSE server transport
2. **SseClientTransport**: SSE client transport
3. **StdioServerTransport**: Standard IO server transport
4. **StdioClientTransport**: Standard IO client transport

## Tool Models

### ToolModel

Model class that describes an MCP tool.

#### Main Properties

| Name | Type | Description |
|------|------|-------------|
| `Name` | `string` | Tool name |
| `Description` | `string` | Tool description |
| `Parameters` | `ParameterModel[]` | Array of parameter models |
| `ReturnType` | `string` | Return type |

### ParameterModel

Model class that describes MCP tool parameters.

#### Main Properties

| Name | Type | Description |
|------|------|-------------|
| `Name` | `string` | Parameter name |
| `Description` | `string` | Parameter description |
| `Type` | `string` | Parameter type |
| `Required` | `bool` | Whether the parameter is required |
| `DefaultValue` | `object` | Default value |

Using these APIs, developers can deeply integrate and orchestrate AI interactions in MCP-based applications.
