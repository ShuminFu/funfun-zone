---
title: "AI 时代，Scrum 和看板该保留什么、怎样调整"
description: "敏捷要解决的是需求不确定、方向可能做错；实现变快以后，短反馈和小批量验证更重要，站会和估点却不必原样照搬。"
growth: seedling
planted: 2026-11-20T17:37:48+08:00
draft: false
tags:
  - "agile"
  - "kanban"
  - "scrum"
  - "workflow"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .ag .note{border-left:2px solid var(--accent); padding:.1rem 0 .1rem 1rem; margin:1.6rem 0; color:var(--foreground)}
.html-embed .ag table{width:100%; border-collapse:collapse; font-size:.93rem; line-height:1.65; margin:1.6rem 0}
.html-embed .ag th,.html-embed .ag td{border-bottom:1px solid color-mix(in srgb,var(--foreground) 30%,transparent); padding:.65rem .55rem; text-align:left; vertical-align:top; color:var(--foreground)}
.html-embed .ag thead th{border-bottom:2px solid var(--foreground); font-weight:700; color:var(--foreground)}
.html-embed .ag td:first-child{font-weight:700; white-space:nowrap}
.html-embed .ag .tbl{overflow-x:auto}
@media (max-width:520px){
  .html-embed .ag td:first-child{white-space:normal}
}

/* The blog sets theme tokens on html.dark; no data-theme override is needed. */
</style>

<div class="html-embed" lang="zh-CN">
<article class="ag">
<p class="lead">敏捷要解决的，是需求不确定、第一次理解可能出错；实现变快以后，短反馈和小批量验证更重要，站会和估点却不必原样照搬。</p>
<p>有人觉得，AI 把代码写快了，两周一次的迭代已经跟不上，因此敏捷过时了。如果把敏捷理解成固定的两周 Sprint、故事点和只用来汇报进度的站会，这个判断有一部分道理，因为其中不少做法是在协调人的注意力和工作节奏。但是敏捷要处理的问题并没有消失：需求往往一开始就不清楚，用户真正要什么，常常要等到看到可运行的结果、看到真实使用之后才能确认。实现变快以后，错误的实现和无效改动会堆积得更快，成本却不必然因此变高。要避免这些无效改动先堆积起来，仍然需要尽快验证、小批量交付，并根据反馈调整方向。</p>
<p>看板和 Scrum 是两种常见的工作方式，它们并不是敏捷的全部，固定迭代也不是所有敏捷方式都必须满足的条件。简单地说，看板按系统里还有没有空位来拉入新工作，并限制同时进行的数量，让任务持续流动；Scrum 则用一段固定长度的时间，作为检查目标和结果的容器，先确定这一轮要验证什么。两者怎么运作、该怎么选，已经在<a href="https://funfun.zone/posts/kanban-vs-scrum/">《看板与 Scrum》</a>里用可以点的模拟器讲过。按照<a href="https://scrumguides.org/scrum-guide.html">《Scrum Guide》</a>，一个 Sprint 里可以多次交付增量，Sprint Review 也不应被当成发布的门槛；故事点并不是 Scrum 规定必须使用的方法。按照<a href="https://kanbanguides.org/the-kanban-guide/2025.5/">《Kanban Guide》</a>，看板的核心是写清工作如何流转、限制在制品（WIP），并盯住阻塞和交付周期，而不只是把卡片贴上墙。</p>
<p>团队在执行这些方法时，还常常会出现另一些做法，它们并不是 Scrum 的要求，而是常见的执行偏差：把一个周期内的任务排满，在站会上轮流汇报昨天做了什么，评审时只看功能演示，以及把“完成”理解成代码已经实现。这些偏差主要是在协调人怎么分活、怎么同步进度。它们放到能够持续运行的 agent 身上，更不必原封不动地保留。不过，“人参与得越多就越慢”需要分开看。如果每一步都要等人分任务、确认方案、批准修改，执行确实会被拖慢，并行的 agent 越多，人就越容易成为瓶颈。另一方面，人如果能更早确认目标、查看原型，或者根据真实使用给出反馈，虽然会打断执行，却可能避免后面大量返工，因为 agent 可以很快把错误的需求完整实现出来。因此更稳妥的做法，不是让人退出循环，而是把逐步审批改成在关键节点介入：由人确定目标、边界和验收标准；实现、测试和修错大量交给 agent；遇到重大歧义、高风险操作，或需要判断实际价值时，再找人。也就是说，应该减少的是等待人的次数，而不是接触现实的次数。</p>
<p>现有研究并不能支持“AI 让写代码变快，所以敏捷过时了”这种说法。下面这些资料也没有直接检验：有了 AI，Sprint 是否就该缩短，或者估点是否就该取消。<a href="https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/">METR 在 2025 年上半年做的随机对照实验</a>，邀请了 16 名资深开源开发者，在他们长期参与的成熟仓库里处理真实 issue。在允许使用当时的 AI 工具之后，这些人完成任务的时间反而多了约 19%，可他们自己事后仍然觉得快了约 20%。这项研究针对的是早期 2025 年的工具和这一类任务，不能推广成所有团队、所有时期的结论。<a href="https://metr.org/blog/2026-02-24-uplift-update/">METR 后来也说明</a>，那次结果已经不能代表当前的影响。后续数据里虽然出现了加速的迹象，但参与者和任务的选择偏差使这些估计并不可靠。即便如此，早期那次实验仍然能提醒一件事：感觉变快，不能直接当成交付变快。</p>
<p><a href="https://dora.dev/research/2025/dora-report/">DORA 2025 年度调查</a>收集了近 5000 名从业者的问卷，其中 90% 的人在工作中使用 AI。调查显示，AI 采用程度更高的团队，软件交付吞吐和产品表现往往更好，但交付稳定性更差。DORA 据此认为，AI 会放大一个组织原有的长处和问题。这是相关关系，不是因果关系，更不能用来证明 Scrum 或看板本身有效还是无效。</p>
<p>讨论里更值得重视的判断是：实现变快以后，瓶颈会转到“该做什么、做得对不对”。Martin Fowler 在<a href="https://www.thoughtworks.com/en-us/insights/articles/quality-is-speed-AI-era">一次访谈</a>中说，工程纪律不该被丢掉，而应该移到更靠近可运行软件和真实条件的地方。<a href="https://jeffgothelf.com/blog/agile-in-the-age-of-ai/">Jeff Gothelf</a> 也认为，不确定性更高时，把工作切小、短周期检查并调整方向，反而更加必要。这些是专家观点，不是对某一套流程已经得出的实证结论。</p>
<p>在这个前提下，我的建议是：可以用 Scrum 来管理目标和复盘的节奏，用看板来管理任务的流动和放行。实现、测试和修错可以大量交给 agent，但是做什么、能不能接受其中的风险、要不要上线，仍然要由人负责。对照表里的调整，同样是实践建议，并不是哪一项研究已经直接证明过的标准答案。表中左边列出的，是团队中常见的执行偏差，不是 Scrum 的规范要求。</p>
<div class="tbl">
<table>
<thead>
<tr><th>环节</th><th>常见的执行偏差</th><th>可以怎样调整</th></tr>
</thead>
<tbody>
<tr><td>目标</td><td>常写成“把这些票做完”</td><td>写成可验证的结果和边界，例如“销售能导出本月订单并完成对账”</td></tr>
<tr><td>计划与估点</td><td>把周期内的任务排满，用故事点比较速度</td><td>计划变轻，重点确定这一轮要验证什么、哪些必须人审；估点可以大幅减少</td></tr>
<tr><td>站会</td><td>轮流汇报昨天做了什么</td><td>看哪些改动在等评审、哪里卡住、要不要暂停接新活</td></tr>
<tr><td>评审与完成</td><td>主要看功能演示，完成标准偏实现本身</td><td>更看真实使用和风险；测试证据、监控和回滚方案也算进“完成”</td></tr>
<tr><td>流动控制</td><td>只盯编码中的任务，忽略待审队列</td><td>更要限制待审改动的数量、单次改动的范围，以及同时在途的风险</td></tr>
</tbody>
</table>
</div>
<p>不要因为 agent 写得快，就机械地把 Sprint 缩成一天。agent 测试和修改的循环，可能只需要几分钟到几小时；但是用户、业务方和风险判断给出的反馈，往往还是以天甚至周来计。这两种循环可以不同步：agent 持续执行，人按照固定节奏检查目标和结果。</p>
<p class="note">用一个假定的团队例子来说明流程，这不是真实项目。假设这个团队要做“报表导出”。低风险自动发布的前提是：团队事先已经明确授权了自动发布的范围，并且具备相应的检查、监控与回滚。如果只是在已有的导出功能里增加一个非敏感字段，而且这项改动落在授权范围内，那么 agent 可以改代码、跑测试，并提交变更说明、测试结果和回滚步骤；在检查通过之后，才可以由预先约定的机制自动上线，同时保留记录。不能只因为改动看起来很小、测试已经通过，就自动上线。如果改动是让一个新角色能够导出全部用户数据，风险就高得多：agent 仍然可以负责实现和测试，也可以先做一轮交叉检查，但是权限影响必须由人审批，上线之后还要监控有没有出现误授权。在这种情况下，看板最需要限制的，通常不是 agent 的数量，而是正在等待人评审的改动数量、单次改动的范围，以及同时在途的风险。评审队列一旦堵住，团队就应该先暂停拉入新的任务。</p>
<p>如果团队需要定期和业务方对齐，而且多项改动必须放在一起验收，那么用 Scrum 的节奏会更合适。如果任务来得不规则、经常插单，而且很多改动可以独立上线，那么以看板为主会更合适。两者也可以组合：用 Scrum 确定目标和复盘，用看板控制并行、评审和放行。度量上，更值得关注的是一项需求到用户真正可用花了多久、改动在评审里等了多久、返工和回滚是否变多，以及用户有没有得到预期结果。PR 的数量、故事点和 token 用量，都不能直接代表这些价值。</p>
</article>
</div>
