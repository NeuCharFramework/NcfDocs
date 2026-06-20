# Senparc.Ncf.AreaBase

## Positioning

`Senparc.Ncf.AreaBase` provides base capabilities for admin-side Area/Razor pages, mainly covering auth filters, admin page models, and shared conventions.

## Key Folders and Types

- `Admin/AdminPageModelBase.cs`: admin page-model base
- `Admin/AdminXscfModulePageModelBase.cs`: XNCF module page-model base
- `Admin/Filters/AdminAuthorizeAttribute.cs`: admin cookie auth entry
- `Admin/Filters/ApiAuthorizeAttribute.cs`: API auth helper
- `Conventions/AutoValidateAntiForgeryTokenModelConvention.cs`: antiforgery convention

## Typical Responsibilities

- unified authorization filter baseline for admin modules
- shared admin page model contracts
- coordinated behavior with `AreasBase` module for area registration/menu integration

## Recommendations

- Reuse existing page-model base classes for new admin pages.
- Apply consistent API auth filters to management endpoints.
- Keep menu, permission policy, and area routes synchronized for new admin features.

## Related

- [IXncfRegister (Current Contract)](./Senparc.Ncf.AreaBase/IxncfRegister.md)
