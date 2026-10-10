# Create a Minimal XNCF Module Manually

> Prefer the [XNCF module generator](/start/xncf-develop/create-xncf.html) for
> normal development. This page explains the current registration and Function
> mechanism and does not use the retired `IXncfFunction` flow.
> It remains Template-based development documentation and does not analyze the
> internal scanner. Start with
> [XNCF Extension Contracts and Boundaries](/start/xncf-develop/contracts-and-interfaces.html)
> when choosing extension points.

## 1. Create the module project

The current NCF development line uses .NET 10. Reference versions of
`Senparc.Ncf.XncfBase` and `Senparc.Ncf.Core` that match the host, and make the
host reference the module assembly.

Recommended structure:

```text
MyOrg.Xncf.Sample/
  Application/
    AppServices/
    DTOs/Request/
  Register.cs
```

## 2. Create `Register`

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

Keep the generated `Uid` fixed. Do not add a `Functions` property; it is no
longer part of the current registration flow.

## 3. Create a request model

```csharp
using Senparc.Ncf.XncfBase.FunctionRenders;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace MyOrg.Xncf.Sample.Application.DTOs.Request;

public class EchoRequest : FunctionAppRequestBase
{
    [Required]
    [MaxLength(200)]
    [Description("Text to return")]
    public string Message { get; set; }
}
```

For complex forms, use `FunctionParameterUi` and `SelectionList`. Override
`LoadData(IServiceProvider)` when options must be loaded asynchronously.

## 4. Create an AppService Function

```csharp
using MyOrg.Xncf.Sample.Application.DTOs.Request;
using Senparc.Ncf.Core.AppServices;
using Senparc.Ncf.Core.Models;

namespace MyOrg.Xncf.Sample.Application.AppServices;

public class SampleAppService : AppServiceBase
{
    public SampleAppService(IServiceProvider serviceProvider)
        : base(serviceProvider) { }

    [FunctionRender("Echo", "Return the input", typeof(Register))]
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

The framework scans `[FunctionRender]` methods on `AppServiceBase` subclasses.

## 5. Verify

1. The host references the module project and builds successfully.
2. Start the site, find the module in Module Management, install it, and enable
   it.
3. Open the module settings/execution page and verify that `Echo` is visible.
4. Execute it and verify both output and log.
5. If the Function count is zero, check assembly loading, the `AppServiceBase`
   inheritance, and the `[FunctionRender]` attribute.

For database, Area, MCP, or localization support, copy the corresponding
capability from the current XncfBuilder template rather than combining code
from an old `IXncfFunction` tutorial.

To change scanning, registration, or base-class implementation, continue to the
[NcfPackageSources Source Guide](/NcfPackageSources/home/).
