# 数据库设置

当下载好NCF后，那么如果你使用的是SQL Server数据库，则寻找到项目对应目录文件

C:\NCF\src\Senparc.Web\App_Data\DataBase\SenparcConfig.config

## 修改数据库连接字符串

```
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