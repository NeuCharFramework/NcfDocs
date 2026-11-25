# Weixin official accounts and followers

<a id="help-weixin-overview"></a>

## Official account control center

Home shows configured official accounts, active accounts, total Weixin users and today's new users.
Expand an account and use **View users** for its followers or **Edit** for account management.
These counters are not a live Weixin platform bill.
Placeholder links must not be treated as implemented group, tag or conversation features.

<a id="help-weixin-accounts"></a>

## Weixin official accounts

Configure the correct official account identity, AppId, AppSecret, Token, and
encryption settings for your deployment. Keep these credentials private. Verify
the selected account before changing its configuration or prompt association.
This is distinct from the personal Weixin Bot connection.
The editor's PromptRangeCode associates a prompt. Its callback URL configures the Weixin platform; it is not a chat window.

### Where the values come from

Use the official account settings in the Weixin platform to obtain AppId, AppSecret, Token,
and EncodingAESKey. The **Token** and **EncodingAESKey** must match the values used by the
platform callback configuration; they are not arbitrary passwords invented for the NCF form.
Copy the callback URL shown by NCF into the platform's server configuration, then complete
the platform-side verification before testing messages.

Save one account first and verify its status. Only after the callback and credentials work
should you add a second account or associate a PromptRange code. Never put AppSecret or
EncodingAESKey into a prompt, issue report, or screenshot.

<a id="help-weixin-users"></a>

## Weixin followers

Confirm the selected official account before viewing or managing its followers.
**Append newly followed users** and **Sync all followers** have different scopes; inspect follow status and the local list afterward.
Treat identifiers and profile data as personal data. Follow the platform's
authorization and messaging restrictions; a local user record is not consent
for arbitrary outbound messages.

Use **Append newly followed users** for a small incremental synchronization and **Sync all
followers** when you intentionally want a broader refresh. The latter can take longer and
may affect many local records. After either operation, check the selected account, the last
sync result, and the resulting list before repeating the action.
