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
- transaction lifecycle APIs

Example (paged query):

```csharp
var page = await _repository.GetObjectListAsync(
    where: x => !x.Flag,
    orderBy: x => x.Id,
    orderingType: OrderingType.Descending,
    pageIndex: 1,
    pageCount: 20);
```

## Collaboration With Service Layer

Avoid scattering complex repository calls directly in controllers/app-services. Prefer wrapping data access in `Senparc.Ncf.Service.ServiceBase<T>` to keep:

- clear transaction boundaries
- consistent tenant context
- unified DTO mapping strategy

## Recommendations

- Keep complex joins and aggregation orchestration in service-level methods.
- Use explicit transactions for multi-step write workflows.
- Keep repository layer focused on generic persistence behavior, not business policy.
