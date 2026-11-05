# Skill 导入、测试与发布

<a id="help-prompt-skills"></a>

## Skill

### 操作顺序

1. 选择来源：本地包、远程 ZIP/Release、GitHub 文件夹，或 AI 生成。
2. 检查 Draft 的 Manifest、实际文件和声明权限，确认内容与目标能力一致。
3. 在测试入口验证行为，修正 Draft 中的问题后再发布。
4. 在目标 Agent 或 AdminChat 中检查实际可用的已发布 Skill；不要把 Draft 的存在当作已经生效。

### Draft 与发布边界

页面支持 ZIP/Release 地址、本地上传和 GitHub 文件夹导入，也可用 AI 创建或修改 Skill。
导入和生成先产生 **Draft**；先预览 Manifest、文件及权限，完成测试后再发布给 Agent 或 AdminChat。
“生成 Draft Skill”不是发布，“预览内容”也不会执行 Skill。
Skill 指令不是权限授权，不要把密钥写入 Skill 文件，
也不要未经审核就认为外部导入指令可以安全执行。
