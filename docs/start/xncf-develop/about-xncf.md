# XNCF Module Structure

> This is Template-based development documentation. It describes public module
> composition and usage contracts without analyzing the internal scanner. The
> content was checked against `Senparc.Xncf.XncfBuilder.Template` `0.13.0`.

An XNCF is an NCF module unit that can be scanned, installed, enabled, disabled,
and governed independently. In most cases, start with the
[XNCF module generator](./create-xncf.md) instead of assembling every component
from an empty project.

## Minimum module register

Every module needs a `[XncfRegister]` class that derives from
`XncfRegisterBase` and implements `IXncfRegister`:

```csharp
using Senparc.Ncf.XncfBase;

namespace MyOrg.Xncf.Sample;

[XncfRegister]
public partial class Register : XncfRegisterBase, IXncfRegister
{
    public override string Name => "MyOrg.Xncf.Sample";
    public override string Uid => "A-FIXED-GLOBALLY-UNIQUE-GUID";
    public override string Version => "0.1.0";
    public override string MenuName => "Sample";
    public override string Icon => "fa fa-star";
    public override string Description => "Sample XNCF module";
}
```

- `Name` and `Uid` must be globally unique. Do not change a published `Uid`.
- `Version` is the module lifecycle version, not the NuGet package version.
- Use `InstallOrUpdateAsync()` and `UninstallAsync()` for lifecycle behavior.

Start with [XNCF Extension Contracts and Boundaries](./contracts-and-interfaces.md).
Only when debugging the framework implementation should you continue to the
[IXncfRegister source analysis](/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister.html).

## Load order

`[XncfOrder(x)]` is evaluated in descending order:

- `0` or unset: regular modules;
- `1`–`5000`: modules with an explicit relative order;
- `58xx`: reserved for AI foundation modules;
- `59xx`: reserved for system foundation modules.

Business modules should not occupy system-reserved ranges.

## Current Function mechanism

Functions are no longer registered through an `IXncfRegister.Functions` or
`IXncfFunction` list. The framework scans `[FunctionRender]` methods on
`AppServiceBase` subclasses and records them in the module's
`FunctionRenderCollection`.

Recommended structure:

```text
Application/
  AppServices/       Application services with [FunctionRender]
  DTOs/
    Request/         FunctionAppRequestBase request models
    Response/        Response DTOs
```

See [Create a minimal XNCF module manually](/start/developer/xncf_module.html).

## Optional capabilities

Add only what the module needs:

| Capability                | Current entry point                             |
| ------------------------- | ----------------------------------------------- |
| Database and migrations   | `IXncfDatabase`, `Register.Database.cs`         |
| Razor Area                | `IAreaRegister`, `Register.Area.cs`             |
| Razor runtime compilation | `IXncfRazorRuntimeCompilation`                  |
| Middleware                | `IXncfMiddleware`                               |
| Background thread         | `IXncfThread`                                   |
| Function                  | `AppServiceBase` + `[FunctionRender]`           |
| MCP server                | `EnableMcpServer => true` + MCP tool attributes |

## Recommended reading order

1. [XNCF Extension Contracts and Boundaries](./contracts-and-interfaces.md)
2. [Create your first XNCF module](./create-xncf.md)
3. [Current template structure](./about-custom-xncf.md)
4. [Develop an XNCF module](./dev-xncf.md)
5. [Call between modules](./invoke-between-modules.md)
