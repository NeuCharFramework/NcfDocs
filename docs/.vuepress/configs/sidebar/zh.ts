import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarZh: SidebarConfig = {
  '/zh/start/': [
    {
      text: 'NCF 概要',
      children: [
        '/zh/start/home/index.md',
        '/zh/start/instruction/about-ncf',
        '/zh/start/instruction/environment',
        '/zh/start/instruction/front-mode',
        '/zh/start/instruction/index_xncf',
      ],
    },
    {
      text: '准备开发',
      children: [
        '/zh/start/start-develop/get-ncf-template',
        '/zh/start/start-develop/run-ncf',
        '/zh/start/start-develop/run-ncf-with-cli',
        '/zh/start/start-develop/install-app',
        '/zh/start/start-develop/admin-login',
        '/zh/start/start-develop/admin-background',
        '/zh/start/start-develop/appsettings',
        '/zh/start/start-develop/admin-module-manage',
        '/zh/start/start-develop/get-docs',
      ],
    },
    {
      text: '配置',
      children: [
        '/zh/start/developer/entrance',
        '/zh/start/database/setting',
        '/zh/start/config/appsettings',
        '/zh/start/config/docker',
        '/zh/start/config/dapr',
        '/zh/start/config/mutiple-tenant',
        '/zh/start/config/redis',
      ],
    },
    {
      text: '模块化开发',
      children: [
        '/zh/start/xncf-develop/thought',
        '/zh/start/xncf-develop/about-xncf',
        '/zh/start/xncf-develop/create-xncf',
        '/zh/start/xncf-develop/about-custom-xncf',
        '/zh/start/xncf-develop/dev-xncf',
        '/zh/start/xncf-develop/update-xncf',
        '/zh/start/xncf-develop/invoke-between-modules',
        '/zh/start/xncf-develop/publish_xncf_modules_to_nuget',
        '/zh/start/xncf-develop/update_basic_library',
        '/zh/start/developer/embedded_static_to_ncf',
        '/zh/start/developer/issue_local_nuget',
        '/zh/start/developer/advanced',
      ],
    },
    {
      text: '数据库',
      children: [
        '/zh/start/database/setting',
        '/zh/start/database/mutil_database_support',
        '/zh/start/database/appoint_database',
        '/zh/start/database/add_migration_for_service_project',
        '/zh/start/database/mutil_database_principle',
        '/zh/start/database/database_plant',
        '/zh/start/database/add_migration_with_database_plant',
      ],
    },
    {
      text: '单元测试',
      children: [
        '/zh/start/unit-test/introduce',
        '/zh/start/unit-test/development',
        '/zh/start/unit-test/advanced',
        '/zh/start/unit-test/attachment',
      ],
    },
    {
      text: 'Q&A',
      children: [
        '/zh/start/qa/explanation_of_terms',
        '/zh/start/qa/common_problem',
      ],
    },
    {
      text: '新发布',
      children: [
        '/zh/start/release/new_function',
        '/zh/start/release/update',
        '/zh/start/release/log',
      ],
    },
  ],
  '/zh/Front/': [
    {
      text: '准备',
      children: ['/zh/Front/home/ready.md'],
    },
    {
      text: '运行',
      children: [
        '/zh/Front/run/main',
        '/zh/Front/run/database',
        '/zh/Front/run/role',
        '/zh/Front/run/webapi',
        '/zh/Front/run/demo',
      ],
    },
  ],
  '/zh/NcfPackageSources/': [
    {
      text: 'NCF 基础库',
      children: [
        '/zh/NcfPackageSources/libs/Senparc.Ncf.Core',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.Repository',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.Service',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.SMS',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.Mvc.UI',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.Log',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.Utility',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.XncfBase',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.AreaBase',
        '/zh/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant',
      ],
    },
    {
      text: 'Senparc.Ncf.AreaBase',
      children: [
        '/zh/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister',
      ],
    },
  ],
  '/zh/DynamicWebApi/': [
    {
      text: '动态WebApi',
      children: ['/zh/DynamicWebApi/home/index.md'],
    },
  ],
  '/zh/Deploy/': [
    {
      text: 'Windows部署',
      children: ['/zh/Deploy/windows/ncf-website.md'],
    },
    {
      text: 'Linux部署',
      children: ['/zh/Deploy/linux/ncf-website.md'],
    },
    {
      text: 'Docker部署',
      children: ['/zh/Deploy/docker/ncf-website.md'],
    },
  ],
  '/zh/guide/': [
    {
      text: '指南2',
      children: [
        '/zh/guide/introduction.md',
        '/zh/guide/getting-started.md',
        '/zh/guide/configuration.md',
        '/zh/guide/page.md',
        '/zh/guide/markdown.md',
        '/zh/guide/assets.md',
        '/zh/guide/i18n.md',
        '/zh/guide/deployment.md',
        '/zh/guide/theme.md',
        '/zh/guide/plugin.md',
        '/zh/guide/bundler.md',
        '/zh/guide/migration.md',
        '/zh/guide/troubleshooting.md',
      ],
    },
  ],
  '/zh/advanced/': [
    {
      text: '深入',
      children: [
        '/zh/advanced/architecture.md',
        '/zh/advanced/plugin.md',
        '/zh/advanced/theme.md',
      ],
    },
    {
      text: 'Cookbook',
      children: [
        '/zh/advanced/cookbook/README.md',
        '/zh/advanced/cookbook/usage-of-client-config.md',
        '/zh/advanced/cookbook/adding-extra-pages.md',
        '/zh/advanced/cookbook/making-a-theme-extendable.md',
        '/zh/advanced/cookbook/passing-data-to-client-code.md',
        '/zh/advanced/cookbook/markdown-and-vue-sfc.md',
        '/zh/advanced/cookbook/resolving-routes.md',
      ],
    },
  ],
  '/zh/reference/': [
    {
      text: '核心',
      collapsible: true,
      children: [
        '/zh/reference/cli.md',
        '/zh/reference/config.md',
        '/zh/reference/frontmatter.md',
        '/zh/reference/components.md',
        '/zh/reference/plugin-api.md',
        '/zh/reference/theme-api.md',
        '/zh/reference/client-api.md',
        '/zh/reference/node-api.md',
      ],
    },
    {
      text: '打包工具',
      children: [
        '/zh/reference/bundler/vite.md',
        '/zh/reference/bundler/webpack.md',
      ],
    },
    {
      text: '生态系统',
      children: [
        {
          text: '默认主题',
          link: 'https://ecosystem.vuejs.press/zh/themes/default/',
        },
        {
          text: '插件',
          link: 'https://ecosystem.vuejs.press/zh/plugins/',
        },
      ],
    },
  ],
}