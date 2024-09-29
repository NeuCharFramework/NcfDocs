# DatabasePlant

Plant means "helipad," which implies that when you are ready to "service" a module, you will need it.

## Principle

In the NCF Web template solution, there is a special project: `Senparc.Web.DatabasePlant`.

Using `Senparc.Web.DatabasePlant` makes it easy to perform manual migrations, database updates, and other operations on the database.

The `Senparc.Web.DatabasePlant` project by default references the `Senparc.Ncf.DatabasePlant` library, and it can also manually reference other projects or pre-packaged Nuget packages or dlls.

Therefore, as long as you reference the XNCF module or other projects in `Senparc.Web.DatabasePlant`, and then use `Senparc.Web.DatabasePlant` as the startup project, you can instantly empower other dependent projects with all the capabilities that `Senparc.Web.DatabasePlant` already has; and this connection will be automatically severed when published (see the end of the text), without any burden.

It's like an airplane parked on the helipad, having access to all ground resources, but once it takes off, it sheds all the weight and goes into battle.

<img src="./images/database_plant-graph.png" width="80%"/>

> [Senparc.Ncf.DatabasePlant](/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant.html) references all the DatabaseConfiguration projects implemented by NCF officially, such as: Senparc.Ncf.Database.MySql, Senparc.Ncf.Database.SqlServer, etc.

## Reason

So, why must we use `DatabasePlant` to complete the migration?

First, when performing a series of EF Core migrations, the target project must have a clear runtime version, such as .NET Core 3.1 or .NET 6.0, etc. Most XNCF modules, to achieve better compatibility and flexibility, generally only choose standard library names and versions like .NET Standard 2.1. If you forcibly use .NET Standard for migration operations, errors will occur:

<img src="./images/database_plant-runtime-error.png" />

Secondly, since NCF supports multiple databases, this means that when generating multiple databases, the current project must load all the corresponding EF Core toolkits for multiple databases to complete the EF Core database migration operations. For example, when we need to complete the synchronous migration of SQL Server + MySQL + SQLite databases, we need to reference the following Nuget packages in the project:

> Microsoft.EntityFrameworkCore.SqlServer<br>
> Pomelo.EntityFrameworkCore.MySql<br>
> Microsoft.EntityFrameworkCore.Sqlite<br> <br>
> Sometimes, to facilitate editing and running richer features, we also need to load more extension packages.

Obviously, for the same project, just to migrate the database, installing so much "weight" is not the "fighter jet" architecture we want.

Therefore, we integrate all the packages that may be needed into `DatabasePlant`, and only reference them during the special development phase of the project, to achieve synchronous migration operations for all databases. After being published to the production environment, each module can still be as light as a feather!

Yes, you might have already thought: `Any XNCF module project does not need to reference any specific database package (such as: Microsoft.EntityFrameworkCore.SqlServer)!`

This design makes modularization extremely lightweight!

## Tips

### Running Efficiency

`Senparc.Web.DatabasePlant` will not be published together under the Release compilation settings, so it will not affect the running efficiency of the production environment.

### Specifying the Database at Runtime

So how does the module clearly point to and use a specific database in the production environment when it does not reference any database packages?

Please refer to: [Specifying the Database](/start/database/appoint_database.html)
