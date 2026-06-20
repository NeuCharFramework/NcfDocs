# Senparc.Ncf.Database (Database Foundation)

## Positioning

`Senparc.Ncf.Database` provides the shared database abstraction layer for NCF and underpins `Repository`, `Service`, and module-level database integration.

## Key Capabilities

- database configuration factory: `DatabaseConfigurationFactory.Instance.Current`
- multi-db context pools: `MultipleDatabasePool`, `XncfDatabaseDbContextPool`
- migration context attributes: `MultipleMigrationDbContextAttribute`
- connection config model: `SenparcDatabaseConnectionConfigs`

## Provider Projects in Source

The repository includes dedicated provider projects:

- `Senparc.Ncf.Database.SqlServer`
- `Senparc.Ncf.Database.MySql`
- `Senparc.Ncf.Database.PostgreSQL`
- `Senparc.Ncf.Database.Oracle`
- `Senparc.Ncf.Database.Sqlite`
- `Senparc.Ncf.Database.Dm`
- `Senparc.Ncf.Database.InMemory`

## Recommendations

- Integrate module databases via `IXncfDatabase + XncfDatabaseDbContext` conventions.
- Keep DB schema migrations aligned with module version lifecycle.
- Validate DB provider switching end-to-end in the simulated site before production rollout.
