# Senparc.Ncf.Core

## 定位

`Senparc.Ncf.Core` 是 NCF 基础运行时核心库，负责承接模块化体系的公共约束与基础能力。`NcfPackageSources` 中大量基础设施（授权、缓存、事件总线、模块扫描、工作上下文）都从这里起步。

## 关键能力

## 1. 模块扫描与启动协作

相关目录：`AssembleScan`、`Areas`、`Area`  
相关类型：`AssembleScanHelper`、`IAreaRegister`

它与 `Senparc.Ncf.XncfBase.Register.StartNcfEngine(...)` 配合，完成：

- 程序集扫描
- XNCF 模块识别
- AppService 扫描
- 基础 DI 注入

## 2. EventBus（高并发事件总线）

相关目录：`EventBus`  
关键文件：`InMemoryEventBus.cs`、`EventBusHostedService.cs`、`EventBusExtensions.cs`

当前版本能力：

- 可配置并发消费
- 失败重试（指数退避）
- 去重处理（事件 ID 窗口）
- 事件链深度控制
- 循环引用检测

推荐配置：

```csharp
services.AddSenparcEventBus(options =>
{
    options.MaxConcurrency = Math.Max(8, Environment.ProcessorCount * 2);
    options.EnableDuplicateDetection = true;
    options.RetryOnFailure = true;
    options.MaxRetryAttempts = 3;
    options.MaxEventChainDepth = 10;
    options.EnableCircularReferenceDetection = true;
}, typeof(YourEventHandler).Assembly);
```

## 3. 授权与权限模型

相关目录：`Authorization`

提供了权限需求声明、过滤器、处理器等基础组件，可被系统模块和业务模块复用。与 `AreaBase` 的后台授权能力组合后，可形成统一管理口径。

## 4. 多租户上下文

相关目录：`MultiTenant`  
关键类型：`RequestTenantInfo`、`TenantRule`、`IBackgroundTenantScopeFactory`、
`BackgroundTenantScopeFactory`、`IBackgroundTenantProvider`

`RequestTenantInfo` 将当前租户信息传递到 Service/Repository 层，NCF 上下文统一
应用租户隔离与软删除过滤器。实现 `IIgnoreMulitTenant` 的全局实体是框架明确声明的
例外，不意味着普通业务代码可以自行关闭过滤器。

宿主级后台任务没有 HTTP 租户识别链路，创建普通 DI 作用域也不会自动识别或遍历
租户。新增的公共入口负责在解析业务 Service 前初始化独立的租户作用域：

- `ForEachEnabledTenantAsync(action, cancellationToken)`：按租户顺序执行回调，
  每次回调使用独立作用域，完成或失败后由工厂释放。
- `TryCreateScopeAsync(tenantId, cancellationToken)`：创建指定启用租户的作用域；
  未找到启用租户时返回 `null`，成功时由调用方释放。
- 未启用多租户时只创建默认作用域，不依赖租户注册表。
- 启用多租户但缺少 Provider，或 Provider 返回无效、重复的租户信息时抛出异常，
  不回退到不受租户限制的查询。

XncfBase 在框架启动时注册工厂；Tenant 模块通过类型化的
`IBackgroundTenantProvider` 复用现有启用租户缓存。业务模块不需要反射读取缓存，
也不需要重新实现多租户控制。详见
[多租户配置与后台任务](../../start/config/mutiple-tenant.md)。

## 5. AppService 基础模型

相关目录：`AppServices`、`Models/AppServices`

提供：

- `AppServiceBase`
- `FunctionRenderAttribute`
- 标准请求响应模型与辅助工具

这是 XNCF Function 能力的基础承载层。

## 6. 配置与运行状态

相关目录：`Config`  
关键类型：`SiteConfig`、`NcfCoreState`

用于维护运行期关键状态（如模块加载阶段状态、系统开关等）。

## 典型使用场景

- 构建跨模块异步协作（EventBus）
- 在后台管理模块中统一权限验证
- 搭建多租户业务隔离基础能力
- 为扩展模块提供统一 AppService 执行模型

## 使用建议

- 涉及全局行为（鉴权、事件、配置）优先在 `Core` 层抽象，不要散落到业务模块。
- EventBus 默认无持久化，关键业务应追加 Outbox 或持久化消息方案。
- 多租户能力上线前，务必验证租户上下文是否在异步流程中正确传递。
