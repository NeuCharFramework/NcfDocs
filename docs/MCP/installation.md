# MCP Installation and Configuration

> Applies to .NET 10 and was checked against the `NcfPackageSources`
> development line on 2026-07-27.

## 1. Choose an installation method

### NCF installer or module manager

On first installation of the simulated site, `Senparc.Xncf.MCP` is selected by
default under Advanced Options. On an existing site, install and enable it from
the admin module manager.

This is the recommended method for NCF applications. The framework performs
module scanning, service registration, and route mapping automatically.

### NuGet reference

The package version in the current source project is `0.4.0-preview3`:

```bash
dotnet add package Senparc.Xncf.MCP --version 0.4.0-preview3
```

If that preview is not available from your NuGet source, use a version that is
actually published there or use a `ProjectReference` in a source-development
solution. Do not use the module's internal `Register.Version` (currently
`0.1.0`) as the NuGet package version.

## 2. Automatic registration

Current NCF applications do not need manual `AddMcpServer()` or
`MapMcp("sse")` calls in `Startup.cs`. A module declares:

```csharp
public override bool EnableMcpServer => true;
```

During startup, NCF automatically:

- calls the module's `AddMcpServer()`;
- scans for `[McpServerToolType]`;
- enables HTTP transport;
- calls `UseMcpServer()` to map the module route.

## 3. Start the site and locate the endpoint

For the source simulated site:

```bash
dotnet run \
  --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj \
  --launch-profile http
```

The `Senparc.Xncf.MCP` endpoint is:

```text
http://localhost:5000/mcp-senparc-xncf-mcp/sse
```

Another module follows the same rule. For example, `Org.Xncf.Sample` maps to:

```text
http://localhost:5000/mcp-org-xncf-sample/sse
```

You can also read `McpRoute` from
`XncfRegisterManager.McpServerInfoCollection` instead of duplicating the route
algorithm in application code.

## 4. Verification checklist

1. The module was scanned and `EnableMcpServer` is `true`.
2. Startup logs do not report incomplete service registration or an MCP route
   mapping failure.
3. The tool assembly contains at least one `[McpServerToolType]` type.
4. An MCP client or the NCF MCP invocation function can connect to the complete
   `/sse` URL.

Opening an SSE endpoint in a browser can leave the page waiting for events.
That is normal for a long-lived connection and is not a complete health check.

## 5. Production configuration

::: warning Current source boundary
`SenparcCoreSetting.McpAccessToken` still exists, but the current automatically
mapped route does not enable its query-string validation. Do not treat adding
`?token=...` as working authentication.
:::

Before exposing MCP, provide at least:

- HTTPS;
- authentication and authorization at a trusted proxy or application layer;
- tool allowlists and least privilege;
- IP or network-scope controls;
- rate limits, timeouts, call logs, and sensitive-value redaction.

Next: [Basic usage](./basic-usage.md).
