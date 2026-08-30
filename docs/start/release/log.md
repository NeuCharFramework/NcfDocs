# Logs

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

For the full module inventory see [NCF Capability Deep Dive](../NcfPackageSources/home/capability-guide.md); for upgrade notes see [Version Upgrade Notes](../NcfPackageSources/home/version-upgrade-notes.md).


## 2026-08-29 Update

NcfPackageSources (Developer-MAF-V3 branch) released. Highlights:

1. AgentsManager supports Human-in-the-Loop: tasks can require human approval with configurable max chat rounds and tool permissions; independent `AgentExecutionTask` management, AgentTemplate model binding, and empty-output-token retry are added, and the agent editor can be opened in a new window.

2. NeuCharWorkflow adds global NeuCharPivot floating invocation (access-controlled via the `AllowGlobalPivot` attribute), a Workflow Analytics page (filter by date / workflow / status with summary generation), and a Human Input node (user prompts and external resume); timestamps are standardized on `DateTimeOffset`, `AbortRun` supports aborting by execution log ID, and replay supports loading more events.

3. Stability & diagnostics: new `AgentModelRequestDiagnostics` for model request failures (with automatic sensitive-data redaction), the expression engine preserves non-ASCII characters in JSON serialization, and ChatGroupService runs in isolated scopes with refined token logic.

4. Version bumps: XncfBuilder template `1.1.7`, Senparc.Ncf.Database `0.21.8-preview8`; the download page supports source selection (auto / local / GitHub) and shows MD5 fingerprints; NCF Desktop updated to `0.10.1-build10066`.

See [NcfPackageSources Version Upgrade Notes](../NcfPackageSources/home/version-upgrade-notes.md) for full upgrade details.


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
