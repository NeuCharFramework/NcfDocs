# XNCF Extension Library Guide (Senparc.Xncf.xxx)

> This page analyzes official extensions from the `NcfPackageSources` source
> perspective and was checked against the development line on 2026-07-27.
> Their internals are not prerequisites for Template-based business modules.
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

- `Senparc.Xncf.SystemCore`
- `Senparc.Xncf.SystemManager`
- `Senparc.Xncf.SystemPermission`
- `Senparc.Xncf.XncfModuleManager`
- `Senparc.Xncf.Menu`
- `Senparc.Xncf.Tenant`

### 4.2 AI / Agent / RAG Modules

- `Senparc.Xncf.AIKernel`
- `Senparc.Xncf.PromptRange`
- `Senparc.Xncf.AgentsManager`
- `Senparc.Xncf.KnowledgeBase`
- `Senparc.Xncf.MCP`
- `Senparc.Xncf.AIAgentsHub`

### 4.3 Tooling and Ops Modules

- `Senparc.Xncf.XncfBuilder`
- `Senparc.Xncf.Sandbox` (lab sandbox orchestration via Docker/Wasm; see [Sandbox environment setup](../xncf/sandbox-environment.md))
- `Senparc.Xncf.DatabaseToolkit`
- `Senparc.Xncf.FileManager`
- `Senparc.Xncf.Terminal`
- `Senparc.Xncf.FirmwareUpdate`
- `Senparc.Xncf.ChangeNamespace`
- `Senparc.Xncf.WeixinManager`
- `Senparc.Xncf.Dapr` (microservice integration; project version `0.11.0-preview2`)

For full versions, order, and scenario guidance:

- [NCF Capability Source Deep Dive](./capability-guide.md)

## 5. Developer Guidance: Design XNCF as Single-Granularity Units

Recommended baseline rules:

1. One module should focus on one capability domain.
2. Keep module boundaries explicit: DB/config/auth/menu/function scope.
3. Prefer `[FunctionRender]` for executable capability declaration.
4. Enable `EnableMcpServer` only when needed, with explicit security controls.
5. Run high-risk modules with least privilege and audit logging.
6. Keep Function implementations and DTOs under `Application/AppServices` and `Application/DTOs` to match the current XncfBuilder template.
7. Use resource files and `[LocalizedDescription]` for multilingual menus, descriptions, and parameters instead of hard-coding one language.

## 6. Where to Continue Reading

- Overview entry:
  [NcfPackageSources Source Guide](./index.md)

- Version capability map and mechanisms:
  [NCF Capability Source Deep Dive](./capability-guide.md)

- XNCF design and Register details:
  [Composition of Xncf](/start/xncf-develop/about-xncf.html)
