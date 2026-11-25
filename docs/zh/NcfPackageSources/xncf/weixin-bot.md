# 个人微信 Bot 与后台集成

<a id="help-weixin-claw"></a>

## 个人微信 Bot

通过页面扫码/登录流程连接目标账号，并检查运行状态，断开不再使用的账号。
刷新二维码、编辑账号、绑定配置和进入聊天分别处理连接、账号信息、集成关系和消息发送；
发送图片/文件等媒体前确认当前接收对象。
Bot 已连通不代表自动获得 AdminChat、Workflow 或 Workspace 操作授权。

<a id="help-weixin-integration"></a>

## 个人微信与后台集成

显式配置管理员绑定及所需功能权限，并保护绑定码。
Chat、Workflow、NeuBell、Harness 是独立能力，只开启需要的部分。
批准任务前核对绑定身份，停用账号或设备时应处理解绑。
