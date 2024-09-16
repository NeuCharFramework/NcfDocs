# Running NCF with Visual Studio

## Step 1: Open the Solution

After [source code synchronization or extraction](/start/start-develop/get-ncf-template.html), open the `/src/NCF.sln` solution file to see the complete NCF template project:

<img src="./images/run-ncf-01.png" />

## Step 2: Confirm Senparc.Web as the Startup Project

The `Senparc.Web` project is used to start the web site. Confirm that it is set as the startup project (bold). If not, right-click and select "Set as Startup Project".

<img src="./images/run-ncf-02.png" />

## Step 3: Run

Click the top menu "Build" > "Start Without Debugging", or use the shortcut <kbd>Ctrl/Command</kbd> + <kbd>F5</kbd>.

> Note: The default database is SQLite, so you do not need to configure the database at this stage. To switch to another database, see [Using Multiple Databases](/start/database/mutil_database_support.html).

## Complete Startup

After a few seconds, the NCF web project will start. On the first startup, the system will automatically prompt for [installation](/start/start-develop/install-app.html). Once the installation is complete, the installation interface will no longer appear.