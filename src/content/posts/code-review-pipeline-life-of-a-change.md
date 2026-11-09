---
title: "Code review 流水线：一次改动从作者机器走到用户手里"
description: "这篇按 Claude Code 团队的文章，把一次改动从作者机器走到用户手里要过的九道关画成一张流水线图，其中只有按风险审批这一步由人决定。"
growth: seedling
planted: 2026-11-09T18:34:04+08:00
draft: false
tags:
  - "code-review"
  - "ai-agents"
  - "claude-code"
  - "agent-future"
---

<style>
.html-embed{display:block}
.html-embed :where(h1,h2,h3,h4){font-style:normal}
.html-embed :where(th,td){border:0}
.html-embed :where(code)::before,.html-embed :where(code)::after{content:none}
.html-embed :where(ul,ol){list-style:revert}
.html-embed .crp{--bg:#faf8f4; --card:#ffffff; --ink:#1f1d1a; --muted:#6b665e; --line:#d9d3c8; --ok:#3f7d5a; --human:#d9693f; --human-bg:#fdf1ea; --human-line:#efb69a; --recover:#3d6fb0; --quote:#f3efe7; --chip:#f6e1d5; --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace; --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Microsoft YaHei","Segoe UI",sans-serif;}
html[data-theme="dark"] .html-embed .crp{--bg:#161513; --card:#1e1d1a; --ink:#ece8e1; --muted:#a29c92; --line:#3a3731; --ok:#7cc29a; --human:#ee8a5f; --human-bg:#2c1f18; --human-line:#7a4429; --recover:#86aee6; --quote:#23211d; --chip:#4a2b1c;}
.html-embed{margin:0;background:var(--bg,#faf8f4)}
html[data-theme="dark"] .html-embed{background:#161513}
.html-embed .crp{background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.65; max-width:960px;margin:0 auto;padding:40px 28px 32px;box-sizing:border-box}
.html-embed .crp *{box-sizing:border-box}
.html-embed .crp h1{font-size:28px;line-height:1.3;margin:0 0 8px;letter-spacing:.01em}
.html-embed .crp .sub{color:var(--muted);margin:0 0 28px;font-size:15px}
.html-embed .crp .head{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.html-embed .crp .box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px}
.html-embed .crp .box h2{font-size:13px;font-family:var(--mono);letter-spacing:.08em;color:var(--muted); margin:0 0 10px;font-weight:600}
.html-embed .crp ol.jobs,.html-embed .crp ol.qs{margin:0;padding-left:1.4em}
.html-embed .crp ol.jobs li,.html-embed .crp ol.qs li{margin:4px 0}
.html-embed .crp .note{color:var(--muted);font-size:13px;margin:10px 0 0}
.html-embed .crp blockquote{margin:0 0 36px;background:var(--quote);border-left:4px solid var(--human); border-radius:0 12px 12px 0;padding:16px 20px}
.html-embed .crp blockquote p.en{margin:0;font-size:17px;line-height:1.55;font-style:italic}
.html-embed .crp blockquote p.zh{margin:10px 0 0;color:var(--muted);font-size:14px}
.html-embed .crp blockquote cite{display:block;margin-top:8px;font-size:13px;color:var(--muted);font-style:normal}
.html-embed .crp .tl-title{font-size:20px;margin:0 0 4px}
.html-embed .crp .tl-sub{color:var(--muted);font-size:14px;margin:0 0 18px}
.html-embed .crp .tl{position:relative;padding-left:44px}
.html-embed .crp .tl::before{content:"";position:absolute;left:15px;top:10px;bottom:14px;width:2px;background:var(--line)}
.html-embed .crp .grp{font-family:var(--mono);font-size:13px;letter-spacing:.12em;color:var(--muted); font-weight:700;margin:22px 0 8px}
.html-embed .crp .grp:first-child{margin-top:0}
.html-embed .crp .grp span{font-weight:400;letter-spacing:.04em;margin-left:8px;opacity:.85}
.html-embed .crp .st{position:relative;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:6px 24px; padding:10px 14px;margin:2px 0 2px -14px;border-radius:10px}
.html-embed .crp .st .ic{position:absolute;left:-36px;top:11px;width:24px;height:24px;background:var(--bg); border-radius:50%;display:flex;align-items:center;justify-content:center}
.html-embed .crp .st h3{margin:0;font-size:16px;line-height:1.45;font-weight:650}
.html-embed .crp .st h3 .n{font-family:var(--mono);color:var(--muted);font-weight:500;margin-right:8px;font-size:13px}
.html-embed .crp .st p{margin:0;font-size:14.5px;color:var(--ink);opacity:.88}
.html-embed .crp .st.human{background:var(--human-bg);border:1.5px solid var(--human-line);margin:10px 0 10px -14px;padding:14px}
.html-embed .crp .st.human .ic{top:15px;background:var(--human-bg)}
.html-embed .crp .st.human h3{color:var(--ink)}
.html-embed .crp .tag{display:inline-block;font-size:.95rem;font-weight:700;color:#fff;background:#8a3a1c; border-radius:999px;padding:1px 10px;margin-top:6px}
html[data-theme="dark"] .html-embed .crp .tag{background:#f6d3c2;color:#1f1d1a}
.html-embed .crp .tiers{grid-column:1 / -1;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:8px}
.html-embed .crp .tier{background:var(--card);border:1px solid var(--human-line);border-radius:10px;padding:8px 12px}
.html-embed .crp .tier b{display:block;font-size:22px;color:var(--ink);line-height:1.2}
.html-embed .crp .tier b small{font-size:13px;font-weight:600;margin-left:4px}
.html-embed .crp .tier span{font-size:13px;color:var(--muted)}
.html-embed .crp .tier em{font-style:normal;font-weight:700;color:var(--ink);margin-right:4px}
.html-embed .crp .always{grid-column:1 / -1;font-size:13.5px;color:var(--ink);opacity:.88;margin:6px 0 0}
.html-embed .crp .legend{display:flex;flex-wrap:wrap;gap:8px 22px;margin:22px 0 0;padding-top:14px;border-top:1px solid var(--line); font-size:13.5px;color:var(--muted)}
.html-embed .crp .legend span{display:inline-flex;align-items:center;gap:6px}
.html-embed .crp .src{margin-top:26px;font-size:13px;color:var(--muted)}
.html-embed .crp .src a{color:var(--recover);word-break:break-all}
.html-embed .crp .src p{margin:4px 0}
@media (max-width:640px){.html-embed .crp{padding:24px 16px}
.html-embed .crp h1{font-size:22px}
.html-embed .crp .head{grid-template-columns:1fr}
.html-embed .crp blockquote p.en{font-size:15.5px}
.html-embed .crp .tl{padding-left:36px}
.html-embed .crp .tl::before{left:11px}
.html-embed .crp .st{grid-template-columns:1fr;gap:4px}
.html-embed .crp .st .ic{left:-32px}
.html-embed .crp .tiers{grid-template-columns:1fr;gap:6px}
.html-embed .crp .tier{display:flex;align-items:baseline;gap:10px}
.html-embed .crp .tier b{font-size:18px;min-width:52px}}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed not-prose" lang="zh-CN">
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-ok" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-human" viewBox="0 0 24 24"><rect x="5.5" y="5.5" width="13" height="13" rx="1.5" transform="rotate(45 12 12)" fill="currentColor"/></symbol>
    <symbol id="i-rec" viewBox="0 0 24 24"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.2 3.6v3.6h-3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  </defs>
</svg>
  <p class="sub">这张图按 Claude Code 团队的文章《How the Claude Code team does code review》整理，主干来自原文的配图「The life of a change」。</p>
  <div class="head">
    <section class="box">
      <h2>CODE REVIEW 干两件事</h2>
      <ol class="jobs">
        <li>改动上线之前，review 要找出问题并把它们修掉。</li>
        <li>与此同时，review 也让整个团队对代码库形成共享的上下文和理解。</li>
      </ol>
    </section>
    <section class="box">
      <h2>REVIEW 要问三件事</h2>
      <ol class="qs">
        <li>这次改动解决了它要解决的问题吗？</li>
        <li>这次改动和现有系统合得来吗？</li>
        <li>这次改动会不会弄坏别的地方？</li>
      </ol>
      <p class="note">原文里，这三个问题是每个 PR 上的 Claude review 读 diff 时要问的。</p>
    </section>
  </div>
  <blockquote>
    <p class="en">“did a human read the code?” is an imprecise proxy for “what could go wrong with this change, and which check—automated or human—is the right one to catch it?”</p>
    <p class="zh">换句话说，「有没有人读过代码」只是一个不够精确的替代指标。真正该问的是这次改动可能出什么问题，以及哪一道检查（自动的或人工的）最适合把它拦下来。</p>
    <cite>— How the Claude Code team does code review</cite>
  </blockquote>
  <h2 class="tl-title">一次改动的一生</h2>
  <p class="tl-sub">九个阶段里，大部分由机器自动完成；只有按风险审批这一步由人来决定。</p>
  <div class="tl">
    <div class="grp">PR 前<span>Before the PR</span></div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">01</span>工作先自验</h3>
      <p>Claude 先跑测试、构建和 linter；接着由另一个 agent 在全新的上下文里把 diff 审一遍。</p>
    </div>
    <div class="grp">每个 PR<span>On every PR</span></div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">02</span>必过 CI</h3>
      <p>CI 会跑 lint、类型检查、多平台测试、构建和打包。只要有一项变红，这个 PR 就不能合并。</p>
    </div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">03</span>Claude code review</h3>
      <p>几个 agent 同时找 bug，然后一组验证 agent 对每条发现投票，留下来的发现按严重程度排序。</p>
    </div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">04</span>安全审查</h3>
      <p>安全审查是单独跑的一轮。bug review 和安全审查里只要还有没关闭的发现，PR 就不能合并。</p>
    </div>
    <div class="st human">
      <span class="ic" style="color:var(--human)"><svg width="22" height="22"><use href="#i-human"/></svg></span>
      <h3><span class="n">05</span>按风险审批<br><span class="tag">唯一由人决定的一步</span></h3>
      <p>一个分类器读完改动以后定下风险档，风险档再决定需要几个人批准。风险档由改动本身决定，跟作者是谁无关；而且 agent 的批准从来不能顶替人的批准。</p>
      <div class="tiers">
        <div class="tier"><b>0<small>人</small></b><span><em>低风险</em>文档、文案、flag 后面的增量改动</span></div>
        <div class="tier"><b>1<small>人</small></b><span><em>中风险</em>普通产品改动和敏感区域</span></div>
        <div class="tier"><b>2<small>人</small></b><span><em>高风险</em>风险最高的代码和少数指定路径</span></div>
      </div>
      <p class="always">另外，有些路径无论落在哪一档都必须有人批，比如负责人列为敏感的代码和所有 CI workflow 文件。</p>
    </div>
    <div class="grp">合并<span>Merging</span></div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">06</span>Merge queue</h3>
      <p>merge queue 把改动套到最新的 main 上，再把所有检查跑一遍，因此两个各自通过的 PR 不会合起来弄坏 main。</p>
    </div>
    <div class="grp">合并之后<span>After the merge</span></div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">07</span>藏在 feature flag 后面，内部先用</h3>
      <p>新行为先由 Anthropic 员工用起来，然后才推给所有用户。</p>
    </div>
    <div class="st">
      <span class="ic" style="color:var(--ok)"><svg width="22" height="22"><use href="#i-ok"/></svg></span>
      <h3><span class="n">08</span>渐进发布</h3>
      <p>公开版本先发到 latest 渠道，stable 渠道随后才跟上。</p>
    </div>
    <div class="st">
      <span class="ic" style="color:var(--recover)"><svg width="22" height="22"><use href="#i-rec"/></svg></span>
      <h3><span class="n">09</span>盯着，往前修或者回滚</h3>
      <p>作者和 on-call 一起盯着线上；出了问题时 flag 能很快关掉，坏掉的构建也会被 revert。</p>
    </div>
  </div>
  <div class="legend">
    <span><svg width="18" height="18" style="color:var(--ok)"><use href="#i-ok"/></svg>自动完成</span>
    <span><svg width="18" height="18" style="color:var(--human)"><use href="#i-human"/></svg>由人决定，力度随风险变化</span>
    <span><svg width="18" height="18" style="color:var(--recover)"><use href="#i-rec"/></svg>补救</span>
  </div>
  <div class="src">
    <p>来源：Addy Osmani、Morgan Westlee Lunt、Qing Wang，<a href="https://claude.dev/blog/solving-code-review-at-anthropic/">How the Claude Code team does code review</a>，claude.dev Blog，2026 年 10 月 15 日。</p>
    <p>阶段顺序按原文配图「The life of a change」排列；原文正文分层介绍时，把 CI 放在了 AI review 和安全审查之后。</p>
  </div>
</div>
