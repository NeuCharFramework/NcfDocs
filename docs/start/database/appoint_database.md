# Specify Database

NCF can quickly specify the database in a convenient way. After switching, rerun, and the database can be seamlessly migrated.

The following example uses MySQL to demonstrate how to quickly switch databases. The operation method for other databases is the same, just change `MySql` to the corresponding database name in the process. Of course, you may also need to set the correct database connection string.

## How to Quickly Switch to MySQL

### Step1. Modify SenparcConfig.config

First, find the SenparcConfig.config file in the Senparc.Web\App_Data\DataBase directory and modify the MySQL node as follows:

```xml
	<SenparcConfig>
		<Id>4</Id>
		<Name>Local-MySql</Name>
		<!--Local Demo default database (can modify DatabaseName configuration in appsettings.json)-->
		<ConnectionStringFull>
			<![CDATA[Server=localhost;Database=NCF;Uid=root;Pwd=root;]]></ConnectionStringFull>
		<ApplicationPath><![CDATA[/]]></ApplicationPath>
	</SenparcConfig>
```

### Step2. Modify Senparc.Web.csproj File

Add the following `Senparc.Ncf.Database.MySql` reference:

```xml
<PackageReference Include="Senparc.Ncf.Database.MySql" Version="0.11.3-beta7" />
```

### Step3. Modify the Startup File's Database Options

#### Method 1: Modify appsettings.json File (Recommended)

This method does not modify any files that need to be compiled, just modify the configuration file `appsetting.json`.

Find the `Senparc.Web\appsettings.json` file and modify the `SenparcCoreSetting` node's `DatabaseName` from the default `Sqlite` to `MySql`:

```json
  "SenparcCoreSetting": {
	//...

    "DatabaseName": "Local", // Corresponds to: AppData/DataBase/SenparcConfig.config, the Name prefix of the database connection to be used in the <SenparcConfig> node
    "DatabaseType": "MySql"

	//...
  },
```

#### Method 2: Modify the Code:

Find the `\NCF\src\Senparc.Web\Program.cs` file code:

```csharp
app.UseNcf<BySettingDatabaseConfiguration>();
```

Change `BySettingDatabaseConfiguration` to `MySqlDatabaseConfiguration`:

```csharp
app.UseNcf<MySqlDatabaseConfiguration>();
```

<div style="color:red">【Note】: Due to the support of the EFCore base library, the MySQL engine must be InnoDB. If it is set to Mylsam, an error will occur at runtime, and the error message is as follows</div><br/>

> Exception Handling: [Error when starting after modifying MySQL configuration](/start/qa/common_problem.html)

## How to Quickly Switch to SqlServer

Same as switching to MySQL.

After switching, running will display, the same below.

<img src="./images/switch-sqlserver.png" />

## How to Quickly Switch to Sqlite

Same as switching to MySQL.

## How to Quickly Switch to Oracle

Same as switching to MySQL.

## How to Quickly Switch to Dameng Database (Dm)

Same as switching to MySQL.
