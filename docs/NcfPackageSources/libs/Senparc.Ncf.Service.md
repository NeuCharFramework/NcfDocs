# Senparc.Ncf.Service

## Positioning

`Senparc.Ncf.Service` is the business-service layer above Repository. It provides transaction orchestration, mapping support, and cross-repository composition as the recommended location for domain/application logic.

## Key Types

- `IServiceBase<T>`
- `ServiceBase<T>`
- `ServiceDataBase`
- `DtoServiceBase`
- `ResilientTransaction`

Core folders: `ServiceBase`, `System`, `Common`

## Core APIs

- `GetObjectAsync / GetObjectListAsync / GetFullListAsync`
- `SaveObjectAsync / DeleteObjectAsync / SaveObjectListAsync`
- `BeginTransactionAsync(...) / CommitTransaction() / RollbackTransaction()`
- `Mapping<TDto>(entity)`
- `SetTenantInfo(RequestTenantInfo)`

## Recommended Pattern

```csharp
public class DemoService : ServiceBase<DemoEntity>
{
    public DemoService(IRepositoryBase<DemoEntity> repo, IServiceProvider serviceProvider)
        : base(repo, serviceProvider)
    {
    }

    public async Task<DemoEntity> GetByCodeAsync(string code)
    {
        return await GetObjectAsync(x => x.Code == code);
    }
}
```

## Division of Responsibilities

- Repository: generic persistence primitives.
- Service: business rules, transaction boundaries, cross-repository workflows, DTO mapping.

`IRepositoryBase<T>` in the example comes from `Senparc.Ncf.Repository`. The
framework already registers generic repositories. Services reuse those
capabilities instead of accessing DbContext directly or adding module
repositories for ordinary queries. This example composes a database-side
projection and cancellable query inside a Service using the existing repository;
import `Microsoft.EntityFrameworkCore` and `Senparc.Ncf.Core.Enums`:

```csharp
public async Task<List<int>> GetEnabledIdsAsync(CancellationToken cancellationToken)
{
    return await RepositoryBase.GeAll(x => x.Id, OrderingType.Ascending)
        .AsNoTracking()
        .Where(x => x.Enabled)
        .Select(x => x.Id)
        .ToListAsync(cancellationToken)
        .ConfigureAwait(false);
}
```

Tenant isolation and soft deletion remain centralized below the Service, which
adds only business predicates. Normal HTTP requests already have their context
initialized by tenant middleware and do not need `SetTenantInfo()` on every
call. Host-wide background tasks should obtain an initialized scope through
`IBackgroundTenantScopeFactory` and resolve their Services from that scope. Do
not copy tenant identification, enablement checks, or cache reflection into a
business module.

For partial saves, reuse the repository's `SavePropertiesAsync`; see the
[Repository Guide](./Senparc.Ncf.Repository.md). Background scope examples are
in [Multi-Tenant Configuration and Background Work](../../start/config/mutiple-tenant.md).

## Recommendations

- Keep business logic in services, not in controllers/app-services.
- Make multi-step writes explicitly transactional.
- Validate tenant context early when handling tenant-isolated data.
