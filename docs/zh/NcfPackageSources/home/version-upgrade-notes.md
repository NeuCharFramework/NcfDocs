# 版本升级说明

> 本页记录 `NcfPackageSources` 开发分支的重要升级项。2026-07 章节保留
> 2026-07-27 核对的历史基线；2026-10-02 补充 Repository 与后台租户作用域
> 升级，2026-10-09 补充 AIKernel 本地微调更新。项目版本、Register 版本和
> 已发布 NuGet 版本可能不同，升级时应分别核对。

## AIKernel 本地微调升级（2026-10-09）

当前源码中的 `Senparc.Xncf.AIKernel` 项目版本为 `0.16.4`，配套微调 Worker
版本为 `1.1.0`。这些是源码版本，**不代表相应 NuGet 包已公开发布**。

- AIKernel 新增仅限管理员访问的本地微调控制台，由独立且经过鉴权的 Python
  Worker 执行训练。训练默认关闭。Worker 配置保存在数据库；鉴权密钥应放在
  宿主安全配置中，不应保存在数据库或交给浏览器。
- Worker 通过 PyTorch/PEFT 支持 CPU/CUDA 训练，通过 MLX 支持 Apple 芯片原生
  训练。实际可用的后端和方法以 Worker 能力预检为准。Worker 1.1 新增完整目录
  分页与 SQLite 持久化 `storeId`；旧数组接口仍只返回最近 100 条记录。
- 训练导出 adapter 与 checkpoint，供后续独立评估和部署推理使用；不会自动
  恢复中断任务或发布推理模型。
- 已有 AIKernel 安装需通过模块管理升级，以应用 Worker 配置表迁移。部署匹配
  版本的 Worker，通过密钥存储或环境变量配置密钥，并在预检和真实冒烟测试
  成功后再启用训练。

部署要求、验证步骤和运维限制见 [AIKernel 本地微调指南](../xncf/aikernel-local-fine-tuning.md)。

## Repository 与后台租户作用域升级（2026-10-02）

下表是本轮开发分支源码中的项目版本，**不是公开 NuGet 包发布状态声明**：

| 项目                             | 源码项目版本       |
| -------------------------------- | ------------------ |
| `Senparc.Ncf.Core`               | `0.30.2-preview9`  |
| `Senparc.Ncf.Repository`         | `0.20.10-preview9` |
| `Senparc.Ncf.XncfBase`           | `0.28.1`           |
| `Senparc.Xncf.Tenant`            | `0.15.14`          |
| `Senparc.Xncf.WeixinManager`     | `0.24.11`          |
| `Senparc.Xncf.NeuCharWorkflow`   | `0.4.3`            |
| `Senparc.Xncf.XncfModuleManager` | `0.15.11`          |

### 数据访问边界

- XNCF Service 注入并复用现有 Repository；普通 CRUD 使用 ServiceBase，
  组合筛选、投影和可取消查询使用 `RepositoryBase.GeAll(...)`。
- WeixinClaw 和工作流业务查询不再直接使用 DbContext。普通业务层不复制
  租户或软删除控制，不调用 `IgnoreQueryFilters()`。
- 模块菜单权限通过现有 `SysRolePermissionService` 保存；租户缓存查询复用
  现有 `TenantInfoRepository`。
- 基础仓储新增 `SavePropertiesAsync`。工作流运行状态只保存指定字段，避免
  将运行期间的旧 `GraphJson` 或 `Revision` 覆盖到并发编辑后的定义。
- 安装、迁移、建表、备份等基础设施访问不属于普通业务 CRUD，本次不机械改写。

### 后台租户作用域

- Core 提供 `IBackgroundTenantScopeFactory`；XncfBase 注册工厂，Tenant 模块
  的 `IBackgroundTenantProvider` 复用现有启用租户缓存。
- `ForEachEnabledTenantAsync` 在独立、已初始化的租户作用域中执行回调；
  `TryCreateScopeAsync` 为指定启用租户创建作用域，未找到时返回 `null`。
- 单租户模式使用默认作用域；多租户模式缺少 Provider 或返回无效数据时抛出
  异常，不回退到全局访问。
- WeixinClaw 已移除租户缓存反射和重复上下文设置，并统一处理任务取消、完成
  及资源释放。其他后台实现不会因新增公共入口而自动完成迁移。

### 升级与验证

1. 升级互相兼容的基础库与模块版本，重新编译宿主；不要把源码版本当作已发布
   NuGet 版本。
2. 本轮不需要新增实体或数据库迁移；**重启宿主**以使新的 DI 注册生效。
3. 验证普通请求和后台新作用域中的租户隔离、软删除与业务筛选。
4. 验证租户停用后不再新建其执行作用域，已有账号轮询在扫描后取消；验证单租户
   模式不依赖租户注册表。
5. 验证宿主退出、重复扫描和取消回调中的资源释放无异常或死锁；验证工作流
   运行状态保存不会覆盖新的图定义和修订号。

接口示例与约束见 [多租户配置与后台任务](../../start/config/mutiple-tenant.md)、
[Repository 指南](../libs/Senparc.Ncf.Repository.md) 和
[Service 指南](../libs/Senparc.Ncf.Service.md)。

## 本轮升级摘要（2026-07）

### 1. 运行时升级到 .NET 10

- 模拟站点 `Senparc.Web` 当前目标框架为 `net10.0`。
- 本地 `http` profile 使用 `http://localhost:5000`，`https` profile 使用 `https://localhost:5111`；Docker HTTPS 端口为 `5001`。
- 升级项目时应同步检查 SDK、CI 镜像、Docker 基础镜像和部署主机，不要只修改 `TargetFramework`。

### 2. AI、Prompt 与 Agent 工作流

- `AgentsManager` Register 版本更新为 `0.3.22`。
- MAF/Agent 工作流继续扩展，包含 Prompt 流式输出、聊天归档、待处理任务和批量任务等能力。
- `AIKernel -> PromptRange -> AgentsManager` 是默认安装组合；KnowledgeBase/RAG 仍需按业务需要另行安装和配置。

### 3. 六语言本地化

- 站点、管理后台和安装器资源覆盖 `zh-CN`、`en`、`ja`、`fr`、`es`、`ru`。
- Function 请求参数可使用 `[LocalizedDescription]` 绑定资源键。
- 新增语言时，应同时补齐资源文件、`SupportedCultures`、前端切换入口和回退语言验证。

### 4. XNCF 模板结构调整

- 当前源码中的模板包版本为 `0.13.0`，XncfBuilder 项目版本为 `0.37.0-preview5`。
- 模板 `0.13.0` 增加 `Application/Events` 与 `Application/EventHandlers` 下的
  EventBus 往返示例。
- 新模板把 Function 实现和 DTO 放在 `Application/AppServices` 与 `Application/DTOs`。
- Function 继续通过 `AppServiceBase` 方法上的 `[FunctionRender]` 自动扫描；不要再实现旧的 `IXncfFunction` 或重写 `Register.Functions`。

### 5. 安装器与桌面端

- 首次安装默认选择管理员、PromptRange、XncfBuilder、MCP、AIKernel、AgentsManager 六项。
- 安装器会在写入前显示确认清单，取消确认不会执行安装。
- 桌面端增加动态更新源、下载进度、高 DPI 与 WebView 相关改进。部署私有更新源时，应验证源地址、包完整性、失败回退和已有配置保留。

### 6. MCP 路由与版本边界

- 当前 MCP 项目 NuGet 版本为 `0.4.0-preview3`，而模块 `Register.Version` 仍为 `0.1.0`；两者用途不同。
- 模块声明 `EnableMcpServer => true` 后，框架自动映射 `mcp-<模块全名小写并将点替换为连字符>`。
- MCP 模块的 SSE 地址为 `/mcp-senparc-xncf-mcp/sse`，无需在 `Startup` 中手动重复注册。
- `McpAccessToken` 目前没有在自动映射路径中形成有效校验。对外开放前必须另行实现鉴权、限流、工具白名单和审计。

### 7. 版本升级记录规则

- 版本窗口必须覆盖合并基线后的提交和当前未提交改动。
- 递归检查所有受影响的 `.cs`、`.csproj`、`.props` 及导入者，避免只提升单个项目。
- 每个功能性 `.cs` 修改都需要在当前发布说明区块中有对应记录；已有记录不可重复添加。
- `Register.Version`、程序集/项目版本、模板包版本和公开 NuGet 版本应分别记录。

## 升级动作建议

1. 固定准备升级的提交号或发布标签，不使用“最新版”作为可复现基线。
2. 安装 .NET 10 SDK，并核对 `global.json`、CI 和容器镜像。
3. 升级 NCF/XNCF 包后，按编译错误迁移旧 Function 和旧模板目录。
4. 检查安装器默认项、本地化资源、MCP 外部暴露策略和桌面更新源。
5. 在隔离环境完成数据库迁移，再部署到生产环境。

## 升级后验证清单

- 使用明确的 launch profile 启动站点，并验证 `5000`/`5111` 对应协议。
- 首次安装默认六项正确；确认、取消和重复进入安装流程均符合预期。
- 模块安装、启用、菜单、权限和数据库迁移正常。
- `[FunctionRender]` 方法可发现、可执行，参数本地化文本正确。
- MCP 路由只有一套映射，SSE 地址可连接，外部入口已经过鉴权与限流。
- AI/Prompt/Agent 的流式、归档、待处理和批量任务关键路径可用。
- 六种语言可切换，缺失资源能够安全回退。
- 桌面端更新源、下载进度、升级失败回退和已有用户配置均已验证。
- 日志中没有持续的数据库、模型服务、网络或后台任务错误。

相关文档：

- [NcfPackageSources 源码指南](./index.md)
- [NCF 核心能力源码详解](./capability-guide.md)
- [新手快速上手（60 分钟）](./beginner-quickstart.md)
- [项目关系、同步与发布](./project-relationships.md)
