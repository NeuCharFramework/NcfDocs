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
    public DemoService(IServiceProvider serviceProvider) : base(serviceProvider)
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

## Recommendations

- Keep business logic in services, not in controllers/app-services.
- Make multi-step writes explicitly transactional.
- Validate tenant context early when handling tenant-isolated data.
