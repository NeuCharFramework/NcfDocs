# Version Upgrade Notes

> This page tracks important changes on the `NcfPackageSources` development
> branch. The 2026-07 section retains the historical baseline checked on
> 2026-07-27; the Repository/background tenant scope upgrade was added on
> 2026-10-02 and the AIKernel local fine-tuning update on 2026-10-09. Project
> versions, Register versions, and published NuGet versions can differ; verify
> each separately during an upgrade.

## AIKernel Local Fine-Tuning Upgrade (2026-10-09)

The current source lists `Senparc.Xncf.AIKernel` project version `0.16.4` and
the companion fine-tuning Worker version `1.1.0`. These are source versions,
**not confirmation that either package has been publicly released**.

- AIKernel adds an administrator-only local fine-tuning console backed by a
  separate authenticated Python Worker. Training remains disabled by default.
  Worker profiles are stored in the database; authentication keys belong in
  secure host configuration, not in the database or browser.
- The Worker supports CPU/CUDA training through PyTorch and PEFT, and native
  Apple Silicon training through MLX. Available backends and methods are
  determined by Worker capability preflight. Worker 1.1 adds complete catalog
  paging and a persistent SQLite `storeId`; the legacy array APIs still return
  only the latest 100 records.
- Training exports adapters and checkpoints for separate evaluation and
  inference deployment. It does not automatically resume interrupted jobs or
  publish an inference model.
- Upgrade existing AIKernel installations through module management to apply
  the Worker-profile database migration. Deploy a matching Worker, configure
  its key through a secret store/environment, and enable training only after
  preflight and a real smoke test succeed.

See the [AIKernel local fine-tuning guide](../xncf/aikernel-local-fine-tuning.md)
for deployment requirements, validation steps, and operational limits.

## Repository and Background Tenant Scope Upgrade (2026-10-02)

These are project versions in the development source for this upgrade,
**not a statement that these NuGet packages have been publicly released**:

| Project                          | Source project version |
| -------------------------------- | ---------------------- |
| `Senparc.Ncf.Core`               | `0.30.2-preview9`      |
| `Senparc.Ncf.Repository`         | `0.20.10-preview9`     |
| `Senparc.Ncf.XncfBase`           | `0.28.1`               |
| `Senparc.Xncf.Tenant`            | `0.15.14`              |
| `Senparc.Xncf.WeixinManager`     | `0.24.11`              |
| `Senparc.Xncf.NeuCharWorkflow`   | `0.4.3`                |
| `Senparc.Xncf.XncfModuleManager` | `0.15.11`              |

### Data-Access Boundaries

- XNCF Services inject and reuse existing repositories. Use ServiceBase for
  ordinary CRUD and `RepositoryBase.GeAll(...)` for composed filters,
  projections, and cancellable queries.
- WeixinClaw and workflow business queries no longer access DbContext
  directly. Ordinary business code does not duplicate tenant/soft-delete
  controls or call `IgnoreQueryFilters()`.
- Module menu permissions are saved through the existing
  `SysRolePermissionService`; tenant cache queries reuse
  `TenantInfoRepository`.
- The base repository now provides `SavePropertiesAsync`. Workflow runtime
  updates save only selected properties, avoiding overwrites of a newer
  definition's `GraphJson` or `Revision` with stale runtime data.
- Installation, migrations, table creation, and backups are infrastructure
  operations rather than ordinary business CRUD; this upgrade does not
  mechanically rewrite them.

### Background Tenant Scopes

- Core provides `IBackgroundTenantScopeFactory`. XncfBase registers the
  factory; the Tenant module's `IBackgroundTenantProvider` reuses the existing
  enabled-tenant cache.
- `ForEachEnabledTenantAsync` runs callbacks in independent initialized
  tenant scopes. `TryCreateScopeAsync` creates a scope for a specified enabled
  tenant and returns `null` when none matches.
- Single-tenant mode uses the default scope. Multi-tenant mode throws for a
  missing Provider or invalid data instead of falling back to global access.
- WeixinClaw has removed cache reflection and repeated tenant setup, and now
  consistently handles task cancellation, completion, and disposal. Other
  background implementations are not automatically migrated by the new API.

### Upgrade and Validation

1. Upgrade mutually compatible library/module versions and rebuild the host.
   Do not equate source versions with published NuGet versions.
2. No new entity or database migration is required for this change.
   **Restart the host** to activate the new DI registrations.
3. Verify tenant isolation, soft deletion, and business filters in ordinary
   requests and newly created background scopes.
4. Verify that disabled tenants receive no new execution scopes and that
   existing account polling is canceled after scanning. Verify single-tenant
   mode without a tenant registry.
5. Verify shutdown, repeated scans, and cancellation-callback disposal without
   exceptions or deadlocks. Ensure workflow runtime saves do not overwrite a
   newer graph definition or revision.

For API examples and constraints, see
[Multi-Tenant Configuration and Background Work](../../start/config/mutiple-tenant.md),
the [Repository Guide](../libs/Senparc.Ncf.Repository.md), and the
[Service Guide](../libs/Senparc.Ncf.Service.md).

## Upgrade Summary (2026-07)

### 1. Runtime Migration to .NET 10

- The simulated `Senparc.Web` host now targets `net10.0`.
- The local `http` profile uses `http://localhost:5000`, the `https` profile uses `https://localhost:5111`, and Docker HTTPS uses port `5001`.
- Check the SDK, CI images, Docker base images, and deployment hosts together instead of changing only `TargetFramework`.

### 2. AI, Prompt, and Agent Workflows

- The `AgentsManager` Register version is now `0.3.22`.
- MAF/Agent workflows continue to expand with Prompt streaming, chat archiving, pending tasks, and batch-task capabilities.
- `AIKernel -> PromptRange -> AgentsManager` is part of the default installation combination. KnowledgeBase/RAG remains an explicit, scenario-driven installation and configuration step.

### 3. Six-Language Localization

- Site, admin, and installer resources cover `zh-CN`, `en`, `ja`, `fr`, `es`, and `ru`.
- Function request parameters can bind resource keys through `[LocalizedDescription]`.
- When adding a language, update resource files, `SupportedCultures`, the UI selector, and fallback-language tests together.

### 4. XNCF Template Structure

- The source template package is currently `0.13.0`; the XncfBuilder project version is `0.37.0-preview5`.
- Template `0.13.0` adds an EventBus round-trip example under
  `Application/Events` and `Application/EventHandlers`.
- New templates place Function implementations and DTOs under `Application/AppServices` and `Application/DTOs`.
- Functions are discovered from `[FunctionRender]` methods on `AppServiceBase`. Do not restore the retired `IXncfFunction` or `Register.Functions` model.

### 5. Installer and Desktop Host

- First-time installation preselects Administrator, PromptRange, XncfBuilder, MCP, AIKernel, and AgentsManager.
- A confirmation list is shown before state is written; cancelling the dialog does not install modules.
- The desktop host includes dynamic update sources, download progress, high-DPI, and WebView improvements. Private update sources should be tested for address resolution, package integrity, rollback, and configuration preservation.

### 6. MCP Routing and Version Boundaries

- The MCP project NuGet version is `0.4.0-preview3`, while its module `Register.Version` remains `0.1.0`; they serve different purposes.
- A module with `EnableMcpServer => true` is automatically mapped as `mcp-<lowercase-module-name-with-dots-replaced-by-hyphens>`.
- The MCP module SSE endpoint is `/mcp-senparc-xncf-mcp/sse`; do not duplicate registration in `Startup`.
- `McpAccessToken` is not currently enforced on the automatic mapping path. Add authentication, rate limiting, a tool allowlist, and auditing before external exposure.

### 7. Version-Upgrade Record Rules

- A version window must include commits after the merge base and current uncommitted changes.
- Recursively inspect affected `.cs`, `.csproj`, `.props`, and their importers instead of bumping a single project.
- Every functional `.cs` change needs matching coverage in the current release-note block, without duplicating existing entries.
- Track `Register.Version`, assembly/project version, template package version, and published NuGet version separately.

## Recommended Upgrade Actions

1. Pin the target commit or release tag; do not use “latest” as a reproducible baseline.
2. Install the .NET 10 SDK and verify `global.json`, CI, and container images.
3. Upgrade NCF/XNCF packages, then migrate retired Function and template paths based on compiler feedback.
4. Review installer defaults, localization resources, MCP exposure policy, and desktop update sources.
5. Complete database migrations in an isolated environment before production deployment.

## Post-Upgrade Validation Checklist

- Start the host with an explicit launch profile and verify the protocol on ports `5000` and `5111`.
- Verify all six installer defaults, confirmation, cancellation, and repeated entry into the install flow.
- Verify module installation, enablement, menus, permissions, and database migrations.
- Confirm `[FunctionRender]` discovery, execution, and localized parameter text.
- Confirm there is one MCP route mapping, the SSE endpoint connects, and external access is authenticated and rate-limited.
- Exercise critical AI/Prompt/Agent streaming, archive, pending-task, and batch-task paths.
- Switch among all six languages and verify safe fallback for missing resources.
- Test desktop update-source resolution, progress, failed-upgrade rollback, and preservation of user settings.
- Confirm there are no persistent database, model-service, network, or background-task errors.

Related documentation:

- [NcfPackageSources Source Guide](./index.md)
- [NCF Capability Source Deep Dive](./capability-guide.md)
- [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md)
- [Project Relationships, Synchronization, and Release](./project-relationships.md)
