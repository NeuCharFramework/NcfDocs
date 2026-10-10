# AIKernel Local Fine-Tuning

This guide covers the optional local training workflow in `Senparc.Xncf.AIKernel`: prepare an approved offline model, upload a dataset, submit a bounded job to a separate Python worker, inspect real training events, and evaluate the resulting adapter. **Training is disabled by default.** NCF is the authenticated administration plane, not the training runtime or an inference server.

The worker is maintained under `tools/AIKernelFineTuning` in `NcfPackageSources`. Deploy a matching NCF/worker version; capability preflight, not the presence of a dropdown, determines which backend and method can run.

### Functional Architecture and Boundaries

Verify the backend workflow before judging how the UI exposes it. A visible page or loss chart does not prove that training is implemented correctly.

| Layer                         | Actual responsibility                                                                                                                            | Not its responsibility                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| AIKernel administration plane | Database Worker profiles, Admin authorization, private API routing, request validation, audit and streamed downloads                             | Training inside the web process or treating a Worker as an inference endpoint |
| Python Worker                 | Approved offline-model preflight, JSONL and held-out validation, durable queue, training children, resource/runtime bounds, events and artifacts | Arbitrary user scripts or automatic resume                                    |
| PEFT / native MLX             | Real LoRA/quantized-LoRA updates, evaluation loss, checkpoints and adapter exports                                                               | Guaranteed task quality or absence of regressions                             |
| UI                            | Operations, actual states/errors/resources, complete history paging, parameter and workflow guidance                                             | Invented progress or treating submission as training/quality success          |
| Separate inference runtime    | Compatible base/tokenizer/adapter loading and inference serving                                                                                  | Automatic deployment or registration by the training Worker                   |

This console requires **Worker 1.1 or newer**, with catalog paging and persistent `storeId`. Legacy `/jobs` and `/datasets` array APIs remain compatible and return only the latest 100 records. Complete browsing uses `/jobs/page` and `/datasets/page`, returning `items`, `total`, `offset` and `limit`, with 1–200 items per page. Paging does not bypass retention admission limits.

For the NCF administration APIs, upload/create/cancel operations put `workerAlias` in the **query** and only the relevant request DTO fields in the JSON body. Never pass a Worker secret or endpoint to the browser. Service methods put the body DTO first to follow the dynamic API generator's binding rules. These NCF endpoints are distinct from the Worker's private API.

For example, an authenticated, authorized NCF administration client submits:

```text
POST /api/Senparc.Xncf.AIKernel/AIFineTuningAppService/Xncf.AIKernel_AIFineTuningAppService.CreateJobAsync?workerAlias=cpu_lab
Content-Type: application/json
```

```json
{
  "name": "Bounded smoke test",
  "modelId": "approved-model",
  "datasetId": "replace-with-uploaded-dataset-id",
  "backend": "cpu",
  "method": "lora",
  "maxSteps": 10,
  "maxSequenceLength": 128
}
```

Replace IDs and the sequence cap with real values for the selected Worker. Saving a Worker returns a **Worker DTO**, not a training-job DTO: verify the saved profile and connection state. Disabling a profile blocks access but does not terminate existing training.

## 1. What Fine-Tuning Changes

### SFT, Full Fine-Tuning, LoRA, and QLoRA

**Supervised fine-tuning (SFT)** learns desired responses from input/answer examples, such as conversations or prompt/completion pairs. SFT describes the training objective; full fine-tuning, LoRA, and QLoRA describe how parameters are updated.

| Approach         | What is trained                                             | Trade-off                                                                                                | This workflow                                                           |
| ---------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Full fine-tuning | Most or all base-model weights                              | Large optimizer, gradient, and checkpoint memory; greater risk of forgetting general capabilities        | Concept only; not a selectable method                                   |
| LoRA             | Small low-rank adapter matrices; base weights remain frozen | Lower trainable parameter count and storage; still needs base-model and activation memory                | PEFT on CPU/CUDA; native MLX when reported available                    |
| QLoRA            | LoRA adapters over a quantized, frozen base                 | Reduces base-weight memory, but does not remove activation/optimizer costs or guarantee a model will fit | CUDA quantization or native MLX quantized-model training when supported |

For ordinary LoRA, the weight update is approximately `W' = W + (alpha / rank) * B * A`:

- **Rank (`r`)** is the adapter's low-rank dimension. More rank can increase capacity and memory; it is not automatically more accurate.
- **Alpha** controls update scaling relative to rank. Changing rank while holding alpha fixed changes the scale. MLX's native scaling convention must be checked rather than assumed identical to PEFT.
- **Dropout** regularizes the adapter during training. Too little can encourage overfitting; too much can underfit. It does not mean randomly dropping dataset rows.
- **Target modules** determine which compatible linear layers receive adapters. The default `all-linear` belongs to the PEFT path; MLX has its own supported layer selection. Do not copy module names between architectures or backends blindly.

CUDA QLoRA and MLX quantized LoRA are different implementations. In particular, an Apple Silicon worker does not use CUDA/bitsandbytes or obtain Metal by running a Linux container.

### Fine-Tuning Is Not RAG

Fine-tuning is useful for response style, structured output, task behavior, and domain phrasing. It is not a reliable live database, citation system, document permission boundary, or guaranteed way to memorize facts.

**Keep KnowledgeBase/RAG** for current, attributable, access-controlled knowledge: retrieve relevant chunks, supply them as context, and generate an answer. A tuned model can consume that context, but training does not replace retrieval, embeddings, vector storage, or source authorization. Start with the [AI + Prompt + Agent + Knowledge pipeline](../home/capability-guide.md#_4-2-scenario-b-build-an-ai-prompt-agent-and-knowledge-pipeline).

## 2. Data, Evaluation, and Governance

### Accepted Dataset Format

Use UTF-8 **JSONL**, one JSON object per line, with **2–10,000 valid rows** and **at most 2 MiB (2,097,152 bytes)** per upload. Blank lines, JSON arrays, CSV, arbitrary files and Python programs are unsupported. Each row contains only conversation `messages` or only `prompt`/`completion`; do not combine the shapes or add extra fields.

`prompt`, `completion` and each message's `content` must be nonblank text, at most 65,536 characters, without NUL. `messages` has 2–128 objects containing only `role`/`content`: optional `system` first, followed by alternating `user`/`assistant`, ending with `assistant`. No `tool` messages are accepted. Browser structure validation includes line numbers; Worker validation remains authoritative, including duplicate JSON properties and training/validation overlap.

Conversation example (two rows):

```jsonl
{"messages":[{"role":"user","content":"Return the status of ticket A as JSON."},{"role":"assistant","content":"{\"ticket\":\"A\",\"status\":\"open\"}"}]}
{"messages":[{"role":"user","content":"Return the status of ticket B as JSON."},{"role":"assistant","content":"{\"ticket\":\"B\",\"status\":\"closed\"}"}]}
```

Prompt/completion example (two rows):

```jsonl
{"prompt":"Classify: I cannot sign in.","completion":"account_access"}
{"prompt":"Classify: Please send my invoice.","completion":"billing"}
```

Two rows only satisfy validation; they are not evidence of sufficient training data or a useful evaluation set. Check the base tokenizer/chat template, response format, length distribution, and truncation before a meaningful run. A smaller maximum sequence length can discard the answer being taught.

The returned SHA-256 hashes the normalized stored JSONL, not necessarily the original file bytes. Normalization does not append an extra final newline, so an otherwise valid upload of exactly 2 MiB remains readable after persistence.

### Separate Training, Validation, and Final Test Data

1. Remove duplicates and split by source, user, document, or time **before** producing examples. Near-duplicate conversations in different splits also contaminate evaluation.
2. Upload training and held-out validation as separate datasets. The UI excludes the training dataset from validation selection; a different ID alone does not prove the content is independent.
3. Use validation loss to compare runs, and keep a further untouched test set for final acceptance. Do not train on test answers or repeatedly tune against the final test set.
4. Compare base and tuned models on the same held-out tasks, prompt templates, decoding settings, and RAG context. Check task accuracy, JSON/schema validity, refusal behavior, leakage, and general capability regressions, not just loss.

If no validation dataset is selected, this worker deterministically holds out approximately 20% of distinct rows (at least one), using the job seed. It rejects fewer than two distinct rows and explicit train/validation row overlap. This detects exact duplicates, not semantic near-duplicates. **Missing evaluation loss is unavailable, not zero or success.** Do not promote an adapter merely because training loss decreased.

This implementation computes causal next-token loss on **all non-padding tokens**, including prompt/user tokens, rather than assistant-only masked SFT. `messages` requires the approved tokenizer's chat template; there is no silent generic-template fallback. Both backends use AdamW, linear warmup/decay and gradient clipping. Right truncation is warned, but operators must inspect length distributions to avoid losing answers.

### Licenses and Privacy

- Obtain permission for the base weights, tokenizer, dataset, and intended use. Review training, redistribution, derivative/adapter, merged-weight, and commercial-use restrictions separately.
- Remove secrets and unnecessary personal/customer data; apply consent, purpose limitation, access control, and retention policy before upload. Adapters and checkpoints can memorize sensitive examples.
- Treat datasets, logs, checkpoints, adapters, and backups as sensitive assets. Offline execution reduces network exposure; it does not anonymize data or prevent memorization.
- Record model revision/hash, model and data licenses, dataset hash, split provenance, hyperparameters, backend/dependency versions, operator, and evaluation results.

## 3. Deployment and Authentication

### NCF Configuration

Fine-tuning uses a hybrid configuration model. Create and manage each Worker profile (alias, private endpoint, request timeout, enabled state, and operator note) in **AIKernel → Local fine-tuning**. Profiles are stored in the AIKernel database and each job, dataset, event stream, and artifact remains bound to its selected Worker.

Keep the global kill switch, endpoint allowlist, and per-Worker secrets outside the database. The exact infrastructure configuration section is `SenparcXncfAIKernel:FineTuning`:

```json
{
  "SenparcXncfAIKernel": {
    "FineTuning": {
      "Enabled": false,
      "AllowedHosts": ["127.0.0.1", "training-gateway.internal"],
      "WorkerApiKeys": {
        "cpu_lab": "",
        "cuda_prod": ""
      }
    }
  }
}
```

Leave checked-in keys empty. Supply them from environment variables or a secret manager; aliases must match the database Worker profile. The Worker requires `NCF_WORKER_KEY`; NCF sends the matching secret in **`X-NCF-Worker-Key`**. Use a distinct random key of at least 32 characters for every Worker, never a model-provider API key.

```bash
# Supply each Worker key securely to both matching services first.
export SenparcXncfAIKernel__FineTuning__WorkerApiKeys__cpu_lab="$NCF_CPU_WORKER_KEY"
export SenparcXncfAIKernel__FineTuning__WorkerApiKeys__cuda_prod="$NCF_CUDA_WORKER_KEY"
export SenparcXncfAIKernel__FineTuning__Enabled=true
```

Set these in the NCF host's environment, not the browser. The global `Enabled` value and `AllowedHosts` are mandatory security gates; an enabled database profile cannot bypass either. Set each profile's request timeout (1–300 seconds) in the UI; it is an HTTP timeout, **not** a training-duration limit. Jobs continue independently of an HTTP request or browser tab.

`Enabled=false` blocks NCF access to the Worker; it does not remotely kill an already running training child. Use cancellation or the operator procedure for stopping the Worker when termination is required. Do not confuse the administration access switch with a GPU-process kill switch.

Set environment variables before starting NCF; restart it after changes, then use **Refresh / reconnect**. Underscore aliases in these examples work with shell `export`. For an alias containing a hyphen, use a service environment configuration or secret provider that supports that name rather than an invalid shell assignment.

For the first connection, add a UI profile with alias `cpu_lab`, name `CPU lab`, endpoint `http://127.0.0.1:8091`, timeout `180` seconds and enabled state. The host must be in `AllowedHosts`, and the secret alias must match. An empty key entry does not count as a configured secret. Legacy single-worker `WorkerEndpoint`/`WorkerApiKey` settings do not configure database profiles.

For an existing installation, upgrade AIKernel through module management to apply its new Worker-table migrations. This source integration is **0.16.4**, not a claim that the package is already published on NuGet: deploy a source-built package containing this implementation and a matching Worker version.

### Multiple Workers and Sandboxes

Multiple Workers are appropriate when CPU validation, NVIDIA CUDA production training, Apple Silicon MLX training, or separate security/capacity pools must coexist. They are not a stateless load-balancing pool: each Worker owns its SQLite task store and local artifacts. Select a Worker before uploading a dataset; do not expect a dataset or job ID from one Worker to exist on another.

Use one database profile and one secret alias per Worker. Route only through approved private endpoints in `AllowedHosts`; do not use public URLs, arbitrary administrator-entered hosts, or a shared key across environments. A Sandbox remains a useful isolation boundary for short execution, but long-running training should use the dedicated Worker deployment and its hard runtime limits. The Worker still enforces its own network, disk, queue, duration, CPU/GPU, and container restrictions, independently of the NCF database configuration.

Loopback works only when NCF can reach the worker in the same host/network namespace. In Compose, use the worker service DNS name and port; in separate deployments, use a private authenticated endpoint with TLS where appropriate. Do not publish the worker API directly to the Internet or put the shared key in URLs, screenshots, logs, or frontend configuration.

The NCF fine-tuning page and AppService require **NCF Admin authorization**. The shared worker key is service authentication, not end-user authorization. Current datasets, jobs, events, and artifacts are **global operator resources**: tenant-specific ownership/isolation is not implemented. Do not expose this as a self-service multi-tenant training service.

### Approved Local Models Only

Provision weights and tokenizer files through a separate, reviewed acquisition process, then register only approved local model directories in the worker's allowlist. Operators select an allowlisted model ID; a job must not accept an arbitrary Hugging Face ID, URL, filesystem path, script, or download request.

Training loads local files offline, with **`trust_remote_code=false`**. Choose an architecture supported by the installed backend without custom repository code. Do not relax these controls to make an unreviewed model load. Vet model serialization, provenance, file hashes, licenses, tokenizer/chat templates, and dependency versions; prefer safe weight formats where supported. Offline mode does not make malicious weights or native libraries safe.

### Backend and Isolation Matrix

| Backend | Where it runs                                                                                    | Supported training                                                 | Deployment boundary                                                  |
| ------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `cpu`   | Native Python or Linux container, including Docker Desktop on Mac                                | PEFT LoRA                                                          | Useful for a tiny smoke test; large models can be impractically slow |
| `cuda`  | Linux with an NVIDIA GPU, compatible driver/runtime, and NVIDIA Container Toolkit for containers | PEFT LoRA and CUDA QLoRA when dependencies/hardware pass preflight | Grant only the required GPU devices; no privileged container         |
| `mlx`   | **Native macOS on Apple Silicon**, supported Python/MLX stack                                    | MLX LoRA and quantized LoRA when the worker advertises them        | Run as a restricted OS user; this is **not container isolation**     |

Docker Desktop's Linux VM cannot access Apple Metal for MLX training. Use CPU Docker on Mac, or run the MLX worker natively. Do not assume Intel Mac support or map an NVIDIA Docker command to Apple GPUs.

The existing Sandbox PythonExec/Jupyter workload has short execution quotas and no training GPU API or durable long-training lifecycle. **Do not run training as arbitrary Sandbox exec.** The dedicated companion image is fixed-purpose and follows similar isolation principles:

- Separate NCF and training processes; expose only the authenticated training API on an internal network.
- Non-root user, read-only root filesystem and model mounts, a writable persistent job volume, and bounded temporary storage.
- Drop capabilities, use no-new-privileges, and grant no Docker socket, broad host mount, privileged mode, or arbitrary shell/code execution.
- Enforce CPU, memory, and PID limits; budget disk and runtime separately. Keep model access offline.
- GPU device access and drivers enlarge the attack surface. **GPU isolation is not equivalent to a CPU security sandbox**; use vetted weights/dependencies and an appropriately isolated host.

For native MLX, enforce equivalent network, filesystem, resource, and secret policies using macOS service/OS controls where possible. A restricted account is not a claim of Linux-container sandboxing.

### Initialize the Worker and Images

Provision weights separately on a controlled download machine, not inside the offline worker. Review the license, choose a supported architecture and pin an approved revision. For example, with that machine's Hugging Face CLI: `hf download APPROVED_ORG/MODEL --revision PINNED_COMMIT --local-dir ./approved-models/model-id --include '*.safetensors' '*.json' '*.model' '*.txt' '*.jinja' '*.tiktoken'`. Replace placeholders, verify file hashes/completeness, then transfer the actual files into the read-only model root. Do not transfer a symlink cache or provider tokens; remote/custom-code models remain unsupported.

Run from `NcfPackageSources/tools/AIKernelFineTuning`. Prepare an approved, offline safetensors model under `/absolute/path/to/approved-models/<model-id>` with config, tokenizer and all shards. The directory name is the model ID; symlinks, pickle/bin weights and remote/custom code are rejected. Dependencies are installed at image build time, not by training jobs.

```bash
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_DIR="/absolute/path/to/approved-models"
docker compose --profile cpu up -d --build cpu gateway
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" http://127.0.0.1:8091/health
```

On a NVIDIA Linux host with a compatible CUDA 12.8 driver and NVIDIA Container Toolkit, use `docker compose --profile cuda up -d --build cuda gateway` instead. **Do not enable both profiles at once.** CPU and CUDA have separate persistent data volumes.

The fixed API gateway publishes loopback port 8091 and joins the ingress/internal networks; the training worker joins only the **internal, no-egress** network. This avoids Docker Desktop's inaccessible published ports on internal-only networks without giving training an external route. The gateway forwards only to the worker, streams artifacts, and does not receive a Docker socket. If NCF is containerized, connect its administration service to the gateway ingress network and use `http://gateway:8080`; its own loopback is not the host's loopback.

Native Apple Silicon setup:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-mlx.txt
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_ROOT="/absolute/path/to/approved-models"
export NCF_DATA_ROOT="/absolute/path/to/private-training-data"
.venv/bin/python -m worker
```

Native workers default to **127.0.0.1:8091**. Use a restricted service account, not root. Add that endpoint as a database Worker profile and supply the matching `SenparcXncfAIKernel__FineTuning__WorkerApiKeys__<alias>` secret; set the profile timeout to 180 when larger-model preflight needs more than the default 30 seconds. Model loading remains offline; messages require an approved chat template. For production, build/scan approved images, lock transitive dependencies and deploy immutable digests; supplied dependency ranges are not a complete reproducibility lock.

### Operator Budgets

The worker enforces `NCF_QUEUE_LIMIT` (8), `NCF_MAX_DURATION_MINUTES` (1440), `NCF_MAX_JOB_BYTES` (20 GiB), `NCF_MIN_FREE_BYTES` (1 GiB), `NCF_EVENT_LIMIT` (10000 per job), and `NCF_MAX_DATASETS`/`NCF_MAX_JOBS` (1000 each). Set environment overrides explicitly in Compose/native service configuration. Request duration may not exceed the operator ceiling. Disk capacity is checked before upload/submission, during training and before archive creation; the UI exposes free space/output size, warns at 80% of the output budget, and reports termination explicitly. **Periodic checks do not replace filesystem quotas.**

`NCF_TELEMETRY_SECONDS` defaults to 2, `NCF_CANCEL_GRACE_SECONDS` to 30, `NCF_PREFLIGHT_SECONDS` to 120, and `NCF_TORCH_THREADS` to 2. CPU/RAM/PID limits are container/host controls. Archive creation needs additional free space; raw completed checkpoints remain if archiving fails. Back up/rotate a stopped store when retention admission caps are reached; no online-delete or auto-promotion API is provided.

## 4. Platform Runbook: DGX Spark and MacBook M2

Use the following order: validate the Worker first, then operate the web page. The two machines may be registered as separate Workers, but must not share dataset IDs, job IDs, or a `/data` directory. CPU and Apple Metal flows have been exercised in this environment; no DGX Spark hardware was available, so DGX Spark CUDA, driver, ARM64 image and memory behavior require on-site validation.

### 4.1 NVIDIA DGX Spark: CUDA Worker

On DGX Spark, prefer the `cuda` backend. Do not use the Mac `mlx` configuration, and do not copy CUDA QLoRA bitsandbytes/NF4 settings into an MLX Worker. Before deployment, check:

```bash
uname -m
nvidia-smi
docker version
docker compose version
docker run --rm --gpus all \
  nvidia/cuda:12.8.1-runtime-ubuntu24.04 nvidia-smi
```

The image and CUDA version above are the repository Dockerfile baseline, not a guarantee for every DGX Spark firmware, driver or OS image. DGX Spark commonly uses an ARM64 host; when `uname -m` reports `aarch64`, verify native ARM64 builds for the base image, PyTorch CUDA wheel, bitsandbytes and all transitive dependencies. **Do not pass production acceptance with QEMU emulation.** If the repository Dockerfile or dependencies do not build natively, use an approved, scanned ARM64 image or a native Python environment on DGX Spark, while keeping the same Worker API contract.

From the Worker directory, use this template after replacing paths and policies:

```bash
cd NcfPackageSources/tools/AIKernelFineTuning
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_DIR="/srv/aikernel/approved-models"
docker compose --profile cuda build cuda
docker compose --profile cuda up -d cuda gateway
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/health
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/capabilities
docker compose --profile cuda logs --tail 100 cuda gateway
```

Start with one small approved local model and a 1–10 step `cuda + lora` smoke job. Increase sequence length, effective batch size and steps gradually after preflight passes. If memory is insufficient, first reduce `maxSequenceLength`, `batchSize` and `loraRank`, then consider `gradientAccumulationSteps`; do not simply remove Worker memory, disk or PID limits. Choose QLoRA only when preflight reports it and the model is in a supported quantized format.

If NCF runs outside DGX Spark, do not configure `127.0.0.1`; use a private address or TLS reverse proxy reachable only by NCF. `AllowedHosts` must allow the host and the NCF API-key configuration name must exactly match the Worker alias. Never expose the Worker API publicly.

### 4.2 MacBook M2: Native MLX Worker

Use a native macOS Worker to access Metal. Docker Desktop's Linux VM cannot provide Apple Metal to an MLX Worker. Use a dedicated macOS service account and separate model/data directories:

```bash
cd NcfPackageSources/tools/AIKernelFineTuning
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-mlx.txt
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_ROOT="$HOME/aikernel/approved-models"
export NCF_DATA_ROOT="$HOME/aikernel/private-training-data"
.venv/bin/python -m worker
```

In another terminal:

```bash
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/health
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/capabilities
```

On the same Mac, configure `http://127.0.0.1:8091` in NCF. If NCF runs elsewhere, use a restricted private-network/TLS proxy rather than exposing the Worker publicly. macOS, model weights, activations and optimizer state share unified memory; start with a short sequence, `batchSize=1` and a small `loraRank`, then inspect memory and Worker resource events.

Use `mlx + lora` for unquantized models. Use `mlx + qlora` only when preflight reports support. MLX QLoRA is a native MLX quantization path, not CUDA bitsandbytes; loading its adapter requires recreating the quantization described by the manifest.

### 4.3 One complete web workflow

Regardless of platform:

1. Check `/health` and `/capabilities`; confirm the model directory and requested backend are available.
2. In NCF Admin, open **AIKernel → Local Fine-Tuning**, choose **Add Worker**, and enter a unique alias, display name, absolute HTTP(S) endpoint, timeout (180 seconds is a practical first preflight value), and enabled status. Inject the API key on the NCF server; never put it in the browser form or URL.
3. Select the Worker and wait for models, capabilities, datasets and job history to load. Do not switch Workers during upload, create or cancel requests.
4. Under **Datasets**, upload UTF-8 JSONL training data and a separately named validation set. Verify row count, SHA-256 and validation results; fix reported line numbers instead of using CSV or a JSON array.
5. Under **New Job**, select model, datasets, backend and method. Start with short-step `lora`; choose `qlora` only when preflight and memory allow it. Ensure `maxSequenceLength` does not truncate the answer.
6. Watch true status, completed steps, train/validation loss, resources, events and artifacts. Closing the browser does not stop a job; refresh restores persisted Worker history.
7. Cancellation stops a job; it is not pause/resume. Wait for a terminal state, then download `training-export.zip` and retain `manifest.json`, `metrics.jsonl`, and base/data hashes.
8. Evaluate the same base + adapter + tokenizer in a separate inference runtime. Compare against the untuned baseline, including format, refusal boundaries, factuality and RAG behavior, before registering or deploying it. The training Worker never auto-publishes a model.

## 5. UI Workflow

1. Install/enable AIKernel and deploy/configure the companion worker separately. Open **AIKernel → Local Fine-Tuning** from NCF Admin.
2. Check worker connection/version, active/queued counts, and backend capability reasons. Resolve unavailable dependencies, hardware, or missing models before submission.
3. Name and upload the JSONL training dataset. Check returned row count and SHA-256. Upload independent validation data separately.
4. Create a named job: select an approved model, training dataset, optional validation dataset, compatible backend, and `lora` or `qlora`.
5. Start with a tiny bounded smoke test. Inspect the advanced parameters; the default short step limit is not a production training recipe.
6. Select the job from the task list. Inspect real step/loss curves, resource cards, timestamped logs, state, error details, and artifact metadata.
7. Refresh/reopen the selected job to recover its persisted history. If disconnected, treat the display as stale; do not infer that the worker stopped or finished.
8. Cancel only when needed. Cancellation is a stop request, **not pause/resume**. Keep any successfully written checkpoints for diagnosis; they do not imply the run can resume automatically.
9. Evaluate the adapter on held-out tasks before deploying/registering an inference model.

### In-Page Tutorial, Examples, and the First Job

The page opens **Start here: fine-tuning tutorial** by default, covering “Worker → independent data → bounded training → monitoring/recovery → evaluation/deployment”, with links to both complete language guides. **Worker setup and troubleshooting** shows current hybrid-configuration fields; **Common problems and next actions** explains connection, data, memory and interruption errors.

With no profile, or no enabled Worker with a valid configured secret, the page shows **Worker setup required** and setup instructions rather than a connection failure. Upload and training remain disabled; use **Add worker** or edit an existing profile to prepare it. Actual API, authorization and connectivity failures remain explicit errors.

Literal `AIKernel.FineTuning.*` labels indicate missing module localization scripts, not parameter names. Update the AIKernel module/source containing the fix, rebuild and restart the actual NCF host, then refresh. The module uses the dedicated `_AIKernelLocalizationScripts` partial to avoid collisions with the Admin host's generic partial. Do not work around this by replacing training fields or editing the browser dictionary.

Under **Datasets → Dataset examples and download**, switch between `prompt / completion` and `messages`, inspect and download four-row JSONL. Downloading does not upload data or submit a job. These examples demonstrate format only, not sufficient data or model quality. Use `prompt/completion` for a tokenizer without a chat template; do not promote a model based on the examples.

For a first smoke test:

1. Select the configured Worker, verify the needed CPU/CUDA/MLX capability and provision an approved model.
2. Download/upload an example suitable for that tokenizer; check the returned row count `4` and SHA-256. Clean and split production data separately.
3. Name the job and select model/training data. Validation may be empty: the Worker independently holds out at least one distinct row.
4. Select a compatible backend and `lora`, retaining `maxSteps=10`, `batchSize=1` and `gradientAccumulationSteps=1`. `maxSequenceLength` defaults to 256 but must not exceed the model's context limit; use 32 for the `tiny-gpt2` fixture. This bounded pipeline check does not guarantee the model fits in memory.
5. Expand **Advanced parameters** and read the question-mark tips; the form displays approximate single-device effective batch. Positive `maxSteps` overrides `epochs`; evaluation still runs at the final step even with the default `evalSteps=20`.
6. Submit and inspect the actual terminal state, steps, training/validation loss, logs and existing artifacts. `Succeeded` is not a quality acceptance result.

Worker selection is disabled during file reading, upload, submission and cancellation. Switching resets Worker-scoped model/training/validation selections, job detail, curves and event cursor; old responses cannot overwrite the new Worker's view. HTTP requests follow the database profile's timeout, with a small browser transport allowance. Editing the current Worker reloads its catalog and state.

The job list pages against the backend total, ten records at a time, rather than treating the latest 100 as all history. Datasets initially load 100 records; use **Load older datasets** to continue. Refresh also verifies selected historical training/validation metadata with the backend. Concurrent submissions by other operators can shift ordering; refresh restarts browsing from the current catalog. Paging is not a frozen transactional snapshot.

The Worker's `storeId` persists in SQLite across normal restarts. Replacing or rebuilding storage produces a new identity; the UI clears old jobs, datasets and cursors and asks operators to reselect, preventing reuse of old IDs against a new store. A stopping/unhealthy Worker, or one missing the required protocol capabilities, cannot accept submissions through the console.

### Frequently Asked Questions

- **Why is there no new inference model after training?** The export is an adapter, not an inference service. Evaluate it, deploy a compatible runtime and register the actual inference endpoint/model in model management.
- **Can the Worker URL be used as a model Endpoint?** No. Training and inference APIs are separate services and should have separate authentication.
- **Why not resubmit immediately after a timeout?** Losing the response does not prove creation failed. Refresh the original Worker's durable job list to avoid duplicate jobs.
- **Is an empty validation loss zero?** No: it is pending or unavailable. Check logs, state and final evaluation.
- **Is lower training loss always better?** No. Rising validation loss can indicate overfitting; compare independent tasks, output compliance and RAG behavior.
- **Can jobs pause, resume or be deleted online?** These interfaces are not implemented. Cancellation stops a job; restarted active work becomes `Interrupted`. Retained checkpoints do not imply a resume implementation.

### Training Controls and How to Read Them

The job contract exposes the following controls; the selected backend may reject combinations it cannot faithfully implement. Do not interpret a shared form as a guarantee of identical backend behavior.

| Controls                                                | Meaning and operating guidance                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `epochs`, `maxSteps`                                    | Epochs are passes over training data; a positive step cap bounds optimizer updates. Avoid training indefinitely or treating repeated passes as new examples.                               |
| `learningRate`                                          | Update magnitude. Excessive LR can cause instability/forgetting; a very small LR may fail to learn. Tune against held-out quality, not a copied recipe.                                    |
| `batchSize`, `gradientAccumulationSteps`                | Microbatch and accumulated microbatches per optimizer update. On one training device, effective batch is approximately their product; accumulation saves activation memory but costs time. |
| `maxSequenceLength`                                     | Tokenized sequence cap. Longer sequences increase memory and computation; truncation can remove important supervision.                                                                     |
| `loraRank`, `loraAlpha`, `loraDropout`, `targetModules` | Adapter capacity, scale, regularization, and layer selection; validate architecture/backend compatibility.                                                                                 |
| `warmupRatio`, `weightDecay`                            | LR warmup fraction and optimizer regularization. Warmup reduces abrupt initial updates; backend support must be checked.                                                                   |
| `loggingSteps`, `saveSteps`, `evalSteps`                | Logging, checkpoint, and validation cadence in optimizer steps. Frequent checkpoints/evaluation cost disk/time; evaluation requires held-out data.                                         |
| `seed`                                                  | Reproducibility input, not a promise of identical results across hardware/dependency versions.                                                                                             |
| `maxDurationMinutes`                                    | Job wall-time budget; separate from NCF HTTP timeout and host CPU/memory limits. On timeout the Worker requests a checkpoint at a safe boundary, then terminates the job. |

**Optimizer** state tracks updates and can consume significant memory even with adapters. There is no optimizer selector in the NCF job contract; use the backend's implemented optimizer, rather than inventing an `optimizer` request field. Optimizer choice/scheduler and backend-specific limitations belong to the worker version.

Training loss measures fit to the examples. Evaluation loss measures fit to held-out examples under the same tokenization/loss convention. A falling training loss with rising validation loss suggests **overfitting**; reduce passes/capacity, improve data diversity, or regularize, then compare again. Losses from different templates, token masking, sequence caps, or datasets may not be directly comparable. A checkpoint is a recovery/evaluation artifact, not proof of model quality.

## 6. Durable Jobs and Honest Observability

The worker uses a **bounded durable SQLite queue with one active training job**. Resource-intensive training must not be scaled by starting multiple workers on the same job store.

- Poll job snapshots and event pages using the monotonic cursor (`after`, `nextCursor`, `hasMore`); fetch subsequent pages until caught up. Persisted events let the UI recover after refresh instead of fabricating a new timeline. `truncated` explicitly indicates pruned older history; the UI retains at most 1000 displayed log/chart points.
- Progress requires actual `step` and `totalSteps`. Do not infer training progress from elapsed time, queue position, or animation.
- Training/evaluation loss and LR come from backend callbacks. Resource telemetry includes process CPU/RSS and GPU memory/utilization/temperature **where available**. Missing sensors/metrics must remain explicitly unavailable, not zero.
- RSS is process resident memory, not total host memory or a complete GPU/unified-memory budget. CPU percentage and GPU readings depend on sampling/device scope; do not treat them as guaranteed per-tenant accounting.
- On worker restart, interrupted active work is marked **`Interrupted`**, not silently successful or automatically resumed. Review errors/events and retained checkpoints, then create a new bounded job unless that worker version explicitly supports resume.
- Cancellation and runtime/resource termination can prevent a final adapter from being written. Show the real terminal state and only artifacts that exist.

There is no integrated Prometheus deployment promised by this workflow. For production, add external monitoring/alerts for worker health, queue depth, stale events, CPU/RSS, GPU availability/utilization, OOMs, runtime overruns, disk capacity, and backup freshness. Do not expose raw prompts, datasets, or secrets as monitoring labels.

## 7. Artifacts, Inference Registration, and Recovery

### Adapter Is Not a Standalone Model

A LoRA/QLoRA **adapter** normally needs the exact compatible base-model revision, tokenizer, and an inference runtime that loads that adapter. A **merged model** incorporates the learned update into weights and has different storage, compatibility, quantization, and licensing considerations. Quantized adapters are not universally mergeable as-is.

The training UI downloads artifacts through the AdminOnly Razor handler, without exposing the worker key or buffering large archives in Web memory. Downloads include `training-export.zip`, `manifest.json` and `metrics.jsonl`. Archives contain adapter/tokenizer files and the last two completed checkpoints, including diagnostic optimizer/RNG state. The manifest records base safetensors/data hashes, parameters, dependency versions, evaluation split and loss convention. The UI indicates when event history was truncated and displays up to 1,000 log/plot points. It does not automatically serve, merge, deploy, or register a model.

MLX QLoRA from an unquantized base uses 4-bit affine quantization with group size 64. Recreate the exported base quantization configuration before loading its adapter; the export does not include a full copy of base weights. CUDA NF4 QLoRA and MLX affine quantization are not interchangeable.

1. Evaluate against the untouched test set and representative RAG tasks.
2. Choose an inference runtime supporting the exact adapter format, or perform an explicitly supported offline merge/export outside this UI.
3. Deploy the inference service separately with its own auth/resource controls.
4. In AIKernel's existing model management, register the **inference provider endpoint, served model name, and inference credentials**, not the training worker endpoint or worker key.
5. Test chat, PromptRange/AgentsManager integration, schema behavior, and KnowledgeBase retrieval. Keep the previous inference model selectable for rollback.

### Errors and Recovery

| Symptom                             | Action                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Disabled / authentication failure   | Check `Enabled`, private endpoint reachability, and matching keys (at least 32 characters); do not bypass Admin auth.                           |
| Backend/method unavailable          | Read the preflight reason; check OS/hardware/dependencies and model backend allowlist. MLX requires native Apple Silicon.                       |
| Dataset rejected                    | Check UTF-8 JSONL, valid supported row shape, minimum two rows, and 2 MiB cap; repair data rather than suppress validation.                     |
| Model load failure                  | Verify local approved files, architecture/tokenizer support, offline provisioning, and hashes. Do not enable remote code or arbitrary download. |
| OOM / unstable or non-finite loss   | Inspect errors/resources; reduce batch/sequence/rank or use a supported quantized backend, then create a new bounded run.                       |
| HTTP timeout / stale UI             | Check worker health and persisted job state before resubmitting; a lost response does not prove job creation failed.                            |
| Cancelled / interrupted / failed    | Review events and actual files; preserve useful checkpoints. No automatic resume or success-shaped fallback.                                    |
| Queue full / storage lock conflict  | Wait or cancel queued work; run only one worker per store. Do not remove live locks or start a second writer.                                   |
| Disk full / missing final artifacts | Stop accepting jobs, inspect retention/capacity and errors, and back up before targeted cleanup.                                                |

### Production Checklist

- Separate web administration, training, and inference deployments. Limit access to global trusted operators; tenant isolation is not implemented.
- Bound queue length, active jobs, duration, container/host resources, and storage. One active job does not by itself provide a disk or cost budget.
- Preserve audit records for dataset upload, job creation/cancellation, operator identity in NCF, worker lifecycle, and evaluation/promotion decisions. The worker's shared key cannot identify individual users by itself.
- Define retention for datasets, events, checkpoints, adapters, and backups. Review actual worker cleanup support; do not assume a delete button, automatic pruning, or TTL exists.
- Back up the **SQLite store and job/data/artifact volume together** using a consistent SQLite backup or a stopped-worker snapshot. Copying only a live database file can omit WAL state; copying only adapters loses queue/provenance.
- Test restoration to a separate store with exactly one worker and compatible dependencies/models. Never have two workers share one writable store, including on network storage.
- Rotate the shared key in both services, protect backups, and monitor externally. Keep the feature disabled until preflight and a real smoke test succeed.

## 8. Hands-on Apple Silicon acceptance

The following is a beginner-friendly native MLX path for macOS. It does not use Docker and does not try to expose Apple Metal to a Linux container.

### 8.1 Prepare the Worker and model directories

```bash
cd NcfPackageSources/tools/AIKernelFineTuning
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-mlx.txt

mkdir -p "$HOME/AIModels"
mkdir -p "$HOME/AIKernelFineTuningData"

export NCF_WORKER_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_ROOT="$HOME/AIModels"
export NCF_DATA_ROOT="$HOME/AIKernelFineTuningData"
export NCF_BIND_HOST=127.0.0.1
export NCF_WORKER_PORT=8091
python -m worker
```

In another terminal, check the service with the same secret:

```bash
curl --fail \
  -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/health
```

If `python` is missing in the new terminal, activate `.venv` first; `python3` is sufficient for viewing JSON without MLX. `NCF_MODELS_ROOT` must already exist even when the model has not been copied yet.

In the NCF startup terminal, configure the same secret. The example Worker alias is `mlx_lab`:

```bash
export SenparcXncfAIKernel__FineTuning__Enabled=true
export SenparcXncfAIKernel__FineTuning__AllowedHosts__0=127.0.0.1
export SenparcXncfAIKernel__FineTuning__WorkerApiKeys__mlx_lab="$NCF_WORKER_KEY"
```

Restart NCF after changing environment variables and set the page endpoint to `http://127.0.0.1:8091`. If the page says the secret is missing, first check the exact alias, the NCF process environment and whether NCF was restarted; do not repeatedly generate a different Worker secret.

### 8.2 Provision the original model

The model root should contain a complete model directory, for example:

```text
$HOME/AIModels/Qwen2.5-0.5B-Instruct/
├── config.json
├── tokenizer_config.json
├── tokenizer.json
├── model.safetensors
└── other tokenizer / model files
```

Model downloads are supply-chain operations: review the license, pin a revision, verify hashes, then copy the result into the Worker's read-only model root. When Homebrew Python enforces PEP 668, do not install into the system Python; use an isolated download environment:

```bash
python3 -m venv "$HOME/model-download-env"
source "$HOME/model-download-env/bin/activate"
python -m pip install modelscope
modelscope download \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --local_dir "$HOME/AIModels/Qwen2.5-0.5B-Instruct"
```

ModelScope, the Hugging Face CLI and mirrors can differ by network, license and revision. The completed directory must still pass Worker preflight. Do not let a training job download models at runtime and do not copy provider tokens into the model directory.

### 8.3 From a 10-step smoke test to 500 steps

Use the default 10 steps first to prove the Worker, model, dataset and Adapter export loop. After it succeeds, increase to 200 or 500 steps. For a Xiaohongshu-style task, keep held-out test prompts instead of judging only by training loss.

A successful MLX QLoRA manifest may contain:

```json
{
  "status": "succeeded",
  "baseModelId": "Qwen2.5-0.5B-Instruct",
  "backend": "mlx",
  "method": "qlora",
  "trainingRows": 800,
  "evaluationRows": 200,
  "completedSteps": 500
}
```

`succeeded` means the training process completed; it does not mean model quality passed. Also check `baseModelSha256`, the dataset hash, `evalLoss`, completed steps and the exported files.

### 8.4 Download, inspect and run the Adapter

Download `training-export.zip`, `manifest.json` and `metrics.jsonl` from the page:

```bash
mkdir -p "$HOME/AIKernelArtifacts/m2-lora/extracted"
unzip -o "$HOME/Downloads/training-export.zip" \
  -d "$HOME/AIKernelArtifacts/m2-lora/extracted"

python3 -m json.tool \
  "$HOME/AIKernelArtifacts/m2-lora/extracted/manifest.json"
find "$HOME/AIKernelArtifacts/m2-lora/extracted" -maxdepth 3 -type f
```

An MLX export normally contains `adapter/adapters.safetensors`, Adapter configuration and a tokenizer. Use exactly the same base model:

```bash
export BASE_MODEL="$HOME/AIModels/Qwen2.5-0.5B-Instruct"
export ADAPTER_PATH="$HOME/AIKernelArtifacts/m2-lora/extracted/adapter"

shasum -a 256 "$BASE_MODEL/model.safetensors"
python -m mlx_lm.generate \
  --model "$BASE_MODEL" \
  --adapter-path "$ADAPTER_PATH" \
  --prompt "Write a Xiaohongshu-style post about a commuter thermos." \
  --max-tokens 200
```

For `messages` data, use the tokenizer chat template to build the prompt. Do not pass an MLX QLoRA Adapter directly to PyTorch PEFT, CUDA bitsandbytes or Ollama. Ollama usually requires fusing the Adapter into the same base and converting the result to compatible GGUF; conversion depends on the model architecture and tool version.

### 8.5 Timed-out jobs and partial artifacts

If the page shows `Failed` but still lists `manifest.json`, `metrics.jsonl` or `training-export.zip`, the Worker usually reached at least one checkpoint before timeout or interruption and archived the output that existed when the child exited. This is not contradictory:

- `Failed` means the requested training run did not complete all requested steps;
- `completedSteps` is only the last recorded optimizer step;
- artifacts can be inspected for manifest, metrics and Adapter integrity;
- they must not be registered or deployed as a completed training model;
- the page intentionally does not offer automated validation for failed or interrupted jobs.

This run completed 360 of 500 steps in about 60 minutes. First increase `maxDurationMinutes` above the estimated wall time with a 10–20 minute reserve. At roughly 360 steps per 60 minutes, 500 steps would theoretically take about 84 minutes, so 120 minutes is a reasonable next setting; actual time depends on evaluation cadence, checkpoint cadence, first model loading and disk speed. Do not accept partial artifacts solely because training or evaluation loss appears low.

### 8.6 Automated quick validation after training

The Worker already verifies Adapter export and compatible reload. A successful job now exposes **Post-training quick validation** in the detail panel; the page still never treats arbitrary inference commands as scripts. A reproducible validation needs:

1. The base-model directory used by the job;
2. The Adapter and tokenizer from `training-export.zip`;
3. The backend, method, quantization configuration and base hash from the manifest;
4. A bounded set of test prompts;
5. Maximum tokens, timeout and output limits;
6. The same offline dependencies as the training Worker.

The page starts a restricted Worker-side task: it accepts only the same base model bound to the successful job, its exported Adapter, and one prompt per line (at most 8 cases, with a 16–256 token output limit). Results are persisted and polled into the page with progress, prompts and responses. Shell commands, Python files, network URLs, user paths and user-selected executables are rejected. The first release supports native MLX jobs; use the explicit `mlx_lm.generate` commands above for CPU/CUDA jobs.

### 8.6 Boundaries for model-download automation

“Enter a model name and download it” is implementable, but the browser must not send an arbitrary repository to a Web process that executes the download. A safe implementation needs:

- NCF administrator authorization and review state;
- an allowlisted provider such as ModelScope or a controlled Hugging Face endpoint;
- approved model IDs, revisions and file patterns only;
- a configurable model root: the Worker `NCF_MODELS_ROOT` or an explicitly approved `App_Data` subdirectory;
- a temporary download directory, resumable downloads and disk-space checks;
- SHA-256/file-integrity verification followed by Worker preflight;
- no provider token in the browser, logs or model directory;
- a background Worker task with progress, cancellation, errors and audit events;
- offline training after the download task completes.

Until provider allowlists, license review, hash validation and App_Data path isolation are implemented, do not turn a generic `modelscope download` or `huggingface-cli` command into an arbitrary command button.

## 9. Acceptance Checks

Before promoting a deployment, verify: Admin authorization and wrong-key rejection; a valid two-row upload and rejection of malformed/oversized data; an allowlisted local model; a real short LoRA run with actual step/loss events; held-out evaluation; refresh recovery; cancellation and checkpoint behavior; interrupted state after restart; and one-worker storage locking. Exercise only backends actually available on the host.

The 2026-10-07 functional check actually ran native CPU LoRA, native Apple Metal LoRA and quantized LoRA. Each completed six optimizer updates, held-out evaluation, artifact download and running/queued cancellation. It also checked base-weight hashes, genuinely updated exported B matrices, compatible adapter reload and changed inference logits relative to the base. Quantized MLX reload reconstructs the base from the exported quantization configuration; CUDA NF4 compatibility is not assumed.

The named-Worker .NET client integration test actually executed training, explicit independent validation, downloads and cancellation instead of being skipped. SQLite Worker-profile round trips were also exercised. Regressions cover catalog records beyond 100, persistent store identity on restart, cache invalidation on store replacement, truthful initialization-cancellation metadata, authentication, data bounds and event cursors. NCF dynamic controllers were actually generated to verify body DTO/query alias binding, and complete frontend create/edit actions were checked against Worker DTOs, preventing a successful backend save from being reported as a UI failure.

Random tiny models prove **the training/export/use infrastructure workflow, not model quality, large-model capacity, production container deployment or every database provider**. CUDA still requires an NVIDIA Linux host. Repeat these checks and the production checklist for the actual deployment.

For reproducible infrastructure checks, from the worker directory:

```bash
python3 -m venv .venv-test
.venv-test/bin/python -m pip install -r requirements-test.txt
.venv-test/bin/python -m unittest discover -s tests -v
node --test tests/test_ui.cjs
```

For real CPU training and the .NET administration client, run from the Worker directory:

```bash
python3 -m venv .venv-cpu-smoke
.venv-cpu-smoke/bin/python -m pip install -r requirements-cpu.txt
.venv-cpu-smoke/bin/python -m tests.run_native_smoke --backend cpu \
  --dotnet-project ../../src/Extensions/Senparc.Xncf.AIKernel.Tests/Senparc.Xncf.AIKernel.Tests.csproj
```

Restore the .NET project first using the repository's usual workflow on a fresh checkout. The script generates random weights without model/data downloads, starts a temporary authenticated Worker and cleans Worker/model/data on success or failure. `adapterReloadVerified=true` means reload was actually exercised; the presence of exported files is insufficient.

Native Apple checks use `python -m tests.run_native_smoke --backend mlx` in a separate environment with `requirements-mlx.txt` and `torch==2.8.0` for fixture generation only, checking both LoRA and quantized-LoRA exports. Against an existing disposable Worker, use `python -m tests.smoke --backend cpu --model tiny-gpt2 --models-root /absolute/path/to/test-models`; omitting the local base path skips reload verification and explicitly reports false.

See also the [XNCF extension overview](../home/xncf-extension-modules.md), [module documentation map](./module-documentation-map.md), and [Sandbox environment guide](./sandbox-environment.md).
