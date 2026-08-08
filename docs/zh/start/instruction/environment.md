# 环境要求

## 支持编辑器

- Visual Studio 2022+
- VS Code 最新版本
- JetBrains Rider
- 其他所有支持 C# 编译的编辑器

## .NET SDK

- 当前 NCF 模板、`NcfPackageSources` 模拟站点和 XNCF 模板以 **.NET 10**
  为开发基线。SDK 下载地址：
  [https://dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0)
- 使用旧版 NCF 或旧 NuGet 包时，请以对应发布标签和项目文件中的
  `TargetFramework` 为准，不要用旧版教程推断当前源码的运行时要求。

## 数据库

- NCF 支持多数据库，目前已支持的有：SQLite、SQL Server、MySQL、PostgreSql、Oracle、DM（达梦），我们还将支持更多的数据库，包括：
  - Azure Cosmos DB
  - DB2
  - 更多数据库欢迎告诉我们: [发表](https://github.com/NeuCharFramework/NCF/issues)

默认的数据库 ORM 框架为 Entity Framework Core（EF Core）。

> 注意：<br>
>
> 1. 如使用 EF Core - SQL Server，则需要使用 SQL Server 2012 或以上版本数据库<br>
> 2. 我们为 Oracle 提供了针对 V11 和 V12+ 两套配置方法，请根据所使用版本选用。

## 操作系统

目前 .NET Core 已经支持几乎所有主流操作系统：

- Windows
- Linux
- macOS
- Android
- iOS/tvOS/MacCatalyst
- QEMU
- 其他受支持的操作系统：[查看 .NET 10 支持策略](https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md)

安装.NET Core到服务器：[https://docs.microsoft.com/zh-cn/dotnet/core/install/](https://docs.microsoft.com/zh-cn/dotnet/core/install/)

## CPU 架构

- X86
- x64
- ARM32
- ARM64
- 其他受支持的 CPU 架构：[查看 .NET 10 支持策略](https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md)

## 源码

- NCF 在开发过程中，可以基于“NCF 模板”项目来作为基础项目（100%开源），无需修改任何代码即可完成运行，在此基础上可进一步进行开发，源码：[https://github.com/NeuCharFramework/NCF](https://github.com/NeuCharFramework/NCF)
- 在“NCF 模板”后面，有着一整套基础类库的支撑（同样100%开源），如需查看、调试或修改基础包源代码，请看此项目：[https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources)
