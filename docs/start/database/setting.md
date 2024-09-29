# Database Settings

After downloading NCF, the default database used is SQLite local database, and you can run it without modifying any code.

If you are using a SQL Server database, find the corresponding directory file of the project:

C:\NCF\src\Senparc.Web\App_Data\DataBase\SenparcConfig.config

## Modify the database connection string

```xml
-- Default method
<SenparcConfig>
    <Id>3</Id>
    <Name>Local-SqlServer</Name>
    <!--Local Demo default database (can modify DatabaseName configuration in appsettings.json)-->
    <ConnectionStringFull><![CDATA[Server=LAPTOP-23H8K0SD;Database=NCF; initial catalog=NCF;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework]]></ConnectionStringFull>
    <ApplicationPath><![CDATA[/]]></ApplicationPath>
</SenparcConfig>

-- Setting method with username and password
<SenparcConfig>
    <Id>3</Id>
    <Name>Local-SqlServer</Name>
    <!--Local Demo default database (can modify DatabaseName configuration in appsettings.json)-->
    <ConnectionStringFull><![CDATA[Server=192.168.0.1;Database=NCF; User ID=sa; Password=123456;Application Name=zmz]]></ConnectionStringFull>
    <ApplicationPath><![CDATA[/]]></ApplicationPath>
</SenparcConfig>
```

## Other Databases

Please refer to the above modification method, find the configuration item where the `<Name>` node matches `Local-<database name>`, and modify the content of the `<ConnectionStringFull>` node.

> The `Local` string is the default database name. If you need to use another database name, please modify the `DatabaseName` configuration item in `appsettings.json`. ([Details](/start/config/appsettings.html#senparccoresetting-节点配置))
