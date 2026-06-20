# NcfPackageSources 新手快速上手（60 分钟）

> 适用范围：`NcfPackageSources` 当前版本  
> 文档基线：`NcfPackageSources` `HEAD = 631f16b4`（2026-06-17）

## 1. 这篇文档帮你完成什么

如果你第一次接触 NCF 源码，这篇文档会带你在 60 分钟内完成：

- 拉取并编译 `NcfPackageSources`。
- 启动模拟站点 `Senparc.Web`。
- 完成首装、管理员登录、模块启用。
- 跑通一个最小 AI / RAG 验证链路。
- 知道遇到报错时应该先查哪里。

## 2. 你现在应该具备的条件（检查清单）

| 项目 | 要求 | 如何检查 |
|---|---|---|
| 操作系统 | Windows / macOS / Linux 任一 | - |
| .NET SDK | 建议 8.0（与仓库当前版本一致） | `dotnet --version` |
| Git | 可正常克隆仓库 | `git --version` |
| 可用浏览器 | Chrome / Edge / Safari 任一 | - |
| 本机端口 | `5001`（HTTPS）未被占用 | 启动日志是否出现 `Now listening on` |
| 数据库 | 首次建议默认 SQLite | 无需额外安装 |

如果你还没准备好环境，可先看：

- [开发环境说明](/zh/start/instruction/environment.html)
- [获取 NCF 模板源码](/zh/start/start-develop/get-ncf-template.html)

## 3. 0-10 分钟：拉取源码并确认提交

```bash
git clone https://github.com/NeuCharFramework/NcfPackageSources.git
cd NcfPackageSources
git rev-parse --short HEAD
```

预期结果：

- 提交号输出一串短 SHA（例如 `631f16b4`）。

## 4. 10-20 分钟：还原并编译

```bash
dotnet restore src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet build src/NcfPackageSources_Include_NcfSimulatedSite.sln
```

预期结果：

- `restore` 完成，无阻断错误。
- `build` 结束看到 `Build succeeded.`。

## 5. 20-30 分钟：启动模拟站点

```bash
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj
```

预期结果：

- 日志中出现 `Now listening on`。
- 通常包含 `https://localhost:5001`。

随后浏览器访问：`https://localhost:5001`

首次启动会进入安装流程，这是正常现象。

## 6. 30-40 分钟：完成首装与后台登录

推荐按下面顺序完成：

1. 按安装向导完成初始化。参考：[安装](/zh/start/start-develop/install-app.html)
2. 使用管理员账号登录。参考：[管理员登录](/zh/start/start-develop/admin-login.html)
3. 进入后台，确认左侧菜单加载正常。参考：[管理员后台](/zh/start/start-develop/admin-background.html)

预期结果：

- 能进入后台首页。
- 模块管理菜单可访问。

## 7. 40-50 分钟：启用最小 AI / RAG 模块组合

进入“模块管理”，优先安装并启用以下模块：

- `Senparc.Xncf.AIKernel`
- `Senparc.Xncf.PromptRange`
- `Senparc.Xncf.AgentsManager`
- `Senparc.Xncf.KnowledgeBase`

可选：

- `Senparc.Xncf.MCP`（如果你要验证 MCP 路由）

参考文档：[模块管理](/zh/start/start-develop/admin-module-manage.html)

预期结果：

- 模块状态显示“已安装/启用”（或同等状态描述）。
- 对应后台菜单出现并可进入。

## 8. 50-60 分钟：做一次最小闭环验证

按下面最小动作验证链路是否通畅：

1. 在 `AIKernel` 中配置可用模型（至少 1 个聊天模型，建议再配 1 个向量模型）。
2. 在 `PromptRange` 中新建一条 PromptCode。
3. 在 `KnowledgeBase` 导入一份测试文本并执行向量化。
4. 在 `KnowledgeBase` 的召回测试里输入查询语句，检查是否返回命中文档片段。
5. （可选）在 `AgentsManager` 里创建一个引用 PromptCode 的模板并执行测试。

预期结果：

- 向量化任务可完成。
- 召回测试能返回有效片段。
- Agent 测试不再因“模型未配置”失败。

## 9. 常见问题排查矩阵（先看这里）

| 现象 | 常见原因 | 修复动作 |
|---|---|---|
| `dotnet` 命令不可用 | SDK 未安装或 PATH 未生效 | 安装/修复 .NET SDK 后重开终端，执行 `dotnet --info` |
| `restore` 失败（超时/源不可达） | 网络或 NuGet 源异常 | 检查网络后重试 `dotnet restore`，必要时更换 NuGet 源 |
| `build` 失败（SDK 不匹配） | 本机 SDK 版本过旧 | 升级到 .NET 8 SDK，再执行 `dotnet build` |
| 启动后端口占用 | `5001` 已被其他进程使用 | 修改 `tools/NcfSimulatedSite/Senparc.Web/Properties/launchSettings.json` 端口 |
| 一直停在安装页 | 初装未完成或数据库初始化失败 | 重做安装步骤并检查启动日志异常 |
| 模块安装后菜单不出现 | 模块未启用或权限不足 | 在模块管理确认状态，检查管理员账号权限 |
| Function 数量为 0 | 未使用 `[FunctionRender]` 或扫描未命中 | 检查 AppService 方法标注并重启应用 |
| MCP 路由 404 | 模块未开启 `EnableMcpServer` 或未注册 | 检查模块 Register 配置与启动注册逻辑 |
| AppService 返回 401/403 | 鉴权策略未满足 | 检查登录状态、AdminOnly 策略与 Bearer/Cookie 鉴权 |
| KnowledgeBase 向量化失败 | 未配置可用向量模型 | 回到 AIKernel 补齐 Embedding 配置 |

## 10. 新手排障优先级（按这个顺序查）

1. **模块状态**：先确认模块“已安装 + 已启用”。
2. **Function / MCP 注册**：再查 FunctionRender 和 MCP 是否被扫描注册。
3. **鉴权与日志**：最后查 401/403、策略配置和日志细节。

按这个顺序通常能最快定位问题，不会在日志细节里迷路。

## 11. 新手高频误区

- 误区 1：仍然通过 `IXncfRegister.Functions` 理解 Function 注册。  
  当前主机制是 `AppService` 上的 `[FunctionRender]`。

- 误区 2：模块“安装”后就当作“可用”。  
  生产中常见还需要“启用 + 权限放行 + 配置完成”。

- 误区 3：直接上来调日志。  
  没先检查模块状态和配置，日志很容易越看越乱。

- 误区 4：AI 模块报错先怀疑代码。  
  很多时候是模型、密钥、配额或网络配置问题。

## 12. 下一步路线图（按角色）

- 初学者：
  [NcfPackageSources 总览](/zh/NcfPackageSources/home/index.html) ->
  [NCF 核心能力详解](/zh/NcfPackageSources/home/capability-guide.html) ->
  [NCF 常见问题](/zh/start/qa/common_problem.html)

- 模块开发者：
  [XNCF 开发总览](/zh/start/xncf-develop/about-xncf.html) ->
  [开发 XNCF](/zh/start/xncf-develop/dev-xncf.html) ->
  [核心接口 IXncfRegister](/zh/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister.html)

- AI 应用开发者：
  [NCF 核心能力详解](/zh/NcfPackageSources/home/capability-guide.html) ->
  [MCP 模块文档](/zh/MCP/home/index.html) ->
  `AIKernel / PromptRange / AgentsManager / KnowledgeBase` 对应模块页

- 运维与发布人员：
  [DatabasePlant 文档](/zh/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant.html) ->
  [部署文档（Windows）](/zh/Deploy/windows/ncf-website.html) /
  [部署文档（Docker）](/zh/Deploy/docker/ncf-website.html)

## 13. 开源协作入口（遇到问题后下一步）

- 框架通用问题（模板、安装、升级）：优先在 `NCF` 仓库提 Issue。  
  https://github.com/NeuCharFramework/NCF/issues

- 核心包源码问题（基础库、模块机制、注册流程）：在 `NcfPackageSources` 提 Issue / PR。  
  https://github.com/NeuCharFramework/NcfPackageSources/issues

提问建议（能大幅提升回复效率）：

1. 说明你使用的提交号（或发布标签）。
2. 附上最小复现步骤（3-8 步为宜）。
3. 附关键日志片段（脱敏后）。
4. 明确“期望结果 vs 实际结果”。
