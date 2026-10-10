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

## 与 Repository 的分工建议

- Repository：通用数据访问能力。
- Service：业务规则、事务边界、跨仓储协作、DTO 映射。

示例中的 `IRepositoryBase<T>` 来自 `Senparc.Ncf.Repository`。框架已经注册通用
仓储；Service 复用其能力，而不是直接操作 DbContext 或为普通查询另写模块仓储。
下面是 Service 内通过现有仓储进行数据库端投影和可取消查询的示例，
需要引用 `Microsoft.EntityFrameworkCore` 和 `Senparc.Ncf.Core.Enums`：

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

租户隔离与软删除继续由底层统一处理，Service 只添加业务筛选。正常 HTTP 请求
已经由多租户中间件初始化上下文，无需每次调用 `SetTenantInfo()`。宿主级后台任务
应通过公共 `IBackgroundTenantScopeFactory` 获取已初始化的作用域，再从该作用域
解析 Service；不要在业务模块中复制租户识别、启停判断或缓存反射代码。

需要局部保存时复用仓储的 `SavePropertiesAsync`，见
[Repository 指南](./Senparc.Ncf.Repository.md)；后台作用域示例见
[多租户配置与后台任务](../../start/config/mutiple-tenant.md)。

## 实战建议

- 业务代码优先写在 Service，不要在 Controller/AppService 直接拼装复杂查询。
- 对“多步写入”务必显式事务化。
- 涉及租户数据时，在服务入口尽早确认租户上下文。
