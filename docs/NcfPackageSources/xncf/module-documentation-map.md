# XNCF Module Documentation Map

> Coverage audit performed on 2026-08-14 against the `NcfPackageSources`
> development line. This is a documentation coverage map, not a statement that
> a module is unsupported or unsuitable for production.
>
> The complete project-level audit for
> `NcfPackageSources_Include_NcfSimulatedSite.sln` is maintained in the
> [Solution Project Map](../home/solution-project-map.md). Every runtime
> project in that solution has a beginner-facing introduction there; this page
> tracks the remaining need for deeper, module-specific source analysis.

NCF has two legitimate audiences, and one document type cannot serve both
well:

| Reader                          | Needs first                                                                          | Documentation type         |
| ------------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| Template/application user       | What to install, configure, authorize, operate, and verify                           | **Module usage guide**     |
| `NcfPackageSources` contributor | Register/lifecycle, AppService path, persistence, key methods, extension constraints | **Module source analysis** |

A user of a NuGet/template project should not have to locate implementation
files. Conversely, a source contributor needs more than an Admin-menu tour.
New module documents should therefore lead with the usage guide and link to a
separate source-analysis page when source depth is needed.

## Current Detailed Coverage

| Module / capability                   | Usage guide                                                                                                            | Source analysis                                                                                       | Notes                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Senparc.Xncf.XncfBuilder`            | [Yes](/start/xncf-develop/isolated-xncf-development.html)                                                              | [Yes](./xncfbuilder-isolated-development.md)                                                          | Create/edit/preview/review/merge boundary.                                                 |
| `Senparc.Xncf.Sandbox`                | [Environment setup](./sandbox-environment.md)                                                                          | Included in the XncfBuilder/Sandbox integration analysis                                              | Docker preparation and fixed NCF preview workload.                                         |
| `Senparc.Xncf.AIKernel`               | [Local fine-tuning](./aikernel-local-fine-tuning.md)                                                                   | Worker contract and lifecycle covered in the usage guide; broader model/vector internals remain a gap | SFT/LoRA/QLoRA, offline models, datasets, deployment, evaluation, and operator boundaries. |
| `Senparc.Xncf.NeuCharWorkflow`        | [Operator guide](./neuchar-workflow.md)                                                                                | Integrated, node-level analysis                                                                       | Triggers, nodes, restricted expressions, replay.                                           |
| `Senparc.Xncf.AgentsManager`          | [HIL and Workflow integration](./agents-manager-human-in-the-loop.md), [3D status view](./agents-manager-3d-status.md) | Integration and runtime view covered                                                                  | Agent / Group / A2A HIL requests, 3D status, skill markers, and spatial-layout boundaries. |
| `Senparc.Xncf.MCP`                    | [Dedicated guides](/MCP/home/index.html)                                                                               | Partial common-register analysis                                                                      | Installation, use, API, FAQ exist; module internals still need a focused page.             |
| `Senparc.Web` / `Senparc.Areas.Admin` | [Host and Admin guide](./senparc-web-admin.md)                                                                         | Host composition and Admin boundary                                                                   | Run, install, sign in, module enablement, and source ownership.                            |
| XNCF framework / custom module        | [Template development](/start/xncf-develop/about-xncf.html)                                                            | [Capability guide](../home/capability-guide.md)                                                       | Framework-level rather than one official module.                                           |

The project map now covers every runtime project in the target solution. The
following backlog is intentionally narrower: it identifies modules that need a
dedicated deep-dive page beyond their complete project-map introduction.

## Complete Module Inventory and Documentation Backlog

### P0 — Module Governance and Platform Baseline

These modules should be documented first because every installed module depends
on their lifecycle, menu, authorization, or tenant assumptions.

| Module                           | Missing essential guide content                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Senparc.Xncf.XncfModuleManager` | Usage: discovery/install/open/close/function diagnostics. Source: module state transition, register scan, AI-friendly install action. |
| `Senparc.Xncf.SystemCore`        | Usage: required baseline data and installation order. Source: DbContext/factory registration and system entity lifecycle.             |
| `Senparc.Xncf.SystemManager`     | Usage: system configuration and operational dependencies. Source: configuration read/write boundaries and background services.        |
| `Senparc.Xncf.SystemPermission`  | Usage: role/permission administration. Source: policy mapping, authorization checks, and admin scope.                                 |
| `Senparc.Xncf.Menu`              | Usage: menu administration. Source: menu registration and localization path.                                                          |
| `Senparc.Xncf.Tenant`            | Usage: tenant enablement/isolation. Source: tenant resolution and `IIgnoreMulitTenant` exceptions.                                    |
| `Senparc.Xncf.AreasBase`         | Source: Area baseline conventions and its relationship with `Senparc.Ncf.AreaBase`.                                                   |

### P1 — AI, Prompt, Agent, and Knowledge Chain

These modules should be documented as one end-to-end operational journey, while
keeping their source pages separate enough to explain their different data and
execution models.

| Module                       | Missing essential guide content                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Senparc.Xncf.AIKernel`      | [Local fine-tuning is covered](./aikernel-local-fine-tuning.md). Remaining: general model/vector provider configuration, credential ownership, inference model selection, and source service selection. |
| `Senparc.Xncf.PromptRange`   | Prompt asset/PromptCode lifecycle, version/range selection; source AppService/events and storage model.                                                                                                 |
| `Senparc.Xncf.AgentsManager` | Agent template, ChatGroup, task and A2A usage; source task runner, participant resolution, streaming/error boundaries.                                                                                  |
| `Senparc.Xncf.KnowledgeBase` | Import/embedding/recall operations and data-retention expectations; source resource policy, chunk/embedding lifecycle.                                                                                  |
| `Senparc.Xncf.MCP`           | Add a source page for endpoint mapping, Function exposure, auth/rate-limit/audit boundary.                                                                                                              |
| `Senparc.Xncf.AIAgentsHub`   | State the current maturity, supported integrations, and intentionally unsupported scenarios before promoting use.                                                                                       |

### P1 — Operations, Development, and High-Risk Capabilities

Each of these needs a usage page with permissions, rollback, and production
constraints before a source deep dive.

| Module                         | Missing essential guide content                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `Senparc.Xncf.DatabaseToolkit` | Backup/update/query permissions, multi-database scope, transaction/rollback limits, AI query boundary.    |
| `Senparc.Xncf.FileManager`     | Upload/storage/resource-purpose policy, public versus knowledge-base assets, path traversal boundary.     |
| `Senparc.Xncf.DesktopBridge`   | Pairing, bridge token rotation, SSE lifecycle, desktop compatibility and network boundary.                |
| `Senparc.Xncf.FirmwareUpdate`  | Feed/mirror configuration, rate-limit/backoff behavior, manual versus background sync, failure isolation. |
| `Senparc.Xncf.Terminal`        | Strict operator-only usage, command allow-list/audit/host privilege model; source command execution path. |
| `Senparc.Xncf.Swagger`         | Enablement, route exposure and production auth policy.                                                    |
| `Senparc.Xncf.DynamicData`     | Current maturity and supported dynamic-data boundaries.                                                   |

### P2 — Integration, Communications, and Utility Modules

These need concise task-oriented guides first, then source analysis as their
contract surface becomes stable.

| Module                       | Missing essential guide content                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `Senparc.Xncf.WeixinManager` | Account/app configuration, credential protection, message/API lifecycle, optional MCP exposure.   |
| `Senparc.Xncf.Dapr`          | Enablement, component prerequisites, local versus cluster behavior, retry/observability boundary. |
| `Senparc.Xncf.Application`   | External-program registration, host permissions, timeout/logging and rollback.                    |
| `Senparc.Xncf.SenMapic`      | Crawler target policy, rate limiting, legal/operational constraints, sample status.               |

## Recommended Page Shape for Every Module

### 1. Usage guide: works without source access

1. Purpose, maturity, dependencies, and non-goals.
2. Install/enable/configure/authorize steps.
3. One normal workflow and one failure/rollback workflow.
4. Security and production checklist: secrets, permissions, network, resource
   limits, audit, and data retention.
5. Troubleshooting order and links to related modules.

### 2. Source analysis: supports contributors

1. Project/layer map: `Register`, `Register.Area`, `Register.Database`,
   `Domain`, `Application`, `OHS`, `Areas`, resources, and tests.
2. Register metadata, lifecycle hooks, DbContext/migration ownership, and
   module dependencies.
3. Key AppService entry points, domain services, background jobs/events, and
   request/data flow.
4. Critical methods with input validation, authorization, concurrency, failure
   handling, and extension constraints.
5. Test seam and a short change checklist that protects public contracts.

## Maintenance Rule

Whenever a module changes any of the following, update its two pages or add an
explicitly labelled gap to this map:

- `Register` version/order, installation state, or module dependency;
- public FunctionRender/MCP surface or AI invocation eligibility;
- authorization/policy, secret handling, network, or data-retention behavior;
- migration/database model, background job, or external-service contract;
- a user-visible workflow, rollback path, or operational requirement.

## Reading Routes

- Template/application users: [Template-Based Development](/start/xncf-develop/about-xncf.html), then the individual module usage guide.
- Source contributors: [XNCF Extension Library Guide](../home/xncf-extension-modules.md), then the module source analysis and the relevant NCF base-library pages.
- First detailed module pages: [XncfBuilder](./xncfbuilder-isolated-development.md), [Sandbox](./sandbox-environment.md), [NeuCharWorkflow](./neuchar-workflow.md), and [AgentsManager HIL integration](./agents-manager-human-in-the-loop.md).
- Local training operators: [AIKernel local fine-tuning](./aikernel-local-fine-tuning.md), including separate inference registration and KnowledgeBase/RAG boundaries.
