# IXncfRegister 接口（当前版本）

> 基线：`src/Basic/Senparc.Ncf.XncfBase/Interfaces/IXncfRegister.cs`（当前版本）

## 1. 接口职责

`IXncfRegister` 是每个 XNCF 模块的“注册契约”，用于定义：

- 模块元数据（Name/Uid/Version/MenuName/Icon/Description）
- 模块生命周期（安装、卸载、服务注册、管道接入）
- AutoMapper 映射挂载
- 模块线程信息
- MCP 服务开关与注册

## 2. 关键属性

```csharp
bool IgnoreInstall { get; }
bool EnableMcpServer { get; }
string Name { get; }
string Uid { get; }
string Version { get; }
string MenuName { get; }
string Icon { get; }
string Description { get; }
ConcurrentBag<Action<Profile>> AutoMapMappingConfigs { get; set; }
IEnumerable<KeyValuePair<ThreadInfo, Thread>> RegisteredThreadInfo { get; }
```

## 3. 关键方法

```csharp
Task InstallOrUpdateAsync(IServiceProvider serviceProvider, InstallOrUpdate installOrUpdate);
Task UninstallAsync(IServiceProvider serviceProvider, Func<Task> unsinstallFunc);

string GetAreaHomeUrl();
string GetAreaUrl(string path);

IServiceCollection AddXncfModule(IServiceCollection services, IConfiguration configuration, IHostEnvironment env);
void AddAutoMapMapping(Action<Profile> mapping);
void OnAutoMapMapping(IServiceCollection services, IConfiguration configuration);

IApplicationBuilder UseXncfModule(IApplicationBuilder app, IRegisterService registerService);

void AddMcpServer(IServiceCollection services, IXncfRegister xncfRegister);
void UseMcpServer(IApplicationBuilder app, IRegisterService registerService);
```

## 4. 当前实现注意点（重要）

- `IList<Type> Functions` 在当前接口中为注释状态，不作为主注册机制。
- Function 推荐通过 `AppService` 方法上的 `[FunctionRender]` 自动扫描注册。
- `AddXncfModule` 的签名包含 `IHostEnvironment env`，实现时不要遗漏。
- MCP 能力已进入接口契约：`EnableMcpServer / AddMcpServer / UseMcpServer`。

## 5. 推荐实现方式

新模块请继承 `XncfRegisterBase`，只覆盖必要点：

- 基本元数据（Name/UId/Version/MenuName/Icon/Description）
- 安装与卸载行为
- DI 注册（`AddXncfModule`）
- 中间件/静态资源接入（`UseXncfModule`）
- 如需 MCP：重写 `EnableMcpServer => true`
