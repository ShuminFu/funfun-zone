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
<figure>
  <img src="/images/posts/coding-agents-learn-without-weights/fig-01.webp" alt="横向示意图：左边是 Driver，中间是 Host（Guards、Method rules、Delivery、Turn-end contracts、Loop check），右边是 Navigator；底部是 Method card、You 和 Background check。消息经过 Host，规则写在 Method card 里。" srcset="/images/posts/coding-agents-learn-without-weights/fig-01-800.webp 800w, /images/posts/coding-agents-learn-without-weights/fig-01.webp 2096w" sizes="(max-width: 768px) 100vw, 760px" width="2096" height="943" loading="lazy" decoding="async">
  <figcaption>图 1　写代码的一方和审阅的一方并不直接对话。消息都经过中间的宿主，规则写在方法卡片里。</figcaption>
</figure>
<h2>五种办法改的不是同一种东西</h2>
<p class="key">前四类办法改的是规则、脚本、路由或记忆，并不训练模型权重。</p>
<p>一类是搜索提示词和脚手架，例如 GEPA、Meta-Harness、RRSI，以及我们介绍过的 <a href="https://funfun.zone/posts/agentpilot-improvement-loop/">AgentPilot</a>，改的是规则、脚本或外围程序。一类是选择模型和路由，例如 RouteLLM、PILOT 路由器和 CascadeDebate。一类是给正在运行的工人配一个监督者，例如 PILOT in the Loop，监督者可以中途提示，也可以中止已经没有用的一轮。一类是把经验写成记忆和剧本，例如 Reflexion、Agent Workflow Memory 和 ACE。</p>
<p class="key">对模型权重做强化学习，并不适合直接用在改不了权重的闭源系统上。</p>
<p>这一类的例子有 Agent Lightning、OpenPipe ART 和 SWE-RL。它们需要可训练的模型、沙盒和大量试跑。Claude Code、Codex 这类闭源系统改不了权重，所以这一路暂时用不上。</p>
<figure>
  <img src="/images/posts/coding-agents-learn-without-weights/fig-02.webp" alt="公开研究把改进办法分成五类的原表：Family、What it changes、What it needs、Fit、Examples。前四类适配度较高，对模型权重做强化学习目前较低。" srcset="/images/posts/coding-agents-learn-without-weights/fig-02-800.webp 800w, /images/posts/coding-agents-learn-without-weights/fig-02.webp 2080w" sizes="(max-width: 768px) 100vw, 760px" width="2080" height="958" loading="lazy" decoding="async">
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
<figure>
  <img src="/images/posts/coding-agents-learn-without-weights/fig-03.webp" alt="公开研究里关于结对的几条证据：谁来审稿会翻转结果；第二个 agent 也可能帮倒忙；失败多半来自设计；智能体自写的教训不可靠；旧日志不能代替重跑；使用标签往往又少又弱；权重级强化学习存在，但规模不同。目前还没有发现把强化学习或赌博机专门用在写代码加审稿这种结对上的公开研究。" srcset="/images/posts/coding-agents-learn-without-weights/fig-03-800.webp 800w, /images/posts/coding-agents-learn-without-weights/fig-03.webp 1409w" sizes="(max-width: 768px) 100vw, 760px" width="1409" height="1350" loading="lazy" decoding="async">
  <figcaption>图 3　公开研究里，关于结对的几条证据。</figcaption>
</figure>
<p class="key">Cursor 已经把在线强化学习用在 Tab 补全上，不过它和编程 agent 并不在一个量级。</p>
<p>它会按用户接受或拒绝来打分，示例奖励是接受 +0.75、拒绝 −0.25、不展示则为 0，而且每天要处理超过 <strong>4 亿</strong>次请求。</p>
<p class="key">目前还没有发现把强化学习或赌博机专门用在「一个写代码、一个审稿」这种结对上的公开研究。</p>
<p class="source">来源：<a href="https://arxiv.org/abs/2607.21656">Cross-Model LLM Code Review</a>；<a href="https://arxiv.org/abs/2512.08296">Towards a Science of Scaling Agent Systems</a>；<a href="https://arxiv.org/abs/2503.13657">MAST</a>；<a href="https://arxiv.org/abs/2608.08239">The Replay Gap</a>；<a href="https://arxiv.org/abs/2602.12670">SkillsBench</a>；<a href="https://arxiv.org/abs/2603.03800">OpenHands 评判模型</a>；<a href="https://cursor.com/blog/tab-rl">Cursor Tab 在线强化学习</a>；<a href="https://arxiv.org/abs/2507.19457">GEPA</a>；<a href="https://arxiv.org/abs/2603.28052">Meta-Harness</a>；<a href="https://arxiv.org/abs/2609.24972">RRSI</a>；<a href="https://arxiv.org/abs/2608.26530">PILOT in the Loop</a>；<a href="https://arxiv.org/abs/2406.18665">RouteLLM</a>；<a href="https://arxiv.org/abs/2508.21141">PILOT 路由器</a>；<a href="https://arxiv.org/abs/2604.12262">CascadeDebate</a>；<a href="https://arxiv.org/abs/2303.11366">Reflexion</a>；<a href="https://arxiv.org/abs/2409.07429">Agent Workflow Memory</a>；<a href="https://arxiv.org/abs/2510.04618">ACE</a>；<a href="https://arxiv.org/abs/2508.03680">Agent Lightning</a>；<a href="https://art.openpipe.ai">OpenPipe ART</a>；<a href="https://arxiv.org/abs/2502.18449">SWE-RL</a>；<a href="https://funfun.zone/posts/agentpilot-improvement-loop/">AgentPilot 改进循环</a>。</p>
</div>
</div>
