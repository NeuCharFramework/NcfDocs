# NCF Capability Source Deep Dive (Practical)

> This is source analysis for `NcfPackageSources` developers, not a prerequisite
> for business modules created from a Template. For normal extension work, start
> with [XNCF Extension Contracts and Boundaries](/start/xncf-develop/contracts-and-interfaces.html).
> The content was checked against the development line on 2026-08-13.

## 1. Capability Overview

When learning the current version, focus on these capabilities first:

- EventBus now provides a complete safety/performance model: concurrency, retry, dedupe, depth control, and circular-chain protection.
- `PromptRange` and `AgentsManager` collaboration is more standardized via event-driven AppService flows.
- `KnowledgeBase` already supports the base RAG pipeline: file chunks -> embedding -> recall testing.
- `XncfModuleManager` includes AI-friendly module install/open actions.
- `FirmwareUpdate` introduces release mirroring from GitHub to local `wwwroot/NcfPackages`.
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

| Module                       | Version          | XncfOrder | MCP | Notes                                                                               |
| ---------------------------- | ---------------- | --------: | --- | ----------------------------------------------------------------------------------- |
| Senparc.Xncf.AIKernel        | 5.0.5            |         - | No  | AI model/vector model configuration baseline                                        |
| Senparc.Xncf.PromptRange     | 0.15.2           |      5897 | No  | Prompt range/track and PromptCode assets                                            |
| Senparc.Xncf.AgentsManager   | 0.3.22           |         - | No  | Agent templates, chat group/task orchestration, HIL and Workflow integration; see [guide](../xncf/agents-manager-human-in-the-loop.md) |
| Senparc.Xncf.KnowledgeBase   | 0.1.10           |         - | No  | KB management, import, embedding, recall testing                                    |
| Senparc.Xncf.AIAgentsHub     | 0.1.0            |         - | No  | Early-stage Agent Hub                                                               |
| Senparc.Xncf.NeuCharWorkflow | 0.1.0-preview1   |      5890 | No  | Visual workflow, human-input node, and HIL bridge; see [operator guide](../xncf/neuchar-workflow.md) |
| Senparc.Xncf.MCP             | 0.1.0 (Register) |         - | Yes | NuGet package `0.4.0-preview3`; automatic MCP endpoint mapping                      |

### 2.3 Tooling and Operations Modules

| Module                       | Version                   | XncfOrder | MCP | Notes                                                                                   |
| ---------------------------- | ------------------------- | --------: | --- | --------------------------------------------------------------------------------------- |
| Senparc.Xncf.XncfBuilder     | 0.37.0-preview5 (project) |      5896 | Yes | Template package `0.13.0`; direct scaffolding plus isolated AI development / Sandbox preview / human merge ([guide](../xncf/xncfbuilder-isolated-development.md)) |
| Senparc.Xncf.Sandbox         | 0.1.0-preview1            |         - | No  | Disposable Docker/Wasm experiment environments; [setup](../xncf/sandbox-environment.md) |
| Senparc.Xncf.DesktopBridge   | 0.2.1-preview2            |         - | No  | Protected HTTP/SSE desktop bridge, device pairing, and activity notifications           |
| Senparc.Xncf.DatabaseToolkit | 0.7.1                     |         - | No  | DB update, backup, schema query, AI-agent DB query integration                          |
| Senparc.Xncf.Swagger         | 0.7.1                     |         0 | No  | API documentation module                                                                |
| Senparc.Xncf.Terminal        | 0.1.6                     |         - | No  | Server command execution (high privilege)                                               |
| Senparc.Xncf.FileManager     | 0.2.5                     |         - | No  | File management                                                                         |
| Senparc.Xncf.FirmwareUpdate  | 0.1.0                     |         - | No  | NCF package mirror + latest-release.json maintenance                                    |
| Senparc.Xncf.ChangeNamespace | 0.3.9                     |         - | No  | Global namespace replacement (high risk)                                                |
| Senparc.Xncf.DynamicData     | 0.1.0                     |         - | No  | Dynamic data foundation (early stage)                                                   |
| Senparc.Xncf.SenMapic        | 0.1.3                     |         - | No  | Crawler demo module                                                                     |
| Senparc.Xncf.Application     | 0.0.5                     |         - | No  | External program execution module                                                       |
| Senparc.Xncf.WeixinManager   | 0.21.1                    |      5880 | Yes | WeChat management + MCP support                                                         |

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
