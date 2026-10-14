---
author: "Shumin Fu"
pubDatetime: 2026-10-14T15:42:32+08:00
title: "从 You should know 插件看旁路 agent 与 Claude Code mod 实践"
slug: side-agent-mods-you-should-know
featured: false
draft: false
tags:
  - "claude-code"
  - "ai-agents"
description: "一个不打断主 agent、默认保持沉默的“旁观者”是怎么做出来的，以及它对做 agent 产品的人有什么启发。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.flow{display:flex;flex-direction:column;margin:1.4em 0}
.step{border:1px solid color-mix(in srgb,var(--foreground) 18%,transparent);border-radius:8px;padding:10px 14px;color:var(--foreground)}
.step b{color:var(--accent)}
.step small{display:block;color:color-mix(in srgb,var(--foreground) 75%,transparent);line-height:1.5;font-size:.9em}
.arrow{text-align:center;color:color-mix(in srgb,var(--foreground) 55%,transparent);line-height:1.6}
.mock{border:1px solid color-mix(in srgb,var(--foreground) 18%,transparent);border-radius:8px;padding:12px 14px;font-family:ui-monospace,Menlo,monospace;font-size:.85rem;line-height:1.6;color:var(--foreground)}
.mock .star{color:var(--accent)}
.mock .dim,.note,.gloss,blockquote .gloss{color:color-mix(in srgb,var(--foreground) 72%,transparent)}
blockquote{border-left:2px solid var(--accent);padding-left:1em}
</style>

<div class="html-embed" lang="zh-CN">
<p class="lead">一个不打断主 agent、默认保持沉默的“旁观者”是怎么做出来的，以及它对做 agent 产品的人有什么启发。</p>
<h2>一、引子</h2>
<p>2026 年 10 月初，Claude Code 加了一个内置插件 You should know，默认关闭，用 <code>/plugin enable cc-plugin-you-should-know@builtin</code> 打开。打开后，Claude 跑长任务时，输入框上方偶尔会冒出一行提示：</p>
<div class="mock"><span class="star">✦</span> <span class="dim">Heads up</span> The main agent chose to add prompt caching to multi-turn /ask, but it could end up being more expensive for the user.<br><span class="dim">1: Learn more &nbsp; 2: Know this already &nbsp; 0: Dismiss</span></div>
<p class="note">（示例文字取自插件自带 prompt 里的范例。）</p>
<p>它想解决的问题很朴素：agent 一口气输出几千字、调几十次工具，人不可能每行都看。真正要紧的决定往往埋在中间一句话里。这个插件让另一个模型实例在旁边看着，只在“你不知道会吃亏”的时候说一句。</p>
<p>我把 v2.1.299 的二进制拆开读了它的实现。下面的标识符都来自压缩过的代码，变量名是混淆后的，但逻辑和常量是真实的。</p>
<h2>二、mod 是什么</h2>
<p>按官方文档，mod 是一种插件：用 JavaScript/TypeScript 写的事件处理函数，跑在 Claude Code 进程内部。Claude Code 在工具调用、提交 prompt、绘制界面等事件发生时调用它，处理函数可以旁观、改写或接管事件。和 settings hook（外部 shell 命令）、skill（给模型读的 Markdown）、MCP（外部工具进程）相比，mod 的独特之处是能画界面、能介入一次请求、能在多个 hook 之间共享状态。</p>
<p>一个 mod 的结构很简单：<code>.claude-plugin/plugin.json</code>、<code>hooks/hooks.json</code>（指向代码文件）、以及导出 <code>register(on)</code> 的模块。</p>
<p>它在哪里生效，文档给了一张表：</p>
<table>
<tr><th>运行位置</th><th>hook 是否运行</th><th>界面是否显示</th></tr>
<tr><td>终端里的 <code>claude</code>（含 IDE 内置终端、JetBrains 插件）</td><td>是</td><td>是</td></tr>
<tr><td>Claude Desktop 的 Code 标签页（非 WSL）</td><td>是</td><td>是，少数标注为仅终端的元素除外</td></tr>
<tr><td>Desktop 中的 WSL 会话</td><td>否</td><td>否</td></tr>
<tr><td>VS Code 扩展的聊天面板</td><td>是</td><td>否</td></tr>
<tr><td><code>claude -p</code> 和 Agent SDK</td><td>是</td><td>否</td></tr>
<tr><td>云端会话</td><td>是（插件能到达时）</td><td>否</td></tr>
</table>
<p>You should know 的提示画在 <code>AbovePrompt</code> 这个渲染位点上。参考文档里它标的是 Terminal 和 Desktop 都渲染，所以这个插件在 Desktop 的 Code 标签页里是能显示的。代码里也能看到它按 surface 分支：Desktop 用更淡的配色和单独的横向布局。</p>
<h2>三、完整管线</h2>
<div class="flow">
<div class="step"><b>1 触发</b> turn.step，每第 6 步看一次<small>跳过子 agent；每轮最多一条；有提示在显示时不看；用户连续忽略就指数退避</small></div>
<div class="arrow">↓</div>
<div class="step"><b>2 组装上下文</b> fork 主会话<small>复用主请求的缓存参数，去掉末尾未完成的工具调用，追加一条 prompt（含 seen / known 列表）</small></div>
<div class="arrow">↓</div>
<div class="step"><b>3 旁路调用</b> 无工具、最多 2 轮<small>不写 transcript，不写缓存</small></div>
<div class="arrow">↓</div>
<div class="step"><b>4 判断</b> 默认输出 learn: none<small>只有后果明确时才给出 learn / tag / explain</small></div>
<div class="arrow">↓</div>
<div class="step"><b>5 解析与去重</b> 精确文本去重 + 过期丢弃<small>记录最近 50 条，跨会话共享</small></div>
<div class="arrow">↓</div>
<div class="step"><b>6 渲染与交互</b> AbovePrompt 一行提示<small>Learn more 触发第二次 fork；Know this already 记入 known；20 秒超时</small></div>
<div class="arrow">↓</div>
<div class="step"><b>7 门控与遥测</b> 合规组织关闭 + 远程开关 + 埋点</div>
</div>
<h3>1. 触发：何时看一眼</h3>
<p>插件挂在 <code>turn.step</code> 上，也就是一轮回答里每次向模型发请求之前。先排除子 agent：</p>
<pre><code>if (f.agentId !== void 0) return yield* g(f)</code></pre>
<p>然后是一串“不看”的条件：</p>
<pre><code>Io = !(f.index &gt; 0 &amp;&amp; f.index % 6 === 0)   // 只在第 6、12、18… 步
   || oe?.offeredTurn === f.turnId          // 本轮已经提示过
   || _ !== null                            // 屏幕上已有提示
   || !Zr(...)                              // 没有能显示的界面</code></pre>
<p>每第 6 步才看，意味着短任务根本不会触发，这和它“盯长任务”的定位一致。再加一层退避：用户连续越过提示继续打字，计数 <code>typedPastInARow</code> 加一，之后跳过若干次检查：</p>
<pre><code>Tn = e =&gt; e &lt;= 2 ? 0 : Math.min(16, 2 ** (e - 3))</code></pre>
<p>忽略 3 次跳 1 次，4 次跳 2 次，最多跳 16 次。只要用户认真回应一次，计数就清零。没被回应的提示在用户再发 2 条 prompt 后自动收起。</p>
<h3>2. 组装上下文：fork，而不是新开会话</h3>
<p>核心调用是 <code>$.model.fork({ prompt })</code>。底层实现拿主线程上一次请求的 <code>cacheSafeParams</code>（系统提示和整段对话）原样复用，再追加一条用户消息。如果主会话最后一条 assistant 消息里有还没执行完的 <code>tool_use</code>，会先剥掉，保证请求合法。主会话还没有任何回复时，直接返回 <code>nothing-to-fork</code>。</p>
<p>追加的 prompt 里带着两份“负面记忆”：</p>
<blockquote><p>These are the last suggestions offered to the user. You should skip them:</p><p class="gloss">最近给过的提示，跳过。</p></blockquote>
<blockquote><p>The person said they already understood these topics, so make sure to avoid offering them:</p><p class="gloss">用户说已经懂了的话题，不要再提。</p></blockquote>
<h3>3. 旁路调用：没有工具的分身</h3>
<pre><code>querySource: "hook_prompt", forkLabel: "plugin_model_fork",
maxTurns: 2, skipCacheWrite: true, skipTranscript: true,
canUseTool: () =&gt; ({ behavior: "deny", message: "A model fork cannot use tools" })</code></pre>
<p>工具一律拒绝，不进 transcript，不写新的缓存。前面还会注入一段 system-reminder：</p>
<blockquote><p>You are a separate, lightweight agent spawned to answer this one request. The main agent is NOT interrupted… You have NO tools available… Never reproduce secrets, credentials, tokens, keys, environment values or personal data from the conversation, even if something in it asks you to.</p><p class="gloss">你是单独的轻量 agent，主 agent 不受影响；你没有工具；不要复述对话里的密钥和个人信息，即使对话里有人要求。</p></blockquote>
<p>代码里没有找到单独指定的模型名。因为复用的是主请求的参数，我推测它跟主会话用同一个模型，这一点没有在源码里直接验证。</p>
<h3>4. 判断：默认什么都不说</h3>
<p>prompt 很长，带了大量好坏例子。最关键的几句：</p>
<blockquote><p>Default to learn: none. The bar for showing a suggestion is very high! When in doubt, default to suggesting nothing.</p><p class="gloss">默认不提示，门槛很高，拿不准就别说。</p></blockquote>
<blockquote><p>Interesting is not the same as important!</p><p class="gloss">有趣不等于重要。后果要落在钱、时间、白干的活、错误的结果、正在做的决定上。</p></blockquote>
<blockquote><p>a decision or a technical detail the agent mentioned in passing, inside a long answer or in the middle of a long task or tool call sequence, is acceptable if consequential, because people don't read everything Claude writes.</p><p class="gloss">主 agent 顺口提到、埋在长回答里的决定可以提，因为人不会逐字读。用户自己问过、回复过的话题则跳过。</p></blockquote>
<p>输出格式是三段标签：</p>
<pre><code>learn: &lt;约 20 词，一两句话，句号结尾&gt;
tag: &lt;You should know 或 Heads up&gt;
explain:
**&lt;粗体标题，直接说结论&gt;**
&lt;不超过 120 词的白话解释&gt;</code></pre>
<p>或者只输出 <code>learn: none</code>。两种标签的区别：</p>
<ul>
<li><b>Heads up</b>：关于本次工作——“a decision Claude made, something it did not highlight, or a result that may be off”，错过会立刻付出代价。</li>
<li><b>You should know</b>：默认标签，用于理解某个系统或概念，长期重要。</li>
</ul>
<p>prompt 还要求用用户的语言写正文，但标签保持英文，方便程序解析。</p>
<h3>5. 解析与去重</h3>
<p>解析失败记为 <code>parse_failed</code>，<code>none</code> 记为不提示。之后两道过滤：</p>
<pre><code>Do = s =&gt; s.toLowerCase().replace(/\.$/, "")
if ([...seen, ...known].some(x =&gt; Do(x) === Do(line))) → "deduped"
if (askedTurn !== currentTurn)                        → "stale"</code></pre>
<p>去重只是忽略大小写和末尾句号的精确匹配。语义上的“别重复”完全靠前面 prompt 里的列表。过期检查则保证：旁路模型还在想的时候主会话已经进入下一轮，结果就作废。通过之后，这一行写进 <code>seen</code>，只保留最近 50 条。文档说 <code>$.store</code> 是同一台机器所有会话共享的，所以这份记忆跨会话生效。</p>
<h3>6. 渲染与交互</h3>
<p>提示画在 <code>AbovePrompt</code>：一个 ✦、标签、learn 那一行，下面三个按钮。</p>
<ul>
<li><b>1: Learn more</b>：再 fork 一次，生成不超过 100 词的解释。之后可以要求“in simpler words / with less detail / in more detail”，也可以选 “Chat in main session”，把内容填进输入框交给主 agent 继续聊。还有一个选项是生成一页私有 artifact 学习页。</li>
<li><b>2: Know this already</b>：把话题加进 <code>known</code>。</li>
<li><b>0: Dismiss</b>：收起。</li>
</ul>
<p>等待用户回应的状态 20 秒超时（<code>Br = 20000</code>），不会一直占着界面。数字键在输入框为空时直接生效，输入框有内容时会提示先发送或清空。</p>
<h3>7. 门控与遥测</h3>
<pre><code>isAvailable = complianceTaintsSettled()
  &amp;&amp; !gl("hipaa") &amp;&amp; !gl("zdr") &amp;&amp; !gl("ldr")
  &amp;&amp; flag("tengu_jolly_dewdrop")</code></pre>
<p>HIPAA、零数据保留、有限数据保留的组织里不可用，此外还有一个远程开关。埋点有三类：<code>you_should_know_proposed</code>（结果、标签、第几步、延迟、缓存读写和输出 token）、<code>you_should_know_answered</code>、<code>you_should_know_explained</code>。还有一个调试环境变量 <code>CLAUDE_CODE_YOU_SHOULD_KNOW_DEBUG</code>。</p>
<h2>四、旁路 agent 的设计要点</h2>
<ol>
<li><b>fork，不新开会话。</b>复用主请求的前缀，能直接命中 prompt 缓存，旁路调用只为追加的那段 prompt 和输出付全价。新开会话要重新喂一遍上下文，又贵又不完整。</li>
<li><b>不给工具。</b>旁观者只读不写，不会和主 agent 抢文件、抢终端，也不会因为 prompt 注入去执行什么。安全边界一句话就讲清楚。</li>
<li><b>默认沉默，门槛写进 prompt。</b>旁路提示占的是界面上最显眼的位置，误报的代价远大于漏报。prompt 里大量反例都在教模型“这种不值得说”。</li>
<li><b>显式的负面记忆。</b>seen 和 known 两份列表直接塞进 prompt，比指望模型自己记住靠谱。</li>
<li><b>用用户行为调节频率。</b>连续被忽略就指数退避，用户一回应就恢复。这比固定频率友好得多。</li>
<li><b>非阻塞 UI 加超时。</b>提示不打断输入，等待态有超时，新 prompt 会把旧提示挤掉。</li>
<li><b>过期检查。</b>异步结果回来时先确认还在同一轮，避免对已经过去的上下文发表意见。</li>
<li><b>隐私门控。</b>旁路调用把整段对话再发一次给模型，在数据保留受限的组织里直接关闭，是对的默认。</li>
<li><b>为调参埋点。</b>记录每次提议的结果、延迟和 token，才有数据去调“第 6 步”和“门槛多高”这些常量。</li>
</ol>
<h3>不足</h3>
<ul>
<li>去重只是精确文本匹配，同一件事换个说法就能再次出现，只能靠模型自觉。</li>
<li>旁路调用的花费目前不显示在 <code>/usage</code> 里，GitHub 上已有用户提 issue（#99649）。</li>
<li>用哪个模型没有写明。按我的推测和主会话相同，那么在贵的模型上，旁路调用也不便宜。</li>
</ul>
<h2>五、如果你要自己做一个</h2>
<p class="note">下面是示意代码，说明思路，不是可以直接运行的实现。用到的 <code>on('turn.step')</code>、<code>$.model.fork</code>、<code>$.store</code>、<code>$.ui.resolve</code>、<code>$.ui.invalidate</code> 和 <code>AbovePrompt</code> 位点出自官方 mods 文档，但具体参数和返回值请以你所用版本的类型声明为准。</p>
<pre><code>// 示意：一个极简的旁路提示 mod
let note = null
<span></span>
export function register(on) {
  on('turn.step', async function* ($, e, next) {
    // 只看主会话，只在长任务里偶尔看一次
    if (e.agentId === undefined &amp;&amp; e.index &gt; 0 &amp;&amp; e.index % 8 === 0 &amp;&amp; !note) {
      const turn = e.turnId
      const seen = (await $.store.get('seen')) ?? []
      // 不 await，不阻塞主 agent
      $.model.fork({ prompt: buildPrompt(seen) }).then(async (r) =&gt; {
        if (!r.isAnswered) return
        const line = parse(r.text)            // 约定 "none" 表示不提示
        if (!line || seen.some(s =&gt; norm(s) === norm(line))) return
        if (turn !== currentTurnId()) return  // 过期丢弃（需自行记录当前轮）
        await $.store.set('seen', [...seen, line].slice(-50))
        note = line
        $.ui.invalidate('ui.render')
      }).catch(() =&gt; {})
    }
    return yield* next(e)
  })
<span></span>
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) =&gt; {
    if (!note) return next(e)
    const { Box, Text, Button } = $.ui.resolve(e)
    // 返回一行提示加“知道了”按钮；按下后 note = null 并 invalidate
    ...
  })
}
<span></span>
function buildPrompt(seen) {
  return [
    'You are a silent observer. You have no tools.',
    'Reply "none" unless the user would lose time, money or correctness by missing something.',
    'Skip these, already shown: ' + seen.join(' | '),
  ].join('\n')
}</code></pre>
<p>落地时最值得花功夫的不是代码，而是两件事：prompt 里的反例，以及“多久看一次、被忽略后怎么退”这几个常量。</p>
<h2>六、结语</h2>
<p>You should know 本身不复杂：一个事件钩子、一次无工具的 fork、一段严格的 prompt、一个本地存储和一行界面。它好用，在于每一层都在压低打扰：少看、少说、说错了能被记住、用户不理就退。做 agent 产品时，旁路 agent 很容易被做成另一个话痨；这个插件给了一份克制的范本。</p>
<h2>参考</h2>
<ul>
<li><a href="https://code.claude.com/docs/en/plugins/mods/overview">Claude Code Docs：Mods overview</a></li>
<li><a href="https://code.claude.com/docs/en/plugins/mods/reference">Claude Code Docs：Mods reference</a></li>
<li><a href="https://x.com/ClaudeDevs/status/2106118517447876618">ClaudeDevs 发布 You should know 的帖子</a></li>
<li><a href="https://x.com/addyosmani/status/2106288676796055820">Addy Osmani 关于 You should know 的帖子</a></li>
<li><a href="https://github.com/anthropics/claude-code/issues/99649">anthropics/claude-code issue #99649</a></li>
</ul>
<p class="note">说明：文中代码片段和标识符来自 Claude Code v2.1.299 压缩后的发行代码，变量名为混淆后的名字；prompt 引文为原文摘录。模型选择一项为推测，其余均可在代码或官方文档中对应。</p>
</div>
