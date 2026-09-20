# Configure Multi-Tenant

## Multi-Tenant Overview

Multi-Tenant means that a single system can be used by multiple different tenants simultaneously, and the data seen by each tenant is completely isolated.

- **Default state**: Multi-tenancy is **disabled by default** (`SenparcCoreSetting:EnableMultiTenant: false` in `Senparc.Web/appsettings.json`). Once enabled, every table (entities deriving from `EntityBase`) carries a `TenantId` column and is automatically filtered per tenant.
- **Tenant resolution rule**: `SenparcCoreSetting:TenantRule` supports three rules (`DomainName` / `RequestHeader` / `LoginInput`), see below.

## How to Modify Multi-Tenant Configuration

First, locate the appsettings.json file under the `Senparc.Web` project.

<img src="./images/config-mutil-tenant1.png" />

```json
{
  "SenparcCoreSetting": {
    "EnableMultiTenant": true,
    "TenantRule": "DomainName" // DomainName | RequestHeader | LoginInput
  }
}
```

## Tenant Resolution Rules (TenantRule)

| Rule | Source | Typical scenario |
| --- | --- | --- |
| `DomainName` | Request Host name (upper-cased, matched against `TenantKey`) | One dedicated domain per tenant |
| `RequestHeader` | `TenantKey` request header | Gateway / front-end explicitly passes the tenant |
| `LoginInput` | `TenantKey` claim in the admin login Cookie / JWT | Multiple tenants on one domain, tenant selected at login |

The matching logic runs in `TenantMiddleware` at the start of every request (`TenantInfoService.SetScopedRequestTenantInfoAsync`) and stores the result in the request-scoped `RequestTenantInfo` (tenant Id / Name / TenantKey / begin time). The tenant list is cached in `FullTenantInfoCache` (CO2NET cache strategy); any tenant create/update/delete invalidates the cache immediately.

## Multi-Tenant Data Table Correspondence in System Modules

After the database is generated, a multi-tenant table will be automatically created, as shown below.

<img src="./images/mutil-tenant-table1.png" />

## Changes in Other Tables in the Database

After the database is generated, a field will be created in each table, as shown below.

<img src="./images/mutil-tenant-table-field1.png" />

## Corresponding Relationship

The TenantInfos table manages the Ids of all tenants.

The TenantId in each table comes from the TenantInfos table.

From the corresponding relationship, you can see the implementation principle of multi-tenancy.

## Data Isolation Mechanism (2026-09 Upgrade)

The XNCF module database context (`XncfDatabaseDbContext`, the base class of all XNCF module DbContexts) is now aligned with the multi-tenant behavior of `SenparcEntitiesDbContextBase`:

1. **Global query filter**: When multi-tenancy is enabled, entities implementing `IMultiTenancy` but not `IIgnoreMulitTenant` automatically get a `TenantId == current request tenant Id` filter (combined with the soft-delete `!Flag` filter). All regular business queries can only see their own tenant's data — no manual filtering in business code.
2. **Automatic TenantId stamping**: `SaveChanges` / `SaveChangesAsync` automatically writes the current request's `TenantId` onto new entities; business code never needs to set it manually.
3. **Global-table exemption**: Entities implementing `IIgnoreMulitTenant` opt out of tenant filtering and auto-stamping — the tenant registry `TenantInfo` (the `TenantInfos` table intentionally has no `TenantId` column) and XncfBuilder preview/development jobs are examples.
4. **Zero impact in single-tenant mode**: With `EnableMultiTenant: false`, only the soft-delete filter applies — behavior is identical to previous versions.

## Login and Tenant Resolution

- **Web (Cookie) login**: The login page shows an optional tenant input when multi-tenancy is enabled. The login flow first resolves the tenant from the entered `TenantKey` and sets the request tenant context, then queries the admin account; on success the `TenantKey` is written into the authentication Cookie (under the `LoginInput` rule, subsequent requests resolve the tenant from this claim).
- **JWT (desktop / backend API) login**: `LoginAsync` also accepts a `TenantKey` parameter — it resolves the tenant and sets the tenant context *before* querying the account (otherwise the global tenant filter would hide that tenant's accounts), and writes `TenantKey` into the JWT claim so the `LoginInput` rule works for JWT-authenticated requests as well.
- When the tenant does not exist or is disabled, login returns the same generic message as "wrong account or password", avoiding tenant enumeration.

## Tenant Ownership of Admin Accounts

- Accounts created by tenant initialization (the "Initialize" action on the tenant management page) and accounts created within a tenant context are automatically assigned to that tenant (`TenantId` stamped automatically).
- The first admin created during system installation (`TenantId = 0`) is a system-wide account, visible in requests that do not match a tenant (e.g. anonymous requests under the `LoginInput` rule).
- The tenant management page (`/Admin/TenantInfo`) adds an **Admins** column showing the admin account count per tenant, supporting disable/delete decisions.

## Tenant Deletion Protection

Tenant deletion (`OnPostDeleteAsync`) enforces three built-in guards, checked before any deletion:

1. **The tenant currently in use cannot be deleted**;
2. **At least one enabled tenant must remain** (deleting the last enabled tenant is rejected);
3. **A tenant with existing admin accounts cannot be deleted** (prevents orphaned accounts — reassign or delete the accounts first).

On failure the specific reason is returned (localized in Chinese and English) and tenant data is left untouched.

## AdminChat Per-Account Isolation and Usage Statistics

The admin AI assistant (AdminChat) is isolated per **admin account**:

- Each account can only view/operate sessions and messages it created (session list, detail, sending messages, archiving, deletion, message feedback, Harness trajectories, etc. all perform ownership checks; cross-account access returns "session not found or forbidden").
- **Super administrators** (`administrator` role) can open a **Usage Stats** panel on the AdminChat page: per-account total/active/archived/deleted session counts, message counts and last-active time — **counts only, no session or message content is exposed**, satisfying admin audit needs in multi-tenant deployments.
- With multi-tenancy enabled, usage statistics are also constrained by the tenant filter (a super admin only sees stats of accounts within their own tenant).

## Upgrade Notes (Existing Data)

- Before enabling multi-tenancy, confirm that your business tables already have the `TenantId` column (XNCF module migrations include it; the `TenantInfos` table intentionally does not).
- After enabling multi-tenancy, **pre-existing rows whose `TenantId` does not match the current tenant become invisible to that tenant**. To assign legacy data to a tenant, update the corresponding tables' `TenantId` to the target tenant Id at the database level (`TenantId = 0` denotes system-wide data).
- The `TenantInfos` table hides the base-class `TenantId` via a `[NotMapped]` shadow property and does not participate in multi-tenant mapping; do not remove that attribute, otherwise EF Core will try to map a non-existent column and tenant queries will fail.
