# KnowledgeBase ingestion and recall tests

<a id="help-knowledge-base"></a>

## Knowledge bases and vectorization

1. Create a knowledge base and choose its embedding model and vector storage.
2. Associate the intended source material in its configuration.
3. Run **Vectorize**, inspect the result, and resolve failures before testing.
4. Run recall tests using realistic questions and inspect source text.

Editing source files or changing an embedding configuration does not by itself
prove the stored vectors are current. Rebuild as required. Keep source access
permissions and retention requirements in mind before sending content to an
external embedding provider.

<a id="help-knowledge-create"></a>

## Create a knowledge base

**New knowledge base** opens the name and model configuration form. Choose an embedding model, vector database
and any required chat model. Embeddings support retrieval; the chat model generates answers and is not a substitute.
After saving the definition, associate sources through **Configuration** and run **Vectorize**.
Creating or saving the definition does not finish the entire ingestion process.

<a id="help-knowledge-recall"></a>

## Recall tests and Top K

Select a vectorized knowledge base, enter a realistic question, and inspect
returned snippets, source names, links, and ordering. **View full text** opens snippet details.
History shows the question, knowledge base, snippet count, highest similarity and test time.

Similarity scores are ranking signals, **not recall percentages or correctness
probabilities**. Different models/backends can use different scales. If reranking
is enabled, distinguish its score and order from the original vector ranking.
Inspect full paragraphs before drawing conclusions. A single successful query
does not establish the quality of the entire knowledge base.

<a id="help-knowledge-top-k"></a>

## Returned snippet count (Top K)

The slider and number input under **Retrieval settings** limit snippets returned by subsequent tests on this page.
The range is **1–20**, with **5** suggested as a starting point. Increase for more coverage or decrease to reduce noise.
Top K is not a similarity threshold, recall rate or document count.
Changing it does not re-vectorize the knowledge base or alter global model parameters.
