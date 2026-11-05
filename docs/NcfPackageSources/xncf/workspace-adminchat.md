# Workspace and AdminChat

<a id="help-workspace-manage"></a>

## My Workspaces and uploads

The list shows names, creation times and last-access times. Enter a name and choose **Create Workspace** to create durable file space.
Each row's **Upload files** sends selected files to that Workspace, not every session or FileManager.
The **Connection guide** explains VS Code / Cursor access.
Creating a Workspace does not grant AI file writes or Python execution; those are AdminChat session choices.
See [Workspace and AdminChat](./workspace-adminchat.md) for runtimes and remote gateway configuration.

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

No database model changed in this upgrade, so no migration was added. Existing migrations remain generated with `dotnet ef migrations add`.

The simulated site now includes standard EF Core migrations for SQLite, MySQL, SQL Server, PostgreSQL, Oracle, and DM. Run `dotnet ef database update` with the matching `AdminSenparcEntities_*` context, the Admin project, and `Senparc.Web.DatabasePlant` as startup project before using the Workspace option. Each migration changes only the three Workspace fields on `ADMIN_AdminChatSession`.

See the Chinese guide for the full configuration and deployment recommendations.
