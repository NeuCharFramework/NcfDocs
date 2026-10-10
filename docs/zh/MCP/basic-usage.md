# MCP 基本使用

## 1. 在 XNCF 模块中定义工具

工具类型和方法由 `ModelContextProtocol.Server` 提供的特性标记：

```csharp
using ModelContextProtocol.Server;
using System.ComponentModel;

[McpServerToolType]
public static class SampleMcpTools
{
    [McpServerTool, Description("原样返回输入文本")]
    public static string Echo(string message)
    {
        return message;
    }

    [McpServerTool, Description("返回当前服务器时间")]
    public static string Now()
    {
        return DateTimeOffset.Now.ToString("O");
    }
}
```

在该模块的 `Register` 中开启 MCP：

```csharp
public override bool EnableMcpServer => true;
```

框架扫描的是模块 `Register` 所在程序集。工具放在其他程序集时，需要自行重写
注册逻辑，不能假设默认扫描会跨程序集发现它。

## 2. 确定模块端点

默认路由使用完整模块名。例如：

```text
模块名：Senparc.Xncf.MCP
路由：  mcp-senparc-xncf-mcp
端点：  http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

运行时可读取已登记服务：

```csharp
var servers = XncfRegisterManager.McpServerInfoCollection.Values;
foreach (var server in servers)
{
    Console.WriteLine($"{server.XncfName}: {server.McpRoute}/sse");
}
```

## 3. 在 NCF AgentKernel 中使用 MCP

当前 MCP 模块使用 `HostedMcpServerTool` 将远程 MCP Server 作为 AI Tool：

```csharp
using Microsoft.Extensions.AI;
using Senparc.AI.AgentKernel;

var endpoint = new Uri(
    "http://localhost:5000/mcp-senparc-xncf-mcp/sse");

var mcpTool = new HostedMcpServerTool("NCF-Server", endpoint);
var handler = new AgentAiHandler(Senparc.AI.Config.SenparcAiSetting);
var config = handler.IWantTo();
var options = config.CreateChatClientAgentOptions(
    "NCF-Agent",
    "按需调用 MCP 工具完成任务。",
    new ChatOptions
    {
        Instructions = "按需调用 MCP 工具完成任务。",
        Tools = new List<AITool> { mcpTool },
    });

var runner = await config
    .ConfigChatModel("NCF-Agent", options)
    .BuildKernelAsync();
var result = await runner.RunChatAsync("请返回服务器当前时间");
Console.WriteLine(result.OutputString);
```

调用前必须已经配置可用的聊天模型。对于会写数据、执行命令或访问外部系统的
工具，不要默认关闭人工批准。

## 4. 最小验证

- 服务端日志中能够看到对应模块的 MCP 路由注册。
- 客户端可以列出 `Echo`、`Now` 等预期工具。
- 一次只测试一个无副作用工具，再逐步加入认证、超时和错误处理。
- 生产环境测试必须覆盖未授权、超时、取消、重复调用和敏感信息脱敏。
