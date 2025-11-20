# MCP 安装与配置

本文将指导您如何在NCF项目中安装和配置MCP模块，使您能够快速集成AI功能。

## 前置条件

在安装MCP模块之前，请确保您已经：

1. 已安装 .NET SDK 8.0 或更高版本
2. 创建或拥有一个基于NCF框架的项目
3. 了解基本的NCF模块开发概念

## 安装步骤

### 1. 通过NCF模块管理器安装

最简单的方式是通过NCF后台的模块管理器安装：

1. 登录NCF后台管理界面
2. 导航至"扩展模块" → "模块管理"
3. 在"模块商店"选项卡中找到"Senparc.Xncf.MCP"模块
4. 点击"安装"按钮进行安装

### 2. 通过NuGet包管理器安装

如果您希望在项目开发阶段就集成MCP模块，可以使用NuGet包管理器：

```bash
Install-Package Senparc.Xncf.MCP -Version 0.1.0
```

或者通过.NET CLI:

```bash
dotnet add package Senparc.Xncf.MCP --version 0.1.0
```

### 3. 手动引用项目

您也可以通过手动引用MCP项目的方式进行安装：

1. 从GitHub上克隆NCF项目源代码
2. 在您的解决方案中添加对`Senparc.Xncf.MCP`项目的引用

## 配置MCP模块

安装完成后，需要进行一些基本配置以启用MCP功能：

### 1. 配置appsettings.json

在`appsettings.json`中添加MCP相关配置：

```json
{
  "SenparcCoreSetting": {
    "McpAccessToken": "您的访问令牌",
    "McpEndpoint": "http://localhost:5000/sse/sse"
  },
  "SenparcAiSetting": {
    "ModelName": {
      "Chat": "gpt-4o"
    },
    "AzureOpenAIKeys": {
      "ApiKey": "您的Azure OpenAI API密钥",
      "AzureEndpoint": "您的Azure OpenAI端点URL"
    }
  }
}
```

### 2. 在Startup.cs中注册MCP服务

如果您使用的是较新版本的NCF，MCP模块会自动注册。对于手动安装或自定义配置，您可以在`Startup.cs`的`ConfigureServices`方法中添加以下代码：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // 其他服务注册...
    
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

### 3. 配置MCP路由终结点

在`Configure`方法中配置MCP路由终结点：

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // 其他中间件配置...
    
    app.UseEndpoints(endpoints =>
    {
        // 其他终结点配置...
        
        endpoints.MapMcp("sse");
    });
}
```

## 验证安装

完成安装和配置后，您可以通过以下步骤验证MCP模块是否正常工作：

1. 运行您的NCF应用程序
2. 在浏览器中访问`http://localhost:5000/sse/sse`（根据您的配置可能不同）
3. 如果您看到一个事件流连接成功的响应，则表示MCP服务器已成功启动

## 故障排除

如果您在安装或配置过程中遇到问题，请检查以下几点：

1. 确保已正确安装所有依赖项
2. 检查配置文件中的设置是否正确
3. 查看应用程序日志以获取详细的错误信息
4. 确保网络连接正常，特别是与AI服务的连接

如果问题仍然存在，请查阅[常见问题解答](./faq.md)或在[GitHub Issues](https://github.com/NeuCharFramework/NcfPackageSources/issues)中提交问题。