# 发布Xncf 模块到nuget.org

第一步：选中项目，并右键属性，打开打包选项

<img src="./images/general-nuget-package.png" />

勾选在构建时生成nuget包

第二步：重新编译项目，生成的nuget包会编译到自己设定的资料夹中

<img src="./images/build-finished-nuget-package.png" />

第三步：登陆[nuget.org](https://www.nuget.org/) 官网

<img src="./images/nuget-sign-in.png" />

第四步：选择上传nuget包

<img src="./images/nuget-upload-package.png" />

<img src="./images/nuget-upload-package-2.PNG" />

第五步：点击Submit，提交完成后，就交给nuget了，等待片刻，即可上线nuget包

