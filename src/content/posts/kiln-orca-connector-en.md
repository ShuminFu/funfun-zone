---
title: "How kiln-orca runs Kiln's work through agents in Orca"
description: "Reading the source of kiln-orca, Kiln's AI node connector: how it takes tasks from the server, starts Codex or Claude Code inside Orca, requests and revokes a git credential per transfer, and resumes from a journal after a crash."
growth: seedling
planted: 2026-11-23T01:41:38+08:00
lastTended: 2026-11-23T01:41:38+08:00
draft: false
lang: "en"
tags:
  - "ai-agents"
  - "workflow"
  - "claude-code"
  - "codex"
  - "security"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .tldr{border-left:2px solid var(--accent);padding:2px 14px;margin:20px 0}
.html-embed .tldr p{margin:0}
.html-embed .tw{overflow-x:auto;max-width:100%;margin:20px 0}
.html-embed .tw table{margin:0;min-width:560px}
.html-embed .tw td:first-child,.html-embed .tw th:first-child{white-space:nowrap}
.html-embed .where{font-size:14px;color:var(--muted-foreground)}
.html-embed .fl{margin:28px 0;display:flex;flex-direction:column;align-items:center;gap:6px}
.html-embed .fl figcaption{margin-top:10px;font-size:14px;color:var(--muted-foreground);text-align:center;max-width:36em}
.html-embed .fr{display:flex;align-items:center;justify-content:center;width:100%}
.html-embed .fc{display:flex;flex-direction:column;align-items:center;width:100%}
.html-embed .fn{background:var(--muted);border:1px solid transparent;border-radius:10px;padding:10px 14px;text-align:center;flex:0 1 190px;min-width:0}
.html-embed .fn b{display:block;font-size:15px;font-weight:600;color:var(--foreground);line-height:1.35}
.html-embed .fn small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.html-embed .fn.hi{background:transparent;border:2px solid var(--accent)}
.html-embed .fn.dash{background:transparent;border:1px dashed var(--muted-foreground)}
.html-embed .fc>.fn{flex:none;width:min(100%,300px)}
.html-embed .fn.wide{width:min(100%,420px)}
.html-embed .fa{flex:1 1 70px;min-width:56px;max-width:150px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 6px;font-size:12.5px;line-height:1.3;color:var(--muted-foreground);text-align:center}
.html-embed .fa i{position:relative;display:block;width:100%;height:2px;background:currentColor}
.html-embed .fa i::after{content:"";position:absolute;right:-2px;top:-4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.html-embed .fa.v{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.html-embed .fa.v i,.html-embed .fr .fa.v i{width:2px;height:30px}
.html-embed .fa.v i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.html-embed .fa.v span{width:12em;text-align:left}
.html-embed .fo{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 14px;margin-top:10px;font-size:13px}
.html-embed .fo span{padding:4px 10px;border-radius:999px;border:1px dashed var(--muted-foreground);color:var(--muted-foreground)}
.html-embed .fo .ok{border-style:solid;border-color:var(--accent);color:var(--foreground)}
.html-embed .fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;width:100%}
.html-embed .fg .fn{flex:none}
@media (max-width:640px){
.html-embed .fr{flex-direction:column}
.html-embed .fr .fn{flex:none;width:min(100%,300px)}
.html-embed .fr .fa{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.html-embed .fr .fa i{width:2px;height:28px}
.html-embed .fr .fa i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.html-embed .fr .fa span{width:12em;text-align:left}
}
</style>

<div class="html-embed" lang="en">
<p class="where">中文版：<a href="/posts/kiln-orca-connector/" lang="zh-CN">kiln-orca 怎么让 Orca 里的 Agent 干 Kiln 的活</a> · Previous post: <a href="/posts/kiln-automation-flow-en/">How Kiln turns an issue into a release</a></p>
<p>The <a href="/posts/kiln-automation-flow-en/">previous post</a> covered Kiln's whole automation chain: an issue is developed by an AI, reviewed by another agent, then merged, tagged and released. On the AI side it stopped at "the server hands the task to an AI execution node". This post goes one level down: what happens on that node, how Kiln gets a coding agent inside Orca to do its work, and how it keeps the agent from doing anything else.</p>
<p>I read the <code>kiln-orca/</code> directory of <a href="https://github.com/hewenyu/kilnflow.dev">kilnflow.dev</a> (TypeScript, about 11.5k lines of source) at commit <code>e3bff51</code>. Source and tests only: <strong>nothing was installed or run</strong>. Orca itself is not open source; I only looked at how the connector calls its command line and at Orca output recorded in the tests. Paths are relative to <code>kiln-orca/src/</code>.</p>

<div class="tldr"><p>In one sentence: <code>kiln-orca</code> is a resident user service between the Kiln server and Orca. It takes tasks from the server, starts an agent in a one-shot Orca worktree, and writes each step to a local journal so it can carry on after a crash; the agent can only act by asking it through the <code>kiln-orca task</code> command, and git credentials are fetched from the server per transfer and handed back when done.</p></div>

<h2>Who does what</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>Kiln server</b><small>tasks · credentials · results</small></div><div class="fa "><span>airunner.v2 long-poll</span><i></i></div><div class="fn hi"><b>kiln-orca</b><small>resident user service</small></div><div class="fa "><span>Orca CLI</span><i></i></div><div class="fn "><b>Orca</b><small>worktrees · terminals · orchestration</small></div></div><div class="fa v"><span>Orca starts the agent</span><i></i></div><div class="fn "><b>Codex / Claude Code</b><small>works in a one-shot worktree</small></div><div class="fo"><span class="lp">↺ the agent reaches back only through kiln-orca task (local unix socket)</span></div><figcaption>The connector does not run the agent itself, and the agent never talks to the server directly: every outbound request goes through the connector.</figcaption></figure>
<p><strong>Orca</strong> is a desktop app that manages agents' worktrees, terminals and orchestration (runs, dispatches, workers). How Orca divides work inside, and whether it spawns sub-agents, is its own business; Kiln does not care.</p>
<p><strong>kiln-orca</strong> runs as a macOS LaunchAgent or a Linux <code>systemd --user</code> service, and one data directory is one node. The token a node enrols with decides whether it is a review node or a development node; a machine with both Codex and Claude Code installed can enrol one of each, each with its own data directory.</p>

<h2>The life of one task on a node</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>prepare</b><small>clone · worktree · toolchain · services</small></div><div class="fa "><span>request id recorded first</span><i></i></div><div class="fn "><b>start</b><small>orca worker-start</small></div><div class="fa "><span>agent works</span><i></i></div><div class="fn hi"><b>running</b><small>waits for worker_done · 5s heartbeat</small></div></div><div class="fa v"><span>agent sends worker_done</span><i></i></div><div class="fr"><div class="fn "><b>finishing</b><small>push attempt branch · Complete</small></div><div class="fa "><span>result committed</span><i></i></div><div class="fn "><b>stopping / releasing</b><small>stop agent · free terminal</small></div><div class="fa "><span>both confirmed</span><i></i></div><div class="fn "><b>reclaiming</b><small>delete worktree · journal</small></div></div><figcaption>These stage names are the values of the stage field in a journal record; the connector writes the journal before each step and resumes from it after a restart.</figcaption></figure>

<h3>1. Startup: check it can work before asking for work</h3>
<p>On start, the connector reads its enrolment and private key, takes a single-instance lock, opens a socket at <code>run/kiln-orca.sock</code> in the data directory, then checks each dependency: Orca is open and at least version <code>1.4.258</code>; Docker and Compose work; the bundled <code>kiln-runner</code> can prepare toolchains; the journal is writable; each agent answers <code>--version</code>; and the <code>kiln-task</code> skill is synced into each agent's skills directory.</p>
<p>This status, plus the protocol version (currently 10), goes to the server with every <code>Acquire</code>. When capacity is full (default <code>max_tasks: 2</code>), local drain is on, Orca is not ready, or the journal or skill has a problem, the node stays connected but declares it takes no new work. An unreadable journal record counts as one slot of capacity, because it may describe an agent still running in Orca that the connector cannot identify.</p>
<p class="where"><code>host/run.ts:132</code> · <code>core/node.ts:176,473,728</code> · <code>core/orca.ts:306</code></p>

<h3>2. Prepare: clone, worktree, toolchain, test services</h3>
<p>After taking a task, the connector prepares the repository's clone under <code>repos/&lt;repo id&gt;/&lt;name&gt;</code>. It asks the server for a read token (<code>IssueCredential</code> with an <code>op_id</code>), passes it to git as <code>http.&lt;url&gt;.extraHeader</code> through environment variables so it never appears in argv, and calls <code>RevokeCredential</code> as soon as the clone is done. The connector's own git ignores the global and system git config.</p>
<p>It then registers the repository with Orca, writes task files under <code>tasks/&lt;attempt&gt;/</code> (<code>work.json</code>, <code>candidates.json</code> for development selection, and so on), runs <code>kiln-runner toolchain ensure</code> to prepare Go, Node and pnpm from the repository's <code>.kiln/runtimes.lock</code>, and, if the repository declares test services, brings up Postgres or Redis with <code>docker compose up -d --wait</code>.</p>
<p class="where"><code>core/attempt.ts:459,746</code> · <code>core/git.ts:171,410</code> · <code>core/credentials.ts:77</code> · <code>core/toolchain.ts:167</code> · <code>core/services.ts:305</code></p>

<h3>3. Start the agent, never twice</h3>
<p>Before starting, the connector writes this start's request id to the journal, and <strong>only then</strong> calls:</p>
<p><code>orca orchestration worker-start --worktree new-top-level --name kiln-a&lt;attempt&gt;-e&lt;epoch&gt; --base-branch &lt;commit&gt; --comment kiln:attempt=…;epoch=…;task=…;kind=… --agent &lt;agent&gt; --spec &lt;prompt&gt;</code></p>
<p>Orca creates a new top-level worktree and starts the agent in it. If the call's outcome is unclear (timeout, dropped connection), the connector does not retry; it asks <code>request-show</code> with the same request id whether Orca actually started it. If that cannot be settled, the task ends as <code>infra.lost</code>: failing is better than one task running two agents. The worktree's name and comment carry the attempt and epoch, which is how cleanup later proves "I created this".</p>
<p class="where"><code>core/attempt.ts:864,958</code> · <code>core/orca.ts:611</code></p>

<h3>4. Tracking: mailbox, heartbeat, timeouts</h3>
<p>When the agent finishes it sends a <code>worker_done</code> message. The connector keeps a "mailbox" terminal of its own in Orca running <code>orchestration check --types worker_done,escalation,question</code> and writes each message to a file; if the agent asks a question mid-task, it gets a fixed reply telling it to decide according to its brief.</p>
<p>While a task runs, the connector checks the mailbox every 2 seconds, falls back to <code>worker-show</code> every 30 seconds, and sends the server a heartbeat with the current stage every 5 seconds. The heartbeat reply can carry a cancel request; exceeding the task's time limit, losing the server for 10 minutes, a stale epoch, or the node being revoked all make the connector stop the agent. When the connector itself restarts it simply stops tracking; the agent keeps running in Orca and is picked up again from the journal.</p>
<p class="where"><code>core/mailbox.ts:585</code> · <code>core/attempt.ts:118-123,1000,1358</code></p>

<h3>5. The agent's only door: <code>kiln-orca task</code></h3>
<p>The agent's brief contains a command of the form <code>node cli.js task --home &lt;data dir&gt; --attempt &lt;id&gt;</code>; its usage is documented in the <code>kiln-task</code> skill, which ships with the package and is synced into the agent's directory by the connector. The command hands each request over the unix socket to the running connector, which calls the server on its behalf.</p>
<div class="tw"><table>
<thead><tr><th>Subcommand</th><th>What it does</th><th>Who validates</th></tr></thead>
<tbody>
<tr><td><code>info</code></td><td>Basic task information</td><td>Local</td></tr>
<tr><td><code>check-report</code></td><td>Review: validate <code>report.json</code> before finishing</td><td>Server <code>ValidateReport</code>; locally only file type and a 1 MiB cap</td></tr>
<tr><td><code>claim</code></td><td>Development: claim the selected issues</td><td>Server <code>ValidateReport</code> + <code>ClaimDevIssues</code></td></tr>
<tr><td><code>deliver</code></td><td>Development: submit the delivery report</td><td>Server validates the report; locally: clean tree, HEAD contains the delivered commit, design phase Markdown-only</td></tr>
<tr><td><code>ci</code></td><td>Latest CI result for a PR or commit</td><td>Server <code>GetVerification</code></td></tr>
<tr><td><code>doc</code></td><td>Read the frozen external design docs</td><td>Server, authorised from task relations</td></tr>
<tr><td><code>exec</code></td><td>Run a command with the managed toolchain; git gets credentials via the connector</td><td>See the next section</td></tr>
<tr><td><code>done</code></td><td>End the round: validate once more, then send <code>worker_done</code> to Orca from the agent's own process</td><td>Connector</td></tr>
</tbody>
</table></div>
<p>One detail in that last row: <code>worker_done</code> is sent by the agent's process, using the identity Orca set in that session's environment; the connector never impersonates the agent to report completion.</p>
<p class="where"><code>host/socket.ts:295</code> · <code>core/attempt.ts:1412-1649</code> · <code>core/done.ts:138</code></p>

<h3>6. <code>task exec</code>: one token per git transfer</h3>
<figure class="fl"><div class="fr"><div class="fn "><b>Agent's git</b><small>run through task exec</small></div><div class="fa "><span>git-remote-https swapped for a wrapper</span><i></i></div><div class="fn hi"><b>Transport wrapper</b><small>checks for other credentials first</small></div><div class="fa "><span>opens a read operation</span><i></i></div><div class="fn "><b>Connector → server</b><small>token for this one repo</small></div></div><div class="fo"><span class="ok">✓ transfer ends, connection closes: revoked at once</span><span class="lp">netrc, extraHeader or password in URL found: transfer refused</span></div><figcaption>Neither the agent nor the worktree holds a lasting git credential; every fetch is requested and revoked on its own.</figcaption></figure>
<p><code>task exec -- &lt;command&gt;</code> puts the toolchain first on <code>PATH</code>, points <code>GIT_EXEC_PATH</code> at a mirror directory where <code>git-remote-http(s)</code> is replaced by the connector's wrapper, and configures the connector's credential helper for the task repository's host.</p>
<p>Each time git goes over HTTP(S), the wrapper first checks whether the transfer would carry some other credential: a user or password in the URL, an <code>http.extraHeader</code> effective for that URL, netrc mentioning the host or <code>default</code>, or any of these being unreadable. Any one of them refuses the transfer. Otherwise it opens a read operation with the connector over the socket, and the connector asks the server for a token only if the URL is exactly the task repository or a declared dependency; when the connection closes, the token is revoked.</p>
<p>Write access is used only for delivery: the connector requests a separate write token for its own push of the attempt branch and returns it right after. The agent never gets a write credential.</p>
<p class="where"><code>host/cli.ts:306,365</code> · <code>core/gitexec.ts:45,109</code> · <code>core/credentials.ts:246,362</code> · <code>core/attempt.ts:1468,1490</code></p>

<h3>7. Finishing: confirm the result, then delete things</h3>
<p>When the agent finishes, the connector first records the verdict in the journal (stage <code>finishing</code>). For a development task that delivered, it pushes the delivered commit to <code>kiln/attempt-&lt;id&gt;</code> with a write token and confirms with <code>ls-remote</code>; if nothing was delivered, it pushes the current changes to the same branch as a checkpoint, so the next round can continue on a different machine. Then it sends <code>Complete</code>, retrying for up to 30 minutes.</p>
<p>Only after the result is confirmed does cleanup start: stop test services, confirm the agent has stopped and its terminal is released, delete the worktree, checkout and local branch through Orca, verify that Orca, git and the disk no longer have them, and finally delete the journal record. Before deleting, it checks name, comment, path and git registration; anything the connector did not create is left alone. Unfinished reclaim is retried every minute and abandoned after 12 hours with a log entry explaining the manual fix.</p>
<p class="where"><code>core/attempt.ts:1159,1223,1256,1297</code> · <code>core/git.ts:558</code> · <code>core/reclaim.ts:185-411</code></p>

<h2>What happens after a crash</h2>
<p>This is the core of the design. Before every action that changes something outside the process, the connector records what it is about to do in <code>journal/&lt;attempt&gt;.json</code>: the start request id, the verdict, whether to push, the content of <code>Complete</code>. On restart it reads each record:</p>
<ul>
<li>a recorded <code>Complete</code> is sent again;</li>
<li>a verdict without a confirmed push redoes the push;</li>
<li>records stuck in <code>stopping</code>, <code>releasing</code> or <code>reclaiming</code> are retried every minute;</li>
<li>an unreadable record is neither skipped nor deleted: the node stops taking new work and reports the file and the reason in the log, <code>doctor</code> and the dashboard until a person deals with it.</li>
</ul>
<p>The tests follow the same idea: about 580 cases using real git, a local git HTTP server, a real unix socket and multi-process lock races, plus many "epoch goes stale / process crashes in the middle of step X" cases.</p>

<h2>Problems I found</h2>
<p>No high-severity defects. Most of what is worth fixing only matters if "the agent and the connector run as the same user" is treated as a security boundary; Kiln's own docs call these guard rails, not a boundary.</p>
<div class="tw"><table>
<thead><tr><th>Problem</th><th>Effect</th><th>Where</th></tr></thead>
<tbody>
<tr><td>The socket identifies callers by attempt id alone</td><td>With two tasks running, one agent can act as the other: get its credentials, claim issues, read docs. A random per-task secret in the task command would fix it</td><td><code>host/run.ts:202</code></td></tr>
<tr><td>Fixed 10-minute git timeout on a full clone</td><td>On a large repo or slow link the clone times out, the next task starts from zero, and it can fail with <code>infra.fetch</code> indefinitely</td><td><code>core/git.ts:50,412</code></td></tr>
<tr><td>The shared clone's own <code>.git/config</code> and hooks still apply</td><td>A proxy or hook left by an earlier development agent affects later tasks' token-carrying git</td><td><code>core/git.ts:183</code></td></tr>
<tr><td>Journal and state files are not fsynced</td><td>After power loss a record can be empty; an empty journal stops the node taking work until someone deletes it</td><td><code>core/journal.ts:215</code></td></tr>
<tr><td>The clone path is built from the server-supplied repo name with no containment check before deletion</td><td>Only reachable if the server is buggy or compromised; the reclaim code already has this check, this path does not</td><td><code>core/attempt.ts:428</code></td></tr>
<tr><td>A report file over 1 MiB is reported to the agent as "retry later"</td><td>The agent may keep retrying until the task times out</td><td><code>core/attempt.ts:1534</code></td></tr>
</tbody>
</table></div>
<p>What is done well is just as clear: every child process is started with an argv array, never <code>shell: true</code>; tokens never appear in argv, the journal or logs, which record only fingerprints; external input is parsed as <code>unknown</code> and then validated, with not one <code>as any</code> in the source; and every external command has a timeout.</p>
</div>
