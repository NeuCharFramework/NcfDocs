# Log

## 2023-04-21 Update

```
Senparc.AI v0.1.4-beta1 new version released
Added chat conversation, Embedding Sample
Next, we will start integrating Senparc.Weixin SDK, stay tuned!
Open source address: https://github.com/Senparc/Senparc.AI

Sample usage introduction:
https://github.com/Senparc/Senparc.AI#%E5%91%BD%E4%BB%A4%E8%A1%8C%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E
```

## 2023-03-10 Update

```
ChatGPT + Dall&#183;E + Senparc Weixin SDK + NeuCharFramework, realizing a WeChat robot (group) solution based on modular architecture, will be fully open source, plug and play.
```

## 2023-03-06 Update

```
Senparc.Xncf.OpenAI module latest version has been released: https://www.nuget.org/packages/Senparc.Xncf.OpenAI/0.1.4-beta1

After loading into the NCF project, you can test the interface through Swagger (for local testing, it is recommended to use the source code and remove the Jwt lock). Next, we will release a demo based on WeChat conversation, fully open source, please follow the open source project:

Xncf.OpenAI module: https://github.com/NeuCharFramework/Senparc.Xncf.OpenAI

WeChat SDK: https://github.com/JeffreySu/WeiXinMPSDK
```

## 2021-08-01 Update

    1. Updated and released xncf package to nuget
    2. Added configuration
    3. Added database configuration
    4. Added multi-tenant configuration
    5. Updated glossary
    6. Added Redis configuration
    7. Improved specified database
    8. Improved base library update
    9. Improved implementing own business logic in Xncf
    10. Improved advanced development

## 2021-07-20 Update

    1. Updated multi-database support
    2. Updated multi-database switching
    3. Updated multi-database principles
    4. Updated log
    5. Updated FAQ

## 2020-09-20 Update

    NCF has released a new beta5, this update includes underlying database updates, refactored database synchronization methods, and updated documentation module. For new projects, it is recommended to use the new template. For old projects, you can manually update the database, steps:
    1. Update the latest NCF project code
    2. Set the `Senparc.Service` project as the startup project
    3. In the [Package Manager Console], select `Senparc.Service`, then enter: `update-database -Context SenparcEntities` and press Enter
    4. Done. No further action required.
