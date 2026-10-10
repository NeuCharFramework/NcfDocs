# AgentsManager：HIL 与 NeuChar Workflow 集成

> 本页按 `NcfPackageSources` 开发分支于 2026-08-16 核对，重点说明 `Senparc.Xncf.AgentsManager` 的 Human-in-the-Loop（HIL）请求如何与 `Senparc.Xncf.NeuCharWorkflow` 关联。它是集成操作说明，不替代 AgentsManager 的完整 Agent、ChatGroup、Task 和 A2A 使用文档。

## 1. 能力范围

AgentsManager 在 Agent、Agent 组或相关执行流程中遇到需要人类参与的步骤时，会创建 HIL 请求并暂停当前执行。当前主要包括：

| 请求类型       | 触发场景                                               | 人工处理结果                                    |
| -------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `humanTurn`    | 流程中包含 Human participant，需要人类补充对话或指令。 | 必须提交非空文本；文本回到等待中的 Agent 流程。 |
| `toolApproval` | Agent 请求执行需要人工确认的工具调用。                 | 同意或拒绝；工具调用根据审批结果继续或停止。    |

每个请求带有请求 ID、提示、Agent 名称、工具信息（如适用）、目标用户、NeuBell 项目 ID 和 Workflow 关联 ID。请求完成后只允许一个入口恢复，避免 AgentsManager 页面与 Workflow 页面同时处理同一请求。

## 2. 安装与启用

### 2.1 仅使用 AgentsManager

1. 在 XncfModuleManager 中安装并启用 `Senparc.Xncf.AgentsManager`，并完成 AIKernel、PromptRange 等前置模块配置。
2. 创建或启用 AgentTemplate、ChatGroup、Task 或 A2A 配置。
3. 运行任务时，如果触发 HIL，AgentsManager 页面会显示待处理请求，同时发送 AgentsManager NeuBell。
4. `humanTurn` 必须填写文本；`toolApproval` 可以选择同意或拒绝，处理结果会恢复等待中的执行句柄。

### 2.2 在 Workflow 中使用 Agent / Agent 组 / A2A

同时启用 NeuCharWorkflow 后，Workflow“添加节点”的搜索会覆盖 Function、Agent、Agent 组、A2A 和系统节点。选择 Agent、Agent 组或 A2A 对象作为节点后：

1. Workflow 以当前输入解析节点的 Prompt，并调用对应对象。
2. Workflow 为本次运行建立关联 ID：`workflow-{workflowId}-run-{runId}`。
3. AgentsManager 创建 HIL 请求时保留该关联 ID，并将 Workflow 运行状态显示为等待人工处理。
4. Workflow 运行面板会把 AgentsManager HIL 与 Workflow 原生“等待人工输入”请求合并显示。

对象所属模块关闭、对象被删除或对象不可用时，Workflow 保存/运行校验会失败；应先检查模块状态和对象目录，再排查 HIL。

## 3. 统一处理路径

Workflow 和 AgentsManager 页面最终使用同一个 AgentsManager HIL 恢复服务：

```text
Agent / Agent 组 / A2A 执行
        │
        ├─ humanTurn 或 toolApproval
        ▼
AgentsManager HIL 请求队列
        │ 关联 correlationId、recipientUserId、NeuBell
        ├─ AgentsManager 页面
        └─ Workflow 运行面板
                │
                ▼
        权限校验 → 一次性恢复 → 消费对应 NeuBell → 继续执行
```

Workflow 页面通过当前管理员身份和运行关联 ID 过滤请求。AgentsManager 也会检查请求的目标用户；没有目标用户限制时，允许具有该业务处理权限的入口处理。请求成功恢复后，对应 NeuBell 项目会被消费并通知前端更新。

### 3.1 Workflow 中的处理体验

Workflow 运行面板会根据请求类型显示不同的处理方式：

- `humanTurn`：显示提示和文本输入框，提交非空文本后继续。
- `toolApproval`：显示工具名称、参数和审批提示，可以同意或拒绝。
- 原生 `workflowInput`：显示“等待人工输入”节点配置的提示，提交文本后将文本作为节点输出。

后台快速处理请求使用 Workflow Admin 页面中的 `ResolveHuman` 入口；它不是一个绕过 AgentsManager 的第二套恢复逻辑。

## 4. NeuBell 行为

AgentsManager HIL 创建后会生成 AgentsManager NeuBell。原生 Workflow 人工输入节点创建的是 Workflow NeuBell。两者都遵循“恢复成功后消费对应项目”的业务边界：关闭页面上的提示只影响前端提示状态，不等于业务请求已经完成。

建议：

- 不要把 NeuBell 项目 ID 当作长期审批凭据；实际恢复必须经过请求 ID、运行关联和用户权限校验。
- 对需要明确审批记录的流程保留 AgentsManager/Workflow 运行日志，并在外部通知系统中只传递最小必要信息。
- 通过桌面端或其他提醒入口消费 NeuBell 时，仍应调用对应模块的业务消费接口，而不是直接删除提醒数据。

## 5. 与 Workflow 原生人工输入节点的区别

| 项目             | AgentsManager HIL                                        | Workflow 原生“等待人工输入”                                             |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| 主要用途         | Agent 对话参与、工具审批、Agent/Group 执行中的人类决策。 | 纯 Workflow 的审批、补充字段、人工确认和中断。                          |
| 请求类型         | `humanTurn`、`toolApproval`。                            | `workflowInput`。                                                       |
| 后台入口         | AgentsManager 页面和 Workflow HIL 快速处理面板。         | Workflow HIL 快速处理面板。                                             |
| 外部匿名恢复 API | 当前没有复用 Workflow 原生密钥 API。                     | 可在节点上启用，见 [NeuChar Workflow 操作说明](./neuchar-workflow.md)。 |
| 输出             | Human 文本或工具审批结果。                               | 人工提交的文本字符串。                                                  |
| 存储边界         | 当前为 Host 进程内等待队列。                             | 当前为 Host 进程内等待队列。                                            |

因此，AgentsManager 的 HIL 不应被误认为是 Workflow 原生节点的外部 API。若需要让不能登录后台的审批人处理 Agent 工具审批，应另外设计针对 AgentsManager 请求的授权、审计和外部通道；当前实现只为 Workflow 原生节点提供密钥保护的外部恢复 API。

## 6. 进程、部署与安全边界

当前 HIL 请求保存的是正在运行的执行句柄，队列为进程内内存状态：

- 应用重启后，已有等待句柄不会从数据库自动恢复。
- 多实例部署时，查询和提交必须路由到持有等待句柄的实例；仅依靠数据库中的运行记录不能恢复执行。
- 若要支持可靠生产审批，应增加持久化 checkpoint、共享请求状态、实例协调、超时/过期策略和幂等恢复机制。
- 任何外部恢复接口都应使用 HTTPS、网关限流、访问审计和密钥轮换；不要把请求 ID 或 NeuBell ID 单独当作授权凭据。

## 7.1 首页 3D 中的 HIL 暂停

AgentsManager 首页 3D 会把普通暂停与等待 HIL 的暂停区分显示：

- 普通 `Paused` 任务使用橙色柱体和橙色顶部状态环。
- 存在待处理 `humanTurn` 或 `toolApproval` 请求时，Group 使用紫红色柱体、脉冲状态环，并显示 `HIL等待` 计数。
- 3D 的 `Paused` 和 `HIL等待` 都是当前轮询快照；具体请求是否存在、是否已经被处理，仍以 `GetHumanRequests`、任务历史和 HIL 处理结果为准。

完整的柱体高度公式、技能标记和 Agent 空间布局见 [AgentsManager 3D 状态视图](./agents-manager-3d-status.md)。

## 7. 排障顺序

1. 确认 `AgentsManager`、`NeuCharWorkflow` 及其依赖模块已安装并启用。
2. 确认 AgentTemplate、ChatGroup、Agent/Group/A2A 对象仍可用，且 Workflow 节点引用没有失效。
3. 确认 Workflow 运行仍存在，且 `workflow-{workflowId}-run-{runId}` 关联 ID 没有被混用。
4. 确认当前账号与请求的 `recipientUserId` 匹配，或当前账号具备处理该业务请求的权限。
5. 确认请求类型：`humanTurn` 必须有非空文本；`toolApproval` 检查审批结果；不要重复提交已处理的请求 ID。
6. 若 NeuBell 可见但请求不存在，优先检查请求是否已经被另一个入口恢复，以及是否发生过应用重启或实例切换。

相关文档：[NeuChar Workflow 操作说明](./neuchar-workflow.md)、[NCF 核心能力源码详解](../home/capability-guide.md)。
