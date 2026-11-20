---
title: "股市下跌时“蒸发”的钱去哪了？怎样分开衡量市场的价值和资金"
description: "市值是按最新成交价算出的估值，不是市场里的现金存量；要看清一次下跌的影响，需要把估值、可变现程度和杠杆分开衡量。"
growth: seedling
planted: 2026-11-20T16:01:18+08:00
draft: false
tags:
  - "finance"
  - "reading-notes"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .mv .note{border-left:2px solid var(--accent); padding:.1rem 0 .1rem 1rem; margin:1.6rem 0; color:var(--foreground)}
.html-embed .mv figure{margin:2rem 0; padding:1.2rem 1.1rem 1rem; border:1px solid color-mix(in srgb,var(--foreground) 30%,transparent); border-radius:10px; background:transparent}
.html-embed .mv figcaption{font-size:.88rem; color:var(--foreground); margin-top:.9rem; line-height:1.65}
.html-embed .mv .cap-row{display:flex; align-items:center; gap:.6rem; flex-wrap:wrap; font-family:"Inter",system-ui,sans-serif; font-size:1rem}
.html-embed .mv .trade{display:inline-flex; align-items:center; justify-content:center; padding:.35rem .7rem; border-radius:6px; background:var(--foreground); color:var(--background); font-weight:700}
.html-embed .mv .shares{display:grid; grid-template-columns:repeat(12,1fr); gap:4px; flex:1 1 220px; min-width:200px}
.html-embed .mv .shares i{display:block; height:22px; border-radius:3px; border:1px dashed var(--foreground); opacity:.75}
.html-embed .mv .shares i.hit{background:var(--foreground); border-style:solid; border-color:var(--foreground); opacity:1}
.html-embed .mv .op{font-weight:700; color:var(--foreground)}
.html-embed .mv .legend{display:flex; gap:1.2rem; flex-wrap:wrap; font-family:"Inter",system-ui,sans-serif; font-size:.95rem; color:var(--foreground); margin-top:.8rem}
.html-embed .mv .legend b{display:inline-block; width:14px; height:12px; border-radius:2px; vertical-align:-1px; margin-right:.35rem}
.html-embed .mv .legend .k1{background:var(--foreground)}
.html-embed .mv .legend .k2{border:1px dashed var(--foreground)}
.html-embed .mv .loop{display:grid; grid-template-columns:1fr auto 1fr; grid-template-rows:auto auto auto; gap:.5rem; align-items:center; font-family:"Inter",system-ui,"PingFang SC",sans-serif; font-size:1rem}
.html-embed .mv .loop .n{padding:.7rem .8rem; border-radius:8px; border:1px solid var(--foreground); background:transparent; text-align:center; line-height:1.5; font-weight:600}
.html-embed .mv .loop .ar{text-align:center; color:var(--accent); font-weight:700; font-size:1.1rem}
.html-embed .mv .loop .mid{grid-column:2; grid-row:2; text-align:center; font-size:.95rem; color:var(--foreground); line-height:1.5}
.html-embed .mv table{width:100%; border-collapse:collapse; font-size:.93rem; line-height:1.65; margin:1.6rem 0}
.html-embed .mv th,.html-embed .mv td{border-bottom:1px solid color-mix(in srgb,var(--foreground) 30%,transparent); padding:.65rem .55rem; text-align:left; vertical-align:top}
.html-embed .mv thead th{border-bottom:2px solid var(--foreground); font-weight:700}
.html-embed .mv td:first-child{font-weight:700; white-space:nowrap}
.html-embed .mv .tbl{overflow-x:auto}
.html-embed .mv ol.refs{font-size:.86rem; line-height:1.7; padding-left:1.3rem; color:var(--foreground)}
.html-embed .mv ol.refs a{color:var(--foreground)}
@media (max-width:520px){
  .html-embed .mv td:first-child{white-space:normal}
  .html-embed .mv .loop{display:flex; flex-direction:column; align-items:stretch}
  .html-embed .mv .loop .ar.h{transform:rotate(90deg)}
  .html-embed .mv .loop .ar.back{transform:rotate(-90deg)}
  .html-embed .mv .loop .up{display:none}
  .html-embed .mv .loop .mid::before{content:"↻ 再次压低价格："; display:block}
  .html-embed .mv .loop .o1{order:1} .html-embed .mv .loop .o2{order:2} .html-embed .mv .loop .o3{order:3} .html-embed .mv .loop .o4{order:4} .html-embed .mv .loop .o5{order:5}
  .html-embed .mv .loop .o6{order:6} .html-embed .mv .loop .o7{order:7} .html-embed .mv .loop .o9{order:9; margin-top:.4rem}
}

/* The blog sets theme tokens on html.dark; no data-theme override is needed. */
.html-embed .mv figure i,.html-embed .mv .legend b{font-style:normal}
.html-embed .mv figure .trade{font-size:1rem;line-height:1.5}
</style>

<div class="html-embed" lang="zh-CN">
<article class="mv">
<p class="lead">市值是账面估值，不是一笔存放在市场里的现金。要看清一次下跌到底损失了什么，估值、可变现程度和杠杆需要分开衡量。</p>
<p>每次市场大跌，新闻里都会出现“一天蒸发多少亿”的说法，听起来像是有一大笔现金凭空消失了。小德MOMO 的文章<a href="https://mp.weixin.qq.com/s/99ScIyDQX1RYYzu2ncMt9A">《什么都在跌？钱去哪里了？》</a>把下跌分成三种情形来讨论：财富在买卖双方之间转移；有人把未来收入提前借成了现金，之后需要还款；以及没有被任何人拿走的账面重估。不过，卖方的亏损不能简单等同于买方少付的钱，因为两者的参照价格不同：卖方的盈亏取决于他自己的买入成本，而买方“少付”则是相对于另一个参照价格而言的。那篇文章还用抵押链解释了一个看起来反直觉的现象，也就是科技股下跌时，黄金为什么也可能被一起抛售。</p>
<p>沿着这个问题，我想再追问一步：如果“蒸发”的大多不是现金，那么我们到底该用什么去衡量一个市场真正值多少钱、里面又有多少真金白银？我的结论是，没有任何单一指标能同时回答这两件事。资产值多少、能按什么价格变现、有多少借来的钱可能被强平，这是三个不同的问题，需要用不同的工具分别去看。</p>
<h2>市值为什么会“蒸发”</h2>
<p>先说最基本的机制。股票的每一笔成交都有买方和卖方，买方付出的现金直接进入了卖方的账户，因此现金并不会“流进股市”然后在里面消失。市值的算法是最新成交价乘以全部股份（<a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/market-capitalization">SEC 对市值的定义</a>），也就是说，市值用最后一笔成交的价格，给所有当时并没有成交的股份记了账。</p>
<figure>
<div class="cap-row">
<span class="trade">最新成交价</span><span class="op">×</span>
<div class="shares" aria-label="十二格示意：一格实际成交，其余格按同一价格记账">
<i class="hit"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
</div>
<span class="op">=</span><span class="trade">市值</span>
</div>
<div class="legend"><span><b class="k1"></b>真正成交、换了手的股份</span><span><b class="k2"></b>没有成交、按同一价格记账的股份</span></div>
<figcaption>示意图，不代表任何真实比例。只要最后一笔成交的价格变了，全部股份的账面价值就跟着一起重估，所以少量交易也能让总市值大幅变动。</figcaption>
</figure>
<p>正因为如此，市值下跌时缩水的主要是持有者按市价计算的财富，并没有哪个人把这部分钱揣进了口袋。不过，这种未实现的损失同样是真实的经济损失，因为持有者手里的资产确实不再值原来那么多，只是这笔损失还没有通过卖出兑现。Ferguson 在美联储所做的 <a href="https://www.federalreserve.gov/boarddocs/speeches/2005/20050112/default.htm">2005 年关于财富效应的讲话</a>里讨论的，也是这类账面财富变化带来的财富效应。</p>
<p>因此，讨论“下跌损失了什么”时，最好把几件事分开：第一是估值损失，也就是资产按市价重估后少了多少，不管卖没卖都已经发生；第二是现金需求，例如投资者被要求追加保证金，或者抵押品的折扣（haircut）提高后需要补充更多抵押品，这会占用现金，但追加保证金本身并不等于亏损；第三是已实现损失，也就是有人以低于成本的价格真的卖出了资产；第四是违约损失，也就是借款人补不上保证金、又无法偿还时，出借方承担的损失。haircut 提高会加大现金压力，可能引发强制平仓，但并不必然导致违约。</p>
<p>同样的道理，谈“资金流入流出”时也要看清口径。成交额衡量的是换手，每一笔卖出都对应一笔买入，所以它不能说明有多少现金进入或离开了市场。跨境净买入和基金的净申购、净赎回，在各自的定义边界内是有意义的数据，但是它们不能等同于整个股市的现金存量；而且 ETF 的份额申赎与 ETF 在二级市场上的买卖也是两回事。</p>
<h2>六类衡量方法，各自只能回答一部分问题</h2>
<p>既然市值不等于现金，那么想知道市场的真实价值和真实资金，就只能从不同角度分别测量。我把常见的方法归成六类，每一类都能看到一些东西，同时也都有明确的盲区。</p>
<div class="tbl">
<table>
<thead><tr><th>方法</th><th>能看出什么</th><th>局限在哪</th></tr></thead>
<tbody>
<tr><td>基本面估值</td><td>DCF、PE/PB、Shiller CAPE、市值/GDP 可以说明价格相对盈利或经济产出是否偏高。</td><td>这些指标不代表可以变现的现金，结果还受折现率、增长假设和会计口径影响，而且在其他条件不变时，回购可能抬高每股盈利。</td></tr>
<tr><td>现金流</td><td>自由现金流、分红和回购说明企业实际赚到了多少现金、又付给股东多少，可以检验利润有没有真正变成钱。</td><td>回购可能是借债完成的，资本开支有周期，分红和回购是一段时期内的现金流量，市值则是某个时点的估值，两者不能直接比较或等同。</td></tr>
<tr><td>成交深度与冲击成本</td><td>买卖价差、订单簿深度和 Amihud 非流动性指标说明，想按标价卖出时价格会被砸低多少。</td><td>市场承压时挂单会被撤掉，平时看得到的深度可能突然消失。</td></tr>
<tr><td>资金流向</td><td>ETF 和基金申赎、北向/南向资金、M2 反映基金份额变化、跨境交易倾向和广义货币。</td><td>它们都不能代表股市里的现金存量，与资产价格之间也没有一一对应的关系。</td></tr>
<tr><td>杠杆与抵押</td><td>融资融券余额、margin debt、haircut 和强平情况说明已知的证券借贷规模，以及杠杆还能撑多久。</td><td>场外、衍生品和银行信贷里的杠杆很多看不到，余额也不等于马上会被强平的规模。</td></tr>
<tr><td>流动性与资金面</td><td>BIS 全球流动性指标、SOFR、DR007 说明借钱有多难、成本有多高。</td><td>这些指标不衡量资产本身值多少，而且“全球流动性”本身就有多种定义。</td></tr>
</tbody>
</table>
</div>
<p><strong>基本面估值</strong>回答的是“贵不贵”，而不是“有多少钱”。估值方法的基础可以参考 Damodaran 的 <a href="https://pages.stern.nyu.edu/~adamodar/pdfiles/basics.pdf">DCF 讲义</a>和<a href="https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/earnmult.pdf">盈利倍数</a>的论文。常被人引用的“巴菲特指标”，巴菲特本人在 <a href="https://fortune.com/2001/12/10/warren-buffett-stock-market/">2001 年发表于 Fortune 的文章</a>里用的其实是市值/GNP，而且他自己也说过这个比率有局限；如果要算市值/GDP，可以用美联储的 <a href="https://www.federalreserve.gov/releases/z1/">Z.1 金融账户</a>。同样，Shiller 在他的<a href="https://shillerdata.com/">数据页面</a>上提醒过，回购取代分红之后，CAPE 可能会出现偏差。</p>
<p><strong>现金流</strong>是对估值的一种检验，因为它能说明账面利润有没有真正变成企业手里的钱（Damodaran 关于<a href="https://pages.stern.nyu.edu/~adamodar/pdfiles/valn2ed/ch14.pdf">股权自由现金流折现</a>的章节讲了具体做法）。但是，回购的钱如果是借来的，那么它反映的就不完全是经营赚到的现金。</p>
<p><strong>成交深度</strong>最接近“现在能套现多少”这个问题。Kyle 在 <a href="https://www.econometricsociety.org/publications/econometrica/1985/11/01/continuous-auctions-and-insider-trading">1985 年的论文</a>里给出了价格冲击的理论框架；Amihud 在 <a href="https://archive.nyu.edu/handle/2451/27420">2002 年的论文</a>里则用日收益率的绝对值除以成交额，做了一个容易计算的近似（NYU V-Lab 的<a href="https://vlab.stern.nyu.edu/docs/liquidity">流动性指标说明</a>也有介绍）。然而，这类指标最大的问题恰恰出在最需要它的时候：市场一旦承压，挂单就会撤走，平时看起来充足的深度可能在很短时间内消失。</p>
<p><strong>资金流向</strong>是最容易被误读的一类。ICI 公布的 <a href="https://www.ici.org/research/stats/etf_flows">ETF 净发行</a>只反映份额的创设和赎回，并不等于全部二级市场交易；美联储 <a href="https://www.federalreserve.gov/releases/h6/current/">H.6</a> 公布的 M2 与资产价格之间也没有一一对应的关系。至于北向资金，沪深港交易所在 2024 年 4 月 12 日宣布调整披露安排（见<a href="https://www.hkex.com.hk/News/Market-Communications/2024/2404122news?sc_lang=zh-HK">港交所公告</a>和<a href="https://www.sse.com.cn/aboutus/mediacenter/hotandd/c/c_20240412_10753188.shtml">上交所同期公告</a>），此后每日买卖差额已经不再作为日常官方数据公布。</p>
<p><strong>杠杆与抵押</strong>影响投资者是否面临追加保证金和被迫卖出的压力。公开数据可以参考 <a href="https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics">FINRA 的保证金统计</a>和<a href="https://www.sse.com.cn/market/othersdata/margin/sum/">上交所的融资融券数据</a>。Brunnermeier 和 Pedersen 在 <a href="https://www.princeton.edu/~markus/research/papers/liquidity.pdf">2009 年的论文</a>里指出，市场流动性和融资流动性会互相强化，形成流动性螺旋；BIS 的 <a href="https://www.bis.org/publ/cgfs36.pdf">CGFS 第 36 号报告</a>也分析过保证金和 haircut 如何放大周期波动。</p>
<figure>
<div class="loop" role="img" aria-label="循环示意：资产价格下跌导致抵押品贬值和 haircut 提高，进而借款收紧、追加保证金，然后被迫抛售，又压低资产价格">
<div class="n o1">资产价格下跌</div><div class="ar h o2">→</div><div class="n o3">抵押品贬值，haircut 提高</div>
<div class="ar up">↑</div><div class="mid o9">市场流动性与<br>融资流动性<br>互相强化</div><div class="ar o4">↓</div>
<div class="n o7">被迫抛售，包括其他资产</div><div class="ar h back o6">←</div><div class="n o5">借款收紧，追加保证金</div>
</div>
<figcaption>流动性螺旋的示意，依据 Brunnermeier 和 Pedersen（2009）。一旦进入这个循环，被迫抛售就可能波及其他资产；小德MOMO 的文章用抵押链解释科技股下跌为什么可能连带黄金被抛售，依据的也是这个思路。</figcaption>
</figure>
<p><strong>流动性与资金面</strong>指标看的是借钱的难度和成本，例如 <a href="https://data.bis.org/topics/GLI">BIS 全球流动性指标</a>、纽约联储公布的 <a href="https://www.newyorkfed.org/markets/reference-rates/sofr/">SOFR</a>，以及<a href="https://www.chinamoney.com.cn/chinese/mkdatapm/">中国货币网</a>上的 DR007。这些指标能说明借钱是在变难还是变容易，但是它们本身并不衡量资产值多少。</p>
<h2>把三组指标放在一起看</h2>
<p>既然每一类方法都只能回答一部分问题，那么比较可靠的做法就是把它们放在一起交叉验证。</p>
<p>第一步，我会把估值指标和自由现金流、分红、回购放在一起比较，用来判断这次下跌是因为盈利预期变差，还是只是估值倍数收缩了。第二步，我会看价差、深度和 Amihud 指标，用来判断现在的价格能不能承接大规模卖出。第三步，我会看融资余额、haircut 和资金利率，用来判断市场是否已经进入“抵押品贬值、借款收紧、被迫抛售”的循环。</p>
<p class="note">交叉验证要做的，是区分价格重估和融资压力，而不是判断损失“算不算数”。即使企业现金流稳定、融资条件也没有收紧，下跌也不能因此被看成无关紧要的账面数字，因为持有者的财富确实缩水了。反过来，当成交深度变薄、杠杆被迫平仓时，下跌除了重估之外还叠加了被迫卖出，压力还可能传导到其他资产上。</p>
<p>回到开头的问题：下跌时“蒸发”的钱，大多从一开始就不是现金，而是按最新成交价算出来的账面估值。估值缩水对持有者来说是实在的经济损失，无论他卖没卖；卖出只决定这笔损失是否实现，并不会让市场里的现金凭空消失，因为卖方收到的钱正是买方付出的钱。追加保证金或者补充抵押品会占用投资者的现金，但它本身也不是亏损。</p>
<h2>参考</h2>
<ol class="refs">
<li>小德MOMO：<a href="https://mp.weixin.qq.com/s/99ScIyDQX1RYYzu2ncMt9A">《什么都在跌？钱去哪里了？》</a>（本文的出发点）</li>
<li><a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/market-capitalization">SEC / Investor.gov：Market Capitalization</a></li>
<li><a href="https://www.federalreserve.gov/boarddocs/speeches/2005/20050112/default.htm">Ferguson：美联储关于财富效应的讲话（2005）</a></li>
<li>Damodaran：<a href="https://pages.stern.nyu.edu/~adamodar/pdfiles/basics.pdf">DCF 基础</a>、<a href="https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/earnmult.pdf">盈利倍数</a>、<a href="https://pages.stern.nyu.edu/~adamodar/pdfiles/valn2ed/ch14.pdf">股权自由现金流折现</a></li>
<li><a href="https://shillerdata.com/">Robert Shiller 数据</a>；<a href="https://fortune.com/2001/12/10/warren-buffett-stock-market/">Warren Buffett，Fortune（2001）</a>；<a href="https://www.federalreserve.gov/releases/z1/">美联储 Z.1 金融账户</a></li>
<li><a href="https://www.econometricsociety.org/publications/econometrica/1985/11/01/continuous-auctions-and-insider-trading">Kyle（1985），Continuous Auctions and Insider Trading</a>；<a href="https://archive.nyu.edu/handle/2451/27420">Amihud（2002）</a>；<a href="https://vlab.stern.nyu.edu/docs/liquidity">NYU V-Lab 流动性指标说明</a></li>
<li><a href="https://www.ici.org/research/stats/etf_flows">ICI：ETF 净发行</a>；<a href="https://www.federalreserve.gov/releases/h6/current/">美联储 H.6</a>；<a href="https://www.hkex.com.hk/News/Market-Communications/2024/2404122news?sc_lang=zh-HK">港交所公告（2024-04-12）</a>；<a href="https://www.sse.com.cn/aboutus/mediacenter/hotandd/c/c_20240412_10753188.shtml">上交所公告（2024-04-12）</a></li>
<li><a href="https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics">FINRA 保证金统计</a>；<a href="https://www.sse.com.cn/market/othersdata/margin/sum/">上交所融资融券数据</a>；<a href="https://www.princeton.edu/~markus/research/papers/liquidity.pdf">Brunnermeier 与 Pedersen（2009）</a>；<a href="https://www.bis.org/publ/cgfs36.pdf">BIS CGFS 第 36 号报告</a></li>
<li><a href="https://data.bis.org/topics/GLI">BIS 全球流动性指标</a>；<a href="https://www.newyorkfed.org/markets/reference-rates/sofr/">纽约联储 SOFR</a>；<a href="https://www.chinamoney.com.cn/chinese/mkdatapm/">中国货币网</a></li>
</ol>
</article>
</div>
