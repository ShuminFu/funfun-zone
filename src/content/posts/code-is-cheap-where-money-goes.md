---
title: "代码不值钱以后，钱流向了哪里"
description: "AI 让写软件几乎免费，跑软件却更贵。价值从代码搬到了数据、入口、养护和算力，中小公司的机会在 agent 自己做不了的地方。"
growth: seedling
planted: 2026-10-17T13:35:13+08:00
tags:
  - "ai-agents"
  - "workflow"
draft: false
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed{overflow-x:auto;max-width:100%}
.html-embed blockquote,.html-embed .note{border-left:2px solid var(--accent);padding-left:.8em;color:var(--foreground);opacity:1}
.illus{margin:1.5em 0}
.illus img{width:100%;height:auto;border-radius:8px}
.illus figcaption{font-size:.85em;opacity:.75;text-align:center;margin-top:.5em}
/* flow figures (post-figures flow.css) */
.fl{margin:28px 0;display:flex;flex-direction:column;align-items:center;gap:6px}
.fl figcaption{margin-top:10px;font-size:14px;color:var(--muted-foreground);text-align:center;max-width:36em}
.fr{display:flex;align-items:center;justify-content:center;width:100%}
.fc{display:flex;flex-direction:column;align-items:center;width:100%}
.fn{background:var(--muted);border:1px solid transparent;border-radius:10px;padding:10px 14px;text-align:center;flex:0 1 190px;min-width:0}
.fn b{display:block;font-size:15px;font-weight:600;color:var(--foreground);line-height:1.35}
.fn small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.fn.hi{background:transparent;border:2px solid var(--accent)}
.fn.dash{background:transparent;border:1px dashed var(--muted-foreground)}
.fc>.fn{flex:none;width:min(100%,300px)}
.fn.wide{width:min(100%,420px)}
.fa{flex:1 1 70px;min-width:56px;max-width:150px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 6px;font-size:13px;line-height:1.3;color:var(--muted-foreground);text-align:center}
.fa i{position:relative;display:block;width:100%;height:2px;background:currentColor}
.fa i::after{content:"";position:absolute;right:-2px;top:-4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.fa.v{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.fa.v i,.fr .fa.v i{width:2px;height:30px}
.fa.v i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.fa.v span{width:12em;text-align:left}
.fo{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 14px;margin-top:10px;font-size:13px}
.fo span{padding:4px 10px;border-radius:999px;border:1px dashed var(--muted-foreground);color:var(--muted-foreground)}
.fo .ok{border-style:solid;border-color:var(--accent);color:var(--foreground)}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;width:100%}
.fg .fn{flex:none}
.fp{width:100%;border:1px dashed var(--muted-foreground);border-radius:12px;padding:10px 10px 8px}
.pl{font-size:13px;color:var(--muted-foreground);text-align:center;margin-bottom:8px}
.pl.pb{margin:8px 0 0}
@media (max-width:640px){
.fr{flex-direction:column}
.fr .fn{flex:none;width:min(100%,300px)}
.fr .fa{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.fr .fa i{width:2px;height:28px}
.fr .fa i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.fr .fa span{width:12em;text-align:left}
}
.fa span:empty{display:none}
.fa.sw-acc{color:var(--accent)}
.fa.sw-acc span{color:var(--muted-foreground)}
.sw-code b{color:var(--muted-foreground)}
.sw-fan{flex:0 1 340px;min-width:0;display:flex;flex-direction:column;gap:10px}
.sw-to{position:relative;margin-left:22px;display:flex;align-items:baseline;gap:10px;background:var(--muted);border:2px solid var(--accent);border-radius:10px;padding:9px 12px;text-align:left}
.sw-to::before{content:"";position:absolute;left:-23px;top:-7px;bottom:-7px;width:2.5px;background:var(--accent)}
.sw-to:first-child::before{top:50%}
.sw-to:last-child::before{bottom:50%}
.sw-to::after{content:"";position:absolute;left:-21px;top:50%;width:18px;height:10px;margin-top:-5px;background:var(--accent);clip-path:polygon(0 38%,55% 38%,55% 0,100% 50%,55% 100%,55% 62%,0 62%)}
.sw-to b{flex:none;font-size:15px;font-weight:700;color:var(--accent)}
.sw-to small{font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.sw-q{flex:none;width:min(100%,330px);padding:26px 56px;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);border:0}
.sw-br{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:14px;width:100%;max-width:560px}
.sw-arm{position:relative;display:flex;flex-direction:column;align-items:center;min-width:0}
.sw-arm::before{content:"";position:absolute;top:0;left:50%;right:-8px;height:2px;background:var(--muted-foreground)}
.sw-arm.sw-yes::before{left:-8px;right:50%;background:var(--accent)}
.sw-arm>.fa.v:first-child{padding-top:0}
.sw-arm .fa.v span{width:auto}
.sw-arm .fn{flex:none;width:min(100%,240px)}
.fn.sw-ac{border:2px solid var(--accent)}
.sw-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.sw-pills span{padding:4px 12px;border-radius:999px;border:2px solid var(--accent);background:var(--muted);font-size:13px;color:var(--foreground)}
.sw-note{margin:8px 0 0;font-size:13px;line-height:1.4;color:var(--muted-foreground);text-align:center}
.sw-win{margin:10px 0 0;font-size:15px;font-weight:700;color:var(--accent);text-align:center}
@media (max-width:640px){.fr .sw-fan{flex:none;width:min(100%,340px)}}
</style>

<div class="html-embed" lang="zh">
<p class="lead">AI 让写软件几乎免费，跑软件却更贵。价值从代码搬走以后，中小公司的机会在哪里。</p>
<figure class="illus"><img src="/images/posts/code-is-cheap-where-money-goes/fig-01.webp" alt="工坊里，店主和 AI 助手看着软件窗口自己拼起来，一旁的服务器和内存条挂着价签" loading="lazy" srcset="/images/posts/code-is-cheap-where-money-goes/fig-01-800.webp 800w, /images/posts/code-is-cheap-where-money-goes/fig-01.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" width="1200" height="675" decoding="async" data-avif="no"></figure>
<p>这个月，一个开发者用 Claude 把 Word、Excel、PowerPoint 各克隆了一遍，Rust 写的，开源。表格那个，Excel 的 523 个函数做出了 513 个。</p>
<p>今年第一季度，内存合约价一个季度涨了九成左右。</p>
<p>写软件快不要钱了，跑软件却越来越贵。两件事碰在一起，会改变企业买什么、软件公司卖什么。我想把它想清楚，最后落到一个具体问题上：<strong>中小公司在 AI 时代该做什么。</strong></p>
<h2>写软件便宜了，跑软件贵了</h2>
<p>先说便宜的一头。用 AI 重构几十万行代码、把性能提几倍，已经是每周都能刷到的新闻。想用 Office，有人做出来了；想要 Navicat 又不想付钱，自己做一个也不难。Retool 今年调查了 817 个企业开发者：35% 已经用自建工具替换过至少一个 SaaS，78% 打算明年做更多。</p>
<p>再说贵的一头。服务器、内存、算力都要真金白银地买，而且在涨。还有一笔新账：现在的软件每用一次，都要调一次模型。token 单价在降，可 agent 做一件事用掉的 token 涨得更快，总账单还是往上走。软件正在从「一次买断」变成「按用量交电费」。</p>
<p>两头一夹，会带出一个有意思的变化。过去几十年有条 Wirth 定律：软件变慢的速度，比硬件变快的速度还快。因为内存便宜、人工贵，大家宁可多吃内存也要省开发时间，一个聊天软件占 1GB 也没人管。现在反过来了，内存贵，优化的人工便宜，AI 一晚上就能把一个模块重写一遍。软件可能要迎来一段瘦身期。不过省下来的内存，多半又会被模型吃掉。</p>
<h2>每家公司都能有自己的软件</h2>
<p>钉钉和飞书做的事，本质是把几十万家公司的需求抽象成一份标品。钉钉偏标准化，飞书多照顾一些定制，但都是「大家需求的平均值」。</p>
<p>现在多了一条路。老板可以直接对 AI 说：「给我做个聊天办公软件。」第一版当天就能出来，之后缺什么加什么。小公司常常说不清自己要什么，这曾经是自建软件最大的坑；现在可以先做出来、边用边改，原型就是需求文档。</p>
<p>资本市场已经当真了。今年 2 月，华尔街给软件股的大跌起了个名字，叫 SaaSpocalypse，几周内蒸发的市值据估算接近 1 万亿美元，按人头收费的公司跌得最狠。也有人算了反方向的账：Jira 一个月 400 美元，自己造再加上维护，肯定更贵；Salesforce 一个月 2.5 万美元，自己造可能真划算。那篇文章的结论我认同：软件未死，平庸已死。</p>
<h2>价值搬去了哪里</h2>
<p>代码不值钱了，钱并没有消失，只是换了地方。我数下来有四处。</p>
<figure class="fl not-prose">
<div class="fr">
<div class="fn dash sw-code"><b>代码</b><small>写起来几乎免费</small></div>
<div class="fa sw-acc"><span></span><i></i></div>
<div class="sw-fan">
<div class="sw-to"><b>数据</b><small>粘性只剩它，企业想把它拿回来</small></div>
<div class="sw-to"><b>入口</b><small>跨公司协作，大家得用同一个</small></div>
<div class="sw-to"><b>养护</b><small>改了一百次，还不能坏</small></div>
<div class="sw-to"><b>算力</b><small>每用一次，都要调一次模型</small></div>
</div>
</div>
<figcaption>代码之外，价值去了这四个地方。</figcaption>
</figure>
<h3>1. 数据</h3>
<p>代码谁都能写，你公司十年的客户记录、审批历史、组织关系却抄不走。SaaS 剩下的粘性，基本就是「你的数据在我这里」。</p>
<p>问题是，这种粘性越来越像扣人质。以前 SaaS 收钱，是因为你自己做不出来；现在你做得出来，它还在收钱，凭的只是数据。企业当然更想走。AI 还顺手降低了搬家成本：读懂旧系统的导出、对上新表的字段、照着旧审批流重建一份，都是 agent 擅长的活。</p>
<p>厂商有两条路：锁得更紧，或者主动开放、靠服务留人。2025 年 5 月，Salesforce 改了 Slack 的 API 条款，不许第三方批量导出数据，也不许拿这些数据喂大模型。我更相信最后的形态是<strong>数据和软件分开</strong>：数据放在企业自己名下，上面的软件随时能换。软件股大跌那阵子，做数据底座的 Snowflake 有一天涨了 35%，钱在往数据层走。</p>
<h3>2. 入口</h3>
<figure class="illus"><img src="/images/posts/code-is-cheap-where-money-goes/fig-02.webp" alt="三座大厂的城门人来人往，小店主在冷清的街边造一扇小门，两个机器人隔着小巷握手" loading="lazy" srcset="/images/posts/code-is-cheap-where-money-goes/fig-02-800.webp 800w, /images/posts/code-is-cheap-where-money-goes/fig-02.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" width="1200" height="675" decoding="async" data-avif="no"></figure>
<p>公司内部可以各用各的软件。可你要和客户、供应商打交道，大家就得用同一个产品。企业微信背后是微信，钉钉背后是阿里的商家生态，飞书背后是字节。入口在大厂手里。</p>
<p>所以我觉得，不是大厂的公司，别去碰通用办公 SaaS。功能做得再好，客户也不会为你装一个新 app；大厂把办公软件当引流的门，可以不收钱，你不行。</p>
<p>有一个变数。agent 之间可以通过协议直接对话，比如 Google 发起、现在归 Linux 基金会管的 A2A。真走到那一步，入口就像电子邮件：谁家的邮箱都能互相发信，不需要用同一个产品。但大厂也在抢「企业的 agent」这个位置，起点还更好，所以这只是变数，不是小公司的必胜牌。agent 之间怎么交接，我在<a href="/posts/front-desk-agent/zh/">另一篇文章</a>里写过。</p>
<h3>3. 养护</h3>
<p>做出来容易，养起来难。不懂技术的人一直往上加需求，有几个坑是看不见的：</p>
<ul>
<li><strong>加容易，改难。</strong>加个按钮很简单；把「一个部门」改成「多个部门」，就得迁移全部旧数据，出了错，数据就没了。</li>
<li><strong>不知道自己不知道。</strong>老板判断得了功能对不对，判断不了谁能看工资表、离职员工的账号关没关。</li>
<li><strong>有些东西生成不了。</strong>推送证书、应用商店审核、合规备案，代码能生成，手续生成不了。</li>
<li><strong>技术债以 AI 的速度堆积。</strong>一年加两百个需求，没人看整体结构。</li>
</ul>
<p>还有一层更隐蔽：依赖没有消失，只是换了对象。以前租软件，被 SaaS 厂商绑住；以后租的是「AI 程序员」，被模型和 agent 平台绑住。软件是你的，能维护它的却可能只有那个 AI。</p>
<h3>4. 算力</h3>
<p>每家公司都有了自己的软件，每个软件都要调模型。就像每户人家都装了电器，中间得有一层负责供电、配电、计量，还得有保险丝。软件可以散在各家，但硬件越贵，算力越会往共享的平台集中。</p>
<h2>一个判断标准</h2>
<p>说到机会，最先想到的往往是「帮企业造第一版软件」和「帮企业搬数据」。可这两件事，企业自己的 agent 就能做。老板说一句，第一版就出来了；导出、对字段、清洗、导入，也是 agent 的拿手活。AI 外包会有一个窗口期，就是企业还不会指挥 agent 的这一两年，过了就关上了。</p>
<p>所以我用一个问题来筛：</p>
<blockquote><p><strong>这件事，企业自己的 agent 能不能做？能做，就不是好生意。</strong></p></blockquote>
<figure class="fl not-prose">
<div class="fc">
<div class="fn wide"><b>一件事，值不值得做成生意？</b></div>
<div class="fa v"><span></span><i></i></div>
<div class="fn sw-q"><b>企业自己的 agent 能做吗？</b></div>
<div class="sw-br">
<div class="sw-arm">
<div class="fa v"><span>能</span><i></i></div>
<div class="fn"><b>不是好生意</b><small>例：造第一版、搬一次数据</small></div>
<p class="sw-note">AI 外包只有一个过渡窗口</p>
</div>
<div class="sw-arm sw-yes">
<div class="fa v sw-acc"><span>不能</span><i></i></div>
<div class="fn sw-ac"><b>看它占了哪一条</b></div>
<div class="fa v sw-acc"><span></span><i></i></div>
<div class="sw-pills"><span>门禁</span><span>兜底</span><span>持续</span><span>规模经验</span></div>
<p class="sw-win">占一条以上，才是机会</p>
</div>
</div>
</div>
<figcaption>判断一件事值不值得做成生意。</figcaption>
</figure>
<p>agent 做不了的事，至少占下面一条：</p>
<table><thead><tr><th>条件</th><th>说的是什么</th></tr></thead><tbody>
<tr><td>门禁</td><td>别人不给你的 agent 开门，比如旧 SaaS 限制导出</td></tr>
<tr><td>兜底</td><td>出了错，得有人负责、有人签字</td></tr>
<tr><td>持续</td><td>不是做一次就完，得一直做</td></tr>
<tr><td>规模经验</td><td>服务过很多家才学得到，比如某个财务软件版本的字段坑</td></tr>
</tbody></table>
<h2>三类正在长出来的需求</h2>
<p>用这把尺子筛一遍，剩下三类。短期的活多半是一次性的，长期的才是能一直做下去的生意。</p>
<table><thead><tr><th>类别</th><th>占了哪条</th><th>短期（1–2 年）</th><th>长期（3–5 年）</th></tr></thead><tbody>
<tr><td><strong>养护</strong></td><td>兜底、持续</td><td>自建工具的安全和权限体检</td><td>软件维保、数据保险箱、行业种子</td></tr>
<tr><td><strong>AI 中转站</strong></td><td>持续、规模经验</td><td>token 监控、模型路由</td><td>企业 AI 网关：计量、计费、合规、私有模型</td></tr>
<tr><td><strong>新入口</strong></td><td>门禁</td><td>钉钉、飞书上的行业 agent</td><td>企业 agent 前台、A2A 接口</td></tr>
</tbody></table>
<h3>养护：像维护一条流水线</h3>
<figure class="illus"><img src="/images/posts/code-is-cheap-where-money-goes/fig-03.webp" alt="软件流水线旁，企业自己的机器人在调一个工位，供应商的技师拿着监控平板走进来" loading="lazy" srcset="/images/posts/code-is-cheap-where-money-goes/fig-03-800.webp 800w, /images/posts/code-is-cheap-where-money-goes/fig-03.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" width="1200" height="675" decoding="async" data-avif="no"></figure>
<p>企业的软件像工厂里的一条流水线。可以自己养工程师来维护，也可以不养人，交给流水线的供应商维保。线少、不关键，自己兼着管；线多、停不起，就签维保合同。</p>
<p>麻烦在于，供应商能维保，是因为它认识这台机器，机器本来就是它造的。企业用 AI 自己造的软件，世上没有一个供应商认识，接手就像修一台没有图纸的机器。</p>
<p>解法是<strong>行业种子</strong>。拿连锁餐饮举例，一个「餐饮种子」里有门店、菜品、库存、排班这些数据结构，有订货、盘点、交班的标准流程，接好了外卖平台、收银机和电子发票，带着食品安全台账，还附一份给 AI 看的说明书和测试：哪里能改，哪里不能动，改完怎么检查有没有改坏。一家有五个门店的火锅店拿到它，对 AI 说「加一个锅底配方管理」，AI 就在种子上改，不用从零开始。</p>
<p>种子的提供者，就是这条流水线的供应商。所以<strong>种子和维保是同一门生意</strong>：种子把客户带进来，维保合同把客户留下。比较常见的分工会是这样：企业自己的 agent 管日常改需求，服务商管监控、巡检和大修。和真的流水线不一样，软件每周都在改，所以「养」不只是修，还得保证改了一百次以后它没被改坏。</p>
<p>同一条线上还有<strong>数据保险箱</strong>。一家 50 人的贸易公司，客户在 CRM 里，订单在财务软件里，审批在钉钉里，合同在网盘里，报价单在销售自己的 Excel 里。保险箱每天把这些同步到企业自己名下，用统一的格式存好。它的卖点不该是「防锁定」，中小企业要到换软件那天才会觉得疼；卖点应该是「让你的 AI 看懂你的公司」，这个今天就能感受到。</p>
<p>要说清楚的是，种子和保险箱本身都很难卖出高价。钉钉、飞书的模板中心大多免费，如果一个种子只是一张表加几个流程，AI 自己就能生成。值钱的是 AI 不知道的那部分：行业对接、合规规则，以及跟着政策和接口变化的持续更新。</p>
<h3>AI 中转站：电网和电表</h3>
<p>算力、模型路由、用量计量、按用量或按结果计费、账单治理，合起来就是一个新行业：AI 时代的电网加电表。企业不再直接连各家模型，而是统一走一个口子。在这里决定简单的活给便宜模型、难的给好模型；按部门和应用记账、设上限；敏感数据不出门，每次调用都留下记录。</p>
<p>国内一说「中转站」，很多人想到的是转卖模型 API、赚差价。这种生意靠信息差，来源不明，随时可能断，差价也迟早被抹平。值钱的是治理那一半。这一行也会被云厂商和模型厂商挤压，单纯转发会越来越不赚钱；但部门预算、审批、审计、私有化部署这些细活，大厂未必愿意为中小企业做细。</p>
<h3>新入口：借大厂的入口，或者等 agent 直连</h3>
<p>短期最现实的做法，是长在大厂的入口上：在钉钉、飞书里做行业 agent，入口借大厂的，价值自己做。也可以占一个行业的小入口，比如建材商和工地之间、药厂和药店之间的协作。长期则押注 agent 之间直接对话，把自己的报价、下单、查进度做成别人的 agent 能调用的样子。</p>
<h2>中小公司现在能做什么</h2>
<p><strong>如果你的公司是用软件的：</strong></p>
<ol>
<li>先把数据拿回来，存整齐。数据在自己手里，换软件、用 AI 都不怕被卡住。</li>
<li>通用的继续买；能让你比同行强的流程，再自己造。</li>
<li>每个自建工具都要有一个负责的人，每个月 token 花了多少也要记清楚。</li>
<li>培养会提需求、会验收的人。写代码交给 AI 以后，说清楚要什么、判断做得对不对，成了新的核心能力。</li>
<li>把自己的服务做成 agent 能调用的样子。以后找上门的，可能是客户的 agent。</li>
</ol>
<p><strong>如果你的公司是做软件的</strong>，方向是从卖软件变成养软件：</p>
<table><thead><tr><th>别做</th><th>改做</th></tr></thead><tbody>
<tr><td>通用办公 SaaS</td><td>行业垂直，或者长在大厂入口上</td></tr>
<tr><td>按人头收费</td><td>按用量或按结果收费</td></tr>
<tr><td>卖成品</td><td>卖种子，再签维保</td></tr>
</tbody></table>
<h2>钱流向哪里</h2>
<table><thead><tr><th></th><th>以前</th><th>以后</th></tr></thead><tbody>
<tr><td>企业买什么</td><td>功能</td><td>数据、入口、养护、算力</td></tr>
<tr><td>怎么收费</td><td>按人头</td><td>按用量或按结果</td></tr>
<tr><td>软件从哪来</td><td>买标品</td><td>从种子长出来，AI 来养</td></tr>
<tr><td>被谁绑住</td><td>SaaS 厂商</td><td>AI 平台</td></tr>
</tbody></table>
<p>写代码不再是壁垒以后，竞争就转到了 agent 自己做不了的事情上：门禁、兜底、持续，还有服务过很多家才攒下的经验。</p>
<p class="note">留个问题给你：你的公司现在离不开哪个 SaaS？粘住你的，是它的功能、你的数据，还是它的入口？</p>
<h2>参考</h2>
<ul>
<li><a href="https://petapixel.com/2026/10/12/there-are-free-open-source-versions-of-microsoft-office-apps-thanks-to-ai/">PetaPixel：AI 做出的开源 Office 克隆</a></li>
<li><a href="https://www.softwareseni.com/dram-prices-in-2026-have-doubled-and-the-numbers-are-getting-worse/">DRAM Prices in 2026 Have Doubled</a></li>
<li><a href="https://www.cio.com/article/4173257/the-saas-reckoning-why-ai-is-about-to-reprice-enterprise-software.html">CIO：The SaaS reckoning（引用 Retool 2026 调查）</a></li>
<li><a href="https://fourweekmba.com/the-saaspocalypse-how-1-trillion-vanished-from-software-stocks/">The SaaSpocalypse: How $1 Trillion Vanished</a></li>
<li><a href="https://www.longangle.com/alts-education/software-ai">Long Angle：Software vs. AI Q1 2026</a></li>
<li><a href="https://www.80aj.com/2026/06/22/llm-saas-cost-analysis/">LLM 时代的 SaaS 成本测算</a></li>
<li><a href="https://www.jll.com/content/dam/jllcom/en/us/documents/reports/research-reports/26-guides-surviving-the-saaspocalypse.pdf">JLL：Surviving the SaaSpocalypse</a></li>
<li><a href="https://www.hunton.com/insights/legal/salesforce-locks-down-slack-data-time-to-review-your-slack-api-terms">Hunton：Salesforce Locks Down Slack Data</a></li>
<li><a href="https://a2a-protocol.org/">A2A Protocol</a></li>
</ul>
</div>
