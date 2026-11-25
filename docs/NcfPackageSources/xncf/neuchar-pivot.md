# NeuCharPivot boards, aggregation and access

<a id="help-pivot-boards"></a>

## NeuCharPivot boards

A board arranges Function blocks. Check each block's module and Function
identity before adding it. A missing-module placeholder is not a successful
execution result: restore the module or remove the stale block. Board placement
does not bypass the Function's access policy.
Creation sets a name, page key, column count and enabled state; `admin-home` targets the Admin home.
**Add block** selects a module and Function; **AI** edits panel layout. Neither means execute every block.

<a id="help-pivot-aggregate"></a>

## NeuCharPivot aggregation

This page collects NeuCharPivot Functions by module. Filter by module availability, Function state,
LoopTask state and Workflow association, then execute the intended Function with its own parameters.
It is not a Workflow wiring editor or a transaction that executes all filtered results.
Configurations for removed or disabled modules may remain visible but do not permit execution.

<a id="help-pivot-access"></a>

## NeuCharPivot access policies

Policies can open, restrict, deny, or inherit access to a module Function.
A database policy overrides the corresponding code attributes. Review the
selected Functions before batch changes. Restoring inheritance and deleting a
stored policy are different operations. Orphan policies may remain after module
removal and apply again after reinstallation; inspect them rather than assuming
they disappeared.
