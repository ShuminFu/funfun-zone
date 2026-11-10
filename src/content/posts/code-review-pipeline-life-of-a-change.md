---
title: "Code review 流水线：一次改动从作者机器走到用户手里"
description: "这篇按 Claude Code 团队的文章，把一次改动从作者机器走到用户手里要过的九道关画成一张流水线图，其中只有按风险审批这一步由人决定。"
growth: seedling
planted: 2026-11-09T18:34:04+08:00
lastTended: 2026-11-10T08:33:23Z
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
.html-embed .crp{--bg:#ffffff; --panel:#f6f7f9; --card:#ffffff; --ink:#1f2328; --sub:#57606a; --line:#d5dbe1; --dash:#b3bcc6; --b-fill:#e8f1fb; --b-line:#2f6fd0; --y-fill:#fbefd9; --y-line:#c98a2e; --g-fill:#eceef1; --g-line:#8a939d; --pill:#1f2328; --pill-ink:#ffffff; --sans:"PingFang SC",-apple-system,BlinkMacSystemFont,"Noto Sans SC","Hiragino Sans GB","Microsoft YaHei","Segoe UI",sans-serif;}
html[data-theme="dark"] .html-embed .crp{--bg:#121417; --panel:#181b1f; --card:#1d2126; --ink:#e6e9ed; --sub:#a7b0ba; --line:#30363d; --dash:#545d68; --b-fill:#15263d; --b-line:#6ea3f0; --y-fill:#33270f; --y-line:#d9a24f; --g-fill:#23272c; --g-line:#77818c; --pill:#e6e9ed; --pill-ink:#121417;}
.html-embed{margin:0;background:#ffffff}
html[data-theme="dark"] .html-embed{background:#121417}
.html-embed .crp{background:transparent;color:var(--ink);font-family:var(--sans);font-size:16.5px;line-height:1.75; max-width:960px;margin:0 auto;padding:44px 28px 40px;box-sizing:border-box;-webkit-font-smoothing:antialiased}
.html-embed .crp *{box-sizing:border-box}
.html-embed .crp h1{font-size:30px;line-height:1.35;font-weight:700;margin:0 0 10px}
.html-embed .crp h2{font-size:22px;line-height:1.4;font-weight:700;margin:52px 0 8px}
.html-embed .crp h3{font-size:17px;line-height:1.5;font-weight:700;margin:28px 0 6px}
.html-embed .crp p{margin:0 0 14px}
.html-embed .crp .sub{color:var(--sub);font-size:16px;margin:0 0 8px}
.html-embed .crp .lede{color:var(--sub);margin:0 0 18px}
.html-embed .crp a{color:var(--b-line);text-underline-offset:2px}
.html-embed .crp figure{margin:20px 0 10px;padding:18px 18px 16px;background:var(--panel);border:1px solid var(--line);border-radius:14px}
.html-embed .crp .figno{display:block;font-size:13px;line-height:1.5;font-weight:700;color:var(--sub);margin-bottom:12px}
.html-embed .crp .node{background:var(--card);border:1.5px solid var(--line);border-radius:10px;padding:9px 11px;min-width:0; overflow-wrap:anywhere}
.html-embed .crp .node .t{display:block;font-size:14.5px;line-height:1.5;font-weight:700;color:var(--ink)}
.html-embed .crp .node .d{display:block;font-size:12.5px;line-height:1.5;color:var(--sub);margin-top:3px}
.html-embed .crp .node .no{font-size:12px;font-weight:700;color:var(--sub);margin-right:6px;font-variant-numeric:tabular-nums}
.html-embed .crp .node.b{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .node.y{background:var(--y-fill);border-color:var(--y-line);border-width:2px}
.html-embed .crp .node.g{background:var(--g-fill);border-color:var(--g-line)}
.html-embed .crp .arr{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:0;color:var(--b-line)}
.html-embed .crp .arr .al{display:block;width:100%;text-align:center;font-size:11.5px;line-height:1.3;color:var(--sub);min-height:15px}
.html-embed .crp .arr svg{display:block;width:30px;height:10px;flex:none}
.html-embed .crp .arr.fy{color:var(--y-line)}
.html-embed .crp .arr.fg{color:var(--g-line)}
.html-embed .crp .lane{border:1.5px dashed var(--dash);border-radius:12px;padding:8px 10px 10px;background:transparent}
.html-embed .crp .lane-h{font-size:12.5px;line-height:1.5;color:var(--sub);margin:0 0 7px}
.html-embed .crp .lane-h b{color:var(--ink);font-weight:700;margin-right:6px}
.html-embed .crp .cells,.html-embed .crp .link{display:grid;grid-template-columns:minmax(0,1fr) 64px minmax(0,1fr) 64px minmax(0,1fr) 64px minmax(0,1fr); align-items:stretch}
.html-embed .crp .link{padding:0 11.5px}
.html-embed .crp .link .arr{grid-column:1;padding:0;min-height:34px;flex-direction:row;gap:8px;justify-content:center}
.html-embed .crp .link .arr svg{transform:rotate(90deg);width:22px;height:10px}
.html-embed .crp .link .arr .al{width:auto;min-height:0;text-align:left;white-space:nowrap}
.html-embed .crp .lane-note{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12.5px;line-height:1.5;color:var(--sub)}
.html-embed .crp .lane-note svg{flex:none;color:var(--g-line)}
.html-embed .crp .legend{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:14px;padding-top:12px;border-top:1px dotted var(--dash); font-size:13px;line-height:1.5;color:var(--sub)}
.html-embed .crp .legend span{display:inline-flex;align-items:center;gap:7px}
.html-embed .crp .legend i{display:inline-block;width:16px;height:12px;border-radius:3px;border:1.5px solid}
.html-embed .crp .legend .lb{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .legend .ly{background:var(--y-fill);border-color:var(--y-line)}
.html-embed .crp .legend .lg{background:var(--g-fill);border-color:var(--g-line)}
.html-embed .crp .legend .ld{border:1.5px dashed var(--dash);background:transparent}
.html-embed .crp .struct{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:stretch}
.html-embed .crp .outer{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 12px 12px}
.html-embed .crp .outer > .h{font-size:14.5px;line-height:1.5;font-weight:700;color:var(--ink)}
.html-embed .crp .outer > .s{font-size:12.5px;color:var(--sub);line-height:1.5;margin:2px 0 10px}
.html-embed .crp .stack{display:grid;gap:8px}
.html-embed .crp blockquote{margin:30px 0 0;padding:4px 0 4px 18px;border-left:3px solid var(--line);font-style:normal}
.html-embed .crp blockquote p{font-style:normal}
.html-embed .crp blockquote p.en{margin:0 0 10px;font-size:17px;line-height:1.65;color:var(--ink)}
.html-embed .crp blockquote p.zh{margin:0 0 8px}
.html-embed .crp blockquote cite{display:block;font-size:13.5px;color:var(--sub);font-style:normal}
.html-embed .crp .clf{max-width:340px;margin:0 auto;text-align:center}
.html-embed .crp .fan{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0;position:relative;padding-top:16px}
.html-embed .crp .fan::before{content:"";position:absolute;top:0;left:50%;height:16px;border-left:1.5px solid var(--b-line);margin-left:-.75px}
.html-embed .crp .fan > span{position:relative;display:flex;flex-direction:column;align-items:center;height:22px;border-top:1.5px solid var(--b-line)}
.html-embed .crp .fan > span:first-child{border-top:0}
.html-embed .crp .fan > span:first-child::after{content:"";position:absolute;top:0;left:50%;right:-12px;border-top:1.5px solid var(--b-line)}
.html-embed .crp .fan > span:last-child{border-top:0}
.html-embed .crp .fan > span:last-child::after{content:"";position:absolute;top:0;right:50%;left:-12px;border-top:1.5px solid var(--b-line)}
.html-embed .crp .fan > span i{display:block;width:0;flex:1;border-left:1.5px solid var(--b-line)}
.html-embed .crp .fan > span b{display:block;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid var(--b-line)}
.html-embed .crp .tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:stretch}
.html-embed .crp .tier{border-radius:12px;padding:10px 12px 12px;border:1.5px solid;min-width:0}
.html-embed .crp .tier .n{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-bottom:6px}
.html-embed .crp .tier .n b{font-size:26px;line-height:1.1;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums}
.html-embed .crp .tier .n small{font-size:14px;line-height:1.5;font-weight:700;color:var(--ink)}
.html-embed .crp .tier .pill{display:inline-block;font-size:12.5px;font-weight:700;line-height:1.5;padding:1px 9px;border-radius:999px; background:var(--pill);color:var(--pill-ink);margin-left:auto;white-space:nowrap}
.html-embed .crp .tier .what{font-size:13px;line-height:1.5;color:var(--ink)}
.html-embed .crp .tier .what span{display:block;font-size:12px;color:var(--sub);margin-bottom:2px}
.html-embed .crp .tier.t0{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .tier.t1{background:var(--y-fill);border-color:var(--y-line)}
.html-embed .crp .tier.t2{background:var(--y-fill);border-color:var(--y-line);border-width:3px}
.html-embed .crp .always{margin-top:12px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:stretch; padding-top:12px;border-top:1px dotted var(--dash)}
.html-embed .crp .stages{margin:8px 0 0;padding:0;list-style:none;border-top:1px solid var(--line)}
.html-embed .crp .stages li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:0 8px;padding:13px 0;border-bottom:1px solid var(--line);margin:0}
.html-embed .crp .stages .k{font-size:13px;font-weight:700;color:var(--sub);font-variant-numeric:tabular-nums;padding-top:3px}
.html-embed .crp .stages .k i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;border:1.5px solid;vertical-align:1px}
.html-embed .crp .stages .kb i{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .stages .ky i{background:var(--y-fill);border-color:var(--y-line)}
.html-embed .crp .stages .kg i{background:var(--g-fill);border-color:var(--g-line)}
.html-embed .crp .stages b{font-weight:700}
.html-embed .crp .stages .ph{font-size:12.5px;color:var(--sub);margin-left:8px;font-weight:400}
.html-embed .crp .stages p{margin:2px 0 0;font-size:15.5px;line-height:1.75}
.html-embed .crp .src{margin-top:40px;padding-top:14px;border-top:1px solid var(--line);font-size:13.5px;line-height:1.7;color:var(--sub)}
.html-embed .crp .src p{margin:0 0 6px}
.html-embed .crp .src a{word-break:break-all}
@media (max-width:860px){.html-embed .crp .struct{grid-template-columns:1fr}}
@media (max-width:640px){.html-embed .crp{padding:26px 18px 30px;font-size:16px}
.html-embed .crp h1{font-size:23px}
.html-embed .crp h2{font-size:20px;margin-top:40px}
.html-embed .crp figure{padding:14px 12px 12px}
.html-embed .crp .cells{grid-template-columns:minmax(0,1fr)}
.html-embed .crp .cells .arr{flex-direction:row;gap:8px;padding:0;min-height:32px}
.html-embed .crp .cells .arr svg{transform:rotate(90deg);width:22px}
.html-embed .crp .cells .arr .al{width:auto;min-height:0;order:2;text-align:left}
.html-embed .crp .cells .arr .al:empty{display:none}
.html-embed .crp .link{grid-template-columns:minmax(0,1fr);padding:0}
.html-embed .crp .tiers,.html-embed .crp .always{grid-template-columns:1fr}
.html-embed .crp .fan{grid-template-columns:1fr;padding-top:0;height:22px}
.html-embed .crp .fan::before{height:22px}
.html-embed .crp .fan > span{display:none}
.html-embed .crp .tiers{margin-top:0}}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Blog dark mode is html.dark (data-theme holds the palette name), so map the page's dark palette onto it. */
html.dark .html-embed .crp{
  --bg:#121417; --panel:#181b1f; --card:#1d2126; --ink:#e6e9ed; --sub:#a7b0ba; --line:#30363d; --dash:#545d68;
  --b-fill:#15263d; --b-line:#6ea3f0;
  --y-fill:#33270f; --y-line:#d9a24f;
  --g-fill:#23272c; --g-line:#77818c;
  --pill:#e6e9ed; --pill-ink:#121417;
}
/* Keep the page's sans headings; the blog's heading font and h2 rule otherwise win. */
.html-embed .crp h2,.html-embed .crp h3{font-family:var(--sans)!important;border:0!important;padding-bottom:0!important;color:var(--ink)!important}
.html-embed .crp h2{font-size:22px!important;line-height:1.4!important;margin:52px 0 8px!important}
.html-embed .crp h3{font-size:17px!important;line-height:1.5!important;margin:28px 0 6px!important}
.html-embed .crp blockquote,.html-embed .crp blockquote p{font-style:normal!important}
@media (max-width:640px){.html-embed .crp h2{font-size:20px!important;margin-top:40px!important}}
</style>

<div class="html-embed not-prose" lang="zh-CN">
<div class="crp">
  <p class="sub">这篇按 Claude Code 团队的文章《How the Claude Code team does code review》整理，主干来自原文的配图「The life of a change」。</p>
  <h2>Code review 干两件事，每个 PR 问三个问题</h2>
  <figure>
    <span class="figno">图 1　评审的两项工作和三个问题</span>
    <div class="struct">
      <div class="outer">
        <div class="h">Code review 的两项工作</div>
        <div class="s">两项工作同时进行。</div>
        <div class="stack">
          <div class="node b"><span class="t">找出问题并修掉</span><span class="d">改动上线之前，把问题找出来修好</span></div>
          <div class="node b"><span class="t">形成共享的上下文</span><span class="d">让团队对代码库有共同的理解</span></div>
        </div>
      </div>
      <div class="outer">
        <div class="h">Claude review 对每个 PR 问的三个问题</div>
        <div class="s">每个 PR 上的 Claude review 读 diff 时都问这三个问题。</div>
        <div class="stack">
          <div class="node"><span class="t">解决问题了吗？</span><span class="d">这次改动解决了它要解决的问题吗</span></div>
          <div class="node"><span class="t">合得来吗？</span><span class="d">这次改动和现有系统合得来吗</span></div>
          <div class="node"><span class="t">会弄坏别处吗？</span><span class="d">这次改动会不会弄坏别的地方</span></div>
        </div>
      </div>
    </div>
  </figure>
  <blockquote>
    <p class="en">“did a human read the code?” is an imprecise proxy for “what could go wrong with this change, and which check—automated or human—is the right one to catch it?”</p>
    <p class="zh">换句话说，「有没有人读过代码」只是一个不够精确的替代指标。真正该问的是这次改动可能出什么问题，以及哪一道检查（自动的或人工的）最适合把它拦下来。</p>
    <cite>— How the Claude Code team does code review</cite>
  </blockquote>
  <h2>一次改动的一生</h2>
  <p class="lede">九个阶段里，大部分由机器自动完成；只有按风险审批这一步由人来决定。</p>
  <figure>
    <span class="figno">图 2　一次改动从开 PR 前走到上线之后</span>
    <div class="lane"><div class="lane-h"><b>PR 前</b>Before the PR</div><div class="cells">
      <div class="node b"><span class="t"><span class="no">01</span>工作先自验</span><span class="d">跑测试和 linter，再换个 agent 审 diff</span></div>
    </div></div>
    <div class="link"><div class="arr"><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="al">开 PR</span></div></div>
    <div class="lane"><div class="lane-h"><b>每个 PR</b>On every PR</div><div class="cells">
      <div class="node b"><span class="t"><span class="no">02</span>必过 CI</span><span class="d">lint、类型、多平台测试、构建打包</span></div>
      <div class="arr"><span class="al">全绿</span><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
      <div class="node b"><span class="t"><span class="no">03</span>Claude review</span><span class="d">多个 agent 找 bug，投票后排序</span></div>
      <div class="arr"><span class="al"></span><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
      <div class="node b"><span class="t"><span class="no">04</span>安全审查</span><span class="d">单独一轮，发现没关闭就不能合</span></div>
      <div class="arr"><span class="al">发现关闭</span><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
      <div class="node y"><span class="t"><span class="no">05</span>按风险审批</span><span class="d">分类器定档，0、1 或 2 人批准</span></div>
    </div></div>
    <div class="link"><div class="arr fy"><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="al">批准够数</span></div></div>
    <div class="lane"><div class="lane-h"><b>合并</b>Merging</div><div class="cells">
      <div class="node b"><span class="t"><span class="no">06</span>Merge queue</span><span class="d">套到最新 main 上，检查全部重跑</span></div>
    </div></div>
    <div class="link"><div class="arr"><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="al">合入 main</span></div></div>
    <div class="lane"><div class="lane-h"><b>合并之后</b>After the merge</div><div class="cells">
      <div class="node g"><span class="t"><span class="no">07</span>内部先用</span><span class="d">藏在 flag 后，Anthropic 员工先用</span></div>
      <div class="arr fg"><span class="al"></span><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
      <div class="node g"><span class="t"><span class="no">08</span>渐进发布</span><span class="d">先发 latest，stable 随后跟上</span></div>
      <div class="arr fg"><span class="al"></span><svg viewBox="0 0 30 10" aria-hidden="true"><path d="M1 5H27" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M23 1.5L28 5L23 8.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
      <div class="node g"><span class="t"><span class="no">09</span>盯着线上</span><span class="d">作者和 on-call 一起盯</span></div>
    </div>
    <div class="lane-note"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5.8 3.6v3.6h3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>出了问题时，flag 很快关掉，坏掉的构建会被 revert。</div></div>
    <div class="legend">
      <span><i class="lb"></i>自动检查</span>
      <span><i class="ly"></i>由人决定，力度随风险变化</span>
      <span><i class="lg"></i>发布与补救</span>
      <span><i class="ld"></i>阶段分组</span>
    </div>
  </figure>
  <h3>按风险审批：唯一由人决定的一步</h3>
  <p>一个分类器读完改动以后定下风险档，风险档再决定需要几个人批准。风险档由改动本身决定，跟作者是谁无关；而且 agent 的批准从来不能顶替人的批准。</p>
  <figure>
    <span class="figno">图 3　第 5 步的三档审批</span>
    <div class="node b clf"><span class="t">分类器读完改动，定下风险档</span><span class="d">只看改动本身，不看作者是谁</span></div>
    <div class="fan" aria-hidden="true"><span><i></i><b></b></span><span><i></i><b></b></span><span><i></i><b></b></span></div>
    <div class="tiers">
      <div class="tier t0"><div class="n"><b>0</b><small>人批准</small><span class="pill">低风险</span></div><div class="what"><span>走这一档的改动</span>文档、文案、flag 后面的增量改动</div></div>
      <div class="tier t1"><div class="n"><b>1</b><small>人批准</small><span class="pill">中风险</span></div><div class="what"><span>走这一档的改动</span>普通产品改动和敏感区域</div></div>
      <div class="tier t2"><div class="n"><b>2</b><small>人批准</small><span class="pill">高风险</span></div><div class="what"><span>走这一档的改动</span>风险最高的代码和少数指定路径</div></div>
    </div>
    <div class="always">
      <div class="node g"><span class="t">不管落在哪一档，都必须有人批</span><span class="d">负责人列为敏感的代码、所有 CI workflow 文件</span></div>
      <div class="node g"><span class="t">agent 的批准不能顶替人的批准</span><span class="d">需要人批的地方，agent 批了不算数</span></div>
    </div>
  </figure>
  <h2>九个阶段逐个看</h2>
  <ol class="stages">
    <li><span class="k kb"><i></i>01</span><div><b>工作先自验</b><span class="ph">PR 前</span><p>Claude 先跑测试、构建和 linter；接着由另一个 agent 在全新的上下文里把 diff 审一遍。</p></div></li>
    <li><span class="k kb"><i></i>02</span><div><b>必过 CI</b><span class="ph">每个 PR</span><p>CI 会跑 lint、类型检查、多平台测试、构建和打包。只要有一项变红，这个 PR 就不能合并。</p></div></li>
    <li><span class="k kb"><i></i>03</span><div><b>Claude code review</b><span class="ph">每个 PR</span><p>几个 agent 同时找 bug，然后一组验证 agent 对每条发现投票，留下来的发现按严重程度排序。</p></div></li>
    <li><span class="k kb"><i></i>04</span><div><b>安全审查</b><span class="ph">每个 PR</span><p>安全审查是单独跑的一轮。bug review 和安全审查里只要还有没关闭的发现，PR 就不能合并。</p></div></li>
    <li><span class="k ky"><i></i>05</span><div><b>按风险审批</b><span class="ph">每个 PR</span><p>分类器定下风险档，风险档决定要 0、1 还是 2 个人批准，细节见上面的图 3。</p></div></li>
    <li><span class="k kb"><i></i>06</span><div><b>Merge queue</b><span class="ph">合并</span><p>merge queue 把改动套到最新的 main 上，再把所有检查跑一遍，因此两个各自通过的 PR 不会合起来弄坏 main。</p></div></li>
    <li><span class="k kg"><i></i>07</span><div><b>藏在 feature flag 后面，内部先用</b><span class="ph">合并之后</span><p>新行为先由 Anthropic 员工用起来，然后才推给所有用户。</p></div></li>
    <li><span class="k kg"><i></i>08</span><div><b>渐进发布</b><span class="ph">合并之后</span><p>公开版本先发到 latest 渠道，stable 渠道随后才跟上。</p></div></li>
    <li><span class="k kg"><i></i>09</span><div><b>盯着，往前修或者回滚</b><span class="ph">合并之后</span><p>作者和 on-call 一起盯着线上；出了问题时 flag 能很快关掉，坏掉的构建也会被 revert。</p></div></li>
  </ol>
  <div class="src">
    <p>来源：Addy Osmani、Morgan Westlee Lunt、Qing Wang，<a href="https://claude.dev/blog/solving-code-review-at-anthropic/">How the Claude Code team does code review</a>，claude.dev Blog，2026 年 10 月 15 日。</p>
    <p>阶段顺序按原文配图「The life of a change」排列；原文正文分层介绍时，把 CI 放在了 AI review 和安全审查之后。</p>
  </div>
</div>
</div>
