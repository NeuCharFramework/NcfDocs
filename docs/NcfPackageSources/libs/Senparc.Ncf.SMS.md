# Senparc.Ncf.SMS

## Overview

Senparc.Ncf.SMS is a module for sending SMS messages within the NeuCharFramework (NCF). This module provides a unified interface for various SMS service providers, making it easy to integrate and switch between different providers.

## Installation

To install Senparc.Ncf.SMS, you can use the following command:

```bash
dotnet add package Senparc.Ncf.SMS
```

## Configuration

In order to use Senparc.Ncf.SMS, you need to configure it in your application. Add the following code to your `Startup.cs` file:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddSenparcNcfSMS(options =>
    {
        options.DefaultProvider = "YourDefaultProvider";
        options.AddProvider("YourProviderName", new YourProviderOptions
        {
            ApiKey = "YourApiKey",
            ApiSecret = "YourApiSecret"
        });
    });
}
```

## Usage

After configuring the SMS module, you can use it to send SMS messages. Here is an example:

```csharp
public class SmsService
{
    private readonly ISmsSender _smsSender;

    public SmsService(ISmsSender smsSender)
    {
        _smsSender = smsSender;
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        await _smsSender.SendAsync(phoneNumber, message);
    }
}
```

## Providers

Senparc.Ncf.SMS supports multiple SMS service providers. You can add and configure providers in the `Startup.cs` file as shown in the configuration section. Here are some of the supported providers:

- Twilio
- Nexmo
- Alibaba Cloud

## License

Senparc.Ncf.SMS is licensed under the MIT License. For more details, please refer to the LICENSE file.

## Documentation

For more detailed documentation, please visit the [official documentation](https://docs.senparc.com/).

## Contributing

If you would like to contribute to Senparc.Ncf.SMS, please follow the guidelines in the CONTRIBUTING.md file.

## Contact

For any questions or support, please contact us at support@senparc.com.

## Change Log

For the latest updates and changes, please refer to the CHANGELOG.md file.
