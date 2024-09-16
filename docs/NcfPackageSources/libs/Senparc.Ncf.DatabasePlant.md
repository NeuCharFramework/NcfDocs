# Senparc.Ncf.DatabasePlant

Plant means "workshop", but for a fighter jet, it is more like a "hangar", which means when you are ready to service the fighter jet (module), you will need it.

## Purpose

Because it references all database DatabaseConfiguration, this means: once a project (module) references Senparc.Ncf.DatabasePlant, it can operate all (already implemented) databases.

However, we also know that deploying a bunch of database Providers to the production environment is a burden (although it usually does not affect running efficiency), so we only recommend using it during "maintenance" (Debug), and shielding it in the production environment. To smoothly switch between these two scenarios, we can add compilation conditions when referencing Senparc.Ncf.DatabasePlant, such as:

```XML
<ProjectReference Condition=" '$(Configuration)' != 'Release' " Include="..\..\..\Basic\Senparc.Ncf.DatabasePlant\Senparc.Ncf.DatabasePlant.csproj" />
```

This is also the origin of the name "hangar": we only let the project "lie" on the hangar during Debug, allowing for various batch operations on multiple databases such as Migration, and when NCF takes off (Release), this package will be automatically ignored, not bringing any additional burden to the system.

## Application

[Senparc.Ncf.DatabasePlant](/start/database/database_plant.html)
