# appsettings.json Configuration

## Overview

The `appsettings.json` file contains most of the configuration information for the application, located in the `Senparc.Web` directory of the NCF Web template.

The `appsettings.json` file contains multiple nodes, among which `SenparcCoreSetting`, `SenparcSetting`, and `SenparcAiSetting` are the core configuration nodes of the NCF framework. Other nodes are business configuration nodes of the system.

| Node               | Description                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SenparcCoreSetting | Core configuration node of the NCF framework                                                                                                               |
| SenparcSetting     | [CO2NET](https://github.com/Senparc/Senparc.CO2NET) global configuration node of the basic framework, supporting caching and other underlying capabilities |
| SenparcAiSetting   | [Senparc.AI](https://github.com/Senparc/Senparc.AI) AI configuration node of the framework, supporting AI capabilities                                     |

&gt; The default configuration items can already provide regular operation during the system development phase. Please modify the specific parameter values carefully as needed!

## SenparcCoreSetting Node Configuration

Node information is as follows:

```json
  "SenparcCoreSetting": {
    "IsDebug": true,
    "IsTestSite": true,
    "DatabaseName": "Local", // Corresponding to: AppData/DataBase/SenparcConfig.config, the Name prefix of the database connection required in the <SenparcConfig> node
    "MemcachedAddresses": "",
    "CacheType": "Local", // Global cache type, other options see enum: Redis / Memcached. For details, see: Senparc.CO2NET.CacheType
    "EnableMultiTenant": false, // Whether to enable multi-tenant, please confirm whether the system needs to support multi-tenant on the first startup, and try not to modify it after deploying to the production environment!
    "TenantRule": "DomainName", // Tenant mode differentiation
    "RequestTempLogCacheMinutes": 5, // Temporary log cache time (minutes) in the cache, 0 means no cache
    "PasswordSaltToken": "YourPasswordSaltToken" // Password encryption enhancement option, do not modify this value after the first account is generated, otherwise all passwords will become invalid
  }
```

Parameter descriptions are as follows:

| Parameter                  | Description                                                                                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IsDebug                    | Whether it is debug mode. When debug mode is `true`, SenparcTrace will record logs (stored in the ~/App_Data/SenparcTraceLog/ directory)                                                      |
| IsTestSite                 | Whether it is a test site. This flag is used to run (or prohibit running) certain codes in the test environment                                                                               |
| DatabaseName               | Database name, corresponding to: ~/AppData/DataBase/SenparcConfig.config, the Name prefix of the database connection required in the `<SenparcConfig>` node, default is `Local`               |
| MemcachedAddresses         | Memcached connection address, can be ignored if not used                                                                                                                                      |
| CacheType                  | Global cache type, other options see enum: Local / Redis / Memcached. For details, see: Senparc.CO2NET.CacheType                                                                              |
| EnableMultiTenant          | Whether to enable multi-tenant, please confirm whether the system needs to support multi-tenant on the first startup, and try not to modify it after deploying to the production environment! |
| TenantRule                 | Tenant mode differentiation, default is `DomainName`, which means distinguishing tenants based on domain names                                                                                |
| RequestTempLogCacheMinutes | Temporary log cache time (minutes) in the cache, 0 means no cache                                                                                                                             |
| PasswordSaltToken          | Password encryption enhancement option, do not modify this value after the first account is generated, otherwise all passwords will become invalid                                            |

## SenparcSetting Node Configuration

Node information is as follows:

```json
    "SenparcSetting": {
    // The following are the global configurations of CO2NET's SenparcSetting, do not modify the key, do not delete any items

    "IsDebug": true,
    "DefaultCacheNamespace": "NcfDefaultCache",

    // Distributed cache
    "Cache_Redis_Configuration": "#{Cache_Redis_Configuration}#", // Redis configuration

    "Cache_Memcached_Configuration": "#{Cache_Memcached_Configuration}#", // Memcached configuration
    "SenparcUnionAgentKey": "#{SenparcUnionAgentKey}#" // SenparcUnionAgentKey
  },
```

Parameter descriptions are as follows:

| Parameter                     | Description                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IsDebug                       | Whether it is debug mode. When debug mode is `true`, SenparcTrace will record logs (stored in the ~/App_Data/SenparcTraceLog/ directory)                                                                                                                                 |
| DefaultCacheNamespace         | Default cache namespace. The namespace will help distinguish multiple running NCF projects in the same shared cache service (such as Redis or local Memory cache), ensuring that even if there are the same keys in each system, they will not interfere with each other |
| Cache_Redis_Configuration     | Redis connection string configuration, if not used, please keep it as is                                                                                                                                                                                                 |
| Cache_Memcached_Configuration | Memcached connection string configuration, if not used, please keep it as is                                                                                                                                                                                             |
| SenparcUnionAgentKey          | System Agent key, used for subsequent intelligent networking system expansion                                                                                                                                                                                            |

## SenparcAiSetting Node Configuration

Node information is as follows:

```json
// Senparc.AI settings
"SenparcAiSetting": {
  "IsDebug": true,
  "AiPlatform": "UnSet", // Note to modify to the corresponding enum value of your platform
  "NeuCharAIKeys": {
    "ApiKey": "<Your ApiKey>", // Apply at https://www.neuchar.com/Developer/AiApp
    "NeuCharEndpoint": "https://www.neuchar.com/<DeveloperId>/", // You can see the DeveloperId when viewing the ApiKey
    "ModelName": {
      "Chat": "gpt-35-turbo",
      "Embedding": "text-embedding-ada-002",
      "TextCompletion": "text-davinci-003"
    }
  }
}
```
