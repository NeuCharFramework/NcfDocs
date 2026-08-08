# 项目关系、同步与发布

> 本页解释 `NcfPackageSources` 中两个“模拟源”如何进入可发布项目。
> 同步行为以 `tools/NcfSimulatedSiteSyncTool` 当前实现为准。

## 一图看懂

```text
Template_OrgName.Xncf.Template_XncfName（可运行的 XNCF 模板母版）
    │  NcfSimulatedSiteSyncTool：强制单向同步，并替换模板占位符
    ▼
Senparc.Xncf.XncfBuilder.Template/templates/template1（打包内容）
    │  dotnet pack / 发布流水线准备包
    ▼
Senparc.Xncf.XncfBuilder.Template（NuGet 模板包）
    │  dotnet new
    ▼
开发者自己的 XNCF 项目

tools/NcfSimulatedSite（核心包的集成、联调站点）
    │  同一个 NcfSimulatedSiteSyncTool：逐文件 Y / R / N 交互同步
    ▼
NCF/src/back-end（公开 NCF 模板的后端内容）
    │
    ├─ NCF.Template.csproj → Senparc.NCF.Template（NuGet 模板包）
    └─ Senparc.Web → 六个平台的发布压缩包 / GitHub Release 构件
```

这两条链路使用同一个工具，但同步规则不同，不能混为一谈。

## 各项目的角色

| 项目或目录                                                                  | 角色                                                              | 是否直接发布                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| `tools/NcfSimulatedSite/Template_OrgName.Xncf.Template_XncfName`            | 能运行、能联调的 XNCF 模板母版，也是模板内容的源码权威            | 否                                                   |
| `src/Extensions/Senparc.Xncf.XncfBuilder/Senparc.Xncf.XncfBuilder.Template` | NuGet 模板打包项目；实际模板位于 `templates/template1`            | 是，包名 `Senparc.Xncf.XncfBuilder.Template`         |
| `tools/NcfSimulatedSite`                                                    | NCF 基础包与扩展模块的集成验证站点，也是 NCF 后端模板的日常同步源 | 否                                                   |
| `NeuCharFramework/NCF` 的 `src/back-end`                                    | 面向最终用户的公开 NCF 后端模板内容                               | 由 `NCF.Template.csproj` 打入 `Senparc.NCF.Template` |
| `NeuCharFramework/NCF` 的 `Senparc.Web`                                     | NCF 示例/可运行站点的发布入口                                     | CI 生成多平台压缩包和 GitHub Release 构件            |

## 同步工具和命令

工具项目：

```text
tools/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool/
  NcfSimulatedSiteSyncTool.csproj
```

只同步 XNCF 模板：

```bash
dotnet run --project tools/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool.csproj -- --template-only
```

先同步 XNCF 模板，再同步完整模拟站点与 NCF 仓库：

```bash
dotnet run --project tools/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool.csproj
```

工具按当前仓库布局查找同级的 `NCF` 仓库，并把目标定位到
`NCF/src/back-end`。移动目录或只检出一个仓库时，应先确认工具输出的源、目标
绝对路径，不要直接确认覆盖。

## XNCF 模板：强制单向同步

模板同步方向固定为：

```text
NcfSimulatedSite/Template_OrgName.Xncf.Template_XncfName
    → Senparc.Xncf.XncfBuilder.Template/templates/template1
```

- 目标中不同的文件会被源文件直接覆盖，不出现逐文件确认。
- 同步时忽略隐藏文件、`bin`、`obj`、`.vs`、`.user` 和 `.DS_Store`。
- `Register.cs` 中的示例 `Uid` 会转换为 `Template_Guid`，示例模块版本会转换为
  `Template_Version`，供 `dotnet new` 替换。
- 应先修改并验证模拟站点中的模板母版，再运行同步工具；不要把打包目录当作
  独立维护的第二份源码。

### 发布方式

`Template_OrgName.Xncf.Template_XncfName` 不单独发布。同步后的
`Senparc.Xncf.XncfBuilder.Template` 项目通过 `dotnet pack` 生成
`Senparc.Xncf.XncfBuilder.Template` NuGet 包，再发布到 NuGet。

当前 NcfPackageSources 流水线会发现并推送已经生成的 `Senparc.Ncf.*` 和
`Senparc.Xncf.*` 包，但主构建解决方案不包含这个 Template 项目。因此发布维护者
仍需确保在包发现步骤之前显式构建或打包该项目。`GeneratePackageOnBuild` 不代表
当前主流水线一定会自动产出这个模板包。

## 模拟站点与 NCF：交互式同步

普通站点同步的默认方向是：

```text
NcfPackageSources/tools/NcfSimulatedSite → NCF/src/back-end
```

当同路径文件内容不同时，工具逐文件询问：

- `Y`：以 `NcfSimulatedSite` 文件覆盖 `NCF/src/back-end`；
- `R`：反向以 `NCF/src/back-end` 文件覆盖 `NcfSimulatedSite`；
- `N`：跳过这个差异。

因此它是“默认以模拟站点为源、允许人工反向选择”的交互式同步，不是模板同步
那样的强制单向镜像。工具还会排除构建产物、日志、`.git`、站点专用解决方案和
开发环境配置等内容。

### NCF 的发布方式

`NeuCharFramework/NCF` 仓库负责面向最终用户的模板和站点发布：

- `NCF.Template.csproj` 把 `src/back-end/**` 打成
  `Senparc.NCF.Template` NuGet 包；
- CI 为 `Senparc.Web` 发布 `win-x64`、`win-arm64`、`linux-x64`、
  `linux-arm64`、`osx-x64`、`osx-arm64` 六个平台的压缩包；
- 满足 Release 条件时，CI 创建 GitHub Release 并上传上述构件；流水线同时保留
  构建产物。

正式发布以 NCF 仓库的 Release 流程和流水线为准。本地 `dotnet pack` 适合检查
包内容，不等同于已经发布到 NuGet 或 GitHub Release。

## 推荐维护流程

1. 在 `NcfPackageSources` 的模拟源中完成修改和本地验证。
2. 先查看同步工具打印的绝对路径和差异，再选择同步模式。
3. XNCF 模板使用 `--template-only`，检查占位符与目标包内容。
4. 完整站点同步逐文件判断 `Y/R/N`，避免覆盖 NCF 仓库中的独立修改。
5. 分别在两个仓库提交同步结果；不要把同步工具当作 Git 发布工具。
6. 发布前分别验证构建、包内容和流水线产物。三者是不同的验证边界。
