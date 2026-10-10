# AIKernel 本地微调

本文介绍 `Senparc.Xncf.AIKernel` 的可选本地训练流程：准备经批准的离线模型、上传数据集、向独立 Python worker 提交有边界的任务、查看真实训练事件并评估 adapter。**训练默认关闭。** NCF 是经过鉴权的管理平面，不是训练运行时，也不是推理服务器。

worker 位于 `NcfPackageSources` 的 `tools/AIKernelFineTuning`。NCF 与 worker 应部署匹配版本；能否训练以能力预检为准，不能仅凭下拉框中存在某选项判断。

### 功能架构与边界

功能验收应先验证后端闭环，再检查 UI 是否正确操作这些能力；能显示页面或绘制曲线不代表训练实现正确。

| 层次              | 实际职责                                                                                    | 不承担的职责                                      |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| AIKernel 管理平面 | 数据库 Worker 配置、管理员授权、私有 API 路由、参数校验、操作审计和流式下载                 | 不在 Web 进程中训练，不把 Worker 当成模型推理端点 |
| Python Worker     | 批准的离线模型预检、JSONL 与独立验证划分、持久化队列、训练子进程、资源/时长边界、事件与产物 | 不执行任意用户脚本，不自动恢复中断任务            |
| PEFT / 原生 MLX   | 真实 LoRA/量化 LoRA 参数更新、验证 loss、checkpoint、adapter 导出                           | 不保证训练后任务质量或通用能力不回退              |
| UI                | 操作入口、真实状态/错误/资源、完整历史分页、参数和流程提示                                  | 不伪造训练进度，不以“提交成功”代替训练或质量成功  |
| 独立推理运行时    | 加载兼容基座、tokenizer 和 adapter，提供推理服务                                            | 不由训练 Worker 自动部署或注册                    |

本版管理界面要求 **Worker 1.1 或更新版本**，使用目录分页与持久化 `storeId`。保留旧 `/jobs`、`/datasets` 数组接口用于兼容，它们仍只返回最近 100 条；完整浏览应使用 `/jobs/page`、`/datasets/page`，响应为 `items`、`total`、`offset`、`limit`，单页 1–200 条。分页不绕过任务和数据集保留上限。

NCF 管理 API 的上传、提交和取消请求将 `workerAlias` 放在 **query**，JSON body 仅包含相应请求 DTO 的字段；不要把 Worker 密钥或端点交给浏览器。服务方法将 body DTO 放在第一个参数位置，以兼容动态 API 生成器的绑定规则。Worker 自身的私有 API 与这层 NCF API 是不同的接口。

例如，已登录且有权限的 NCF 管理客户端提交任务：

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

模型、数据集 ID 和序列上限需替换为所选 Worker 的真实值。保存 Worker 配置返回的是 **Worker DTO**，不是训练任务 DTO；成功保存后核对列表中的配置及连接状态。禁用配置仅阻断接入，不会终止已有训练。

## 1. 微调改变什么

### SFT、全量微调、LoRA 与 QLoRA

**监督微调（SFT）**通过输入/答案样本学习期望响应，例如对话或 prompt/completion 对。SFT 描述训练目标；全量微调、LoRA、QLoRA 描述更新参数的方式。

| 方法     | 更新什么                              | 代价与取舍                                                        | 本流程中的支持                                 |
| -------- | ------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| 全量微调 | 基座模型大部分或全部权重              | 优化器、梯度与 checkpoint 内存开销大；可能遗忘通用能力            | 仅解释概念，不提供此方法选项                   |
| LoRA     | 小规模低秩 adapter 矩阵，基座权重冻结 | 可训练参数和存储量较少，但仍需基座与激活内存                      | CPU/CUDA 上使用 PEFT；原生 MLX 以预检结果为准  |
| QLoRA    | 在量化且冻结的基座上训练 LoRA adapter | 减少基座权重内存，但不消除激活/优化器开销，也不保证模型能装入内存 | CUDA 量化训练，或受支持的原生 MLX 量化模型训练 |

普通 LoRA 的权重更新可近似表示为 `W' = W + (alpha / rank) * B * A`：

- **Rank（`r`，秩）**决定 adapter 的低秩维度。提高 rank 可能增加容量和内存，但不必然提高准确率。
- **Alpha**控制更新缩放；固定 alpha 改变 rank 也会改变缩放。不能假定 MLX 的原生缩放约定与 PEFT 完全一致。
- **Dropout**是训练时 adapter 的正则化手段。太低可能过拟合，太高可能欠拟合；不是随机删除数据集行。
- **Target modules**指定哪些兼容线性层接入 adapter。默认 `all-linear` 属于 PEFT 路径；MLX 有自己的受支持层选择方式。不要直接跨模型架构或后端复制模块名。

CUDA QLoRA 与 MLX 量化 LoRA 是不同实现。Apple Silicon worker 不使用 CUDA/bitsandbytes，也不能通过 Linux 容器获得 Metal。

### 微调不是 RAG

微调适合调整表达风格、结构化输出、任务行为和领域措辞。它不是可靠的实时数据库、引用系统、文档权限边界，也不保证记住所有事实。

需要最新、有出处、带访问控制的知识时，**继续使用 KnowledgeBase/RAG**：召回相关片段、作为上下文交给模型，再生成回答。微调后的模型可以使用这些上下文，但训练不能替代检索、Embedding、向量存储或源文档授权。参见 [AI + Prompt + Agent + KnowledgeBase 闭环](../home/capability-guide.md#_4-2-场景-b-搭建-ai-prompt-agent-knowledgebase-闭环)。

## 2. 数据、评估与治理

### 支持的数据格式

使用 UTF-8 **JSONL**，每行一个 JSON 对象；每次上传 **2–10,000 条有效记录**，**最多 2 MiB（2,097,152 字节）**。不支持空行、JSON 数组、CSV、任意文件或 Python 程序。每行仅包含对话 `messages` 或仅包含 `prompt`/`completion`，不要混合两种格式或添加额外字段。

`prompt`、`completion` 和每条消息的 `content` 必须是非空文本，最多 65,536 字符且不含 NUL。`messages` 含 2–128 个仅包含 `role`/`content` 的对象：首条可选 `system`，随后 `user`/`assistant` 交替，以 `assistant` 结束；不接受 `tool` 消息。浏览器提供带行号的结构校验；Worker 仍是最终校验依据，包括重复 JSON 字段和训练/验证重叠检查。

对话示例（两行）：

```jsonl
{"messages":[{"role":"user","content":"Return the status of ticket A as JSON."},{"role":"assistant","content":"{\"ticket\":\"A\",\"status\":\"open\"}"}]}
{"messages":[{"role":"user","content":"Return the status of ticket B as JSON."},{"role":"assistant","content":"{\"ticket\":\"B\",\"status\":\"closed\"}"}]}
```

Prompt/completion 示例（两行）：

```jsonl
{"prompt":"Classify: I cannot sign in.","completion":"account_access"}
{"prompt":"Classify: Please send my invoice.","completion":"billing"}
```

两行只是校验最低要求，不代表训练数据足够或评估有效。正式训练前检查基座 tokenizer/chat template、答案格式、长度分布和截断行为。过小的最大序列长度可能把要学习的答案截掉。

返回的 SHA-256 对应规范化后保存的 JSONL，不一定等于原文件字节的 hash。规范化不会额外追加末行换行，因此恰好 2 MiB 且合法的数据上传后仍可读取。

### 分开训练集、验证集和最终测试集

1. **先**去重并按来源、用户、文档或时间划分数据，再生成样本。不同集合中的近似重复对话也会造成评估污染。
2. 将训练集与独立验证集分别上传。UI 不允许选择训练数据集本身作为验证集，但 ID 不同不代表内容没有泄漏。
3. 用验证 loss 比较训练方案，另保留未参与调参的最终测试集。不能把测试答案放入训练集，也不要不断针对最终测试集调参。
4. 用相同的独立任务、Prompt 模板、解码配置和 RAG 上下文比较基座与微调模型。检查任务准确率、JSON/schema 合规、拒答行为、隐私泄漏和通用能力回退，不只看 loss。

不选择验证集时，Worker 按 seed 自动留出约 20%、至少一条不同记录；少于两条不同记录或显式训练/验证记录重叠会拒绝。这能检测完全重复，不能识别语义近重复。**缺失 eval loss 应显示不可用，不是 0，也不是成功。** 不要仅因训练 loss 下降就发布 adapter。

训练目标为**所有非 padding token 的因果下一 token loss**，包含 prompt/user，不是只对 assistant 进行 mask 的 SFT。messages 必须使用批准 tokenizer 的 chat template，不静默降级为通用模板。两种后端使用 AdamW、线性预热/衰减与梯度裁剪，右截断会警告，仍需人工检查答案没有被截掉。

### 许可证与隐私

- 确认基座权重、tokenizer、数据集及预期用途的授权；分别检查训练、再分发、衍生/adapter、合并权重与商业使用限制。
- 上传前移除密钥及不必要的个人/客户信息，落实同意、用途限制、访问控制和保留期限。adapter 与 checkpoint 也可能记忆敏感样本。
- 数据集、日志、checkpoint、adapter 和备份均按敏感资产保护。离线减少网络暴露，不等于匿名化，也不能防止模型记忆数据。
- 记录模型 revision/hash、模型和数据许可证、数据集 hash、划分来源、超参数、后端/依赖版本、操作者及评估结果。

## 3. 部署与鉴权

### NCF 配置

微调采用混合配置模型。在 **AIKernel → 本地模型微调** 中创建和管理每个 Worker 配置（别名、私有端点、请求超时、启用状态和运维备注）。配置文件存储在 AIKernel 数据库中；每个任务、数据集、事件流和产物始终绑定到所选 Worker。

全局硬开关、端点白名单和每个 Worker 的密钥必须保留在数据库外。基础设施配置节为 `SenparcXncfAIKernel:FineTuning`：

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

提交到代码仓库的 key 保持为空，通过环境变量或密钥管理器提供；别名必须与数据库 Worker 配置匹配。worker 使用 `NCF_WORKER_KEY`；NCF 在 **`X-NCF-Worker-Key`** 请求头中发送匹配密钥。每个 Worker 都应使用至少 32 字符的独立随机 key，不要复用模型提供商 API key。

```bash
# 先安全地向每个匹配的 Worker 服务提供独立密钥。
export SenparcXncfAIKernel__FineTuning__WorkerApiKeys__cpu_lab="$NCF_CPU_WORKER_KEY"
export SenparcXncfAIKernel__FineTuning__WorkerApiKeys__cuda_prod="$NCF_CUDA_WORKER_KEY"
export SenparcXncfAIKernel__FineTuning__Enabled=true
```

环境变量设置在 NCF Host，不在浏览器。全局 `Enabled` 与 `AllowedHosts` 是强制安全门；已启用的数据库配置不能绕过它们。每个配置的请求超时（1–300 秒）在 UI 中设置；它是 HTTP 超时，**不是**训练时长上限。训练独立于 HTTP 请求和浏览器标签页持续运行。

`Enabled=false` 阻断 NCF 对 Worker 的接入，并不会远程终止已运行的训练子进程；需要终止任务时，使用取消接口或按运维流程停止 Worker。不要把管理接入开关当作 GPU 进程的强杀开关。

这些变量需在 NCF 启动前设置，修改后重启 NCF，再点击 **刷新 / 重连**。示例使用下划线别名，便于 shell `export`；如果使用带连字符的别名，请通过支持该变量名的服务环境配置或密钥提供程序设置，而不要照搬非法的 shell 赋值。

首次连接可在 UI 添加：别名 `cpu_lab`、名称 `CPU 实验室`、端点 `http://127.0.0.1:8091`、超时 `180` 秒、启用。端点主机须在 `AllowedHosts` 中，密钥别名须一致。仅存在空 key 配置不会显示为“已配置密钥”。旧单 Worker 的 `WorkerEndpoint`/`WorkerApiKey` 不用于这些数据库配置。

已有安装需先通过模块管理升级 AIKernel，应用新增 Worker 表的数据库迁移。本次源码集成版本为 **0.16.4**，不代表已发布到 NuGet；部署时使用包含该实现的源码构建包，并与 Worker 版本配套。

### 多 Worker 与 SandBox

当需要同时使用 CPU 验证、NVIDIA CUDA 生产训练、Apple Silicon MLX 训练，或将安全域/容量池分开时，多个 Worker 是合理的。它们不是无状态的负载均衡池：每个 Worker 都拥有自己的 SQLite 任务存储和本地产物。上传数据集前先选择 Worker；不要假定一个 Worker 的数据集或任务 ID 在另一个 Worker 上存在。

每个 Worker 使用一条数据库配置和一个密钥别名。只能路由到 `AllowedHosts` 中已批准的私有端点；不得使用公共 URL、任意管理员输入的主机或跨环境复用密钥。SandBox 仍适合短时执行的隔离边界，但长时间训练应使用专用 Worker 部署及其强制运行时限制。无论 NCF 数据库如何配置，Worker 都会独立强制执行网络、磁盘、队列、时长、CPU/GPU 和容器限制。

只有 NCF 能访问相同宿主/网络命名空间中的 worker 时才能使用 loopback。Compose 中应使用 worker 服务 DNS 名与端口；分离部署时使用私网鉴权端点，并按需启用 TLS。不要将 worker API 直接暴露到公网，也不要把共享 key 放入 URL、截图、日志或前端配置。

NCF 微调页面和 AppService 要求 **NCF Admin 授权**。worker 共享 key 是服务身份认证，不是最终用户授权。目前数据集、任务、事件和产物均属于**全局运维资源**，尚未实现租户级归属/隔离。不能将其当作多租户自助训练服务开放。

### 只允许经批准的本地模型

通过独立且经过审核的获取流程准备权重与 tokenizer 文件，然后仅将批准的本地目录登记到 worker allowlist。操作者选择白名单模型 ID；任务不能接收任意 Hugging Face ID、URL、文件路径、脚本或下载请求。

训练离线加载本地文件，**`trust_remote_code=false`**。选择当前后端无需仓库自定义代码即可支持的架构，不要为加载未审核模型而放宽这些限制。检查模型序列化格式、来源、文件 hash、许可证、tokenizer/chat template 与依赖版本；在支持时优先安全权重格式。离线不代表恶意权重或原生依赖安全。

### 后端与隔离矩阵

| 后端   | 运行位置                                                               | 支持训练                                   | 部署边界                               |
| ------ | ---------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| `cpu`  | 原生 Python 或 Linux 容器，包括 Mac 上的 Docker Desktop                | PEFT LoRA                                  | 适合极小冒烟测试；大模型可能非常慢     |
| `cuda` | Linux、NVIDIA GPU、兼容驱动/runtime；容器还需 NVIDIA Container Toolkit | 能力预检通过时支持 PEFT LoRA 与 CUDA QLoRA | 仅授予所需 GPU 设备，不使用特权容器    |
| `mlx`  | **Apple Silicon 原生 macOS**及受支持 Python/MLX 栈                     | worker 声明支持时可用 MLX LoRA 与量化 LoRA | 使用受限 OS 用户运行；**不是容器隔离** |

Docker Desktop 的 Linux VM 无法访问 Apple Metal 来训练 MLX。Mac 上可使用 CPU Docker，或者原生运行 MLX worker。不要假定 Intel Mac 支持 MLX，也不要把 NVIDIA Docker 命令套用到 Apple GPU。

现有 Sandbox PythonExec/Jupyter 面向短时执行，没有训练 GPU API 和持久化长训练生命周期。**不要用任意 Sandbox exec 启动训练。** 专用伴随镜像执行固定用途工作负载，采用类似隔离原则：

- NCF 与训练进程分离，仅在内部网络提供经过鉴权的训练 API。
- 非 root 用户、只读根文件系统和模型挂载、可写持久化任务卷、有上限的临时存储。
- drop capabilities、no-new-privileges，不挂 Docker socket、不使用宽泛宿主目录、特权模式或任意 shell/代码执行。
- 设置 CPU、内存、PID 上限，另外规划磁盘和时长预算；模型访问保持离线。
- GPU 设备与驱动扩大攻击面。**GPU 隔离不等于 CPU 安全沙箱**；仍需审查权重/依赖并隔离训练宿主。

原生 MLX 应尽可能使用 macOS 服务/OS 控制落实网络、文件、资源和密钥策略。受限账户不能被描述成 Linux 容器沙箱。

### 初始化 Worker 与容器镜像

模型权重应在独立受控下载机准备，而不是让离线 Worker 下载。审核许可证、选择支持的架构、固定批准的 revision 后，例如使用下载机的 Hugging Face CLI：`hf download APPROVED_ORG/MODEL --revision PINNED_COMMIT --local-dir ./approved-models/model-id --include '*.safetensors' '*.json' '*.model' '*.txt' '*.jinja' '*.tiktoken'`。替换占位符，验证文件 hash 与完整性，再转入只读模型根目录；不要复制符号链接缓存或 provider token，需要 remote/custom code 的模型仍不支持。

在 `NcfPackageSources/tools/AIKernelFineTuning` 目录执行。先将批准的离线 safetensors 模型准备到 `/absolute/path/to/approved-models/<model-id>`，包含 config、tokenizer、所有分片及索引。目录名就是 model ID；拒绝符号链接、pickle/bin 权重与 remote/custom code。镜像构建时安装依赖，训练任务不下载模型或依赖。

```bash
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_DIR="/absolute/path/to/approved-models"
docker compose --profile cpu up -d --build cpu gateway
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" http://127.0.0.1:8091/health
```

NVIDIA Linux 宿主安装兼容 CUDA 12.8 的驱动及 NVIDIA Container Toolkit 后，改用 `docker compose --profile cuda up -d --build cuda gateway`。**不能同时开启两种 profile**，CPU 与 CUDA 分别持久化到独立数据卷。

固定 API 入口容器发布 loopback 8091，加入入口/内部网络；训练 Worker 只加入**无外网出口的内部网络**。这解决了 Docker Desktop 内部网络容器直接映射端口不可达的问题，同时不把外网路由交给训练。入口仅转发固定 Worker API、流式下载，不挂 Docker socket。NCF 若运行在容器中，可把管理服务加入入口网络，配置 `http://gateway:8080`；其自身 loopback 不是宿主 loopback。

原生 Apple Silicon 初始化：

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-mlx.txt
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_ROOT="/absolute/path/to/approved-models"
export NCF_DATA_ROOT="/absolute/path/to/private-training-data"
.venv/bin/python -m worker
```

原生 Worker 默认监听 **127.0.0.1:8091**，以受限服务账户运行，不使用 root。将该端点添加为数据库 Worker 配置，并提供对应的 `SenparcXncfAIKernel__FineTuning__WorkerApiKeys__<别名>` 密钥；大模型预检超过默认 30 秒时，将该配置的超时设置为 180。生产应构建/扫描批准镜像、锁定传递依赖并部署不可变 digest；当前依赖范围并非完整的可复现锁文件。

### 运维预算

Worker 限制 `NCF_QUEUE_LIMIT`（默认 8）、`NCF_MAX_DURATION_MINUTES`（1440）、`NCF_MAX_JOB_BYTES`（20 GiB）、`NCF_MIN_FREE_BYTES`（1 GiB）、`NCF_EVENT_LIMIT`（每任务 10000）、`NCF_MAX_DATASETS`/`NCF_MAX_JOBS`（各 1000）。覆盖值需在 Compose 或原生服务中明确传入；请求时长不能超过运维上限。上传、提交、训练采样及归档前检查磁盘，UI 展示可用空间/输出大小，达到输出预算 80% 警告，超限显式终止。**定期检查不能替代文件系统硬配额**。

`NCF_TELEMETRY_SECONDS` 默认 2，`NCF_CANCEL_GRACE_SECONDS` 默认 30，`NCF_PREFLIGHT_SECONDS` 默认 120，`NCF_TORCH_THREADS` 默认 2。CPU/内存/PID 由容器/宿主控制；归档需额外空间，失败时原始已完成 checkpoint 仍留在磁盘。到达存储接收上限时，停止 Worker 后备份/归档并切换存储；不提供在线删除或自动发布。

## 4. 平台操作手册：DGX Spark 与 MacBook M2

下面的步骤是“先验证 Worker，再操作网页”的推荐顺序。两台机器可以各注册为一个独立 Worker，但不能共享数据集 ID、任务 ID 或 `/data` 目录。本文当前环境已验证 CPU 和 Apple Metal 流程；没有 DGX Spark 实机，因此 DGX Spark 的 CUDA、驱动、ARM64 镜像和显存表现必须在现场完成预检。

### 4.1 NVIDIA DGX Spark：CUDA Worker

DGX Spark 是 NVIDIA GPU 平台，优先使用 `cuda` 后端；不要使用 Mac 的 `mlx` 配置，也不要把 CUDA QLoRA 的 bitsandbytes/NF4 参数复制到 MLX Worker。开始前由管理员确认：

```bash
uname -m
nvidia-smi
docker version
docker compose version
```

还要确认 NVIDIA Container Toolkit 已安装，并验证容器能看见 GPU：

```bash
docker run --rm --gpus all \
  nvidia/cuda:12.8.1-runtime-ubuntu24.04 nvidia-smi
```

上面的镜像和 CUDA 版本只是本仓库 CUDA Dockerfile 的兼容性基线，不是对每台 DGX Spark 固件、驱动或系统镜像的保证。DGX Spark 通常涉及 ARM64 主机；如果 `uname -m` 返回 `aarch64`，必须确认基础镜像、PyTorch CUDA wheel、bitsandbytes 以及全部传递依赖都有原生 ARM64 构建。**不要用 QEMU 模拟通过生产验收**；若仓库当前 Dockerfile 或依赖不能原生构建，应由管理员制作并扫描兼容的 ARM64 镜像，或在 DGX Spark 上使用经过批准的原生 Python 环境，再将相同 Worker API 接入 NCF。

在 Worker 目录执行以下模板命令。路径、密钥和资源上限必须替换为现场值，密钥不要写入仓库：

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

首次只放一个很小、已批准的本地模型，先在页面创建 1–10 步的 `cuda + lora` 冒烟任务。能力预检通过后，再逐步增加序列长度、有效 batch 和步数。若显存不足，按以下顺序回退：减小 `maxSequenceLength`、`batchSize` 和 `loraRank`，再考虑 `gradientAccumulationSteps`；不要直接删除 Worker 的内存/磁盘/PID 限制。需要 QLoRA 时，确认模型是 Worker 支持的量化格式，并在能力预检中看到 `qlora`，不要只看网页是否显示该选项。

如果 NCF 运行在 DGX Spark 之外，不能填写 `127.0.0.1`；应使用仅对 NCF 可达的私网地址或 TLS 反向代理，例如 `https://fine-tuning-worker.internal:8091`。`AllowedHosts` 必须允许该主机，NCF 中的 API key 配置键必须与 Worker 别名完全一致。Worker API 不得暴露公网。

### 4.2 MacBook M2：原生 MLX Worker

MacBook M2 使用原生 macOS Worker 才能访问 Metal；Docker Desktop 的 Linux VM 不能把 Apple Metal GPU 提供给 MLX。建议使用专用 macOS 服务账户、单独的模型目录和数据目录：

```bash
cd NcfPackageSources/tools/AIKernelFineTuning
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-mlx.txt
export NCF_WORKER_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export NCF_MODELS_ROOT="$HOME/aikernel/approved-models"
export NCF_DATA_ROOT="$HOME/aikernel/private-training-data"
.venv/bin/python -m worker
```

另开终端检查 Worker：

```bash
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/health
curl --fail -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/capabilities
```

在同一台 Mac 上，NCF Worker 端点填 `http://127.0.0.1:8091`。如果 NCF 在另一台机器，不能直接把 Worker 监听到公网；应使用受限内网/TLS 代理，并显式设置 `NCF_BIND_HOST`、防火墙和访问控制。M2 的统一内存同时被 macOS、模型权重、激活和优化器使用；正式训练前先以短序列、`batchSize=1`、小 `loraRank` 冒烟，再观察系统内存和 Worker 资源事件。

未量化模型选择 `mlx + lora`；只有能力预检报告支持时才选择 `mlx + qlora`。MLX QLoRA 是原生 MLX 量化流程，不等同于 CUDA bitsandbytes；训练导出的 adapter 需要按 manifest 的量化配置重建基座后才能加载。

### 4.3 在网页中完成一次训练

无论使用哪台机器，都按下面顺序操作：

1. 启动并检查 Worker 的 `/health`、`/capabilities`，确认模型目录和后端均可用。
2. 在 NCF Admin 打开 **AIKernel → 本地微调**，点击 **添加 Worker**。填写唯一别名、显示名称、绝对 HTTP(S) 端点、超时（首次预检可设 180 秒）并启用；保存后确认状态为可用。API key 通过 NCF 服务端配置注入，不在浏览器表单或 URL 中填写。
3. 选择刚添加的 Worker，等待模型、后端能力、数据集和任务历史加载完成。不要在上传、创建或取消请求期间切换 Worker。
4. 在 **数据集** 中上传 UTF-8 JSONL。训练集和验证集分别上传并命名；优先使用独立验证集。核对记录数、SHA-256 和校验结果，失败时按行号修正，不要用 CSV 或 JSON 数组替代。
5. 点击 **新建任务**，选择模型、训练集、可选验证集、后端和方法。第一次使用选短步数 `lora`；只有预检明确支持且内存预算足够时才选 `qlora`。确认 `maxSequenceLength` 不会截断答案。
6. 提交后在任务详情查看真实状态、已完成 steps、训练/验证 loss、资源、事件日志和产物。浏览器关闭不会停止任务；刷新页面后从持久化 Worker 历史恢复。
7. 取消只能停止任务，不是暂停或恢复。取消后等待终态，再下载 `training-export.zip`，同时保存 `manifest.json`、`metrics.jsonl` 和基座/数据 hash。
8. 在独立推理运行时加载“相同基座 + adapter + tokenizer”进行回归测试，比较未微调基线和微调结果。确认格式、拒答边界、事实性和 RAG 行为后，才在 AIModel/推理服务中单独部署；训练 Worker 不会自动发布模型。

## 5. UI 操作流程

1. 安装/启用 AIKernel，独立部署并配置伴随 worker。在 NCF Admin 打开 **AIKernel → 本地微调**。
2. 检查 worker 连接/版本、运行/排队数量及后端能力原因。先处理依赖、硬件或模型缺失，再提交任务。
3. 命名并上传 JSONL 训练集，核对返回的记录数和 SHA-256；独立上传验证集。
4. 新建命名任务，选择批准的模型、训练集、可选验证集、兼容后端及 `lora`/`qlora`。
5. 先运行小规模、有明确边界的冒烟测试。检查高级参数；默认短步数不是生产训练方案。
6. 在任务列表选择任务，查看真实步数/loss 曲线、资源卡片、带时间戳日志、状态、错误详情和产物元数据。
7. 刷新或重新打开所选任务，恢复持久化历史。连接断开时视图是过期状态，不能推断 worker 已停止或完成。
8. 必要时取消。取消是停止请求，**不是暂停/恢复**。保留已成功写出的 checkpoint 用于诊断；文件存在不代表支持自动恢复。
9. 先在独立任务上评估 adapter，再部署/注册推理模型。

### 页内教程、样例和首次任务

页面默认展开 **从这里开始：微调操作教程**，按“准备 Worker → 独立数据集 → 有边界训练 → 监控恢复 → 评估发布”解释流程，同时提供完整中英文教程入口。**训练服务配置与故障排查** 展示当前混合配置字段；**常见问题与处理提示** 解释连接、数据、内存和中断错误。

尚未添加配置或没有启用且密钥有效的 Worker 时，页面显示 **尚未配置可用 Worker** 及配置步骤，而不是连接故障。上传和训练按钮仍不可用；点击 **添加 Worker** 或编辑已有配置完成准备。实际 API 请求失败、鉴权失败或 Worker 无法连接仍会明确显示错误。

如果页面直接显示 `AIKernel.FineTuning.*`，这是模块本地化脚本未加载，不代表这些文字是参数名。升级包含修复的 AIKernel 源码/模块后，重新构建并重启实际 NCF 宿主，再刷新页面；模块使用专属 `_AIKernelLocalizationScripts`，避免与宿主 Admin 的同名 partial 冲突。不要通过修改浏览器字典或替换训练字段来绕过问题。

在 **数据集 → 数据样例与下载** 切换 `prompt / completion` 或 `messages`，查看并下载四行 JSONL。下载不会自动上传或提交任务；四条记录只证明格式，不代表数据充分或模型质量。没有 chat template 的模型使用 `prompt/completion`，不要把示例训练结果当作发布依据。

首次冒烟测试可使用以下操作：

1. 选择已配置的 Worker，确认 CPU/CUDA/MLX 中所需后端可用，并已准备批准的模型。
2. 下载并上传适合 tokenizer 的样例，核对记录数 `4` 和 SHA-256；生产数据需另行清洗、划分。
3. 输入任务名称，选择模型与训练集；验证集可空，Worker 将自动独立留出至少一条不同记录。
4. 选择兼容后端及 `lora`，保留 `maxSteps=10`、`batchSize=1`、`gradientAccumulationSteps=1`。`maxSequenceLength` 默认 256，但不能超过模型上下文限制；测试用 `tiny-gpt2` 可设为 32。这是有边界的流程验证，不保证模型能装入内存。
5. 展开 **高级参数** 阅读问号提示；表单展示单设备近似有效 batch。正数 `maxSteps` 覆盖 `epochs`；即使默认 `evalSteps=20`，最后一步仍执行验证。
6. 提交后选择任务，核对真实终态、step、训练/验证 loss、日志和实际产物。`Succeeded` 不是质量验收通过。

上传、提交、取消和读取文件期间禁止切换 Worker。普通切换会重置 Worker 专属的模型、训练/验证数据集、任务详情、曲线和事件 cursor；旧请求不会覆盖新 Worker 的视图。HTTP 请求使用所选数据库配置的超时，另留少量浏览器传输余量。修改当前 Worker 配置后会重新读取其目录及状态。

任务列表按后端总数分页，每页 10 条，不再把最近 100 条当作全部历史。数据集初次读取 100 条，使用 **加载更早的数据集** 继续浏览；刷新时仍会从后端核对已选的历史训练/验证集。其他运维人员并发提交会改变排序，刷新可从最新目录重新浏览，分页不是冻结的事务快照。

Worker 的 `storeId` 保存在 SQLite 中，正常重启不变；更换或重建存储会产生新身份。UI 检测到变化后清空旧任务、数据集和 cursor，并提示重新选择，避免把原存储的 ID 用于新存储。Worker 正在停止、不健康或缺少本版必需的协议能力时不能提交新任务。

### 常见问答

- **微调后为何模型列表没有新模型？** 导出的是 adapter，不是推理服务。先评估、部署兼容运行时，再在模型管理中注册实际推理端点与模型名。
- **能把 Worker 地址填到模型 Endpoint 吗？** 不能。训练 API 和推理 API 是不同服务，鉴权也应分开。
- **为什么提交超时后不能直接再提交？** 响应丢失不代表创建失败。先刷新原 Worker 的持久化任务列表，避免重复任务。
- **验证 loss 为空等于 0 吗？** 不等于，表示尚未产生或指标不可用；应检查日志、任务状态及最终验证。
- **训练 loss 越低越好吗？** 不一定。若验证 loss 上升，可能过拟合；仍需独立测试任务、格式合规和 RAG 行为比较。
- **可以暂停、断点续训或在线删除吗？** 当前没有这些接口。取消会停止任务，重启中的活跃任务标记为 `Interrupted`；保留 checkpoint 不等于已实现 resume。

### 训练控制项与含义

任务契约提供以下控制项；后端可以拒绝无法准确实现的组合。共用表单不代表各后端语义完全一致。

| 控制项                                                  | 含义与操作建议                                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `epochs`、`maxSteps`                                    | epoch 是遍历训练集的次数；正数 step 上限限制优化器更新次数。不要无限训练，也不要把重复遍历当作新增样本。     |
| `learningRate`                                          | 更新幅度。过高可能不稳定/遗忘，过低可能学不到目标；以独立评估调参，不照搬配方。                              |
| `batchSize`、`gradientAccumulationSteps`                | microbatch 与每次更新累计的 microbatch 数。单设备有效 batch 约为两者乘积；累积降低激活内存需求，但增加耗时。 |
| `maxSequenceLength`                                     | token 序列上限。长序列增加内存和计算，截断可能丢失重要监督信号。                                             |
| `loraRank`、`loraAlpha`、`loraDropout`、`targetModules` | adapter 容量、缩放、正则化和层选择；必须符合模型架构/后端。                                                  |
| `warmupRatio`、`weightDecay`                            | 学习率预热比例与优化器正则化。预热缓和初期更新；具体后端支持需核对。                                         |
| `loggingSteps`、`saveSteps`、`evalSteps`                | 按优化器步数设置日志、checkpoint 和验证间隔。频繁保存/评估消耗磁盘和时间；评估需要独立验证集。               |
| `seed`                                                  | 可复现输入，不保证不同硬件/依赖版本下结果完全一致。                                                          |
| `maxDurationMinutes`                                    | 任务 wall-time 预算，与 NCF HTTP 超时及宿主 CPU/内存限制分开。超时会请求 Worker 在安全边界保存 checkpoint，然后终止任务。 |

**优化器**维护更新状态，即便使用 adapter 也可能占用较多内存。NCF 任务契约没有优化器选择器，不要编造 `optimizer` 请求字段；使用后端实际实现的优化器。优化器/调度器及后端限制以 worker 版本为准。

训练 loss 衡量对训练样本的拟合，验证 loss 衡量相同 tokenization/loss 约定下对独立样本的拟合。训练 loss 下降但验证 loss 上升可能是**过拟合**：减少遍历次数/容量、提高数据多样性或加强正则化，再比较结果。不同模板、token mask、序列上限、数据集的 loss 不一定可直接比较。checkpoint 是恢复/评估资产，不是质量合格证明。

## 6. 持久化任务与真实可观测性

worker 使用**有长度上限的持久化 SQLite 队列，同时只运行一个训练任务**。不能通过多个 worker 共用任务存储来扩容高资源训练。

- 轮询任务快照和带单调 cursor 的事件分页（`after`、`nextCursor`、`hasMore`），继续读取直到追上最新事件。持久化事件让 UI 刷新后恢复历史，而不是伪造新时间线。
- 进度必须来自真实 `step` 与 `totalSteps`，不能按耗时、排队位置或动画估计。
- 训练/验证 loss 与 LR 来自后端回调；资源指标包含进程 CPU/RSS 及**可获得时**的 GPU 内存/利用率/温度。传感器或指标缺失应明确不可用，不填 0。
- RSS 是进程驻留内存，不是全机内存，也不是完整 GPU/统一内存预算。CPU 百分比、GPU 指标受采样与设备范围影响，不能当作租户独立计费依据。
- worker 重启后，运行中的中断任务标记为 **`Interrupted`**，不能静默成功或自动恢复。先检查错误/事件与保留的 checkpoint，再创建新的有边界任务，除非该版本明确实现 resume。
- 取消、时长或资源终止可能来不及写最终 adapter。显示真实终态，只列出实际存在的产物。

本流程不承诺集成 Prometheus 部署。生产环境应外接监控/告警，覆盖 worker 健康、队列深度、事件停滞、CPU/RSS、GPU 可用性/利用率、OOM、超时、磁盘容量和备份新鲜度。不要把原始 Prompt、数据集或密钥放入监控标签。

## 7. 产物、推理注册与恢复

### Adapter 不是独立模型

LoRA/QLoRA **adapter**通常需要完全兼容的基座 revision、tokenizer 和能够加载该 adapter 的推理运行时。**合并模型**将更新合入权重，存储、兼容性、量化和许可证要求不同；不能假定量化 adapter 可以直接通用合并。

训练 UI 经管理员 Razor handler 流式下载，不暴露 Worker key，也不在 Web 内存缓冲大归档。下载包含 `training-export.zip`、`manifest.json`、`metrics.jsonl`，归档包括 adapter/tokenizer 及最后两个已完成 checkpoint、诊断用优化器/RNG 状态。Manifest 记录基座 safetensors/数据 hash、参数、依赖版本、验证切分及 loss 约定。事件保留上限裁剪历史时返回 `truncated` 并在 UI 明确提示，浏览器最多显示 1000 个日志/曲线点。不会自动提供推理、合并、部署或注册模型。

MLX 从未量化基座执行 QLoRA 时，使用 4-bit affine/group size 64；加载 adapter 前需按导出的量化配置重建基座，导出不包括完整基座权重。CUDA NF4 与 MLX affine 量化不能直接互换。

1. 在未参与调参的测试集及典型 RAG 任务上评估。
2. 选择支持准确 adapter 格式的推理运行时；或在 UI 外执行明确支持的离线合并/导出。
3. 独立部署推理服务，设置自己的鉴权与资源边界。
4. 在 AIKernel 现有模型管理中注册**推理 provider 端点、实际服务模型名与推理凭据**，不是训练 worker 端点或 worker key。
5. 验证 Chat、PromptRange/AgentsManager、schema 行为与 KnowledgeBase 检索；保留旧推理模型用于回滚。

### 错误与恢复

| 现象                        | 处理                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| 未启用/鉴权失败             | 核对 `Enabled`、私网端点和一致的 key（至少 32 字符）；不要绕过 Admin 授权。                   |
| 后端/方法不可用             | 读取预检原因，核对 OS/硬件/依赖与模型后端 allowlist。MLX 要求原生 Apple Silicon。             |
| 数据集被拒绝                | 检查 UTF-8 JSONL、受支持行结构、至少两行、2 MiB 上限；修复数据而不是压制校验。                |
| 模型加载失败                | 核对经批准的本地文件、架构/tokenizer 支持、离线准备与 hash；不要启用 remote code 或任意下载。 |
| OOM / loss 不稳定或非有限值 | 查看错误和资源，降低 batch/序列/rank 或使用受支持量化后端，再新建有边界任务。                 |
| HTTP 超时/UI 过期           | 先检查 worker 健康和持久化任务状态再重交；响应丢失不代表创建失败。                            |
| 已取消/中断/失败            | 检查事件与实际文件，保留有用 checkpoint；不支持自动 resume，也不能伪装成功。                  |
| 队列已满/存储锁冲突         | 等待或取消排队任务；每份存储仅一个 worker。不要移除活跃锁或启动第二个 writer。                |
| 磁盘满/缺少最终产物         | 停止接收任务，检查保留策略/容量和错误，先备份再定向清理。                                     |

### 生产检查表

- Web 管理、训练、推理分离部署。仅授权可信的全局运维人员；尚未实现租户隔离。
- 限制队列长度、活跃任务、时长、容器/宿主资源和存储。单任务并发不等于磁盘或成本预算。
- 保留数据集上传、任务创建/取消、NCF 操作者身份、worker 生命周期及评估/发布决策的审计。worker 共享 key 本身不能区分用户。
- 定义数据集、事件、checkpoint、adapter 和备份保留策略；核对 worker 实际清理能力，不假定存在删除按钮、自动清理或 TTL。
- 使用一致的 SQLite backup 或停止 worker 后的快照，**共同备份 SQLite 与任务/数据/产物卷**。只复制活跃数据库主文件可能遗漏 WAL 状态；只复制 adapter 会丢失队列/来源。
- 用独立存储、单个 worker 和兼容依赖/模型演练恢复。包括网络存储在内，不允许两个 worker 共用可写存储。
- 同步轮换两端共享 key、保护备份并外接监控。预检和真实冒烟测试成功前保持功能关闭。

## 8. MacBook Apple Silicon 手把手验收

下面是一条适合初学者的 macOS 原生 MLX 路径。它不会使用 Docker，也不会把 Apple Metal 暴露给 Linux 容器。

### 8.1 准备 Worker 和模型目录

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

另开一个终端，用相同的密钥检查服务：

```bash
curl --fail \
  -H "X-NCF-Worker-Key: $NCF_WORKER_KEY" \
  http://127.0.0.1:8091/health
```

如果 `python` 在新终端中不存在，先激活 `.venv`；查看 JSON 不需要 MLX 时也可以使用 `python3`。Worker 的 `NCF_MODELS_ROOT` 必须是已经存在的目录，即使模型尚未复制完成也要先 `mkdir -p`。

在 NCF 启动终端中配置同一个密钥。页面中的 Worker Alias 假设为 `mlx_lab`：

```bash
export SenparcXncfAIKernel__FineTuning__Enabled=true
export SenparcXncfAIKernel__FineTuning__AllowedHosts__0=127.0.0.1
export SenparcXncfAIKernel__FineTuning__WorkerApiKeys__mlx_lab="$NCF_WORKER_KEY"
```

修改环境变量后必须重启 NCF；Worker 端点填 `http://127.0.0.1:8091`。页面显示“缺少密钥”时，优先检查 Alias 是否完全匹配、NCF 是否在设置变量后重启，而不是重复生成 Worker 密钥。

### 8.2 准备原版模型

模型根目录下应有一个完整的模型目录，例如：

```text
$HOME/AIModels/Qwen2.5-0.5B-Instruct/
├── config.json
├── tokenizer_config.json
├── tokenizer.json
├── model.safetensors
└── 其他 tokenizer / 模型文件
```

模型下载属于供应链操作，应先审核许可证、固定 revision、验证 hash，再复制到 Worker 的只读模型根目录。macOS 的 Homebrew Python 受 PEP 668 保护时，不要向系统 Python 直接 `pip install`，使用独立下载环境：

```bash
python3 -m venv "$HOME/model-download-env"
source "$HOME/model-download-env/bin/activate"
python -m pip install modelscope
modelscope download \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --local_dir "$HOME/AIModels/Qwen2.5-0.5B-Instruct"
```

ModelScope、Hugging Face CLI 和镜像都可能受网络、许可证和版本影响；下载后的文件仍必须通过 Worker 预检。不要让训练任务在运行时自动联网下载模型，也不要把 provider token 放进模型目录。

### 8.3 从 10 步冒烟到 500 步训练

第一次使用默认的 10 步，确认 Worker、模型、数据集、Adapter 导出闭环；确认成功后再增加到 200 或 500 步。对于小红书风格这类任务，建议保留独立测试问题，不要只看训练 loss。

一次成功的 MLX QLoRA manifest 可能包含：

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

`succeeded` 只表示训练进程完成，不表示模型质量已经通过。必须同时检查 `baseModelSha256`、数据集 hash、`evalLoss`、实际完成步数和导出文件。

### 8.4 下载、检查并运行 Adapter

从页面下载 `training-export.zip`、`manifest.json` 和 `metrics.jsonl`，解压后检查：

```bash
mkdir -p "$HOME/AIKernelArtifacts/m2-lora/extracted"
unzip -o "$HOME/Downloads/training-export.zip" \
  -d "$HOME/AIKernelArtifacts/m2-lora/extracted"

python3 -m json.tool \
  "$HOME/AIKernelArtifacts/m2-lora/extracted/manifest.json"
find "$HOME/AIKernelArtifacts/m2-lora/extracted" -maxdepth 3 -type f
```

MLX 产物通常包含 `adapter/adapters.safetensors`、Adapter 配置和 tokenizer。使用训练时完全相同的基础模型：

```bash
export BASE_MODEL="$HOME/AIModels/Qwen2.5-0.5B-Instruct"
export ADAPTER_PATH="$HOME/AIKernelArtifacts/m2-lora/extracted/adapter"

shasum -a 256 "$BASE_MODEL/model.safetensors"
python -m mlx_lm.generate \
  --model "$BASE_MODEL" \
  --adapter-path "$ADAPTER_PATH" \
  --prompt "请用小红书风格介绍一款适合通勤的保温杯。" \
  --max-tokens 200
```

如果数据使用 `messages`，使用 tokenizer 的 chat template 生成 prompt；不要把 MLX QLoRA Adapter 直接交给 PyTorch PEFT、CUDA bitsandbytes 或 Ollama。Ollama 通常需要先将 Adapter 与相同基座 fuse，再转换成兼容的 GGUF；是否能转换取决于模型架构和工具版本。

### 8.5 超时任务与部分产物

如果页面显示 `Failed`，但仍然列出了 `manifest.json`、`metrics.jsonl` 或 `training-export.zip`，这通常表示 Worker 在超时或中断前已经完成了至少一个 checkpoint，并在子进程退出后归档了现有输出。它不是矛盾状态：

- `Failed` 表示本次任务没有完成请求的全部训练步数，不代表训练成功；
- `completedSteps` 只能说明最后一个已记录的训练步；
- 产物可以用于检查 manifest、指标和 Adapter 文件是否完整；
- 不能把这种产物直接注册或部署为完成训练的模型；
- 当前页面也不会对失败/中断任务开放自动验证。

本例在 500 步任务中完成了 360 步，且运行时间约 60 分钟，因此首先应将 `maxDurationMinutes` 调高到预计时长以上，并保留至少 10–20 分钟余量。例如本次速度约为 360 步 / 60 分钟，500 步理论上约需 84 分钟，下一次可以设置 120 分钟；实际时间仍会受评估频率、保存频率、首次模型加载和磁盘速度影响。不要仅因为训练 loss 或 eval loss 看起来较低就接受部分产物。

### 8.6 训练后的自动快速验证

训练 Worker 已验证 Adapter 导出和兼容重载。现在在成功任务详情中可以直接使用“训练后快速验证”，页面不会把任意推理命令当作安全脚本执行。可复现的验证至少需要固定：

1. 训练任务对应的基础模型目录；
2. `training-export.zip` 中的 Adapter 和 tokenizer；
3. manifest 中的 backend、method、量化配置和 base hash；
4. 有限数量的测试 prompt；
5. 最大 token 数、超时和输出大小；
6. 与训练 Worker 相同的离线依赖环境。

页面验证已实现为 Worker 内的受限任务：只接受已成功任务绑定的同一基础模型、导出 Adapter 和每行一个的测试提示，最多 8 条，输出上限为 16–256 tokens。Worker 在后台运行并持久化每条结果，页面会轮询显示进度、Prompt 和回复；它不接受 shell 命令、Python 文件、网络 URL、用户路径或用户指定的可执行程序。该功能首期仅支持原生 MLX 任务；CPU/CUDA 任务仍使用上面的手动验证方式。

### 8.6 模型下载自动化的边界

“输入模型名后自动下载”可以实现，但不应直接让浏览器传入任意仓库并由 Web 进程执行下载。安全实现应具备：

- NCF 管理员授权和审核状态；
- 只允许已配置的 provider（例如 ModelScope 或受控 Hugging Face endpoint）；
- 只允许批准的模型 ID、revision 和文件白名单；
- 用户可配置的模型根目录，允许使用 Worker 的 `NCF_MODELS_ROOT`，或显式批准的 `App_Data` 子目录；
- 临时下载目录、断点续传、磁盘空间检查、SHA-256/文件完整性检查；
- 下载完成后重新执行 Worker 预检；
- 不把 provider token 暴露给浏览器、日志或模型目录；
- 下载过程作为 Worker 后台任务，带进度、取消、错误和审计事件；
- 默认离线训练，下载任务完成后不保留外网访问能力。

在没有完成 provider 白名单、许可证确认、hash 验证和 App_Data 路径隔离前，不建议把通用 `modelscope download` 或 `huggingface-cli` 做成页面上的任意命令执行按钮。

## 9. 验收检查

发布前验证：Admin 授权与错误 key 拒绝；有效两行上传及非法/超大数据拒绝；批准的本地模型；真实短 LoRA 训练与真实 step/loss 事件；独立验证集评估；刷新恢复；取消与 checkpoint 行为；重启后的中断状态；单 worker 存储锁。仅验证当前宿主实际可用的后端。

2026-10-07 的功能检查实际运行了原生 CPU LoRA、原生 Apple Metal LoRA 与量化 LoRA：各完成 6 次优化器更新、独立验证、产物下载及运行/排队取消。进一步核对基座权重 hash、导出 B 矩阵确实更新、adapter 可在兼容运行时重载，并观察到推理 logits 相对基座改变。量化 MLX 重载使用导出的量化配置重建基座，不假定它与 CUDA NF4 通用。

另外实际执行了命名 Worker 的 .NET 客户端训练/显式独立验证/下载/取消集成测试（不再跳过），以及 Worker 配置的 SQLite 读写回合。回归覆盖超过 100 条的目录分页、正常重启保留存储身份、存储更换后的缓存隔离、初始化取消不会伪装成功、鉴权、数据边界和事件 cursor。还实际生成了 NCF 动态 API Controller，验证 body DTO 与 query 别名的绑定，并覆盖新增/编辑配置返回 Worker DTO 的完整前端操作，避免“后端保存成功却被 UI 报成失败”。

这些测试使用随机生成的小模型，**证明训练与导出/使用的基础设施闭环，不代表模型质量、大模型容量、正式容器部署或所有数据库提供者均已验收**。CUDA 仍需在 NVIDIA Linux 宿主验证，正式部署仍需执行本节及生产检查表。

在 Worker 目录执行：

```bash
python3 -m venv .venv-test
.venv-test/bin/python -m pip install -r requirements-test.txt
.venv-test/bin/python -m unittest discover -s tests -v
node --test tests/test_ui.cjs
```

真实 CPU 与 .NET 管理客户端闭环可在 Worker 目录运行：

```bash
python3 -m venv .venv-cpu-smoke
.venv-cpu-smoke/bin/python -m pip install -r requirements-cpu.txt
.venv-cpu-smoke/bin/python -m tests.run_native_smoke --backend cpu \
  --dotnet-project ../../src/Extensions/Senparc.Xncf.AIKernel.Tests/Senparc.Xncf.AIKernel.Tests.csproj
```

首次运行 .NET 项目应先按仓库常规流程恢复依赖。脚本生成随机权重，不下载模型或数据，启动临时鉴权 Worker，并在成功或失败后清理临时 Worker/模型/数据。输出中的 `adapterReloadVerified=true` 表示实际做过重载验证；只看到导出文件不够。

苹果原生可在独立环境安装 `requirements-mlx.txt` 及仅用于生成权重的 `torch==2.8.0` 后执行 `python -m tests.run_native_smoke --backend mlx`，验证 LoRA 与量化 LoRA 及各自导出的重载。已有独立测试 Worker 可运行 `python -m tests.smoke --backend cpu --model tiny-gpt2 --models-root /absolute/path/to/test-models`；省略本地基座路径时不会做重载验证，输出会明确为 false。

另见 [XNCF 扩展模块概览](../home/xncf-extension-modules.md)、[模块文档地图](./module-documentation-map.md)和 [Sandbox 环境指南](./sandbox-environment.md)。
