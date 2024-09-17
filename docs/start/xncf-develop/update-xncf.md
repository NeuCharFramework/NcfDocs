# 更新 Xncf 模块

Xncf 模块使用版本号来标识版本更新。

## 如何在代码中更新版本号？

找到 Xncf 模块中的 Register 文件

<img src="./images/update-xncf/project_folder1.png" />

修改文件中的 Version 号

<img src="./images/update-xncf/modify_version_number1.png" />

## 如何在 NCF 项目中更新模块？

只需要引用最新的 dll（或安装 nuget 包），系统后台会自动扫描版本更新：

`【模块管理】页面`

<img src="https://weixin.senparc.com/images/NCF/XncfModules/08.png" />

或 `模块详情页面`

<img src="https://weixin.senparc.com/images/NCF/XncfModules/09.png" />

点击【立即安装】完成升级到新版本！
