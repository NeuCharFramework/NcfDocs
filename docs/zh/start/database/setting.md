# 数据库设置

当下载好 NCF 后，默认使用的是 SQLite 本地数据库，您无需修改任何代码即可运行。

如果您使用的是 SQL Server 数据库，则寻找到项目对应目录文件：

C:\NCF\src\Senparc.Web\App_Data\DataBase\SenparcConfig.config

## 修改数据库连接字符串

```xml
-- 默认方式
<SenparcConfig>
    <Id>3</Id>
    <Name>Local-SqlServer</Name>
    <!--本地Demo默认数据库（可在appsettings.json中修改DatabaseName配置）-->
    <ConnectionStringFull><![CDATA[Server=LAPTOP-23H8K0SD;Database=NCF; initial catalog=NCF;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework]]></ConnectionStringFull>
    <ApplicationPath><![CDATA[/]]></ApplicationPath>
</SenparcConfig>

-- 含用户名密码的设置方式
<SenparcConfig>
    <Id>3</Id>
    <Name>Local-SqlServer</Name>
    <!--本地Demo默认数据库（可在appsettings.json中修改DatabaseName配置）-->
    <ConnectionStringFull><![CDATA[Server=192.168.0.1;Database=NCF; User ID=sa; Password=123456;Application Name=zmz]]></ConnectionStringFull>
    <ApplicationPath><![CDATA[/]]></ApplicationPath>
</SenparcConfig>
```

## 其他数据库

请参考上述修改的方式，找到 `<Name>` 节点符合如 `Local-<数据库名称>` 的配置项，修改 `<ConnectionStringFull>` 节点的内容即可。

> `Local` 字符串是默认的数据库名称，如果您需要使用其他数据库名称，请在 `appsettings.json` 中修改 `DatabaseName` 配置项。([详情](/start/config/appsettings.html#senparccoresetting-节点配置))
