# MCP Manager: published services and client connections

<a id="help-mcp-manager"></a>

## MCP Manager page

**MCP services published by this host** is a read-only view of mapped services, modules, routes and endpoints:
filter, refresh or copy their addresses. Publication and permissions belong to the owning module.
**Client connection configuration** manages NCF's connections to external MCP Endpoints: add, edit, enable, test or delete.
Do not look for local service publication switches in the client list, or treat copying an address as authentication.
Protocol and Server development are covered separately in [the MCP module](../../MCP/home/index.md).

<a id="help-mcp-connections"></a>

## MCP client connection configuration

This help belongs to the external-connection editor. **Add Endpoint** takes a unique name, address,
transport type and optional protocol version, description and authorization settings.
**Test before saving** checks the current form; **Save** persists it.
The enabled switch and **Test** are different actions. Last-test state, tool count and details help diagnose connectivity.
Check the selected endpoint before connecting or invoking a tool. An endpoint
being listed does not imply anonymous or public access.
See [MCP basic usage](../../MCP/basic-usage.html).
