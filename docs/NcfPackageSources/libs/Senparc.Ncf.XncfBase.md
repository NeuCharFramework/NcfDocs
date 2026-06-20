# Senparc.Ncf.XncfBase

## Positioning

`Senparc.Ncf.XncfBase` is the modular engine foundation of NCF. It defines and implements module registration, scanning, lifecycle management, function discovery, and MCP integration contracts.

## Key Types

- `IXncfRegister`: module registration contract
- `XncfRegisterBase`: default module register base class
- static `Register`: global startup and scan entry
- `XncfRegisterManager`: module register list manager
- `FunctionRenderCollection`: discovered function storage
- `XncfOrderAttribute`: loading priority attribute

## 1. Engine Startup and Scan

Startup entry:

- `Register.StartNcfEngine(IServiceCollection, IConfiguration, IHostEnvironment, string[] dllFilePatterns)`

Scan targets:

- `IXncfRegister` implementations
- `XncfAutoConfigurationMappingAttribute` types
- `[FunctionRender]` methods in `AppServiceBase` descendants

## 2. Module Lifecycle

Typical module `Register.cs` implements:

- `InstallOrUpdateAsync(...)`
- `UninstallAsync(...)`
- `AddXncfModule(...)`
- `UseXncfModule(...)`

For modules implementing `IXncfDatabase`, database context wiring and migration hooks are integrated.

## 3. FunctionRender Model (Current Recommended Path)

In the current version:

- registration is method-level via `[FunctionRender(...)]`
- discovered functions are stored in `Register.FunctionRenderCollection`
- query is supported by register type or module UID

> Legacy `IXncfRegister.Functions` list-based registration is no longer the primary pattern.

## 4. MCP Integration

`XncfRegisterBase` already includes MCP support:

- module switch: `EnableMcpServer => true`
- service registration: `AddMcpServer(...)`
- route activation: `UseMcpServer(...)`

Default route pattern: `mcp-<module-name-lowercase>`

## 5. Threads and Version Helpers

- `Threads/ThreadInfo`, `XncfThreadBuilder`: module thread management
- `VersionManager/*`: version utility helpers

## Recommendations

- Keep each module centered around `XncfRegisterBase` as the single registration root.
- Standardize function exposure through `AppService + FunctionRender` for future AI/MCP reuse.
- Before exposing MCP externally, complete auth, tool allowlisting, and audit design.
