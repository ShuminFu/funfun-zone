---
title: "把显卡包装成“次级车贷”：起底华尔街与硅谷的万亿破产洗债局"
description: "谁借的钱、租金怎么被压下去、破产桌上谁收场——以及这跟暗光纤、2008 次贷、车贷叙事到底哪里不一样"
growth: seedling
growthLocked: true
planted: 2026-11-07T14:57:07+08:00
lastTended: 2026-11-07T16:50:00+08:00
draft: false
icon: /icons/gpu-card.webp
iconAlt: 一张线描显卡
tags:
  - "ai-agents"
  - "finance"
  - "gpu"
  - "notes"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* --native companion: badges, figures, callouts (under .html-embed). */
.html-embed .pg-callout {
  border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  padding: 0.85rem 1rem;
  margin: 1.25rem 0;
}
.html-embed .pg-callout p { margin: 0; }
.html-embed .pg-callout p + p { margin-top: 0.6rem; }

.html-embed .fig { margin: 1.35rem 0 1.5rem; }
.html-embed .fig img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent);
  background: color-mix(in srgb, var(--foreground) 4%, transparent);
}
/* Tall illustration: cap width so it does not fill a whole screen. */
.html-embed .fig.fig-tall { max-width: 480px; margin-left: auto; margin-right: auto; }
.html-embed .fig figcaption {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  opacity: 0.72;
  line-height: 1.45;
}

.html-embed .tier {
  border: 1px solid color-mix(in srgb, var(--foreground) 14%, transparent);
  border-radius: 8px;
  padding: 1.05rem 1.15rem 1.1rem;
  margin: 0 0 0.95rem;
  background: color-mix(in srgb, var(--foreground) 3%, transparent);
}
.html-embed .tier .label {
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.35;
  color: #ffffff;
  background: #1a1a1a;
  border-radius: 999px;
  padding: 0.32rem 0.85rem;
  margin: 0 0 0.7rem;
}
html[data-theme="dark"] .html-embed .tier .label {
  color: #111111;
  background: #f2ebe3;
}
.html-embed .tier h3 {
  margin: 0 0 0.55rem;
  font-size: 1.12rem;
  color: var(--foreground);
}
.html-embed .tier p:last-child { margin-bottom: 0; }

.html-embed .diff {
  border-left: 3px solid color-mix(in srgb, var(--foreground) 18%, transparent);
  padding: 0.1rem 0 0.1rem 1rem;
  margin: 0 0 1.25rem;
}
.html-embed .diff h3 { margin-top: 0; }

.html-embed .source {
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--foreground) 14%, transparent);
  font-size: 0.9rem;
  opacity: 0.75;
}
.html-embed .source a { color: var(--accent); }
</style>

<div class="html-embed" lang="zh-CN">
<div class="wrap">
  <p class="subtitle">谁借的钱、租金怎么被压下去、破产桌上谁收场——以及这跟暗光纤、2008 次贷、车贷叙事到底哪里不一样</p>
  <p class="meta">整理自 B 站「拆钱日记」· 算力资本局第三期 · 约 31 分钟</p>
  <section>
    <h2>一、谁借的钱，怎么收场</h2>
    <p>前两期把微观和中观拼完了：DeepSeek 一类开源架构砍掉一半推理开销、把上一代显卡踢出原生支持；CoreWeave 被大客户背刺，Meta 背着约 8250 亿美元债务把自由现金流干成负数，马斯克靠 19 天建机房的时间差翻盘，却仍被每季约 400 亿美元资本开支逼到非吞并特斯拉不可。</p>
    <p>第三期只问一件事：全行业自由现金流都被算力干成负数，过去三年涌进数据中心的约 <strong>1.65 万亿美元</strong>影子债务，是谁借出来的？泡沫警报响起时，华尔街和硅谷又打算怎么收场？</p>
    <p>二级市场看起来要塌：CoreWeave 高收益债砸到面值约 80 美分、收益率约 15%；微软取消英国 Nscale 巨额租约；德州、新墨西哥项目因地方反对或监管受阻。可同一周一级市场里，黑石、阿波罗联合博通做完代号 <strong>BigSky</strong>、约 <strong>350 亿美元</strong>芯片抵押交易，专门给未上市的 Anthropic 买卡；博通还在筹约 600 亿同类融资；SpaceX 也在寻求约 400 亿显卡抵押贷款。</p>
    <p>一边老债跌到违约边缘，一边顶级机构继续往池子里砸钱——这不是风控集体失智，而是四年前就设计好的<strong>成本重置与破产洗债</strong>。</p>
    <div class="pg-callout">
      <p><strong>整条线可以压成一段话：</strong>显卡的硬件寿命大约还能再跑好几年，并不是第三年就坏掉。但是云厂商和规则制定者可以靠合同、撕约和破产重整，把算力包租公从一级训练价（约 4 美元/小时）压到二级推理价（约 1.8 美元/小时），顺便把泡沫出清。五年期高息债撑不住之后，包租公违约进重整；云巨头逼债主本金砍半、租金腰斩，再以白菜价收回还能再跑约五年的机房与卡。华尔街先赚前端费，再拿优先债权接管去杠杆后的现金奶牛。</p>
    </div>
    <figure class="fig">
      <img alt="显卡物理寿命仍有多年，云厂用合同与破产重整把训练租金压到推理价" src="/images/posts/gpu-subprime-wash-debt/fig-01.webp" width="1280" height="466" loading="lazy" srcset="/images/posts/gpu-subprime-wash-debt/fig-01-800.webp 800w, /images/posts/gpu-subprime-wash-debt/fig-01.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" decoding="async" data-avif="no">
      <figcaption>图 1 · 显卡还能再跑好几年，但云厂用合同和破产桌把训练租金压成推理价。</figcaption>
    </figure>
    <p>先把三件并不冲突的事实拆开说清楚。</p>
    <ul>
      <li><strong>硬件还在。</strong>显卡物理上大约还能再跑 6–8 年（黄仁勋公开称约 8 年；A100 到 2026 年仍在满负荷运转）。摩尔定律在制程上撞了墙，因此物理寿命被拉长，华尔街才敢把芯片做成资产证券化。</li>
      <li><strong>租金会掉。</strong>黄金训练期大约两年，租价约 4 美元/小时；到了第三年，市场多半只肯付约 1.8 美元的二线推理价；再往后，许多卡只剩夜间批处理。系统级能效仍在跃进（堆叠、HBM、精度压缩），加上开源引擎放弃旧架构原生支持——老卡物理没坏，但是每瓦特效益已经变差。第三年每小时净赚约 1.3 美元仍像印钞机，却还不起按峰值 4 美元设计的五年高利贷。</li>
      <li><strong>合同对不上。</strong>包租公借的是约 5 年期高息贷（利率约 9%–14%），下游客户租约却常常只有约 3 年；买卡还顶着约 40% 的黄牛溢价。于是债务期限、租约长度和实际租金三条线从一开始就拧在一起。</li>
    </ul>
    <p>真正要写清楚的，是「怎么逼」：云厂商并不是等显卡坏掉，而是用一整套合同剧本，把训练价压成推理价。</p>
    <p>合同附件里通常早埋好了交付里程碑和交叉违约条款。工程晚一天，巨头就可以合法撕约，而且零违约金全身而退——Nscale 指望微软租约去上市，交付节点风波之后，微软取消合约就是活例子。坐上破产重整桌时，云巨头进一步逼债主：本金减记约 50%，租金腰斩到约 1.8 美元，再重签五年推理包销；如果你不答应，对方可以拔网线，本金可能亏掉 80% 以上。债权人往往只能流血签字。</p>
    <p>因此，三年后报废的不是显卡，而是包租公的资产负债表。硬件还能再跑约五年，负债主体却准时违约；云巨头完成成本重置，私募优先档接管几乎没有利息负担的算力现金奶牛，下一轮软件与智能体平台再上车。</p>
  </section>
  <section>
    <h2>二、四级实物链：每一层发生了什么</h2>
    <p>整场局是一张四级实物链金字塔。各层分工不同，结局也不同。</p>
    <figure class="fig fig-tall">
      <picture><source type="image/avif" srcset="/images/posts/gpu-subprime-wash-debt/fig-02.avif"><img alt="四级实物链金字塔：规则制定者、云巨头、算力包租工（白手套）、终极买单人" src="/images/posts/gpu-subprime-wash-debt/fig-02.webp" width="970" height="1432" loading="lazy" decoding="async"></picture>
      <figcaption>图 2 · 四级实物链：上面定规则的人通吃，下面买单的人扛损。</figcaption>
    </figure>
    <div class="tier">
      <span class="label">第一级 · 规则制定者</span>
      <h3>英伟达 / 博通 + 黑石 / 阿波罗等</h3>
      <p>他们指着 6–8 年物理寿命，把芯片包装成约 <strong>5.75%</strong> 投资级债和年化派息约 10% 的理财。魔术两招：<strong>原厂违约兜底</strong>（芯片锁在 SPE；承租人违约则转租或变卖，窟窿由博通等补）+ <strong>优先/次级切层</strong>（优先档拿投资级低息；约 45 亿美元次级档约 8.5% 利率当安全垫）。</p>
      <p>代表作：BigSky 约 <strong>350 亿</strong>给 Anthropic（上半年账面亏约 807 亿、无公开评级，却借到极低息）；美银估算单 AIXPV 平台到 2029 年中期约需 <strong>2350 亿</strong>有担保债；英伟达集结阿波罗、黑石、贝莱德、布鲁克菲尔德、KKR、高盛搭约 <strong>5000 亿</strong> AI 基建融资框架，并承诺坏账由英伟达兜底最高约 <strong>25%</strong> 损失份额。SpaceX 亦传出借此寻求约 400 亿芯片抵押融资。</p>
      <p><strong>这一层发生了什么：</strong>前三年赚足前端费与管理费；泡沫出清后，他们拿优先债权接管去杠杆的算力现金奶牛，坐上下一轮造富列车的头等舱。他们是通吃全场的终极赢家。</p>
    </div>
    <div class="tier">
      <span class="label">第二级 · 硅谷云巨头</span>
      <h3>微软 / Meta / 谷歌 / 亚马逊等</h3>
      <p>前三年他们必须不计成本抢百万张卡和百兆瓦电力，但是黄牛溢价 40% 以上、建设周期长、借债利率又在 10% 以上——如果全背在表内，分析师会砸股价。于是他们扶持 CoreWeave、Nscale 等<strong>表外白手套</strong>：包租公拿私募高利贷抢卡、死磕电网；巨头只签大约三年的租约做信用背书，合同附件里早埋好交付里程碑与交叉违约条款。</p>
      <p>2026 年秋风向转：开源混合专家与自研芯（TPU、Trainium）让日常推理不必再付约 4 美元/小时；四大云巨头今年约 <strong>7250 亿美元</strong>资本开支已把自由现金流干成负数，因此他们必须砍掉高价包袱。第一招是工程晚一天就合法撕约——Nscale 指望微软租约上市，交付节点风波后微软取消合约、零违约金全身而退。第二招是坐破产重整桌，逼本金砍半、租金腰斩到约 1.8 美元，再签五年推理包销。</p>
      <p><strong>这一层发生了什么：</strong>包租公暴雷伤不到他们，反而成了洗债工具；他们以白菜价收回还能再跑约 5 年的百兆瓦液冷机房，完成算力底座的成本重置。他们是先苦后甜的收割者。</p>
      <p>补充两个容易归错层的名字。Cloudflare 更像第 2 层的轻量、边缘准云，而不是第 3 层包租工：它自己在全球 PoP 铺 GPU，按推理需求跟投 CapEx，卖的是 Workers AI 按次推理（按 Neurons 计价），融资走可转债，而不是 GPU/机房 SPV 包租结构；管理层也明确说，公司不做 hyperscaler 那种「买机器再租出去」，也不建千亿级训练集群。甲骨文（Oracle）主落第 2 层云巨头，但是融资吃了第 3 层的 SPV/长租外壳，因此它不是 CoreWeave 同层的白手套：在 Stargate 链条里，开发商和债主持有机房，甲骨文签大约 15 年的长租当信用租户，再把算力卖给 OpenAI。换句话说，Cloudflare 更像自己买少量边缘 GPU 的准云；甲骨文更像用长租和债撬大机房的云巨头调度方。</p>
    </div>
    <div class="tier">
      <span class="label">第三级 · 算力包租工（白手套）</span>
      <h3>CoreWeave、Nscale 等</h3>
      <p>他们实质上是巨头合谋搭建的表外特殊目的实体：出面高息买卡、建机房、扛地方审批与电网扯皮。典型结构是约 5 年期贷款（利率约 9%–14%）对约 3 年客户租约，买卡还顶着约 40% 溢价。账上「在手积压订单」看起来像铁饭碗（CoreWeave 近千亿美元远期合同、扎克伯格约 352 亿美元长约），但是信用支持归根结底来自少数科技巨头——合同怎么执行，全凭巨头说了算。</p>
      <p>这也是为什么他们等于白手套：巨头只签短租约背书，风险却落到包租工身上；包租工再把高息债转给买这些债的车行老板、牙医和养老金。换句话说，他们出面借债建机房，巨头却不用把抢卡和审批的脏活扛在自己表内。</p>
      <p><strong>这一层发生了什么：</strong>第三年租金腰斩，高息债撑不住，违约或重整；普通股权作为破产代价清零（少数提前套现的高管除外）。Nscale 被微软取消租约、上市流产，是当下的活教材。东亚晶圆、HBM 与服务器代工厂也随之告别暴利，回归微薄加工费。</p>
    </div>
    <div class="tier">
      <span class="label">第四级 · 终极买单人</span>
      <h3>中西部车行老板、私人牙医、养老金</h3>
      <p>算力基建近约 <strong>1 万亿美元</strong>依赖私募信贷。高利率周期里，黑石、阿波罗等向财富管理渠道推销<strong>非上市私募信贷基金</strong>与 BDC：年化派息约 <strong>10%–11%</strong>、按月分红，又不在二级市场挂牌，账面净值像一条斜向上的直线。俄亥俄车行老板、德州牙医、小镇富豪、各州退休年金——钱被贵集起来，再以约 9%–14% 借给包租公。</p>
      <p>大行赚撮合费，私募稳收管理费；真正把约 1 万亿本金压在机房高价债上的，是内陆富裕中产和退休老人。赎回合同写死：每季总赎回上限多不超过净资产约 <strong>5%</strong>，超额就冻结排队——外面债已经跌到 80 美分，笼子里连赎回按钮都按不下去。</p>
      <p><strong>这一层发生了什么：</strong>他们听信「显卡寿命八年堪比福特贷款」，贪图 10% 按月分红；重整时本金减记约一半，默默替全行业报销早期抢卡溢价。他们才是真正的买单人。</p>
    </div>
    <figure class="fig">
      <img alt="破产重整谈判：债权人面对本金砍半、租金腰斩与云巨头的城下之盟" src="/images/posts/gpu-subprime-wash-debt/fig-03.webp" width="1280" height="720" loading="lazy" srcset="/images/posts/gpu-subprime-wash-debt/fig-03-800.webp 800w, /images/posts/gpu-subprime-wash-debt/fig-03.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" decoding="async" data-avif="no">
      <figcaption>图 3 · 破产重整桌上，债权人往往只能接受本金砍半、租金腰斩；与此同时，硬件还在继续跑。</figcaption>
    </figure>
  </section>
  <section>
    <h2>三、跟以前有什么不一样</h2>
    <figure class="fig">
      <img alt="暗光纤与今日 GPU 机房对照：出清剧本相似，这次更像主动设计" src="/images/posts/gpu-subprime-wash-debt/fig-04.webp" width="1280" height="720" loading="lazy" srcset="/images/posts/gpu-subprime-wash-debt/fig-04-800.webp 800w, /images/posts/gpu-subprime-wash-debt/fig-04.webp 1280w" sizes="(max-width: 768px) 100vw, 760px" decoding="async" data-avif="no">
      <figcaption>图 4 · 暗光纤换成了 GPU 机房，出清剧本仍旧相似；但是这一次更像主动设计，而不是失控后的被动遗产。</figcaption>
    </figure>
    <div class="diff">
      <h3>对照 2000–2001：电信 / 暗光纤</h3>
      <p><strong>相似：</strong>高息债狂铺基建，然后下游应用跟不上、资产闲置；运营商破产，债主血本无归；但是物理资产一根都没少，带宽价格暴跌约 90% 以上；于是谷歌、亚马逊踩在几乎不要钱的底座上，开启下一轮造富。</p>
      <p><strong>不一样：</strong>资产从海底或地下的光纤，换成了德州、孟菲斯的百兆瓦液冷 GPU 机房。更关键的是，本次并不是「失控后被动出清」，而是主动设计：表外白手套先高价抢卡，合同与破产桌再把训练租金压成推理价——三年后报废的是资产负债表，留下的却是还能再跑约五年的硬件，专供破产桌上收割。暗光纤是历史偶然遗产；今天更像按剧本拉响的大轮动信号弹。</p>
    </div>
    <div class="diff">
      <h3>对照 2008：次贷与雷曼</h3>
      <p>很多人以为包租公违约会炸在摩根大通、高盛的表内，从而引爆银行倒闭潮。但是华尔街过去十年已经剪断了两根系统性引线：</p>
      <ul>
        <li><strong>引线一被剪：表内杠杆传染。</strong>2008 年投行与银行用表内资本金，再加 30 倍以上短期回购杠杆，持有次级房贷债；房价只要跌 5%，核心资本就可能归零。今天上万亿算力高息债从一开始就被隔离在<strong>银行表外私募信贷基金</strong>里——因此即便包租公全违约，大行资产负债表也晃不动一下。</li>
        <li><strong>引线二被剪：流动性挤兑与跨市场抛售。</strong>空头指望公募债跌破 80 美分，触发私募恐慌赎回，基金被迫抛售苹果、微软、英伟达，从而砸崩大盘。但是非上市信贷基金的赎回闸门每季大约只有 5%，超额只能排队——没有赎回，就没有被动抛售美股，跨市场传染通道被物理掐死。</li>
      </ul>
      <p><strong>结论：</strong>这更像<strong>定点收割中产储蓄</strong>，而不像雷曼式系统性银行危机。指望「算力暴雷 → 美股崩盘」的空头，容易踩空。</p>
    </div>
    <div class="diff">
      <h3>对照传统车贷叙事</h3>
      <p>卖方把芯片放贷比作百年前的福特分期，并且预言会出现 Kelley Blue Book 式残值体系：三年二手显卡值多少、打几折抵押，像查二手本田思域一样清楚。</p>
      <p><strong>最假的一环：</strong>开了三年的福特，全美国大约有两亿司机可以接盘；但是装满十万张三年期二手卡、每月电费几千万美元的百兆瓦液冷机房，全世界又有几个买家？底层信用多来自少数科技巨头，买方垄断、议价权极度不对称——因此巨头随时可以逼包租公和放贷机构重谈，把租金砍半。多头借贷更放大黑洞：BIS 报告显示，私募信贷放给软件与科技公司的贷款里，约 <strong>60%</strong> 借给了同时向 7 家以上机构借钱的企业（十年前不到 10%），同一批资产被不同 SPE 交叉质押。</p>
      <p>老手已经在用脚投票：部分大型固收负责人公开拒绝，在看清结构遇冲击如何演变之前，不向获投资级评级的大型芯片交易提供贷款。</p>
    </div>
    <div class="pg-callout">
      <p>在华尔街字典里，从来没有白吹的泡沫，只有精心设计好的财富转移。每一场看似失控的技术狂热背后，都早就标好了：谁在台前唱戏，谁在台下买单，谁在散场后把整座剧场收归己有。</p>
    </div>
  </section>
  <div class="source">
    <p>来源视频：<a href="https://www.bilibili.com/video/BV1BfnX6KE1W/">把显卡包装成2350亿“次级车贷”，再逼债主本金砍半：起底华尔街与硅谷的“万亿破产洗债局”</a>（UP：拆钱日记）</p>
    <p>本稿为视频内容整理，非官方文稿或投资建议；配图为示意，非视频截图。</p>
  </div>
</div>
</div>
