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
Key types: `RequestTenantInfo`, `TenantRule`, `IBackgroundTenantScopeFactory`,
`BackgroundTenantScopeFactory`, `IBackgroundTenantProvider`

`RequestTenantInfo` propagates the current tenant into Service/Repository
layers. The NCF context centrally applies tenant isolation and soft-delete
filters. Global entities implementing `IIgnoreMulitTenant` are explicitly
declared framework exceptions, not a reason for ordinary business code to
disable filters.

Host-wide background tasks do not pass through HTTP tenant identification, and
creating a normal DI scope neither identifies nor enumerates tenants. The new
public entry point initializes independent tenant scopes before resolving
business Services:

- `ForEachEnabledTenantAsync(action, cancellationToken)` executes callbacks in
  tenant order. Each callback receives an independent scope that the factory
  disposes after completion or failure.
- `TryCreateScopeAsync(tenantId, cancellationToken)` creates a scope for a
  specified enabled tenant. It returns `null` when no enabled tenant matches;
  successful scopes are disposed by the caller.
- Single-tenant mode creates only the default scope and does not depend on the
  tenant registry.
- Multi-tenant mode throws if the Provider is missing or returns invalid or
  duplicate tenant information; it never falls back to tenant-unrestricted
  queries.

XncfBase registers the factory during framework startup. The Tenant module's
typed `IBackgroundTenantProvider` reuses the existing enabled-tenant cache.
Business modules do not need cache reflection or their own multi-tenant
control implementation. See
[Multi-Tenant Configuration and Background Work](../../start/config/mutiple-tenant.md).

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
