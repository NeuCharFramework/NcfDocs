# 环境要求

## IDE
- Visual Studio 2022+
- VS Code 最新版本

## .NET 框架

- .NET 8 ，SDK下载地址：[https://dotnet.microsoft.com/en-us/download/dotnet/8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- .NET 8（基础库已经支持 .NET Standard 2.1，兼容 .NET 5 和 .NET 6+），NCF 模板已经发布。

## 数据库
- NCF 支持多数据库，目前已支持的有：SQLite、SQL Server、MySQL、PostgreSql、Oracle，我们还将支持更多的数据库，包括：
    - Azure Cosmos DB
    - DB2
    - 更多数据库欢迎告诉我们

默认的数据库 ORM 框架为 Entity Framework Core（EF Core）。

> 注意：<br>
> 1. 如使用 EF Core - SQL Server，则需要使用 SQL Server 2012 或以上版本数据库<br>
> 2. 我们为 Oracle 提供了针对 V11 和 V12+ 两套配置方法，请根据所使用版本选用。

## 源码

- NCF 在开发过程中，可以基于“NCF 模板”项目来作为基础项目（100%开源），进一步进行开发，源码：[https://github.com/NeuCharFramework/NCF](https://github.com/NeuCharFramework/NCF)
- 在“NCF 模板”后面，有着一整套基础类库的支撑（同样100%开源），如需查看或修改基础包源代码，请看此项目：[https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources)


