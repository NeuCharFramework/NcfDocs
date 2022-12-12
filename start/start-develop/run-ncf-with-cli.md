# 使用 CLI 运行 NCF


## 第一步：打开命令行工具或 Visual Studio Code

进入 NCF 的 Senparc.Web 项目（启动项目）所在目录路径：

<img src="./images/run-ncf-with-cli-01.png" />

> 提示：Visual Studio Code 中，按 <kbd>Ctrl + ~</kbd> 可以打开命令行工具。

## 第二步：输入 .NET 项目启动指令

```
E:\...\Senparc.Web > dotnet run 
```

> 注意：默认运行的数据库为 SQL Server，如需更换其他数据库，请查看《[使用多数据库](/start/database/mutil_database_support.html)》。


## 完成启动

稍等数秒后，即可完成 NCF Web 项目的启动。

由于 CLI 命令行的一些行为特点，最后您可能会看到站点地址的提示，也可能会停留在系统启动日志上，这都是正常的：

<img src="./images/run-ncf-with-cli-02.png" />

您只需直接在浏览器打开 `https://localhost:5001` 即可看到启动页面：

<img src="./images/run-ncf-with-cli-03.png" />

> 提示：启动端口您也可以通过修改 `launchSettings.json` 文件中配置进行更换（默认为 `"https://localhost:5001;http://localhost:5000"`），或通过命令行参数指定。

## 首次启动安装

当第一次启动时，系统会自动提示[安装](/start/start-develop/install.html)，安装完成后，安装界面将不再出现。