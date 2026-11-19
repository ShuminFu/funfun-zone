---
title: "不训练权重，编程 agent 还能从哪里改进"
description: "公开研究把改进办法分成几类：搜索规则和脚手架、选择模型和路由、在运行中调整，以及写下可复用的经验。"
growth: seedling
planted: 2026-11-14T15:32:37+08:00
lastTended: 2026-11-14T17:18:07+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Blog dark mode is html.dark (data-theme holds the palette name). */
html.dark .html-embed .cal{
  --bg:#121417; --panel:#181b1f; --ink:#e6e9ed; --body:#c4cbd3; --sub:#a7b0ba; --line:#30363d;
  --b-line:#6ea3f0;
  background:transparent;
  color:var(--ink);
}
/* Blog already frames the article; don't double-pad. */
.html-embed .cal{max-width:none;margin:0;padding:0}
/* Keep the page's sans headings; the blog's heading serif and h2 rule otherwise win. */
.html-embed .cal h1,.html-embed .cal h2{
  font-family:var(--sans)!important;
  border:0!important;
  padding-bottom:0!important;
  color:var(--ink)!important;
  font-style:normal!important;
}
.html-embed .cal h2{font-size:22px!important;line-height:1.4!important;margin:48px 0 14px!important;font-weight:700!important}
.html-embed .cal p{
  font-size:16.5px!important;
  font-weight:400!important;
  line-height:1.75!important;
  color:var(--body, #3a424b)!important;
  margin:0 0 14px!important;
  font-style:normal!important;
}
.html-embed .cal p.key{
  font-size:19.5px!important;
  font-weight:700!important;
  line-height:1.55!important;
  color:var(--ink)!important;
  margin:0 0 6px!important;
}
.html-embed .cal p.key + p{margin-bottom:20px!important}
.html-embed .cal strong{font-weight:700!important;color:var(--ink)!important;font-style:normal!important}
/* Do not pick up the blog's italic on blockquotes. */
.html-embed .cal blockquote,.html-embed .cal blockquote p{font-style:normal!important}
.html-embed .cal figure img{display:block;width:100%;max-width:100%;height:auto}
.html-embed .cal figcaption{font-size:13.5px!important;line-height:1.55!important;color:var(--sub)!important;font-weight:400!important}
.html-embed .cal .source{font-size:15px!important;line-height:1.7!important;color:var(--sub)!important;font-weight:400!important}
/* Fig 1: host diagram (flow-component pieces, scoped). Driver and Navigator above, Host in the middle, inputs below. */
.html-embed .cal .fl{margin:28px 0;display:flex;flex-direction:column;align-items:center;gap:0}
.html-embed .cal .fl figcaption{margin-top:14px;text-align:center;max-width:36em}
.html-embed .cal .fn,.html-embed .cal .hf-host,.html-embed .cal .hf-layers li{box-sizing:border-box}
.html-embed .cal .fn{background:var(--muted);border:1px solid transparent;border-radius:10px;padding:10px 14px;text-align:center;min-width:0}
.html-embed .cal .fn b{display:block;font-size:15px;font-weight:600;color:var(--foreground);line-height:1.35}
.html-embed .cal .fn small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.html-embed .cal .hf-top{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px;width:100%;max-width:640px}
.html-embed .cal .hf-bot{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto auto;grid-auto-flow:column;column-gap:10px;width:100%;max-width:640px}
.html-embed .cal .hf-bot .hf-col{display:contents}
.html-embed .cal .hf-bot .hf-arr{align-content:flex-start}
.html-embed .cal .hf-side{display:flex;flex-direction:column;align-items:stretch;min-width:0}
.html-embed .cal .hf-arr{display:flex;flex-wrap:wrap;justify-content:center;gap:0 14px;padding:6px 0}
.html-embed .cal .fa{display:flex;flex-direction:row-reverse;align-items:center;gap:8px;font-size:12.5px;line-height:1.3;color:var(--muted-foreground);text-align:left}
.html-embed .cal .fa span{max-width:8.5em}
.html-embed .cal .fa i{position:relative;display:block;flex:none;width:2px;height:30px;background:currentColor}
.html-embed .cal .fa i::after{content:"";position:absolute;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent}
.html-embed .cal .fa.up i{transform:scaleY(-1)}
.html-embed .cal .fa.dash i{width:0;background:none;border-left:2px dashed currentColor}
.html-embed .cal .fa.dash i::after{left:-6px}
.html-embed .cal .hf-host{width:100%;max-width:640px;border:2px solid var(--accent);border-radius:12px;padding:10px 12px 12px}
.html-embed .cal .hf-host .pl{font-size:15px;font-weight:600;color:var(--foreground);margin:0 0 8px 2px}
.html-embed .cal .hf-layers{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.html-embed .cal .hf-layers li{margin:0;padding:8px 12px;background:var(--muted);border-radius:8px;display:grid;grid-template-columns:1.3em 11em minmax(0,1fr);align-items:baseline;gap:2px 8px}
.html-embed .cal .hf-layers li::before{content:none}
.html-embed .cal .hf-layers .n{font-size:13px;color:var(--muted-foreground)}
.html-embed .cal .hf-layers b{font-size:15px;font-weight:600;color:var(--foreground)}
.html-embed .cal .hf-layers small{font-size:13.5px;color:var(--muted-foreground)}
/* Fig 2: table with fit pills. */
.html-embed .cal .tt{font-size:16px;font-weight:700;color:var(--foreground);margin:0 0 10px}
.html-embed .cal .rt{overflow-x:auto;max-width:100%}
.html-embed .cal .rt table{border-collapse:collapse;width:100%;min-width:720px;margin:0;font-size:14.5px;line-height:1.5}
.html-embed .cal .rt th{text-align:left;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground);padding:6px 10px 8px;border-bottom:2px solid var(--foreground);background:transparent}
.html-embed .cal .rt td{text-align:left;vertical-align:top;padding:9px 10px;color:var(--foreground);border-bottom:1px solid color-mix(in srgb,var(--foreground) 15%,transparent);background:transparent}
.html-embed .cal .rt td:first-child{white-space:nowrap;font-weight:700}
.html-embed .cal .pill{display:inline-block;white-space:nowrap;font-size:12.5px;font-weight:600;line-height:1.3;padding:2px 9px;border-radius:999px;border:1px solid var(--muted-foreground);color:var(--muted-foreground)}
.html-embed .cal .pill.high{border-color:var(--accent);color:var(--foreground);background:color-mix(in srgb,var(--accent) 12%,transparent)}
.html-embed .cal .pill.low{border-style:dashed}
/* Fig 3: evidence list. */
.html-embed .cal .ev ul{margin:0;padding-left:1.25em}
.html-embed .cal .ev li{margin:0 0 10px;font-size:16px;line-height:1.7;color:var(--foreground)}
.html-embed .cal .ev .end{margin-top:12px;font-size:15px;line-height:1.6;color:var(--muted-foreground)}
@media (max-width:480px){
  .html-embed .cal .hf-top{gap:10px 12px}
  .html-embed .cal .hf-bot{column-gap:8px}
  .html-embed .cal .fn{padding:8px 8px}
  .html-embed .cal .fn b{font-size:14px}
  .html-embed .cal .fn small{font-size:12.5px}
  .html-embed .cal .hf-arr{gap:0 10px}
  .html-embed .cal .hf-layers li{grid-template-columns:1.3em minmax(0,1fr)}
  .html-embed .cal .hf-layers small{grid-column:2}
}
@media (max-width:640px){
  .html-embed .cal h2{font-size:20px!important;margin-top:40px!important}
  .html-embed .cal p{font-size:16px!important}
  .html-embed .cal p.key{font-size:18px!important}
}
</style>

<div class="html-embed" lang="zh-CN">
<div class="cal">
<p class="key">想让编程 agent 做得更好，研究者并不一定先去训练模型权重。</p>
<p>公开研究里已经出现了几类办法，它们改的是规则、脚手架、路由，或运行当中的决定，而不是模型本身。</p>
<p class="key">一种常见的做法，是让一个 agent 负责写代码，另一个负责审阅。</p>
<p>两边并不直接对话：写的一方改代码，审的一方查看并给出判断，消息都经过中间的宿主，规则则写在方法卡片里。</p>
<figure class="fl">
  <div class="hf-top">
    <div class="hf-side">
      <div class="fn"><b>Driver</b><small>developer session<br>edits code, runs tests</small></div>
      <div class="hf-arr"><div class="fa"><span>message</span><i></i></div><div class="fa up"><span>delivered</span><i></i></div></div>
    </div>
    <div class="hf-side">
      <div class="fn"><b>Navigator</b><small>reviewer session<br>scouts, verifies, rules</small></div>
      <div class="hf-arr"><div class="fa"><span>message</span><i></i></div><div class="fa up"><span>delivered</span><i></i></div></div>
    </div>
  </div>
  <div class="hf-host">
    <div class="pl">Host</div>
    <ol class="hf-layers">
      <li><span class="n">1</span><b>Guards</b><small>repeat, rate, round budget</small></li>
      <li><span class="n">2</span><b>Method rules</b><small>script or written rules</small></li>
      <li><span class="n">3</span><b>Delivery</b><small>queue, steer or interrupt</small></li>
      <li><span class="n">4</span><b>Turn-end contracts</b><small>reviewed, replied, progress</small></li>
      <li><span class="n">5</span><b>Loop check</b><small>flags a stuck exchange</small></li>
    </ol>
  </div>
  <div class="hf-bot">
    <div class="hf-col">
      <div class="hf-arr"><div class="fa up dash"><span>snapshot at kickoff</span><i></i></div></div>
      <div class="fn"><b>Method card</b><small>rules and settings</small></div>
    </div>
    <div class="hf-col">
      <div class="hf-arr"><div class="fa up"><span>your message resets</span><i></i></div><div class="fa"><span>final verdict</span><i></i></div></div>
      <div class="fn"><b>You</b><small>notified when a round closes</small></div>
    </div>
    <div class="hf-col">
      <div class="hf-arr"><div class="fa up dash"><span>judges loops</span><i></i></div></div>
      <div class="fn"><b>Background check</b><small>watches for loops</small></div>
    </div>
  </div>
  <figcaption>图 1　写代码的一方和审阅的一方并不直接对话。消息都经过中间的宿主，规则写在方法卡片里。</figcaption>
</figure>
<h2>五种办法改的不是同一种东西</h2>
<p class="key">前四类办法改的是规则、脚本、路由或记忆，并不训练模型权重。</p>
<p>一类是搜索提示词和脚手架，例如 GEPA、Meta-Harness、RRSI，以及我们介绍过的 <a href="https://funfun.zone/posts/agentpilot-improvement-loop/">AgentPilot</a>，改的是规则、脚本或外围程序。一类是选择模型和路由，例如 RouteLLM、PILOT 路由器和 CascadeDebate。一类是给正在运行的工人配一个监督者，例如 PILOT in the Loop，监督者可以中途提示，也可以中止已经没有用的一轮。一类是把经验写成记忆和剧本，例如 Reflexion、Agent Workflow Memory 和 ACE。</p>
<p class="key">对模型权重做强化学习，并不适合直接用在改不了权重的闭源系统上。</p>
<p>这一类的例子有 Agent Lightning、OpenPipe ART 和 SWE-RL。它们需要可训练的模型、沙盒和大量试跑。Claude Code、Codex 这类闭源系统改不了权重，所以这一路暂时用不上。</p>
<figure>
  <div class="tt">What "agent RL" covers, and what fits here</div>
  <div class="rt">
  <table>
    <thead><tr><th>Family</th><th>What it changes</th><th>What it needs</th><th>Fit</th><th>Examples</th></tr></thead>
    <tbody>
      <tr><td>Search over prompts<br>and harness</td><td>Rules text, settings, scripts</td><td>A re-runnable benchmark with a held-out split</td><td><span class="pill high">High</span></td><td>GEPA (2025), Meta-Harness (2026), RRSI (2026), AgentPilot</td></tr>
      <tr><td>Bandits</td><td>A small choice: which mode, which reviewer, when to stop</td><td>Context, outcome, some randomized exploration</td><td><span class="pill high">High</span></td><td>RouteLLM (2024), PILOT router (2025), CascadeDebate (2026)</td></tr>
      <tr><td>A supervisor that<br>steers a running<br>worker</td><td>Stop, redirect or continue</td><td>Live traces</td><td><span class="pill high">High</span></td><td>PILOT in the Loop (2026)</td></tr>
      <tr><td>Memory and<br>playbooks</td><td>What is put in the context</td><td>Past runs and a success signal</td><td><span class="pill">Medium</span></td><td>Reflexion (2023), Agent Workflow Memory (2024), ACE (2025)</td></tr>
      <tr><td>RL on model weights</td><td>The model itself</td><td>A sandboxed environment, hundreds to thousands of rollouts, GPUs, serving</td><td><span class="pill low">Low for now</span></td><td>Agent Lightning (2025), OpenPipe ART with RULER (2025), SWE-RL (2025)</td></tr>
    </tbody>
  </table>
  </div>
  <figcaption>图 2　公开研究把改进办法分成五类。前四类都不训练模型权重。</figcaption>
</figure>
<h2>谁来审稿，符号可能会翻过来</h2>
<p class="key">当一个 agent 负责写、另一个负责审的时候，谁写、谁审，结果可能完全相反。</p>
<p>一项在 116 道 LiveCodeBench 中等和困难题目上的对照实验表明，审稿者能看到题目和草稿，但不能跑测试。Codex GPT-5.5 单独作答的通过率是 71.6%，交给 Claude Opus 4.7 审一遍后升到 <strong>89.7%</strong>；Claude Opus 4.7 单独作答已经是 91.4%，交给 Codex GPT-5.5 去审，通过率反而降到 <strong>82.8%</strong>。</p>
<p class="key">有用的结对是不对称的，并不能假定再加一个审稿者就一定更好。</p>
<p>这项结果只来自这一对模型和这一个基准，因此不能直接推广到所有搭配。</p>
<h2>第二个 agent 也可能帮倒忙</h2>
<p class="key">使用者要不要加第二个 agent，应当按任务来决定。</p>
<p>Google 的一项研究比较了 180 种 agent 配置。它发现，在需要逐步满足约束的规划任务上，所有多 agent 方案都比单 agent 差，相对降幅大约是 <strong>39% 到 70%</strong>；而在更适合并行处理的任务上，多 agent 可以带来很大提升，例如结构化的金融推理在集中式协调下相对提高约 <strong>81%</strong>。</p>
<p class="key">许多多 agent 失败可以通过更好的设计来改善。</p>
<p>MAST 从 1600 多条多 agent 运行记录里归纳出 14 种失败模式，并把它们归到系统设计、角色之间对不齐，以及任务核验这三类。</p>
<h2>旧日志不能代替重跑，自写的教训也不能直接启用</h2>
<p class="key">旧日志也不能代替重跑。</p>
<p>The Replay Gap 在 SWE-bench 上发现：如果在轨迹较早的位置换模型，被回放的后续状态里只有约 <strong>3% 到 8%</strong> 仍然有效。如果只用旧日志去评估换模型或换路由，评到的往往是一个不会真正出现的世界，研究者需要重新跑一遍才能判断候选是否更好。</p>
<p class="key">准备变成默认设置的经验，仍然需要人来把关。</p>
<p>SkillsBench 表明，人工整理的技能能把 87 项任务、18 种配置上的平均通过率从 33.9% 提到 <strong>50.5%</strong>；但在三个专用配置里，智能体自己写的技能反而比不用技能低 8.1 到 11.5 个百分点。OpenHands 的一篇研究还指出，能对上「PR 被合并」的工作片段大约只有 <strong>6%</strong>，只用这类标签训练出来的评判模型，AUC 只有 0.58。</p>
<figure class="ev">
  <div class="tt">What the evidence says about pairs</div>
  <ul>
    <li><strong>Who reviews whom flips the sign.</strong> On 116 LiveCodeBench tasks, Claude Opus 4.7 reviewing Codex drafts raised the pass rate from 71.6% to 89.7%. Codex reviewing Claude drafts lowered it from 91.4% to 82.8%. One benchmark, one model pair, and the reviewer could not run tests, but it is the strongest argument for learning the reviewer choice.</li>
    <li><strong>A second agent can hurt.</strong> A Google study of 180 configurations found multi-agent setups degraded sequential tasks by 39% to 70% and helped parallel ones. Pairing should be a per-task decision.</li>
    <li><strong>Failures are mostly design, not model.</strong> The MAST study classified 14 failure modes across more than 1,600 multi-agent traces: lost handoffs, a role doing the other's job, loops.</li>
    <li><strong>Lessons an agent writes for itself are unreliable.</strong> In SkillsBench, curated skills raised average pass rate from 33.9% to 50.5% across 87 tasks and 18 configurations; in three specialised configurations, self-written skills were 8.1 to 11.5 points worse than using none. Keep a human gate on anything that becomes a default.</li>
    <li><strong>Logs cannot stand in for reruns.</strong> "The Replay Gap" found that after an early model swap only 3% to 8% of replayed states were still valid. Judge candidates by running them.</li>
    <li><strong>Usage signals are sparse and weak.</strong> One 2026 study found merge labels on about 6% of work segments, with a critic trained on them barely beating chance. Online signals suit coarse choices only.</li>
    <li><strong>Weight-level RL from real usage does exist, at a different scale.</strong> Cursor trains its tab model on accept and reject: plus 0.75 for an accepted suggestion, minus 0.25 for a rejected one, zero for staying silent, across hundreds of millions of requests a day.</li>
  </ul>
  <div class="end">I found no published study of reinforcement learning or bandits applied to a driver and reviewer coding pair.</div>
  <figcaption>图 3　公开研究里，关于结对的几条证据。</figcaption>
</figure>
<p class="key">Cursor 已经把在线强化学习用在 Tab 补全上，不过它和编程 agent 并不在一个量级。</p>
<p>它会按用户接受或拒绝来打分，示例奖励是接受 +0.75、拒绝 −0.25、不展示则为 0，而且每天要处理超过 <strong>4 亿</strong>次请求。</p>
<p class="key">目前还没有发现把强化学习或赌博机专门用在「一个写代码、一个审稿」这种结对上的公开研究。</p>
<p class="source">来源：<a href="https://arxiv.org/abs/2607.21656">Cross-Model LLM Code Review</a>；<a href="https://arxiv.org/abs/2512.08296">Towards a Science of Scaling Agent Systems</a>；<a href="https://arxiv.org/abs/2503.13657">MAST</a>；<a href="https://arxiv.org/abs/2608.08239">The Replay Gap</a>；<a href="https://arxiv.org/abs/2602.12670">SkillsBench</a>；<a href="https://arxiv.org/abs/2603.03800">OpenHands 评判模型</a>；<a href="https://cursor.com/blog/tab-rl">Cursor Tab 在线强化学习</a>；<a href="https://arxiv.org/abs/2507.19457">GEPA</a>；<a href="https://arxiv.org/abs/2603.28052">Meta-Harness</a>；<a href="https://arxiv.org/abs/2609.24972">RRSI</a>；<a href="https://arxiv.org/abs/2608.26530">PILOT in the Loop</a>；<a href="https://arxiv.org/abs/2406.18665">RouteLLM</a>；<a href="https://arxiv.org/abs/2508.21141">PILOT 路由器</a>；<a href="https://arxiv.org/abs/2604.12262">CascadeDebate</a>；<a href="https://arxiv.org/abs/2303.11366">Reflexion</a>；<a href="https://arxiv.org/abs/2409.07429">Agent Workflow Memory</a>；<a href="https://arxiv.org/abs/2510.04618">ACE</a>；<a href="https://arxiv.org/abs/2508.03680">Agent Lightning</a>；<a href="https://art.openpipe.ai">OpenPipe ART</a>；<a href="https://arxiv.org/abs/2502.18449">SWE-RL</a>；<a href="https://funfun.zone/posts/agentpilot-improvement-loop/">AgentPilot 改进循环</a>。</p>
</div>
</div>
