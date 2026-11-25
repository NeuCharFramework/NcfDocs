# AdminChat conversations, Harness and attachments

<a id="help-admin-chat"></a>

## AdminChat

Create or select a session, choose an available model, and review the current
mode before sending. Session history, Workspace association, and current model
are separate concerns. Switching sessions is not consent to modify files.
Review generated output and tool requests rather than treating fluent answers
as proof that a task completed.
**New chat** opens the launcher. The sidebar groups sessions by Workspace; selecting one loads its history.
Manual group ordering and last activity are different concepts. **Manage** selects and handles messages, not Memory entries.
Choose the model and execution mode in the composer; Ctrl+Enter / Cmd+Enter sends.
Stopping a task does not undo external effects. Attachments, Workspace permissions and Memory have separate help.

Memory defaults to Off and can be set to Read only or Learn per session.
It is distinct from chat history and Workspace files. For modes, scopes,
persistence receipts, Markdown editing, and SystemMessage, see
[AdminChat Memory and conversation settings](./adminchat-memory.md).

<a id="help-admin-chat-module-commands"></a>

## Module-defined slash commands

AdminChat keeps a small fixed command set for conversation controls (`/mode`, `/help`, `/maxtoken`,
`/maxiterations`, and `/harness`). Functional commands are registered by XNCF modules through `IChatTool`.
Each module explicitly declares its command label, hint, module metadata, system instructions and the exact
Function methods that may be imported. AdminChat does not contain a type-level dependency on the module that owns
the command.

Type `/` in either composer to see both groups. Module commands carry a module tag; its color is derived from the
same module UID accent-color rule used by the Admin shell tabs. The command suggestions and `/help` output are
assembled from the modules currently registered by the running application.

Current module-defined commands:

| Command                     | Owning page/module | Behavior |
| --------------------------- | ----------------- | -------- |
| `/analyze-system-logs`      | System Admin logs | Read-only, token-bounded overview, search and evidence retrieval |
| `/run-agent-group`          | AgentsManager     | Semantically finds an existing group and starts an asynchronous task |
| `/run-workflow`             | NeuChar Workflow  | Finds an owned saved Workflow and starts one asynchronous run |
| `/edit-workflow --id=<id> --revision=<revision>` | NeuChar Workflow | Reads a masked graph and saves one explicit, revision-checked minimal edit |

Recommended later additions should follow the same boundary:

| Candidate page       | Suggested command                  | Safe initial capability |
| -------------------- | ---------------------------------- | ----------------------- |
| Knowledge Base       | `/ask-knowledge`                   | Explain which knowledge bases/documents matched a query and return cited answers |
| MCP / Connectors     | `/diagnose-connector`              | Read connection health and recent invocation failures |
| PromptRange          | `/optimize-prompt`                 | Compare published prompt variants and propose a new draft |
| FileManager          | `/find-file`                       | Search owned metadata and return references without exposing private content by default |
| Workspace            | `/review-workspace`                | Read-only review of a bounded set of relative paths |

When a module command is active, AdminChat uses an exclusive tool allowlist for that command. Workspace, Skill,
attached-module and Workflow-management tools are not mixed into the request. Commands that can start external
work or save data must state that effect in their command instructions and expose only the minimum required
Function methods. Editing commands preserve server-side ownership, revision and secret-masking checks.

<a id="help-admin-chat-system-logs"></a>

## System-log analysis command

For a SenparcTrace question, prefix the question with:

```text
/analyze-system-logs --date=yyyyMMdd
```

The date is optional and defaults to today. Keep the command at the beginning of the message so AdminChat
enables the module-declared, read-only log functions for that request. These functions do not require a selected
module or Workspace. The footer AI shortcut on the log-details page inserts the selected date and types the
command into the composer automatically.

The model first requests a compact overview, then performs filtered searches and reads only the relevant
evidence. It must not request the entire log file. For the exact limits, supported questions, redaction behavior
and evidence requirements, see [Admin logs and diagnostics](./admin-logs.md#help-ai-log-analysis).

<a id="help-chat-harness"></a>

## Simple conversation and Harness

**Simple** is the ordinary conversation mode. **Harness** supports longer
tool-driven work, progress, and approval interactions. Read the proposed action
before approving it; interruption is not a rollback of completed side effects.
Use the available trajectory/history controls to inspect what actually happened.
Workspace write and execution permissions remain explicit, independent choices.

<a id="help-chat-attachments"></a>

## Attachments, vision, and large files

Upload, paste, or drop supported files only into a session that can access its
Workspace. The upload hint reports the effective limits; do not assume all files
will be fully inserted into the model context. Large files can require chunked
Workspace reading or separately authorized processing.

Uploading a file does **not** authorize AI writes, Python, or other commands.
Image vision is opt-in and requires a compatible model. Scanned PDFs may need OCR;
successful upload does not prove text extraction succeeded. Removing an unsent
attachment can delete its Workspace resource, so do not use that action as a
generic way to hide an already submitted file.
