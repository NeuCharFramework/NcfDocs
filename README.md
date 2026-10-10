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

[发布工作流](.github/workflows/azure-static-web-apps-delightful-mud-0da5a8610.yml)
在推送或合并到 `main` 时自动执行：

1. 安装锁定版本的依赖，运行测试，构建英文和中文文档。
2. 检查两个语言的首页，并保存构建产物（保留 7 天）。
3. 构建成功后，将产物发布到 Azure Static Web Apps：
   <https://delightful-mud-0da5a8610.1.azurestaticapps.net>。

目标分支为 `main` 的 PR 只测试和构建，不会发布，也不会读取 Azure 部署令牌。
本工作流不创建 PR 预览环境，因此不需要关闭预览环境的任务或 PR 写权限。
可在 **Actions → Azure Static Web Apps CI/CD → Run workflow** 中选择 `main` 手动发布；
选择其他分支时只构建。发布不会中途取消，同一分支的工作流不会同时运行，
避免多个任务同时发布生产站点。GitHub 的并发队列可能合并待运行任务，
因此不保证每次提交都单独发布。

### 首次配置

1. 使用已创建的 Azure Static Web Apps 服务。在 Azure Portal 中打开该资源，
   如需重新配置凭据，使用 **Manage deployment token（管理部署令牌）** 获取令牌。
2. 在仓库 **Settings → Secrets and variables → Actions → Secrets** 中确认存在
   仓库 Secret `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUD_0DA5A8610`。
   工作流沿用 Azure 自动生成的 Secret 名称；如果已经存在且有效，无需修改。
   不要把令牌提交到仓库、写入日志或通过聊天发送。
   此工作流不使用之前 FTP 配置的 `production` 环境，令牌应为仓库 Secret，
   而不是仅存放在该环境中。

如需 Google Analytics，在仓库 **Settings → Secrets and variables → Actions → Variables**
添加可选的仓库变量 `DOCS_GA_ID`。它用于构建，不要仅设置在发布环境中。

3. 确认仓库已启用 GitHub Actions，将修复提交合并到 `main`，或从 `main` 手动触发一次。
   此工作流替换 Azure 自动生成的同名工作流；旧 FTP 工作流已移除，不要保留另一份
   监听同一生产分支的部署工作流，以免重复发布。
4. 在 Actions 中检查测试、构建和发布日志，再访问 Azure 默认域名确认内容更新。
   如需继续使用 `doc.ncf.pub`，在 Azure 资源的 **Custom domains（自定义域）** 中
   按提示验证域名并配置 DNS。确认新站点正常后再切换域名。

原有 FTP Secrets（`FTP_SERVER`、`FTP_USERNAME`、`FTP_PASSWORD`、`FTP_SERVER_DIR`）
以及变量（`FTP_PROTOCOL`、`FTP_PORT`）不再使用，可在确认其他工作流不依赖它们后删除。

### 构建方式与故障处理

- 只上传构建产物，不上传源码、依赖或密钥。构建失败时不会启动发布。
- 构建明确使用 Node.js 22、pnpm 9.5.0、锁文件和 `pnpm docs:build`。
  Azure 的 Oryx 默认寻找 `build` 或 `build:azure`，而本项目使用 `docs:build`。
  因此工作流先自行构建，再设置 `skip_app_build: true` 上传已构建的文件，
  不需要新增 `build` 脚本或让 Oryx 再次安装依赖。
- 跳过构建时，`app_location: site` 指向下载后的产物目录，
  `output_location` 必须为空。项目没有 Azure Functions API，
  因此 `api_location` 为空并设置 `skip_api_build: true`。
- `production_branch: main` 明确指定生产发布分支。
  保留 VuePress 的多页面输出，不配置将所有路径重写到首页的 SPA fallback。
- 若出现令牌缺失或认证失败，请检查仓库 Secret，必要时在 Azure 重置部署令牌并更新 Secret。
  修复后使用包含新工作流的 `main` 提交重新触发；重新运行旧失败任务仍会使用旧工作流。
- 回退内容可通过将回退提交推送到 `main` 后重新发布完成。不要只重新运行旧提交的发布任务，
  以免覆盖更新的版本。
- 网站当前使用 `base: '/'`，适合部署到域名根目录。若要改成域名下的子路径，
  还需要同步修改 [VuePress 配置](docs/.vuepress/config.ts) 的 `base`。
