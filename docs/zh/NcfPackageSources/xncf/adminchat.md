# AdminChat 对话、Harness 与附件

<a id="help-admin-chat"></a>

## AdminChat

新建或选择会话，选择可用模型，并在发送前确认当前模式。
会话历史、Workspace 关联和当前模型是不同的配置；切换会话不代表授权修改文件。
检查生成内容和工具请求，不要把流畅的回答当作任务已经完成的证据。
左侧“新对话”进入创建入口，列表按 Workspace 分组；切换会话用于查看相应历史，
组内排序与会话最后活跃时间不是同一个概念。“管理”用于选择和处理消息，不是保存 Memory。
输入区选择模型与执行模式，Ctrl+Enter / Cmd+Enter 发送；终止任务不会回滚已发生的外部操作。
附件、Workspace 权限和 Memory 各有独立帮助，不应拿其中一项的设置说明替代另一项。

Memory 默认关闭，可按会话选择只读或学习；它与聊天历史和 Workspace 文件不同。
模式、作用域、保存回执、Markdown 编辑及 SystemMessage 请参阅
[AdminChat Memory 与对话设置](./adminchat-memory.md)。

<a id="help-admin-chat-module-commands"></a>

## 模块扩展斜杠命令

AdminChat 只固定保留对话控制命令（`/mode`、`/help`、`/maxtoken`、`/maxiterations`、`/harness`），
业务功能命令由各 XNCF 模块通过 `IChatTool` 注册。模块需要显式声明命令标签、提示、模块信息、
系统指令以及允许导入的 Function 方法列表；AdminChat 不再依赖具体业务模块的类型。

在任一输入框输入 `/` 即可看到固定命令与模块命令。模块命令后带有模块名称标签，标签颜色与后台顶部
Tab 使用相同的模块 UID 色彩算法。命令建议和 `/help` 内容都会根据当前应用已注册的模块动态生成。

当前已接入：

| 命令                         | 所属页面/模块 | 行为 |
| ---------------------------- | ------------- | ---- |
| `/analyze-system-logs`       | 系统后台日志  | 只读、限 Token 的概览、搜索与证据读取 |
| `/run-agent-group`           | AgentsManager | 按任务语义查找现有小组并启动异步任务 |
| `/run-workflow`              | NeuChar Workflow | 查找当前管理员拥有的已保存流程并启动一次异步执行 |
| `/edit-workflow --id=<id> --revision=<revision>` | NeuChar Workflow | 读取脱敏图，并基于 Revision 保存一次明确的最小修改 |

后续适合沿用同一机制的候选页面：

| 候选页面         | 建议命令              | 初期安全能力 |
| ---------------- | --------------------- | ------------ |
| Knowledge Base   | `/ask-knowledge`      | 说明匹配到的知识库/文档，并返回带引用的回答 |
| MCP / Connectors | `/diagnose-connector` | 只读检查连接健康和近期调用失败 |
| PromptRange      | `/optimize-prompt`    | 比较已发布提示词并提出新草稿 |
| FileManager      | `/find-file`          | 搜索当前管理员可访问的元数据，默认只返回引用 |
| Workspace        | `/review-workspace`   | 对有限相对路径执行只读检查 |

模块命令生效后，AdminChat 会启用该命令专属的工具白名单，不再混入 Workspace、Skill、已附加模块或
Workflow 管理工具。能够启动外部任务或保存数据的命令，应在系统指令中明确副作用，并只暴露完成目标
所需的最小 Function 集合。编辑类命令仍由服务端归属、Revision 冲突和密钥脱敏机制约束。

<a id="help-admin-chat-system-logs"></a>

## 系统日志分析命令

需要提问 SenparcTrace 相关问题时，在消息开头添加：

```text
/analyze-system-logs --date=yyyyMMdd
```

日期参数可以省略，省略后默认使用当天。必须保留在消息开头，AdminChat 才会为该请求启用模块声明的只读
日志 Function；不需要手动选择模块或 Workspace。日志详情页底部的 AI 快捷入口会自动带入所选日期，
并将该命令逐字输入到对话框。

模型会先获取压缩概览，再进行条件筛选，最后只读取与结论相关的证据，不会请求读取整个日志文件。
具体限制、适用问题、脱敏行为和证据要求参见
[后台日志查询与排障](./admin-logs.md#help-ai-log-analysis)。

<a id="help-chat-harness"></a>

## 普通对话与 Harness

**普通对话（Simple）**用于常规交流；**Harness**用于更长的工具驱动任务，
并提供进度与审批交互。批准前阅读拟执行的动作；中断任务并不会回滚已经发生的副作用。
通过轨迹、历史等入口核对实际执行情况。
Workspace 写入权限与执行权限始终需要分别明确授权。

<a id="help-chat-attachments"></a>

## 附件、视觉与大文件

仅向可以访问 Workspace 的会话上传、粘贴或拖入受支持文件。
上传提示显示当前生效限制，不要假设所有文件都能完整放入模型上下文；
大文件可能需要分块读取 Workspace，或另行授权处理。

上传文件**不代表**授权 AI 写入、执行 Python 或其他命令。
图像视觉需要主动勾选并选择兼容模型；扫描 PDF 可能需要 OCR。
上传成功不代表文本解析成功。移除尚未发送的附件可能删除其 Workspace 资源，
不要用此操作代替隐藏已经提交的文件。
