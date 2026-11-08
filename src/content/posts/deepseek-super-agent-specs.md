---
title: "DeepSeek Super-agent 概念规格笔记"
description: "据 DeepSeek Harness 原文整理的规格笔记：四大特征、五大模块、实验数字与开放问题。"
growth: seedling
planted: 2026-11-08T14:13:29+08:00
draft: false
tags:
  - "notes"
  - "ai-agents"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Companion CSS for --native embed on FunFun Zone */
.html-embed .callout {
  border-left: 3px solid var(--accent);
  border-right: 1px solid color-mix(in srgb, var(--foreground) 18%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--foreground) 18%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--foreground) 18%, transparent);
  padding: 14px 16px;
  margin: 0 0 1.4rem;
  background: transparent;
}
.html-embed .callout p { margin: 0 0 0.55rem; color: var(--foreground); }
.html-embed .callout p:last-child { margin-bottom: 0; }
.html-embed .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 1.2rem; }
.html-embed .chip {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem; padding: 4px 10px; border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--foreground) 22%, transparent);
  color: var(--foreground); font-weight: 650;
}
.html-embed .pill {
  display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.95rem; font-weight: 700; padding: 3px 10px; border-radius: 999px;
  background: #1f1a14; color: #fffdf8; line-height: 1.4; vertical-align: middle;
}
html[data-theme="dark"] .html-embed .pill {
  background: #f3ede3; color: #16130f;
}
.html-embed .pill.mod { background: #1f3d5c; color: #fffdf8; }
html[data-theme="dark"] .html-embed .pill.mod { background: #a8c8e8; color: #102030; }
.html-embed .pill.feat { background: #1f5c3a; color: #fffdf8; }
html[data-theme="dark"] .html-embed .pill.feat { background: #a8d8b8; color: #102818; }
.html-embed .pill.num { background: #7a3d12; color: #fffdf8; }
html[data-theme="dark"] .html-embed .pill.num { background: #f0c090; color: #301808; }
.html-embed .pill.open { background: #4a2a6a; color: #fffdf8; }
html[data-theme="dark"] .html-embed .pill.open { background: #d0b8e8; color: #201028; }
.html-embed table {
  width: 100%; border-collapse: collapse; margin: 0.6rem 0 1.1rem;
  font-size: 0.95rem;
  border: 1px solid color-mix(in srgb, var(--foreground) 18%, transparent);
}
.html-embed th, .html-embed td {
  border-bottom: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent);
  padding: 0.55rem 0.7rem; text-align: left; vertical-align: top;
  color: var(--foreground);
}
.html-embed th {
  font-weight: 700; font-size: 0.85rem;
  background: color-mix(in srgb, var(--foreground) 8%, transparent);
}
.html-embed tr:last-child td { border-bottom: none; }
.html-embed td.k { font-weight: 700; white-space: nowrap; width: 7.5em; }
.html-embed .note {
  font-size: 0.9rem; color: var(--foreground); opacity: 0.85;
  margin: -0.2rem 0 1rem;
}
.html-embed footer {
  margin-top: 2rem; padding-top: 0.9rem;
  border-top: 1px solid color-mix(in srgb, var(--foreground) 18%, transparent);
  font-size: 0.8rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--foreground); opacity: 0.8;
}
</style>

<div class="html-embed" lang="zh-CN">
<div class="wrap">
  <p class="kicker">notes · deepseek harness · super-agent</p>
  <p class="lede">据 DeepSeek Harness 原文整理的规格笔记：把四大基础特征、五大模块及其子规格、实验数字与开放问题列成规格表，便于查阅。</p>
  <div class="chips">
    <span class="chip">规格笔记</span>
    <span class="chip">非产品说明书</span>
    <span class="chip">2026-10-31</span>
    <span class="chip">原型：dsh-superagent-prototype</span>
  </div>
  <div class="callout">
    <p><strong>出处与声明</strong></p>
    <p>权威规格来源：DeepSeek Harness《<a href="https://www.bilibili.com/opus/1265361021143351318">Super-agent 设计探索：迈向更自主的 Agent 系统</a>》（编辑于 2026-10-31）。原文明确声明：这是面向工程实践的架构思路探讨，并非对 DeepSeek Harness 现有产品功能的介绍。</p>
    <p>讲解入口：程序员鱼皮 B 站视频《<a href="https://www.bilibili.com/video/BV1kr4h6fExw/">DeepSeek 新出的 Super Agent 是什么？真有用么？</a>》（BV1kr4h6fExw）。本笔记以 opus 全文为规格依据；鱼皮口述只作讲解侧重与例子，不把口述当成原文没有的规格。</p>
    <p>验证原型：GitHub <code>dsh-superagent-prototype</code>（验证技术路线的原型，并非 DeepSeek 正式产品）。</p>
  </div>
  <h2>1. 要解决什么问题</h2>
  <p>原文指出：主流 Agent 仍以单一 Session 为基本单位，不同 Session 彼此独立。用户并行推进多项工作时，必须手动切换并记住各 Session 上下文。据作者观察，一个人通常只能同时跟进 <strong>3 到 5 个</strong>活跃 Session。</p>
  <p>因此出现上下限分工：单任务的上限取决于模型能力；多任务的上限取决于人的注意力。若只在本地单会话 Agent 上用 CLI、MCP 或外部连接器做简单扩展，系统仍会受制于单会话同步阻塞、多任务上下文混乱，以及本地设备离线即停止运行等问题。</p>
  <p>Super-agent 的目标，是打破 Agent 与单次手动会话的绑定，使其成为能跨会话保持上下文、同时推进多项复杂任务且互不干扰的连续实体。</p>
  <table class="cmp">
    <thead>
      <tr><th>维度</th><th>单 Session ReAct</th><th>Super-agent</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">组织单位</td>
        <td>用户手动管理多个 Session</td>
        <td>底层多会话对用户隐藏；用户面对同一个连续实体</td>
      </tr>
      <tr>
        <td class="k">驱动方式</td>
        <td>人类逐条提示词</td>
        <td>环境半结构化事件（Trigger）</td>
      </tr>
      <tr>
        <td class="k">并发</td>
        <td>单 Loop 串行；或新开 Session 后上下文割裂</td>
        <td>Router 协调 + Worker 隔离并发</td>
      </tr>
      <tr>
        <td class="k">在线</td>
        <td>常绑本地设备生命周期</td>
        <td>云端 Loop + 状态库 + 端侧 daemon；Watchdog 自愈</td>
      </tr>
    </tbody>
  </table>
  <h2>2. <span class="pill feat">四大基础特征</span></h2>
  <p>原文认为 Super-agent 具备以下四个基础特征。单个 ReAct Loop 无法同时支持这四点，因此需要相应架构。</p>
  <table>
    <thead>
      <tr><th>特征</th><th>定义（据原文）</th><th>例子</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">连续</td>
        <td>用户可直接在 IM、GitHub 评论等熟悉界面与它交互，感觉始终只存在一个 Agent，不必去想「Session X 的上下文中是否有 Y 信息」。</td>
        <td>用户先在 IM 上提出采用方案 A，随后在 GitHub Pull Request 评论里改为方案 B；它能理解并调整执行方向。<br><span class="note" style="display:block;margin:6px 0 0">鱼皮口述例子：内部实例上，有人在群里提「正文 / 代码 / 终端字体分开配置」，维护者 @ 后，它提交改进代码，并据群追问与 GitHub 建议推进到合并。</span></td>
      </tr>
      <tr>
        <td class="k">高效</td>
        <td>交互响应迅速，同时能并行、高质量地完成多个复杂任务。无需等上一个命令或任务完成，就能接受下一条指令。</td>
        <td>异步 ReAct：耗时工具立即返回 Started，前台对话与后台执行解耦。</td>
      </tr>
      <tr>
        <td class="k">主动</td>
        <td>无需等待用户逐条下达指令，能持续观察环境事件并主动推进值得处理的事项；不需要介入时则保持安静。</td>
        <td>持续观察公共群聊反馈，在无人 @ 的情况下主动定位根因并提交修复 Pull Request（原文内部实例描述）。</td>
      </tr>
      <tr>
        <td class="k">持久</td>
        <td>始终在线、直接接入用户真实工作环境，并在长期运行中遇到异常时自动恢复。</td>
        <td>云端无状态 Loop + DB 状态；端侧 daemon；外部 Watchdog Control Loop。</td>
      </tr>
    </tbody>
  </table>
  <h2>3. <span class="pill mod">五大模块</span>总览</h2>
  <p>原文认为以下五个模块构成支撑四大特征的基本框架：</p>
  <table>
    <thead>
      <tr><th>模块</th><th>主要支撑特征</th><th>一句话职责</th></tr>
    </thead>
    <tbody>
      <tr><td class="k">双层架构</td><td>连续 + 高效</td><td>Router 维护全局连续性与对外交互；Worker 隔离并发执行</td></tr>
      <tr><td class="k">事件驱动</td><td>主动</td><td>以 Trigger 驱动；过滤、路由、上下文注入、投机执行</td></tr>
      <tr><td class="k">面向人的交互</td><td>连续 + 高效</td><td>异步全双工 ReAct；按信道定制输出带宽</td></tr>
      <tr><td class="k">计算 / 状态 / 环境分离</td><td>持久</td><td>云端无状态 Loop + DB；端侧轻量 daemon；BYOM</td></tr>
      <tr><td class="k">Watchdog</td><td>持久</td><td>主系统外独立 Control Loop：基础设施 + 任务进展</td></tr>
    </tbody>
  </table>
  <p class="note">原文强调：Session 应当是系统的实现细节，而不应是用户的认知负担。</p>
  <h2>4. 模块规格详表</h2>
  <h3>4.1 双层架构 · Router vs Worker</h3>
  <table>
    <thead>
      <tr><th>规格点</th><th>Router 层</th><th>Worker 层</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">职责</td>
        <td>常驻全局路由；承接所有入口人类交互；充当全局序点（Sequence Point）、协调点与记忆；只做交互与任务分派，不直接执行具体任务</td>
        <td>具体执行；上下文彼此隔离；专注单一任务；向 Router 汇报，由 Router 统一对用户回复</td>
      </tr>
      <tr>
        <td class="k">工具</td>
        <td>甚至可以不配备 Bash 工具</td>
        <td>挂载完整执行工具</td>
      </tr>
      <tr>
        <td class="k">模型偏好</td>
        <td>实践中任务常没有想象中复杂；较轻量模型往往可兼顾速度与效果</td>
        <td>直接决定任务结果与代码质量；通常配置能力最强的模型</td>
      </tr>
      <tr>
        <td class="k">实现形态</td>
        <td>逻辑职责划分，不必限于单个 Session；作者选择单个常驻 LLM Session 作为核心实现</td>
        <td>内部可再创建 Subagent，或本身是 Agent Team；对上层 Router 透明</td>
      </tr>
      <tr>
        <td class="k">同层通信</td>
        <td>—</td>
        <td>同层 Worker 通常不直接通信；冲突多出现在共享工作环境（如同一 PR）；订阅同一 Thread 后可收到相同事件并自行协调；少数跨任务协同由 Router 中转</td>
      </tr>
    </tbody>
  </table>
  <h3>与常见 Agent Team 的差异</h3>
  <table>
    <thead>
      <tr><th>对比点</th><th>常见 Agent Team</th><th>Super-agent 双层</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">侧重点</td>
        <td>单个复杂任务内部的步骤拆解与角色协作</td>
        <td>任务之间的高层关联与分派；Router 不介入单任务内部拆解</td>
      </tr>
      <tr>
        <td class="k">Lead 负载</td>
        <td>子步骤耦合紧时，Team Lead 需深入细节、高频协调，推理负载重</td>
        <td>Router 只处理跨任务协调与对外交互</td>
      </tr>
      <tr>
        <td class="k">可视为同构的条件</td>
        <td colspan="2">若用提示词约束 Agent Team 主会话不亲自执行具体任务，仅负责对外交互并将不同任务分派给各成员独立推进，则可视为这种双层架构</td>
      </tr>
    </tbody>
  </table>
  <h3>Router 批处理（Batching）</h3>
  <ul>
    <li>上一轮推理期间到达的 Trigger 会积压，在下一轮一并处理。</li>
    <li>事件流平稳时：Trigger 逐条进入，单次响应延迟较低。</li>
    <li>事件密集、出现排队时：积压多条 Trigger 合并进一次 LLM 调用；Router 通常是长输入、短输出；Prefill 阶段并行计算，单次请求耗时增长远慢于 batch 大小。</li>
    <li>一定范围内：积压越多，单个决定分摊的推理时间越低；上限取决于上下文长度，以及模型在一轮中能准确处理多少条 Trigger。</li>
    <li>规模进一步扩大时：Router 内部可多层过滤或水平切分（Sharding）；切分越细，吞吐量越高，但分片间记忆与上下文连续性越低。全局记忆问题解决前，这一权衡始终存在。</li>
  </ul>
  <h3>4.2 事件驱动</h3>
  <p>驱动 Agent 的主要输入不再是人类在 Session 中逐条键入的提示词，而是环境中的半结构化事件。群聊消息、邮件与日程提醒、代码审查评论、CI 运行结果等，在 Super-agent 中称为 <strong>Trigger</strong>。</p>
  <h3>3.1 事件过滤 · Fast Path / Slow Path</h3>
  <table>
    <thead>
      <tr><th>层级</th><th>路径</th><th>规格</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">程序层策略</td>
        <td>Fast Path</td>
        <td>针对事件来源、群组范围、用户或机器人白名单等确定性条件，用代码做快速准入检查；可设「仅响应明确请求」「作为候选事件」「直接忽略」等，在调用模型前滤除大部分无关消息</td>
      </tr>
      <tr>
        <td class="k">语义层策略</td>
        <td>Slow Path</td>
        <td>通过程序层的候选事件交给 LLM；按提示词策略与上下文判断是否需要行动；同时作为面向人类的自然语言扩展点，便于用提示词开关或新增策略</td>
      </tr>
    </tbody>
  </table>
  <p class="note">鱼皮讲解类比：门口门卫（程序快路径）+ 后面秘书（模型慢路径）。这是讲解类比，不是额外规格。</p>
  <h3>3.2 事件路由 · Thread 订阅 / 直通</h3>
  <table>
    <thead>
      <tr><th>规格点</th><th>说明</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">Thread</td>
        <td>同一 GitHub Pull Request、同一 IM 话题或同一封往来邮件串下的连续事件构成一条事件流</td>
      </tr>
      <tr>
        <td class="k">已订阅（Fast）</td>
        <td>Router 据初始事件创建 Worker 后，Worker 订阅对应 Thread；同一 Thread 后续事件由程序直通已订阅 Worker，无需 Router 再工具转发。若新事件超出当前任务范围，Worker 可取消订阅或交回 Router 重新分派</td>
      </tr>
      <tr>
        <td class="k">未订阅（Slow）</td>
        <td>Router 仍可观测所有事件以掌握全局状态，但仅负责判断和分派尚未被订阅的新事件</td>
      </tr>
      <tr>
        <td class="k">多对多订阅</td>
        <td>一个 Worker 可订阅多个相关 Thread；同一 Thread 也可被多个 Worker 订阅。交集场景下新事件同时直通所有订阅者，使它们无需点对点通信即可获知彼此操作并解决冲突。输出侧仍由 Worker 向 Router 汇报关键结论</td>
      </tr>
    </tbody>
  </table>
  <h3>3.3 上下文组织 · Inline &amp; Spill · 链式召回</h3>
  <table>
    <thead>
      <tr><th>规格点</th><th>说明</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">原则</td>
        <td>将有限上下文窗口当作 Cache 管理。浪费上下文窗口，就是浪费模型的智能</td>
      </tr>
      <tr>
        <td class="k">Inline</td>
        <td>将近期很可能用到的信息直接内联进当前上下文，省去额外工具调用往返</td>
      </tr>
      <tr>
        <td class="k">Spill</td>
        <td>将超出窗口预算或低频使用的完整信息留在窗口外，仅保留引用或摘要，供模型按需读取</td>
      </tr>
      <tr>
        <td class="k">递进注入</td>
        <td>① 最少信息：当前对象 ID 与内容摘要；② 利用局部性逐步 Inline：紧密关联对象 ID，再附带时空相邻内容（如内容前 50 字、IM 前后相邻与所回复消息、代码评论所在讨论的相邻评论）；③ 超出上限则 Spill：截断并保留续读入口</td>
      </tr>
      <tr>
        <td class="k">链式召回</td>
        <td>为 Trigger、Thread、Worker Session 等赋予唯一 ID，注入时内联紧密关联对象 ID，构成引用图。每次工具召回对象同样遵循 Inline &amp; Spill，返回中再内联下一跳摘要与 ID，从而从当前事件沿引用关系多跳按需展开上下文</td>
      </tr>
    </tbody>
  </table>
  <h3>3.4 提前行动 · 投机执行</h3>
  <ul>
    <li>借鉴 Speculative Execution：在结果是否会被采用尚不确定时，根据环境信号在后台提前尝试；有价值则交付，无价值则丢弃。</li>
    <li>个人助手例子：收到会议邀约邮件或待办时，先在后台核对日程冲突、搜集背景并备好回复草稿，用户过目后即可确认发出。</li>
    <li>研发例子：内部用户群配置「静默复现并修复」策略——群里有人反馈问题或讨论改动时，Agent 先在后台尝试复现并寻找修复；只有确认问题并找到简单修复方案后才交付，否则全程安静。</li>
  </ul>
  <h3>4.3 面向人的交互</h3>
  <table>
    <thead>
      <tr><th>规格点</th><th>说明</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">经典阻塞</td>
        <td>经典 ReAct 中同步 run() 工具调用会阻塞循环，直到工具返回；期间会话无法响应新用户输入</td>
      </tr>
      <tr>
        <td class="k">异步 ReAct</td>
        <td>耗时命令与子任务改为异步；模型调用后立即收到「已启动（Started）」返回，循环不再等待；后台完成后结果作为新事件消息投递进会话；模型也可按上下文主动终止过长后台命令（cancel）</td>
      </tr>
      <tr>
        <td class="k">实现状态</td>
        <td>原文写明：这一异步任务机制已经在 DeepSeek Harness 中实现，但尚未默认开启</td>
      </tr>
      <tr>
        <td class="k">IM 信道</td>
        <td>低打扰轻量沟通；只在需要决策或验收时通知；只问直接问题、给简短结论；验证过的硬性规定：单次回复不超过 100 词</td>
      </tr>
      <tr>
        <td class="k">GitHub / 邮件 / 文档</td>
        <td>结构化、高信息密度异步交付；创建或更新 PR 时按项目规范写完整问题背景、改动说明与验证结果；个人助手场景可起草结构化邮件与文档摘要</td>
      </tr>
      <tr>
        <td class="k">输出隔离</td>
        <td>冗长推理与密集工具调用隔离在 Worker 内部，不直接输出到外部信道；由 Router 统一对外交互</td>
      </tr>
    </tbody>
  </table>
  <h3>4.4 计算、状态与环境的分离</h3>
  <table>
    <thead>
      <tr><th>步骤</th><th>规格</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">5.1 计算与状态</td>
        <td>推进 Agent Loop 的计算放入云端无状态弹性计算容器；Session 等持久化状态存入数据库。容器可水平扩展、重启或替换；连续性由持久化存储保障，从而摆脱单台本地设备生命周期限制</td>
      </tr>
      <tr>
        <td class="k">5.2 计算与环境</td>
        <td>Agent Loop 在云端运行；重状态执行环境留在原地。端侧部署不保存会话状态的轻量 daemon，只负责执行命令与返回结果</td>
      </tr>
      <tr>
        <td class="k">脑手分离对照</td>
        <td>与 Anthropic「Decoupling the brain from the hands」一致之处：harness 保持无状态，会话日志放在 harness 之外，通过统一接口按需接入执行环境。区别在于场景：那篇文章侧重托管服务中按需沙箱与客户 VPC；这里首先要接入用户日常使用、可能间歇在线的个人机器（含未提交修改与本地凭据）</td>
      </tr>
      <tr>
        <td class="k">BYOM</td>
        <td>Bring Your Own Machine：把用户日常开发机或个人电脑接入云端 Agent；也支持接入云端托管机器或按需创建的计算环境。设备重新上线后，云端 Agent 可自动触发并完成需在该设备上执行的任务</td>
      </tr>
    </tbody>
  </table>
  <h3>4.5 Watchdog</h3>
  <table>
    <thead>
      <tr><th>规格点</th><th>说明</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">位置</td>
        <td>主系统之外的独立外部控制回路（Control Loop）</td>
      </tr>
      <tr>
        <td class="k">形态</td>
        <td>独立 Watchdog Session，用定时消息驱动</td>
      </tr>
      <tr>
        <td class="k">监控范围</td>
        <td>① 基础设施：接口报错、状态恢复失败等；② 任务进展：由模型判断各 Worker 是否有实质进展、方向是否偏离整体目标</td>
      </tr>
      <tr>
        <td class="k">为何不够用传统存活探测</td>
        <td>许多异常并非进程崩溃，而是模型陷入无效循环或偏离目标</td>
      </tr>
      <tr>
        <td class="k">处置</td>
        <td>发现异常及时介入修复；外部偶发故障则持续复查直至恢复正常</td>
      </tr>
      <tr>
        <td class="k">自然语言维护</td>
        <td>Watchdog 本身是具备完整工具能力的 Agent Session；维护者可用自然语言询问故障原因，也可让它在线修正主系统行为（例如增删提示词、调整触发规则）</td>
      </tr>
    </tbody>
  </table>
  <h2>5. <span class="pill num">实验数字</span></h2>
  <p>原文第 7 节说明：实验基于合成负载与简化环境，部分设置还可以更加严谨，结果仅作初步参考。</p>
  <h3>7.1 消融实验</h3>
  <ul>
    <li>负载：群聊与 GitHub CI 消息流同时驱动；单次实验约 300 条消息，其中约 20 条是工作请求，其余是闲聊、跟进、叫停和 CI 消息。</li>
    <li>编码工作用只消耗时间的工具代替，因此衡量的是调度与协作能力，而非单任务执行能力。</li>
    <li>每种方案重复运行 5 次。</li>
    <li>对比方案：完整 Super-agent；去掉直通的 Super-agent；两种提示词配置下的单 Session + Subagent 工具（中性提示 / 提示优先委派）。</li>
  </ul>
  <table>
    <thead>
      <tr><th>指标</th><th>数字 / 结论（据原文）</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="k">Super-agent 完成时间</td>
        <td>p50 = 12.4 分钟；p95 = 15.7 分钟；显著优于带 Subagent 的单 Session</td>
      </tr>
      <tr>
        <td class="k">中性提示单 Session</td>
        <td>5 次运行中一次都没有调用 Subagent；所有工作在主 Session 中进行并不断被新消息打断；p95 = 29.5 分钟</td>
      </tr>
      <tr>
        <td class="k">优先委派单 Session</td>
        <td>5 次中有 4 次进行了委派，完成时间缩短但仍慢于 Super-agent；剩 1 次模型判断工作「很小」而自己执行，形成长尾</td>
      </tr>
      <tr>
        <td class="k">直通对完成时间</td>
        <td>去掉直通后，任务完成时间与完整版基本一致</td>
      </tr>
      <tr>
        <td class="k">直通对 Router 负载</td>
        <td>去掉直通后，单次实验中 Router 需要做出的决定增加约 30%</td>
      </tr>
      <tr>
        <td class="k">读缓存 token</td>
        <td>完整 Super-agent 约 2323 万；去掉直通约 3177 万，增幅约 37%。Super-agent 因维护多个独立会话，读缓存 token 高于单 Session，以更多 token 换更短且更稳定的完成时间</td>
      </tr>
    </tbody>
  </table>
  <p class="note">鱼皮口述概括为「大约快一倍、更稳定，读缓存 token 约两倍到将近四倍」——那是讲解压缩；本表保留原文精确数字。</p>
  <h3>7.2 Router 层批处理压力测试</h3>
  <ul>
    <li>设置：Router 调用真实模型，Worker 使用 Mock 模型；需决定的 Trigger 到达速率从约每分钟 1 条逐步提升至约 40 条。</li>
  </ul>
  <table>
    <thead>
      <tr><th>指标</th><th>低速率（≈1/min）</th><th>高速率（≈40/min）</th></tr>
    </thead>
    <tbody>
      <tr><td class="k">平均 batch 大小</td><td>1.0</td><td>2.8</td></tr>
      <tr><td class="k">单次请求耗时</td><td>2.5 秒</td><td>3.9 秒</td></tr>
      <tr><td class="k">单个决定分摊推理时间</td><td>6.4 秒</td><td>1.6 秒</td></tr>
    </tbody>
  </table>
  <p>原文结论：外部事件突发拥堵时，Router 可通过自动合并积压事件提高有效吞吐。这也解释了为何 7.1 中即使去掉直通使 Router 峰值负载增加，仍未触及单 Router 吞吐瓶颈；在作者当时的团队规模下，无需过早对 Router 做水平切分而牺牲全局上下文连续性。</p>
  <h2>6. <span class="pill open">开放问题</span></h2>
  <ol>
    <li><strong>如何扩展双层架构</strong>：任务规模扩大、耦合度提高后，Router 何时需要水平切分、粒度如何划分；同层 Worker 何时需要直接通信、采用何种协作拓扑。系统与模型的协同设计（针对 Router 的事件判别、批量分派与上下文召回等专项训练）仍待探索。运行周期拉长到跨月甚至更长时，长程记忆成为主要瓶颈。</li>
    <li><strong>脱离 Session 之后如何与 Agent 协作</strong>：底层执行会话不再直接对应界面会话后，如何向用户呈现任务并提供自然的交互与项目管理形式。以聊天窗口为中心的交互在一定程度上是路径依赖；交互可能更多发生在领域特化界面（例如直接在 GitHub Issue / PR 中工作）。过渡期内许多任务仍需人类中途参与，如何兼顾逐步干预与后台自主推进，同样值得探索。</li>
    <li><strong>如何划分上下文边界并进行 A2A 协作</strong>：组织扩大时，配备 Super-agent 等于在划分上下文共享与隔离边界。多个彼此隔离的实例之间（例如每人个人助手与团队共用实例），在互不共享底层上下文、各自代表不同权限边界的前提下，如何实现安全可靠的 Agent 间通信（A2A，不特指某个协议），仍需进一步探索。</li>
    <li><strong>如何保障安全与隐私</strong>：事件驱动扩大了接触不可信输入的风险。云端 Loop + 端侧 daemon 默认建立在彼此受信任的前提上；若云端被服务端入侵或提示词注入攻破，所连接的全部端侧设备都面临被控制的潜在风险。即使云端未被攻破，凭据进入模型上下文也会带来泄露风险，因此还需让 Agent 能在完全不接触凭据本身的情况下使用凭据。原文指出：若安全与隐私问题得不到很好解决，Super-agent 只有在很小且可信的范围内才能工作。</li>
  </ol>
  <h2>7. 结语</h2>
  <p>原文结语指出：随着大模型执行单个任务越来越少需要人工干预，限制生产力进一步提升的瓶颈正在转向人的注意力。通过双层架构、事件驱动、异步多信道交互、存算分离与外部 Watchdog，系统在底层接管繁琐的会话管理与上下文同步，使人类得以从具体执行细节上移到更高层的决策与验收。Session 应当是系统的实现细节，而不应是用户的认知负担。</p>
  <footer>
    规格据 DeepSeek Harness opus（2026-10-31）整理 · 讲解入口 BV1kr4h6fExw · 原型 dsh-superagent-prototype · 本页为公开笔记草稿，未声明已上线产品能力
  </footer>
</div>
</div>
