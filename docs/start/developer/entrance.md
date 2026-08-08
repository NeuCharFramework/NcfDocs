# Entry File

Entry file `Senparc.Web\Program.cs`

In the current .NET 10 project, shared namespace imports are consolidated in `Senparc.Web\GlobalUsings.cs`, for example:

```csharp
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.Extensions.Hosting;
global using Senparc.Ncf.Database;
global using Senparc.Web;
global using Dapr.Client;
```

All namespaces that need to be commonly applied can be placed here.

## Project SDK Settings

Mainly look at the `Senparc.Web\global.json` file, with the following content:

```json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestFeature"
  }
}
```

The version above demonstrates the structure. Pin a .NET 10 feature band installed by the team and used in CI.
