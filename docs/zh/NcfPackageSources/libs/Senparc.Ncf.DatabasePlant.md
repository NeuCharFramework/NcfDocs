# Senparc.Ncf.DatabasePlant

## 定位

`DatabasePlant` 可以理解为“数据库检修平台（停机坪）”：它聚合了多数据库配置能力，适合在开发/调试阶段执行迁移、对照、批量维护。

## 核心价值

- 当模块引用 `Senparc.Ncf.DatabasePlant` 后，可统一访问已实现的数据库配置能力。
- 在多数据库并行维护时（SqlServer/MySql/PostgreSQL/Oracle/Sqlite/DM/InMemory）更高效。

## 推荐使用策略

- **Debug/维护环境**：可启用 `DatabasePlant`，用于迁移与排障。
- **Release/生产环境**：建议通过条件编译排除，降低运行负担与误操作风险。

示例：仅在非 Release 引用

```xml
<ProjectReference Condition=" '$(Configuration)' != 'Release' " Include="..\..\..\Basic\Senparc.Ncf.DatabasePlant\Senparc.Ncf.DatabasePlant.csproj" />
```

## 与 DatabaseToolkit 的关系

- `DatabasePlant`：偏“能力聚合层”。
- `Senparc.Xncf.DatabaseToolkit`：偏“可视化/函数化运维入口”。

两者组合可覆盖大部分数据库维护场景，但请务必遵守最小权限和备份先行原则。

## 相关文档

- [数据库组装厂（入门）](/zh/start/database/database_plant.html)
