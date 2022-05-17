# Xncf 的构成

## 前言

此文档介绍 Xncf 模块代码的重要组成部分，有助于开发者了解其原理，开发 Xncf 不需要手敲这些代码，可以使用 [Xncf模块生成器]() 可视化配置并生成。

## Xncf 模块的必要基础

首先，每个 Xncf 模块，都是一个或多个独立的项目（Project），可以使用 .csproj 文件（如果使用 C# 开发）打开并管理，并且可以被 NCF Web 项目所引用（直接或间接都可以）；其次，需要一个类，实现用于让 NCF 系统识别 Xncf 模块信息、进行相关操作的接口（通常在项目根目录下创建一个名为 `Register.cs` 的文件，类名为 `Register`）。

> 也可以换一种说法：任何一个独立项目（Project）都可以升级成 Xncf 模块，只需要实现一些必须的接口。

### IXncfRegister 接口（必须）
必须要包含的接口是：`IXncfRegister`（所属基础库：<a href="/NcfPackageSources/libs/Senparc.Ncf.XscfBase.html">Senparc.Ncf.XncfBase</a>）。

`IXncfRegister` 接口中包含了模块名称、全局唯一编号、版本号、菜单名称、图标等模块元数据信息，并且可以定义模块安装、卸载等过程中需要执行的代码。

关于 `IXncfRegister` 接口的详细介绍请见：[IXncfRegister](/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IXncfRegister.html)。

为了方便开发者使用，NCF 默认提供了一个基于 `IXncfRegister` 接口的实现：`XncfRegisterBase`，因此，通常我们只需要在项目中，创建一个 `Register.cs` 类文件，然后继承 `XncfRegisterBase` 基类，并实现其指定的接口，即可使这个项目快速变成一个 Xncf 模块。


#### [XncfRegister] 特性

在每个模块项目自定义的 `Register` 类上，使用 [XncfRegister] 特性，使系统可以快速识别当前类为 Xncf 注册类（预留功能，建议都加上）。

根据上述的要求，一个最小化的 Xncf 模块注册类，可能如下所示：

``` C#
using Senparc.Ncf.XncfBase;
using System;
using System.Collections.Generic;

namespace Senparc.Xncf.XncfBuilder
{
    [XncfRegister]
    public partial class Register : XncfRegisterBase, IXncfRegister
    {
        #region IRegister 接口

        public override string Name => "Senparc.Xncf.XncfBuilder";

        public override string Uid => "C2E1F87F-2DCE-4921-87CE-36923ED0D6EA";

        public override string Version => "0.2.6";

        public override string MenuName => "XNCF 模块生成器";

        public override string Icon => "fa fa-plus";

        public override string Description => "快速生成 XNCF 模块基础程序代码，或 Sample 演示，可基于基础代码扩展自己的应用";

        public override IList<Type> Functions => new Type[] { };

        #endregion
    }
}
```

### 更多可选接口

在已经实现了 `IXncfRegister` 接口的基础上，根据当前模块需要支持的功能，可以继续添加可选接口，扩充 Xncf 的能力。常用的可选接口有：

接口名称           | 支持功能
------------------|--------
IXscfFunction     | 函数（Function），即最小化完成一个任务的方法
IXscfDatabase     | 数据库，支持多数据库
IXscfRazorRuntimeCompilation  | 包含网页时，对 RazorPage 进行运行时编译
IXscfMiddleware   | 定义一个 .NET Core 的中间件（Middleware）
IXscfThread       | 支持后台线程

每个接口具体的定义和最终效果都会在后续开发中介绍。


<!-- 
以下逐一介绍。

#### IXscfFunction 接口（可选）



#### IXscfDatabase 接口（可选）


#### IXscfRazorRuntimeCompilation 接口（可选）


#### IXscfMiddleware 接口（可选）


#### IXscfThread 接口（可选） -->
