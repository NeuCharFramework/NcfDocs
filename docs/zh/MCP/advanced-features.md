# MCP 高级特性与生产安全

## 多模块独立 MCP Server

NCF 为每个 `EnableMcpServer == true` 的 XNCF 模块创建独立服务名和路由：

```text
ServerName: ncf-mcp-server-<模块名，点替换为短横线>
McpRoute:   mcp-<模块名，点替换为短横线并转小写>
```

这允许按模块分别治理工具、权限和发布节奏。不要把所有工具无条件聚合到一个
公开端点。

## 本地化工具元数据

当前源码支持用 `LocalizedDescription` 为工具和参数提供资源化说明：

```csharp
[McpServerToolType]
public static class LocalizedTools
{
    [McpServerTool,
     LocalizedDescription(typeof(MyResource), "MCP.Tool.Search.Description")]
    public static string Search(
        [LocalizedDescription(typeof(MyResource), "MCP.Tool.Search.Query")]
        string query)
    {
        return query;
    }
}
```

模拟站点当前支持 `zh-CN`、`en`、`ja`、`fr`、`es`、`ru`。资源缺失时应提供
稳定的默认描述，避免模型只能看到空白工具说明。

## 自定义注册

`XncfRegisterBase` 默认执行：

```csharp
services.AddMcpServer(...)
    .WithHttpTransport()
    .WithToolsFromAssembly(moduleAssembly);
```

模块可以重写 `AddMcpServer()` 或 `UseMcpServer()`，但同时需要自行维护：

- 服务名与 `McpServerInfoCollection` 登记；
- transport 和工具扫描；
- 路由映射及冲突处理；
- 认证、授权、错误日志和兼容性验证。

## 生产安全清单

当前默认路由不执行 `McpAccessToken` 查询参数校验。部署方应显式实现并验证：

1. 在可信反向代理或应用层完成身份认证。
2. 对每个工具实施授权，而不是只保护 SSE 连接入口。
3. 高风险工具启用人工批准或等价的策略门控。
4. 对文件、数据库、命令和网络能力使用最小权限账户。
5. 设置连接、单次工具和完整任务的超时与取消。
6. 限制请求体、并发和调用频率。
7. 记录调用人、工具名、耗时、结果状态；敏感参数必须脱敏。
8. 对重试和重复请求设计幂等性。

::: danger
源码示例中的 `ApprovalMode.NeverRequire` 只适合受控演示。不要将它直接复制到
具有写入、付款、命令执行或外部通信能力的生产工具。
:::

## 版本兼容

- NuGet 包版本来自 `.csproj` 的 `<Version>`。
- XNCF 模块状态页显示的是 `Register.Version`。
- 两者用途不同，升级和问题报告应同时记录。
- MCP 客户端、transport 和 AI Agent API 变化较快，发布前应以实际引用包编译
  示例并执行一次连接、列工具和工具调用测试。
