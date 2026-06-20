# NcfPackageSources 源码指南

> 本页面面向“要读源码、改源码、扩模块、做开源协作”的开发者。  
> 文档基线：`NcfPackageSources` 当前版本代码，`HEAD = 631f16b4`（2026-06-17）。

## 新手先看（建议 3 步）

1. 先完成：[新手快速上手（60 分钟）](./beginner-quickstart.md)
2. 再进入：[NCF 核心能力详解](./capability-guide.md)
3. 补齐模块化认知：[XNCF 扩展库说明（Senparc.Xncf.xxx）](./xncf-extension-modules.md)

## 你可以从这份文档得到什么

- 快速理解 `NcfPackageSources` 在 NCF 体系中的定位和边界。
- 直接定位“基础库 vs 系统模块 vs AI 模块 vs 运维模块”的源码入口。
- 按场景落地（AI/RAG、模块安装管理、多数据库、MCP、发布运维）。
- 获取从“首次跑通”到“参与开源共建”的连续路径。

## 1. 仓库在 NCF 体系中的定位

`NcfPackageSources` 不是业务站点模板本身，而是 **NCF 官方核心包源码仓库**。它主要承担三层职责：

- `src/Basic`：基础运行时能力（Core、XncfBase、Repository、Service、Database* 等）。
- `src/Extensions`：可安装扩展模块（系统模块、AI 模块、开发工具模块、运维模块等）。
- `tools/NcfSimulatedSite`：用于集成联调和模块验证的模拟站点（含 `Senparc.Web`、后台 Area、Installer 等）。

## 2. 最常用的源码工作流

### 2.1 获取与编译

```bash
git clone https://github.com/NeuCharFramework/NcfPackageSources.git
cd NcfPackageSources

dotnet restore src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet build src/NcfPackageSources_Include_NcfSimulatedSite.sln
```

### 2.2 本地运行（模拟站点）

```bash
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj
```

### 2.3 代码验证建议

- 新增/调整模块安装逻辑：优先验证 `InstallOrUpdateAsync()` 与 `UninstallAsync()`。
- 涉及数据库：优先走模块自己的 `XncfDatabaseDbContext` 与迁移链路。
- 涉及 Function/MCP：同时验证后台执行入口与自动扫描注册结果。

如果你是第一次跑源码，建议先按这份路线：

- [新手快速上手（60 分钟）](./beginner-quickstart.md)

## 3. 模块加载与注册机制（必须掌握）

### 3.1 扫描与注册入口

- 核心入口：`Senparc.Ncf.XncfBase.Register.StartNcfEngine(...)`
- Web 场景入口：`Senparc.Xncf.AreasBase.AreaRegister.StartWebEngine(...)`
- 扫描对象：
  - `IXncfRegister`（模块注册器）
  - `XncfAutoConfigurationMappingAttribute`（自动映射配置）
  - `AppServiceBase` 子类中的 `[FunctionRender]` 方法

### 3.2 加载顺序

通过 `[XncfOrder(x)]` 控制优先级（降序），典型约定：

- `59xx`：系统底层基础模块
- `58xx`：AI 相关基础模块
- `0` 或未设置：默认顺序

### 3.3 Function 注册（当前机制）

- 当前推荐：在 `AppService` 方法上标注 `[FunctionRender(...)]`。
- 扫描后进入 `Register.FunctionRenderCollection`。
- 工程实践中，优先按 `[FunctionRender]` 路径进行注册与排查。

### 3.4 MCP 注册（当前机制）

- 模块通过 `EnableMcpServer => true` 声明启用。
- `XncfRegisterBase.AddMcpServer()` 负责注册服务。
- `XncfRegisterBase.UseMcpServer()` 会按模块自动映射 `mcp-<module-name>` 路由。

## 4. 核心能力聚焦（给业务开发者）

当前版本可以重点关注以下能力组合：

- **AI 基础能力层**：`Senparc.Xncf.AIKernel`
- **提示词工程层**：`Senparc.Xncf.PromptRange`
- **智能体编排层**：`Senparc.Xncf.AgentsManager`
- **知识库/RAG 基础层**：`Senparc.Xncf.KnowledgeBase`
- **模块生成与模块清单治理**：`Senparc.Xncf.XncfBuilder`
- **MCP 管理与接入**：`Senparc.Xncf.MCP`
- **数据库运维工具**：`Senparc.Xncf.DatabaseToolkit`
- **安装包镜像/发布保障**：`Senparc.Xncf.FirmwareUpdate`

详细模块清单、版本、排序和实战路径请看：

- [NCF 核心能力详解](./capability-guide.md)

## 5. XNCF 扩展库入口（单粒度模块）

你当前看到的“NCF 基础库”是底座能力；`Senparc.Xncf.xxx` 则是业务能力模块本体。  
在 NCF 中，每个 XNCF 都应视作一个可治理的“单粒度模块”：可安装、可启停、可扩展、可审计。

建议优先阅读：

- [XNCF 扩展库说明（Senparc.Xncf.xxx）](./xncf-extension-modules.md)

## 6. 新手排障优先级（摘要）

排障顺序建议固定为：

1. 先看模块状态（是否安装、启用、可见）。
2. 再看 Function/MCP 注册（是否扫描命中）。
3. 最后看鉴权和日志（401/403、策略、异常堆栈）。

完整排错矩阵与操作命令见：

- [新手快速上手（60 分钟）](./beginner-quickstart.md)

## 7. 基础库入口（按职责）

- [Senparc.Ncf.Core](../libs/Senparc.Ncf.Core.md)
- [Senparc.Ncf.Repository](../libs/Senparc.Ncf.Repository.md)
- [Senparc.Ncf.Service](../libs/Senparc.Ncf.Service.md)
- [Senparc.Ncf.SMS](../libs/Senparc.Ncf.SMS.md)
- [Senparc.Ncf.Mvc.UI](../libs/Senparc.Ncf.Mvc.UI.md)
- [Senparc.Ncf.Log](../libs/Senparc.Ncf.Log.md)
- [Senparc.Ncf.Utility](../libs/Senparc.Ncf.Utility.md)
- [Senparc.Ncf.XncfBase](../libs/Senparc.Ncf.XncfBase.md)
- [Senparc.Ncf.AreaBase](../libs/Senparc.Ncf.AreaBase.md)
- [Senparc.Ncf.DatabasePlant](../libs/Senparc.Ncf.DatabasePlant.md)
- [Senparc.Ncf.Database](../libs/Senparc.Ncf.Database.md)
- [IXncfRegister（关键接口）](../libs/Senparc.Ncf.AreaBase/IxncfRegister.md)

## 8. 开源参与入口（Issue / PR / 讨论建议）

### 8.1 入口选择

- 模板、安装、部署、版本升级问题：优先 `NCF` 仓库 Issue。  
  https://github.com/NeuCharFramework/NCF/issues

- 基础库机制、模块注册、源码行为问题：`NcfPackageSources` 仓库 Issue / PR。  
  https://github.com/NeuCharFramework/NcfPackageSources/issues

### 8.2 提问建议（提高回复效率）

1. 给出提交号（或发布标签），不要只说“最新版”。
2. 给出最小复现步骤（建议 3-8 步）。
3. 给出关键日志（先脱敏）。
4. 明确“期望结果 vs 实际结果”。

### 8.3 PR 建议（最小可评审单元）

- 一个 PR 只解决一类问题。
- 先补文档，再补实现，最后补验证说明。
- 如果涉及行为变化，说明兼容性影响和回退方式。

## 9. 生产环境使用建议（摘要）

- `DatabasePlant` 建议仅用于调试/维护阶段，不建议进入生产发布包。
- `Terminal`、`DatabaseToolkit`、`ChangeNamespace` 等高权限模块应严格控制开放范围。
- AI 模块上线前，必须先完成模型配置、鉴权策略、配额和日志审计链路。
- 对外开放 MCP 前，请先完成路由、鉴权、工具白名单和调用审计设计。

---

如果你要直接开始改源码，下一步建议阅读：

- [NCF 核心能力详解](./capability-guide.md)
- [版本升级说明](./version-upgrade-notes.md)
