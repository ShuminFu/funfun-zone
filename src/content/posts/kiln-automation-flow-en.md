---
title: "How Kiln turns an issue into a release"
description: "Reading the source of Kiln (kilnflow.dev): how an issue labelled kiln:ready goes through AI development, an independent review by a second agent, Kiln's own merge queue and auto-tagging, and is published by the server with no human step."
growth: seedling
planted: 2026-11-23T01:41:38+08:00
lastTended: 2026-11-23T01:41:38+08:00
draft: false
lang: "en"
tags:
  - "ai-agents"
  - "workflow"
  - "code-review"
  - "self-hosting"
  - "open-source"
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
<p class="where">中文版：<a href="/posts/kiln-automation-flow/" lang="zh-CN">Kiln 怎么把一个 Issue 自动变成一次发布</a> · Companion post: <a href="/posts/kiln-orca-connector-en/">How kiln-orca runs Kiln's work through agents in Orca</a></p>
<p><a href="https://github.com/hewenyu/kilnflow.dev">Kiln</a> is a self-hosted CI. One small server keeps all state in Postgres; build machines and AI machines connect out to it to pick up work. With the optional AI nodes attached, a GitHub issue labelled <code>kiln:ready</code> is designed and coded by an AI, reviewed by a different agent, then merged, tagged and released, with no human clicking anything in between.</p>
<p>This post follows that path through the code. I read commit <code>e3bff51</code>, source only: <strong>nothing was built or run</strong>. File paths are relative to <code>internal/server/</code> unless stated otherwise.</p>

<div class="tldr"><p>In one sentence: GitHub only sends events and receives results; deciding, scheduling, merging, tagging and publishing all happen in Kiln's server, chained together by one habit: every state change commits in the same transaction as the message it causes.</p></div>

<h2>Who talks to whom</h2>
<figure class="fl"><div class="fc"><div class="fn "><b>GitHub</b><small>App on your own account</small></div><div class="fa v"><span>webhook</span><i></i></div><div class="fn hi wide"><b>kiln-server</b><small>Postgres is the only state · only it writes to GitHub</small></div><div class="fa v"><span>hands out work to machines that poll for it; publishes artifacts</span><i></i></div><div class="fg"><div class="fn "><b>kiln-runner × N</b><small>CI: host / Docker / BuildKit</small></div><div class="fn "><b>kiln-orca × N</b><small>AI: Orca + Codex / Claude Code</small></div><div class="fn dash"><b>Release targets</b><small>Release · npm · images · HTTP</small></div></div></div><figcaption>Build and AI machines connect outward, so they can sit at home or behind NAT; the GitHub App key and release credentials live only on the server, and only the server writes to GitHub.</figcaption></figure>
<p>Inside the server, CI and AI are separate domains with different tables, schedulers and wire protocols (<code>runner.v1</code> and <code>airunner.v2</code>). They meet only in the assembly file <code>server.go</code>, through narrow interfaces, or through events in a shared outbox table. <code>internal/archtest</code> fails the tests if one domain imports another or queries its tables, so the boundary is checked by a machine, not just described in a doc.</p>

<h2>One real pass through the loop</h2>
<p>Kiln builds itself with Kiln. On 22 November 2026, the day after it was open-sourced, three i18n issues labelled <code>kiln:ready</code> went through the whole chain. Times are UTC, from commit and tag metadata; review outcomes are from the PR pages.</p>
<div class="tw"><table>
<thead><tr><th>Time</th><th>What happened</th><th>Who</th></tr></thead>
<tbody>
<tr><td>09:44</td><td>Pushed to <code>kiln/dev-6</code> for issue #2; PR #9 opened</td><td>Claude Code writes; server opens the PR</td></tr>
<tr><td>after 09:44</td><td>19 checks run. AI review fails: one medium finding, a test that could not catch the bug it claimed to cover</td><td>Codex, as a PR review</td></tr>
<tr><td>10:07</td><td>Repair round 1: test rewritten, disposition comment posted</td><td>Claude Code</td></tr>
<tr><td>before 10:19</td><td>Second review passes; <code>kiln:merge</code> added</td><td>Codex; server</td></tr>
<tr><td>10:19</td><td>Squash-merged as <code>11deef3</code>; tag <code>v1.0.3</code> created on it</td><td>kiln-runner[bot]</td></tr>
<tr><td>10:20</td><td>Release v1.0.3 published (12 assets); issue #2 closed</td><td>server</td></tr>
</tbody>
</table></div>
<p>PR #10 also took one repair round (merged 11:41, v1.0.4); PR #11 passed review first time (merged 12:32, v1.0.5). From first commit to public release: 36, 45 and 13 minutes.</p>

<h2>The CI part: from webhook to a green Check Run</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>Intake</b><small>verify · store · reply 202</small></div><div class="fa "><span>processed in background</span><i></i></div><div class="fn "><b>Plan</b><small>whole job graph fixed</small></div><div class="fa "><span>dependencies done</span><i></i></div><div class="fn hi"><b>Action key</b><small>fingerprint of all inputs</small></div></div><div class="fa v"><span>no cache hit</span><i></i></div><div class="fr"><div class="fn "><b>Acquire</b><small>one tx: epoch+1 · lease</small></div><div class="fa "><span>heartbeats</span><i></i></div><div class="fn "><b>Runner executes</b><small>sees only its inputs</small></div><div class="fa "><span>Complete</span><i></i></div><div class="fn "><b>Outbox</b><small>writes Check Run</small></div></div><div class="fo"><span class="ok">✓ cache hit: job succeeds without a runner</span></div><figcaption>The action key is where this chain saves time: a job whose inputs have not changed does not run again.</figcaption></figure>
<h3>1. Intake: verify, store, answer</h3>
<p>GitHub posts the event to <code>/webhook</code>. The handler checks the HMAC-SHA256 signature with a constant-time comparison, stores the event in <code>events</code> keyed by delivery id, and returns 202. Nothing else happens in the request.</p>
<p>A background loop then processes stored events one by one. Installations from accounts outside <code>KILN_ALLOWED_ACCOUNTS</code> are rejected and uninstalled; pull requests from forks are always dropped, with no switch to allow them; an event already superseded by a newer one for the same ref is skipped.</p>
<p class="where"><code>ingest/webhook.go:35</code> · <code>ingest/event.go:159</code> · <code>ingest/push.go:308</code></p>
<h3>2. Plan: the job graph is fixed before anything runs</h3>
<p>The planner reads <code>.kiln/workflows/*.yml</code> at the commit being built. For a PR that is the head commit, not a merge with the target branch. The syntax follows GitHub Actions minus <code>uses:</code>; expressions can only reference values known at planning time, so matrices, <code>if:</code> and <code>needs</code> are fully expanded here.</p>
<p>The run, its jobs, concurrency-group membership and the first Check Run records are written in one transaction. A broken workflow still produces a run, marked failed immediately, so the commit shows a red check carrying the error.</p>
<p class="where"><code>ci/planner/planner.go:234,342</code> · <code>internal/workflow/</code></p>
<h3>3. Don't build what was already built</h3>
<p>When a job's dependencies finish, the engine hashes everything that can affect it into an action key: the digest of its input files, env, steps, image digest, runtime digests, upstream output digests. Secrets count by name only.</p>
<p>If <code>action_cache</code> has the key, the job succeeds without touching a runner; if an identical job is already running, this one follows its result. That is why Kiln's own workflow keeps the version-stamped build in a separate job: after merge, the tests keep the same key and are not rerun.</p>
<p class="where"><code>ci/engine/engine.go:205,372</code></p>
<h3>4. Acquire: claim, epoch+1 and lease in one transaction</h3>
<p>Runners hold a long-poll <code>Acquire</code> open. The scheduler locks the runner's row, takes up to 300 candidate jobs with <code>FOR UPDATE SKIP LOCKED</code> in priority-then-age order, and filters by platform, pool, executor, declared CPU and memory (against that machine's free capacity) and per-repo concurrency limits.</p>
<p>The chosen job becomes <code>running</code>, its <code>epoch</code> increments, an attempt row is inserted and a lease is set, <strong>in that same transaction</strong>. Every later write from the runner must carry the matching epoch, so a runner that lost its lease can never overwrite a newer attempt.</p>
<p class="where"><code>ci/scheduler/reserve.go:211,730</code> · <code>ci/runnerapi/scheduler.go:140</code></p>
<h3>5. Execute on the runner</h3>
<p>The runner checks out only the files the job's <code>inputs</code> match, with no <code>.git</code>; installs Go, Node and pnpm verified against digests in <code>.kiln/runtimes.lock</code>; pulls upstream outputs from the content-addressed store; and runs steps on the host or in a container. Container jobs default to <code>--network none</code>.</p>
<p>Source is fetched with a token the server issues for that one fetch, scoped to that one repository, and revokes afterwards. Secrets arrive over RPC, live only in step environment variables, and are masked in logs in raw, base64 and URL-encoded form.</p>
<p>Heartbeats every few seconds renew the lease and carry cancellation back. Outputs go to presigned upload URLs, and <code>Complete</code> ends the attempt and writes the cache entry.</p>
<p class="where"><code>internal/runner/execute.go:61</code> · <code>internal/runner/source.go:178</code> · <code>ci/runnerapi/runnerapi.go:392</code></p>
<h3>6. Report through the outbox</h3>
<p>Each state change writes an outbox row in the same transaction. The row holds only an id, so several changes collapse into one pending delivery. A worker turns rows into Check Runs, looking up by external id before creating, with exponential backoff and a dead-letter state after 20 tries.</p>
<p>When the last job of a PR's run finishes, the engine emits <code>pr.verified</code>. The merge queue and AI development both wait on that one event.</p>
<p class="where"><code>outbox/worker.go:86</code> · <code>ci/cicheck/checkrun.go:40</code> · <code>server.go:390</code></p>

<h2>From green checks to a release</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>CI + AI review</b><small>on the PR head</small></div><div class="fa "><span>pr.verified: all required pass</span><i></i></div><div class="fn hi"><b>Merge queue</b><small>one executor per repo</small></div><div class="fa "><span>merges; tag recorded in same tx</span><i></i></div><div class="fn "><b>Auto-tag</b><small>next vX.Y.Z</small></div></div><div class="fa v"><span>plans the tag's run directly</span><i></i></div><div class="fn "><b>Publish job</b><small>runs on the server</small></div><div class="fo"><span class="lp">↺ behind the target branch: queue updates it, new head is verified again</span></div><figcaption>The only loop is the branch update: a PR that fell behind is updated by the queue and must pass again on the new head before it merges.</figcaption></figure>
<h3>Merge queue</h3>
<p>Kiln uses neither GitHub's merge queue nor branch protection. A PR enters the queue when someone adds <code>kiln:merge</code>, or automatically once every entry under <code>required</code> has passed, if <code>.kiln/merge.yml</code> on the default branch sets <code>auto: true</code>. That config is read only from the default branch, so a PR cannot lower its own bar.</p>
<p>Each repository has one executor, holding a Postgres advisory lock. Every pass re-reads the PR from GitHub and decides from scratch: wait, update the branch, merge, or remove it with a reason. The merge request carries the head SHA it verified, and GitHub refuses if the head has moved.</p>
<p class="where"><code>mergequeue/process.go:46,894</code> · <code>mergequeue/decide.go:208</code> · <code>mergequeue/autoenqueue.go:85</code></p>
<h3>Auto-tag and publish</h3>
<p>The merge, the queue-entry update and a tag record commit together. The tag worker reads existing tags, picks the next version (patch by default; <code>release:minor</code>, <code>release:major</code> and <code>release:skip</code> labels change that), creates the ref, then calls the CI planner directly to plan a push run for the tag.</p>
<p>A job with a <code>release:</code> block has no steps and never reaches a runner. The server stages every target first (npm integrity check, image layers pushed by digest, a draft GitHub Release), passes a last cancel point, then commits in the order npm, image tags, HTTP uploads, GitHub Release. On a rerun, identical content already on a target counts as success.</p>
<p class="where"><code>autotag/autotag.go:315,684,932</code> · <code>ci/publish/job.go:52</code> · <code>ci/publish/targets.go:44</code></p>

<h2>The AI loop on top</h2>
<p>An AI node is a machine with the Orca desktop app and the <code>kiln-orca</code> connector. Its role, review or development, is fixed by its enrolment token. The connector takes a task, starts a coding agent in a fresh Orca worktree, and hands the result back. The agent's only way to talk to Kiln is the <code>kiln-orca task</code> command; the <a href="/posts/kiln-orca-connector-en/">companion post</a> covers that side.</p>
<h3>Independent review</h3>
<p>Opening or pushing to a PR plans a review request alongside the CI runs. The review brief, <code>.kiln/agent/review.md</code>, is read from the PR's base, so a PR cannot rewrite its own review standard. The agent must return a strict JSON report; only "no issues" passes. The result is posted as a PR review and as the <code>ai-review</code> check.</p>
<p>The server records which agents worked on each development item and refuses to give the review to any of them: checked once when planning and again when a node tries to take the task. Kiln's own config has Claude Code developing and Codex reviewing.</p>
<p>The review brief requires mutation checks: break the changed logic in a scratch copy and confirm a test fails. Both failed reviews in the table above were of that kind.</p>
<p class="where"><code>ai/review/plan.go:135,568</code> · <code>ai/review/tasktype.go:104,178</code> · <code>ai/review/publish.go:124</code></p>
<h3>Development from an issue</h3>
<figure class="fl"><div class="fr"><div class="fn "><b>developing</b><small>claimed from the pool</small></div><div class="fa "><span>agent delivers</span><i></i></div><div class="fn "><b>delivering</b><small>server checks it</small></div><div class="fa "><span>server pushes, opens PR</span><i></i></div><div class="fn hi"><b>pr_open</b><small>waits for CI · review · merge</small></div></div><div class="fa v"><span>merge queue merges</span><i></i></div><div class="fn "><b>merged</b></div><div class="fo"><span class="lp">↺ findings / CI red / conflict: fixing, same PR</span><span class="lp">rounds used up: blocked, waits for a person</span></div><figcaption>Work-item states in dev_work_items (terminal states stopped and no_change omitted). A repository runs one unfinished item at a time; waiting in pr_open holds no node capacity.</figcaption></figure>
<ul>
<li><strong>Pool.</strong> Open issues carrying <code>kiln:ready</code> are mirrored into <code>dev_pool</code> from Issues webhooks.</li>
<li><strong>Select and claim.</strong> A development node is offered the candidates, picks a batch that fits one PR, and claims it; the server re-reads each issue from GitHub before accepting.</li>
<li><strong>Deliver.</strong> The agent designs and implements in one run and pushes to a throwaway <code>kiln/attempt-&lt;id&gt;</code> branch. If it judges one PR is not enough, it first delivers a Markdown-only design PR; the server starts implementation automatically once that merges.</li>
<li><strong>Promote.</strong> The server checks the delivery, fast-forwards the formal branch <code>kiln/dev-&lt;item&gt;</code> with a short-lived token of its own, and opens the PR itself. Agent-written titles and bodies are defused so they cannot mention people or close unrelated issues.</li>
<li><strong>Hold.</strong> Deliveries that touch <code>.kiln/</code>, <code>.github/</code>, <code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>.claude/</code> or <code>.codex/</code>, exceed 300 files or 100 commits, or declare a change to one of the project's 23 confirmed decisions get <code>kiln:hold</code> and wait for a person.</li>
<li><strong>Repair.</strong> Review findings, real CI failures and merge conflicts each send the same item back for another round on the same PR, up to <code>max_fix_rounds</code> (10 in Kiln's own config).</li>
</ul>
<p class="where"><code>ai/aidev/pool.go:49</code> · <code>ai/aidev/claim.go:84</code> · <code>ai/aidev/executor.go:224,627</code> · <code>ai/aidev/fix.go:162</code> · <code>ai/aidev/state.go:14</code></p>

<h2>Four rules that keep it consistent</h2>
<div class="tw"><table>
<thead><tr><th>Rule</th><th>What it prevents</th><th>Where</th></tr></thead>
<tbody>
<tr><td>A state change and its outbound message commit together</td><td>A green job with no Check Run; a merge with no tag record</td><td><code>outbox/</code>, shared by all domains</td></tr>
<tr><td>Every job and task write carries the epoch</td><td>A runner that lost its lease overwriting a newer attempt</td><td><code>ci/engine/engine.go:569</code>, <code>ai/lease.go:21</code></td></tr>
<tr><td>One executor per object, deciding from fresh state</td><td>Two processes merging or tagging the same thing; acting on stale reads</td><td><code>mergequeue/process.go:43</code>, <code>autotag/autotag.go:315</code></td></tr>
<tr><td>Writes without an idempotency key record intent first and are never blindly retried</td><td>Duplicate comments, reviews or issue closures after a lost response</td><td><code>mergequeue/closeissues.go:180</code>, <code>ai/review/publish.go:124</code></td></tr>
</tbody>
</table></div>
<div class="tldr"><p>A fifth, narrower rule: no build or AI machine stores a git credential. Each clone, fetch or push asks the server for a token scoped to one repository, and the server revokes it when the operation or the attempt ends (<code>gitcred/</code>).</p></div>

<h2>What you configure</h2>
<div class="tw"><table>
<thead><tr><th>File or label</th><th>Controls</th><th>Read from</th></tr></thead>
<tbody>
<tr><td><code>.kiln/workflows/*.yml</code></td><td>Jobs, matrices, containers, services, release targets</td><td>The commit being built</td></tr>
<tr><td><code>.kiln/runtimes.lock</code></td><td>Go, Node, pnpm, Bun versions and per-platform digests</td><td>The commit being built</td></tr>
<tr><td><code>.kiln/merge.yml</code></td><td>Merge method, required checks, auto-enqueue, tag rule, allowed target branches</td><td>Default branch only</td></tr>
<tr><td><code>.kiln/agent/config.yml</code></td><td>Who reviews, who develops, platforms, timeouts, repair rounds</td><td>Review: PR head; development: default branch</td></tr>
<tr><td><code>review.md</code> / <code>development.md</code></td><td>The briefs given to the two agents</td><td>PR base / default branch</td></tr>
<tr><td><code>kiln:ready</code> / <code>kiln:skip</code></td><td>Put an issue into / keep it out of the AI task pool</td><td>Issue</td></tr>
<tr><td><code>kiln:merge</code> / <code>kiln:hold</code></td><td>Enter the merge queue / block auto-enqueue</td><td>PR</td></tr>
<tr><td><code>release:minor</code> / <code>major</code> / <code>skip</code></td><td>Version bump for the tag created after merge</td><td>PR, frozen at merge</td></tr>
</tbody>
</table></div>
<p>Secrets, variables and environments are stored in Kiln, encrypted with the server's master key, not in GitHub settings. Logs, artifacts and caches are kept for 12 hours; only results are kept long-term.</p>

<h2>What I took away</h2>
<p>I read six subsystems in depth and found no high-severity defects; what is worth fixing clusters around the things the design assumes are friendly. For example: when a missed webhook is recovered by reconciliation, the push loses its "was this a bot" flag, so a third-party bot's tag can still publish; the write token a development node can get covers the whole repository; and <code>kiln:ready</code> approves an issue number, not its text, so an edited issue body is what the agent builds. Each of these only matters once the trust boundary widens: a third-party bot with push access, a prompt-injected agent, a malicious dependency.</p>
<p>The bigger risks are not in the code: there is a single human maintainer, the design docs live in a private Outline, and CI logs are not public.</p>
</div>
