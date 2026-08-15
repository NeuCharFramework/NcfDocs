# Senparc.Xncf.Sandbox 环境准备指南

本页说明如何在使用 `Senparc.Xncf.Sandbox` 之前，**手动**准备 Docker（或兼容 CLI）与镜像。  
镜像名称、版本与内部仓库地址会随文档更新，**请以本页为准**；模块内只提供简要说明并链到此处。

> 文档站点：<https://doc.ncf.pub>  
> 模块不会自动安装 Docker，也不会在后台静默 `docker pull`（安全与权限边界）。

## 1. 目标与边界

| 项目 | 说明 |
| --- | --- |
| 模块做什么 | 编排可快速创建/销毁的实验沙箱（Exec / 可选 Jupyter） |
| 运维需要做什么 | 安装容器运行时、预拉镜像、按需配置内部仓库 |
| 模块不做什么 | 不以 Web 进程自动安装 Docker；不把镜像版本写死在 UI 文案中 |

相关模块说明见：[XNCF 扩展库说明](../home/xncf-extension-modules.md)。

## 2. 检查 Docker 是否可用

在运行 NCF 宿主的同一台机器上执行：

```bash
docker version
docker info
```

期望结果：

- `Client` 与 `Server` 均有版本输出（说明 daemon 已启动）
- `docker info` 无权限/连接错误

若使用 Podman 且提供了 `docker` 兼容命令，只要上述检查通过即可。

### 2.1 未安装时的建议（手动）

按操作系统自行安装（任选其一，命令可能随发行版变化，请对照官方文档）：

- macOS / Windows：安装 [Docker Desktop](https://docs.docker.com/get-docker/)
- Linux：按发行版安装 Docker Engine，并确保当前用户可访问 docker socket（或使用 rootless/Podman）

安装完成后重新执行第 2 节检查。

## 3. 推荐预拉镜像（会随文档更新）

以下清单为**当前文档推荐值**，用于首次使用前手动预热。若模块代码中的默认镜像与本页不一致，**以本页为准并同步修改模块配置/模板**。

```bash
# Python 短任务
docker pull python:3.12-alpine

# C# 短任务（.NET 10 SDK；支持 file-based apps，体积较大）
docker pull mcr.microsoft.com/dotnet/sdk:10.0

# JupyterLab（交互式，内存占用更高）
docker pull quay.io/jupyter/minimal-notebook:latest
```

说明：

- `csharp-exec` 使用 .NET 10 **file-based apps**：容器内执行 `dotnet run --file main.cs`，可用顶层语句（如 `Console.WriteLine("hi");`），无需 csproj
- Exec 默认 `--network none`：模块会注入离线 `nuget.config` 并关闭默认 NativeAOT（`PublishAot=false`），保证无外网可编译运行；`#:package` 拉包仍不可用
- 内存紧张时，可只拉 `python:3.12-alpine`，暂不使用 Jupyter 模板
- JupyterLab 活跃实例通常需要约 0.5–1.5GB 内存，请按并发规划宿主资源

### 3.1 国内网络与下载超时

Jupyter 默认镜像位于 `quay.io`。清华 TUNA 常见的是 Docker CE 软件包镜像，并不是
`quay.io` 的容器仓库，因此不能直接把 `quay.io/jupyter/...` 改写为 TUNA 地址。

如暂时需要使用国内网络中的第三方 Quay 代理，可以在宿主 `appsettings.json` 中显式覆盖，
并把首次下载的完整 `docker run` 超时时间提高到 15 分钟：

```json
"SenparcXncfSandbox": {
  "Docker": {
    "InteractiveCreateTimeoutSeconds": 900
  },
  "Images": {
    "Overrides": {
      "jupyter-python": "quay.dockerproxy.net/jupyter/minimal-notebook:latest"
    }
  }
}
```

`InteractiveCreateTimeoutSeconds` 的有效范围为 60–3600 秒；它覆盖 `docker run` 的完整执行时间，
包括本地缺少镜像时 Docker 自动进行的镜像拉取。`quay.dockerproxy.net` 是第三方代理，不是
Senparc 或清华 TUNA 的官方服务，稳定性和可用性请先自行验证。生产环境更建议将镜像同步到
阿里云 ACR、腾讯云 TCR 或企业内部 Registry，使用固定版本或 digest 后配置到 `Overrides`。

### 3.2 C# Notebook 镜像

NCF 同时提供两种 C# 使用方式：

- `csharp-exec`：使用独立 .NET SDK 容器执行短任务，适合简单代码和 Function；
- `jupyter-csharp`：使用 Jupyter Notebook 逐单元格运行 C#，需要先构建扩展镜像。

扩展镜像的构建资源位于 NCF 源码的
`tools/SandboxImages/JupyterDotnet`，不会把 SDK、DLL 或 NuGet 包打入 NCF NuGet 包。
镜像构建时会安装 .NET SDK、.NET Interactive Kernel，并预热 `Learning.csproj` 中列出的 NuGet 包。

在 NCF 源码目录执行：

```bash
cd tools/SandboxImages/JupyterDotnet
docker build -t ncf-jupyter-dotnet:10.0 .
docker run --rm ncf-jupyter-dotnet:10.0 dotnet --info
docker run --rm ncf-jupyter-dotnet:10.0 jupyter kernelspec list
```

本机 Docker 与 NCF 使用同一个 Docker daemon 时，可直接配置本地镜像：

```json
"SenparcXncfSandbox": {
  "Images": {
    "Overrides": {
      "jupyter-csharp": "ncf-jupyter-dotnet:10.0"
    }
  }
}
```

镜像也可以发布到私有 Registry：

```bash
docker tag ncf-jupyter-dotnet:10.0 \
  registry.example.com/ncf-sandbox/jupyter-dotnet:10.0
docker login registry.example.com
docker push registry.example.com/ncf-sandbox/jupyter-dotnet:10.0
```

然后配置完整镜像地址：

```json
"jupyter-csharp": "registry.example.com/ncf-sandbox/jupyter-dotnet:10.0"
```

生产环境建议使用固定版本或 digest，不要使用 `latest`。如果构建机器访问 NuGet 官方源较慢，
可使用 `--build-arg NUGET_SOURCE=https://your-nuget-feed/v3/index.json` 指向组织内部源。

创建 `JupyterLab C#` 沙箱后，在 JupyterLab 的 Kernel 列表中选择 C#，即可运行：

```csharp
using Newtonsoft.Json;

var value = new { Name = "NCF", Enabled = true };
Console.WriteLine(JsonConvert.SerializeObject(value));
```

## 4. 内部镜像仓库

企业环境常需从内网 registry 拉取。推荐做法：

1. 在内网同步/代理上述镜像，例如：
   - `registry.example.com/ncf-sandbox/python:3.12-alpine`
   - `registry.example.com/ncf-sandbox/dotnet-sdk:10.0`
   - `registry.example.com/ncf-sandbox/minimal-notebook:latest`
2. 在宿主 `appsettings.json`（或环境变量）配置模块节 `SenparcXncfSandbox:Images`：

```json
"SenparcXncfSandbox": {
  "Images": {
    "RegistryPrefix": "registry.example.com/ncf-sandbox",
    "Overrides": {
      "python-exec": "registry.example.com/ncf-sandbox/python:3.12-alpine",
      "csharp-exec": "registry.example.com/ncf-sandbox/dotnet-sdk:10.0",
      "jupyter-python": "registry.example.com/ncf-sandbox/minimal-notebook:latest",
      "jupyter-csharp": "registry.example.com/ncf-sandbox/jupyter-dotnet:10.0"
    }
  }
}
```

说明：

- `Overrides` 优先；未覆盖时用 `RegistryPrefix` + 默认镜像末段拼接
- 含多级路径的官方镜像（如 `mcr.microsoft.com/...`）建议写全量 `Overrides`，避免只拼到 `sdk:10.0`
- 也可只配 Docker daemon 的 registry mirror，不改应用配置

3. 预拉时改为：

```bash
docker pull registry.example.com/ncf-sandbox/python:3.12-alpine
# ... 其余镜像同理
```

> 占位：`registry.example.com` 请替换为你的实际仓库域名。凭证、TLS、命名空间策略由运维统一管理。

## 5. 在 NCF 中启用模块

1. 启动站点并登录管理后台  
2. 安装/启用 `Senparc.Xncf.Sandbox`  
3. 打开模块菜单 **环境准备**，确认「Docker 检测」通过  
4. 再使用 **沙箱面板** 或 Function（创建 / Exec / 销毁）

模块内简要引导页不会复制完整镜像版本表，避免文档与代码双处漂移。

## 6. 安全提示

- 沙箱默认面向本机/内网实验；Jupyter 访问地址若绑定 `127.0.0.1` + token，**不要直接暴露到公网**
- 无 Docker 时模块**不会**降级为裸进程执行不可信代码
- 生产环境请配合配额、TTL、网络策略与反向代理鉴权（后续能力以文档更新为准）

## 7. NCF/XNCF 预览工作负载

`Senparc.Xncf.XncfBuilder` 可以将一份**已清洗的隔离源码快照**交给 Sandbox，启动独立 NCF 预览。它用于评审 AI 协助产生的 XNCF 改动；不是通用 Docker 命令执行器，也不会向主站热加载模块。

该工作负载默认关闭。只有运维人员准备好受信任镜像和支持预览 path base 的宿主后，才应启用：

```json
"SenparcXncfSandbox": {
  "NcfPreview": {
    "Enabled": true,
    "AllowDependencyRestoreNetwork": false,
    "StartupTimeoutSeconds": 180
  },
  "Images": {
    "Overrides": {
      "ncf-preview": "registry.example.com/ncf/ncf-preview@sha256:<immutable-digest>"
    }
  }
}
```

要求与行为：

- `ncf-preview` **必须**是经过认可的不可变 digest；如 `:latest`、`:10.0` 等 tag 会被拒绝。
- 默认 `AllowDependencyRestoreNetwork: false` 时，容器使用 `--network none`。认可镜像必须已经包含/缓存所需 SDK 与包依赖。
- 如确需通过内部镜像还原包，必须显式启用，并且只使用能访问该镜像的专用 Docker 网络，绝不能使用通用 Internet：

  ```json
  "NcfPreview": {
    "Enabled": true,
    "AllowDependencyRestoreNetwork": true,
    "RestoreNetworkName": "ncf-package-mirror",
    "StartupTimeoutSeconds": 180
  }
  ```

- 固定容器调用不接收调用方提供的 Shell 命令、Docker socket、host 网络或可写生产源码。它使用第二份归 Sandbox 所有的源码副本、仅 loopback 端口、移除能力、`no-new-privileges`、只读根文件系统、tmpfs 和 CPU/内存/PID 限制。
- 它只执行固定步骤：还原固定的 `Senparc.Web` 项目、发布、在 8080 端口启动。预览输出不会部署回宿主机。
- 访问使用带 Admin 鉴权的 `/sandbox-preview/{sessionId}/...` 代理；代理到预览进程前会移除 Cookie 和 `Authorization` 头。
- 预览 `Senparc.Web` 必须读取 `NCF_XNCF_PREVIEW_PATH_BASE`，并在 NCF/路由中间件之前调用 `UsePathBase`。模拟宿主已经支持；自定义宿主必须增加同样的 opt-in。

操作流程请看[安全地创建、测试并合入 XNCF 模块](/zh/start/xncf-develop/isolated-xncf-development.html)，实现边界请看[XncfBuilder 隔离开发源码剖析](./xncfbuilder-isolated-development.md)。

## 8. 故障排查速查

| 现象 | 排查 |
| --- | --- |
| `docker: command not found` | 未安装或未加入 PATH |
| `Cannot connect to the Docker daemon` | Desktop/Engine 未启动，或当前用户无 socket 权限 |
| Create 报 Docker 不可用 | 在宿主机器上重跑第 2 节；确认 NCF 进程与你执行 CLI 的是同一环境 |
| pull 很慢/失败 | 配置镜像加速或改用第 4 节内部仓库 |
| Jupyter 很卡 | 降低并发，或先只用 Exec 模板 |

## 9. 文档维护约定

- 镜像 tag、仓库示例、安装链接：**只在本页（及英文对应页）更新**
- XNCF 内仅保留：检查结果、步骤摘要、指向 `https://doc.ncf.pub` 的链接
