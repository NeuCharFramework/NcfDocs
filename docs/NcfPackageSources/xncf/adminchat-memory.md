# AdminChat Memory and Conversation Settings

Memory stores the current user's durable working preferences, project conventions,
decisions, and references. It is not chat history, knowledge-base retrieval,
Workspace files, or SystemMessage. It never grants tool permissions or overrides
current user instructions and system safety rules.

Open the **Memory** button in the AdminChat sidebar, or choose
**Memory → Memory / conversation settings** in the launcher or current conversation.
Nearby question marks open this guide or its relevant section. Chinese UI locales
use Chinese documentation; all other UI locales use English.
See also [Chat basics](./admin-operations.md) and [Workspace access](./workspace-adminchat.md).

<a id="help-memory-start"></a>

## Getting started

1. Choose a Memory mode in the new-session launcher, or change it in the current conversation settings.
2. Open Memory settings and manually add a non-sensitive working preference under **Entries**, such as “Prefer concise bullet lists.”
3. Select your global scope or the current Workspace and save the entry. A session without a Workspace cannot edit Workspace memory.
4. Send a relevant question in **Read only** or **Learn** mode and inspect **Loaded this turn**.
5. For automatic learning, select **Learn**, explicitly say “From now on, remember…”, and check the system update receipt and entry list.

**An assistant saying “I remembered it” is not proof of persistence.** Extraction
can finish after the assistant's reply. Only the system's confirmation of a
successful database write establishes that the update was saved.

<a id="help-memory-modes"></a>

## Off, Read only, and Learn

| Mode          | Uses durable entries this turn | Automatic learning                                        |
| ------------- | ------------------------------ | --------------------------------------------------------- |
| Off (default) | Does not inject Memory entries | No                                                        |
| Read only     | Loads relevant entries         | No                                                        |
| Learn         | Loads relevant entries         | Attempts extraction, validation, and saving when eligible |

The mode is stored per session. The launcher configures the session about to be
created, not every existing session. Turning Memory off does not delete entries
or disable independently configured SystemMessage values.
Read only restricts automatic learning; it does not prevent manual edits in settings.

Learn requires an available PromptRange Memory prompt provider and Chat model.
Read only does not initialize learning prompts or call the extraction model.
Learning uses an additional model call and may incur costs; not every conversation
produces an entry. The current implementation looks for explicit English or Chinese
triggers such as “remember,” “prefer,” “correction,” or “forget” in the current user's
message. Overlong inputs and recognized requests not to save are skipped.
Implicit preferences may be missed; add them manually when necessary.

<a id="help-memory-scopes"></a>

## User-global scope, Workspace scope, and storage

- The isolation boundary is **tenant + current user**. “My global” is not shared memory for all administrators.
- Workspace scope comes from the current authorized session. Settings show your global entries and your entries for that Workspace. Without a selected session, you can manage your global entries.
- When the same internal fact key exists globally and in the current Workspace, retrieval prefers the Workspace version. Similar text does not necessarily mean identical internal keys.
- The primary storage is an encrypted database record. The system does not automatically create or read a Workspace file named `Memory.md`. Such a file is an ordinary file, and Workspace sharing does not automatically expose database memory.
- Clearing chat history, turning off a mode, and deleting memory are different operations.

<a id="help-memory-entries"></a>

## Editing, pinning, archiving, and deleting entries

Use **Entries** to add or edit individual records:

| Field          | Meaning                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------- |
| Scope          | My global or the current session's Workspace                                                  |
| Tier `core`    | A standing candidate, still subject to the context budget                                     |
| Tier `topic`   | Selected by lexical relevance to the question; a topic is required                            |
| Tier `archive` | Retained but not loaded; this is not deletion                                                 |
| Kind           | `preference`, `project`, `decision`, or `reference`                                           |
| Pinned         | AI cannot modify or delete it; manual editing remains possible, and loading is not guaranteed |
| Expiry         | Excluded from loading after expiry; not automatically deleted                                 |

Current limits are **80 entries** across all scopes per tenant/user, **300
characters** per entry, and **40 characters** per topic. Entries in other
Workspaces still count toward the total. At capacity, additions are rejected
rather than evicting another Workspace's entries.

**History** retains at most 100 changes. Deleting an entry removes its historical
content and evidence while retaining deletion metadata; it does not delete source
chats, downloaded files, or backups. Conflicts preserve the newer database version.
Keep a copy of your draft and reopen settings to reconcile it instead of blindly
overwriting. Unsaved Markdown changes block single-entry writes to avoid conflicts.

<a id="help-memory-loaded"></a>

## Loaded-this-turn reports and update receipts

The report shows entries **provided to the model** in the latest turn on this
page, with selection reasons. It does not prove that the model used them and is
not a list of all stored entries. Relevant Topic entries and Core candidates are
selected; archived, expired, and other-Workspace entries are excluded. Entries
that exceed the budget are skipped whole rather than truncating facts.

The current Memory context budget is **1000 tokens**, with at most **300 tokens**
for Core entries. Recognized models use the corresponding tokenizer; unknown
models are explicitly reported as a conservative UTF-8 estimate, not an exact
token count. The report includes the memory boundary instructions but excludes
SystemMessage, conversation history, and model protocol overhead. It is not the
complete request cost; consult actual model Usage for billing.
Reports and update receipts are page-local and disappear on refresh.

Distinguish **stored entries**, **entries loaded this turn**, and **entries updated
this turn**. Update receipts report global/Workspace change counts or reasons
that no update occurred:

- Off/Read-only mode or an input that did not trigger learning;
- no candidates, no differences, or pinned entries;
- capacity or revision conflicts;
- invalid output/evidence, rejected safety checks, extraction timeout, or a failed call.

Extraction uses the current user's original message and a bounded selection of
related existing memories. Assistant replies, attachments, tool output, and the
whole transcript are not sources of new factual evidence. Do not infer persistence
from an assistant's promise when validation fails. The turn's PromptCode can help
diagnose extraction behavior.

<a id="help-memory-markdown"></a>

## Markdown preview, editing, and download

These tabs expose a Markdown projection of **your global entries**, not Workspace
entries. Download exports the current editor contents, potentially including an
unsaved draft; it is not a backup of all database memory.

Use this format, retaining the English heading spellings:

```markdown
# Memory

## Core

- Prefer concise bullet lists.

## Topic: documentation

- Include a short example when explaining an API.

## Archive

- An old convention retained for reference.
```

Use single-line entries starting with `- ` and keep one entry per fact. Arbitrary
Markdown document structures are not supported. The editor accepts at most
32000 characters; entry and topic limits still apply. Saving Markdown treats
new/modified entries as manually pinned entries and attempts to preserve the
identity of existing entries with identical text.

**Clear draft** changes only the editor. Global entries are removed only after
**Save changes**, without removing Workspace entries. Manage Workspace records
individually under **Entries**.

<a id="help-memory-system"></a>

## SystemMessage versus Memory

- **My SystemMessage** affects all of the current user's Chat sessions, not only the selected session.
- **Global SystemMessage** is configurable only by a super administrator and affects all users in the current tenant, or the whole site in single-tenant mode.
- Each accepts at most **2000 characters**. Saved changes apply from the next turn, independently of Memory mode.
- They apply to Chat conversations, not internal structured-generation tasks such as titles or Memory extraction. They never grant tool permissions or override safety/authorization rules.

Use **Save changes** for personal settings and the separate **Save global
SystemMessage** button for tenant-wide settings. Changing a system prompt is not
the same as adding an entry; disabling Memory does not remove these prompts.

<a id="help-memory-deployment"></a>

## Deployment, privacy, and troubleshooting

- After upgrading Admin, apply its migrations for the actual database provider and restart the appropriate service. Persist both the database and ASP.NET Core Data Protection keys; multiple instances need consistent key configuration.
- Legacy encrypted files are imported only when no database record exists. Existing database records, including cleared records, take precedence. Legacy files can remain as migration backups; apply retention rules and stop old instances from writing the old storage.
- If Learn is unavailable, check PromptRange and model configuration first. No automatic additions in Read only is expected.
- If Workspace entries are missing, confirm that you selected an authorized session associated with that Workspace.
- If the reply says “remembered” but no entry appears, inspect the system receipt, mode, trigger eligibility, pins, and capacity rather than assuming success.
- Do not enter credentials, passwords, sensitive personal data, or third-party secrets. Encryption and automatic validation are not complete sensitive-data detection guarantees. Downloaded Markdown is ordinary plaintext and must be protected separately.
