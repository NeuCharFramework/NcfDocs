# Logs

## 2026-09-20 update

NcfPackageSources (Developer-MAF-V3-Spark branch) — full multi-tenant module upgrade + AdminChat per-account isolation:

1. XNCF database multi-tenant engine (Senparc.Ncf.XncfBase): the `XncfDatabaseDbContext` global query filter is now aligned with `SenparcEntitiesDbContextBase` — when multi-tenancy is enabled (`SenparcCoreSetting:EnableMultiTenant: true`), every entity implementing `IMultiTenancy` and not `IIgnoreMulitTenant` automatically gets a `TenantId == current request tenant Id` filter (stacked with the soft-delete filter); `SaveChanges`/`SaveChangesAsync` automatically stamp the current `TenantId` onto new entities. Global entities such as the tenant registry `TenantInfo` opt out via `IIgnoreMulitTenant` (the `TenantInfos` table intentionally stores no TenantId column; the model hides the base-class property with `[NotMapped]` — this upgrade fixes a defect where that shadow was accidentally removed, making EF map a non-existent column). Single-tenant mode (the default) behaves exactly as before.

2. Login tenant resolution: the Web (Cookie) login page accepts an optional tenant (`TenantKey`) when multi-tenancy is enabled — the tenant is resolved and the tenant context is set before the account lookup. The JWT (desktop / backend API) login `LoginAsync` now does the same: resolve the tenant from the `TenantKey` parameter, set the tenant context, then write `TenantKey` into the JWT claim (previously the account query ran before tenant resolution, so under the `LoginInput` rule that tenant's accounts were not found). Unknown/disabled tenants produce the same generic message as "wrong account or password" to prevent tenant enumeration.

3. Tenant management page upgrade (`/Admin/TenantInfo`): a new **Admins** column shows the admin account count per tenant (decision support); a new guarded delete handler `OnPostDeleteAsync` enforces three checks — the currently in-use tenant cannot be deleted, at least one enabled tenant must remain, and a tenant with existing admin accounts cannot be deleted (prevents orphaned accounts) — returning localized, specific reasons on failure.

4. AdminChat per-account isolation: all session/message endpoints (list, detail, send, archive, delete, feedback) and Harness trajectory operations now perform ownership checks against the logged-in admin; cross-account access returns "session not found or forbidden". Message feedback additionally has defensive ownership validation. Super administrators (`administrator` role) get a new **Usage Stats** panel on the AdminChat page: per-account session counts (total/active/archived/deleted), message counts and last-active time — **counts only, no content is exposed**; with multi-tenancy enabled the statistics are likewise constrained by the tenant filter.

Unit tests: new `AdminChatAccountIsolationTests` (cross-account session/message access denial, per-user statistics semantics, super-admin role detection); all 166 tests in the Admin test project pass.

See [Configure Multi-Tenant](../config/mutiple-tenant.md).



NcfPackageSources (Developer-MAF-V3-Spark branch) — Sandbox v0.3.3: external JupyterLab control, optional container port mappings, and session aliases:

1. External JupyterLab control: the module now exposes complete external interfaces for operating a running JupyterLab container. A new AI-callable Function 创建 Notebook (`LabCreateNotebook`) writes nbformat-4 `.ipynb` files into the Lab workspace for Python or C# (dotnet-interactive, kernel `C# .NET SDK`); the notebook source follows the Jupyter percent-file convention (`# %%` separates code cells, `# %% [markdown]` marks markdown cells, and an optional title becomes the first markdown heading), so one string fully describes the notebook. The existing 执行 Lab 命令 Function now accepts an optional `StdinContent` (up to 32 KB) — executed via `docker exec -i` — so commands can be piped into terminal programs or REPLs inside the container.

2. Optional extra port mappings at container creation: creating a JupyterLab sandbox (`jupyter-python` / `jupyter-csharp`) now accepts an optional `ExtraPortMappings` string (max 8 mappings, `;` or `,` separated). Formats: `3000` — auto-allocated loopback host port → container port 3000; `9000:3000` — explicit loopback host port; `*:3000` — auto host port bound to `0.0.0.0` (externally reachable); `*:9000:3000` — explicit external host port. Loopback-only binding is the default; `0.0.0.0` exposure is opt-in, intended for web sites running inside the container. Invalid entries, out-of-range ports, and duplicate host ports are rejected at creation; the NCF preview workload is unaffected and remains hardened.

3. Session alias: each sandbox session supports an optional display alias (≤ 128 characters), settable at creation (`Alias` parameter) and changeable/clearable any time via the new 修改别名 (`UpdateAlias`) Function. The admin session list now shows alias and extra-ports columns with an inline rename dialog.

4. Quota raised: the per-user concurrent session limit went from 2 to 10 (global limit 20 → 50).

Persistence: two new nullable columns `SandboxSession.Alias` / `SandboxSession.ExtraPorts` are added by migrations for all six providers (Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL). Both fields survive container destroy and are never cleared by the runtime — only manual rename/clear changes them. Unit tests extended (port-mapping parsing, notebook builder, quota policy, alias normalization; 52 passing).

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).


## 2026-09-18 update

NcfPackageSources (Developer-MAF-V3-Spark branch) — Function global Provit access control: database policies that override code attributes:

1. Database-backed access policies (Senparc.Areas.Admin): global Provit (cross-module floating invocation) access for a Function was previously constrained only in code via `FunctionRenderAttribute` (`AllowGlobalPivot` / `GlobalPivotRoleCodes` / `GlobalPivotPermissionCodes`). Administrators can now store a per-Function policy in a new `ADMIN_NeuCharFunctionProvitAccess` table (unique on `ModuleUid + FunctionKey`), modeled as an ontology-style subject–resource–effect triple: the resource is the stable `(ModuleUid, FunctionKey)` key, subjects are admin users, role codes and/or permission codes (any match passes), and the effect is one of Inherit / Open / Restricted / Deny. A non-inherit policy overrides the code attributes in both directions — it can expose a Function the code does not declare global, or deny one the code allows; Inherit (or an absent policy) falls back to the code baseline.

2. Caching + module-clear resilience: all policy rows are cached in memory by `FullNeuCharFunctionProvitAccessCache` (CO2NET cache strategy, same pattern as `FullSystemConfigCache`), invalidated on every write; a database failure degrades gracefully to the code baseline so global Provit keeps working. Policy rows are intentionally not deleted when an XNCF module is cleared — they survive as "orphan" policies and automatically re-apply when the module is reinstalled. Only manual clearing on the management page deletes them.

3. Access Control management page: a new page under the NeuCharPivot menu (`/Admin/NeuCharPivot/Access`, super admin only) shows the full decision context for every Function — module identity/version/availability, code baseline, current DB policy, and the resulting effective policy (with source: DB or code) — plus orphan policies whose module was cleared. Supports single-row editing (policy mode, user/role/permission pickers, remark) and batch operations across selected rows: apply Open / Restricted / Deny / Inherit, or clear. Migrations synced for all six providers (Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL); unit tests extended for override semantics, restricted subject matching, orphan retention, and binding normalization.

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).


## 2026-09-14 update

NcfPackageSources (Developer-MAF-V3-Spark branch) — NeuBell WebHook v3: request method, body template, and placeholders:

1. Request method: every WebHook endpoint now supports `GET` / `POST` / `PUT` (default `POST`). `GET` sends no request body (data is carried by URL placeholders) and no signature; the HMAC-SHA256 signature (`X-NeuBell-Signature`) now always covers the exact body bytes actually sent. The create function (`纽铃可见提醒测试`) gains an optional `WebHookMethod` parameter.

2. Body template + placeholders: each endpoint may define an optional request-body template using `{{token}}` placeholders (same format as Workflow text templates). A template starting with `{` or `[` is treated as JSON (string tokens are JSON-escaped automatically; `{{payload}}` is embedded verbatim as a JSON fragment, `Content-Type: application/json`); anything else is sent as plain text. The WebHook URL itself may also contain placeholders — substituted values are percent-encoded, and the rendered URL is strictly re-validated before sending (an invalid rendered URL leaves a failed log entry but sends no HTTP request). Tokens: `{{kind}}` `{{provider}}` `{{providerName}}` `{{time}}` `{{payload}}`, item tokens `{{id}}` `{{title}}` `{{summary}}` `{{link}}` `{{status}}` `{{count}}` `{{updated}}`, and change tokens `{{addedCount}}` `{{removedCount}}` `{{addedTitles}}` `{{removedTitles}}`. Unknown tokens render as an empty string. Set `NeuBellWebHook:BaseUrl` (optional, appsettings) to make `{{link}}` emit absolute URLs.

3. Request log now records the HTTP method and the actually-rendered URL/body of each request; the management page and request log gain a "method" column, and the settings form gains a method selector, a body-template editor, and a built-in placeholder reference. A previously latent bug is also fixed: successful change notifications were incorrectly finalized as "请求未完成" (incomplete) in the log. Migrations synced for all six providers (Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL); unit tests extended (renderer behavior, GET semantics, templated URLs, re-validation, log status).

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).

## 2026-09-13 update

NcfPackageSources (Developer-MAF-V3-Spark branch) — NeuCharWorkflow (v0.4.0): Chat trigger + chat message persistence:

1. Chat trigger: choosing "Chat trigger" in the workflow designer gives the workflow a directly shareable chat page URL. Opening that page lets users send messages one by one, and **each message launches a workflow run** (executed entirely by the server-side run coordinator; the browser never takes part in execution). Both signed-in users (Claims identity) and anonymous guests (a 32-byte random token in an HttpOnly cookie, guest access switchable off in settings) are supported, and the two identities never mix within one workflow. The page is self-contained HTML: message bubbles, live node status while a run executes, and a "new conversation" reset button; the admin designer gains the Chat settings (title, greeting, guest toggle) and a "chat page" entry.

2. Chat message persistence: chat history is now stored in a new `NEUCHAR_WORKFLOW_NeuCharWorkflowChatMessage` table (latest 200 messages per session; only the SHA256 digest of the participant key is stored, raw guest tokens never reach the database). After a host restart, opening the page restores the history from the database (n8n-style rebuild-on-load); history is retained for 30 days and expired rows are cleaned daily by a hosted service; resetting a session clears memory and database together; deleting a workflow deletes all of its chat history. Message content is capped at 8000 characters. Migrations synced for all six providers (Sqlite / SqlServer / MySql / PostgreSQL / Oracle / Dm; the Oracle chat content column uses NCLOB, and the replay JSON columns remain CLOB per the original migration to avoid shrinking column types).

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).

## 2026-09-11 update

NcfPackageSources (Developer-MAF-V3-Spark branch) — NeuBell WebHook v2: per-call notification on item creation + full request/result logging:

1. Per-call WebHook on NeuBell creation (Senparc.Areas.Admin): the `纽铃可见提醒测试` FunctionRender (send action) now has an optional `WebHookUrl` parameter. When filled, creating that NeuBell immediately fires an asynchronous POST (`kind=item-created`) to the given URL — fire-and-forget, the Function response is never blocked; an invalid URL sends no HTTP request but still leaves a failed log entry for troubleshooting.

2. WebHook request log: every outbound WebHook request (`item-created` / `items-changed` / `test`) now records its full payload and result in a new `ADMIN_NeuBellWebHookLog` table (status sending → success/failed, HTTP status code, elapsed milliseconds, admin user id). The NeuBell management page adds a "请求日志" (request log) list with payload inspection (pretty-printed JSON), per-row delete and bulk clear (keeps the latest 50). Logging failures only warn — they never block or fail a notification. Migrations synced for all six providers (Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL).

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).

## 2026-09-06 update

NcfPackageSources (Developer-MAF-V3 branch) — Admin experience, AIKernel observability, site protection, and NeuBell WebHook notifications:

1. NeuBell WebHook (WebAPI) notification settings (Senparc.Areas.Admin): administrators can add WebHook endpoints per NeuBell provider (or all providers); when NeuBell items are added or removed, the system dispatches an asynchronous POST notification (fire-and-forget, concurrency-gated). Each setting supports a provider filter, per-event toggles (added / removed), an enable switch, and an optional HMAC-SHA256 signature header (`X-NeuBell-Signature: t=<unix>,v1=<hex>`); a test button sends a `kind=test` event for connectivity checks. Backed by a new `ADMIN_NeuBellWebHook` table (migrations for Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL), an `IHostedService` monitor (polling interval configurable via `NeuBellWebHook:PollingIntervalSeconds`, wake-on-change via the NeuBell change stream) with baseline diffing that avoids false positives on restart or transient snapshot failures. Management page: footer NeuBell drawer -> "WebHook Settings" (`/Admin/NeuBell/Index`, super admin only).

2. AIKernel: token-usage monitor with real-time aggregation and async per-run progress; the AI model list page now shows usage directly.

3. Admin menu: left-menu search filter; a menu "config mode" where first-level menus (e.g. XNCF) can be drag-reordered and saving really updates the stored Sort numbers.

4. Provits (NeuCharPivot): create Provits one by one, create or modify them through AI Chat, and build a "Provit Panel" bound to special pages (e.g. the admin home page `admin-home`) that composes Provit Blocks from any XNCF module, with drag sorting and AI-assisted block editing.

5. Admin Chat: new "Harness" long-task mode (optional, selectable per message) based on Microsoft Agent Framework (MAF) — multi-step autonomous execution with a step budget, timeout control, and `[[DONE]]` completion marker; execution steps are returned to the UI. Default remains the simple chat mode.

6. Site protection: new `CloudflareProtect` SystemConfig section in Senparc.Web (off by default). When enabled, protection (fixed-window rate limiting + security headers) activates immediately from the first request of a site visit.

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).


## 2026-08-30 update

Documentation sync for all XNCF module capabilities in NcfPackageSources (Developer-MAF-V3 branch), highlights:

1. NeuCharWorkflow (0.1.0-preview1, XncfOrder 5890): a complete server-side workflow orchestration suite — visual designer with layout management, versioning with auto-save, run replay (persisted events/snapshots, load-more events), webhook triggers, parallel nodes (concurrent downstream branches), Human Input nodes (external resume), NeuBell notification consumption, and a Workflow Analytics page; template expression binding/validation and observed output schemas; global NeuCharPivot floating invocation gated by the `AllowGlobalPivot` attribute for role-level access control.

2. AgentsManager (0.3.22): A2A (Agent-to-Agent) remote agent support — remote agent connect/publish management, configurable ChatGroup context sharing, `AgentTemplateRunner` for unified local/A2A agent execution, manual-prompt execution of published A2A agents with deployment-model fallback; `AgentModelRequestDiagnostics` for model request diagnostics with sensitive-data redaction; thread management now uses cancellation tokens for graceful shutdown.

3. New modules:
- `Senparc.Xncf.Sandbox` (0.1.0-preview1): standalone sandbox orchestration — create/destroy isolated Docker/Wasm experiment environments with quota/TTL, optional JupyterLab, csharp-exec (.NET 10), and persistent Lab workspace file upload/download; decoupled from the XncfBuilder Preview Host.
- `Senparc.Xncf.DesktopBridge` (0.2.1-preview2): secured HTTP/SSE bridge for NCF desktop companion apps — capability discovery, activity snapshots, authorized resource-change sync stream, one-time PKCE session handoff; `NCF_DESKTOP_BRIDGE_TOKEN` acts as the startup security boundary.
- `Senparc.Xncf.Dapr` (0.0.1): Dapr client abstraction with service invocation (GET/POST/PUT/PATCH/DELETE), pub/sub publishing, state read/write/delete, health checks, and serializer abstractions.
- A new set of Abstractions contract packages: `AIKernel.Abstractions`, `AgentsManager.Abstractions` (0.3.0), `NeuCharWorkflow.Abstractions` (0.2.0), `PromptRange.Abstractions` (0.2.5-preview5), `Sandbox.Abstractions` (0.2.0), `MCP.Abstractions` — cross-module contracts and integration-event abstractions.

4. FirmwareUpdate now mirrors both NCF Host and NCF Desktop installers (`wwwroot/NcfPackages/host` and `/desktop`), with independent download manifests, a download source picker (auto/local/GitHub), and MD5 fingerprint display.

5. Others: `SystemManager` 1.1.3, `XncfBuilder` 0.10.3 (Preview Host process-level module preview), `FileManager` 0.6.0; PromptRange adds API documentation XML (ApiDocXML).

For the full module inventory see [NCF Capability Deep Dive](../../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md).


## 2026-08-29 Update

NcfPackageSources (Developer-MAF-V3 branch) released. Highlights:

1. AgentsManager supports Human-in-the-Loop: tasks can require human approval with configurable max chat rounds and tool permissions; independent `AgentExecutionTask` management, AgentTemplate model binding, and empty-output-token retry are added, and the agent editor can be opened in a new window.

2. NeuCharWorkflow adds global NeuCharPivot floating invocation (access-controlled via the `AllowGlobalPivot` attribute), a Workflow Analytics page (filter by date / workflow / status with summary generation), and a Human Input node (user prompts and external resume); timestamps are standardized on `DateTimeOffset`, `AbortRun` supports aborting by execution log ID, and replay supports loading more events.

3. Stability & diagnostics: new `AgentModelRequestDiagnostics` for model request failures (with automatic sensitive-data redaction), the expression engine preserves non-ASCII characters in JSON serialization, and ChatGroupService runs in isolated scopes with refined token logic.

4. Version bumps: XncfBuilder template `1.1.7`, Senparc.Ncf.Database `0.21.8-preview8`; the download page supports source selection (auto / local / GitHub) and shows MD5 fingerprints; NCF Desktop updated to `0.10.1-build10066`.

See [NcfPackageSources Version Upgrade Notes](../../NcfPackageSources/home/version-upgrade-notes.md) for full upgrade details.


## 2023-04-21 Update

```
Senparc.AI v0.1.4-beta1 new version released
Added chat conversation, Embedding Sample
Senparc.Weixin SDK integration will start soon, stay tuned!
Open source address: https://github.com/Senparc/Senparc.AI

Sample usage introduction:
https://github.com/Senparc/Senparc.AI#%E5%91%BD%E4%BB%A4%E8%A1%8C%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E
```

## 2023-03-10 Update

```
ChatGPT + Dall&#183;E + Senparc WeChat SDK + NeuCharFramework, to achieve a WeChat robot (group) solution based on modular architecture, will be fully open source, plug and play.

```

## 2023-03-06 Update

```
Senparc.Xncf.OpenAI module latest version has been released: https://www.nuget.org/packages/Senparc.Xncf.OpenAI/0.1.4-beta1

After loading into the NCF project, you can test the interface through Swagger (it is recommended to use the source code for local testing, remove the Jwt lock), the next step will be to release a Demo based on WeChat conversation, fully open source, please follow the open source project:

Xncf.OpenAI module: https://github.com/NeuCharFramework/Senparc.Xncf.OpenAI

WeChat SDK: https://github.com/JeffreySu/WeiXinMPSDK
```

## 2021-08-01 Update

    1. Update and release xncf package to nuget
    2. Add configuration
    3. Add configuration database
    4. Add configuration multi-tenant
    5. Update glossary
    6. Add configuration Redis
    7. Improve specified database
    8. Improve basic library update
    9. Improve Xncf to implement your own business logic
    10. Improve advanced development

## 2021-07-20 Update

    1. Update multi-database support
    2. Update multi-database switching
    3. Update multi-database principles
    4. Update logs
    5. Update FAQ

## 2020-09-20 Update

    NCF has released a new beta5, this update includes the underlying database, refactored database synchronization methods, updated documentation module, if new projects are recommended to use the new template, old projects can manually update the database, steps:
    1. Update the latest NCF project code
    2. Set the `Senparc.Service` project as the startup project
    3. In the [Package Manager Console] select `Senparc.Service`, then enter: `update-database -Context SenparcEntities` and press Enter
    4. Done. No other operations are required.
