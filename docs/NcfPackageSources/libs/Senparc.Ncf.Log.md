# Senparc.Ncf.Log

## Introduction

Senparc.Ncf.Log is a logging module within the NeuCharFramework (NCF) system. It provides developers with a flexible and powerful logging mechanism to track and debug their applications.

## Features

- **Flexible Configuration**: Supports multiple logging levels and outputs.
- **Extensibility**: Easily extendable to support custom logging providers.
- **Integration**: Seamlessly integrates with other NCF modules.

## Getting Started

To start using Senparc.Ncf.Log, follow these steps:

1. **Install the Package**: Add the Senparc.Ncf.Log package to your project.
2. **Configure Logging**: Set up the logging configuration in your application.
3. **Use the Logger**: Inject and use the logger in your classes.

### Installation

You can install the Senparc.Ncf.Log package via NuGet:

```bash
dotnet add package Senparc.Ncf.Log
```

### Configuration

In your `appsettings.json`, add the logging configuration:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    },
    "Console": {
      "IncludeScopes": true
    }
  }
}
```

### Usage

Inject the logger into your class and use it:

```csharp
public class MyClass
{
    private readonly ILogger<MyClass> _logger;

    public MyClass(ILogger<MyClass> logger)
    {
        _logger = logger;
    }

    public void MyMethod()
    {
        _logger.LogInformation("This is an information log.");
        _logger.LogError("This is an error log.");
    }
}
```

## Advanced Topics

### Custom Logging Providers

Senparc.Ncf.Log allows you to create custom logging providers. Implement the `ILoggerProvider` interface to create your own provider.

### Log Filtering

You can filter logs based on categories and levels. Configure filters in your `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "System": "Information",
      "Microsoft": "Error"
    }
  }
}
```

## Conclusion

Senparc.Ncf.Log is a powerful and flexible logging solution for NCF applications. By following the steps outlined above, you can easily integrate and utilize logging in your projects. For more information, visit the [official documentation](https://www.senparc.com/).

## License

Senparc.Ncf.Log is licensed under the MIT License. See the LICENSE file for more details.

© 2023 Senparc
