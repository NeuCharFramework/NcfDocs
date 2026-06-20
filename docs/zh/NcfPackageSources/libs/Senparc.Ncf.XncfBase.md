# Senparc.Ncf.XncfBase

## 定位

`Senparc.Ncf.XncfBase` 是 NCF 模块化引擎基座，定义并实现了 XNCF 模块注册、扫描、生命周期、Function 管理、MCP 集成等核心协议。

## 关键类型

- `IXncfRegister`：模块注册接口
- `XncfRegisterBase`：模块注册基类
- `Register`（静态）：全局启动与扫描入口
- `XncfRegisterManager`：模块注册清单管理
- `FunctionRenderCollection`：Function 扫描结果仓库
- `XncfOrderAttribute`：模块加载优先级

## 1. 启动引擎与扫描

启动入口：

- `Register.StartNcfEngine(IServiceCollection, IConfiguration, IHostEnvironment, string[] dllFilePatterns)`

扫描结果包括：

- `IXncfRegister` 实现类
- `XncfAutoConfigurationMappingAttribute` 标记类
- `AppServiceBase` 子类中的 `[FunctionRender]` 方法

## 2. 模块生命周期

模块通常通过 `Register.cs` 实现：

- `InstallOrUpdateAsync(...)`
- `UninstallAsync(...)`
- `AddXncfModule(...)`
- `UseXncfModule(...)`

如果模块实现 `IXncfDatabase`，还可自动接入数据库上下文与迁移逻辑。

## 3. FunctionRender 机制（当前推荐）

当前版本中，Function 注册依赖：

- 方法级特性：`[FunctionRender(...)]`
- 扫描容器：`Register.FunctionRenderCollection`
- 查询方式：按 `RegisterType` 或 `ModuleUid`

> 历史上 `IXncfRegister.Functions` 列表方式已弱化，不建议继续沿用旧写法。

## 4. MCP 机制

`XncfRegisterBase` 已内置 MCP 集成：

- `EnableMcpServer => true` 时可启用模块 MCP 服务
- `AddMcpServer(...)`：注册 MCP 服务与工具
- `UseMcpServer(...)`：映射 MCP 路由

默认路由模式：`mcp-<module-name-lowercase>`

## 5. 线程与版本辅助

- `Threads/ThreadInfo`、`XncfThreadBuilder`：模块线程管理
- `VersionManager/*`：版本比对与信息管理辅助

## 开发建议

- 新模块以 `XncfRegisterBase` 为唯一注册入口，避免分散式启动代码。
- Function 统一走 `AppService + FunctionRender`，便于后续 AI/MCP 统一集成。
- MCP 对外开放前，先完成鉴权、工具白名单、审计三件事。
