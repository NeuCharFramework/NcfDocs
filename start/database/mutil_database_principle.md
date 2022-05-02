# 多数据库原理

众所周知，微软的迁移数据库的工具Entity Framework (EF) Core 可谓是无敌于其他任何工具，非常好用而且兼容性很好

## 概述

Entity Framework (EF) Core 是轻量化、可扩展、开源和跨平台版的常用 Entity Framework 数据访问技术。

EF Core 可用作对象关系映射程序 (O/RM)，这可以实现以下两点：

使 .NET 开发人员能够使用 .NET 对象处理数据库。

无需再像通常那样编写大部分数据访问代码。

EF Core 支持多个数据库引擎。

NCF则基于EF Core为广大开发者提供最优秀的数据迁移

## 工作原理

创建 DbContext 实例

创建 Models 模型

对模型手动编码，使其符合数据库

创建模型后，使用 EF 迁移从模型创建数据库。 模型发生变化时，迁移可让数据库不断演进。

将 DbContext 注入到 Service 当中，由Service取得操作迁移数据库的权限，根据不同的数据库要求，迁移到不同的数据库中