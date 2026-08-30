# XNCF 扩展库说明（Senparc.Xncf.Xxxx）

> 适用范围：`NcfPackageSources` 当前版本。  
> 本页用于介绍 NCF 中的**XNCF 扩展模块（Senparc.Xncf.Xxxx）**。

## 1. NCF 作为“模块化框架”的定义

在 NCF 中，模块化不是“目录拆分”，而是运行时可识别、可安装、可启停、可治理的能力单元体系。

可以理解为两层：

- `Senparc.Ncf.*`：框架底座层（提供通用能力和约束）。
- `Senparc.Xncf.*`：能力模块层（以模块形式交付具体功能）。

### 1.1 XNCF 的单粒度模块定义（关键）

一个 `Senparc.Xncf.Xxxx`，本质上就是一个**单粒度能力模块**：

- 有自己的 `Register` 元数据与生命周期（安装/升级/卸载）。
- 可以声明自己的数据库、菜单、Function、MCP 能力。
- 可以独立启用、禁用、运维与安全管控。

这就是 NCF “模块化框架”最重要的工程意义：**把能力拆成可治理的最小单元，而不是把所有逻辑塞进单体项目。**

## 2. 为什么开发者必须重视 XNCF 扩展模块

- 降低耦合：模块边界清晰，避免“全站代码互相牵连”。
- 独立演进：一个模块可单独迭代版本，不必每次全量改动。
- 可控上线：可以按模块灰度/启停，降低发布风险。
- 权限与安全清晰：高风险能力（如 Terminal、DatabaseToolkit）可单独隔离治理。
- 团队协作友好：按模块分工，PR 审查边界更明确。

## 3. 当前版本常见 XNCF 模块地图（按职责）

### 3.1 系统基础模块

- `Senparc.Xncf.SystemCore`
- `Senparc.Xncf.SystemManager`
- `Senparc.Xncf.SystemPermission`
- `Senparc.Xncf.XncfModuleManager`
- `Senparc.Xncf.Menu`
- `Senparc.Xncf.Tenant`

### 3.2 AI / Agent / RAG 模块

- `Senparc.Xncf.AIKernel`：AI 模型/向量模型配置与运行基础
- `Senparc.Xncf.PromptRange`：提示词靶场、PromptCode 资产体系
- `Senparc.Xncf.AgentsManager`：智能体模板、群聊/任务编排、HITL 人工审批、A2A 远程智能体、AgentExecutionTask 管理
- `Senparc.Xncf.NeuCharWorkflow`：服务端工作流编排（可视化设计器、版本管理与自动保存、运行回放、Webhook 触发、并行节点、Human Input 节点、NeuBell 通知、Analytics 分析）
- `Senparc.Xncf.KnowledgeBase`：知识库管理、导入、向量化、召回测试
- `Senparc.Xncf.AIAgentsHub`：Agent Hub 示例模块（多数据库 Context、Function 端点、本地化资源）
- `Senparc.Xncf.MCP`：MCP 端点与调用管理（`EnableMcpServer`）
- `Senparc.Xncf.Sandbox`：独立沙箱编排（Docker/Wasm 隔离实验环境、配额/TTL、JupyterLab、工作区文件管理）
- 契约包：`AIKernel.Abstractions`、`AgentsManager.Abstractions`、`MCP.Abstractions`、`PromptRange.Abstractions`、`NeuCharWorkflow.Abstractions`、`Sandbox.Abstractions`

### 3.3 开发与运维模块

- `Senparc.Xncf.XncfBuilder`：模块脚手架、迁移命令、AI 辅助代码生成、Preview Host（进程级模块预览）
- `Senparc.Xncf.DatabaseToolkit`：数据库更新、备份、结构查询、Agent 集成查询
- `Senparc.Xncf.FileManager`：文件管理
- `Senparc.Xncf.Terminal`：服务器终端命令执行（高权限）
- `Senparc.Xncf.FirmwareUpdate`：NCF Host / NCF Desktop 双安装包镜像（GitHub Release -> `wwwroot/NcfPackages/host` 与 `/desktop`，独立下载清单 + MD5 指纹）
- `Senparc.Xncf.Dapr`：Dapr 客户端抽象（服务调用、Pub/Sub、状态管理、健康检查）
- `Senparc.Xncf.DesktopBridge`：桌面伴侣应用 HTTP/SSE 桥接（能力发现、活动快照、授权同步流、一次性 PKCE 交接）
- `Senparc.Xncf.ChangeNamespace`：全局命名空间替换（高风险）
- `Senparc.Xncf.DynamicData`：动态数据基础模块（含 ForNcf 变体）
- `Senparc.Xncf.SenMapic`：SenMapic 爬虫模块
- `Senparc.Xncf.Application`：外部程序调用模块
- `Senparc.Xncf.WeixinManager`：微信管理后台与对应 MCP 能力
- `Senparc.Xncf.Swagger`：接口说明文档
- 未发布（Unpublished）：`EmailExtension`、`OfficeExtension`、`SmsExtension`、`ReloadPage`（仅源码仓库提供，不随 NuGet 发布）

完整模块版本、排序、场景说明请看：

- [NCF 核心能力详解](./capability-guide.md)

## 4. 开发者约定：如何把 XNCF 当作“单粒度模块”来设计

建议最少遵循以下规则：

1. 一个模块聚焦一个核心能力域，不做“万能模块”。
2. 明确模块边界：数据库、配置、权限、菜单、Function 分离治理。
3. 优先通过 `[FunctionRender]` 声明可执行能力，保持“代码即声明”。
4. 有对外工具需求时，再显式开启 `EnableMcpServer` 并补齐安全策略。
5. 高风险模块必须最小权限运行，并保留审计记录。

## 5. 你应该从哪里继续阅读

- 框架总览入口：
  [NcfPackageSources 源码指南](./index.md)

- 版本能力清单与机制：
  [NCF 核心能力详解](./capability-guide.md)

- XNCF 开发原理与 Register 细节：
  [Xncf 的构成](/zh/start/xncf-develop/about-xncf.html)
