# Senparc.Ncf.Mvc.UI

## Positioning

`Senparc.Ncf.Mvc.UI` provides reusable MVC/Razor UI helpers for admin-side pages, reducing repeated backend UI boilerplate.

## Core Folders and Capabilities

- `UIHelpers`: paging, menus, highlights, grid utilities
- `backend`: backend template helper models
- `HtmlExtension.Core.cs`: HTML extension entry

Typical helper extensions include:

- `PagerBarExtension`
- `GridViewExtension`
- `CurrentMenuExtensions`
- `CurrentBsMenuExtensions`

## Typical Scenarios

- rapid admin page composition
- consistent paging/listing behavior across modules
- reuse of existing NCF backend UI conventions

## Recommendations

- Prefer existing helpers for new module admin pages to keep UX consistency.
- When used with `AreaBase`, keep page auth and menu registration aligned.
