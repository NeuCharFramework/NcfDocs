# NCF 单元测试介绍

## 简介

NCF 为所有的模块提供了单元测试框架，以保证代码的质量。单元测试是一种测试方法，用于验证代码的正确性。

在 NCF 中，我们坚持采用标准的 DDD（Domain-Driven Design）模式进行，完全隔离不同阶段的数据库、不同领域的数据。一方面，NCF 的单元测试设计可以让开发人员专注于业务逻辑测试，并提供了一整套底层支撑体系，使开发者可以非常方便地进行单元测试，同时支持 DevOps 中 CI/CD 过程的自动测试，甚至使用 Agent（智能体）进行自动化测试和优化；另外一方面，NCF 所提供的基础框架也为 TDD（Test-Driven Development）提供了良好的支持。

## 单元测试基础模块

Nuget 包：[Senparc.Ncf.UnitTestExtension](https://www.nuget.org/packages/Senparc.Ncf.UnitTestExtension)

源码：[Senparc.Ncf.UnitTestExtension](https://github.com/NeuCharFramework/NcfPackageSources/blob/32ee9ce35609a9c7886096429263daa9f32d13c9/src/Basic/Senparc.Ncf.UnitTestExtension/)
