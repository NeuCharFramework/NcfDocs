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
docker pull mcr.microsoft.com/dotnet/sdk:10.0
docker pull quay.io/jupyter/minimal-notebook:latest
```

Notes:

- `csharp-exec` uses .NET 10 **file-based apps** (`dotnet run --file main.cs`). Top-level statements work (e.g. `Console.WriteLine("hi");`); no `.csproj` required.
- Exec uses `--network none`. The module injects an offline `nuget.config` and sets `PublishAot=false` (file-based apps default to Native AOT, which cannot restore offline). `#:package` restore remains unavailable unless you change network policy or bake packages into a custom image.
- If host memory is tight, pull only the Python image and skip Jupyter for now. A live Jupyter session often needs about 0.5–1.5GB RAM.

### 3.1 Mainland China networks and pull timeout

The default Jupyter image is hosted on `quay.io`. The commonly used TUNA mirror is for Docker CE
packages, not a Quay container registry, so `quay.io/jupyter/...` cannot be rewritten to a TUNA URL.

For a temporary third-party Quay proxy, explicitly override the image and allow 15 minutes for the
complete `docker run` operation:

```json
"SenparcXncfSandbox": {
  "Docker": {
    "InteractiveCreateTimeoutSeconds": 900
  },
  "Images": {
    "Overrides": {
      "jupyter-python": "quay.dockerproxy.net/jupyter/minimal-notebook:latest"
    }
  }
}
```

The timeout accepts 60–3600 seconds and includes Docker's automatic image pull when the image is
missing locally. `quay.dockerproxy.net` is a third-party proxy, not an official Senparc or TUNA
service. For production, mirror the image into ACR, TCR, or an internal registry and configure a
pinned tag or digest through `Overrides`.

### 3.2 C# Notebook image

NCF supports two C# workflows:

- `csharp-exec`: a short-lived .NET SDK container for simple code and Functions;
- `jupyter-csharp`: a Jupyter Notebook with cell-by-cell C# execution, using a separately built image.

The image build context is `tools/SandboxImages/JupyterDotnet` in the NCF source repository. The SDK,
DLLs, and NuGet packages are not added to the NCF NuGet package. The image build installs the .NET
SDK and .NET Interactive Kernel, then warms the packages listed by `Learning.csproj`.

Build and verify it from the NCF source repository:

```bash
cd tools/SandboxImages/JupyterDotnet
docker build -t ncf-jupyter-dotnet:10.0 .
docker run --rm ncf-jupyter-dotnet:10.0 dotnet --info
docker run --rm ncf-jupyter-dotnet:10.0 jupyter kernelspec list
```

If NCF and Docker use the same local daemon, configure the local image:

```json
"SenparcXncfSandbox": {
  "Images": {
    "Overrides": {
      "jupyter-csharp": "ncf-jupyter-dotnet:10.0"
    }
  }
}
```

To publish it to a private registry:

```bash
docker tag ncf-jupyter-dotnet:10.0 \
  registry.example.com/ncf-sandbox/jupyter-dotnet:10.0
docker login registry.example.com
docker push registry.example.com/ncf-sandbox/jupyter-dotnet:10.0
```

Then configure the full image reference:

```json
"jupyter-csharp": "registry.example.com/ncf-sandbox/jupyter-dotnet:10.0"
```

Use a pinned version or digest in production instead of `latest`. If the build host cannot reach the
public NuGet feed reliably, pass `--build-arg NUGET_SOURCE=https://your-nuget-feed/v3/index.json`
to use an organisation's package feed.

After creating a `JupyterLab C#` sandbox, select the C# kernel in JupyterLab and run:

```csharp
using Newtonsoft.Json;

var value = new { Name = "NCF", Enabled = true };
Console.WriteLine(JsonConvert.SerializeObject(value));
```

## 4. Private registry

Mirror images internally, then configure the host `appsettings.json`:

```json
"SenparcXncfSandbox": {
  "Images": {
    "RegistryPrefix": "registry.example.com/ncf-sandbox",
    "Overrides": {
      "python-exec": "registry.example.com/ncf-sandbox/python:3.12-alpine",
      "csharp-exec": "registry.example.com/ncf-sandbox/dotnet-sdk:10.0",
      "jupyter-python": "registry.example.com/ncf-sandbox/minimal-notebook:latest",
      "jupyter-csharp": "registry.example.com/ncf-sandbox/jupyter-dotnet:10.0"
    }
  }
}
```

`Overrides` wins over `RegistryPrefix`. Prefer full override entries for multi-segment public images (e.g. `mcr.microsoft.com/...`). You can also use a Docker registry mirror without app config.

## 5. Enable the module in NCF

1. Start the site and sign in to Admin  
2. Install/enable `Senparc.Xncf.Sandbox`  
3. Open **Environment setup** and confirm the Docker probe passes  
4. Use the **Sandbox panel** or Functions

## 6. Security notes

- Prefer localhost/intranet experiments; do not expose Jupyter `127.0.0.1` + token URLs to the public internet without a reverse proxy and auth  
- Without Docker, the module will **not** fall back to bare-process execution of untrusted code  

## 7. NCF/XNCF Preview Workload

`Senparc.Xncf.XncfBuilder` can send a **sanitized isolated source snapshot**
to Sandbox for a separate NCF preview. This is intended for review of
AI-assisted XNCF changes; it is not a general-purpose Docker command runner
and it does not hot-load a module into the main site.

The workload is disabled by default. Enable it only after an operator has
prepared a trusted image and a host that supports the preview path base:

```json
"SenparcXncfSandbox": {
  "NcfPreview": {
    "Enabled": true,
    "AllowDependencyRestoreNetwork": false,
    "StartupTimeoutSeconds": 180
  },
  "Images": {
    "Overrides": {
      "ncf-preview": "registry.example.com/ncf/ncf-preview@sha256:<immutable-digest>"
    }
  }
}
```

Requirements and behavior:

- `ncf-preview` **must** be an approved immutable digest. A tag such as
  `:latest` or `:10.0` is rejected.
- With the default `AllowDependencyRestoreNetwork: false`, the container uses
  `--network none`. The approved image must already contain/cache all required
  SDK and package dependencies.
- If package restore must use an internal mirror, enable it explicitly and use
  only a dedicated Docker network that reaches that mirror, never the general
  Internet:

  ```json
  "NcfPreview": {
    "Enabled": true,
    "AllowDependencyRestoreNetwork": true,
    "RestoreNetworkName": "ncf-package-mirror",
    "StartupTimeoutSeconds": 180
  }
  ```

- The fixed container invocation has no caller-supplied shell command, Docker
  socket, host network, or writable production checkout. It uses a second
  Sandbox-owned source copy, loopback-only port binding, dropped capabilities,
  `no-new-privileges`, read-only root filesystem, tmpfs, and CPU/memory/PID
  limits.
- It executes only: restore the fixed `Senparc.Web` project, publish it, and
  start it on port 8080. Preview output is not deployed back to the host.
- Access uses `/sandbox-preview/{sessionId}/...` through an authenticated Admin
  proxy. Cookies and `Authorization` headers are removed before proxying to the
  preview process.
- The preview `Senparc.Web` must read `NCF_XNCF_PREVIEW_PATH_BASE` and call
  `UsePathBase` before NCF/routing middleware. The simulated host supports
  this; a custom host must add the same opt-in.

See [Safely Create, Test, and Merge an XNCF Module](/start/xncf-develop/isolated-xncf-development.html)
for the operator flow, and [XncfBuilder Isolated Development Source Analysis](./xncfbuilder-isolated-development.md)
for the implementation boundary.

## 8. Maintenance rule

Update image tags and registry examples **only in this docs page** (and the Chinese counterpart). Keep XNCF copy short and link to `https://doc.ncf.pub`.
