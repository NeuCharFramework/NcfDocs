# 指定数据库

NCF 可以通过便捷的方式，快速指定数据库指，切换完成后，重新运行，数据库可以无缝迁移。

以下以 MySQL 为例，介绍如何快速切换数据库。其他数据库操作方式一致，只需将过程中 `MySql` 改成对应数据库名称即可，当然您可能还需要设置对应正确的数据库连接字符串。

## 如何快速切换 Mysql

### Step1.修改 SenparcConfig.config

首先 在Senparc.Web\App_Data\DataBase 目录中找到 SenparcConfig.config 文件，修改 Mysql 节点为如下形式

```xml
	<SenparcConfig>
		<Id>4</Id>
		<Name>Local-MySql</Name>
		<!--本地Demo默认数据库（可在appsettings.json中修改DatabaseName配置）-->
		<ConnectionStringFull>
			<![CDATA[Server=localhost;Database=NCF;Uid=root;Pwd=root;]]></ConnectionStringFull>
		<ApplicationPath><![CDATA[/]]></ApplicationPath>
	</SenparcConfig>
```

### Step2.修改 Senparc.Web.csproj 文件

添加以下 `Senparc.Ncf.Database.MySql` 引用：

```xml
<PackageReference Include="Senparc.Ncf.Database.MySql" Version="0.11.3-beta7" />
```

### Step3.修改启动文件的数据库选项

#### 方法一：修改 appsettings.json 文件（推荐）

此方法不修改任何需要编译的文件，只需要修改配置文件 `appsetting.json` 即可。

找到 `Senparc.Web\appsettings.json` 文件，修改 `SenparcCoreSetting` 节点下的 `DatabaseName` 由默认的 `Sqlite` 改为 `MySql`：

```json
  "SenparcCoreSetting": {
	//...

    "DatabaseName": "Local", // 对应：AppData/DataBase/SenparcConfig.config 中，所需要使用的数据库连接的 <SenparcConfig> 节点的 Name 前缀
    "DatabaseType": "MySql"

	//...
  },
```


#### 方法二：通过修改代码实现：

找到 `\NCF\src\Senparc.Web\Program.cs` 文件代码：

```csharp
app.UseNcf<BySettingDatabaseConfiguration>();
```

将 `BySettingDatabaseConfiguration` 改为 `MySqlDatabaseConfiguration`：

```csharp
app.UseNcf<MySqlDatabaseConfiguration>();
```

<div style="color:red">【注意事项】：由于 EFCore 基础库支持的原因，Mysql 的引擎必须为 InnoDB ,如果设置的为 Mylsam，则在运行时会报错，报错信息如下</div><br/>

> 异常处理：[修改 Mysql 的配置后，启动报错](/start/qa/common_problem.html)

## 如何快速切换 SqlServer

同切换 Mysql。

切换完成后，运行会显示，下同。

<img src="./images/switch-sqlserver.png" />

## 如何快速切换 Sqlite

同切换 Mysql。


## 如何快速切换 Oracle

同切换 Mysql。

## 如何快速切换 达梦数据库（Dm）

同切换 Mysql。



