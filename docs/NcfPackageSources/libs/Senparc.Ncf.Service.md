# Senparc.Ncf.Service

## Overview

Senparc.Ncf.Service is a core service module in the NeuCharFramework (NCF) system. It provides essential services and interfaces for the entire framework, ensuring smooth and efficient operation.

## Features

- **Modular Design**: The service is designed in a modular fashion, allowing for easy extension and customization.
- **High Performance**: Optimized for high performance, ensuring that the services run efficiently even under heavy load.
- **Scalability**: Built to scale with your application's needs, supporting both small and large-scale deployments.

## Installation

To install Senparc.Ncf.Service, you can use the following command:

```bash
dotnet add package Senparc.Ncf.Service
```

## Usage

Below is a basic example of how to use Senparc.Ncf.Service in your application:

```csharp
using Senparc.Ncf.Service;

public class MyService : BaseService
{
    public MyService(IServiceProvider serviceProvider) : base(serviceProvider)
    {
    }

    public void MyMethod()
    {
        // Your code here
    }
}
```

## Configuration

Configuration for Senparc.Ncf.Service can be done through the `appsettings.json` file. Below is an example configuration:

```json
{
  "SenparcSetting": {
    "IsDebug": true,
    "DefaultCacheNamespace": "Senparc"
  }
}
```

## Documentation

For more detailed documentation, please visit the [official documentation](https://www.senparc.com/).

## Support

If you encounter any issues or have any questions, please feel free to contact our support team at support@senparc.com.

## License

Senparc.Ncf.Service is licensed under the MIT License. For more details, please refer to the [LICENSE](https://github.com/Senparc/NeuCharFramework/blob/master/LICENSE) file.
