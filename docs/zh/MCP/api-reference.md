# MCP API 参考

> 本页只记录当前 NCF 自动注册链路中的稳定入口，基线为
> 内容于 2026-07-27 按 `NcfPackageSources` 开发分支核对。

## `IXncfRegister` / `XncfRegisterBase`

### `EnableMcpServer`

```csharp
public virtual bool EnableMcpServer => false;
```

模块重写为 `true` 后，NCF 才会调用 MCP 服务注册和路由映射。

### `AddMcpServer`

```csharp
void AddMcpServer(
    IServiceCollection services,
    IXncfRegister xncfRegister);
```

默认实现：

- 服务名：`ncf-mcp-server-{Name.Replace(".", "-")}`；
- transport：HTTP；
- 扫描范围：`xncfRegister.GetType().Assembly`；
- 仅在检测到 `[McpServerToolType]` 后调用 `WithToolsFromAssembly()`；
- 将服务写入 `XncfRegisterManager.McpServerInfoCollection`。

### `UseMcpServer`

```csharp
void UseMcpServer(
    IApplicationBuilder app,
    IRegisterService registerService);
```

默认路由：

```csharp
var routePattern = $"mcp-{Name.Replace(".", "-").ToLower()}";
endpoints.MapMcp(routePattern);
```

HTTP transport 的 SSE 地址在路由后追加 `/sse`。

## 工具特性

### `[McpServerToolType]`

标记包含 MCP 工具的类型。默认注册逻辑先用此特性判断程序集是否包含工具。

### `[McpServerTool]`

标记可由 MCP 客户端发现和调用的方法。使用 `Description` 或
`LocalizedDescription` 提供清晰、无歧义的工具说明。

## `McpServerInfo`

```csharp
public class McpServerInfo
{
    public string XncfUid { get; set; }
    public string XncfName { get; set; }
    public string ServerName { get; set; }
    public string McpRoute { get; set; }
}
```

读取当前进程已登记服务：

```csharp
var servers = XncfRegisterManager.McpServerInfoCollection.Values;
```

集合是进程内运行时状态，不是持久化的服务注册中心。

## 当前 MCP Manager 端点

```text
模块名：Senparc.Xncf.MCP
服务名：ncf-mcp-server-Senparc-Xncf-MCP
路由：mcp-senparc-xncf-mcp
本地 HTTP SSE：http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

## 不再推荐的旧入口

以下内容不属于当前自动注册基线：

- `/sse/sse`；
- 在 `Startup.cs` 手工调用 `MapMcp("sse")`；
- `AddMcpFunctionsFromSseServerAsync` 的旧示例；
- 把 `McpAccessToken` 配置值当作已经启用的路由授权。
