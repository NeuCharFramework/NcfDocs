# IXncfRegister Interface (Current)

> Baseline: `src/Basic/Senparc.Ncf.XncfBase/Interfaces/IXncfRegister.cs` (current version)

## 1. Contract Responsibility

`IXncfRegister` is the module registration contract for each XNCF module. It defines:

- module metadata (Name/Uid/Version/MenuName/Icon/Description)
- module lifecycle hooks
- AutoMapper mapping hooks
- module thread information
- MCP enablement and registration hooks

## 2. Key Properties

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

## 3. Key Methods

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

## 4. Implementation Notes (Important)

- `IList<Type> Functions` is commented out in the current contract and should not be treated as the primary registration path.
- The recommended function model is `[FunctionRender]` scanning on AppService methods.
- `AddXncfModule` includes `IHostEnvironment env` in the method signature.
- MCP members are part of the contract (`EnableMcpServer`, `AddMcpServer`, `UseMcpServer`).

## 5. Recommended Implementation Pattern

For new modules, inherit from `XncfRegisterBase` and override only required points:

- metadata
- install/uninstall behavior
- DI registration in `AddXncfModule`
- middleware/static resource registration in `UseXncfModule`
- MCP enablement via `EnableMcpServer => true` when needed
