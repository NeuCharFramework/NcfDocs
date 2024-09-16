# 配置多租户

## 多租户概述

多租户（Mutiple Tenant）,意味着可以由多个不同的租户同时使用一套系统，而看到的系统的数据是完全隔离的，默认系统的多租户是开启的状态，系统中多个租户目前的区分规则是以域名作为区分的

## 如何修改多租户配置

首先找到`Senparc.Web` 项目下的appsetting.json文件

<img src="./images/config-mutil-tenant1.png" />

## 系统模块的多租户数据表对应

数据库生成后，会自动生成一个多租户的表，如下

<img src="./images/mutil-tenant-table1.png" />

## 数据库中其他的表的变化

数据库生成后，会在每个表中都生成一个字段，如下

<img src="./images/mutil-tenant-table-field1.png" />

## 对应关系

TenantInfos 表中管理着所有租户的Id

每个表中的TenantId 都来源于 TenantInfos 表

大家从对应关系即可看出多租户的实现原理
