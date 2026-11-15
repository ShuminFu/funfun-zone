---
title: "Claude Code 桌面端的「后台任务」面板背后是怎么记录的"
description: "用一次多代理 workflow 的真实记录，讲清 fork 会复制什么、面板上的名字是谁写的、输出怎么对上任务。"
growth: seedling
planted: 2026-11-03T15:37:55+08:00
lastTended: 2026-11-03T15:56:57+08:00
tags:
  - "claude-code"
  - "ai-agents"
  - "workflow"
draft: false
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .note{border-left:2px solid var(--accent);padding-left:.8em}
.html-embed .oneline{border-left:2px solid var(--accent);padding-left:.8em;font-weight:600}
.html-embed .illus{margin:1.5em 0}
.html-embed .illus img{width:100%;max-width:640px;height:auto;border-radius:8px;border:1px solid color-mix(in srgb,var(--foreground) 15%,transparent);display:block;margin:0 auto}
.html-embed figcaption{font-size:.9em;opacity:.85;text-align:center;margin-top:.4em}
.html-embed .diagram{margin:1.5em 0}
.html-embed .diagram svg{width:100%;height:auto;display:block}
.html-embed .diagram rect{fill:color-mix(in srgb,var(--foreground) 5%,transparent);stroke:color-mix(in srgb,var(--foreground) 35%,transparent);stroke-width:1.2}
.html-embed .diagram .alt rect{stroke:var(--accent);stroke-width:1.6}
.html-embed .diagram line{stroke:var(--accent);stroke-width:1.6}
.html-embed .diagram text{fill:var(--foreground)}
.html-embed .diagram .t{font-size:15px;font-weight:600}
.html-embed .diagram .m{font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;opacity:.85}
.html-embed .tag{display:inline-block;font-size:.75em;line-height:1.5;padding:0 .45em;border-radius:4px;border:1px solid currentColor;margin-right:.2em;white-space:nowrap}
.html-embed .tag.ok{color:var(--accent)}
.html-embed .tag.guess{color:var(--status-warning)}
.html-embed .tag.unk{opacity:.7}
.html-embed td.num,.html-embed th.num{text-align:right;font-variant-numeric:tabular-nums}
</style>

<div class="html-embed" lang="zh">
<p class="subtitle">用一次多代理 workflow 的真实记录，讲清 fork 会复制什么、面板上的名字是谁写的、输出怎么对上任务。</p>
<p>我在 Claude Code 桌面端用 Workflow 工具跑一个多代理任务：先写代码，再找一个新代理审，再修一次，最后合进分支。跑到一半，我 fork 了一个新会话，然后冒出三个问题：</p>
<ol>
<li>fork 之后，正在跑的 workflow 会跟过来吗？</li>
<li>面板上那些名字，是后台有个小模型帮忙起的吗？</li>
<li>面板里的输出，是怎么和每一条任务对上的？</li>
</ol>
<p>我查了本机的文件和会话记录。文中标 <span class="tag ok">核实</span> 的是我在本机文件里亲眼看到的；标 <span class="tag guess">推断</span> 的是看现象猜的，程序源码我看不到。</p>
<h2>先说结论</h2>
<ul>
<li><strong>fork 只复制对话。</strong>正在跑的 workflow 不会跟过来，它留在原来那个会话里。代码目录也不复制，两个会话改的是同一份文件。side chat（<code>btw:</code>）在磁盘上和 fork 一样，也是一个抄了对话的新会话。</li>
<li><strong>名字不是小模型起的。</strong>workflow 卡片上的名字，是写脚本的模型写进脚本的。Finished 列表里的每一条，是跑命令的模型自己填的一句说明。</li>
<li><strong>输出靠一个编号挂上去。</strong>每次调用工具都有一个 id，结果带着同一个 id 回来。后台命令还会多一个输出文件，所以面板能点开看；前台命令没有这个文件，面板就显示 "No output captured"。</li>
</ul>
<figure class="illus">
<picture><source type="image/avif" srcset="/images/posts/claude-code-background-tasks-panel/fig-01.avif"><img src="/images/posts/claude-code-background-tasks-panel/fig-01.webp" alt="Background tasks 面板：上半是 workflow 卡片 im-multi-device-ticket-09，有 Implement、Verify、Fix 三个阶段，分别对应 impl:09、verify:09、fix:09；下半是 Finished 91 列表" loading="lazy" width="961" height="1393" decoding="async"></picture>
<figcaption>Background tasks 面板。上半是 workflow 卡片，下半是 Finished 列表。</figcaption>
</figure>
<h2>一张图看懂这些记录放在哪</h2>
<p>可以把它想成一个文件柜：一个项目一个抽屉，一个会话一个文件夹，里面再分小袋子。</p>
<figure class="diagram">
<svg viewBox="0 0 720 470" role="img" aria-label="记录分层图：项目目录、会话、workflow 运行、journal 与 agent jsonl、tool_use 与 tool_result；后台任务另有 task-id 与 .output 文件">
<g class="box">
<rect x="20" y="16" width="680" height="54" rx="8"/>
<text x="36" y="40" class="t">项目（一个抽屉）</text>
<text x="36" y="60" class="m">~/.claude/projects/-Users-me-work-myproject/</text>
</g>
<g class="box">
<rect x="50" y="90" width="620" height="54" rx="8"/>
<text x="66" y="114" class="t">会话（一个文件夹）</text>
<text x="66" y="134" class="m">&lt;会话id&gt;.jsonl  +  &lt;会话id&gt;/  （workflows/scripts/*.js 在这里）</text>
</g>
<g class="box">
<rect x="80" y="164" width="560" height="54" rx="8"/>
<text x="96" y="188" class="t">一次 workflow 运行（一个小袋子）</text>
<text x="96" y="208" class="m">&lt;会话id&gt;/subagents/workflows/&lt;run id&gt;/</text>
</g>
<g class="box">
<rect x="80" y="238" width="270" height="62" rx="8"/>
<text x="96" y="262" class="t">journal.jsonl</text>
<text x="96" y="284" class="m">每个子代理的最终结果</text>
</g>
<g class="box">
<rect x="370" y="238" width="270" height="62" rx="8"/>
<text x="386" y="262" class="t">agent-&lt;id&gt;.jsonl</text>
<text x="386" y="284" class="m">每个子代理的完整过程</text>
</g>
<g class="box">
<rect x="370" y="320" width="270" height="62" rx="8"/>
<text x="386" y="344" class="m">tool_use  id=toolu_…</text>
<text x="386" y="366" class="m">tool_result  tool_use_id=toolu_…</text>
</g>
<g class="box alt">
<rect x="80" y="320" width="270" height="130" rx="8"/>
<text x="96" y="344" class="t">后台命令多一条线</text>
<text x="96" y="368" class="m">run_in_background: true</text>
<text x="96" y="390" class="m">→ task-id</text>
<text x="96" y="412" class="m">→ tasks/&lt;task-id&gt;.output</text>
<text x="96" y="434" class="m">面板能点开看输出</text>
</g>
<g class="link">
<line x1="360" y1="70" x2="360" y2="90"/>
<line x1="360" y1="144" x2="360" y2="164"/>
<line x1="215" y1="218" x2="215" y2="238"/>
<line x1="505" y1="218" x2="505" y2="238"/>
<line x1="505" y1="300" x2="505" y2="320"/>
<line x1="370" y1="351" x2="350" y2="351"/>
</g>
</svg>
<figcaption>从上到下：项目 → 会话 → workflow 运行 → 两种记录 → 工具调用和结果。左下是后台命令独有的输出文件。</figcaption>
</figure>
<h2>发现一：fork 出来的会话复制了什么</h2>
<h3>看到什么</h3>
<p>比喻：<strong>复印了一本笔记，换了一个新本子，但人还坐在同一张桌子前。</strong>笔记是对话记录，新本子是新的会话文件夹，桌子是代码目录。</p>
<figure class="illus"><picture><source type="image/avif" srcset="/images/posts/claude-code-background-tasks-panel/fig-02-800.avif 800w, /images/posts/claude-code-background-tasks-panel/fig-02.avif 1200w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/claude-code-background-tasks-panel/fig-02.webp" alt="一个机器人在复印笔记，另一个拿着复印出的新本子，两个人坐在同一张桌子前，伸手去拿同一叠纸" loading="lazy" width="1200" srcset="/images/posts/claude-code-background-tasks-panel/fig-02-800.webp 800w, /images/posts/claude-code-background-tasks-panel/fig-02.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" height="675" decoding="async"></picture><figcaption>fork 复制了笔记，换了新本子，可两个人还在同一张桌子上干活。</figcaption></figure>
<ul>
<li><span class="tag ok">核实</span> 会话记录放在 <code>~/.claude/projects/&lt;项目路径转成短横线&gt;/</code>，按工作目录分开，例如 <code>-Users-me-work-myproject</code>。</li>
<li><span class="tag ok">核实</span> 每个会话有一个 <code>&lt;会话id&gt;.jsonl</code>（对话记录），加一个同名文件夹。</li>
<li><span class="tag ok">核实</span> 原会话的文件夹里有 <code>workflows/scripts/*.js</code>（每次 workflow 的脚本），还有 <code>subagents/workflows/&lt;run id&gt;/</code>。后者放着 <code>journal.jsonl</code> 和一堆 <code>agent-&lt;id&gt;.jsonl</code>。</li>
<li><span class="tag ok">核实</span> fork 出来的新会话只复制了对话记录。它的文件夹里只有 <code>subagents/</code> 和 <code>custom-title.json</code>，<strong>没有 <code>workflows/</code></strong>。</li>
<li><span class="tag ok">核实</span> 新会话有自己的草稿目录：<code>/private/tmp/claude-501/&lt;项目&gt;/&lt;会话id&gt;/scratchpad</code>。</li>
<li><span class="tag ok">核实</span> 代码目录不复制。两个会话改的是磁盘上同一份文件。</li>
</ul>
<h3>为什么</h3>
<p>正在跑的 workflow 活在原会话那个进程里。fork 复制的是「说过的话」，不是「正在干的活」。</p>
<h3>实例</h3>
<p>我在新会话里试着接着跑（resume）那个 workflow，报错：</p>
<pre><code>journal … is not on disk</code></pre>
<p>可就在那时，原会话里的 <code>fix:09</code> 代理还在往自己的记录里写东西，30 秒前刚写过一行。也就是说，活没停，只是新会话找不到它的账本。</p>
<p class="note">这时如果两边都去动同一个 worktree，就是两个人在同一张桌子上改同一张纸。</p>
<h3>side chat 也是同一回事</h3>
<p>桌面端还有一种「side chat」，标题以 <code>btw:</code> 开头。它和 fork 在磁盘上没有区别：都没有单独的接口，都只是一个新的会话 id，配一个新的 <code>.jsonl</code> 和同名文件夹。</p>
<ul>
<li><span class="tag ok">核实</span> side chat 的标题记在 <code>&lt;会话id&gt;/custom-title.json</code> 的 <code>customTitle</code> 里，例如 <code>{"customTitle":"btw: side chat 在文件路径里是什么接口"}</code>。fork 的标题也记在这里，例如 <code>"Open IM 分析 (fork)"</code>。</li>
<li><span class="tag ok">核实</span> 行和行之间照样用 <code>parentUuid</code> 串成链。行的 <code>type</code> 有 <code>user</code>、<code>assistant</code>、<code>attachment</code>、<code>api-request</code> 等。</li>
</ul>
<p>比喻：<strong>把整本笔记从第一页起原样复印，再在复印本后面接着写。</strong>真名可以叫「全量复印 + 在分叉点之后续写」。我把三份文件逐行对了一遍：</p>
<table>
<thead><tr><th>会话</th><th>标题</th><th class="num">和原会话逐行相同</th><th class="num">第一条自己的行</th></tr></thead>
<tbody>
<tr><td>原会话 <code>f1b44925-…</code></td><td></td><td class="num">共 3,646 行</td><td class="num">—</td></tr>
<tr><td>fork <code>86ce7ad8-…</code></td><td>Open IM 分析 (fork)</td><td class="num">第 1–3,536 行</td><td class="num">第 3,538 行</td></tr>
<tr><td>side chat <code>74f37069-…</code></td><td>btw: side chat 在文件路径里是什么接口</td><td class="num">第 1–3,646 行</td><td class="num">第 3,650 行</td></tr>
</tbody>
</table>
<ul>
<li><span class="tag ok">核实</span> <strong>从第 1 行开始抄，一字不差。</strong>抄来的行还带着原会话的 <code>sessionId</code>。side chat 一直抄到原会话的最后一行；fork 开得更早，抄到第 3,536 行。</li>
<li><span class="tag ok">核实</span> <strong>两者的第一条自己的行，都是 <code>type=custom-title</code></strong>，也就是先记下自己的标题。中间夹着一两行没有 <code>sessionId</code> 的记录（例如 <code>bridge-session</code>）。</li>
<li><span class="tag ok">核实</span> <strong>抄的是全量，不是从摘要开始。</strong>原会话中间压缩过 3 次（第 1,227、1,960、3,179 行是 <code>compact_boundary</code>），压缩之前的旧行也一起抄了。</li>
<li><span class="tag guess">推断</span> <strong>但模型看到的不是全量。</strong>恢复会话时，只加载最近一次压缩摘要之后的内容。所以 side chat 用起来像一个「新上下文」：它记得最近的工作，更早的只剩摘要。这一点从磁盘上看不出来，是根据压缩的设计推的。</li>
</ul>
<p>所以 side chat 和 fork 的机制相同，区别只有两处：从哪一行分叉，标题前面有没有 <code>btw:</code>。它们都只抄对话，不抄原会话正在跑的 workflow、后台任务和它们的 journal，也就接不上原会话的 workflow。行号是我写这篇时数的，各个会话后来还在继续写。</p>
<h2>发现二：面板上的名字是谁写的</h2>
<h3>看到什么</h3>
<p>比喻：<strong>每个干活的人进门前，自己在登记本上写一句「我要去做什么」。</strong>没有专门的秘书替他们写。</p>
<figure class="illus"><picture><source type="image/avif" srcset="/images/posts/claude-code-background-tasks-panel/fig-03-800.avif 800w, /images/posts/claude-code-background-tasks-panel/fig-03.avif 1200w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/claude-code-background-tasks-panel/fig-03.webp" alt="一排机器人排队，每个都拿着笔，在门口的登记本上自己写一句，然后走进门" loading="lazy" width="1200" srcset="/images/posts/claude-code-background-tasks-panel/fig-03-800.webp 800w, /images/posts/claude-code-background-tasks-panel/fig-03.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" height="675" decoding="async"></picture><figcaption>面板上的每一行，都是干活的模型进门前自己写下的。</figcaption></figure>
<table>
<thead><tr><th>面板上的位置</th><th>例子</th><th>从哪来</th><th>谁写的</th></tr></thead>
<tbody>
<tr><td>workflow 卡片标题</td><td><code>im-multi-device-ticket-09</code></td><td>脚本里的 <code>meta.name</code></td><td>写脚本的模型</td></tr>
<tr><td>卡片下面那段描述</td><td>Implement IM multi-device ticket 09 …</td><td><code>meta.description</code></td><td>写脚本的模型</td></tr>
<tr><td>阶段名</td><td>Implement / Verify / Fix</td><td><code>meta.phases</code> 和 <code>phase()</code></td><td>写脚本的模型</td></tr>
<tr><td>代理标签</td><td><code>impl:09</code></td><td><code>agent()</code> 的 <code>label</code> 参数</td><td>写脚本的模型</td></tr>
<tr><td>Finished 列表的每一条</td><td>Red check for lazy claw_peek</td><td>Bash 工具的 <code>description</code> 字段</td><td>跑这条命令的模型</td></tr>
</tbody>
</table>
<h3>为什么</h3>
<ul>
<li><span class="tag ok">核实</span> 前四行都能在 <code>workflows/scripts/*.js</code> 里原样找到。</li>
<li><span class="tag ok">核实</span> Bash 工具每次调用都<strong>必须填</strong> <code>description</code>。工具说明要求用主动语态，大约 5–10 个词。面板上的那一行，就是这个字段原样显示。</li>
</ul>
<p>所以面板上的字，不是事后有人看了日志再总结的，而是干活的模型在动手之前自己写下的。</p>
<p class="note"><span class="tag unk">未知</span> 对话流里还有一种折叠起来的一行小结，例如 "Created ticket 09 worktree from feat"。它是怎么生成的，从模型这边看不到，这里不下结论。</p>
<h2>发现三：输出怎么和任务对上</h2>
<h3>看到什么</h3>
<p>比喻：<strong>寄快递时贴一张单号，回件上印着同一个单号。</strong>拿两个单号一对，就知道哪个回件属于哪次寄件。</p>
<figure class="illus"><picture><source type="image/avif" srcset="/images/posts/claude-code-background-tasks-panel/fig-04-800.avif 800w, /images/posts/claude-code-background-tasks-panel/fig-04.avif 1200w" sizes="(max-width: 768px) 100vw, 760px"><img src="/images/posts/claude-code-background-tasks-panel/fig-04.webp" alt="机器人寄出贴着标签的包裹，回来的包裹贴着一样的标签，放大镜显示两个标签对上了" loading="lazy" width="1200" srcset="/images/posts/claude-code-background-tasks-panel/fig-04-800.webp 800w, /images/posts/claude-code-background-tasks-panel/fig-04.webp 1200w" sizes="(max-width: 768px) 100vw, 760px" height="675" decoding="async"></picture><figcaption>tool_use 的 id 就是单号，tool_result 带着同一个单号回来。</figcaption></figure>
<p>真名叫 tool_use id。子代理的 <code>.jsonl</code> 是一行一条 JSON。下面是 <code>agent-a6ecd6ce8367a0647.jsonl</code> 里挨着的两行（<span class="tag ok">核实</span>，命令和 id 有删节）：</p>
<pre><code>第 374 行  type=assistant
{"type":"tool_use","name":"Bash","id":"toolu_01JnowgQXg…",
 "input":{"description":"Red check for never-reaches-gate drop",
          "command":"cd …/im-md-09 &amp;&amp; sed -i '' 's/…/if false \&amp;\&amp; …/' …"}}
<span></span>
第 375 行  type=user
{"type":"tool_result","tool_use_id":"toolu_01JnowgQXg…", "content":
 "--- FAIL: TestIMDispatch_RedriveThatNeverReachesGateIsDropped (0.02s)
  … want the row dropped without another redrive"}</code></pre>
<ul>
<li>第 375 行的 <code>tool_use_id</code> 和第 374 行的 <code>id</code> 一样，这就是「单号」。</li>
<li>这是一次「先去掉修复，看测试会不会变红」的红测。测试确实红了，输出也确实存在。</li>
<li>每行还带着 <code>agentId</code>、<code>cwd</code>、<code>gitBranch</code>、<code>isSidechain</code>，以及 <code>parentUuid</code>（指向上一行，把各行串成一条链）。</li>
</ul>
<figure class="illus">
<picture><source type="image/avif" srcset="/images/posts/claude-code-background-tasks-panel/fig-05.avif"><img src="/images/posts/claude-code-background-tasks-panel/fig-05.webp" alt="Finished 列表里 Red check for never-reaches-gate drop 展开后显示 No output captured；下一条 Build and start peer imB on feat 标为 Failed" loading="lazy" width="944" height="144" decoding="async"></picture>
<figcaption>同一条红测，面板上却显示 "No output captured"。</figcaption>
</figure>
<h3>为什么面板上看不到</h3>
<p>同一条命令，jsonl 里有输出，面板上却没有。区别在于它是前台跑的还是后台跑的。</p>
<ul>
<li><span class="tag ok">核实</span> <strong>后台命令</strong>（<code>run_in_background: true</code>）多一条线。它跑完时的通知里有这几样：
<pre><code>&lt;task-id&gt;b3q1esfqv&lt;/task-id&gt;
&lt;tool-use-id&gt;toolu_01NNGh…&lt;/tool-use-id&gt;
&lt;output-file&gt;…/tasks/b3q1esfqv.output&lt;/output-file&gt;
&lt;status&gt;failed&lt;/status&gt;</code></pre>
输出写进了单独的 <code>.output</code> 文件，面板可以去读。</li>
<li><span class="tag ok">核实</span> <strong>前台命令</strong>没有这个文件。输出只交回给跑它的那个模型，记在它自己的 jsonl 里。</li>
<li><span class="tag guess">推断</span> 所以面板对前台命令显示 "No output captured"。依据是：我看到的标着 No output captured 的条目，正好都是前台命令。面板的源码我看不到。</li>
</ul>
<h3>那个 "Failed" 不是真出错</h3>
<p>截图里 "Build and start peer imB on feat" 标成 Failed。它跑的是 <code>dev.sh peer</code>，这个命令会一直挂着跟日志。测完以后按进程号把它停掉，命令就以 exit 1 结束，面板于是记成 Failed。这里的 Failed 只说明退出码不是 0，不说明活没干成。</p>
<h2>给使用者的建议</h2>
<ul>
<li><strong>fork 之后，两边别同时动同一个 worktree。</strong>fork 只复制对话，代码目录是共用的。正在跑的 workflow 也只在原会话里。</li>
<li><strong>想在面板里看到输出，就用后台命令。</strong>后台命令有自己的 <code>.output</code> 文件，面板能点开。</li>
<li><strong>红测的输出要去 agent jsonl 里找。</strong>到 <code>subagents/workflows/&lt;run id&gt;/agent-&lt;id&gt;.jsonl</code>，用面板上那句 description 搜到 <code>tool_use</code>，再看下一行 <code>tool_use_id</code> 相同的 <code>tool_result</code>。</li>
<li><strong>Failed 先看是不是自己停的。</strong>长期挂着的命令被手动停掉，也会显示 Failed。</li>
</ul>
<p class="oneline">一句话：面板上的名字是干活的模型自己写的，输出靠 tool_use id 挂回去，后台命令才有面板能读的输出文件，而 fork 只复印对话，不复印正在跑的活和代码目录。</p>
</div>
