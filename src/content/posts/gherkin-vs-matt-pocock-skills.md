---
title: "用例子写规格：Gherkin 和 Matt Pocock 的 skills 有什么不同"
description: "Gherkin 把验收例子写成人人看得懂、机器能执行的句子；Matt Pocock 的 skills 把讨论、规格、拆票、测试做成给 AI agent 走的流水线。两者怎么分工、怎么接在一起。"
growth: seedling
planted: 2026-11-19T11:04:35+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
  - "claude-code"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.tldr{border-left:2px solid var(--accent);padding:2px 14px;margin:20px 0}
.tldr p{margin:0}
</style>

<div class="html-embed" lang="zh-CN">
<p class="lead">先说结论：两套东西想解决同一件事，在动手写代码之前，先把「做完是什么样」说清楚。不同的是落点。Gherkin 把验收例子写成大家都看得懂的句子，再让机器照着跑。Matt Pocock 的 skills 把「讨论 → 规格 → 拆票 → 测试」做成一条给 AI agent 走的流水线，验收最后落在代码测试里。</p>
<p>这篇是我的个人笔记。我在工作仓库里见过一批中文 <code>.feature</code> 文件，又在本机装了 Matt Pocock 那几个 skill，就把两边放在一起对照了一下。</p>
<h2>第一部分：Gherkin、.feature 和 Cucumber</h2>
<h3>三个名字，各管一件事</h3>
<p>打个比方：做菜要有菜谱的格式、写好的菜谱、照菜谱做菜的厨师。</p>
<table>
<thead><tr><th>比方</th><th>真名</th><th>它是什么</th></tr></thead>
<tbody>
<tr><td>菜谱的格式</td><td>Gherkin</td><td>一套写法规则。关键词是 <code>Feature</code>、<code>Scenario</code>、<code>Given</code>、<code>When</code>、<code>Then</code>。</td></tr>
<tr><td>一本写好的菜谱</td><td><code>.feature</code> 文件</td><td>用 Gherkin 写出来的文件。一个文件讲一个功能。</td></tr>
<tr><td>照菜谱做菜的厨师</td><td>Cucumber</td><td>运行器。它读 <code>.feature</code>，把每句话连到一段代码去执行，跑完告诉你过没过。</td></tr>
</tbody>
</table>
<p>每句话连到代码的那一段，叫 <strong>step definition</strong>（步骤定义）。Cucumber 本身有很多语言的版本，Go 里常用 <code>godog</code>，JS 里可以用 <code>playwright-bdd</code>。</p>
<p>Gherkin 支持中文。文件第一行写 <code>#&nbsp;language: zh-CN</code>，关键词就能换成中文：</p>
<table>
<thead><tr><th>英文</th><th>中文</th><th>意思</th></tr></thead>
<tbody>
<tr><td><code>Feature</code></td><td>功能</td><td>这个文件讲哪个功能</td></tr>
<tr><td><code>Scenario</code></td><td>场景</td><td>一个具体的例子</td></tr>
<tr><td><code>Given</code></td><td>假如</td><td>开始时是什么状态</td></tr>
<tr><td><code>When</code></td><td>当</td><td>发生了一个动作</td></tr>
<tr><td><code>Then</code></td><td>那么</td><td>能检查的结果</td></tr>
<tr><td><code>And</code> / <code>But</code></td><td>而且 / 但是</td><td>接着上一句补充</td></tr>
</tbody>
</table>
<h3>背后的想法：用例子说清规格</h3>
<p>这一派叫 BDD（行为驱动开发），它的核心想法叫 <strong>Specification by Example</strong>：别写一大段抽象的需求，而是对着具体的例子，讲清楚做完是什么样。</p>
<ul>
<li><strong>用业务的话写。</strong>产品、测试、开发都能读懂，不用懂代码。</li>
<li><strong>一个场景就是一个例子。</strong>「假如」写开始的状态，「当」写一个动作，「那么」写能检查的结果。</li>
<li><strong>接上 Cucumber 就成了活文档。</strong>规格和代码对不上，测试就变红。文档不会悄悄过期。</li>
</ul>
<h3>一个例子</h3>
<p>下面是我自己编的通用场景：发布新版本时，出错率超过阈值，系统先暂停，再由人决定要不要回滚。</p>
<pre><code># language: zh-CN
功能: 灰度发布出错时先暂停，由人决定回滚
<span></span>
  背景:
    假如 服务 "订单" 正在灰度发布新版本
    而且 出错率阈值是 5%
<span></span>
  @AC-01
  场景: 出错率超过阈值时暂停发布
    假如 新版本已经放量到 20%
    当 最近 5 分钟的出错率达到 8%
    那么 发布状态变成 "已暂停"
    而且 值班人收到一条告警，里面写着出错率 8%
    但是 系统不会自动回滚
<span></span>
  @AC-02
  场景: 人确认回滚后才回滚
    假如 发布状态是 "已暂停"
    当 值班人点了 "回滚"
    那么 流量全部切回旧版本
    而且 发布记录里写下操作人
<span></span>
  @AC-03
  场景大纲: 出错率没到阈值时继续放量
    假如 新版本已经放量到 &lt;当前比例&gt;
    当 最近 5 分钟的出错率是 &lt;出错率&gt;
    那么 放量比例变成 &lt;下一比例&gt;
<span></span>
    例子:
      | 当前比例 | 出错率 | 下一比例 |
      | 20%      | 1%     | 50%      |
      | 50%      | 4.9%   | 100%     |</code></pre>
<h3>几个写法要点</h3>
<ul>
<li><strong>背景（<code>Background</code>）</strong>放所有场景都要的前提，免得每个场景重复写。</li>
<li><strong>场景大纲 + 例子表（<code>Scenario Outline</code> + <code>Examples</code>）</strong>：同一个句式换几组数，用一张表写完。</li>
<li><strong>标签（如 <code>@AC-01</code>）</strong>把场景连到验收规则。一条规则有没有场景覆盖，一查就知道。</li>
<li><strong>用「但是」写不该发生的事。</strong>上面的「但是 系统不会自动回滚」就是在守一条边界。</li>
<li><strong>「假如」里不写动作</strong>，只写状态。<strong>「当」只写一个动作。</strong>一个场景里出现两个「当」，多半该拆成两个场景。</li>
</ul>
<h3>常见的坑</h3>
<ul>
<li><strong>把界面点击写进去。</strong>「当 我点击右上角第二个按钮」——这是脚本，不是规格。界面一改，句子就全错了。要写「当 值班人选择回滚」这种业务动作。</li>
<li><strong>步骤定义越写越多，没人维护。</strong>每种说法都对应一段胶水代码，说法一多，胶水就乱。</li>
<li><strong>写了 <code>.feature</code> 却从没接运行器。</strong>那它就只是一份文档，会和代码慢慢对不上，失去「活文档」的意义。</li>
</ul>
<div class="tldr"><p>一句话：Gherkin 是格式，<code>.feature</code> 是按格式写好的例子，Cucumber 让这些例子真的能跑。</p></div>
<h2>第二部分：Matt Pocock 的 skills</h2>
<p>Matt Pocock 写了一组给 Claude Code 用的 skill（技能，就是一段写给 AI agent 的工作说明）。我本机装的有四个，串起来正好是一条从想法到代码的流水线：</p>
<p><strong>grilling → to-spec → to-tickets → tdd</strong></p>
<h3>grilling：先把问题问透</h3>
<p>比方：动工前，师傅追着你一条条问清楚。</p>
<ul>
<li>把决策树的每条分支都走一遍，一个决定一个决定地解决。</li>
<li><strong>一次只问一个问题</strong>，等你回答完再问下一个。原文的理由是：一次问一堆会让人发懵。</li>
<li>每个问题都附上它推荐的答案。</li>
<li><strong>事实自己查，决定交给人。</strong>文件里、工具里能查到的事实，agent 自己去查；要拍板的事，一条条问你。</li>
<li>没确认「我们已经想法一致」之前，不动手。</li>
</ul>
<h3>to-spec：把聊过的东西写成规格</h3>
<p>这一步不再访谈，直接把前面聊过的内容合成一份规格（也就是 PRD）。</p>
<ul>
<li><strong>先定测试缝。</strong>缝（seam）就是测试站的那条公开边界：从这里看行为，不伸手进内部。原文要求：优先用已有的缝；越高越好；越少越好，理想是只有一条。定好后要和人确认。</li>
<li>规格的固定段落：问题（用户视角）、方案（用户视角）、用户故事、实现决定、测试决定、不做什么、补充说明。</li>
<li><strong>用户故事要列很长一串</strong>，格式是 <code>As an &lt;actor&gt;, I want a &lt;feature&gt;, so that &lt;benefit&gt;</code>（作为谁，我想要什么，为了什么）。</li>
<li>规格里不写具体文件路径和代码片段，因为它们很快会过时。</li>
</ul>
<h3>to-tickets：拆成能单独演示的小票</h3>
<p>比方：不是先盖完一整层地基再盖一整层墙，而是先打通一条从地下到楼顶的细管子。</p>
<ul>
<li>每张票是一个 <strong>tracer bullet</strong>（曳光弹）式的<strong>纵向切片</strong>：窄，但穿透每一层（数据结构、接口、界面、测试），做完就能单独演示或验证。</li>
<li>每张票的大小，要能放进一次全新的上下文里做完。</li>
<li>每张票写明被哪些票卡住（blocking 边）。没被卡的票马上能做。</li>
<li>开工从「前沿」开始：所有卡它的票都做完了，它就能做。</li>
<li>拆完先给人看：粒度合不合适、依赖对不对、要不要合并或再拆。</li>
<li><strong>例外：大面积的机械改动</strong>（比如改一个到处都在用的字段名），一改就会弄坏成千上万处调用，没法切成纵向小票。这时用 <strong>expand–contract</strong>：先加新形式、旧的留着；再分批把调用方迁过去；最后没人用旧的了再删掉。</li>
</ul>
<h3>tdd：红 → 绿</h3>
<ul>
<li>先写一个会失败的测试（红），再写刚好够它通过的代码（绿）。</li>
<li><strong>只在事先商量好的缝上写测试</strong>，测外部行为，不测内部实现。好测试读起来就像规格。</li>
<li>一次只做一个切片：一条缝、一个测试、一点实现。</li>
<li>要避开的写法：和实现绑死的测试（一重构就坏、行为却没变）；同义反复的测试（用和代码一样的算法算期望值，永远不会失败）；先把所有测试一口气写完再写实现。</li>
<li>值得一提：这个版本的 skill 明确说<strong>重构不在这个循环里</strong>，而是放到之后的代码审查阶段。所以它是「红 → 绿」，不是常说的「红 → 绿 → 重构」。</li>
</ul>
<div class="tldr"><p>一句话：先问透，再写规格，再拆成能演示的小票，最后用测试一点点做出来。</p></div>
<h2>两边对照</h2>
<table>
<thead><tr><th></th><th>Gherkin / Cucumber</th><th>Matt Pocock 的 skills</th></tr></thead>
<tbody>
<tr><td>主要写给谁</td><td>人（产品、测试、开发）和运行器</td><td>AI agent，人在关键点拍板</td></tr>
<tr><td>规格长什么样</td><td>一个个具体例子：假如 / 当 / 那么</td><td>一份 PRD：一长串用户故事 + 实现和测试决定</td></tr>
<tr><td>验收落在哪</td><td><code>.feature</code> 文件本身，由 Cucumber 执行</td><td>代码测试，挂在少数几条高层的缝上</td></tr>
<tr><td>要维护什么</td><td>自然语言句子 + 步骤定义胶水</td><td>测试代码；没有自然语言胶水</td></tr>
<tr><td>覆盖的范围</td><td>「做完是什么样」这一段</td><td>从讨论到拆票到写代码的整条路</td></tr>
<tr><td>主要风险</td><td>胶水没人维护；没接运行器就过期</td><td>用户故事和测试之间靠人和 agent 自己对齐</td></tr>
</tbody>
</table>
<p><strong>相同的地方：</strong>都从用户故事或具体例子出发；都要求「做完的定义」写在代码之前；都只看外部行为，不看内部怎么实现。</p>
<p><strong>可以合起来用：</strong>to-tickets 拆出来的每张票，验收标准可以直接写成「假如 / 当 / 那么」的场景。到 tdd 阶段，把这些场景一条条写成缝上的测试。这样既有人人看得懂的例子，又不用维护一套步骤定义胶水。</p>
<h2>什么时候选哪个</h2>
<ul>
<li><strong>选 Gherkin：</strong>业务方真的会读、会改验收例子；规则多、例子多，适合用表格列出来；团队愿意长期维护步骤定义。</li>
<li><strong>选 Matt 这套：</strong>主要靠 AI agent 写代码；要的是从模糊想法一路走到可合并的代码；不想维护自然语言胶水。</li>
<li><strong>两个都用：</strong>用 grilling 和 to-spec 把事想清楚；拆票时把验收写成 Given/When/Then；最后落成测试，不一定接 Cucumber。</li>
</ul>
<div class="tldr"><p>一句话：Gherkin 让「例子」本身变成能跑的规格；Matt Pocock 的 skills 把「从想法到代码」变成 agent 能走的流程。前者重在把话说清，后者重在把事做完，两者可以接在一起。</p></div>
</div>
