---
title: "给 agent 卖东西，现在有哪几种做法"
description: "agent 开始自己花钱买服务了。"
growth: seedling
planted: 2026-10-26T11:08:47+08:00
tags:
  - "ai-agents"
draft: false
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
table{border-collapse:collapse;width:100%;font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",system-ui,-apple-system,"Segoe UI",sans-serif !important;font-size:.85em;margin:1.2em 0;border-top:2px solid var(--foreground,#222) !important;border-bottom:2px solid var(--foreground,#222) !important;background:none}
table *{font-family:inherit !important;font-variant-emoji:text}
table tr,table thead tr,table tbody tr,table th,table td{border:none !important;background:none !important;box-shadow:none !important}
table th,table td{padding:6px 10px;white-space:nowrap;text-align:left;line-height:1.5}
table thead th{font-weight:600;border-bottom:1px solid var(--foreground,#222) !important}
img{max-width:100%;height:auto}
</style>

<div class="html-embed" lang="zh-CN">
<p>agent 开始自己花钱买服务了。按结果收费的 AI 客服已经做到上亿美元的年收入，卖给 agent 的接口和任务市场却还很冷清。</p><p>设想一个替 HR 干活的 agent。发 offer 前，它要查一下候选人是不是本人，之前的公司是不是真的存在。它不想买会员，也不想签年框，只想问一次、付一次钱，拿到一个能直接用的结论。</p>
<p>在这个场景里，付钱的是 agent，不是人。收钱的一方可能是另一个 agent，也可能是一家公司、一个独立开发者，甚至是一个跑腿的真人。我很好奇，这种由 agent 当买家的生意（下文叫 A2A）现在发展到了哪一步。于是我把能找到的做法和数据整理了一遍，下面按做法逐一介绍，每一种后面写上我自己得到的启发。</p>
<p><img alt="HR 的 agent 投一次币，拿到一份背景调查报告" src="/images/posts/a2a-outcome-delivery/fig-01.webp" srcset="/images/posts/a2a-outcome-delivery/fig-01-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-01.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" loading="lazy" decoding="async" data-avif="no" /></p>
<h2>目前大致有五种做法，冷热差别很大</h2>
<table>
<thead>
<tr>
<th>做法</th>
<th>跑通了吗</th>
<th>例子</th>
<th>收费</th>
<th>关键数字</th>
</tr>
</thead>
<tbody>
<tr>
<td>按结果收费 AI 服务</td>
<td>● 跑通</td>
<td>Fin、Sierra</td>
<td>每次解决 0.99–2 美元</td>
<td>Fin 年化约 1 亿美元（自报）</td>
</tr>
<tr>
<td>按次卖接口</td>
<td>◐ 部分</td>
<td>x402、企查查 MCP</td>
<td>每次几分到几元</td>
<td>x402 月流水 24–130 万美元</td>
</tr>
<tr>
<td>agent 任务市场</td>
<td>○ 没有</td>
<td>Virtuals ACP</td>
<td>托管抽成</td>
<td>ACP 近 30 天约 65 美元</td>
</tr>
<tr>
<td>agent 雇人</td>
<td>◐ 部分</td>
<td>RentAHuman、Upwork</td>
<td>托管抽成</td>
<td>暂无公开数据</td>
</tr>
<tr>
<td>国内同类</td>
<td>? 待核实</td>
<td>扣子、企查查</td>
<td>按次扣积分</td>
<td>暂无公开数据</td>
</tr>
</tbody>
</table>
<p><img alt="五种 A2A 做法" src="/images/posts/a2a-outcome-delivery/fig-02.webp" srcset="/images/posts/a2a-outcome-delivery/fig-02-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-02.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" loading="lazy" decoding="async" data-avif="no" /></p>
<p>这五种做法里，目前只有第一种已经有了大规模收入。</p>
<h2>按结果收费的 AI 服务已经跑通，因为"成没成"容易判断</h2>
<p><strong>怎么做的。</strong> 企业把 AI 客服嵌进自己的网站或 App。用户来问退款、改地址或者查订单，AI 会直接把事情办完。严格说，这里付钱的是企业而不是 agent，但在"按结果付钱"这件事上，它是目前走得最远的例子。</p>
<p><strong>怎么收费。</strong> Intercom Fin 每次解决 0.99 美元，用户回头再问就不算；Zendesk 每次自动解决 1.5 到 2 美元；Agentforce 每段对话或每次解决 2 美元。</p>
<p><strong>接受度。</strong></p>
<ul>
<li>Intercom Fin：2026 年 4 月说年化收入超过 1 亿美元，一年涨 3.5 倍，客户 8,000 多家，每周解决约 200 万个问题（SiliconANGLE，2026-04-24，自报）。后来计费单位从"解决"改成了"outcome"，按设定完成的转人工也算。</li>
<li>Sierra：2025-11 年化收入 1 亿美元，2026-05 到 2 亿美元（自报）；Sacra 说它主要按对话或解决次数收费。</li>
<li>Decagon：2026 年 8 月说年化收入超过 1 亿美元（自报）。</li>
<li>Agentforce：2026-08-26 财报说年化收入超过 15 亿美元，但从这季起把 Slackbot 等也算了进去（自报）。</li>
</ul>
<p><picture><source type="image/avif" srcset="/images/posts/a2a-outcome-delivery/fig-03-800.avif 800w, /images/posts/a2a-outcome-delivery/fig-03.avif 1200w" sizes="(max-width: 768px) 100vw, 760px"><img alt="AI 客服年化收入（自报）" src="/images/posts/a2a-outcome-delivery/fig-03.webp" srcset="/images/posts/a2a-outcome-delivery/fig-03-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-03.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" width="1200" height="675" loading="lazy" decoding="async" /></picture></p>
<p>图中四个数字都是公司自报：Intercom Fin 来自 SiliconANGLE（2026-04-24），Sierra 来自 Bret Taylor 的领英帖（2026-05），Decagon 来自 Newcomer（2026-08），Agentforce 来自 Salesforce 财报（2026-08-26）。Agentforce 从这一季起把 Slackbot 和 Headless 360 也算了进去，口径和另外三家不同，所以图里用灰色表示。</p>
<p><img alt="做完了能否被机器判断" src="/images/posts/a2a-outcome-delivery/fig-04.webp" srcset="/images/posts/a2a-outcome-delivery/fig-04-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-04.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" loading="lazy" decoding="async" data-avif="no" /></p>
<p><strong>启发。</strong> 要按结果收钱，买卖双方得对"结果"有一个都认的标准。客服恰好有现成的标准：没有转人工，用户也没有回来再问。写代码和做法律分析就很难这样判定，所以这类产品大多还是按席位或用量收费，Devin 则按算力计费。所以我在评估一个方向时，会先问自己：这件事做没做完，机器能不能判断出来？</p>
<h2>按次卖数据和结论给 agent 的接口很多，买家还很少</h2>
<p><strong>怎么做的。</strong> 卖家把一次查询或一个判断做成接口，agent 每调用一次就付一次钱。x402 协议让 agent 可以直接用 USDC 付款，MCP 则让 agent 像使用工具一样调用这些接口。</p>
<p><strong>接受度。</strong> x402 Bazaar 有 27,681 个端点，另一份目录 paddock 列了 37,884 个。但 Fetchgate 按 2026-10-04 的快照审计，Bazaar 整体日收入上限约 634 美元。全网流水几家统计差了好几倍：402radar 说最近 30 天约 24 万美元，Barker 说约 130 万美元（过滤掉了 48% 的刷量），x402stats 按周算约 100 万美元（均为 2026-10-24 页面）。</p>
<p><strong>跑通了吗。</strong> 这里确实有真实的流水，但它分散在几万个端点上，平均到每个卖家头上多半很少。</p>
<p>按次卖接口其实早有先例，只是过去的买家是人。RapidAPI 是一个 API 市场，开发者可以在上面上架接口，选择免费、按次付费、免费加付费或者包月订阅几种收费方式，平台从每笔收入里抽 25%（RapidAPI 文档，这个费率从 2025-11-15 起执行）。它的网站曾自称有 400 万开发者、4 万多个 API，公司估值一度达到 10 亿美元。但据 TechCrunch 报道，到 2024 年 11 月诺基亚收购它的技术资产和研发团队时，它的业务已经明显下滑，双方只说活跃开发者有"数千"，交易金额没有公开（TechCrunch，2024-11-13）。诺基亚买下它，主要是想给电信运营商的网络 API 找开发者渠道。现在它的关于页面写的是服务 600 多万开发者（自报）。我没有查到它针对 agent 直接下单做了什么专门的支持。这个例子至少说明，把几万个接口集中到一个市场里，并不能保证有人持续来买，市场自己也未必赚得到钱。</p>
<p><strong>启发。</strong> 现在把接口上架几乎没有门槛，难的是让 agent 找到它，并且反复回来调用。我猜卖得动的接口，交付的更像是一个现成的结论，而不是一份原始数据。</p>
<h2>agent 之间的任务市场已经设计好了流程，但交易还没有起来</h2>
<p><strong>怎么做的。</strong> Virtuals ACP 把每一笔活写成一份链上合约，依次经过发布、报价、托管、提交和验收几个步骤，还可以请一个评估 agent 来把关，平台从中抽成 5%。Fetch.ai 的 Agentverse 和 Olas 的 Mech 也在做类似的 agent 市场。</p>
<p><img alt="一笔 agent 任务的一生" src="/images/posts/a2a-outcome-delivery/fig-05.webp" srcset="/images/posts/a2a-outcome-delivery/fig-05-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-05.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" loading="lazy" decoding="async" data-avif="no" /></p>
<p><strong>接受度。</strong> 按 agenteconomy.to 的统计（2026-10-24），ACP 累计创建 12.2 万个任务，完成 6.7 万个，完成的总价值约 7.8 万美元；最近 30 天完成 3,287 个，价值约 65 美元。ChainWard 的数据显示，ACP 平台费 2026 年 3 月最高约 34.5 万美元，9 月只剩几美元。Agentverse、Olas 没找到可信的收入数字。</p>
<p><picture><source type="image/avif" srcset="/images/posts/a2a-outcome-delivery/fig-06-800.avif 800w, /images/posts/a2a-outcome-delivery/fig-06.avif 1050w" sizes="(max-width: 768px) 100vw, 760px"><img alt="Virtuals ACP 平台费两个时点" src="/images/posts/a2a-outcome-delivery/fig-06.webp" srcset="/images/posts/a2a-outcome-delivery/fig-06-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-06.webp 1050w" sizes="(max-width: 768px) 100vw, 760px" width="1050" height="630" loading="lazy" decoding="async" /></picture></p>
<p>数据来自 ChainWard 对 Virtuals Protocol 的链上统计，2026 年 10 月访问。图里只有这两个月份的数字，中间几个月没有画出来。</p>
<p><strong>启发。</strong> 托管和验收的流程已经有人做出来了，现在缺的是持续的真实需求，以及出了争议时由谁来裁决。我觉得这类市场也许应该先围绕一种具体的活做起来，而不是一开始就建一个什么活都接的大市场。</p>
<h2>agent 也开始雇人，去做它自己做不了的那一段</h2>
<p><strong>怎么做的。</strong> 在 RentAHuman 上，agent 可以通过 MCP 雇真人去跑腿或拍照，钱先放进托管，干完活以后凭照片验收。Upwork 在 2026-08-10 上线了 MCP，agent 可以在上面发布需求、起草 offer，托管和争议处理都沿用 Upwork 原来的那一套。</p>
<p><strong>接受度。</strong> 两家都没找到 agent 下单的公开数据。RentAHuman 的条款写明不保证质量，有论文发现过身份和资质被滥用。Upwork 本身是赚钱的上市公司，同类上市平台还有 FVRR、FLN、APX，A 股做数据标注的海天瑞声（688787）上半年营收 1.92 亿元，同比增长 22%（自报）。</p>
<p><strong>启发。</strong> 需要到现场、需要实物或者必须由真人出面的活，agent 短期内替代不了。把人的劳动包装成 agent 可以调用的服务，可能是一个方向，难点在于怎么保证干活的质量和人的身份。</p>
<h2>国内也出现了类似的做法，只是支付方式换了一套</h2>
<p><strong>怎么做的。</strong> 在国内，x402 和 USDC 基本走不通，大家用的是支付宝 AI 付（Machine Pay）、微信 AI 专属卡，或者预充值的积分。扣子的技能商店按调用扣积分，开发者通过支付宝收款。数据这一侧，企查查 MCP 每次调用约 0.1 到 2 元，个人能开通；阿里云身份二要素核验每次 0.2 元。</p>
<p><strong>接受度。</strong> 没找到公开的交易额。外包平台猪八戒申报了三次上市，都没成。按任务收费的纯 AI agent 公司，目前没看到上市的。</p>
<p><strong>启发。</strong> 扣子目前卖的是一次调用，还不是一件做完的事。如果在企查查、阿里云这类数据上加一层针对具体场景的判断，比如回答"这家供应商能不能合作"，再按次收费，个人开发者也可以试一试。</p>
<h2>和 A2A 最契合的，是做核验的行业</h2>
<p>在我看过的行业里，最接近"agent 问一次、付一次"这种形态的，是做核验的生意：</p>
<ul>
<li><strong>背景调查</strong>：美股 First Advantage（FA）TTM 营收 16.63 亿美元，调整后 EBITDA 利润率 28.2%；HireRight 在 2024-06-28 私有化；A 股没有纯做背调的上市公司。</li>
<li><strong>企业核查</strong>：工商、司法、经营风险，国内已有按次计费的接口。</li>
<li><strong>身份核验</strong>：二要素、三要素，按次计费。</li>
<li><strong>电子签名和证书</strong>：A 股有数字认证（300579）、格尔软件（603232）、信安世纪（688201）。</li>
<li><strong>风控数据</strong>：百融云（6608.HK）上半年营收下降 43%，提醒这条路也不轻松。</li>
</ul>
<p>这些行业有几个共同点：问题提得清楚，答案很短，结果可以核对，而且按次收费本来就是行业惯例。</p>
<h2>TrustMRR 上按次卖核验的产品，收入在涨</h2>
<p>我在上一篇《假的越便宜，证明真的越值钱》里查过 TrustMRR 上经过核验的收入数据。其中 1lookup 按次核验电话、邮箱和 IP，近 30 天营收从 38 万美元涨到了约 44.5 万美元。下图把它和前面几种 A2A 做法的月收入放在一起比较：</p>
<p><picture><source type="image/avif" srcset="/images/posts/a2a-outcome-delivery/fig-07-800.avif 800w, /images/posts/a2a-outcome-delivery/fig-07.avif 1200w" sizes="(max-width: 768px) 100vw, 760px"><img alt="一个月的钱对比（对数刻度）" src="/images/posts/a2a-outcome-delivery/fig-07.webp" srcset="/images/posts/a2a-outcome-delivery/fig-07-800.webp 800w, /images/posts/a2a-outcome-delivery/fig-07.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" width="1200" height="675" loading="lazy" decoding="async" /></picture></p>
<p>图中数据来自 agenteconomy.to、402radar 和 Barker（2026-10-24 访问）以及 TrustMRR（2026-10-23）。Fin 那一栏是我用它自报的年化收入（超过 1 亿美元）除以 12 算出来的。几项数字口径不同，只适合比较量级。</p>
<p>一个按次卖核验的小产品，一个月的收入和 x402 全网一个月的流水差不多。这至少说明，按次卖一个结论的生意已经有人愿意付钱，只是现在付钱的主要还是人，而不是 agent。</p>
<h2>能跑起来的做法，大概有五个共同点</h2>
<p>把上面几种做法放在一起比较，我发现能跑起来的那些大多有下面这些特点：</p>
<ol>
<li><strong>结果能被机器判断。</strong> 比如问题有没有解决，信息有没有查到，身份对不对得上。</li>
<li><strong>按次计价，单价低。</strong> 买家不用签合同，试一次的成本很小。</li>
<li><strong>个人也能参与。</strong> 上架一个接口、调用一份数据的门槛已经很低。</li>
<li><strong>手里有别人拿不到的数据或渠道。</strong> 企查查和身份核验服务背后，都是长期积累下来的数据源。</li>
<li><strong>有人愿意为结果负责。</strong> 在美国，背调报告受 FCRA 监管；在国内，涉及个人信息就要面对征信牌照和个保法单独同意的要求。这是一部分做法门槛高的原因，但只是其中一个因素。</li>
</ol>
<h2>还有几个问题我没想清楚</h2>
<ul>
<li>agent 怎么才能找到你的接口？现在的情况有点像早期的 App Store，上架的很多，被发现的很少。</li>
<li>被查的人同意了查询，这份同意怎么跟着 agent 带到下一家服务？目前还没有通用的授权凭证。</li>
<li>agent 之间的任务出了争议，应该由谁来裁决？</li>
<li>国内的支付宝 AI 付、微信 AI 专属卡，会不会把按次付费的门槛再降一截？</li>
<li>哪些现在按席位收费的软件，会改成按结果收费？</li>
</ul>
<p>我自己想继续看的方向，是在国内现成的数据接口上，挑一个小场景，做一个"agent 问一次、付一次"的结论服务，看看到底有没有 agent 来买。</p>
<h2>参考</h2>
<ul>
<li>Intercom 博客 Fin Apex 发布、From resolutions to outcomes；SiliconANGLE，2026-04-24</li>
<li>Sierra 博客 2025-11-21、2026-02-06；Bret Taylor 领英帖；Sacra</li>
<li>Value Add VC 引 Newcomer，2026-08-11</li>
<li>Salesforce FY27 Q2 新闻稿，2026-08-26</li>
<li>x402stats.io、402radar.io、app.barker.money、agenteconomy.to，2026-10-24 访问；Fetchgate 审计（2026-10-04 快照）</li>
<li>ChainWard，Virtuals Protocol 链上统计</li>
<li>Nokia 新闻稿，2024-11-13；TechCrunch，2024-11-13；RapidAPI 文档 Payouts and Finance、Monetizing Your API；RapidAPI About 页面</li>
<li>《假的越便宜，证明真的越值钱》，FunFun Zone，2026-10-23</li>
</ul>
</div>
