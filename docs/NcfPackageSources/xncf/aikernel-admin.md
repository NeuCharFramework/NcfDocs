# AIKernel models, vectors and usage

<a id="help-ai-models"></a>

## AI model configurations

Select a provider and fill in the endpoint, model/deployment name, and required
credentials. A chat model and an embedding model serve different purposes;
select a compatible configuration for each consumer. Check connectivity and
provider requirements before troubleshooting prompts. Keep credentials private.

<a id="help-ai-vectors"></a>

## Vector storage configurations

Choose the storage backend and its connection settings, then reference it from
the knowledge base. An option in the dropdown does not prove that the external
database is installed or reachable. `Memory` / `VolatileInMemory` here mean an in-process vector backend,
not AdminChat long-term Memory. Leave its connection field empty; it is not durable production storage.
Changing the embedding model or vector configuration can require
rebuilding the knowledge index; back up required data before changes.

<a id="help-ai-tokens"></a>

## Token monitoring

Use the token monitor to inspect recorded model usage and its filters. Model
token counts are not the same as character counts, file sizes, or local text
extraction limits. Missing telemetry is not proof of no provider usage; reconcile
billing-sensitive decisions with provider records.

<a id="help-ai-dashboard"></a>

## AI dashboard

Use the dashboard as an overview of configured AI resources and recorded usage,
then open the corresponding model, vector, or token page for details. Confirm
the selected period and available data before interpreting totals.
