# AdminChat 对话、Harness 与附件

<a id="help-admin-chat"></a>

## AdminChat

新建或选择会话，选择可用模型，并在发送前确认当前模式。
会话历史、Workspace 关联和当前模型是不同的配置；切换会话不代表授权修改文件。
检查生成内容和工具请求，不要把流畅的回答当作任务已经完成的证据。
左侧“新对话”进入创建入口，列表按 Workspace 分组；切换会话用于查看相应历史，
组内排序与会话最后活跃时间不是同一个概念。“管理”用于选择和处理消息，不是保存 Memory。
输入区选择模型与执行模式，Ctrl+Enter / Cmd+Enter 发送；终止任务不会回滚已发生的外部操作。
附件、Workspace 权限和 Memory 各有独立帮助，不应拿其中一项的设置说明替代另一项。

Memory 默认关闭，可按会话选择只读或学习；它与聊天历史和 Workspace 文件不同。
模式、作用域、保存回执、Markdown 编辑及 SystemMessage 请参阅
[AdminChat Memory 与对话设置](./adminchat-memory.md)。

<a id="help-chat-harness"></a>

## 普通对话与 Harness

**普通对话（Simple）**用于常规交流；**Harness**用于更长的工具驱动任务，
并提供进度与审批交互。批准前阅读拟执行的动作；中断任务并不会回滚已经发生的副作用。
通过轨迹、历史等入口核对实际执行情况。
Workspace 写入权限与执行权限始终需要分别明确授权。

<a id="help-chat-attachments"></a>

## 附件、视觉与大文件

仅向可以访问 Workspace 的会话上传、粘贴或拖入受支持文件。
上传提示显示当前生效限制，不要假设所有文件都能完整放入模型上下文；
大文件可能需要分块读取 Workspace，或另行授权处理。

上传文件**不代表**授权 AI 写入、执行 Python 或其他命令。
图像视觉需要主动勾选并选择兼容模型；扫描 PDF 可能需要 OCR。
上传成功不代表文本解析成功。移除尚未发送的附件可能删除其 Workspace 资源，
不要用此操作代替隐藏已经提交的文件。
