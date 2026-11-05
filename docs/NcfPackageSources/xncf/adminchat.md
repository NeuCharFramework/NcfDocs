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
