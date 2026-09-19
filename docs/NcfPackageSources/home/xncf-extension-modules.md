# XNCF Extension Library Guide (Senparc.Xncf.xxx)

> Scope: current `NcfPackageSources` version.  
> This page fills the missing half beside “NCF libraries”: **XNCF extension modules (`Senparc.Xncf.xxx`)**.

## 1. Why It Feels Like “XNCF Is Missing”

The “NCF Libraries” section mainly covers `Senparc.Ncf.*`, which is the runtime foundation layer (Core, Repository, Service, Database, etc.).

But in NCF architecture, `Senparc.Xncf.*` is the capability assembly layer. Without it, docs cover the “foundation” but not the “building blocks”.

## 2. NCF Definition as a Modular Framework

In NCF, modularization is not just folder separation. It is a runtime-governable capability system where units are discoverable, installable, enable/disable-able, and operable.

Think in two layers:

- `Senparc.Ncf.*`: framework foundation layer (shared runtime capabilities and constraints).
- `Senparc.Xncf.*`: capability module layer (feature delivery by installable modules).

### 2.1 XNCF as a Single-Granularity Module Unit (Key)

A `Senparc.Xncf.xxx` module is a **single-granularity capability unit**:

- Own `Register` metadata and lifecycle (install/update/uninstall).
- Can declare its own database, menu, Function, and MCP capability.
- Can be independently enabled, disabled, operated, and secured.

This is the core engineering value of NCF modularity: **capabilities are split into governable minimal units instead of being fused into a monolith.**

## 3. Why Developers Should Care About XNCF Modules

- Lower coupling: clear boundaries, less cross-module entanglement.
- Independent evolution: module-level version iteration.
- Controlled release: module-level rollout and rollback.
- Stronger security: high-risk capabilities (for example Terminal/DatabaseToolkit) can be isolated.
- Better team collaboration: module-level ownership and cleaner PR boundaries.

## 4. Common XNCF Module Map in the Current Version

### 4.1 System Baseline Modules

- `Senparc.Xncf.SystemCore` (v0.1.1): system core services
- `Senparc.Xncf.SystemManager` (v1.1.3): system administration
- `Senparc.Xncf.SystemPermission` (v0.2.0): permission / role management
- `Senparc.Xncf.XncfModuleManager` (v0.1.2): XNCF module management core
- `Senparc.Xncf.Menu` (v0.1): menu management
- `Senparc.Xncf.Tenant` (v0.1): multi-tenancy
- `Senparc.Xncf.AreasBase` (v0.1): area base module

### 4.2 AI / Agent / RAG Modules

- `Senparc.Xncf.AIKernel` (v5.0.5): AI model / vector model configuration and runtime baseline; token-usage monitoring with real-time aggregation and async per-run progress
- `Senparc.Xncf.PromptRange` (v0.15.2): prompt range/track and PromptCode assets
- `Senparc.Xncf.AgentsManager` (v0.3.22): agent templates, chat group/task orchestration, HITL approvals, A2A remote agents, AgentExecutionTask management
- `Senparc.Xncf.NeuCharWorkflow` (v0.1.0-preview1): server-side workflow orchestration (visual designer, versioning with auto-save, run replay, webhook triggers, parallel nodes, Human Input nodes, NeuBell notifications, Analytics)
- `Senparc.Xncf.KnowledgeBase` (v0.1.10): KB management, import, embedding, recall testing
- `Senparc.Xncf.AIAgentsHub` (v0.1.0): Agent Hub sample module (multi-database contexts, function endpoints, localized resources)
- `Senparc.Xncf.MCP` (v0.1.0): MCP endpoint and execution management (`EnableMcpServer`)
- `Senparc.Xncf.Sandbox` (v0.3.3): standalone sandbox orchestration (isolated Docker/Wasm environments, quota 10/user / 50 global, TTL, JupyterLab external control — commands with stdin and Python/C# Notebook creation, optional extra port mappings, session aliases, workspace file management)
- Contract packages: `AIKernel.Abstractions`, `AgentsManager.Abstractions`, `MCP.Abstractions`, `PromptRange.Abstractions`, `NeuCharWorkflow.Abstractions`, `Sandbox.Abstractions`

### 4.3 Tooling and Ops Modules

- `Senparc.Xncf.XncfBuilder` (v0.10.3): module scaffolding, migration commands, AI-assisted code generation, Preview Host (process-level module preview)
- `Senparc.Xncf.DatabaseToolkit` (v0.7.1): DB update, backup, schema query, AI-agent DB query integration
- `Senparc.Xncf.FileManager` (v0.6.0): file management
- `Senparc.Xncf.Terminal` (v0.1.6): server command execution (high privilege)
- `Senparc.Xncf.FirmwareUpdate` (v0.1.0): dual installer mirror for NCF Host / NCF Desktop (GitHub Release -> `wwwroot/NcfPackages/host` and `/desktop`, independent download manifests + MD5 fingerprints)
- `Senparc.Xncf.Dapr` (v0.0.1): Dapr client abstraction (service invocation, pub/sub, state management, health checks)
- `Senparc.Xncf.DesktopBridge` (v0.2.1-preview2): HTTP/SSE bridge for desktop companion apps (capability discovery, activity snapshots, authorized sync stream, one-time PKCE handoff)
- `Senparc.Xncf.ChangeNamespace` (v0.3.9): global namespace replacement (high risk)
- `Senparc.Xncf.DynamicData` (v0.1.0): dynamic data foundation module (separate ForNcf variant)
- `Senparc.Xncf.SenMapic` (v0.1.3): SenMapic crawler module
- `Senparc.Xncf.Application` (v0.0.5): external program execution module
- `Senparc.Xncf.WeixinManager` (v0.21.1): WeChat management console + MCP support
- `Senparc.Xncf.Swagger` (v0.7.1): API documentation module
- `Senparc.Xncf.Accounts` (v0.1): user (account) management
- `Senparc.Xncf.Installer` (v0.3): NCF installer
- Unpublished: `EmailExtension`, `OfficeExtension`, `SmsExtension`, `ReloadPage` (source repo only, not published to NuGet)

> Module versions and descriptions are synced from each module's `Register.cs` (`Name` / `Version` / `MenuName`) in `NcfPackageSources`.

For full versions, order, and scenario guidance:

- [NCF Capability Deep Dive](./capability-guide.md)

## 5. Developer Guidance: Design XNCF as Single-Granularity Units

Recommended baseline rules:

1. One module should focus on one capability domain.
2. Keep module boundaries explicit: DB/config/auth/menu/function scope.
3. Prefer `[FunctionRender]` for executable capability declaration.
4. Enable `EnableMcpServer` only when needed, with explicit security controls.
5. Run high-risk modules with least privilege and audit logging.

## 6. Where to Continue Reading

- Overview entry:
  [NcfPackageSources Source Guide](./index.md)

- Version capability map and mechanisms:
  [NCF Capability Deep Dive](./capability-guide.md)

- XNCF design and Register details:
  [Composition of Xncf](/start/xncf-develop/about-xncf.html)
