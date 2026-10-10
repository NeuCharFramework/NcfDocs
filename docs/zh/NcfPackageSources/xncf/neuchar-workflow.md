# NeuChar Workflow：操作说明与 `{{= ... }}` 表达式

> 适用于 `Senparc.Xncf.NeuCharWorkflow` `0.1.0-preview1`。本页按 `NcfPackageSources` 开发分支于 2026-08-16 核对。它描述的是当前模块的服务端能力；页面、权限和已安装的 XNCF 模块会决定某些节点在实际站点中是否可用。
> 数据访问与运行状态保存章节于 2026-10-02 单独按开发分支项目版本 `0.4.3` 补充。

`NeuCharWorkflow` 是一个服务端可视化编排模块：把已启用 XNCF 的 Function、Agent / Agent 组 / A2A 对象和内置系统节点连接为一张有向图，由服务器执行。它不是浏览器端脚本执行器，也不会在模板中执行任意 JavaScript。

## 1. 能力与边界

模块安装时会执行自己的数据库迁移，并在后台提供两个入口：

- **NeuChar 工作流**：`/Admin/NeuCharWorkflow/Index`，用于设计、保存、测试和触发工作流。
- **任务列表**：`/Admin/NeuCharWorkflow/Tasks`，用于查看运行状态、中止仍在运行的任务，以及进入只读回看。

页面要求已登录的管理员权限。开始排障时，按下面顺序检查：模块已安装并启用、当前管理员有权限、被引用的 XNCF 模块也已启用、其 Function 或 Agent 对象仍然存在。

| 范围       | 当前行为                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 触发方式   | 手动、定时（间隔）和 Webhook；每张图必须且只能有一个触发器。                                                         |
| 可执行能力 | 已启用模块扫描到的 `[FunctionRender]` Function、可用 Agent / Agent 组 / A2A 对象，以及内置系统节点。                 |
| 保存与运行 | 可保存含未连接节点的草稿；但草稿会被视为未启用，不能作为定时或 Webhook 的半成品运行。                                |
| 运行记录   | 任务列表显示状态与摘要；完成后的任务可进入只读回看，回看使用当时的图快照，不会改动最新定义。                         |
| 变量与代码 | 最多声明 30 个工作流变量；“安全代码”只能给已声明变量赋值，不能执行任意 JavaScript。                                  |
| 人工交互   | 支持原生“等待人工输入”节点；启用 AgentsManager 后，Agent / Agent 组运行触发的 HIL 也会汇入同一个 Workflow 处理面板。 |

### 1.1 数据访问与运行状态保存（2026-10-02）

- 工作流 Service 的查询复用现有 `RepositoryBase.GeAll(...)`，保留数据库端
  投影、分页和取消能力；租户与软删除过滤由底层上下文统一应用。
- `SaveRuntimeStartedAsync` 通过基础仓储 `SavePropertiesAsync` 仅保存
  `LastRunAt`、`NextRunAt`、`LastUpdateTime`。
- `SaveRuntimeCompletedAsync` 仅保存 `LastSucceeded`、`LastError`、
  `LastUpdateTime`，不会将旧 `GraphJson` 或 `Revision` 写回并覆盖管理员在
  运行期间保存的新定义。
- 局部保存要求当前上下文跟踪已持久化的实体；不要在模块 Service 中自行操作
  ChangeTracker，或改成整个旧实体的完整保存。

接口约束见 [Repository 指南](../libs/Senparc.Ncf.Repository.md)；
宿主级后台任务的租户作用域约定见
[多租户配置与后台任务](../../start/config/mutiple-tenant.md)。

## 2. 从新建到一次安全运行

1. 在 **XncfModuleManager** 安装并启用 `Senparc.Xncf.NeuCharWorkflow`，然后从后台菜单打开“NeuChar 工作流”。
2. 点击“新建工作流”，填写名称、说明和触发方式。画布会保持一个与触发方式对应的触发器节点。
3. 从左侧节点库添加 Function、对象或系统节点，连接成从触发器可达的有向图。每个运行节点都应能从触发器到达；图不支持回连。
4. 先使用“手动触发”，填写测试输入并运行。保存和运行前都会检查连线、参数、引用模块和对象状态。
5. 在画布下方 Console 查看展示输出；到“任务列表”查看持续运行的任务、失败原因与完成后的回看。可中止本人仍在运行的任务。
6. 确认流程后再启用定时或 Webhook。保存时会生成修订；任务回看可复制为新的可编辑工作流。

### 2.1 节点速查

| 节点                         | 用途与运行语义                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 手动 / 间隔 / Webhook 触发器 | 三选一。间隔触发按秒配置，范围为 60 秒至 365 天；Webhook 由外部请求异步发起。                                     |
| Function                     | 调用已启用 XNCF 通过 `[FunctionRender]` 暴露的 Function。可为参数直接关联完整上游输出，或为单值文本参数编写模板。 |
| Agent / Agent 组 / A2A       | 发送解析后的 Prompt 给可用对象；对象所属模块关闭、对象被删除或禁用时，保存/运行校验会失败。                       |
| 延时                         | 延迟后透传输入。                                                                                                  |
| 条件                         | 比较左右值，按满足与不满足的分支继续；输入本身继续传递。                                                          |
| 并行                         | 将同一输入分发给所有后续分支，分支可独立执行。                                                                    |
| 汇总（Aggregate）            | 等待所有已激活的上游分支结束，按连线顺序形成输入数组，只向下游输出一次。`{{input}}` 会保留该数组的 JSON 类型。    |
| 逐项合流（Merge）            | 不等待全部输入；每一条输入分别向下游发出一次。与循环累计的逐项激活上限为 500 次。                                 |
| For 循环                     | 对下游做有限次数的顺序执行，次数为 1–100；不支持 `while`，也不允许通过画布回边构成循环。                          |
| 调用工作流                   | 调用当前管理员已保存且已启用的另一工作流，并接收其最终输出；禁止直接或间接调用自身，最多嵌套 8 层。               |
| 安全代码                     | 以受限模板为已声明的 `vars` 变量赋值，仅影响本次运行，并透传原始输入。                                            |
| Console                      | 按模板打印到本页 Console，**不改变**传给下游的原始输入。                                                          |
| NeuBell                      | 创建一条工作流提醒；从 Footer 打开提醒后进入任务列表，并按节点设置决定是否消费提醒。                              |
| 等待人工输入                 | 创建等待项和 NeuBell，暂停当前分支；后台用户提交文本后继续，并将提交文本作为节点输出。可选用外部 WebAPI 恢复。    |
| 结束                         | 终止该路径。                                                                                                      |

### 2.2 定时与 Webhook

定时工作流由模块后台服务扫描到期的已启用工作流后执行。间隔的最小值是 60 秒；因此它适合周期性任务，不应用作秒级实时队列。

Webhook 工作流保存后会显示调用 URL 和访问密钥。外部请求须携带密钥，建议通过请求头 `X-NeuChar-Webhook-Token` 传递；也兼容查询字符串 `token`。可限制为 `GET`、`POST` 或“不限定”。

```bash
curl -X POST 'https://example.test/api/Senparc.Xncf.NeuCharWorkflow/neuchar-workflow/webhook/123' \
  -H 'X-NeuChar-Webhook-Token: <workflow-webhook-token>' \
  -H 'Content-Type: application/json' \
  -d '{"customerName":"Ada","amount":42}'
```

- 已声明参数时，系统从 Query、Form 和 JSON 对象字段中读取这些参数，并校验必填项。
- 未声明参数时，整个请求数据作为工作流输入；非 JSON 请求体使用 `_body` 字段保存。
- 请求体最大为 1 MB。校验通过后接口返回 `202 Accepted` 和 `runId`，实际执行在服务端异步继续。
- Webhook 是匿名入口，因此 URL、令牌和日志必须按生产密钥处理；请使用 HTTPS、最小权限和必要的网关限流/审计。

### 2.3 等待人工输入与 AgentsManager HIL

“等待人工输入”是 Workflow 自身的系统节点，适用于审批、补充信息、人工确认等场景。运行到该节点时：

1. Workflow 创建一次性等待请求，保存当前运行、节点、管理员和请求 ID 的关联。
2. Workflow NeuBell 提醒当前管理员；在 Workflow 运行面板中可以直接输入文本并继续，或拒绝本次请求。
3. 同意后，人工文本作为该节点的字符串输出传给下游；拒绝后当前分支结束。

如果运行的 Agent / Agent 组在 AgentsManager 中触发了 `humanTurn`（人工对话）或 `toolApproval`（工具审批），AgentsManager 会通过 Workflow HIL 桥接把请求关联到当前 Workflow 运行。Workflow 轮询状态时会把原生请求与 AgentsManager 请求合并展示，处理时仍经过 AgentsManager 的权限校验、一次性恢复和 NeuBell 消费逻辑。完整的 AgentsManager 说明见 [AgentsManager HIL 与 Workflow 集成](./agents-manager-human-in-the-loop.md)。

#### 外部程序恢复原生人工输入

在节点配置中打开“允许外部恢复”并生成恢复密钥。密钥加密保存，重新打开编辑器时不会回显；留空保存会保留原密钥。接口不要求后台登录，但必须携带节点恢复密钥：

```http
GET /api/Senparc.Xncf.NeuCharWorkflow/neuchar-workflow/human-input/pending/{workflowId}
X-NeuChar-Workflow-Resume-Key: <node-resume-key>
```

接口返回当前工作流的待处理请求 ID。随后提交一次人工输入：

```bash
curl -X POST 'https://example.test/api/Senparc.Xncf.NeuCharWorkflow/neuchar-workflow/human-input/<requestId>' \
  -H 'X-NeuChar-Workflow-Resume-Key: <node-resume-key>' \
  -H 'Content-Type: application/json' \
  -d '{"approved":true,"input":"审批通过，补充工单号 T-100"}'
```

`approved` 默认为 `true`；设置为 `false` 可以拒绝请求，并可通过 `reason` 提供原因。请求 ID 处理成功后立即失效。该接口只恢复原生“等待人工输入”节点，AgentsManager 自身 HIL 仍使用后台 HIL 入口和 Workflow 快速处理面板。

#### 运行边界

当前原生人工输入队列和 AgentsManager HIL 队列都保存于 Host 进程内，用于关联正在等待的执行句柄。应用重启、不同实例之间的请求转发或未配置粘性路由，都不能保证已有等待项继续执行；生产环境应在正式启用前评估持久化 checkpoint、共享协调器、HTTPS、密钥轮换、限流和审计方案。

## 3. 文本模板与变量

带有“编辑公式文本”的字段可混用固定文字、输入占位符、受限表达式和由界面插入的上游绑定。常见位置包括 Function 的单值文本参数、条件值、Agent Prompt、子工作流输入、NeuBell 标题/摘要、汇总输出和 Console 输出。

| 写法                | 含义                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `{{input}}`         | 当前节点输入的内建占位符。汇总节点中仅写这一项时保留聚合数组本身；其他文本字段会呈现为文本。                           |
| `{{= expression }}` | 计算一个受限表达式并把结果插入文本。表达式不会执行 JavaScript。                                                        |
| `{{value_1}}`       | 由“编辑公式文本”中选择上游输出而插入的可见绑定标记；名称由界面生成。也可在表达式中引用，例如 `{{= upper(value_1) }}`。 |
| `vars.variableName` | 读取工作流变量。变量名只能由字母、数字和下划线组成，且以字母或下划线开头；不能使用 `input` 或 `vars`。                 |

工作流变量在“工作流设置”中声明默认值。默认值按声明顺序计算，后面的变量可以读取前面的 `vars.变量名`；“安全代码”节点可以在本次运行内重新赋值。它们都在运行结束后丢弃，不会变成全局配置。

上游字段关联由编辑器保存为 `$template` 与绑定来源记录。建议始终通过界面选择上游输出，不要手工伪造绑定来源；手工文本中的 `{{= ... }}` 只可访问当前输入、`vars` 和已经插入的绑定标记。

## 4. `{{= ... }}` 语法

### 4.1 基础语法

表达式最多 512 个字符，每个文本字段最多 32 个表达式；单个表达式渲染结果不能超过 8000 个字符。支持空白、圆括号、单/双引号字符串（可使用 `\n`、`\r`、`\t` 转义）、数字、`true`、`false` 和 `null`。

| 类别        | 支持的写法                                                |
| ----------- | --------------------------------------------------------- |
| 取值        | `input`、`vars.customerName`、`input.items[0]`、`value_1` |
| 一元运算    | `!value`、`-number`                                       |
| 算术 / 拼接 | `+`、`-`；两个数相加，其他情况会拼接为文本。              |
| 比较        | `==`、`!=`、`>`、`>=`、`<`、`<=`                          |
| 逻辑        | `&&`、`\|\|`                                              |
| 条件        | `condition ? whenTrue : whenFalse`                        |

不支持 `*`、`/`、`%`、赋值、循环、反射、宿主对象、网络访问或任何 JavaScript API。属性读取仅适用于 JSON 对象，索引仅适用于 JSON 数组；未找到的属性或越界索引会得到空值。

### 4.2 内置函数

函数名不区分大小写；下面示例中的 `value`、`array`、`text` 均为表达式。

| 分类       | 函数                                                                                                                                                     | 示例 / 说明                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 条件与判断 | `if(condition, yes, no)`、`coalesce(a, b, ...)`                                                                                                          | `{{= if(input.vip, 'VIP', '标准') }}`；`coalesce` 返回第一个非空值。                                                    |
| 文本查找   | `contains(value, sought)`、`startsWith(text, prefix)`、`endsWith(text, suffix)`                                                                          | 字符串查找忽略大小写；`contains` 也可检查数组成员。                                                                     |
| 文本转换   | `length(value)`、`substring(text, start[, length])`、`trim(text)`、`lower(text)`、`upper(text)`、`replace(text, old, new)`                               | `{{= upper(vars.customerName) }}`；`length` 对数组返回元素数。                                                          |
| 分割与拼接 | `split(text, separator)`、`join(array, separator)`                                                                                                       | `{{= join(input.tags, '、') }}`。                                                                                       |
| 取元素     | `first(array)`、`last(array)`、`at(array, index)`                                                                                                        | 越界时返回空值。                                                                                                        |
| 数字       | `toNumber(value)`、`sum(array)`、`min(array)`、`max(array)`                                                                                              | 数字函数要求可转换为数字的值。                                                                                          |
| 数组变换   | `sort(array[, path[, direction]])`、`orderBy(array[, path[, direction]])`、`reverse(array)`、`take(array, count)`、`skip(array, count)`、`unique(array)` | `{{= orderBy(input.items, 'price', 'desc') }}`；`path` 只可包含字母、数字、下划线和点，方向只能是 `asc` 或 `desc`。     |
| 日期时间   | `now()`、`formatDate(value[, format])`                                                                                                                   | `now()` 返回 UTC ISO 8601 时间；`{{= formatDate(now(), 'yyyy-MM-dd HH:mm') }}` 使用 .NET 日期格式，格式最长 80 个字符。 |

### 4.3 常用模板示例

```text
您好，{{= upper(vars.customerName) }}！

当前日期：{{= formatDate(now(), 'yyyy-MM-dd') }}

订单数：{{= length(input.orders) }}

等级：{{= if(input.vip, 'VIP', '标准') }}

标签：{{= join(unique(input.tags), '、') }}

价格最高的第一项：{{= first(orderBy(input.items, 'price', 'desc')).name }}
```

对汇总节点，以下模板分别表示“保留数组”和“输出一段摘要文本”：

```text
{{input}}

共 {{= length(input) }} 项：{{= join(input, '，') }}
```

对 Console，默认 `{{input}}` 只决定页面中打印什么；无论模板怎样写，节点向下游仍然传递原始输入。

## 5. 常见问题与排障

| 现象                           | 优先检查                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Function 或 Agent 节点不可执行 | 引用的 XNCF 模块是否已安装/启用，Function 是否仍被扫描到，对象是否仍可用。                                          |
| 保存后工作流没有启用           | 是否仍有节点未连接到触发器；是否有失效引用、必填参数、循环次数或子工作流引用错误。                                  |
| 定时没有运行                   | 工作流是否启用、触发方式是否为间隔、下次运行时间是否到期，以及模块后台服务日志。                                    |
| Webhook 返回 401 / 400 / 405   | 检查令牌、必填参数和请求方法；`405` 表示配置只允许 GET 或 POST。                                                    |
| 人工输入没有继续               | 检查 Workflow/AgentsManager 模块是否启用、当前运行是否仍存在、请求是否已被处理，以及外部 API 的恢复密钥和实例路由。 |
| 表达式报“变量未绑定”           | 仅可用 `input`、`vars` 和由编辑器插入的上游绑定标记；确认变量名和上游连接均有效。                                   |
| Console 内容与下游结果不同     | 这是预期行为：Console 模板只影响展示，原始输入会继续向下游传递。                                                    |

相关文档：

- [XNCF 扩展库说明](../home/xncf-extension-modules.md)
- [NCF 核心能力源码详解](../home/capability-guide.md)
- [AgentsManager HIL 与 Workflow 集成](./agents-manager-human-in-the-loop.md)
