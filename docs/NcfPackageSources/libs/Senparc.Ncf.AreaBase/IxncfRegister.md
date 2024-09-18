# IXncfRegister Interface

```csharp
    public interface IXncfRegister
    {
        /// <summary>
        /// Whether to ignore installation (but does not affect the execution of registration code)
        /// </summary>
        bool IgnoreInstall { get; }

        /// <summary>
        /// Module name, globally unique
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Identifier, globally unique
        /// </summary>
        string Uid { get; }

        /// <summary>
        /// Version number
        /// </summary>
        string Version { get; }

        /// <summary>
        /// Menu name
        /// </summary>
        string MenuName { get; }

        /// <summary>
        /// Icon
        /// </summary>
        string Icon { get; }

        /// <summary>
        /// Description
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Registration method, the order of registration determines the order of arrangement in the interface
        /// </summary>
        IList<Type> Functions { get; }

        /// <summary>
        /// Add AutoMap mapping
        /// </summary>
        ConcurrentBag<Action<Profile>> AutoMapMappingConfigs { get; set; }

        /// <summary>
        /// Get the registered thread information of the current module
        /// </summary>
        IEnumerable<KeyValuePair<ThreadInfo, Thread>> RegisteredThreadInfo { get; }

        /// <summary>
        /// Installation code
        /// </summary>
        Task InstallOrUpdateAsync(IServiceProvider serviceProvider, InstallOrUpdate installOrUpdate);

        /// <summary>
        /// Uninstallation code
        /// </summary>
        Task UninstallAsync(IServiceProvider serviceProvider, Func<Task> unsinstallFunc);

        /// <summary>
        /// Get homepage URL
        /// <para>Only valid after implementing the IAreaRegister interface, otherwise returns null</para>
        /// </summary>
        /// <returns></returns>
        string GetAreaHomeUrl();

        /// <summary>
        /// Get URL of other Area pages
        /// </summary>
        /// <param name="path">URL path (without uid parameter)</param>
        /// <returns></returns>
        string GetAreaUrl(string path);

        /// <summary>
        /// Register the current module when ConfigureServices starts
        /// </summary>
        /// <param name="services">IServiceCollection</param>
        /// <param name="configuration">Configuration</param>
        /// <returns></returns>
        IServiceCollection AddXncfModule(IServiceCollection services, IConfiguration configuration);

        /// <summary>
        /// Add AutoMap mapping relationship
        /// </summary>
        /// <param name="mapping"></param>
        void AddAutoMapMapping(Action<Profile> mapping);

        /// <summary>
        /// Execute configuration in the Configure() method of startup.cs
        /// </summary>
        /// <param name="app"></param>
        /// <param name="registerService">CO2NET registration object</param>
        /// <returns></returns>
        IApplicationBuilder UseXncfModule(IApplicationBuilder app, IRegisterService registerService);
    }
```

# IXncfRegister Interface

```csharp
    public interface IXncfRegister
    {
        /// <summary>
        /// Whether to ignore installation (but does not affect the execution of registration code)
        /// </summary>
        bool IgnoreInstall { get; }

        /// <summary>
        /// Module name, globally unique
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Identifier, globally unique
        /// </summary>
        string Uid { get; }

        /// <summary>
        /// Version number
        /// </summary>
        string Version { get; }

        /// <summary>
        /// Menu name
        /// </summary>
        string MenuName { get; }

        /// <summary>
        /// Icon
        /// </summary>
        string Icon { get; }

        /// <summary>
        /// Description
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Registration method, the order of registration determines the order of arrangement in the interface
        /// </summary>
        IList<Type> Functions { get; }

        /// <summary>
        /// Add AutoMap mapping
        /// </summary>
        ConcurrentBag<Action<Profile>> AutoMapMappingConfigs { get; set; }

        /// <summary>
        /// Get the registered thread information of the current module
        /// </summary>
        IEnumerable<KeyValuePair<ThreadInfo, Thread>> RegisteredThreadInfo { get; }

        /// <summary>
        /// Installation code
        /// </summary>
        Task InstallOrUpdateAsync(IServiceProvider serviceProvider, InstallOrUpdate installOrUpdate);

        /// <summary>
        /// Uninstallation code
        /// </summary>
        Task UninstallAsync(IServiceProvider serviceProvider, Func<Task> unsinstallFunc);

        /// <summary>
        /// Get homepage URL
        /// <para>Only valid after implementing the IAreaRegister interface, otherwise returns null</para>
        /// </summary>
        /// <returns></returns>
        string GetAreaHomeUrl();

        /// <summary>
        /// Get URL of other Area pages
        /// </summary>
        /// <param name="path">URL path (without uid parameter)</param>
        /// <returns></returns>
        string GetAreaUrl(string path);

        /// <summary>
        /// Register the current module when ConfigureServices starts
        /// </summary>
        /// <param name="services">IServiceCollection</param>
        /// <param name="configuration">Configuration</param>
        /// <returns></returns>
        IServiceCollection AddXncfModule(IServiceCollection services, IConfiguration configuration);

        /// <summary>
        /// Add AutoMap mapping relationship
        /// </summary>
        /// <param name="mapping"></param>
        void AddAutoMapMapping(Action<Profile> mapping);

        /// <summary>
        /// Execute configuration in the Configure() method of startup.cs
        /// </summary>
        /// <param name="app"></param>
        /// <param name="registerService">CO2NET registration object</param>
        /// <returns></returns>
        IApplicationBuilder UseXncfModule(IApplicationBuilder app, IRegisterService registerService);
    }
```
