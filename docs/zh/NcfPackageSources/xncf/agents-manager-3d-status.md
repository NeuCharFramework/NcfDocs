# AgentsManager 3D 状态视图说明

> 本页按 `NcfPackageSources` 开发分支于 2026-08-22 核对。它说明 AgentsManager 首页 3D 视图的视觉编码、数据边界和排障方式；3D 画面用于运行态概览，不替代 Agent、Group、Task 和 HIL 的详细页面。

## 1. 视图用途

3D 视图把本地 Agent、远程 A2A Agent、Agent 组和当前任务关系放在同一个空间中：

- **柱体**：表示一个 Agent 组。
- **球体 Agent**：表示本地 Agent 或远程 A2A Agent。
- **连线**：表示 Agent 与 Group 的成员关系。
- **流动光点**：表示当前任务中的活跃协作关系。
- **顶部概览**：显示本地 Agent、远程 A2A、Agent 组、活跃任务和 A2A 发布数量。
- **悬停详情**：显示当前 Agent 的状态和技能；悬停或点击 Group 可聚焦、锁定组成员。

页面数据来自 `ChatGroupAppService.GetAgentGraphSnapshot`。快照只提供状态、计数、关系和用于展示的技能类型，不返回 Prompt 正文、对话内容、密钥或完整工具参数。

## 2. Group 柱体高度

柱体高度是“任务规模 + 当前活跃度”的综合指标，不是性能、质量或模型能力评分。

当前计算逻辑为：

```text
totalTasks = waiting + chatting + paused + finished + cancelled + failed
heightScale = 0.72 + min(1.45, totalTasks * 0.08 + runningTaskCount * 0.16)
```

其中：

| 字段               | 含义                                            |
| ------------------ | ----------------------------------------------- |
| `waiting`          | 等待执行的任务数                                |
| `chatting`         | 正在聊天/执行中的任务数                         |
| `paused`           | 已暂停任务数，包括等待人工处理的任务            |
| `finished`         | 已完成任务数                                    |
| `cancelled`        | 已取消任务数                                    |
| `failed`           | 已失败任务数                                    |
| `runningTaskCount` | 当前仍处于 Waiting、Chatting 或 Paused 的任务数 |

因此，历史任务较多的组会更高；当前活跃任务的权重更大。若要判断任务是否真的正在运行，应结合颜色、流动光点和顶部概览，不要只看柱体高度。

## 3. Group 状态样式

| 状态     | 视觉表达                                    | 说明                                                  |
| -------- | ------------------------------------------- | ----------------------------------------------------- |
| 已停用   | 灰红色低透明度柱体                          | 不接收新的组任务，也不应作为可用 Workflow 对象        |
| 待命     | 灰蓝色柱体                                  | 没有 Waiting、Chatting 或 Paused 任务                 |
| 等待     | 蓝色柱体                                    | 组存在等待执行的任务                                  |
| 聊天中   | 青蓝色柱体和流动连线                        | 组存在 Chatting 任务                                  |
| 普通暂停 | 橙色柱体和橙色顶部状态环                    | 组存在暂停任务，但当前没有待处理 HIL 请求             |
| HIL 等待 | 紫红色柱体、脉冲顶部状态环和 `HIL等待` 计数 | 暂停任务关联了 `humanTurn` 或 `toolApproval` 等待请求 |

HIL 等待的判断来自当前 Host 进程中的 `HumanInTheLoopRequestStore`。`Paused` 本身只表示任务暂停；只有存在待处理 HIL 请求时，3D 才显示紫红色 HIL 样式。

## 4. Agent 技能标记

Agent 标签只保留名称、类型、当前状态和技能缩写，避免长 Prompt、评分和运行统计挤在 3D 节点附近。悬停 Agent 时，顶部详情条会显示完整技能名称。

| 缩写  | 技能               | 3D 标记    |
| ----- | ------------------ | ---------- |
| `F`   | FunctionRender     | 蓝色方块   |
| `W`   | Workflow           | 绿色圆环   |
| `P`   | 兼容旧版 Plugin    | 紫色八面体 |
| `M`   | MCP                | 橙色圆柱   |
| `A2A` | A2A 发布或远程 A2A | 金色多面体 |
| `H`   | Human 参与者       | 粉色标记   |

技能来源：

- `AgentTemplate.FunctionCallNames` 中的结构化绑定或旧版逗号分隔 Plugin 名称；
- `McpEndpoints` 是否配置；
- 是否发布为 A2A；
- 是否为系统 Human 参与者；
- 远程 Agent 默认具有 `A2A` 技能。

这些标记表示“可用能力目录”，不等于本轮任务已经调用了对应能力。Function 是否实际执行，仍需查看工具调用日志、任务历史和 HIL 审批结果。

## 5. Agent 空间布局

执行任务时，Agent 不再压缩到柱体附近的同一个小圆圈：

1. 每个 Group 的成员按确定顺序排列在 Group 外围的环形区域。
2. 成员较多时自动增加第二层或第三层环。
3. 活跃组使用更大的环半径，避免 Agent 球体和标签压在柱体上。
4. Agent 标签向环外侧偏移，并限制为紧凑的最多三行。
5. 只有悬停 Agent 时才在顶部显示更详细的状态和技能信息。

这样既保留“Agent 属于哪个 Group”的空间关系，也减少球体、柱体和文字相互遮挡。3D 视图仍然允许用户旋转、缩放和锁定 Group；在极端数量或窄窗口下，应使用筛选器和快速进入控件缩小范围。

## 6. 交互和阅读顺序

建议按下面顺序读取：

1. 先看顶部概览，确认本地 Agent、远程 A2A、Group 和活跃任务的数量。
2. 再看柱体颜色和顶部状态环，定位暂停或 HIL 等待的 Group。
3. 查看流动光点，确认哪些成员关系正在参与活跃任务。
4. 悬停 Agent，查看状态和技能；悬停 Group，查看成员聚焦。
5. 点击 Group 锁定关系，再使用筛选器或快速进入控件进入详细页面。

## 7. 数据和部署边界

- 3D 快照是轮询得到的当前概览，不是完整历史统计。
- 柱体包含历史任务状态计数，因此高度可能保持较高，即使当前没有运行任务。
- HIL 待处理请求目前保存在 Host 进程内。应用重启、多实例未粘性路由或请求路由到其他实例后，3D 可能只看到数据库任务的 `Paused`，而看不到 `HIL等待` 请求。
- 3D 展示不证明模型调用成功，也不证明 Function、Workflow 或 A2A 已经实际执行。
- A2A 连接状态仍需结合远程 Agent 管理页的连接检测和任务日志判断。

## 8. 排障

| 现象                    | 优先检查                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| 3D 页面没有任何对象     | Three.js 模块加载、`AgentGraph3D` 初始化、快照接口是否成功，以及当前账号是否能读取 Agent/Group |
| 柱体高度异常            | 检查 `taskStatusCounts`、`runningTaskCount` 和筛选条件；高度不是评分                           |
| 暂停但没有 HIL 紫色样式 | 任务可能是普通暂停，或待处理请求已经被其他入口处理；检查 `GetHumanRequests` 和 Host 实例       |
| 技能标记为空            | 检查 Agent 的 Function binding、MCP Endpoint、A2A 发布配置和快照字段                           |
| 标签仍然拥挤            | 先锁定单个 Group 或使用 Group/状态筛选；确认浏览器加载了带版本参数的新 `agent-3d.js`           |
| 3D 与任务详情不一致     | 3D 是轮询快照，任务详情和 SSE/历史记录才是单任务的最终证据                                     |

相关文档：

- [AgentsManager HIL 与 Workflow 集成](./agents-manager-human-in-the-loop.md)
- [NeuChar Workflow 操作说明](./neuchar-workflow.md)
