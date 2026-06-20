# Senparc.Ncf.Service

## 定位

`Senparc.Ncf.Service` 位于 Repository 之上，负责业务服务层抽象、事务封装、对象映射和跨仓储编排，是 NCF 推荐的业务逻辑落点。

## 关键类型

- `IServiceBase<T>`：服务层接口
- `ServiceBase<T>`：通用服务基类
- `ServiceDataBase`：服务通用上下文能力
- `DtoServiceBase`：DTO 风格服务支持
- `ResilientTransaction`：事务处理辅助

核心目录：`ServiceBase`、`System`、`Common`

## 核心能力

- `GetObjectAsync / GetObjectListAsync / GetFullListAsync`
- `SaveObjectAsync / DeleteObjectAsync / SaveObjectListAsync`
- `BeginTransactionAsync(...) / CommitTransaction() / RollbackTransaction()`
- `Mapping<TDto>(entity)`（统一映射入口）
- `SetTenantInfo(RequestTenantInfo)`（租户上下文注入）

## 推荐使用方式

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

## 与 Repository 的分工建议

- Repository：通用数据访问能力。
- Service：业务规则、事务边界、跨仓储协作、DTO 映射。

## 实战建议

- 业务代码优先写在 Service，不要在 Controller/AppService 直接拼装复杂查询。
- 对“多步写入”务必显式事务化。
- 涉及租户数据时，在服务入口尽早确认租户上下文。
