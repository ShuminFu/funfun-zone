---
title: "Code review 流水线：一次改动从作者机器走到用户手里"
description: "这篇按 Claude Code 团队的文章，把一次改动从作者机器走到用户手里要过的九道关画成一张流水线图，其中只有按风险审批这一步由人决定。"
growth: seedling
planted: 2026-11-09T18:34:04+08:00
lastTended: 2026-11-10T07:41:06Z
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
.html-embed .crp{--bg:#ffffff; --panel:#f6f7f9; --card:#ffffff; --ink:#1f2328; --sub:#57606a; --line:#d5dbe1; --dash:#a9b2bc; --b-fill:#e8f1fb; --b-line:#2f6fd0; --b-ink:#1d4f9c; --y-fill:#fbefd9; --y-line:#c98a2e; --y-ink:#6b4510; --g-fill:#eceef1; --g-line:#8a939d; --g-ink:#3d444c; --pill:#1f2328; --pill-ink:#ffffff; --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Noto Sans SC","Hiragino Sans GB","Microsoft YaHei","Segoe UI",sans-serif;}
html[data-theme="dark"] .html-embed .crp{--bg:#121417; --panel:#181b1f; --card:#1d2126; --ink:#e6e9ed; --sub:#a7b0ba; --line:#30363d; --dash:#545d68; --b-fill:#15263d; --b-line:#6ea3f0; --b-ink:#a9c8f5; --y-fill:#33270f; --y-line:#d9a24f; --y-ink:#f0d2a0; --g-fill:#23272c; --g-line:#77818c; --g-ink:#cfd5dc; --pill:#e6e9ed; --pill-ink:#121417;}
.html-embed{margin:0;background:#ffffff}
html[data-theme="dark"] .html-embed{background:#121417}
.html-embed .crp{background:transparent;color:var(--ink);font-family:var(--sans);font-size:16.5px;line-height:1.75; max-width:960px;margin:0 auto;padding:44px 28px 40px;box-sizing:border-box;-webkit-font-smoothing:antialiased}
.html-embed .crp *{box-sizing:border-box}
.html-embed .crp h1{font-size:30px;line-height:1.35;font-weight:700;margin:0 0 10px;letter-spacing:-.005em}
.html-embed .crp h2{font-size:22px;line-height:1.4;font-weight:700;margin:52px 0 8px}
.html-embed .crp h3{font-size:17px;line-height:1.5;font-weight:700;margin:28px 0 6px}
.html-embed .crp p{margin:0 0 14px}
.html-embed .crp .sub{color:var(--sub);font-size:16px;margin:0 0 8px}
.html-embed .crp .lede{color:var(--sub);margin:0 0 18px}
.html-embed .crp a{color:var(--b-line);text-underline-offset:2px}
.html-embed .crp figure{margin:22px 0 10px;padding:20px 18px 16px;background:var(--panel);border:1px solid var(--line);border-radius:14px}
.html-embed .crp figcaption{font-size:13.5px;line-height:1.6;color:var(--sub);margin-top:14px}
.html-embed .crp figcaption b{color:var(--ink);font-weight:700}
.html-embed .crp .figno{display:block;font-size:13px;font-weight:700;color:var(--sub);letter-spacing:.04em;margin-bottom:12px}
.html-embed .crp .node{background:var(--card);border:1.5px solid var(--line);border-radius:10px;padding:9px 11px 10px;min-width:0}
.html-embed .crp .node .t{display:block;font-size:14.5px;line-height:1.4;font-weight:700;color:var(--ink)}
.html-embed .crp .node .d{display:block;font-size:12.5px;line-height:1.55;color:var(--sub);margin-top:4px}
.html-embed .crp .node .no{display:inline-block;font-size:11.5px;font-weight:700;line-height:1;color:var(--sub);margin-right:6px; font-variant-numeric:tabular-nums}
.html-embed .crp .node.b{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .node.y{background:var(--y-fill);border-color:var(--y-line);border-width:2px}
.html-embed .crp .node.g{background:var(--g-fill);border-color:var(--g-line)}
.html-embed .crp .node.w{background:var(--card)}
.html-embed .crp .grp{border:1.5px dashed var(--dash);border-radius:12px;padding:0 10.5px 10.5px;min-width:0}
.html-embed .crp .glabel{height:30px;display:flex;align-items:center;font-size:12.5px;color:var(--sub);white-space:nowrap}
.html-embed .crp .glabel b{color:var(--ink);font-weight:700;margin-right:6px}
.html-embed .crp .arr{flex:0 0 52px;width:52px;display:flex;flex-direction:column;align-items:center;justify-content:center; position:relative;color:var(--b-line)}
.html-embed .crp .arr svg{display:block;overflow:visible}
.html-embed .crp .arr .al{position:absolute;bottom:calc(50% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap; font-size:11px;line-height:1.2;color:var(--sub);background:var(--panel);padding:0 2px}
.html-embed .crp .arr.fy{color:var(--y-line)}
.html-embed .crp .arr.fg{color:var(--g-line)}
.html-embed .crp .flow{--nh:136px;--w:calc((100% - 256px) / 5)}
.html-embed .crp .frow{display:flex;align-items:flex-start}
.html-embed .crp .frow .cells{display:flex;align-items:stretch}
.html-embed .crp .frow .cells .node{flex:1 1 0;height:var(--nh)}
.html-embed .crp .frow > .arr{height:var(--nh);margin-top:31.5px}
.html-embed .crp .g1{flex:0 0 calc(var(--w) + 24px)}
.html-embed .crp .g2{flex:1 1 0}
.html-embed .crp .g3{flex:0 0 calc(var(--w) + 24px)}
.html-embed .crp .g4{flex:0 0 calc(var(--w) * 3 + 104px + 24px)}
.html-embed .crp .turn{position:relative;height:46px}
.html-embed .crp .turn i{position:absolute;display:block;border-color:var(--y-line);border-style:solid;border-width:0}
.html-embed .crp .turn .t-a{top:0;height:23px;right:calc(12px + (100% - 256px) / 10);width:0;border-right-width:1.5px}
.html-embed .crp .turn .t-b{top:22px;height:0;left:calc(12px + (100% - 256px) / 10);right:calc(12px + (100% - 256px) / 10);border-top-width:1.5px}
.html-embed .crp .turn .t-c{top:22px;height:18px;left:calc(12px + (100% - 256px) / 10);width:0;border-left-width:1.5px}
.html-embed .crp .turn .t-h{top:37px;left:calc(12px + (100% - 256px) / 10 - 4.25px);width:0;height:0; border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid var(--y-line);border-bottom:0}
.html-embed .crp .turn .tl{position:absolute;top:13px;left:50%;transform:translateX(-50%);font-size:11px;line-height:18px;color:var(--sub); background:var(--panel);padding:0 6px;white-space:nowrap}
.html-embed .crp .loop{position:relative;height:30px;margin:0 calc((100% - 104px) / 6)}
.html-embed .crp .loop .ln{position:absolute;left:0;right:0;top:6px;height:14px;border:1.5px dashed var(--g-line);border-top:0;border-radius:0 0 8px 8px}
.html-embed .crp .loop .hd{position:absolute;left:-4.25px;top:0;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent; border-bottom:8px solid var(--g-line)}
.html-embed .crp .loop .lt{position:absolute;left:50%;top:12px;transform:translateX(-50%);font-size:11px;line-height:16px;color:var(--sub); background:var(--panel);padding:0 6px;white-space:nowrap}
.html-embed .crp .legend{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:16px;padding-top:12px;border-top:1px dotted var(--dash); font-size:13px;color:var(--sub)}
.html-embed .crp .legend span{display:inline-flex;align-items:center;gap:7px}
.html-embed .crp .legend i{display:inline-block;width:16px;height:12px;border-radius:3px;border:1.5px solid}
.html-embed .crp .legend .lb{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .legend .ly{background:var(--y-fill);border-color:var(--y-line)}
.html-embed .crp .legend .lg{background:var(--g-fill);border-color:var(--g-line)}
.html-embed .crp .legend .ld{border:1.5px dashed var(--dash);background:transparent}
.html-embed .crp .struct{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:14px}
.html-embed .crp .outer{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px 14px}
.html-embed .crp .outer > .h{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px}
.html-embed .crp .outer > .s{font-size:12.5px;color:var(--sub);line-height:1.5;margin-bottom:10px}
.html-embed .crp .stack{display:grid;gap:10px}
.html-embed .crp .q3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.html-embed .crp .q3 .node .t{font-size:14px}
.html-embed .crp blockquote{margin:30px 0 0;padding:4px 0 4px 18px;border-left:3px solid var(--line)}
.html-embed .crp blockquote p.en{margin:0 0 10px;font-size:17px;line-height:1.65;color:var(--ink)}
.html-embed .crp blockquote p.zh{margin:0 0 8px}
.html-embed .crp blockquote cite{display:block;font-size:13.5px;color:var(--sub);font-style:normal}
.html-embed .crp .clf{max-width:360px;margin:0 auto;text-align:center}
.html-embed .crp .branch{position:relative;height:40px;--c:calc((100% - 28px) / 6)}
.html-embed .crp .branch i{position:absolute;display:block;border:0 solid var(--b-line)}
.html-embed .crp .branch .s0{left:50%;top:0;height:18px;border-left-width:1.5px;margin-left:-.75px}
.html-embed .crp .branch .bar{top:18px;left:var(--c);right:var(--c);border-top-width:1.5px}
.html-embed .crp .branch .k{top:18px;height:14px;border-left-width:1.5px;margin-left:-.75px}
.html-embed .crp .branch .k1{left:var(--c)}
.html-embed .crp .branch .k2{left:50%}
.html-embed .crp .branch .k3{left:calc(100% - var(--c))}
.html-embed .crp .branch .hh{top:31px;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent; border-top:8px solid var(--b-line);margin-left:-5px}
.html-embed .crp .tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.html-embed .crp .tier{border-radius:12px;padding:12px 14px 14px;border:1.5px solid}
.html-embed .crp .tier .n{display:flex;align-items:baseline;gap:8px;margin-bottom:6px}
.html-embed .crp .tier .n b{font-size:30px;line-height:1;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums}
.html-embed .crp .tier .n small{font-size:14px;font-weight:700;color:var(--ink)}
.html-embed .crp .tier .pill{display:inline-block;font-size:12.5px;font-weight:700;line-height:1.5;padding:1px 9px;border-radius:999px; background:var(--pill);color:var(--pill-ink);margin-left:auto}
.html-embed .crp .tier .what{font-size:13.5px;line-height:1.6;color:var(--ink)}
.html-embed .crp .tier .what span{display:block;font-size:12px;color:var(--sub);margin-bottom:2px}
.html-embed .crp .tier.t0{background:var(--b-fill);border-color:var(--b-line)}
.html-embed .crp .tier.t1{background:var(--y-fill);border-color:var(--y-line)}
.html-embed .crp .tier.t2{background:var(--y-fill);border-color:var(--y-line);box-shadow:inset 0 0 0 3px var(--y-fill),inset 0 0 0 4.5px var(--y-line)}
.html-embed .crp .always{margin-top:14px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px; padding-top:14px;border-top:1px dotted var(--dash)}
.html-embed .crp .always .node .t{font-size:14px}
.html-embed .crp .stages{margin:8px 0 0;padding:0;list-style:none;border-top:1px solid var(--line)}
.html-embed .crp .stages li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:0 8px;padding:13px 0;border-bottom:1px solid var(--line)}
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
.html-embed .crp .turn .m{display:none;position:absolute;inset:0;align-items:center;justify-content:center;color:var(--y-line)}
.html-embed .crp .turn .m svg{transform:rotate(90deg)}
.html-embed .crp .turn .m em{position:absolute;left:calc(50% + 14px);font-style:normal;font-size:11px;color:var(--sub)}
.html-embed .crp .scroll{overflow-x:auto}
.html-embed .crp .scroll > .flow{min-width:820px}
@media (max-width:640px){.html-embed .crp{padding:26px 18px 30px;font-size:16px}
.html-embed .crp h1{font-size:23px}
.html-embed .crp h2{font-size:20px;margin-top:40px}
.html-embed .crp figure{padding:16px 14px 14px;margin-left:-4px;margin-right:-4px}
.html-embed .crp .scroll{overflow:visible}
.html-embed .crp .scroll > .flow{min-width:0}
.html-embed .crp .frow{flex-direction:column;align-items:stretch}
.html-embed .crp .frow .cells{flex-direction:column}
.html-embed .crp .frow .cells .node{height:auto;flex:none}
.html-embed .crp .g1,.html-embed .crp .g2,.html-embed .crp .g3,.html-embed .crp .g4{flex:none;width:100%}
.html-embed .crp .arr,.html-embed .crp .frow > .arr{flex:none;width:100%;height:34px;margin-top:0}
.html-embed .crp .arr svg{transform:rotate(90deg);width:30px}
.html-embed .crp .arr .al{bottom:auto;top:50%;left:calc(50% + 14px);transform:translateY(-50%)}
.html-embed .crp .turn{height:34px}
.html-embed .crp .turn i{display:none}
.html-embed .crp .turn .tl{display:none}
.html-embed .crp .turn .m{display:flex}
.html-embed .crp .loop{margin:0;height:auto;padding:8px 0 0}
.html-embed .crp .loop .ln,.html-embed .crp .loop .hd{display:none}
.html-embed .crp .loop .lt{position:static;transform:none;display:block;text-align:center;background:none;font-size:12px}
.html-embed .crp .struct{grid-template-columns:1fr}
.html-embed .crp .q3{grid-template-columns:1fr}
.html-embed .crp .branch{height:30px}
.html-embed .crp .branch .bar,.html-embed .crp .branch .k1,.html-embed .crp .branch .k3{display:none}
.html-embed .crp .branch .k2,.html-embed .crp .branch .s0{left:50%}
.html-embed .crp .branch .hh{display:none}
.html-embed .crp .branch .hh.k2{display:block;left:50%;top:22px}
.html-embed .crp .branch .k2{top:0;height:24px}
.html-embed .crp .tiers{grid-template-columns:1fr;gap:10px}
.html-embed .crp .always{grid-template-columns:1fr}}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Blog dark mode is html.dark (data-theme holds the palette name), so map the page's dark palette onto it. */
html.dark .html-embed .crp{
  --bg:#121417; --panel:#181b1f; --card:#1d2126; --ink:#e6e9ed; --sub:#a7b0ba; --line:#30363d; --dash:#545d68;
  --b-fill:#15263d; --b-line:#6ea3f0; --b-ink:#a9c8f5;
  --y-fill:#33270f; --y-line:#d9a24f; --y-ink:#f0d2a0;
  --g-fill:#23272c; --g-line:#77818c; --g-ink:#cfd5dc;
  --pill:#e6e9ed; --pill-ink:#121417;
}
/* Keep the page's sans headings; the blog's heading font and h2 rule otherwise win. */
.html-embed .crp h2,.html-embed .crp h3{font-family:var(--sans)!important;border:0!important;padding-bottom:0!important;color:var(--ink)!important}
.html-embed .crp h2{font-size:22px!important;line-height:1.4!important;margin:52px 0 8px!important}
.html-embed .crp h3{font-size:17px!important;line-height:1.5!important;margin:28px 0 6px!important}
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
          <div class="node b"><span class="t">找出问题并修掉</span><span class="d">改动上线之前，review 要找出问题并把它们修掉。</span></div>
          <div class="node b"><span class="t">形成共享的上下文</span><span class="d">与此同时，review 也让整个团队对代码库形成共享的上下文和理解。</span></div>
        </div>
      </div>
      <div class="outer">
        <div class="h">Claude review 对每个 PR 问的三个问题</div>
        <div class="s">原文里，每个 PR 上的 Claude review 读 diff 时都要问这三个问题。</div>
        <div class="q3">
          <div class="node w"><span class="t">解决问题了吗？</span><span class="d">这次改动解决了它要解决的问题吗？</span></div>
          <div class="node w"><span class="t">合得来吗？</span><span class="d">这次改动和现有系统合得来吗？</span></div>
          <div class="node w"><span class="t">会弄坏别处吗？</span><span class="d">这次改动会不会弄坏别的地方？</span></div>
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
    <div class="scroll"><div class="flow">
      <div class="frow">
        <div class="grp g1">
          <div class="glabel"><b>PR 前</b>Before the PR</div>
          <div class="cells">
            <div class="node b"><span class="t"><span class="no">01</span>工作先自验</span><span class="d">跑测试、构建和 linter，再由新上下文的 agent 审 diff</span></div>
          </div>
        </div>
        <div class="arr"><span class="al">开 PR</span><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
        <div class="grp g2">
          <div class="glabel"><b>每个 PR</b>On every PR</div>
          <div class="cells">
            <div class="node b"><span class="t"><span class="no">02</span>必过 CI</span><span class="d">lint、类型检查、多平台测试、构建和打包，一项变红就不能合并</span></div>
            <div class="arr"><span class="al">全绿</span><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
            <div class="node b"><span class="t"><span class="no">03</span>Claude code review</span><span class="d">多个 agent 找 bug，验证 agent 投票，再按严重程度排序</span></div>
            <div class="arr"><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
            <div class="node b"><span class="t"><span class="no">04</span>安全审查</span><span class="d">单独跑一轮；还有没关闭的发现，PR 就不能合并</span></div>
            <div class="arr"><span class="al">发现关闭</span><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
            <div class="node y"><span class="t"><span class="no">05</span>按风险审批</span><span class="d">分类器定风险档，风险档决定要 0、1 还是 2 个人批准</span></div>
          </div>
        </div>
      </div>
      <div class="turn" aria-hidden="true">
        <i class="t-a"></i><i class="t-b"></i><i class="t-c"></i><i class="t-h"></i>
        <span class="tl">批准够数，进入合并</span>
        <span class="m"><svg width="30" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg><em>批准够数</em></span>
      </div>
      <div class="frow">
        <div class="grp g3">
          <div class="glabel"><b>合并</b>Merging</div>
          <div class="cells">
            <div class="node b"><span class="t"><span class="no">06</span>Merge queue</span><span class="d">套到最新的 main 上，把所有检查再跑一遍</span></div>
          </div>
        </div>
        <div class="arr"><span class="al">合入 main</span><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
        <div class="grp g4">
          <div class="glabel"><b>合并之后</b>After the merge</div>
          <div class="cells">
            <div class="node g"><span class="t"><span class="no">07</span>Flag 后面，内部先用</span><span class="d">Anthropic 员工先用，再推给所有用户</span></div>
            <div class="arr fg"><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
            <div class="node g"><span class="t"><span class="no">08</span>渐进发布</span><span class="d">公开版本先发 latest 渠道，stable 渠道随后跟上</span></div>
            <div class="arr fg"><svg width="40" height="12" viewBox="0 0 40 12"><path d="M1 6H37" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M32 1.5L38 6L32 10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
            <div class="node g"><span class="t"><span class="no">09</span>盯着，往前修或回滚</span><span class="d">作者和 on-call 一起盯线上，出问题就关 flag 或 revert</span></div>
          </div>
          <div class="loop" aria-hidden="true"><span class="ln"></span><span class="hd"></span><span class="lt">出了问题：关掉 flag，revert 坏掉的构建</span></div>
        </div>
      </div>
    </div></div>
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
    <div class="node b clf"><span class="t">分类器读完改动，定下风险档</span><span class="d">风险档只看改动本身，不看作者是谁</span></div>
    <div class="branch" aria-hidden="true"><i class="s0"></i><i class="bar"></i><i class="k k1"></i><i class="k k2"></i><i class="k k3"></i><i class="hh k1"></i><i class="hh k2"></i><i class="hh k3"></i></div>
    <div class="tiers">
      <div class="tier t0"><div class="n"><b>0</b><small>人批准</small><span class="pill">低风险</span></div><div class="what"><span>走这一档的改动</span>文档、文案、flag 后面的增量改动</div></div>
      <div class="tier t1"><div class="n"><b>1</b><small>人批准</small><span class="pill">中风险</span></div><div class="what"><span>走这一档的改动</span>普通产品改动和敏感区域</div></div>
      <div class="tier t2"><div class="n"><b>2</b><small>人批准</small><span class="pill">高风险</span></div><div class="what"><span>走这一档的改动</span>风险最高的代码和少数指定路径</div></div>
    </div>
    <div class="always">
      <div class="node g"><span class="t">不管落在哪一档，都必须有人批</span><span class="d">比如负责人列为敏感的代码，以及所有 CI workflow 文件。</span></div>
      <div class="node g"><span class="t">agent 的批准不能顶替人的批准</span><span class="d">需要人批准的地方，agent 批了也不算数。</span></div>
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
