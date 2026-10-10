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

- 文档基线提交：`eca233bea`（2026-09-06，Developer-MAF-V3）
- 对应能力文档：
  - [NcfPackageSources 源码指南](./index.md)
  - [NCF 核心能力详解](./capability-guide.md)
  - [新手快速上手（60 分钟）](./beginner-quickstart.md)

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

### 2026-09-20（Developer-MAF-V3-Spark）

- **影响模块**：`Senparc.Ncf.XncfBase`（XncfDatabaseDbContext）、`Senparc.Xncf.Tenant`、`Senparc.Areas.Admin`（登录 / 租户管理 / AdminChat）、`Senparc.Web`（站点宿主）
- **变更类型**：行为变更（多租户开启时）/ 新增 / 缺陷修复
- **关键变更**：
  - **XNCF 数据库多租户引擎**：`XncfDatabaseDbContext.SetGlobalQuery` 与 `SenparcEntitiesDbContextBase` 对齐——开启多租户后，实现 `IMultiTenancy` 且未实现 `IIgnoreMulitTenant` 的实体自动追加 `TenantId == 当前请求租户Id` 全局查询过滤器（与软删除过滤叠加）；`SaveChanges`/`SaveChangesAsync` 自动为新增实体写入当前 `TenantId`。**单租户模式（默认，`EnableMultiTenant: false`）仅保留软删除过滤，行为与旧版本完全一致。**
  - **缺陷修复（TenantInfo 映射）**：恢复 `TenantInfo` 模型上的 `[NotMapped] new string TenantId` 遮蔽属性。`TenantInfos` 表（租户注册表）按设计不存储 TenantId 列，若移除该遮蔽，EF Core 会将基类 `int TenantId` 映射到不存在的列，导致所有租户查询在运行时失败。
  - **JWT 登录租户解析**：`AdminUserInfoService.LoginAsync` 现与 Cookie 登录一致——开启多租户且登录传入 `TenantKey` 时，先解析租户并 `SetTenantInfo` 设置租户上下文，再查询管理员账号（此前查询先于租户解析，`LoginInput` 规则下查不到该租户账号）；解析出的 `TenantKey` 写入 JWT Claim，`LoginInput` 规则在 JWT（桌面/后端）场景同样生效。租户不存在/停用返回与“账号或密码错误”一致的提示。
  - **租户管理页**（`/Admin/TenantInfo`）：新增「管理员数」列（每租户管理员账号数）；新增受保护删除接口 `OnPostDeleteAsync`：不能删除当前使用的租户、必须保留至少一个启用租户、租户下仍有管理员账号时禁止删除（防孤儿账号），失败返回本地化具体原因。
  - **AdminChat 按账号隔离**：会话/消息列表、详情、发送、归档、删除、反馈与 Harness Trajectory 全部接口按登录管理员做归属校验，跨账号访问返回“会话不存在或无权限”；消息反馈增加防御性归属校验。超级管理员（`administrator` 角色）新增「用量统计」面板：各账号会话数（总数/活跃/归档/删除）、消息数、最后活跃时间，仅数量、不含内容；多租户开启时统计受租户过滤器约束。
- **升级操作**：
  - 拉取最新代码，重新执行 `dotnet restore` / `dotnet build`（见 [NcfPackageSources 源码指南](./index.md)）。
  - **无新增数据库迁移**（全部使用既有 `TenantId` 列）；升级前建议备份数据库。
  - 若计划开启多租户：确认各业务表已有 `TenantId` 列；规划存量数据归属（`TenantId = 0` 为系统公共数据，开启后对具体租户不可见，必要时在数据库层面将存量行 `TenantId` 更新为目标租户 Id）；选择 `TenantRule`（`DomainName` / `RequestHeader` / `LoginInput`）。
- **回滚指引**：
  - 单租户部署无需任何操作。多租户部署回滚代码后，`TenantId` 列与已写入值保留，不影响单租户模式（不启用过滤）。
- **验证清单**：
  - 单租户（默认）：登录、各模块查询/写入行为与升级前一致（软删除过滤不变）。
  - 多租户 + `LoginInput`：登录页输入租户名后可登录该租户账号；JWT 登录传 `TenantKey` 可正常取回 Token 且 Claim 含 `TenantKey`；错误租户名返回通用“账号或密码错误”。
  - 多租户 + `DomainName`/`RequestHeader`：不同域名/请求头解析到不同租户，各自数据互不可见；新增实体自动带当前 `TenantId`。
  - 租户管理页：「管理员数」列数值正确；删除当前租户/最后一个启用租户/仍有账号的租户时分别被拒绝并给出对应提示。
  - AdminChat：账号 A 无法访问账号 B 的会话（列表不可见、直链访问返回“不存在或无权限”）；超级管理员「用量统计」面板仅展示各账号数量与最后活跃时间，无内容字段。
  - `Senparc.Areas.Admin` 单元测试 166 个用例全部通过（含新增 `AdminChatAccountIsolationTests`）。

### 2026-09-19（Developer-MAF-V3-Spark）

- **影响模块**：`Senparc.Xncf.Sandbox`、`Senparc.Xncf.Sandbox.Abstractions`
- **变更类型**：新增 / 变更
- **关键变更**：
  - **JupyterLab 外部控制**：新增可被 AI 调用的「创建 Notebook」（`LabCreateNotebook`）Function，在运行中的 Lab 工作区写入 nbformat-4 的 `.ipynb` 文件，支持 Python 与 C#（dotnet-interactive，内核 `C# .NET SDK`）。Notebook 源码使用 Jupyter 百分号文件约定（`# %%` 分隔代码单元格、`# %% [markdown]` 标记 Markdown 单元格；可选标题生成首个 Markdown 标题单元格）。既有「执行 Lab 命令」Function 新增可选 `StdinContent` 参数（最多 32 KB），经 `docker exec -i` 执行，可向容器内终端程序 / REPL 批量提交指令。
  - **创建容器时可选附加端口映射**：JupyterLab 沙箱（`jupyter-python` / `jupyter-csharp`）创建时接受可选 `ExtraPortMappings` 字符串（最多 8 条，`;` 或 `,` 分隔）：`3000`（自动分配 loopback 宿主端口）、`9000:3000`（指定 loopback 宿主端口）、`*:3000`（自动分配 `0.0.0.0` 宿主端口）、`*:9000:3000`（指定 `0.0.0.0` 宿主端口）。默认仅绑定 loopback，`0.0.0.0` 外部暴露为显式可选。非法条目 / 超范围端口 / 重复宿主端口在创建时即被拒绝。NCF 预览工作负载不变，保持加固状态。
  - **会话别名**：会话支持可选显示别名（≤ 128 字符），创建时可设置，之后可随时经新增「修改别名」（`UpdateAlias`）Function 修改或清除；管理端会话列表新增别名与附加端口两列，并支持行内重命名对话框。
  - **配额提升**：每用户并发会话 2 → 10；全局并发会话 20 → 50。
  - **持久化**：新增两个可空列 `SandboxSession.Alias` 与 `SandboxSession.ExtraPorts`，随六个提供方（Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL）的迁移加入。两列均不随容器销毁清除，运行时永不自动清空，仅手动重命名/清除会变更。
- **升级操作**：
  - 拉取最新代码，重新执行 `dotnet restore` / `dotnet build`（见 [NcfPackageSources 源码指南](./index.md)）。
  - 在宿主站点执行 Senparc.Xncf.Sandbox 数据库迁移（`20260918120000_AddAliasAndExtraPorts`）；升级前备份数据库。
- **回滚指引**：
  - 两列均为增量可空列，旧代码会忽略它们。只要不回退迁移即可安全回滚；回退迁移会丢失别名/端口记录。
- **验证清单**：
  - 迁移在所有支持的数据库上成功；存量会话在 `Alias` / `ExtraPorts` 为 null 时继续正常工作。
  - 带 `ExtraPortMappings` 创建 JupyterLab 沙箱时按请求绑定端口（默认 loopback；`*:` 条目可在 `0.0.0.0` 上访问）；非法条目快速失败并给出清晰错误。
  - 「创建 Notebook」为 Python 与 C# 内核均生成合法 `.ipynb`，可在 JupyterLab 中打开，且遵循 `Overwrite` 标记。
  - 带 `StdinContent` 的「执行 Lab 命令」可将输入管道到目标命令（如 REPL），超时行为不变。
  - 别名可在创建时设置、在管理列表重命名与清除；别名列对全部行正常渲染。
  - 单用户最多可持有 10 个并发会话；全局上限为 50。

### 2026-09-18（Developer-MAF-V3-Spark）

- **影响模块**：`Senparc.Areas.Admin`
- **变更类型**：新增
- **关键变更**：
  - **Function 全局 Provit 访问控制（数据库策略）**（Senparc.Areas.Admin）：Function 的全局 Provit（跨模块浮动调用）访问此前仅在代码中约束（`FunctionRenderAttribute`：`AllowGlobalPivot` / `GlobalPivotRoleCodes` / `GlobalPivotPermissionCodes`）。现可为每个 Function 在新表 `ADMIN_NeuCharFunctionProvitAccess`（`ModuleUid + FunctionKey` 唯一）中维护数据库策略，采用 Ontology 风格的「主体–资源–效果」模型：资源 = `(ModuleUid, FunctionKey)`；主体 = 后台管理员用户、角色码与/或权限码（任一命中即放行）；效果 = 继承（0）/ 开放（1）/ 受限（2）/ 禁用（3）。非“继承”策略**覆盖代码属性**——可让代码未声明全局的 Function 出现在全局 Provit，也可禁用代码允许的 Function；“继承”或策略不存在时回退代码基线。
  - **缓存**：全部策略行缓存在 `FullNeuCharFunctionProvitAccessCache`（CO2NET 缓存策略，与 `FullSystemConfigCache` 同范式）；每次写入失效缓存，数据库异常时优雅降级为代码基线。
  - **模块清除韧性**：XNCF 模块卸载时**不会**删除策略行（模块卸载只删除模块自身 DbContext 的表）。策略以“孤儿策略”形式冗余保留，模块重装后自动继续生效；仅管理页的手动清除执行物理删除。
  - **管理页**：NeuCharPivot 菜单下新增「访问控制」页（`/Admin/NeuCharPivot/Access`，仅超级管理员，页面鉴权 `AdminOnly`）。每行完整展示决策上下文——模块/Function 标识、代码基线、当前数据库策略与最终生效策略——支持单条编辑（策略模式、用户/角色/权限选择器、备注）与批量操作：对选中行批量应用 开放 / 受限 / 禁用 / 继承，或批量清除。
  - 数据库迁移已同步六个提供方（Sqlite / SqlServer / MySql / Dm / Oracle / PostgreSQL）；单元测试同步扩展（DB 覆盖语义、受限主体匹配、孤儿保留、绑定规范化）。
- **升级操作**：
  - 拉取最新代码，重新执行 `dotnet restore` / `dotnet build`（见 [NcfPackageSources 源码指南](./index.md)）。
  - 在宿主站点执行 Senparc.Areas.Admin 数据库迁移（新增 `ADMIN_NeuCharFunctionProvitAccess` 表）；升级前备份数据库。
- **回滚指引**：
  - 新表为增量表；未创建策略行时既有行为完全不变。回滚后旧代码只读代码属性，存量策略行会被自然忽略。
- **验证清单**：
  - `ADMIN_NeuCharFunctionProvitAccess` 迁移在所有支持的数据库上成功。
  - 访问控制页列出全部目录 Function 与孤儿策略；代码基线、数据库策略、生效策略三列渲染正确。
  - 对代码受限 Function 保存“开放”策略后，任意登录管理员可经全局 Provit 访问；对代码允许 Function 保存“禁用”策略后，全局 Provit 一律拒绝。
  - “受限”策略仅放行绑定的用户 / 角色 / 权限码（任一命中），未命中任何绑定的账号被拒绝。
  - 卸载模块后其策略行保留（显示为孤儿策略）；重装模块后自动恢复生效。
  - 批量 开放 / 受限 / 禁用 / 继承 / 清除 作用于选中行，列表刷新后计数正确。

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
