# Introduction to Xncf Modules

NCF adopts a highly modular architecture and development approach, with most projects and functionalities existing in the form of modules (Xncf).

## Introduction to Xncf

<img src="./images/logo.png" width="300" />

### NcfPackageSources

<!-- |              |    .NET Core    |     CI/CD
|--------------|-----------------|---------------
|  Basic       | ![.NET Core](https://github.com/NeuCharFramework/NcfPackageSources/workflows/.NET%20Core/badge.svg)  |  [![Build status](https://mysenparc.visualstudio.com/NeuCharFramework/_apis/build/status/NeuCharFramework-ASP.NET%20Core-CI)](https://mysenparc.visualstudio.com/NeuCharFramework/_build/latest?definitionId=41)
|  Extensions  | ![.NET Core](https://github.com/NeuCharFramework/NcfPackageSources/workflows/.NET%20Core/badge.svg)  |  [![Build status](https://mysenparc.visualstudio.com/NeuCharFramework/_apis/build/status/NeuCharFramework-ASP.NET%20Core-CI)](https://mysenparc.visualstudio.com/NeuCharFramework/_build/latest?definitionId=41) -->

### Description

This project is the source code for the official package template at [https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources).

| Folder                | Description                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| src/Basic             | Essential official libraries that must be installed, prefixed with `Separc.Ncf.`                                                   |
| src/Extensions        | Extension packages, prefixed with `Senparc.Xncf.`                                                                                  |
| src/Extensions/System | Essential system extension packages, also prefixed with `Senparc.Xncf.`. Modules not in this folder are generally optional modules |

## Xncf Official Package Project Address

[https://github.com/NeuCharFramework/NcfPackageSources](https://github.com/NeuCharFramework/NcfPackageSources)

## Xncf: WeixinManager Demo Project Address

[https://github.com/NeuCharFramework/Senparc.Xncf.WeixinManager](https://github.com/NeuCharFramework/Senparc.Xncf.WeixinManager)

## Xncf Module Naming Rules

Example: Senparc.Xncf.WeixinManager

| Name          | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| Senparc       | Company name/organization name/custom identification name      |
| Xncf          | Fixed name (meaning module of Ncf framework, easy to identify) |
| WeixinManager | Functional identification name of the module                   |

## Welcome to contribute code!
