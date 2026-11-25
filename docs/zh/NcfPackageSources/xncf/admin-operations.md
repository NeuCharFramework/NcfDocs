# 后台帮助导航与简短说明

复杂功能的操作说明已迁移到各自专题。页面和按钮的问号直接定位专题章节，不再通过本页中转。
本页保留简短设置、占位模块说明，以及旧地址的迁移链接。旧的 `help-*` 锚点仍然有效。
中文界面使用中文文档，其他界面语言使用英文；帮助默认弹窗显示，也可在新窗口打开。

长期记忆请阅读 [AdminChat Memory 与对话设置](./adminchat-memory.md)。

<a id="help-admin-home"></a>

## 后台首页

说明已迁移至[后台首页](../../start/start-develop/admin-background.md#help-admin-home)。

<a id="help-admin-users"></a>

## 管理员

说明已迁移至[管理员](../../start/start-develop/admin-background.md#help-admin-users)。

<a id="help-admin-roles"></a>

## 角色与权限

说明已迁移至[角色与权限](../../start/start-develop/admin-background.md#help-admin-roles)。

<a id="help-admin-menus"></a>

## 菜单

说明已迁移至[菜单](../../start/start-develop/admin-background.md#help-admin-menus)。

<a id="help-system-config"></a>

## 系统配置

该页展示系统名称、模块发布模式和 Footer；“编辑”弹窗修改系统名称及 Footer。
Footer 支持普通文本和绝对 HTTP/HTTPS 链接的 `<a>` 标签，其他 HTML 会被编码。
模块发布模式由模块管理页的发布开关切换，不在此编辑窗中设置。
本页没有登录有效期设置，也不是模型凭据或任意宿主配置的编辑器。

### 小白操作清单

1. 只有在确定浏览器标题和后台外壳要展示的名称后，再修改“系统名称”。
2. “Footer”建议先填写普通文本；需要链接时使用绝对 `https://` 地址，并让可见文字
   能说明链接用途。
3. 保存后刷新实际页面，在浏览器中确认结果。
4. 如果发现模块没有出现，请进入模块管理页；不要认为本页的“模块发布模式”会安装、
   启用或发布模块。

Footer 字段有意限制了内容。不要粘贴脚本、事件属性、相对地址或完整页面片段；
预览中能显示，不代表所有浏览器、反向代理或内容安全策略都会接受该链接。

<a id="help-tenants"></a>

## 租户

说明已迁移至[租户](../../start/config/mutiple-tenant.md#help-tenants)。

进入此页前，先确认系统已启用多租户，并确定请求中哪个值用于选择租户。
“匹配关键词”是识别租户的值；除非部署明确这样设计，它不等同于租户显示名称。

新增租户时填写名称、匹配关键词、管理员备注和启用状态。
只有在确实要创建该租户的初始系统信息和管理员账号时，才点击“初始化”。
结果弹窗中的凭据应立即保存到批准的密码管理工具中，不要放进截图、聊天消息或日志。
修改已有租户的匹配关键词可能导致请求解析到另一个租户，生产变更前应先用非生产请求验证。

<a id="help-accounts"></a>

## Accounts 业务账号

当前 Accounts 首页只显示模块名称、说明及自动生成模块提示，没有业务用户查询、创建或编辑表单。
不能在此页完成账号维护；应使用应用实际提供的业务账号页面或接口。
后台管理员请进入“管理员管理”，租户请进入“租户管理”，不要把这三个入口混用。

<a id="help-logs"></a>

## 日志

说明已迁移至[日志](./admin-logs.md#help-logs)。

<a id="help-log-details"></a>

## 指定日期的日志详情

说明已迁移至[指定日期的日志详情](./admin-logs.md#help-log-details)。

<a id="help-host-monitor"></a>

## Host 资源监控

说明已迁移至[Host 资源监控](../../start/start-develop/admin-background.md#help-host-monitor)。

<a id="help-module-functions"></a>

## Function 列表与执行参数

说明已迁移至[Function 列表与执行参数](../../start/start-develop/admin-module-manage.md#help-module-functions)。

<a id="help-module-lifecycle"></a>

## 模块详情与生命周期

说明已迁移至[模块详情与生命周期](../../start/start-develop/admin-module-manage.md#help-module-lifecycle)。

<a id="help-admin-chat"></a>

## AdminChat

说明已迁移至[AdminChat](./adminchat.md#help-admin-chat)。

<a id="help-chat-harness"></a>

## 普通对话与 Harness

说明已迁移至[普通对话与 Harness](./adminchat.md#help-chat-harness)。

<a id="help-chat-attachments"></a>

## 附件、视觉与大文件

说明已迁移至[附件、视觉与大文件](./adminchat.md#help-chat-attachments)。

<a id="help-chat-prompt-references"></a>

## AdminChat 中的提示词引用

消息输入区提供 **PromptRange** 按钮，打开提示词选择器（可按靶场、靶道或
关键词筛选，默认按当前评分排序）。选择提示词会把完整正文插入到光标处；
插入不会自动发送或执行。插入的文本会成为绑定所选 PromptCode 版本的
_引用_，消息因此保留与提示词资产的关联，而不是一份脱离来源的拷贝。

- 引用标签显示在输入框上方。可通过标签给提示词打分（0~10）、打开只读预览、
  定位被引用文本，或只取消引用而保留正文。
- 单条消息最多 32 个引用，且引用区间不能重叠。编辑消息会更新引用区间；
  编辑引用范围内的文本会移除该引用。
- 发送时服务端会重新校验每个引用：文本必须仍与保存的提示词正文一致，
  且 PromptRange 模块可用。若插入后提示词已变更，发送会被拒绝；
  请取消引用或重新插入提示词。
- 只有用户消息可以携带引用。引用随消息一起保存，历史记录中以
  `PromptCode · 评分` 标签渲染。

评分可以记录手工分数；当提示词配置了基准答案且该消息已有完成的助手回复时，
也可以进行 AI 评分，用它评估本次输入与回复，可能产生模型调用费用。
最后一次成功评分生效，同一提示词的所有引用共享当前评分。现有部署需先为
每种数据库提供程序应用 `Add_PromptCode_Scores`（PromptRange）与
`Add_AdminChat_PromptReferences`（Admin）迁移，才能使用引用与评分。

<a id="help-workspace-permissions"></a>

## Workspace 权限

说明已迁移至[Workspace 权限](./workspace-adminchat.md#help-workspace-permissions)。

<a id="help-neubell"></a>

## NeuBell 与出站 WebHook

说明已迁移至[NeuBell 与出站 WebHook](./neubell-webhooks.md#help-neubell)。

<a id="help-pivot-access"></a>

## NeuCharPivot 访问策略

说明已迁移至[NeuCharPivot 访问策略](./neuchar-pivot.md#help-pivot-access)。

<a id="help-pivot-boards"></a>

## NeuCharPivot 面板

说明已迁移至[NeuCharPivot 面板](./neuchar-pivot.md#help-pivot-boards)。

<a id="help-pivot-aggregate"></a>

## NeuCharPivot 聚合

说明已迁移至[NeuCharPivot 聚合](./neuchar-pivot.md#help-pivot-aggregate)。

<a id="help-mcp-manager"></a>

## MCP Manager 管理页

说明已迁移至[MCP Manager 管理页](./mcp-manager.md#help-mcp-manager)。

<a id="help-mcp-connections"></a>

## MCP 客户端连接配置

说明已迁移至[MCP 客户端连接配置](./mcp-manager.md#help-mcp-connections)。

<a id="help-ai-models"></a>

## AI 模型配置

说明已迁移至[AI 模型配置](./aikernel-admin.md#help-ai-models)。

<a id="help-ai-vectors"></a>

## 向量存储配置

说明已迁移至[向量存储配置](./aikernel-admin.md#help-ai-vectors)。

<a id="help-ai-tokens"></a>

## Token 监控

说明已迁移至[Token 监控](./aikernel-admin.md#help-ai-tokens)。

<a id="help-ai-dashboard"></a>

## AI 仪表盘

说明已迁移至[AI 仪表盘](./aikernel-admin.md#help-ai-dashboard)。

<a id="help-fine-tuning"></a>

## 本地微调管理页

说明已迁移至[本地微调管理页](./aikernel-local-fine-tuning.md#help-fine-tuning)。

<a id="help-fine-tuning-workers"></a>

## 微调 Worker

说明已迁移至[微调 Worker](./aikernel-local-fine-tuning.md#help-fine-tuning-workers)。

<a id="help-knowledge-base"></a>

## 知识库与向量化

说明已迁移至[知识库与向量化](./knowledge-base.md#help-knowledge-base)。

<a id="help-knowledge-create"></a>

## 新建知识库

说明已迁移至[新建知识库](./knowledge-base.md#help-knowledge-create)。

<a id="help-knowledge-recall"></a>

## 召回测试与 Top K

说明已迁移至[召回测试与 Top K](./knowledge-base.md#help-knowledge-recall)。

<a id="help-knowledge-top-k"></a>

## 返回片段数量（Top K）

说明已迁移至[返回片段数量（Top K）](./knowledge-base.md#help-knowledge-top-k)。

<a id="help-prompt-dashboard"></a>

## PromptRange 统计首页

说明已迁移至[PromptRange 统计首页](./prompt-range.md#help-prompt-dashboard)。

<a id="help-prompt-workbench"></a>

## Prompt 工作台

说明已迁移至[Prompt 工作台](./prompt-range.md#help-prompt-workbench)。

<a id="help-prompt-range"></a>

## 选择靶场与靶道

说明已迁移至[选择靶场与靶道](./prompt-range.md#help-prompt-range)。

<a id="help-prompt-models"></a>

## PromptRange 模型设置

说明已迁移至[PromptRange 模型设置](./prompt-range.md#help-prompt-models)。

<a id="help-prompt-skills"></a>

## Skill

说明已迁移至[Skill](./skills.md#help-prompt-skills)。

<a id="help-file-manager"></a>

## FileManager 文件资源

说明已迁移至[FileManager 文件资源](./file-manager.md#help-file-manager)。

<a id="help-file-uploads"></a>

## 上传设置

说明已迁移至[上传设置](./file-manager.md#help-file-uploads)。

<a id="help-agents-hub"></a>

## AIAgentsHub

当前模块首页显示注册信息与自动生成模块提示，并不是 AgentsManager 编排控制台。
Agent/Group 执行与人工介入请使用 [AgentsManager](./agents-manager-human-in-the-loop.md)。
首页管理操作见 [Agents 管理首页](./agents-manager.md#help-agents-manager)，HIL 文档仅解释人工介入。

<a id="help-workflow-tasks"></a>

## Workflow 任务

说明已迁移至[Workflow 任务](./neuchar-workflow.md#help-workflow-tasks)。

<a id="help-workflow-replay"></a>

## Workflow 回放

说明已迁移至[Workflow 回放](./neuchar-workflow.md#help-workflow-replay)。

<a id="help-workflow-analytics"></a>

## Workflow 统计

说明已迁移至[Workflow 统计](./neuchar-workflow.md#help-workflow-analytics)。

<a id="help-desktop-pairing"></a>

## DesktopBridge 设备配对

说明已迁移至[DesktopBridge 设备配对](./workspace-adminchat.md#help-desktop-pairing)。

<a id="help-dynamic-data"></a>

## DynamicData

说明已迁移至[DynamicData](./dynamic-data.md#help-dynamic-data)。

<a id="help-dynamic-tables"></a>

## 动态数据表

说明已迁移至[动态数据表](./dynamic-data.md#help-dynamic-tables)。

<a id="help-dynamic-layouts"></a>

## 动态布局

说明已迁移至[动态布局](./dynamic-data.md#help-dynamic-layouts)。

<a id="help-dynamic-pages"></a>

## 动态界面设置

说明已迁移至[动态界面设置](./dynamic-data.md#help-dynamic-pages)。

<a id="help-crawler"></a>

## SenMapic 采集任务

说明已迁移至[SenMapic 采集任务](./senmapic.md#help-crawler)。

<a id="help-weixin-accounts"></a>

## 微信公众号

说明已迁移至[微信公众号](./weixin-manager.md#help-weixin-accounts)。

<a id="help-weixin-users"></a>

## 微信关注用户

说明已迁移至[微信关注用户](./weixin-manager.md#help-weixin-users)。

<a id="help-weixin-claw"></a>

## 个人微信 Bot

说明已迁移至[个人微信 Bot](./weixin-bot.md#help-weixin-claw)。

<a id="help-weixin-integration"></a>

## 个人微信与后台集成

说明已迁移至[个人微信与后台集成](./weixin-bot.md#help-weixin-integration)。

<a id="help-database-samples"></a>

## 数据库示例页

这些页面用于模块开发演示，不是通用生产数据库管理台。
执行示例写操作前核对模块和当前数据库类型。
部署配置及迁移参见[数据库指南](/zh/start/database/setting.html)。

<a id="help-agents-manager"></a>

## Agents 管理首页

说明已迁移至[Agents 管理首页](./agents-manager.md#help-agents-manager)。

<a id="help-workflow-designer"></a>

## Workflow 设计器

说明已迁移至[Workflow 设计器](./neuchar-workflow.md#help-workflow-designer)。

<a id="help-workspace-manage"></a>

## 我的工作区与文件上传

说明已迁移至[我的工作区与文件上传](./workspace-adminchat.md#help-workspace-manage)。

<a id="help-sandbox-panel"></a>

## Sandbox 沙箱面板

说明已迁移至[Sandbox 沙箱面板](./sandbox-environment.md#help-sandbox-panel)。

<a id="help-builder-preview"></a>

## XncfBuilder 预览监控

说明已迁移至[XncfBuilder 预览监控](../../start/xncf-develop/isolated-xncf-development.md#help-builder-preview)。

<a id="help-dynamic-render"></a>

## 动态布局渲染页

说明已迁移至[动态布局渲染页](./dynamic-data.md#help-dynamic-render)。

<a id="help-crawler-detail"></a>

## 采集任务详情

说明已迁移至[采集任务详情](./senmapic.md#help-crawler-detail)。

<a id="help-weixin-overview"></a>

## 公众号控制中心

说明已迁移至[公众号控制中心](./weixin-manager.md#help-weixin-overview)。
