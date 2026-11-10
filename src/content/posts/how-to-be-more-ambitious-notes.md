---
title: "读书笔记：Felix Rieseberg 讲怎么把大模型用得更有野心"
description: "我把自己在五彩里对《How to be more ambitious》的划线，按高度、深度、广度三种野心重新整理，并写下每一处的理解。"
growth: seedling
planted: 2026-11-10T23:51:50+08:00
draft: false
tags:
  - "ai-agents"
  - "agent-future"
  - "reading-notes"
---

<style>
.html-embed{display:block}
.html-embed :where(h1,h2,h3,h4){font-style:normal}
.html-embed :where(th,td){border:0}
.html-embed :where(code)::before,.html-embed :where(code)::after{content:none}
.html-embed :where(ul,ol){list-style:revert}
.html-embed{--ink:#1f1d1a; --ink-2:#4a4640; --paper:#fbf8f3; --card:#ffffff; --rule:#e4ddd2; --accent:#b4532a; --pill-bg:#8a3a1c; --pill-fg:#ffffff; --pill2-bg:#3b3a36; --pill2-fg:#ffffff; --q-bg:#f3eee6;}
html[data-theme="dark"] .html-embed{--ink:#ece7df; --ink-2:#c9c2b7; --paper:#1b1a18; --card:#24221f; --rule:#3a3631; --accent:#e08a62; --pill-bg:#f6d3c2; --pill-fg:#2a1208; --pill2-bg:#d9d4cb; --pill2-fg:#1b1a18; --q-bg:#2a2724;}
.html-embed *{box-sizing:border-box}
.html-embed{margin:0;background:var(--paper);color:var(--ink)}
.html-embed{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Microsoft YaHei",system-ui,sans-serif;line-height:1.85;font-size:17px}
.html-embed .page{max-width:760px;margin:0 auto;padding:48px 22px 72px}
.html-embed h1{font-size:2rem;line-height:1.35;margin:0 0 .6rem;color:var(--ink)}
.html-embed h1 span{display:block;font-size:1.05rem;font-weight:400;color:var(--ink-2);margin-top:.7rem;line-height:1.7}
.html-embed h2{font-size:1.4rem;margin:2.6rem 0 .8rem;padding-bottom:.35rem;border-bottom:2px solid var(--accent);color:var(--ink)}
.html-embed h2 .en{font-weight:400;font-size:1rem;color:var(--ink-2);margin-left:.4rem}
.html-embed h3{font-size:1.1rem;margin:1.8rem 0 .5rem;color:var(--ink)}
.html-embed p{margin:.8rem 0}
.html-embed a{color:inherit;text-decoration:underline;text-decoration-color:var(--accent);text-underline-offset:3px;text-decoration-thickness:2px}
.html-embed ul,.html-embed ol{padding-left:1.4rem}
.html-embed li{margin:.45rem 0}
.html-embed .hl{margin:1.2rem 0;padding:.75rem 1rem .8rem;background:var(--q-bg);border-left:3px solid var(--accent);border-radius:0 8px 8px 0}
.html-embed .hl blockquote{margin:.35rem 0 0;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:1rem;line-height:1.65;color:var(--ink)}
.html-embed .pill{display:inline-block;font-size:.95rem;font-weight:700;line-height:1.2;padding:.2rem .65rem;border-radius:999px;background:var(--pill-bg);color:var(--pill-fg);letter-spacing:.02em}
.html-embed .pill.plain{background:var(--pill2-bg);color:var(--pill2-fg)}
.html-embed .types{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:1.2rem 0}
.html-embed .type{background:var(--card);border:1px solid var(--rule);border-radius:10px;padding:.8rem .9rem}
.html-embed .type .name{font-weight:700;font-size:1.05rem;color:var(--ink)}
.html-embed .type .name small{font-weight:400;color:var(--ink-2);margin-left:.3rem}
.html-embed .type p{margin:.35rem 0 0;font-size:.93rem;line-height:1.65;color:var(--ink-2)}
.html-embed .prompt{margin:1.2rem 0;padding:.9rem 1rem;background:var(--card);border:1px solid var(--rule);border-radius:10px}
.html-embed .prompt blockquote{margin:.5rem 0 0;font-family:Georgia,"Times New Roman",serif;font-size:.97rem;line-height:1.65}
.html-embed .note{font-size:.95rem;color:var(--ink-2)}
.html-embed .source{margin-top:3rem;padding-top:1rem;border-top:1px solid var(--rule);font-size:.95rem;color:var(--ink-2)}
@media (max-width:520px){.html-embed{font-size:16px}
.html-embed .page{padding:28px 16px 56px}
.html-embed h1{font-size:1.6rem}}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Blog dark mode is html.dark (data-theme holds the palette name), so map the page's dark palette onto it. */
html.dark .html-embed{
  --ink:#ece7df;
  --ink-2:#c9c2b7;
  --paper:#1b1a18;
  --card:#24221f;
  --rule:#3a3631;
  --accent:#e08a62;
  --pill-bg:#f6d3c2;
  --pill-fg:#2a1208;
  --pill2-bg:#d9d4cb;
  --pill2-fg:#1b1a18;
  --q-bg:#2a2724;
  background:var(--paper);
  color:var(--ink);
}
/* Blog already frames the article; don't double-pad. */
.html-embed .page{max-width:none;margin:0;padding:0}
/* Keep the page's sans headings; the blog's heading font and h2 rule otherwise win. */
.html-embed .page h2,.html-embed .page h3{
  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Microsoft YaHei",system-ui,sans-serif!important;
  color:var(--ink)!important;
}
.html-embed .page h2{border-bottom:2px solid var(--accent)!important;padding-bottom:.35rem!important}
/* Highlight quotes stay italic (page design). Prompt quotes should not pick up the blog's italic. */
.html-embed .prompt blockquote,.html-embed .prompt blockquote p{font-style:normal!important}
</style>

<div class="html-embed not-prose" lang="zh-CN">
<div class="page">
<p class="lead">我把自己在五彩里对《How to be more ambitious》的划线，按高度、深度、广度三种野心重新整理，并写下每一处的理解。</p>
<p>Felix Rieseberg 在 Anthropic 做工程负责人，带过 Claude.ai、Cowork 和 Claude Code Desktop 的工程团队。他在 2026 年 10 月 13 日发了《How to be more ambitious: A tutorial for humans with models》。我之前在《<a href="/posts/truth-source-before-ambitious-agents/">让 agent 有野心地干活之前，先给它一份真人签过名的 truth source</a>》里概括过这篇文章的四种野心；这一次，我按原文顺序把自己的划线重读一遍，并把每一处的理解写下来。</p>
<p>下面带 <span class="pill">划线</span> 标记的英文句子，是我在五彩里划过的原句；没有标记的部分，是我对上下文的转述。</p>
<h2>他为什么写这篇</h2>
<p>作者说，他每天都会听说 Claude 又完成了一件他没想到、不觉得可能、或者自己没好奇心去试的事。就在这个月，Claude 可能帮忙发现了一颗新行星。</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">it’s addicting to watch people reach incredible heights with the products I’ve built.</blockquote></div>
<p>这句话交代了作者的位置：他是做产品的人，看着用户把自己做的东西用到很高的地方，所以会上瘾。但是他也看到另一面。他引用陶哲轩的说法，模型的能力并不是均匀增长的，它们在某些方向上惊人，在另一些方向上仍然不够。一部分人已经驾驭了那些惊人的能力，看起来像在飞；更多人还不知道这对新翅膀能做什么，只会问「法国的首都是哪里」，或者「帮我把这封邮件写得不那么生气」。</p>
<p>因此，作者想把「我们用 AI 还不够有野心」这句口号，拆成一份可以照着做的教程。他把野心分成四种：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">Speed, Altitude, Depth, and Range.</blockquote></div>
<div class="types">
  <div class="type"><div class="name">速度<small>Speed</small></div><p>同样的工作用更少的时间做完。</p></div>
  <div class="type"><div class="name">高度<small>Altitude</small></div><p>往上走一层抽象，盯住结果，而不是单个任务。</p></div>
  <div class="type"><div class="name">深度<small>Depth</small></div><p>像领域里最顶尖的专家那样对待一件事。</p></div>
  <div class="type"><div class="name">广度<small>Range</small></div><p>调动任务表面上用不到的其他领域。</p></div>
</div>
<p>作者认为，速度是 AI 经济价值的基本盘，做法已经成熟，也不太需要创造力，所以他直接略过了这一种。我的划线也都落在后面三种上。</p>
<h2>高度：盯住结果，而不是任务<span class="en">Altitude</span></h2>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">When you give the model a task, it’s executing your best guess at how to get the outcome you want.</blockquote></div>
<p>我理解这句话的意思是，我交给模型的任务里，已经包含了我对「怎么达成结果」的判断，而这个判断未必是最好的路径。如果我只交出任务，模型最多把我的猜测执行好；如果我把结果交出去，模型才有机会找到另一条路。所以，作者让读者先问自己两个问题：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">what do you want to happen next?</blockquote><blockquote lang="en">What’s the goal beyond the goal?</blockquote></div>
<p>作者自己的例子很短。去年年初，他还在让 Claude 一个一个地修崩溃；后来，他直接让 Claude 负责一件更大的事：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">keep our apps crash-free.</blockquote></div>
<h3>季度汇报的三步升级</h3>
<p>为了说明这一招也适用于普通的办公室工作，作者虚构了一家 Acme 公司，让读者为季度业务回顾（QBR）准备一份 deck。他先自嘲说，这件事和发现新行星根本没法比：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">That’s hardly comparable to finding a new planet,</blockquote></div>
<p>然后，他把这件小事一步一步往上推：</p>
<ol>
  <li>多数汇报真正想知道的是，这个季度变了什么、为什么变、接下来该怎么办。因此，作者建议不要只去更新模板里的数字，而是把能拿到的数据尽量都交给模型，让它先理解业务，再回答这三个问题。我在这一步划了两处：<em lang="en">“want to know what changed”</em> 和 <em lang="en">“so it can understand your business:”</em>。</li>
  <li>好的会议应该以决定收尾。作者因此让 Claude 根据它掌握的情况，找出最紧急的三个决策，并为每个可能的方向列出支持和反对的理由。</li>
  <li>季度汇报诞生于一个需要人去筛数据、解读数据的年代。汇报存在的目的，是让管理层尽早发现问题，并把钱和人调到对的地方。于是作者让 Claude 设计一个比季度 deck 更好的机制，用公司自己的历史证明它能更早发现问题，再和现行做法并行跑一个季度。</li>
</ol>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">Design a better way to do that than a quarterly deck</blockquote></div>
<p>我觉得第三步最能说明「目标背后的目标」是什么意思。前两步仍然在做 deck，只是做得更好；第三步则回到 deck 原本要解决的问题，并且允许答案不再是 deck。</p>
<p>作者也说明了这种野心的边界。高度适合真正追求某个最终结果的工作，用在创作上效果较差；如果一件事需要开会讨论，往上走一层通常就值得。他还承认，2026 年对大多数企业来说，直接让 Claude「去赚钱」还行不通。不过，他观察到一个趋势：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">operate at higher levels of abstraction the more capable they become.</blockquote></div>
<h3>往上走之前，先改工作流</h3>
<p>作者认为，高度也是人们找到持久工作流、把人从循环里拿出来的地方，这样人就不用一个任务接一个任务地喂模型。但是，他紧接着说，做好这件事往往要先改自己的工作流。下面这句是我在整篇文章里划得最长的一句：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">make sure it can easily fetch crash reports, understand which app version maps to what git commit, and give it access to Windows, macOS, and Linux computers so it can actually independently reproduce and verify fixes.</blockquote></div>
<p>换句话说，「保持零崩溃」这个目标之所以能交出去，并不是因为作者写了一句更大的提示词，而是因为他先让 Claude 能方便地拉到崩溃报告，能知道哪个版本对应哪个 git commit，还给了它 Windows、macOS 和 Linux 三种机器，让它自己复现问题并验证修复。我读到这里的理解是，目标往上走一层，工具链也必须跟着补上一层。</p>
<h2>深度：像领域顶尖专家那样做<span class="en">Depth</span></h2>
<p>作者在开头给深度下的定义是：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">Considering a task the way a field-leading expert would.</blockquote></div>
<p>他在正文里补充说，深度对应的情况是你只想把一件事做得非常好（<em lang="en">“want a task executed really well”</em>）。这时，你要推动模型使用领域里最好的专业人士（<em lang="en">“by the best professionals in the field”</em>）所用的工具、技巧、媒介和知识，并且一直推下去，直到连那些专业人士也能从结果里学到新东西。这两个短语我都划了线。</p>
<p>作者接着用 Acme 的例子，假设公司正被用户流失困扰，然后列了五个他觉得有用的做法。</p>
<h3>1. 坚持用业内顶尖的工具</h3>
<p>作者发现，模型被要求「像专业人士一样做」时，常常只换了用词，并没有换方法。所以，当 Claude 想用 markdown 表格的时候，他会坚持让它用数据库和统计模型。他还补了一句：你不一定知道专家用什么工具，但是 Claude 通常知道。</p>
<h3>2. 定一个不合理的目标，并告诉模型这很合理</h3>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">You need your website to load in 5s instead of 10s? Ask for 200ms.</blockquote></div>
<p>如果模型觉得某件事做不到，作者会再告诉它，这件事完全可以解决，它只需要继续做下去。</p>
<h3>3. 挑战已知</h3>
<p>作者认为，尤其在商业里，很多我们以为是事实的东西，其实只是对现实的粗略近似。因此，他会把原始信息和数据交给模型，让它</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">adversarially check assumptions</blockquote></div>
<p>他举的例子是：「我们认为流失是 onboarding 的问题，请试着从原始数据里复现这个结论。」</p>
<h3>4. 产出新知识</h3>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">once Claude is already deep inside the data, ask it to find blind spots</blockquote></div>
<p>作者认为，这一步可以直接接在「挑战已知」后面。他的例子是，让 Claude 用日志建一个能复现过去一年的客户模拟，再找出团队还不知道的最早流失信号，并证明这个信号在模型没见过的数据上也能预测。</p>
<h3>5. 用外部裁判</h3>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">Do not ask the model to judge itself.</blockquote></div>
<p>作者预计，随着模型越来越聪明，这个问题终究会被解决；但是在 2026 年 10 月，他恳请读者坚持外部验证。他心目中最好的外部裁判，是一个模型自己就能运行、能立刻拿到反馈的工具。我注意到他给这条建议标了日期，这说明他把它当成当下的做法，而不是永久的原则。</p>
<h3>一段可以直接用的提示词</h3>
<div class="prompt"><span class="pill plain">原文提示词</span>
<blockquote lang="en">I want a deeper version of this task, not a bigger one. Before rewriting it: (1) say what a top professional in this field would do here that I’m not asking for; (2) name the rawest material they would start from instead of what has already been digested for me; (3) name the specific methods and tools they would use; (4) say what, other than you or me, would show the result is right. Then rewrite my prompt to ask for exactly that.</blockquote></div>
<p>这段提示词不在我的划线里，但我在整理要点时把它收了进来。它要求模型先回答四个问题：这个领域的顶尖专家会额外做什么，他们会从哪份最原始的材料开始，他们会用哪些具体的方法和工具，以及除了模型和我之外，还有什么能证明结果是对的；回答完之后，模型再按这些答案重写原来的提示词。我觉得第四问就是上面「外部裁判」那一条的提示词版本。</p>
<h2>广度：把名词换成动词，再组一支队伍<span class="en">Range</span></h2>
<p>作者说，广度就是从不同领域的视角看同一件工作，而且用到的领域比过去经济上划算的要多。他也承认这算不上独特的见解，因为每部劫案电影都会花前 30 分钟凑齐一队各有专长的人。真正变化的地方，在下面这段括号里：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">(with multiple threads, orchestrators, or simply subagents)</blockquote></div>
<p>也就是说，AI 产品让多 agent 系统越来越容易跑起来，所以作者开始请 Claude 引入更多领域，并且看到了很有意思的结果。不过，他也说这一招需要创造力：在看到同事 Alex Albert 用 Blender 渲染室内设计之前，他从没想过用 Claude 为自己的主页做 3D 场景，尽管他以前做过电子游戏。即便如此，他仍然认为广度是他看到最多「魔法」的地方。</p>
<h3>把名词换成动词</h3>
<p>这个技巧出自 Tom Kelley 和 Jonathan Littman 的《The Art of Innovation》。按照这个思路，季度汇报不再是「一份 deck」，而是「在 30 分钟内，让忙碌的人相信一个关于因果的故事，并在不确定中做出决定」。</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">Having the verbs makes it easier for both me and Claude to understand which fields might bring in a unique and useful perspective.</blockquote></div>
<p>我理解这一步的作用是把问题拆开。「做 deck」只会指向做 deck 的人；而「让人相信一个因果故事」会指向讲故事的人，「在不确定中做决定」又会指向懂统计和风险的人。动词一多，能借力的领域也就多了。</p>
<h3>组一支队伍</h3>
<p>作者在这里开了个玩笑：假设这份 deck 必须做得惊艳，否则外星人就会炸掉地球，那么人类会组一支什么样的队伍？他的回答是：</p>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">I’d bring in an analyst, a journalist, and an editor</blockquote></div>
<p>如果这份 deck 还要当场讲，他可能还会加上动效设计师和音频设计师。另外，他认为再配一支对抗式的「红队」会有用，所以又加上了做空者和法务会计。</p>
<h3>别陷入角色扮演</h3>
<div class="hl"><span class="pill">划线</span><blockquote lang="en">Don’t ask the model to write like a short seller, ask it to do what a short seller does to research their position.</blockquote></div>
<p>作者提醒，角色扮演很容易不小心发生，它只会让对话记录变得更怪，却不会改进真正的结果。所以，组队这个方法应该用来找领域和技巧，而不是用来给模型换人设。我理解这里的区分是「换口吻」和「换做法」：让模型像做空者那样写，得到的只是做空者的语气；让模型去做做空者研究仓位时会做的事，得到的才是做空者的方法。这一条和深度里「模型常常只换用词、不换方法」的提醒，说的是同一个问题。</p>
<h2>前提和后记</h2>
<p>后面这部分我没有划线，但是有两点我认为值得记下来。</p>
<p>第一点是前提。作者说，他描述的所有野心，都要求模型有一台能装软件的电脑，并且能通过 MCP 连接器或其他方式访问各种相关数据。他建议读者找一个能做到这一点的工具来用。</p>
<p>第二点是作者在文末解释的原因：人一直被自己「以为可能」的边界限制，而且通常只在很窄的领域里相信自己。他举的例子是米开朗基罗，米开朗基罗起初并不想画西斯廷礼拜堂，因为他认为自己是雕塑家，不是画家。心理学把这种信念叫作自我效能感（self-efficacy）。作者引用 Locke 和 Latham 对 35 年目标设定研究的梳理：拿到具体而困难目标的人，比只被要求「尽力而为」的人表现更好。他还列了几种有记录的办法：</p>
<ul>
  <li><strong>相信它可能。</strong>1939 年，George Dantzig 上统计课迟到，把黑板上的两道题抄回去当作业做完，后来才知道那是统计学里两道未解决的问题。</li>
  <li><strong>看见别人做到。</strong>Roger Bannister 在 1954 年 5 月跑进四分钟一英里，此后 46 天里只有他一个人做到过。作者还提到，Sabastian Sawe 在 2026 年 4 月的伦敦马拉松跑出首个官方认可的两小时以内成绩，同场的亚军也跑进了两小时。</li>
  <li><strong>允许自己失败。</strong>作者提到《The Inner Game of Tennis》的核心观点：拼命用力的时候，人反而打不出最好的网球。他也提醒工程师，Linux 当初发布时，作者说它「只是个爱好，不会像 GNU 那样大而专业」。</li>
</ul>
<p>作者的判断是，自我效能感不是新问题，但是在能力每隔几周就跃升一次的现在，它变得更要紧了。</p>
<h2>我的角度</h2>
<p>我之前就有一个想法：Claude 这类大模型要用得有野心，别只拿来干小活。当时我还没想清楚，「有野心」具体要落到哪些用法上。这次按划线重读，我发现自己的划线大多落在高度和深度两节，而且高度一节里我划得最长的那一句，讲的并不是目标本身，而是前提：崩溃报告、版本与 commit 的对应、三种系统的机器。</p>
<p>深度一节里的「不要让模型评判自己」，正好对应我在《<a href="/posts/truth-source-before-ambitious-agents/">让 agent 有野心地干活之前，先给它一份真人签过名的 truth source</a>》里写的想法：agent 的野心越大，越需要一份真人签过名、在迭代中不轻易变化的 truth source 来当外部裁判。作者希望外部裁判最好是模型自己能运行的工具；在我看来，truth source 加上与它关联的自动化测试，就可以成为这样的工具。agent 可以自己跑它、拿它验证自己的改动，但是不能顺手改掉它。</p>
<p>所以，我现在对这篇文章的理解是：把野心交给模型之前，人要先做两件事。第一件是像作者修崩溃那样，把工具链补齐，让模型能自己拿到数据、复现问题和验证结果；第二件是把「什么算对」交给一个模型之外的裁判。这两件事做好了，我才敢把目标往上提一层、往深挖一层。</p>
<p class="source">原文：Felix Rieseberg，《<a href="https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/">How to be more ambitious: A tutorial for humans with models</a>》，2026 年 10 月 13 日。文中的英文引文均出自原文，中文部分是我的转述和理解。</p>
</div>
</div>
