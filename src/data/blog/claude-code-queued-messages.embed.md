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
.html-embed .note{border-left:2px solid var(--accent);padding-left:.8em;opacity:.8}
.html-embed td.num,.html-embed th.num{text-align:right;font-variant-numeric:tabular-nums}
.qm-fig{margin:1.6em 0;overflow-x:auto}
.qm-fig svg{display:block;width:100%;min-width:520px;max-width:660px;height:auto;margin:0 auto;font-family:inherit}
.qm-fig figcaption{font-size:.85em;opacity:.7;text-align:center;margin-top:.5em}
.qm-fig text{fill:var(--foreground);font-size:14px}
.qm-fig .sm{font-size:12px;opacity:.75}
.qm-fig .b{font-weight:700}
.qm-fig .acT{fill:var(--accent);font-weight:700;opacity:1}
.qm-fig .inv{fill:var(--background);font-weight:700;font-size:12px}
.qm-fig .bx{fill:var(--muted)}
.qm-fig .ac{fill:var(--muted);stroke:var(--accent);stroke-width:2}
.qm-fig .hold{fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:4 3}
.qm-fig .run{fill:var(--accent)}
.qm-fig .tot{fill:var(--accent);fill-opacity:.45}
.qm-fig .ln{stroke:var(--foreground);stroke-opacity:.4;stroke-width:1.5;fill:none}
.qm-fig .lnA{stroke:var(--accent);stroke-width:2.5;fill:none}
.qm-fig .mA{fill:var(--accent)}
.qm-fig .mL{fill:var(--foreground);fill-opacity:.55}
</style>

<div class="html-embed" lang="zh">
<p class="subtitle">从桌面 App 日志和会话记录看，排队消息只会在工具结果返回时交给模型。</p>
<p>用 Claude Code 桌面 App 时，Claude 正在干活，我又发了一条消息，界面上会显示「Send now」。之后 Claude 隔一会儿才回应这条消息，看起来像是它自己挑了个时机。</p>
<p>我翻了本机的 App 日志和会话记录，结论是：消息不会丢，但它只能在工具调用的边界插进去，中间要过两道关。</p>
<p>整个过程是这样的：</p>
<figure class="qm-fig not-prose"><svg viewBox="0 0 640 385" role="img" aria-label="消息的去向：工具在跑就进队列，跟着工具结果交给模型；Claude 在思考或写字时 App 先扣着，等它调用工具时放行，不再调用工具就等本轮结束"><defs><marker id="qm1a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mA" d="M0,0L10,5L0,10z"/></marker><marker id="qm1l" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mL" d="M0,0L10,5L0,10z"/></marker></defs><line class="ln" x1="320" y1="46" x2="320" y2="61" marker-end="url(#qm1l)"/><polyline class="ln" points="230,95 150,95 150,146" marker-end="url(#qm1l)"/><polyline class="ln" points="410,95 490,95 490,226" marker-end="url(#qm1l)"/><text class="sm" x="190" y="86" text-anchor="middle">思考 / 写字</text><text class="sm" x="450" y="86" text-anchor="middle">工具在跑</text><line class="ln" x1="150" y1="192" x2="150" y2="216" marker-end="url(#qm1l)"/><line class="lnA" x1="240" y1="250" x2="386" y2="250" marker-end="url(#qm1a)"/><text class="sm" x="313" y="241" text-anchor="middle">会：调用时放行</text><line class="ln" x1="150" y1="282" x2="150" y2="316" marker-end="url(#qm1l)"/><text class="sm" x="160" y="303">不会</text><line class="lnA" x1="490" y1="272" x2="490" y2="316" marker-end="url(#qm1a)"/><rect class="bx" x="220.0" y="10.0" width="200" height="36" rx="8"/><text class="b" x="320" y="33" text-anchor="middle">你发了一条消息</text><polygon class="bx" points="320,63 410,95 320,127 230,95"/><text class="b" x="320" y="100" text-anchor="middle">Claude 此刻在？</text><rect class="bx" x="45.0" y="148.0" width="210" height="44" rx="8"/><text class="b" x="150" y="167" text-anchor="middle">App 先扣着</text><text class="sm" x="150" y="185" text-anchor="middle">界面显示 Send now</text><polygon class="bx" points="150,218 240,250 150,282 60,250"/><text class="b" x="150" y="255" text-anchor="middle">还会调用工具吗？</text><rect class="bx" x="390.0" y="228.0" width="200" height="44" rx="8"/><text class="b" x="490" y="247" text-anchor="middle">进队列</text><text class="sm" x="490" y="265" text-anchor="middle">等当前工具返回</text><rect class="bx" x="40.0" y="320.0" width="220" height="50" rx="8"/><text class="b" x="150" y="342" text-anchor="middle">等这一轮结束</text><text class="sm" x="150" y="360" text-anchor="middle">作为新一轮 user 消息</text><rect class="ac" x="380.0" y="320.0" width="220" height="50" rx="8"/><text class="b" x="490" y="342" text-anchor="middle">跟着工具结果插进本轮</text><text class="sm" x="490" y="360" text-anchor="middle">absorbed_mid_turn</text></svg><figcaption>两道关：App 先扣着，再等工具返回。右下是最常见的结局。</figcaption></figure>
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
<figure class="qm-fig not-prose"><svg viewBox="0 0 640 170" role="img" aria-label="「你自己做」的时间线：扣着 3 秒，工具跑 13 秒，6 秒后 Claude 回应"><rect class="hold" x="50.0" y="60" width="70.9090909090909" height="30" rx="4"/><text class="sm" x="85.45454545454545" y="80" text-anchor="middle">扣着 3 秒</text><rect class="run" x="120.9090909090909" y="60" width="307.27272727272725" height="30" rx="4"/><text class="inv" x="274.54545454545456" y="80" text-anchor="middle">浏览器工具跑 13 秒</text><rect class="bx" x="428.1818181818182" y="60" width="141.8181818181818" height="30" rx="4"/><text class="sm" x="499.0909090909091" y="80" text-anchor="middle">思考 6 秒</text><line class="ln" x1="50.0" y1="104" x2="570.0" y2="104"/><line class="ln" x1="50.0" y1="98" x2="50.0" y2="110"/><line class="ln" x1="120.9090909090909" y1="98" x2="120.9090909090909" y2="110"/><line class="ln" x1="428.1818181818182" y1="98" x2="428.1818181818182" y2="110"/><line class="ln" x1="570.0" y1="98" x2="570.0" y2="110"/><line class="ln" x1="120.9090909090909" y1="48" x2="120.9090909090909" y2="58"/><text class="sm" x="120.9090909090909" y="22" text-anchor="middle">03:51:07</text><text class="b" x="120.9090909090909" y="42" text-anchor="middle">发起工具调用 · 放行</text><line class="ln" x1="570.0" y1="48" x2="570.0" y2="58"/><text class="sm" x="580.0" y="22" text-anchor="end">03:51:26</text><text class="b" x="580.0" y="42" text-anchor="end">Claude 回应</text><text class="sm" x="40.0" y="128" text-anchor="start">03:51:04</text><text class="b" x="40.0" y="150" text-anchor="start">你发「你自己做」</text><text class="sm" x="428.1818181818182" y="128" text-anchor="middle">03:51:20</text><text class="acT" x="428.1818181818182" y="150" text-anchor="middle">工具结果 + 你的消息</text></svg><figcaption>从发出到被读到 16 秒：扣着 3 秒，加上工具跑的 13 秒。</figcaption></figure>
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
<tr><td>其中紧跟在 tool_result 之后</td><td class="num">约 3157（约 75%）</td></tr>
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
<figure class="qm-fig not-prose"><svg viewBox="0 0 640 260" role="img" aria-label="几个例子的延迟：16 秒、21 秒、约 2 秒、46 秒、75 秒、82 秒"><text x="138" y="34" text-anchor="end">「你自己做」</text><rect class="hold" x="150" y="18" width="15.0" height="22" rx="3"/><rect class="run" x="165.0" y="18" width="65.0" height="22" rx="3"/><text class="sm" x="238.0" y="34">16 秒</text><text x="138" y="68" text-anchor="end">「保留日志」</text><rect class="hold" x="150" y="52" width="55.0" height="22" rx="3"/><rect class="run" x="205.0" y="52" width="50.0" height="22" rx="3"/><text class="sm" x="263.0" y="68">21 秒</text><text x="138" y="102" text-anchor="end">短 Bash</text><rect class="tot" x="150" y="86" width="10.0" height="22" rx="3"/><text class="sm" x="168.0" y="102">约 0–2 秒</text><text x="138" y="136" text-anchor="end">另一个长 Bash</text><rect class="tot" x="150" y="120" width="230.0" height="22" rx="3"/><text class="sm" x="388.0" y="136">约 46 秒</text><text x="138" y="170" text-anchor="end">并行工具</text><rect class="tot" x="150" y="154" width="375.0" height="22" rx="3"/><text class="sm" x="533.0" y="170">约 75 秒</text><text x="138" y="204" text-anchor="end">长 Bash</text><rect class="tot" x="150" y="188" width="410.0" height="22" rx="3"/><text class="sm" x="568.0" y="204">约 82 秒</text><rect class="hold" x="150" y="221" width="22" height="14" rx="3"/><text class="sm" x="180" y="232">等下一次工具调用</text><rect class="run" x="310" y="221" width="22" height="14" rx="3"/><text class="sm" x="340" y="232">工具运行</text><rect class="tot" x="420" y="221" width="22" height="14" rx="3"/><text class="sm" x="450" y="232">合计（没拆开）</text></svg><figcaption>延迟 = 等 Claude 发起下一个工具调用 + 那个工具跑多久。长命令一来，就是几十秒。</figcaption></figure>
<p>延迟等于两段相加：Claude 隔多久发起下一个工具调用，加上那个工具跑多久。碰上长命令或子代理，就会拖到几十秒甚至几分钟。</p>
<h2>实际用起来</h2>
<ul>
<li>消息不会丢，只是只能在工具结果返回时插进去，Claude 写文字的过程中打断不了它。</li>
<li>想让它马上改方向，最可靠的是按 Esc 或点停止，直接中断。</li>
<li>「Send now」出现在 App 扣着消息的阶段，点了应该会立刻放行。这一点我没有在日志里直接验证到。</li>
</ul>
<p><strong>一句话：</strong>消息不会丢，但只能在工具结果返回时插进去；想马上打断，就按 Esc。</p>
</div>
