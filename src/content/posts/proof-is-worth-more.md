---
title: "假的越便宜，证明真的越值钱"
description: "AI 让文字、代码、照片甚至身份都能廉价造出来。"
growth: seedling
planted: 2026-10-23T20:01:11+08:00
tags:
  - "ai-agents"
  - "workflow"
draft: false
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .lead{font-size:1.1em}
.html-embed .note{border-left:2px solid var(--accent);padding-left:.8em}
.html-embed table{border-collapse:collapse;width:100%}
.html-embed td,.html-embed th{padding:.35em .7em;border-bottom:1px solid var(--muted);text-align:left;vertical-align:top}
.html-embed .illus{margin:1.6em 0;text-align:center}
.html-embed .illus img{max-width:100%;height:auto;border-radius:8px}
.html-embed .illus figcaption{font-size:.85em;color:var(--muted-foreground);margin-top:.4em}
/* Bar chart (fig 2): diverging bars around one axis; widths are value / 223 x 90% of a half. */
.html-embed .bars{margin:1.6em auto;max-width:680px}
.html-embed .bars .bt{font-weight:600;font-size:1.02em;text-align:center;margin:0 0 .9em;color:var(--foreground)}
.html-embed .bars .br{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center}
.html-embed .bars .br>div{display:flex;flex-wrap:wrap;align-items:center;gap:.15em .5em;padding:.38em .55em;font-size:.88em;line-height:1.35;min-width:0}
.html-embed .bars .br>div:last-child{border-left:1px solid var(--foreground)}
.html-embed .bars .br>.l{flex-direction:row-reverse;text-align:right}
.html-embed .bars .br.gap>div{padding-top:1.1em}
.html-embed .bars .nm{color:var(--foreground)}
.html-embed .bars .val{color:var(--muted-foreground)}
.html-embed .bars .bar{flex:none;height:1.5em;min-width:3px;width:calc(var(--v) / 223 * 90%);box-sizing:border-box}
.html-embed .bars .pr{background:var(--status-danger)}
.html-embed .bars .vis{background:var(--status-warning)}
.html-embed .bars .gr{background:var(--muted-foreground)}
.html-embed .bars .key{display:flex;flex-wrap:wrap;justify-content:center;gap:.3em 1.2em;margin-top:1em;font-size:.85em;color:var(--foreground)}
.html-embed .bars .key i{display:inline-block;width:.85em;height:.85em;margin-right:.35em;vertical-align:-.08em}
.html-embed .bars .nt{margin:.45em 0 0;font-size:.85em;text-align:center;color:var(--foreground)}
.html-embed .bars .src{margin:.45em 0 0;font-size:.78em;text-align:center;color:var(--muted-foreground)}
.html-embed .bars figcaption{font-size:.85em;color:var(--muted-foreground);margin-top:.6em;text-align:center}
/* Two cards (fig 3): neutral vs highlighted; stack on phones. */
.html-embed .vs{margin:1.6em 0}
.html-embed .vs .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.html-embed .vs .card{background:var(--muted);border:2px solid transparent;border-radius:12px;padding:1em 1.1em;display:flex;flex-direction:column;min-width:0}
.html-embed .vs .card.hi{background:transparent;border-color:var(--accent)}
.html-embed .vs .card h3{margin:0 0 .6em;font-size:1.12em;text-align:center;color:var(--foreground)}
.html-embed .vs .card.hi h3,.html-embed .vs .card.hi .ft{color:var(--accent)}
.html-embed .vs .card ul{margin:0;padding-left:1.2em;flex:1}
.html-embed .vs .card li{margin:.25em 0}
.html-embed .vs .ft{margin:.8em 0 0;text-align:center;color:var(--muted-foreground)}
.html-embed .vs .hyp{margin:.7em 0 0;text-align:center;font-size:.85em;color:var(--muted-foreground)}
.html-embed .vs figcaption{font-size:.85em;color:var(--muted-foreground);margin-top:.4em;text-align:center}
@media (max-width:640px){.html-embed .vs .cards{grid-template-columns:1fr}}
</style>

<div class="html-embed" lang="zh">
<p class="lead">AI 让文字、代码、照片甚至身份都能廉价造出来。翻了一遍有收入核验的产品榜单，我发现越来越多人在为一件事付钱：证明某样东西是真的。</p>
<figure class="illus"><picture><source type="image/avif" srcset="/images/posts/proof-is-worth-more/fig-01-800.avif 800w, /images/posts/proof-is-worth-more/fig-01.avif 1200w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/proof-is-worth-more/fig-01.webp" alt="针和印章" srcset="/images/posts/proof-is-worth-more/fig-01-800.webp 800w, /images/posts/proof-is-worth-more/fig-01.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" width="1200" height="560" loading="lazy" decoding="async"></picture><figcaption>针会自己织毛衣以后，毛衣不稀奇，担保才稀奇</figcaption></figure>
<p>这是<a href="/posts/will-model-labs-eat-software/">《毛线厂拿到了一根会自己织毛衣的针》</a>的续篇。上一篇的结论是：软件越来越便宜，钱会流向信任、担责、品味和注意力。这篇去翻真实的账本，看看这些说法站不站得住。</p>
<h2>一张收入截图，现在要有人核验才算数</h2>
<p>以前独立开发者晒收入，发张 Stripe 后台截图就行。现在截图谁都能 P，AI 做一张更是几秒钟的事。</p>
<p>于是出现了 <a href="https://trustmrr.com">TrustMRR</a>。它不让你上传截图，而是直接连你的 Stripe、RevenueCat 这类收款账户读数据，显示的是核验过的收入。围绕它很快长出了一圈生意：X 上有人专门整理「核验过的收入榜」，比如 Shipped &amp; Paid、AgentMoneyList；也有人把带核验收入的 AI App 直接挂出来卖，核验过的收入成了能定价的资产。</p>
<p>这件事很小，但说明了一个变化：代码不值钱了，「这个数字是真的」反倒值钱了。</p>
<h2>账本显示：卖「证明是真的」的在涨，卖「检测是假的」的在掉</h2>
<p>先说数据口径。TrustMRR 显示的是近 30 天营收，不完全等于 MRR。历史数字是我用 Wayback 快照（2025-12-01、2026-03-01、2026-06-15）和 2026-10-23 的页面拼出来的，各产品的起点月份不完全一样。</p>
<figure class="bars" aria-label="TrustMRR 收入变化图">
<p class="bt">TrustMRR 近 30 天营收变化（经收款渠道核验）</p>
<div class="br"><div class="l"><span class="nm">1lookup 号码/邮箱校验</span></div><div><span class="bar pr" style="--v:17"></span><span class="val">+17%（2026-06→10）</span></div></div>
<div class="br"><div class="l"><span class="nm">Comp AI 合规认证</span></div><div><span class="bar pr" style="--v:72"></span><span class="val">+72%（2026-03→10）</span></div></div>
<div class="br"><div class="l"><span class="nm">AEO Engine 被 AI 推荐</span></div><div><span class="bar vis" style="--v:223"></span><span class="val">+223%（2025-12 起）</span></div></div>
<div class="br gap"><div class="l"><span class="bar gr" style="--v:52"></span><span class="val">约 -52%（季度营收）</span></div><div><span class="nm">ZeroGPT Plus AI 检测</span></div></div>
<div class="br"><div class="l"><span class="bar gr" style="--v:64"></span><span class="val">-64%（2025-12→2026-10）</span></div><div><span class="nm">SEObot AI 写文章</span></div></div>
<div class="key"><span><i class="pr"></i>红色：卖「证明是真的」</span><span><i class="gr"></i>灰色：卖「一次模型调用」或「检测假的」</span></div>
<p class="nt">另：Postiz 同期 $16.0K → $340.2K（约 +2026%，超出刻度未画）</p>
<p class="src">数据：TrustMRR 页面 2026-10-23 抓取 + Wayback 快照；起点月份不同，ZeroGPT 为季度营收约 $22K→$10.5K</p>
<figcaption>只画了真实数字；起点月份不同，看方向，别细比幅度</figcaption>
</figure>
<ul>
<li><strong>1lookup</strong>：查一个电话、邮箱或 IP 是不是真的、有没有风险，按次收 API 费。近 30 天营收从 2026 年 6 月的 38.18 万美元涨到 10 月的 44.50 万美元。</li>
<li><strong>Comp AI</strong>：帮公司拿 SOC 2、ISO 27001 这类安全认证。从 2026 年 3 月的 43.85 万美元涨到 52.71 万，再到现在的 75.60 万。</li>
<li><strong>ZeroGPT Plus</strong>：检测一段文字是不是 AI 写的。季度营收从约 2.2 万美元掉到 1.29 万，再到 1.05 万。</li>
</ul>
<p>同样是在回答「这东西真不真」，方向却相反。我的猜测是：检测假的，对手是下一代模型。模型越强，假的越像真的，检测就越难做准，而且给出的只是一个概率，没人为它签字。证明真的，是从源头记录下来：钱确实进了账户，证件确实对得上，审计师确实看过。假的越多，这种证明越抢手。</p>
<p class="note">这是从几个产品推出来的假设，样本很小，不是定论。</p>
<figure class="vs" aria-label="检测假的与证明真的对比">
<div class="cards">
<div class="card"><h3>检测「这是假的」</h3><ul><li>对手是下一代模型</li><li>模型越强，越难判断</li><li>结论是概率，没人签字</li><li>例：AI 文本检测</li></ul><p class="ft">在掉</p></div>
<div class="card hi"><h3>证明「这是真的」</h3><ul><li>从源头记录：收款、证件、审计</li><li>假的越多，越要它</li><li>有人背书、出错有人负责</li><li>例：TrustMRR、Comp AI、Veriff、Checkr、1lookup</li></ul><p class="ft">在涨</p></div>
</div>
<p class="hyp">这是一个假设，不是定论</p>
<figcaption>两种回答「真不真」的方式</figcaption>
</figure>
<h2>大公司的账本也指向同一个方向</h2>
<p>榜单上都是小公司，那大一点的公司呢？我找了几家有公开数字的：</p>
<ul>
<li><strong>Veriff</strong>（身份核验）：2025 年 12 月宣布营收翻倍，规模超过 1 亿美元，并且已经盈利。增强认证和活体检测的用量一年涨了 30 多倍，公司把原因归到 AI 造假变多（<a href="https://www.veriff.com/pr-news/veriff-doubles-revenue-of-100m-usd">公司新闻稿</a>，自报）。</li>
<li><strong>Checkr</strong>（背景调查）：2025 年总营收超过 8 亿美元，净营收超过 5 亿美元（<a href="https://www.checkr.com/resources/articles/building-the-future-of-trust-at-checkr">公司博客</a>，自报）。福布斯报道，它的 CEO 说审核过的求职和贷款申请里，至少 40% 有不准确或伪造的工作、财务信息（<a href="https://www.forbes.com/sites/iainmartin/2026/01/13/ai-fraud-has-exploded-this-background-check-startup-is-cashing-in/">Forbes</a>）。</li>
<li><strong>Persona</strong>（身份核验）：2025 年 4 月以 20 亿美元估值融了 2 亿美元，客户有 OpenAI、LinkedIn、Reddit 等。它说过去一年拦下了超过 7500 万次 AI 人脸伪造尝试，下一步要做的是同时核验人和 AI agent（<a href="https://www.prnewswire.com/news-releases/persona-raises-200m-at-2b-valuation-to-build-the-verified-identity-layer-for-an-agentic-ai-world-302442649.html">新闻稿</a>，自报）。</li>
</ul>
<p>这三家都是先有了核验的生意，AI 造假变多以后，生意更大了。它们卖的不是一段代码，而是「我替你确认过了，出了问题我们有记录」。</p>
<h2>其他赚钱的类型，也都卖代码以外的东西</h2>
<p>「证明真的」是这篇的主线，但榜单上涨得好的还有几类，可以对照着看：</p>
<table>
<tr><th>卖什么</th><th>例子</th><th>为什么能成</th></tr>
<tr><td>证明是真的</td><td>TrustMRR、1lookup、Comp AI、Veriff、Checkr</td><td>假的越便宜，越需要有人从源头核验、背书</td></tr>
<tr><td>被看见</td><td>Postiz、AEO Engine</td><td>AI 让内容暴涨，发出去、被推荐反而成了瓶颈</td></tr>
<tr><td>结果，按次收费</td><td>HeadshotPro、Cal AI</td><td>用户要一张照片、一个数字，不要工具；分发下了狠功夫</td></tr>
<tr><td>合规和脏活</td><td>Kibu、Conductor</td><td>监管复杂、老系统难接，一旦用上很难换</td></tr>
<tr><td>省心</td><td>White Glove Content、Faceless.so</td><td>AI 压低成本，人来把关</td></tr>
<tr><td>一次模型调用</td><td>SEObot、ZeroGPT、VidAI</td><td>在掉：模型一升级，用户直接用 ChatGPT</td></tr>
</table>
<p>几个对照的数字：开源社媒排期工具 Postiz 近 30 天营收从 1.60 万美元涨到 34.02 万；帮企业成为 AI 搜索答案的 AEO Engine 从 6.24 万涨到 20.16 万；AI 写 SEO 文章的 SEObot 从 9.87 万掉到 3.58 万，少了约 64%。</p>
<p>按次卖结果的也有大的。Danny Postma 一个人做的 AI 证件照 HeadshotPro，一次 29 或 69 美元，据报道做到过每月约 30 万美元，其中联盟分销每月超过 5 万（<a href="https://note.com/small_start/n/nf98023701f57">note.com</a>，自报）。拍照估算热量的 Cal AI，2025 年 5 月有 17 名全职员工，大约一半在做营销，主要管网红投放（<a href="https://getlatka.com/blog/how-cal-ai-achieved-35-million-revenue-in-just-one-year">GetLatka 访谈</a>）。2026 年 3 月 MyFitnessPal 宣布收购它，交易其实在 2025 年 12 月就完成了。创始人在<a href="https://www.globenewswire.com/news-release/2026/03/02/3247439/0/en/MyFitnessPal-Acquires-Cal-AI-Expanding-on-its-Position-as-the-Leading-Player-in-Digital-Nutrition-Tracking.html">收购公告</a>里说过去 12 个月销售额超过 4000 万美元，<a href="https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens/">TechCrunch</a> 引用的数字是年收入超过 3000 万美元（均为自报，口径不同）。</p>
<p class="note">Stan、Kibu、Chatbase 在 TrustMRR 上的数据分别在 4 月和 7 月停止同步，这里不拿它们的收入当现状。</p>
<h2>用户能自己做一个免费版，但做不出「被承认」</h2>
<p>技术平权以后，绕不开一个讨论：这些产品的用户，能不能用 AI 自己做一个免费的？</p>
<p>卖一次模型调用的，用户连做都不用做，打开 ChatGPT 就行。SEObot、ZeroGPT 掉下来就是这个原因。</p>
<p>工具类，比如社媒排期，会用 Claude Code 的人一个周末大概就能做出能用的版本。难的是之后的维护：平台 API 经常改，数据要持续更新。这类产品真正的对手是别人做的开源免费版，Postiz 的办法是代码开源，托管和维护收钱。</p>
<p>卖「证明是真的」的，自己做基本没用。你可以写一个收入看板，但别人不会信你自己写的；你可以写一套安全制度系统，但审计师不认；你可以做人脸比对，但没有跨客户的欺诈数据，也没人替你担责。核验的价值来自第三方的身份，这个复制不了。</p>
<p>还有一个前提容易漏掉：用户本来就不是做软件的人。牙医、护理机构老板、招聘经理的时间要花在主业上，就算 AI 让他们一天能做出来，这一天也比每月几十美元贵。</p>
<h2>门槛平了，判断真假的能力没平</h2>
<p>「谁都能做」不等于「谁都能做对」。几项研究的结果比较一致：</p>
<ul>
<li>Brynjolfsson 等人研究了 5,179 名客服，用上 AI 助手后每小时解决的问题平均多 14%，新手和低技能员工多 34%，老手几乎没变（<a href="https://www.nber.org/papers/w31161">NBER w31161</a>）。</li>
<li>Dell'Acqua 等人对 758 名 BCG 顾问做了实验，原本技能偏低的一半提升 43%，偏高的一半提升 17%；但在一道超出 AI 能力的题上，用 AI 的人答对的比例低了约 19 个百分点（<a href="https://pubsonline.informs.org/doi/pdf/10.1287/orsc.2025.21838">Organization Science</a>，原 HBS 24-013）。</li>
<li>Otis 等人在肯尼亚让 640 名小企业主用 GPT-4 当商业助手，平均效果在统计上和零没有区别：原本经营差的一半，业绩下降约 8% 到 10%；经营好的一半可能提升 15% 以上（<a href="https://pubsonline.informs.org/doi/full/10.1287/mnsc.2024.06909">Management Science</a>）。差别不在问了什么、AI 答了什么，而在采纳了哪些建议：经营差的更多去降价、打广告。</li>
<li>斯坦福用 ADP 工资数据发现，在最容易被 AI 替代的职业里，22 到 25 岁年轻人的就业比同龄的低暴露职业落后约 19%（数据截至 2026 年 6 月），主要是少招人，而不是裁人。作者强调这是描述性的差距（<a href="https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf">Stanford Digital Economy Lab</a>）。</li>
<li>Anthropic 对 52 名开发者做的随机实验里，用 AI 学一个新 Python 库的人，课后测验平均 50 分，手写的人 67 分，差距最大的是调试题（<a href="https://www.anthropic.com/research/AI-assistance-coding-skills">Anthropic</a>）。</li>
</ul>
<p>放回商业上看，做出一个东西的门槛确实平了，可判断它对不对、真不真，并且为结论负责，这部分没有平。卖「证明是真的」的生意，赚的正是这部分钱。</p>
<h2>共同的逻辑：针织出来的毛衣不稀奇，稀奇的是谁来担保</h2>
<p>把涨的产品放在一起，我归纳出五条：</p>
<ol>
<li><strong>卖结果，不卖工具。</strong>客户要一张证书、一个核验结论、一批真实线索，不要一个编辑器。</li>
<li><strong>离钱近。</strong>能直接算出少被骗了多少、少花了多少咨询费，付钱就不犹豫。</li>
<li><strong>握着基模公司不方便碰的东西。</strong>第三方背书、监管资格、跨客户的数据、出错时的责任。基模公司往上扩展，先拿走的是标准款，当裁判这件事它不太适合自己来，因为它也是造东西的那一方。</li>
<li><strong>分发比产品重要。</strong>Cal AI、HeadshotPro 都在营销上下了狠功夫。</li>
<li><strong>模型越强，它越被需要。</strong>假的越像真的，核验越值钱。反过来，模型一升级就多余的，就是在掉的那批。</li>
</ol>
<p>用上一篇的比喻：针会自己织毛衣了，毛衣本身不稀奇。稀奇的是有人能告诉你，这件毛衣确实是它说的那件。</p>
<h2>对一人公司：核验这门生意，一个人能做小的那头</h2>
<p>下面是我的推测，没有验证过：</p>
<ul>
<li>某个小行业的核验清单和报告，比如供应商资质、二手设备来源、留学中介资质，一个人加一群 agent 跑流程，自己签字负责。</li>
<li>给 agent 用的可信数据 API，按次收费：价格、资质、联系方式是不是真的。这一类我还没找到有收入的例子，可能是机会，也可能说明还太早。</li>
<li>帮小商家做「被 AI 推荐」，附带监测报表，参照 AEO Engine。</li>
<li>已经有行业资格的人（会计、律师、工程师）用 AI 扩大接单量，卖的还是签字。</li>
<li>躲开单纯的 AI 写作、AI 检测和通用视频生成。</li>
</ul>
<p>也要看反面数据。X 上有人转述《华尔街日报》的报道：杭州约 1,500 家一人公司，过半月收入不到 1,000 美元（<a href="https://x.com/erchenlu1/status/2101878121628598646">转述帖</a>）。榜单上是跑出来的少数，幸存者偏差很大。核验生意更难的一点是，信任要一年一年攒，一个人起步时最缺的恰恰是这个。</p>
<h2>参考</h2>
<ul>
<li>TrustMRR 各产品页面，2026-10-23 抓取；Wayback 快照 2025-12-01、2026-03-01、2026-06-15</li>
<li><a href="https://www.veriff.com/pr-news/veriff-doubles-revenue-of-100m-usd">Veriff Doubles Revenue at a Scale of 100M USD</a>，2025-12-10</li>
<li><a href="https://www.checkr.com/resources/articles/building-the-future-of-trust-at-checkr">Checkr: Building the future of trust</a>；<a href="https://www.forbes.com/sites/iainmartin/2026/01/13/ai-fraud-has-exploded-this-background-check-startup-is-cashing-in/">Forbes, 2026-01-13</a></li>
<li><a href="https://www.prnewswire.com/news-releases/persona-raises-200m-at-2b-valuation-to-build-the-verified-identity-layer-for-an-agentic-ai-world-302442649.html">Persona Series D 新闻稿</a>，2025-04-30</li>
<li>HeadshotPro：<a href="https://note.com/small_start/n/nf98023701f57">note.com/small_start</a></li>
<li>Cal AI：<a href="https://getlatka.com/blog/how-cal-ai-achieved-35-million-revenue-in-just-one-year">GetLatka</a>；<a href="https://www.globenewswire.com/news-release/2026/03/02/3247439/0/en/MyFitnessPal-Acquires-Cal-AI-Expanding-on-its-Position-as-the-Leading-Player-in-Digital-Nutrition-Tracking.html">MyFitnessPal 收购公告</a>；<a href="https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens/">TechCrunch</a></li>
<li>Brynjolfsson, Li, Raymond, <a href="https://www.nber.org/papers/w31161">Generative AI at Work</a>, NBER w31161 / QJE 2025</li>
<li>Dell'Acqua et al., <a href="https://pubsonline.informs.org/doi/pdf/10.1287/orsc.2025.21838">Navigating the Jagged Technological Frontier</a>, Organization Science 2026</li>
<li>Otis et al., <a href="https://pubsonline.informs.org/doi/full/10.1287/mnsc.2024.06909">The Uneven Impact of Generative AI on Entrepreneurial Performance</a>, Management Science 2026</li>
<li>Brynjolfsson, Chandar, Chen, <a href="https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf">Canaries in the Coal Mine?</a>（2026 年 8 月更新版）</li>
<li>Shen, Tamkin, <a href="https://www.anthropic.com/research/AI-assistance-coding-skills">How AI assistance impacts the formation of coding skills</a>, Anthropic 2026-01-29</li>
<li>杭州一人公司数据：<a href="https://x.com/erchenlu1/status/2101878121628598646">X 转述帖</a></li>
</ul>
</div>
