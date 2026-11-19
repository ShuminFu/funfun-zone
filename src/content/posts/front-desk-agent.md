---
title: "Why Claude Dispatch and Grok's Primary Bot Point to the Next Agent Design"
description: "Claude Dispatch and Grok's Primary Bot both put one orchestrating agent between you and your other agents. Why that design cuts the load of managing many agents, and what is still hard."
growth: seedling
planted: 2026-10-15T10:07:30+08:00
lastTended: 2026-10-16T11:48:52+08:00
tags:
  - "ai-agents"
  - "workflow"
draft: false
---

<style>
.fd-fig *{box-sizing:border-box}
.fd-fig{margin:1.6em 0;display:flex;flex-direction:column;align-items:center;gap:6px;max-width:100%}
.fd-fig figcaption{font-size:.85em;opacity:.7;text-align:center;margin-top:.5em}
.fd-fig .fr{display:flex;align-items:center;justify-content:center;width:100%}
.fd-fig .fc{display:flex;flex-direction:column;align-items:center;width:100%}
.fd-fig .fr>.fc{flex:0 1 220px;width:auto;min-width:0}
.fd-fig .fn{background:var(--muted);border:1px solid transparent;border-radius:10px;padding:10px 14px;text-align:center;flex:0 1 190px;min-width:0}
.fd-fig .fn b{display:block;font-size:15px;font-weight:600;color:var(--foreground);line-height:1.35}
.fd-fig .fn small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.fd-fig .fn.hi{background:transparent;border:2px solid var(--accent)}
.fd-fig .fc>.fn{flex:none;width:min(100%,220px)}
.fd-fig .fa{flex:1 1 70px;min-width:56px;max-width:150px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 6px;font-size:13px;line-height:1.3;color:var(--muted-foreground);text-align:center}
.fd-fig .fa i{position:relative;display:block;width:100%;height:2px;background:currentColor}
.fd-fig .fa i::after{content:"";position:absolute;right:-2px;top:-4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.fd-fig .fa.back i::after{right:auto;left:-2px;border-left:0;border-right:8px solid currentColor}
.fd-fig .fa.acc{color:var(--accent)}
.fd-fig .fa.v{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.fd-fig .fa.v i,.fd-fig .fr .fa.v i{width:2px;height:30px}
.fd-fig .fa.v i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.fd-fig .fa.v.up i::after{bottom:auto;top:-2px;border-top:0;border-bottom:8px solid currentColor}
.fd-fig .fa.v span{width:auto;max-width:11em;text-align:left}
.fd-fig .fp{border:1px dashed var(--muted-foreground);border-radius:12px;padding:10px 10px 12px}
.fd-fig .pl{font-size:13px;color:var(--muted-foreground);text-align:center;margin-bottom:8px}
.fd-fig .fd-note{font-size:13px;color:var(--muted-foreground);text-align:center;margin-top:8px}
.fd-fig .fd-acc{color:var(--accent);font-weight:700}
.fd-fig .fn b.fd-acc{color:var(--accent)}
.fd-fig .fd-you{display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:44px;padding:0 14px;border-radius:999px;border:2px solid var(--accent);color:var(--accent);font-weight:700;font-size:15px}
.fd-fig .fd-vl{display:block;width:3px;height:26px;background:var(--accent)}
.fd-fig .fd-rake{display:block;width:2px;height:12px;background:var(--muted-foreground)}
.fd-fig .fd-mini{display:flex;justify-content:center;gap:6px;padding-top:12px;max-width:100%}
.fd-fig .fd-mini>span{position:relative;display:block;min-width:28px;min-height:22px;padding:6px 10px;border-radius:6px;background:var(--muted);font-size:13px;line-height:1.3;color:var(--muted-foreground);text-align:center}
.fd-fig .fd-mini>span:empty{padding:0}
.fd-fig .fd-mini>span::before{content:"";position:absolute;top:-12px;left:50%;width:2px;height:12px;margin-left:-1px;background:var(--muted-foreground)}
.fd-fig .fd-mini>span::after{content:"";position:absolute;top:-12px;left:-4px;right:-4px;border-top:2px solid var(--muted-foreground)}
.fd-fig .fd-mini>span:first-child::after{left:50%}
.fd-fig .fd-mini>span:last-child::after{right:50%}
.fd-fig .fd-cap{font-size:13px;color:var(--muted-foreground);margin-top:6px;text-align:center}
.fd-fig .fd-cmp{display:grid;grid-template-columns:1fr 1fr;width:100%}
.fd-fig .fd-side{display:flex;flex-direction:column;align-items:center;padding:4px 14px;min-width:0}
.fd-fig .fd-side+.fd-side{border-left:1px dashed var(--muted-foreground)}
.fd-fig .fd-side-h{font-weight:700;font-size:15px;color:var(--foreground);margin-bottom:12px}
.fd-fig .fd-side-f{margin-top:auto;padding-top:12px;font-size:13px;color:var(--muted-foreground);text-align:center}
.fd-fig .fd-hub{display:grid;grid-template-columns:repeat(3,auto);justify-content:center;align-items:center;justify-items:center;column-gap:14px}
.fd-fig .fd-hub .fd-ag{padding:5px 10px;border-radius:6px;background:var(--muted);font-size:13px;color:var(--muted-foreground)}
.fd-fig .fd-sp{display:block;width:2px;height:24px;background:var(--muted-foreground)}
.fd-fig .fd-sp.l{transform:rotate(-38deg)}
.fd-fig .fd-sp.c1{justify-self:end;margin-right:6px}
.fd-fig .fd-sp.r{transform:rotate(38deg)}
.fd-fig .fd-sp.c3{justify-self:start;margin-left:6px}
.fd-fig .fd-kids{flex:0 1 250px;display:flex;flex-direction:column;gap:8px;min-width:0}
.fd-fig .fd-kid{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:7px 12px;border-radius:6px;background:var(--muted);font-size:14px;color:var(--foreground)}
.fd-fig .fd-kid small{font-size:13px;color:var(--muted-foreground)}
.fd-fig .fd-kid small.fd-acc{color:var(--accent)}
.fd-fig .fd-r2{align-items:flex-end}
.fd-fig .fd-r2>.fa{align-self:flex-end;margin-bottom:26px}
.fd-fig .fd-evs{flex:0 1 170px;display:flex;flex-direction:column;gap:4px;min-width:0}
.fd-fig .fd-evs span{font-size:13px;line-height:1.3;color:var(--muted-foreground);padding:3px 8px;border:1px solid transparent;border-radius:6px}
.fd-fig .fd-evs span.fd-acc{color:var(--accent);border-color:var(--accent)}
.fd-fig .fd-mid{flex:1 1 150px;max-width:210px;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.fd-fig .fd-mid .fa{flex:none;width:100%;max-width:none;padding:0}
.fd-fig .fd-mid>b{font-size:14px}
.fd-fig .fr>.fp{flex:0 1 200px;min-width:0}
.fd-fig .fr>.fp.fd-co{flex:0 1 290px}
@media (max-width:640px){
.fd-fig .fr{flex-direction:column}
.fd-fig .fr>.fc,.fd-fig .fr .fn,.fd-fig .fd-kids,.fd-fig .fd-evs{flex:none;width:min(100%,300px)}
.fd-fig .fr .fa{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.fd-fig .fr .fa i{width:2px;height:28px}
.fd-fig .fr .fa i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.fd-fig .fr .fa.back i::after,.fd-fig .fr .fa.v.up i::after{bottom:auto;top:-2px;border-top:0;border-bottom:8px solid currentColor}
.fd-fig .fr .fa span{width:auto;max-width:11em;text-align:left}
.fd-fig .fd-r2>.fa{align-self:center;margin-bottom:0}
.fd-fig .fd-evs{flex-direction:row;flex-wrap:wrap;justify-content:center}
.fd-fig .fd-mid{flex:none;max-width:none;width:100%;flex-direction:row;flex-wrap:wrap;justify-content:center;gap:4px 18px}
.fd-fig .fd-mid>b{width:100%;text-align:center}
.fd-fig .fd-mid .fa{width:auto}
.fd-fig .fr>.fp,.fd-fig .fr>.fp.fd-co{flex:none;width:100%}
.fd-fig .fd-cmp{grid-template-columns:1fr;row-gap:16px}
.fd-fig .fd-side+.fd-side{border-left:0;border-top:1px dashed var(--muted-foreground);padding-top:16px}
}
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
<figure class="fd-fig not-prose" role="img" aria-label="Without a front desk you connect to every agent; with one, a single thread comes back to you"><div class="fd-cmp"><div class="fd-side"><div class="fd-side-h">No front desk</div><div class="fd-hub"><span class="fd-ag">agent</span><span class="fd-ag">agent</span><span class="fd-ag">agent</span><i class="fd-sp l c1"></i><i class="fd-sp"></i><i class="fd-sp r c3"></i><span></span><span class="fd-you">You</span><span></span><i class="fd-sp r c1"></i><i class="fd-sp"></i><i class="fd-sp l c3"></i><span class="fd-ag">agent</span><span class="fd-ag">agent</span><span class="fd-ag">agent</span></div><div class="fd-side-f">you hold every thread</div></div><div class="fd-side"><div class="fd-side-h">With a front desk</div><div class="fc"><span class="fd-you">You</span><i class="fd-vl"></i><div class="fn hi"><b>front desk</b></div><i class="fd-rake"></i><div class="fd-mini"><span></span><span></span><span></span><span></span><span></span><span></span></div><div class="fd-cap">agents</div></div><div class="fd-side-f">one thread comes back to you</div></div></div><figcaption>Six loose agents cost you six threads of attention. Behind a front desk, they cost you one.</figcaption></figure>
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
<figure class="fd-fig not-prose" role="img" aria-label="Dispatch starts, messages and reads child tasks, and messages you only when needed"><div class="fr fd-r2"><div class="fc"><span class="fd-you">You</span><div class="fa v up acc"><span>tell user: only when needed</span><i></i></div><div class="fn hi"><b>Dispatch</b><small>one long thread</small></div></div><div class="fa"><span>start · message · read</span><i></i></div><div class="fd-kids"><div class="fd-kid"><span>Code</span><small>running</small></div><div class="fd-kid"><span>Cowork</span><small class="fd-acc">awaiting input</small></div><div class="fd-kid"><span>Code</span><small>completed</small></div><div class="fd-kid"><span>Cowork</span><small>error</small></div></div></div><div class="fd-note">children can't start children: the tree stays one level deep</div><figcaption>The front desk has four verbs: start, message, read, and tell you. It never does the work itself.</figcaption></figure>
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
<figure class="fd-fig not-prose" role="img" aria-label="Many events go into a filter; only one reaches you"><div class="fr"><div class="fd-evs"><span>progress 40%</span><span>retry #2</span><span>task 1 done</span><span>new log line</span><span class="fd-acc">task 4: pay ¥320?</span><span>task 2 done</span><span>warning: slow</span></div><div class="fa"><span></span><i></i></div><div class="fn hi"><b class="fd-acc">filter</b><small>interrupt only if waiting costs more</small></div><div class="fa acc"><span></span><i></i></div><div class="fn hi"><b>Pay ¥320?</b><small>needs your OK</small></div></div><figcaption>Seven things happened. One of them is yours to decide.</figcaption></figure>
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
<h2>7. One step further: your agent talks to their agent</h2>
<p>So far the front desk sits on your side. It hands work to <em>your</em> workers. Now push the idea one step.</p>
<p>A lot of what you want done is really done by a company: move your internet to a new flat, change a flight, sort out a wrong bill. Today you do it through the company's app — its screens, its forms, its menus. Even with an agent, the agent has to click through those screens like a person would.</p>
<p>The next step: the company has a front desk too. Your agent tells their agent what you want. Their agent does all the work inside the company — checks coverage, books the slot, updates the bill, asks its own internal agents — and reports back. One handoff instead of fifty clicks.</p>
<figure class="fd-fig not-prose" role="img" aria-label="Your agent hands a goal to the company's agent, which runs the company's internal agents and sends back a proposal"><div class="fr"><div class="fp"><div class="pl">your side</div><div class="fc"><div class="fn hi"><b>Your agent</b></div><div class="fa v up acc"><span></span><i></i></div><span class="fd-you">You</span><div class="fd-cap">"20th, 9–12. OK?"</div></div></div><div class="fd-mid"><b class="fd-acc">the new interface</b><div class="fa acc"><span>goal + your limits</span><i></i></div><div class="fa back"><span>proposal · receipt</span><i></i></div></div><div class="fp fd-co"><div class="pl">company side</div><div class="fc"><div class="fn hi"><b>Their agent</b></div><i class="fd-rake"></i><div class="fd-mini"><span>coverage</span><span>schedule</span><span>billing</span></div><div class="fd-cap">internal agents</div></div></div></div><div class="fd-note">your agent guards your attention; theirs runs the company behind it</div><figcaption>Agent as a service: one handoff between two front desks replaces fifty clicks in an app.</figcaption></figure>
<p>A small example. You say: "Move my internet to the new address on the 20th." Your agent knows the address, the date, and your calendar. The provider's agent knows the coverage, the free slots, and the price. They settle it between them. You get one message: "Technician on the 20th, 9–12, same price. OK?"</p>
<p>I'd call this <strong>agent as a service</strong>. The company sells an outcome, and the interface is a conversation between two agents.</p>
<table><thead><tr><th>Interface</th><th>Who is on the other side</th><th>What you send</th></tr></thead><tbody><tr><td>App / website</td><td>A person clicking</td><td>Clicks and forms</td></tr><tr><td>API</td><td>A program</td><td>Exact fields, fixed calls</td></tr><tr><td>Agent as a service</td><td>An agent</td><td>A goal, plus your limits</td></tr></tbody></table>
<h3>The pieces are already being built</h3>
<ul><li><strong>Agents talking to agents.</strong> A2A (Agent2Agent) is an open protocol that lets agents from different vendors talk to each other. Each agent publishes an "Agent Card": what it can do and how to reach it. Google started it; it now lives at the Linux Foundation, which reported 150+ supporting organizations after its first year (April 2026).</li><li><strong>Agents paying.</strong> Agentic commerce protocols let an agent buy on your behalf. ACP (from OpenAI and Stripe) handles checkout inside a chat. AP2 (from Google) turns your approval into signed "mandates" — what you want, what's in the cart, what will be charged — so the shop can check that a human really said yes.</li></ul>
<p>To be fair about where this stands: most A2A use in production so far is <em>inside</em> companies. One company's agent working with a customer's agent, across company lines, is still early.</p>
<h3>Same front desk, twice</h3>
<p>This is the front-desk idea on both sides. Your front desk guards your attention. Their front desk guards their systems. The handoff between the two is where your intent turns into their work.</p>
<p>That changes what a company competes on:</p>
<ul><li><strong>The app stops being the product; the agent is.</strong> The app may shrink to a receipt and an "approve" button.</li><li><strong>Comparison gets cheap.</strong> Your agent can ask three providers' agents at once and compare the answers. Lock-in through a familiar UI gets weaker.</li><li><strong>Being easy to work with becomes the brand.</strong> How well their agent understands you, and whether it keeps its promises.</li></ul>
<h3>What's hard about it</h3>
<ul><li><strong>Who speaks for whom.</strong> Your agent has to prove it acts for you, and only within the limits you set. AP2's mandates try to solve this for payments; most other actions have no such proof yet.</li><li><strong>Two agents, two loyalties.</strong> Their agent works for the company. Upsells and dark patterns move from the screen into the conversation. Your agent has to be a tough negotiator, not a polite one.</li><li><strong>Who misunderstood?</strong> When the result is wrong, you need a shared record of the handoff. The transcript becomes the contract — the "keep transcripts one click away" rule, now between companies.</li><li><strong>Their reply is input to your agent.</strong> A message from another company's agent can carry instructions, so prompt injection now crosses company lines. Your agent should treat it as data, not orders.</li><li><strong>Some steps still need you.</strong> Money, contracts, personal data. The Horvitz rule still holds: interrupt only when waiting costs more — and a wrong payment always costs more.</li></ul>
<hr>
<h2>Closing</h2>
<p>We spent two years making agents better at <em>doing</em>. The next step is making them better at <em>not bothering us</em> — and at holding the whole picture so we don't have to.</p>
<p>The future agent is not ten windows you babysit. It is one conversation that runs the room, stays quiet, and taps you on the shoulder only when it counts.</p>
<p>And the door may soon open both ways: your front desk hands a goal to a company's front desk, and the whole company works behind it.</p>
<p>In short: one door in, many workers behind it, and fewer things for you to keep in your head.</p>
<hr>
<h3>Sources</h3>
<ul><li>Claude docs — <a href="https://claude.com/docs/cowork/guide/dispatch">Run tasks in the background with Dispatch</a></li><li>Claude Help Center — <a href="https://support.claude.com/en/articles/13947068">Assign tasks to Claude from anywhere in Cowork</a></li><li>xAI — <a href="https://x.ai/changelog/bot">Grok Bot changelog</a> (v0.67.0, 2 Oct 2026)</li><li>Progressive Robot — <a href="https://www.progressiverobot.com/2026/10/02/primary-bot-grok-4-7-base-model-proactive-grok-bot/">Primary Bot: Quick, Smart and Proactive, Now on Grok 4.7</a></li><li>TestingCatalog — <a href="https://x.com/testingcatalog/status/2105619522514190357">post on Primary bot</a></li><li>Anthropic Engineering — <a href="https://www.anthropic.com/engineering/multi-agent-research-system">How we built our multi-agent research system</a></li><li>Horvitz, Jacobs, Hovel — <a href="https://arxiv.org/abs/1301.6707">Attention-Sensitive Alerting (UAI 1999)</a></li><li>Horvitz et al. — <a href="https://erichorvitz.com/cacm-attention.htm">Models of Attention in Computing and Communication (CACM 2003)</a></li><li>Weiser &amp; Brown — <a href="https://calmtech.com/papers/designing-calm-technology">Designing Calm Technology (1995)</a></li><li>Gallup — <a href="https://news.gallup.com/businessjournal/23146/too-many-interruptions-work.aspx">Too Many Interruptions at Work? (Gloria Mark interview)</a></li><li>Leroy, S. (2009). <em>Why Is It So Hard to Do My Work? The Challenge of Attention Residue When Switching Between Work Tasks.</em> Organizational Behavior and Human Decision Processes.</li><li>Addy Osmani — <a href="https://addyosmani.com/blog/cognitive-parallel-agents/">Your parallel agent limit</a></li><li>SEP — <a href="https://sep.com/blog/where-ai-fatigue-actually-comes-from/">Where AI fatigue actually comes from</a></li><li>LangChain — <a href="https://www.langchain.com/blog/introducing-ambient-agents">Introducing ambient agents</a></li><li>A2A Protocol — <a href="https://a2a-protocol.org/">Agent2Agent protocol</a></li><li>Linux Foundation — <a href="https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year">A2A Protocol surpasses 150 organizations (April 2026)</a></li><li><a href="https://ap2-protocol.org/">AP2 — Agent Payments Protocol</a></li><li><a href="https://www.agenticcommerce.dev/">ACP — Agentic Commerce Protocol</a></li></ul>
</div>
