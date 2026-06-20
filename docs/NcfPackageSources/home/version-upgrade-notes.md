# Version Upgrade Notes

> This page is the centralized upgrade log for major `NcfPackageSources` changes.  
> Target readers: developers, maintainers, and operations engineers handling upgrades.

## How to Use This Page

For each upgrade, check in this order:

1. Read the upgrade summary to understand scope.  
2. Review behavior changes to identify module impact.  
3. Complete the post-upgrade validation checklist.

## Current Baseline

- Documentation baseline commit: `631f16b4` (2026-06-17)
- Capability docs:
  - [NcfPackageSources Source Guide](./index.md)
  - [NCF Capability Deep Dive](./capability-guide.md)
  - [Beginner Quickstart (60 Minutes)](./beginner-quickstart.md)

## Upgrade Summary (2026-06)

### 1. Module Registration and Governance

- Function registration path is standardized around `[FunctionRender]` auto scanning.
- MCP is managed through unified module contract members.
- Recommended troubleshooting order is standardized:
  module state -> registration state -> auth policy -> runtime logs.

### 2. AI / RAG Implementation Path

- A minimum production path can be built with
  `AIKernel -> PromptRange -> AgentsManager -> KnowledgeBase`.
- KnowledgeBase covers file chunking, embedding, and recall-test baseline flow.

### 3. Open-Source Collaboration and Documentation Co-Maintenance

- Docs now include minimal templates for high-quality Issues and PRs.
- The “user-to-contributor” workflow is documented for easier collaboration.

## Change Log Template (Use This for Future Entries)

### YYYY-MM-DD / vX.Y.Z

- **Affected module(s)**: `Senparc.Xncf.XXX` / `Senparc.Ncf.XXX`
- **Change type**: Added / Changed / Deprecated / Security Fix
- **Key change(s)**:
  - ...
- **Upgrade action(s)**:
  - ...
- **Rollback guidance**:
  - ...
- **Validation checklist**:
  - ...

## Post-Upgrade Validation Checklist (Minimum)

- Module install/enable/menu visibility is correct.
- Function and MCP registration results are queryable and callable.
- Management API auth (cookie / bearer / policy) works as expected.
- No persistent errors in key runtime logs (database, model service, network dependencies).
