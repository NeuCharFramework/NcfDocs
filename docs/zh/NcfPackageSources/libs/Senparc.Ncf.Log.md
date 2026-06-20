# Senparc.Ncf.Log

## 定位

`Senparc.Ncf.Log` 提供 NCF 的日志访问封装，包含按业务域划分的日志器入口，便于统一记录系统与业务事件。

## 关键类型

- `LogUtility`：日志器访问入口
- `NLogExtension`：NLog 辅助扩展

`LogUtility` 中内置了多个命名日志器，例如：

- `WebLogger`
- `SystemLogger`
- `OperationQueue`
- `SmsLogger`
- `AdminUserInfo`

## 典型使用方式

```csharp
LogUtility.SystemLogger.Info("系统初始化完成");
LogUtility.WebLogger.Error("请求处理失败");
```

## 使用建议

- 日志分类要稳定，避免随业务变化频繁改 logger 名称。
- 错误日志保留上下文（模块 UID、请求参数摘要、租户信息）。
- 对 AI/MCP 等高风险调用链，建议记录调用链路与耗时。
