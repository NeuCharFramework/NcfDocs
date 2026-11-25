# AgentsManager agent management

<a id="help-agents-manager"></a>

## Agents management home

### Daily operating sequence

1. Search for or create an agent, checking its profile and settings rather than editing a different similarly named object.
2. Inspect its groups and tasks before starting, stopping or rerunning work. Review selections before batch actions.
3. Inspect task state after execution. Respond through HIL when requested instead of repeatedly starting the task.
4. Configure A2A publication and access separately when exposing capabilities; creating an agent record is not publication.

<a id="help-agents-ai-shortcut"></a>

### Start an existing group from AdminChat

The Footer **AI** button on AgentsManager types `/run-agent-group ` into AdminChat. Add a task description,
optionally including an explicit group ID or name. The command can call only the search and start Functions
for existing groups; it does not create, edit or delete Agents, groups or conversations.

The first step is a semantic/keyword search across enabled group names, descriptions and members. If one group
clearly fits the task, AdminChat starts it with the remaining text as the task command and reports the asynchronous
task state. If several groups are plausible, it asks the administrator to choose instead of guessing. Treat
"task started" as acknowledgement, not completion; inspect the resulting ChatTask and HIL requests on the
AgentsManager page.

### Views and focused guides

Create, search and edit agents, switch between panel, 3D and statistics views, or manage remote A2A agents.
Select an agent to inspect its profile, settings, groups and tasks. Starting/stopping groups and batch task actions
are distinct from editing agent configuration. A2A publication changes externally exposed capabilities and needs separate access review.
Viewing a task does not start a new run.
See [3D status](./agents-manager-3d-status.md#help-agents-status) for markers, and
[HIL and Workflow](./agents-manager-human-in-the-loop.md) when waiting for human input; HIL is only one feature of this page.
