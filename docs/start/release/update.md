# Upgrade Guide

NCF has released a new beta5. This update includes an overhaul of the underlying database, a refactoring of the database synchronization method, and updates to the documentation module. For new projects, it is recommended to use the new template. Existing projects can manually update the database.

## `v0.3.5**-beta1` upgrade to `v0.3.600-beta1`

Possible errors when directly running the NCF site

![Image text](./images/update/error_v506_to_v600.png)

1. Update the latest NCF project code

![Image text](./images/update/error_v506_to_v600_solution_step1.png)

2. Set the `Senparc.Service` project as the startup project

![Image text](./images/update/error_v506_to_v600_solution_step2.png)

3. In the [Package Manager Console], select `Senparc.Service`, then enter: `update-database -Context SenparcEntities` and press Enter

![Image text](./images/update/error_v506_to_v600_solution_step3.png)

4. Done, no further action is required. Run again, and you will see the familiar screen

![Image text](./images/update/ncf_home.png)