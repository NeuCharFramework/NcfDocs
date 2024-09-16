import type { NavbarConfig } from '@vuepress/theme-default'
// import { version } from '../meta.js'

export const navbarEn: NavbarConfig = [
  {
    text: 'Guide',
    children: ['/start/home/index.md'],
  },
  {
    text: 'Ecosystem',
    children: [
      {
        text: 'Projects',
        children: [
          '/Front/home/ready.md',
          '/NcfPackageSources/home/index.md',
          '/DynamicWebApi/home/index.md',
          '/Deploy/home/index.md',
        ],
      },
      {
        text: 'Help',
        children: [
          {
            text: 'Online Resources',
            link: 'https://weixin.senparc.com/',
          },
          {
            text: 'Q&A Community',
            link: 'https://weixin.senparc.com/QA',
          },
          {
            text: 'QQ Group (147054579)',
            link: 'https://shang.qq.com/wpa/qunwpa?idkey=43ac0b00d5932d5d815ed2949b8f8fbc7dece1abd79e0182f10493e185bbb43f',
          },
          {
            text: 'Senparc WeChat SDK',
            link: 'https://sdk.weixin.senparc.com/',
          },
        ],
      },
    ],
  },
  {
    text: 'Deployment Practice',
    children: [],
  },
  {
    text: 'Open Source Repos',
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
