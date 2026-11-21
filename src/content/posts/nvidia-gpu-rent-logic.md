---
title: "英伟达的「算力租金」从哪里来，又为什么开始松动"
description: "一期 B 站视频把英伟达的高利润解释为 GPU 配额带来的垄断租金；本文把视频里的逻辑链整理成四张图，并把 UP 的推论、已核对的事实和待核实的说法分开标注。"
growth: seedling
planted: 2026-11-22T03:36:49+08:00
draft: false
tags:
  - "finance"
  - "gpu"
  - "notes"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .nv .note{border-left:2px solid var(--accent); padding:.1rem 0 .1rem 1rem; margin:1.6rem 0; color:var(--foreground)}
.html-embed .nv .lb{display:inline-block; font-family:"Inter",system-ui,sans-serif; font-size:.8rem; font-weight:700; line-height:1.4; padding:.05rem .45rem; border-radius:4px; background:var(--foreground); color:var(--background); vertical-align:.08em; margin-right:.2rem; white-space:nowrap}
.html-embed .nv .lb.o{background:transparent; color:var(--foreground); border:1.5px solid var(--foreground)}
.html-embed .nv .lb.q{background:transparent; color:var(--foreground); border:1.5px dashed var(--foreground)}
.html-embed .nv figure{margin:2rem 0; padding:1rem .9rem .9rem; border:1px solid color-mix(in srgb,var(--foreground) 30%,transparent); border-radius:10px}
.html-embed .nv figure svg{display:block; width:100%; max-width:560px; height:auto; margin:0 auto; color:var(--foreground); font-family:"Inter","PingFang SC","Noto Sans SC",system-ui,sans-serif}
.html-embed .nv figure svg text{fill:currentColor}
.html-embed .nv figure svg .bx{fill:none; stroke:currentColor; stroke-width:1.5}
.html-embed .nv figure svg .bx.d{stroke-dasharray:5 4}
.html-embed .nv figure svg .hl{fill:currentColor; stroke:currentColor}
.html-embed .nv figure svg text.inv{fill:var(--background)}
.html-embed .nv figure svg .ln{fill:none; stroke:currentColor; stroke-width:1.5}
.html-embed .nv figure svg .ah{fill:currentColor}
.html-embed .nv figcaption{font-size:.9rem; margin-top:.9rem; line-height:1.7; color:var(--foreground)}
.html-embed .nv table{width:100%; border-collapse:collapse; font-size:.92rem; line-height:1.65; margin:1.4rem 0}
.html-embed .nv th,.html-embed .nv td{border-bottom:1px solid color-mix(in srgb,var(--foreground) 30%,transparent); padding:.6rem .5rem; text-align:left; vertical-align:top; color:var(--foreground)}
.html-embed .nv thead th{border-bottom:2px solid var(--foreground); font-weight:700}
.html-embed .nv .tbl{overflow-x:auto}
.html-embed .nv ol.refs{font-size:.86rem; line-height:1.7; padding-left:1.3rem; overflow-wrap:anywhere}
@media (max-width:520px){
  .html-embed .nv figure{padding:.8rem .5rem .7rem}
}
/* The blog sets theme tokens on html.dark; no data-theme override is needed. */
</style>

<div class="html-embed" lang="zh-CN">
<article class="nv">
<p class="lead">一期 B 站视频把英伟达的高利润解释为 GPU 配额带来的垄断租金；本文把视频里的逻辑链整理成四张图，并把 UP 的推论、已核对的事实和待核实的说法分开标注。</p>
<p>2026 年 11 月 16 日，B 站 UP 主 TomCat团座发布了视频《美国少爷，开始明抢？英伟达股票目标价腰斩了？》。视频的前几分钟和后半段主要在谈美国政治和族裔问题，而中间大约十分钟讲的是一个经济问题：英伟达为什么能长期拿到远高于普通硬件公司的利润，这份利润为什么会招来对手。UP 把这份利润叫作「垄断租金」，把英伟达的身份概括为整个 AI 行业的「分配者和抽租者」。本文只整理这一段逻辑，政治部分只在逻辑需要时提到。</p>
<p class="note">文中用三种标记区分内容的性质。<span class="lb">视频观点</span>表示 UP 在视频里的判断或推论；<span class="lb o">已核对</span>表示我对照公开资料确认过的事实，后面附来源；<span class="lb q">UP 说法 · 未核实</span>表示视频里给出、但我没有找到公开来源的说法。视频没有官方字幕，引用依据是语音转写，个别句子听不清的地方会注明。</p>
<h2>视频里的「租金」指什么</h2>
<p><span class="lb">视频观点</span>UP 没有给「租金」下正式定义，但是从上下文看，他说的是英伟达凭借对稀缺 GPU 的分配权拿到的超额利润。在他的叙述里，英伟达一开始只是零部件供应商；后来 GPU 成了 AI 公司的生死线，谁能拿到英伟达的配额，谁就能留在牌桌上，于是英伟达的身份发生了质变，从卖芯片的公司变成了决定生产资料流向的一方。因此，「租金」在这期视频里主要不是指价格高，而是指这种分配权本身带来的收益。</p>
<h2>租金从哪里来：四个条件叠在一起</h2>
<p><span class="lb">视频观点</span>UP 把租金的来源拆成四个前后相连的条件。第一，训练大模型需要成千上万张 GPU，没有足够的 GPU 就没有入场资格；他举的例子是训练千亿参数的通用模型需要五千到八千张 H100、连续运行三到六个月<span class="lb q">UP 说法 · 未核实</span>。第二，GPU 不只是硬件，因为黄仁勋在长期没有利润的情况下坚持推了十几年 CUDA，把 GPU 变成可以用类 C 语言编程的通用计算平台，并积累了 400 多个库，所以研究团队换平台要付出很高的迁移成本。UP 认为这种软件锁定是「比硬件更高级的垄断」，并且指出 AMD 等对手在部分算力指标上已经接近甚至超过英伟达，但是软件仍然是更大的障碍。</p>
<p>第三，芯片产能短期内是固定的。UP 的理由是先进晶圆厂要建三到五年，EUV 光刻机要等一到两年，所以在一个「锁定期」里，即使有人愿意砸钱，GPU 的总量也很难马上增加。第四，UP 认为大模型是赢家通吃的行业，最早成熟的头部模型会吃掉大部分市场，而模型上线的快慢在当时主要取决于算力。按照他的说法，一家公司慢了三个月就会从第一梯队掉到第二梯队，慢了六个月就会失去竞争资格，因此风险投资也把能不能拿到 GPU 当成项目能否成功的第一道硬指标。</p>
<figure>
<svg viewBox="0 0 400 520" role="img" aria-labelledby="f1t">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ah" d="M0,0L10,5L0,10z"/></marker></defs>
<rect class="bx" x="20" y="10" width="360" height="64" rx="8"/>
<text x="36" y="36" font-size="15" font-weight="700">① 训练大模型要成千上万张 GPU</text>
<text x="36" y="59" font-size="13">GPU 数量决定一家 AI 公司能不能入场</text>
<rect class="bx" x="20" y="94" width="360" height="64" rx="8"/>
<text x="36" y="120" font-size="15" font-weight="700">② CUDA 生态锁定</text>
<text x="36" y="143" font-size="13">十几年积累的软件栈，换平台成本高</text>
<rect class="bx" x="20" y="178" width="360" height="64" rx="8"/>
<text x="36" y="204" font-size="15" font-weight="700">③ 产能短期固定</text>
<text x="36" y="227" font-size="13">建晶圆厂 3–5 年，等 EUV 1–2 年</text>
<rect class="bx" x="20" y="262" width="360" height="64" rx="8"/>
<text x="36" y="288" font-size="15" font-weight="700">④ 赢家通吃、比拼速度</text>
<text x="36" y="311" font-size="13">慢 3 个月掉梯队，慢 6 个月出局</text>
<path class="ln" d="M200,330 L200,372" marker-end="url(#a1)"/>
<rect class="hl" x="20" y="378" width="360" height="62" rx="8"/>
<text class="inv" x="200" y="404" font-size="15" font-weight="700" text-anchor="middle">英伟达的配额 = 入场券</text>
<text class="inv" x="200" y="427" font-size="13" text-anchor="middle">拿到就能活下去，拿不到就出局</text>
<path class="ln" d="M200,444 L200,470" marker-end="url(#a1)"/>
<rect class="bx" x="20" y="476" width="360" height="38" rx="8"/>
<text x="200" y="500" font-size="14" font-weight="700" text-anchor="middle">身份变化：供应商 → 分配者与抽租者</text>
</svg>
<figcaption>图 1 根据视频 05:00–07:40 整理。四个条件都是 UP 的论证，单独看每一条都只能说明 GPU 重要，只有四条叠在一起时，配额才会从「采购问题」变成「生死问题」。这也是 UP 认为英伟达能收租、而不只是卖货的原因。</figcaption>
</figure>
<h2>配额怎样变成收入和信用</h2>
<p>为了说明配额的分量，UP 举了 CoreWeave 的例子。<span class="lb o">已核对</span>CoreWeave 早年做过加密货币挖矿，它的招股书显示 2022 年营收约 1583 万美元<sup>[1]</sup>。<span class="lb">视频观点</span>UP 认为，CoreWeave 拿到英伟达优先供货的资格以后，华尔街相信只有它能按时建好数据中心、接到大模型训练的租赁生意，于是争相给它投钱，它也因此在四年内长成了几百亿美元的公司。</p>
<p>接下来，UP 用英伟达的财务数字说明这份分配权有多赚钱。<span class="lb o">已核对</span>截至 2026 年 7 月 26 日的季度，英伟达营收 962 亿美元，同比增长 106%，毛利率 75.0%<sup>[2]</sup>。UP 还拿亚马逊和沃尔玛做对比，他的意思是英伟达的营收规模不算最大，但是增速和毛利率在大公司里非常罕见。<span class="lb o">已核对</span>2026 年 6 月，英伟达发行了 250 亿美元的高级无担保票据，其中 30 年期部分比同期美国国债只高 0.65 个百分点<sup>[3]</sup>。<span class="lb">视频观点</span>UP 由此推论，市场几乎把英伟达的债券当成了某种准国家信用，再加上约 4 万亿美元市值的股票，英伟达调动资源的空间几乎没有上限。</p>
<h2>信用怎样反过来放大分配权</h2>
<p><span class="lb">视频观点</span>UP 认为，英伟达这两年开始把自己的信用当作支点，为本来买不起显卡的客户提供担保，让它们借到钱再回来买英伟达的显卡。按照他的解释，英伟达用优先供货换取数据中心创业公司的股权，相当于「只用一张配额条」就换到了大批公司的股份。</p>
<p>UP 举的第二个例子是 2026 年 8 月的数据中心担保。<span class="lb o">已核对</span>2026 年 8 月 17 日，英伟达宣布为 SB Energy 在俄亥俄州的 PORTS-Pike 园区提供信用支持：OpenAI 是租户，租约为 20 年，首批约 4.25 GW 的 IT 负载；如果 OpenAI 破产或拖欠租金，英伟达会补足保证价值与重新出租或出售所得之间的差额，累计上限为 1050 亿美元；园区独家部署英伟达的 AI 计算设施<sup>[4]</sup>。<span class="lb">视频观点</span>UP 认为，这相当于租金归建设方、风险由英伟达兜底，所以地主和电厂会抢着建，而英伟达唯一的条件是园区里只能用它的芯片。</p>
<p>第三个例子在海外。<span class="lb">视频观点</span>UP 说英伟达搭建了一个云伙伴体系，最高一级被他称为「模范云」；拿到认证的数据中心就能拿到英伟达的卡、按英伟达的标准建机房，而且这类伙伴大多是东南亚国家主导的主权 AI 工厂。他认为这些国家实力有限，一旦签约就很难离开英伟达的生态。</p>
<figure>
<svg viewBox="0 0 400 400" role="img" aria-labelledby="f2t">
<defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ah" d="M0,0L10,5L0,10z"/></marker></defs>
<rect class="bx" x="10" y="20" width="170" height="92" rx="8"/>
<text x="24" y="46" font-size="15" font-weight="700">① 投资入股</text>
<text x="24" y="70" font-size="13">英伟达给客户优先</text>
<text x="24" y="90" font-size="13">供货并换取股权</text>
<rect class="bx" x="220" y="20" width="170" height="92" rx="8"/>
<text x="234" y="46" font-size="15" font-weight="700">② 凭配额借钱</text>
<text x="234" y="70" font-size="13">客户凭配额或英伟达</text>
<text x="234" y="90" font-size="13">的担保借到资金</text>
<rect class="bx" x="220" y="250" width="170" height="92" rx="8"/>
<text x="234" y="276" font-size="15" font-weight="700">③ 买英伟达 GPU</text>
<text x="234" y="300" font-size="13">资金回流英伟达，</text>
<text x="234" y="320" font-size="13">客户进入它的生态</text>
<rect class="bx" x="10" y="250" width="170" height="92" rx="8"/>
<text x="24" y="276" font-size="15" font-weight="700">④ 利润与信用增强</text>
<text x="24" y="300" font-size="13">英伟达能发更多债、</text>
<text x="24" y="320" font-size="13">做更大的担保</text>
<path class="ln" d="M182,66 L216,66" marker-end="url(#a2)"/>
<path class="ln" d="M305,116 L305,246" marker-end="url(#a2)"/>
<path class="ln" d="M218,296 L184,296" marker-end="url(#a2)"/>
<path class="ln" d="M95,246 L95,116" marker-end="url(#a2)"/>
<text x="200" y="176" font-size="13" text-anchor="middle" font-weight="700">每转一圈</text>
<text x="200" y="196" font-size="13" text-anchor="middle">配额、股权和担保</text>
<text x="200" y="216" font-size="13" text-anchor="middle">都更集中在英伟达</text>
<text x="200" y="378" font-size="12" text-anchor="middle">第 ① 步在转写里只听清「投股权」，按上下文补全</text>
</svg>
<figcaption>图 2 根据视频 08:20–12:40 整理。UP 把这套做法概括为一个循环：英伟达先入股、客户凭配额借钱、钱再用来买 GPU，英伟达的利润和信用因此增强，又能支撑下一轮更大的担保。UP 的结论是，英伟达借此在国内外都给自己培养了「第二买家」，从而让自己的产品更稀缺。</figcaption>
</figure>
<h2>谁在分这份租金</h2>
<p><span class="lb">视频观点</span>按照 UP 的说法，过去大规模算力基本只能向亚马逊、微软、谷歌和 Meta 这四家云厂商租用，它们握着算力渠道，也就握着一部分议价权。英伟达扶持新型算力云和东南亚主权数据中心以后，市场上出现了国内、国外两套「第二买家」。UP 认为这对英伟达有三重好处：第一，GPU 的定价权不会落到下游大厂手里；第二，大厂不但压不下显卡价格，还得高价抢卡；第三，新建园区锁定了英伟达芯片的独家供货，所以大厂即使自研芯片成功，也不一定有地方部署。</p>
<p>UP 还给出了两个支撑数字：2026 年春天，新型算力云的租赁报价往往只有大厂的一半左右；几家云巨头 2026 年的资本开支已经超过经营现金流，到 2027 年现金流可能转负<span class="lb q">UP 说法 · 未核实</span>。他的结论是，英伟达的扩张让云巨头拿不到全部利润，同时又让它们承担了越来越大的风险，这就是冲突的起点。</p>
<figure>
<svg viewBox="0 0 400 470" role="img" aria-labelledby="f3t">
<defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ah" d="M0,0L10,5L0,10z"/></marker></defs>
<rect class="hl" x="110" y="10" width="180" height="56" rx="8"/>
<text class="inv" x="200" y="34" font-size="15" font-weight="700" text-anchor="middle">英伟达</text>
<text class="inv" x="200" y="55" font-size="13" text-anchor="middle">掌握 GPU 配额</text>
<path class="ln" d="M160,68 L90,118" marker-end="url(#a3)"/>
<path class="ln" d="M240,68 L310,118" marker-end="url(#a3)"/>
<rect class="bx" x="10" y="122" width="180" height="150" rx="8"/>
<text x="24" y="148" font-size="14" font-weight="700">原有渠道</text>
<text x="24" y="170" font-size="13">亚马逊、微软、</text>
<text x="24" y="189" font-size="13">谷歌、Meta</text>
<text x="24" y="216" font-size="12">· 压不下卡价</text>
<text x="24" y="236" font-size="12">· 自研芯片缺少部署位置</text>
<text x="24" y="256" font-size="12">· 资本开支压力上升</text>
<rect class="bx d" x="210" y="122" width="180" height="150" rx="8"/>
<text x="224" y="148" font-size="14" font-weight="700">第二买家</text>
<text x="224" y="170" font-size="13">国内：新型算力云</text>
<text x="224" y="189" font-size="13">（如 CoreWeave）</text>
<text x="224" y="216" font-size="13">海外：东南亚主权</text>
<text x="224" y="235" font-size="13">AI 工厂</text>
<text x="224" y="258" font-size="12">· 优先供货、担保、入股</text>
<path class="ln" d="M100,276 L180,326" marker-end="url(#a3)"/>
<path class="ln" d="M300,276 L220,326" marker-end="url(#a3)"/>
<rect class="bx" x="80" y="330" width="240" height="56" rx="8"/>
<text x="200" y="354" font-size="14" font-weight="700" text-anchor="middle">AI 公司</text>
<text x="200" y="375" font-size="13" text-anchor="middle">向两类渠道租算力</text>
<text x="200" y="420" font-size="13" text-anchor="middle" font-weight="700">UP 的判断：渠道分散以后，</text>
<text x="200" y="442" font-size="13" text-anchor="middle">定价权留在英伟达，</text>
<text x="200" y="462" font-size="13" text-anchor="middle">风险更多落在云巨头身上</text>
</svg>
<figcaption>图 3 根据视频 10:45–14:40 整理。实线框是原有的大厂渠道，虚线框是英伟达扶持起来的第二买家。图里各条箭头和结论都来自 UP 的叙述；其中报价约为大厂一半、云巨头现金流转负等数字，我没有找到可以对应的公开来源。</figcaption>
</figure>
<h2>这条链为什么会松动</h2>
<p><span class="lb">视频观点</span>UP 认为，2026 年 8 月英伟达借与 OpenAI 的合作开始介入美国的算力和电力基建以后，微软、亚马逊等巨头意识到再不动手就来不及了，于是对手的反击分别指向了英伟达的三根支柱。第一根支柱是配额权。UP 说，微软和亚马逊从 2025 年底开始游说国会通过《GAIN AI 法案》，核心要求是芯片先让美国买家优先购买，再谈出口。第二根支柱是海外的第二市场。UP 认为，对手用「通敌」的说法给东南亚的数据中心贴标签，而美国商务部还在准备新规，不但限制芯片出口，还要限制用出口芯片搭建的数据中心向特定国家提供算力，并对东南亚主权数据中心实时监控。UP 的结论是，这些措施等于把配额权从英伟达手里转到了对手手里。</p>
<p>第三根支柱是信用。UP 认为，对手借内部关系问题让董事会自己承认治理失败、启动独立调查，而调查的真正目标是英伟达的表外承诺。他的推理是：一旦这些承诺被翻出来反复讨论，英伟达就可能被扣上「制造金融风险」的帽子，它的公司信用会受损，前面那套用信用推动美国算力和电力基建的做法也就无法继续。</p>
<p><span class="lb o">已核对</span>视频前后发生的公开事件如下。11 月 8 日，英伟达董事会宣布就涉及黄仁勋的个人事项指控启动独立调查；11 月 9 日，有股东向加州北区联邦地区法院提起证券集体诉讼，指控公司信息披露不足<sup>[5]</sup>。11 月 11 日至 12 日，Bernstein 把目标价从 400 美元下调到 200 美元，报道称它没有改动盈利预测，主要是因为领导层不确定性而下调估值倍数，同时仍然认为需求很强<sup>[6]</sup>。11 月 12 日，英伟达宣布黄仁勋辞去 CEO 和董事职务，CFO Colette Kress 出任临时 CEO，董事会启动正式的 CEO 遴选<sup>[7]</sup>。相关指控仍在调查中，目前没有公开的结论。</p>
<figure>
<svg viewBox="0 0 400 452" role="img" aria-labelledby="f4t">
<defs><marker id="a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ah" d="M0,0L10,5L0,10z"/></marker></defs>
<text x="20" y="22" font-size="12" font-weight="700">英伟达的支柱</text>
<text x="380" y="22" font-size="12" font-weight="700" text-anchor="end">UP 所说的针对方式</text>
<rect class="hl" x="10" y="34" width="130" height="78" rx="8"/>
<text class="inv" x="75" y="68" font-size="15" font-weight="700" text-anchor="middle">配额权</text>
<text class="inv" x="75" y="90" font-size="12" text-anchor="middle">谁先拿到卡</text>
<rect class="bx d" x="170" y="34" width="220" height="78" rx="8"/>
<text x="184" y="60" font-size="13">GAIN AI 法案：</text>
<text x="184" y="80" font-size="13">美国买家优先购买，</text>
<text x="184" y="100" font-size="13">然后才能出口</text>
<path class="ln" d="M168,73 L144,73" marker-end="url(#a4)"/>
<rect class="hl" x="10" y="128" width="130" height="78" rx="8"/>
<text class="inv" x="75" y="162" font-size="15" font-weight="700" text-anchor="middle">海外第二市场</text>
<text class="inv" x="75" y="184" font-size="12" text-anchor="middle">东南亚主权 AI 工厂</text>
<rect class="bx d" x="170" y="128" width="220" height="78" rx="8"/>
<text x="184" y="154" font-size="13">限制芯片出口和对特定</text>
<text x="184" y="174" font-size="13">国家的算力服务，并对</text>
<text x="184" y="194" font-size="13">数据中心实时监控</text>
<path class="ln" d="M168,167 L144,167" marker-end="url(#a4)"/>
<rect class="hl" x="10" y="222" width="130" height="78" rx="8"/>
<text class="inv" x="75" y="256" font-size="15" font-weight="700" text-anchor="middle">公司信用</text>
<text class="inv" x="75" y="278" font-size="12" text-anchor="middle">发债与担保能力</text>
<rect class="bx d" x="170" y="222" width="220" height="78" rx="8"/>
<text x="184" y="248" font-size="13">治理调查，翻出表外</text>
<text x="184" y="268" font-size="13">承诺，再定性为</text>
<text x="184" y="288" font-size="13">「金融风险」</text>
<path class="ln" d="M168,261 L144,261" marker-end="url(#a4)"/>
<path class="ln" d="M200,308 L200,340" marker-end="url(#a4)"/>
<rect class="bx" x="10" y="346" width="380" height="96" rx="8"/>
<text x="24" y="372" font-size="13" font-weight="700">已公开的结果（2026 年 11 月）</text>
<text x="24" y="396" font-size="13">· 11/8 董事会启动独立调查，11/9 股东起诉</text>
<text x="24" y="416" font-size="13">· 11/11–12 多家券商降级，Bernstein 目标价减半</text>
<text x="24" y="436" font-size="13">· 11/12 黄仁勋卸任 CEO，Kress 任临时 CEO</text>
</svg>
<figcaption>图 4 根据视频 14:40–16:40 整理。左侧实心块是 UP 认为英伟达收租所依赖的三根支柱，右侧虚线框是他描述的针对方式，箭头方向表示「针对」。最下方的框只列已经公开核对的事件；这些事件和右侧三条之间是否存在 UP 所说的因果关系，公开资料没有给出证明。</figcaption>
</figure>
<h2>公开资料怎么看（本文作者补充）</h2>
<p>这一节是我补充的，不属于视频内容。首先，《GAIN AI 法案》确有其事：参议院和众议院的文本分别是 S.3150 和 H.R.5885，内容是出口先进 AI 芯片到「受关注国家」之前，申请人要证明美国买家已有优先购买的机会<sup>[8]</sup>。不过，法案针对的是对中国等受关注国家的出口许可，不是笼统的「先美国后出口」；而且据一份合规指南整理，截至 2026 年 11 月 16 日，它还没有在两院都获通过<sup>[9]</sup>。因此，把它当作已经生效的限制并不准确。</p>
<p>其次，PORTS-Pike 担保的细节比视频里的概括更复杂。英伟达的 8-K 文件写明，1050 亿美元是或有付款义务的累计上限，只有 OpenAI 破产或拖欠租金时才触发，而且 OpenAI 同意偿还英伟达实际支付的金额<sup>[4]</sup>。英伟达在官方博客里也明确否认这是循环融资<sup>[10]</sup>。所以，「风险全由英伟达兜底」是 UP 的解读，并不是合同条款的原意。</p>
<p>最后，关于中国市场，路透在 11 月初报道约 60 万枚已获美方许可的 H200 滞留香港，北京尚未批准大规模进口<sup>[11]</sup>；11 月 18 日，也就是视频发布两天后，英伟达在财报电话会上表示不再向中国出货获准的 Hopper 数据中心产品<sup>[12]</sup>。这两条说明英伟达的海外市场确实在收缩，但是收缩的原因涉及中美双方的政策，不能直接当作视频里「云巨头反击」的证据。</p>
<h2>三类说法一览</h2>
<div class="tbl">
<table>
<thead><tr><th>类别</th><th>关键说法</th></tr></thead>
<tbody>
<tr><td><span class="lb o">已核对</span></td><td>CoreWeave 2022 年营收约 1583 万美元；英伟达截至 2026-07-26 的季度营收 962 亿美元、同比增长 106%、毛利率 75.0%；2026-06 发行 250 亿美元无担保票据，30 年期利差 0.65 个百分点；2026-08-17 PORTS-Pike 担保（4.25 GW、20 年、上限 1050 亿美元、独家部署）；11 月的调查、诉讼、降级与 CEO 交接；GAIN AI 法案文本存在但尚未成为法律。</td></tr>
<tr><td><span class="lb">视频观点</span></td><td>英伟达是「分配者和抽租者」；CUDA 是比硬件更高级的垄断；配额决定 AI 公司生死；信用循环与第二买家体系；云巨头因利益受损而反击；调查的真正目标是表外承诺。</td></tr>
<tr><td><span class="lb q">UP 说法 · 未核实</span></td><td>千亿参数模型需要五千到八千张 H100；新型算力云报价约为大厂一半；云巨头 2027 年现金流可能转负；与贝莱德、黑石、高盛商谈「独家用英伟达芯片、租户违约时补足 25% 损失」的融资平台；「模范云」认证体系的具体规则。</td></tr>
</tbody>
</table>
</div>
<h2>出处</h2>
<ol class="refs">
<li>CoreWeave Form S-1（2025-03-03）：<a href="https://www.sec.gov/Archives/edgar/data/1769628/000119312525044231/d899798ds1.htm">sec.gov</a></li>
<li>NVIDIA 2027 财年第二季度财报（2026-08-26）：<a href="https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Second-Quarter-Fiscal-2027/default.aspx">investor.nvidia.com</a></li>
<li>NVIDIA 票据发行条款 FWP（2026-06-15）：<a href="https://www.sec.gov/Archives/edgar/data/1045810/000119312526271326/d49394dfwp.htm">sec.gov</a></li>
<li>NVIDIA Form 8-K（2026-08-17）：<a href="https://www.sec.gov/Archives/edgar/data/1045810/000104581026000069/nvda-20260817.htm">sec.gov</a>；新闻稿：<a href="https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Guarantees-SB-Energys-PORTS-Pike-Technology-Campus-in-Ohio-to-Exclusively-Host-NVIDIA-AI-Compute/default.aspx">investor.nvidia.com</a></li>
<li>京报网转央视财经（2026-11-10）：<a href="https://news.bjd.com.cn/2026/11/10/90094770.shtml">news.bjd.com.cn</a>；第一财经：<a href="https://www.yicai.com/news/103433760.html">yicai.com</a></li>
<li>中新经纬（2026-11-12）：<a href="https://www.jwview.com/jingwei/html/11-12/696710.shtml">jwview.com</a>；investinglive：<a href="https://investinglive.com/stocks/bernstein-halves-nvidia-target-to-200-the-3rd-broker-in-2-days-to-step-back-over-huang/">investinglive.com</a></li>
<li>NVIDIA 新闻稿 CEO Transition（2026-11-12）：<a href="https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition">nvidianews.nvidia.com</a></li>
<li>GAIN AI Act 文本：<a href="https://www.congress.gov/bill/119th-congress/senate-bill/3150/text">S.3150</a>、<a href="https://www.congress.gov/bill/119th-congress/house-bill/5885/text">H.R.5885</a>（congress.gov）</li>
<li>GAIN AI Act 状态整理（截至 2026-11-16）：<a href="https://superintelligencecompliance.ai/guides/gain-ai-act">superintelligencecompliance.ai</a></li>
<li>NVIDIA 博客 Securing the Infrastructure of Intelligence（2026-08-17）：<a href="https://blogs.nvidia.com/blog/securing-the-infrastructure-of-intelligence/">blogs.nvidia.com</a></li>
<li>CNA 转路透（2026-11 初）：<a href="https://www.channelnewsasia.com/east-asia/nvidia-chips-pile-up-hong-kong-china-withhold-import-approval-6527371">channelnewsasia.com</a></li>
<li>美国之音（2026-11-18）：<a href="https://www.voachinese.com/a/nvidia-stops-shipping-us-approved-ai-chips-to-china-20261118/8225011.html">voachinese.com</a></li>
<li>视频：TomCat团座《美国少爷，开始明抢？英伟达股票目标价腰斩了？》（2026-11-16）：<a href="https://www.bilibili.com/video/BV1DfsA6dEid/">bilibili.com/video/BV1DfsA6dEid</a></li>
</ol>
</article>
</div>
