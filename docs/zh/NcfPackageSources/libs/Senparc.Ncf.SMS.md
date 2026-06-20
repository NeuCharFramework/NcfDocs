# Senparc.Ncf.SMS

## 定位

`Senparc.Ncf.SMS` 提供短信发送基础抽象，用于在 NCF 系统中统一接入短信平台。

## 关键类型

- `SenparcSmsSetting`：短信账号配置模型
- `ISmsPlatform`：短信平台统一接口
- `SmsPlatformFactory`：平台实例工厂
- `SmsPlatform_JunMei` / `SmsPlatform_Fissoft`：当前内置平台实现

## 配置模型

核心配置字段：

- `SmsAccountCORPID`
- `SmsAccountName`
- `SmsAccountSubNumber`
- `SmsAccountPassword`
- `SmsPlatformType`

## 平台实例创建示例

```csharp
var sms = SmsPlatformFactory.GetSmsPlateform(
    smsAccountCorpid,
    smsAccountName,
    smsAccountPassword,
    smsAccountSubNumber,
    SmsPlatformType.JunMei);
```

## 使用建议

- 短信模板与发送策略应在业务层封装，不要散落在控制器中。
- 密钥/账号必须走安全配置（环境变量或密钥管理），避免硬编码。
- 建议配合日志模块记录发送失败与重试信息。
