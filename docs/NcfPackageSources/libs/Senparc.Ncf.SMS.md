# Senparc.Ncf.SMS

## Positioning

`Senparc.Ncf.SMS` provides a baseline abstraction for SMS sending in NCF, allowing unified integration of SMS providers.

## Key Types

- `SenparcSmsSetting`: SMS account configuration model
- `ISmsPlatform`: platform abstraction
- `SmsPlatformFactory`: provider factory
- `SmsPlatform_JunMei` / `SmsPlatform_Fissoft`: built-in provider implementations

## Configuration Fields

- `SmsAccountCORPID`
- `SmsAccountName`
- `SmsAccountSubNumber`
- `SmsAccountPassword`
- `SmsPlatformType`

## Provider Instance Example

```csharp
var sms = SmsPlatformFactory.GetSmsPlateform(
    smsAccountCorpid,
    smsAccountName,
    smsAccountPassword,
    smsAccountSubNumber,
    SmsPlatformType.JunMei);
```

## Recommendations

- Keep template selection and send policy in service/business layer.
- Manage secrets via secure configuration, not hardcoded values.
- Combine with logging and retry policy for failure observability.
