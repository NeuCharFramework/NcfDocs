# Windows部署NCF站点

为更加方便大家一站式打通所有使用NCF的环节，给大家带来如何发布最新版本的站点

无论你的网站在开发环境做的多么的炫酷，实用，最终都是要拉出来遛遛的，所以上测试环境，正式环境，使用云服务器是必经之路

这一节就是主要帮助大家排除掉在发布和部署过程中的那些路障，让大家把站点从开发环境部署到测试，正式环境，如自动挡换挡一样丝滑

最终大家还是要把精力放在主要的核心业务上，不要让这些辅助的工作耽误大家大把的时间

下面我们就一起来说一说如何进行发布

## 步骤

1.重新生成编译

<img src="./images/deploy-website-rebuild.png">

在Visual Studio的工具的左下角会显示

<img src="./images/deploy-website-rebuild-success.png">

这样说明全部生成成功了，再点击发布

<img src="./images/deploy-website-publish-01.png">

选择发布方式的时候，选文件夹

<img src="./images/deploy-website-publish-02.png">

2.发布前配置参数

<img src="./images/deploy-website-before-parameter-config.png">

图中所示：

配置：选择是Debug还是Release，还是其他

目标框架：不同的.NET Core的版本，net6.0/7.0等

部署模式：框架依赖|独立部署（俩者的区别，可以了解有关部署模式的信息）

目标运行时：可以选择可移植或者指定的运行时环境，如win-x64,linux等

3.发布

在上一步后，点击保存

<img src="./images/deploy-website-publish-03.png">

然后点击发布

<img src="./images/deploy-website-publish-04.png">

发布完成后，看这俩个关键点，说明发布成功了

<img src="./images/deploy-website-publish-05.png">

进入生成的文件的目录

<img src="./images/deploy-website-publish-06.png">

4.压缩文件

<img src="./images/deploy-website-zipfile-01.png">

全选文件，点击右键压缩到一个zip的压缩包

<img src="./images/deploy-website-zipfile-02.png">

<img src="./images/deploy-website-zipfile-03.png">

5.复制文件到服务器上

这个就是CTRL+C（复制） , CTRL+V（粘贴），粘贴的时候贴到服务器上就行

6.建立IIS的站点

首先打开IIS

<img src="./images/deploy-website-create-01.png">

添加网站

<img src="./images/deploy-website-create-02.png">

主要关注红框处的几个地方

<img src="./images/deploy-website-create-03.png">

这个是创建完成的站点

<img src="./images/deploy-website-create-04.png">

7.配置IIS的访问 .NET Core 的站点信息

创建站点的同时会生成一个应用程序

<img src="./images/deploy-website-application-pool-01.png">

咱现在部署的项目是.NET Core的，所以这个地方需要修改

<img src="./images/deploy-website-application-pool-02.png">

按照这个配置进行修改，修改完成后，选择高级设置

<img src="./images/deploy-website-application-pool-03.png">

打开后，配置参数为红框中的值

<img src="./images/deploy-website-application-pool-04.png">

先停止应用程序，再启用

<img src="./images/deploy-website-application-pool-05.png">

如果启用报错，就一直启用，直到启用成功为止

8.运行站点（这个过程会出现很多奇奇怪怪的问题），根据不同的问题，处理的方式也不大一样

比较常见的报错如下

```csharp
HTTP Error 500.31 - ANCM Failed to Find Native Dependencies
Common solutions to this issue:
The specified version of Microsoft.NetCore.App or Microsoft.AspNetCore.App was not found.
```

字面意思也就是说找不到 Microsoft.NetCore.App 及 Microsoft.AspNetCore.App 的对应的版本

官方错误文档是：https://learn.microsoft.com/zh-cn/aspnet/core/test/troubleshoot-azure-iis?view=aspnetcore-7.0

<img src="./images/deploy-website-run-01.png">

我们去运行一下下面的命令

```csharp
dotnet --info
```

结果显示

<img src="./images/deploy-website-run-02.png">

上面的图比较关键，要从思维中先理解安装的这些是不是IIS正在使用的，如果不匹配也会报错

看一下下面的图，已经是调整好的环境

<img src="./images/deploy-website-run-03.png">

有的同学可能要问了，SDK的版本和Host的版本怎么去知道到底对不对呢

我们来到下载.NET Core SDK的地方：https://dotnet.microsoft.com/zh-cn/download/dotnet/6.0

<img src="./images/deploy-website-run-04.png">

主要去观察红框处的内容，便于理解

<img src="./images/deploy-website-run-05.png">

如果使用 dotnet --info 出来的.NET Core SDK的版本和Host的版本对应上了，那么基础的配置就完成了，但到这里还没完，他可能还会报错500.31，这时候就需要根据提示的信息去排查了，例如

Windows日志排查，在DOS窗口中输入eventvwr，则可以显示，如下图中的错误标识的，找到跟IIS相关的，根据提示处理即可

<img src="./images/deploy-website-run-06.png">

例如：

```csharp
Could not find 'aspnetcorev2_inprocess.dll'. Exception message:
It was not possible to find any compatible framework version
The framework 'Microsoft.NETCore.App', version '6.0.0' was not found.
  - The following frameworks were found:
      3.1.3 at [C:\Program Files (x86)\dotnet\shared\Microsoft.NETCore.App]

You can resolve the problem by installing the specified framework and/or SDK.

The specified framework can be found at:
  - https://aka.ms/dotnet-core-applaunch?framework=Microsoft.NETCore.App&framework_version=6.0.0&arch=x86&rid=win10-x86
```

意思是 6.0.0 版本的 Microsoft.NETCore.App 没安装，下面给出来安装地址

https://aka.ms/dotnet-core-applaunch?framework=Microsoft.NETCore.App&framework_version=6.0.0&arch=x86&rid=win10-x86

安装完成后，即可访问站点，如果还有错误，就继续根据提示修复，直到没有IIS的错误为止

最后呈现出来的就是我们看到的网站的信息，如果还有什么不清楚的，可以到社区群直接问我

<img src="./images/deploy-website-run-07.png">
