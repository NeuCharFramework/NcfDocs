# Senparc.Ncf.Database（数据库基础）

## 定位

`Senparc.Ncf.Database` 提供 NCF 的数据库抽象层和多数据库配置协作能力，是 `Repository/Service/XncfDatabase` 的底座。

## 关键能力

- 数据库配置工厂：`DatabaseConfigurationFactory.Instance.Current`
- 多数据库上下文池：`MultipleDatabasePool`、`XncfDatabaseDbContextPool`
- 迁移上下文支持：`MultipleMigrationDbContextAttribute`
- 连接配置模型：`SenparcDatabaseConnectionConfigs`

## 配套 Provider 包

当前源码内置独立 Provider 项目：

- `Senparc.Ncf.Database.SqlServer`
- `Senparc.Ncf.Database.MySql`
- `Senparc.Ncf.Database.PostgreSQL`
- `Senparc.Ncf.Database.Oracle`
- `Senparc.Ncf.Database.Sqlite`
- `Senparc.Ncf.Database.Dm`
- `Senparc.Ncf.Database.InMemory`

## 使用建议

- 模块数据库设计统一通过 `IXncfDatabase + XncfDatabaseDbContext` 路线接入。
- 迁移脚本与模块版本同步管理，避免“程序集版本与数据库版本漂移”。
- 生产环境数据库切换前，先在模拟站点完成全链路验证。
