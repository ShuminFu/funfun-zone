---
author: Shumin Fu
pubDatetime: 2026-10-14T10:00:00+08:00
title: "Finish One Job, Then Keep Going: Extending a Claude Code Workflow Across Turns"
slug: claude-code-workflow-multi-turn
featured: false
draft: false
tags:
  - claude-code
  - ai-agents
  - workflow
description: How a Claude Code workflow grows across several chat turns — append a step, resume from the last run, and only pay for the new part.
---

Claude Code's `Workflow` tool runs a script that fans work out to many sub-agents. A question I kept asking: once one job is done, how do I keep going without paying for the finished part again?

**Short answer: add the new step at the end of the saved script, then resume from the last run.**

- Every run saves its script to a file and returns a `runId`.
- Next turn, edit that file and call `Workflow({scriptPath, resumeFromRunId})`.
- Unchanged steps at the front come back from the cache, instantly and for free. Only the new step runs live.
- The cache covers the **longest unchanged prefix**. Change an early step, and that step plus everything after it runs again. So append at the end.

The full visual walkthrough (turn-by-turn timeline, the script diff, the cache rule, and other ways to continue) is below.

👉 [Open the full report in a new tab](/reports/claude-workflow-multi-turn.html)

<iframe src="/reports/claude-workflow-multi-turn.html" title="Extending a Claude Code workflow across turns" loading="lazy" style="width:100%;height:80vh;border:1px solid currentColor;border-radius:8px;opacity:0.95"></iframe>

**In one line:** each turn, edit the same script, append at the end, and resume from the newest run ID. Only the new part costs anything.
