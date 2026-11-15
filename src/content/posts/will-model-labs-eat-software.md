---
title: "毛线厂拿到了一根会自己织毛衣的针"
description: "软件的钱，以前从哪来，现在去了哪，以后会去哪。"
growth: seedling
planted: 2026-10-23T17:48:22+08:00
tags:
  - "ai-agents"
  - "workflow"
draft: false
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed td,.html-embed th{border-bottom:1px solid var(--muted)}
.html-embed .note{border-left:2px solid var(--accent);padding-left:.8em}
.html-embed .illus{margin:1.5em 0}
.html-embed .illus img{width:100%;height:auto;border-radius:8px}
.html-embed .illus figcaption{font-size:.85em;opacity:.75;text-align:center;margin-top:.5em}
</style>

<div class="html-embed" lang="zh">
<p class="lead">软件的钱，以前从哪来，现在去了哪，以后会去哪。</p>
<figure class="illus"><img src="/images/posts/will-model-labs-eat-software/fig-01.webp" alt="毛线厂的货架上堆满毛线，一根针悬在空中自己织毛衣，桌边的人托着下巴看" loading="lazy" srcset="/images/posts/will-model-labs-eat-software/fig-01-800.webp 800w, /images/posts/will-model-labs-eat-software/fig-01.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" decoding="async"><figcaption>毛线厂手里多了一根会自己跳舞的针。</figcaption></figure>
<p>这是<a href="/posts/code-is-cheap-where-money-goes">《代码不值钱以后，钱流向了哪里》</a>的续篇。上一篇站在企业的角度，讨论企业该买什么。这一篇换到行业的角度，只讨论一个问题：软件的钱，以前从哪来，现在去了哪，以后会去哪。</p>
<p>我用一家毛线厂来讲。以前它只卖毛线，织毛衣是别人的事：有人买毛线回家自己织，有人开店织好了卖。毛线厂赚毛线的钱，毛衣店赚手艺的钱。现在毛线厂手里多了一根会自己跳舞的针，毛线放上去，衣服自己就串起来了。基模公司就是这家毛线厂，小软件公司就是那些毛衣店。</p>
<h2>以前：软件赚的是用户不会动手的钱，和注意力的钱</h2>
<figure class="illus"><img src="/images/posts/will-model-labs-eat-software/fig-02.webp" alt="左边一个人坐在沙发上拿遥控器看老电视，右边同一个人对着一个对话气泡说话，气泡连着许多小应用的门" loading="lazy" srcset="/images/posts/will-model-labs-eat-software/fig-02-800.webp 800w, /images/posts/will-model-labs-eat-software/fig-02.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" decoding="async"><figcaption>入口从电视开机页搬到了 agent 前台。</figcaption></figure>
<p>以前很多软件赚的是信息差。拿电视来说，大部分用户不会折腾，开机看什么、装什么应用，都由厂商说了算。广告的钱、入口的钱，就这么赚到了。</p>
<p>现在知识和技术都平权了，不会折腾的人可以问 AI。以前想去掉小米电视的开机广告，得自己查教程、敲 adb 命令、装第三方桌面，或者干脆换一台 Apple TV，用 APTV 这类直播播放器绕开厂商的桌面。现在有人直接让 Claude Code 代劳：开源项目 CleanYourTV 的作者给爸妈的小米 Mi TV 4A 去广告，AI 通过 adb 先备份，再停用了二十来个预装的遥测、推荐和推广服务，换上一个很小的新桌面，每一步都能还原。靠用户不会动手赚钱的时代正在结束。</p>
<p>可电视赚的钱，说到底是卖注意力的钱，这一块没有消失。AI 让内容和软件都过剩了，注意力反而更稀缺。</p>
<figure class="illus"><img src="/images/posts/will-model-labs-eat-software/fig-03.webp" alt="人们免费走进一扇拱门，旁边的小换衣间里，一个抽象的游戏角色在试穿不同颜色的衣服" loading="lazy" srcset="/images/posts/will-model-labs-eat-software/fig-03-800.webp 800w, /images/posts/will-model-labs-eat-software/fig-03.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" decoding="async"><figcaption>进门免费，换装要钱。</figcaption></figure>
<p>英雄联盟是另一个例子。游戏本身不要钱，它靠卖皮肤、靠 IP 周边、靠赛事和广告赚钱。要是让玩家按小时付费，这个游戏多半就完了。当然也有反例，魔兽世界就卖过点卡。更准的说法是：一样东西复制成本接近零以后，就得找别的东西来变现。LOL 找到的是皮肤、IP，还有一大群一起玩的人。</p>
<p>软件正在走到这一步。上一篇提过，有人用 AI 把 Word、Excel、PowerPoint 各复刻了一个免费开源版，界面几乎一模一样，Office 暂时没事。能一下子复制的是代码，用户、格式、生态和数据一时复制不了。不过这几道护城河也在变薄：格式兼容和数据迁移，正好是 agent 擅长的活。搬家的成本越低，用户留下来的理由就越少。</p>
<p>既然不会动手的钱赚不到了，代码本身也越来越不值钱，钱去了哪？</p>
<h2>现在：针会自己织了，钱却没进毛线厂</h2>
<p>很多人说大模型是新时代的电力，是基础设施。我觉得这个比喻不够。电厂没有去造电机、做家电，因为往上扩展太贵：从卖电扩展到造电机，要研发电机、建工厂、做渠道，每一步都是另一门生意。基模公司往上扩展，是从卖 token 扩展到做软件，就便宜多了。模型本身就会写代码，云上开几千个线程跑流水线，剩下的成本主要是推理算力。</p>
<p>按理说，钱该流进毛线厂了。可现在 AI 应用公司大多没跑通商业模式，基模公司自己的说法也要分清是哪种赚钱：</p>
<ul>
<li>Anthropic 的 Dario Amodei 说：「每个模型都赚钱，但公司在亏钱。」他的意思是，单个模型拿训练成本和推理成本去比它带来的收入，是能回本的；公司整体亏，是因为同时在花更多的钱训练下一代模型。</li>
<li>OpenAI 的 Sam Altman 说：「我们的推理是赚钱的。如果不用付训练的钱，我们会是一家非常赚钱的公司。」不过据报道，同场的 COO 补了一句，说的是「已经很接近了」。</li>
</ul>
<p>两种说法都承认：公司整体还在亏。钱现在不是在被赚，是在被花。投资人和大厂的资本开支流进基模公司和云厂商，再流向芯片、内存、数据中心和电力。上一篇写过，今年一季度内存合约价一个季度涨了九成左右。放回毛线厂的比喻里，眼下赚钱的还不是毛线厂，是卖羊毛的人（芯片和内存），还有给那根针供电的人（电力）。</p>
<figure class="illus"><img src="/images/posts/will-model-labs-eat-software/fig-04.webp" alt="田野地下埋着一大束光纤，只有两三根亮着，地面上一台挖掘机停着没人用" loading="lazy" srcset="/images/posts/will-model-labs-eat-software/fig-04-800.webp 800w, /images/posts/will-model-labs-eat-software/fig-04.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" decoding="async"><figcaption>铺好的光纤，大部分没有亮。</figcaption></figure>
<p>这种局面以前有过。2000 年前后，电信公司相信互联网流量会一直爆炸，借钱铺光纤。华尔街日报 2001 年的报道说，美国过去四年铺了约 900 亿美元的光纤，美林估计只有 2.6% 的容量在用。剩下的叫「暗光纤」，很多可能永远不会亮。带宽价格暴跌，Global Crossing 在 2002 年 1 月申请破产，是当时美国史上第四大破产案；WorldCom 也倒在了财务造假里。</p>
<p>铺光纤的公司破产了，便宜的带宽留了下来，后来真正赚到钱的，是用这些光纤的互联网公司。</p>
<p>如果这一次也照光纤的路子走，接下来毛线厂会怎么做，毛衣店又会剩下什么？</p>
<h2>接下来：毛线厂会织标准款，把定制和担责留给别人</h2>
<p>这一节都是预测，我在每条后面标了自己有多大把握。</p>
<p><strong>一、会有一轮洗牌，token 降价但降不到零。</strong>照光纤的路子，大概是三步：</p>
<table>
<tr><th>阶段</th><th>会发生什么</th></tr>
<tr><td>1. 继续加码</td><td>资本开支猛涨，直到某一轮融不到钱，或者用户的账单撑不住</td></tr>
<tr><td>2. 洗牌</td><td>模型公司合并、倒闭，算力过剩，token 价格掉下来</td></tr>
<tr><td>3. 应用层赚钱</td><td>成本终于低于收入，建在便宜算力上的公司开始赚钱</td></tr>
</table>
<p>有一点和光纤不一样：光纤铺好以后几乎没有运营成本，推理每用一次都要烧电。所以 token 价格会降，长期看未必会变成白菜价。降价的方向我比较确定，三步的节奏只是猜测。</p>
<p><strong>二、几家基模公司会一起拿走标准款。</strong>说「垄断」，我指的不是一家通吃，而是几家一起把小软件公司的活拿走。几家之间有竞争，一家贵了，总有别家用更低的价格来抢，所以价格不会过分高。它亲自做哪些，要看盈亏平衡，还要算机会成本：小软件公司做应用时本来就在买它的 token，它算的是「自己做多赚的钱」和「让别人做、自己卖 token 赚的钱」差多少。算下来，它会出少数标品，也就是市场大、需求标准、做一次就能卖给所有人的东西，再加一个通用入口。</p>
<p>苹果把第三方应用的功能做进系统，这种事多到有个专门的词，叫「被 Sherlock」：2002 年苹果的 Sherlock 3 做进了 Watson 的大部分功能，Watson 很快卖不动，2004 年停止开发；后来 iOS 的夜览（Night Shift）也做了 f.lux 做了多年的事。AWS 在 2015 年推出托管的 Elasticsearch 服务，Elastic 在 2021 年改了开源协议，公开说就是冲着 AWS 去的，AWS 随即 fork 出 OpenSearch。但到目前为止，SaaS 没有因此死掉，App Store 里的应用也还在。平台先吃掉的是薄的那一层。这一条我比较确定。</p>
<p><strong>三、它会比想象中慢。</strong>基模公司往上扩展比电厂便宜，可阻力也不是零：</p>
<figure class="illus"><img src="/images/posts/will-model-labs-eat-software/fig-05.webp" alt="对比示意图：左边电厂往上扩展去造电机，要经过研发电机、建工厂、做渠道，路又长又贵；右边基模公司往上扩展去做软件，路很短，但要过渠道冲突、分发、合规三道坎" loading="lazy" srcset="/images/posts/will-model-labs-eat-software/fig-05-800.webp 800w, /images/posts/will-model-labs-eat-software/fig-05.webp 1600w" sizes="(max-width: 768px) 100vw, 760px" width="1600" height="900" decoding="async"><figcaption>电厂往上扩展路又长又贵；基模公司路很短，但有三道坎。</figcaption></figure>
<table>
<tr><th>阻力</th><th>说的是什么</th></tr>
<tr><td>渠道冲突</td><td>自己做应用，就是在跟买 token 的客户抢生意，客户会转去用别家模型</td></tr>
<tr><td>分发</td><td>用户的入口还在微信、钉钉、苹果这些地方</td></tr>
<tr><td>合规和准入</td><td>每个行业、每个地区的牌照，它没法一张张去拿</td></tr>
</table>
<p>所以它做通用入口和少数标品大概做得到，只是速度不会像「一个月复现全部软件」那么快。具体多慢，我说不准。</p>
<p><strong>四、入口会搬到 agent 前台。</strong>用户只跟一个 agent 说话，它决定调用谁、推荐谁。谁占着这个前台，谁就是新的电视台。抢前台的有两拨人：一拨是基模公司，ChatGPT、Claude、Grok 都想当这个入口；另一拨是已经握着用户的微信、苹果。小软件公司多半只能在两边之间选边站。方向我比较确定，谁赢只是猜测。</p>
<p><strong>五、纯定制会被企业自己的 agent 吃掉。</strong>用上一篇的筛子：这件事，企业自己的 agent 能不能做？能做，就不是好生意。很多个性化的活可能不会落到专业软件公司手里，会被企业自己的 agent 吃掉。纯粹「帮你定制一下」的活，窗口期也就一两年。「一两年」是我的估计。</p>
<p><strong>六、受监管的行业，会按地区和行业切开。</strong>金融、医疗、政务、跨境这些行业，基模公司很难直接下场：它没法替每个客户承担后果，也拿不到每一张牌照，数据出境、反垄断这些规定也会限制它，而且比技术壁垒更难绕过去。每一块市场里都需要一个有资质、有本地数据、出了事能签字的人。上一篇说的「兜底」和「门禁」，现在多了一个来源：法律本身。这一条我比较确定。</p>
<p><strong>七、长尾的饼会变大。</strong>软件便宜以后，以前不值得做的需求变得值得做了：一家五个门店的火锅店，一个只有十个人的部门。上一篇说过 token 的杰文斯悖论，单价降了，总用量涨得更快；需求这边也一样，便宜往往会让市场变大。长尾加起来，可能比基模公司拿走的标品还大，这只是猜测。难点是单子很小，一单一单做养不活人。出路是能复用的定制：做一份行业种子，卖给很多家，再签维保。一份种子把客户带进来，维保合同把客户留下。</p>
<p><strong>八、token 更可能是成本，不是售价。</strong>有一种可能：token 变成「软件服务」的通货，某家模型公司卖你多少 token 的软件服务，你的需求全在它的流水线上做完，这就是未来的外包。我觉得 token 更可能是成本单位。客户买的是结果，就像没人按耗电的度数买洗衣机。这一条我倾向于相信，但不算很确定。</p>
<p><strong>九、harness 留不住钱。</strong>harness，也就是包在模型外面的那套工具和流程，确实会影响效果，同一个模型换个 harness，表现能差一大截。但它不是护城河，好的做法很快会被模型公司吸收进自家产品，Claude Code 就是这样。毛线怎么织，换不出太大的花样。这一条我比较确定。</p>
<p>标准款交给针，定制交给企业自己的 agent，那人还剩下什么？</p>
<h2>最后：人剩下的是衣服的设计和图案</h2>
<figure class="illus"><img src="/images/posts/will-model-labs-eat-software/fig-06.webp" alt="桌上放着一件素色毛衣，设计师在旁边的纸上画图案，旁边有软尺、布样和一张吊牌" loading="lazy" srcset="/images/posts/will-model-labs-eat-software/fig-06-800.webp 800w, /images/posts/will-model-labs-eat-software/fig-06.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" width="1280" height="720" decoding="async"><figcaption>针织得出毛衣，图案和吊牌还得靠人。</figcaption></figure>
<p>会自己跳舞的针，会把标准款毛衣都织出来。今天不同的人还要不同的衣服，毛线厂够不着的地方，价值就在衣服的设计和图案上。我想这也是以后人的工作会转去的方向。我觉得是三样东西：</p>
<table>
<tr><th>剩下的价值</th><th>对应衣服的什么</th><th>为什么针替不了</th></tr>
<tr><td>能签字负责的资质</td><td>给衣服做质检、贴合格证</td><td>出了事要有人担责，牌照按行业和地区发</td></tr>
<tr><td>占住注意力的 IP 和内容</td><td>图案和品牌</td><td>大家想穿的是那个图案，就像 LOL 的皮肤</td></tr>
<tr><td>能复用的行业经验</td><td>版型</td><td>服务过很多家才知道这个行业的人穿多大码</td></tr>
</table>
<p><strong>一人公司还有没有机会？</strong>先说不乐观的一面。长尾的饼会变大，但我猜大部分会被企业自家的流水线消化掉。只靠写代码接活的个人，我看不到什么希望，写代码正是那根针最先接走的活。</p>
<p>不过这根针不只在毛线厂和企业手里，个人手里也有。PetaPixel 报道过一个例子：Brandon Thomas 用 AI 做了 Word、Excel、PowerPoint 的开源替代品 WordCraft、GridCraft、DeckCraft，有 macOS、Windows、Linux 桌面版。他说：「AI models enable me to work as an entire company.」（AI 模型让我一个人就能像一整家公司那样干活。）</p>
<p>我猜一人公司的机会在三处，都对得上上面那张表：</p>
<ul>
<li><strong>自己做产品。</strong>卡住你的不再是开发，而是有没有人看见。拼的是注意力和信任，也就是表里的 IP 和图案。</li>
<li><strong>当企业流水线的主管。</strong>说清楚要什么、验收、出了事签字。岗位还在，只是从写代码换成了管针，对应表里的资质。</li>
<li><strong>带着行业经验又会用 AI 的人。</strong>懂一个行业的版型，再用针把它织成能复用的种子。</li>
</ul>
<p>这一段比第 3 节更偏猜测。我比较确定的只有前半句：只会写代码的个人路会越来越窄。</p>
<p>留个问题给你：你做的事情里，哪一部分是那根针织不出来的？</p>
<h2>参考</h2>
<ul>
<li><a href="https://petapixel.com/2026/10/12/there-are-free-open-source-versions-of-microsoft-office-apps-thanks-to-ai/">PetaPixel：There are free, open-source versions of Microsoft Office apps thanks to AI</a></li>
<li><a href="https://cheekypint.substack.com/p/a-cheeky-pint-with-anthropic-ceo">A Cheeky Pint with Anthropic CEO Dario Amodei</a>（单个模型能回本的说法）</li>
<li><a href="https://korrents.com/k/every-frontier-model-is-profitable-on-af48cf">Dario Amodei：“Each model makes money, but the company loses money.”（2026-02）</a></li>
<li><a href="https://www.axios.com/2025/08/15/sam-altman-gpt5-launch-chatgpt-future">Axios：Sam Altman defends GPT-5 launch（推理赚钱的说法）</a></li>
<li><a href="https://news.ycombinator.com/item?id=45055214">Hacker News 讨论引述 Hard Fork：COO 说 “pretty close”</a></li>
<li><a href="https://www.wsj.com/articles/SB992810125428317389">WSJ（2001）：How the Fiber Barons Plunged the U.S. Into a Telecom Glut</a></li>
<li><a href="https://financialservices.house.gov/media/pdf/032102wm.pdf">美国众议院金融服务委员会材料：Global Crossing 破产</a></li>
<li><a href="https://www.wsj.com/articles/SB1032982764442483713">WSJ（2002）：Wildly Optimistic Data Drove Telecoms to Build Fiber Glut</a></li>
<li><a href="https://www.theguardian.com/technology/2013/oct/28/sherlocked-how-mavericks-is-making-some-apps-obsolete">The Guardian：Sherlocked</a></li>
<li><a href="https://appleinsider.com/articles/16/01/15/flux-says-it-is-original-innovator-of-nighttime-display-color-tech-asks-apple-to-open-night-shift-api">AppleInsider：f.lux 与 Night Shift</a></li>
<li><a href="https://www.elastic.co/blog/why-license-change-aws">Elastic：Amazon: NOT OK - why we had to change Elastic licensing</a></li>
<li><a href="https://aws.amazon.com/blogs/aws/announcing-amazon-opensearch-service-which-supports-opensearch-10/">AWS：Announcing Amazon OpenSearch Service</a></li>
<li><a href="https://www.binmage.com/zh/android-tv-boot-ads-cleanyourtv/">安卓电视去广告：Claude Code 5 步搞定小米、TCL</a></li>
<li><a href="https://cleanyour.tv/">CleanYourTV</a></li>
<li><a href="https://techno360.in/debloat-mi-tv-claude-code/">How to Debloat a Xiaomi Mi TV with Claude Code</a></li>
<li><a href="https://aptv.app/">APTV：Apple 全平台 M3U 播放器</a></li>
</ul>
</div>
