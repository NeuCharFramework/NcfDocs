# Windows Deployment of NCF Site

To make it more convenient for everyone to seamlessly use all aspects of NCF, here is how to publish the latest version of the site.

No matter how cool and practical your website is in the development environment, it ultimately needs to be tested and deployed in a production environment. Using cloud servers is an inevitable step.

This section aims to help you eliminate obstacles in the publishing and deployment process, allowing you to deploy your site from the development environment to the testing and production environments as smoothly as shifting gears in an automatic car.

Ultimately, you should focus on your core business and not let these auxiliary tasks consume your time.

Let's talk about how to publish.

## Steps

1. Rebuild

<img src="./images/deploy-website-rebuild.png">

It will be displayed in the lower left corner of the Visual Studio tool.

<img src="./images/deploy-website-rebuild-success.png">

This indicates that the build was successful. Then click publish.

<img src="./images/deploy-website-publish-01.png">

When choosing the publishing method, select Folder.

<img src="./images/deploy-website-publish-02.png">

2. Configure parameters before publishing

<img src="./images/deploy-website-before-parameter-config.png">

As shown in the figure:

Configuration: Choose Debug, Release, or others.

Target Framework: Different versions of .NET Core, net6.0/7.0, etc.

Deployment Mode: Framework-dependent | Self-contained (You can learn about the differences between the two deployment modes.)

Target Runtime: You can choose portable or specified runtime environments, such as win-x64, linux, etc.

3. Publish

After the previous step, click Save.

<img src="./images/deploy-website-publish-03.png">

Then click Publish.

<img src="./images/deploy-website-publish-04.png">

After publishing, check these two key points to confirm the publication was successful.

<img src="./images/deploy-website-publish-05.png">

Enter the directory of the generated files.

<img src="./images/deploy-website-publish-06.png">

4. Compress files

<img src="./images/deploy-website-zipfile-01.png">

Select all files, right-click and compress them into a zip file.

<img src="./images/deploy-website-zipfile-02.png">

<img src="./images/deploy-website-zipfile-03.png">

5. Copy files to the server

This is just CTRL+C (copy), CTRL+V (paste), and paste them onto the server.

6. Create an IIS site

First, open IIS.

<img src="./images/deploy-website-create-01.png">

Add a website.

<img src="./images/deploy-website-create-02.png">

Focus on the areas marked in red.

<img src="./images/deploy-website-create-03.png">

This is the created site.

<img src="./images/deploy-website-create-04.png">

7. Configure IIS to access .NET Core site information

Creating a site will also generate an application.

<img src="./images/deploy-website-application-pool-01.png">

Since we are deploying a .NET Core project, this needs to be modified.

<img src="./images/deploy-website-application-pool-02.png">

Modify according to this configuration. After modification, select Advanced Settings.

<img src="./images/deploy-website-application-pool-03.png">

After opening, configure the parameters to the values in the red box.

<img src="./images/deploy-website-application-pool-04.png">

First, stop the application, then start it.

<img src="./images/deploy-website-application-pool-05.png">

If there is an error when starting, keep trying until it starts successfully.

8. Run the site (this process may encounter various issues), and handle them accordingly.

Common errors include:

```csharp
HTTP Error 500.31 - ANCM Failed to Find Native Dependencies
Common solutions to this issue:
The specified version of Microsoft.NetCore.App or Microsoft.AspNetCore.App was not found.
```

This means that the corresponding version of Microsoft.NetCore.App and Microsoft.AspNetCore.App could not be found.

The official error documentation is: https://learn.microsoft.com/aspnet/core/test/troubleshoot-azure-iis?view=aspnetcore-7.0

<img src="./images/deploy-website-run-01.png">

Run the following command:

```csharp
dotnet --info
```

The result shows:

<img src="./images/deploy-website-run-02.png">

The above figure is crucial. First, understand whether the installed versions are being used by IIS. If they do not match, errors will occur.

Check the following figure, which shows an adjusted environment.

<img src="./images/deploy-website-run-03.png">

Some may ask how to know if the SDK version and Host version are correct.

Go to the .NET Core SDK download page: https://dotnet.microsoft.com/download/dotnet/6.0

<img src="./images/deploy-website-run-04.png">

Focus on the content in the red box for better understanding.

<img src="./images/deploy-website-run-05.png">

If the .NET Core SDK version and Host version from dotnet --info match, the basic configuration is complete. However, it may still report error 500.31. In this case, troubleshoot based on the error message, such as:

Check Windows logs by entering eventvwr in the DOS window. This will display error markers related to IIS, which can be handled accordingly.

<img src="./images/deploy-website-run-06.png">

For example:

```csharp
Could not find 'aspnetcorev2_inprocess.dll'. Exception message:
It was not possible to find any compatible framework version
The framework 'Microsoft.NETCore.App', version '6.0.0' was not found.
  - The following frameworks were found:
      3.1.3 at [C:\Program Files (x86)\dotnet\shared\Microsoft.NETCore.App]

You can resolve the problem by installing the specified framework and/or SDK.

The specified framework can be found at:
  - https://aka.ms/dotnet-core-applaunch?framework=Microsoft.NETCore.App&framework_version=6.0.0&arch=x86&rid=win10-x86
```

This means that version 6.0.0 of Microsoft.NETCore.App is not installed. The installation address is provided below.

https://aka.ms/dotnet-core-applaunch?framework=Microsoft.NETCore.App&framework_version=6.0.0&arch=x86&rid=win10-x86

After installation, you can access the site. If there are still errors, continue to troubleshoot based on the prompts until there are no IIS errors.

Finally, the website information will be displayed. If you have any questions, feel free to ask in the community group.

<img src="./images/deploy-website-run-07.png">
