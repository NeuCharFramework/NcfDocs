# 手工创建最小 XNCF 模块

> 推荐优先使用 [XNCF 模块生成器](/zh/start/xncf-develop/create-xncf.html)。
> 本页用于理解当前注册和 Function 机制，不再使用旧版 `IXncfFunction`。
> 它仍属于 Template 二次开发，不解释框架内部扫描源码；接口选择先看
> [XNCF 二次开发接口与边界](/zh/start/xncf-develop/contracts-and-interfaces.html)。

## 1. 创建模块项目

当前 NCF 开发线以 .NET 10 为基线。项目至少引用与宿主版本匹配的
`Senparc.Ncf.XncfBase` 和 `Senparc.Ncf.Core`，并由宿主项目引用模块程序集。

推荐目录：

```text
MyOrg.Xncf.Sample/
  Application/
    AppServices/
    DTOs/Request/
  Register.cs
```

## 2. 创建 `Register`

```csharp
using Senparc.Ncf.XncfBase;

namespace MyOrg.Xncf.Sample;

[XncfRegister]
public partial class Register : XncfRegisterBase, IXncfRegister
{
    public override string Name => "MyOrg.Xncf.Sample";
    public override string Uid => "36C6BE43-BA0D-4898-A4B4-98AB22146C92";
    public override string Version => "0.1.0";
    public override string MenuName => "Sample";
    public override string Icon => "fa fa-star";
    public override string Description => "Minimal XNCF sample";
}
```

`Uid` 首次生成后必须固定。不要添加 `Functions` 属性；它已退出当前注册机制。

## 3. 创建请求模型

```csharp
using Senparc.Ncf.XncfBase.FunctionRenders;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace MyOrg.Xncf.Sample.Application.DTOs.Request;

public class EchoRequest : FunctionAppRequestBase
{
    [Required]
    [MaxLength(200)]
    [Description("需要返回的文本")]
    public string Message { get; set; }
}
```

复杂表单可使用 `FunctionParameterUi` 和 `SelectionList`；需要异步装载选项时，
重写请求模型的 `LoadData(IServiceProvider)`。

## 4. 创建 AppService Function

```csharp
using MyOrg.Xncf.Sample.Application.DTOs.Request;
using Senparc.Ncf.Core.AppServices;
using Senparc.Ncf.Core.Models;

namespace MyOrg.Xncf.Sample.Application.AppServices;

public class SampleAppService : AppServiceBase
{
    public SampleAppService(IServiceProvider serviceProvider)
        : base(serviceProvider) { }

    [FunctionRender("Echo", "返回输入文本", typeof(Register))]
    public Task<StringAppResponse> Echo(EchoRequest request)
    {
        return this.GetStringResponseAsync((response, logger) =>
        {
            logger.Append("Echo executed");
            response.Data = request.Message;
            return Task.FromResult<string>(null);
        });
    }
}
```

框架会扫描 `AppServiceBase` 子类的 `[FunctionRender]` 方法并完成登记。

## 5. 验证

1. 宿主项目引用模块项目并成功构建。
2. 启动站点，在模块管理中找到、安装并启用模块。
3. 打开模块的设置/执行页面，确认 `Echo` Function 可见。
4. 输入文本执行，确认返回值和日志正确。
5. 若 Function 数量为 0，检查程序集是否被宿主加载、AppService 是否继承
   `AppServiceBase`、方法是否有 `[FunctionRender]`。

需要数据库、Area、MCP 或本地化时，请从当前 XncfBuilder 模板复制相应能力，
不要从旧版 `IXncfFunction` 教程拼接代码。

若要修改扫描、注册或基类实现，再进入
[NcfPackageSources 源码指南](/zh/NcfPackageSources/home/)。
