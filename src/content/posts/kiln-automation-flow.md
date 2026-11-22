---
title: "Kiln 怎么把一个 Issue 自动变成一次发布"
description: "读 Kiln（kilnflow.dev）的源码：一个打了 kiln:ready 的 Issue，怎样经过 AI 开发、另一个 Agent 的独立审计、自建的合并队列、自动打 tag，最后由 Server 发布，中间没有人参与。"
growth: seedling
planted: 2026-11-23T01:41:38+08:00
lastTended: 2026-11-23T01:41:38+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
  - "code-review"
  - "self-hosting"
  - "open-source"
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
<p class="where">English version: <a href="/posts/kiln-automation-flow-en/" lang="en">How Kiln turns an issue into a release</a> · 姊妹篇：<a href="/posts/kiln-orca-connector/">kiln-orca 怎么让 Orca 里的 Agent 干 Kiln 的活</a></p>
<p><a href="https://github.com/hewenyu/kilnflow.dev">Kiln</a> 是一套自托管的 CI：一台小 Server 把全部状态放在 Postgres 里，构建机和 AI 执行机都从自己那边连过来领活。接上可选的 AI 节点之后，一个打了 <code>kiln:ready</code> 标签的 GitHub Issue 会被 AI 设计、写代码、由另一个 Agent 审计，然后合并、打 tag、发布，中间不需要人点任何按钮。</p>
<p>这篇顺着这条路读它的代码。我读的是 commit <code>e3bff51</code>，只读源码，<strong>没有构建，也没有运行</strong>。下文的文件路径如无说明，都相对于 <code>internal/server/</code>。</p>

<div class="tldr"><p>一句话：GitHub 只管发事件和收结果；判断、调度、合并、打 tag、发布全在 Kiln 的 Server 里，靠「状态变更和外发消息同一个事务提交」把这些步骤串成一条不会丢步的链。</p></div>

<h2>谁和谁说话</h2>
<figure class="fl"><div class="fc"><div class="fn "><b>GitHub</b><small>装在自己账号上的 App</small></div><div class="fa v"><span>webhook</span><i></i></div><div class="fn hi wide"><b>kiln-server</b><small>Postgres 是唯一状态 · 只有它回写 GitHub</small></div><div class="fa v"><span>派活给主动来领的机器；发布产物</span><i></i></div><div class="fg"><div class="fn "><b>kiln-runner × N</b><small>CI：主机 / Docker / BuildKit</small></div><div class="fn "><b>kiln-orca × N</b><small>AI：Orca + Codex / Claude Code</small></div><div class="fn dash"><b>发布目标</b><small>Release · npm · 镜像 · HTTP</small></div></div></div><figcaption>构建机和 AI 机器都是主动连出去，所以可以放在家里或内网；GitHub App 私钥和发布凭据只在 Server 上，回写 GitHub 的也只有 Server。</figcaption></figure>
<p>Server 里 CI 和 AI 是两个分开的领域：表、调度器、通信协议（<code>runner.v1</code> 和 <code>airunner.v2</code>）都不同。它们只在组装文件 <code>server.go</code> 里通过窄接口接线，或者经由共用的 outbox 表传事件。<code>internal/archtest</code> 会在一个领域直接 import 另一个领域、或查询别人的表时让测试失败，这条边界是机器检查的，不只是写在文档里。</p>

<h2>一次真实的流转</h2>
<p>Kiln 用 Kiln 构建自己。2026 年 11 月 22 日，也就是开源后的第二天，三个打了 <code>kiln:ready</code> 的 i18n Issue 走完了整条链。下面的时间是 UTC，取自 commit 和 tag 的元数据；审计结果来自 PR 页面。</p>
<div class="tw"><table>
<thead><tr><th>时间</th><th>发生了什么</th><th>谁做的</th></tr></thead>
<tbody>
<tr><td>09:44</td><td>为 Issue #2 推到 <code>kiln/dev-6</code>，开出 PR #9</td><td>Claude Code 写代码；Server 开 PR</td></tr>
<tr><td>09:44 之后</td><td>19 个检查运行。AI 审计不通过：1 个中等问题，一个测试测不出它声称覆盖的错误</td><td>Codex，发为 PR review</td></tr>
<tr><td>10:07</td><td>第 1 轮返修：重写测试，贴出处置说明</td><td>Claude Code</td></tr>
<tr><td>10:19 之前</td><td>第二次审计通过；加上 <code>kiln:merge</code></td><td>Codex；Server</td></tr>
<tr><td>10:19</td><td>squash 合并为 <code>11deef3</code>，在它上面打 <code>v1.0.3</code></td><td>kiln-runner[bot]</td></tr>
<tr><td>10:20</td><td>发布 Release v1.0.3（12 个 asset），关闭 Issue #2</td><td>Server</td></tr>
</tbody>
</table></div>
<p>PR #10 也是一轮返修（11:41 合并，v1.0.4）；PR #11 一次通过审计（12:32 合并，v1.0.5）。从第一个 commit 到公开发布，三个分别用了 36、45 和 13 分钟。</p>

<h2>CI 这一段：从 webhook 到绿色的 Check Run</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>接收</b><small>验签 · 存事件 · 回 202</small></div><div class="fa "><span>后台逐条处理</span><i></i></div><div class="fn "><b>规划</b><small>整个 job 图一次定好</small></div><div class="fa "><span>依赖完成</span><i></i></div><div class="fn hi"><b>算 action key</b><small>所有输入的指纹</small></div></div><div class="fa v"><span>没命中缓存</span><i></i></div><div class="fr"><div class="fn "><b>领取</b><small>同一事务：epoch+1 · 租约</small></div><div class="fa "><span>心跳续约</span><i></i></div><div class="fn "><b>Runner 执行</b><small>只看得到 inputs 的文件</small></div><div class="fa "><span>Complete</span><i></i></div><div class="fn "><b>outbox</b><small>写 Check Run</small></div></div><div class="fo"><span class="ok">✓ 命中缓存：job 直接成功，不占 Runner</span></div><figcaption>action key 是这条链上省时间的地方：输入没变的 job 不再执行。</figcaption></figure>
<h3>1. 接收：验签、存下、立刻回</h3>
<p>GitHub 把事件 POST 到 <code>/webhook</code>。处理函数用常数时间比较校验 HMAC-SHA256 签名，按 delivery id 去重存进 <code>events</code> 表，然后返回 202，请求里不做别的事。</p>
<p>一个后台循环再逐条处理存下的事件：不在 <code>KILN_ALLOWED_ACCOUNTS</code> 里的账号的安装会被拒绝并卸载；来自 fork 的 PR 一律丢弃，没有开关；同一个 ref 已经有更新事件的旧事件直接跳过。</p>
<p class="where"><code>ingest/webhook.go:35</code> · <code>ingest/event.go:159</code> · <code>ingest/push.go:308</code></p>
<h3>2. 规划：执行之前，job 图就全定了</h3>
<p>Planner 按要构建的那个 commit 读 <code>.kiln/workflows/*.yml</code>。PR 构建的是 head commit，不是和目标分支的合并提交。语法沿用 GitHub Actions，但不支持 <code>uses:</code>；表达式只能引用规划时就知道的值，所以矩阵、<code>if:</code>、<code>needs</code> 在这一步全部展开。</p>
<p>run、job、并发组和第一批 Check Run 记录在同一个事务里写入。workflow 写错了也会建出 run，只是直接标为失败，commit 上会出现一个带错误信息的红色检查。</p>
<p class="where"><code>ci/planner/planner.go:234,342</code> · <code>internal/workflow/</code></p>
<h3>3. 已经构建过的不再构建</h3>
<p>一个 job 的依赖全部完成时，engine 把会影响它的一切算成 action key：inputs 文件的摘要、env、steps、镜像 digest、runtime digest、上游输出的摘要。secret 只以名字计入。</p>
<p><code>action_cache</code> 里有这个 key，job 就直接成功，不碰 Runner；有一个 key 相同、正在执行的 job，这个 job 就跟着它的结果走。所以 Kiln 自己的 workflow 把带版本号的构建单独放成一个 job：合并之后测试的 key 不变，不用重跑。</p>
<p class="where"><code>ci/engine/engine.go:205,372</code></p>
<h3>4. 领取：选中、epoch+1、租约，一个事务</h3>
<p>Runner 保持一个长轮询的 <code>Acquire</code>。调度器锁住这台 Runner 的行，用 <code>FOR UPDATE SKIP LOCKED</code> 按优先级和先后取最多 300 个候选 job，再按平台、pool、执行器、声明的 CPU 和内存（对照这台机器的剩余容量）以及仓库的并发上限筛选。</p>
<p>选中的 job 在<strong>同一个事务</strong>里变成 <code>running</code>、<code>epoch</code> 加一、插入 attempt、设好租约。Runner 之后的每次写入都要带上匹配的 epoch，所以一台丢了租约的 Runner 不可能覆盖新一次 attempt 的结果。</p>
<p class="where"><code>ci/scheduler/reserve.go:211,730</code> · <code>ci/runnerapi/scheduler.go:140</code></p>
<h3>5. 在 Runner 上执行</h3>
<p>Runner 只检出 job 的 <code>inputs</code> 匹配到的文件，没有 <code>.git</code>；按 <code>.kiln/runtimes.lock</code> 的摘要安装并校验 Go、Node、pnpm；从内容寻址存储取上游 job 的输出；在主机上或容器里运行 steps。容器 job 默认 <code>--network none</code>。</p>
<p>拉源码用的 token 是 Server 为这一次 fetch 单独签发的、只覆盖这一个仓库，fetch 完就吊销。secret 经 RPC 下发，只放在 step 的环境变量里，日志中的原文、base64 和 URL 编码形式都会被遮掉。</p>
<p>每隔几秒的心跳续租约，也把取消请求带回来。输出上传到预签名的地址，最后 <code>Complete</code> 结束 attempt 并写缓存。</p>
<p class="where"><code>internal/runner/execute.go:61</code> · <code>internal/runner/source.go:178</code> · <code>ci/runnerapi/runnerapi.go:392</code></p>
<h3>6. 经 outbox 回报</h3>
<p>每次状态变更都在同一个事务里写一条 outbox 记录。记录里只有一个 id，所以连续几次变更会合成一次待投递。worker 把它变成 Check Run：先按 external id 查找再创建，指数退避，失败 20 次进死信。</p>
<p>一个 PR 的 run 最后一个 job 结束时，engine 发出 <code>pr.verified</code>。合并队列和 AI 开发都在等这一个事件。</p>
<p class="where"><code>outbox/worker.go:86</code> · <code>ci/cicheck/checkrun.go:40</code> · <code>server.go:390</code></p>

<h2>从全部通过到发布</h2>
<figure class="fl"><div class="fr"><div class="fn "><b>CI + AI 审计</b><small>在 PR head 上</small></div><div class="fa "><span>pr.verified：必需项全过</span><i></i></div><div class="fn hi"><b>合并队列</b><small>每个仓库一个执行者</small></div><div class="fa "><span>合并，同一事务记下 tag</span><i></i></div><div class="fn "><b>自动打 tag</b><small>下一个 vX.Y.Z</small></div></div><div class="fa v"><span>直接规划这个 tag 的 run</span><i></i></div><div class="fn "><b>发布 job</b><small>在 Server 上执行</small></div><div class="fo"><span class="lp">↺ 落后于目标分支：队列先更新分支，新 head 重新验证</span></div><figcaption>唯一的回路是更新分支：落后的 PR 被队列更新后，必须在新 head 上再验证一遍才合并。</figcaption></figure>
<h3>合并队列</h3>
<p>Kiln 不用 GitHub 的 merge queue，也不需要分支保护。PR 有人加上 <code>kiln:merge</code> 就入队；默认分支上的 <code>.kiln/merge.yml</code> 写了 <code>auto: true</code> 时，<code>required</code> 里的每一项都通过后自动入队。这个配置只从默认分支读，PR 改不了自己的合并门槛。</p>
<p>每个仓库只有一个执行者，持有 Postgres 的 advisory lock。每一轮都重新从 GitHub 读 PR，从头判断：等、更新分支、合并，或者带着原因移出队列。合并请求带上它验证过的 head SHA，head 变了 GitHub 会拒绝。</p>
<p class="where"><code>mergequeue/process.go:46,894</code> · <code>mergequeue/decide.go:208</code> · <code>mergequeue/autoenqueue.go:85</code></p>
<h3>自动打 tag 与发布</h3>
<p>合并、队列条目的更新和一条 tag 记录在同一个事务里提交。tag worker 读出已有的 tag，算出下一个版本（默认升补丁号；<code>release:minor</code>、<code>release:major</code>、<code>release:skip</code> 标签改变规则），创建 ref，然后直接调用 CI 的 planner 为这个 tag 规划一次 push run。</p>
<p>写了 <code>release:</code> 的 job 没有 steps，不会到 Runner 上。Server 先把所有目标暂存好（npm 核对 integrity、镜像按 digest 推层、GitHub Release 建成草稿），过了最后一个可取消点后，按 npm、镜像 tag、HTTP 上传、GitHub Release 的顺序正式发布。重跑时，目标上已有相同内容就算成功。</p>
<p class="where"><code>autotag/autotag.go:315,684,932</code> · <code>ci/publish/job.go:52</code> · <code>ci/publish/targets.go:44</code></p>

<h2>叠在上面的 AI 循环</h2>
<p>AI 执行节点是一台装了 Orca 桌面版和连接器 <code>kiln-orca</code> 的机器，角色（审计或开发）在注册时由令牌决定。连接器领一个任务，在新的 Orca 工作区里启动编程 Agent，再把结果交回。Agent 和 Kiln 打交道只有一个入口：<code>kiln-orca task</code> 命令。</p>
<h3>独立审计</h3>
<p>PR 打开或推送时，和 CI run 一起规划一个审计请求。审计说明 <code>.kiln/agent/review.md</code> 从 PR 的 base 读，PR 改不了自己的审计标准。Agent 必须交回格式严格的 JSON 报告，只有「没有问题」才算通过；结果发为 PR review 和 <code>ai-review</code> 检查。</p>
<p>Server 记下每个开发工作项用过哪些 Agent，审计时拒绝派给其中任何一个：规划时检查一次，节点来领任务时再检查一次。Kiln 自己的配置是 Claude Code 开发、Codex 审计。</p>
<p>审计说明要求做变异验证：在临时副本里把改动的关键逻辑改坏，确认测试会失败。上面表格里两次审计不通过，都是这一类问题。</p>
<p class="where"><code>ai/review/plan.go:135,568</code> · <code>ai/review/tasktype.go:104,178</code> · <code>ai/review/publish.go:124</code></p>
<h3>从 Issue 开发</h3>
<figure class="fl"><div class="fr"><div class="fn "><b>developing</b><small>从任务池领取</small></div><div class="fa "><span>Agent 交付</span><i></i></div><div class="fn "><b>delivering</b><small>Server 核对</small></div><div class="fa "><span>Server 推分支、开 PR</span><i></i></div><div class="fn hi"><b>pr_open</b><small>等 CI · 审计 · 合并</small></div></div><div class="fa v"><span>合并队列合入</span><i></i></div><div class="fn "><b>merged</b></div><div class="fo"><span class="lp">↺ 审计有问题 / CI 失败 / 冲突：fixing，同一个 PR 返修</span><span class="lp">返修轮数用完：blocked，等人</span></div><figcaption>工作项在 dev_work_items 里的状态（省略了终态 stopped 和 no_change）。同一个仓库一次只跑一个未结束的工作项；停在 pr_open 等待时不占节点容量。</figcaption></figure>
<ul>
<li><strong>任务池。</strong>打开的、带 <code>kiln:ready</code> 的 Issue 经 Issues webhook 同步进 <code>dev_pool</code>。</li>
<li><strong>选题和领取。</strong>开发节点拿到候选，挑一批适合放进一个 PR 的领取；Server 在接受前从 GitHub 重新读一遍每个 Issue。</li>
<li><strong>交付。</strong>Agent 在一次执行里先设计再实现，推到一次性的 <code>kiln/attempt-&lt;id&gt;</code> 分支。判断一个 PR 做不完时，先交付只改 Markdown 的设计 PR，合并后 Server 自动开始实现。</li>
<li><strong>推进。</strong>Server 核对交付，用自己签发的短期 token 把正式分支 <code>kiln/dev-&lt;工作项&gt;</code> 快进过去，由自己开 PR。Agent 写的标题和正文会被处理，不能 @ 人，也不能顺手关掉别的 Issue。</li>
<li><strong>暂停。</strong>改动了 <code>.kiln/</code>、<code>.github/</code>、<code>AGENTS.md</code>、<code>CLAUDE.md</code>、<code>.claude/</code>、<code>.codex/</code>，超过 300 个文件或 100 个 commit，或者声明要改项目 23 条已确认决定之一的交付，加 <code>kiln:hold</code> 等人确认。</li>
<li><strong>返修。</strong>审计 finding、真实的 CI 失败、合并冲突，都把同一个工作项送回再做一轮，在同一个 PR 上，最多 <code>max_fix_rounds</code> 轮（Kiln 自己配的是 10）。</li>
</ul>
<p class="where"><code>ai/aidev/pool.go:49</code> · <code>ai/aidev/claim.go:84</code> · <code>ai/aidev/executor.go:224,627</code> · <code>ai/aidev/fix.go:162</code> · <code>ai/aidev/state.go:14</code></p>

<h2>让它不出错的四条规则</h2>
<div class="tw"><table>
<thead><tr><th>规则</th><th>防的是什么</th><th>在哪</th></tr></thead>
<tbody>
<tr><td>状态变更和外发消息同一个事务提交</td><td>job 绿了却没有 Check Run；合并了却没记下 tag</td><td><code>outbox/</code>，各领域共用</td></tr>
<tr><td>job 和任务的每次写入都带 epoch</td><td>丢了租约的 Runner 覆盖新一次 attempt 的结果</td><td><code>ci/engine/engine.go:569</code>、<code>ai/lease.go:21</code></td></tr>
<tr><td>每个对象一个执行者，每次按最新状态判断</td><td>两个进程合并、打 tag 同一个东西；按过期的读结果行事</td><td><code>mergequeue/process.go:43</code>、<code>autotag/autotag.go:315</code></td></tr>
<tr><td>没有幂等键的写操作先记意图，绝不盲目重试</td><td>响应丢失后重复评论、重复 review、重复关 Issue</td><td><code>mergequeue/closeissues.go:180</code>、<code>ai/review/publish.go:124</code></td></tr>
</tbody>
</table></div>
<div class="tldr"><p>还有一条范围更窄的：构建机和 AI 机器上都不存 git 凭据。每次 clone、fetch、push 都向 Server 要一枚只覆盖一个仓库的 token，操作结束或 attempt 结束时由 Server 吊销（<code>gitcred/</code>）。</p></div>

<h2>你要配置的东西</h2>
<div class="tw"><table>
<thead><tr><th>文件或标签</th><th>管什么</th><th>从哪读</th></tr></thead>
<tbody>
<tr><td><code>.kiln/workflows/*.yml</code></td><td>job、矩阵、容器、services、发布目标</td><td>正在构建的 commit</td></tr>
<tr><td><code>.kiln/runtimes.lock</code></td><td>Go、Node、pnpm、Bun 的版本和各平台摘要</td><td>正在构建的 commit</td></tr>
<tr><td><code>.kiln/merge.yml</code></td><td>合并方式、必需检查、自动入队、打 tag 规则、允许的目标分支</td><td>只从默认分支</td></tr>
<tr><td><code>.kiln/agent/config.yml</code></td><td>谁审计、谁开发、平台、超时、返修轮数</td><td>审计：PR head；开发：默认分支</td></tr>
<tr><td><code>review.md</code> / <code>development.md</code></td><td>给两个 Agent 的说明</td><td>PR base / 默认分支</td></tr>
<tr><td><code>kiln:ready</code> / <code>kiln:skip</code></td><td>把 Issue 放进 / 排除出 AI 任务池</td><td>Issue</td></tr>
<tr><td><code>kiln:merge</code> / <code>kiln:hold</code></td><td>进入合并队列 / 不自动入队</td><td>PR</td></tr>
<tr><td><code>release:minor</code> / <code>major</code> / <code>skip</code></td><td>合并后打 tag 时怎么升版本</td><td>PR，合并时冻结</td></tr>
</tbody>
</table></div>
<p>secret、变量和 environment 都存在 Kiln 里，用 Server 的主密钥加密，不放在 GitHub Settings。日志、产物和缓存只保留 12 小时，长期只留结果。</p>

<h2>读完的几点看法</h2>
<p>我把六个子系统各读了一遍，没有找到高危问题；值得改的地方集中在设计上默认可信的那些对象。例如：漏掉 webhook 后补对账时，push 不再带「是不是 Bot」的标记，第三方 Bot 推的 tag 可能照常发布；开发节点拿到的写权限 token 覆盖整个仓库；<code>kiln:ready</code> 批准的是 Issue 编号而不是正文，之后改了正文，Agent 照新内容做。这些都只在信任边界被拉宽时才要紧（第三方 Bot 有推送权限、Agent 被提示注入、依赖里混进恶意代码）。</p>
<p>更大的风险不在代码里：只有一位人类维护者，设计文档在私有的 Outline 里，CI 日志不对外公开。</p>
</div>
