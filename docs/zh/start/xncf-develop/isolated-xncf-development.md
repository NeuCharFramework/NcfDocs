# 安全地创建、测试并合入 XNCF 模块

本文是 `Senparc.Xncf.XncfBuilder` 隔离 XNCF 开发流程的**使用说明**，面向
Template 使用者、运维人员和评审者；不需要阅读实现源码即可安全使用。

希望研究状态机、关键方法和扩展边界的源码开发者，请阅读
[XncfBuilder 隔离开发源码剖析](/zh/NcfPackageSources/xncf/xncfbuilder-isolated-development.html)。

## 这个流程解决什么问题

传统的“生成 XNCF”会直接写入所选解决方案。对于受信任开发者的明确本地操作，这完全合适；但 AI 生成代码或实验性代码不应直接进入目标源码。

隔离流程将顺序改为：

```text
源码快照 -> 隔离模块生成/修改 -> 结构校验
-> Sandbox 构建与预览 -> 人工评审 -> 显式合入
```

直到最后的人工确认前，目标工作区不会被修改。Sandbox 预览是独立、可回收的容器进程，**不是**向当前 NCF 网站热加载模块。

::: warning 合入后的动作
合入后仍应走正常的代码审查、数据库迁移、构建、部署和重启流程。主
`Senparc.Web` 进程不会被 Sandbox 预览自动替换。
:::

## 适用范围

以下条件同时满足时使用本流程：

- 有受信任且可写的源码工作区和 `.sln` 文件；
- 解决方案中包含 `Senparc.Web/Senparc.Web.csproj`，其源码
  `ProjectReference` 闭包位于同一工作区/仓库内；
- 希望通过 AI 或其他不受信任/生成式代码创建新模块或修改已有模块。

它不能修改纯 DLL 安装包。编译版部署没有可快照、可评审、可合入的源码树；应先在源码工作区完成创建和测试，再按常规 NuGet/部署流程发布。

## 前置条件

1. 已安装并启用 `Senparc.Xncf.XncfBuilder`。
2. 新建模块时，需要本机已安装且经过组织认可的 XNCF 模板。检查命令：

   ```bash
   dotnet new list XNCF
   ```

   若列表中没有模板且组织允许，可从认可的 NuGet 源安装：

   ```bash
   dotnet new install Senparc.Xncf.XncfBuilder.Template
   ```

   隔离流程不会自行下载或安装模板。
3. 手动执行 XncfBuilder 数据库迁移，创建 `XncfBuilderXncfDevelopmentJob`。
   本流程没有内存降级模式：表不存在时不会创建快照，也不会改动任何源码；监控页会提示持久化未就绪并退避检查。
4. 如需 Sandbox 预览，安装并启用 `Senparc.Xncf.Sandbox`，准备 Docker，并按
   [Sandbox 环境准备](/zh/NcfPackageSources/xncf/sandbox-environment.html#ncf-xncf-预览工作负载)
   配置固定的 `ncf-preview` 镜像。
5. 预览宿主必须在 NCF/路由中间件之前支持 `NCF_XNCF_PREVIEW_PATH_BASE` 环境变量。
   模拟 `Senparc.Web` 已包含该 opt-in；自定义宿主必须补充等价的 `UsePathBase` 小段代码后才能使用 Sandbox 预览。

## 安全操作步骤

### 1. 创建隔离开发任务

从 XncfBuilder 的 Function 页面，或从有权调用 XncfBuilder Function 的 Admin Chat，调用“**创建隔离 XNCF 开发任务**”。

选择一种模式：

| 模式 | 适用场景 | 结果 |
| --- | --- | --- |
| `CreateNew` | 模块尚不存在 | 仅在隔离工作区中使用本机已安装的 `XNCF` 模板生成模块。 |
| `ModifyExisting` | 已有源码模块 | 把现有模块复制到隔离工作区；原模块不会被修改。 |

填写目标 `.sln`、完整模块项目名、需求描述和模板选项。新模块名通常为
`Organization.Xncf.ModuleName`。

### 2. 让助手只操作隔离模块

暴露给助手的 Function 被刻意限制为：

1. 读取隔离 XNCF 文件（返回 SHA-256）；
2. 写入隔离 XNCF 文件（可带读取时的 SHA-256）；
3. 校验隔离 XNCF 开发任务；
4. 启动 Sandbox XNCF 预览；
5. 查询状态、请求人工合入或丢弃任务。

助手只能写模块的代码、页面、脚本、样式、资源、JSON 和 Markdown；不能修改项目文件、包、MSBuild Target、NuGet 设置、应用配置或模块目录外的文件。

### 3. 校验并预览

“**校验**”会确认隔离的 `Senparc.Web` 直接引用模块源码，并生成受控差异摘要。它是结构校验；还原、发布和宿主启动只会在 Sandbox 中进行。

随后调用“**启动 Sandbox XNCF 预览**”。
`Admin/XncfBuilder/PreviewMonitor` 会显示：

- 目标和隔离解决方案路径；
- 模块差异及 SHA-256 指纹；
- Sandbox 会话和经鉴权的预览链接；
- 评审、审批、已合入、已丢弃或失败状态。

请从监控页链接测试预览。不要直接暴露容器端口：宿主代理要求 Admin 会话，且不会把 Cookie 或 Authorization 头转发给预览进程。

### 4. 请求并执行人工合入

助手可以请求审批，但不能合入代码。评审者必须在监控页检查任务后，准确输入：

```text
APPLY <完整模块项目名>
```

例如：

```text
APPLY Contoso.Xncf.Inventory
```

如果目标指纹已变化、模块项目文件被改动、新模块目录重名或路径不安全，合入会被拒绝。已有模块只会合入允许的模块文件；新模块先进入暂存目录，再更新解决方案和 `Senparc.Web` 引用，并保留回滚备份。

### 5. 按常规流程完成发布

审查 Git diff，按正常流程创建/应用模块数据库迁移、构建、部署，并在准备好时重启生产宿主。若实验不被接受，使用“**丢弃**”：它会请求回收 Sandbox 和临时工作区，不会修改目标源码。

## 受保护的边界

- 快照会排除 `.git`、IDE 目录、构建产物、packages、`App_Data`、应用配置、`.env`、NuGet 配置、常见证书/密钥格式和符号链接。
- 源码快照和 Sandbox 副本均限制为 768 MB。
- 在复制源码或执行模板命令前，任务意图会先写入数据库，确保有审计记录。
- AI 工具面不包含旧的直接生成、直接预览、停止预览和生成 Migration Function。
- AI 请求既不能获得任意 Shell，也不会把生产源码工作区挂载进 Docker。

## 排障

| 现象 | 优先检查 |
| --- | --- |
| 开发任务持久化未就绪 | 执行 XncfBuilder 数据库迁移；成功前不要反复创建任务。 |
| 找不到 `XNCF` 模板 | 安装组织认可的本机模板；任务不会自动安装。 |
| 宿主项目引用校验失败 | 确认隔离解决方案中的 `Senparc.Web.csproj` 直接引用模块项目。 |
| Sandbox 预览拒绝启动 | 检查 Sandbox 启用状态、Docker、固定镜像 digest 和宿主 path-base opt-in。 |
| 预览还原失败 | 保持无网络，并在认可镜像中预置/缓存依赖；或使用专用包镜像 Docker 网络。 |
| 目标已变化导致拒绝合入 | 从当前目标源码重新创建任务，不能覆盖更新后的工作区。 |

## 关联文档

- [创建第一个 Xncf 模块](./create-xncf.md)：受信任本地环境中的直接生成。
- [Sandbox 环境准备](/zh/NcfPackageSources/xncf/sandbox-environment.html)：Docker 和预览镜像准备。
- [XNCF 模块文档地图](/zh/NcfPackageSources/xncf/module-documentation-map.html)：模块使用说明与源码剖析的边界。
