# Version Upgrade Notes

> This page is the centralized upgrade log for major `NcfPackageSources` changes.  
> Target readers: developers, maintainers, and operations engineers handling upgrades.

## How to Use This Page

For each upgrade, check in this order:

1. Read the upgrade summary to understand scope.  
2. Review behavior changes to identify module impact.  
3. Complete the post-upgrade validation checklist.

## Current Baseline

- Documentation baseline commit: `eca233bea` (2026-09-06, Developer-MAF-V3)
- Capability docs:
  - [NcfPackageSources Source Guide](./index.md)
  - [NCF Capability Deep Dive](./capability-guide.md)
  - [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md)

## Upgrade Summary (2026-06)

### 1. Module Registration and Governance

- Function registration path is standardized around `[FunctionRender]` auto scanning.
- MCP is managed through unified module contract members.
- Recommended troubleshooting order is standardized:
  module state -> registration state -> auth policy -> runtime logs.

### 2. AI / RAG Implementation Path

- A minimum production path can be built with
  `AIKernel -> PromptRange -> AgentsManager -> KnowledgeBase`.
- KnowledgeBase covers file chunking, embedding, and recall-test baseline flow.

### 3. Open-Source Collaboration and Documentation Co-Maintenance

- Docs now include minimal templates for high-quality Issues and PRs.
- The “user-to-contributor” workflow is documented for easier collaboration.

### 2026-09-19 (Developer-MAF-V3-Spark)

- **Affected module(s)**: `Senparc.Xncf.Sandbox`, `Senparc.Xncf.Sandbox.Abstractions`
- **Change type**: Added / Changed
- **Key change(s)**:
  - **External JupyterLab control**: a new AI-callable Function 创建 Notebook (`LabCreateNotebook`) writes nbformat-4 `.ipynb` files into the running Lab workspace for Python or C# (dotnet-interactive, kernel `C# .NET SDK`). The notebook source uses the Jupyter percent-file convention (`# %%` code-cell separator, `# %% [markdown]` markdown cells; an optional title becomes the first markdown heading). The existing 执行 Lab 命令 Function gains an optional `StdinContent` parameter (up to 32 KB) executed via `docker exec -i`, so commands can be piped into terminal programs or REPLs inside the container.
  - **Optional extra port mappings at creation**: JupyterLab sandboxes (`jupyter-python` / `jupyter-csharp`) accept an optional `ExtraPortMappings` string at creation (max 8 mappings; `;` or `,` separated): `3000` (auto-allocated loopback host port), `9000:3000` (explicit loopback host port), `*:3000` (auto host port on `0.0.0.0`), `*:9000:3000` (explicit external host port). Loopback binding is the default; `0.0.0.0` exposure is opt-in. Invalid entries, out-of-range ports, and duplicate host ports are rejected at creation. The NCF preview workload is unchanged and remains hardened.
  - **Session alias**: sessions support an optional display alias (≤ 128 characters), settable at creation and changeable/clearable any time via the new 修改别名 (`UpdateAlias`) Function; the admin session list shows alias and extra-port columns with an inline rename dialog.
  - **Quota raised**: per-user concurrent sessions 2 → 10; global concurrent sessions 20 → 50.
  - **Persistence**: two new nullable columns `SandboxSession.Alias` and `SandboxSession.ExtraPorts` are added by migrations for all six providers (Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL). Both survive container destroy and are never cleared by the runtime — only manual rename/clear changes them.
- **Upgrade action(s)**:
  - Pull the latest code, re-run `dotnet restore` / `dotnet build` (see [NcfPackageSources Source Guide](./index.md)).
  - Run the Senparc.Xncf.Sandbox database migration (`20260918120000_AddAliasAndExtraPorts`) in the host site; back up databases before upgrading.
- **Rollback guidance**:
  - Both columns are additive and nullable; old code ignores them. Rollback is safe as long as the migration is not reversed; reversing the migration drops alias/port history.
- **Validation checklist**:
  - Migration succeeds across all supported databases; existing sessions keep working with `Alias` / `ExtraPorts` null.
  - Creating a JupyterLab sandbox with `ExtraPortMappings` binds the requested ports (loopback by default; `*:` entries reachable on `0.0.0.0`); invalid entries fail fast with a clear error.
  - 创建 Notebook produces a valid `.ipynb` for both Python and C# kernels, opens in JupyterLab, and respects the `Overwrite` flag.
  - 执行 Lab 命令 with `StdinContent` pipes input into the target command (e.g. a REPL) and times out as before.
  - Alias can be set at creation, renamed, and cleared from the admin list; the alias column renders for all rows.
  - A user can now hold up to 10 concurrent sessions; the global cap is 50.

### 2026-09-18 (Developer-MAF-V3-Spark)

- **Affected module(s)**: `Senparc.Areas.Admin`
- **Change type**: Added
- **Key change(s)**:
  - **Function global Provit access control via database policies** (Senparc.Areas.Admin): global Provit (cross-module floating invocation) access for a Function was previously constrained only in code (`FunctionRenderAttribute`: `AllowGlobalPivot` / `GlobalPivotRoleCodes` / `GlobalPivotPermissionCodes`). Administrators can now store a per-Function database policy in a new `ADMIN_NeuCharFunctionProvitAccess` table (unique on `ModuleUid + FunctionKey`), following an ontology-style subject–resource–effect model: resource = `(ModuleUid, FunctionKey)`; subjects = admin users, role codes and/or permission codes (any match passes); effect = Inherit (0) / Open (1) / Restricted (2) / Deny (3). A non-inherit policy **overrides the code attributes** — it can expose a Function the code does not declare global, or deny one the code allows; Inherit (or an absent policy) falls back to the code baseline.
  - **Caching**: all policy rows are cached in `FullNeuCharFunctionProvitAccessCache` (CO2NET cache strategy, same pattern as `FullSystemConfigCache`); every write invalidates the cache, and a database failure degrades gracefully to the code baseline.
  - **Module-clear resilience**: policy rows are intentionally **not** deleted when an XNCF module is uninstalled (module uninstall only drops the module's own DbContext tables). They remain as "orphan" policies and automatically re-apply after the module is reinstalled; only manual clearing on the management page performs a hard delete.
  - **Management page**: new **Access Control** page under the NeuCharPivot menu (`/Admin/NeuCharPivot/Access`, super admin only, page authorization `AdminOnly`). Each row shows the full decision context — module/Function identity, code baseline, current DB policy, and the resulting effective policy — with single-row editing (policy mode, user/role/permission pickers, remark) and batch operations: apply Open / Restricted / Deny / Inherit, or clear, across all selected rows.
  - Migrations synced for all six providers (Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL); unit tests extended (DB override semantics, Restricted subject matching, orphan retention, binding normalization).
- **Upgrade action(s)**:
  - Pull the latest code, re-run `dotnet restore` / `dotnet build` (see [NcfPackageSources Source Guide](./index.md)).
  - Run database migrations in the host site for Senparc.Areas.Admin (adds `ADMIN_NeuCharFunctionProvitAccess`); back up databases before upgrading.
- **Rollback guidance**:
  - The new table is additive; no existing behavior changes unless a policy row is created. On rollback, existing policy rows are simply ignored by the old code (which only reads code attributes).
- **Validation checklist**:
  - `ADMIN_NeuCharFunctionProvitAccess` migration succeeds across all supported databases.
  - Access Control page lists every catalog Function plus orphan policies; code baseline, DB policy and effective policy columns render correctly.
  - Saving an Open policy on a code-restricted Function allows any signed-in admin via global Provit; a Deny policy on a code-allowed Function rejects all global Provit access.
  - A Restricted policy grants access only to bound users / roles / permission codes (any match), and rejects accounts with none of the bindings.
  - Uninstalling a module keeps its policy rows (shown as orphans); reinstalling the module re-applies them automatically.
  - Batch open / restrict / deny / inherit / clear operate on the selected rows and the list refreshes with updated counts.

### 2026-09-06 / `f668bf650..eca233bea` (Developer-MAF-V3)

- **Affected module(s)**: `Senparc.Areas.Admin`, `Senparc.Xncf.AIKernel`, `Senparc.Web` (site host), `Senparc.Xncf.NeuCharPivot` (Provits)
- **Change type**: Added / Changed
- **Key change(s)**:
  - **NeuBell WebHook (WebAPI) notification settings** (Senparc.Areas.Admin): administrators register WebHook endpoints per NeuBell provider (or all); on NeuBell item add/remove the system dispatches an asynchronous POST (fire-and-forget, `SemaphoreSlim(4)` gate). Per-setting provider filter, per-event toggles (added/removed), enable switch, optional HMAC-SHA256 signature (`X-NeuBell-Signature: t=<unix>,v1=<hex>`), and a test-send action. New table `ADMIN_NeuBellWebHook` with migrations for Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL; an `IHostedService` monitor (polling via `NeuBellWebHook:PollingIntervalSeconds`, default 30s / min 5s, wake-on-change via the NeuBell change stream) diffs per-provider baselines to avoid false positives on restart or transient snapshot failure. Management page `/Admin/NeuBell/Index` (super admin only), linked from the footer NeuBell drawer.
  - **AIKernel**: token-usage monitoring with real-time aggregation and async per-run progress; the AI model list page shows usage directly.
  - **Admin menu**: left-menu search filter plus a menu "config mode" where first-level menus can be drag-reordered; saving really updates the stored Sort values.
  - **Provits (NeuCharPivot)**: create Provits one by one, create/modify them via AI Chat, and build a "Provit Panel" bound to a special page (e.g. admin home `admin-home`) composing Provit Blocks from any XNCF module, with drag sorting and AI-assisted block editing.
  - **Admin Chat Harness mode**: optional long-task mode based on Microsoft Agent Framework (MAF) — step budget, timeout control, `[[DONE]]` completion marker, execution steps returned to the UI; simple chat remains default.
  - **CloudflareProtect** (Senparc.Web): new `CloudflareProtect` SystemConfig section (off by default); when enabled, fixed-window rate limiting + security headers activate immediately from the first request of a site visit.
- **Upgrade action(s)**:
  - Pull the latest code, re-run `dotnet restore` / `dotnet build` (see [NcfPackageSources Source Guide](./index.md)).
  - Run database migrations in the host site for Senparc.Areas.Admin (adds `ADMIN_NeuBellWebHook`); back up databases before upgrading.
  - Optionally configure `NeuBellWebHook:PollingIntervalSeconds` (default 30s) and `CloudflareProtect` in `appsettings.json`; both are safe defaults.
- **Rollback guidance**:
  - Keep previous NuGet packages and migration baselines; the `ADMIN_NeuBellWebHook` table is additive and not required for rollback. Restore from backup if a schema change misbehaves.
- **Validation checklist**:
  - `ADMIN_NeuBellWebHook` migration succeeds across all supported databases.
  - Footer NeuBell drawer shows the "WebHook Settings" entry; `/Admin/NeuBell/Index` is reachable for super admin only.
  - Creating/saving/toggling/deleting a WebHook works; the test button returns success against a reachable endpoint.
  - A NeuBell item add/remove triggers exactly one POST to matching endpoints; disabled / non-matching / non-subscribed endpoints are not called.
  - AIKernel model list page displays token usage; the token monitor advances asynchronously per run.
  - Admin left-menu search filters results; config-mode drag reorder persists real Sort values.
  - Provits can be created one-by-one and via AI Chat; a Provit Panel bound to `admin-home` renders blocks from multiple modules.
  - Admin Chat Harness mode runs a long task and reports execution steps; Simple mode is unchanged.
  - With `CloudflareProtect.Enabled=true`, the site enforces rate limiting and security headers from the first request.


### 2026-08-29 / `8ccc5316b..f668bf650` (Developer-MAF-V3)

- **Affected module(s)**: `Senparc.Xncf.AgentsManager`, `Senparc.Xncf.NeuCharWorkflow`, `Senparc.Ncf.XncfBase`, `Senparc.Ncf.Database`, `Senparc.Xncf.XncfBuilder`
- **Change type**: Added / Changed
- **Key change(s)**:
  - AgentsManager supports a Human-in-the-Loop policy: task execution can require human approval with configurable max chat rounds and tool permissions; groups automatically include human participants, and approval protocol content is excluded from the shared message history.
  - AgentsManager introduces independent `AgentExecutionTask` management (with multi-database migrations), AgentTemplate model binding, and empty-output-token retry; the agent editor can be opened in a new window, and the task management UI is refactored.
  - NeuCharWorkflow adds global NeuCharPivot floating invocation: `[FunctionRender]` gains an `AllowGlobalPivot` attribute for role-based access control, and functions not explicitly allowed cannot be invoked globally.
  - NeuCharWorkflow adds a Workflow Analytics page: filter by date range, workflow ID, and status, with data retrieval and summary generation.
  - NeuCharWorkflow adds a Human Input node: user prompts and external resume support, including external key validation.
  - NeuCharWorkflow standardizes timestamps on `DateTimeOffset` (UTC); replay supports "load more events"; `AbortRun` can target a specific execution log ID; the workflow function calling provider supports larger loop iterations with scoped service isolation.
  - ChatGroupService uses `IServiceScopeFactory` for isolated scope execution, refines turn token logic, and logs approval call IDs; ContextSharingRoundRobinGroupChatManager excludes approval protocol content when updating message history.
  - New `AgentModelRequestDiagnostics` for diagnosing agent model request failures and extracting errors, with automatic sensitive-data redaction.
  - NeuCharWorkflowExpressionEngine switches JSON serialization to custom `JsonSerializerOptions` so non-ASCII characters (e.g. Chinese text) are preserved.
  - Versions & dependencies: XncfBuilder template bumped to `1.1.7`, Senparc.Ncf.Database bumped to `0.21.8-preview8` (enhanced multi-database support matrix logging), and version bumps across multiple projects.
  - The download page supports source selection (auto / local / GitHub) and displays MD5 fingerprints; localization resources updated in multiple languages.
  - New local database configuration sample `SenparcConfig.config`; NCF Desktop updated to `0.10.1-build10066` (Linux / macOS / Windows).
- **Upgrade action(s)**:
  - Pull the latest code, then re-run `dotnet restore` / `dotnet build` (see [NcfPackageSources Source Guide](./index.md)).
  - Run database migrations in the host site for affected modules (AgentsManager, etc.); back up databases before upgrading.
- **Rollback guidance**:
  - Keep previous NuGet packages and migration baselines; database schema changes are not designed for direct downgrade, restore from backup when necessary.
- **Validation checklist**:
  - `AgentExecutionTask` migrations succeed across all supported databases; task creation, filtering, and execution records work correctly.
  - Human-in-the-Loop approval, human participation, max rounds, and tool permissions behave as configured.
  - NeuCharPivot global invocation only allows functions marked `AllowGlobalPivot`; unauthorized calls are rejected.
  - Workflow Analytics page filters correctly by date / workflow / status and generates summaries.
  - Download page source switching works, MD5 fingerprints display correctly, and localization is complete.
  - NCF Desktop `0.10.1` downloads and starts correctly.


### YYYY-MM-DD / vX.Y.Z

- **Affected module(s)**: `Senparc.Xncf.XXX` / `Senparc.Ncf.XXX`
- **Change type**: Added / Changed / Deprecated / Security Fix
- **Key change(s)**:
  - ...
- **Upgrade action(s)**:
  - ...
- **Rollback guidance**:
  - ...
- **Validation checklist**:
  - ...

## Post-Upgrade Validation Checklist (Minimum)

- Module install/enable/menu visibility is correct.
- Function and MCP registration results are queryable and callable.
- Management API auth (cookie / bearer / policy) works as expected.
- No persistent errors in key runtime logs (database, model service, network dependencies).
