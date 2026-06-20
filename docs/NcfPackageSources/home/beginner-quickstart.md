# NcfPackageSources Beginner Quickstart (60 Minutes)

> Scope: current `NcfPackageSources` version  
> Documentation baseline: `NcfPackageSources` `HEAD = 631f16b4` (2026-06-17)

## 1. What You Will Finish With This Guide

If this is your first time touching NCF source code, this guide gets you from zero to usable in about 60 minutes:

- Clone and build `NcfPackageSources`.
- Run the simulated host site `Senparc.Web`.
- Complete first-time installation, admin login, and module enablement.
- Validate a minimum AI / RAG flow.
- Know where to troubleshoot first when errors appear.

## 2. Prerequisites Checklist

| Item | Requirement | How to Verify |
|---|---|---|
| OS | Windows / macOS / Linux | - |
| .NET SDK | Recommended 8.0 (aligned with the current version) | `dotnet --version` |
| Git | Able to clone repositories | `git --version` |
| Browser | Chrome / Edge / Safari | - |
| Local port | `5001` (HTTPS) is available | Check `Now listening on` in startup logs |
| Database | Start with default SQLite | No extra install needed |

If your environment is not ready yet:

- [Development Environment](/start/instruction/environment.html)
- [Get NCF Template Source Code](/start/start-develop/get-ncf-template.html)

## 3. Minute 0-10: Clone and Confirm Commit

```bash
git clone https://github.com/NeuCharFramework/NcfPackageSources.git
cd NcfPackageSources
git rev-parse --short HEAD
```

Expected result:

- A short SHA is printed (for example `631f16b4`).

## 4. Minute 10-20: Restore and Build

```bash
dotnet restore src/NcfPackageSources_Include_NcfSimulatedSite.sln
dotnet build src/NcfPackageSources_Include_NcfSimulatedSite.sln
```

Expected result:

- `restore` completes without blocking errors.
- `build` ends with `Build succeeded.`.

## 5. Minute 20-30: Run the Simulated Host Site

```bash
dotnet run --project tools/NcfSimulatedSite/Senparc.Web/Senparc.Web.csproj
```

Expected result:

- Logs include `Now listening on`.
- Usually includes `https://localhost:5001`.

Then open: `https://localhost:5001`

On first run, seeing the installer is expected.

## 6. Minute 30-40: Complete Installer and Admin Login

Recommended order:

1. Finish the installer wizard. Reference: [Installation](/start/start-develop/install-app.html)
2. Sign in as administrator. Reference: [Admin Login](/start/start-develop/admin-login.html)
3. Open admin backend and verify left menu loads. Reference: [Admin Backend](/start/start-develop/admin-background.html)

Expected result:

- You can enter the admin homepage.
- Module management is accessible.

## 7. Minute 40-50: Enable Minimum AI / RAG Module Set

In Module Management, install and enable these modules first:

- `Senparc.Xncf.AIKernel`
- `Senparc.Xncf.PromptRange`
- `Senparc.Xncf.AgentsManager`
- `Senparc.Xncf.KnowledgeBase`

Optional:

- `Senparc.Xncf.MCP` (if you also want to validate MCP routing)

Reference: [Module Management](/start/start-develop/admin-module-manage.html)

Expected result:

- Module status shows installed/enabled (or equivalent labels).
- Corresponding admin menu entries are visible and openable.

## 8. Minute 50-60: Run a Minimum End-to-End Validation

Use the smallest possible action chain:

1. Configure available models in `AIKernel` (at least one chat model, preferably one embedding model too).
2. Create one PromptCode in `PromptRange`.
3. Import a test document in `KnowledgeBase` and run embedding.
4. Run recall test in `KnowledgeBase` and confirm matched chunks are returned.
5. (Optional) Create an Agent template in `AgentsManager` that references PromptCode and run a test.

Expected result:

- Embedding task completes.
- Recall test returns valid chunks.
- Agent test no longer fails with “model not configured”.

## 9. Troubleshooting Matrix (Check This First)

| Symptom | Common Cause | Fix |
|---|---|---|
| `dotnet` command not found | SDK missing or PATH not refreshed | Install/repair .NET SDK, reopen terminal, run `dotnet --info` |
| `restore` fails (timeout/source unavailable) | Network or NuGet feed issue | Verify network, retry `dotnet restore`, switch NuGet source if needed |
| `build` fails (SDK mismatch) | Local SDK is too old | Upgrade to .NET 8 SDK, rerun `dotnet build` |
| Startup port conflict | `5001` already used | Change port in `tools/NcfSimulatedSite/Senparc.Web/Properties/launchSettings.json` |
| Installer page keeps showing | Initial install not finished or DB init failed | Redo installer flow and inspect startup logs |
| Module menu not visible after install | Module not enabled or insufficient permission | Recheck module state and admin role permissions |
| Function count is 0 | Missing `[FunctionRender]` or scan miss | Check AppService annotations and restart app |
| MCP route returns 404 | `EnableMcpServer` disabled or not registered | Check module Register config and startup registration path |
| AppService returns 401/403 | Auth policy not satisfied | Check login state, AdminOnly policy, Bearer/Cookie auth context |
| KnowledgeBase embedding fails | Embedding model not configured | Configure embedding model in AIKernel first |

## 10. Troubleshooting Priority (Use This Order)

1. **Module state**: verify installed + enabled first.
2. **Function / MCP registration**: then verify scan registration results.
3. **Auth and logs**: only then inspect 401/403, policy, and runtime logs.

Following this order avoids getting lost in low-value log details.

## 11. Common Beginner Mistakes

- Mistake 1: using `IXncfRegister.Functions` to understand Function registration.  
  Current mechanism is `[FunctionRender]` on `AppService` methods.

- Mistake 2: treating “installed” as “ready”.  
  You usually still need enablement, permissions, and configuration.

- Mistake 3: jumping into logs first.  
  Without checking module state and config, logs become noisy and misleading.

- Mistake 4: assuming AI errors are code bugs first.  
  In many cases the root cause is model/key/quota/network configuration.

## 12. Next-Step Roadmap (By Role)

- Beginner:
  [NcfPackageSources Overview](/NcfPackageSources/home/index.html) ->
  [NCF Capability Deep Dive](/NcfPackageSources/home/capability-guide.html) ->
  [NCF FAQ](/start/qa/common_problem.html)

- Module developer:
  [XNCF Overview](/start/xncf-develop/about-xncf.html) ->
  [Develop XNCF](/start/xncf-develop/dev-xncf.html) ->
  [Core Interface IXncfRegister](/NcfPackageSources/libs/Senparc.Ncf.AreaBase/IxncfRegister.html)

- AI application developer:
  [NCF Capability Deep Dive](/NcfPackageSources/home/capability-guide.html) ->
  [MCP Module Docs (currently under zh docs)](/zh/MCP/home/index.html) ->
  module pages for `AIKernel / PromptRange / AgentsManager / KnowledgeBase`

- Operations / release engineer:
  [DatabasePlant Docs](/NcfPackageSources/libs/Senparc.Ncf.DatabasePlant.html) ->
  [Windows Deployment](/Deploy/windows/ncf-website.html) /
  [Docker Deployment](/Deploy/docker/ncf-website.html)

## 13. Open-Source Collaboration Entry Points

- Framework-level issues (template/install/upgrade): use `NCF` Issues first.  
  https://github.com/NeuCharFramework/NCF/issues

- Core package source issues (base libs/module register/runtime behavior): use `NcfPackageSources` Issues/PRs.  
  https://github.com/NeuCharFramework/NcfPackageSources/issues

Question-asking tips that dramatically improve response speed:

1. Include commit SHA (or release tag).
2. Include minimum reproducible steps (3-8 steps).
3. Include key logs (after desensitization).
4. State expected result vs actual result clearly.
