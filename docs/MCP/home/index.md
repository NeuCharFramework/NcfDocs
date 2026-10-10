# MCP (Model Context Protocol) Module

> Checked against the `NcfPackageSources` development line on 2026-07-27.
> Current source package version: `Senparc.Xncf.MCP` `0.4.0-preview3`

NCF registers an MCP server as a capability of an XNCF module. When a module
enables `EnableMcpServer`, the framework scans that module assembly for MCP
tools, registers an HTTP transport, and maps an independent route for the
module.

## Current registration flow

1. The module `Register` returns `EnableMcpServer => true`.
2. Tool types use `[McpServerToolType]`; tool methods use `[McpServerTool]`.
3. `XncfRegisterBase.AddMcpServer()` registers `WithHttpTransport()`.
4. `XncfRegisterBase.UseMcpServer()` maps the module route.

The route convention is:

```text
/mcp-<full-module-name-with-dots-replaced-by-hyphens-and-lowercased>/sse
```

For `Senparc.Xncf.MCP`, the local HTTP endpoint is:

```text
http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

The `/sse/sse` URL shown by older documentation is not the default endpoint of
the current XNCF auto-registration flow.

## MCP Manager and module MCP servers

- `Senparc.Xncf.MCP` provides sample tools, endpoint management, and an MCP
  invocation entry point.
- Any XNCF module can expose its own MCP server; tools do not have to be
  centralized in MCP Manager.
- Registered services are stored in
  `XncfRegisterManager.McpServerInfoCollection` so admin functions can select a
  server and build its full endpoint.

## Security boundary

::: danger Do not expose the default endpoint directly
The currently executed `MapMcp(routePattern)` path does not enable the
`McpAccessToken` query-string check. Having an `McpAccessToken` setting does not
mean the MCP route uses it for authorization. Before production exposure, add
authentication, authorization, rate limiting, and auditing at a trusted reverse
proxy, network boundary, or application authorization layer.
:::

## Continue reading

- [Installation and configuration](../installation.md)
- [Basic usage](../basic-usage.md)
- [Advanced usage and production security](../advanced-features.md)
- [API reference](../api-reference.md)
- [FAQ](../faq.md)
