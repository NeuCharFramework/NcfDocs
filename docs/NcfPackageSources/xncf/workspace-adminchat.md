# Workspace and AdminChat

<a id="help-workspace-manage"></a>

## My Workspaces and uploads

The list shows names, creation times and last-access times. Enter a name and choose **Create Workspace** to create durable file space.
Each row's **Upload files** sends selected files to that Workspace, not every session or FileManager.
The **Connection guide** explains VS Code / Cursor access.
Creating a Workspace does not grant AI file writes or Python execution; those are AdminChat session choices.
See [Workspace and AdminChat](./workspace-adminchat.md) for runtimes and remote gateway configuration.

### First use

Create one Workspace for one project or responsibility area. Upload only the files needed for
that area, and keep generated artifacts or secrets out of the Workspace unless the project
requires them. Before connecting VS Code or Cursor, confirm the selected Workspace and the
administrator account shown by the authorization flow.

The **Clear** action removes the files in the selected Workspace and recreates the empty
`input`, `output`, and `logs` directories; it keeps the Workspace record but cannot be undone.
Do not use it as a refresh button. Download or archive files that must be retained first.

<a id="help-workspace-permissions"></a>

## Workspace permissions

A Workspace stores durable files; the runtime is an execution environment.
Read access, AI write access, and CLI/Python execution are distinct levels.
Grant only the required level when creating the session. The default native
runtime does not imply code execution is enabled; Docker availability does not
automatically grant execution permission either.
In the AdminChat launcher, select a Workspace before enabling **Allow AI file writes** or **Allow AI to execute Python**.
Python requires write permission, runs `.py` files inside that Workspace and prefers its `.venv`.
This help describes session authorization, not the Workspace creation/upload page.

When troubleshooting a denied operation, check in order: the selected Workspace, the session's
read/write/CLI flags, the administrator's ownership or super-admin scope, and the selected
runtime. Uploading a file does not enable Python or command execution; enabling Docker does
not grant the model permission to use it.

The remote gateway checks both the DesktopBridge device session and the Admin
JWT, as well as ownership. Use HTTPS for remote access. Revoking a device session
does not delete Workspace files. See [Workspace and AdminChat](./workspace-adminchat.md).

<a id="help-desktop-pairing"></a>

## DesktopBridge pairing

Match the desktop-generated pairing code, client name, and source address
before approving. Reject unexpected requests. Review active sessions and revoke
devices that should no longer connect. Device pairing is separate from the
administrator identity and Workspace ownership checks.

## Runtime and deployment

For durable preferences and project memory, see [AdminChat Memory and conversation settings](./adminchat-memory.md).
Workspace-scoped memory remains user-isolated database data; it does not automatically read or write a Workspace `Memory.md` file.

Workspace keeps durable files in a configurable host directory. Docker is an optional isolated runtime, not the owner of the data. Recreating a runtime does not delete the Workspace. FileManager remains the system for durable assets, uploads, archived versions, and published results.

Only super administrators can attach a Workspace to a new AdminChat session. Access is enforced on the server, not only by the UI.

AdminChat, VS Code, Cursor, and gateway calls now share the same persistent Workspace Agent protocol. The agent communicates over a long-lived stdin/stdout NDJSON channel on modern Windows, Linux, and macOS, avoiding platform-specific IPC requirements.

Workspace access remains explicit and session-scoped:

- read-only: list directories and read text files;
- write: additionally write files and create directories;
- CLI: additionally execute commands from the configured allowlist.

NativeAgent is the Docker-free default. It supports file editing, binary files, ETags, atomic writes, search, patches, moves, deletes, and change events, while native code execution is disabled by default. Docker mode is recommended when build/test/Python execution is required; it runs without network access, with a read-only container root, dropped capabilities, no-new-privileges, resource limits, and only the current Workspace mounted.

Workspace and Sandbox share `IIsolatedRuntimeProvider` and the `SenparcNcf:IsolatedRuntime:Docker` configuration section for Docker executable discovery, structured mounts, network policy, resource limits, timeouts, logs, removal, and runtime queries. Their public APIs and lifecycles remain independent.

The Workspace Gateway requires HTTPS for remote access (loopback HTTP is permitted), a valid DesktopBridge device session, and an Admin JWT. It also checks the JWT owner against the Workspace owner. The VS Code/Cursor extension stores tokens in SecretStorage and opens `ncf-workspace://` folders with normal explorer/edit/save behavior.

## Manual uploads to the input folder

Super administrators can upload files directly to a Workspace from the
Workspace admin page. Files stream into the Workspace `input/` folder
through `/api/Senparc.Areas.Admin/WorkspaceFiles/{workspaceId}/upload`; the
page first reads the effective limits from the `capabilities` endpoint.

- Per-file limit: `SenparcXncfWorkspace:MaxUploadFileBytes` (default
  300 MiB); workspace quota: `MaxWorkspaceBytes` (default 2 GiB). The
  transport cap is 320 MiB per request.
- Uploads require the super-admin session, an anti-forgery token, and
  ownership of the target Workspace; another administrator's Workspace
  returns "not found".
- Uploaded files are ordinary Workspace files: the model, VS Code, and
  Cursor see them under the session's read/write/execution permissions, and
  they follow the same path, ETag, and size rules as Agent-written files.
  Uploading does not grant execution rights.

When `Senparc.Xncf.WorkspaceAgent` is consumed as a NuGet package, its
`buildTransitive/Senparc.Xncf.WorkspaceAgent.targets` file copies the Agent
runtime files into the consuming application's output and publish directories.
This keeps the persistent Agent protocol available to package consumers without
requiring a manual post-build copy. A package build alone does not prove that a
deployed host can start the Agent; verify the published files and runtime
configuration in the target environment.

No database model changed in this upgrade, so no migration was added. Existing migrations remain generated with `dotnet ef migrations add`.

The web-admin baseline now includes standard EF Core migrations for SQLite, MySQL, SQL Server, PostgreSQL, Oracle, and DM. Run `dotnet ef database update` with the matching `AdminSenparcEntities_*` context, the Admin project, and `Senparc.Web.DatabasePlant` as startup project before using the Workspace option. Each migration changes only the three Workspace fields on `ADMIN_AdminChatSession`.

See the Chinese guide for the full configuration and deployment recommendations.
