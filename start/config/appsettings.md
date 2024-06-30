
# appsettings.json 配置

`appsettings.json` 文件中包含了应用程序的大部分配置信息，位于 `Senparc.Web` 目录下。

默认配置已经可以提供系统开发阶段的常规运行，请根据需要谨慎修改！

## SenparcCoreSetting 节点配置

节点信息如下：

```json
  "SenparcCoreSetting": {
    "IsDebug": true,
    "IsTestSite": true,
    "DatabaseName": "Local", // 对应：AppData/DataBase/SenparcConfig.config 中，所需要使用的数据库连接的 <SenparcConfig> 节点的 Name 前缀
    "MemcachedAddresses": "",
    "CacheType": "Local", //全局缓存类型，其它选项见枚举：Redis / Memcached。枚举详见：Senparc.CO2NET.CacheType
    "EnableMultiTenant": false, //是否启用多租户，初次启动请确认系统是否需要支持多租户，部署至生产环境以后尽量不要修改！
    "TenantRule": "DomainName", //区分租户模式
    "RequestTempLogCacheMinutes": 5, //缓存中的请求暂存日志缓存时间（分钟），0 则不缓存
    "PasswordSaltToken": "YourPasswordSaltToken" //密码加密加强选项，此值在首个账号生成后不修改，否则会导致所有密码失效
  }
```

参数说明如下：

| 参数 | 说明 |
| --- | --- |
| IsDebug | 是否为调试模式，在调试模式为 `true` 的情况下，SenparcTrace 将会记录日志（存放于 ~/App_Data/SenparcTraceLog/ 目录下） |
| IsTestSite | 是否为测试站点，此标记用于在程序中运行（或禁止运行）某些在测试环境中的代码 |
| DatabaseName | 数据库名称，对应：~/AppData/DataBase/SenparcConfig.config 中，所需要使用的数据库连接的 `<SenparcConfig>` 节点的 Name 前缀，默认为 `Local` |
| MemcachedAddresses | Memcached 连接地址，如不使用可忽略 |
| CacheType | 全局缓存类型，其它选项见枚举：Local / Redis / Memcached。枚举详见：Senparc.CO2NET.CacheType |
| EnableMultiTenant | 是否启用多租户，初次启动请确认系统是否需要支持多租户，部署至生产环境以后尽量不要修改！ |
| TenantRule | 区分租户模式，默认为 `DomainName` 即根据域名区分租户 |
| RequestTempLogCacheMinutes | 缓存中的请求暂存日志缓存时间（分钟），0 则不缓存 |
| PasswordSaltToken | 密码加密加强选项，此值在首个账号生成后不修改，否则会导致所有密码失效 |

## SenparcSetting 节点配置

节点信息如下：

```json
    "SenparcSetting": {
    //以下为 CO2NET 的 SenparcSetting 全局配置，请勿修改 key，勿删除任何项

    "IsDebug": true,
    "DefaultCacheNamespace": "NcfDefaultCache",

    //分布式缓存
    "Cache_Redis_Configuration": "#{Cache_Redis_Configuration}#", //Redis配置

    "Cache_Memcached_Configuration": "#{Cache_Memcached_Configuration}#", //Memcached配置
    "SenparcUnionAgentKey": "#{SenparcUnionAgentKey}#" //SenparcUnionAgentKey
  },
```

参数说明如下：

| 参数 | 说明 |
| --- | --- |
| IsDebug | 是否为调试模式，在调试模式为 `true` 的情况下，SenparcTrace 将会记录日志（存放于 ~/App_Data/SenparcTraceLog/ 目录下） |
| DefaultCacheNamespace | 默认缓存命名空间，命名空间将有助于在同一个共享缓存服务（如 Redis 或本地 Memory 缓存）中，区分多个正在运行的 NCF 项目，确保彼此系统中，即使有相同的键，也不会相互干扰 |
| Cache_Redis_Configuration | Redis 连接字符串配置，如果不使用请保持原样 |
| Cache_Memcached_Configuration | Memcached 连接字符串配置，如果不使用请保持原样 |
| SenparcUnionAgentKey | 系统 Agent 秘钥，用于后续智能化组网系统的扩展 |


## SenparcAiSetting 节点配置

节点信息如下：

```json
//Senparc.AI 设置
"SenparcAiSetting": {
  "IsDebug": true,
  "AiPlatform": "UnSet", //注意修改为自己平台对应的枚举值
  "NeuCharAIKeys": {
    "ApiKey": "<Your ApiKey>", //在 https://www.neuchar.com/Developer/AiApp 申请
    "NeuCharEndpoint": "https://www.neuchar.com/<DeveloperId>/", //查看 ApiKey 时可看到 DeveloperId
    "ModelName": {
      "Chat": "gpt-35-turbo",
      "Embedding": "text-embedding-ada-002",
      "TextCompletion": "text-davinci-003"
    }
  }
}
```

