# MCP 基本使用

本文介绍MCP模块的基本使用方法，帮助您在NCF应用中快速集成和使用AI功能。

## MCP基本概念

在开始使用MCP之前，了解以下基本概念非常重要：

- **MCP Server**: 负责处理和转发AI请求的服务器组件
- **MCP Client**: 用于向MCP Server发送请求的客户端组件
- **MCP Tools**: 可以被AI模型调用的功能或服务
- **Function Calling**: 允许AI模型调用特定函数以完成任务的能力

## 基本使用流程

### 1. 创建和注册MCP工具

MCP工具是允许AI模型调用的函数。可以通过以下方式定义工具：

```csharp
using ModelContextProtocol.Server;
using System.ComponentModel;

[McpServerToolType()]
public static class NcfMcpTools
{
    [McpServerTool, Description("处理字符串")]
    public static string Echo(string message)
    {
        Console.WriteLine("Echo 收到来自 MCP的 请求，Message:" + message);
        return $"hello {message}";
    }

    [McpServerTool, Description("获取当前时间")]
    public static string Now(string message) { return $"{DateTime.Now}"; }

    [McpServerTool, Description("自动增加小时数")]
    public static string AddHours(int hours)
    {
        return $"{DateTime.Now.AddHours(hours)}";
    }
}
```

在上面的示例中：
- `[McpServerToolType()]`属性标记一个类包含MCP工具
- `[McpServerTool]`属性标记一个方法作为MCP工具
- `[Description]`属性为工具提供描述，AI会使用这些描述来理解和选择工具

### 2. 使用MCP客户端调用工具

您可以在应用程序中使用MCP客户端直接调用工具：

```csharp
// 创建MCP客户端
var clientTransport = new SseClientTransport(new SseClientTransportOptions()
{
    Endpoint = new Uri("http://localhost:5000/sse/sse"),
    Name = "NCF-Server"
});

var client = await McpClientFactory.CreateAsync(clientTransport);

// 列出可用工具
var tools = await client.ListToolsAsync();
foreach (var tool in tools)
{
    Console.WriteLine($"{tool.Name} ({tool.Description})");
}

// 执行工具
var result = await client.CallToolAsync(
    "Echo",
    new Dictionary<string, object?>() { ["message"] = "Hello MCP!" });

Console.WriteLine("结果：" + result);
```

### 3. 与AI模型集成

MCP的强大之处在于能够将工具暴露给AI模型，使AI能够根据需要调用这些工具。下面是一个与AI模型集成的示例：

```csharp
// 获取AI配置
var aiSetting = Senparc.AI.Config.SenparcAiSetting;
var semanticAiHandler = new SemanticAiHandler(aiSetting);

// 配置AI模型
var iWantToConfig = semanticAiHandler.IWantTo()
                        .ConfigModel(AI.ConfigModel.Chat, "MyAIAssistant");

// 添加MCP插件
var mcpPlugin = await iWantToConfig.Kernel.Plugins.AddMcpFunctionsFromSseServerAsync(
    "NCF-Server", 
    "http://localhost:5000/sse/sse");

// 构建内核并准备执行
var iWantToRun = iWantToConfig.BuildKernel();

// 设置执行参数
var executionSettings = new OpenAIPromptExecutionSettings
{
    Temperature = 0,
    FunctionChoiceBehavior = FunctionChoiceBehavior.Required()
};
var kernelArguments = new KernelArguments(executionSettings);

// 执行AI请求
var result = await iWantToRun.Kernel.InvokePromptAsync(
    "请告诉我现在的时间以及3小时后的时间", 
    kernelArguments);

Console.WriteLine(result.ToString());
```

在这个例子中，AI会分析请求，识别需要获取时间信息，然后调用适当的MCP工具(如`Now`和`AddHours`)来完成任务。

## 常见使用场景

### 1. 数据处理与计算

MCP工具可以用于执行各种数据处理和计算任务，例如：

```csharp
[McpServerTool, Description("计算器工具，负责处理加减乘除计算")]
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
                return "错误：被除数不能为0！";
            }
            calcResult = calcResult / request.Number2;
            break;
        default:
            return $"错误：未知的运算符：{request.TheOperator}";
    }
    
    if (request.Power > 1)
    {
        calcResult = Math.Pow(calcResult, request.Power);
    }
    
    return calcResult.ToString();
}
```

### 2. 外部API集成

MCP工具可以用于集成外部API和服务：

```csharp
[McpServerTool, Description("获取天气信息")]
public async Task<string> GetWeather(string city)
{
    // 调用天气API
    using var httpClient = new HttpClient();
    var response = await httpClient.GetAsync($"https://api.weatherapi.com/v1/current.json?key={apiKey}&q={city}");
    var content = await response.Content.ReadAsStringAsync();
    
    // 解析结果
    var weatherData = JsonDocument.Parse(content);
    var temp = weatherData.RootElement.GetProperty("current").GetProperty("temp_c").GetDouble();
    var condition = weatherData.RootElement.GetProperty("current").GetProperty("condition").GetProperty("text").GetString();
    
    return $"{city}的当前温度是{temp}°C，天气状况：{condition}";
}
```

### 3. Web爬虫和内容分析

MCP工具可以用于网络爬虫和内容分析任务：

```csharp
[McpServerTool, Description("网页爬虫工具，可以爬取指定网页的内容")]
public async Task<string> WebSpider(string url, int depth, int pageNumber)
{
    // 实现网页爬取逻辑
    // ...
    
    return "爬取的内容...";
}
```

## 最佳实践

1. **提供清晰的描述** - 确保每个工具都有详细的描述，帮助AI理解工具的用途
2. **参数类型和验证** - 使用强类型参数并添加验证，确保数据的正确性
3. **错误处理** - 妥善处理异常情况，返回有用的错误信息
4. **安全性考虑** - 实施适当的安全控制，尤其是处理敏感操作时
5. **性能优化** - 对于耗时的操作，考虑使用异步处理和缓存

通过遵循这些基本原则，您可以有效地利用MCP模块在NCF应用中集成AI功能，提供更智能、更具交互性的用户体验。