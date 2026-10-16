---
author: "Shumin Fu"
pubDatetime: 2026-10-16T16:05:46+08:00
title: "Claude Code 忙的时候，你发的消息什么时候被读到"
slug: claude-code-queued-messages
featured: false
draft: false
tags:
  - "claude-code"
  - "ai-agents"
description: "从桌面 App 日志和会话记录看，排队消息只会在工具结果返回时交给模型。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.note{border-left:2px solid var(--accent);padding-left:.8em;color:var(--muted)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
</style>

<div class="html-embed" lang="zh">
<p class="subtitle">从桌面 App 日志和会话记录看，排队消息只会在工具结果返回时交给模型。</p>
<p>用 Claude Code 桌面 App 时，Claude 正在干活，我又发了一条消息，界面上会显示「Send now」。之后 Claude 隔一会儿才回应这条消息，看起来像是它自己挑了个时机。我翻了本机的 App 日志和会话记录，结论是：消息不会丢，但它只能在工具调用的边界插进去，中间要过两道关。</p>
<h2>第一道关：App 先扣着</h2>
<p>如果 Claude 正在思考或输出文字，App 会把消息标成 <code>priority=next</code> 扣下，这时界面显示「Send now」。等 Claude 发起下一个工具调用，App 才放行。日志在 <code>~/Library/Logs/Claude/main.log</code>：</p>
<pre><code>03:51:04 LocalSessions.sendMessage: ... messageLength=4, imageCount=0, toolStates=0, attachmentCount=0, priority=next
03:51:07 [LocalSessionManager] flushed held steers (1 steer(s)) for local_&lt;id&gt;</code></pre>
<p><code>messageLength=4</code> 对应的是「你自己做」四个字。App 内部把这种消息叫 steer，扣了 3 秒后放行。如果发消息时已经有工具在跑，App 不扣，日志里也没有 flush 这一行，消息直接进队列。</p>
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
<h2>实际用起来</h2>
<ul>
<li>消息不会丢，只是只能在工具结果返回时插进去，Claude 写文字的过程中打断不了它。</li>
<li>想让它马上改方向，最可靠的是按 Esc 或点停止，直接中断。</li>
<li>「Send now」出现在 App 扣着消息的阶段，点了应该会立刻放行。这一点我没有在日志里直接验证到。</li>
</ul>
</div>
