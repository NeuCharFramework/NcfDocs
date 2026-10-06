# 配置多租户

## 多租户概述

多租户（Multi-Tenant）允许多个租户同时使用一套系统，并隔离各自的数据。
是否启用由 `EnableMultiTenant` 控制；`TenantRule` 支持 `DomainName`、
`RequestHeader` 和 `LoginInput`。HTTP 请求中的租户识别由框架中间件和租户服务
完成，业务 Service 复用已初始化的上下文。

## 如何修改多租户配置

首先找到 `Senparc.Web` 项目下的 `appsettings.json` 文件。

<img src="./images/config-mutil-tenant.png" />

## 系统模块的多租户数据表对应

数据库生成后，会自动生成一个多租户的表，如下

<img src="./images/mutil-tenant-table.png" />

## 数据库中其他的表的变化

采用租户隔离的业务表包含 `TenantId` 字段，如下。全局租户注册表以及通过
`IIgnoreMulitTenant` 明确声明的全局实体不按当前租户过滤；不要把它们与普通
租户业务表混为一谈。

<img src="./images/mutil-tenant-table-field.png" />

## 对应关系

TenantInfos 表中管理着所有租户的Id

每个表中的TenantId 都来源于 TenantInfos 表

大家从对应关系即可看出多租户的实现原理

## Service、Repository 与租户过滤

Service 负责业务逻辑，并通过注入的 `IRepositoryBase<TEntity>` 或 ServiceBase
已有的查询、保存方法访问数据。仓储使用的 NCF 上下文统一应用当前租户和软删除
过滤器；普通业务查询不需要重复添加 `TenantId`、`!Flag`，也不应使用
`IgnoreQueryFilters()` 绕开约束。

该过滤器使用的是**当前作用域的租户**，不会自动遍历所有租户，也不会在每次业务
查询中自动检查租户注册表的 `Enable`。HTTP 请求通过框架识别链路使用有效租户；
后台跨租户任务通过下面的公共入口取得启用租户作用域。

## 宿主级后台任务（2026-10-02 开发分支）

`IHostedService` / `BackgroundService` 不经过 HTTP 租户中间件。
`IServiceScopeFactory.CreateScope()` 只创建 DI 作用域，不等于已经识别租户。
这类任务应注入 `Senparc.Ncf.Core.MultiTenant.IBackgroundTenantScopeFactory`，
而不是在业务模块中反射读取租户缓存或手写租户启停判断。

正常 NCF 启动流程已经注册作用域工厂；Tenant 模块注册的
`IBackgroundTenantProvider` 通过现有 `FullTenantInfoCache` 提供启用租户信息。
工厂在解析业务 Service 前填充该作用域的 `RequestTenantInfo`，通常不再需要
额外调用 Service 的 `SetTenantInfo()`。

### 扫描所有启用租户

以 WeixinClaw 账号发现为例，在已注入 `_tenantScopeFactory` 的后台服务中：

```csharp
var accounts = new List<(int TenantId, int AccountId)>();
await _tenantScopeFactory.ForEachEnabledTenantAsync(
    async (services, cancellationToken) =>
    {
        var accountService = services.GetRequiredService<WeixinClawAccountService>();
        accounts.AddRange(
            await accountService.GetPollingAccountsAsync(cancellationToken)
                .ConfigureAwait(false));
    },
    stoppingToken).ConfigureAwait(false);
```

示例使用 `Microsoft.Extensions.DependencyInjection`、
`Senparc.Xncf.WeixinManager.Domain.Services` 和 `System.Collections.Generic`。
每个回调按租户顺序执行，在独立作用域中访问仓储；回调完成、取消或抛出异常后，
工厂会释放作用域。回调中必须等待业务操作完成，不能把 scoped Service 或
`IServiceProvider` 保存到长期任务中；需要继续执行时，只传递账号 ID、租户 ID
等任务元数据，并为每次执行重新取得作用域。

### 执行指定租户的任务

```csharp
using var scope = await _tenantScopeFactory.TryCreateScopeAsync(
    tenantId, stoppingToken).ConfigureAwait(false);
if (scope == null)
{
    return;
}

var accountService = scope.ServiceProvider.GetRequiredService<WeixinClawAccountService>();
var account = await accountService.GetObjectAsync(x => x.Id == accountId)
    .ConfigureAwait(false);
```

`TryCreateScopeAsync` 在指定租户不再启用或不存在时返回 `null`，此时应停止对应
业务任务，不应回退到跨租户查询。返回的作用域由调用方释放，例如上面的
`using var`。WeixinClaw 轮询会在扫描后取消不再活跃的账号任务，并统一处理完成、
宿主退出和取消回调中的资源释放。

### 单租户、异常与升级约束

- 未启用多租户时，遍历入口只执行一次默认作用域；指定租户入口也使用默认
  作用域，不查询租户注册表。
- 启用多租户但缺少 Provider，或返回无效、重复租户信息时，工厂抛出异常，
  不会以租户 ID `0` 或关闭过滤器的方式继续执行。
- 新增公共入口不会自动改造所有已有后台任务；当前 WeixinClaw 已接入，
  其他模块的后台任务应分别检查。
- 本次升级不需要修改实体或新增数据库迁移；需要升级相关基础库和模块，并
  **重启宿主**使新 DI 注册生效。

相关说明：[Core](../../NcfPackageSources/libs/Senparc.Ncf.Core.md)、
[Repository](../../NcfPackageSources/libs/Senparc.Ncf.Repository.md)、
[Service](../../NcfPackageSources/libs/Senparc.Ncf.Service.md)、
[版本升级说明](../../NcfPackageSources/home/version-upgrade-notes.md)。
