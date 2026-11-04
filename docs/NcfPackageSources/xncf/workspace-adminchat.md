# Workspace and AdminChat

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

No database model changed in this upgrade, so no migration was added. Existing migrations remain generated with `dotnet ef migrations add`.

The simulated site now includes standard EF Core migrations for SQLite, MySQL, SQL Server, PostgreSQL, Oracle, and DM. Run `dotnet ef database update` with the matching `AdminSenparcEntities_*` context, the Admin project, and `Senparc.Web.DatabasePlant` as startup project before using the Workspace option. Each migration changes only the three Workspace fields on `ADMIN_AdminChatSession`.

See the Chinese guide for the full configuration and deployment recommendations.
