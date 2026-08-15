# XNCF 模块文档地图

> 本覆盖审计于 2026-08-14 基于 `NcfPackageSources` 开发分支完成。
> 它描述的是文档覆盖度，不代表模块是否受支持或是否适合生产使用。

NCF 面对两类合理但不同的读者，一种文档无法同时服务好两者：

| 读者 | 首先需要什么 | 文档类型 |
| --- | --- | --- |
| Template/应用使用者 | 如何安装、配置、授权、操作和验证 | **模块使用说明** |
| `NcfPackageSources` 贡献者 | Register/生命周期、AppService 链路、持久化、关键方法和扩展约束 | **模块源码剖析** |

NuGet/Template 项目的使用者不应为了操作功能而定位实现文件；反过来，源码贡献者也不能只靠 Admin 菜单导览。因此新模块文档应先提供使用说明，并在需要源码深度时链接独立的源码剖析页。

## 当前已有的详细覆盖

| 模块/能力 | 使用说明 | 源码剖析 | 说明 |
| --- | --- | --- | --- |
| `Senparc.Xncf.XncfBuilder` | [有](/zh/start/xncf-develop/isolated-xncf-development.html) | [有](./xncfbuilder-isolated-development.md) | 创建/修改/预览/评审/合入边界。 |
| `Senparc.Xncf.Sandbox` | [环境准备](./sandbox-environment.md) | 已在 XncfBuilder/Sandbox 集成剖析中说明 | Docker 准备与固定 NCF 预览工作负载。 |
| `Senparc.Xncf.NeuCharWorkflow` | [操作说明](./neuchar-workflow.md) | 已结合节点级机制说明 | 触发器、节点、受限表达式和回放。 |
| `Senparc.Xncf.AgentsManager` | [HIL 与 Workflow 集成](./agents-manager-human-in-the-loop.md) | 待补齐完整源码页 | Agent / Group / A2A 的 HIL 请求、NeuBell 和 Workflow 快速处理边界。 |
| `Senparc.Xncf.MCP` | [独立文档](/zh/MCP/home/index.html) | 通用 Register 剖析为部分覆盖 | 已有安装、使用、API、FAQ；仍需要模块内部专页。 |
| XNCF 框架/自定义模块 | [Template 开发](/zh/start/xncf-develop/about-xncf.html) | [能力导览](../home/capability-guide.md) | 属于框架级而非单个官方模块。 |

此前的源码剖析导航只有 NeuCharWorkflow 与 Sandbox 两个模块页。现在已加入 XncfBuilder，但绝大多数官方模块仍只有一行能力地图；下面的清单明确列出缺口和优先级。

## 完整模块清单与文档补齐计划

### P0：模块治理与平台基线

这些模块决定所有已安装模块的生命周期、菜单、授权或租户前提，应最先补齐。

| 模块 | 缺少的必要内容 |
| --- | --- |
| `Senparc.Xncf.XncfModuleManager` | 使用：发现/安装/开关/Function 排障；源码：模块状态迁移、Register 扫描、AI 友好安装动作。 |
| `Senparc.Xncf.SystemCore` | 使用：基础数据与安装顺序；源码：DbContext/Factory 注册和系统实体生命周期。 |
| `Senparc.Xncf.SystemManager` | 使用：系统配置和运维依赖；源码：配置读写边界与后台服务。 |
| `Senparc.Xncf.SystemPermission` | 使用：角色/权限管理；源码：策略映射、鉴权检查与 Admin 范围。 |
| `Senparc.Xncf.Menu` | 使用：菜单管理；源码：菜单注册与本地化链路。 |
| `Senparc.Xncf.Tenant` | 使用：租户启用/隔离；源码：租户解析与 `IIgnoreMulitTenant` 例外。 |
| `Senparc.Xncf.AreasBase` | 源码：Area 基线约定以及与 `Senparc.Ncf.AreaBase` 的关系。 |

### P1：AI、Prompt、Agent 与知识链路

这些模块应在运维层串成一条端到端链路，同时保留各自的数据和执行模型的独立源码页。

| 模块 | 缺少的必要内容 |
| --- | --- |
| `Senparc.Xncf.AIKernel` | 模型提供方/配置、凭据归属、模型选择；源码中的配置与服务选择机制。 |
| `Senparc.Xncf.PromptRange` | Prompt 资产/PromptCode 生命周期、版本/Range 选择；AppService/事件/存储模型。 |
| `Senparc.Xncf.AgentsManager` | Agent 模板、ChatGroup、任务和 A2A 的使用；任务运行器、成员解析、流式/异常边界。 |
| `Senparc.Xncf.KnowledgeBase` | 导入/向量化/召回操作和数据保留预期；资源策略、分块/向量生命周期。 |
| `Senparc.Xncf.MCP` | 端点映射、Function 暴露、鉴权/限流/审计边界的源码专页。 |
| `Senparc.Xncf.AIAgentsHub` | 在推广使用前说明当前成熟度、支持的集成和明确不支持的场景。 |

### P1：开发、运维与高风险能力

这些模块应先具备包含权限、回滚和生产限制的使用说明，再补充源码剖析。

| 模块 | 缺少的必要内容 |
| --- | --- |
| `Senparc.Xncf.DatabaseToolkit` | 备份/更新/查询权限、多数据库范围、事务/回滚限制、AI 查询边界。 |
| `Senparc.Xncf.FileManager` | 上传/存储/资源用途策略、公开资源与知识库资源的边界、路径遍历防护。 |
| `Senparc.Xncf.DesktopBridge` | 配对、桥接 Token 轮换、SSE 生命周期、桌面兼容性和网络边界。 |
| `Senparc.Xncf.FirmwareUpdate` | Feed/镜像配置、限流/退避、手动与后台同步、失败隔离。 |
| `Senparc.Xncf.Terminal` | 严格的运维专用使用方式、命令白名单/审计/宿主权限模型；命令执行源码链路。 |
| `Senparc.Xncf.ChangeNamespace` | 强制备份/演练/评审/回滚说明；替换范围和排除规则。 |
| `Senparc.Xncf.Swagger` | 启用方式、路由暴露和生产鉴权策略。 |
| `Senparc.Xncf.DynamicData` | 当前成熟度和受支持的动态数据边界。 |

### P2：集成、通信与工具类模块

这些模块先补齐面向任务的简明使用说明，待契约稳定后再添加源码剖析。

| 模块 | 缺少的必要内容 |
| --- | --- |
| `Senparc.Xncf.WeixinManager` | 账号/App 配置、凭据保护、消息/API 生命周期、可选 MCP 暴露。 |
| `Senparc.Xncf.Dapr` | 启用、组件前置条件、本地/集群差异、重试/可观测性边界。 |
| `Senparc.Xncf.EmailExtension` | 提供商配置、密钥存放、发件策略、重试/审计。 |
| `Senparc.Xncf.SmsExtension` | 提供商配置、模板/合规和凭据保护。 |
| `Senparc.Xncf.OfficeExtension` | 支持的办公格式、转换存储/生命周期、安全限制。 |
| `Senparc.Xncf.Application` | 外部程序注册、宿主权限、超时/日志与回滚。 |
| `Senparc.Xncf.ReloadPage` | 浏览器刷新范围、缓存/会话影响和安全运维方式。 |
| `Senparc.Xncf.SenMapic` | 爬取目标策略、限流、法律/运维约束和示例状态。 |

## 每个模块推荐的页面形态

### 1. 使用说明：无需源码即可完成工作

1. 目的、成熟度、依赖与非目标；
2. 安装/启用/配置/授权步骤；
3. 一个正常工作流和一个失败/回滚工作流；
4. 安全与生产检查表：密钥、权限、网络、资源限制、审计、数据保留；
5. 排障顺序和相关模块链接。

### 2. 源码剖析：支持贡献者

1. 项目/分层地图：`Register`、`Register.Area`、`Register.Database`、`Domain`、`Application`、`OHS`、`Areas`、资源和测试；
2. Register 元数据、生命周期钩子、DbContext/Migration 归属和模块依赖；
3. 关键 AppService 入口、领域服务、后台任务/事件和请求/数据流；
4. 关键方法的输入校验、鉴权、并发、失败处理和扩展约束；
5. 测试切面与保护公共契约的变更检查表。

## 维护规则

模块出现以下变化时，应同时更新两类页面，或至少在本地图中显式登记缺口：

- `Register` 版本/顺序、安装状态或模块依赖；
- 公共 FunctionRender/MCP 面或 AI 调用资格；
- 鉴权/策略、密钥处理、网络或数据保留行为；
- Migration/数据库模型、后台任务或外部服务契约；
- 用户可见流程、回滚路径或运维前置条件。

## 阅读路径

- Template/应用使用者：[Template 二次开发](/zh/start/xncf-develop/about-xncf.html)，再进入对应模块使用说明；
- 源码贡献者：[XNCF 扩展库导览](../home/xncf-extension-modules.md)，再读模块源码剖析及相应 NCF 基础库页；
- 首批详细模块页：[XncfBuilder](./xncfbuilder-isolated-development.md)、[Sandbox](./sandbox-environment.md)、[NeuCharWorkflow](./neuchar-workflow.md)、[AgentsManager HIL 集成](./agents-manager-human-in-the-loop.md)。
