# Senparc.Ncf.Core

## Overview

Senparc.Ncf.Core is the core library of the NeuCharFramework (NCF). It provides fundamental functionalities and interfaces for the entire framework.

## Features

- **Modular Design**: The framework adopts a modular design, allowing developers to easily extend and customize functionalities.
- **High Performance**: Optimized for high performance, ensuring efficient execution of tasks.
- **Cross-Platform**: Compatible with multiple platforms, including Windows, Linux, and macOS.
- **Open Source**: The entire framework is open source, encouraging community contributions and transparency.

## Installation

To install Senparc.Ncf.Core, you can use the following command:

```bash
dotnet add package Senparc.Ncf.Core
```

## Getting Started

To get started with Senparc.Ncf.Core, follow these steps:

1. **Create a new project**: Use the .NET CLI to create a new project.

   ```bash
   dotnet new console -n MyNcfProject
   cd MyNcfProject
   ```

2. **Add the Senparc.Ncf.Core package**: Add the package to your project.

   ```bash
   dotnet add package Senparc.Ncf.Core
   ```

3. **Initialize the framework**: Initialize the framework in your `Program.cs` file.

   ```csharp
   using Senparc.Ncf.Core;

   class Program
   {
       static void Main(string[] args)
       {
           // Initialize NCF
           NcfCore.Initialize();
           Console.WriteLine("NCF Initialized!");
       }
   }
   ```

## Documentation

For detailed documentation, please visit the [official documentation](https://docs.senparc.com/).

## Contributing

We welcome contributions from the community. To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Push your branch and create a pull request.

## License

Senparc.Ncf.Core is licensed under the MIT License. For more details, see the [LICENSE](https://github.com/Senparc/NCF/blob/master/LICENSE) file.

## Contact

For any questions or support, please contact us at [support@senparc.com](mailto:support@senparc.com).
