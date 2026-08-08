# Current XNCF Template Structure

> For Template-based development and aligned with
> `Senparc.Xncf.XncfBuilder.Template` `0.13.0`. See
> [Project Relationships, Synchronization, and Release](/NcfPackageSources/home/project-relationships.html)
> for the relationship between the runnable source and packaging project.

Generating a module with the Sample option produces a complete example with
registration, a Function, database support, Razor pages, and localized
resources.

## Directory structure

```text
MyOrg.Xncf.Sample/
  ACL/                         Anti-corruption and repository adapters
  App_Data/                    Protected module configuration and data
  Application/
    AppServices/               Application services and [FunctionRender]
    DTOs/
      Request/                 Request models
      Response/                Response models
    EventHandlers/             EventBus handler example
    Events/                    EventBus event examples
  Areas/Admin/Pages/           Admin Razor Pages
  Domain/
    Migrations/                Per-database migrations
    Models/DatabaseModel/      Entities, DTOs, mappings, and DbContext
    Services/                  Domain services
  OHS/
    Local/readme.md            Local-host boundary guidance
    Remote/readme.md           Remote-host boundary guidance
  Resources/                   Resource class and localized .resx files
  wwwroot/                     Module static assets
  Register.cs                  Metadata and lifecycle
  Register.Area.cs             Area capability
  Register.Database.cs         Database capability
```

Older tutorials placed AppServices and PL models under `OHS/Local`. The current
template moved them to `Application/AppServices` and `Application/DTOs`. `OHS`
remains as host-boundary guidance, not the default Function code directory.

## Registration and lifecycle

`Register.cs` owns:

- module `Name`, fixed `Uid`, `Version`, menu, and description;
- install and update behavior in `InstallOrUpdateAsync()`;
- uninstall behavior in `UninstallAsync()`;
- dependency injection and AutoMapper in `AddXncfModule()`;
- static files or middleware in `UseXncfModule()`.

The database template runs migrations during install or update with:

```csharp
await XncfDatabaseDbContext.MigrateOnInstallAsync(serviceProvider, this);
```

The generated uninstall sample drops module tables for demonstration. A
production module must redesign this behavior around its data-retention policy
instead of copying destructive uninstall logic.

## FunctionRender

Current Functions live under `Application/AppServices`:

```csharp
public class SampleAppService : AppServiceBase
{
    public SampleAppService(IServiceProvider serviceProvider)
        : base(serviceProvider) { }

    [FunctionRender("Echo", "Return the input", typeof(Register))]
    public Task<StringAppResponse> Echo(EchoRequest request)
    {
        return this.GetStringResponseAsync((response, logger) =>
        {
            response.Data = request.Message;
            return Task.FromResult<string>(null);
        });
    }
}
```

Do not add a `Functions` list to `Register`; the current base class has no such
override.

## EventBus example

Template `0.13.0` adds an in-module EventBus round-trip example. Event types and
handlers live in `Application/Events` and `Application/EventHandlers`. Keep this
pattern when the module needs decoupled application services or handler
collaboration. If EventBus is not needed, the example can be removed without
affecting basic XNCF registration or Functions.

## Request models and UI metadata

Request models derive from `FunctionAppRequestBase`. Use:

- DataAnnotations for required values and length constraints;
- `LocalizedDescription` for localized parameter descriptions;
- `FunctionParameterUi` with `SelectionList` for drop-down and multi-select UI;
- `[JsonIgnore]` for option collections used only as UI metadata.

## Localization

The template includes `Resources` and `GlobalUsings.Localization.cs`. The
current simulated site supports `zh-CN`, `en`, `ja`, `fr`, `es`, and `ru`.
Module names, Function names, parameter descriptions, and page text should use
the same resource system with stable fallback text.

Next: [XNCF Extension Contracts and Boundaries](./contracts-and-interfaces.md).
