# Environment Requirements

## Supported Editors

- Visual Studio 2022+
- VS Code Latest Version
- JetBrains Rider
- All other editors that support C# compilation

## .NET SDK

- The current NCF template, the `NcfPackageSources` simulated site, and the XNCF
  template use **.NET 10** as their development baseline. Download the SDK from
  [https://dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0).
- For an older NCF release or NuGet package, follow that release tag and the
  `TargetFramework` in its project file instead of applying old tutorials to the
  current source tree.

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
- Other supported operating systems: [See the .NET 10 support policy](https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md)

Install to server: [https://docs.microsoft.com/dotnet/core/install/](https://docs.microsoft.com/dotnet/core/install/)

## CPU Architecture

- X86
- x64
- ARM32
- ARM64
- Other supported CPU architectures: [See the .NET 10 support policy](https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md)

## GPU and Local AI Training

The optional AIKernel local fine-tuning Worker is a separate Python service. GPU support must be verified inside the Worker's virtual environment; a working `nvidia-smi` command alone does not make PyTorch CUDA-enabled. On NVIDIA ARM64 hosts, check `uname -m`, the driver, `torch.version.cuda`, and `torch.cuda.is_available()` before configuring a CUDA Worker. Use the same Python architecture and CUDA wheel supported by the host, keep Worker keys outside source control, and keep one Worker process per `NCF_DATA_ROOT`.

See the [AIKernel local fine-tuning guide](../../NcfPackageSources/xncf/aikernel-local-fine-tuning.md#nvidia-cuda-and-arm64-host-checklist) for the CUDA/ARM64 installation sequence, dependency integrity checks, `/health` verification, and troubleshooting.

## Source Code

- During the development of NCF, you can use the "NCF Template" project as the base project (100% open source), and run it without modifying any code. Further development can be done on this basis. Source code: [https://github.com/NeuCharFramework/NCF](https://github.com/NeuCharFramework/NCF)
- Behind the "NCF Template", there is a whole set of base libraries support (also 100% open source). If you need to view, debug, or modify the base package source code, please see this project: [https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources)
