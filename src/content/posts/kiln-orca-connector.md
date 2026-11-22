---
title: "kiln-orca 怎么让 Orca 里的 Agent 干 Kiln 的活"
description: "读 Kiln 的 AI 执行节点连接器 kiln-orca 的源码：它怎样从 Server 领任务、在 Orca 里启动 Codex 或 Claude Code、按每次 git 传输申请和吊销凭据，以及怎样靠 journal 在崩溃后接着做。"
growth: seedling
planted: 2026-11-23T01:41:38+08:00
lastTended: 2026-11-23T01:41:38+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
  - "claude-code"
  - "codex"
  - "security"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .tldr{border-left:2px solid var(--accent);padding:2px 14px;margin:20px 0}
.html-embed .tldr p{margin:0}
.html-embed .tw{overflow-x:auto;max-width:100%;margin:20px 0}
.html-embed .tw table{margin:0;min-width:560px}
.html-embed .tw td:first-child,.html-embed .tw th:first-child{white-space:nowrap}
.html-embed .where{font-size:14px;color:var(--muted-foreground)}
.html-embed .fl{margin:28px 0;display:flex;flex-direction:column;align-items:center;gap:6px}
.html-embed .fl figcaption{margin-top:10px;font-size:14px;color:var(--muted-foreground);text-align:center;max-width:36em}
.html-embed .fr{display:flex;align-items:center;justify-content:center;width:100%}
.html-embed .fc{display:flex;flex-direction:column;align-items:center;width:100%}
.html-embed .fn{background:var(--muted);border:1px solid transparent;border-radius:10px;padding:10px 14px;text-align:center;flex:0 1 190px;min-width:0}
.html-embed .fn b{display:block;font-size:15px;font-weight:600;color:var(--foreground);line-height:1.35}
.html-embed .fn small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.html-embed .fn.hi{background:transparent;border:2px solid var(--accent)}
.html-embed .fn.dash{background:transparent;border:1px dashed var(--muted-foreground)}
.html-embed .fc>.fn{flex:none;width:min(100%,300px)}
.html-embed .fn.wide{width:min(100%,420px)}
.html-embed .fa{flex:1 1 70px;min-width:56px;max-width:150px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 6px;font-size:12.5px;line-height:1.3;color:var(--muted-foreground);text-align:center}
.html-embed .fa i{position:relative;display:block;width:100%;height:2px;background:currentColor}
.html-embed .fa i::after{content:"";position:absolute;right:-2px;top:-4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.html-embed .fa.v{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.html-embed .fa.v i,.html-embed .fr .fa.v i{width:2px;height:30px}
.html-embed .fa.v i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.html-embed .fa.v span{width:12em;text-align:left}
.html-embed .fo{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 14px;margin-top:10px;font-size:13px}
.html-embed .fo span{padding:4px 10px;border-radius:999px;border:1px dashed var(--muted-foreground);color:var(--muted-foreground)}
.html-embed .fo .ok{border-style:solid;border-color:var(--accent);color:var(--foreground)}
.html-embed .fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;width:100%}
.html-embed .fg .fn{flex:none}
@media (max-width:640px){
.html-embed .fr{flex-direction:column}
.html-embed .fr .fn{flex:none;width:min(100%,300px)}
.html-embed .fr .fa{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.html-embed .fr .fa i{width:2px;height:28px}
.html-embed .fr .fa i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.html-embed .fr .fa span{width:12em;text-align:left}
}
</style>

<div class="html-embed" lang="zh-CN">
<p class="where">English version: <a href="/posts/kiln-orca-connector-en/" lang="en">How kiln-orca runs Kiln's work through agents in Orca</a> · 前一篇：<a href="/posts/kiln-automation-flow/">Kiln 怎么把一个 Issue 自动变成一次发布</a></p>
<p><a href="/posts/kiln-automation-flow/">上一篇</a>讲了 Kiln 的整条自动化链：Issue 被 AI 开发、被另一个 Agent 审计，然后合并、打 tag、发布。那篇里 AI 的部分只说到「Server 把任务派给 AI 执行节点」。这篇往下看一层：执行节点上发生了什么，Kiln 怎么让 Orca 里的编程 Agent 替它干活，又怎么防它乱来。</p>
<p>读的是 <a href="https://github.com/hewenyu/kilnflow.dev">kilnflow.dev</a> 的 <code>kiln-orca/</code> 目录（TypeScript，约 1.15 万行源码），commit <code>e3bff51</code>。只读源码和测试，<strong>没有安装，也没有运行</strong>；Orca 本身不开源，我只看了连接器怎么调用它的命令行，以及测试里录下的 Orca 输出。下文路径都相对于 <code>kiln-orca/src/</code>。</p>

<div class="tldr"><p>一句话：<code>kiln-orca</code> 是一个常驻的用户服务，夹在 Kiln Server 和 Orca 之间。它从 Server 领任务、在 Orca 里开一个一次性的工作区启动 Agent、把每一步写进本地 journal 以便崩溃后接着做；Agent 能做的事只有通过 <code>kiln-orca task</code> 命令问它，git 凭据也是它按每一次传输向 Server 要来、用完就还。</p></div>

<h2>三方各管什么</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>Kiln Server</b><small>派任务 · 发凭据 · 收结果</small></div><div class="fa "><span>airunner.v2 长轮询</span><i></i></div><div class="fn hi"><b>kiln-orca</b><small>常驻用户服务</small></div><div class="fa "><span>Orca 命令行</span><i></i></div><div class="fn "><b>Orca</b><small>工作区 · 终端 · 编排</small></div></div><div class="fa v"><span>Orca 启动 Agent</span><i></i></div><div class="fn "><b>Codex / Claude Code</b><small>在一次性的工作区里干活</small></div><div class="fo"><span class="lp">↺ Agent 只经 kiln-orca task 回头找连接器（本机 unix socket）</span></div><figcaption>连接器不自己跑 Agent，也不让 Agent 直接联系 Server：所有往外的请求都经过它。</figcaption></figure>
<p><strong>Orca</strong> 是一个桌面应用，管 Agent 的工作区（git worktree）、终端和编排（run、dispatch、worker）。Orca 内部怎么分工、要不要拆子 Agent，是它自己的事，Kiln 不管。</p>
<p><strong>kiln-orca</strong> 以 macOS LaunchAgent 或 Linux <code>systemd --user</code> 服务运行，一个数据目录就是一个节点。节点注册时用的令牌决定它是审计节点还是开发节点；一台装了 Codex 和 Claude Code 的机器可以同时注册两个节点，各用一个数据目录。</p>

<h2>一个任务在节点上的一生</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>prepare</b><small>clone · 工作区 · 工具链 · 测试服务</small></div><div class="fa "><span>先记下请求 id</span><i></i></div><div class="fn "><b>start</b><small>orca worker-start</small></div><div class="fa "><span>Agent 开始干</span><i></i></div><div class="fn hi"><b>running</b><small>等 worker_done · 每 5 秒心跳</small></div></div><div class="fa v"><span>Agent 发出 worker_done</span><i></i></div><div class="fr"><div class="fn "><b>finishing</b><small>推 attempt 分支 · Complete</small></div><div class="fa "><span>结果已提交</span><i></i></div><div class="fn "><b>stopping / releasing</b><small>停 Agent · 释放终端</small></div><div class="fa "><span>都确认了</span><i></i></div><div class="fn "><b>reclaiming</b><small>删工作区 · 删 journal</small></div></div><figcaption>这些阶段名就是 journal 记录里 stage 字段的取值；连接器每进一步先写 journal，重启后按它接着做。</figcaption></figure>

<h3>1. 启动：先确认自己能干活，再去领</h3>
<p>服务启动时，连接器读注册信息和私钥，拿单实例锁，在数据目录的 <code>run/kiln-orca.sock</code> 上开 socket，然后逐项检查：Orca 是否打开、版本是否不低于 <code>1.4.258</code>，Docker 和 Compose 能不能用，随包的 <code>kiln-runner</code> 能不能准备工具链，journal 能不能写，每个 Agent 的 <code>--version</code>，以及 <code>kiln-task</code> skill 是否已同步进 Agent 的 skill 目录。</p>
<p>这些状态连同协议版本（现在是 10）每次都随 <code>Acquire</code> 报给 Server。容量满了（默认 <code>max_tasks: 2</code>）、本机设了 drain、Orca 没就绪、journal 或 skill 有问题时，节点照样连着，但声明自己不接新任务。读不了的 journal 记录也按占一份容量算，因为里面可能有一个还在 Orca 中运行、连接器却不认识的 Agent。</p>
<p class="where"><code>host/run.ts:132</code> · <code>core/node.ts:176,473,728</code> · <code>core/orca.ts:306</code></p>

<h3>2. 准备：clone、工作区、工具链、测试服务</h3>
<p>领到任务后，连接器在 <code>repos/&lt;repo id&gt;/&lt;仓库名&gt;</code> 下准备这个仓库的 clone。需要的只读 token 向 Server 要（<code>IssueCredential</code>，带一个 <code>op_id</code>），经环境变量里的 <code>http.&lt;地址&gt;.extraHeader</code> 交给 git，不出现在命令行参数里；clone 完立刻 <code>RevokeCredential</code>。连接器自己的 git 不读全局和系统的 git 配置。</p>
<p>然后把仓库登记到 Orca，在 <code>tasks/&lt;attempt&gt;/</code> 下写好任务文件（<code>work.json</code>、开发选题时的 <code>candidates.json</code> 等），按仓库的 <code>.kiln/runtimes.lock</code> 调用 <code>kiln-runner toolchain ensure</code> 准备 Go、Node、pnpm，仓库声明了测试服务时用 <code>docker compose up -d --wait</code> 拉起 Postgres 或 Redis。</p>
<p class="where"><code>core/attempt.ts:459,746</code> · <code>core/git.ts:171,410</code> · <code>core/credentials.ts:77</code> · <code>core/toolchain.ts:167</code> · <code>core/services.ts:305</code></p>

<h3>3. 启动 Agent：绝不启动两次</h3>
<p>启动前，连接器先把这次启动的请求 id 写进 journal，<strong>然后</strong>才调用：</p>
<p><code>orca orchestration worker-start --worktree new-top-level --name kiln-a&lt;attempt&gt;-e&lt;epoch&gt; --base-branch &lt;commit&gt; --comment kiln:attempt=…;epoch=…;task=…;kind=… --agent &lt;agent&gt; --spec &lt;prompt&gt;</code></p>
<p>Orca 新建一个顶层工作区、在里面启动 Agent。如果这次调用的结果不明（超时、连接断开），连接器不重试，而是用同一个请求 id 去 <code>request-show</code> 查 Orca 到底启动了没有。查不出来就以 <code>infra.lost</code> 结束，宁可失败也不让同一个任务跑出两个 Agent。工作区的名字和备注带着 attempt 和 epoch，后面回收时靠它们确认「这是我建的」。</p>
<p class="where"><code>core/attempt.ts:864,958</code> · <code>core/orca.ts:611</code></p>

<h3>4. 跟踪：邮箱、心跳、超时</h3>
<p>Agent 结束时会发一条 <code>worker_done</code>。连接器在 Orca 里有一个自己的「邮箱」终端，持续执行 <code>orchestration check --types worker_done,escalation,question</code>，把收到的消息落成文件；Agent 中途提问时给它一个固定的回复，让它按任务说明自己判断。</p>
<p>任务进行中，连接器每 2 秒看一次邮箱，每 30 秒用 <code>worker-show</code> 兜底查一次 Agent 的状态，每 5 秒给 Server 发一次心跳（带上当前阶段）。心跳的回复里可能有取消请求；超过任务时限、和 Server 失联 10 分钟、epoch 已经过期、节点被吊销，都会让连接器停下这个 Agent。连接器自己重启时只是不再跟踪，Agent 在 Orca 里继续跑，重启后从 journal 接上。</p>
<p class="where"><code>core/mailbox.ts:585</code> · <code>core/attempt.ts:118-123,1000,1358</code></p>

<h3>5. Agent 的唯一入口：<code>kiln-orca task</code></h3>
<p>Agent 拿到的任务说明里有一条形如 <code>node cli.js task --home &lt;数据目录&gt; --attempt &lt;id&gt;</code> 的命令，用法写在随包分发、由连接器同步进 Agent 目录的 <code>kiln-task</code> skill 里。这个命令把请求经 unix socket 交给运行中的连接器，连接器再替它调用 Server。</p>
<div class="tw"><table>
<thead><tr><th>子命令</th><th>做什么</th><th>谁来校验</th></tr></thead>
<tbody>
<tr><td><code>info</code></td><td>任务的基本信息</td><td>本地</td></tr>
<tr><td><code>check-report</code></td><td>审计：提交前先校验 <code>report.json</code></td><td>Server 的 <code>ValidateReport</code>；本地只查文件类型和 1 MiB 上限</td></tr>
<tr><td><code>claim</code></td><td>开发：领取选中的 Issue</td><td>Server 的 <code>ValidateReport</code> + <code>ClaimDevIssues</code></td></tr>
<tr><td><code>deliver</code></td><td>开发：交付报告</td><td>Server 校验报告；本地查工作区干净、HEAD 包含交付的 commit、设计阶段只改 Markdown</td></tr>
<tr><td><code>ci</code></td><td>查 PR 或 commit 最新的 CI 结果</td><td>Server 的 <code>GetVerification</code></td></tr>
<tr><td><code>doc</code></td><td>读冻结的外部设计文档</td><td>Server 按任务关系授权</td></tr>
<tr><td><code>exec</code></td><td>用受管理的工具链跑命令，git 经连接器拿凭据</td><td>见下一节</td></tr>
<tr><td><code>done</code></td><td>结束这一轮：再校验一次，然后在 Agent 自己的进程里向 Orca 发 <code>worker_done</code></td><td>连接器</td></tr>
</tbody>
</table></div>
<p>最后一条有个细节：<code>worker_done</code> 由 Agent 的进程发出，身份来自 Orca 给这个会话设置的环境，连接器不冒充 Agent 报结束。</p>
<p class="where"><code>host/socket.ts:295</code> · <code>core/attempt.ts:1412-1649</code> · <code>core/done.ts:138</code></p>

<h3>6. <code>task exec</code>：每一次 git 传输一枚 token</h3>
<figure class="fl"><div class="fr"><div class="fn "><b>Agent 的 git</b><small>经 task exec 运行</small></div><div class="fa "><span>git-remote-https 被换成包装</span><i></i></div><div class="fn hi"><b>传输包装</b><small>先查有没有别的凭据</small></div><div class="fa "><span>开一个只读操作</span><i></i></div><div class="fn "><b>连接器 → Server</b><small>签发只覆盖这个仓库的 token</small></div></div><div class="fo"><span class="ok">✓ 传输结束、连接关闭：立即吊销</span><span class="lp">发现 netrc、extraHeader、URL 里带密码：拒绝这次传输</span></div><figcaption>Agent 和工作区里都没有长期的 git 凭据；每一次 fetch 都单独申请、单独吊销。</figcaption></figure>
<p><code>task exec -- &lt;命令&gt;</code> 把工具链放到 <code>PATH</code> 最前面，再用 <code>GIT_EXEC_PATH</code> 指向一个镜像目录，其中 <code>git-remote-http(s)</code> 换成了连接器的包装程序，并给任务仓库的主机配上连接器的 credential helper。</p>
<p>每次 git 走 HTTP(S) 时，包装程序先检查这次传输会不会带上别的凭据：地址里有用户名或密码、对这个地址生效的 <code>http.extraHeader</code>、netrc 里出现这个主机或 <code>default</code>，或者这些查不了。有任何一项就拒绝这次传输。都没有时，它经 socket 向连接器开一个只读操作，连接器只在地址正好是任务仓库或声明过的依赖仓库时才向 Server 要 token；连接一断，token 立即吊销。</p>
<p>写权限只在交付时用：连接器自己推 attempt 分支时单独申请一枚写 token，推完就还。Agent 拿不到写凭据。</p>
<p class="where"><code>host/cli.ts:306,365</code> · <code>core/gitexec.ts:45,109</code> · <code>core/credentials.ts:246,362</code> · <code>core/attempt.ts:1468,1490</code></p>

<h3>7. 收尾：先确认结果，再删东西</h3>
<p>Agent 结束后，连接器先把结论写进 journal（阶段 <code>finishing</code>）。开发任务交付了的，用写 token 把交付的 commit 推到 <code>kiln/attempt-&lt;id&gt;</code>，再用 <code>ls-remote</code> 确认；没交付的，把现有改动作为 checkpoint 推到同一个分支，下一轮可以换一台机器接着做。然后 <code>Complete</code>，失败就重试，最长 30 分钟。</p>
<p>结果确认之后才清理：停掉测试服务，确认 Agent 已停、终端已释放，经 Orca 删除工作区、检出和本地分支，再核对 Orca、git 和磁盘上都没有了，最后删掉 journal 记录。删除前会核对名字、备注、路径和 git 登记，不是连接器建的一律不动。回收没完成就每分钟重试，12 小时后放弃并在日志里写明怎么手工处理。</p>
<p class="where"><code>core/attempt.ts:1159,1223,1256,1297</code> · <code>core/git.ts:558</code> · <code>core/reclaim.ts:185-411</code></p>

<h2>崩溃了怎么办</h2>
<p>整套设计的重点在这里。每一个会改变外部状态的动作之前，连接器都先在 <code>journal/&lt;attempt&gt;.json</code> 里记下要做什么：启动请求 id、结论、要不要推送、<code>Complete</code> 的内容。重启后逐条读 journal：</p>
<ul>
<li>记了 <code>Complete</code> 的，重发；</li>
<li>记了结论还没推送的，重做推送；</li>
<li>停在 <code>stopping</code>、<code>releasing</code>、<code>reclaiming</code> 的，每分钟再试一次；</li>
<li>读不了的记录不跳过、不删除：节点停止接新任务，在日志、<code>doctor</code> 和 Dashboard 上写明哪个文件、什么原因，等人处理。</li>
</ul>
<p>测试也是按这个思路写的：约 580 个用例，用真实的 git、本地的 git HTTP 服务、真实的 unix socket 和多进程抢锁，还有大量「在某一步中途 epoch 过期 / 进程崩溃」的用例。</p>

<h2>读到的问题</h2>
<p>没有找到高危问题。值得改的几处，大多只在「Agent 和连接器是同一个用户」这个前提被当成安全边界时才要紧；Kiln 的文档自己也说这些是护栏，不是边界。</p>
<div class="tw"><table>
<thead><tr><th>问题</th><th>会怎样</th><th>在哪</th></tr></thead>
<tbody>
<tr><td>socket 只按 attempt id 区分调用方</td><td>同时跑两个任务时，一个 Agent 可以冒充另一个任务领凭据、领 Issue、读文档。给任务命令加一个随机的每任务密钥就能补上</td><td><code>host/run.ts:202</code></td></tr>
<tr><td>git 固定 10 分钟超时，clone 是完整 clone</td><td>大仓库或慢网络下 clone 超时，下一次又从零开始，可能一直 <code>infra.fetch</code></td><td><code>core/git.ts:50,412</code></td></tr>
<tr><td>共享 clone 自己的 <code>.git/config</code> 和 hooks 仍然生效</td><td>上一轮的开发 Agent 留下的代理或 hook，会作用到后面任务里带 token 的 git</td><td><code>core/git.ts:183</code></td></tr>
<tr><td>journal、状态文件写入后不 fsync</td><td>断电后记录可能是空的；空的 journal 会让节点停止接活，直到有人删掉它</td><td><code>core/journal.ts:215</code></td></tr>
<tr><td>clone 路径由 Server 给的仓库名拼出，删除前不检查是否在根目录内</td><td>只有 Server 出错或被攻破时才会触发；回收代码里已经有这类检查，这里没有</td><td><code>core/attempt.ts:428</code></td></tr>
<tr><td>报告文件超过 1 MiB 时，告诉 Agent 的是「可以稍后重试」</td><td>Agent 可能反复重试直到超时</td><td><code>core/attempt.ts:1534</code></td></tr>
</tbody>
</table></div>
<p>做得好的地方也很明显：所有子进程都用参数数组启动，没有 <code>shell: true</code>；token 不出现在命令行参数、journal 和日志里，日志只记指纹；外部输入都按 <code>unknown</code> 解析再校验，源码里没有一处 <code>as any</code>；每个外部命令都有超时。</p>
</div>
