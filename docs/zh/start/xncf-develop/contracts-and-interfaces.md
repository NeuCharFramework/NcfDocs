# XNCF 二次开发接口与边界

> 本页面向使用 NCF Template 或 XncfBuilder 模板开发业务模块的开发者，
> 只说明稳定的扩展入口和使用约定，不展开框架内部的扫描、反射和执行源码。

## 先判断你需要哪一层文档

| 你的目标                                     | 阅读入口                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| 基于 Template 新建、扩展或发布 XNCF 模块     | 本页和“Template 二次开发”章节                                                 |
| 调试框架为何扫描、注册或执行某个接口         | [NcfPackageSources 源码指南](/zh/NcfPackageSources/home/)                     |
| 修改 NCF 基础库、同步模板或向官方仓库提交 PR | [项目关系、同步与发布](/zh/NcfPackageSources/home/project-relationships.html) |

通常的业务模块只需要第一层，不必先理解框架内部实现。

## 必需的模块契约

每个 XNCF 模块至少需要一个带 `[XncfRegister]` 的注册类，并继承
`XncfRegisterBase`、实现 `IXncfRegister`。实际开发时通常直接保留模板生成的
`Register.cs`，再修改下列成员：

| 成员或方法                        | 二次开发约定                                    |
| --------------------------------- | ----------------------------------------------- |
| `Name`                            | 模块的稳定唯一名称，通常使用完整命名空间        |
| `Uid`                             | 全局唯一且发布后保持不变；不要在升级时重新生成  |
| `Version`                         | 模块安装与升级生命周期版本，不等于 NuGet 包版本 |
| `MenuName`、`Icon`、`Description` | 后台展示信息，可接入模块本地化资源              |
| `InstallOrUpdateAsync()`          | 初始化数据、迁移数据库或执行兼容升级            |
| `UninstallAsync()`                | 定义卸载行为；生产模块应明确数据保留策略        |
| `AddXncfModule()`                 | 注册模块依赖、映射和应用服务                    |
| `UseXncfModule()`                 | 挂载静态文件、中间件等运行时能力                |

不要再添加旧教程中的 `IXncfFunction` 或 `Functions` 列表。当前 Function
入口是 `AppServiceBase` 方法。

## Function 契约

一个可执行 Function 通常由三部分组成：

1. 应用服务继承 `AppServiceBase`；
2. 可执行方法标注 `[FunctionRender(...)]`；
3. 请求模型继承 `FunctionAppRequestBase`。

请求模型可使用 DataAnnotations、`LocalizedDescription` 和
`FunctionParameterUi` 描述校验、本地化和输入控件。响应类型使用当前 NCF
公共响应模型。模板已经给出完整样例，业务开发优先复制同版本模板中的模式，
不要依赖框架内部扫描实现。

## 按需实现的扩展接口

这些接口不是每个模块都需要：

| 需求             | 扩展入口                                               | 模板中的常见位置                            |
| ---------------- | ------------------------------------------------------ | ------------------------------------------- |
| 模块数据库与迁移 | `IXncfDatabase`                                        | `Register.Database.cs`、`Domain/Migrations` |
| 后台 Razor Area  | `IAreaRegister`                                        | `Register.Area.cs`、`Areas/Admin`           |
| Razor 运行时编译 | `IXncfRazorRuntimeCompilation`                         | 有运行时 Razor 需求时实现                   |
| 模块中间件       | `IXncfMiddleware`                                      | 在注册类中按需实现                          |
| 后台常驻任务     | `IHostedService` / `BackgroundService` / `IXncfThread` | 按任务的宿主生命周期管理方式选用            |
| 租户后台执行     | `IBackgroundTenantScopeFactory`                        | 托管任务中复用框架初始化的租户作用域        |
| MCP Server       | `EnableMcpServer => true` 和 MCP Tool 特性             | 模块注册类与 Tool 类                        |

选择原则很简单：模板中已经存在且业务需要的能力可以保留；不需要的能力不要
为了“结构完整”而实现。特别是数据库卸载、后台线程和对外 MCP，必须同时考虑
数据安全、停止机制、鉴权和审计。

## Service 与数据访问边界

- Service 继承 `ServiceBase<TEntity>`，注入现有 `IRepositoryBase<TEntity>` 并
  传给基类，负责业务规则、事务和跨服务编排。
- 普通 CRUD 复用 ServiceBase 的方法；需要组合查询或投影时使用现有
  `RepositoryBase.GeAll(...)`。不要仅为普通查询重复创建模块仓储。
- 普通业务代码不直接解析 DbContext，也不通过 `IgnoreQueryFilters()` 或手写
  `TenantId` / `!Flag` 条件替代框架统一的租户、软删除约束。
- 宿主级后台任务注入 `IBackgroundTenantScopeFactory`，在其初始化的独立作用域
  中解析 Service；不反射租户缓存，不重复实现启停或识别。作用域外只保留任务
  元数据，任务本身仍负责取消与资源释放。

完整示例与约束见 [多租户配置与后台任务](../config/mutiple-tenant.md)、
[Service 指南](../../NcfPackageSources/libs/Senparc.Ncf.Service.md) 和
[Repository 指南](../../NcfPackageSources/libs/Senparc.Ncf.Repository.md)。

## Template 开发者不需要先了解的内容

以下内容属于框架源码剖析，不是创建业务模块的前置知识：

- `StartNcfEngine()` 如何扫描程序集和排序模块；
- `FunctionRenderCollection` 如何由反射结果生成；
- XNCF 基类内部如何映射 MCP 路由；
- 多数据库底层实现、仓储基类和运行时装配细节；
- 模拟站点、NCF 仓库与 NuGet 模板之间的同步实现。

当你要调试或修改这些行为时，再进入
[NcfPackageSources 源码剖析](/zh/NcfPackageSources/home/)；否则以当前模板生成的
代码和公共契约为准。

## 推荐顺序

1. [创建第一个 XNCF 模块](./create-xncf.md)
2. [当前 XNCF 模板结构](./about-custom-xncf.md)
3. [开发 XNCF](./dev-xncf.md)
4. [手工创建最小 XNCF 模块](/zh/start/developer/xncf_module.html)（仅在需要理解最小组成时）
