# 指定数据库

指定数据库指的是你可以根据自己的实际需要指定任意一种NCF支持的数据库进行切换，切换完成后，重新运行，数据库可以无缝迁移

## 如何快速切换Mysql

> Step1.修改SenparcConfig.config

首先在Senparc.Web\App_Data\DataBase 目录中找到 SenparcConfig.config 文件，修改Mysql节点为如下形式

```
	<SenparcConfig>
		<Id>4</Id>
		<Name>Local-MySql</Name>
		<!--本地Demo默认数据库（可在appsettings.json中修改DatabaseName配置）-->
		<ConnectionStringFull>
			<![CDATA[Server=localhost;Database=NCF;Uid=root;Pwd=root;]]></ConnectionStringFull>
		<ApplicationPath><![CDATA[/]]></ApplicationPath>
	</SenparcConfig>
```

> Step2.修改Senparc.Web.csproj文件

找到第21行处，取消注释掉以下代码即可

```
<PackageReference Include="Senparc.Ncf.Database.MySql" Version="0.6.128-beta1" />
```

> Step3.修改启动文件的数据库选项

找到\NCF\src\Senparc.Web\Startup.cs 文件

> > 定位到第12-14行，修改如下

```
using Senparc.Ncf.Database.MySql;//根据需要添加或删除，使用需要引用 Senparc.Ncf.Database.MySql
//using Senparc.Ncf.Database.Sqlite;//根据需要添加或删除，使用需要引用 Senparc.Ncf.Database.Sqlite
using Senparc.Ncf.Database.SqlServer;//根据需要添加或删除，使用需要引用 Senparc.Ncf.Database.SqlServer
```

打开引用Mysql的命名空间，其他的你可以根据自己的喜好决定是否注释，如果你开着也不影响正常运行

> > 定位到第34-37行，修改如下

```
            //指定数据库类型
            //services.AddDatabase<SqliteMemoryDatabaseConfiguration>();//使用 SQLite 数据库
            //services.AddDatabase<SQLServerDatabaseConfiguration>();//使用 SQLServer数据库
            services.AddDatabase<MySqlDatabaseConfiguration>();//使用 MySQL 数据库
```

注释掉其他数据库的选项，打开Mysql的选项

<div style="color:red">【注意事项】：Mysql的引擎必须为 InnoDB ,如果设置的为Mylsam,则在运行时会报错，报错信息如下</div><br/>

[修改Mysql的配置后，启动报错](/start/qa/common_problem.html)

## 如何快速切换Sqlite

同切换Mysql

## 如何快速切换SqlServer

同切换Mysql

切换完成后，运行会显示

<img src="./images/switch-sqlserver.png" />