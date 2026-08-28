# 版本升级说明

> 本页用于集中记录 `NcfPackageSources` 的重要升级项。  
> 面向对象：升级项目的开发者、维护者、运维同学。

## 使用方式

每次升级前后，建议按下面顺序检查：

1. 先看“升级摘要”，确认本次影响范围。  
2. 再看“行为变化清单”，确认是否影响现有模块。  
3. 最后看“升级后验证清单”，完成最小回归检查。

## 当前基线

- 文档基线提交：`f668bf650`（2026-08-29，Developer-MAF-V3）
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
