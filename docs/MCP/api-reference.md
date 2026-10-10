# MCP API Reference

> This page documents the active NCF auto-registration path at source baseline
> Checked against the `NcfPackageSources` development line on 2026-07-27.

## `IXncfRegister` / `XncfRegisterBase`

### `EnableMcpServer`

```csharp
public virtual bool EnableMcpServer => false;
```

NCF registers and maps an MCP server only when a module overrides this value to
`true`.

### `AddMcpServer`

```csharp
void AddMcpServer(
    IServiceCollection services,
    IXncfRegister xncfRegister);
```

The default implementation uses:

- server name: `ncf-mcp-server-{Name.Replace(".", "-")}`;
- HTTP transport;
- scan assembly: `xncfRegister.GetType().Assembly`;
- `WithToolsFromAssembly()` only when `[McpServerToolType]` is detected;
- registration in `XncfRegisterManager.McpServerInfoCollection`.

### `UseMcpServer`

```csharp
void UseMcpServer(
    IApplicationBuilder app,
    IRegisterService registerService);
```

The default route is:

```csharp
var routePattern = $"mcp-{Name.Replace(".", "-").ToLower()}";
endpoints.MapMcp(routePattern);
```

The HTTP transport SSE endpoint appends `/sse` to that route.

## Tool attributes

### `[McpServerToolType]`

Marks a type that contains MCP tools. Default registration first uses this
attribute to determine whether the module assembly contains tools.

### `[McpServerTool]`

Marks a method discoverable and callable by an MCP client. Use `Description` or
`LocalizedDescription` to provide precise, unambiguous metadata.

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

Read services registered in the current process with:

```csharp
var servers = XncfRegisterManager.McpServerInfoCollection.Values;
```

This collection is in-process runtime state, not a persistent service registry.

## Current MCP Manager endpoint

```text
Module:     Senparc.Xncf.MCP
ServerName: ncf-mcp-server-Senparc-Xncf-MCP
Route:      mcp-senparc-xncf-mcp
Local HTTP: http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

## Obsolete examples

The following are not part of the current auto-registration baseline:

- `/sse/sse`;
- manual `MapMcp("sse")` calls in `Startup.cs`;
- old `AddMcpFunctionsFromSseServerAsync` examples;
- treating the `McpAccessToken` setting as active route authorization.
