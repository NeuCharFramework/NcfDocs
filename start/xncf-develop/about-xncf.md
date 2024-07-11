# Xncf 的构成

## 前言

此文档介绍 Xncf 模块代码的重要组成部分，有助于开发者了解其原理，开发 Xncf 不需要手敲这些代码，可以使用 [Xncf模块生成器](/start/xncf-develop/create-xncf) 可视化配置并生成。

## 什么是 Xncf？

Xncf（XNCF）是组成 NCF 系统功能的各个独立模块的称呼，通常以单一的项目出现（如类库，使用 .csproj 引入解决方案），特殊情况下也可以由多个项目组成。为了能够在发布包中包含 Xncf 模块的 dll，Xncf 需要被 Web 项目（Senparc.Web）直接或间接引用。

> Xncf 可以作为 DDD 开发模式中的一个完整 Domain 的项目进行规划，其中包含了所有 DDD 需要的标准结构。

XNCF 项目的文件构成可以理解为一个普通的类库，加上一个特殊的 [Register 类](#register-类) 构成。

> 因此，您几乎可以将任何的类库，通过添加一个 `Register` 类即可变为一个即插即用的 XNCF 模块！

## Xncf 的命名规则

Xncf 项目的命名（通常也是 dll 的文件名），每一个 Xncf 模块都需要具备一个全局唯一的模块名称，需要符合以下格式：

`<组织名字>`.Xncf.`<模块名称>`

- `<组织名字>` 通常为公司或团队的名字，用于区分不同组织提供的模块，防止`<模块名称>`冲突
- `.Xncf.` 固定字符，表明这是一个 Xncf 模块，同时用于分割组织名字和模块名称
- `<模块名称>` 是当前模块的名称，此名称中不能再出现 `.`，如还存在下级模块可以试用下划线 `_`

最终 Xncf 命名如：`Senparc.Xncf.DatabaseTool` 或 `Senparc.Xncf.DatabaseTool_Backup`。

## Xncf 模块的几个重要概念

| 对象  |   说明      |
|-------|-------------|
| Register 类 |       |
| [XncfRegister] 特性      |             |
| IxncfRegister 接口      |             |
| 更多可选接口     |             |



### IXncfRegister 接口（必须）
必须要包含的接口是：`IXncfRegister`（所属基础库：<a href="/NcfPackageSources/libs/Senparc.Ncf.XscfBase.html">Senparc.Ncf.XncfBase</a>）。

`IXncfRegister` 接口中包含了模块名称、全局唯一编号、版本号、菜单名称、图标等模块元数据信息，并且可以定义模块安装、卸载等过程中需要执行的代码。

关于 `IXncfRegister` 接口的详细介绍请见：[IXncfRegister](/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IXncfRegister.html)。

为了方便开发者使用，NCF 默认提供了一个基于 `IXncfRegister` 接口的实现：`XncfRegisterBase`，因此，通常我们只需要在项目中，创建一个 `Register.cs` 类文件，然后继承 `XncfRegisterBase` 基类，并实现其指定的接口，即可使这个项目快速变成一个 Xncf 模块。


#### [XncfRegister] 特性

在每个模块项目自定义的 `Register` 类上，使用 [XncfRegister] 特性，使系统可以快速识别当前类为 Xncf 注册类（预留功能，建议都加上）。

根据上述的要求，一个最小化的 Xncf 模块注册类，可能如下所示：

```csharp
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

        #endregion
    }
}
```

#### [XncfOrder] 特性

您可以为 Register 类添加 [XncfOrder] 特性，来设置当前 XNCF 模块的载入次序。此特性构造函数内提供了排序的数字（`order` 参数），在系统载入时，按照降序排列（数字越大越在前），如：

```csharp
    [XncfRegister]
    [XncfOrder(4090)]
    public partial class Register : XncfRegisterBase, IXncfRegister
    {
        //...
    }
```

`order` 参数约定：

`0`：默认值，不提供 [XncfOrder] 特性的模块默认为 0，通常这样的模块载入顺序没有特别要求

`1` ~ `5000`：需要按照顺序预加载的重要模块

`5000` 以上：系统及基础模块，常规模块请勿占用

`59xx`：系统底层基础模块，常规模块请勿占用

`58xx`：AI 相关基础模，常规模块请勿占用块


<!-- TODO：更多重写方法 -->

### 更多可选接口

在已经实现了 `IXncfRegister` 接口的基础上，根据当前模块需要支持的功能，可以继续添加可选接口，扩充 Xncf 的能力。常用的可选接口有：

接口名称           | 支持功能
------------------|--------
IXncfFunction     | 函数（Function），即最小化完成一个任务的方法
IXncfDatabase     | 数据库，支持多数据库
IXncfRazorRuntimeCompilation  | 包含网页时，对 RazorPage 进行运行时编译
IXncfMiddleware   | 定义一个 .NET Core 的中间件（Middleware）
IXncfThread       | 支持后台线程

每个接口具体的定义和最终效果都会在后续开发中介绍。

#### IXncfDatabase 接口（可选）

Register 类继承 IXncfDatabase 并实现接口方法后，即可激活数据库能力。

> 为了使代码更清晰，模板中的代码使用了“部分类（partial）”，相关代码独立储存在 `Register.Database.cs` 中（以下其他接口同理）。

模板默认代码如下：

```csharp
    public partial class Register : IXncfDatabase  //注册 XNCF 模块数据库（按需选用）
    {
        #region IXncfDatabase 接口

        /// <summary>
        /// 数据库前缀
        /// </summary>
        public const string DATABASE_PREFIX = "Senparc_PromptRange_";

        /// <summary>
        /// 数据库前缀
        /// </summary>
        public string DatabaseUniquePrefix => DATABASE_PREFIX;

        /// <summary>
        /// 动态获取数据库上下文
        /// </summary>
        public Type TryGetXncfDatabaseDbContextType => MultipleDatabasePool.Instance.GetXncfDbContextType(this);

        public void OnModelCreating(ModelBuilder modelBuilder)
        {
            //实现 [XncfAutoConfigurationMapping] 特性之后，可以自动执行，无需手动添加
            //modelBuilder.ApplyConfiguration(new AreaTemplate_ColorConfigurationMapping());
        }

        public void AddXncfDatabaseModule(IServiceCollection services)
        {
            //DOT REMOVE OR MODIFY THIS LINE 请勿移除或修改本行 - Entities Point
            //ex. services.AddScoped(typeof(Color));
        }

        #endregion
    }
```

`DATABASE_PREFIX` 提供了一个数据库前缀的常量，默认的命名规则为”`组织名字`_`模块名称`_”，最终如：`Senparc_PromptRange_`。

`TryGetXncfDatabaseDbContextType` 属性为特定方法，用于指定多数据库配置中当前数据库上下文类，默认代码无需修改。

`OnModelCreating` 方法将在 EF Core 数据库初始化时候执行（在 DbContext 的 OnModelCreating() 方法中执行）。

`AddXncfDatabaseModule` 用于配置针对数据库相关依赖注入配置。

<!-- TODO：介绍 SenparcEntities -->

<!-- 
以下逐一介绍。

#### IXncfRazorRuntimeCompilation 接口（可选）


#### IXncfMiddleware 接口（可选）


#### IXncfThread 接口（可选） -->
