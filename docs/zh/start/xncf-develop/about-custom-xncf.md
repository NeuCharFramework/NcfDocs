# 当前 XNCF 模板结构

> 面向 Template 二次开发，对应 `Senparc.Xncf.XncfBuilder.Template` `0.13.0`。
> 模板母版和打包项目的关系见
> [项目关系、同步与发布](/zh/NcfPackageSources/home/project-relationships.html)。

使用 XncfBuilder 生成并启用 Sample 后，可以得到包含注册、Function、数据库、
Razor 页面和本地化资源的完整示例。

## 目录结构

```text
MyOrg.Xncf.Sample/
  ACL/                         防腐层与仓储适配
  App_Data/                    模块配置与受保护数据
  Application/
    AppServices/               应用服务和 [FunctionRender] 方法
    DTOs/
      Request/                 请求模型
      Response/                响应模型
    EventHandlers/             EventBus 事件处理器示例
    Events/                    EventBus 事件定义示例
  Areas/Admin/Pages/           后台 Razor Pages
  Domain/
    Migrations/                各数据库迁移
    Models/DatabaseModel/      实体、DTO、Mapping、DbContext
    Services/                  领域服务
  OHS/
    Local/readme.md            本地主机边界说明
    Remote/readme.md           远程主机边界说明
  Resources/                   模块资源类与多语言 .resx
  wwwroot/                     模块静态资源
  Register.cs                  基础元数据和生命周期
  Register.Area.cs             Area 能力
  Register.Database.cs         数据库能力
```

旧版教程把 AppService 和 PL 放在 `OHS/Local`。当前模板已经把应用服务和传输
模型统一迁移到 `Application/AppServices` 与 `Application/DTOs`；`OHS` 仍保留
为主机边界说明，不再是默认 Function 代码目录。

## 注册与生命周期

`Register.cs` 负责：

- 模块 `Name`、固定 `Uid`、`Version`、菜单和说明；
- `InstallOrUpdateAsync()` 中的安装/升级逻辑；
- `UninstallAsync()` 中的卸载逻辑；
- `AddXncfModule()` 中的依赖注入和 AutoMapper；
- `UseXncfModule()` 中的静态文件或中间件挂载。

数据库模板在安装/升级时使用：

```csharp
await XncfDatabaseDbContext.MigrateOnInstallAsync(serviceProvider, this);
```

卸载示例会删除模块表，仅用于演示。生产模块必须根据数据保留策略重新设计，
不能直接复制破坏性卸载逻辑。

## FunctionRender

当前 Function 位于 `Application/AppServices`：

```csharp
public class SampleAppService : AppServiceBase
{
    public SampleAppService(IServiceProvider serviceProvider)
        : base(serviceProvider) { }

    [FunctionRender("Echo", "返回输入文本", typeof(Register))]
    public Task<StringAppResponse> Echo(EchoRequest request)
    {
        return this.GetStringResponseAsync((response, logger) =>
        {
            response.Data = request.Message;
            return Task.FromResult<string>(null);
        });
    }
}
```

不要再向 `Register` 添加 `Functions` 列表；当前基类没有这个可重写成员。

## EventBus 示例

`0.13.0` 模板增加了模块内部 EventBus 往返示例，事件定义和处理器分别位于
`Application/Events` 与 `Application/EventHandlers`。业务模块可以沿用此结构，
但只有在需要解耦应用服务或跨处理器协作时才保留示例；不使用 EventBus 时可
删除示例代码，不影响基本 XNCF 注册和 Function。

## 请求模型和 UI 元数据

请求模型继承 `FunctionAppRequestBase`。可使用：

- DataAnnotations 做必填、长度等验证；
- `LocalizedDescription` 提供本地化参数说明；
- `FunctionParameterUi` + `SelectionList` 定义下拉、多选等界面；
- `[JsonIgnore]` 隐藏仅用于 UI 元数据的选项集合。

## 本地化

模板提供 `Resources` 目录和 `GlobalUsings.Localization.cs`。当前模拟站点支持
`zh-CN`、`en`、`ja`、`fr`、`es`、`ru`。模块名称、Function 名称、参数说明
和页面文案应使用同一资源体系，并保留默认文本或资源回退。

下一步：[XNCF 二次开发接口与边界](./contracts-and-interfaces.md)。
