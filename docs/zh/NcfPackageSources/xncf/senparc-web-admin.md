# Senparc.Web 与 Admin

本页说明 `NcfPackageSources_Include_NcfSimulatedSite.sln` 中可运行的宿主站点
和管理员区域，面向需要运行源码的新手，以及需要判断宿主、安装器和模块代码
应该放在哪里的贡献者。

## 1. 各项目的职责

| 项目                                      | 职责                                                      | 不应该承担的职责             |
| ----------------------------------------- | --------------------------------------------------------- | ---------------------------- |
| `Senparc.Web`                             | ASP.NET Core 宿主、启动、中间件、配置、静态资源和模块组合 | 不应承载普通业务功能         |
| `Senparc.Areas.Admin`                     | Admin Area 页面、管理交互、Admin Chat、指标和管理 API     | 不负责实现所有业务 XNCF      |
| `Senparc.Xncf.Installer`                  | 首次初始化、默认模块选择和安装流程                        | 不替代正常的模块生命周期管理 |
| `Senparc.Xncf.Accounts`                   | 登录和账号管理使用的管理员/账号能力                       | 不是通用身份认证提供程序     |
| `Template_OrgName.Xncf.Template_XncfName` | 用于验证模板结构的生成示例模块                            | 不是宿主的业务层             |

宿主会组合系统 XNCF、Admin、安装器、账号模块，以及 AI、RAG、MCP、Workflow
等可选能力。因此运行时行为来自模块组合，而不是只来自 `Senparc.Web`。

## 2. 运行源码

在 `NcfPackageSources` 仓库根目录执行：

```bash
dotnet restore src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet build src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj --launch-profile http
```

打开宿主输出的地址，通常是 `http://localhost:5000`。第一次访问出现安装器
是正常现象。

### 首次运行顺序

1. 完成安装器并确认数据库 provider。
2. 创建或确认管理员账号。
3. 在 `/Admin/Login` 登录。
4. 打开“扩展模块 > 模块管理”。
5. 确认模块已经安装，然后启用模块。
6. 检查菜单和权限，再测试模块 Function。

安装只是让模块可用；启用后才会开放其可执行能力。菜单是否显示还会受角色
权限影响。

## 3. Admin 如何组合

Admin 由多个模块协作完成：

- `Senparc.Areas.Admin` 提供宿主区域和管理页面。
- `SystemCore`、`SystemManager` 提供系统结构和系统设置。
- `SystemPermission` 控制角色、策略、页面和按钮。
- `Menu` 保存并提供菜单元数据。
- `XncfModuleManager` 负责发现和管理 XNCF 生命周期状态。
- `Accounts` 与宿主认证配置提供登录上下文。

新 XNCF 增加页面时，应在自己的模块中声明 Area、菜单和权限。不要为了让菜单
显示，就把模块业务逻辑直接加入 Admin。

## 4. 应该在哪里修改代码

| 修改目标                     | 正确项目或层                              |
| ---------------------------- | ----------------------------------------- |
| 增加业务能力                 | 使用 `XncfBuilder.Template` 创建新的 XNCF |
| 增加模块页面                 | 所属模块的 Area 和应用服务                |
| 增加模块数据                 | 所属模块的数据库项目和迁移                |
| 修改登录/账号行为            | `Senparc.Xncf.Accounts` 及其相关契约      |
| 修改安装默认项               | `Senparc.Xncf.Installer` 和宿主配置       |
| 修改全局中间件或服务注册     | `Senparc.Web`                             |
| 修改通用 Admin UI 或管理行为 | `Senparc.Areas.Admin`                     |
| 测试 Admin 行为              | `Senparc.Areas.Admin.Tests`               |

应保持 `Senparc.Web` 为组合根。如果一个功能需要独立安装、启用、授权或升级，
就应该放入 XNCF。

## 5. 排障

| 现象                     | 优先检查                                              |
| ------------------------ | ----------------------------------------------------- |
| 每次都进入安装器         | 数据库连接、初始化日志和安装完成状态                  |
| 登录成功但菜单不见       | 模块是否启用、当前角色以及 Menu/SystemPermission 数据 |
| 菜单存在但 Function 失败 | Function 注册、模块状态、输入校验和授权               |
| Admin 页面返回 401/403   | Cookie/JWT、Admin 策略、角色分配和路由权限            |
| 宿主启动但模块缺失       | 程序集发现、项目引用/包、Register 实现和启动日志      |

操作流程参见 [Admin 后台](../../start/start-develop/admin-background.md) 和
[模块管理](../../start/start-develop/admin-module-manage.md)。自定义模块开发参见
[XNCF 契约](/zh/start/xncf-develop/contracts-and-interfaces.html)。
