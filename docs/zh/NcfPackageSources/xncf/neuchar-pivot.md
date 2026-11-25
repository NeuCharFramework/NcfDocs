# NeuCharPivot 面板、聚合与权限

<a id="help-pivot-boards"></a>

## NeuCharPivot 面板

面板用于组织 Function 区块。添加前核对模块与 Function 身份。
创建面板时填写名称、页面标识、列数和启用状态；例如 `admin-home` 对应后台首页。
“添加块”选择模块及 Function，“AI”用于修改面板布局；均不等于直接执行所有区块。
“模块缺失”占位不是执行成功，应恢复模块或删除过时区块。
把区块放入面板不会绕过 Function 的访问策略。

<a id="help-pivot-aggregate"></a>

## NeuCharPivot 聚合

聚合页按模块集中展示 NeuCharPivot Function，可按模块状态、Function 状态、
LoopTask 状态及 Workflow 关联筛选，再在目标 Function 的输入区执行操作。
这里不是串接工作流的编辑器，也没有“把所有筛选结果作为一个事务执行”的含义。
已移除或未开启模块的配置可能保留用于查看，但不能据此执行不可用的 Function。

<a id="help-pivot-access"></a>

## NeuCharPivot 访问策略

策略可以开放、限制、禁止或继承模块 Function 的访问权限。
数据库策略覆盖相应代码属性，批量修改前核对选中的 Function。
恢复继承与清除存储策略是不同操作。
模块删除后孤儿策略可能保留，并在重装后再次生效，不能假设其自动消失。
