# NeuChar Workflow: Operations and `{{= ... }}` Expressions

> Applies to `Senparc.Xncf.NeuCharWorkflow` `0.1.0-preview1`, checked against the `NcfPackageSources` development line on 2026-08-13. This describes the current server-side module. Available nodes depend on the enabled XNCF modules, the current site, and the administrator's permissions.

`NeuCharWorkflow` is a server-side visual orchestration module. It connects enabled XNCF Functions, Agent / Agent-group / A2A objects, and built-in system nodes as a directed graph executed by the server. It is not a browser scripting engine and it never evaluates arbitrary JavaScript in a template.

## 1. Capabilities and Boundaries

Installation runs the module's database migrations and adds two Admin entries:

- **NeuChar Workflow**: `/Admin/NeuCharWorkflow/Index` for design, save, test, and triggering.
- **Task list**: `/Admin/NeuCharWorkflow/Tasks` for run status, aborting active runs, and read-only replay.

The pages require a signed-in administrator. When troubleshooting, check module installation/enabled state, administrator permission, the state of referenced XNCF modules, and whether the referenced Function or object still exists.

| Scope                   | Current behavior                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Triggers                | Manual, interval, and Webhook. Each graph must contain exactly one matching trigger.                                                               |
| Executable capabilities | `[FunctionRender]` Functions from enabled modules, available Agent / Agent-group / A2A objects, and built-in system nodes.                         |
| Save and run            | Drafts may retain disconnected nodes, but such a draft is treated as disabled and cannot be run as an interval or Webhook workflow.                |
| Run records             | The task list shows status and summary. A completed run can be replayed read-only from its captured graph without changing the current definition. |
| Variables and code      | Up to 30 workflow variables; the Safe Code node assigns only declared variables and cannot run arbitrary JavaScript.                               |

## 2. Create and Safely Run a Workflow

1. Install and enable `Senparc.Xncf.NeuCharWorkflow` in **XncfModuleManager**, then open **NeuChar Workflow** from the Admin menu.
2. Create a workflow, set its name, description, and trigger. The canvas keeps one trigger node matching that selection.
3. Add Functions, objects, or system nodes from the palette and connect them into a directed graph reachable from the trigger. Cycles are not supported.
4. Start with a Manual trigger, supply test input, and run it. Save and run both validate edges, parameters, module references, and object state.
5. Use the Console for presentation output and the task list for active runs, failures, and read-only replay. An administrator can abort their own active run.
6. Enable interval or Webhook execution only after the graph is valid. Saves create revisions; a replay can be copied as a new editable workflow.

### 2.1 Node Reference

| Node                                | Purpose and runtime behavior                                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual / Interval / Webhook trigger | Choose one. Interval is configured in seconds, from 60 seconds to 365 days; Webhook starts an asynchronous server-side run.                                                 |
| Function                            | Invokes an enabled XNCF `[FunctionRender]` Function. A parameter can bind a complete upstream output, or a single-value text parameter can use a template.                  |
| Agent / Agent group / A2A           | Sends the resolved Prompt to an available object. Validation fails if its module is closed, or the object was removed or disabled.                                          |
| Delay                               | Delays and then passes input through.                                                                                                                                       |
| Condition                           | Compares left and right values and continues through its matching/non-matching branch while retaining the input.                                                            |
| Parallel                            | Fans the same input out to every downstream branch, which can run independently.                                                                                            |
| Aggregate                           | Waits for every activated upstream branch, builds an input array in edge order, and emits once. A sole `{{input}}` preserves that array as a JSON value.                    |
| Merge                               | Does not wait for all inputs; it emits each input downstream independently. Combined loop and merge stream activations are capped at 500 per run.                           |
| For loop                            | Executes downstream sequentially a finite number of times, from 1–100. There is no `while` and no graph back-edge.                                                          |
| Sub-workflow                        | Runs another saved, enabled workflow owned by the current administrator and returns its final output. Direct/indirect recursion is rejected; nesting is capped at 8 levels. |
| Safe Code                           | Assigns declared `vars` values with restricted templates during this run only, then passes the original input through.                                                      |
| Console                             | Renders its template to the page Console and **does not change** the original input passed downstream.                                                                      |
| NeuBell                             | Creates a workflow notification. Opening it from the Footer enters the task list and applies the node's consumption setting.                                                |
| End                                 | Ends that path.                                                                                                                                                             |

### 2.2 Interval and Webhook

The module's background service scans due, enabled interval workflows. The minimum interval is 60 seconds, so it is suitable for periodic work rather than a sub-second real-time queue.

After saving a Webhook workflow, the editor shows a URL and an access token. Send the token in `X-NeuChar-Webhook-Token` (recommended) or the `token` query parameter. The method may be limited to `GET`, `POST`, or unrestricted.

```bash
curl -X POST 'https://example.test/api/Senparc.Xncf.NeuCharWorkflow/neuchar-workflow/webhook/123' \
  -H 'X-NeuChar-Webhook-Token: <workflow-webhook-token>' \
  -H 'Content-Type: application/json' \
  -d '{"customerName":"Ada","amount":42}'
```

- Configured parameters are read from query values, form fields, and JSON-object fields; required parameters are validated.
- With no configured parameters, the entire request becomes workflow input. A non-JSON request body is stored as `_body`.
- The request body limit is 1 MB. A valid request returns `202 Accepted` and a `runId`; execution continues asynchronously on the server.
- Webhook is anonymous by design. Treat its URL, token, and logs as production secrets, and use HTTPS, least privilege, rate limiting, and audit controls.

## 3. Text Templates and Variables

Fields with **Edit formula text** may combine literal text, input placeholders, restricted expressions, and upstream bindings inserted by the UI. They include single-value Function text parameters, condition values, Agent prompts, sub-workflow input, NeuBell title/summary, aggregate output, and Console output.

| Form                | Meaning                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{input}}`         | Built-in current-node input. In an Aggregate node, using this alone preserves the aggregate array; other text fields render it as text.                                                                     |
| `{{= expression }}` | Evaluates a restricted expression and inserts its result. It never evaluates JavaScript.                                                                                                                    |
| `{{value_1}}`       | A visible binding token inserted by **Edit formula text** after choosing an upstream output. Its name is generated by the UI and it may also be used in an expression, for example `{{= upper(value_1) }}`. |
| `vars.variableName` | Reads a workflow variable. Names use letters, digits, and underscores, start with a letter or underscore, and cannot be `input` or `vars`.                                                                  |

Declare default variables in **Workflow settings**. They are evaluated in declaration order, so a later definition may read an earlier `vars.name`; a Safe Code node can update them for this run. They are discarded when the run ends and are not global configuration.

The UI saves upstream fields as a `$template` with binding-source records. Select bindings through the editor instead of fabricating those records manually. A manually written `{{= ... }}` expression can access only current input, `vars`, and already inserted binding tokens.

## 4. `{{= ... }}` Syntax

### 4.1 Basics

Each expression is limited to 512 characters; a text field may contain at most 32 expressions; and one rendered expression result may not exceed 8000 characters. Whitespace, parentheses, single/double quoted strings (with `\n`, `\r`, and `\t` escapes), numbers, `true`, `false`, and `null` are supported.

| Category                   | Supported form                                                  |
| -------------------------- | --------------------------------------------------------------- | --- | --- |
| Values                     | `input`, `vars.customerName`, `input.items[0]`, `value_1`       |
| Unary                      | `!value`, `-number`                                             |
| Arithmetic / concatenation | `+`, `-`; `+` adds two numbers and otherwise concatenates text. |
| Comparison                 | `==`, `!=`, `>`, `>=`, `<`, `<=`                                |
| Logic                      | `&&`, `                                                         |     | `   |
| Conditional                | `condition ? whenTrue : whenFalse`                              |

There is no `*`, `/`, `%`, assignment, loop, reflection, host object, network access, or JavaScript API. Property access applies only to JSON objects and indexing only to JSON arrays; missing properties and out-of-range indexes yield an empty value.

### 4.2 Built-in Functions

Function names are case-insensitive. In the examples, `value`, `array`, and `text` are expressions.

| Group           | Functions                                                                                                                                                | Example / note                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Branching       | `if(condition, yes, no)`, `coalesce(a, b, ...)`                                                                                                          | `{{= if(input.vip, 'VIP', 'Standard') }}`; `coalesce` returns the first non-empty value.                                             |
| Search          | `contains(value, sought)`, `startsWith(text, prefix)`, `endsWith(text, suffix)`                                                                          | String search is case-insensitive; `contains` can also test an array member.                                                         |
| Text            | `length(value)`, `substring(text, start[, length])`, `trim(text)`, `lower(text)`, `upper(text)`, `replace(text, old, new)`                               | `{{= upper(vars.customerName) }}`; `length` returns array length for arrays.                                                         |
| Split / join    | `split(text, separator)`, `join(array, separator)`                                                                                                       | `{{= join(input.tags, ' / ') }}`.                                                                                                    |
| Element         | `first(array)`, `last(array)`, `at(array, index)`                                                                                                        | An out-of-range access returns an empty value.                                                                                       |
| Number          | `toNumber(value)`, `sum(array)`, `min(array)`, `max(array)`                                                                                              | Numeric functions require numeric values.                                                                                            |
| Array transform | `sort(array[, path[, direction]])`, `orderBy(array[, path[, direction]])`, `reverse(array)`, `take(array, count)`, `skip(array, count)`, `unique(array)` | `{{= orderBy(input.items, 'price', 'desc') }}`; `path` permits letters, digits, underscores, and dots; direction is `asc` or `desc`. |
| Date/time       | `now()`, `formatDate(value[, format])`                                                                                                                   | `now()` returns UTC ISO 8601; `{{= formatDate(now(), 'yyyy-MM-dd HH:mm') }}` uses a .NET date format limited to 80 characters.       |

### 4.3 Template Examples

```text
Hello, {{= upper(vars.customerName) }}!

Date: {{= formatDate(now(), 'yyyy-MM-dd') }}

Order count: {{= length(input.orders) }}

Tier: {{= if(input.vip, 'VIP', 'Standard') }}

Tags: {{= join(unique(input.tags), ', ') }}

Highest-priced item: {{= first(orderBy(input.items, 'price', 'desc')).name }}
```

For an Aggregate node, these respectively preserve the array and render a text summary:

```text
{{input}}

{{= length(input) }} item(s): {{= join(input, ', ') }}
```

For Console, the default `{{input}}` controls only what is printed. The original node input always continues downstream.

## 5. Troubleshooting

| Symptom                                | Check first                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Function or Agent node cannot run      | Referenced XNCF module is installed/enabled, Function remains scanned, and object remains available.                |
| Saved workflow is not enabled          | Disconnected nodes, invalid references, missing required parameters, loop count, or a sub-workflow reference error. |
| Interval does not run                  | Enabled state, interval trigger, due next-run time, then the module background-service logs.                        |
| Webhook returns 401 / 400 / 405        | Token, required parameters, and method. `405` means the configuration allows only GET or POST.                      |
| Expression says variable is unbound    | Use only `input`, `vars`, and UI-inserted upstream binding tokens; verify the name and upstream connection.         |
| Console differs from downstream result | Expected: Console changes presentation only; the original input continues downstream.                               |

Related documentation:

- [XNCF Extension Library Guide](../home/xncf-extension-modules.md)
- [NCF Capability Source Deep Dive](../home/capability-guide.md)
