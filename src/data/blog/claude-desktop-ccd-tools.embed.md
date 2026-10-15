---
author: "Shumin Fu"
pubDatetime: 2026-10-15T10:50:32+08:00
modDatetime: 2026-10-14T22:50:32+08:00
title: "How the Claude Desktop App's Own Tools Work"
slug: claude-desktop-ccd-tools
featured: false
draft: false
tags:
  - "claude-code"
  - "ai-agents"
description: "The Claude desktop app gives its agent a set of mcp__ccd_* tools that drive the app itself: the to-do list, other sessions, panes and the sidebar. What they are, how the to-do list really gets ticked, and what they don"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed" lang="en">
<p>The Claude desktop app gives its agent a private set of tools, all named <code>mcp__ccd_*</code>. They do not touch your code. They let the agent drive the app itself: show a to-do list, start other sessions, open panes, and tidy the sidebar.</p>
<h2>What MCP and "ccd" are</h2>
<p>MCP is a plug socket for tools; ccd is the desktop app plugging its own controls into that socket.</p>
<ul>
<li><strong>MCP</strong> (Model Context Protocol) is an open standard for giving an agent extra tools. Any program can offer tools through it: Jira, a browser, a database.</li>
<li><strong>ccd</strong> is the name prefix the desktop app uses for its own tools. It most likely stands for <em>Claude Code Desktop</em>; no public doc spells this out.</li>
<li>Every tool name has three parts: <code>mcp__</code> + the server name + <code>__</code> + the tool. So <code>mcp__ccd_turn__update_plan</code> = the app's <code>ccd_turn</code> server, tool <code>update_plan</code>.</li>
</ul>
<p>The key point: these tools act on <strong>the app around the agent</strong>, not on your project. Reading and editing your files still uses ordinary tools like <code>Read</code>, <code>Edit</code> and <code>Bash</code>.</p>
<h2>At a glance</h2>
<figure class="ccd-figure">
<svg viewBox="0 0 760 362" role="img" aria-label="The agent drives the app through ccd tools; your files go through ordinary tools" font-size="13" style="width:100%;height:auto;font-family:inherit">
<defs>
<marker id="ccd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--foreground);opacity:.55"/></marker>
<marker id="ccd-accent-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--accent)"/></marker>
</defs>
<text x="24" y="34" font-size="15" font-weight="600" style="fill:var(--foreground)">The agent drives the app through ccd tools; your files go through ordinary tools</text>
<g>
<rect x="24" y="114" width="120" height="72" rx="8" style="fill:none;stroke:var(--foreground);stroke-opacity:.45;stroke-width:1.25"/>
<text x="84" y="138" text-anchor="middle" font-weight="600" style="fill:var(--foreground)">You</text>
<text x="84" y="158" text-anchor="middle" font-size="11.5" style="fill:var(--foreground);opacity:.7">watch progress</text>
<text x="84" y="174" text-anchor="middle" font-size="11.5" style="fill:var(--foreground);opacity:.7">answer cards</text>
</g>
<g>
<rect x="176" y="72" width="264" height="192" rx="8" style="fill:var(--foreground);fill-opacity:.05;stroke:var(--foreground);stroke-opacity:.45;stroke-width:1.25"/>
<text x="308" y="96" text-anchor="middle" font-weight="600" style="fill:var(--foreground)">Claude desktop app</text>
<rect x="192" y="112" width="232" height="40" rx="8" style="fill:none;stroke:var(--foreground);stroke-opacity:.35"/>
<text x="308" y="136" text-anchor="middle" style="fill:var(--foreground)">To-do box and recap</text>
<rect x="192" y="160" width="232" height="40" rx="8" style="fill:none;stroke:var(--foreground);stroke-opacity:.35"/>
<text x="308" y="184" text-anchor="middle" style="fill:var(--foreground)">Session cards and notes</text>
<rect x="192" y="208" width="232" height="40" rx="8" style="fill:none;stroke:var(--foreground);stroke-opacity:.35"/>
<text x="308" y="232" text-anchor="middle" style="fill:var(--foreground)">Panes, sidebar, settings</text>
</g>
<g>
<rect x="560" y="114" width="176" height="72" rx="8" style="fill:var(--accent);fill-opacity:.12;stroke:var(--accent);stroke-width:2"/>
<text x="648" y="138" text-anchor="middle" font-weight="600" style="fill:var(--foreground)">Claude agent</text>
<text x="648" y="158" text-anchor="middle" font-size="11.5" style="fill:var(--foreground);opacity:.7">acts only through tools</text>
</g>
<g>
<rect x="560" y="290" width="176" height="48" rx="8" style="fill:none;stroke:var(--foreground);stroke-opacity:.45;stroke-width:1.25"/>
<text x="648" y="318" text-anchor="middle" style="fill:var(--foreground)">Your project files</text>
</g>
<g style="fill:none">
<path d="M144 150H176" style="stroke:var(--foreground);stroke-opacity:.55;stroke-width:1.25" marker-start="url(#ccd-arrow)" marker-end="url(#ccd-arrow)"/>
<path d="M560 150H440" style="stroke:var(--accent);stroke-width:2" marker-end="url(#ccd-accent-arrow)"/>
<path d="M648 186V290" style="stroke:var(--foreground);stroke-opacity:.55;stroke-width:1.25" marker-end="url(#ccd-arrow)"/>
</g>
<text x="500" y="140" text-anchor="middle" font-size="10.5" font-weight="600" style="fill:var(--foreground)">mcp__ccd_* calls</text>
<text x="638" y="242" text-anchor="end" font-size="11.5" style="fill:var(--foreground);opacity:.7">Read, Edit, Bash</text>
</svg>
</figure>
<p>You only ever see the app. The agent changes what the app shows by calling <code>mcp__ccd_*</code> tools, and it touches your project through separate file tools.</p>
<h2>The tool groups</h2>
<p>The app splits its tools into about ten servers, one per job.</p>
<table>
<thead><tr><th>Server</th><th>What it lets the agent do</th><th>Example tools</th></tr></thead>
<tbody>
<tr><td><code>ccd_turn</code></td><td>Show progress for the current turn</td><td><code>update_plan</code> (the to-do box), <code>wrap_up</code> (the end summary)</td></tr>
<tr><td><code>ccd_session</code></td><td>Start, hand off or withdraw other sessions</td><td><code>start_session</code>, <code>hand_off_to_session</code>, <code>dismiss_task</code>, <code>mark_chapter</code></td></tr>
<tr><td><code>ccd_session_mgmt</code></td><td>Manage existing sessions</td><td><code>list_sessions</code>, <code>set_session_model</code>, <code>archive_session</code>, <code>search_session_transcripts</code></td></tr>
<tr><td><code>ccd_sidebar</code></td><td>Organize the sidebar</td><td><code>create_group</code>, <code>set_pinned</code>, <code>mark_completed</code>, <code>set_unread</code></td></tr>
<tr><td><code>ccd_view</code></td><td>Open panes in the window</td><td><code>show_pane</code> (diff, terminal, PR, tasks), <code>close_pane</code></td></tr>
<tr><td><code>ccd_window</code></td><td>Arrange windows</td><td><code>open_session_in</code> (split view), <code>set_sidebar_collapsed</code></td></tr>
<tr><td><code>ccd_directory</code></td><td>Pick the working folder</td><td><code>change_directory</code>, <code>request_directory</code>, <code>propose_branch</code></td></tr>
<tr><td><code>ccd_pr</code></td><td>Follow a pull request</td><td><code>bind_pr</code>, <code>get_status</code>, <code>set_auto_merge</code></td></tr>
<tr><td><code>ccd_host</code></td><td>Act on the computer itself</td><td><code>sync_with_base_branch</code>, <code>open_in_editor</code>, <code>request_keep_awake</code></td></tr>
<tr><td><code>ccd_settings</code></td><td>Read or change app preferences</td><td><code>get_settings</code>, <code>set_setting</code> (each change needs the user's approval)</td></tr>
<tr><td><code>ccd_connectors</code></td><td>Manage connected services</td><td><code>session_connectors_status</code>, <code>reconnect_session_connector</code></td></tr>
</tbody>
</table>
<p>Most of these are <em>deferred</em>: the agent sees only the names until it loads a tool's full definition. This keeps the agent's working memory small until a tool is actually needed.</p>
<h2>Case study: the to-do list</h2>
<p>The to-do box under a message is drawn by the app, but every tick comes from the agent calling a tool. There is no hook doing it automatically.</p>
<ol>
<li><strong>The plan.</strong> With its first tool call of a task, the agent sends <code>update_plan</code> with the whole list: the first step <code>in_progress</code>, the rest <code>pending</code>. The app draws the box.</li>
<li><strong>Each tick.</strong> When a step is done, the agent sends <code>update_plan</code> with <code>{"advance": true}</code> alongside the call that starts the next step. For out-of-order work it sends <code>{"done": [1, 2], "start": 3}</code>.</li>
<li><strong>A changed plan.</strong> If the user redirects, the agent sends the full new list, so the box never shows an abandoned plan.</li>
<li><strong>The close.</strong> At the end the agent calls <code>wrap_up</code> with a short recap. This fills the next-step box and also ticks off the list.</li>
</ol>
<p>The agent's instructions also ask for a <code>scope</code> on each new list: <code>first_task</code>, <code>continuation</code> or <code>new_task</code>. A <code>new_task</code> makes the agent offer a fresh session first, instead of piling unrelated work onto a long one.</p>
<p>The weak spot is timing. If the agent moves on without sending <code>advance</code>, the box lags behind the real work. In one real run, step 1 kept spinning while a later command was already running, and two steps were ticked together afterwards.</p>
<h3>The data structure</h3>
<p><code>update_plan</code> takes either a whole list or a small change to the current one.</p>
<p><strong>The whole list</strong>, sent when a task starts or the plan changes:</p>
<pre><code>{
  "items": [
    { "content": "Load blog posting skill", "status": "completed" },
    { "content": "Add post to funfun-zone repo", "status": "in_progress" },
    { "content": "Build and check the post", "status": "pending" },
    { "content": "Commit and push to main", "status": "pending", "session": "blog-check" }
  ],
  "scope": "continuation"
}</code></pre>
<table>
<thead><tr><th>Field</th><th>Type</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>items</code></td><td>array, 1–12 entries</td><td>The whole list; it replaces the old one</td></tr>
<tr><td><code>items[].content</code></td><td>string</td><td>One step, about 7 words at most</td></tr>
<tr><td><code>items[].status</code></td><td><code>pending</code> / <code>in_progress</code> / <code>completed</code></td><td>Not started / being worked on / done</td></tr>
<tr><td><code>items[].session</code></td><td>string, optional</td><td>The name of another session this step was handed to</td></tr>
<tr><td><code>scope</code></td><td><code>first_task</code> / <code>continuation</code> / <code>new_task</code></td><td>How this request relates to earlier work; required with <code>items</code></td></tr>
</tbody>
</table>
<p><strong>A small change</strong>, sent as work moves on:</p>
<ul>
<li><code>{"advance": true}</code> finishes the current step and starts the next one.</li>
<li><code>{"done": [1, 2], "start": 3}</code> marks steps 1 and 2 done and starts step 3, counting from 1.</li>
</ul>
<p>The app answers with one short line, such as <code>Plan shown (4 steps).</code> or <code>Plan updated: step 3 of 4 is in progress.</code> The app works out "step 3 of 4" itself, so the real state of the list lives in the app. The agent only sends changes.</p>
<h3>Is the list fed back to the agent each turn?</h3>
<p>Not as far as the agent can see. No message on each turn says "here is your current to-do list."</p>
<p>The agent knows where it is from the conversation history instead. Its earlier <code>update_plan</code> calls and the app's replies stay in the record, and it reads them back. It is like keeping your own notebook: nobody reads it to you each morning, you just look at what you wrote.</p>
<p>That has two risks:</p>
<ul>
<li><strong>Long conversations get summarized.</strong> When old turns are compressed into a summary, the tool calls can disappear. If the summary does not record the list's state, the agent has to rebuild it from the summary.</li>
<li><strong>Two copies can drift.</strong> The app holds the real state; the agent holds a history of what it sent. If they disagree, the app's view is the true one.</li>
</ul>
<p>Claude Code's command-line <code>TodoWrite</code> tool reportedly sends the agent reminders about its list, but no such reminder appears in a desktop app session. Whether the app has a hidden fallback, such as closing a forgotten list when a turn ends, is not visible from the agent's side.</p>
<h2>Case study: starting other sessions</h2>
<p><code>start_session</code> lets one session act as a front desk: it hands work to new sessions and gets a short report back when they finish.</p>
<p>The <code>initiation</code> field says whose idea the new session is:</p>
<table>
<thead><tr><th><code>initiation</code></th><th>When it is used</th><th>What the user sees</th></tr></thead>
<tbody>
<tr><td><code>user_asked</code></td><td>The user asked for separate or parallel work</td><td>The session starts at once</td></tr>
<tr><td><code>offer</code></td><td>The user named a new task in their latest message</td><td>A card: "New session" or "Do it here"; nothing runs until they pick</td></tr>
<tr><td><code>own_initiative</code></td><td>The agent noticed follow-up work itself</td><td>A proposal card; nothing runs until the user starts it</td></tr>
</tbody>
</table>
<p>Two more rules shape it:</p>
<ul>
<li><code>context: "fork"</code> copies the whole conversation into the new session; <code>"fresh"</code> sends only a written brief plus at least 80 characters of background.</li>
<li>When a started session ends a turn, the app wakes the first session with a note quoting the first 400 characters of its report. The agent is told to treat that note as a claim and check the result before calling it done.</li>
</ul>
<p>This is the same idea as Claude Dispatch: one conversation hands out work, and the user hears back only when there is something to know.</p>
<h2>Limits</h2>
<p>The tools give the agent controls; they do not force it to use them well.</p>
<ul>
<li><strong>Ticks are not automatic.</strong> The to-do list is only as current as the agent's last <code>update_plan</code> call.</li>
<li><strong>The box depends on <code>wrap_up</code>.</strong> If the agent skips it, no recap appears and steps can stay unticked. Whether the app has a fallback for this is not visible from the agent's side.</li>
<li><strong>The user keeps the big decisions.</strong> Settings changes, folder access and session starts by offer all go through an approval card.</li>
<li><strong>Reports are short.</strong> A side session's note is cut at 400 characters, so details need a look at its transcript.</li>
</ul>
<h2>Sources</h2>
<ul>
<li>The tool names, fields and rules here come from the tool definitions and instructions the desktop app gives the agent, as seen from inside a session on 2026-10-14. They are not public documentation and may change between app versions.</li>
<li>The "ccd = Claude Code Desktop" reading is an inference from the names.</li>
<li><a href="https://modelcontextprotocol.io">Model Context Protocol</a> — the open standard the tools plug into.</li>
<li><a href="https://claude.com/docs/cowork/guide/dispatch">Claude docs: Dispatch</a> — the related front-desk product.</li>
</ul>
</div>
