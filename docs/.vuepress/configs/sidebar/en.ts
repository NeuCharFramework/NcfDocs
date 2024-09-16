import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarEn: SidebarConfig = {
  '/start/': [
    {
      text: 'NCF Overview',
      children: [
        '/start/home/index.md',
        '/start/instruction/about-ncf',
        '/start/instruction/environment',
        '/start/instruction/front-mode',
        '/start/instruction/index_xncf',
      ],
    },
    {
      text: 'Prepare Development',
      children: [
        '/start/start-develop/get-ncf-template',
        '/start/start-develop/run-ncf',
        '/start/start-develop/run-ncf-with-cli',
        '/start/start-develop/install-app',
        '/start/start-develop/admin-login',
        '/start/start-develop/admin-background',
        '/start/start-develop/appsettings',
        '/start/start-develop/admin-module-manage',
        '/start/start-develop/get-docs',
      ],
    },
    {
      text: 'Configuration',
      children: [
        '/start/developer/entrance',
        '/start/database/setting',
        '/start/config/appsettings',
        '/start/config/docker',
        '/start/config/dapr',
        '/start/config/mutiple-tenant',
        '/start/config/redis',
      ],
    },
    {
      text: 'Modular Development',
      children: [
        '/start/xncf-develop/thought',
        '/start/xncf-develop/about-xncf',
        '/start/xncf-develop/create-xncf',
        '/start/xncf-develop/about-custom-xncf',
        '/start/xncf-develop/dev-xncf',
        '/start/xncf-develop/update-xncf',
        '/start/xncf-develop/invoke-between-modules',
        '/start/xncf-develop/publish_xncf_modules_to_nuget',
        '/start/xncf-develop/update_basic_library',
        '/start/developer/embedded_static_to_ncf',
        '/start/developer/issue_local_nuget',
        '/start/developer/advanced',
      ],
    },
    {
      text: 'Database',
      children: [
        '/start/database/setting',
        '/start/database/mutil_database_support',
        '/start/database/appoint_database',
        '/start/database/add_migration_for_service_project',
        '/start/database/mutil_database_principle',
        '/start/database/database_plant',
        '/start/database/add_migration_with_database_plant',
      ],
    },
    {
      text: 'Unit Testing',
      children: [
        '/start/unit-test/introduce',
        '/start/unit-test/development',
        '/start/unit-test/advanced',
        '/start/unit-test/attachment',
      ],
    },
    {
      text: 'Q&A',
      children: ['/start/qa/explanation_of_terms', '/start/qa/common_problem'],
    },
    {
      text: 'Release',
      children: [
        '/start/release/new_function',
        '/start/release/update',
        '/start/release/log',
      ],
    },
  ],
  '/Front/': [
    {
      text: 'Preparation',
      children: ['/Front/home/ready.md'],
    },
    {
      text: 'Run',
      children: [
        '/Front/run/main',
        '/Front/run/database',
        '/Front/run/role',
        '/Front/run/webapi',
        '/Front/run/demo',
      ],
    },
  ],
  '/NcfPackageSources/': [
    {
      text: 'NCF Libraries',
      children: [
        '/NcfPackageSources/libs/Senparc.Ncf.Core',
        '/NcfPackageSources/libs/Senparc.Ncf.Repository',
        '/NcfPackageSources/libs/Senparc.Ncf.Service',
        '/NcfPackageSources/libs/Senparc.Ncf.SMS',
        '/NcfPackageSources/libs/Senparc.Ncf.Mvc.UI',
        '/NcfPackageSources/libs/Senparc.Ncf.Log',
        '/NcfPackageSources/libs/Senparc.Ncf.Utility',
        '/NcfPackageSources/libs/Senparc.Ncf.XncfBase',
        '/NcfPackageSources/libs/Senparc.Ncf.AreaBase',
        '/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant',
      ],
    },
    {
      text: 'Senparc.Ncf.AreaBase',
      children: ['/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister'],
    },
  ],
  '/DynamicWebApi/': [
    {
      text: 'Dynamic WebApi',
      children: ['/DynamicWebApi/home/index.md'],
    },
  ],
  '/Deploy/': [
    {
      text: 'Windows Deployment',
      children: ['/Deploy/windows/ncf-website.md'],
    },
    {
      text: 'Linux Deployment',
      children: ['/Deploy/linux/ncf-website.md'],
    },
    {
      text: 'Docker Deployment',
      children: ['/Deploy/docker/ncf-website.md'],
    },
  ],
}
