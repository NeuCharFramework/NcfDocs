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
- 事务管理（Begin/Commit/Rollback）

示例（按条件分页）：

```csharp
var page = await _repository.GetObjectListAsync(
    where: x => !x.Flag,
    orderBy: x => x.Id,
    orderingType: OrderingType.Descending,
    pageIndex: 1,
    pageCount: 20);
```

## 与 Service 层协作方式

建议不要在业务逻辑中直接散落复杂仓储调用，而应通过 `Senparc.Ncf.Service` 的 `ServiceBase<T>` 做统一封装，保持：

- 事务边界清晰
- 租户上下文一致
- DTO 映射统一

## 实战建议

- 复杂联表与聚合查询，优先在 Service 层封装成稳定方法。
- 对批量写操作开启明确事务，不依赖隐式行为。
- 保持仓储层“通用能力”职责，避免写入过多业务策略。
