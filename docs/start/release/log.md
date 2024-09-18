# Logs

## 2023-04-21 Update

```
Senparc.AI v0.1.4-beta1 new version released
Added chat conversation, Embedding Sample
Senparc.Weixin SDK integration will start soon, stay tuned!
Open source address: https://github.com/Senparc/Senparc.AI

Sample usage introduction:
https://github.com/Senparc/Senparc.AI#%E5%91%BD%E4%BB%A4%E8%A1%8C%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E
```

## 2023-03-10 Update

```
ChatGPT + Dall&#183;E + Senparc WeChat SDK + NeuCharFramework, to achieve a WeChat robot (group) solution based on modular architecture, will be fully open source, plug and play.

```

## 2023-03-06 Update

```
Senparc.Xncf.OpenAI module latest version has been released: https://www.nuget.org/packages/Senparc.Xncf.OpenAI/0.1.4-beta1

After loading into the NCF project, you can test the interface through Swagger (it is recommended to use the source code for local testing, remove the Jwt lock), the next step will be to release a Demo based on WeChat conversation, fully open source, please follow the open source project:

Xncf.OpenAI module: https://github.com/NeuCharFramework/Senparc.Xncf.OpenAI

WeChat SDK: https://github.com/JeffreySu/WeiXinMPSDK
```

## 2021-08-01 Update

    1. Update and release xncf package to nuget
    2. Add configuration
    3. Add configuration database
    4. Add configuration multi-tenant
    5. Update glossary
    6. Add configuration Redis
    7. Improve specified database
    8. Improve basic library update
    9. Improve Xncf to implement your own business logic
    10. Improve advanced development

## 2021-07-20 Update

    1. Update multi-database support
    2. Update multi-database switching
    3. Update multi-database principles
    4. Update logs
    5. Update FAQ

## 2020-09-20 Update

    NCF has released a new beta5, this update includes the underlying database, refactored database synchronization methods, updated documentation module, if new projects are recommended to use the new template, old projects can manually update the database, steps:
    1. Update the latest NCF project code
    2. Set the `Senparc.Service` project as the startup project
    3. In the [Package Manager Console] select `Senparc.Service`, then enter: `update-database -Context SenparcEntities` and press Enter
    4. Done. No other operations are required.
