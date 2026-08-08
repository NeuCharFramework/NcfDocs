# MCP 安装与配置

> 适用于 .NET 10；内容于 2026-07-27 按 `NcfPackageSources` 开发分支核对。

## 1. 选择安装方式

### 通过 NCF 安装器或模块管理器

首次安装模拟站点时，`Senparc.Xncf.MCP` 已在高级选项中默认选中。对于已
安装站点，可在后台模块管理器中安装并启用该模块。

这是 NCF 应用的推荐方式，框架会自动完成模块扫描、服务注册和路由映射。

### 通过 NuGet 引用

当前源码项目的 NuGet 包版本是 `0.4.0-preview3`：

```bash
dotnet add package Senparc.Xncf.MCP --version 0.4.0-preview3
```

如果该预览版本尚未发布到所使用的 NuGet 源，请选择源中实际存在的版本，或
在源码联调方案中使用 `ProjectReference`。不要把模块内部的
`Register.Version`（当前为 `0.1.0`）当作 NuGet 包版本。

## 2. 自动注册

当前 NCF 不需要在 `Startup.cs` 中手工调用 `AddMcpServer()` 或
`MapMcp("sse")`。模块声明：

```csharp
public override bool EnableMcpServer => true;
```

NCF 启动时会自动：

- 调用模块的 `AddMcpServer()`；
- 扫描 `[McpServerToolType]`；
- 使用 HTTP transport；
- 调用 `UseMcpServer()` 映射模块路由。

## 3. 启动并定位端点

以源码模拟站点为例：

```bash
dotnet run \
  --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj \
  --launch-profile http
```

`Senparc.Xncf.MCP` 的端点为：

```text
http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

其他模块按相同规则生成，例如模块名 `Org.Xncf.Sample` 对应：

```text
http://localhost:5000/mcp-org-xncf-sample/sse
```

也可以从 `XncfRegisterManager.McpServerInfoCollection` 读取实际登记的
`McpRoute`，避免在代码中重复拼接规则。

## 4. 验证清单

1. 模块已被扫描，并且 `EnableMcpServer` 为 `true`。
2. 启动日志没有“未完成服务注册”或“MCP 路由注册失败”。
3. 工具所在程序集至少有一个 `[McpServerToolType]` 类型。
4. 使用 MCP 客户端或 NCF 后台的 MCP 调用功能连接完整 `/sse` 地址。

浏览器直接打开 SSE 地址可能持续等待事件，这是长连接的正常表现，不能仅以
页面是否结束加载判断服务是否可用。

## 5. 生产配置

::: warning 当前源码安全边界
`SenparcCoreSetting.McpAccessToken` 属性仍然存在，但当前自动映射路由没有启用
对应的查询参数校验。请不要把添加 `?token=...` 当作已经生效的认证方式。
:::

公开 MCP 前至少应完成：

- HTTPS；
- 反向代理或应用层身份认证与授权；
- 工具白名单和最小权限；
- IP/网络范围控制；
- 速率限制、超时、调用日志和敏感参数脱敏。

下一步：[基本使用](./basic-usage.md)。
