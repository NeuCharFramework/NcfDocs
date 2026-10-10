# XncfBuilder Isolated Development: Source Analysis

> Checked against the `NcfPackageSources` development line on 2026-08-14.
> This is a **source-developer** guide. If you only need to create, preview,
> review, and release a module, start with the
> [usage guide](/start/xncf-develop/isolated-xncf-development.html).

`Senparc.Xncf.XncfBuilder` has two distinct creation paths:

| Path | Entry | Intended trust level |
| --- | --- | --- |
| Direct generation | `BuildXncfAppService.Build()` | A developer deliberately changing a trusted checkout. |
| Isolated development job | `XncfDevelopmentJobAppService` | AI-assisted, generated, or otherwise untrusted module changes. |

The second path exists so a running NCF system can help create and test source
without writing to its own checkout before a person approves the result.

## 1. Runtime Boundary

The design is deliberately not a hot-loading design. A new assembly can carry
DI registrations, routes, Razor views, migrations, static assets, and
background services; safely unloading/replacing all of those from the main
process is not a supported NCF lifecycle.

Instead, the preview is a separate build and process boundary:

```text
Target source solution
  -> sanitized snapshot -> isolated workspace
  -> local dotnet new XNCF / constrained edits -> validate + diff
  -> second sanitized copy -> Sandbox workspace
  -> fixed Docker command -> separate Senparc.Web preview
  -> Admin-authenticated proxy -> reviewer
  -> APPLY <module name> -> atomic, guarded merge -> target source solution
```

The main site continues to run unchanged during preview. Once a job is applied,
the normal build/deploy/restart lifecycle is still required for the target
site.

## 2. Service and Persistence Map

| Source | Responsibility | Important boundary |
| --- | --- | --- |
| `OHS/Local/XncfDevelopmentJobAppService.cs` | FunctionRender façade for creating, reading, writing, validating, previewing, status, approval request, and discard | There is intentionally no FunctionRender method for `ApplyApprovedJobAsync()`. |
| `Domain/Services/Development/XncfDevelopmentJobService.cs` | Per-job coordinator and state machine | The only component that can apply a job; it uses per-job locks. |
| `Domain/Services/Development/XncfDevelopmentJobStateStore.cs` | DB-backed snapshot store | Persists before copying source; failure does not fall back to memory. |
| `Domain/Models/DatabaseModel/XncfDevelopmentJob.cs` | Audit/persistence entity | Stores owner, paths, requirement, fingerprints, validation, preview, and approval timestamps. |
| `Domain/Services/Workspace/XncfDevelopmentWorkspaceService.cs` | Sanitized source snapshot and controlled module diff | Target checkout is read-only to this service. |
| `Domain/Services/Workspace/XncfWorkspaceFileService.cs` | Safe file resolution, SHA-256 optimistic concurrency, atomic writes | AI can access only the selected module and a small extension allow-list. |
| `Areas/Admin/Pages/XncfBuilder/PreviewMonitor.*` | Status, paths, diff, Sandbox link, antiforgery-protected Apply/Discard UI | Apply requires the confirmation phrase; the page keeps state polling single-flight. |

`XncfDevelopmentJob` belongs to the XncfBuilder DbContext. Its table name is
`XncfBuilderXncfDevelopmentJob`, and it has indexes for job ID, stage/update
time, module/create time, and owner/update time. Migration generation and
application remain an operator action; this feature does not generate one
automatically.

## 3. State Machine and Key Methods

`XncfDevelopmentJobStage` is the durable state contract:

```text
Snapshotting -> ReadyForCode -> Validating -> ReadyForReview
                                      |              |
                                      v              v
                                  Failed       Previewing -> ReadyForReview
                                                       |
                                                       v
                                        AwaitingHumanApproval -> Applied
                                                       |
                                                       v
                                                   Discarded
```

The actual high-value methods are:

| Method | What it proves or changes |
| --- | --- |
| `CreateAsync()` | Saves the intent first, snapshots source, then either runs local `dotnet new XNCF` in the workspace or finds the copied module. |
| `ReadFileAsync()` / `WriteFileAsync()` | Reads text plus SHA-256; writes with expected-hash comparison and a write-through temporary file followed by atomic move. |
| `ValidateAsync()` | Resolves project paths, verifies that isolated `Senparc.Web` directly references the module, and refreshes the diff. It does not build the host. |
| `StartSandboxPreviewAsync()` | Repeats reference/diff validation under the job lock, checks path-base support, then delegates build/run to `IXncfSandboxPreviewService`. |
| `RequestMergeApprovalAsync()` | Freezes the review stage and records the request; it does not write target source. |
| `ApplyApprovedJobAsync()` | Checks exact `APPLY <module>`, target fingerprint and project-file immutability, then performs guarded copy/staging with rollback. |
| `DiscardAsync()` | Requests Sandbox stop, removes the temporary job workspace, and records the terminal state. |

### 3.1 Creating a module without mutating the target

`CreateModuleInWorkspaceAsync()` invokes:

```text
dotnet new XNCF -n <module> -o <workspace/module> --IntegrationToNcf true ...
```

The command receives only server-constructed arguments. It never runs
`dotnet new install`; template availability is an administrator decision. The
new project reference and solution entry are added only in the isolated copy.

For `ModifyExisting`, the original module fingerprint is recorded before code
editing. A different target fingerprint at apply time is a conflict, not a
reason to overwrite newer source.

### 3.2 Snapshot and file-control rules

`XncfDevelopmentWorkspaceService.CreateSnapshotAsync()` determines a safe root
from the solution and transitive `ProjectReference` graph. If a Git root is
found, all project references must stay inside it. It refuses symbolic links,
caps copied bytes at 768 MB, and excludes:

- `.git`, IDE folders, `bin`, `obj`, `node_modules`, `packages`, `App_Data`;
- `appsettings*`, `.env*`, `nuget.config`, `SenparcConfig.config`;
- `.pfx`, `.key`, `.pem`, and `.snk` files.

`XncfWorkspaceFileService.ValidateWritableCodeFile()` accepts only `.cs`,
`.cshtml`, `.razor`, `.js`, `.ts`, `.css`, `.scss`, `.json`, `.md`, and `.resx`.
It rejects `.csproj`, `.props`, `.targets`, NuGet configuration,
`Directory.Build*`, and application configuration. This prevents an AI edit
from changing dependencies, restore sources, MSBuild behavior, secrets, or the
host execution path.

## 4. Sandbox Preview Integration

The Builder depends only on `IXncfSandboxPreviewService` from
`Senparc.Xncf.Sandbox.Abstractions`. The implementation in
`SandboxNcfPreviewWorkloadService` makes a second Sandbox-owned copy before
Docker starts. Neither the target checkout nor the Builder workspace is mounted
as production source inside a container.

The fixed `ncf-preview` workload:

- is disabled by default;
- requires `Images:Overrides:ncf-preview` with an immutable `@sha256:` digest;
- accepts no caller shell command, Docker socket, host networking, or arbitrary
  image tag;
- publishes only a loopback port and uses `--cap-drop ALL`,
  `no-new-privileges`, read-only root filesystem, `/tmp` tmpfs, CPU/memory/PID
  limits;
- uses `--network none` by default; a named network is accepted only when the
  operator enables a dedicated package-mirror network;
- starts one server-constructed sequence: restore, publish the fixed
  `Senparc.Web` project, then run it on port 8080.

`SandboxNcfPreviewProxyMiddleware` exposes
`/sandbox-preview/{sessionId}/...` only after Admin-cookie authentication. It
proxies solely to `127.0.0.1`, strips browser cookies and `Authorization`, and
retains the generated path base. The preview host reads
`NCF_XNCF_PREVIEW_PATH_BASE` and must call `UsePathBase` before its NCF/routing
pipeline so redirects and links remain inside that proxy path.

## 5. AI Function Boundary

`FunctionRenderAttribute.AllowAiInvocation` is a second permission boundary:
the normal Function page can still display a Function, while Admin Chat imports
only Functions that did not opt out. `AdminChatAiService` and
`ModuleAssistantPlugin` both enforce this filter.

The following legacy XncfBuilder operations opt out of automatic AI import:

- direct `Build`;
- direct `Preview` and `StopPreview`;
- `AddMigration`.

The isolated-job Functions are the intended AI surface. Even there, merge is
not a Function and cannot be triggered by a tool call. This distinction is
important when adding new FunctionRender methods: mark host-mutating or
irreversible operations with `AllowAiInvocation = false`, then expose a
constrained, auditable workflow if needed.

## 6. Merge Semantics

For an existing module, apply verifies the original target fingerprint and
requires the module `.csproj` to be byte-identical in the workspace. Only
allowed code/resource files are copied with per-file backups and rollback.

For a new module, Builder copies into a staging directory, backs up the
solution and `Senparc.Web.csproj`, moves the staged module into place, then
runs controlled `dotnet add reference` and `dotnet sln add` commands. If any
step fails, it restores the backups and removes the target module directory.

This is transactional at the filesystem-operation level, not a replacement for
Git review. The database migration, review, test suite, commit, deployment,
and restart remain external lifecycle responsibilities.

## 7. Extending the Workflow

When adding a new task action:

1. Add it to the job contract and persistent snapshot only if it must survive
   a process restart.
2. Keep source access in the existing workspace services; do not introduce a
   second path resolver or arbitrary command field.
3. Reuse the per-job lock before combining validation, diff, preview, or merge
   state.
4. Decide separately whether it is visible in normal Function UI and whether
   it is safe for automatic AI invocation.
5. Keep preview runtime input server-generated and Sandbox-owned; new
   arbitrary containers or commands belong behind a distinct security review.

## Related Reading

- [Usage guide](/start/xncf-develop/isolated-xncf-development.html)
- [Sandbox Environment Setup](./sandbox-environment.md)
- [XNCF Module Documentation Map](./module-documentation-map.md)
- [XNCF Extension Library Guide](../home/xncf-extension-modules.md)
