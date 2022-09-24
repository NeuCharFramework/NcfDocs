module.exports = {
    title: 'NCF文档',
    description: '简单   灵活   可扩展',
    base: '/docs/',
    head: [
        ['link', { rel: 'shortcut icon', type: "image/x-icon", href: './favicon.ico' }],
        ['script', {}, ``]
    ],
    evergreen: true,
    port: 8080,
    ga: 'UA-71886989-13',
    themeConfig: {
        repo: 'NeuCharFramework/NCF',
        docsDir: 'doc',
        editLinks: true,
        editLinkText: '编辑此页面！',
        nav: [
            { text: '指南', link: '/start/home/index' },
            {
                text: '生态系统',
                items: [
                    {
                        text: "项目", items: [
                            { text: '前后端分离版', link: '/Front/home/index' },
                            { text: '基础库源码解析', link: '/NcfPackageSources/home/index' },
                            { text: '动态WebApi', link: '/DynamicWebApi/home/index' }
                        ]
                    },
                    {
                        text: '帮助', items: [
                            { text: '在线资源', link: 'https://weixin.senparc.com/' },
                            { text: '问答社区', link: 'https://weixin.senparc.com/QA' },
                            { text: 'QQ群(147054579)', link: 'https://shang.qq.com/wpa/qunwpa?idkey=43ac0b00d5932d5d815ed2949b8f8fbc7dece1abd79e0182f10493e185bbb43f' },
                            { text: 'Senparc微信SDK', link: 'https://sdk.weixin.senparc.com/' }
                        ]
                    },

                ]
            },
            { text: '上线实战', link: '/' },
            { text: 'Gitee', link: 'https://gitee.com/NeuCharFramework/NCF' }
        ],
        sidebar: {
            '/start/': [
                {
                    title: 'NCF概要',
                    collapsable: false,
                    children: [
                        '/start/instruction/about-ncf',
                        '/start/instruction/environment',
                        '/start/instruction/index_xncf'
                    ]
                },
                {
                    title: '开始开发',
                    collapsable: false,
                    children: [
                        '/start/start-develop/get-ncf-template',
                        '/start/start-develop/run-ncf',
                        '/start/start-develop/install-app',
                        '/start/start-develop/admin-login',
                        '/start/start-develop/admin-background',
                        '/start/start-develop/admin-module-manage',
                        '/start/start-develop/get-docs'
                    ]
                },
                {
                    title: '配置',
                    collapsable: false,
                    children: [
                        '/start/developer/entrance',
                        '/start/database/setting',
                        '/start/config/docker',
                        '/start/config/dapr',
                        '/start/config/mutiple-tenant',
                        '/start/config/redis'
                    ]
                },
                {
                    title: '模块化开发',
                    collapsable: false,
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
                        '/start/developer/advanced'
                    ]
                },
                {
                    title: '数据库',
                    collapsable: false,
                    children: [
                        '/start/database/setting',
                        '/start/database/mutil_database_support',
                        '/start/database/appoint_database',
                        '/start/database/add_migration_for_service_project',
                        '/start/database/mutil_database_principle',
                        '/start/database/database_plant',
                        '/start/database/add_migration_with_database_plant'
                    ]
                },
                {
                    title: 'Q&A',
                    collapsable: false,
                    children: [
                        '/start/qa/explanation_of_terms',
                        '/start/qa/common_problem'
                    ]
                },
                {
                    title: '新发布',
                    collapsable: false,
                    children: [
                        '/start/release/new_function',
                        '/start/release/update',
                        '/start/release/log'
                    ]
                }
            ],
            '/Front/': [
                {
                    title: '运行',
                    collapsable: false,
                    children: [
                        '/Front/run/main',
                        '/Front/run/database',
                        '/Front/run/role',
                        '/Front/run/webapi',
                        '/Front/run/demo'
                    ]
                }
            ],
            '/NcfPackageSources/': [
                {
                    title: 'NCF 基础库',
                    collapsable: false,
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
                        '/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant'
                    ]
                },
                {
                    title: 'Senparc.Ncf.AreaBase',
                    collapsable: false,
                    children: [
                        '/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister'
                    ]
                }
            ],
            '/DynamicWebApi/': [
                {
                    title: '动态WebApi',
                    collapsable: false
                }
            ]
        }
    }
}
