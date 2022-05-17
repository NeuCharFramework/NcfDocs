# 自动创建对的 Xncf 模块 Sample 详解

在完成 [创建第一个 Xncf 模块](/start/xncf-develop/create-xncf.html) 操作之后，我们就得到了一个自定义的 Xncf 项目，其中包含了 Sample 示例代码，下面我们就来对这个项目进行代码层面的功能介绍，并尝试对齐进行修改，以演示如何在基础代码纸上，实现自己的业务逻辑。


## 文件结构

用于支撑 `MySenparc.Xncf.MyApp` 功能的项目文件结构如下：

<img src="./images/about-custom-xncf/01.png" />

其中的重要文件件和文件的作用如下：

文件夹                            |    文件               |    说明
--------------------------------|-----------------------|----------
MySenparc.Xncf.MyApp            |                       | MySenparc.Xncf.MyApp 项目跟目录
┣ App_Data                      |                       | App_Data 系统文件夹，此文件夹内的内容受访问保护，无法从 URL 直接访问
┃ &nbsp; ┗ Database        |                       | XML 数据库文件夹，使用 [CO2NET](https://github.com/Senparc/Senparc.CO2NET) 的 XmlDataContext 自动读取，开发过程无需关心
┃ &nbsp; &nbsp; &nbsp; ┗   | SenparcConfig.config  | 数据库连接字符串配置文件，自动读取
┣ Areas                         |                       | 存放 Area 页面的文件夹（.NET 系统约定）
┃ &nbsp; ┗ Admin           |                       | 存放管理员后台 Admin 页面文件，其下面的文件结构和常规 RazorPage 网站无异
┣ Functions                     |                       |
┃ &nbsp; ┗                 | MyFunction.cs         | 定义了一个 `MyFunction` 的执行方法（Function）
┣ Migrations                    |                       | 存放数据库迁移代码的项目（自动生成）
┃ &nbsp; ┣ Migrations.MySql |                       | MySQL 数据库的迁移文件（自动生成）
┃ &nbsp; ┣ Migrations.SQLite |                      | SQLite 数据库的迁移文件（自动生成）
┃ &nbsp; ┗ Migrations.SqlServer |                   | SQL Server 数据库的迁移文件（自动生成）
┣ Models                        |                       | 存放实体模型的文件夹
┃ &nbsp; ┗ DatabaseModel   |         | 存放数据库实体类
┃ &nbsp; ┃ &nbsp; ┣ Dto   |     | 存放 Dto 类的文件夹
┃ &nbsp; ┃ &nbsp; ┃ &nbsp; ┗   | ColorDto.cs    | Color 类的 Dto 类
┃ &nbsp; ┃ &nbsp; ┣ Mapping   |     | 存放数据库映射（Mapping）定义的文件夹（EntityFramework）
┃ &nbsp; ┃ &nbsp; ┃ &nbsp; ┗   | MyApp_ColorConfigurationMapping.cs    | Color 实体的 Mapping 定义
┃ &nbsp; ┃ &nbsp; ┣  | Color.cs | 数据库实体类：Color
┃ &nbsp; ┃ &nbsp; ┣  | MyAppSenparcEntities.cs | 当前 Xncf 模块的数据库上下文实体（DbContext），<br>同时作为 SQLite（in-memory 模式）的数据库上下文（DbConext）引导文件
┃ &nbsp; ┃ &nbsp; ┗  | SenparcDbContextFactory.cs | 为 `MyAppSenparcEntities` 服务的设计时 DbContext 工厂（DesignTimeDbContextFactory）
┃ &nbsp; ┗ MultipleDatabase|                       | 存放多数据库上下文的引导文件
┃ &nbsp; &nbsp;  &nbsp; ┣  | MyAppSenparcEntities_MySql.cs | MySql 数据库的数据库上下文（DbConext）引导文件，**基类为MyAppSenparcEntities**
┃ &nbsp; &nbsp;  &nbsp; ┗  | MyAppSenparcEntities_SqlServer.cs | SQL Server 数据库的数据库上下文（DbConext）引导文件，**基类为MyAppSenparcEntities**
┣ Services                      |                       | 存放业务逻辑的服务层（Service）
┃ &nbsp; ┗                 | ColorService.cs       | Color 领域的服务
┣                               | Register.cs           | Xncf 模块注册类（部分类 - 实现 IXncfRegister 接口），提供 Xncf 模块基础能力
┣                               | Register.Area.cs      | Xncf 模块注册类（部分类 - 实现 IAreaRegister 和 IXncfRazorRuntimeCompilation 接口），提供网页能力
┗                               | Register.Database.cs           | Xncf 模块注册类（部分类 - 实现 IXncfDatabase 接口），提供数据库能力

> 提示：以上所有文件都是使用 XncfBuilder 模块自动生成的，无需做任何手动编写！

## Register.cs 注册文件

在 [Xncf 的构成](/start/xncf-develop/about-xncf.html) 我们已经介绍了：每个 Xncf 模块都必须有一个类实现 `IXncfRegister` 接口，在这个项目中，就由 Register.cs 中的 Register 类来实现。

为了让逻辑更加清楚，我们将 Register 类设置为部分类（partial class），分别用于实现 IXncfRegister、IAreaRegister 和 IXncfDatabase 三个接口。

### Register.cs

`Register.cs` 文件定义了 Register 类，并且继承了系统默认实现 `IXncfRegister` 接口的抽象类 `XncfRegisterBase`，代码如下：

```
using Microsoft.Extensions.DependencyInjection;
using MySenparc.Xncf.MyApp.Functions;
using MySenparc.Xncf.MyApp.Models.DatabaseModel;
using MySenparc.Xncf.MyApp.Models.DatabaseModel.Dto;
using MySenparc.Xncf.MyApp.Services;
using Senparc.Ncf.Core.Enums;
using Senparc.Ncf.Core.Models;
using Senparc.Ncf.XncfBase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MySenparc.Xncf.MyApp
{
    [XncfRegister]
    public partial class Register : XncfRegisterBase, IXncfRegister
    {
        #region IXncfRegister 接口

        public override string Name => "MySenparc.Xncf.MyApp";

        public override string Uid => "DD4E1973-7291-4E76-892F-E32A5CA57139";//必须确保全局唯一，生成后必须固定，已自动生成，也可自行修改

        public override string Version => "0.1";//必须填写版本号

        public override string MenuName => "自动生成地模块";

        public override string Icon => "fa fa-star";

        public override string Description => "这是一个使用 XncfBuilder 自动生成的模块";

        public override IList<Type> Functions => new Type[] { typeof(MyFunction) };


        public override async Task InstallOrUpdateAsync(IServiceProvider serviceProvider, InstallOrUpdate installOrUpdate)
        {
            //安装或升级版本时更新数据库
            await base.MigrateDatabaseAsync(serviceProvider);

            //根据安装或更新不同条件执行逻辑
            switch (installOrUpdate)
            {
                case InstallOrUpdate.Install:
                    //新安装
                    #region 初始化数据库数据
                    var colorService = serviceProvider.GetService<ColorService>();
                    var color = colorService.GetObject(z => true);
                    if (color == null)//如果是纯第一次安装，理论上不会有残留数据
                    {
                        ColorDto colorDto = await colorService.CreateNewColor().ConfigureAwait(false);//创建默认颜色
                    }
                    #endregion
                    break;
                case InstallOrUpdate.Update:
                    //更新
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public override async Task UninstallAsync(IServiceProvider serviceProvider, Func<Task> unsinstallFunc)
        {
            #region 删除数据库（演示）

            var mySenparcEntitiesType = this.TryGetXncfDatabaseDbContextType;
            MyAppSenparcEntities mySenparcEntities = serviceProvider.GetService(mySenparcEntitiesType) as MyAppSenparcEntities;

            //指定需要删除的数据实体

            //注意：这里作为演示，在卸载模块的时候删除了所有本模块创建的表，实际操作过程中，请谨慎操作，并且按照删除顺序对实体进行排序！
            var dropTableKeys = EntitySetKeys.GetEntitySetInfo(this.TryGetXncfDatabaseDbContextType).Keys.ToArray();
            await base.DropTablesAsync(serviceProvider, mySenparcEntities, dropTableKeys);

            #endregion

            await unsinstallFunc().ConfigureAwait(false);
        }

        #endregion
    }
}
```

### 元数据信息

在实现 IXncfRegister 接口的代码中，定义了 Xncf 包的元数据信息：

``` C#
        public override string Name => "MySenparc.Xncf.MyApp";

        public override string Uid => "DD4E1973-7291-4E76-892F-E32A5CA57139";//必须确保全局唯一，生成后必须固定，已自动生成，也可自行修改

        public override string Version => "0.1";//必须填写版本号

        public override string MenuName => "自动生成地模块";

        public override string Icon => "fa fa-star";

        public override string Description => "这是一个使用 XncfBuilder 自动生成的模块";
```
除 Uid 为随机生成以外，其他参数都是按照创建模块时填写的信息自动生成的。

### 函数列表

Register.cs 还包含了一个定义当前模块执行函数(Function）的类型列表：

``` C#
        public override IList<Type> Functions => new Type[] { typeof(MyFunction) };
```

> 关于 MyFunction 会在下文详细介绍。

### 安装和更新方法

`InstallOrUpdateAsync()` 方法用于定义在模块被安装或更新的过程中，需要执行的代码。其中：

``` 
            //安装或升级版本时更新数据库
            await base.MigrateDatabaseAsync(serviceProvider);
```
`base.MigrateDatabaseAsync()` 方法可以根据当前设置的数据库类型，自动匹配数据库迁移文件（Migration），并且自动安装到数据库中。

接下去的代码对“安装”或“更新”状态做了判断，如果是新安装模块，那么尝试从数据库中获取第一个 Color 的实例对象，如果不存在，则新建一个。这样确保系统中始终有一条 Color 记录存在。

更多关于 Service 的介绍请看[这里]()。

### 删除方法

`UninstallAsync()` 方法用于定义模块在删除时需要执行的代码。

其中，获取数据库上下文实体的代码很关键：
``` C#
var mySenparcEntitiesType = this.TryGetXncfDatabaseDbContextType;
MyAppSenparcEntities mySenparcEntities = serviceProvider.GetService(mySenparcEntitiesType) as MyAppSenparcEntities;
```
> 第 1 行：获取当前的`数据库配置类`的类型（例如判断是 MySQL 还是 SQLServer）<br>
> 第 2 行：根据第 1 行获得到的类型，获取 MyAppSenparcEntities，注意：这里虽然定义类型为 MyAppSenparcEntities，但实际获取到的可能是 MyAppSenparcEntities_MySql（当前配置为 MySQL 数据库） 或 MyAppSenparcEntities_SqlServer（当前配置为 SQL Server 数据库）。

除了在此类特殊情况下，我们需要用到 MyAppSenparcEntities_MySql 或 MyAppSenparcEntities_SqlServer 等子类，在常规系统开发过程中，我们只需要记住 **`SenparcEntities`** 这一个数据库上下文类型即可，因为 NCF 已经将所有的 Xncf 的数据库上下文进行了合并。此处单独取出，是出于安全考虑，使程序无法“伤害”到数据库的其他部分。

### Register.Area.cs

`Register.Area.cs` 是 `Register.cs` 部分类的一个延伸，实现了网页功能的接口（IAreaRegister 和 IXncfRazorRuntimeCompilation）。
其中，IAreaRegister 是提供网页集成的功能，IXncfRazorRuntimeCompilation 提供在运行时编译 Razor Page 的附加能力，这两个接口都是可选的，根据实际需要的情况选用。

这两个接口的配置也非常简单，而且都是为网页服务，因此就写在了同一个文件中，代码如下：

``` C#
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Senparc.CO2NET.Trace;
using Senparc.Ncf.Core.Areas;
using Senparc.Ncf.Core.Config;
using System.Collections.Generic;
using System.IO;

namespace MySenparc.Xncf.MyApp
{
	public partial class Register : IAreaRegister, //注册 XNCF 页面接口（按需选用）
									IXncfRazorRuntimeCompilation  //赋能 RazorPage 运行时编译
    {
        #region IAreaRegister 接口

        public string HomeUrl => "/Admin/MyApp/Index";

        public List<AreaPageMenuItem> AareaPageMenuItems => new List<AreaPageMenuItem>() {
             new AreaPageMenuItem(GetAreaHomeUrl(),"首页","fa fa-laptop"),
             new AreaPageMenuItem(GetAreaUrl($"/Admin/MyApp/DatabaseSample"),"数据库操作示例","fa fa-bookmark-o"),
            };

        public IMvcBuilder AuthorizeConfig(IMvcBuilder builder, IWebHostEnvironment env)
        {
            builder.AddRazorPagesOptions(options =>
            {
                //此处可配置页面权限
            });
            SenparcTrace.SendCustomLog("MyApp 启动", "完成 Area:MySenparc.Xncf.MyApp 注册");
            return builder;
        }

        #endregion

        #region IXncfRazorRuntimeCompilation 接口
        public string LibraryPath => Path.GetFullPath(Path.Combine(SiteConfig.WebRootPath, "..", "..", "MySenparc.Xncf.MyApp"));
        #endregion
    }
}

```

#### IAreaRegister 接口

`HomeUrl` 属性是必须提供的网页首页的地址（通常是后台管理的首页，也可以是前台页面）。

`AareaPageMenuItems` 属性定义了需要在左侧菜单中显示的页面，上面配置了 2 个页面，分别是“首页”和“数据库操作示例”，效果如下：

<img src="./images/about-custom-xncf/02.png" />

> 提示：此菜单可以设置当前后台的页面，也可以设置外链等任意链接，`GetAreaHomeUrl()` 方法可以自动获取到所定义的首页（HomeUrl）的系统地址。

`AuthorizeConfig()` 方法中可以定义一系列页面权限等配置。

#### IXncfRazorRuntimeCompilation 接口

`IXncfRazorRuntimeCompilation` 接口只有一个属性：`LibraryPath`，其定义的是当前项目的物理路径，便于系统自动侦查文件变化，并自动编译。

### Register.Database.cs

`Register.Database.cs` 也是 `Register.cs` 部分类的一个延伸，实现了数据库相关功能的配置。其代码也很简单：

``` C#
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using Senparc.Ncf.Database;
using Senparc.Ncf.Core.Models;

namespace MySenparc.Xncf.MyApp
{
    public partial class Register : IXncfDatabase  //注册 XNCF 模块数据库（按需选用）
    {
        #region IXncfDatabase 接口

        /// <summary>
        /// 数据库前缀
        /// </summary>
        public const string DATABASE_PREFIX = "MySenparc_MyApp_";

        /// <summary>
        /// 数据库前缀
        /// </summary>
        public string DatabaseUniquePrefix => DATABASE_PREFIX;

        /// <summary>
        /// 数据库前缀
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
}
```

`DATABASE_PREFIX` 常量定义了数据库表的前缀，并赋值给 `DatabaseUniquePrefix` 属性，这样可以使模块生成的数据库不与其他模块产生冲突。

`TryGetXncfDatabaseDbContextType` 属性的赋值可以看成是一个固定用法，其作用是获取当前的“数据库配置类”的类型。

`OnModelCreating()` 方法可以在数据库初始化时，操作模型的映射，这是 EntityFrameworkCore 的一个常用方法。但在 NCF 中，我们对其进行了优化，只要有一个类，使用了 `[XncfAutoConfigurationMapping]` 特性，即可自动完成映射，无需编写代码。在当前 Sample 中的 `MyApp_ColorConfigurationMapping.cs` 中就可以看到这样的用法。

`AddXncfDatabaseModule()` 方法用于类似 startup.cs 中的设置方法，其中的代码会在模块加载时（跟随启动启动）被执行。例如在这个方法里，我们可以使用 `services.AddScoped()` 方法进行依赖注入的设置。

## 函数(Function）



## 网页



## 数据库



