---
author: "Shumin Fu"
pubDatetime: 2026-10-16T12:08:12+08:00
title: "从 Claude Dispatch 和 Grok Primary Bot 看下一代 agent 设计"
slug: front-desk-agent/zh
featured: false
draft: false
tags:
  - "ai-agents"
  - "workflow"
description: "Claude Dispatch 和 Grok 的 Primary Bot 都在你和其他 agent 之间放了一个负责调度的 agent。这样设计为什么能减轻同时管很多 agent 的负担，还有哪些难题。"
---

<style>
.fd-fig{margin:1.6em 0;overflow-x:auto}
.fd-fig svg{display:block;width:100%;min-width:520px;max-width:660px;height:auto;margin:0 auto;font-family:inherit}
.fd-fig figcaption{font-size:.85em;opacity:.7;text-align:center;margin-top:.5em}
.fd-fig text{fill:var(--foreground);font-size:14px}
.fd-fig .sm{font-size:12px;opacity:.75}
.fd-fig .b{font-weight:700}
.fd-fig .acT{fill:var(--accent);font-weight:700;opacity:1}
.fd-fig .inv{fill:var(--background);font-weight:700}
.fd-fig .bx{fill:var(--muted)}
.fd-fig .ac{fill:var(--muted);stroke:var(--accent);stroke-width:2}
.fd-fig .you{fill:var(--accent)}
.fd-fig .ln{stroke:var(--foreground);stroke-opacity:.35;stroke-width:1.5;fill:none}
.fd-fig .lnA{stroke:var(--accent);stroke-width:2.5;fill:none}
.fd-fig .dash{fill:none;stroke:var(--foreground);stroke-opacity:.3;stroke-dasharray:5 4}
.fd-fig .mA{fill:var(--accent)}
.fd-fig .mL{fill:var(--foreground);fill-opacity:.5}
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed" lang="zh">
<p><strong>结论先说：</strong>agent 的下一次大变化，不是干活的 agent 变得更聪明，而是多了一个更好的<em>前台</em>。你只跟一个 agent 说话，在一段很长的对话里。它把活分给别的 agent，盯着它们每一个，只在你真的需要知道某件事时，才拍拍你的肩膀。</p>
<p>今年有两个产品指向了同一个方向：<strong>Claude Dispatch</strong> 和 <strong>Grok Bot 的 Primary Bot</strong>。它们看起来只是小功能，但我觉得，下一代 agent 大概就是这个样子。</p>
<hr>
<h2>1. 问题：我们不知不觉成了管理者</h2>
<p>一年前，“用 agent”指的是一个聊天窗口、一件事。</p>
<p>现在是五个会话、三个终端、几个云端任务，再加手机上一个 bot。每一个都能不用你管，自己跑上一小时。听起来很好。但总得有人去：</p>
<ul><li>记住哪个会话在做什么，</li><li>发现哪个卡住了，</li><li>回答它的问题，</li><li>看它的结果，</li><li>再决定下一步做什么。</li></ul>
<p>这个人就是你。你没打算带团队，团队却来了，你成了它的经理。</p>
<figure class="fd-fig not-prose"><svg viewBox="0 0 600 270" role="img" aria-label="没有前台时你连着每一个 agent；有前台时只有一条线回到你"><text class="b" x="150" y="20" text-anchor="middle">没有前台</text><line class="ln" x1="150" y1="140" x2="60" y2="75"/><line class="ln" x1="150" y1="140" x2="150" y2="55"/><line class="ln" x1="150" y1="140" x2="240" y2="75"/><line class="ln" x1="150" y1="140" x2="240" y2="205"/><line class="ln" x1="150" y1="140" x2="150" y2="225"/><line class="ln" x1="150" y1="140" x2="60" y2="205"/><rect class="bx" x="34" y="62" width="52" height="26" rx="6"/><text class="sm" x="60" y="79" text-anchor="middle">agent</text><rect class="bx" x="124" y="42" width="52" height="26" rx="6"/><text class="sm" x="150" y="59" text-anchor="middle">agent</text><rect class="bx" x="214" y="62" width="52" height="26" rx="6"/><text class="sm" x="240" y="79" text-anchor="middle">agent</text><rect class="bx" x="214" y="192" width="52" height="26" rx="6"/><text class="sm" x="240" y="209" text-anchor="middle">agent</text><rect class="bx" x="124" y="212" width="52" height="26" rx="6"/><text class="sm" x="150" y="229" text-anchor="middle">agent</text><rect class="bx" x="34" y="192" width="52" height="26" rx="6"/><text class="sm" x="60" y="209" text-anchor="middle">agent</text><circle class="you" cx="150" cy="140" r="24"/><text class="inv" x="150" y="145" text-anchor="middle">你</text><text class="sm" x="150" y="262" text-anchor="middle">你得盯住每一条线</text><line class="dash" x1="300" y1="10" x2="300" y2="250"/><text class="b" x="450" y="20" text-anchor="middle">有一个前台</text><circle class="you" cx="450" cy="62" r="22"/><text class="inv" x="450" y="67" text-anchor="middle">你</text><line class="lnA" x1="450" y1="84" x2="450" y2="112"/><line class="ln" x1="450" y1="148" x2="365" y2="188"/><line class="ln" x1="450" y1="148" x2="399" y2="188"/><line class="ln" x1="450" y1="148" x2="433" y2="188"/><line class="ln" x1="450" y1="148" x2="467" y2="188"/><line class="ln" x1="450" y1="148" x2="501" y2="188"/><line class="ln" x1="450" y1="148" x2="535" y2="188"/><rect class="ac" x="380" y="112" width="140" height="36" rx="8"/><text class="b" x="450" y="135" text-anchor="middle">前台</text><rect class="bx" x="350" y="188" width="30" height="24" rx="5"/><rect class="bx" x="384" y="188" width="30" height="24" rx="5"/><rect class="bx" x="418" y="188" width="30" height="24" rx="5"/><rect class="bx" x="452" y="188" width="30" height="24" rx="5"/><rect class="bx" x="486" y="188" width="30" height="24" rx="5"/><rect class="bx" x="520" y="188" width="30" height="24" rx="5"/><text class="sm" x="450" y="232" text-anchor="middle">agent</text><text class="sm" x="450" y="262" text-anchor="middle">只有一条线回到你</text></svg><figcaption>六个散着的 agent，占你六份注意力；放在一个前台后面，只占一份。</figcaption></figure>
<p>很多人已经有感觉了。Simon Willison 在 Lenny's Podcast（2026 年 4 月）里说，同时跑几个 agent 让他更快，但还没到中午就累垮了。Addy Osmani 写过<a href="https://addyosmani.com/blog/cognitive-parallel-agents/">“并行 agent 的上限”</a>：跑的 agent 多了，<em>你</em>并没有变多。也有人换了个说法：<a href="https://sep.com/blog/where-ai-fatigue-actually-comes-from/">累人的是来回切换</a>，不是做决定。</p>
<p>研究早就说过这件事：</p>
<ul><li><strong>Gloria Mark</strong> 跟踪过办公室职员，发现被打断的工作平均要过约 23 分钟才会被重新拾起，中间常常还插进了两件别的事（<a href="https://news.gallup.com/businessjournal/23146/too-many-interruptions-work.aspx">Gallup 访谈</a>）。具体数字不重要，重要的是量级：<em>几十分钟</em>，不是几秒。</li><li><strong>Sophie Leroy</strong>（2009）提出了<em>注意力残留</em>：切换任务时，一部分心思还留在上一件事上，新的事就做得更差。</li></ul>
<p>所以瓶颈不在算力，在人的脑子。每多一个 agent，脑子里就多压一点重量。</p>
<blockquote><p>想象一个厨房，有十个好厨师，却没有主厨。菜都不错，可在出菜口传菜的那个人累坏了。</p></blockquote>
<hr>
<h2>2. 两个产品，同一个想法</h2>
<h3>Claude Dispatch</h3>
<p><a href="https://claude.com/docs/cowork/guide/dispatch">Dispatch</a> 是 Claude 桌面 app 里一个一直在线的 agent。你和它只有<strong>一段</strong>对话。你说想要什么结果，它把活拆开，每一块开成一个独立的 Cowork 或 Code 会话，做完后把结果放进侧栏。Anthropic 的帮助中心说，这段对话<a href="https://support.claude.com/en/articles/13947068">不会重置</a>，会记得之前做过的事。</p>
<p>文档里有几个细节很关键：</p>
<ul><li><strong>它只派活，不干活。</strong>写代码的交给 Code，知识类工作交给 Cowork。</li><li><strong>子任务不能再生子任务。</strong>整棵树只有一层。</li><li><strong>每个子任务都有明确的状态：</strong>运行中、等你输入、等你回答、已完成、出错、已归档。</li><li><strong>权限请求会转给你</strong>：十分钟内你不回应，请求就被拒绝，任务不带这个权限继续跑。系统不会因为等你而卡住。</li></ul>
<p>Dispatch 的工具更能说明这个设计。它大概只有四个动作：启动任务、给任务发消息、读任务的记录、给用户发消息。它自己不干活，只能<strong>派活、引导、检查、汇报</strong>。</p>
<p>这张很短的工具清单，是整个设计里最有意思的一点。它逼着前台一直只当前台。</p>
<figure class="fd-fig not-prose"><svg viewBox="0 0 600 265" role="img" aria-label="Dispatch 启动子任务、发消息、读记录，只在需要时找你"><defs><marker id="fd2a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mA" d="M0,0L10,5L0,10z"/></marker><marker id="fd2l" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mL" d="M0,0L10,5L0,10z"/></marker></defs><circle class="you" cx="100" cy="40" r="22"/><text class="inv" x="100" y="45" text-anchor="middle">你</text><line class="lnA" x1="100" y1="110" x2="100" y2="66" marker-end="url(#fd2a)"/><text class="sm" x="114" y="92">告诉你：只在需要时</text><line class="ln" x1="180" y1="138" x2="358" y2="77" marker-end="url(#fd2l)"/><line class="ln" x1="180" y1="138" x2="358" y2="122" marker-end="url(#fd2l)"/><line class="ln" x1="180" y1="138" x2="358" y2="167" marker-end="url(#fd2l)"/><line class="ln" x1="180" y1="138" x2="358" y2="212" marker-end="url(#fd2l)"/><rect class="ac" x="20" y="110" width="160" height="56" rx="8"/><text class="b" x="100" y="134" text-anchor="middle">Dispatch</text><text class="sm" x="100" y="154" text-anchor="middle">一段长对话</text><text class="sm" x="262" y="52" text-anchor="middle">启动 · 发消息 · 读记录</text><rect class="bx" x="360" y="60" width="220" height="34" rx="6"/><text x="372" y="82">Code</text><text class="sm" x="568" y="82" text-anchor="end">运行中</text><rect class="bx" x="360" y="105" width="220" height="34" rx="6"/><text x="372" y="127">Cowork</text><text class="sm acT" x="568" y="127" text-anchor="end">等你输入</text><rect class="bx" x="360" y="150" width="220" height="34" rx="6"/><text x="372" y="172">Code</text><text class="sm" x="568" y="172" text-anchor="end">已完成</text><rect class="bx" x="360" y="195" width="220" height="34" rx="6"/><text x="372" y="217">Cowork</text><text class="sm" x="568" y="217" text-anchor="end">出错</text><text class="sm" x="300" y="255" text-anchor="middle">子任务不能再开子任务：树只有一层</text></svg><figcaption>前台只有四个动作：启动、发消息、读记录、告诉你。它自己从不干活。</figcaption></figure>
<h3>Grok Bot 的 Primary Bot</h3>
<p>Grok Bot（xAI 出品，现在属于 SpaceXAI）在 2026 年 10 月初加了一个<strong>主 Bot</strong>。0.67.0 版的更新日志说，被标星的主 Bot 会主动找出能替你分担的事，并提出由它来做。<a href="https://www.progressiverobot.com/2026/10/02/primary-bot-grok-4-7-base-model-proactive-grok-bot/">发布报道</a>说它是一个坐在其他 Bot 上面的主助手，把任务分给合适的 Bot，并且“需要你帮忙时才来找你”。Bot 还能开一个 <em>Project</em>：一个会自己规划、自己调度 agent 的云端 agent。</p>
<p>报道里有个例子：航班改签后，Bot 发现 Uber 的接机还对着旧航班，没等人问就提了出来。</p>
<h3>同一个形状</h3>
<table><thead><tr><th></th><th>Claude Dispatch</th><th>Grok Primary Bot</th></tr></thead><tbody><tr><td>唯一入口</td><td>一段一直在的 Dispatch 对话</td><td>一个标星的主 Bot</td></tr><tr><td>把活交给</td><td>Cowork / Code 会话</td><td>你的其他 Bot、Project</td></tr><tr><td>自己干活吗？</td><td>不干，只调度</td><td>主要是分派</td></tr><tr><td>什么时候找你</td><td>任务完成、有问题、要权限</td><td>需要帮忙，或发现可以替你做的事</td></tr><tr><td>记忆</td><td>长对话保留上下文</td><td>知道其他 Bot 在做什么</td></tr></tbody></table>
<p>两家公司各自走到了同一个设计上。这说明它解决的是一个真问题。</p>
<hr>
<h2>3. 里面的三个设计想法</h2>
<p>我看到的是三个叠在一起的想法。</p>
<h3>想法一：只有一扇门</h3>
<p>你不该需要知道哪个 agent 负责什么。告诉前台就行，前台会把你领到对的房间。</p>
<p>这是经典的<strong>编排者–执行者</strong>模式。Anthropic 自己的<a href="https://www.anthropic.com/engineering/multi-agent-research-system">多 agent 研究系统</a>就是这么做的：一个主 agent 做计划，开出多个子 agent 并行搜索，再把结果汇总。在 Anthropic 内部的研究评测里，Opus 当主 agent、Sonnet 当执行者的组合，比单个 Opus agent 高出 90.2%。</p>
<p>但 Dispatch 和 Primary Bot 把这个模式往上提了一层。编排者不再藏在某个任务里面，<strong>它成了产品的大门。</strong>用户跟编排者说话，不跟执行者说话。</p>
<h3>想法二：默认安静</h3>
<p>好的前台不会每来一个快递就打电话给你。只有快递是你的、很急、或者坏了，它才找你。</p>
<p>所以第二个想法是一道过滤：<strong>只告诉用户该知道的事。</strong>在 Dispatch 里，这是一个单独的工具（给用户发消息），找你是一个刻意的动作，不是干活时顺带发生的。在 Primary Bot 里，它“需要你帮忙时才来找你”。</p>
<figure class="fd-fig not-prose"><svg viewBox="0 0 600 225" role="img" aria-label="很多事件进入过滤，只有一件到你这里"><defs><marker id="fd3a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mA" d="M0,0L10,5L0,10z"/></marker><marker id="fd3l" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mL" d="M0,0L10,5L0,10z"/></marker></defs><text class="sm" x="20" y="34">进度 40%</text><line class="ln" x1="165" y1="30" x2="238" y2="60"/><text class="sm" x="20" y="60">第 2 次重试</text><line class="ln" x1="165" y1="56" x2="238" y2="60"/><text class="sm" x="20" y="86">任务 1 完成</text><line class="ln" x1="165" y1="82" x2="238" y2="82"/><text class="sm" x="20" y="112">新日志</text><line class="ln" x1="165" y1="108" x2="238" y2="108"/><text class="sm acT" x="20" y="138">任务 4：付 ¥320？</text><line class="lnA" x1="165" y1="134" x2="238" y2="134"/><text class="sm" x="20" y="164">任务 2 完成</text><line class="ln" x1="165" y1="160" x2="238" y2="160"/><text class="sm" x="20" y="190">警告：变慢</text><line class="ln" x1="165" y1="186" x2="238" y2="160"/><polygon class="ac" points="240,20 380,88 380,132 240,200"/><text class="acT" x="300" y="115" text-anchor="middle">过滤</text><text class="sm" x="310" y="218" text-anchor="middle">只在等一等更亏时才打断</text><line class="lnA" x1="380" y1="110" x2="448" y2="110" marker-end="url(#fd3a)"/><rect class="ac" x="452" y="84" width="140" height="52" rx="10"/><text class="b" x="522" y="106" text-anchor="middle">付 ¥320？</text><text class="sm" x="522" y="125" text-anchor="middle">需要你点头</text></svg><figcaption>发生了七件事，只有一件要你来定。</figcaption></figure>
<p>这也是老研究了。1999 年，微软研究院的 Eric Horvitz 等人写了<a href="https://arxiv.org/abs/1301.6707"><em>Attention-Sensitive Alerting</em></a>。一句话概括：打断别人之前，先比一比<strong>现在打断的代价</strong>和<strong>等一等的代价</strong>。只有等一等更亏时才打断。他们后来的文章把注意力称为“稀缺的商品、关键的货币”（<a href="https://erichorvitz.com/cacm-attention.htm">CACM 2003</a>）。</p>
<p>更早，1995 年，施乐 PARC 的 Mark Weiser 和 John Seely Brown 写了<a href="https://calmtech.com/papers/designing-calm-technology"><em>平静技术</em></a>：技术应该“告诉你信息，但不要求你盯着它”。东西平时待在<em>边缘</em>，就像开车时的发动机声，出了问题才移到<em>中心</em>。</p>
<p>前台 agent 就是 agent 工作里的平静技术。执行者在后台嗡嗡地干活，有事时，前台只把那一件事端到你面前。</p>
<h3>想法三：让长对话记着，而不是你的脑子</h3>
<p>这是我最在意的一点。</p>
<p>用很多 agent，真正的代价不是在窗口之间点来点去，而是<strong>得把整张地图装在脑子里</strong>：什么在跑、什么卡住了、定过什么、下一步是什么。这张地图很重。</p>
<p>前台的长对话就是放这张地图的地方。它记得你上周问过什么，知道哪个子任务卡住了，你问“X 进行到哪了？”它能直接回答，你不用打开五个标签页。你不用再当整个系统的记忆。</p>
<blockquote><p>就像一个带着笔记本的好助理。你不用记住每一场会，问他就行。你的脑子留给真正要做的决定。</p></blockquote>
<p>所以“一段长对话”不是个小细节。每次都重置的 Dispatch 对话，只是一个启动器；<em>记得住</em>的对话，才是搭档。</p>
<p>LangChain 的 Harrison Chase 推过一个相关的想法，叫<a href="https://www.langchain.com/blog/introducing-ambient-agents"><em>环境 agent</em>（ambient agents）</a>：agent 跟着事件流运行，只在有重要的事时才找你，好“把注意力留给最要紧的时候”。前台正适合安放这些 agent：它们的问题都汇到一个地方，而且已经排好了序。</p>
<hr>
<h2>4. 为什么我觉得这是以后的样子</h2>
<ol><li><strong>瓶颈换了地方。</strong>模型已经便宜、快到可以同时跑很多个，现在稀缺的是人的注意力。谁花用户的注意力更少，谁就赢。</li><li><strong>它能变大，你不用跟着变大。</strong>一个前台下面挂十个执行者，占你的注意力和只有一个前台差不多；十个散着的会话，就占你十份。</li><li><strong>它符合人本来就怎么分派工作。</strong>没人靠参加每一个会来管公司。他们有幕僚长、一个统一的收件箱、每周的汇总。</li><li><strong>它能跨设备。</strong>Dispatch 可以在手机上发起，在电脑上跑。一段对话好带着走，十个会话不行。</li><li><strong>角色分开，每部分都更简单。</strong>执行者可以很专、用完就扔；前台可以谨慎、慢、长期在线。各做好一件事。</li></ol>
<hr>
<h2>5. 难的地方（还没解决）</h2>
<p>想法很简单，做好却不简单。</p>
<ul><li><strong>过滤两头都可能错。</strong>太吵，你又回到通知地狱；太安静，一个坏掉的任务放着几个小时，你还以为一切正常。<em>假安静</em>比噪音更糟，因为你根本不知道它发生了。</li><li><strong>信任需要一扇窗。</strong>前台说“做完了”，你得有便宜的办法去核对。Dispatch 让每个子任务的记录都在一次点击之内。这应该是规矩，而不是加分项。汇报只是说法，不是证据。</li><li><strong>长对话会越来越长。</strong>一段活上好几周的对话，迟早超出任何上下文窗口。它需要好的摘要、一个记忆库，还要能安全地忘掉东西。这主要是工程问题，但它决定了“搭档”的感觉能不能撑过第二个月。</li><li><strong>等不等人，是一个设计选择。</strong>Dispatch 十分钟后拒绝权限请求，继续往下跑。这个立场很清楚：<em>用户不说话，不算阻塞。</em>别的产品会选别的立场，但每一种都应该让用户看得见。</li><li><strong>主动可能变成强推。</strong>Primary Bot“不用你开口”就主动揽活，很强大，也意味着由 agent 来决定什么值得你注意。据说 Grok 的建议不收费，这就少了一道限制它多提建议的刹车。Horvitz 那条规则，只在等一等更亏时才打断，还是得有个地方来执行。</li><li><strong>一扇门也是一个单点故障。</strong>前台理解错了你，每个执行者都会跟着错。好的前台会在分派之前，先确认一遍任务。</li><li><strong>层数限制很重要。</strong>Dispatch 只让树有一层。现阶段这大概是明智的：agent 管 agent、层层往下的深树，很难看清，也很难叫停。</li></ul>
<hr>
<h2>6. 做一个前台 agent 的小清单</h2>
<p>如果你要做一个，下面是我会从这两个产品里抄的东西：</p>
<ol><li><strong>只给前台调度用的工具。</strong>启动、发消息、读记录、汇报。它要是能自己干活，就一定会自己干，然后就不再是前台了。</li><li><strong>把“告诉用户”做成一个单独、刻意的工具。</strong>不是每一步都说，也不是每做完一件都说，只说用户该知道的。</li><li><strong>每个子任务都要有看得见的状态。</strong>运行中、等你、完成、失败。用户一眼就能看到全局，不用开口问。</li><li><strong>记录要在一次点击之内。</strong>摘要为了快，原始日志为了信得过。</li><li><strong>永远不要无限期地等人。</strong>定一个超时和一个默认做法，并且说清楚是什么。</li><li><strong>先让长对话记得住，再压缩。</strong>记忆就是产品本身，要为第二个月做打算。</li><li><strong>树要浅</strong>，直到你有好工具能看清深的那种。</li></ol>
<hr>
<h2>7. 再往前一步：你的 agent 和对方的 agent 对话</h2>
<p>到这里，前台都站在你这一边，把活分给<em>你的</em>执行者。现在把这个想法再往前推一步。</p>
<p>你想办的很多事，其实是由某家公司来办的：把宽带迁到新家、改签航班、弄清一张错账单。今天你得通过这家公司的 App 来办：它的页面、它的表单、它的菜单。就算有 agent，agent 也得像人一样，一页一页点过去。</p>
<p>下一步是：公司那边也有一个前台。你的 agent 把你想要的告诉对方的 agent。对方的 agent 在公司内部把活全做完，查覆盖、约时间、改账单、找它自己的内部 agent，然后回来汇报。交接一次，代替点五十下。</p>
<figure class="fd-fig not-prose"><svg viewBox="0 0 640 275" role="img" aria-label="你的 agent 把目标交给企业的 agent，后者调动内部 agent 并回传方案"><defs><marker id="fd4a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mA" d="M0,0L10,5L0,10z"/></marker><marker id="fd4l" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mL" d="M0,0L10,5L0,10z"/></marker></defs><text class="sm" x="95" y="22" text-anchor="middle">你这边</text><rect class="dash" x="10" y="30" width="170" height="200" rx="12"/><text class="sm" x="505" y="22" text-anchor="middle">企业那边</text><rect class="dash" x="380" y="30" width="250" height="200" rx="12"/><rect class="ac" x="30" y="50" width="130" height="42" rx="8"/><text class="b" x="95" y="76" text-anchor="middle">你的 agent</text><circle class="you" cx="95" cy="180" r="22"/><text class="inv" x="95" y="185" text-anchor="middle">你</text><line class="lnA" x1="95" y1="156" x2="95" y2="96" marker-end="url(#fd4a)"/><text class="sm" x="95" y="220" text-anchor="middle">“20 号 9–12 点？”</text><rect class="ac" x="440" y="50" width="130" height="42" rx="8"/><text class="b" x="505" y="76" text-anchor="middle">对方的 agent</text><line class="lnA" x1="162" y1="62" x2="436" y2="62" marker-end="url(#fd4a)"/><text class="sm" x="300" y="52" text-anchor="middle">目标 + 你的限制</text><line class="ln" x1="438" y1="82" x2="166" y2="82" marker-end="url(#fd4l)"/><text class="sm" x="300" y="100" text-anchor="middle">方案 · 收据</text><text class="acT" x="280" y="135" text-anchor="middle">新的接口</text><line class="ln" x1="505" y1="92" x2="428" y2="160"/><rect class="bx" x="392" y="160" width="72" height="34" rx="6"/><text class="sm" x="428" y="182" text-anchor="middle">覆盖</text><line class="ln" x1="505" y1="92" x2="505" y2="160"/><rect class="bx" x="469" y="160" width="72" height="34" rx="6"/><text class="sm" x="505" y="182" text-anchor="middle">排期</text><line class="ln" x1="505" y1="92" x2="582" y2="160"/><rect class="bx" x="546" y="160" width="72" height="34" rx="6"/><text class="sm" x="582" y="182" text-anchor="middle">账单</text><text class="sm" x="505" y="216" text-anchor="middle">内部 agent</text><text class="sm" x="320" y="262" text-anchor="middle">你的 agent 守着你的注意力；对方的 agent 调动整家公司</text></svg><figcaption>agent 即服务：两个前台之间交接一次，代替在 App 里点五十下。</figcaption></figure>
<p>举个小例子。你说：“20 号把宽带迁到新地址。”你的 agent 知道新地址、日期和你的日程；运营商的 agent 知道覆盖范围、空闲时段和价格。它们俩商量好，你只收到一句：“20 号上午 9–12 点师傅上门，价格不变。可以吗？”</p>
<p>我把这叫作<strong>agent 即服务</strong>（agent as a service）。公司卖的是一个结果，接口是两个 agent 之间的一段对话。</p>
<table><thead><tr><th>接口</th><th>另一头是谁</th><th>你发过去的是什么</th></tr></thead><tbody><tr><td>App / 网站</td><td>一个在点击的人</td><td>点击和表单</td></tr><tr><td>API</td><td>一段程序</td><td>精确的字段、固定的调用</td></tr><tr><td>agent 即服务</td><td>一个 agent</td><td>一个目标，加上你的限制</td></tr></tbody></table>
<h3>零件已经在造了</h3>
<ul><li><strong>agent 和 agent 对话。</strong>A2A（Agent2Agent）是一个开放协议，让不同厂商的 agent 能互相对话。每个 agent 公开一张“Agent Card”：它能做什么、怎么联系它。它由 Google 发起，现在归 Linux 基金会管；基金会在一周年时（2026 年 4 月）说，已有 150 多家组织支持。</li><li><strong>agent 付钱。</strong>agent 商务协议让 agent 能替你买东西。ACP（OpenAI 和 Stripe 推出）负责在聊天里结账。AP2（Google 推出）把你的同意变成签了名的“授权书”：你想要什么、购物车里有什么、要扣多少钱，这样商家能核实确实是一个人点了头。</li></ul>
<p>也得说清楚现状：目前 A2A 在生产环境里的用法，大多还在公司<em>内部</em>。一家公司的 agent 和客户的 agent 跨公司协作，还处在早期。</p>
<h3>同一个前台，出现两次</h3>
<p>这是把前台的想法用在两边。你的前台守着你的注意力，对方的前台守着它的系统。两者之间的交接，就是你的意图变成对方工作的地方。</p>
<p>这会改变公司比拼的东西：</p>
<ul><li><strong>产品不再是 App，而是 agent。</strong>App 可能缩成一张收据加一个“同意”按钮。</li><li><strong>比较变得很便宜。</strong>你的 agent 可以同时问三家的 agent，再比较答案。靠熟悉的界面留住用户，效果会变弱。</li><li><strong>好打交道，就是品牌。</strong>对方的 agent 有多懂你，说到的能不能做到。</li></ul>
<h3>难在哪里</h3>
<ul><li><strong>谁代表谁。</strong>你的 agent 得证明它是替你办事，而且只在你给的范围内。AP2 的授权书想在支付上解决这件事；其他大多数操作，还没有这样的证明。</li><li><strong>两个 agent，各为其主。</strong>对方的 agent 替公司做事。加价推销和各种暗坑，会从页面上搬进对话里。你的 agent 得是个难缠的谈判者，而不是个客气人。</li><li><strong>是谁理解错了？</strong>结果不对时，需要一份双方共有的交接记录。记录就成了合同，也就是“记录要在一次点击之内”这条规矩，只是现在跨了公司。</li><li><strong>对方的回复，就是你的 agent 的输入。</strong>别家 agent 发来的消息里可能夹带指令，提示词注入从此可以跨公司发生。你的 agent 应该把它当数据，而不是命令。</li><li><strong>有些步骤还是得你来。</strong>钱、合同、个人信息。Horvitz 那条规则依然成立：只在等一等更亏时才打断，而付错一笔钱，永远是等一等更亏。</li></ul>
<hr>
<h2>结尾</h2>
<p>我们花了两年，让 agent 更会<em>干活</em>。下一步，是让它们更会<em>不打扰我们</em>，并且替我们记住全局，让我们不用自己记。</p>
<p>以后的 agent，不是你要守着的十个窗口，而是一段对话：它管着整个屋子，平时安安静静，只在要紧时拍拍你的肩膀。</p>
<p>而这扇门也许很快会变成双向的：你的前台把目标交给一家公司的前台，整家公司在它后面干活。</p>
<p>一句话：一扇门进来，门后很多执行者，你脑子里要装的东西更少。</p>
<hr>
<h3>参考资料</h3>
<ul><li>Claude docs — <a href="https://claude.com/docs/cowork/guide/dispatch">Run tasks in the background with Dispatch</a></li><li>Claude Help Center — <a href="https://support.claude.com/en/articles/13947068">Assign tasks to Claude from anywhere in Cowork</a></li><li>xAI — <a href="https://x.ai/changelog/bot">Grok Bot changelog</a> (v0.67.0, 2 Oct 2026)</li><li>Progressive Robot — <a href="https://www.progressiverobot.com/2026/10/02/primary-bot-grok-4-7-base-model-proactive-grok-bot/">Primary Bot: Quick, Smart and Proactive, Now on Grok 4.7</a></li><li>TestingCatalog — <a href="https://x.com/testingcatalog/status/2105619522514190357">post on Primary bot</a></li><li>Anthropic Engineering — <a href="https://www.anthropic.com/engineering/multi-agent-research-system">How we built our multi-agent research system</a></li><li>Horvitz, Jacobs, Hovel — <a href="https://arxiv.org/abs/1301.6707">Attention-Sensitive Alerting (UAI 1999)</a></li><li>Horvitz et al. — <a href="https://erichorvitz.com/cacm-attention.htm">Models of Attention in Computing and Communication (CACM 2003)</a></li><li>Weiser &amp; Brown — <a href="https://calmtech.com/papers/designing-calm-technology">Designing Calm Technology (1995)</a></li><li>Gallup — <a href="https://news.gallup.com/businessjournal/23146/too-many-interruptions-work.aspx">Too Many Interruptions at Work? (Gloria Mark interview)</a></li><li>Leroy, S. (2009). <em>Why Is It So Hard to Do My Work? The Challenge of Attention Residue When Switching Between Work Tasks.</em> Organizational Behavior and Human Decision Processes.</li><li>Addy Osmani — <a href="https://addyosmani.com/blog/cognitive-parallel-agents/">Your parallel agent limit</a></li><li>SEP — <a href="https://sep.com/blog/where-ai-fatigue-actually-comes-from/">Where AI fatigue actually comes from</a></li><li>LangChain — <a href="https://www.langchain.com/blog/introducing-ambient-agents">Introducing ambient agents</a></li><li>A2A Protocol — <a href="https://a2a-protocol.org/">Agent2Agent protocol</a></li><li>Linux Foundation — <a href="https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year">A2A Protocol surpasses 150 organizations (April 2026)</a></li><li><a href="https://ap2-protocol.org/">AP2 — Agent Payments Protocol</a></li><li><a href="https://www.agenticcommerce.dev/">ACP — Agentic Commerce Protocol</a></li></ul>
</div>
