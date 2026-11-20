---
title: "Claude Code 忙的时候，你发的消息什么时候被读到"
description: "从桌面 App 日志和会话记录看，排队消息只会在工具结果返回时交给模型。"
growth: seedling
planted: 2026-10-16T16:05:46+08:00
lastTended: 2026-10-16T16:46:46+08:00
tags:
  - "claude-code"
  - "ai-agents"
draft: false
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .note,.html-embed blockquote{border-left:2px solid var(--accent);padding-left:.8em;color:var(--foreground);opacity:1}
.html-embed .note code,.html-embed blockquote code{color:var(--foreground);background:color-mix(in srgb,var(--foreground) 10%,transparent);padding:0 .25em;border-radius:3px}
.html-embed td.num,.html-embed th.num{text-align:right;font-variant-numeric:tabular-nums}
.html-embed .illus{margin:1.5em 0}
.html-embed .illus img{width:100%;height:auto;border-radius:8px}
.html-embed .illus figcaption{font-size:.9em;color:var(--foreground);opacity:.85;text-align:center;margin-top:.4em}
</style>

<div class="html-embed" lang="zh">
<p class="subtitle">从桌面 App 日志和会话记录看，排队消息只会在工具结果返回时交给模型。</p>
<p>用 Claude Code 桌面 App 时，Claude 正在干活，我又发了一条消息，界面上会显示「Send now」。之后 Claude 隔一会儿才回应这条消息，看起来像是它自己挑了个时机。我翻了本机的 App 日志和会话记录，结论是：消息不会丢，但它只能在工具调用的边界插进去，中间要过两道关。</p>
<h2>第一道关：App 先扣着</h2>
<p>如果 Claude 正在思考或输出文字，App 会把消息标成 <code>priority=next</code> 扣下，这时界面显示「Send now」。等 Claude 发起下一个工具调用，App 才放行。日志在 <code>~/Library/Logs/Claude/main.log</code>：</p>
<pre><code>03:51:04 LocalSessions.sendMessage: ... messageLength=4, imageCount=0, toolStates=0, attachmentCount=0, priority=next
03:51:07 [LocalSessionManager] flushed held steers (1 steer(s)) for local_&lt;id&gt;</code></pre>
<p><code>messageLength=4</code> 对应的是「你自己做」四个字。App 内部把这种消息叫 steer，扣了 3 秒后放行。如果发消息时已经有工具在跑，App 不扣，日志里也没有 flush 这一行，消息直接进队列。</p>
<figure class="illus"><img src="/images/posts/claude-code-queued-messages/fig-01.webp" alt="用户猛按 SEND NOW 按钮，机器人正在执行工具调用" loading="lazy" width="1200" srcset="/images/posts/claude-code-queued-messages/fig-01-800.webp 800w, /images/posts/claude-code-queued-messages/fig-01.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" height="675" decoding="async" data-avif="no"><figcaption>Claude 写字或思考时，消息先被 App 扣着，等它发起下一个工具调用才放行。</figcaption></figure>
<h2>第二道关：等当前工具跑完</h2>
<p>放行后消息进入队列，但还要等正在跑的工具返回，才跟在工具结果后面交给模型。会话记录在 <code>~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl</code>，每行一条 JSON，时间为 UTC：</p>
<pre><code>07:51:05.819Z assistant  [thinking]
07:51:07.591Z assistant  [tool_use mcp__claude-in-chrome__javascript_tool id=…dsi8UjU4]
07:51:07.596Z queue-operation {"operation":"enqueue","content":"你自己做"}
07:51:20.538Z user       [tool_result tool_use_id=…dsi8UjU4]
              attachment {"type":"queued_command","prompt":"你自己做","commandMode":"prompt",
                          "origin":{"kind":"human"},"humanTurn":true}
07:51:20.549Z queue-operation {"operation":"remove","content":"你自己做","reason":"absorbed_mid_turn"}
07:51:26.070Z assistant  [text "开发者工具的面板我操作不了…我改用自己的办法…"]</code></pre>
<ul>
<li>入队时间比 <code>tool_use</code> 晚 5 毫秒，说明 Claude 一发起工具调用，App 就放行了。</li>
<li>浏览器工具跑了 13 秒，消息跟着工具结果一起进入对话。</li>
<li><code>absorbed_mid_turn</code> 表示这条消息在本轮中途被吸收，没有另开一轮。Claude 下一句话就回应了它。</li>
</ul>
<figure class="illus"><img src="/images/posts/claude-code-queued-messages/fig-02.webp" alt="便利贴形式的排队消息被贴到 tool_result 箱子上，传送带末端的机器人读取" loading="lazy" width="1200" srcset="/images/posts/claude-code-queued-messages/fig-02-800.webp 800w, /images/posts/claude-code-queued-messages/fig-02.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" height="675" decoding="async" data-avif="no"><figcaption>排队消息贴在工具结果上一起送进对话。</figcaption></figure>
<h2>模型实际收到什么</h2>
<p>中途插入的消息不会成为一条独立的 user 消息，而是塞进装着工具结果的那条 user 消息里，大致是：</p>
<pre><code>{role: "assistant", content: [thinking, tool_use(id=dsi8UjU4)]}
{role: "user", content: [
  tool_result(tool_use_id=dsi8UjU4, …),
  text("&lt;system-reminder&gt;The user sent a new message while you were working: 你自己做 …
        Address the message above as you continue this turn.&lt;/system-reminder&gt;")
]}</code></pre>
<p class="note">会话文件里只存了 <code>queued_command</code> 附件。外层 system-reminder 的措辞是我在记录里看到的，没有在 Claude Code 程序本身里找到原文确认，具体写法以实际版本为准。</p>
<h2>这一轮没有工具调用了怎么办</h2>
<p>如果 Claude 正在写最终回复，后面不再调用工具，消息就一直等到这一轮结束，再作为一条普通 user 消息开启新一轮：</p>
<pre><code>07:53:15.843Z hook_success Stop
07:53:52.918Z queue-operation enqueue "可以继续查原因"
07:53:52.924Z queue-operation dequeue
07:53:52.935Z user "可以继续查原因"</code></pre>
<p>这里的 dequeue 没有 reason 字段，和中途吸收的 <code>absorbed_mid_turn</code> 区分开。「它自己找时机才读」的感觉，多半来自这种情况。</p>
<h2>第三种时机：按停止或 API 报错</h2>
<p>除了「工具结果返回后中途插入」和「这一轮正常结束后再发」，还有一种：这一轮被提前打断。我按停止（会话里记为 <code>[Request interrupted by user]</code>）时，或者这一轮因为 API 报错死掉时，排队的消息会马上作为新一轮发出去，不用等 Claude 把话说完。</p>
<pre><code>02:52:27 assistant [text "没有——而且"没有"本身就是最重要的诊断信息…"]
02:52:27 user      "[Request interrupted by user]"
02:52:34 queue-operation enqueue / dequeue
02:52:34 user      "[DEBUG] nodeJS - [AMQP] connected…"     ← 排队的消息作为新一轮发出</code></pre>
<h3>按「交付前一条记录」分类</h3>
<p>我把所有排队后送达的消息（去重后）按交付前紧挨着的那条记录分了类。中途插入一共 911 次，全部紧跟在工具结果后面：</p>
<ul>
<li>901 次是普通工具结果。</li>
<li>6 次是被 auto mode 拒绝的工具调用。拒绝也会返回一个工具结果，消息照样跟着插进去。</li>
<li>3 次是加载技能（Skill）。加载技能本身也是一次工具调用，先返回结果，再附上技能正文，然后才是我的消息。</li>
</ul>
<pre><code>21:27:33 assistant [tool_use Bash]
21:27:44 user      [tool_result "Permission for this action was denied by the Claude Code auto mode classifier…"]
         attachment {"type":"queued_command","prompt":"新的 1.3.192，目前是1.3.178"}</code></pre>
<p>作为新一轮发出的情况里，绝大多数是这一轮正常结束（Stop hook 之后）；另有 46 次是按了停止，10 次是 API 报错。子代理返回结果、各类 hook（PreToolUse、PostToolUse、UserPromptSubmit）、退出 plan mode、上下文压缩这些时刻，都没有看到消息插进去。</p>
<p class="note">这些数字只来自本地会话记录，没有对照 Claude Code 的文档或程序代码核实。作为新一轮发出的消息里也混有自动化任务发来的消息，少数小类（比如十几次排在工具结果之后的）只是推测。</p>
<h2>统计：全部本地会话</h2>
<p>同一个队列还会装后台任务通知（<code>&lt;task-notification&gt;</code>）和系统提醒，统计时已排除。</p>
<table>
<thead><tr><th>指标</th><th class="num">数量</th></tr></thead>
<tbody>
<tr><td>中途吸收（absorbed_mid_turn）</td><td class="num">约 4191</td></tr>
<tr><td>其中紧跟在 tool_result 之后</td><td class="num">约 3157</td></tr>
<tr><td>轮次结束后才取出</td><td class="num">约 830</td></tr>
<tr><td>延迟中位数</td><td class="num">约 5 秒</td></tr>
</tbody></table>
<h2>几个例子</h2>
<p>时间为美东时间，2026-10-16。</p>
<table>
<thead><tr><th>消息</th><th>发出</th><th>放行</th><th>被读到</th><th>当时在跑的</th></tr></thead>
<tbody>
<tr><td>「你自己做」</td><td>03:51:04</td><td>03:51:07</td><td>03:51:20</td><td>浏览器 JS 工具</td></tr>
<tr><td>「保留日志」</td><td>03:49:59</td><td>03:50:10</td><td>03:50:20</td><td>写文字时扣了 11 秒，调用子代理时放行</td></tr>
<tr><td>短 Bash 期间的消息</td><td colspan="3">延迟约 0–2 秒</td><td>短 Bash</td></tr>
<tr><td>长 Bash 期间的消息</td><td colspan="3">延迟约 82 秒</td><td>跑了 82 秒的 Bash</td></tr>
<tr><td>并行工具期间的消息</td><td colspan="3">延迟约 75 秒</td><td>两个工具并行</td></tr>
<tr><td>另一个长 Bash</td><td colspan="3">延迟约 46 秒</td><td>跑了 46 秒的 Bash</td></tr>
</tbody></table>
<p>延迟等于两段相加：Claude 隔多久发起下一个工具调用，加上那个工具跑多久。碰上长命令或子代理，就会拖到几十秒甚至几分钟。</p>
<h2>有没有被忽略的消息</h2>
<figure class="illus"><img src="/images/posts/claude-code-queued-messages/fig-03.webp" alt="灰色幽灵对话气泡拍着忙碌机器人的肩膀问 am I real yet?" loading="lazy" width="1200" srcset="/images/posts/claude-code-queued-messages/fig-03-800.webp 800w, /images/posts/claude-code-queued-messages/fig-03.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" height="675" decoding="async" data-avif="no"><figcaption>发出去的消息，真的被读到了吗？</figcaption></figure>
<p>上面说消息会被送到，那有没有发出去却没被读到、或者读到了却没被理会的？我把四种可能都查了一遍。统计按「同一时间戳 + 同样内容」去重，因为会话分叉时一条消息会被复制进多个会话文件（上面的统计没有去重，所以数字更大）。去重后，人发出的入队一共 6747 条。</p>
<h3>1. 入队了，但记录里找不到送达</h3>
<p>出队记录只有三种：<code>dequeue</code>（13615 条）、<code>remove</code> + <code>absorbed_mid_turn</code>（1017 条）、早期版本里不带 reason 的 <code>remove</code>（135 条，抽查都送达了）。没有 cancelled、cleared、interrupted 这类原因。</p>
<p>第一遍有 175 条入队找不到对应的送达，核对后几乎都不是问题：大多数是斜杠命令（<code>/goal</code>、<code>/clear</code> 这类），送达时会被展开成别的格式，按原文匹配不上；其余是分叉出来的副本，原消息在另一个会话文件里正常送达。</p>
<p>剩下 5 条可疑，都是在本轮中途被 <code>dequeue</code> 取出，之后记录里既没有 user 消息，也没有 <code>queued_command</code> 附件：</p>
<ul>
<li>2 条是我自己撤回改错字：「都是些深二模」被取出，5 秒后改成「都是些什么」，以 <code>absorbed_mid_turn</code> 送达；「合的都是我的妈」也一样，改成「合的都是我的吗」后送达。</li>
<li>另外 3 条可能被忽略了：「如何兼容修复比较好?」「拉代码」「可以考虑部署最新的代码」。这几段文字在所有会话文件里只出现过一次，就是入队那一行。Claude 后面的回复没有回应前两条；第三条它接着去构建镜像，可能本来就在做，碰巧对上了。</li>
</ul>
<pre><code>11:56:37.557Z queue-operation enqueue "拉代码"
11:56:40.437Z queue-operation dequeue
11:56:42.244Z user [tool_result …]        ← 没有附件，也没有 user 文本
11:57:24.969Z assistant [text "dev 和 release 现在指向同一个提交……"]</code></pre>
<p class="note">这 3 条到底是发给了模型但没写进记录，还是在界面上被撤回后没再发，从现有数据分不出来。</p>
<h3>2. App 扣着却一直没放行</h3>
<p>App 日志只保留了最近三天：<code>priority=next</code> 的发送 104 次，<code>flushed held steers</code> 53 次。剩下的符合前面说的「工具在跑时不扣，直接进队列」。日志里没有单条消息的 ID，没法一条条配对；搜了 steer、queue、discard、drop、clear、abandon、restore，也没有任何丢弃或清空队列的日志。所以这一类没找到证据，但也没法完全排除。</p>
<h3>3. 刚吸收就被中断或压缩</h3>
<p>去重后人发的 <code>absorbed_mid_turn</code> 有 768 条。吸收之后、Claude 回复之前，紧跟着用户中断或 API 报错的：0 条。紧跟着上下文压缩（compaction）的：9 条。</p>
<p>这 9 条在压缩摘要里都找不到原文。比如有一次我说「不用准备PR那一步」，压缩摘要的待办里还写着「Prepare PRs」。但抽查的 5 条里有 4 条，Claude 压缩后第一句话就回应了：</p>
<pre><code>(mid-turn) "不要删release"      → [compact] → "好的：不删任何 release 分支。0911 会一直留着……"
(mid-turn) "不用准备PR那一步"   → [compact] → "好，不准备 PR。我在修审查查出的一处回归……"
(mid-turn) "特别是修什么"       → [compact] → "要动的一共 6 处代码，分两层……"
(mid-turn) "同时修复那些问题"   → [compact] → 继续排查渲染问题，没有明确回应</code></pre>
<p>看起来消息在压缩之后又交给了模型一次，只是会话文件没体现这一步，具体怎么实现的我没有确认。</p>
<h3>4. 送达了，但没被理会</h3>
<p>我没有对 768 条做系统的语义抽查。上面看过的几条里，明显没理会的只有第 1 类那两条：「如何兼容修复比较好?」和「拉代码」。</p>
<p><strong>小结：</strong>两条正常路径（中途吸收、轮次结束后送达）都很可靠，没找到系统主动丢弃的记录。唯一的风险点是中途被 <code>dequeue</code> 却没有送达记录的消息，大约 6700 条里有 5 条，其中 2 条是撤回改字。重要的话，发完看一眼 Claude 有没有接住。</p>
<h2>实际用起来</h2>
<ul>
<li>消息基本不会丢（极少数例外见上一节）。这一轮中途，消息只能在工具结果返回时插进去，Claude 写文字的过程中打断不了它。</li>
<li>想让它马上改方向，最可靠的是按 Esc 或点停止：这一轮立刻结束，排队的消息马上作为新一轮发出。代价是当前这一步做到一半就停了。</li>
<li>「Send now」出现在 App 扣着消息的阶段，点了应该会立刻放行。这一点我没有在日志里直接验证到。</li>
</ul>
</div>
