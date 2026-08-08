# 入口文件

入口文件 `Senparc.Web\Program.cs`

当前 .NET 10 项目的公共命名空间引用归集在 `Senparc.Web\GlobalUsings.cs` 中，例如：

```csharp
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.Extensions.Hosting;
global using Senparc.Ncf.Database;
global using Senparc.Web;
global using Dapr.Client;
```

所有需要公共需要应用的命名空间都可以放到这里

## 项目的sdk设定

主要看 `Senparc.Web\global.json` 这个文件，内容如下

```json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestFeature"
  }
}
```

示例版本用于说明结构；请把它改为团队已安装并由 CI 使用的 .NET 10 SDK feature band。
