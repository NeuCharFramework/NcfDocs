# 更新基础库

什么是更新基础库，更新基础库的意思就是更新NCF中引用的底层核心库的nuget版本

## 如何更新基础库

第一步:双击项目名称打开项目文件进行编辑

<img src="./images/double-click-project1.png" />

即可打开

<img src="./images/opened-project-file1.png" />

第二步:找到你要想要更新的基础库的名称

<img src="./images/find-library-name1.png" />

第三步:打开nuget，将基础库的名字输入进去，查询库最新的版本号是多少

<img src="./images/search-package-name-for-nuget1.png" />

点击打开

<img src="./images/select-package1.png" />

可以看到很多个版本，这里可以选择最新的

<img src="./images/select-last-new-version1.png" />

第四步:修改项目文件中引用的基础库的版本号

<img src="./images/update-library-version1.png" />

## 如何使用本地编译的基础库

可以参考如何生成本地的nuget包的步骤来操作[发布本地Nuget](/start/developer/issue_local_nuget.html)

生成本地的nuget包以后，可以把需要引用的本地的nuget包放到一个统一的文件夹，便于管理

使用上面 `如何更新基础库` 的方法，进行更新即可

[基础库](/NcfPackageSources)
