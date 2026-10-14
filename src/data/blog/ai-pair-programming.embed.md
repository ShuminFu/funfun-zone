---
author: "Shumin Fu"
pubDatetime: 2026-10-05T10:00:00+08:00
modDatetime: 2026-10-12T10:00:00+08:00
title: "两个 AI 结对写代码，真的比一个强吗？"
slug: ai-pair-programming
featured: false
draft: false
tags:
  - "ai-agents"
  - "pair-programming"
  - "llm-eval"
description: "让 AI 编程助手跑了约 2,400 次真实任务：两个 AI 结对，什么时候真的比一个强，什么时候只是白花 2–3 倍时间。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Pair-programming article on the blog's own typography: only its custom classes need rules. */
.html-embed .meta{display:none}  /* the blog header already shows the date; "Updated" comes from modDatetime */
.html-embed .update{border-left:2px solid var(--accent);padding:2px 0 2px 1.25rem;margin:0 0 2.5rem}
.html-embed .update > h2:first-child{margin-top:0}
.html-embed .divider{margin:2rem 0 0;padding-top:1rem;border-top:1px dashed color-mix(in srgb,var(--foreground) 25%,transparent);font-size:.875em;opacity:.7}
.html-embed .table-wrap{overflow-x:auto;margin:1.25rem 0 1.75rem}
.html-embed .table-wrap table{margin:0;width:100%;font-size:.9em}
.html-embed .table-wrap th,.html-embed .table-wrap td{border:0;border-bottom:1px solid color-mix(in srgb,var(--foreground) 14%,transparent);padding:.5rem .75rem}
.html-embed .table-wrap th{font-weight:600;opacity:.7;border-bottom-width:2px}
.html-embed td.num,.html-embed th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.html-embed tr.win td{font-weight:700;color:var(--accent)}
.html-embed .oneline{font-weight:700;margin-top:1.75rem;padding:.75rem 1rem;background:color-mix(in srgb,var(--muted) 45%,transparent);border-radius:6px}
.html-embed .refs li{font-size:.875em;line-height:1.65}
.html-embed .refs i{font-style:italic}
</style>

<div class="html-embed" lang="zh-CN">
<div class="meta">2026-10-05 · Shumin · 10 月 12 日更新</div>
<section class="update">
<h2>10 月 12 日更新：两个小模型搭档，也能赢大一号的模型</h2>
<p>结对听起来很像「写完再找人检查一遍」，那它和传统的「先写代码、再验证」到底有什么不同？为了回答这个问题，我们又做了两组实验。这两组实验都不用 Opus：写代码的是 glm-5.3-flash，审查的是另一家的小模型 deepseek-flash。</p>
<p>题目也换了一种。我们在 6 个开源 Python 小库上出「加功能」的题，需求里埋了容易读漏的条款，再用隐藏测试判分。</p>
<h3>边写边审，并不比写完再审好</h3>
<p>第一组实验用了 17 道题，比较审查放在什么时候。glm 单干做对 12 道。写完只审一次，做对 16 道；开工前先审计划、写完再审，也是 16 道。每写一段就审一段，反而只做对 14 道，审查者花的 token 是只审一次的 3 倍多。</p>
<p>边写边审还让陷阱更晚被做对：13 道各组都做对的题里，中位数是第 9.1 分钟，单干是第 6.1 分钟。中间那些审查大多是走过场，第一轮就放行的约占七成；只有交卷前那一次，审查者真的在挑错，17 道里打回了 11 道。</p>
<p>所以这次的回答是：在这类题上，结对的收益几乎全来自交卷前认真审一遍，确实很像「写完再验证」。17 道题还太少，这些差距在统计上都不显著。</p>
<h3>两个小模型搭档，赢了 glm-5.3，没赢 deepseek-v4-pro</h3>
<p>第二组实验换成 41 道更难的题：每道埋 3 条陷阱，参考实现有 159–313 行。每种做法都跑了两遍，搭档的做法是只在写完后审一次。价格按各家公开价目估算，公司网关的实际结算可能不同。</p>
<div class="table-wrap"><table>
<tr><th>做法</th><th class="num">两遍合计做对（共 81 次）</th><th class="num">估算花费</th></tr>
<tr><td>glm-5.3-flash 单干</td><td class="num">41</td><td class="num">$24</td></tr>
<tr class="win"><td>glm-5.3-flash 写 + deepseek-flash 审</td><td class="num">70</td><td class="num">$76</td></tr>
<tr><td>glm-5.3 单干（大一号）</td><td class="num">56</td><td class="num">$172</td></tr>
<tr><td>deepseek-v4-pro 单干（大一号）</td><td class="num">76</td><td class="num">$54</td></tr>
<tr><td>deepseek-v4-pro 写 + deepseek-flash 审</td><td class="num">78</td><td class="num">$125</td></tr>
</table></div>
<p>这对小模型搭档在 81 次里做对 70 次，花了约 76 美元。同一家的大一号模型 glm-5.3 自己写，只做对 56 次，却花了 172 美元。一道题一道题地比，搭档赢 15 道、输 4 道，这个差距在统计上站得住（p=0.019）。</p>
<p>deepseek-v4-pro 不一样。它一个人就做对 76 次，只花 54 美元，比搭档更准，也更便宜。逐题比，搭档赢 1 道、输 7 道（p=0.07），所以不能说搭档比它强。</p>
<p>还有一点要当心：同样的实验跑两遍，结果差别不小。搭档第一遍做对 38 道，第二遍只有 32 道，挂掉的那些题审查者都放行了。所以这里只用两遍合起来的数字。</p>
<p>那审查对强模型有没有用？我们又让 deepseek-v4-pro 自己写、deepseek-flash 来审，同样跑了两遍。结果是 81 次做对 78 次，只比它单干多 2 次；逐题比，好 3 道、差 2 道，看不出差别（p=1）。花费却从 54 美元涨到约 125 美元。这和下文「学生不是学霸」那一条对得上：写代码的模型本来就很少出错，审查能补的也就很少。</p>
<p class="oneline">一句话：交卷前让另一个模型审一遍，对容易漏读需求的模型帮助很大，两个小模型搭档能赢过同一家的大一号模型，花费不到一半；对本来就很少出错的强模型，审查几乎不加分。</p>
<p class="divider">下面是 10 月 5 日的原文</p>
</section>
<p>不一定。我们让 AI 编程助手跑了约 2,400 次真实任务。大多数时候，两个 AI 结对和一个 AI 单干做得一样好，还要慢 2–3 倍。但有一种搭配稳定地赢：写代码的模型会犯错，可是看到反例就会改；另一个更强的模型只当测试员。下面讲为什么，以及我们的结对模式怎样照着这个结论来设计。</p>
<h2>先看人类：结对编程有用，但要看情况</h2>
<p>结对编程是两个人坐在一台电脑前写代码。一个人敲键盘，叫「驾驶员」；另一个人在旁边看、提问题，叫「领航员」。</p>
<p>研究人员为它做过很多实验。2009 年有一篇荟萃分析，把几十项实验放在一起看（<a href="https://doi.org/10.1016/j.infsof.2009.02.001">Hannay 等, 2009</a>）。结论是：结对写的代码质量稍好一点，完成一件事的时间也短一些；但因为是两个人，总共花的人时更多。而且不同实验的结果差得很远。</p>
<p>这篇分析里有一句很有用的话：任务简单时，结对主要是更快；任务复杂时，结对主要是质量更高。所以结对并不是处处有用，它在一个人容易出错的地方才值钱。后面会看到，AI 也一样。</p>
<h2>AI 结对：论文里的三条经验</h2>
<p>这几年有很多论文让多个 AI 一起写代码。我们读了 30 多篇，总结出三条。</p>
<ol>
<li>真跑代码，比互相夸、互相批有用。会涨分的方案几乎都让代码真的跑起来，看报错和测试结果（<a href="https://arxiv.org/abs/2207.10397">CodeT</a>、<a href="https://arxiv.org/abs/2304.05128">Self-Debug</a>、<a href="https://arxiv.org/abs/2303.11366">Reflexion</a>）。一篇综述发现，没有外部反馈时，模型光靠「想一想」很难把错改对（<a href="https://arxiv.org/abs/2406.01297">Kamoi 等, 2024</a>）。</li>
<li>测试员最好看不到代码。<a href="https://arxiv.org/abs/2312.13010">AgentCoder</a> 让一个 AI 写代码，另一个 AI 只看需求、自己写测试，这样测试不会和代码犯同一个理解错误。考试对答案也是这样：对答案的人最好自己先算一遍，而不是顺着别人的思路看。</li>
<li>「多跑几次」是很强的对手。只让同一个模型多做几遍，常常就和复杂的协作一样好（<a href="https://arxiv.org/abs/2402.05120">More Agents</a>、<a href="https://arxiv.org/abs/2306.09896">Olausson 等</a>）。把弱模型拉进来当平等成员，反而会拖低质量（<a href="https://arxiv.org/abs/2502.00674">Self-MoA</a>）。</li>
</ol>
<p>还有一篇分析了 1,600 多条多智能体的运行记录，发现很多失败是因为审查的一方没真查就放行（<a href="https://arxiv.org/abs/2503.13657">Cemri 等, 2025</a>）。我们自己也碰到过：在更早的一次真实项目评测里，审查员审了 91 次，一次也没否决。</p>
<h2>我们怎么做的实验</h2>
<p>简单说，就是让 AI 真的去做题，比较一个人做和两个人做，谁对得多。</p>
<p>每道题都是一个真实的 AI 编程会话。AI 能读文件、写代码、跑命令，和平时用我们产品时一样。我们比较了四种做法：</p>
<div class="table-wrap"><table>
<tr><th>做法</th><th>说明</th></tr>
<tr><td>单干</td><td>一个 AI 自己写、自己交</td></tr>
<tr><td>多做一遍</td><td>同一个 AI 独立做两次，有一次对就算对（算力和结对差不多）</td></tr>
<tr><td>自查</td><td>同一个 AI 写完后，自己写测试、自己对拍</td></tr>
<tr><td>结对</td><td>一个 AI 写代码（驾驶员），另一个 AI 当测试员（领航员）</td></tr>
</table></div>
<p>结对时，测试员要守三条规矩。第一，不看代码，只看题目，自己写一个慢但一定对的「暴力解」和随机数据。第二，说「有错」时必须给出一组具体输入，以及对的答案和错的答案。第三，最多审三轮，每轮要么通过，要么带着反例打回。</p>
<p>为了公平，隐藏测试谁都看不到，最后只按隐藏测试判对错。每道题的每种做法都跑一遍，用配对的方法比较（McNemar 检验，专门看「这题你对我错」的次数）。题目分成两半：前一半用来找规律；后一半在跑之前，先把要检验的假设写下来存档（预注册），只检验一次，不许事后挑。</p>
<h2>结果一：大多数时候，结对只是打平</h2>
<p>先说坏消息：在公开的编程题库上，结对几乎没赢过。</p>
<p>原因很简单，小模型单干已经做对 87%–100%。一个学生已经考了 98 分，再请老师帮他检查，也涨不了多少。</p>
<p>下表里的小模型是 deepseek-flash，结对里的测试员是 Claude Opus（或另一个小模型，取最好的那个）。</p>
<div class="table-wrap"><table>
<tr><th>题库</th><th class="num">题数</th><th class="num">单干做对</th><th class="num">结对做对</th></tr>
<tr><td>LiveCodeBench（AtCoder 中/难题）</td><td class="num">59</td><td class="num">58</td><td class="num">58</td></tr>
<tr><td>Codeforces 1700–2400 分</td><td class="num">25</td><td class="num">25</td><td class="num">25</td></tr>
<tr><td>Codeforces 2400–2900 分</td><td class="num">25</td><td class="num">24</td><td class="num">24</td></tr>
<tr><td>找漏洞（难）</td><td class="num">32</td><td class="num">31</td><td class="num">32</td></tr>
<tr><td>找漏洞（只看代码）</td><td class="num">67</td><td class="num">64</td><td class="num">65</td></tr>
</table></div>
<p>「找漏洞」是给 AI 一份人写错的代码，让它造一组输入，把错误暴露出来。</p>
<p>还有两件事不太好听。结对平均要多花 2–3 倍时间。而且在上面这些题库上，「多做一遍」从没输给结对：让同一个模型独立做两次，得分都不低于结对。</p>
<p>两个弱模型结对更糟。我们让两个 qwen（一个只有 3B 激活参数的小模型）一起找漏洞，67 题只做对 43 题，而单干的 qwen 做对 58 题，结对明显更差（p=0.006）。主要原因是交接失败：负责分析的那个 qwen，66 次里有 45 次没交出东西。</p>
<h2>结果二：换一种题、换一对搭档，结对赢了</h2>
<p>让一个会犯错的小模型写代码、Claude Opus 当测试员，49 道题做对了 41 题。同一个小模型单干，只做对 30 题。</p>
<h3>先造一批「背不出来」的题</h3>
<p>公开题库有个问题：很多题可能已经在模型的训练数据里，模型是「背」出来的。</p>
<p>所以我们自己造题：拿一道老题，只改一条规则，比如把「一条线」改成「一个环」。改完以后，老题的标准解法就不对了。我们管它叫 twist 题。</p>
<p>每道新题都用程序独立检查过：快解法和暴力解法在 300 组随机数据上答案完全一致；最大的数据也能在 3 秒内跑完；老题的正确代码放到新题上，至少错 30%（实际错 58%–86%）。最后得到 49 道题。</p>
<h3>结果</h3>
<p>写代码的是 glm-5.3-flash，一个便宜的小模型。它单干大约做对一半多，正好有提升空间。</p>
<div class="table-wrap"><table>
<tr><th>做法</th><th class="num">前一半（24 题，找规律）</th><th class="num">后一半（25 题，预注册复验）</th><th class="num">合计 49 题</th></tr>
<tr><td>glm 单干</td><td class="num">11</td><td class="num">19</td><td class="num">30</td></tr>
<tr><td>glm 多做一遍</td><td class="num">—</td><td class="num">—</td><td class="num">34</td></tr>
<tr><td>glm 自查</td><td class="num">16</td><td class="num">20</td><td class="num">36</td></tr>
<tr><td>两个 glm 结对</td><td class="num">17</td><td class="num">19</td><td class="num">36</td></tr>
<tr class="win"><td>glm 写 + Opus 测</td><td class="num">18</td><td class="num">23</td><td class="num">41</td></tr>
</table></div>
<p>glm 写、Opus 测，明显比 glm 单干好。合计是 41 题对 30 题：只有 1 题是单干对、结对错，反过来的有 12 题（p=0.003）。它也赢了「多做一遍」（41 对 34，p=0.039）。</p>
<p>不过要老实说，只看预注册的那 25 题，是 23 对 19。方向一致，但题太少，还没到统计上显著（p=0.125）。</p>
<p>两个 glm 结对和 glm 自查，都做对 36 题。同一个模型当第二个人，和自己查自己没有区别；这里的收益来自多跑了一轮测试，不是因为多了一个人。</p>
<h3>Opus 当测试员，表现怎么样</h3>
<p>glm 交上去的错代码，Opus 抓到 44 次，一次没放过；把对的代码误判成错，只有 1 次。审查之后，glm 改好了 13 题，没有一题改坏。</p>
<p>举一个真实的例子。有一题，glm 第一次交的代码打印出了中间计算用的表格，而不是答案。Opus 判了不通过，并给出一组反例。glm 换了一种算法重写。Opus 再用 500 组随机数据和 60 组大数据去对，全对，放行。</p>
<p>还有一点很重要：glm 的错是真 bug，不是背错了老题。它单干答错的 124 个输出里，只有 6 个和老题解法的输出一样。</p>
<h2>结对要赢，三个条件缺一不可</h2>
<p>把所有实验放在一起看，结对赢的时候，下面三件事同时成立。可以把它想成学生在做作业，旁边有个老师帮忙检查。</p>
<p>第一，学生不是学霸，单干大概做对 45%–75%。deepseek-flash 在公开题上已经做对 87%–100%，老师没什么可教的。</p>
<p>第二，学生听得懂指点，拿到反例能改对。我们试过一个只有 4B 激活参数的小模型：Opus 和 deepseek-flash 当测试员，17 份错代码抓到了 16 份，都给了反例，可这个小模型一份也没改好。glm 就接得住。</p>
<p>第三，老师独立，而且比学生强。测试员不看代码，自己写暴力解去对答案，并给出能复现的反例。如果搭档和学生一个水平，效果就和学生自己检查一样。</p>
<p>这三条里缺了任何一条，结对就是白花力气：</p>
<div class="table-wrap"><table>
<tr><th>缺了哪条</th><th>会发生什么</th></tr>
<tr><td>单干已经很好</td><td>打平，而且慢 2–3 倍</td></tr>
<tr><td>写代码的太弱</td><td>错误被抓到了，但改不动</td></tr>
<tr><td>搭档太弱</td><td>交接失败，反而更差（58 → 43）</td></tr>
<tr><td>搭档和自己一样</td><td>和自查一样，没有额外收益</td></tr>
</table></div>
<h2>一个意外发现：AI 会偷偷上网查答案</h2>
<p>做实验时，我们发现一个小模型在最难的一组题（Codeforces 3000 分以上）上，也做对了 15 题里的 13 题，平均一题只用 10 分钟。这快得不合常理。</p>
<p>翻看它跑过的命令，我们发现 140 个任务里有 18 个在用 <code>curl</code> 打开题目网页，或者在搜索引擎里搜题解。没人教它这么做。Claude Opus 在所有实验里都没这么做过。</p>
<p>我们做了三件事：所有提示词里加一句「不许联网」；写一个脚本扫描每个任务跑过的命令，只要联网查过，这题就算失败；再把之前的实验全部重新扫一遍。</p>
<p>去掉联网以后，它在这组题剩下的 8 题上还是能做对 6–7 题。这说明这些公开题很可能已经在它的训练数据里，这也是我们后来自己造 twist 题的原因。</p>
<p>所以评估 AI 的编程能力，不能只看分数，还要看分数是怎么来的。</p>
<h2>这对我们的结对模式意味着什么</h2>
<p>结对有没有用，不在人多，在分工对不对。</p>
<p>在我们的产品里，结对模式让两个 AI 一起工作，一个写、一个审，两边可以各自选模型。审查的一方被要求「能验证就先验证」，并写出判断依据，不能只说一句「没问题」。这正是上面实验里有效的做法。</p>
<p>根据实验，我们有五条建议：</p>
<ol>
<li>让两个 AI 干不同的活。一个负责写，一个负责挑错；两个都在写同一份代码，很少有用。</li>
<li>挑错的一方要拿出反例。一组具体的输入，加上「应该是什么、实际是什么」，比一大段意见有用。</li>
<li>审查方选更强的模型。便宜的模型负责写，贵的模型只用来测试。不过 10 月 12 日的实验里，另一家的小模型 deepseek-flash 当审查者也管用，见文首的更新。</li>
<li>写代码的一方不能太弱。它要能看懂反例并改对，太小的模型接不住。</li>
<li>简单的任务就别结对。如果一个 AI 自己就能做好，结对只会多花 2–3 倍时间。</li>
</ol>
<p>把两个一样的模型摆在一起，别指望它们会自动变聪明。那和让一个模型自己多检查一遍差不多。</p>
<h2>这项研究的局限</h2>
<p>我们不想把结论说得比数据更满，下面几点请认真看。</p>
<ul>
<li>复验还不够硬。预注册的 25 题单独看是 p=0.125，没到显著。合计 49 题是显著的，但合计里包含了用来找规律的那一半。要坐实，还得再造一批新题。</li>
<li>这不是最省钱的方案。Opus 自己单干，在前一半 24 道题上全对，比任何组合都强。我们证明的是：让小模型干活、大模型只当测试员，能比小模型单干好多少。</li>
<li>题是 Opus 造的，可能偏向 Opus 熟悉的题型，对它当测试员有利。</li>
<li>题型有限。都是算法题和找漏洞，有标准答案。真实项目里的需求更模糊，结论不一定能直接搬过去。</li>
<li>工具不完全对等。不同模型跑在不同的命令行工具里。</li>
<li>公开题可能被背过。这会让单干显得更强，结对更难赢。</li>
</ul>
<h2>参考文献</h2>
<ol class="refs">
<li>Hannay, J. E. et al. <i>The effectiveness of pair programming: A meta-analysis.</i> Information and Software Technology, 2009. <a href="https://doi.org/10.1016/j.infsof.2009.02.001">doi:10.1016/j.infsof.2009.02.001</a></li>
<li>Huang, D. et al. <i>AgentCoder: Multi-Agent-based Code Generation with Iterative Testing and Optimisation.</i> 2023. <a href="https://arxiv.org/abs/2312.13010">arXiv:2312.13010</a></li>
<li>Chen, B. et al. <i>CodeT: Code Generation with Generated Tests.</i> 2022. <a href="https://arxiv.org/abs/2207.10397">arXiv:2207.10397</a></li>
<li>Chen, X. et al. <i>Teaching Large Language Models to Self-Debug.</i> 2023. <a href="https://arxiv.org/abs/2304.05128">arXiv:2304.05128</a></li>
<li>Shinn, N. et al. <i>Reflexion: Language Agents with Verbal Reinforcement Learning.</i> 2023. <a href="https://arxiv.org/abs/2303.11366">arXiv:2303.11366</a></li>
<li>Kamoi, R. et al. <i>When Can LLMs Actually Correct Their Own Mistakes?</i> 2024. <a href="https://arxiv.org/abs/2406.01297">arXiv:2406.01297</a></li>
<li>Huang, J. et al. <i>Large Language Models Cannot Self-Correct Reasoning Yet.</i> 2023. <a href="https://arxiv.org/abs/2310.01798">arXiv:2310.01798</a></li>
<li>Olausson, T. X. et al. <i>Is Self-Repair a Silver Bullet for Code Generation?</i> 2023. <a href="https://arxiv.org/abs/2306.09896">arXiv:2306.09896</a></li>
<li>Li, J. et al. <i>More Agents Is All You Need.</i> 2024. <a href="https://arxiv.org/abs/2402.05120">arXiv:2402.05120</a></li>
<li>Li, W. et al. <i>Rethinking Mixture-of-Agents: Is Mixing Different LLMs Beneficial?</i> (Self-MoA) 2025. <a href="https://arxiv.org/abs/2502.00674">arXiv:2502.00674</a></li>
<li>Cemri, M. et al. <i>Why Do Multi-Agent LLM Systems Fail?</i> 2025. <a href="https://arxiv.org/abs/2503.13657">arXiv:2503.13657</a></li>
<li>McAleese, N. et al. <i>LLM Critics Help Catch LLM Bugs.</i> 2024. <a href="https://arxiv.org/abs/2407.00215">arXiv:2407.00215</a></li>
<li>Zhang, H. et al. <i>PairCoder: A Pair Programming Framework for Code Generation via Multi-Plan Exploration and Feedback-Driven Refinement.</i> 2024. <a href="https://arxiv.org/abs/2409.05001">arXiv:2409.05001</a></li>
</ol>
<p class="oneline">一句话：让一个肯改的 AI 写，让一个更强、不看代码的 AI 拿反例来挑错，结对才真的比一个人强。</p>
</div>
