# NCF Capability Source Deep Dive (Practical)

> This is source analysis for `NcfPackageSources` developers, not a prerequisite
> for business modules created from a Template. For normal extension work, start
> with [XNCF Extension Contracts and Boundaries](/start/xncf-develop/contracts-and-interfaces.html).
> Verify version-specific behavior against the source commit you are using.

## 1. Capability Overview

When learning the current version, focus on these capabilities first:

- EventBus now provides a complete safety/performance model: concurrency, retry, dedupe, depth control, and circular-chain protection.
- `PromptRange` and `AgentsManager` collaboration is more standardized via event-driven AppService flows.
- `KnowledgeBase` already supports the base RAG pipeline: file chunks -> embedding -> recall testing.
- `XncfModuleManager` includes AI-friendly module install/open actions.
- `FirmwareUpdate` now mirrors both NCF Host and NCF Desktop installers from GitHub Release into local `wwwroot/NcfPackages/host` and `/desktop`, with independent download manifests, source picker, and MD5 fingerprints.
- `NeuCharWorkflow` adds server-side workflow orchestration: visual designer, versioning with auto-save, run replay, webhook triggers, parallel nodes, Human Input nodes, NeuBell notifications, and a Workflow Analytics page.
- `AgentsManager` supports A2A (Agent-to-Agent) remote agents: remote agent connect/publish, ChatGroup context sharing, and `AgentTemplateRunner` for unified local/A2A execution; it also adds Human-in-the-Loop approval policies and standalone `AgentExecutionTask` management.
- `Senparc.Xncf.Sandbox` provides standalone sandbox orchestration: create/destroy isolated Docker/Wasm experiment environments (quotas — 10 per user / 50 global — TTL, JupyterLab external control: commands with stdin and Python/C# Notebook creation, optional extra port mappings for exposing in-container web services, session aliases, workspace file management), decoupled from the XncfBuilder Preview Host.
- `Senparc.Xncf.DesktopBridge` exposes a secured HTTP/SSE bridge for NCF desktop companion apps (capability discovery, activity snapshots, authorized sync stream, one-time PKCE handoff).
- `Senparc.Xncf.Dapr` provides a Dapr client abstraction: service invocation, pub/sub, state management, and health checks.
- **NeuBell WebHook (WebAPI) notification settings** (Senparc.Areas.Admin): administrators can register WebHook endpoints per NeuBell provider (or all providers); when NeuBell items are added or removed, the system dispatches an asynchronous notification (fire-and-forget, concurrency-gated) using a configurable HTTP method (`GET` / `POST` / `PUT`), an optional request-body template with `{{token}}` placeholders (same format as Workflow text templates; URLs and JSON bodies supported), an optional HMAC-SHA256 signature header (`X-NeuBell-Signature`, covering the exact body sent) and a test-send action. The create function (`纽铃可见提醒测试`) accepts optional `WebHookUrl` / `WebHookMethod` parameters that fire a one-off asynchronous `item-created` request when a NeuBell is created (fire-and-forget, never blocks the response). Every outbound request (`item-created` / `items-changed` / `test`) is recorded with its method, rendered URL and full payload/result in a request-log list on the management page (inspect / delete / bulk clear). A background monitor (polling + wake-on-change) diffs per-provider baselines to avoid false positives on restart or transient snapshot failures.
- **AIKernel token-usage monitoring**: real-time aggregation with async per-run progress; usage is now visible directly on the AI model list page.
- **Admin menu search + config mode**: the left menu has a search filter, and a config mode allows drag-reordering first-level menus; saving really updates the stored Sort values.
- **Provits (NeuCharPivot)**: create Provits one by one, create or modify them via AI Chat, and build a "Provit Panel" bound to a special page (e.g. admin home `admin-home`) composed of Provit Blocks from any XNCF module, with drag sorting and AI-assisted block editing.
- **Provit access control (DB-backed policies)** (Senparc.Areas.Admin): global Provit (cross-module floating invocation) access for a Function is no longer code-only. Besides the `FunctionRenderAttribute` baseline (`AllowGlobalPivot` / `GlobalPivotRoleCodes` / `GlobalPivotPermissionCodes`), administrators can store a per-Function database policy in the new `ADMIN_NeuCharFunctionProvitAccess` table. Each policy is an ontology-style subject–resource–effect triple: the **resource** is the stable key `(ModuleUid, FunctionKey)`, the **subjects** are admin users, role codes and/or permission codes (any match passes), and the **effect** is one of Inherit / Open / Restricted / Deny. A non-inherit policy always **overrides the code attributes** (it can expose a Function the code does not declare global, or deny one the code allows). Policy rows are cached in memory (`FullNeuCharFunctionProvitAccessCache`, invalidated on write) so enforcement stays O(1) without a database round-trip. Policies are deliberately **not removed when an XNCF module is cleared** — they survive as "orphan" rows and automatically re-apply when the module is reinstalled; only manual clearing deletes them. Managed on the **Access Control** page under the NeuCharPivot menu (`/Admin/NeuCharPivot/Access`, super admin): each row shows the full decision context (code baseline + DB policy + effective policy), single-row editing with user/role/permission pickers, and batch open / restrict / deny / restore-inherit / clear across selected Functions.
- **Admin Chat Harness mode**: an optional long-task mode based on Microsoft Agent Framework (MAF) with step budget, timeout control, and a `[[DONE]]` completion marker; the simple chat mode remains the default.
- **Multi-tenant data isolation engine (all XNCF modules)** (Senparc.Ncf.XncfBase / Senparc.Xncf.Tenant): the `XncfDatabaseDbContext` global query filter is aligned with `SenparcEntitiesDbContextBase` — once multi-tenancy is enabled (`SenparcCoreSetting:EnableMultiTenant`), every entity implementing `IMultiTenancy` but not `IIgnoreMulitTenant` is automatically filtered by `TenantId == current request tenant`, and new entities are stamped with `TenantId` on `SaveChanges`; single-tenant mode (the default) is unchanged. Tenant resolution supports `DomainName` / `RequestHeader` / `LoginInput` rules; both Cookie and JWT logins can carry a `TenantKey` (the tenant is resolved before the account lookup, and the JWT stores `TenantKey` as a claim). The tenant management page (`/Admin/TenantInfo`) shows the **Admins** count per tenant, and deletion is protected by three guards (in-use tenant / last enabled tenant / tenant with admin accounts). See [Configure Multi-Tenant](../../start/config/mutiple-tenant.md).
- **AdminChat per-account isolation** (Senparc.Areas.Admin): all AI-assistant session/message endpoints (list, detail, send, archive, delete, feedback) and Harness trajectory operations perform ownership checks against the logged-in admin; cross-account access returns "session not found or forbidden". Super administrators (`administrator` role) get a **Usage Stats** panel on the AdminChat page: per-account session counts (total/active/archived/deleted), message counts and last-active time — counts only, no session or message content is exposed; with multi-tenancy enabled the statistics are likewise constrained by the tenant filter.
- **CloudflareProtect site protection** (Senparc.Web): a new `CloudflareProtect` SystemConfig section (off by default) that activates fixed-window rate limiting and security headers immediately from the first request when enabled.
- MCP integration is now part of the common register contract (`IXncfRegister` + `XncfRegisterBase`).
- The simulated host now targets .NET 10 and includes Chinese, English, Japanese, French, Spanish, and Russian resources.
- The installer preselects six foundational modules and presents a confirmation list before installation.

### 1.1 XNCF as Single-Granularity Module Units (Framework Meaning)

In NCF, `Senparc.Xncf.xxx` is not an optional plugin bundle. It is the core capability-unit model of the modular framework.  
Each XNCF module should be treated as a single-granularity unit: one capability domain, independent registration, independent lifecycle, and independent governance boundary.

That means:

- `Senparc.Ncf.*` provides framework foundation capabilities.
- `Senparc.Xncf.*` delivers business capability assembly and evolution.

If you only study base libraries but skip XNCF modules, you understand “how the framework runs” but miss “how product capabilities are composed”.

## 2. Extension Module Inventory (Actual Register Values)

### 2.1 System Core Modules (59xx)

| Module                         | Version | XncfOrder | Responsibility                                                        |
| ------------------------------ | ------- | --------: | --------------------------------------------------------------------- |
| Senparc.Xncf.Menu              | 0.1     |      5940 | System menu management                                                |
| Senparc.Xncf.XncfModuleManager | 0.1.2   |      5950 | Module state governance, install/open actions, function status checks |
| Senparc.Xncf.AreasBase         | 0.1     |      5955 | Area baseline capability                                              |
| Senparc.Xncf.SystemPermission  | 0.2.0   |      5960 | Permission management                                                 |
| Senparc.Xncf.SystemManager     | 1.1.2   |      5970 | System configuration and management                                   |
| Senparc.Xncf.SystemCore        | 0.1.1   |      5980 | Core system structures                                                |
| Senparc.Xncf.Tenant            | 0.1     |      5990 | Multi-tenant capability                                               |

### 2.2 AI / RAG / Agents Modules

| Module                       | Version          | XncfOrder | MCP | Notes                                                                                                                                  |
| ---------------------------- | ---------------- | --------: | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Senparc.Xncf.AIKernel        | 5.0.5            |         - | No  | AI model/vector model configuration baseline                                                                                           |
| Senparc.Xncf.PromptRange     | 0.15.2           |      5897 | No  | Prompt range/track and PromptCode assets                                                                                               |
| Senparc.Xncf.AgentsManager   | 0.3.22           |         - | No  | Agent templates, chat group/task orchestration, HIL and Workflow integration; see [guide](../xncf/agents-manager-human-in-the-loop.md) |
| Senparc.Xncf.KnowledgeBase   | 0.1.10           |         - | No  | KB management, import, embedding, recall testing                                                                                       |
| Senparc.Xncf.AIAgentsHub     | 0.1.0            |         - | No  | Early-stage Agent Hub                                                                                                                  |
| Senparc.Xncf.NeuCharWorkflow | 0.1.0-preview1   |      5890 | No  | Visual workflow, human-input node, and HIL bridge; see [operator guide](../xncf/neuchar-workflow.md)                                   |
| Senparc.Xncf.MCP             | 0.1.0 (Register) |         - | Yes | NuGet package `0.4.0-preview3`; automatic MCP endpoint mapping                                                                         |

### 2.3 Tooling and Operations Modules

| Module                       | Version                   | XncfOrder | MCP | Notes                                                                                                                                                             |
| ---------------------------- | ------------------------- | --------: | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Senparc.Xncf.XncfBuilder     | 0.37.0-preview5 (project) |      5896 | Yes | Template package `0.13.0`; direct scaffolding plus isolated AI development / Sandbox preview / human merge ([guide](../xncf/xncfbuilder-isolated-development.md)) |
| Senparc.Xncf.Sandbox         | 0.1.0-preview1            |         - | No  | Disposable Docker/Wasm experiment environments; [setup](../xncf/sandbox-environment.md)                                                                           |
| Senparc.Xncf.DesktopBridge   | 0.2.1-preview2            |         - | No  | Protected HTTP/SSE desktop bridge, device pairing, and activity notifications                                                                                     |
| Senparc.Xncf.DatabaseToolkit | 0.7.1                     |         - | No  | DB update, backup, schema query, AI-agent DB query integration                                                                                                    |
| Senparc.Xncf.Swagger         | 0.7.1                     |         0 | No  | API documentation module                                                                                                                                          |
| Senparc.Xncf.Terminal        | 0.1.6                     |         - | No  | Server command execution (high privilege)                                                                                                                         |
| Senparc.Xncf.FileManager     | 0.2.5                     |         - | No  | File management                                                                                                                                                   |
| Senparc.Xncf.FirmwareUpdate  | 0.1.0                     |         - | No  | NCF package mirror + latest-release.json maintenance                                                                                                              |
| Senparc.Xncf.ChangeNamespace | 0.3.9                     |         - | No  | Global namespace replacement (high risk)                                                                                                                          |
| Senparc.Xncf.DynamicData     | 0.1.0                     |         - | No  | Dynamic data foundation (early stage)                                                                                                                             |
| Senparc.Xncf.SenMapic        | 0.1.3                     |         - | No  | Crawler demo module                                                                                                                                               |
| Senparc.Xncf.Application     | 0.0.5                     |         - | No  | External program execution module                                                                                                                                 |
| Senparc.Xncf.WeixinManager   | 0.21.1                    |      5880 | Yes | WeChat management + MCP support                                                                                                                                   |
| Senparc.Xncf.Accounts        | -                         |         - | No  | Account management module                                                                                                                                         |
| Senparc.Xncf.Installer       | -                         |         - | No  | NCF installer                                                                                                                                                     |

Abstractions packages such as `AIKernel.Abstractions`, `AgentsManager.Abstractions`,
`MCP.Abstractions`, `PromptRange.Abstractions`, `NeuCharWorkflow.Abstractions`,
and `Sandbox.Abstractions` provide cross-module contracts and integration-event
types; they do not have a module `Register`. `EmailExtension`, `OfficeExtension`,
`SmsExtension`, and `ReloadPage` are source-only unpublished extensions.

## 3. Key Mechanisms (Code-Aligned)

### 3.1 EventBus: Concurrency + Safety Boundaries

Core files:

- `Senparc.Ncf.Core/EventBus/InMemoryEventBus.cs`
- `Senparc.Ncf.Core/EventBus/EventBusHostedService.cs`
- `Senparc.Ncf.Shared.Abstractions/Events/IIntegrationEvent.cs`

Capabilities:

- Configurable `MaxConcurrency`
- Dedupe via event ID tracking window
- Retry with exponential backoff
- Max event chain depth enforcement
- Circular reference detection

Recommended registration:

```csharp
services.AddSenparcEventBus(options =>
{
    options.MaxConcurrency = Math.Max(8, Environment.ProcessorCount * 2);
    options.EnableDuplicateDetection = true;
    options.RetryOnFailure = true;
    options.MaxRetryAttempts = 3;
    options.MaxEventChainDepth = 10;
    options.EnableCircularReferenceDetection = true;
}, typeof(YourHandler).Assembly);
```

### 3.2 FunctionRender: Recommended Function Registration Model

Current facts:

- `IXncfRegister.Functions` is commented out in current contract.
- Function discovery is based on `[FunctionRender]` in `AppServiceBase` descendants.
- Scan results are stored in `Register.FunctionRenderCollection` and queryable by module UID.

This keeps module function declarations closer to executable code and reduces register-level manual maintenance.

### 3.3 MCP: Unified Switch + Unified Routing Pattern

Mechanism:

- Module switch: `EnableMcpServer => true`
- Registration: `AddMcpServer(IServiceCollection, IXncfRegister)`
- Activation: `UseMcpServer(IApplicationBuilder, IRegisterService)`
- Route pattern: `mcp-<module-name-lowercase>`
- Append `/sse` for the SSE endpoint; for example `/mcp-senparc-xncf-mcp/sse` for the MCP module

Use `XncfRegisterManager.McpServerInfoCollection` to inspect registered MCP server metadata.

::: warning Security boundary
The source contains an `McpAccessToken` setting, but query-token validation is not enabled on the automatic mapping path. Add authentication, rate limiting, and auditing at the reverse proxy, gateway, or application layer before external exposure.
:::

### 3.4 API Authorization Reinforcement (AgentsManager / PromptRange)

The current version applies stronger auth baseline for management AppServices:

- Dual auth compatibility (admin cookie + JWT bearer)
- policy-driven access control (for example `AdminOnly`)
- explicit frontend handling for 401/403

Recommendation: keep this baseline for all newly added management APIs.

### 3.5 Global Provit Access: Code Baseline + Database Policy Overlay

Mechanism:

- Code baseline: `[FunctionRender(AllowGlobalPivot = true, GlobalPivotRoleCodes = ..., GlobalPivotPermissionCodes = ...)]` declares whether a Function may be invoked through the global Provit and with which role/permission restrictions.
- Database overlay: `ADMIN_NeuCharFunctionProvitAccess` holds at most one policy per `(ModuleUid, FunctionKey)` with `AccessMode` = Inherit (0) / Open (1) / Restricted (2) / Deny (3) plus comma-separated subject bindings (role codes, permission codes, admin user IDs).
- Resolution order: an Inherit (or absent) policy falls back to the code baseline; any other mode fully overrides the code attributes. Restricted passes when any bound user, role code or permission code matches.
- Caching: all policy rows live in `FullNeuCharFunctionProvitAccessCache` (CO2NET cache strategy, same pattern as `FullSystemConfigCache`); every write invalidates the cache.
- Lifecycle: module uninstall does **not** touch policy rows (orphan retention); the module's tables are dropped only for the module's own DbContext. Manual clear on the Access Control page performs a hard delete.

Recommendation: use code attributes for the default contract shipped with a module, and the database policies for per-site governance (emergency deny, scoped rollout, temporary exposure) without republishing the module.

## 4. Scenario Playbooks

### 4.1 Scenario A: Design and Operate a NeuChar Workflow

1. Install and enable `Senparc.Xncf.NeuCharWorkflow` in XncfModuleManager; its installation applies its module migrations.
2. Open **NeuChar Workflow**, create a workflow, choose one trigger, then connect reachable nodes from that trigger.
3. Configure enabled XNCF Functions, Agent/A2A objects, or system nodes. Use the task list for execution status and read-only replay.
4. For interval or Webhook execution, enable the workflow only after the graph and referenced modules are valid.

For supported nodes, trigger rules, and the restricted `{{= ... }}` language, see [NeuChar Workflow](../xncf/neuchar-workflow.md).

### 4.2 Scenario B: Build an AI + Prompt + Agent + Knowledge Pipeline

1. Install/open baseline modules: `AIKernel`, `PromptRange`, `AgentsManager`, `KnowledgeBase`.
2. Configure model sets in `AIKernel` (chat/embedding/vector).
3. Build PromptCode assets in `PromptRange`.
4. Create AgentTemplate from PromptCode and compose ChatGroup/Task in `AgentsManager`.
5. Import files and run embedding in `KnowledgeBase`, then validate retrieval with recall testing.
6. Connect retrieval output with agent execution loops for iterative quality improvements.

For optional behavior/format adaptation, see [AIKernel local fine-tuning](../xncf/aikernel-local-fine-tuning.md). It runs in a separate authenticated worker, not the NCF web process. An evaluated adapter or merged model must be deployed and registered for inference separately; it does not replace steps 5 and 6 or supply current, access-controlled knowledge.

### 4.2.1 Scenario B1: Connect Agent/Group HIL to Workflow

1. Confirm that both `AgentsManager` and `NeuCharWorkflow` are installed and enabled.
2. Search for and add an Agent, Agent group, or A2A object in Workflow, then configure its Prompt and edges.
3. When execution reaches `humanTurn` or `toolApproval`, resolve HIL from either the Workflow run panel or the AgentsManager page.
4. For a pure Workflow approval or missing-information step, use the native Wait for human input system node. If an external program must submit it, configure the node resume key and WebAPI from the Workflow guide.

HIL currently depends on in-process wait handles. An application restart or multi-instance routing can leave an existing wait unable to continue; production deployments need additional persistent checkpoints, shared coordination, and audit design. See [AgentsManager HIL and Workflow integration](../xncf/agents-manager-human-in-the-loop.md).

### 4.3 Scenario C: Module Governance (Install, Open, Diagnose)

Use `XncfModuleManager` as the first operational entry:

- Get all module statuses
- Install and switch module state to open (including AI-friendly action)
- Inspect module function loading state

This is the quickest path to diagnose “module exists but capability is unavailable”.

### 4.4 Scenario D: Database Maintenance and Release Safety

- Dev/maintenance: combine `DatabaseToolkit` and `DatabasePlant` for multi-db operations.
- Release: avoid shipping `DatabasePlant` in production runtime packages.
- Schema updates: prioritize module-owned DbContext migration flows.

### 4.5 Scenario E: Desktop Package Mirror Backup Channel

`FirmwareUpdate` is suitable for release fallback workflows:

- pull releases from `NeuCharFramework/NCF`
- sync to local `wwwroot/NcfPackages`
- keep latest 3 versions
- update `latest-release.json`

Useful for official mirrors and backup download paths.

### 4.6 Scenario F: Localization and First-Time Installation

- The site and installer support `zh-CN`, `en`, `ja`, `fr`, `es`, and `ru`.
- Function parameter descriptions can bind resource keys through `[LocalizedDescription]`.
- First-time installation preselects Administrator, PromptRange, XncfBuilder, MCP, AIKernel, and AgentsManager; state is written only after the user confirms the list.

## 5. High-Risk Modules (Pre-Production Review Required)

- `Senparc.Xncf.Terminal`: server command execution, strict access control required.
- `Senparc.Xncf.ChangeNamespace`: potentially irreversible global refactor action.
- `Senparc.Xncf.DatabaseToolkit`: direct DB write capabilities, enforce least privilege.
- `Senparc.Xncf.MCP`: external tool invocation boundary, require auth/rate-limit/audit.

## 6. Common Beginner Mistakes (Source-Level Reality)

- Verifying only “module installed”, without checking “enabled + authorized + configured”.
- Debugging Function issues by relying on `IXncfRegister.Functions` assumptions.
- Patching API code immediately on 401/403 instead of checking policy/auth context first.
- Tweaking retrieval logic first for poor RAG quality, while root cause is missing embedding config or low-quality data.

## 7. Troubleshooting Priority (Recommended Team Standard)

When functionality breaks, use this order across the team:

1. **Module state layer**: install, enablement, version, dependency readiness.
2. **Registration layer**: FunctionRender, MCP, and auto-mapping scan registration.
3. **Authorization/policy layer**: cookie/bearer context, policies, and role permissions.
4. **Runtime layer**: logs, stack traces, and external dependencies (model service, DB, network).

A shared troubleshooting order prevents cross-team diagnosis conflicts.

## 8. From User to Contributor (Open-Source Workflow)

### 8.1 Minimum Template for High-Quality Issues

Every issue should include at least:

1. Environment info: OS, .NET version, DB type.
2. Repository info: commit SHA (or release tag).
3. Repro steps: 3-8 steps with minimal scope.
4. Expected result vs actual result.
5. Key logs/screenshots (desensitized).

### 8.2 PR Checklist

Before opening PR, verify:

- The PR solves one well-defined class of problem.
- Documentation is updated when behavior changes.
- Compatibility impact and rollback path are documented.
- Minimum verification evidence is included (build pass + key flow reproducible).

### 8.3 Documentation Co-Maintenance Triggers

Update docs whenever these happen:

- `Register.Version` changes.
- A module enables/disables `EnableMcpServer`.
- EventBus concurrency/retry/dedupe/chain-protection strategy changes.
- Auth policy or permission strategy changes for management APIs.
- Module install/enable/config workflow changes.

## 9. Suggested Documentation Maintenance Rules

- Update this page whenever a module `Register.Version` changes.
- Add MCP notes whenever a module turns on `EnableMcpServer`.
- Update EventBus section when concurrency/retry/dedupe/cycle rules change.
- Update auth section whenever management API auth policy changes.

## 10. Upgrade Notes

See the dedicated page:

- [Version Upgrade Notes](./version-upgrade-notes.md)

---

For foundational internals, continue with:

- [Senparc.Ncf.Core](../libs/Senparc.Ncf.Core.md)
- [Senparc.Ncf.XncfBase](../libs/Senparc.Ncf.XncfBase.md)
- [IXncfRegister](../libs/Senparc.Ncf.AreaBase/IxncfRegister.md)
