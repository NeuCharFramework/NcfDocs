# NeuBell outbound WebHook management

<a id="help-neubell"></a>

## NeuBell and outbound WebHooks

This page manages outbound WebHooks: addresses, add/remove events, provider filters,
HTTP method, body template, optional signing secret and enablement.
Request logs show HTTP status, duration and payload. **Clear** concerns displayed request records, not deleting every WebHook.
Footer provider subscriptions determine which notifications are displayed and are separate settings.
Verify the destination and use **Test** with a controlled receiver before
enabling production notifications. A successful test is not a guarantee of
future delivery. Do not place secrets in the URL or publish them with examples.
