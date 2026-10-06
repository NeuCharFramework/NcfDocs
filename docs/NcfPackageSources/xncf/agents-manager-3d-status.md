# AgentsManager 3D Status View

> Checked against the `NcfPackageSources` development line on 2026-08-22. This page documents the visual encoding, data boundaries, and troubleshooting path for the AgentsManager home-page 3D view. The 3D view is an operational overview, not a replacement for Agent, Group, Task, or HIL detail pages.

## 1. Purpose

The 3D view places local Agents, remote A2A Agents, Agent groups, and current task relationships in one scene:

- **Pillars** represent Agent groups.
- **Agent spheres** represent local or remote A2A Agents.
- **Links** represent group membership.
- **Flowing dots** represent active collaboration links.
- **Top overview** shows local Agents, remote A2A, groups, active tasks, and published A2A counts.
- **Hover details** show Agent state and skills; hovering or clicking a Group focuses and locks its members.

The data comes from `ChatGroupAppService.GetAgentGraphSnapshot`. The snapshot contains status, counts, relationships, and display-only skill kinds. It does not return Prompt bodies, conversation content, secrets, or full tool arguments.

## 2. Group pillar height

Pillar height is a combined “task scale + current activity” indicator. It is not a performance, quality, or model-capability score.

The current calculation is:

```text
totalTasks = waiting + chatting + paused + finished + cancelled + failed
heightScale = 0.72 + min(1.45, totalTasks * 0.08 + runningTaskCount * 0.16)
```

| Field              | Meaning                                                  |
| ------------------ | -------------------------------------------------------- |
| `waiting`          | Tasks waiting to execute                                 |
| `chatting`         | Tasks currently chatting or executing                    |
| `paused`           | Paused tasks, including tasks waiting for human handling |
| `finished`         | Finished tasks                                           |
| `cancelled`        | Cancelled tasks                                          |
| `failed`           | Failed tasks                                             |
| `runningTaskCount` | Tasks currently in Waiting, Chatting, or Paused          |

A group with more historical tasks is therefore taller, while current active tasks have a larger weight. To determine whether a group is actively running, combine height with color, flow dots, and the top overview instead of reading height alone.

## 3. Group state styles

| State       | Visual encoding                                           | Meaning                                                                           |
| ----------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Disabled    | Muted red-gray pillar with low opacity                    | The group should not receive new tasks or be used as an available Workflow object |
| Idle        | Gray-blue pillar                                          | No Waiting, Chatting, or Paused tasks                                             |
| Waiting     | Blue pillar                                               | The group has waiting tasks                                                       |
| Chatting    | Cyan pillar and flowing links                             | The group has Chatting tasks                                                      |
| Paused      | Orange pillar and orange top ring                         | The group has paused tasks but no pending HIL request                             |
| HIL waiting | Magenta pillar, pulsing top ring, and `HIL waiting` count | A paused task has a pending `humanTurn` or `toolApproval` request                 |

HIL detection uses the current Host process's `HumanInTheLoopRequestStore`. `Paused` alone means only that a task is paused; the magenta HIL style appears only when a pending HIL request exists.

## 4. Agent skill markers

Agent labels keep only the name, type, current state, and skill abbreviations. Long Prompts, scores, and runtime statistics are intentionally removed from the 3D labels. Hovering an Agent shows the full skill names in the top detail strip.

| Short form | Skill                    | 3D marker         |
| ---------- | ------------------------ | ----------------- |
| `F`        | FunctionRender           | Blue cube         |
| `W`        | Workflow                 | Green ring        |
| `P`        | Legacy-compatible Plugin | Purple octahedron |
| `M`        | MCP                      | Orange cylinder   |
| `A2A`      | Published or remote A2A  | Gold polyhedron   |
| `H`        | Human participant        | Pink marker       |

Skill sources are:

- structured bindings or legacy comma-separated Plugin names in `AgentTemplate.FunctionCallNames`;
- whether `McpEndpoints` is configured;
- whether the Agent is published as A2A;
- whether the Agent is the system Human participant;
- remote Agents default to the `A2A` skill.

These markers describe the available capability catalog. They do not prove that the capability was called in the current task. Actual Function execution still requires tool-invocation logs, task history, and HIL approval evidence.

## 5. Agent spatial layout

When a task starts, Agents are no longer compressed into one small circle next to the pillar:

1. Members of each Group are placed in deterministic rings around the Group.
2. Larger member sets automatically use a second or third ring.
3. Active Groups use a larger ring radius so spheres and labels do not sit on top of the pillar.
4. Agent labels are offset toward the outside of the ring and limited to a compact maximum of three lines.
5. More detailed state and skill information appears in the top strip only while an Agent is hovered.

This preserves the relationship between an Agent and its Group while reducing sphere, pillar, and label collisions. The scene remains rotatable, zoomable, and Group-lockable; for large or narrow layouts, use the Group/status filters and quick-jump controls.

## 6. Reading order

1. Start with the top overview to understand local Agent, remote A2A, Group, and active-task counts.
2. Use pillar color and the top status ring to locate paused or HIL-waiting Groups.
3. Follow flowing dots to identify active member relationships.
4. Hover an Agent for its state and skills; hover a Group to focus its members.
5. Click a Group to lock it, then use filters or quick-jump controls to open the detailed page.

## 7. Data and deployment boundaries

- The 3D snapshot is a polled operational view, not a complete historical report.
- Pillars include historical task status counts, so a pillar may remain tall when no task is currently running.
- Pending HIL requests currently live in Host process memory. After a restart, without sticky multi-instance routing, or when a request reaches another instance, 3D may show database `Paused` without showing `HIL waiting`.
- The 3D view does not prove that a model call succeeded or that a Function, Workflow, or A2A capability actually executed.
- A2A connection state should be confirmed through the Remote Agent management page and task logs.

## 8. Troubleshooting

| Symptom                              | Check first                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| No 3D objects                        | Three.js loading, `AgentGraph3D` initialization, snapshot API success, and current account access to Agents/Groups                                |
| Unexpected pillar height             | `taskStatusCounts`, `runningTaskCount`, and filters; height is not a score                                                                        |
| Paused without the magenta HIL style | The task may be an ordinary pause, or another entry may already have resolved the pending request; check `GetHumanRequests` and the Host instance |
| No skill markers                     | Agent bindings, MCP Endpoint, A2A publication, and snapshot fields                                                                                |
| Labels remain crowded                | Lock one Group or filter by Group/status; confirm the browser loaded the versioned `agent-3d.js` asset                                            |
| 3D differs from task detail          | 3D is a polled snapshot; task detail and SSE/history are the authoritative evidence for one task                                                  |

Related pages:

- [AgentsManager HIL and Workflow integration](./agents-manager-human-in-the-loop.md)
- [NeuChar Workflow](./neuchar-workflow.md)
