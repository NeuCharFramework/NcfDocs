# Senparc.Ncf.DatabasePlant

## Positioning

`DatabasePlant` can be treated as a maintenance runway for database operations. It aggregates multi-database configuration capabilities and is best suited for development/debug/maintenance workflows.

## Core Value

- Once a project references `Senparc.Ncf.DatabasePlant`, it can leverage all implemented DB configuration capabilities.
- Especially useful when maintaining modules across multiple database providers.

## Recommended Strategy

- **Debug/Maintenance**: enable `DatabasePlant` for migration and diagnostics.
- **Release/Production**: conditionally exclude it to reduce runtime footprint and operation risk.

Example: include only in non-Release builds

```xml
<ProjectReference Condition=" '$(Configuration)' != 'Release' " Include="..\..\..\Basic\Senparc.Ncf.DatabasePlant\Senparc.Ncf.DatabasePlant.csproj" />
```

## Relationship With DatabaseToolkit

- `DatabasePlant`: capability aggregation layer.
- `Senparc.Xncf.DatabaseToolkit`: visual/function-oriented operational entry layer.

Use both together for most DB maintenance tasks, but always apply least privilege and backup-first discipline.

## Related

- [Database Plant Intro](/start/database/database_plant.html)
