# MCP Advanced Usage and Production Security

## Independent servers per module

NCF creates a separate server name and route for every XNCF module whose
`EnableMcpServer` is `true`:

```text
ServerName: ncf-mcp-server-<module-name-with-dots-replaced-by-hyphens>
McpRoute:   mcp-<module-name-with-dots-replaced-by-hyphens-and-lowercased>
```

This allows tools, permissions, and release cadence to be governed per module.
Do not combine all tools into one public endpoint without an explicit policy.

## Localized tool metadata

The current source supports `LocalizedDescription` for resource-backed tool
and parameter descriptions:

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

The simulated site currently supports `zh-CN`, `en`, `ja`, `fr`, `es`, and
`ru`. Provide stable fallback descriptions so a missing resource does not leave
the model with empty tool metadata.

## Custom registration

`XncfRegisterBase` effectively performs:

```csharp
services.AddMcpServer(...)
    .WithHttpTransport()
    .WithToolsFromAssembly(moduleAssembly);
```

A module may override `AddMcpServer()` or `UseMcpServer()`, but it then owns:

- server naming and `McpServerInfoCollection` registration;
- transport and tool discovery;
- route mapping and collision handling;
- authentication, authorization, error logging, and compatibility validation.

## Production security checklist

The current default route does not enforce the `McpAccessToken` query value.
Deployments should explicitly implement and verify:

1. Authentication at a trusted reverse proxy or application layer.
2. Authorization for each tool, not only for the SSE connection.
3. Human approval or equivalent policy gates for high-risk tools.
4. Least-privileged identities for files, databases, commands, and networks.
5. Connection, tool-call, and task timeouts and cancellation.
6. Request-size, concurrency, and rate limits.
7. Auditing of caller, tool, duration, and status with sensitive-value
   redaction.
8. Idempotency for retries and duplicate requests.

::: danger
`ApprovalMode.NeverRequire` in a source example is suitable only for controlled
demonstrations. Do not copy it to production tools that write data, make
payments, execute commands, or communicate externally.
:::

## Version compatibility

- The NuGet package version comes from `<Version>` in the project file.
- The XNCF module page shows `Register.Version`.
- They serve different purposes; record both in upgrade reports and issues.
- MCP client, transport, and AI Agent APIs evolve quickly. Compile examples
  against the actual referenced packages and run connect, list-tools, and
  tool-call tests before release.
