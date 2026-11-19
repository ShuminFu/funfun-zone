---
title: "Google Antigravity 的四种多代理模式各自怎么运作"
description: "讲清 Google Antigravity 四种多代理模式（普通 Subagents、/boost、/swarm 和 /teamwork）各自怎么分工、怎么防假装做完、怎么撑过长时间，以及开源代码里能找到哪些对应零件。"
growth: seedling
planted: 2026-11-19T11:28:59+08:00
lastTended: 2026-11-19T11:53:16+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.tldr{border-left:2px solid var(--accent);padding:2px 14px;margin:20px 0}
.tldr p{margin:0}
.tw{overflow-x:auto;max-width:100%;margin:20px 0}
.tw table{margin:0;min-width:560px}
.tw td:first-child,.tw th:first-child{white-space:nowrap}
.tw table.sum{min-width:0}
.ill{margin:24px 0}
.ill img{display:block;width:100%;height:auto;border-radius:8px}
html[data-theme="dark"] .ill img{filter:brightness(.88)}
</style>

<div class="html-embed" lang="zh-CN">
<p>先说结论：Google Antigravity 里有四种让多个 AI 代理一起干活的方式。它们的区别，主要在「谁来管」「怎么互相说话」「怎么防止假装做完」「能连续跑多久」。</p>
<ul>
<li><strong>普通 Subagents</strong>：主代理把一件小事甩给后台，干完回报。</li>
<li><strong><code>/boost</code></strong>：一道难题，一轮轮「做 → 挑刺 → 修」，直到对照要求查不出毛病。</li>
<li><strong><code>/swarm</code></strong>：一件能切开的大活，分给几个有名字的工人同时做，大家在一块共用留言板上说话。</li>
<li><strong><code>/teamwork</code></strong>：先访谈定需求，再在专用目录里按里程碑跑几小时到几天，每个里程碑都要过几道独立检查。</li>
</ul>
<p>这篇是我的调研笔记。说法都对照了官方文档和博客；开源代码部分是<strong>静态读源码</strong>，没有安装，也没有运行。</p>
<figure class="ill"><picture><source type="image/avif" srcset="/images/posts/antigravity-multi-agent-modes/fig-01-800.avif 800w, /images/posts/antigravity-multi-agent-modes/fig-01.avif 1568w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/antigravity-multi-agent-modes/fig-01.webp" alt="从轻到重的四种模式：派个跑腿的、一排机器人轮流挑错、装修队各管一间房加一块公告板、盖楼每层都有质检" loading="lazy" decoding="async" srcset="/images/posts/antigravity-multi-agent-modes/fig-01-800.webp 800w, /images/posts/antigravity-multi-agent-modes/fig-01.webp 1568w" sizes="(max-width: 768px) 100vw, 760px" width="1568" height="520"></picture></figure>
<h2>先看总表</h2>
<div class="tw"><table class="sum">
<thead><tr><th>模式</th><th>适合什么活</th><th>谁来验收</th><th>耗时</th></tr></thead>
<tbody>
<tr><td>Subagents</td><td>顺手的小活</td><td>主代理看回复</td><td>秒～分钟</td></tr>
<tr><td><code>/boost</code></td><td>难而不广的一道题</td><td>下一个工人挑错，总管抽查</td><td>秒～小时</td></tr>
<tr><td><code>/swarm</code></td><td>广而切得开的大活</td><td><code>@verifier</code> 跑测试</td><td>分钟～小时</td></tr>
<tr><td><code>/teamwork</code></td><td>跨天的大工程</td><td>每个里程碑过几道独立检查</td><td>小时～天</td></tr>
</tbody>
</table></div>
<p>角色、工作区、怎么启动，放在下面各节里讲。</p>
<h2>普通 Subagents：派个跑腿的</h2>
<p><strong>比方：</strong>你在写代码，顺手叫个助手去查份资料，查完回来告诉你。</p>
<figure class="ill"><picture><source type="image/avif" srcset="/images/posts/antigravity-multi-agent-modes/fig-02-800.avif 800w, /images/posts/antigravity-multi-agent-modes/fig-02.avif 1280w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/antigravity-multi-agent-modes/fig-02.webp" alt="主代理把一张任务卡交给助手，助手跑去书架查资料再带着结果回来" loading="lazy" decoding="async" srcset="/images/posts/antigravity-multi-agent-modes/fig-02-800.webp 800w, /images/posts/antigravity-multi-agent-modes/fig-02.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720"></picture></figure>
<p><strong>角色：</strong>主代理和子代理。内置的子代理有 <code>research</code>、<code>browser</code>、<code>self</code>，也可以自己定义。自定义子代理写一段 <code>description</code>，主代理就靠这段话决定什么时候派它。</p>
<p><strong>一轮怎么转：</strong>主代理调用 <code>invoke_subagent</code> 工具 → 子代理在后台干活 → 把结果回报给主代理 → 主代理看回复决定下一步。</p>
<svg viewBox="0 0 640 90" role="img" aria-label="主代理派活给子代理，子代理回报" style="width:100%;max-width:640px;height:auto">
  <g font-size="14" fill="currentColor" text-anchor="middle">
    <rect x="10" y="25" width="150" height="40" rx="6" fill="none" stroke="currentColor"/><text x="85" y="50">主代理</text>
    <rect x="480" y="25" width="150" height="40" rx="6" fill="none" stroke="currentColor"/><text x="555" y="50">子代理（后台）</text>
    <line x1="160" y1="36" x2="476" y2="36" stroke="var(--accent)" stroke-width="2"/><polygon points="476,31 486,36 476,41" fill="var(--accent)"/>
    <text x="320" y="28" font-size="12">invoke_subagent 派活</text>
    <line x1="480" y1="56" x2="170" y2="56" stroke="var(--accent)" stroke-width="2"/><polygon points="170,51 160,56 170,61" fill="var(--accent)"/>
    <text x="320" y="78" font-size="12">干完回报</text>
  </g>
</svg>
<p><strong>工作区：</strong>三种可选：<code>inherit</code>（用主代理的工作区）、<code>branch</code>（开一个独立的 Git worktree，用完自动清掉）、<code>share</code>（共享目录）。</p>
<p><strong>上下文：</strong>子代理从零开始，看不到主代理之前的对话。权限照抄主代理的，嵌套最多 10 层。</p>
<p><strong>防假装做完：</strong>只有一道：主代理自己看回复。</p>
<div class="tldr"><p>一句话：最轻的一种，适合几秒到几分钟就能干完、又不想打断你的小活。</p></div>
<h2><code>/boost</code>：一道难题，轮流挑刺</h2>
<p><strong>比方：</strong>一个人先解题，下一个人专门挑他的错并改掉，再下一个人接着挑。最后老师对照题目要求一条条抽查，还有问题就再来一轮。</p>
<figure class="ill"><picture><source type="image/avif" srcset="/images/posts/antigravity-multi-agent-modes/fig-03-800.avif 800w, /images/posts/antigravity-multi-agent-modes/fig-03.avif 1280w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/antigravity-multi-agent-modes/fig-03.webp" alt="一排机器人围着同一组齿轮：第一个做，第二个拿放大镜挑错，第三个拿扳手修，最后一个对着清单打勾，外圈箭头表示一轮轮重复" loading="lazy" decoding="async" srcset="/images/posts/antigravity-multi-agent-modes/fig-03-800.webp 800w, /images/posts/antigravity-multi-agent-modes/fig-03.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720"></picture></figure>
<p><strong>角色：</strong></p>
<ul>
<li><strong>Orchestrator</strong>（总管）：判断这件事是要写代码，还是要查根因。</li>
<li><strong>DeepCoder</strong> 或 <strong>DeepInvestigator</strong>（流水线协调者）：前者管实现，后者管查根因。它们负责派工人。</li>
<li><strong>首轮工人</strong>：读代码，做出第一版改动或查出根因，跑测试和边界情况。</li>
<li><strong>改进工人</strong>：重新独立读一遍原始要求，试着攻破上一版、找缺口，修好后再跑测试。</li>
</ul>
<p><strong>一轮怎么转：</strong></p>
<svg viewBox="0 0 640 150" role="img" aria-label="boost 流程：首轮工人、改进工人、总管抽查，有缺口再来一轮" style="width:100%;max-width:640px;height:auto">
  <g font-size="13" fill="currentColor" text-anchor="middle">
    <rect x="5" y="20" width="140" height="44" rx="6" fill="none" stroke="currentColor"/><text x="75" y="40">Orchestrator</text><text x="75" y="56" font-size="11">判断：写还是查</text>
    <rect x="170" y="20" width="140" height="44" rx="6" fill="none" stroke="currentColor"/><text x="240" y="40">首轮工人</text><text x="240" y="56" font-size="11">做第一版 + 跑测试</text>
    <rect x="335" y="20" width="140" height="44" rx="6" fill="none" stroke="currentColor"/><text x="405" y="40">改进工人</text><text x="405" y="56" font-size="11">攻破 → 修 → 再测</text>
    <rect x="500" y="20" width="135" height="44" rx="6" fill="none" stroke="var(--accent)"/><text x="567" y="40">Orchestrator</text><text x="567" y="56" font-size="11">对照要求抽查</text>
    <line x1="145" y1="42" x2="166" y2="42" stroke="currentColor"/><polygon points="166,38 172,42 166,46" fill="currentColor"/>
    <line x1="310" y1="42" x2="331" y2="42" stroke="currentColor"/><polygon points="331,38 337,42 331,46" fill="currentColor"/>
    <line x1="475" y1="42" x2="496" y2="42" stroke="currentColor"/><polygon points="496,38 502,42 496,46" fill="currentColor"/>
    <path d="M567 64 V105 H405 V68" fill="none" stroke="var(--accent)" stroke-width="2"/><polygon points="401,72 405,64 409,72" fill="var(--accent)"/>
    <text x="486" y="122" font-size="12">还有缺口：再来一轮</text>
    <text x="567" y="140" font-size="12">全部通过：交给你</text>
  </g>
</svg>
<p><strong>工作区：</strong>就在当前工作区里改。隔离的是上下文：每个工人在自己的子代理上下文里干活，看不到别人的思路。</p>
<p><strong>防假装做完：</strong>两道。改进工人的任务就是去攻破上一版；Orchestrator 最后还要拿改动和测试记录，对照你提的每一条要求抽查。</p>
<p><strong>长时间不停靠什么：</strong>文档没讲交接或监督机制。它靠的是「一轮接一轮」，每轮带上新的进度。官方给的耗时是秒到小时。</p>
<p><strong>它从哪来：</strong>Google Research 的文章说，<code>/boost</code> 是从 <code>/teamwork</code> 里的「迭代写代码」模式单独包装出来的，是一个顺序的「求解—验证」循环。一次很长的 <code>/teamwork</code> 跑分析了过去的运行记录，发现耦合很紧的代码，更适合一步步实现、修改，而不是拆成几块并行。</p>
<div class="tldr"><p>一句话：<code>/boost</code> 不靠人多，靠「下一个人专门挑上一个人的错」。</p></div>
<h2><code>/swarm</code>：一块留言板，一群有名字的工人</h2>
<p><strong>比方：</strong>装修队开工。工头把活按房间分好，每个师傅一间；墙上贴一块公告板，谁做什么、遇到什么问题、做完没有，都写在上面。还有一个验收员专门检查。</p>
<figure class="ill"><picture><source type="image/avif" srcset="/images/posts/antigravity-multi-agent-modes/fig-04-800.avif 800w, /images/posts/antigravity-multi-agent-modes/fig-04.avif 1280w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/antigravity-multi-agent-modes/fig-04.webp" alt="房子剖面图：每个房间一个机器人干不同的活，走廊里一块所有人都看得见的便签板，一个拿清单的验收员，长凳上打盹的机器人旁边放着铃铛" loading="lazy" decoding="async" srcset="/images/posts/antigravity-multi-agent-modes/fig-04-800.webp 800w, /images/posts/antigravity-multi-agent-modes/fig-04.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720"></picture></figure>
<p><strong>角色：</strong></p>
<ul>
<li><strong>协调者</strong>：就是你当前这个对话。它负责拆活、派活、看结果、向你汇报，自己不做技术活。</li>
<li><strong>有名字的工人</strong>：如 <code>@parser</code>、<code>@api-tests</code>、<code>@docs</code>；同类工人可以编号，如 <code>@fix-1</code> 到 <code>@fix-4</code>。</li>
<li><strong><code>@verifier</code></strong>：通常每 2 到 4 个工人配一个。它看 diff、跑测试，把问题报给写代码的工人。</li>
<li><strong><code>@monitor</code></strong>：平时睡着；如果活没干完、所有人却都不说话了，它才出来点名叫人。</li>
</ul>
<p><strong>一轮怎么转：</strong></p>
<svg viewBox="0 0 640 170" role="img" aria-label="swarm：协调者、工人、verifier、monitor 都在一块留言板上说话" style="width:100%;max-width:640px;height:auto">
  <g font-size="13" fill="currentColor" text-anchor="middle">
    <rect x="170" y="65" width="300" height="44" rx="6" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="320" y="85">共用留言板</text><text x="320" y="101" font-size="11">派活 · 提问 · diff 摘要 · 测试结果</text>
    <rect x="245" y="5" width="150" height="36" rx="6" fill="none" stroke="currentColor"/><text x="320" y="28">协调者（你的对话）</text>
    <rect x="5" y="130" width="120" height="34" rx="6" fill="none" stroke="currentColor"/><text x="65" y="152">@parser</text>
    <rect x="140" y="130" width="120" height="34" rx="6" fill="none" stroke="currentColor"/><text x="200" y="152">@api-tests</text>
    <rect x="275" y="130" width="120" height="34" rx="6" fill="none" stroke="currentColor"/><text x="335" y="152">@docs</text>
    <rect x="410" y="130" width="110" height="34" rx="6" fill="none" stroke="currentColor"/><text x="465" y="152">@verifier</text>
    <rect x="530" y="130" width="105" height="34" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="582" y="152">@monitor</text>
    <line x1="320" y1="41" x2="320" y2="65" stroke="currentColor"/>
    <line x1="65" y1="130" x2="220" y2="109" stroke="currentColor"/>
    <line x1="200" y1="130" x2="270" y2="109" stroke="currentColor"/>
    <line x1="335" y1="130" x2="330" y2="109" stroke="currentColor"/>
    <line x1="465" y1="130" x2="410" y2="109" stroke="currentColor"/>
    <line x1="582" y1="130" x2="455" y2="109" stroke="currentColor" stroke-dasharray="4 3"/>
  </g>
</svg>
<ol>
<li>协调者把活切成互不冲突的几块（比如一个文件或一个包一块），给每块配一个有名字的工人。</li>
<li>每个工人从干净的上下文开始。它的任务说明公开贴在板上：负责什么、不许碰什么、做到什么算完。</li>
<li>大家用 <code>@名字</code>、<code>@组名</code>、<code>@all</code> 在板上说话。工人之间<strong>不私聊</strong>，整个团队的对话按顺序留在一处。</li>
<li>没事干的成员在板上睡觉，不耗 token；有人 @ 它时自动醒来。</li>
</ol>
<p><strong>工作区：</strong>默认大家共用你的工作区。几个工人同时改或同时构建时，协调者可以给每人一份仓库的工作副本；删掉工人前，会先让它把改动合回来。</p>
<p><strong>防假装做完：</strong>靠 <code>@verifier</code>：它自己看 diff、自己跑测试，不是听工人说「测过了」。</p>
<p><strong>长时间不停靠什么：</strong>留言板本身就是外部状态；<code>@monitor</code> 负责发现「大家都停了」。额度用完的成员会暂停，等板上有新消息、换了模型或你发话才继续。官方给的耗时是分钟到小时；目前是预览版，耗额度比单个对话快得多。</p>
<div class="tldr"><p>一句话：<code>/swarm</code> 靠「切得开 + 一块所有人都看得见的板 + 专职验收员」。</p></div>
<h2><code>/teamwork</code>：先访谈，再按里程碑跑几天</h2>
<p><strong>比方：</strong>盖一栋楼。先和业主把需求、验收标准谈清楚，签字；然后项目经理按里程碑排工期，每一层盖完都有独立的质检、压力测试和审计，最后还有一次竣工验收。项目经理干到一半累了，就写好交接单换一个新的接着干。</p>
<figure class="ill"><picture><source type="image/avif" srcset="/images/posts/antigravity-multi-agent-modes/fig-05-800.avif 800w, /images/posts/antigravity-multi-agent-modes/fig-05.avif 1280w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/antigravity-multi-agent-modes/fig-05.webp" alt="几层高的楼在施工：底层人和机器人一起签图纸，每层有拿放大镜、压测横梁、拿夹板的检查员，顶层一个经理把一摞交接文件交给新经理" loading="lazy" decoding="async" srcset="/images/posts/antigravity-multi-agent-modes/fig-05-800.webp 800w, /images/posts/antigravity-multi-agent-modes/fig-05.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720"></picture></figure>
<p><strong>角色：</strong></p>
<ul>
<li><strong>Sentinel</strong>：你批准后接手的总协调。记录你的需求、分派任务、定期报进度，最后叫来 Success Auditor。</li>
<li><strong>Project Orchestrator</strong>：项目经理。把需求拆成里程碑，安排并行的工作线，所有活都派出去做。每个里程碑之间，它会交给一个全新的接班者，免得上下文越来越乱。</li>
<li><strong>Explorers</strong>：只读的调研员，读代码、追调用链、评估方案，不改任何源文件。</li>
<li><strong>Workers</strong>：有终端和文件工具的实现者，各做各的、互不重叠。</li>
<li><strong>Critic</strong>：独立代码审查，看正确性、完整性、健壮性、接口和代码风格。</li>
<li><strong>Challenger</strong>：写对抗测试、边界情况、失败路径、最坏输入，专门压测。</li>
<li><strong>Auditor</strong>：拿真实命令输出核对测试证据，确认测试是真跑过的，不是被 mock 掉或跳过的。</li>
<li><strong>Success Auditor</strong>：Sentinel 在收尾前叫来的最后一道，做一遍端到端验证。</li>
</ul>
<p><strong>一轮怎么转：</strong></p>
<svg viewBox="0 0 640 200" role="img" aria-label="teamwork：访谈、批准、Sentinel、Orchestrator 按里程碑派活，过四道检查，最后 Success Auditor" style="width:100%;max-width:640px;height:auto">
  <g font-size="12.5" fill="currentColor" text-anchor="middle">
    <rect x="5" y="10" width="120" height="40" rx="6" fill="none" stroke="currentColor"/><text x="65" y="28">需求访谈</text><text x="65" y="43" font-size="11">产出提示文档</text>
    <rect x="145" y="10" width="100" height="40" rx="6" fill="none" stroke="currentColor"/><text x="195" y="35">你批准一次</text>
    <rect x="265" y="10" width="110" height="40" rx="6" fill="none" stroke="currentColor"/><text x="320" y="35">Sentinel</text>
    <rect x="395" y="10" width="240" height="40" rx="6" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="515" y="28">Project Orchestrator</text><text x="515" y="43" font-size="11">按里程碑派活 · 里程碑之间换接班者</text>
    <line x1="125" y1="30" x2="141" y2="30" stroke="currentColor"/><polygon points="141,26 147,30 141,34" fill="currentColor"/>
    <line x1="245" y1="30" x2="261" y2="30" stroke="currentColor"/><polygon points="261,26 267,30 261,34" fill="currentColor"/>
    <line x1="375" y1="30" x2="391" y2="30" stroke="currentColor"/><polygon points="391,26 397,30 391,34" fill="currentColor"/>
    <rect x="395" y="75" width="115" height="36" rx="6" fill="none" stroke="currentColor"/><text x="452" y="97">Explorers（只读）</text>
    <rect x="520" y="75" width="115" height="36" rx="6" fill="none" stroke="currentColor"/><text x="577" y="97">Workers（各管一块）</text>
    <line x1="515" y1="50" x2="515" y2="75" stroke="currentColor"/>
    <rect x="215" y="135" width="420" height="36" rx="6" fill="none" stroke="currentColor"/><text x="425" y="157">每个里程碑：Critic · Challenger · Auditor 检查</text>
    <line x1="515" y1="111" x2="515" y2="135" stroke="currentColor"/>
    <rect x="5" y="135" width="190" height="36" rx="6" fill="none" stroke="var(--accent)"/><text x="100" y="157">Success Auditor 端到端验收</text>
    <line x1="215" y1="153" x2="199" y2="153" stroke="currentColor"/><polygon points="199,149 193,153 199,157" fill="currentColor"/>
    <text x="320" y="192" font-size="11">全部里程碑通过后，Sentinel 才把结果交给你</text>
  </g>
</svg>
<ol>
<li><strong>第一阶段：访谈。</strong>原则是「说清做什么，不说怎么做」：范围和目的、需求、每条需求用什么客观方式检查、验收标准、项目目录。最后产出一份提示文档，你确认一次。</li>
<li><strong>第二阶段：自己跑。</strong>Sentinel 把项目交给 Project Orchestrator，之后不用你一步步指挥。大家通过工作区里的几份文档协调：Request（需求）、Project plan（里程碑和依赖）、Progress（实时进度）。</li>
</ol>
<p><strong>工作区：</strong>专用项目目录，默认 <code>~/teamwork_projects/{PROJECT_NAME}</code>。多个工人从不同时改同一个文件；每个子代理还有自己的草稿目录。</p>
<p><strong>防假装做完：</strong>这是四种里最重的。除了 Critic、Challenger、Auditor、Success Auditor 几道关，访谈时还会问你哪些捷径不许走，据此定一个严格度：</p>
<div class="tw"><table>
<thead><tr><th>严格度</th><th>用在哪</th><th>查什么</th></tr></thead>
<tbody>
<tr><td><code>development</code>（默认）</td><td>快速迭代</td><td>只抓伪造的输出和空壳实现；可以用现成库和框架</td></tr>
<tr><td><code>demo</code></td><td>可复现的演示</td><td>再加：不许抄开源的核心逻辑、不许把核心活交给外部工具、不许读测试源码反推答案</td></tr>
<tr><td><code>benchmark</code></td><td>严格评测</td><td>完全从零实现，只能用语言标准库</td></tr>
</tbody>
</table></div>
<p><strong>长时间不停靠什么：</strong>三样东西。</p>
<ul>
<li><strong>外部持久状态</strong>：Request、Project plan、Progress 几份文档，所有状态变化、命令、审查意见、验证日志都记在里面，不靠某个对话的记忆。</li>
<li><strong>实例替换</strong>：Orchestrator 在里程碑之间交给全新的接班者（现行文档）。早期版本的做法更具体：Orchestrator 记着自己派过多少子代理，到上限就把全部状态写进交接文件，再起一个同目标、同权限的接班者，自己退出（来自 OS 那篇博客）。</li>
<li><strong>监督</strong>：现行文档只说 Sentinel 定期报进度。早期版本有一个后台定时任务查子代理写的进度文件，时间戳太久没更新，Sentinel 就杀掉并重启那个子代理（同样来自 OS 那篇博客，阈值和文件格式没公开）。</li>
</ul>
<p>官方博客里的例子：早期团队用 Gemini 3.5 Flash，从一句提示做出了一个能跑 Doom 的操作系统，用了 93 个子代理、15,314 次模型调用。他们第一次端到端跑得「快得可疑」，原因是代理翻到了之前没清掉的历史对话，后来加了防作弊措施重跑才算数。这正是 Auditor 这类角色存在的原因。</p>
<div class="tldr"><p>一句话：<code>/teamwork</code> 靠「事先谈好怎么验收 + 状态写在文件里 + 定期换新的项目经理 + 层层独立检查」撑过几天。</p></div>
<h2>为什么要拆成这么多角色</h2>
<p>Google Research 的文章给了两个理由：</p>
<ul>
<li><strong>单次尝试不稳定。</strong>所以要并行探索，再配上专门挑错的东西：Lean 证明检查器、没改过的测试套件、模拟器、硬件计数器等。</li>
<li><strong>任务一长，模型会丢细节。</strong>所以按设计切分上下文：每个代理只拿到这一步需要的文件和工具。</li>
</ul>
<p>还有一条贯穿四种模式的原则：<strong>审查者从干净的上下文出发</strong>，只看产出，不看写代码那一方的思路。</p>
<p>另外，<code>/teamwork</code> 里的「模式」（pattern）是一份规格，不是程序：它描述有哪些角色、各自干什么、什么条件下才能往下走；由框架读这份规格去启动代理。所以同一种机制（比如对抗式挑错）可以搬到不同领域。</p>
<h2>开源代码里能看到哪些零件</h2>
<p>我没找到这三个命令的官方源码，也没找到完整的开源复刻。下面三个项目各自实现了其中一部分机制。以下都是<strong>静态读源码</strong>，链接固定在具体 commit，没有安装或运行。</p>
<h3>oh-my-openagent 的 team-core：最像 <code>/swarm</code> 的通信和任务底座</h3>
<p>链接：<a href="https://github.com/code-yeongyu/oh-my-openagent/tree/5e628bcd6f2330cad30bd60313d5a12ec90b9484/packages/team-core">packages/team-core @ 5e628bc</a></p>
<ul>
<li><strong>收件箱</strong>（<a href="https://github.com/code-yeongyu/oh-my-openagent/blob/5e628bcd6f2330cad30bd60313d5a12ec90b9484/packages/team-core/src/team-mailbox/send.ts"><code>team-mailbox/send.ts</code></a>）：写入前对收件箱加锁；单条消息超过 <code>message_payload_max_bytes</code> 就拒收；对方未读积压超过 <code>recipient_unread_max_bytes</code> 也拒收（报错信息是 backpressure，即反压）；只有 lead 能发给 <code>*</code>（广播）。</li>
<li><strong>任务认领</strong>（<a href="https://github.com/code-yeongyu/oh-my-openagent/blob/5e628bcd6f2330cad30bd60313d5a12ec90b9484/packages/team-core/src/team-tasklist/claim.ts"><code>team-tasklist/claim.ts</code></a>）：用文件锁认领任务，锁里再检查一遍状态；<code>blockedBy</code> 里还有没完成的任务就拒绝；锁太久没动会被当成死锁回收。</li>
<li><strong>工作副本</strong>（<a href="https://github.com/code-yeongyu/oh-my-openagent/blob/5e628bcd6f2330cad30bd60313d5a12ec90b9484/packages/team-core/src/team-worktree/manager.ts"><code>team-worktree/manager.ts</code></a>）：真的调用 <code>git worktree add --detach</code> 给成员建独立 worktree。</li>
</ul>
<p><strong>缺什么：</strong>它是每人一个收件箱，不是所有人共用、按顺序追加的一块板；也没有里程碑审计和项目经理接班。</p>
<h3>Gas Town：最像 <code>/teamwork</code> 的持久任务、多工作区和监督</h3>
<p>链接：<a href="https://github.com/gastownhall/gastown/blob/94cc82289d2ead275a62e1db4ef1d4ada4a1f98e/docs/design/architecture.md"><code>docs/design/architecture.md</code> @ 94cc822</a></p>
<ul>
<li><strong>持久任务状态</strong>：任务和代理状态都存在 Beads 里（底下是一个 Dolt SQL 服务），不靠对话记忆。</li>
<li><strong>每个工人一个 worktree</strong>：工人叫 Polecat，各自是从同一个主仓库开出来的 git worktree。</li>
<li><strong>监督</strong>：Witness 盯着工人的健康，负责催促和清理；Deacon 收心跳；Deacon 挂了还有 Boot 来接手判断。</li>
<li><strong>合并队列</strong>（<a href="https://github.com/gastownhall/gastown/blob/94cc82289d2ead275a62e1db4ef1d4ada4a1f98e/internal/refinery/batch.go"><code>internal/refinery/batch.go</code></a>）：Refinery 把几个待合并的改动攒成一批一起测；失败先整批重试一次（防偶发失败），还失败就二分查出是哪个改动的问题。</li>
</ul>
<p><strong>缺什么：</strong>没有独立的 Critic、Challenger、Auditor 这类挑错角色，也没有一样的交接协议。</p>
<h3>OpenHands 的 critic refinement：单代理版的 <code>/boost</code> 循环</h3>
<p>链接：<a href="https://github.com/OpenHands/software-agent-sdk/blob/141423921fdaeb08cd5f53464a69e860da70b66f/openhands-sdk/openhands/sdk/agent/critic_mixin.py"><code>critic_mixin.py</code> @ 1414239</a></p>
<ul>
<li>代理想结束（发出 FinishAction）时，先让 critic 打分。</li>
<li>分数没过 <code>success_threshold</code>，就把 critic 的反馈作为新消息塞回去，让它接着改。</li>
<li>有 <code>max_iterations</code> 上限，到了就停。</li>
</ul>
<p><strong>缺什么：</strong>只有一个代理加一个打分器，没有「下一个工人独立读要求、专门攻破上一版」这种多代理分工，也没有总管对照要求抽查。</p>
<h2>资料来源</h2>
<ul>
<li>官方文档：<a href="https://antigravity.google/docs/subagents">Subagents</a>、<a href="https://antigravity.google/docs/boost">Boost</a>、<a href="https://antigravity.google/docs/swarm">Swarm</a>、<a href="https://antigravity.google/docs/teamwork">Teamwork</a>（总表和每种模式的角色、工作区、验收都以这里为准）。</li>
<li><a href="https://antigravity.google/blog/google-antigravity-built-an-os/">Google Antigravity built an OS</a>：早期 Teamwork 怎么搭，交接文件、定时查进度、Auditor 防空壳的细节来自这里。</li>
<li><a href="https://antigravity.google/blog/teamwork-when-ai-becomes-a-research-partner/">Teamwork: when AI becomes a research partner</a>：框架和模式规格分离。</li>
<li><a href="https://research.google/blog/advancing-science-engineering-with-antigravitys-teamwork-feature/">Advancing science and engineering with Antigravity's Teamwork feature</a>：为什么切分上下文、审查者从干净上下文出发、<code>/boost</code> 的来历。</li>
</ul>
<div class="tldr"><p>一句话：四种模式从轻到重，差别在「谁管、怎么说话、怎么防假装做完、怎么撑过长时间」；开源里能找到它们的零件，但没有一个完整复刻。</p></div>
</div>
