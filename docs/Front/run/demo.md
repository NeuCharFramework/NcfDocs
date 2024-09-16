# Demo

## Overview

This document provides a detailed description of the development process for the NeuCharFramework (NCF) system. The following sections will guide you through the various components and functionalities of the system.

## Installation

To install the necessary packages, run the following command:

```bash
dotnet add package Senparc.NCF
```

## Configuration

### appsettings.json

Add the following configuration to your `appsettings.json` file:

```json
{
  "SenparcSetting": {
    "IsDebug": true,
    "DefaultCacheNamespace": "DefaultCache"
  }
}
```

### Startup.cs

In your `Startup.cs` file, add the following code to configure the services:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddSenparcGlobalServices(Configuration)
            .AddSenparcMvc();
}
```

## Usage

### Controller

Create a new controller named `HomeController` and add the following code:

```csharp
public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
```

### View

Create a new view named `Index.cshtml` and add the following HTML code:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Home</title>
  </head>
  <body>
    <h1>Welcome to NeuCharFramework!</h1>
  </body>
</html>
```

## Conclusion

This document provides a basic overview of how to set up and use the NeuCharFramework (NCF) system. For more detailed information, please refer to the official documentation.
