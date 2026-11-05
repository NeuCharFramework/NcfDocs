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

<a id="help-dynamic-render"></a>

## Dynamic layout rendering

This page displays a table or form from a saved layout. Buttons such as **Submit** and **Reset** depend on that layout.
It is not a layout editor. Change fields, buttons and events in table definitions, layout settings or page settings.
Verify the associated layout and data source before submitting; visible dynamic UI is not data authorization.
