# MCP Installation and Configuration

This guide explains how to install and configure the MCP module in an NCF project so you can quickly integrate AI capabilities.

## Prerequisites

Before installing MCP, make sure:

1. You have .NET SDK 8.0 or later installed
2. You already have (or can create) an NCF-based project
3. You understand basic NCF modular development concepts

## Installation Steps

### 1. Install via NCF Module Manager

The easiest method is using the module manager in the NCF admin panel:

1. Sign in to the NCF admin panel
2. Go to `Extension Modules` -> `Module Management`
3. In the `Module Store` tab, find `Senparc.Xncf.MCP`
4. Click `Install`

### 2. Install via NuGet

If you want to integrate MCP during development, use NuGet:

```bash
Install-Package Senparc.Xncf.MCP -Version 0.1.0
```

Or with .NET CLI:

```bash
dotnet add package Senparc.Xncf.MCP --version 0.1.0
```

### 3. Add Project Reference Manually

You can also install by manually referencing the MCP project:

1. Clone the NCF source code from GitHub
2. Add a reference to `Senparc.Xncf.MCP` in your solution

## Configure the MCP Module

After installation, add the following basic configuration.

### 1. Configure `appsettings.json`

Add MCP settings to `appsettings.json`:

```json
{
  "SenparcCoreSetting": {
    "McpAccessToken": "your-access-token",
    "McpEndpoint": "http://localhost:5000/sse/sse"
  },
  "SenparcAiSetting": {
    "ModelName": {
      "Chat": "gpt-4o"
    },
    "AzureOpenAIKeys": {
      "ApiKey": "your-azure-openai-api-key",
      "AzureEndpoint": "your-azure-openai-endpoint-url"
    }
  }
}
```

### 2. Register MCP in `Startup.cs`

In recent NCF versions, MCP is usually registered automatically. For manual/custom setup, add this in `ConfigureServices`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Other service registrations...

    services.AddMcpServer(opt =>
    {
        opt.ServerInfo = new Implementation()
        {
            Name = "ncf-mcp-server",
            Version = "1.0.0",
        };
    })
    .WithHttpTransport()
    .WithToolsFromAssembly();
}
```

### 3. Configure MCP Endpoint Routing

Configure MCP route endpoints in `Configure`:

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Other middleware...

    app.UseEndpoints(endpoints =>
    {
        // Other endpoints...

        endpoints.MapMcp("sse");
    });
}
```

## Verify Installation

After installation and configuration:

1. Run your NCF application
2. Open `http://localhost:5000/sse/sse` in a browser (based on your own config)
3. If you see a successful event stream response, the MCP server is running

## Troubleshooting

If you see issues during setup:

1. Confirm all required dependencies are installed
2. Verify all configuration values in your config files
3. Check application logs for detailed errors
4. Confirm network connectivity, especially to AI services

If the issue remains, check [FAQ](./faq.md) or submit an issue in [GitHub Issues](https://github.com/NeuCharFramework/NcfPackageSources/issues).
