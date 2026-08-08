# MCP FAQ

## Why does the endpoint return 404?

Check in this order:

1. The module's `EnableMcpServer` is `true`.
2. The module assembly was scanned and registered.
3. Startup logs do not report service or route registration failure.
4. The URL contains the full module route, for example
   `http://localhost:5000/mcp-senparc-xncf-mcp/sse`.
5. The client is not using the obsolete `/sse/sse` path.

## Why does the browser keep loading the endpoint?

SSE is a long-lived connection. Waiting for events is not itself a failure.
Use an MCP client to complete a connect, list-tools, and side-effect-free
tool-call test.

## Why is the server registered but no tools are listed?

- The tool type needs `[McpServerToolType]`.
- Tool methods need `[McpServerTool]`.
- The default implementation scans only the module `Register` assembly.
- Check startup output for the "no MCP Tool Type detected" message.

## Why do I not receive 401 after setting `McpAccessToken`?

The current automatic `MapMcp(routePattern)` path does not enable that token's
query-string check. Old `?token=...` examples do not prove authentication is
active. Implement and test authentication at a trusted proxy or application
authorization layer, and do not expose the default endpoint directly.

## Why does NuGet show `0.4.0-preview3` while the module page shows `0.1.0`?

`<Version>` in the project file is the NuGet package version.
`Register.Version` is the XNCF module lifecycle version. They are not currently
required to match, so provide both when reporting an issue.

## Why can the MCP call not use an AI model?

MCP server registration and AI model configuration are separate paths. Before
using MCP Manager's AI invocation function, configure a working chat model,
credentials, and network access in AIKernel.

## What is the minimum production baseline?

- HTTPS;
- authentication and per-tool authorization;
- tool allowlists and least privilege;
- rate limits, timeouts, cancellation, and idempotency;
- audited calls with sensitive-data redaction;
- human approval or an equivalent gate for high-risk operations.
