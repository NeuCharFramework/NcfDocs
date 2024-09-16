# Update Base Library

What is updating the base library? Updating the base library means updating the nuget version of the underlying core library referenced in NCF.

## How to Update the Base Library

Step 1: Double-click the project name to open the project file for editing

<img src="./images/double-click-project1.png" />

It will open

<img src="./images/opened-project-file1.png" />

Step 2: Find the name of the base library you want to update

<img src="./images/find-library-name1.png" />

Step 3: Open nuget, enter the name of the base library, and check the latest version number of the library

<img src="./images/search-package-name-for-nuget1.png" />

Click to open

<img src="./images/select-package1.png" />

You can see many versions, here you can choose the latest one

<img src="./images/select-last-new-version1.png" />

Step 4: Modify the version number of the referenced base library in the project file

<img src="./images/update-library-version1.png" />

## How to Use Locally Compiled Base Library

You can refer to the steps on how to generate a local nuget package [Issue Local Nuget](/start/developer/issue_local_nuget.html)

After generating the local nuget package, you can put the local nuget package that needs to be referenced into a unified folder for easy management.

Use the method above `How to Update the Base Library` to update it.

[Base Library](/NcfPackageSources)
