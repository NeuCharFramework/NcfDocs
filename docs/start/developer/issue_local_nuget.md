## Publish Local Nuget Package

> 1. Open project properties

![Image text](./images/issue_local_nuget/project_properties.png)

> 2. Set project package release options, check the option to create nuget file on build

![Image text](./images/issue_local_nuget/build_general_nuget_file.png)

> 3. Edit project file

![Image text](./images/issue_local_nuget/edit_project_file.png)

> 4. Edit conditions and necessary parameters for generating Nuget file

    <Project Sdk="Microsoft.NET.Sdk">
      <PropertyGroup>
        <TargetFramework>netcoreapp3.1</TargetFramework>
        <Version>1.0</Version>
        <AssemblyName>Senparc.Xncf.Application</AssemblyName>
        <RootNamespace>Senparc.Xncf.Application</RootNamespace>
        <GeneratePackageOnBuild Condition=" '$(Configuration)' == 'Release' ">true</GeneratePackageOnBuild>
        <Description>Application Module</Description>
        <Copyright>Senparc</Copyright>
        <PackageTags>Senparc,NeuCharFramework,NCF,Senparc.Xncf.Application</PackageTags>
        <Authors>Senparc</Authors>
        <Owners>Senparc</Owners>
        <!-- <PackageLicenseUrl>https://github.com/NeuCharFramework/NcfPackageSources/blob/master/LICENSE</PackageLicenseUrl> -->
        <Title>.Application Module</Title>
        <!--<ProjectUrl> https://github.com/NeuCharFramework/NCF</ProjectUrl>
        <PackageProjectUrl>https://github.com/NeuCharFramework/NcfPackageSources</PackageProjectUrl>
        <PackageIconUrl>http://sdk.weixin.senparc.com/Images/logo-square-ncf.jpg</PackageIconUrl>-->
        <PackageReleaseNotes>
          v1.0 Genesis
        </PackageReleaseNotes>
        <RepositoryUrl> https://github.com/NeuCharFramework/NcfPackageSources</RepositoryUrl>
        <Configurations>Debug;Release;Test</Configurations>
      </PropertyGroup>
      <PropertyGroup Condition=" '$(Configuration)' == 'Release' ">
        <OutputPath>..\..\..\BuildOutPut</OutputPath>
        <DocumentationFile>..\..\..\BuildOutPut\Senparc.Xncf.Application.XML</DocumentationFile>
        <DefineConstants>$(DefineConstants);RELEASE</DefineConstants>
        <Optimize>true</Optimize>
        <DebugType>pdbonly</DebugType>
        <ErrorReport>prompt</ErrorReport>
        <CodeAnalysisRuleSet>MinimumRecommendedRules.ruleset</CodeAnalysisRuleSet>
      </PropertyGroup>
      <ItemGroup>
        <PackageReference Include="Senparc.Ncf.XncfBase" Version="0.3.500-beta1" />
        <ProjectReference Include="..\Senparc.Core\Senparc.Core.csproj" />
        <ProjectReference Include="..\Senparc.Service\Senparc.Service.csproj" />
      </ItemGroup>

        <ItemGroup>
        <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="3.1.6" />
        <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer.Design" Version="2.0.0-preview1-final" />
        <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="3.1.6">
          <PrivateAssets>all</PrivateAssets>
          <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
        </PackageReference>
    </ItemGroup>

    </Project>

> 5. Rebuild the project

![Image text](./images/issue_local_nuget/project_build.png)

> 6. Find the generated Nuget package (here using Debug environment, so it is generated in the Debug directory)

![Image text](./images/issue_local_nuget/general_nuget_file_success.png)

> 7. Copy the local Nuget package to the specified file directory (for easy reference)

![Image text](./images/issue_local_nuget/copy_to_local_nuget_source.png)

## Reference Local Nuget Source

> 1. There are two ways to enter the source settings

> > 1-1. Click the toolbar Tools->Options->Nuget Package Manager

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_1.png)

> > 1-2. Right-click the project

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_2_1.png)

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_2_2.png)

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_1.png)

> 2. Add nuget source

![Image text](./images/issue_local_nuget/click_add_nuget_button.png)

![Image text](./images/issue_local_nuget/prefect_nuget_infomation.png)

> 3. Select local nuget source

![Image text](./images/issue_local_nuget/select_nuget_source.png)

> 4. Import local nuget source

![Image text](./images/issue_local_nuget/install_nuget_source.png)

![Image text](./images/issue_local_nuget/install_finished.png)

> 5. Rebuild the project

> 6. Show results

![Image text](./images/issue_local_nuget/show_new_module_can_install.png)

![Image text](./images/issue_local_nuget/enable_module.png)

![Image text](./images/issue_local_nuget/exec_module_function.png)

![Image text](./images/issue_local_nuget/exec_module_function_result.png)
