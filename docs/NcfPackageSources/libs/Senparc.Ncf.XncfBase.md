# Senparc.Ncf.XncfBase

## Overview

Senparc.Ncf.XncfBase is a base module for NCF, providing a set of basic functionalities and interfaces for developing NCF modules.

## Installation

To install Senparc.Ncf.XncfBase, you can use the following command:

```bash
dotnet add package Senparc.Ncf.XncfBase
```

## Usage

### Creating a New Module

To create a new module, you need to inherit from the `XncfModule` class and implement the required methods.

```csharp
public class MyModule : XncfModule
{
    public override string Name => "MyModule";

    public override string Uid => "MyModule-UID";

    public override string Version => "1.0.0";

    public override string MenuName => "My Module";

    public override string Icon => "fa fa-icon";

    public override async Task InstallOrUpdateAsync(IServiceProvider serviceProvider, InstallOrUpdate installOrUpdate)
    {
        // Your installation or update logic here
    }

    public override async Task UninstallAsync(IServiceProvider serviceProvider, Func<Task> uninstallFunc)
    {
        // Your uninstallation logic here
    }
}
```

### Registering the Module

To register the module, you need to add it to the `XncfModuleCollection` in the `Startup.cs` file.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddXncfModule<MyModule>();
}
```

### Adding a Menu

To add a menu item for your module, you need to override the `GetMenuItem` method.

```csharp
public override MenuItem GetMenuItem()
{
    return new MenuItem()
    {
        Title = "My Module",
        Url = "/MyModule",
        Icon = "fa fa-icon"
    };
}
```

## License

Senparc.Ncf.XncfBase is licensed under the MIT License. For more details, please refer to the LICENSE file.

## Contact

For any questions or issues, please contact us at support@senparc.com.

## Documentation

For more detailed documentation, please visit our [official website](https://www.senparc.com/).

## Example

Here is an example of a simple module:

```csharp
public class SimpleModule : XncfModule
{
    public override string Name => "SimpleModule";

    public override string Uid => "SimpleModule-UID";

    public override string Version => "1.0.0";

    public override string MenuName => "Simple Module";

    public override string Icon => "fa fa-icon";

    public override async Task InstallOrUpdateAsync(IServiceProvider serviceProvider, InstallOrUpdate installOrUpdate)
    {
        // Installation or update logic
    }

    public override async Task UninstallAsync(IServiceProvider serviceProvider, Func<Task> uninstallFunc)
    {
        // Uninstallation logic
    }

    public override MenuItem GetMenuItem()
    {
        return new MenuItem()
        {
            Title = "Simple Module",
            Url = "/SimpleModule",
            Icon = "fa fa-icon"
        };
    }
}
```

This example demonstrates how to create a basic module with installation, update, and uninstallation logic, as well as how to add a menu item for the module.
