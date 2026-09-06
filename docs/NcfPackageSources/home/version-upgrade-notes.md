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
