# appsettings.json Configuration

## Overview

The `appsettings.json` file contains most of the configuration information for the application and is located in the `Senparc.Web` directory of the NCF Web template.

The `appsettings.json` file contains multiple nodes, among which `SenparcCoreSetting`, `SenparcSetting`, and `SenparcAiSetting` are the core configuration nodes of the NCF framework, while other nodes are business configuration nodes of the system.

| Node               | Description                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SenparcCoreSetting | Core configuration node of the NCF framework                                                                                                                  |
| SenparcSetting     | [CO2NET](https://github.com/Senparc/Senparc.CO2NET) global configuration node of the basic framework, used to support underlying capabilities such as caching |
| SenparcAiSetting   | [Senparc.AI](https://github.com/Senparc/Senparc.AI) framework AI configuration node, used to support AI capabilities                                          |

&gt; The default configuration items can already provide regular operation during the system development phase. Please modify the specific parameter values carefully as needed!

## SenparcCoreSetting Node Configuration

Node information is as follows:

```json
  &quot;SenparcCoreSetting&quot;: {
    &quot;IsDebug&quot;: true,
    &quot;IsTestSite&quot;: true,
    &quot;DatabaseName&quot;: &quot;Local&quot;, // Corresponding: AppData/DataBase/SenparcConfig.config, the Name prefix of the database connection required in the &lt;SenparcConfig&gt; node
    &quot;MemcachedAddresses&quot;: &quot;&quot;,
    &quot;CacheType&quot;: &quot;Local&quot;, // Global cache type, other options see enumeration: Redis / Memcached. For details, see: Senparc.CO2NET.CacheType
    &quot;EnableMultiTenant&quot;: false, // Whether to enable multi-tenant, please confirm whether the system needs to support multi-tenant when starting for the first time, try not to modify it after deploying to the production environment!
    &quot;TenantRule&quot;: &quot;DomainName&quot;, // Distinguish tenant mode
    &quot;RequestTempLogCacheMinutes&quot;: 5, // Temporary log cache time in the cache (minutes), 0 means no cache
    &quot;PasswordSaltToken&quot;: &quot;YourPasswordSaltToken&quot; // Password encryption enhancement option, do not modify this value after the first account is generated, otherwise all passwords will become invalid
  }
```

Parameter descriptions are as follows:

| Parameter | Description                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| IsDebug   | Whether it is debug mode. When `true`, SenparcTrace will record logs (stored in the ~/App_Data/SenparcTraceLog/ directory) |

## SenparcSetting Node Configuration

| IsTestSite | Whether it is a test site. This flag is used to run (or prohibit running) certain code in the test environment. |
| DatabaseName | Database name, corresponding to the Name prefix of the database connection required in the `&lt;SenparcConfig&gt;` node in ~/AppData/DataBase/SenparcConfig.config, default is `Local` |
| MemcachedAddresses | Memcached connection address, can be ignored if not used |
| CacheType | Global cache type, other options see enumeration: Local / Redis / Memcached. For details, see: Senparc.CO2NET.CacheType |
| EnableMultiTenant | Whether to enable multi-tenant, please confirm whether the system needs to support multi-tenant when starting for the first time, try not to modify it after deploying to the production environment! |
| TenantRule | Distinguish tenant mode, default is `DomainName`, which distinguishes tenants based on domain names |
| RequestTempLogCacheMinutes | Temporary log cache time in the cache (minutes), 0 means no cache |
| PasswordSaltToken | Password encryption enhancement option, do not modify this value after the first account is generated, otherwise all passwords will become invalid |

Node information is as follows:

```json
    &quot;SenparcSetting&quot;: {
    // The following are the global configurations of CO2NET's SenparcSetting, do not modify the key, do not delete any items

    &quot;IsDebug&quot;: true,
    &quot;DefaultCacheNamespace&quot;: &quot;NcfDefaultCache&quot;,

    // Distributed cache
    &quot;Cache_Redis_Configuration&quot;: &quot;#{Cache_Redis_Configuration}#&quot;, // Redis configuration

    &quot;Cache_Memcached_Configuration&quot;: &quot;#{Cache_Memcached_Configuration}#&quot;, // Memcached configuration
    &quot;SenparcUnionAgentKey&quot;: &quot;#{SenparcUnionAgentKey}#&quot; // SenparcUnionAgentKey
  },
```

Parameter descriptions are as follows:

| Parameter | Description |
| --------- | ----------- |

Node information is as follows:

    }

| IsDebug | Whether it is debug mode. When `true`, SenparcTrace will record logs (stored in the ~/App_Data/SenparcTraceLog/ directory) |
| DefaultCacheNamespace | Default cache namespace. The namespace will help distinguish multiple running NCF projects in the same shared cache service (such as Redis or local Memory cache), ensuring that even if there are the same keys in each system, they will not interfere with each other |
| Cache_Redis_Configuration | Redis connection string configuration, if not used, please keep it as is |
| Cache_Memcached_Configuration | Memcached connection string configuration, if not used, please keep it as is |
| SenparcUnionAgentKey | System Agent key, used for subsequent intelligent networking system expansion |

## SenparcAiSetting Node Configuration

```json
//Senparc.AI Settings
&quot;SenparcAiSetting&quot;: {
  &quot;IsDebug&quot;: true,
  &quot;AiPlatform&quot;: &quot;UnSet&quot;, // Note to modify to the corresponding enumeration value of your platform
  &quot;NeuCharAIKeys&quot;: {
    &quot;ApiKey&quot;: &quot;&lt;Your ApiKey&gt;&quot;, // Apply at https://www.neuchar.com/Developer/AiApp
    &quot;NeuCharEndpoint&quot;: &quot;https://www.neuchar.com/&lt;DeveloperId&gt;/&quot;, // You can see the DeveloperId when viewing the ApiKey
    &quot;ModelName&quot;: {
      &quot;Chat&quot;: &quot;gpt-35-turbo&quot;,
      &quot;Embedding&quot;: &quot;text-embedding-ada-002&quot;,
      &quot;TextCompletion&quot;: &quot;text-davinci-003&quot;
  }
}
```
