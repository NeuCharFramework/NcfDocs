# Senparc.Ncf.Utility

## 定位

`Senparc.Ncf.Utility` 是 NCF 通用工具集，覆盖字符串/时间/文件/反射/表达式扩展等常见开发能力。

## 关键目录

- `Extensions`：`StringExtensions`、`DateTimeExtensions`、`IntegerExtensions`
- `ExpressionExtension`：动态表达式与查询扩展
- `StreamExtensions`：流包装与处理
- `Helpers`：反射、文化信息等辅助工具
- `DIExtension`：依赖注入辅助扩展

## 典型用途

- 提升查询表达式复用（尤其是动态过滤/排序）。
- 统一文件与路径处理工具。
- 减少业务代码中的重复工具方法。

## 使用建议

- 仅将“稳定、可复用、无业务语义”的方法下沉到 Utility。
- 避免把业务规则工具化后塞入 Utility，保持边界清晰。
