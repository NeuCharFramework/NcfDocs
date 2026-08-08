# XNCF 的构成

> 本页属于 Template 二次开发，只说明模块的公共组成和使用约定，不展开框架
> 扫描源码。内容已按 `Senparc.Xncf.XncfBuilder.Template` `0.13.0` 核对。

XNCF 是 NCF 中可被扫描、安装、启停和独立治理的模块单元。开发者通常使用
[XNCF 模块生成器](./create-xncf.md)，不需要从空项目手工搭建全部结构。

## 最小模块注册类

每个模块需要一个带 `[XncfRegister]` 的 `Register` 类，继承
`XncfRegisterBase` 并实现 `IXncfRegister`：

```csharp
using Senparc.Ncf.XncfBase;

namespace MyOrg.Xncf.Sample;

[XncfRegister]
public partial class Register : XncfRegisterBase, IXncfRegister
{
    public override string Name => "MyOrg.Xncf.Sample";
    public override string Uid => "A-FIXED-GLOBALLY-UNIQUE-GUID";
    public override string Version => "0.1.0";
    public override string MenuName => "Sample";
    public override string Icon => "fa fa-star";
    public override string Description => "Sample XNCF module";
}
```

- `Name` 和 `Uid` 必须全局唯一；`Uid` 发布后不得随意改变。
- `Version` 是模块生命周期版本，不等于 NuGet 包版本。
- 安装、升级和卸载逻辑通过 `InstallOrUpdateAsync()`、
  `UninstallAsync()` 实现。

二次开发应先阅读：[XNCF 二次开发接口与边界](./contracts-and-interfaces.md)。
只有在调试框架实现时，才需要继续查看
[IXncfRegister 源码剖析](/zh/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister.html)。

## 加载顺序

`[XncfOrder(x)]` 按数字降序加载：

- `0` 或未设置：普通模块；
- `1`–`5000`：需要明确顺序的模块；
- `58xx`：AI 相关基础模块保留区；
- `59xx`：系统底层模块保留区。

普通业务模块不要占用系统保留区。

## 当前 Function 机制

当前 Function 不再通过 `IXncfRegister.Functions` 或 `IXncfFunction` 列表注册。
框架扫描 `AppServiceBase` 子类中带 `[FunctionRender]` 的方法，并把结果写入
模块的 `FunctionRenderCollection`。

推荐结构：

```text
Application/
  AppServices/       带 [FunctionRender] 的应用服务
  DTOs/
    Request/         FunctionAppRequestBase 请求模型
    Response/        响应 DTO
```

详见：[手工创建最小 XNCF 模块](/zh/start/developer/xncf_module.html)。

## 可选能力

按模块需要组合，不要求全部实现：

| 能力             | 当前入口                                  |
| ---------------- | ----------------------------------------- |
| 数据库与迁移     | `IXncfDatabase`、`Register.Database.cs`   |
| Razor Area       | `IAreaRegister`、`Register.Area.cs`       |
| Razor 运行时编译 | `IXncfRazorRuntimeCompilation`            |
| 中间件           | `IXncfMiddleware`                         |
| 后台线程         | `IXncfThread`                             |
| Function         | `AppServiceBase` + `[FunctionRender]`     |
| MCP Server       | `EnableMcpServer => true` + MCP Tool 特性 |

## 推荐阅读顺序

1. [XNCF 二次开发接口与边界](./contracts-and-interfaces.md)
2. [创建第一个 XNCF 模块](./create-xncf.md)
3. [当前模板结构](./about-custom-xncf.md)
4. [开发 XNCF](./dev-xncf.md)
5. [模块间调用](./invoke-between-modules.md)
