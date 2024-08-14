# Xncf模块简介

NCF 采用高度模块化的架构和开发思路，大部分项目、功能以模块（Xncf）的形式存在。

## Xncf 介绍

<img src="./images/logo.png" width="300" />

### NcfPackageSources

<!-- |              |    .NET Core    |     CI/CD
|--------------|-----------------|---------------
|  Basic       | ![.NET Core](https://github.com/NeuCharFramework/NcfPackageSources/workflows/.NET%20Core/badge.svg)  |  [![Build status](https://mysenparc.visualstudio.com/NeuCharFramework/_apis/build/status/NeuCharFramework-ASP.NET%20Core-CI)](https://mysenparc.visualstudio.com/NeuCharFramework/_build/latest?definitionId=41)
|  Extensions  | ![.NET Core](https://github.com/NeuCharFramework/NcfPackageSources/workflows/.NET%20Core/badge.svg)  |  [![Build status](https://mysenparc.visualstudio.com/NeuCharFramework/_apis/build/status/NeuCharFramework-ASP.NET%20Core-CI)](https://mysenparc.visualstudio.com/NeuCharFramework/_build/latest?definitionId=41) -->

### 说明

本项目为 [https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources) 模板官方包的源码。

| 文件夹                | 说明                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- |
| src/Basic             | 必须安装的基础官方库，以 `Separc.Ncf.` 开头                                           |
| src/Extensions        | 扩展包，以 `Senparc.Xncf.` 开头                                                       |
| src/Extensions/System | 必须安装的系统扩展包，同样以 `Senparc.Xncf.` 开头，不在此文件夹中的模块一般为可选模块 |

## Xncf 官方包项目地址

[https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources)

## Xncf：WeixinManager Demo 项目地址

[https://github.com/NeuCharFramework/Senparc.Xncf.WeixinManager](https://github.com/NeuCharFramework/Senparc.Xncf.WeixinManager)

## Xncf 模块命名规则

举例：Senparc.Xncf.WeixinManager

| 名称          | 说明                                   |
| ------------- | -------------------------------------- |
| Senparc       | 公司名/单位名/自定义识别命名           |
| Xncf          | 固定名称(意思为Ncf框架的模块,容易识别) |
| WeixinManager | 模块的功能识别名称                     |

## 欢迎贡献代码！
