# Connectors: external tools with controlled access

<a id="help-connectors"></a>

## Connectors page

`Senparc.Xncf.Connectors` stores external tool accounts as selectable
connectors. A connector type is supplied by an installed module, while this
page stores the account, protected secrets, enabled actions, and whether the
account is available to Chat, Workflow, or Agent templates.

The page is restricted to `AdminSuperAdmin`. A normal module user should not
configure shared credentials.

## First setup

1. Install and enable the module that provides the connector type.
2. Open **Connectors** and choose **Configure this connector**.
3. Enter a descriptive name, such as `Headquarters WeCom`.
4. Fill in the account fields and secrets. Secrets are stored server-side;
   they are not returned as plaintext when the record is edited.
5. Select only the actions the account is allowed to perform.
6. Enable the connector and save it.
7. Use **Test** and confirm the provider accepts the credentials before
   selecting it in Chat, Workflow, or an Agent template.

Leaving a saved secret blank keeps the existing secret. To replace it, enter a
new value. To remove an account, use **Delete**; existing Agent references to
that connector will stop working.

### Safe first test

Create the connector disabled if you are still collecting credentials. After saving, test
one low-impact action before enabling it for a Chat, Workflow, or Agent. A successful test
proves only that this server accepted that action at that time; it does not prove that every
action is safe, that every user is authorized, or that the provider will remain reachable.

If the editor shows a masked secret, do not copy the mask back into the field. Leave it blank
to keep the stored secret, or enter the newly rotated secret. Never place provider secrets in
the connector name, note, Workflow input, Agent prompt, exported configuration, or screenshots.

## How permissions work

The connector page controls which actions are enabled on an account. It does
not by itself grant every user permission to invoke those actions. The calling
surface still needs its own authorization and policy checks:

- Chat may narrow the available actions for one conversation.
- Workflow selects a connector and action in a Function node.
- Agent templates decide which connectors an agent may use.

Treat connector secrets and action access as production credentials. Use the
least-privilege action set, rotate provider secrets through the provider, and
review Agent and Workflow references after changing or deleting a connector.

## Troubleshooting

| Symptom                                 | Check first                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| No connector type appears               | Install and enable the module that registers it.                              |
| Save is rejected                        | Confirm the name, required fields, and selected action values.                |
| Test fails                              | Check the provider account, network access, secret rotation, and server logs. |
| Chat or Agent cannot select it          | Confirm the connector is enabled and the caller's policy allows the action.   |
| A deleted connector is still referenced | Remove or replace the reference in the Agent template or Workflow node.       |

The connector module stores configuration and dispatches actions; provider
behavior, network reachability, rate limits, and external account permissions
remain outside NCF.
