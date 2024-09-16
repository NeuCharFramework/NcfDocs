import type { NavbarConfig } from '@vuepress/theme-default'
// import { version } from '../meta.js'

export const navbarZh: NavbarConfig = [
  {
    text: '指南',
    children: ['/zh/start/home/index.md'],
  },
  {
    text: '生态系统',
    children: [
      {
        text: '项目',
        children: [
          '/zh/Front/home/ready.md',
          '/zh/NcfPackageSources/home/index.md',
          '/zh/DynamicWebApi/home/index.md',
          '/zh/Deploy/home/index.md',
        ],
      },
      {
        text: '帮助',
        children: [
          {
            text: '在线资源',
            link: 'https://weixin.senparc.com/',
          },
          {
            text: '问答社区',
            link: 'https://weixin.senparc.com/QA',
          },
          {
            text: 'QQ群(147054579)',
            link: 'https://shang.qq.com/wpa/qunwpa?idkey=43ac0b00d5932d5d815ed2949b8f8fbc7dece1abd79e0182f10493e185bbb43f',
          },
          {
            text: 'Senparc微信SDK',
            link: 'https://sdk.weixin.senparc.com/',
          },
        ],
      },
    ],
  },
  {
    text: '上线实战',
    children: [],
  },
  {
    text: '开源仓库',
    children: [
      {
        text: 'Gitee',
        link: 'https://gitee.com/NeuCharFramework/NCF',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/NeuCharFramework/NCF',
      },
    ],
  },
]
