# Environment Requirements

## Supported Editors

- Visual Studio 2022+
- VS Code Latest Version
- JetBrains Rider
- All other editors that support C# compilation

## .NET Framework

- .NET 8, SDK download link: [https://dotnet.microsoft.com/en-us/download/dotnet/8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
  > The base library already supports .NET Standard 2.1, compatible with .NET 5 and .NET 6+, NCF templates have been released using .NET 8.

## Database

- NCF supports multiple databases, currently supported are: SQLite, SQL Server, MySQL, PostgreSql, Oracle, DM (Dameng), we will also support more databases, including:
  - Azure Cosmos DB
  - DB2
  - More databases are welcome to tell us: [Post](https://github.com/NeuCharFramework/NCF/issues)

The default database ORM framework is Entity Framework Core (EF Core).

> Note:<br>
>
> 1. If using EF Core - SQL Server, you need to use SQL Server 2012 or above version database<br>
> 2. We provide two sets of configuration methods for Oracle for V11 and V12+, please choose according to the version you are using.

## Operating System

Currently, .NET Core already supports almost all mainstream operating systems:

- Windows
- Linux
- macOS
- Android
- iOS/tvOS/MacCatalyst
- QEMU
- Other operating systems that support .NET Core: [View](https://github.com/dotnet/core/blob/main/release-notes/8.0/supported-os.md)

Install to server: [https://docs.microsoft.com/dotnet/core/install/](https://docs.microsoft.com/dotnet/core/install/)

## CPU Architecture

- X86
- x64
- ARM32
- ARM64
- Other CPU architectures that support .NET Core: [View](https://github.com/dotnet/core/blob/main/release-notes/8.0/supported-os.md)

## Source Code

- During the development of NCF, you can use the "NCF Template" project as the base project (100% open source), and run it without modifying any code. Further development can be done on this basis. Source code: [https://github.com/NeuCharFramework/NCF](https://github.com/NeuCharFramework/NCF)
- Behind the "NCF Template", there is a whole set of base libraries support (also 100% open source). If you need to view, debug, or modify the base package source code, please see this project: [https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources)
