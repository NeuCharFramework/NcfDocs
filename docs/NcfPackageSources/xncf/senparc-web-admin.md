# Senparc.Web and Admin

This page explains the runnable host and administrator area included by
`NcfPackageSources_Include_NcfSimulatedSite.sln`. It is for beginners who need
to run the source tree and contributors who need to know where host, installer,
and module code belongs.

## 1. What each project does

| Project                                   | Responsibility                                                                               | What it is not                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `Senparc.Web`                             | ASP.NET Core host, startup, middleware, configuration, static assets, and module composition | A place to put ordinary business features            |
| `Senparc.Areas.Admin`                     | Admin Area pages, management interactions, Admin Chat, metrics, and administration APIs      | The implementation of every business XNCF            |
| `Senparc.Xncf.Installer`                  | First-run initialization, default module selection, and installation flow                    | A replacement for normal module lifecycle management |
| `Senparc.Xncf.Accounts`                   | Administrator/account behavior used by login and account management                          | A general-purpose identity provider                  |
| `Template_OrgName.Xncf.Template_XncfName` | A generated sample module used to verify the template shape                                  | The host's business layer                            |

The host composes the system XNCFs, Admin, installer, account module, and
optional capabilities such as AI, RAG, MCP, and Workflow. The runtime behavior
therefore comes from the composition of modules, not from `Senparc.Web` alone.

## 2. Run the source tree

From the `NcfPackageSources` repository root:

```bash
dotnet restore src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet build src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj --launch-profile http
```

Open the URL printed by the host, normally `http://localhost:5000`.
The installer is expected on the first visit.

### First-run order

1. Complete the installer and confirm the database provider.
2. Create or confirm the administrator account.
3. Sign in at `/Admin/Login`.
4. Open **Extension Modules > Module Management**.
5. Confirm that a module is installed, then enable it.
6. Check its menu and permissions before testing its Functions.

Installation only makes a module available. Enabling it makes its executable
capabilities available. A menu can also be hidden by role permissions.

## 3. How Admin is assembled

The Admin experience is a collaboration of modules:

- `Senparc.Areas.Admin` provides the host area and management pages.
- `SystemCore` and `SystemManager` provide system-level structures and settings.
- `SystemPermission` controls roles, policies, pages, and buttons.
- `Menu` stores and exposes menu metadata.
- `XncfModuleManager` discovers and manages XNCF lifecycle state.
- `Accounts` and the host authentication configuration provide login context.

When a new XNCF adds a page, it should declare its own Area/menu/permission
surface. Do not add module business logic to Admin merely to make a menu
appear.

## 4. Where to change code

| Change                                           | Correct project or layer                          |
| ------------------------------------------------ | ------------------------------------------------- |
| Add a business capability                        | Create a new XNCF from `XncfBuilder.Template`     |
| Add a module page                                | The module's Area and application service         |
| Add module data                                  | The module's database project and migrations      |
| Change login/account behavior                    | `Senparc.Xncf.Accounts` and its related contracts |
| Change installation defaults                     | `Senparc.Xncf.Installer` and host configuration   |
| Change global middleware or service registration | `Senparc.Web`                                     |
| Change common Admin UI or management behavior    | `Senparc.Areas.Admin`                             |
| Test Admin behavior                              | `Senparc.Areas.Admin.Tests`                       |

Keep `Senparc.Web` as a composition root. If a feature can be installed,
enabled, permissioned, or updated independently, it belongs in an XNCF.

## 5. Troubleshooting

| Symptom                                   | Check first                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| Installer appears every time              | Database connection, initialization logs, and completed installer state                  |
| Login succeeds but a menu is missing      | Module enabled state, current role, and Menu/SystemPermission data                       |
| Module menu is visible but Functions fail | Function registration, module state, input validation, and authorization                 |
| Admin page returns 401/403                | Cookie/JWT state, Admin policy, role assignment, and route permissions                   |
| Host starts but a module is absent        | Assembly discovery, project reference/package, Register implementation, and startup logs |

For the operator workflow see [Admin Backend](../../start/start-develop/admin-background.md)
and [Module Management](../../start/start-develop/admin-module-manage.md). For
custom module development see [XNCF contracts](/start/xncf-develop/contracts-and-interfaces.html).
