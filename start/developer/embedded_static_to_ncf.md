# 嵌入静态资源文件到NCF中

无论是开发前端和后台，难免会用到静态资源文件，这里的静态资源文件指的是(html,css,js等文件)

目前我们NCF使用的是DDD(领域驱动)模式开发，所以更多时候希望广大开发者能聚焦业务在自己开发的模块中，这样就能随着官方核心NCF的升级进行无缝对接，避免了更多修改，迁移文件的工作

## 创建静态资源

将静态资源建立在 `Xncf_Module` 之下，如图所示：

![Image text](./images/embedded_static_to_ncf/create_static_resources.png)

## 设置静态资源属性

选中任意静态资源文件，点击右键，选择嵌入的资源，如图所示：

![Image text](./images/embedded_static_to_ncf/resource_property.png)

![Image text](./images/embedded_static_to_ncf/select_embedded_resource.png)

## .csproject文件中增加库引用及相关配置

    <PropertyGroup>
      <TargetFramework>netcoreapp3.1</TargetFramework>
      <GenerateEmbeddedFilesManifest>true</GenerateEmbeddedFilesManifest>
    </PropertyGroup>

    <ItemGroup>
      <EmbeddedResource Include="wwwroot\**\*" />
      <PackageReference Include="Microsoft.Extensions.FileProviders.Embedded" Version="3.1.6" />
    </ItemGroup>

## Register中增加嵌入资源注册服务

```
/* 此处必须增加
using Microsoft.AspNetCore.Builder;
using Senparc.CO2NET.RegisterServices;
using Microsoft.Extensions.FileProviders;
using System.Reflection;

Register : IAreaRegister //注册 XNCF 页面接口（按需选用）
*/

public override IApplicationBuilder UseXncfModule(IApplicationBuilder app, IRegisterService registerService)
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new ManifestEmbeddedFileProvider(Assembly.GetExecutingAssembly(), "wwwroot")
    });

    return base.UseXncfModule(app, registerService);
}
```

## 检测静态资源是否已经嵌入

点击项目邮件，重新生成

![Image text](./images/embedded_static_to_ncf/rebuild_project.png)

在对应的Debug/Release目录下，找到最新生成的dll文件

![Image text](./images/embedded_static_to_ncf/rebuild_project_dll.png)

打开.Net反编译工具，将dll文件拖入，打开查看是否存在资源，并查看资源下是否存在你加入的资源文件，如果存在，说明嵌入成功

![Image text](./images/embedded_static_to_ncf/find_embedded_source.png)

## 如何使用嵌入的静态资源

![Image text](./images/embedded_static_to_ncf/use_embedded_resource.png)