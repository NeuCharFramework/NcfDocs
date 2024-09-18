# Entry File

Entry file `Senparc.Web\Program.cs`

After entering the .Net 6 era, the references of the entry namespace have all been consolidated into the `Senparc.Web\GlobalUsings.cs` file, with the following content:

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
  &quot;sdk&quot;: {
    &quot;version&quot;: &quot;8.0.100&quot;
  }
}
```

You can modify the SDK version number to change the SDK version used by the current project.
