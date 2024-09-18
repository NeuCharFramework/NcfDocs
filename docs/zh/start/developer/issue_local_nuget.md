# 发布本地Nuget包

> 1.点开项目属性

![Image text](./images/issue_local_nuget/project_properties.png)

> 2.项目包设置发布选项,勾选生成时创建nuget文件

![Image text](./images/issue_local_nuget/build_general_nuget_file.png)

> 3.编辑项目文件

![Image text](./images/issue_local_nuget/edit_project_file.png)

> 4.编辑需要生成Nuget文件的条件及必要参数

```xml
    <Project Sdk="Microsoft.NET.Sdk">
      <PropertyGroup>
        <TargetFramework>netcoreapp3.1</TargetFramework>
        <Version>1.0</Version>
        <AssemblyName>Senparc.Xncf.Application</AssemblyName>
        <RootNamespace>Senparc.Xncf.Application</RootNamespace>
        <GeneratePackageOnBuild Condition=" '$(Configuration)' == 'Release' ">true</GeneratePackageOnBuild>
        <Description>应用程序模块</Description>
        <Copyright>Senparc</Copyright>
        <PackageTags>Senparc,NeuCharFramework,NCF,Senparc.Xncf.Application</PackageTags>
        <Authors>Senparc</Authors>
        <Owners>Senparc</Owners>
        <!-- <PackageLicenseUrl>https://github.com/NeuCharFramework/NcfPackageSources/blob/master/LICENSE</PackageLicenseUrl> -->
        <Title>.应用程序模块</Title>
        <!--<ProjectUrl> https://github.com/NeuCharFramework/NCF</ProjectUrl>
        <PackageProjectUrl>https://github.com/NeuCharFramework/NcfPackageSources</PackageProjectUrl>
        <PackageIconUrl>http://sdk.weixin.senparc.com/Images/logo-square-ncf.jpg</PackageIconUrl>-->
        <PackageReleaseNotes>
          v1.0 创世
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
```

> 5.重新生成项目

![Image text](./images/issue_local_nuget/project_build.png)

> 6.找到生成的Nuget包(这里用的是Debug环境,所以生成的在Debug目录下)

![Image text](./images/issue_local_nuget/general_nuget_file_success.png)

> 7.Copy本地Nuget包到指定的文件目录中(方便引用)

![Image text](./images/issue_local_nuget/copy_to_local_nuget_source.png)

## 引用本地的Nuget源

> 1.进入源设置的方法有2种

> > 1-1.点击工具栏Tools->Options->Nuget Package Manager

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_1.png)

> > 1-2.点击项目右键

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_2_1.png)

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_2_2.png)

![Image text](./images/issue_local_nuget/enter_nuget_source_setting_1.png)

> 2.添加nuget源

![Image text](./images/issue_local_nuget/click_add_nuget_button.png)

![Image text](./images/issue_local_nuget/prefect_nuget_infomation.png)

> 3.选择本地nuget源

![Image text](./images/issue_local_nuget/select_nuget_source.png)

> 4.引入本地nuget源

![Image text](./images/issue_local_nuget/install_nuget_source.png)

![Image text](./images/issue_local_nuget/install_finished.png)

> 5.重新生成项目

> 6.效果展示

![Image text](./images/issue_local_nuget/show_new_module_can_install.png)

![Image text](./images/issue_local_nuget/enable_module.png)

![Image text](./images/issue_local_nuget/exec_module_function.png)

![Image text](./images/issue_local_nuget/exec_module_function_result.png)
