---
author: "Shumin Fu"
pubDatetime: 2026-10-15T10:07:30+08:00
title: "Why Claude Dispatch and Grok's Primary Bot Point to the Next Agent Design"
slug: front-desk-agent
featured: false
draft: false
tags:
  - "ai-agents"
  - "workflow"
description: "Claude Dispatch and Grok's Primary Bot both put one orchestrating agent between you and your other agents. Why that design cuts the load of managing many agents, and what is still hard."
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed" lang="en">
<p><strong>Bottom line:</strong> the next big shift in agents is not a smarter worker. It is a better <em>front desk</em>. You talk to one agent, in one long conversation. It hands work to other agents, keeps track of all of them, and only taps you on the shoulder when you really need to know something.</p>
<p>Two products shipped this year that point the same way: <strong>Claude Dispatch</strong> and <strong>Grok Bot's Primary Bot</strong>. They look like small features. I think they are the shape of what comes next.</p>
<hr>
<h2>1. The problem: we became managers by accident</h2>
<p>A year ago, "using an agent" meant one chat window and one task.</p>
<p>Now it means five sessions, three terminals, a couple of cloud runs, and a bot on your phone. Each one can work for an hour without you. That sounds great. But somebody still has to:</p>
<ul><li>remember which session is doing what,</li><li>notice which one is stuck,</li><li>answer its questions,</li><li>read its results,</li><li>and decide what happens next.</li></ul>
<p>That somebody is you. You did not ask for a team, but you got one, and now you are its manager.</p>
<p>People are feeling it. Simon Willison said on Lenny's Podcast (April 2026) that running several agents at once made him faster, but left him drained by mid-morning. Addy Osmani wrote about <a href="https://addyosmani.com/blog/cognitive-parallel-agents/">your "parallel agent limit"</a>: more agents running does not mean more of <em>you</em> available. Other writers say the same thing in different words — the <a href="https://sep.com/blog/where-ai-fatigue-actually-comes-from/">tiring part is the switching</a>, not the decisions.</p>
<p>The research has said this for a long time:</p>
<ul><li><strong>Gloria Mark</strong> followed office workers and found that interrupted work was picked back up after about 23 minutes on average, often with two other tasks in between (<a href="https://news.gallup.com/businessjournal/23146/too-many-interruptions-work.aspx">Gallup interview</a>). The exact number is not the point. The order of size is: <em>tens of minutes</em>, not seconds.</li><li><strong>Sophie Leroy</strong> (2009) named <em>attention residue</em>: when you switch tasks, part of your mind stays stuck on the old one, and you do the new one worse.</li></ul>
<p>So the limit is not compute. It is the human's head. Every extra agent adds a little weight to it.</p>
<blockquote><p>Picture a kitchen with ten great cooks and no head chef. The food is good. The person at the pass is exhausted.</p></blockquote>
<hr>
<h2>2. Two products, one idea</h2>
<h3>Claude Dispatch</h3>
<p><a href="https://claude.com/docs/cowork/guide/dispatch">Dispatch</a> is a long-running agent in Claude's desktop app. You get <strong>one</strong> conversation with it. You describe an outcome. It splits the work, starts each piece as its own Cowork or Code session, and shows the results in the sidebar when they finish. Anthropic's help center says the thread <a href="https://support.claude.com/en/articles/13947068">does not reset</a> — it keeps context from earlier tasks.</p>
<p>A few details in the docs matter a lot:</p>
<ul><li><strong>It is a router, not a worker.</strong> Coding goes to Code, knowledge work goes to Cowork.</li><li><strong>Children don't have children.</strong> Child tasks cannot spawn more tasks. The tree is one level deep.</li><li><strong>Each child has a clear state:</strong> running, awaiting input, awaiting answer, completed, error, archived.</li><li><strong>Permission prompts are forwarded to you</strong> — and if you don't answer in ten minutes, the request is denied and the task goes on without it. The system does not freeze while waiting for you.</li></ul>
<p>The Dispatch agent's tools make the design even clearer. It has roughly four verbs: start a task, send a message to a task, read a task's transcript, and send a message to the user. It does not do the work itself. It can only <strong>delegate, steer, check, and report</strong>.</p>
<p>That small tool list is the most interesting design choice. It forces the front desk to stay a front desk.</p>
<h3>Grok Bot's Primary Bot</h3>
<p>Grok Bot (from xAI, now SpaceXAI) added a <strong>primary Bot</strong> in early October 2026. Its changelog entry for version 0.67.0 says the starred primary Bot will now spot work it can take off your plate and offer to handle it. <a href="https://www.progressiverobot.com/2026/10/02/primary-bot-grok-4-7-base-model-proactive-grok-bot/">Coverage of the launch</a> describes it as a main assistant that sits above your other Bots, routes tasks to the right one, and "checks in when it needs your help." Bots can also start a <em>Project</em>: a cloud agent that plans the work and runs its own agents.</p>
<p>One example from that coverage: after a flight was rebooked, the Bot noticed the Uber pickup still pointed to the old flight, and said so without being asked.</p>
<h3>Same shape</h3>
<table><thead><tr><th></th><th>Claude Dispatch</th><th>Grok Primary Bot</th></tr></thead><tbody><tr><td>One entry point</td><td>One persistent Dispatch thread</td><td>One starred primary Bot</td></tr><tr><td>Delegates to</td><td>Cowork / Code sessions</td><td>Your other Bots, Projects</td></tr><tr><td>Does the work itself?</td><td>No — orchestrates only</td><td>Mostly routes</td></tr><tr><td>Talks to you when</td><td>A task finishes, asks, or needs permission</td><td>It needs help, or spots work to offer</td></tr><tr><td>Memory</td><td>The long thread keeps context</td><td>Knows what the other Bots are doing</td></tr></tbody></table>
<p>Two companies reached the same design separately. That suggests it answers a real problem.</p>
<hr>
<h2>3. Three design ideas inside</h2>
<p>I see three ideas stacked on top of each other.</p>
<h3>Idea 1 — One door</h3>
<p>You should not need to know which agent does what. You tell the front desk. The front desk picks the right room.</p>
<p>This is the classic <strong>orchestrator–worker</strong> pattern. Anthropic's own <a href="https://www.anthropic.com/engineering/multi-agent-research-system">multi-agent research system</a> uses it: a lead agent plans and spawns subagents that search in parallel, then it pulls the results together. On Anthropic's internal research eval, an Opus lead with Sonnet workers beat a single Opus agent by 90.2%.</p>
<p>But Dispatch and Primary Bot move the pattern up one level. The orchestrator is no longer hidden inside one task. <strong>It becomes the product's front door.</strong> The user talks to the orchestrator, not to the workers.</p>
<h3>Idea 2 — Quiet by default</h3>
<p>A good front desk does not call you every time a package arrives. It calls when the package is yours, it is urgent, or it is broken.</p>
<p>So the second idea is a filter: <strong>only send what the user should know.</strong> In Dispatch, that's a separate tool (send a message to the user) — talking to you is a deliberate act, not a side effect of working. In Primary Bot, it "checks in when it needs your help."</p>
<p>This is also old research. In 1999, Eric Horvitz and colleagues at Microsoft Research wrote <a href="https://arxiv.org/abs/1301.6707"><em>Attention-Sensitive Alerting</em></a>. Their idea in one line: before you interrupt someone, weigh <strong>the cost of interrupting now</strong> against <strong>the cost of waiting</strong>. Interrupt only when waiting costs more. Their later work called attention "a rare commodity and critical currency" (<a href="https://erichorvitz.com/cacm-attention.htm">CACM 2003</a>).</p>
<p>And before that, in 1995, Mark Weiser and John Seely Brown at Xerox PARC wrote about <a href="https://calmtech.com/papers/designing-calm-technology"><em>calm technology</em></a>: technology that "informs but doesn't demand our focus." Things live in the <em>periphery</em> — like the engine sound in a car — and move to the <em>center</em> only when something is off.</p>
<p>A front-desk agent is calm technology for agent work. The workers hum in the background. The front desk brings one thing to the center when it matters.</p>
<h3>Idea 3 — Let the long session hold it, not your head</h3>
<p>This is the idea I care about most.</p>
<p>The real cost of many agents is not clicking between windows. It is <strong>holding the map in your head</strong>: what's running, what's blocked, what was decided, what's next. That map is heavy.</p>
<p>The front desk's long conversation is where the map lives instead. It remembers what you asked last week. It knows which child is stuck. It can answer "where are we on X?" without you opening five tabs. You stop being the system's memory.</p>
<blockquote><p>Think of it like a good assistant with a notebook. You don't remember every meeting. You ask them. Your head is free for the actual decisions.</p></blockquote>
<p>That's why the "one long session" part is not a detail. A Dispatch thread that resets each time would just be a launcher. A thread that <em>remembers</em> is a partner.</p>
<p>LangChain's Harrison Chase has pushed a related idea he calls <a href="https://www.langchain.com/blog/introducing-ambient-agents"><em>ambient agents</em></a>: agents that run on event streams and ask for you only when something important comes up — to "save your attention for when it matters most." The front desk is the natural home for ambient agents: one place where all their questions arrive, already sorted.</p>
<hr>
<h2>4. Why I think this is the future style</h2>
<ol><li><strong>The bottleneck moved.</strong> Models got cheap and fast enough to run many in parallel. The scarce thing now is human attention. Products will win by spending less of it.</li><li><strong>It scales without scaling you.</strong> Ten workers under one front desk cost you about the same attention as one front desk. Ten loose sessions cost you ten.</li><li><strong>It matches how people already delegate.</strong> Nobody manages a company by sitting in every meeting. They have a chief of staff, a single inbox, and weekly summaries.</li><li><strong>It works across devices.</strong> Dispatch can be started from your phone and run on your desktop. One thread is easy to carry. Ten sessions are not.</li><li><strong>Separate roles make each part simpler.</strong> Workers can be narrow and disposable. The front desk can be careful, slow, and long-lived. Each does one job well.</li></ol>
<hr>
<h2>5. The hard parts (not solved yet)</h2>
<p>The idea is simple. Doing it well is not.</p>
<ul><li><strong>The filter can be wrong both ways.</strong> Too loud, and you're back to notification hell. Too quiet, and a broken task sits for hours while you think all is fine. <em>False silence</em> is worse than noise, because you don't know it happened.</li><li><strong>Trust needs a window.</strong> If the front desk says "done," you need a cheap way to check. Dispatch keeps every child transcript one click away. That should be a rule, not a nice-to-have. A report is a claim, not proof.</li><li><strong>The long session gets long.</strong> A thread that lives for weeks will outgrow any context window. It needs good summaries, a memory store, and a way to forget safely. This is mostly an engineering problem, but it decides whether the "partner" feeling survives month two.</li><li><strong>Waiting for the human is a design choice.</strong> Dispatch denies a permission request after ten minutes and keeps going. That's a clear stance: <em>the user's silence is not a blocker.</em> Other products will pick other stances. Each one needs to be visible to the user.</li><li><strong>Proactive can turn pushy.</strong> Primary Bot offering work "before you ask" is powerful. It also means the agent decides what deserves your attention. Grok reportedly doesn't charge for suggestions, which removes one brake on how often it suggests. The Horvitz rule — interrupt only when waiting costs more — still has to be enforced somewhere.</li><li><strong>One door is one point of failure.</strong> If the front desk misunderstands you, every worker inherits that mistake. A good front desk confirms the brief before it fans out.</li><li><strong>Depth limits matter.</strong> Dispatch keeps the tree one level deep. That's probably wise for now. Deep trees of agents managing agents are hard to watch and hard to stop.</li></ul>
<hr>
<h2>6. A small checklist for building a front-desk agent</h2>
<p>If you are building one, here is what I'd copy from these two products:</p>
<ol><li><strong>Give the front desk only orchestration tools.</strong> Start, message, read, report. If it can do the work itself, it will, and it stops being a front desk.</li><li><strong>Make "tell the user" a separate, deliberate tool.</strong> Not every step. Not every finish. Only what the user should know.</li><li><strong>Give every child a visible state.</strong> Running, waiting on you, done, failed. The user should see the whole board in one glance — without having to ask.</li><li><strong>Keep transcripts one click away.</strong> Summaries for speed. Raw logs for trust.</li><li><strong>Never block on the human forever.</strong> Pick a timeout and a default, and say what they are.</li><li><strong>Make the long thread remember, then compress.</strong> Memory is the product. Plan for month two.</li><li><strong>Keep the tree shallow</strong> until you have good tools to watch deep ones.</li></ol>
<hr>
<h2>Closing</h2>
<p>We spent two years making agents better at <em>doing</em>. The next step is making them better at <em>not bothering us</em> — and at holding the whole picture so we don't have to.</p>
<p>The future agent is not ten windows you babysit. It is one conversation that runs the room, stays quiet, and taps you on the shoulder only when it counts.</p>
<p>In short: one door in, many workers behind it, and fewer things for you to keep in your head.</p>
<hr>
<h3>Sources</h3>
<ul><li>Claude docs — <a href="https://claude.com/docs/cowork/guide/dispatch">Run tasks in the background with Dispatch</a></li><li>Claude Help Center — <a href="https://support.claude.com/en/articles/13947068">Assign tasks to Claude from anywhere in Cowork</a></li><li>xAI — <a href="https://x.ai/changelog/bot">Grok Bot changelog</a> (v0.67.0, 2 Oct 2026)</li><li>Progressive Robot — <a href="https://www.progressiverobot.com/2026/10/02/primary-bot-grok-4-7-base-model-proactive-grok-bot/">Primary Bot: Quick, Smart and Proactive, Now on Grok 4.7</a></li><li>TestingCatalog — <a href="https://x.com/testingcatalog/status/2105619522514190357">post on Primary bot</a></li><li>Anthropic Engineering — <a href="https://www.anthropic.com/engineering/multi-agent-research-system">How we built our multi-agent research system</a></li><li>Horvitz, Jacobs, Hovel — <a href="https://arxiv.org/abs/1301.6707">Attention-Sensitive Alerting (UAI 1999)</a></li><li>Horvitz et al. — <a href="https://erichorvitz.com/cacm-attention.htm">Models of Attention in Computing and Communication (CACM 2003)</a></li><li>Weiser &amp; Brown — <a href="https://calmtech.com/papers/designing-calm-technology">Designing Calm Technology (1995)</a></li><li>Gallup — <a href="https://news.gallup.com/businessjournal/23146/too-many-interruptions-work.aspx">Too Many Interruptions at Work? (Gloria Mark interview)</a></li><li>Leroy, S. (2009). <em>Why Is It So Hard to Do My Work? The Challenge of Attention Residue When Switching Between Work Tasks.</em> Organizational Behavior and Human Decision Processes.</li><li>Addy Osmani — <a href="https://addyosmani.com/blog/cognitive-parallel-agents/">Your parallel agent limit</a></li><li>SEP — <a href="https://sep.com/blog/where-ai-fatigue-actually-comes-from/">Where AI fatigue actually comes from</a></li><li>LangChain — <a href="https://www.langchain.com/blog/introducing-ambient-agents">Introducing ambient agents</a></li></ul>
</div>
