# `NcfPackageSources_Include_NcfSimulatedSite.sln` Project Map

> This page is checked against the current project list in
> `NcfPackageSources/src/NcfPackageSources_Include_NcfSimulatedSite.sln`.
> It answers three questions: what a project does, where a beginner starts, and
> where a contributor should extend it. Every `XNCF` project is listed.
> Projects ending in `.Tests` validate behavior; they are not runtime entry points.

## 1. Build the Big Picture First

This solution is not a single website. It has four layers:

1. **Basic**: NCF runtime foundations, data access, and database providers.
2. **Extensions / System**: installable, enableable, and permission-aware XNCF capabilities.
3. **NcfSimulatedSite**: the runnable `Senparc.Web` host that composes the libraries and modules, with Admin, installer, and sample modules.
4. **Tests / DevelopmentTools**: automated tests and development helpers.

Recommended learning path:

1. Run [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md).
2. Read [Senparc.Web, Admin, and the installer chain](#senparc-web-admin-and-installer-chain).
3. Continue with [XNCF Module Overview](#3-xncf-module-overview).
4. Create your own module using [XNCF Development Contracts](/start/xncf-develop/contracts-and-interfaces.html).

## 2. Basic Libraries and Database Projects

| Project                              | Beginner meaning                                                  | Extension boundary                                                                       |
| ------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Senparc.Ncf.Core`                   | Core types, configuration, and shared runtime capability          | Start from core service registration and shared abstractions                             |
| `Senparc.Ncf.Repository`             | Generic repository and data-access abstractions                   | Organize business code with entities, repositories, and Services instead of SQL in pages |
| `Senparc.Ncf.Service`                | Service-layer and transaction coordination foundation             | Put business rules in the Service/Application layer                                      |
| `Senparc.Ncf.Mvc.UI`                 | MVC/Razor page and UI helpers                                     | Reuse it when building Admin Areas or XNCF pages                                         |
| `Senparc.Ncf.Log`                    | NCF logging abstractions and implementation                       | Use existing logging interfaces for diagnosable events                                   |
| `Senparc.Ncf.Utility`                | Common file, string, and conversion helpers                       | Reuse utilities instead of duplicating them in modules                                   |
| `Senparc.Ncf.SMS`                    | SMS capability abstraction                                        | Connect providers through configuration and provider implementations                     |
| `Senparc.Ncf.Shared.Abstractions`    | Lightweight contracts shared by independently deployed components | Keep only cross-project interfaces and events here                                       |
| `Senparc.Ncf.AreaBase`               | Area and modular-page infrastructure                              | Use it for custom Admin Areas, routes, and pages                                         |
| `Senparc.Ncf.XncfBase`               | XNCF registration, lifecycle, and module contracts                | Required reading for custom XNCF development                                             |
| `Senparc.Ncf.Database`               | Common database abstractions and configuration                    | Connect databases through providers, migrations, and DatabasePlant                       |
| `Senparc.Ncf.Database.Sqlite`        | SQLite provider                                                   | Default choice for local development, demos, and lightweight deployments                 |
| `Senparc.Ncf.Database.SqlServer`     | SQL Server provider                                               | Configure it for SQL Server production deployments                                       |
| `Senparc.Ncf.Database.MySql`         | MySQL provider                                                    | Configure it for MySQL production deployments                                            |
| `Senparc.Ncf.Database.PostgreSQL`    | PostgreSQL provider                                               | Configure it for PostgreSQL production deployments                                       |
| `Senparc.Ncf.Database.Oracle`        | Oracle provider                                                   | Configure it when Oracle is required                                                     |
| `Senparc.Ncf.Database.Dm`            | Dameng provider                                                   | Use for Dameng database deployments                                                      |
| `Senparc.Ncf.Database.InMemory`      | In-memory provider                                                | Use for tests and temporary demos, not persistent production data                        |
| `Senparc.Ncf.Database.MySql.Backcup` | MySQL backup helper project                                       | `Backcup` is the existing source spelling; do not rename it when referencing the project |
| `Senparc.Ncf.DatabasePlant`          | Database migration, design, and maintenance foundation            | Generate and validate migrations after changing entities                                 |
| `Senparc.Ncf.FileExtension`          | File extension capability, currently under `Unpublished`          | Confirm stability before using it as a public dependency                                 |
| `Senparc.Ncf.ImageUtility`           | Image processing capability, currently under `Unpublished`        | Do not treat it as a stable public API by default                                        |

## 3. XNCF Module Overview

XNCF is NCF's primary extension model. A `Senparc.Xncf.*` module normally owns
its registration, menu, permissions, database, Functions, and lifecycle. After
installation it must also be **enabled**; installed does not mean enabled.
High-risk modules must run with least privilege.

### 3.1 System Foundation and Admin Capabilities

| XNCF project                           | Function                                                          | Extension guidance                                                                 |
| -------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `[5980]Senparc.Xncf.SystemCore`        | Core system data and runtime foundation                           | Understand registration order before extending system modules                      |
| `[5970]Senparc.Xncf.SystemManager`     | System configuration and management entry points                  | Reuse its permission and configuration patterns for system settings                |
| `[5960]Senparc.Xncf.SystemPermission`  | Roles, permissions, and authorization                             | Add permissions for every new page, button, and Function                           |
| `[5940]Senparc.Xncf.Menu`              | Menu, page, and button management                                 | Declare module menus through Register/Area instead of hard-coding them in the host |
| `[5950]Senparc.Xncf.XncfModuleManager` | Discover, install, update, enable, disable, and uninstall modules | Check module state and permissions first when a menu is missing                    |
| `[5955]Senparc.Xncf.AreasBase`         | Web foundation for XNCF Areas                                     | Start custom Admin pages from AreaBase and existing Area patterns                  |
| `[5990]Senparc.Xncf.Tenant`            | Multi-tenant implementation                                       | Tenant isolation involves data, permissions, and menus, not only a TenantId        |
| `[5990]Senparc.Xncf.Tenant.Interface`  | Multi-tenant public interfaces and contracts                      | Reference this contract when implementation details are unnecessary                |

### 3.2 AI, Agents, RAG, and Workflow

| XNCF project                                | Function                                                             | Extension guidance                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Senparc.Xncf.AIKernel`                     | AI model, chat, and embedding-model configuration foundation         | Configure models before Prompt, Agent, or KnowledgeBase calls                              |
| `Senparc.Xncf.AIKernel.Abstractions`        | AI Kernel public interfaces                                          | Reference the abstraction for cross-module integration                                     |
| `Senparc.Xncf.PromptRange`                  | Prompt/PromptCode management, versioning, and invocation             | Store prompts as maintainable assets instead of code strings                               |
| `Senparc.Xncf.PromptRange.Abstractions`     | PromptRange public contracts                                         | Agents and other modules should reference only required interfaces                         |
| `Senparc.Xncf.AgentsManager`                | Agents, sessions, agent groups, tasks, and human-in-the-loop flows   | Configure AIKernel and PromptRange before designing Agent tools                            |
| `Senparc.Xncf.AgentsManager.Abstractions`   | Agent-management contracts and events                                | Communicate across modules through contracts, not page implementations                     |
| `Senparc.Xncf.AIAgentsHub`                  | AI Agent aggregation and management entry point                      | Use it for discovery and orchestration; it does not replace concrete Agents                |
| `Senparc.Xncf.KnowledgeBase`                | Document import, chunking, embeddings, and recall testing            | Configure an embedding model first; retrieval is not model training                        |
| `Senparc.Xncf.NeuCharWorkflow`              | Visual server-side workflows, triggers, nodes, and execution records | Orchestrate controlled Functions/Agents with explicit timeout, permission, and retry rules |
| `Senparc.Xncf.NeuCharWorkflow.Abstractions` | Workflow interfaces and model contracts                              | Reference it when calling workflows without depending on UI                                |

### 3.3 MCP, Development, and Operations

| XNCF project                                       | Function                                                             | Extension guidance                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Senparc.Xncf.MCP`                                 | MCP server and module-tool routing integration                       | Enable only when external tools are needed and protect `mcp-*` routes                                      |
| `Senparc.Xncf.MCP.Abstractions`                    | MCP public interfaces and contracts                                  | Use the abstraction for MCP client/server integration                                                      |
| `Senparc.Xncf.XncfBuilder`                         | XNCF generation, module inventory, and development helpers           | Prefer the template/generator flow instead of copying hidden configuration                                 |
| `Senparc.Xncf.XncfBuilder.Abstractions`            | Builder public contracts                                             | Reference it when extending generators                                                                     |
| `Senparc.Xncf.XncfBuilder.DynamicContentGenerator` | Generates module content from templates and configuration            | Validate generated output and compilation after changing rules                                             |
| `Senparc.Xncf.XncfBuilder.Template`                | Official XNCF project template                                       | Best starting point for a beginner creating a custom module                                                |
| `Senparc.Xncf.Sandbox`                             | Isolated, disposable experiment environments                         | Use isolation for untrusted input; prepare Docker/Wasm first                                               |
| `Senparc.Xncf.DatabaseToolkit`                     | Database backup, export, inspection, and maintenance tools           | Restrict Admin permissions and verify restore before production use                                        |
| `Senparc.Xncf.Terminal`                            | Admin-side command execution                                         | High risk: restrict to trusted administrators and never expose it unprotected                              |
| `Senparc.Xncf.FileManager`                         | File-management capability                                           | Restrict root directories, extensions, and permissions                                                     |
| `Senparc.Xncf.FileManager.Abstractions`            | File-management public contract                                      | Reference it when another module needs file services                                                       |
| `Senparc.Xncf.FirmwareUpdate`                      | NCF package and release-source mirroring                             | Verify source, integrity, and authorization for release packages                                           |
| `Senparc.Xncf.DesktopBridge`                       | HTTP/SSE bridge between the Host and an authorized desktop companion | The pairing token is an application secret; TLS, network controls, and Admin authorization remain required |
| `Senparc.Xncf.Swagger`                             | Swagger/OpenAPI documentation and debugging entry                    | Hide sensitive endpoints and models in production                                                          |
| `Senparc.Xncf.Dapr`                                | Dapr microservice integration                                        | Learn standalone operation first, then enable sidecars and service calls                                   |
| `Senparc.Xncf.DynamicData`                         | Dynamic-data capability, still evolving                              | Confirm fields, permissions, and migration strategy before business use                                    |
| `Senparc.Xncf.Application`                         | Controlled external-program execution capability                     | Define host permissions, timeouts, logging, and failure rollback before enabling                           |
| `Senparc.Xncf.SenMapic`                            | SenMapic crawling/collection sample module                           | Collect only authorized data and follow target-site rules                                                  |
| `Senparc.Xncf.WeixinManager`                       | Weixin account, message, and related management                      | Configure AppId/secret, callbacks, and permissions before integration                                      |

## 4. Senparc.Web, Admin, and Installer Chain

### 4.1 Runtime Projects

| Project                                   | Role                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Senparc.Web`                             | Simulated host; composes NCF libraries, XNCF modules, Admin, and configuration, and is the solution's runtime entry |
| `Senparc.Areas.Admin`                     | Admin Area; provides post-login management pages, interactions, Chat, and metrics                                   |
| `Senparc.Xncf.Installer`                  | First-run installer; creates initial configuration, database, and default modules                                   |
| `Senparc.Xncf.Accounts`                   | Administrator/account features used by the login flow                                                               |
| `Senparc.Aspire.ServiceDefaults`          | Aspire health checks, default service configuration, and observability foundation                                   |
| `Senparc.Web.DatabasePlant`               | DatabasePlant web development/verification host                                                                     |
| `Senparc.IntegrationSample`               | Integration sample for understanding composition and calls                                                          |
| `Template_OrgName.Xncf.Template_XncfName` | Generated sample XNCF; useful for comparing a complete module structure                                             |

Start the host:

```bash
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj --launch-profile http
```

Complete the installer on first launch, then sign in at `/Admin/Login`. The
Admin **Extension Modules/Module Management** page is provided by
`XncfModuleManager`. Installing a module is followed by enabling it before its
menus and Functions become available. Admin roles, menus, and button
permissions are coordinated by SystemPermission, Menu, and other system XNCFs.

### 4.2 Boundaries for Custom Development

- Do not put business code directly into `Senparc.Web`; create an independent XNCF.
- Admin provides management UX and system entry points; business data, migrations, and Functions belong to their owning module.
- When changing host startup, dependency injection, or global middleware, also verify installation, Admin login, and module scanning.
- After changing an Admin menu, check role authorization; a visible menu does not mean every role can use it.

## 5. Test Projects and How to Use Them

The following projects provide regression coverage and do not expose standalone
website features:

- Basic: `Senparc.Ncf.Core.Tests`, `Senparc.Ncf.XncfBase.Tests`,
  `Senparc.Ncf.DatabasePlant.Tests`, `Senparc.Ncf.DatabaseTests`,
  `Senparc.Ncf.ServiceTests`, `Senparc.Ncf.UnitTestExtension`.
- XNCF: `Senparc.Xncf.XncfBuilder.Tests`, `Senparc.Xncf.PromptRange.Tests`,
  `Senparc.Xncf.AIAgentsHub.Tests`, `Senparc.Xncf.AgentsManagerTests`,
  `Senparc.Xncf.DynamicDataTests`, `Senparc.Xncf.SenMapicTests`,
  `Senparc.Xncf.WeixinManager.Tests`.
- Integration and host: `Senparc.IntegrationSample.AreaTests`,
  `Senparc.Areas.Admin.Tests`.

After changing a module, run its targeted tests first, then validate installation,
login, module enablement, and the key page in `Senparc.Web`:

```bash
dotnet test src/NcfPackageSources_Include_NcfSimulatedSite.sln --no-restore
```

## 6. Quick Selection Table

| Goal                        | Start here                                                      |
| --------------------------- | --------------------------------------------------------------- |
| Just run the system         | [Beginner Quickstart](./beginner-quickstart.md) → `Senparc.Web` |
| Add an Admin feature        | `XncfBuilder.Template` → `XncfBase` → Area/Menu/Permission      |
| Add AI chat                 | `AIKernel` → `PromptRange` → `AgentsManager`                    |
| Build knowledge-base Q&A    | `AIKernel` → `KnowledgeBase` → Agent/Workflow                   |
| Expose an external tool     | `MCP` → `[FunctionRender]` → permission and route protection    |
| Build multi-step automation | `AgentsManager` → `NeuCharWorkflow`                             |
| Change database support     | `Ncf.Database`/provider → `DatabasePlant` → module migration    |
| Debug Admin                 | `Senparc.Web` → `Senparc.Areas.Admin` → System XNCFs            |
