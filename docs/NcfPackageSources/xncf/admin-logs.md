# Admin logs and diagnostics

<a id="help-logs"></a>

## Logs

Select a date and open the relevant log file. Correlate timestamps with the
failed operation; the browser Console and server log are different sources.
Redact tokens, credentials, personal data, and private document content before
sharing diagnostic excerpts.

<a id="help-log-details"></a>

## Logs for a selected date

This page reads the selected SenparcTrace file. Switch between full results and exceptions, or filter by keyword,
start/end time, thread, type and exception status. Line numbers, timestamps, titles and content identify records;
they do not replay requests. An empty result may simply mean the date or filters do not match.

The list returns paged summaries. Open a row to inspect its redacted detail. Responses are not cacheable, and the
date must use `yyyyMMdd`. Known credential-like values, including passwords, authorization headers, bearer tokens,
cookies and common secret fields, are replaced with `***`. Redaction is a defense-in-depth measure rather than a
guarantee: applications should still avoid writing secrets, personal data or private documents to logs.

<a id="help-ai-log-analysis"></a>

## Analyze logs with AI

Open the footer **AI** button on the log-details page. The AdminChat composer types the following command for the
selected date automatically, then leaves a space for the question:

```text
/analyze-system-logs --date=yyyyMMdd
```

You can use the same command directly in AdminChat:

```text
/analyze-system-logs --date=20261123 How many exceptions occurred, and what were the main causes?
```

If `--date` is omitted, the server uses the current date. The command adds the system-log tools for this turn
instead of requiring an AdminChat module or a Workspace to be selected manually.

The analysis is intentionally evidence-driven and token-bounded:

1. `GetSystemLogOverview` runs first and returns totals, type counts, the log time range, up to 10 exception
   signatures and up to 10 thread counts.
2. `SearchSystemLogs` narrows the result by keyword, trace type, exception state or thread. It returns no more
   than 30 rows per call.
3. `GetSystemLogEvidence` reads only directly relevant line numbers. Normal analysis uses no more than 6 records
   and 4,000 characters per record; the service has a hard per-record ceiling of 8,000 characters.
4. If the overview is sufficient, the AI answers from it without loading detailed rows. Broad searches are
   refined before more evidence is requested.

This workflow supports summaries, exception counts and grouping, time-window correlation, thread/type analysis,
keyword tracing, repeated-failure comparison, and probable-cause recommendations. Conclusions must cite the
available date, time, line and thread evidence and distinguish observations from hypotheses. A missing file,
unmatched filter or incomplete log is reported as a limit rather than inferred.

The command is read-only. It does not modify the log, execute shell commands, change the database, or replay a
request. System-log functions are protected by the Admin authorization policy and return redacted data only.
For questions that cross multiple systems, secrets are required, or log retention is incomplete, export the
relevant evidence and have an operator review it under the organization's access policy.
