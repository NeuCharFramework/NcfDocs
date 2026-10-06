# Senparc.Ncf.Repository

## 定位

`Senparc.Ncf.Repository` 是 NCF 的数据访问层抽象，封装了基于 EF Core 的通用仓储能力，向上提供统一 CRUD、分页、排序、事务等访问接口。

## 关键类型

- `IRepositoryBase<T>`：仓储接口定义
- `RepositoryBase<T>`：默认实现
- `IClientRepositoryBase<T>` / `ClientRepositoryBase<T>`：客户端侧仓储抽象
- `XncfModuleRepository`：模块元数据仓储

核心目录：`BaseRepoisitory`、`System`

## 能力概览

`IRepositoryBase<T>` 提供：

- 条件查询与分页（同步/异步）
- 动态排序字段查询
- 统计与聚合（Count/Sum）
- 批量保存/批量删除
- 已跟踪实体的指定字段保存（`SavePropertiesAsync`）
- 事务管理（Begin/Commit/Rollback）

示例（按条件分页）：

```csharp
var page = await _repository.GetObjectListAsync(
    where: x => true,
    orderBy: x => x.Id,
    orderingType: OrderingType.Descending,
    pageIndex: 1,
    pageCount: 20);
```

## 与 Service 层协作方式

XNCF Service 通过构造函数注入 `IRepositoryBase<TEntity>`，并传给
`ServiceBase<TEntity>`。普通查询、保存和删除优先使用 ServiceBase 已提供的委托
方法；需要投影、组合筛选或取消令牌时，可从现有 `RepositoryBase.GeAll(...)`
取得查询入口，再组合 LINQ。不应为了包装普通 CRUD 而另建一套模块仓储。

不要在业务 Service、AppService 或 HostedService 中解析 DbContext、调用
`DbContext.Set<TEntity>()`，或通过 `IgnoreQueryFilters()` 绕开框架约束。
租户隔离和软删除由仓储使用的 NCF 上下文全局过滤器统一应用；业务筛选条件不需要
重复写 `TenantId` 或 `!Flag`。数据库安装、迁移、备份等基础设施操作不属于普通
业务查询，应保留各自的基础设施入口。

通过 `Senparc.Ncf.Service` 的 `ServiceBase<T>` 封装业务方法，保持：

- 事务边界清晰
- 租户上下文一致
- DTO 映射统一

## 指定字段保存

`SavePropertiesAsync(entity, propertyNames)` 用于只更新传入实体的指定字段。
例如，工作流结束后保存运行状态，不应将执行开始时读取的旧图定义或修订号覆盖
回数据库：

```csharp
await _repository.SavePropertiesAsync(
    workflow,
    nameof(workflow.LastSucceeded),
    nameof(workflow.LastError),
    nameof(workflow.LastUpdateTime));
```

- 实体必须已经持久化，并由当前仓储上下文跟踪；先通过正常仓储查询取得实体。
- 至少指定一个已映射、非主键字段；新增、游离、待删除实体或无效字段会抛出异常。
- 指定字段的限制针对传入实体。该方法仍通过当前上下文的 `SaveChangesAsync`
  提交；不要把它当作独立实体事务或并发锁。
- 普通完整保存仍使用 `SaveObjectAsync` / `SaveAsync`；局部更新按实际业务需要使用。

后台任务如何获得正确的租户作用域，见
[多租户配置与后台任务](../../start/config/mutiple-tenant.md)。

## 实战建议

- 复杂联表与聚合查询，优先在 Service 层封装成稳定方法。
- 对批量写操作开启明确事务，不依赖隐式行为。
- 保持仓储层“通用能力”职责，避免写入过多业务策略。
