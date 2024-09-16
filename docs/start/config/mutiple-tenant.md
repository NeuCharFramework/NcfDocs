# Configure Multi-Tenant

## Multi-Tenant Overview

Multi-Tenant means that multiple different tenants can use the same system simultaneously, and the data seen by each tenant is completely isolated. By default, the system's multi-tenant feature is enabled. The current rule for distinguishing multiple tenants in the system is based on the domain name.

## How to Modify Multi-Tenant Configuration

First, locate the appsetting.json file under the `Senparc.Web` project.

<img src="./images/config-mutil-tenant1.png" />

## Correspondence of Multi-Tenant Data Tables in System Modules

After the database is generated, a multi-tenant table will be automatically created, as shown below:

<img src="./images/mutil-tenant-table1.png" />

## Changes in Other Tables in the Database

After the database is generated, a field will be created in each table, as shown below:

<img src="./images/mutil-tenant-table-field1.png" />

## Correspondence

The TenantInfos table manages the Ids of all tenants.

The TenantId in each table comes from the TenantInfos table.

From the correspondence, you can see the implementation principle of multi-tenancy.
