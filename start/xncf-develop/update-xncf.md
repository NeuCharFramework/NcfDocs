# 更新 Xncf 模块

Xncf 模块使用版本号来识别版本更新。

## 如何在代码中更新版本号？

找到Xncf模块中的Register文件

![Image text](./images/update-xncf/project_folder.PNG)

修改文件中的Version号

![Image text](./images/update-xncf/modify_version_number.PNG)

## 如何在 NCF 项目中更新模块？

您只需要引用最新的 dll（或安装 nuget 包），系统后台将自动扫描到版本更新：

`【模块管理】页面`

<img src="https://weixin.senparc.com/images/NCF/XncfModules/08.png" />



或 `模块详情页面`

<img src="https://weixin.senparc.com/images/NCF/XncfModules/09.png" />



点击【立即安装】即可完成新版本的升级！