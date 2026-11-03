# Admin Pages and Contextual Help

This guide describes the existing Admin controls, not additional permissions or
guaranteed provider capabilities. Install and enable the required modules first.
Use a test environment for destructive actions. Help never executes the adjacent
action, submits a form, or sends page query parameters to the documentation site.

The question-mark controls open documentation in a dialog. Use **Open in new
window** if your browser blocks embedding. Chinese UI locales select Chinese
documentation; all other UI locales select English. The explicit anchors on this
page are shared by both languages and are part of the UI link contract.

<a id="help-admin-users"></a>

## Administrators

Use **Administrator management** to create or edit an administrator, then assign
roles. Check the target username before resetting credentials or changing role
membership. An administrator account is not the same as an Accounts-module user
or a Weixin follower. Do not copy passwords into documentation, chat, or logs.

<a id="help-admin-roles"></a>

## Roles and permissions

Create a role, configure its permission tree, and assign it to the intended
administrators. Save each stage and verify access with the affected account.
A visible menu alone does not grant API or Function access. If access is denied,
check role membership, permission codes, module availability, and any separate
NeuCharPivot policy before broadening permissions.

<a id="help-admin-menus"></a>

## Menus

Use menu management to maintain navigation, parent-child relationships, and
target addresses. Verify the destination after saving. Hiding an entry is not
an authorization boundary; the destination still needs server-side permission
checks. Module-provided navigation should remain consistent with module state.

<a id="help-system-config"></a>

## System configuration

Review the current values before saving host settings. Authentication expiry
settings affect session behavior; footer content is display configuration, not
a place to store executable code or credentials. Settings on this page do not
replace provider credentials and host-level configuration in the deployment's
approved configuration source.

<a id="help-tenants"></a>

## Tenants

Use tenant management only when the host is configured for multi-tenancy.
Confirm the target tenant before administration and verify its initialization
result. Do not assume a new tenant has all modules or permissions ready merely
because its record exists. See [multi-tenant configuration](/start/config/mutiple-tenant.html).

<a id="help-accounts"></a>

## Accounts module

The Accounts page manages application-user accounts. Keep these separate from
administrator identities and tenant administration. Use the page's available
search and editing controls, and verify the selected user's identity before
saving changes.

<a id="help-logs"></a>

## Logs

Select a date and open the relevant log file. Correlate timestamps with the
failed operation; the browser Console and server log are different sources.
Redact tokens, credentials, personal data, and private document content before
sharing diagnostic excerpts.

<a id="help-host-monitor"></a>

## Host resource monitor

The home panel combines live Host/Web-process metrics and historical trends.
Choose a time range, zoom to inspect an interval, and return to live tracking
when finished. CPU and memory use the percentage axis; network throughput uses
Mbps. A similarity in chart shapes is not evidence that metrics share a unit.
History is cache-backed and bounded: an empty interval can mean no retained
samples, not zero utilization.

<a id="help-module-functions"></a>

## Module lifecycle and Functions

On a module's management page, check the installed version, available update,
and enabled state. Installed does not mean enabled. Read each Function's
description and parameters before execution, especially for database, file,
deployment, or cleanup operations. Generic Function help explains this workflow;
it must not pretend to describe every module-specific Function.
See [module management](/start/start-develop/admin-module-manage.html).

<a id="help-admin-chat"></a>

## AdminChat

Create or select a session, choose an available model, and review the current
mode before sending. Session history, Workspace association, and current model
are separate concerns. Switching sessions is not consent to modify files.
Review generated output and tool requests rather than treating fluent answers
as proof that a task completed.

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

<a id="help-workspace-permissions"></a>

## Workspace permissions

A Workspace stores durable files; the runtime is an execution environment.
Read access, AI write access, and CLI/Python execution are distinct levels.
Grant only the required level when creating the session. The default native
runtime does not imply code execution is enabled; Docker availability does not
automatically grant execution permission either.

The remote gateway checks both the DesktopBridge device session and the Admin
JWT, as well as ownership. Use HTTPS for remote access. Revoking a device session
does not delete Workspace files. See [Workspace and AdminChat](./workspace-adminchat.md).

<a id="help-neubell"></a>

## NeuBell and outbound WebHooks

Footer subscriptions control which provider notifications are displayed.
The WebHook page separately configures outbound notifications for added/removed
items, provider filters, HTTP method, body template, and an optional signing
secret. Verify the destination and use **Test** with a controlled receiver before
enabling production notifications. A successful test is not a guarantee of
future delivery. Do not place secrets in the URL or publish them with examples.

<a id="help-pivot-access"></a>

## NeuCharPivot access policies

Policies can open, restrict, deny, or inherit access to a module Function.
A database policy overrides the corresponding code attributes. Review the
selected Functions before batch changes. Restoring inheritance and deleting a
stored policy are different operations. Orphan policies may remain after module
removal and apply again after reinstallation; inspect them rather than assuming
they disappeared.

<a id="help-pivot-boards"></a>

## NeuCharPivot boards

A board arranges Function blocks. Check each block's module and Function
identity before adding it. A missing-module placeholder is not a successful
execution result: restore the module or remove the stale block. Board placement
does not bypass the Function's access policy.

<a id="help-pivot-aggregate"></a>

## NeuCharPivot aggregation

Aggregation groups selected Function inputs and execution views. Review each
Function's parameters, availability, and access result. Do not assume a grouped
operation is a database transaction or that failure automatically reverses
earlier effects. Test high-impact operations individually first.

<a id="help-mcp-connections"></a>

## MCP client connections and published services

The published-services panel lists endpoints exposed by this host; it is not the
client connection editor. Use **Add Endpoint** in the client section for a remote
MCP server, choose its transport, and configure its required authorization.
Check the selected endpoint before connecting or invoking a tool. An endpoint
being listed does not imply anonymous or public access.
See [MCP basic usage](/MCP/basic-usage.html).

<a id="help-ai-models"></a>

## AI model configurations

Select a provider and fill in the endpoint, model/deployment name, and required
credentials. A chat model and an embedding model serve different purposes;
select a compatible configuration for each consumer. Check connectivity and
provider requirements before troubleshooting prompts. Keep credentials private.

<a id="help-ai-vectors"></a>

## Vector storage configurations

Choose the storage backend and its connection settings, then reference it from
the knowledge base. An option in the dropdown does not prove that the external
database is installed or reachable. Memory storage is not durable production
storage. Changing the embedding model or vector configuration can require
rebuilding the knowledge index; back up required data before changes.

<a id="help-ai-tokens"></a>

## Token monitoring

Use the token monitor to inspect recorded model usage and its filters. Model
token counts are not the same as character counts, file sizes, or local text
extraction limits. Missing telemetry is not proof of no provider usage; reconcile
billing-sensitive decisions with provider records.

<a id="help-ai-dashboard"></a>

## AI dashboard

Use the dashboard as an overview of configured AI resources and recorded usage,
then open the corresponding model, vector, or token page for details. Confirm
the selected period and available data before interpreting totals.

<a id="help-fine-tuning-workers"></a>

## Fine-tuning Workers

Select an enabled Worker with a configured secret before uploading datasets or
starting a job. Registering a Worker endpoint does not install its runtime,
download models, or grant network access. Match the backend to the host and use
approved local models. Follow the [local fine-tuning guide](./aikernel-local-fine-tuning.md)
for deployment, datasets, parameter ranges, monitoring, and artifact registration.

<a id="help-knowledge-base"></a>

## Knowledge bases and vectorization

1. Create a knowledge base and choose its embedding model and vector storage.
2. Associate the intended source material in its configuration.
3. Run **Vectorize**, inspect the result, and resolve failures before testing.
4. Run recall tests using realistic questions and inspect source text.

Editing source files or changing an embedding configuration does not by itself
prove the stored vectors are current. Rebuild as required. Keep source access
permissions and retention requirements in mind before sending content to an
external embedding provider.

<a id="help-knowledge-recall"></a>

## Recall tests and Top K

Select a vectorized knowledge base, enter a realistic question, and inspect
returned snippets, source names, links, and ordering. Start with a small **Top K**
(the page suggests 5), then adjust based on relevance and coverage.

Similarity scores are ranking signals, **not recall percentages or correctness
probabilities**. Different models/backends can use different scales. If reranking
is enabled, distinguish its score and order from the original vector ranking.
Inspect full paragraphs before drawing conclusions. A single successful query
does not establish the quality of the entire knowledge base.

<a id="help-prompt-range"></a>

## PromptRange

Select a range and lane before editing or testing a prompt. Keep model settings,
test inputs, and evaluation criteria comparable when judging scores. A high score
on one case is not a guarantee for other inputs. Compare versions before
overwriting or deleting them. Import/export of plugins and creation of an agent
are separate actions; review the target before confirming either.

<a id="help-prompt-models"></a>

## PromptRange model settings

Configure the models used for prompt testing and evaluation, then verify the
selected model in the prompt page. Distinguish model configuration from the
prompt text and from knowledge-base embeddings. Model access and credentials
still depend on the configured provider.

<a id="help-prompt-skills"></a>

## Skills

Review skill content and its intended tools before importing or enabling it.
Skill instructions are not permission grants. Do not include secrets in skill
files or assume imported instructions are safe to execute without review.

<a id="help-file-manager"></a>

## FileManager

Use folders, categories, tags, search, and the available file actions to organize
stored assets. Verify the selected item before renaming, moving, or deleting it.
FileManager assets and session Workspace files have different lifecycles; a file
appearing in one system does not automatically make it available in the other.

<a id="help-file-uploads"></a>

## Upload settings

Review allowed extensions, filtered extensions, and the per-file size limit
before uploading. Host/proxy request limits can impose additional restrictions.
An accepted extension is not proof that the content is safe or parseable.
Avoid weakening the policy simply to work around an unrelated network error.

<a id="help-agents-hub"></a>

## AIAgentsHub

The current module home displays registration information and a generated-module
notice. It is not the AgentsManager orchestration console. Use
[AgentsManager](./agents-manager-human-in-the-loop.md) for Agent/Group execution
and human-in-the-loop operations.

<a id="help-workflow-tasks"></a>

## Workflow tasks

Inspect the task's definition, state, and execution information before starting
or changing it. Human-input pauses require the requested response, not repeated
starts. See the [Workflow guide](./neuchar-workflow.md) for node behavior,
triggers, expressions, and Agent integration.

<a id="help-workflow-replay"></a>

## Workflow replay

Use replay to inspect a run's node order, input/output, and failures. Recorded
output can contain sensitive data. Viewing a run is not an undo operation;
rerunning work can repeat external side effects. Check the available action's
meaning before confirming it.

<a id="help-workflow-analytics"></a>

## Workflow analytics

Review the selected scope and time range before comparing execution counts or
outcomes. Use the task/replay view to investigate individual failures. Aggregates
do not replace the original run records.

<a id="help-desktop-pairing"></a>

## DesktopBridge pairing

Match the desktop-generated pairing code, client name, and source address
before approving. Reject unexpected requests. Review active sessions and revoke
devices that should no longer connect. Device pairing is separate from the
administrator identity and Workspace ownership checks.

<a id="help-dynamic-data"></a>

## DynamicData

Build dynamic interfaces in stages: data-table definitions, layouts, then page
configuration/rendering. The module home can show generated-module information;
use its specific configuration pages for actual editing. Test with disposable
data before exposing a generated interface to other users.

<a id="help-dynamic-tables"></a>

## Dynamic table definitions

Define the table and fields, including identifiers, data types, required/unique
constraints, and display metadata. Check existing data before schema changes.
Do not treat display validation as a substitute for backend validation.

<a id="help-dynamic-layouts"></a>

## Dynamic layouts

Choose the data source and bind columns/fields before configuring buttons,
events, dialogs, and navigation. Verify each binding in the preview. A button's
label does not determine its effect; inspect the configured action.

<a id="help-dynamic-pages"></a>

## Dynamic pages and rendering

Connect the intended layout to the page and inspect the rendered result with
representative data. Check query, edit, validation, and navigation behavior
before publishing. A rendered preview does not grant data access permissions.

<a id="help-crawler"></a>

## SenMapic crawl tasks

Create a task with its start URL and bounded concurrency, duration, depth, and
page count. Start with small limits and inspect task details before scaling up.
Only crawl sources you are authorized to access; respect site rules and content
rights. Starting a task and viewing its status are different operations.

<a id="help-weixin-accounts"></a>

## Weixin official accounts

Configure the correct official account identity, AppId, AppSecret, Token, and
encryption settings for your deployment. Keep these credentials private. Verify
the selected account before changing its configuration or prompt association.
This is distinct from the personal Weixin Bot connection.

<a id="help-weixin-users"></a>

## Weixin followers

Confirm the selected official account before viewing or managing its followers.
Treat identifiers and profile data as personal data. Follow the platform's
authorization and messaging restrictions; a local user record is not consent
for arbitrary outbound messages.

<a id="help-weixin-claw"></a>

## Personal Weixin Bot

Connect the intended account using the page's QR/login flow and check its
runtime status. Disconnect unused accounts. Bot connectivity does not
automatically authorize AdminChat, Workflow, or Workspace actions.

<a id="help-weixin-integration"></a>

## Personal Weixin and Admin integration

Configure an explicit administrator binding and the required feature permissions.
Keep binding codes private. Chat, Workflow, NeuBell, and Harness are separate
capabilities; enable only what is needed and verify the bound identity before
approving work. Unbinding should be part of account/device decommissioning.

<a id="help-database-samples"></a>

## Database sample pages

These are module development demonstrations, not a general production database
administration console. Verify the module and current database provider before
running sample writes. Use the [database guide](/start/database/setting.html)
for deployment configuration and migrations.
