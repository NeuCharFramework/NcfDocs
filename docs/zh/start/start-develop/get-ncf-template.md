# 获取 NCF 模板源码

## 方法一：从命令行安装（推荐）

在已经安装了 .NET 运行时的开发环境中打开命令行，输入：

```shell
dotnet new install Senparc.NCF.Template
```

安装成功后，客户端提示：

<img src="./images/get-ncf-template-05-install-package.png" />

进入需要创建项目的文件夹，输入命令：

```shell
dotnet new NCF -n MyProject
```

<img src="./images/get-ncf-template-06-create-project.png" />

> 其中，`MyProject` 为项目名称，可根据需要修改，如果不提供 `-n` 参数，则使用默认名称创建。

模板的启动，使用 `Visual Studio` 打开项目，默认的启动项目为 `Senparc.Aspire.AppHost`

<img src="./images/get-ncf-template-07-default-startup-project.png" />

启动后的输出信息

<img src="./images/get-ncf-template-08-startup-console.png" />

提示 `Aspire` 启动页面

<img src="./images/get-ncf-template-09-startup-aspire.png" />

输入令牌

<img src="./images/get-ncf-template-10-startup-aspire-password.png" />

登录 `Aspire` 后

<img src="./images/get-ncf-template-11-startup-aspire-logined.png" />

## 方法二：从源码地址获取源码

以下两个代码托管地址，为 NCF 官方代码发布渠道：

- GitHub：[https://github.com/NeuCharFramework/NCF](https://github.com/NeuCharFramework/NCF)

- Gitee：[https://gitee.com/NeuCharFramework/NCF](https://gitee.com/NeuCharFramework/NCF)

> 💡 说明：Gitee 的代码是从 GitHub 镜像而来，可能存在延迟，因此如果您希望获取最新版本的代码，可从 GitHub 站点获取，操作方法类似。

下面以 Gitee 为例，GitHub 站点操作类似。

### 方式一：直接下载 .zip 包

打开项目源码地址，点击【克隆/下载】按钮，点击【下载ZIP】按钮，即可完成NCF源码下载

<img src="./images/get-ncf-tempate-01-download-from-gitee.png" />

下载完成后，解压到指定地址即可。

### 方式二：使用 Git 同步到本地

打开项目源码地址，点击【克隆/下载】按钮，点击【复制】按钮，即可获得 git 地址，如：

> https://gitee.com/NeuCharFramework/NCF.git

<img src="./images/get-ncf-tempate-02-copy-git-url.png" />

打开 Visual Studio，点击【克隆储存库】：

<img src="./images/get-ncf-tempate-03-clone-01.png" />

将 git 地址粘贴到【储存库位置】，并设置用于存放源代码的【本地路径】，然后点击【克隆】按钮：

<img src="./images/get-ncf-tempate-03-clone-02.png" />

### 方式三：先 Fork，后同步 Git（推荐）

打开项目源码地址，点击右上角【Fork】按钮，将官方源码在自己的账户下做一个副本，然后在自己的副本项目下，重复上述“方式二”：
<img src="./images/get-ncf-tempate-04-fork.png" />

> 注：Fork 的库不会自动同步官方的源码，如需获得最新的源码，需要手动再次同步。
