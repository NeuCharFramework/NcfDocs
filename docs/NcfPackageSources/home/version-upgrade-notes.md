# Version Upgrade Notes

> This page tracks important changes on the `NcfPackageSources` development
> branch and was checked on 2026-07-27. Project versions, Register versions, and
> published NuGet versions can differ; verify each one separately during an
> upgrade.

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
