# AgentsManager: HIL and NeuChar Workflow Integration

> Checked against the `NcfPackageSources` development line on 2026-08-16. This page focuses on how `Senparc.Xncf.AgentsManager` Human-in-the-Loop (HIL) requests integrate with `Senparc.Xncf.NeuCharWorkflow`. It is an integration guide, not a complete Agent, ChatGroup, Task, and A2A user guide.

## 1. Scope

AgentsManager pauses an Agent, Agent-group, or related execution when a human must participate. The current request types are:

| Request type   | Trigger                                                      | Human result                                                                   |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `humanTurn`    | A Human participant asks for a human message or instruction. | Non-empty text is required and is returned to the waiting Agent flow.          |
| `toolApproval` | An Agent requests approval before executing a tool call.     | Approve or reject; the tool call continues or stops according to the decision. |

Each request carries a request ID, prompt, Agent name, tool details when applicable, recipient user, NeuBell item ID, and Workflow correlation ID. Completion is one-time so that the AgentsManager page and the Workflow page cannot resolve the same request concurrently.

## 2. Enablement

### 2.1 AgentsManager only

1. Install and enable `Senparc.Xncf.AgentsManager` in XncfModuleManager, and configure prerequisites such as AIKernel and PromptRange.
2. Create or enable the required AgentTemplate, ChatGroup, Task, or A2A configuration.
3. When a task triggers HIL, the AgentsManager page shows the pending request and an AgentsManager NeuBell is created.
4. `humanTurn` requires non-empty text. `toolApproval` can approve or reject; the result resumes the waiting execution handle.

### 2.2 Agent / Agent-group / A2A nodes in Workflow

When NeuCharWorkflow is enabled as well, the Workflow **Add node** search covers Functions, Agents, Agent groups, A2A objects, and system nodes. After selecting an Agent, Agent group, or A2A object:

1. Workflow resolves the node Prompt from the current input and invokes the object.
2. The run receives a correlation ID: `workflow-{workflowId}-run-{runId}`.
3. AgentsManager retains that correlation ID when it creates an HIL request and exposes the Workflow run as waiting for human handling.
4. The Workflow run panel merges AgentsManager HIL requests with native **Wait for human input** requests.

If the referenced module is closed, or the object was removed or disabled, Workflow save/run validation fails. Check module state and the object catalog before debugging HIL.

## 3. Unified resolution path

Both the Workflow page and the AgentsManager page ultimately use the same AgentsManager HIL resolution service:

```text
Agent / Agent-group / A2A execution
        │
        ├─ humanTurn or toolApproval
        ▼
AgentsManager HIL request queue
        │ correlationId, recipientUserId, NeuBell
        ├─ AgentsManager page
        └─ Workflow run panel
                │
                ▼
        access check → one-time resolution → consume NeuBell → continue
```

The Workflow page filters requests by the current administrator and the run correlation ID. AgentsManager also checks the request recipient; when no recipient is specified, the normal business authorization boundary still applies. After a successful resolution, the associated NeuBell item is consumed and the frontend is notified.

### 3.1 Workflow handling experience

The Workflow run panel adapts to the request type:

- `humanTurn`: shows the prompt and a text box; non-empty text is required.
- `toolApproval`: shows the tool name, arguments, and approval prompt; the user can approve or reject.
- Native `workflowInput`: shows the prompt configured on the Wait for human input node; submitted text becomes the node output.

The Admin quick-handling request goes through the Workflow page's `ResolveHuman` entry. It is not a second resolution implementation that bypasses AgentsManager.

## 4. NeuBell behavior

AgentsManager HIL creates an AgentsManager NeuBell. The native Workflow human-input node creates a Workflow NeuBell. Both follow the same business boundary: successfully resolving the request consumes the corresponding item; closing a frontend toast only changes visual state and does not complete the business request.

Recommendations:

- Do not treat a NeuBell item ID as a long-lived approval credential. Resolution still requires the request ID, run correlation, and user authorization.
- Keep AgentsManager/Workflow run records for approval-sensitive processes, and send only the minimum necessary data through external notification systems.
- When a desktop or other notification entry consumes a NeuBell, use the module's business-consumption API instead of deleting reminder data directly.

## 5. AgentsManager HIL versus the native Workflow node

| Concern                       | AgentsManager HIL                                                                                  | Native Workflow Wait for human input                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Main use                      | Agent conversation participation, tool approval, and human decisions inside Agent/Group execution. | Approval, missing fields, human confirmation, and interruption in a pure Workflow. |
| Request types                 | `humanTurn`, `toolApproval`.                                                                       | `workflowInput`.                                                                   |
| Admin entry                   | AgentsManager page and Workflow HIL quick panel.                                                   | Workflow HIL quick panel.                                                          |
| Anonymous external resume API | Does not currently reuse the native Workflow resume-key API.                                       | Optional node-level API, documented in [NeuChar Workflow](./neuchar-workflow.md).  |
| Output                        | Human text or a tool approval result.                                                              | Submitted human text as a string.                                                  |
| Storage boundary              | In-memory pending queue in the current Host process.                                               | In-memory pending queue in the current Host process.                               |

AgentsManager HIL must therefore not be mistaken for the native Workflow node's external API. If an external approver must handle Agent tool approvals without signing into Admin, a separate AgentsManager-specific authorization, audit, and delivery channel is required. The current implementation exposes the key-protected external resume API only for the native Workflow node.

## 6. Process, deployment, and security boundaries

The current HIL queues hold the active execution handles in process memory:

- Existing waits are not automatically restored from the database after an application restart.
- In a multi-instance deployment, reads and submissions must reach the instance holding the wait handle; a persisted run record alone cannot resume it.
- Reliable production approval requires persistent checkpoints, shared request state, instance coordination, expiry/timeout policy, and idempotent resolution.
- Any external resume endpoint should use HTTPS, gateway rate limiting, access auditing, and key rotation. Do not use a request ID or NeuBell ID alone as an authorization credential.

## 6.1 HIL pause state in the home-page 3D view

The AgentsManager home-page 3D view distinguishes an ordinary pause from a pause waiting for HIL:

- Ordinary `Paused` tasks use an orange pillar and orange top ring.
- When a pending `humanTurn` or `toolApproval` request exists, the Group uses a magenta pillar, a pulsing status ring, and an `HIL waiting` count.
- Both `Paused` and `HIL waiting` are polled snapshot states. The authoritative evidence for whether a request still exists or was already handled is `GetHumanRequests`, task history, and the HIL resolution result.

See [AgentsManager 3D Status View](./agents-manager-3d-status.md) for the pillar-height formula, skill markers, and Agent spatial layout.

## 7. Troubleshooting order

1. Confirm that `AgentsManager`, `NeuCharWorkflow`, and their prerequisite modules are installed and enabled.
2. Confirm that the AgentTemplate, ChatGroup, and Agent/Group/A2A object are still available and the Workflow reference is valid.
3. Confirm that the Workflow run still exists and that `workflow-{workflowId}-run-{runId}` has not been mixed with another run.
4. Confirm that the current account matches `recipientUserId`, or has the business permission required to handle the request.
5. Check the request type: `humanTurn` needs non-empty text; `toolApproval` needs an approval decision; do not submit a request ID that was already handled.
6. If NeuBell is visible but the request no longer exists, first check whether another entry resolved it, or whether the application restarted or routed to another instance.

Related pages: [NeuChar Workflow](./neuchar-workflow.md) and [NCF Capability Source Deep Dive](../home/capability-guide.md).
