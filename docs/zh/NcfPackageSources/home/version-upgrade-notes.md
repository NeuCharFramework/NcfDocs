# 版本升级说明

> 本页用于集中记录 `NcfPackageSources` 的重要升级项。  
> 面向对象：升级项目的开发者、维护者、运维同学。

## 使用方式

每次升级前后，建议按下面顺序检查：

1. 先看“升级摘要”，确认本次影响范围。  
2. 再看“行为变化清单”，确认是否影响现有模块。  
3. 最后看“升级后验证清单”，完成最小回归检查。

## 当前基线

- 文档基线提交：`eca233bea`（2026-09-06，Developer-MAF-V3）
- 对应能力文档：
  - [NcfPackageSources 源码指南](./index.md)
  - [NCF 核心能力详解](./capability-guide.md)
  - [新手快速上手（60 分钟）](./beginner-quickstart.md)

## 升级摘要（2026-06）

### 1. 模块化注册与治理

- Function 注册推荐路径统一为 `[FunctionRender]` 自动扫描。
- MCP 作为模块能力由接口契约统一管理。
- 模块排障建议统一顺序：模块状态 -> 注册状态 -> 鉴权策略 -> 运行时日志。

### 2. AI / RAG 实战链路

- 可按 `AIKernel -> PromptRange -> AgentsManager -> KnowledgeBase` 完成最小闭环。
- KnowledgeBase 支持文件切片、向量化、召回测试的基础流程。

### 3. 开源协作与文档共建

- 文档明确了 Issue / PR 最小信息模板与提交建议。
- 新增了“从使用者到贡献者”的流程说明，便于团队内外协作。

### 2026-09-06 / `f668bf650..eca233bea`（Developer-MAF-V3）

- **影响模块**：`Senparc.Areas.Admin`、`Senparc.Xncf.AIKernel`、`Senparc.Web`（站点宿主）、`Senparc.Xncf.NeuCharPivot`（Provits）
- **变化类型**：新增 / 调整
- **关键变化**：
  - **NeuBell WebHook（WebAPI）通知设置**（Senparc.Areas.Admin）：管理员可按纽铃 Provider（或全部）注册 WebHook 端点；纽铃条目新增/移除时系统以异步方式（fire-and-forget，`SemaphoreSlim(4)` 并发限制）POST 通知。每条设置支持 Provider 过滤、新增/移除分别开关、启用开关、可选 HMAC-SHA256 签名（`X-NeuBell-Signature: t=<unix>,v1=<hex>`）与测试发送。新增数据表 `ADMIN_NeuBellWebHook`（Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL 六库迁移）；后台 `IHostedService` 监测（`NeuBellWebHook:PollingIntervalSeconds` 轮询，默认 30 秒 / 最小 5 秒，订阅纽铃变更事件提前唤醒）按 Provider 基线差异对比，避免进程重启或瞬时快照失败误报。管理页 `/Admin/NeuBell/Index`（仅超级管理员），页脚纽铃抽屉提供入口。
  - **AIKernel**：Token 用量监测——实时聚合 + 按运行异步进度；AI 模型列表页直接展示用量。
  - **后台菜单**：左侧菜单搜索过滤；菜单"配置模式"支持拖拽调整一级菜单顺序，保存后真实更新存储的 Sort 值。
  - **Provits（NeuCharPivot）**：逐个创建 Provit，支持 AI Chat 创建或修改；可创建绑定特定页面（如后台首页 `admin-home`）的 "Provit Panel"，组合任意 XNCF 模块的 Provit Block，支持拖拽排序与 AI 辅助编辑。
  - **Admin Chat Harness 模式**：基于 Microsoft Agent Framework（MAF）的可选长任务模式——步数预算、超时控制、`[[DONE]]` 完成标记，执行步骤返回前端；普通对话仍为默认。
  - **CloudflareProtect**（Senparc.Web）：新增 `CloudflareProtect` SystemConfig 配置节（默认关闭），开启后自用户打开网站首个请求起立即生效固定窗口限流与安全响应头。
- **升级动作**：
  - 拉取最新代码后重新执行 `dotnet restore` / `dotnet build`（见 [NcfPackageSources 源码指南](./index.md)）。
  - 在宿主站点为 Senparc.Areas.Admin 执行数据库迁移（新增 `ADMIN_NeuBellWebHook` 表），升级前建议备份数据库。
  - 可选在 `appsettings.json` 配置 `NeuBellWebHook:PollingIntervalSeconds`（默认 30 秒）与 `CloudflareProtect`，均为安全默认值。
- **回退建议**：
  - 保留上一版本 NuGet 包与迁移基线；`ADMIN_NeuBellWebHook` 为增量表，回退无需处理，必要时按备份恢复。
- **验证清单**：
  - `ADMIN_NeuBellWebHook` 在各数据库迁移成功。
  - 页脚纽铃抽屉出现"WebHook 设置"入口；`/Admin/NeuBell/Index` 仅超级管理员可访问。
  - WebHook 新增/保存/开关/删除正常；"测试"按钮对可达端点返回成功。
  - 纽铃条目新增/移除时，匹配端点恰好收到一次 POST；停用 / 不匹配 / 未订阅端点不被调用。
  - AIKernel 模型列表页展示 Token 用量，监测按运行异步推进。
  - 后台左侧菜单搜索生效；配置模式拖拽排序持久化为真实 Sort 值。
  - Provits 可逐个创建与 AI Chat 创建/修改；绑定 `admin-home` 的 Provit Panel 渲染多模块块。
  - Admin Chat Harness 模式可执行长任务并展示步骤；Simple 模式无变化。
  - `CloudflareProtect.Enabled=true` 时，站点自首个请求起限流与安全响应头生效。


### 2026-08-29 / `8ccc5316b..f668bf650`（Developer-MAF-V3）

- **影响模块**：`Senparc.Xncf.AgentsManager`、`Senparc.Xncf.NeuCharWorkflow`、`Senparc.Ncf.XncfBase`、`Senparc.Ncf.Database`、`Senparc.Xncf.XncfBuilder`
- **变化类型**：新增 / 调整
- **关键变化**：
  - AgentsManager 支持 Human-in-the-Loop（人工介入）策略：任务执行可配置人工审批、最大对话轮次与工具权限；群组按配置自动包含人类参与者，审批协议内容不再写入共享消息历史。
  - AgentsManager 新增独立 `AgentExecutionTask` 管理（含多数据库迁移）与 AgentTemplate 模型绑定（Model Binding）、空输出 token 重试；Agent 编辑器支持在新窗口打开，任务管理 UI 重构。
  - NeuCharWorkflow 新增全局 NeuCharPivot 悬浮调用：`[FunctionRender]` 新增 `AllowGlobalPivot` 特性做角色级访问控制，未显式放行的函数不能被全局调用。
  - NeuCharWorkflow 新增 Workflow 分析（Analytics）页面：按日期范围、工作流 ID、状态筛选，支持数据检索与摘要生成。
  - NeuCharWorkflow 新增 Human Input（人工输入）节点：支持用户输入提示与外部恢复（resume），含外部键校验。
  - NeuCharWorkflow 时间戳统一为 `DateTimeOffset`（UTC）；回放支持“加载更多事件”；`AbortRun` 支持按执行日志 ID 精确中止；函数调用 Provider 支持更大循环迭代并保证 scoped 服务隔离。
  - ChatGroupService 使用 `IServiceScopeFactory` 做独立 scope 执行，优化轮次 token 逻辑并记录审批 call ID；ContextSharingRoundRobinGroupChatManager 更新消息历史时排除审批协议内容。
  - 新增 `AgentModelRequestDiagnostics`：agent 模型请求失败诊断与错误提取，敏感数据自动脱敏。
  - NeuCharWorkflowExpressionEngine 的 JSON 序列化改用自定义 `JsonSerializerOptions`，非 ASCII 字符（如中文）可完整保留。
  - 版本与依赖：XncfBuilder 模板升至 `1.1.7`，Senparc.Ncf.Database 升至 `0.21.8-preview8`（多库支持矩阵日志增强），多个项目版本号整体提升。
  - 下载页新增下载源选择（自动 / 本地 / GitHub）并展示 MD5 指纹；多语言资源同步更新。
  - 新增本地数据库配置示例 `SenparcConfig.config`；NCF Desktop 更新至 `0.10.1-build10066`（Linux / macOS / Windows）。
- **升级动作**：
  - 拉取最新代码后重新执行 `dotnet restore` / `dotnet build`（见 [NcfPackageSources 源码指南](./index.md)）。
  - 涉及迁移的模块（AgentsManager 等）需在宿主站点执行数据库迁移，升级前建议备份数据库。
- **回退建议**：
  - 保留上一版本 NuGet 包与迁移基线；数据库结构变更不建议直接降级，必要时按备份恢复。
- **验证清单**：
  - `AgentExecutionTask` 在多数据库下迁移成功，任务创建、筛选、执行记录正常。
  - Human-in-the-Loop 审批、人工参与、最大轮次与工具权限行为符合配置。
  - NeuCharPivot 全局调用仅放行带 `AllowGlobalPivot` 的函数，越权调用被拒绝。
  - Workflow 分析页按日期 / 工作流 / 状态筛选正确并能生成摘要。
  - 下载页三种下载源切换正常，MD5 指纹显示正确，多语言文案完整。
  - NCF Desktop `0.10.1` 可正常下载并启动。


### YYYY-MM-DD / vX.Y.Z

- **影响模块**：`Senparc.Xncf.XXX` / `Senparc.Ncf.XXX`
- **变化类型**：新增 / 调整 / 弃用 / 安全修复
- **关键变化**：
  - ...
- **升级动作**：
  - ...
- **回退建议**：
  - ...
- **验证清单**：
  - ...

## 升级后验证清单（建议最小项）

- 模块安装、启用、菜单可见状态正常。
- Function 与 MCP 注册结果可查询且可调用。
- 管理接口鉴权（Cookie / Bearer / Policy）符合预期。
- 关键日志无持续性错误（数据库、模型服务、网络依赖）。
