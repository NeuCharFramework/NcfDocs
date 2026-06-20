# NcfPackageSources Source Guide

> This page is for developers who need to read source code, change internals, extend modules, and contribute back to the project.  
> Documentation baseline: current `NcfPackageSources` code, `HEAD = 631f16b4` (2026-06-17).

## Start Here (3-Step Path for Newcomers)

1. Finish [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md)
2. Continue with [NCF Capability Deep Dive](./capability-guide.md)
3. Complete modular understanding with [XNCF Extension Library Guide](./xncf-extension-modules.md)

## What You Will Get From This Guide

- A clear map of where `NcfPackageSources` sits in the NCF architecture.
- Direct entry points for core libraries, system modules, AI modules, and operations modules.
- Scenario-based paths (AI/RAG, module lifecycle, multi-database, MCP, release operations).
- A continuous path from first successful run to open-source collaboration.

## 1. Repository Role in the NCF Architecture

`NcfPackageSources` is not the business template site itself. It is the **official core package source repository** behind NCF.

It mainly contains three layers:

- `src/Basic`: foundational runtime capabilities (Core, XncfBase, Repository, Service, Database*).
- `src/Extensions`: installable modules (system, AI, tooling, operations).
- `tools/NcfSimulatedSite`: a simulated host site for integration and module verification (`Senparc.Web`, admin areas, installer, etc.).

## 2. Most Practical Source Workflow

### 2.1 Clone and Build

```bash
git clone https://github.com/NeuCharFramework/NcfPackageSources.git
cd NcfPackageSources

dotnet restore src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet build src/NcfPackageSources_Include_NcfSimulatedSite.sln
```

### 2.2 Run the Simulated Host Site

```bash
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj
```

### 2.3 Validation Priorities

- Module install/update logic: validate `InstallOrUpdateAsync()` and `UninstallAsync()` first.
- Database changes: validate module-specific `XncfDatabaseDbContext` and migrations.
- Function/MCP changes: validate both execution entry and scan registration results.

If this is your first run from source, follow this first:

- [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md)

## 3. Module Loading and Registration (Must Know)

### 3.1 Startup and Scan Entry

- Core startup: `Senparc.Ncf.XncfBase.Register.StartNcfEngine(...)`
- Web startup: `Senparc.Xncf.AreasBase.AreaRegister.StartWebEngine(...)`
- Scan targets:
  - `IXncfRegister` implementations
  - `XncfAutoConfigurationMappingAttribute` types
  - `[FunctionRender]` methods in `AppServiceBase` subclasses

### 3.2 Loading Order

Use `[XncfOrder(x)]` (descending order), common conventions:

- `59xx`: low-level system core modules
- `58xx`: AI-related foundational modules
- `0` or unset: default order

### 3.3 Function Registration (Current Mechanism)

- Current recommended model: `[FunctionRender(...)]` on AppService methods.
- Discovered methods are stored in `Register.FunctionRenderCollection`.
- In implementation practice, use the `[FunctionRender]` path as the primary registration and troubleshooting entry.

### 3.4 MCP Registration (Current Mechanism)

- Module-level switch: `EnableMcpServer => true`
- Service registration: `XncfRegisterBase.AddMcpServer()`
- Route mapping: `XncfRegisterBase.UseMcpServer()` maps `mcp-<module-name>` routes

## 4. Capability Focus for This Version

The current version is especially relevant for these module combinations:

- **AI foundation**: `Senparc.Xncf.AIKernel`
- **Prompt engineering**: `Senparc.Xncf.PromptRange`
- **Agent orchestration**: `Senparc.Xncf.AgentsManager`
- **Knowledge/RAG foundation**: `Senparc.Xncf.KnowledgeBase`
- **Module generation and inventory governance**: `Senparc.Xncf.XncfBuilder`
- **MCP management**: `Senparc.Xncf.MCP`
- **Database operations tooling**: `Senparc.Xncf.DatabaseToolkit`
- **Release mirror/backup channel**: `Senparc.Xncf.FirmwareUpdate`

For detailed module inventory, versions, ordering, and implementation playbooks:

- [NCF Capability Deep Dive](./capability-guide.md)

## 5. XNCF Extension Entry (Single-Granularity Modules)

The “NCF Libraries” section is your framework foundation. `Senparc.Xncf.xxx` modules are the business capability units.  
In NCF, each XNCF module should be treated as a governable single-granularity unit: installable, enable/disable-able, extensible, and auditable.

Recommended reading:

- [XNCF Extension Library Guide](./xncf-extension-modules.md)

## 6. Beginner Troubleshooting Priority (Summary)

Use this fixed order:

1. Check module state first (installed, enabled, visible).
2. Check Function/MCP registration next (scan hit and register result).
3. Check auth and logs last (401/403, policy, stack trace).

For full symptom -> cause -> fix matrix:

- [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md)

## 7. Core Library Entries

- [Senparc.Ncf.Core](../libs/Senparc.Ncf.Core.md)
- [Senparc.Ncf.Repository](../libs/Senparc.Ncf.Repository.md)
- [Senparc.Ncf.Service](../libs/Senparc.Ncf.Service.md)
- [Senparc.Ncf.SMS](../libs/Senparc.Ncf.SMS.md)
- [Senparc.Ncf.Mvc.UI](../libs/Senparc.Ncf.Mvc.UI.md)
- [Senparc.Ncf.Log](../libs/Senparc.Ncf.Log.md)
- [Senparc.Ncf.Utility](../libs/Senparc.Ncf.Utility.md)
- [Senparc.Ncf.XncfBase](../libs/Senparc.Ncf.XncfBase.md)
- [Senparc.Ncf.AreaBase](../libs/Senparc.Ncf.AreaBase.md)
- [Senparc.Ncf.DatabasePlant](../libs/Senparc.Ncf.DatabasePlant.md)
- [Senparc.Ncf.Database](../libs/Senparc.Ncf.Database.md)
- [IXncfRegister (Current Contract)](../libs/Senparc.Ncf.AreaBase/IxncfRegister.md)

## 8. Open-Source Entry Points (Issue / PR / Discussion Guidance)

### 8.1 Where to Open What

- Template/install/deployment/upgrade issues: prefer `NCF` repository Issues.  
  https://github.com/NeuCharFramework/NCF/issues

- Core package internals/module register/runtime behavior: use `NcfPackageSources` Issues/PRs.  
  https://github.com/NeuCharFramework/NcfPackageSources/issues

### 8.2 Question-Asking Guidance (For Faster Responses)

1. Provide commit SHA (or release tag), not just “latest”.
2. Provide minimum reproduction steps (3-8 steps).
3. Provide key logs (desensitized).
4. Clearly state expected result vs actual result.

### 8.3 PR Guidance (Small, Reviewable Units)

- One PR should solve one clear class of problem.
- Update docs first when behavior changes, then implementation, then verification notes.
- If behavior changes, explain compatibility impact and rollback path.

## 9. Production Notes (Summary)

- `DatabasePlant` is recommended for debug/maintenance workflows, not production runtime packages.
- High-privilege modules such as `Terminal`, `DatabaseToolkit`, and `ChangeNamespace` need strict access control.
- For AI modules, complete model configuration, auth strategy, quota control, and audit logging before launch.
- Before exposing MCP externally, complete route auth, tool allowlist, and call auditing.

---

If you want to start coding immediately, continue with:

- [NCF Capability Deep Dive](./capability-guide.md)
- [Version Upgrade Notes](./version-upgrade-notes.md)
