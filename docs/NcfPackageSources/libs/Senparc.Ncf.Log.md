# Senparc.Ncf.Log

## Positioning

`Senparc.Ncf.Log` provides structured logger access wrappers in NCF, including domain-specific logger channels for system and business diagnostics.

## Key Types

- `LogUtility`: named logger entry points
- `NLogExtension`: NLog helper extensions

`LogUtility` includes built-in channels such as:

- `WebLogger`
- `SystemLogger`
- `OperationQueue`
- `SmsLogger`
- `AdminUserInfo`

## Typical Usage

```csharp
LogUtility.SystemLogger.Info("System startup completed");
LogUtility.WebLogger.Error("Request failed");
```

## Recommendations

- Keep logger channel naming stable and domain-oriented.
- Include module UID/request context/tenant summary in error logs.
- For AI/MCP chains, log call path and latency explicitly.
