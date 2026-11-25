# DynamicData tables, layouts and pages

<a id="help-dynamic-data"></a>

## DynamicData

Build dynamic interfaces in stages: data-table definitions, layouts, then page
configuration/rendering. The module home can show generated-module information;
use its specific configuration pages for actual editing. Test with disposable
data before exposing a generated interface to other users.

<a id="help-dynamic-tables"></a>

## Dynamic table definitions

Define the table and fields, including identifiers, data types, required/unique
constraints, and display metadata. Check existing data before schema changes.
Do not treat display validation as a substitute for backend validation.

### Beginner sequence

1. Create the table and give it a stable name.
2. Add fields before creating a layout. Decide which field is the identifier, which fields are
   required or unique, and which values are safe to expose.
3. Import or export only after checking the field mapping and keeping a backup of important data.
4. Open **Create layout**, bind each visible column or form field to the intended table field,
   and configure sorting, editing, deletion, and export deliberately.
5. Connect the layout on the page-settings screen, preview with representative data, then publish.

Changing a field name or type can invalidate bindings in saved layouts. After a structural
change, revisit every affected layout and page instead of relying on a successful preview.

<a id="help-dynamic-layouts"></a>

## Dynamic layouts

Choose the data source and bind columns/fields before configuring buttons,
events, dialogs, and navigation. Verify each binding in the preview. A button's
label does not determine its effect; inspect the configured action.

<a id="help-dynamic-pages"></a>

## Dynamic page settings

Connect the intended layout to the page and inspect the rendered result with
representative data. Check query, edit, validation, and navigation behavior
before publishing. A rendered preview does not grant data access permissions.
This page manages page/layout associations; use the rendering page to operate a generated form directly.

Keep the page association and the data permission review separate. A page can render correctly
for an administrator while still being inappropriate for ordinary users. Confirm the route,
tenant scope, create/edit/delete actions, and server-side authorization before publishing.

<a id="help-dynamic-render"></a>

## Dynamic layout rendering

This page displays a table or form from a saved layout. Buttons such as **Submit** and **Reset** depend on that layout.
It is not a layout editor. Change fields, buttons and events in table definitions, layout settings or page settings.
Verify the associated layout and data source before submitting; visible dynamic UI is not data authorization.

When a form submission fails, first confirm that the selected layout still exists, every required
field is bound, and the current user can write the target data. If only the preview works but
the submitted value is rejected, inspect server validation and the field data type; changing
the browser control does not bypass backend rules.
