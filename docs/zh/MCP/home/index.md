# MCP（Model Context Protocol）模块

> 内容于 2026-07-27 按 `NcfPackageSources` 开发分支核对。
> 当前源码包版本：`Senparc.Xncf.MCP` `0.4.0-preview3`

NCF 将 MCP Server 作为 XNCF 模块能力统一注册。模块开启
`EnableMcpServer` 后，框架会扫描模块程序集中的 MCP Tool，注册 HTTP
transport，并为每个模块映射独立路由。

## 当前工作方式

1. 模块的 `Register` 返回 `EnableMcpServer => true`。
2. 工具类使用 `[McpServerToolType]`，工具方法使用 `[McpServerTool]`。
3. `XncfRegisterBase.AddMcpServer()` 使用 `WithHttpTransport()` 注册服务。
4. `XncfRegisterBase.UseMcpServer()` 映射模块路由。

路由规则为：

```text
/mcp-<完整模块名，将点替换为短横线并转小写>/sse
```

例如 `Senparc.Xncf.MCP` 的本地 HTTP 地址为：

```text
http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

旧文档中的 `/sse/sse` 不再是当前 XNCF 自动注册机制的默认地址。

## MCP Manager 与模块 MCP Server

- `Senparc.Xncf.MCP` 提供 MCP 示例工具、端点管理和调用入口。
- 任何 XNCF 模块都可以独立开启 MCP Server，不需要把工具集中到 MCP
  Manager。
- 已注册服务会写入 `XncfRegisterManager.McpServerInfoCollection`，供后台
  功能选择和组装完整端点。

## 安全边界

::: danger 不要直接公开当前默认端点
当前自动执行的 `MapMcp(routePattern)` 路径没有启用
`McpAccessToken` 查询参数校验。配置文件中存在 `McpAccessToken` 属性，不等于
MCP 路由已经使用它进行授权。部署到生产环境前，必须在反向代理、网络边界或
应用授权层增加认证、授权、限流和审计。
:::

## 继续阅读

- [安装与配置](../installation.md)
- [基本使用](../basic-usage.md)
- [高级特性与生产安全](../advanced-features.md)
- [API 参考](../api-reference.md)
- [常见问题](../faq.md)
