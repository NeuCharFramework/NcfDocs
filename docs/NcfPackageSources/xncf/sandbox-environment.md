# Senparc.Xncf.Sandbox Environment Setup

This page explains how to **manually** prepare Docker (or a compatible CLI) and images before using `Senparc.Xncf.Sandbox`.  
Image names, tags, and private registry examples are maintained here and may change over time. **Treat this page as the source of truth.** The XNCF UI only shows a short checklist and links here.

> Docs site: <https://doc.ncf.pub>  
> The module does not auto-install Docker and does not silently run `docker pull` from the web process.

## 1. Scope

| Item | Notes |
| --- | --- |
| Module responsibility | Orchestrate create/destroy lab sandboxes (Exec / optional Jupyter) |
| Operator responsibility | Install a container runtime, pre-pull images, configure private registries |
| Out of scope | Silent Docker installation by the web app; hard-coding image tags in UI copy |

See also: [XNCF extension modules](../home/xncf-extension-modules.md).

## 2. Verify Docker

On the same host that runs NCF:

```bash
docker version
docker info
```

You should see both Client and Server versions, and `docker info` should succeed. Podman is fine if it exposes a working `docker`-compatible CLI.

### 2.1 If Docker is missing

Install manually for your OS (commands differ by platform):

- macOS / Windows: [Docker Desktop](https://docs.docker.com/get-docker/)
- Linux: Docker Engine (or Podman) per distro docs; ensure socket permissions

Then re-run the checks above.

## 3. Recommended pre-pull list (updated in docs)

```bash
docker pull python:3.12-alpine
docker pull mcr.microsoft.com/dotnet/sdk:8.0
docker pull quay.io/jupyter/minimal-notebook:latest
```

If host memory is tight, pull only the Python image and skip Jupyter for now. A live Jupyter session often needs about 0.5–1.5GB RAM.

## 4. Private registry (reserved)

Mirror images internally, for example:

- `registry.example.com/ncf-sandbox/python:3.12-alpine`
- `registry.example.com/ncf-sandbox/dotnet-sdk:8.0`
- `registry.example.com/ncf-sandbox/minimal-notebook:latest`

Then pull from your registry (or configure a Docker registry mirror). Module-side registry prefix mapping may be added later; keep this page updated when that lands.

## 5. Enable the module in NCF

1. Start the site and sign in to Admin  
2. Install/enable `Senparc.Xncf.Sandbox`  
3. Open **Environment setup** and confirm the Docker probe passes  
4. Use the **Sandbox panel** or Functions

## 6. Security notes

- Prefer localhost/intranet experiments; do not expose Jupyter `127.0.0.1` + token URLs to the public internet without a reverse proxy and auth  
- Without Docker, the module will **not** fall back to bare-process execution of untrusted code  

## 7. Maintenance rule

Update image tags and registry examples **only in this docs page** (and the Chinese counterpart). Keep XNCF copy short and link to `https://doc.ncf.pub`.
