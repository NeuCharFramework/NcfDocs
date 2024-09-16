# Update the database migration files (Migrations) for the Senparc.Service project

> Take updating the Senparc.Service project as an example for manual updates.

Usually, updating the database migration files for Senparc.Service is necessary because certain entity information corresponding to the database has been added/modified/deleted in the NCF template project.

## Modify the database using Code-First

For example, we added a property in the `AdminUserInfo` class:

![Image Text](./images/add_migration_for_service_project-add_prop.png)

## Generate migration files using EF Core's Add-Migration command

Since the Senparc.Service project is not a standard XNCF module (essentially an XNCF module, but the file structure is relatively special), it cannot be directly operated in the Admin backend using the Senparc.Xncf.XncfBuilder module, otherwise, the system will generate files according to the XNCF directory structure (of course, this does not affect compilation).

We can use the command line, taking CMD command line as an example, enter the Senparc.Service directory:

```
E:\Senparc项目\NeuCharFramework\NCF\src\Senparc.Service>
```

Enter the command:

```
dotnet ef migrations add AddOpenId -c SystemServiceEntities_SqlServer -o Migrations/Migrations.SqlServer -s ../Senparc.Web.DatabasePlant
```

> In the above command, `AddOpenId` is the name of this update and can be freely filled in. `SystemServiceEntities_SqlServer` refers to the database context (DbContext) implementation pointing to SQL Server. When we need to update the MySQL database simultaneously, we can replace it with `SystemServiceEntities_MySQL` (note the actual class name, the class name may not reflect the database type at all).

Executing the command will complete the migration file update for SQL Server:

![Image Text](./images/add_migration_for_service_project-run_migrations_add.png)

In the above image:

①: The command entered in the Senparc.Service directory

②: Shows the currently used database connection string

③: Shows the updated SQL Server database type, DbContext context class name, and other information

In VS, you can see that the `20210809155647_AddOpenId.cs` file has been created, and the snapshot file `SystemServiceEntities_SqlServerModelSnapshot.cs` has been updated:

![Image Text](./images/add_migration_for_service_project-run-files-added.png)

Through the `20210809155647_AddOpenId.cs` file, you can see that the OpenId property (corresponding to the database table column) has been added.

![Image Text](./images/add_migration_for_service_project-run-addopenid_file_content.png)

## Update the Senparc.Service version number

We recommend that after updating the content, you also update the version number of Senparc.Service, treating it the same as a regular XNCF.

> /Senparc.Service/XncfModules/Register.cs

Set the new Version parameter, such as:

```csharp
public override string Version => "0.3.4-beta4";
```

### Update the database

Using the CMD command line, execute the command in the Senparc.Service directory:

```
dotnet ef database update -c SystemServiceEntities_SqlServer -s ../Senparc.Web.DatabasePlant
```

> Adjust SystemServiceEntities_SqlServer flexibly according to the database type

![Image Text](./images/add_migration_for_service_project-run_database_update.png)

In the above image of the running result:

①: Execute the update database command

②: Prompt that the latest migration update is complete

## Database table comparison before and after

| Image                                                                      | Status        |
| -------------------------------------------------------------------------- | ------------- |
| ![Image Text](./images/add_migration_for_service_project-database-old.png) | Before Update |
| ![Image Text](./images/add_migration_for_service_project-database-new.png) | After Update  |
