# MCP Basic Usage

## 1. Define tools in an XNCF module

Use attributes from `ModelContextProtocol.Server` on the tool type and methods:

```csharp
using ModelContextProtocol.Server;
using System.ComponentModel;

[McpServerToolType]
public static class SampleMcpTools
{
    [McpServerTool, Description("Return the input unchanged")]
    public static string Echo(string message)
    {
        return message;
    }

    [McpServerTool, Description("Return the current server time")]
    public static string Now()
    {
        return DateTimeOffset.Now.ToString("O");
    }
}
```

Enable MCP in that module's `Register`:

```csharp
public override bool EnableMcpServer => true;
```

The default scanner uses the assembly containing the module `Register`. If
tools live in another assembly, override the registration explicitly rather
than assuming the default scan crosses assembly boundaries.

## 2. Determine the module endpoint

The default route uses the complete module name:

```text
Module:   Senparc.Xncf.MCP
Route:    mcp-senparc-xncf-mcp
Endpoint: http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

At runtime, enumerate registered services with:

```csharp
var servers = XncfRegisterManager.McpServerInfoCollection.Values;
foreach (var server in servers)
{
    Console.WriteLine($"{server.XncfName}: {server.McpRoute}/sse");
}
```

## 3. Use MCP from NCF AgentKernel

The current MCP module uses `HostedMcpServerTool` to expose a remote MCP server
as an AI tool:

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
    "Call MCP tools when needed.",
    new ChatOptions
    {
        Instructions = "Call MCP tools when needed.",
        Tools = new List<AITool> { mcpTool },
    });

var runner = await config
    .ConfigChatModel("NCF-Agent", options)
    .BuildKernelAsync();
var result = await runner.RunChatAsync("Return the server time");
Console.WriteLine(result.OutputString);
```

A working chat model must already be configured. Do not disable human approval
by default for tools that write data, execute commands, or access external
systems.

## 4. Minimum verification

- Server logs show that the expected module MCP route was mapped.
- The client can list expected tools such as `Echo` and `Now`.
- Test one side-effect-free tool first, then add authentication, timeouts, and
  error handling.
- Production testing covers unauthorized access, timeout, cancellation,
  duplicate calls, and redaction of sensitive data.
