# Workspace 与 AdminChat

长期偏好与项目记忆请参阅 [AdminChat Memory 与对话设置](./adminchat-memory.md)。
Workspace 作用域记忆仍按用户隔离并保存在数据库中，不会自动读写工作区内的 `Memory.md`。

## 设计边界

Workspace 使用可配置的持久化目录，适合 AI Harness、源码、HTML/CSS/素材和构建中间文件。文件不会强制保存在 Docker 可写层；删除或重建运行时不会删除 Workspace。FileManager 仍然用于长期资产、用户上传文件、归档版本和最终发布产物。

浏览器、模型、AdminChat、VS Code 和 Cursor 都不会获得 Workspace 的物理路径。所有文件操作统一通过长驻 `Workspace Agent`，使用 `WorkspaceId` 加相对路径。Agent 采用 stdin/stdout NDJSON 长连接，因此 Windows、Linux、macOS 使用同一协议，不依赖平台专有的 Unix Socket 或 Named Pipe。

## 创建会话

只有超级管理员可以在 AdminChat 新建会话时选择 Workspace。普通管理员即使伪造 `WorkspaceId` 请求，也会被后端拒绝。

Workspace 权限分为三档：

1. 不使用 Workspace：保持原有 AdminChat 行为；
2. 只读：允许 AI 列出目录、读取文本文件；
3. 写入：在只读基础上允许写文件和创建目录；
4. 执行：只有隔离运行时或明确允许的受信任 NativeAgent 才能执行 Python/白名单命令。

写入和 CLI 默认关闭，必须由超级管理员在创建会话时明确勾选。权限保存在会话中，不能由模型或普通用户临时提升。

## 运行时与安全等级

### NativeAgent（默认、无需 Docker）

- 文件保存在 `RootPath`；
- Agent 是独立长驻进程；
- 支持二进制文件、目录、搜索、精确补丁、移动和删除；
- 使用 ETag 检测 VS Code、Cursor 和 AdminChat 的并发修改；
- 写入先落到同目录临时文件，再原子替换；
- 默认 `AllowNativeExecution=false`，禁止 Python 和任意命令；
- 适用于不允许安装 Docker 的客户环境。

NativeAgent 能严格限制协议层文件路径，但不是操作系统沙箱。只有受信任环境才应打开原生执行。

### Docker（推荐用于执行代码）

Docker Runtime：

- 不经过 `shell` 或字符串拼接；
- 使用进程参数数组传递命令参数；
- 只能执行 `WorkspaceOptions.AllowedCommands` 中的命令；
- 工作目录必须位于当前 Workspace；
- 拒绝绝对路径、`..` 路径和符号链接逃逸；
- 有执行超时和标准输出/错误输出大小限制；
- 清除宿主进程环境变量，只保留 PATH、临时目录等安全最小集合；
- 使用 `--network none`、只读容器根、`no-new-privileges`、丢弃 capabilities、进程/CPU/内存限制；
- 只把当前 Workspace 挂载到 `/workspace`；
- 不向模型返回宿主机物理路径；
- 执行、写入和删除操作写入服务日志，但不记录文件内容。

构建 Agent 镜像：

```bash
cd NcfPackageSources/src/Extensions
docker build -f Senparc.Xncf.Workspace.Agent/Dockerfile \
  -t senparc/ncf-workspace-agent:0.2.0 .
```

Linux 部署需要确保容器用户对 Workspace 持久化目录拥有读写权限；也可以根据客户 UID/GID 制作派生镜像。

## VS Code / Cursor

安装仓库中的 `NcfWorkspace.VSCode` 扩展后，执行 **NCF: 连接工作区**：

1. 输入 NCF 站点地址；
2. 核对并批准 DesktopBridge 设备码；
3. 在已登录的管理员浏览器中确认 PKCE 授权；
4. 选择 Workspace；
5. 扩展使用 `ncf-workspace://` 打开远程文件夹。

令牌保存在 VS Code SecretStorage。远程访问同时要求 HTTPS（本机 loopback 例外）、DesktopBridge 会话和 Admin JWT。网关按 JWT 管理员 ID 校验 Workspace 所有者。文件保存携带 `If-Match`，冲突返回 HTTP 409，不会静默覆盖其他客户端修改。

## 配置

可在配置中调整限制：

```json
{
  "SenparcXncfWorkspace": {
    "RootPath": "App_Data/AIWorkspaces",
    "MaxWorkspaceBytes": 2147483648,
    "MaxFileReadBytes": 2097152,
    "MaxFileWriteBytes": 10485760,
    "RuntimeProvider": "NativeAgent",
    "AgentPath": "",
    "AllowNativeExecution": false,
    "DockerImage": "senparc/ncf-workspace-agent:0.2.0",
    "DockerMemoryMegabytes": 512,
    "DockerCpuLimit": 1.0,
    "CommandTimeoutSeconds": 60,
    "MaxCommandOutputBytes": 2097152,
    "AllowedCommands": [ "dotnet", "git", "node", "npm", "python", "pytest" ]
  },
  "SenparcNcf": {
    "IsolatedRuntime": {
      "Docker": {
        "Executable": "docker",
        "ProbeTimeoutSeconds": 8
      }
    }
  }
}
```

将 `RuntimeProvider` 改为 `Docker` 即启用容器 Agent。`AllowedCommands` 只控制可执行文件名，不会把任意命令字符串转换为 shell 命令。生产环境应进一步收紧列表。

`SenparcNcf:IsolatedRuntime:Docker` 是 Workspace 与 Sandbox 共用的 Docker Provider 配置。
两个模块共享 CLI 探测、结构化挂载、网络、资源限制、进程超时、日志和销毁能力，但各自保留独立的业务生命周期。

本次升级没有修改数据库模型，因此没有新增 Migration。已有 AdminChat Workspace 字段的迁移仍按下文命令管理；后续若修改实体，必须继续使用 `dotnet ef migrations add` 生成，而不能手写迁移。

## 数据库迁移（模拟站点）

AdminChat 会话新增以下字段：

- `WorkspaceId`
- `WorkspaceWriteEnabled`
- `WorkspaceCliEnabled`

当前模拟站点已使用标准 EF Core 命令生成六套迁移。请在 `NcfPackageSources/tools/NcfSimulatedSite` 目录执行：

```bash
dotnet ef migrations add Add_AdminChatWorkspace -c AdminSenparcEntities_Sqlite -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj -o Domain/Migrations/Sqlite
dotnet ef migrations add Add_AdminChatWorkspace -c AdminSenparcEntities_MySql -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj -o Domain/Migrations/MySql
dotnet ef migrations add Add_AdminChatWorkspace -c AdminSenparcEntities_SqlServer -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj -o Domain/Migrations/SqlServer
dotnet ef migrations add Add_AdminChatWorkspace -c AdminSenparcEntities_PostgreSQL -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj -o Domain/Migrations/PostgreSQL
dotnet ef migrations add Add_AdminChatWorkspace -c AdminSenparcEntities_Oracle -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj -o Domain/Migrations/Oracle
dotnet ef migrations add Add_AdminChatWorkspace -c AdminSenparcEntities_Dm -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj -o Domain/Migrations/Dm
```

生成后使用对应的 Context 执行数据库更新：

```bash
dotnet ef database update -c AdminSenparcEntities_Sqlite -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj
dotnet ef database update -c AdminSenparcEntities_MySql -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj
dotnet ef database update -c AdminSenparcEntities_SqlServer -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj
dotnet ef database update -c AdminSenparcEntities_PostgreSQL -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj
dotnet ef database update -c AdminSenparcEntities_Oracle -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj
dotnet ef database update -c AdminSenparcEntities_Dm -p Senparc.Areas.Admin/Senparc.Areas.Admin.csproj -s Senparc.Web.DatabasePlant/Senparc.Web.DatabasePlant.csproj
```

对应迁移目录分别为 `Sqlite`、`MySql`、`SqlServer`、`PostgreSQL`、`Oracle` 和 `Dm`。每套迁移都明确绑定对应的 `AdminSenparcEntities_*`，并只变更 `ADMIN_AdminChatSession` 的三个 Workspace 字段。
