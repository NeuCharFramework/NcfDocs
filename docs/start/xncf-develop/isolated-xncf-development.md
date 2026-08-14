# Safely Create, Test, and Merge an XNCF Module

This is the **usage guide** for the isolated XNCF development workflow in
`Senparc.Xncf.XncfBuilder`. It is for Template users, operators, and reviewers:
you do not need to read the implementation to use the workflow safely.

For the code-level architecture, state machine, and extension points, see
[XncfBuilder Isolated Development Source Analysis](/NcfPackageSources/xncf/xncfbuilder-isolated-development.html).

## What This Workflow Solves

Traditional **Generate XNCF** writes directly into the selected solution. That
is appropriate for a trusted developer making a deliberate local change, but
it is not a safe place for AI-generated or experimental code.

The isolated workflow changes the order:

```text
source snapshot -> isolated module generation/editing -> structural validation
-> Sandbox build and preview -> human review -> explicit merge
```

The target checkout is not changed before the final human approval. Sandbox
preview is a separate, disposable container process; it is **not** runtime hot
loading into the current NCF site.

::: warning What happens after merge
After an approved merge, use your normal source-control review, database
migration, build, deployment, and restart procedures. The main `Senparc.Web`
process is deliberately not replaced by the Sandbox preview.
:::

## Who Can Use It

Use this workflow when all of the following are true:

- You have a trusted, writable source checkout and a `.sln` file.
- The solution contains `Senparc.Web/Senparc.Web.csproj` and its source
  `ProjectReference` closure stays inside the same checkout/repository.
- You want to create a new module or edit an existing module with AI assistance
  or other untrusted/generated code.

It is not a way to modify a DLL-only installation. A compiled-only deployment
has no source tree that can be snapshotted, reviewed, or merged. Create and
test the module in a source checkout first, then release it through the normal
NuGet/deployment path.

## Prerequisites

1. Install and enable `Senparc.Xncf.XncfBuilder`.
2. For a new module, install an approved local XNCF template. Check it with:

   ```bash
   dotnet new list XNCF
   ```

   If your organization permits it and no template is listed, install the
   trusted template through its approved NuGet source:

   ```bash
   dotnet new install Senparc.Xncf.XncfBuilder.Template
   ```

   The isolated workflow never downloads or installs a template by itself.
3. Apply the XncfBuilder database migration that creates
   `XncfBuilderXncfDevelopmentJob`. This workflow intentionally has no
   in-memory fallback: without the table it creates no snapshot and changes no
   source. The monitor shows a persistence warning and backs off its checks.
4. To test in Sandbox, install and enable `Senparc.Xncf.Sandbox`, prepare
   Docker, and configure the fixed `ncf-preview` image as described in
   [Sandbox Environment Setup](/NcfPackageSources/xncf/sandbox-environment.html#ncf-xncf-preview-workload).
5. The preview host must support the `NCF_XNCF_PREVIEW_PATH_BASE` environment
   variable before NCF/routing middleware. The simulated `Senparc.Web` host
   includes this opt-in. Add the equivalent small `UsePathBase` block to a
   custom host before using its Sandbox preview.

## Safe Operation

### 1. Create an isolated development job

From the XncfBuilder Function page, or through an authorized Admin Chat that
can invoke XncfBuilder Functions, call **Create isolated XNCF development
job**.

Choose one mode:

| Mode | Use when | Result |
| --- | --- | --- |
| `CreateNew` | A module does not exist yet | The locally installed `XNCF` template generates the module only in the isolated workspace. |
| `ModifyExisting` | A source module already exists | The existing module is copied into the isolated workspace; the original remains unchanged. |

Provide the target `.sln`, full module project name, requirement, and template
options. For a new module, the module name normally follows
`Organization.Xncf.ModuleName`.

### 2. Let the assistant work only in the isolated module

The exposed functions are intentionally narrow:

1. Read isolated XNCF file (returns its SHA-256).
2. Write isolated XNCF file (optionally with the expected SHA-256).
3. Validate isolated XNCF development job.
4. Start Sandbox XNCF preview.
5. Get status, request human merge approval, or discard the task.

The assistant can write only module code, pages, scripts, styles, resources,
JSON, and Markdown. It cannot change project files, packages, MSBuild targets,
NuGet settings, app settings, or files outside the module directory.

### 3. Validate and preview

**Validate** confirms that the isolated `Senparc.Web` has a direct source
reference to the module and produces a controlled diff summary. It is a
structural check; restore, publish, and host start run only inside Sandbox.

Then choose **Start Sandbox XNCF preview**. The monitor at
`Admin/XncfBuilder/PreviewMonitor` shows:

- target and isolated solution paths;
- module diff and SHA-256 fingerprints;
- Sandbox session and authenticated preview link;
- review, approval, applied, discarded, or failure state.

Test the preview through the monitor link. Do not expose the container port
directly: the host proxy requires an Admin session and does not forward your
cookies or authorization header to the preview process.

### 4. Request and perform human merge

After review, an assistant may request approval, but it cannot merge code.
The reviewer must use the monitor page, inspect the task, and type exactly:

```text
APPLY <full-module-project-name>
```

For example:

```text
APPLY Contoso.Xncf.Inventory
```

The merge rejects a changed target fingerprint, changed module project file,
duplicate new-module directory, or unsafe path. Existing modules receive only
the permitted module-file changes. A new module is staged first, then the
solution and `Senparc.Web` reference are updated with rollback backups.

### 5. Finish normally

Review the resulting Git diff, create/apply any module database migration in
your normal workflow, build, deploy, and restart the production host when you
are ready. Use **Discard** when the experiment is not accepted; it requests
Sandbox cleanup and removes the temporary workspace without changing target
source.

## What Is Protected

- Snapshots exclude `.git`, IDE folders, build artifacts, packages,
  `App_Data`, application settings, `.env` files, NuGet configuration, common
  key/certificate formats, and symbolic links.
- Snapshot and Sandbox copy are each limited to 768 MB.
- The initial job record is persisted before a source copy or template command
  can run, preserving an audit trail.
- The AI tool surface does not include the old direct Build, direct Preview,
  Stop Preview, or Add Migration functions.
- An AI request never receives an arbitrary shell command or the production
  checkout mounted inside Docker.

## Troubleshooting

| Message or symptom | First action |
| --- | --- |
| Development-task persistence is not ready | Apply the XncfBuilder database migration. Do not retry creation until it succeeds. |
| `XNCF` template is unavailable | Install an organization-approved local template; the job intentionally will not install one. |
| Host project reference validation fails | Ensure `Senparc.Web.csproj` directly references the module project in the isolated source solution. |
| Sandbox preview refuses to start | Check Sandbox enablement, Docker availability, pinned image digest, and the path-base host opt-in. |
| Restore fails in preview | Keep network disabled and bake/cache dependencies in the approved image, or use a dedicated package-mirror Docker network. |
| Merge is refused because target changed | Create a new job from the current target source; do not overwrite a newer checkout. |

## Related Guides

- [Create the First Xncf Module](./create-xncf.md) — direct, trusted local generation.
- [Sandbox Environment Setup](/NcfPackageSources/xncf/sandbox-environment.html) — Docker and preview image preparation.
- [XNCF Module Documentation Map](/NcfPackageSources/xncf/module-documentation-map.html) — module guides versus source deep dives.
