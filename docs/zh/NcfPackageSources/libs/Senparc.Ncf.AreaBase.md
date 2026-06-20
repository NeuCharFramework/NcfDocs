# Senparc.Ncf.AreaBase

## 定位

`Senparc.Ncf.AreaBase` 为后台 Area/Razor 页面提供基础能力，主要解决“管理端鉴权、页面基类、约定配置”问题。

## 关键目录与类型

- `Admin/AdminPageModelBase.cs`：后台页面模型基类
- `Admin/AdminXscfModulePageModelBase.cs`：XNCF 模块页面基类
- `Admin/Filters/AdminAuthorizeAttribute.cs`：后台 Cookie 认证入口
- `Admin/Filters/ApiAuthorizeAttribute.cs`：API 鉴权辅助
- `Conventions/AutoValidateAntiForgeryTokenModelConvention.cs`：防伪约定

## 典型作用

- 为后台模块提供统一授权过滤器
- 统一后台页面基类能力
- 与 `AreasBase` 系统模块协同完成 Area 注册与菜单联动

## 开发建议

- 后台管理页优先继承现有 PageModel 基类，不重复造轮子。
- 管理型 API 统一应用授权特性，避免“页面受保护但 API 裸奔”。
- 新增后台功能时，同时检查菜单、权限策略、Area 路由是否对齐。

## 相关文档

- [IXncfRegister（当前接口）](./Senparc.Ncf.AreaBase/IxncfRegister.md)
