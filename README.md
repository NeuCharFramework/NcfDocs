# NCF Docs

NCF 文档站点，使用 VuePress 构建，当前网站地址为 <https://doc.ncf.pub>。

## 本地开发

使用 Node.js 22 和 `package.json` 指定的 pnpm 9.5.0：

```sh
pnpm install --frozen-lockfile
pnpm docs:dev
```

测试和生成静态网站：

```sh
pnpm docs:test
pnpm docs:build
```

构建输出位于 `docs/.vuepress/dist/`。

## GitHub Actions 自动发布

[发布工作流](.github/workflows/deploy.yml) 在推送或合并到 `master` 时自动执行：

1. 安装锁定版本的依赖，运行测试，构建英文和中文文档。
2. 检查两个语言的首页，并保存构建产物（保留 7 天）。
3. 构建成功后，通过 FTPS/FTP 将静态网站同步到服务器。

目标分支为 `master` 的 PR 只测试和构建，不会发布，也不会读取 FTP 密钥。
可在 **Actions → Build and deploy docs → Run workflow** 中选择 `master` 手动发布；
选择其他分支时只构建。发布不会中途取消，同一分支的工作流不会同时运行，
避免多个任务同时写入服务器。GitHub 的并发队列可能合并待运行任务，
因此不保证每次提交都单独发布。

### 首次配置

1. 在仓库 **Settings → Environments** 中创建 `production` 环境。
   将该环境的 **Deployment branches and tags** 限制为 `master`。
   如需完全自动发布，不要设置必须人工批准的保护规则。
2. 在 `production` 环境中添加以下 **Environment secrets**。
   不要把账号或密码提交到仓库，也不要通过聊天发送。

| Secret           | 用途                                      | 示例                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| `FTP_SERVER`     | FTP 服务器域名或 IP，不含协议、端口、路径 | `ftp.example.com`        |
| `FTP_USERNAME`   | 专用部署账号                              | `ncf-docs-deploy`        |
| `FTP_PASSWORD`   | 部署账号密码                              | 在 GitHub Secrets 中填写 |
| `FTP_SERVER_DIR` | FTP 账号视角下的网站目录，必须以 `/` 结尾 | `/public_html/`          |

`FTP_SERVER_DIR` 必须指向当前域名实际使用的文档站点目录，而不是操作系统路径。
如果账号登录后已经位于网站根目录，可以显式设置为 `/`。
推荐使用仅能访问该站点目录的专用账号；不要指向包含其他网站、业务数据或源码的目录。

3. 按服务器需要，在 `production` 环境的 **Environment variables** 中配置：

| Variable       | 默认值 | 说明                                                                     |
| -------------- | ------ | ------------------------------------------------------------------------ |
| `FTP_PROTOCOL` | `ftps` | 显式 TLS 加密 FTP；普通 FTP 设置为 `ftp`，隐式 FTPS 设置为 `ftps-legacy` |
| `FTP_PORT`     | `21`   | 服务器端口；隐式 FTPS 通常使用 `990`，请以服务商配置为准                 |

默认校验 TLS 证书，服务器需要提供有效证书。普通 FTP 不加密账号和传输内容，
仅在明确接受风险且服务器不支持 FTPS 时使用。FTPS 不是 SFTP：
本工作流不适用于 SSH/SFTP 服务器。服务器还需要支持被动模式连接，
在防火墙放行对应端口，并允许 GitHub 托管 runner 连接。

如需 Google Analytics，在仓库 **Settings → Secrets and variables → Actions → Variables**
添加可选的仓库变量 `DOCS_GA_ID`。它用于构建，不要仅设置在发布环境中。

4. 确认仓库已启用 GitHub Actions，推送工作流到 `master`，或手动触发一次。
   在 Actions 中检查测试、构建和发布日志，再访问网站确认内容更新。
   如果已有内容，请先备份服务器上的站点。

### 同步行为与故障处理

- 只上传构建产物，不上传源码、依赖或密钥。构建失败时不会启动发布。
- 使用 `SamKirkland/FTP-Deploy-Action` 增量同步。服务器上的
  `.ftp-deploy-sync-state.json` 用来记录已发布文件；不要删除或公开其内容，
  建议在 Web 服务器中禁止访问点文件。
- 后续发布会删除同步记录中已不再存在于构建产物的旧文件。
  未被记录的服务器文件不会被主动清空，但同名文件可能被覆盖。
  `dangerous-clean-slate` 保持关闭，首次部署也不会清空整个目录。
- FTP 同步不是原子切换。上传中可能短暂出现新旧文件混合，连接中断也可能留下部分更新。
  失败时 Actions 会报错；修复连接、目录权限或证书问题后，从 `master` 重新运行工作流。
- 回退内容可通过将回退提交推送到 `master` 后重新发布完成。不要只重新运行旧提交的发布任务，
  以免覆盖更新的版本。
- 网站当前使用 `base: '/'`，适合部署到域名根目录。若要改成域名下的子路径，
  还需要同步修改 [VuePress 配置](docs/.vuepress/config.ts) 的 `base`。
