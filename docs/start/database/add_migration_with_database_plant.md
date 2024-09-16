# Stopover Operation Database Migration and Update

## Modify Database Configuration File

> Modify the `Senparc.Web\App_Data\DataBase\SenparcConfig.config` file's `Local-SqlServer` node

    <SenparcConfig>
    	<Id>3</Id>
    	<Name>Local-SqlServer</Name>
    	<!--Local Demo default database (can modify DatabaseName configuration in appsettings.json)-->
    	<ConnectionStringFull><![CDATA[Server=PC-20210411JFTZ;initial catalog=NCF;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework]]></ConnectionStringFull>
    	<!--Use IP within container-->
    	<!--<ConnectionStringFull><![CDATA[Server=172.17.160.1; initial catalog=NCF;User ID=sa; Password=2wsx@WSX;MultipleActiveResultSets=True;App=EntityFramework]]></ConnectionStringFull>-->
    	<ApplicationPath><![CDATA[/]]></ApplicationPath>
    </SenparcConfig>

> Find the configuration file defining the database in your own module `Senparc.Xncf.Demo\Senparc.Xncf.Demo.csproj`, modify the `Local-SqlServer` node

    <SenparcConfig>
    	<Id>2</Id>
    	<Name>Local-SqlServer</Name>
    	<!--Local Demo default database (can modify DatabaseName configuration in appsettings.json)-->
    	<ConnectionStringFull><![CDATA[Server=PC-20210411JFTZ;Database=NCF; initial catalog=NCF;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework]]></ConnectionStringFull>
    	<ApplicationPath><![CDATA[/]]></ApplicationPath>
    </SenparcConfig>

> Find the configuration file defining the database for the stopover `Senparc.Web.DatabasePlant\App_Data\Database\SenparcConfig.config`, modify the `Local-SqlServer` node

    <SenparcConfig>
    	<Id>2</Id>
    	<Name>Local-SqlServer</Name>
    	<!--Local Demo default database (can modify DatabaseName configuration in appsettings.json)-->
    	<ConnectionStringFull><![CDATA[Server=.\;Database=NCF; initial catalog=NCF;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework]]></ConnectionStringFull>
    	<ApplicationPath><![CDATA[/]]></ApplicationPath>
    </SenparcConfig>

## Original Database Table Structure

![Image Text](./images/origin-database-table-struct.png)

## Stopover References Modules to be Migrated

![Image Text](./images/add-refrence.png)

## Use Module Generator Migration Command

![Image Text](./images/use-module-migration-command.png)

![Image Text](./images/xncf-module-add-migration.png)

![Image Text](./images/add-migration-success.png)

After generation is complete, it will display

![Image Text](./images/migration-file.png)

## Compare Databases

| Image                                                    | Status |
| -------------------------------------------------------- | ------ |
| ![Image Text](./images/origin-database-table-struct.png) | Before |
| ![Image Text](./images/new-table-field.png)              | After  |
