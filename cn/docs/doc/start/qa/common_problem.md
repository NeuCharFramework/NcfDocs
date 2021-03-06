# NCF常见问题

> 如何修改默认数据库连接字符串

1.打开文件 /src/Senparc.Web/App_Data/Database/SenparcConfig.config 文件

2.直接编辑 `<ConnectionStringFull>` 节点下的连接字符串，例如：

    <ConnectionStringFull>
        <![CDATA[Server=.\;Database=NCF;User ID=sa;Pwd=sa;Trusted_Connection=True;integrated security=True;]]>
    </ConnectionStringFull>

![Image Text](/start/qa/images/common_problem/modify_database_connectstring.png)

注意：

1、不需要修改其他任何内容，其他设置日后会另作他用，乃为黑客设置“迷宫”而设。

2、正式版发布后，此连接字符串将会被加密，我们会提供加密工具。

> .net命令dotnet ef执行报错

错误信息：
```
Could not execute because the specified command or file was not found.
Possible reasons for this include:
  * You misspelled a built-in dotnet command.
  * You intended to execute a .NET Core program, but dotnet-ef does not exist.
  * You intended to run a global tool, but a dotnet-prefixed executable with this name could not be found on the PATH.
```

解决方案：
使用的命令为
```
dotnet ef database update
```
查看当前dot版本为3.0

解决办法：

需要更新dotnet tool，使用的命令为：
```
dotnet tool update --global dotnet-ef --version 3.0.0-preview7.19362.6
```
执行此命令之后再更新数据库就执行成功了。

[参考地址:https://blog.csdn.net/topdeveloperr/article/details/101282099](https://blog.csdn.net/topdeveloperr/article/details/101282099)

> NCF如何调试

[参考地址:https://www.cnblogs.com/szw/p/debug-remote-source-code.html](https://www.cnblogs.com/szw/p/debug-remote-source-code.html)

> 后台UI框架

[参考地址:https://element.eleme.cn/#/zh-CN](https://element.eleme.cn/#/zh-CN)

> 图标参考

[参考地址:https://colorlib.com/polygon/gentelella/icons.html](https://colorlib.com/polygon/gentelella/icons.html)