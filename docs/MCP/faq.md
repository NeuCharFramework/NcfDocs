# MCP Frequently Asked Questions (FAQ)

This document collects common MCP questions and answers to help developers troubleshoot quickly.

## Basic Questions

### Q: What is MCP?

**A:** MCP (Model Context Protocol) is a protocol for model context interaction that enables seamless communication between models and platforms. In NCF, MCP acts as a middle layer between applications and AI models, making AI integration easier.

### Q: How is MCP different from other AI integration approaches?

**A:** MCP offers a standardized and unified way to integrate AI:

- A standard protocol to access different models through one interface
- Built-in function calling so AI can invoke system capabilities
- Optimized interaction pattern for large language models
- Native integration with AI frameworks such as Semantic Kernel
- Optimized for NCF modular architecture and extensibility

### Q: What prerequisites do I need before using MCP?

**A:** Recommended knowledge:

- .NET Core and C# fundamentals
- Basic NCF concepts and usage
- Core AI and LLM concepts
- RESTful API and HTTP basics

## Installation and Configuration

### Q: How do I verify MCP was installed successfully?

**A:** Steps:

1. Start your NCF application
2. Open `http://localhost:5000/sse/sse` (or your configured endpoint)
3. If the MCP server starts normally, you'll see a successful event stream response

### Q: Why do I get HTTP 401 when visiting the MCP endpoint?

**A:** Usually token-related. Check:

1. `McpAccessToken` is configured correctly in `appsettings.json`
2. You include the token in the request, for example: `http://localhost:5000/sse/sse?token=your-token`
3. Authorization middleware is configured correctly

### Q: Why won’t my MCP service start?

**A:** Common causes:

1. Port conflict
2. Wrong config values in `appsettings.json`
3. Missing dependencies / NuGet packages
4. Insufficient runtime permissions

### Q: How do I secure MCP in production?

**A:** Recommended actions:

1. Use a strong `McpAccessToken` and inject it from environment variables or secret vaults
2. Use HTTPS
3. Implement stronger auth (for example JWT/OAuth)
4. Restrict source IPs for the MCP endpoint
5. Add request rate limiting
6. Log and monitor all MCP calls

## Development and Usage

### Q: How do I create a custom MCP tool?

**A:**

1. Create a static or instance class with `[McpServerToolType()]`
2. Create public methods with `[McpServerTool]`
3. Add `[Description]` for each tool
4. Implement your business logic
5. Register tools at startup (`WithToolsFromAssembly()` or `WithTools<T>()`)

### Q: Why is my tool method not being called by the AI model?

**A:** Check:

1. Method has `[McpServerTool]` and `[Description]`
2. Class has `[McpServerToolType()]`
3. Tool is registered to MCP server
4. Tool descriptions are clear and specific
5. Parameter types are compatible (overly complex types may fail)
6. Model configuration has function calling enabled

### Q: How do I handle asynchronous MCP tools?

**A:** Pattern:

1. Define methods returning `Task<string>`
2. Use `async/await`
3. Handle exceptions and return meaningful error messages

```csharp
[McpServerTool, Description("Fetch data asynchronously")]
public async Task<string> GetDataAsync(string source)
{
    try
    {
        var data = await FetchDataFromSourceAsync(source);
        return JsonSerializer.Serialize(data);
    }
    catch (Exception ex)
    {
        return $"Error: {ex.Message}";
    }
}
```

### Q: How do I handle complex parameter types in MCP tools?

**A:**

1. Define a custom request class with required properties
2. Use attributes for descriptions and defaults
3. Use that class as the tool method parameter

```csharp
public class SearchRequest
{
    [Required]
    [Description("Search query")]
    public string Query { get; set; }

    [Description("Maximum number of results")]
    [DefaultValue(10)]
    public int MaxResults { get; set; }

    [Description("Sort mode")]
    [DefaultValue("relevance")]
    public string SortBy { get; set; }
}

[McpServerTool, Description("Execute search")]
public string Search(SearchRequest request)
{
    // Implement search logic
    return "Search results...";
}
```

## AI Integration and Tool Calling

### Q: How can I monitor whether AI is calling MCP tools correctly?

**A:**

1. Add logs in tool methods (inputs/results)
2. Use APM tools to track frequency and latency
3. Add debug traces at method entry and exit
4. Build dashboards/reports for tool invocation metrics

### Q: How can I optimize interaction between AI and MCP tools?

**A:**

1. Provide precise and complete tool descriptions
2. Use clear parameter names and descriptions
3. Provide sensible defaults
4. Return structured, readable output
5. Tune model parameters (for example `temperature`)
6. Improve prompts to guide tool usage

### Q: Why does AI sometimes decide not to call my tools?

**A:** Possible reasons:

1. Tool descriptions are unclear or not relevant to the task
2. AI thinks it can answer directly from model knowledge
3. Function-calling behavior isn't configured properly (for example not `Required`)
4. Model version limitations in tool usage quality
5. Prompt does not explicitly require tool usage

### Q: How can I force AI to always use my tools?

**A:**

1. Use `FunctionChoiceBehavior.Required()`
2. Explicitly instruct tool usage in prompts
3. Design tools tightly around specific tasks
4. Make tool descriptions concrete and scenario-focused

## Advanced Questions

### Q: How do I configure MCP in multi-instance environments?

**A:**

1. Use shared cache (for example Redis) for shared session state
2. Configure load balancer session affinity
3. Use distributed queues for cross-instance MCP requests
4. Consider service mesh patterns (for example Dapr)

### Q: How does MCP integrate with other NCF modules?

**A:**

1. Inject other module services via DI
2. Wrap other module functions as MCP tools
3. Use event bus for module communication
4. Use NCF OHS (Open Host Service) pattern to compose modules

### Q: How can I make MCP highly available?

**A:**

1. Deploy multiple MCP instances
2. Add health checks and auto-recovery
3. Use container orchestration (for example Kubernetes)
4. Implement circuit breaker strategy
5. Use caching to reduce server pressure
6. Add timeout and retry policies

### Q: How can I extend MCP for more AI providers?

**A:**

1. Implement a custom `AIModelProvider` interface
2. Create adapter classes per provider
3. Register providers in DI container
4. Add provider-specific config entries
5. Build dedicated tool sets for provider-specific capabilities

## Performance and Optimization

### Q: What are key MCP performance considerations?

**A:**

1. AI model latency (especially external providers)
2. Tool execution time
3. Serialization/deserialization overhead
4. Network latency
5. Concurrent request handling capacity
6. Memory usage for large sessions and contexts

### Q: How do I optimize high-frequency MCP tools?

**A:**

1. Add result caching
2. Use async/parallel execution
3. Batch requests
4. Optimize data structures and algorithms
5. Use high-performance serializers (for example `System.Text.Json`, MessagePack)
6. Move expensive work to background jobs

### Q: Are there concurrency limits in MCP service?

**A:** Concurrency is mainly limited by:

1. Server hardware (CPU/memory)
2. AI provider API limits
3. Overall NCF application configuration
4. Network bandwidth and connection count
5. Tool implementation efficiency

You can manage concurrency by tuning web server settings, thread pool parameters, and request queue strategies.

## Troubleshooting

### Q: How do I debug MCP tool invocation issues?

**A:**

1. Enable detailed logging
2. Capture and log exceptions with `try/catch`
3. Add console/log outputs inside tool methods
4. Attach a debugger
5. Inspect request/response traffic
6. Test endpoints manually with Postman or similar tools

### Q: Common MCP error codes and fixes?

**A:**

| Error Code | Description | Recommended Fix |
|-----------|-------------|-----------------|
| 401 | Unauthorized | Check access token configuration |
| 404 | Endpoint not found | Confirm URL and route configuration |
| 408 | Request timeout | Increase timeout or optimize processing |
| 429 | Too many requests | Add throttling or increase capacity |
| 500 | Internal server error | Check logs and fix server-side code |
| 503 | Service unavailable | Check dependencies and AI service health |

### Q: How do I improve AI understanding of tool purposes?

**A:**

1. Provide more detailed and concrete descriptions
2. Use clear and common terminology
3. Add explicit parameter descriptions and examples
4. Test multiple wording variants for descriptions
5. Include specific tool usage examples in prompts

If you still have questions, open an issue in GitHub Issues or discuss with the NCF community.
