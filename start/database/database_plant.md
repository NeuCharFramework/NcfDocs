# 数据库停机坪（DatabasePlant）

Plant 意为“停机坪”，这意味着当你准备“检修”模块的时候，需要用到它。

## 原理

在 NCF Web 模板解决方案中，有一个特殊的项目：`Senparc.Web.DatabasePlant`。 

使用 `Senparc.Web.DatabasePlant` 可以方便地对数据库进行手动迁移（Migration）、数据库更新（Database Update）等操作。

`Senparc.Web.DatabasePlant` 项目默认引用了 `Senparc.Ncf.DatabasePlant` 库，同时也可以手动引用其他的项目或者已经打包好的 Nuget 包或 dll。

因此，只要在 `Senparc.Web.DatabasePlant` 中引用 XNCF 模块或其他项目，然后以 `Senparc.Web.DatabasePlant` 作为启动项目，即可让其他被依赖项目瞬间被赋能所有 `Senparc.Web.DatabasePlant` 已经具备的能力；而发布时这种连接会被自动切断（见文末），没有任何的累赘。

这就像一架飞机停在停机坪上，就可以拥有一切地面资源，但当起飞后，丢掉一切负重，投入战斗。

<img src="./images/database_plant-graph.png" width="80%"/>

> [Senparc.Ncf.DatabasePlant](/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant.html) 引用了 NCF 官方实现的所有数据库的 DatabaseConfiguration 的项目，如：Senparc.Ncf.Database.MySql、Senparc.Ncf.Database.SqlServer，等等。

## 原因

那么，为什么一定要使用 `DatabasePlant` 来完成迁移呢？

首先，在执行 EF Core 的一系列迁移（Migrations）操作的时候，要求目标项目必须具备明确的 runtime 版本，如 .NET Core 3.1 或 .NET 6.0 等等。而大部分的 XNCF 模块为了达到更好的兼容性和灵活性，一般只会选择如 .NET Standard 2.1 这类的标准库名称及版本，如果强行使用 .NET Standard 进行迁移操作，会出现错误：

<img src="./images/database_plant-runtime-error.png" />

其次，由于 NCF 支持多数据库，这意味着在生成多数库的时候，当前项目必须加载多数库的所有 EF Core 对应工具包，才能完成 EF Core 的数据库迁移操作，例如，当我们需要完成 SQL Server + MySQL + SQLite 三个数据库的同步迁移时，我们至少需要在项目中引用下面的 Nuget 包：
> Microsoft.EntityFrameworkCore.SqlServer<br>
> Pomelo.EntityFrameworkCore.MySql<br>
> Microsoft.EntityFrameworkCore.Sqlite<br>
> <br>
> 有时，我们为了方便编辑和运行更丰富的功能，还需要加载更多的扩展包。

显然，同一个项目，只是为了迁移数据库，就要装上如此多的“负重”，并不是我们想要的“战斗机”架构。

为此，我们将所有可能需要用到的包集成到 `DatabasePlant` 中，只在项目特殊开发阶段引用，即可实现对所有数据库的同步迁移操作，而在发布至生产环境后，每个模块仍然可以身轻如燕！

没错，可能您已经想到了：`任何一个 XNCF 模块项目，都不需要引用任何明确的数据库包（ 如：Microsoft.EntityFrameworkCore.SqlServer）！`

这种设计让模块化达到了极大的轻量级！

## 提示

### 运行效率

`Senparc.Web.DatabasePlant` 在 Release 编译设置下不会一起发布，因此不会对生产环境运行效率产生任何影响。

### 在运行时指定数据库

那么当模块没有引用任何数据库包的情况下，又是怎么在生产环境中明确指向并使用某个数据库的呢？

请参考：[指定数据库](/start/database/appoint_database.html)