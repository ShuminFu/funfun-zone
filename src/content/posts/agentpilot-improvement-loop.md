---
title: "AgentPilot 的改进循环是怎么选下一步的"
description: "一个小模型先提出要改什么，编程 agent 再动手，评分器比较新旧两版。循环学的是哪些版本、哪类改动值得再试一次。"
growth: seedling
planted: 2026-11-14T13:28:47+08:00
lastTended: 2026-11-14T17:18:07+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
  - "claude-code"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Blog dark mode is html.dark (data-theme holds the palette name). */
html.dark .html-embed .agp{
  --bg:#121417; --panel:#181b1f; --ink:#e6e9ed; --sub:#a7b0ba; --line:#30363d;
  --b-line:#6ea3f0;
  background:transparent;
  color:var(--ink);
}
/* Blog already frames the article; don't double-pad. */
.html-embed .agp{max-width:none;margin:0;padding:0}
/* Keep the page's sans headings; the blog's heading serif and h2 rule otherwise win. */
.html-embed .agp h1,.html-embed .agp h2{
  font-family:var(--sans)!important;
  border:0!important;
  padding-bottom:0!important;
  color:var(--ink)!important;
  font-style:normal!important;
}
.html-embed .agp h2{font-size:22px!important;line-height:1.4!important;margin:44px 0 8px!important}
/* Do not pick up the blog's italic on blockquotes. */
.html-embed .agp blockquote,.html-embed .agp blockquote p{font-style:normal!important}
.html-embed .agp figure img{display:block;width:100%;max-width:100%;height:auto}
@media (max-width:640px){
  .html-embed .agp h2{font-size:20px!important;margin-top:36px!important}
}
</style>

<div class="html-embed" lang="zh-CN">
<div class="agp">
<p>AgentPilot 是开源项目 HKUDS/AgentPilot。它在编程 agent 外面加了一层循环：一个约 90 亿参数的小模型先提出要改程序的什么地方，编程 agent 再动手改，评分器随后把新版本和它改之前的那一版放在同一批任务上比较。循环学到的不是模型权重，而是哪些版本、哪一类改动值得再试一次。</p>
<h2>一轮是怎么走的</h2>
<p>每一轮开始时，循环会先从已经收入档案的版本里选出一个父版本，也就是接下来要改的那一版，再提出四个改动方向，最后只选其中一个交给工人，也就是负责改代码的编程 agent。工人会在父版本的一份拷贝上改代码，评分器再拿改出来的子版本和父版本做成对比较。比较结果会被标成成功、失败，或跳过。这份结果会更新策略，并决定子版本能不能进入档案，成为后面几轮的候选父版本。试验预算用完之后，循环会在验证任务上选出最好的一版，把它冻结，再拿到它从未见过的测试任务上评一次分。</p>
<figure>
  <picture><source type="image/avif" srcset="/images/posts/agentpilot-improvement-loop/fig-01-800.avif 800w, /images/posts/agentpilot-improvement-loop/fig-01.avif 2096w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/agentpilot-improvement-loop/fig-01.webp" alt="一轮改进的流程：从搜索状态出发，先选出父版本，再提出四个方向，经过重复闸门后只选一个方向去改代码，成对评分并判定结果，然后更新策略、决定是否收入档案。" srcset="/images/posts/agentpilot-improvement-loop/fig-01-800.webp 800w, /images/posts/agentpilot-improvement-loop/fig-01.webp 2096w" sizes="(max-width: 768px) 100vw, 760px" width="2096" height="799" loading="lazy" decoding="async"></picture>
  <figcaption>图 1　一轮改进从选出父版本开始，到更新策略、收入档案结束。涂成蓝色的三步，是策略要学着做好的三个决定。</figcaption>
</figure>
<h2>三个决定</h2>
<p>策略要学着做得更好的，是下面这三个决定。第一个决定是选哪个版本来改。第二个决定是提出什么方向：提出者可以先读源码和过去的运行记录，然后一次写出四个方向。重复闸门会把和过去太像的方向拒掉。第三个决定是从通过闸门的方向里只选一个去跑。</p>
<figure>
  <img src="/images/posts/agentpilot-improvement-loop/fig-02.webp" alt="三个决定加一道重复闸门：先选要改的版本，再提出四个方向，太像过去的方向会被拒绝，最后只选一个方向交给工人，在父版本的拷贝上改。" srcset="/images/posts/agentpilot-improvement-loop/fig-02-800.webp 800w, /images/posts/agentpilot-improvement-loop/fig-02.webp 1483w" sizes="(max-width: 768px) 100vw, 760px" width="1483" height="1902" loading="lazy" decoding="async" data-avif="no">
  <figcaption>图 2　每一轮都按这个顺序做完三个决定，并通过重复闸门，然后只跑其中一个方向。</figcaption>
</figure>
<h2>什么算成功</h2>
<p>循环从每一次试验里只学到一个是或否。检查按固定顺序进行，前面某一项没过，这次试验就会被跳过。跳过并不是失败，因此它不会改计数。开发任务上的分数只能当作提案时的证据，不能当作奖励；如果有人把留出来的测试任务分数送进来当奖励，代码会直接报错。</p>
<figure>
  <picture><source type="image/avif" srcset="/images/posts/agentpilot-improvement-loop/fig-03-800.avif 800w, /images/posts/agentpilot-improvement-loop/fig-03.avif 2096w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/agentpilot-improvement-loop/fig-03.webp" alt="一次试验的判定顺序：前六项没过都会跳过且不改计数；约束通过并且增益超过阈值才算成功。开发任务不当奖励，验证任务提供成功失败，测试任务只给冻结后的最终版本评一次分。" srcset="/images/posts/agentpilot-improvement-loop/fig-03-800.webp 800w, /images/posts/agentpilot-improvement-loop/fig-03.webp 2096w" sizes="(max-width: 768px) 100vw, 760px" width="2096" height="1892" loading="lazy" decoding="async"></picture>
  <figcaption>图 3　检查按固定顺序进行。跳过不会改计数。成功和失败只来自验证任务，测试成绩不能回到循环里。</figcaption>
</figure>
<h2>两种记住经验的方法</h2>
<p>循环可以用两种方法来记住这些经验。计数方法给每个父版本、每一类改动记下三个数字：它有多少轮本来可以被选中、有多少次试验被计入，以及其中成功了多少次，再算出一个指数。这个指数是在已有数据下仍然说得通的最高成功率。从未试过的选项指数是 1，因此会先被选中。记忆方法不记这些计数，而是保留一份最多六条的教训文档，让模型按这份文档给候选排序，并取第一名。</p>
<figure>
  <picture><source type="image/avif" srcset="/images/posts/agentpilot-improvement-loop/fig-04-800.avif 800w, /images/posts/agentpilot-improvement-loop/fig-04.avif 2096w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/agentpilot-improvement-loop/fig-04.webp" alt="两种记住经验的方法：计数方法给每个选项算一个指数，还没试过的选项指数是 1；记忆方法改成一份最多六条的教训，由模型按文档排序并取第一名。两种方法都不会训练模型权重。" srcset="/images/posts/agentpilot-improvement-loop/fig-04-800.webp 800w, /images/posts/agentpilot-improvement-loop/fig-04.webp 2096w" sizes="(max-width: 768px) 100vw, 760px" width="2096" height="3098" loading="lazy" decoding="async"></picture>
  <figcaption>图 4　计数方法靠指数来选，记忆方法靠一份短文档来选。两种方法都不会去训练模型权重。</figcaption>
</figure>
<h2>怎么用，以及报告成绩该怎么看</h2>
<p>它会安装成 Claude Code 里的 /agentpilot，或 Codex CLI 里的 $agentpilot。宿主 agent 只负责准备任务和评分器，确认评分器能在起始程序上抓住一次真实的失败，然后把工作交给运行器。技能文件写明，现在还不能自动接入任意项目。因此，如果没有针对你这项任务的真实评分器，循环就没有东西可学。</p>
<p>项目自己报告的测试成绩里，计数方法在 AIME 上到了 36 题中的 28 题，而最好的基线是 25 题，这一项最清楚。在 Terminal-Bench 上，AgentPilot 的起点和基线并不相同，双方的试验预算也不对等，文档也没有给出 token 或费用数字。因此，项目里「更少浪费 token」这一说法并没有被证明。</p>
<p class="source">根据公开的 Claude Artifact <a href="https://claude.ai/artifact/JXfUztiERNMiwR6eoEZWA2">AgentPilot Improvement Loop</a> 整理，对应开源项目 <a href="https://github.com/HKUDS/AgentPilot">HKUDS/AgentPilot</a> 的 commit e5a81e7（2026 年 11 月 12 日）。成绩数字来自项目自己的文档，并未另行复现。</p>
</div>
</div>
