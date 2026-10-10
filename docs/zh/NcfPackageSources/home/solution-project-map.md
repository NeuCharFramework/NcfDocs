# `NcfPackageSources_Include_NcfSimulatedSite.sln` 项目地图

> 本页按 `NcfPackageSources/src/NcfPackageSources_Include_NcfSimulatedSite.sln`
> 当前项目清单核对。它回答三个问题：项目是什么、第一次运行从哪里开始、二次开发应该改哪里。
> `XNCF` 项目全部列出；带 `.Tests` 的项目只用于验证，不是运行时功能入口。

## 1. 先建立整体认识

这个解决方案不是一个单独的网站，而是由四层组成：

1. **Basic**：NCF 的基础运行时、数据访问和数据库适配器。
2. **Extensions / System**：可安装、可启停、可授权的 XNCF 能力模块。
3. **NcfSimulatedSite**：把基础库和模块组合成可直接运行的 `Senparc.Web`，同时提供 Admin、安装器和示例模块。
4. **Tests / DevelopmentTools**：自动化测试和开发辅助项目。

小白建议按此顺序学习：

1. 先运行 [新手快速上手（60 分钟）](./beginner-quickstart.md)。
2. 再看 [Senparc.Web、Admin 与安装链路](#senparc-web、admin-与安装链路)。
3. 接着阅读 [XNCF 模块总览](#3-xncf-模块总览)。
4. 最后按 [XNCF 二次开发契约](/zh/start/xncf-develop/contracts-and-interfaces.html) 创建自己的模块。

## 2. 基础库与数据库项目

| 项目                                 | 给小白的理解                        | 二次开发入口                                                |
| ------------------------------------ | ----------------------------------- | ----------------------------------------------------------- |
| `Senparc.Ncf.Core`                   | 核心类型、基础配置和公共运行能力    | 从核心服务注册和公共抽象开始扩展                            |
| `Senparc.Ncf.Repository`             | 通用仓储和数据访问抽象              | 用实体、仓储和 Service 组织业务，不要在页面直接写 SQL       |
| `Senparc.Ncf.Service`                | 业务服务层和事务协作基础            | 将业务规则放入 Service/Application 层                       |
| `Senparc.Ncf.Mvc.UI`                 | MVC/Razor 页面与 UI 辅助能力        | 开发 Admin Area 或 XNCF 页面时复用现有 UI 基础              |
| `Senparc.Ncf.Log`                    | NCF 日志抽象与实现                  | 通过既有日志接口记录可排查的业务事件                        |
| `Senparc.Ncf.Utility`                | 文件、字符串、转换等通用工具        | 优先复用工具，避免模块重复实现                              |
| `Senparc.Ncf.SMS`                    | 短信能力抽象                        | 通过 provider 和配置接入短信服务                            |
| `Senparc.Ncf.Shared.Abstractions`    | 独立组件之间共享的轻量契约          | 只放跨项目必须共享的接口和事件                              |
| `Senparc.Ncf.AreaBase`               | Area 和模块化页面的基础设施         | 自定义后台 Area、路由和页面时使用                           |
| `Senparc.Ncf.XncfBase`               | XNCF 注册、生命周期和模块契约的底座 | 自定义 XNCF 的必读项目                                      |
| `Senparc.Ncf.Database`               | 数据库公共抽象和配置                | 通过 DatabasePlant、迁移和 provider 接入数据库              |
| `Senparc.Ncf.Database.Sqlite`        | SQLite 适配器                       | 本地开发、演示和轻量部署的默认选择                          |
| `Senparc.Ncf.Database.SqlServer`     | SQL Server 适配器                   | 生产环境使用 SQL Server 时配置                              |
| `Senparc.Ncf.Database.MySql`         | MySQL 适配器                        | 生产环境使用 MySQL 时配置                                   |
| `Senparc.Ncf.Database.PostgreSQL`    | PostgreSQL 适配器                   | 生产环境使用 PostgreSQL 时配置                              |
| `Senparc.Ncf.Database.Oracle`        | Oracle 适配器                       | 需要 Oracle 时按 provider 配置                              |
| `Senparc.Ncf.Database.Dm`            | 达梦数据库适配器                    | 国产数据库部署场景使用                                      |
| `Senparc.Ncf.Database.InMemory`      | 内存数据库适配器                    | 测试和临时演示使用，不用于持久化生产数据                    |
| `Senparc.Ncf.Database.MySql.Backcup` | MySQL 备份辅助项目                  | 注意项目名中的 `Backcup` 是源码现有拼写，引用时不要自行改名 |
| `Senparc.Ncf.DatabasePlant`          | 数据库迁移、设计和维护基础能力      | 修改实体后按迁移文档生成并验证迁移                          |
| `Senparc.Ncf.FileExtension`          | 文件扩展能力，当前在 `Unpublished`  | 未发布项目，使用前先确认稳定性                              |
| `Senparc.Ncf.ImageUtility`           | 图片处理能力，当前在 `Unpublished`  | 未发布项目，不应作为稳定公共 API 的默认依赖                 |

## 3. XNCF 模块总览

XNCF 是 NCF 的核心扩展方式。一个 `Senparc.Xncf.*` 模块通常拥有自己的注册器、
菜单、权限、数据库、Function 和生命周期。安装后还需要在 Admin 中**启用**，启用
不等于安装；高风险模块必须最小权限运行。

### 3.1 系统基础与 Admin 能力

| XNCF 项目                              | 功能说明                               | 二次开发提示                                          |
| -------------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `[5980]Senparc.Xncf.SystemCore`        | 系统核心数据和运行基础                 | 先理解其注册顺序，再扩展系统模块                      |
| `[5970]Senparc.Xncf.SystemManager`     | 系统配置和管理入口                     | 新增系统设置时复用其权限和配置模式                    |
| `[5960]Senparc.Xncf.SystemPermission`  | 角色、权限和授权控制                   | 新页面、按钮和 Function 都要同步权限                  |
| `[5940]Senparc.Xncf.Menu`              | 菜单、页面和按钮的管理                 | 模块菜单应由 Register/Area 声明，不建议硬编码到宿主   |
| `[5950]Senparc.Xncf.XncfModuleManager` | 发现、安装、更新、启用、禁用和卸载模块 | 排查“菜单不见”先检查模块状态和权限                    |
| `[5955]Senparc.Xncf.AreasBase`         | XNCF Area 的 Web 基础能力              | 自定义后台页面从 AreaBase 和现有 Area 模式入手        |
| `[5990]Senparc.Xncf.Tenant`            | 多租户实现                             | 租户隔离涉及数据、权限和菜单，不能只增加一个 TenantId |
| `[5990]Senparc.Xncf.Tenant.Interface`  | 多租户公共接口和契约                   | 只依赖契约的项目引用此项目，避免依赖实现              |

### 3.2 AI、Agent、RAG 与工作流

| XNCF 项目                                   | 功能说明                                   | 二次开发提示                                           |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `Senparc.Xncf.AIKernel`                     | AI 模型、聊天和向量模型配置基础            | 先配置模型，再让 Prompt、Agent 或知识库调用            |
| `Senparc.Xncf.AIKernel.Abstractions`        | AI Kernel 的公共接口                       | 跨模块集成优先引用抽象项目                             |
| `Senparc.Xncf.PromptRange`                  | Prompt/PromptCode 的管理、版本和调用       | Prompt 是可维护资产，避免散落在代码字符串中            |
| `Senparc.Xncf.PromptRange.Abstractions`     | PromptRange 公共契约                       | Agent 或其他模块只引用需要的接口                       |
| `Senparc.Xncf.AgentsManager`                | Agent、会话、Agent 组、任务和人工介入      | 先配置 AIKernel 与 Prompt，再设计 Agent 工具边界       |
| `Senparc.Xncf.AgentsManager.Abstractions`   | Agent 管理公共契约和事件                   | 跨模块通信使用契约，不直接耦合页面实现                 |
| `Senparc.Xncf.AIAgentsHub`                  | AI Agent 的聚合和管理入口                  | 适合集中发现和编排 Agent，不替代具体 Agent 模块        |
| `Senparc.Xncf.KnowledgeBase`                | 文档导入、切分、向量化和召回测试           | 先配置 embedding 模型；知识库检索不等于训练模型        |
| `Senparc.Xncf.NeuCharWorkflow`              | 可视化服务端工作流、触发器、节点和执行记录 | 通过受控 Function/Agent 编排流程，注意超时、权限和重试 |
| `Senparc.Xncf.NeuCharWorkflow.Abstractions` | 工作流公共接口和模型契约                   | 只需要调用工作流时引用此抽象层                         |

### 3.3 MCP、开发工具与运维

| XNCF 项目                                          | 功能说明                              | 二次开发提示                                          |
| -------------------------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| `Senparc.Xncf.MCP`                                 | MCP 服务和模块工具路由集成            | 仅在确有外部工具需求时启用，并保护 `mcp-*` 路由       |
| `Senparc.Xncf.MCP.Abstractions`                    | MCP 公共接口和契约                    | MCP client/server 集成使用抽象，避免依赖 UI           |
| `Senparc.Xncf.XncfBuilder`                         | XNCF 生成、模块清单和开发辅助         | 新模块优先走模板和生成流程，不复制旧模块的隐含配置    |
| `Senparc.Xncf.XncfBuilder.Abstractions`            | Builder 的公共契约                    | 扩展生成器时引用此项目                                |
| `Senparc.Xncf.XncfBuilder.DynamicContentGenerator` | 根据模板和配置生成动态模块内容        | 修改生成规则后必须验证生成结果和编译                  |
| `Senparc.Xncf.XncfBuilder.Template`                | 官方 XNCF 项目模板                    | 这是新手创建自定义模块的最佳起点                      |
| `Senparc.Xncf.Sandbox`                             | 隔离、可销毁的实验执行环境            | 执行不可信输入时使用隔离环境，先完成 Docker/Wasm 配置 |
| `Senparc.Xncf.DatabaseToolkit`                     | 数据库备份、导出、检查和维护工具      | 生产环境启用前限制 Admin 权限并验证备份恢复           |
| `Senparc.Xncf.Terminal`                            | 管理端命令执行能力                    | 高风险能力，仅限受信任管理员，严禁对公网无保护开放    |
| `Senparc.Xncf.FileManager`                         | 文件管理能力                          | 限制根目录、扩展名和权限，避免越权读写                |
| `Senparc.Xncf.FileManager.Abstractions`            | 文件管理公共契约                      | 其他模块只需要文件服务时引用它                        |
| `Senparc.Xncf.FirmwareUpdate`                      | NCF 包和版本更新源镜像                | 发布包要校验来源、完整性和权限                        |
| `Senparc.Xncf.DesktopBridge`                       | Host 与授权桌面端之间的 HTTP/SSE 桥接 | 配对令牌是应用密钥，仍需 TLS、网络控制和 Admin 授权   |
| `Senparc.Xncf.Swagger`                             | Swagger/OpenAPI 文档和调试入口        | 生产环境注意隐藏敏感接口和模型信息                    |
| `Senparc.Xncf.Dapr`                                | Dapr 微服务集成                       | 先掌握单体运行，再按配置启用 sidecar 和服务调用       |
| `Senparc.Xncf.DynamicData`                         | 动态数据能力（当前仍在演进）          | 先确认字段、权限和迁移策略再用于业务数据              |
| `Senparc.Xncf.Application`                         | 受控调用外部程序的能力                | 明确宿主权限、超时、日志和失败回滚后再启用            |
| `Senparc.Xncf.SenMapic`                            | SenMapic 爬虫/采集示例模块            | 仅采集有权限的数据，并遵守目标站点规则                |
| `Senparc.Xncf.WeixinManager`                       | 微信账号、消息和相关能力管理          | 先配置 AppId/密钥、回调和权限，再接入业务             |

## 4. `Senparc.Web`、Admin 与安装链路

### 4.1 运行时项目

| 项目                                      | 作用                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `Senparc.Web`                             | 模拟宿主站点；组合 NCF 基础库、XNCF、Admin 和配置，是本解决方案的运行入口 |
| `Senparc.Areas.Admin`                     | 后台管理 Area；提供登录后看到的 Admin 页面、管理交互、Chat/指标等管理能力 |
| `Senparc.Xncf.Installer`                  | 首次运行安装器；创建初始配置、数据库和默认模块                            |
| `Senparc.Xncf.Accounts`                   | 管理员/账号相关功能和登录配合                                             |
| `Senparc.Aspire.ServiceDefaults`          | Aspire 宿主的健康检查、服务默认配置和观测基础                             |
| `Senparc.Web.DatabasePlant`               | DatabasePlant 的 Web 开发/验证宿主                                        |
| `Senparc.IntegrationSample`               | 集成示例，帮助理解模块组合和调用方式                                      |
| `Template_OrgName.Xncf.Template_XncfName` | 模板生成后的示例 XNCF；可用来对照完整模块结构                             |

启动宿主：

```bash
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj --launch-profile http
```

第一次启动按安装器完成初始化，再到 `/Admin/Login` 登录。后台的“Extension
Modules/模块管理”由 `XncfModuleManager` 提供；安装模块后还要启用模块，菜单和
Function 才会进入可用状态。Admin 的角色、菜单和按钮权限由 SystemPermission 与
Menu 等系统 XNCF 协作完成。

### 4.2 二次开发时的边界

- 不要把业务代码直接写进 `Senparc.Web`；新业务优先创建独立 XNCF。
- Admin 只负责管理体验和系统入口；业务数据、迁移、Function 放在所属模块。
- 修改宿主启动、依赖注入或全局中间件时，必须同时验证安装器、Admin 登录和模块扫描。
- 修改 Admin 菜单后，同时检查角色授权；“菜单存在”不代表普通角色有权限。

## 5. 测试项目与如何使用

以下项目用于回归验证，不会单独提供网站功能：

- 基础库：`Senparc.Ncf.Core.Tests`、`Senparc.Ncf.XncfBase.Tests`、
  `Senparc.Ncf.DatabasePlant.Tests`、`Senparc.Ncf.DatabaseTests`、
  `Senparc.Ncf.ServiceTests`、`Senparc.Ncf.UnitTestExtension`。
- XNCF：`Senparc.Xncf.XncfBuilder.Tests`、`Senparc.Xncf.PromptRange.Tests`、
  `Senparc.Xncf.AIAgentsHub.Tests`、`Senparc.Xncf.AgentsManagerTests`、
  `Senparc.Xncf.DynamicDataTests`、`Senparc.Xncf.SenMapicTests`、
  `Senparc.Xncf.WeixinManager.Tests`。
- 集成与宿主：`Senparc.IntegrationSample.AreaTests`、`Senparc.Areas.Admin.Tests`。

改动模块后，先运行对应测试，再用 `Senparc.Web` 做一次安装、登录、启用模块和
关键页面验证：

```bash
dotnet test src/NcfPackageSources_Include_NcfSimulatedSite.sln --no-restore
```

## 6. 快速选择表

| 你的目标       | 从哪里开始                                                 |
| -------------- | ---------------------------------------------------------- |
| 只想跑起来     | [新手快速上手](./beginner-quickstart.md) → `Senparc.Web`   |
| 增加后台功能   | `XncfBuilder.Template` → `XncfBase` → Area/Menu/Permission |
| 增加 AI 对话   | `AIKernel` → `PromptRange` → `AgentsManager`               |
| 做知识库问答   | `AIKernel` → `KnowledgeBase` → Agent/Workflow              |
| 接入外部工具   | `MCP` → `[FunctionRender]` → 权限和路由保护                |
| 做多步骤自动化 | `AgentsManager` → `NeuCharWorkflow`                        |
| 修改数据库     | `Ncf.Database`/provider → `DatabasePlant` → 模块迁移       |
| 调试 Admin     | `Senparc.Web` → `Senparc.Areas.Admin` → System XNCF        |
