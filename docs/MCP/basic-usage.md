# MCP Basic Usage

This document explains MCP basics so you can quickly integrate and use AI capabilities in NCF applications.

## Core Concepts

Before you start, understand these terms:

- **MCP Server**: Server component that handles and forwards AI requests
- **MCP Client**: Client component that sends requests to the MCP Server
- **MCP Tools**: Functions/services callable by AI models
- **Function Calling**: The ability for models to call functions to complete tasks

## Basic Workflow

### 1. Create and Register MCP Tools

MCP tools are callable functions exposed to AI models:

```csharp
using ModelContextProtocol.Server;
using System.ComponentModel;

[McpServerToolType()]
public static class NcfMcpTools
{
    [McpServerTool, Description("Process strings")]
    public static string Echo(string message)
    {
        Console.WriteLine("Echo received MCP request, message: " + message);
        return $"hello {message}";
    }

    [McpServerTool, Description("Get current time")]
    public static string Now(string message) { return $"{DateTime.Now}"; }

    [McpServerTool, Description("Add hours automatically")]
    public static string AddHours(int hours)
    {
        return $"{DateTime.Now.AddHours(hours)}";
    }
}
```

In this example:

- `[McpServerToolType()]` marks a class that contains MCP tools
- `[McpServerTool]` marks a method as a tool
- `[Description]` provides tool descriptions used by AI to understand and choose tools

### 2. Call Tools via MCP Client

You can call tools directly from your application:

```csharp
// Create MCP client
var clientTransport = new SseClientTransport(new SseClientTransportOptions()
{
    Endpoint = new Uri("http://localhost:5000/sse/sse"),
    Name = "NCF-Server"
});

var client = await McpClientFactory.CreateAsync(clientTransport);

// List available tools
var tools = await client.ListToolsAsync();
foreach (var tool in tools)
{
    Console.WriteLine($"{tool.Name} ({tool.Description})");
}

// Execute tool
var result = await client.CallToolAsync(
    "Echo",
    new Dictionary<string, object?>() { ["message"] = "Hello MCP!" });

Console.WriteLine("Result: " + result);
```

### 3. Integrate with AI Models

MCP becomes powerful when tools are exposed to an AI model, letting the model decide what to call:

```csharp
// Get AI settings
var aiSetting = Senparc.AI.Config.SenparcAiSetting;
var semanticAiHandler = new SemanticAiHandler(aiSetting);

// Configure model
var iWantToConfig = semanticAiHandler.IWantTo()
                        .ConfigModel(AI.ConfigModel.Chat, "MyAIAssistant");

// Add MCP plugin
var mcpPlugin = await iWantToConfig.Kernel.Plugins.AddMcpFunctionsFromSseServerAsync(
    "NCF-Server",
    "http://localhost:5000/sse/sse");

// Build kernel
var iWantToRun = iWantToConfig.BuildKernel();

// Set execution options
var executionSettings = new OpenAIPromptExecutionSettings
{
    Temperature = 0,
    FunctionChoiceBehavior = FunctionChoiceBehavior.Required()
};
var kernelArguments = new KernelArguments(executionSettings);

// Run request
var result = await iWantToRun.Kernel.InvokePromptAsync(
    "Tell me the current time and the time 3 hours later",
    kernelArguments);

Console.WriteLine(result.ToString());
```

In this example, AI analyzes the request and calls relevant MCP tools (like `Now` and `AddHours`) to complete the task.

## Common Use Cases

### 1. Data Processing and Calculation

```csharp
[McpServerTool, Description("Calculator tool for add, subtract, multiply, and divide")]
public async Task<string> Calculator(RequestType request)
{
    double calcResult = request.Number1;
    switch (request.TheOperator)
    {
        case "+":
            calcResult = calcResult + request.Number2;
            break;
        case "-":
            calcResult = calcResult - request.Number2;
            break;
        case "×":
            calcResult = calcResult * request.Number2;
            break;
        case "÷":
            if (request.Number2 == 0)
            {
                return "Error: divisor cannot be 0.";
            }
            calcResult = calcResult / request.Number2;
            break;
        default:
            return $"Error: unknown operator: {request.TheOperator}";
    }

    if (request.Power > 1)
    {
        calcResult = Math.Pow(calcResult, request.Power);
    }

    return calcResult.ToString();
}
```

### 2. External API Integration

```csharp
[McpServerTool, Description("Get weather information")]
public async Task<string> GetWeather(string city)
{
    // Call weather API
    using var httpClient = new HttpClient();
    var response = await httpClient.GetAsync($"https://api.weatherapi.com/v1/current.json?key={apiKey}&q={city}");
    var content = await response.Content.ReadAsStringAsync();

    // Parse response
    var weatherData = JsonDocument.Parse(content);
    var temp = weatherData.RootElement.GetProperty("current").GetProperty("temp_c").GetDouble();
    var condition = weatherData.RootElement.GetProperty("current").GetProperty("condition").GetProperty("text").GetString();

    return $"Current temperature in {city}: {temp}°C, condition: {condition}";
}
```

### 3. Web Crawling and Content Analysis

```csharp
[McpServerTool, Description("Web crawler tool for extracting content from specific pages")]
public async Task<string> WebSpider(string url, int depth, int pageNumber)
{
    // Implement crawling logic
    // ...

    return "Crawled content...";
}
```

## Best Practices

1. **Write clear descriptions**: Make each tool purpose explicit for AI selection
2. **Use strong typing and validation**: Keep inputs safe and predictable
3. **Handle errors well**: Return meaningful errors for troubleshooting
4. **Apply security controls**: Especially for sensitive operations
5. **Optimize performance**: Use async processing and caching for expensive operations

Following these principles helps you integrate MCP effectively and build smarter, more interactive NCF applications.
