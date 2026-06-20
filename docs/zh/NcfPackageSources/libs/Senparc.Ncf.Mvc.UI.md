# Senparc.Ncf.Mvc.UI

## 定位

`Senparc.Ncf.Mvc.UI` 提供后台界面开发常用的 MVC/Razor 辅助能力，减少重复 UI 模板代码。

## 关键目录与能力

- `UIHelpers`：分页、菜单、高亮、Grid 等扩展
- `backend`：后台模板辅助类型
- `HtmlExtension.Core.cs`：HTML 扩展入口

典型扩展包括：

- `PagerBarExtension`
- `GridViewExtension`
- `CurrentMenuExtensions`
- `CurrentBsMenuExtensions`

## 适用场景

- 快速搭建后台管理页
- 统一后台列表/分页交互风格
- 复用现有 NCF 后台 UI 行为

## 使用建议

- 新模块后台页优先沿用现有 UIHelpers，降低样式和交互割裂。
- 与 `AreaBase` 协作时，保持页面鉴权与菜单注册一致。
