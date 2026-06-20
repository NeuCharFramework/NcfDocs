# Senparc.Ncf.Core

## Positioning

`Senparc.Ncf.Core` is the foundational runtime core of NCF. It provides the shared infrastructure that module-level code relies on: authorization, cache, event bus, assembly scanning, work context, and app-service baseline contracts.

## Key Capabilities

## 1. Startup and Assembly Coordination

Related folders: `AssembleScan`, `Areas`, `Area`  
Related types: `AssembleScanHelper`, `IAreaRegister`

Together with `Senparc.Ncf.XncfBase.Register.StartNcfEngine(...)`, it supports:

- assembly scanning
- XNCF module discovery
- AppService scanning
- baseline DI registration

## 2. EventBus (High-Concurrency)

Related folder: `EventBus`  
Core files: `InMemoryEventBus.cs`, `EventBusHostedService.cs`, `EventBusExtensions.cs`

Current capabilities:

- configurable concurrent consumption
- retry with exponential backoff
- event deduplication by event ID window
- chain depth limits
- circular reference detection

Recommended registration:

```csharp
services.AddSenparcEventBus(options =>
{
    options.MaxConcurrency = Math.Max(8, Environment.ProcessorCount * 2);
    options.EnableDuplicateDetection = true;
    options.RetryOnFailure = true;
    options.MaxRetryAttempts = 3;
    options.MaxEventChainDepth = 10;
    options.EnableCircularReferenceDetection = true;
}, typeof(YourEventHandler).Assembly);
```

## 3. Authorization Foundation

Related folder: `Authorization`

Provides permission requirements, filters, handlers, and reusable authorization primitives for both system and business modules.

## 4. Multi-Tenant Context

Related folder: `MultiTenant`  
Key types: `RequestTenantInfo`, `TenantRule`

Delivers tenant context propagation into Service/Repository layers and supports explicit tenant-ignore contracts when needed.

## 5. AppService Contracts and Helpers

Related folders: `AppServices`, `Models/AppServices`

Includes:

- `AppServiceBase`
- `FunctionRenderAttribute`
- shared request/response and app-service helper model

This is the base layer behind XNCF function execution.

## 6. Runtime Configuration and State

Related folder: `Config`  
Key types: `SiteConfig`, `NcfCoreState`

Holds important runtime state and configuration switches used across module initialization and execution.

## Typical Use Cases

- cross-module asynchronous collaboration via EventBus
- unified admin authorization baseline
- multi-tenant request isolation support
- shared app-service model for extensions

## Recommendations

- Keep global behavior concerns (auth/event/config) at Core level.
- EventBus is in-memory by default; use Outbox/persistent queue strategy for critical business chains.
- Validate tenant-context propagation carefully in async flows before production release.
