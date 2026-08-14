# XncfBuilder 隔离开发：源码剖析

> 本文按 2026-08-14 的 `NcfPackageSources` 开发分支核对。
> 这是面向**源码开发者**的说明；如果只需创建、预览、评审和发布模块，请先阅读
> [使用说明](/zh/start/xncf-develop/isolated-xncf-development.html)。

`Senparc.Xncf.XncfBuilder` 有两条明确区分的创建路径：

| 路径 | 入口 | 适用信任级别 |
| --- | --- | --- |
| 直接生成 | `BuildXncfAppService.Build()` | 开发者明确修改受信任源码工作区。 |
| 隔离开发任务 | `XncfDevelopmentJobAppService` | AI 协助、生成式或其他不受信任的模块改动。 |

第二条路径的目标是：系统能够协助创建和测试源码，但在人工批准前绝不写入自己的目标工作区。

## 1. 运行时边界

这不是热加载设计。新程序集可能携带 DI 注册、路由、Razor 视图、迁移、静态资源和后台服务；在主进程中安全地卸载/替换这些内容不是 NCF 支持的生命周期。

因此预览采用独立构建与进程边界：

```text
目标源码解决方案
  -> 清洗快照 -> 隔离工作区
  -> 本机 dotnet new XNCF / 受限编辑 -> 校验 + 差异
  -> 第二次清洗复制 -> Sandbox 工作区
  -> 固定 Docker 命令 -> 独立 Senparc.Web 预览
  -> Admin 鉴权代理 -> 评审者
  -> APPLY <模块名> -> 原子且受保护的合入 -> 目标源码解决方案
```

预览期间主站持续运行且不被修改。任务合入后，目标站仍需要按正常流程构建、部署和重启。

## 2. 服务与持久化地图

| 源码位置 | 职责 | 关键边界 |
| --- | --- | --- |
| `OHS/Local/XncfDevelopmentJobAppService.cs` | 创建、读写、校验、预览、查询、请求审批和丢弃的 FunctionRender 门面 | 特意没有 `ApplyApprovedJobAsync()` 的 FunctionRender。 |
| `Domain/Services/Development/XncfDevelopmentJobService.cs` | 每任务协调器与状态机 | 唯一能够合入的服务，使用每任务锁。 |
| `Domain/Services/Development/XncfDevelopmentJobStateStore.cs` | 基于数据库的任务快照存储 | 复制源码前先持久化；失败不会退化为内存状态。 |
| `Domain/Models/DatabaseModel/XncfDevelopmentJob.cs` | 审计/持久化实体 | 记录所属用户、路径、需求、指纹、校验、预览和审批时间。 |
| `Domain/Services/Workspace/XncfDevelopmentWorkspaceService.cs` | 清洗源码快照和受控模块 Diff | 该服务将目标工作区视为只读。 |
| `Domain/Services/Workspace/XncfWorkspaceFileService.cs` | 安全路径解析、SHA-256 乐观并发、原子写入 | AI 只能访问选定模块和小范围扩展名白名单。 |
| `Areas/Admin/Pages/XncfBuilder/PreviewMonitor.*` | 状态、路径、Diff、Sandbox 链接和带防伪校验的合入/丢弃 UI | 合入要求确认短语；页面状态轮询始终单飞。 |

`XncfDevelopmentJob` 属于 XncfBuilder DbContext，表名为
`XncfBuilderXncfDevelopmentJob`，并对任务 ID、阶段/更新时间、模块/创建时间、所属用户/更新时间建立索引。Migration 的生成与执行仍是运维操作，本功能不会自动生成 Migration。

## 3. 状态机与关键方法

`XncfDevelopmentJobStage` 是可持久化状态契约：

```text
Snapshotting -> ReadyForCode -> Validating -> ReadyForReview
                                      |              |
                                      v              v
                                  Failed       Previewing -> ReadyForReview
                                                       |
                                                       v
                                        AwaitingHumanApproval -> Applied
                                                       |
                                                       v
                                                   Discarded
```

关键方法及其效果如下：

| 方法 | 证明或修改的内容 |
| --- | --- |
| `CreateAsync()` | 先保存任务意图，再快照源码；随后在隔离工作区运行本机 `dotnet new XNCF` 或定位复制后的模块。 |
| `ReadFileAsync()` / `WriteFileAsync()` | 返回文本和 SHA-256；通过期望哈希比较、写穿透临时文件和原子移动写入。 |
| `ValidateAsync()` | 解析项目路径、确认隔离 `Senparc.Web` 直接引用模块、刷新 Diff；不在此处构建宿主。 |
| `StartSandboxPreviewAsync()` | 在任务锁内再次校验引用/Diff，检查 path-base 支持，再委托 `IXncfSandboxPreviewService` 构建/运行。 |
| `RequestMergeApprovalAsync()` | 冻结评审阶段并记录请求；不写入目标源码。 |
| `ApplyApprovedJobAsync()` | 校验精确的 `APPLY <module>`、目标指纹和项目文件不可变性，再进行带回滚的受控复制/暂存。 |
| `DiscardAsync()` | 请求停止 Sandbox、删除临时任务工作区并记录终态。 |

### 3.1 创建模块而不改目标源码

`CreateModuleInWorkspaceAsync()` 运行：

```text
dotnet new XNCF -n <module> -o <workspace/module> --IntegrationToNcf true ...
```

该命令仅使用服务端构造的参数，绝不运行 `dotnet new install`；模板可用性由管理员决定。新项目引用和解决方案条目只会加入隔离副本。

对 `ModifyExisting`，修改前会记录原模块指纹。合入时发现目标指纹改变代表冲突，不能覆盖较新的源码。

### 3.2 快照与文件控制规则

`XncfDevelopmentWorkspaceService.CreateSnapshotAsync()` 根据解决方案和传递性
`ProjectReference` 图计算安全根目录。若找到 Git 根目录，所有项目引用都必须在其中；它拒绝符号链接、限制复制总大小为 768 MB，并排除：

- `.git`、IDE 目录、`bin`、`obj`、`node_modules`、`packages`、`App_Data`；
- `appsettings*`、`.env*`、`nuget.config`、`SenparcConfig.config`；
- `.pfx`、`.key`、`.pem`、`.snk` 文件。

`XncfWorkspaceFileService.ValidateWritableCodeFile()` 仅接受 `.cs`、`.cshtml`、`.razor`、`.js`、`.ts`、`.css`、`.scss`、`.json`、`.md` 和 `.resx`。它拒绝 `.csproj`、`.props`、`.targets`、NuGet 配置、`Directory.Build*` 和应用配置，避免 AI 改写依赖、还原源、MSBuild 行为、密钥或宿主执行路径。

## 4. Sandbox 预览集成

Builder 仅依赖 `Senparc.Xncf.Sandbox.Abstractions` 中的
`IXncfSandboxPreviewService`。`SandboxNcfPreviewWorkloadService` 的实现会在 Docker 启动前创建第二份归 Sandbox 所有的副本；目标源码与 Builder 工作区都不会以生产源码形式挂载进容器。

固定的 `ncf-preview` 工作负载：

- 默认关闭；
- 要求 `Images:Overrides:ncf-preview` 配置不可变的 `@sha256:` digest；
- 不接受调用者的 Shell、Docker socket、host 网络或任意镜像 tag；
- 仅发布 loopback 端口，并使用 `--cap-drop ALL`、`no-new-privileges`、只读根文件系统、`/tmp` tmpfs、CPU/内存/PID 限制；
- 默认 `--network none`；只有运维显式启用专用包镜像网络时才允许指定网络；
- 只执行一段服务端固定序列：还原、发布固定的 `Senparc.Web` 项目，然后在 8080 端口运行。

`SandboxNcfPreviewProxyMiddleware` 仅在通过 Admin Cookie 鉴权后暴露
`/sandbox-preview/{sessionId}/...`。它只代理到 `127.0.0.1`，剥离浏览器 Cookie 与 `Authorization`，并保留生成的 path base。预览宿主读取 `NCF_XNCF_PREVIEW_PATH_BASE`，必须在 NCF/路由管线前调用 `UsePathBase`，以保证跳转和链接停留在代理路径内。

## 5. AI Function 边界

`FunctionRenderAttribute.AllowAiInvocation` 是第二道权限边界：普通 Function 页面仍可展示 Function，而 Admin Chat 仅导入未 opt-out 的 Function；`AdminChatAiService` 和 `ModuleAssistantPlugin` 均执行此过滤。

下列旧版 XncfBuilder 操作禁止被 AI 自动导入：

- 直接 `Build`；
- 直接 `Preview` 与 `StopPreview`；
- `AddMigration`。

隔离任务 Function 才是预期的 AI 工具面。即使如此，合入也不是 Function，不能由工具调用触发。新增 FunctionRender 时必须区分“普通 Function 页面可见”和“可安全自动交给 AI 调用”；宿主级或不可逆操作应设为 `AllowAiInvocation = false`，再提供受限、可审计的流程。

## 6. 合入语义

已有模块合入时会校验原目标指纹，要求工作区模块 `.csproj` 字节级不变，并只复制允许的代码/资源文件；每个文件都有备份与回滚。

新模块合入时会先复制到暂存目录，备份解决方案与 `Senparc.Web.csproj`，再移动模块并运行受控的 `dotnet add reference`、`dotnet sln add`。任何一步失败都会恢复备份并删除目标模块目录。

这只是文件系统操作层的事务保障，不替代 Git 评审。数据库迁移、测试、提交、部署和重启仍属于外部生命周期职责。

## 7. 扩展工作流时的约束

新增任务动作时应遵循：

1. 只有跨进程重启仍需保留的状态才加入任务契约与持久化快照；
2. 源码访问复用现有 workspace 服务，禁止再造路径解析器或任意命令字段；
3. 组合校验、Diff、预览或合入状态时复用每任务锁；
4. 分别决定它是否在普通 Function UI 可见、是否可自动暴露给 AI；
5. 预览运行时输入必须由服务端生成并归 Sandbox 所有；新容器或任意命令需要独立的安全评审。

## 关联阅读

- [使用说明](/zh/start/xncf-develop/isolated-xncf-development.html)
- [Sandbox 环境准备](./sandbox-environment.md)
- [XNCF 模块文档地图](./module-documentation-map.md)
- [XNCF 扩展库导览](../home/xncf-extension-modules.md)
