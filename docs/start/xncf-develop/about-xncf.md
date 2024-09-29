# Composition of Xncf

## Preface

This document introduces the important components of the Xncf module code, which helps developers understand its principles. Developing Xncf does not require manually typing these codes, as you can use the [Xncf Module Generator](/start/xncf-develop/create-xncf) for visual configuration and generation.

## What is Xncf?

Xncf (XNCF) refers to the individual modules that make up the NCF system functions, usually appearing as a single project (such as a class library, introduced into the solution using .csproj). In special cases, it can also consist of multiple projects. To include the dll of the Xncf module in the release package, Xncf needs to be directly or indirectly referenced by the Web project (Senparc.Web).

> Xncf can be planned as a complete Domain project in the DDD development model, containing all the standard structures required by DDD.

The file structure of an XNCF project can be understood as a regular class library, plus a special [Register class](#register-class).

> Therefore, you can almost turn any class library into a plug-and-play XNCF module by adding a `Register` class!

## Naming Rules for Xncf

The naming of Xncf projects (usually also the file name of the dll), each Xncf module needs to have a globally unique module name, which must follow the format:

`<OrganizationName>`.Xncf.`<ModuleName>`

- `<OrganizationName>` is usually the name of the company or team, used to distinguish modules provided by different organizations and prevent conflicts in `<ModuleName>`
- `.Xncf.` is a fixed character, indicating that this is an Xncf module, and is used to separate the organization name and module name
- `<ModuleName>` is the name of the current module, and this name cannot contain `.`. If there are sub-modules, underscores `_` can be used

The final Xncf naming could be: `Senparc.Xncf.DatabaseTool` or `Senparc.Xncf.DatabaseTool_Backup`.

## Important Concepts of Xncf Modules

| Object                   | Description |
| ------------------------ | ----------- |
| Register Class           |             |
| [XncfRegister] Attribute |             |
| IXncfRegister Interface  |             |
| More Optional Interfaces |             |

### IXncfRegister Interface (Required)

The required interface is: `IXncfRegister` (base library: <a href="/NcfPackageSources/libs/Senparc.Ncf.XscfBase.html">Senparc.Ncf.XncfBase</a>).

The `IXncfRegister` interface contains module name, globally unique identifier, version number, menu name, icon, and other module metadata information, and can define the code that needs to be executed during module installation and uninstallation.

For detailed introduction of the `IXncfRegister` interface, please see: [IXncfRegister](/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IXncfRegister.html).

To facilitate developers, NCF provides a default implementation based on the `IXncfRegister` interface: `XncfRegisterBase`. Therefore, usually, we only need to create a `Register.cs` class file in the project, then inherit the `XncfRegisterBase` base class and implement its specified interface, to quickly turn this project into an Xncf module.

#### [XncfRegister] Attribute

In the custom `Register` class of each module project, use the [XncfRegister] attribute to enable the system to quickly identify the current class as an Xncf registration class (reserved function, it is recommended to add it).

According to the above requirements, a minimal Xncf module registration class might look like this:

```csharp
using Senparc.Ncf.XncfBase;
using System;
using System.Collections.Generic;

namespace Senparc.Xncf.XncfBuilder
{
    [XncfRegister]
    public partial class Register : XncfRegisterBase, IXncfRegister
    {
        #region IRegister Interface

        public override string Name => "Senparc.Xncf.XncfBuilder";

        public override string Uid => "C2E1F87F-2DCE-4921-87CE-36923ED0D6EA";

        public override string Version => "0.2.6";

        public override string MenuName => "XNCF Module Generator";

        public override string Icon => "fa fa-plus";

        public override string Description => "Quickly generate basic program code for XNCF modules, or Sample demonstrations, and extend your own applications based on the basic code";

        #endregion
    }
}
```

#### [XncfOrder] Attribute

You can add the [XncfOrder] attribute to the Register class to set the loading order of the current XNCF module. The constructor of this attribute provides a sorting number (the `order` parameter), which is arranged in descending order when the system loads (the larger the number, the earlier it is loaded), such as:

```csharp
    [XncfRegister]
    [XncfOrder(4090)]
    public partial class Register : XncfRegisterBase, IXncfRegister
    {
        //...
    }
```

`order` parameter conventions:

`0`: Default value, modules without the [XncfOrder] attribute default to 0, usually such modules have no special loading order requirements

`1` ~ `5000`: Important modules that need to be preloaded in order

Above `5000`: System and basic modules, regular modules should not occupy

`59xx`: System underlying basic modules, regular modules should not occupy

`58xx`: AI-related basic modules, regular modules should not occupy

&lt;!-- TODO: More override methods --&gt;

### More Optional Interfaces

On the basis of implementing the `IXncfRegister` interface, you can continue to add optional interfaces according to the functions that the current module needs to support, expanding the capabilities of Xncf. Common optional interfaces include:

| Interface Name               | Supported Function                                         |
| ---------------------------- | ---------------------------------------------------------- |
| IXncfFunction                | Function, i.e., a method to complete a task                |
| IXncfDatabase                | Database, supports multiple databases                      |
| IXncfRazorRuntimeCompilation | Runtime compilation for RazorPage when including web pages |
| IXncfMiddleware              | Defines a .NET Core middleware                             |
| IXncfThread                  | Supports background threads                                |

The specific definitions and final effects of each interface will be introduced in subsequent development.

#### IXncfDatabase Interface (Optional)

After the Register class inherits IXncfDatabase and implements the interface methods, the database capability can be activated.

&gt; To make the code clearer, the code in the template uses "partial class", and the related code is stored independently in `Register.Database.cs` (the same applies to other interfaces below).

The default code in the template is as follows:

```csharp
    public partial class Register : IXncfDatabase  // Register XNCF module database (optional)
    {
        #region IXncfDatabase Interface

        /// <summary>
        /// Database prefix
        /// </summary>
        public const string DATABASE_PREFIX = &quot;Senparc_PromptRange_&quot;;

        /// <summary>
        /// Database prefix
        /// </summary>
        public string DatabaseUniquePrefix =&gt; DATABASE_PREFIX;

        /// <summary>
        /// Dynamically get the database context
        /// </summary>
        public Type TryGetXncfDatabaseDbContextType =&gt; MultipleDatabasePool.Instance.GetXncfDbContextType(this);

        public void OnModelCreating(ModelBuilder modelBuilder)
        {
            // After implementing the [XncfAutoConfigurationMapping] attribute, it can be executed automatically without manual addition
            // modelBuilder.ApplyConfiguration(new AreaTemplate_ColorConfigurationMapping());
        }

        public void AddXncfDatabaseModule(IServiceCollection services)
        {
            // DO NOT REMOVE OR MODIFY THIS LINE - Entities Point
            // ex. services.AddScoped(typeof(Color));
        }

        #endregion
    }
```

`DATABASE_PREFIX` provides a constant for the database prefix, with the default naming rule being "`OrganizationName`_`ModuleName`_". The final result is: `Senparc_PromptRange_`.

The `TryGetXncfDatabaseDbContextType` property is a specific method used to specify the current database context class in multi-database configurations. The default code does not need modification.

The `OnModelCreating` method will be executed during the EF Core database initialization (executed in the DbContext's OnModelCreating() method).

`AddXncfDatabaseModule` is used to configure dependency injection settings related to the database.

&lt;!-- TODO: Introduce SenparcEntities --&gt;

&lt;!--
The following will be introduced one by one.

#### IXncfRazorRuntimeCompilation Interface (Optional)

#### IXncfMiddleware Interface (Optional)

#### IXncfThread Interface (Optional) --&gt;
