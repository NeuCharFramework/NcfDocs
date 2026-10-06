# XNCF 扩展库说明（Senparc.Xncf.Xxxx）

> 本页从 `NcfPackageSources` 源码角度解释官方扩展模块，内容于 2026-08-13
> 按开发分支核对。Template 业务开发者无需把官方模块源码作为前置知识。
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

- `Senparc.Xncf.AIKernel`：模型/向量配置，以及通过独立部署 worker 提供的可选[本地微调](../xncf/aikernel-local-fine-tuning.md)。
- `Senparc.Xncf.PromptRange`
- `Senparc.Xncf.AgentsManager`
- `Senparc.Xncf.KnowledgeBase`
- `Senparc.Xncf.MCP`
- `Senparc.Xncf.AIAgentsHub`
- `Senparc.Xncf.NeuCharWorkflow`：以 Function、系统节点和受控 Agent 组合服务端可视化工作流，参见 [NeuChar Workflow](../xncf/neuchar-workflow.md)。

### 3.3 开发与运维模块

- `Senparc.Xncf.XncfBuilder`
- `Senparc.Xncf.Sandbox`（独立沙箱编排：Docker/Wasm；环境准备见 [Sandbox 环境准备指南](../xncf/sandbox-environment.md)）
- `Senparc.Xncf.DesktopBridge`（为桌面伴侣程序提供受保护的 HTTP/SSE 桥接、设备配对与活动通知）
- `Senparc.Xncf.DatabaseToolkit`
- `Senparc.Xncf.FileManager`
- `Senparc.Xncf.Terminal`
- `Senparc.Xncf.FirmwareUpdate`
- `Senparc.Xncf.ChangeNamespace`
- `Senparc.Xncf.WeixinManager`
- `Senparc.Xncf.Dapr`（微服务接入；项目版本 `0.11.0-preview2`）

完整模块版本、排序、场景说明请看：

- [NCF 核心能力源码详解](./capability-guide.md)

### 3.4 近期模块入口

- **AIKernel 本地微调**：管理数据集和有资源边界的 LoRA/QLoRA 任务，查看持久化训练事件，评估 adapter 后再独立部署推理模型。训练默认关闭，需要经过鉴权的伴随 worker，不能替代 KnowledgeBase 检索。参见[概念、部署与操作指南](../xncf/aikernel-local-fine-tuning.md)。
- **NeuCharWorkflow**：用于创建、测试、触发、观察和回看服务端工作流。支持手动、定时和 Webhook 触发，可调用已启用 XNCF 的 Function、Agent / Agent 组 / A2A 对象及内置控制节点。请从 [NeuChar Workflow](../xncf/neuchar-workflow.md) 开始。
- **Sandbox**：用于创建可销毁的 Docker/Wasm 实验会话；镜像、私有仓库和主机环境准备以 [Sandbox 环境准备](../xncf/sandbox-environment.md) 为准。
- **XncfBuilder**：同时支持受信任的直接脚手架和隔离开发流程：源码快照、受限 AI 编辑、Sandbox 预览、人工评审和受保护合入。Template/应用使用者请先看[使用说明](/zh/start/xncf-develop/isolated-xncf-development.html)，源码贡献者继续看[源码剖析](../xncf/xncfbuilder-isolated-development.md)。
- **DesktopBridge**：通过受保护的 HTTP/SSE 桥接、设备配对和活动通知连接 NCF Host 与已授权的桌面伴侣程序。桥接令牌只是应用层密钥，不能替代 TLS、网络访问控制或 Admin 授权。

## 4. 开发者约定：如何把 XNCF 当作“单粒度模块”来设计

建议最少遵循以下规则：

1. 一个模块聚焦一个核心能力域，不做“万能模块”。
2. 明确模块边界：数据库、配置、权限、菜单、Function 分离治理。
3. 优先通过 `[FunctionRender]` 声明可执行能力，保持“代码即声明”。
4. 有对外工具需求时，再显式开启 `EnableMcpServer` 并补齐安全策略。
5. 高风险模块必须最小权限运行，并保留审计记录。
6. Function 的实现和 DTO 优先放入 `Application/AppServices`、`Application/DTOs`，与当前 XncfBuilder 模板保持一致。
7. 面向多语言的菜单、描述和参数使用资源文件与 `[LocalizedDescription]`，不要在代码中固定单一语言。

## 5. 你应该从哪里继续阅读

- 框架总览入口：
  [NcfPackageSources 源码指南](./index.md)

- 版本能力清单与机制：
  [NCF 核心能力源码详解](./capability-guide.md)

- XNCF 开发原理与 Register 细节：
  [Xncf 的构成](/zh/start/xncf-develop/about-xncf.html)

- 文档覆盖度与两条阅读路径：
  [XNCF 模块文档地图](../xncf/module-documentation-map.md)
