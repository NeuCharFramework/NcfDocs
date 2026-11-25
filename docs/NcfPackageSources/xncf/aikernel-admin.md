# AIKernel models, vectors and usage

<a id="help-ai-models"></a>

## AI model configurations

Select a provider and fill in the endpoint, model/deployment name, and required
credentials. A chat model and an embedding model serve different purposes;
select a compatible configuration for each consumer. Check connectivity and
provider requirements before troubleshooting prompts. Keep credentials private.

### First model setup

For a first installation, configure one model at a time:

1. Choose the provider that owns the credential and endpoint.
2. Use the provider's exact model or deployment name. A friendly alias is only for NCF's
   display and selection; it does not change the provider-side name.
3. Choose the model capability that matches the caller: chat models generate conversations,
   while embedding models create vectors for knowledge retrieval.
4. Enter the endpoint and API key only in the protected editor, save, and run the smallest
   available test.
5. Select the saved model in the consuming feature and verify one real request before
   adding more models.

An endpoint that can be opened in a browser is not proof that the API is compatible. Check
the provider path, authentication header, deployment name, API version, quota, and server
egress policy. When an edit dialog shows a masked API key, leaving it unchanged preserves
the stored key; replacing it requires entering the new value.

<a id="help-ai-vectors"></a>

## Vector storage configurations

Choose the storage backend and its connection settings, then reference it from
the knowledge base. An option in the dropdown does not prove that the external
database is installed or reachable. `Memory` / `VolatileInMemory` here mean an in-process vector backend,
not AdminChat long-term Memory. Leave its connection field empty; it is not durable production storage.
Changing the embedding model or vector configuration can require
rebuilding the knowledge index; back up required data before changes.

### Choosing a backend safely

Use an in-process backend only for development or a disposable test. For a persistent
knowledge base, choose a supported durable backend, verify its connection from the NCF host,
and keep the embedding model stable while importing documents. Changing the embedding model
can make old vectors incomparable with new vectors; plan a re-vectorization window instead
of mixing both models silently.

<a id="help-ai-tokens"></a>

## Token monitoring

Use the token monitor to inspect recorded model usage and its filters. Model
token counts are not the same as character counts, file sizes, or local text
extraction limits. Missing telemetry is not proof of no provider usage; reconcile
billing-sensitive decisions with provider records.

The monitor is an observation page, not a live provider billing console. First select the
model and a short prompt, run a small test, then compare the recorded calls, input tokens,
output tokens, total tokens, duration, and status. If the provider response succeeds but no
row appears, check the selected model, telemetry persistence, application logs, and the
provider record separately.

<a id="help-ai-dashboard"></a>

## AI dashboard

Use the dashboard as an overview of configured AI resources and recorded usage,
then open the corresponding model, vector, or token page for details. Confirm
the selected period and available data before interpreting totals.
