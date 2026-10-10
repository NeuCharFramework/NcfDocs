# Senparc.Ncf.Repository

## Positioning

`Senparc.Ncf.Repository` is the EF Core-based data access abstraction in NCF. It standardizes query, CRUD, paging, sorting, and transaction primitives for upper layers.

## Key Types

- `IRepositoryBase<T>`: repository contract
- `RepositoryBase<T>`: default implementation
- `IClientRepositoryBase<T>` / `ClientRepositoryBase<T>`: client-side repository abstraction
- `XncfModuleRepository`: module metadata repository

Core folders: `BaseRepoisitory`, `System`

## Capability Overview

`IRepositoryBase<T>` includes:

- sync/async conditional querying and paging
- dynamic order-by field support
- count/sum aggregation
- batch save/delete operations
- selected-property updates for tracked entities (`SavePropertiesAsync`)
- transaction lifecycle APIs

Example (paged query):

```csharp
var page = await _repository.GetObjectListAsync(
    where: x => true,
    orderBy: x => x.Id,
    orderingType: OrderingType.Descending,
    pageIndex: 1,
    pageCount: 20);
```

## Collaboration With Service Layer

An XNCF Service receives `IRepositoryBase<TEntity>` through its constructor and
passes it to `ServiceBase<TEntity>`. Prefer the existing ServiceBase delegates
for ordinary queries, saves, and deletes. For projections, composed filters, or
cancellation tokens, start from the existing `RepositoryBase.GeAll(...)` query
entry and compose LINQ. Do not create a module repository merely to wrap ordinary
CRUD.

Business Services, AppServices, and HostedServices should not resolve a DbContext,
call `DbContext.Set<TEntity>()`, or bypass framework constraints with
`IgnoreQueryFilters()`. The NCF context used by the repository applies tenant
isolation and soft-delete query filters centrally; business predicates do not
need repeated `TenantId` or `!Flag` conditions. Database installation, migration,
and backup are infrastructure operations rather than ordinary business queries
and retain their infrastructure entry points.

Wrap business methods in `Senparc.Ncf.Service.ServiceBase<T>` to keep:

- clear transaction boundaries
- consistent tenant context
- unified DTO mapping strategy

## Selected-Property Updates

`SavePropertiesAsync(entity, propertyNames)` updates only the selected properties
of the supplied entity. For example, saving a completed workflow's runtime state
must not overwrite a newer graph definition or revision with the definition read
when execution started:

```csharp
await _repository.SavePropertiesAsync(
    workflow,
    nameof(workflow.LastSucceeded),
    nameof(workflow.LastError),
    nameof(workflow.LastUpdateTime));
```

- The entity must already be persisted and tracked by the current repository
  context. Obtain it through a normal repository query first.
- Specify at least one mapped, non-key property. New, detached, or deleted
  entities and invalid properties cause an exception.
- The property restriction applies to the supplied entity. The method still
  commits through the current context's `SaveChangesAsync`; it is not an
  entity-local transaction or concurrency lock.
- Use `SaveObjectAsync` / `SaveAsync` for ordinary full saves; use partial updates
  only when required by the business operation.

For background tenant scope initialization, see
[Multi-Tenant Configuration and Background Work](../../start/config/mutiple-tenant.md).

## Recommendations

- Keep complex joins and aggregation orchestration in service-level methods.
- Use explicit transactions for multi-step write workflows.
- Keep repository layer focused on generic persistence behavior, not business policy.
