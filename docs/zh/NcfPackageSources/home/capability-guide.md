# NCF 核心能力源码详解（面向实战）

> 本页是面向 `NcfPackageSources` 开发者的源码剖析，不是使用 Template 开发
> 业务模块的前置教程。普通二次开发请先看
> [XNCF 二次开发接口与边界](/zh/start/xncf-develop/contracts-and-interfaces.html)。
> 内容于 2026-08-13 按开发分支核对。

## 1. 核心能力总览

学习当前版本时，建议优先掌握以下能力：

- EventBus 已形成“高并发 + 重试 + 去重 + 事件链深度/循环保护”的完整机制。
- `PromptRange` 与 `AgentsManager` 的协作链路已通过事件模型和 AppService 进一步标准化。
- `KnowledgeBase` 已具备“文件切片 -> 向量化 -> 召回测试”的基础闭环。
- `XncfModuleManager` 增强了面向 AI 的模块安装/开放能力（UID 或名称关键字匹配）。
- `FirmwareUpdate` 提供了 GitHub Release 到站点本地 `wwwroot/NcfPackages` 的镜像能力。
- MCP 相关能力已下沉到 `IXncfRegister`/`XncfRegisterBase` 统一协议，可按模块开关。
- 模拟站点已迁移到 .NET 10，并提供中文、英文、日文、法文、西班牙文和俄文界面资源。
- 安装器默认勾选六个基础模块，并在真正安装前显示确认清单。

### 1.1 XNCF 的单粒度模块定义（框架意义）

在 NCF 中，`Senparc.Xncf.xxx` 并不是“可有可无的插件集合”，而是模块化框架中的核心能力单元。  
每个 XNCF 都应按“单粒度模块”理解：一个模块聚焦一个能力域，具备独立注册、独立生命周期、独立治理边界。

这意味着：

- `Senparc.Ncf.*` 负责框架底座能力。
- `Senparc.Xncf.*` 负责业务能力装配与演进。

如果只看基础库、不看 XNCF，就只能理解“框架怎么跑”，却无法理解“功能怎么拼”。

## 2. 扩展模块能力清单（按源码 Register 实际值）

### 2.1 系统核心模块（59xx）

| 模块                           | 版本  | XncfOrder | 作用                                      |
| ------------------------------ | ----- | --------: | ----------------------------------------- |
| Senparc.Xncf.Menu              | 0.1   |      5940 | 系统菜单管理                              |
| Senparc.Xncf.XncfModuleManager | 0.1.2 |      5950 | 模块状态治理、安装开放、Function 状态检查 |
| Senparc.Xncf.AreasBase         | 0.1   |      5955 | Area 基础能力                             |
| Senparc.Xncf.SystemPermission  | 0.2.0 |      5960 | 权限管理                                  |
| Senparc.Xncf.SystemManager     | 1.1.2 |      5970 | 系统管理与核心配置                        |
| Senparc.Xncf.SystemCore        | 0.1.1 |      5980 | 系统核心数据结构                          |
| Senparc.Xncf.Tenant            | 0.1   |      5990 | 多租户能力                                |

### 2.2 AI / RAG / Agents 相关模块

| 模块                         | 版本              | XncfOrder | MCP | 说明                                                               |
| ---------------------------- | ----------------- | --------: | --- | ------------------------------------------------------------------ |
| Senparc.Xncf.AIKernel        | 5.0.5             |         - | 否  | AI 模型/向量模型配置与运行基础                                     |
| Senparc.Xncf.PromptRange     | 0.15.2            |      5897 | 否  | 提示词靶场、PromptCode 体系                                        |
| Senparc.Xncf.AgentsManager   | 0.3.22            |         - | 否  | 智能体模板、群聊任务、HIL 与 Workflow 集成；见 [集成说明](../xncf/agents-manager-human-in-the-loop.md) |
| Senparc.Xncf.KnowledgeBase   | 0.1.10            |         - | 否  | 知识库管理、导入、向量化、召回测试                                 |
| Senparc.Xncf.AIAgentsHub     | 0.1.0             |         - | 否  | Agent Hub（早期）                                                  |
| Senparc.Xncf.NeuCharWorkflow | 0.1.0-preview1    |      5890 | 否  | 服务端可视化工作流、人工输入节点和 HIL 桥接；见 [操作说明](../xncf/neuchar-workflow.md) |
| Senparc.Xncf.MCP             | 0.1.0（Register） |         - | 是  | NuGet 包为 `0.4.0-preview3`；自动映射 MCP 端点                     |

### 2.3 开发与运维模块

| 模块                         | 版本                    | XncfOrder | MCP | 说明                                                                       |
| ---------------------------- | ----------------------- | --------: | --- | -------------------------------------------------------------------------- |
| Senparc.Xncf.XncfBuilder     | 0.37.0-preview5（项目） |      5896 | 是  | 模板包 `0.13.0`；直接脚手架及隔离 AI 开发 / Sandbox 预览 / 人工合入（[说明](../xncf/xncfbuilder-isolated-development.md)） |
| Senparc.Xncf.Sandbox         | 0.1.0-preview1          |         - | 否  | 可销毁 Docker/Wasm 实验环境；见 [环境准备](../xncf/sandbox-environment.md) |
| Senparc.Xncf.DesktopBridge   | 0.2.1-preview2          |         - | 否  | 受保护的 HTTP/SSE 桌面桥接、设备配对与活动通知                             |
| Senparc.Xncf.DatabaseToolkit | 0.7.1                   |         - | 否  | 数据库更新、备份、结构查询、Agent 集成查询                                 |
| Senparc.Xncf.Swagger         | 0.7.1                   |         0 | 否  | 接口文档                                                                   |
| Senparc.Xncf.Terminal        | 0.1.6                   |         - | 否  | 服务器终端命令执行（高权限）                                               |
| Senparc.Xncf.FileManager     | 0.2.5                   |         - | 否  | 文件管理                                                                   |
| Senparc.Xncf.FirmwareUpdate  | 0.1.0                   |         - | 否  | 同步 NCF 安装包并维护 latest-release.json                                  |
| Senparc.Xncf.ChangeNamespace | 0.3.9                   |         - | 否  | 全局命名空间替换（高风险）                                                 |
| Senparc.Xncf.DynamicData     | 0.1.0                   |         - | 否  | 动态数据基础模块（早期）                                                   |
| Senparc.Xncf.SenMapic        | 0.1.3                   |         - | 否  | 爬虫示例模块                                                               |
| Senparc.Xncf.Application     | 0.0.5                   |         - | 否  | 外部程序调用模块                                                           |
| Senparc.Xncf.WeixinManager   | 0.21.1                  |      5880 | 是  | 微信管理与对应 MCP 能力                                                    |

## 3. 关键机制详解（直接对应源码）

### 3.1 EventBus：高并发与安全边界

核心文件：

- `Senparc.Ncf.Core/EventBus/InMemoryEventBus.cs`
- `Senparc.Ncf.Core/EventBus/EventBusHostedService.cs`
- `Senparc.Ncf.Shared.Abstractions/Events/IIntegrationEvent.cs`

关键能力：

- `MaxConcurrency` 并发处理（默认 `max(4, CPU*2)`）
- 去重处理（10 分钟窗口，`TryMarkEventAsProcessed`）
- 失败重试（指数退避）
- 事件链深度上限控制（`MaxEventChainDepth`）
- 循环引用检测（事件链模式校验）

推荐注册方式：

```csharp
services.AddSenparcEventBus(options =>
{
    options.MaxConcurrency = Math.Max(8, Environment.ProcessorCount * 2);
    options.EnableDuplicateDetection = true;
    options.RetryOnFailure = true;
    options.MaxRetryAttempts = 3;
    options.MaxEventChainDepth = 10;
    options.EnableCircularReferenceDetection = true;
}, typeof(YourHandler).Assembly);
```

### 3.2 FunctionRender：推荐的 Function 注册方式

核心事实：

- `IXncfRegister.Functions` 在当前接口中已被注释，不再作为主要注册机制。
- Function 扫描来自 `AppServiceBase` 子类中的 `[FunctionRender]` 方法。
- 结果进入 `Register.FunctionRenderCollection`，可按模块 UID 查询。

这使得 Function 生命周期更接近“代码即声明”，减少维护 Register 显式列表的成本。

### 3.3 MCP：统一开关与统一路由

核心机制：

- 模块层：`EnableMcpServer => true`
- 注册层：`AddMcpServer(IServiceCollection, IXncfRegister)`
- 启用层：`UseMcpServer(IApplicationBuilder, IRegisterService)`
- 路由规则：`mcp-<module-name-lowercase>`（由 `XncfRegisterBase` 自动生成）
- SSE 地址在上述路由后追加 `/sse`；例如 MCP 模块为 `/mcp-senparc-xncf-mcp/sse`

可在 `XncfRegisterManager.McpServerInfoCollection` 获取已登记 MCP 服务清单。

::: warning 安全边界
当前源码虽然有 `McpAccessToken` 配置项，但自动映射路径尚未启用查询参数令牌校验。对外暴露前必须在反向代理、网关或应用层补充鉴权、限流和审计。
:::

### 3.4 API 鉴权强化（AgentsManager / PromptRange）

当前版本对高价值 AppService 增加了统一鉴权策略：

- 同时兼容 Cookie（Admin Scheme）与 JWT Bearer
- 使用 `AdminOnly` 等策略进行权限收敛
- 前端对 401/403 进行了明确跳转与提示处理

建议：后续新增管理型 API 时，保持同一鉴权基线，不要绕过 `ApiAuthorize`。

## 4. 按场景落地（推荐路径）

### 4.1 场景 A：设计和运行 NeuChar Workflow

1. 在 XncfModuleManager 中安装并启用 `Senparc.Xncf.NeuCharWorkflow`；安装会执行该模块自己的数据库迁移。
2. 打开“NeuChar 工作流”，新建工作流、选择一个触发方式，并将全部运行节点连到该触发器。
3. 配置已启用 XNCF 的 Function、Agent / A2A 对象或系统节点；执行状态与只读回看统一从任务列表进入。
4. 仅当画布与引用模块均通过校验后，才启用定时或 Webhook 工作流。

节点、触发器、操作步骤和受限 `{{= ... }}` 语言请看 [NeuChar Workflow](../xncf/neuchar-workflow.md)。

### 4.2 场景 B：搭建 AI + Prompt + Agent + KnowledgeBase 闭环

1. 安装并开放基础模块：`AIKernel`、`PromptRange`、`AgentsManager`、`KnowledgeBase`。
2. 在 `AIKernel` 中配置可用模型（Chat/Embedding/向量库）。
3. 在 `PromptRange` 中沉淀 PromptCode 资产。
4. 在 `AgentsManager` 中通过 PromptCode 生成 AgentTemplate，组装 ChatGroup/Task。
5. 在 `KnowledgeBase` 导入文件并执行向量化，然后通过 RecallTest 验证召回质量。
6. 将召回结果与 Agent 工作流串接，形成可迭代链路。

### 4.2.1 场景 B1：Agent/Group HIL 接入 Workflow

1. 确认 `AgentsManager` 和 `NeuCharWorkflow` 均已安装并启用。
2. 在 Workflow 中搜索并添加 Agent、Agent 组或 A2A 对象，完成 Prompt 和连线配置。
3. 运行进入 `humanTurn` 或 `toolApproval` 后，在 Workflow 运行面板或 AgentsManager 页面处理 HIL。
4. 若是纯 Workflow 的审批或补充信息，使用“等待人工输入”系统节点；需要外部程序代为提交时，按节点文档配置恢复密钥和 WebAPI。

HIL 请求当前依赖 Host 进程内的等待句柄。应用重启或多实例路由可能使已有等待无法继续；生产环境需要额外设计持久化 checkpoint、共享协调和审计策略。详见 [AgentsManager HIL 与 Workflow 集成](../xncf/agents-manager-human-in-the-loop.md)。

### 4.3 场景 C：模块治理（安装、开放、排障）

建议优先使用 `XncfModuleManager`：

- 获取全部模块状态
- 安装并开放模块（含 AI 友好输入）
- 查看模块 Function 装载状态

这是排查“模块在、菜单在、但功能不可用”的第一入口。

### 4.4 场景 D：数据库维护与发布安全

- 研发阶段：可结合 `DatabaseToolkit` + `DatabasePlant` 提高多数据库维护效率。
- 发布阶段：建议避免把 `DatabasePlant` 带入生产运行包。
- 涉及结构变更时：优先用模块自身 DbContext 迁移，避免跨模块上下文污染。

### 4.5 场景 E：桌面安装包镜像

`FirmwareUpdate` 适合做“发布兜底链路”：

- 定时或手动拉取 `NeuCharFramework/NCF` Release
- 同步到站点 `wwwroot/NcfPackages`
- 保留最近 3 个版本
- 自动更新 `latest-release.json`

适用于官方发布镜像、离线兜底下载等场景。

### 4.6 场景 F：本地化与首次安装

- 站点与安装器支持 `zh-CN`、`en`、`ja`、`fr`、`es`、`ru`。
- Function 参数说明可通过 `[LocalizedDescription]` 关联资源键。
- 首次安装默认选择管理员、PromptRange、XncfBuilder、MCP、AIKernel、AgentsManager 六个模块；用户确认清单后才会写入安装状态。

## 5. 高风险模块清单（上线前必审）

- `Senparc.Xncf.Terminal`：可执行服务器命令，必须严格权限隔离。
- `Senparc.Xncf.ChangeNamespace`：不可逆改写风险，必须先备份并在隔离环境执行。
- `Senparc.Xncf.DatabaseToolkit`：具备数据库写操作能力，上线需最小权限。
- `Senparc.Xncf.MCP`：对外工具调用入口，必须配置鉴权、限流、审计。

## 6. 新手高频误区（从源码实践角度）

- 只验证“模块安装成功”，没有验证“模块已启用 + 具备权限 + 配置完整”。
- 仍然通过 `IXncfRegister.Functions` 认知 Function 注册，导致排查方向错误。
- 碰到 401/403 直接改接口代码，而不是先查 AdminOnly 策略和认证上下文。
- RAG 效果不好就改召回逻辑，但实际问题是 Embedding 配置缺失或数据质量不足。

## 7. 排障优先级（团队建议统一）

当功能异常时，建议全团队统一按此顺序排查：

1. **模块状态层**：安装、启用、版本、依赖是否满足。
2. **注册层**：FunctionRender、MCP、自动映射是否被扫描并登记。
3. **鉴权与策略层**：Cookie/Bearer、Policy、角色权限是否满足。
4. **运行时层**：日志、异常堆栈、外部依赖（模型服务、数据库、网络）。

统一排障顺序能显著减少“各查各的、结论冲突”的沟通成本。

## 8. 从使用者到贡献者（开源协作流程）

### 8.1 高质量 Issue 最小模板

建议每个 Issue 至少包含：

1. 环境信息：系统、.NET 版本、数据库类型。
2. 仓库信息：提交号（或发布标签）。
3. 复现步骤：3-8 步，尽量最小化。
4. 期望结果与实际结果。
5. 日志与截图（脱敏后）。

### 8.2 PR 检查清单

提交 PR 前建议自检：

- 是否只解决一个明确问题（避免“超大混合 PR”）。
- 是否补充了对应文档（行为变化必须更新文档）。
- 是否说明了兼容性影响与回退方案。
- 是否给出最小验证结果（构建通过、关键流程可复现）。

### 8.3 文档共建触发规则

出现以下情况时，建议同步更新文档：

- `Register.Version` 变更。
- 模块新增或关闭 `EnableMcpServer`。
- EventBus 并发/重试/去重/链路保护策略变更。
- 管理接口鉴权策略、权限策略变更。
- 模块安装、启用、配置流程变更。

## 9. 文档维护约定（建议团队执行）

- 每次模块版本号（Register `Version`）变化时，同步更新本页清单。
- 每次新增 `EnableMcpServer` 模块时，补充安全与路由说明。
- 每次 EventBus 机制变化时，同步更新并发/重试/去重策略说明。
- 每次接口鉴权策略变更时，同步更新鉴权基线章节。

## 10. 版本升级说明

请查看独立页面：

- [版本升级说明](./version-upgrade-notes.md)

---

如需继续深入基础库级别，请回到：

- [Senparc.Ncf.Core](../libs/Senparc.Ncf.Core.md)
- [Senparc.Ncf.XncfBase](../libs/Senparc.Ncf.XncfBase.md)
- [IXncfRegister](../libs/Senparc.Ncf.AreaBase/IxncfRegister.md)
