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

# C# 短任务（SDK 镜像体积较大）
docker pull mcr.microsoft.com/dotnet/sdk:8.0

# JupyterLab（交互式，内存占用更高）
docker pull quay.io/jupyter/minimal-notebook:latest
```

说明：

- 内存紧张时，可只拉 `python:3.12-alpine`，暂不使用 Jupyter 模板
- JupyterLab 活跃实例通常需要约 0.5–1.5GB 内存，请按并发规划宿主资源

## 4. 内部镜像仓库（预留）

企业环境常需从内网 registry 拉取。推荐做法：

1. 在内网同步/代理上述镜像，例如：
   - `registry.example.com/ncf-sandbox/python:3.12-alpine`
   - `registry.example.com/ncf-sandbox/dotnet-sdk:8.0`
   - `registry.example.com/ncf-sandbox/minimal-notebook:latest`
2. 在宿主配置 Docker registry mirror，或在 Sandbox 模块后续的「镜像映射/仓库前缀」配置中指向内网地址（功能演进后以模块配置页与本页更新为准）。
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

## 7. 故障排查速查

| 现象 | 排查 |
| --- | --- |
| `docker: command not found` | 未安装或未加入 PATH |
| `Cannot connect to the Docker daemon` | Desktop/Engine 未启动，或当前用户无 socket 权限 |
| Create 报 Docker 不可用 | 在宿主机器上重跑第 2 节；确认 NCF 进程与你执行 CLI 的是同一环境 |
| pull 很慢/失败 | 配置镜像加速或改用第 4 节内部仓库 |
| Jupyter 很卡 | 降低并发，或先只用 Exec 模板 |

## 8. 文档维护约定

- 镜像 tag、仓库示例、安装链接：**只在本页（及英文对应页）更新**
- XNCF 内仅保留：检查结果、步骤摘要、指向 `https://doc.ncf.pub` 的链接
