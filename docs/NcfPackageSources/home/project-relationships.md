# Project Relationships, Synchronization, and Release

> This page explains how two simulated sources in `NcfPackageSources` feed
> publishable projects. The current implementation of
> `tools/NcfSimulatedSiteSyncTool` is the synchronization authority.

## Relationship overview

```text
Template_OrgName.Xncf.Template_XncfName (runnable XNCF template source)
    │  NcfSimulatedSiteSyncTool: forced one-way sync plus placeholder transforms
    ▼
Senparc.Xncf.XncfBuilder.Template/templates/template1 (package content)
    │  dotnet pack / release pipeline package preparation
    ▼
Senparc.Xncf.XncfBuilder.Template (NuGet template package)
    │  dotnet new
    ▼
Developer-owned XNCF project

tools/NcfSimulatedSite (integration host for core packages)
    │  same NcfSimulatedSiteSyncTool: interactive Y / R / N per file
    ▼
NCF/src/back-end (backend content of the public NCF template)
    │
    ├─ NCF.Template.csproj → Senparc.NCF.Template (NuGet template package)
    └─ Senparc.Web → six-platform archives / GitHub Release assets
```

Both flows use the same tool, but they have different synchronization rules.

## Role of each project

| Project or directory                                                        | Role                                                                                                              | Directly published?                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `tools/NcfSimulatedSite/Template_OrgName.Xncf.Template_XncfName`            | Runnable, integration-tested source of truth for XNCF template content                                            | No                                                          |
| `src/Extensions/Senparc.Xncf.XncfBuilder/Senparc.Xncf.XncfBuilder.Template` | NuGet template packaging project; actual template content is under `templates/template1`                          | Yes, as `Senparc.Xncf.XncfBuilder.Template`                 |
| `tools/NcfSimulatedSite`                                                    | Integration host for NCF libraries and extensions, and normal synchronization source for the NCF backend template | No                                                          |
| `src/back-end` in `NeuCharFramework/NCF`                                    | Public NCF backend template content for end users                                                                 | Included in `Senparc.NCF.Template` by `NCF.Template.csproj` |
| `Senparc.Web` in `NeuCharFramework/NCF`                                     | Publishable sample/runnable site                                                                                  | CI produces platform archives and GitHub Release assets     |

## Synchronization tool and commands

Tool project:

```text
tools/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool/
  NcfSimulatedSiteSyncTool.csproj
```

Synchronize only the XNCF template:

```bash
dotnet run --project tools/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool.csproj -- --template-only
```

Synchronize the XNCF template first, then the complete simulated site and NCF
repository:

```bash
dotnet run --project tools/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool/NcfSimulatedSiteSyncTool.csproj
```

The tool expects the current repository layout, locates the sibling `NCF`
repository, and targets `NCF/src/back-end`. If repositories have been moved or
only one is checked out, verify the absolute source and target paths printed by
the tool before accepting any overwrite.

## XNCF template: forced one-way synchronization

The direction is fixed:

```text
NcfSimulatedSite/Template_OrgName.Xncf.Template_XncfName
    → Senparc.Xncf.XncfBuilder.Template/templates/template1
```

- Different target files are overwritten from the source without per-file prompts.
- Hidden files, `bin`, `obj`, `.vs`, `.user`, and `.DS_Store` are ignored.
- The sample `Uid` in `Register.cs` becomes `Template_Guid`, and the sample
  module version becomes `Template_Version` for `dotnet new` substitution.
- Change and test the runnable simulated-site template first, then synchronize.
  Do not maintain the packaging directory as an independent second source.

### Release method

`Template_OrgName.Xncf.Template_XncfName` is not independently released. After
synchronization, `dotnet pack` on the `Senparc.Xncf.XncfBuilder.Template`
project creates the `Senparc.Xncf.XncfBuilder.Template` NuGet package.

The current NcfPackageSources pipeline discovers and pushes generated
`Senparc.Ncf.*` and `Senparc.Xncf.*` packages, but its main build solution does
not include this Template project. A release maintainer must therefore ensure
that this project is explicitly built or packed before package discovery.
`GeneratePackageOnBuild` alone does not guarantee that the current main
pipeline produces this template package.

## Simulated site and NCF: interactive synchronization

The normal default direction is:

```text
NcfPackageSources/tools/NcfSimulatedSite → NCF/src/back-end
```

When files at the same path differ, the tool prompts per file:

- `Y`: overwrite `NCF/src/back-end` from `NcfSimulatedSite`;
- `R`: reverse the direction and overwrite `NcfSimulatedSite` from
  `NCF/src/back-end`;
- `N`: skip that difference.

This makes the flow source-oriented but interactively reversible, unlike the
forced one-way template sync. Build outputs, logs, `.git`, site-specific
solution files, and development configuration are among the excluded content.

### NCF release methods

The `NeuCharFramework/NCF` repository publishes the end-user template and site:

- `NCF.Template.csproj` packages `src/back-end/**` as the
  `Senparc.NCF.Template` NuGet package;
- CI publishes `Senparc.Web` archives for `win-x64`, `win-arm64`, `linux-x64`,
  `linux-arm64`, `osx-x64`, and `osx-arm64`;
- when Release conditions are satisfied, CI creates a GitHub Release and
  uploads those assets; the pipeline also retains build artifacts.

The NCF repository's release process and pipeline are authoritative for a
formal release. A local `dotnet pack` validates package content, but does not
prove publication to NuGet or GitHub Releases.

## Recommended maintenance flow

1. Make and locally verify changes in the simulated source in `NcfPackageSources`.
2. Inspect the tool's printed absolute paths and differences before choosing a sync mode.
3. Use `--template-only` for the XNCF template and inspect placeholders and package content.
4. For the full site, decide `Y/R/N` per file so independent NCF changes are preserved.
5. Commit synchronized results in the two repositories separately; the sync tool is not a Git release tool.
6. Before release, verify build results, package contents, and pipeline artifacts separately.
