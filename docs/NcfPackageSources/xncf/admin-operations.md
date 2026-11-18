# Admin help directory and short notes

Substantial feature instructions now live in their own guides. Page and control help links open those chapters directly, not through this directory.
This page retains short settings, placeholder-module notes and migration links at the original `help-*` anchors.
Chinese UI locales select Chinese documentation; other locales select English. Help opens in a dialog or a new window.

For long-term memory, see [AdminChat Memory and conversation settings](./adminchat-memory.md).

<a id="help-admin-home"></a>

## Admin home

Instructions moved to [Admin home](../../start/start-develop/admin-background.md#help-admin-home).

<a id="help-admin-users"></a>

## Administrators

Instructions moved to [Administrators](../../start/start-develop/admin-background.md#help-admin-users).

<a id="help-admin-roles"></a>

## Roles and permissions

Instructions moved to [Roles and permissions](../../start/start-develop/admin-background.md#help-admin-roles).

<a id="help-admin-menus"></a>

## Menus

Instructions moved to [Menus](../../start/start-develop/admin-background.md#help-admin-menus).

<a id="help-system-config"></a>

## System configuration

The table displays system name, module publish mode and Footer. **Edit** changes system name and Footer.
Footer accepts plain text and `<a>` links with absolute HTTP/HTTPS destinations; other HTML is encoded.
Module publish mode is switched in module management, not in this editor.
This page has no authentication-expiry setting and is not an editor for model credentials or arbitrary host configuration.

<a id="help-tenants"></a>

## Tenants

Instructions moved to [Tenants](../../start/config/mutiple-tenant.md#help-tenants).

<a id="help-accounts"></a>

## Accounts module

The current Accounts home only displays module identity, description and a generated-module notice.
It has no business-user search, creation or editing form. Use the application's actual business-account page or API
for account maintenance. Administrator accounts belong in Administrator management; tenants have a separate page.

<a id="help-logs"></a>

## Logs

Instructions moved to [Logs](./admin-logs.md#help-logs).

<a id="help-log-details"></a>

## Logs for a selected date

Instructions moved to [Logs for a selected date](./admin-logs.md#help-log-details).

<a id="help-host-monitor"></a>

## Host resource monitor

Instructions moved to [Host resource monitor](../../start/start-develop/admin-background.md#help-host-monitor).

<a id="help-module-functions"></a>

## Function definitions and execution parameters

Instructions moved to [Function definitions and execution parameters](../../start/start-develop/admin-module-manage.md#help-module-functions).

<a id="help-module-lifecycle"></a>

## Module details and lifecycle

Instructions moved to [Module details and lifecycle](../../start/start-develop/admin-module-manage.md#help-module-lifecycle).

<a id="help-admin-chat"></a>

## AdminChat

Instructions moved to [AdminChat](./adminchat.md#help-admin-chat).

<a id="help-chat-harness"></a>

## Simple conversation and Harness

Instructions moved to [Simple conversation and Harness](./adminchat.md#help-chat-harness).

<a id="help-chat-attachments"></a>

## Attachments, vision, and large files

Instructions moved to [Attachments, vision, and large files](./adminchat.md#help-chat-attachments).

<a id="help-chat-prompt-references"></a>

## Prompt references in AdminChat

The message input offers a **PromptRange** button that opens the prompt
selector (filter by range, lane, or keyword; sorted by current score).
Selecting a prompt inserts its full text at the caret; the insertion is not
sent or executed automatically. The inserted span becomes a _reference_
bound to the selected PromptCode version, so the message keeps a link to the
prompt asset instead of a detached copy.

- Reference tags appear above the input. Use a tag to rate the prompt (0–10),
  open a read-only preview, locate the referenced text, or remove the
  reference while keeping the text.
- At most 32 references per message, and the ranges must not overlap.
  Editing the message updates the ranges; editing inside a reference removes
  that reference.
- On send, the server re-validates each reference: the text must still match
  the stored prompt content, and the PromptRange module must be available.
  If the prompt changed after insertion, the send is rejected; remove the
  reference or insert the prompt again.
- Only user messages can carry references. They are stored with the message
  and rendered in history as tags showing `PromptCode · score`.

Rating records a manual score, or—when the prompt has a benchmark and the
message has a completed assistant reply—an AI score that evaluates that input
and reply against the benchmark; model charges may apply. The last successful
rating wins, and all references to the same prompt share the current score.
Existing deployments need the `Add_PromptCode_Scores` (PromptRange) and
`Add_AdminChat_PromptReferences` (Admin) migrations for each database
provider before using references or ratings.

<a id="help-workspace-permissions"></a>

## Workspace permissions

Instructions moved to [Workspace permissions](./workspace-adminchat.md#help-workspace-permissions).

<a id="help-neubell"></a>

## NeuBell and outbound WebHooks

Instructions moved to [NeuBell and outbound WebHooks](./neubell-webhooks.md#help-neubell).

<a id="help-pivot-access"></a>

## NeuCharPivot access policies

Instructions moved to [NeuCharPivot access policies](./neuchar-pivot.md#help-pivot-access).

<a id="help-pivot-boards"></a>

## NeuCharPivot boards

Instructions moved to [NeuCharPivot boards](./neuchar-pivot.md#help-pivot-boards).

<a id="help-pivot-aggregate"></a>

## NeuCharPivot aggregation

Instructions moved to [NeuCharPivot aggregation](./neuchar-pivot.md#help-pivot-aggregate).

<a id="help-mcp-manager"></a>

## MCP Manager page

Instructions moved to [MCP Manager page](./mcp-manager.md#help-mcp-manager).

<a id="help-mcp-connections"></a>

## MCP client connection configuration

Instructions moved to [MCP client connection configuration](./mcp-manager.md#help-mcp-connections).

<a id="help-ai-models"></a>

## AI model configurations

Instructions moved to [AI model configurations](./aikernel-admin.md#help-ai-models).

<a id="help-ai-vectors"></a>

## Vector storage configurations

Instructions moved to [Vector storage configurations](./aikernel-admin.md#help-ai-vectors).

<a id="help-ai-tokens"></a>

## Token monitoring

Instructions moved to [Token monitoring](./aikernel-admin.md#help-ai-tokens).

<a id="help-ai-dashboard"></a>

## AI dashboard

Instructions moved to [AI dashboard](./aikernel-admin.md#help-ai-dashboard).

<a id="help-fine-tuning"></a>

## Local fine-tuning management

Instructions moved to [Local fine-tuning management](./aikernel-local-fine-tuning.md#help-fine-tuning).

<a id="help-fine-tuning-workers"></a>

## Fine-tuning Workers

Instructions moved to [Fine-tuning Workers](./aikernel-local-fine-tuning.md#help-fine-tuning-workers).

<a id="help-knowledge-base"></a>

## Knowledge bases and vectorization

Instructions moved to [Knowledge bases and vectorization](./knowledge-base.md#help-knowledge-base).

<a id="help-knowledge-create"></a>

## Create a knowledge base

Instructions moved to [Create a knowledge base](./knowledge-base.md#help-knowledge-create).

<a id="help-knowledge-recall"></a>

## Recall tests and Top K

Instructions moved to [Recall tests and Top K](./knowledge-base.md#help-knowledge-recall).

<a id="help-knowledge-top-k"></a>

## Returned snippet count (Top K)

Instructions moved to [Returned snippet count (Top K)](./knowledge-base.md#help-knowledge-top-k).

<a id="help-prompt-dashboard"></a>

## PromptRange dashboard

Instructions moved to [PromptRange dashboard](./prompt-range.md#help-prompt-dashboard).

<a id="help-prompt-workbench"></a>

## Prompt workbench

Instructions moved to [Prompt workbench](./prompt-range.md#help-prompt-workbench).

<a id="help-prompt-range"></a>

## Selecting ranges and lanes

Instructions moved to [Selecting ranges and lanes](./prompt-range.md#help-prompt-range).

<a id="help-prompt-models"></a>

## PromptRange model settings

Instructions moved to [PromptRange model settings](./prompt-range.md#help-prompt-models).

<a id="help-prompt-skills"></a>

## Skills

Instructions moved to [Skills](./skills.md#help-prompt-skills).

<a id="help-file-manager"></a>

## FileManager

Instructions moved to [FileManager](./file-manager.md#help-file-manager).

<a id="help-file-uploads"></a>

## Upload settings

Instructions moved to [Upload settings](./file-manager.md#help-file-uploads).

<a id="help-agents-hub"></a>

## AIAgentsHub

The current module home displays registration information and a generated-module
notice. It is not the AgentsManager orchestration console. Use
[AgentsManager](./agents-manager-human-in-the-loop.md) for Agent/Group execution
and human-in-the-loop operations.
For general page controls see [Agents management home](./agents-manager.md#help-agents-manager);
the HIL guide only covers human intervention.

<a id="help-workflow-tasks"></a>

## Workflow tasks

Instructions moved to [Workflow tasks](./neuchar-workflow.md#help-workflow-tasks).

<a id="help-workflow-replay"></a>

## Workflow replay

Instructions moved to [Workflow replay](./neuchar-workflow.md#help-workflow-replay).

<a id="help-workflow-analytics"></a>

## Workflow analytics

Instructions moved to [Workflow analytics](./neuchar-workflow.md#help-workflow-analytics).

<a id="help-desktop-pairing"></a>

## DesktopBridge pairing

Instructions moved to [DesktopBridge pairing](./workspace-adminchat.md#help-desktop-pairing).

<a id="help-dynamic-data"></a>

## DynamicData

Instructions moved to [DynamicData](./dynamic-data.md#help-dynamic-data).

<a id="help-dynamic-tables"></a>

## Dynamic table definitions

Instructions moved to [Dynamic table definitions](./dynamic-data.md#help-dynamic-tables).

<a id="help-dynamic-layouts"></a>

## Dynamic layouts

Instructions moved to [Dynamic layouts](./dynamic-data.md#help-dynamic-layouts).

<a id="help-dynamic-pages"></a>

## Dynamic page settings

Instructions moved to [Dynamic page settings](./dynamic-data.md#help-dynamic-pages).

<a id="help-crawler"></a>

## SenMapic crawl tasks

Instructions moved to [SenMapic crawl tasks](./senmapic.md#help-crawler).

<a id="help-weixin-accounts"></a>

## Weixin official accounts

Instructions moved to [Weixin official accounts](./weixin-manager.md#help-weixin-accounts).

<a id="help-weixin-users"></a>

## Weixin followers

Instructions moved to [Weixin followers](./weixin-manager.md#help-weixin-users).

<a id="help-weixin-claw"></a>

## Personal Weixin Bot

Instructions moved to [Personal Weixin Bot](./weixin-bot.md#help-weixin-claw).

<a id="help-weixin-integration"></a>

## Personal Weixin and Admin integration

Instructions moved to [Personal Weixin and Admin integration](./weixin-bot.md#help-weixin-integration).

<a id="help-database-samples"></a>

## Database sample pages

These are module development demonstrations, not a general production database
administration console. Verify the module and current database provider before
running sample writes. Use the [database guide](/start/database/setting.html)
for deployment configuration and migrations.

<a id="help-agents-manager"></a>

## Agents management home

Instructions moved to [Agents management home](./agents-manager.md#help-agents-manager).

<a id="help-workflow-designer"></a>

## Workflow designer

Instructions moved to [Workflow designer](./neuchar-workflow.md#help-workflow-designer).

<a id="help-workspace-manage"></a>

## My Workspaces and uploads

Instructions moved to [My Workspaces and uploads](./workspace-adminchat.md#help-workspace-manage).

<a id="help-sandbox-panel"></a>

## Sandbox dashboard

Instructions moved to [Sandbox dashboard](./sandbox-environment.md#help-sandbox-panel).

<a id="help-builder-preview"></a>

## XncfBuilder preview monitor

Instructions moved to [XncfBuilder preview monitor](../../start/xncf-develop/isolated-xncf-development.md#help-builder-preview).

<a id="help-dynamic-render"></a>

## Dynamic layout rendering

Instructions moved to [Dynamic layout rendering](./dynamic-data.md#help-dynamic-render).

<a id="help-crawler-detail"></a>

## Crawl task details

Instructions moved to [Crawl task details](./senmapic.md#help-crawler-detail).

<a id="help-weixin-overview"></a>

## Official account control center

Instructions moved to [Official account control center](./weixin-manager.md#help-weixin-overview).
