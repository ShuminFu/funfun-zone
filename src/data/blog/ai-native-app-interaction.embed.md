---
author: "Shumin Fu"
pubDatetime: 2026-10-14T14:29:07+08:00
modDatetime: 2026-10-14T03:08:28+08:00
title: "从 Claude 的两个组件，到未来的软件"
slug: ai-native-app-interaction
featured: false
draft: false
tags:
  - "ai-agents"
  - "claude-code"
  - "interaction-design"
description: "AI 开始走出聊天框，能直接改 App 本身。从 Claude Code 的 spawn_task 和 show_widget 出发，推想未来的软件。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Next OS demo, Apple-style: system grays, frosted cards, one blue accent; follows the blog's light/dark toggle. */
.fz{--bg:#f5f5f7;--card:rgba(255,255,255,.86);--ink:#1d1d1f;--ink2:#6e6e73;--ink3:#86868b;--line:rgba(0,0,0,.08);
  --fill:rgba(118,118,128,.12);--fill2:rgba(118,118,128,.08);--blue:#0071e3;--green:#34c759;--red:#ff3b30;--shadow:0 1px 2px rgba(0,0,0,.04),0 6px 20px rgba(0,0,0,.06);
  --font:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro SC","PingFang SC","Helvetica Neue",sans-serif;
  position:relative;margin:2rem 0;border-radius:22px;overflow:hidden;color:var(--ink);background:var(--bg);
  font-family:var(--font);font-size:14px;line-height:1.5;letter-spacing:-.01em;-webkit-font-smoothing:antialiased;
  border:1px solid var(--line);box-shadow:0 20px 60px -30px rgba(0,0,0,.25)}
html[data-theme="dark"] .fz{--bg:#1c1c1e;--card:rgba(44,44,46,.86);--ink:#f5f5f7;--ink2:#a1a1a6;--ink3:#8e8e93;--line:rgba(255,255,255,.1);
  --fill:rgba(118,118,128,.24);--fill2:rgba(118,118,128,.16);--blue:#0a84ff;--green:#30d158;--red:#ff453a;--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.3);
  box-shadow:0 20px 60px -30px rgba(0,0,0,.8)}
.fz *{box-sizing:border-box}
.fz button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;letter-spacing:inherit}
.fz button:focus-visible,.fz [role="button"]:focus-visible{outline:3px solid color-mix(in srgb,var(--blue) 50%,transparent);outline-offset:2px}
/* top bar: a frosted toolbar */
.fz-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:var(--card);
  backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--line)}
.fz-brand{font-weight:600;font-size:15px;letter-spacing:-.02em}
/* the agent: an Apple-Intelligence-like glow */
.fz-orb{width:20px;height:20px;border-radius:50%;flex:none;
  background:conic-gradient(from 0deg,#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff);animation:fz-spin 4s linear infinite;
  box-shadow:0 0 12px rgba(191,90,242,.45)}
.fz-status{font-size:12.5px;color:var(--ink2);flex:1;min-width:140px}
.fz-pins{display:flex;gap:6px;flex-wrap:wrap}
.fz-pin{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;padding:3px 10px 3px 8px;border-radius:999px;
  background:var(--fill);color:var(--ink);white-space:nowrap;animation:fz-in .4s ease-out both}
.fz-pin::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--blue)}
/* iOS segmented control */
.fz-label{font-size:12px;font-weight:600;color:var(--ink3);margin-bottom:6px;letter-spacing:0}
.fz-body{display:grid;grid-template-columns:76px 1fr 220px;gap:14px;padding:14px 16px 16px;min-height:430px}
/* dock */
.fz-dock{display:flex;flex-direction:column;gap:10px}
.fz-dk{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:var(--ink2)}
.fz-dk i{font-style:normal;width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-size:19px;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.12)}
.fz-dk[data-dock="记账"] i{background:linear-gradient(180deg,#5ad06b,#28a745)}
.fz-dk[data-dock="日历"] i{background:linear-gradient(180deg,#ff6a5f,#ff3b30)}
.fz-dk[data-dock="订阅"] i{background:linear-gradient(180deg,#5aa9ff,#0a6cff)}
.fz-dk[data-dock="相册"] i{background:linear-gradient(180deg,#ffb340,#ff8a00)}
.fz-dk.new{cursor:pointer;color:var(--ink);animation:fz-in .45s ease-out both}
.fz-dk.new i{background:linear-gradient(135deg,#0a84ff,#bf5af2)}
.fz-badge{position:absolute;top:-5px;left:calc(50% + 14px);min-width:19px;height:19px;padding:0 5px;border-radius:10px;font-style:normal;
  font-size:11.5px;font-weight:600;line-height:19px;text-align:center;background:var(--red);color:#fff;display:none;
  box-shadow:0 0 0 2px var(--bg)}
.fz-badge.on{display:block;animation:fz-pop .3s ease-out}
.fz-badge.ok{background:var(--green)}
.fz-ping{animation:fz-ping .7s ease-out}
.fz-dk.fz-ping{animation:none}.fz-dk.fz-ping i{animation:fz-ping .7s ease-out}
.fz-fly{position:absolute;z-index:5;width:10px;height:10px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,#fff 0 30%,#0a84ff 70%);box-shadow:0 0 14px 4px rgba(10,132,255,.45);
  transition:transform .6s cubic-bezier(.4,0,.2,1)}
/* stream */
.fz-stream{display:flex;flex-direction:column;gap:12px;min-width:0}
.fz-card{position:relative;border-radius:18px;padding:14px 16px;background:var(--card);box-shadow:var(--shadow);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);animation:fz-in .45s cubic-bezier(.2,.8,.2,1) both;overflow:hidden}
.fz-card.gen{min-height:96px}
/* generating: a soft multicolor edge glow */
.fz-card.gen::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;
  background:conic-gradient(from var(--fz-a,0deg),#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
  animation:fz-edge 1.2s linear infinite}
.fz-gentext{font-size:12.5px;color:var(--ink3)}
.fz-skel{height:10px;border-radius:5px;margin-top:10px;background:linear-gradient(90deg,var(--fill2),var(--fill),var(--fill2));
  background-size:200% 100%;animation:fz-shimmer 1.1s linear infinite}
.fz-skel.s2{width:72%}.fz-skel.s3{width:44%}
.fz-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:var(--ink3)}
.fz-ico{width:20px;height:20px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;
  color:#fff;background:var(--ink3)}
.fz-tag{margin-left:auto;font-size:11.5px;color:var(--blue)}
.fz-title{font-size:16px;font-weight:600;letter-spacing:-.02em;margin:6px 0 2px}
.fz-detail{font-size:13.5px;color:var(--ink2);margin:0}
.fz-ui{margin-top:12px}
.fz-actions{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.fz-btn{font-size:13px!important;font-weight:500;padding:6px 16px!important;border-radius:999px;background:var(--fill)!important;color:var(--blue)}
.fz-btn.go{background:var(--blue)!important;color:#fff}
.fz-btn:hover{filter:brightness(.96)}
.fz-done{display:flex;align-items:center;gap:6px;color:var(--green);font-weight:600;font-size:14px;margin-top:8px}
.fz-count{position:absolute;left:0;bottom:0;height:3px;background:var(--blue);animation:fz-count 6s linear forwards}
.fz-note{font-size:12.5px;color:var(--ink3);padding:2px 4px;animation:fz-in .35s ease-out both}
.fz-note b{color:var(--blue);font-weight:500}
.fz-chips{display:flex;gap:6px;flex-wrap:wrap}
.fz-chip{font-size:12.5px!important;padding:4px 12px!important;border-radius:999px;background:var(--fill2)!important;color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--line)}
.fz-chip.on{background:color-mix(in srgb,var(--blue) 14%,transparent)!important;color:var(--blue);box-shadow:inset 0 0 0 1.5px var(--blue)}
.fz-ui svg{display:block;width:100%;height:auto;max-width:380px}
.fz .t-grid{stroke:var(--line)}
.fz .t-lab{fill:var(--ink3);font-size:8px;font-family:var(--font)}
.fz .t-bad{fill:color-mix(in srgb,var(--red) 16%,transparent);stroke:var(--red)}
.fz .t-badtext{fill:var(--red);font-size:8px;font-family:var(--font)}
.fz .t-new{fill:color-mix(in srgb,var(--green) 14%,transparent);stroke:var(--green);stroke-dasharray:3 2}
.fz .t-newtext{fill:var(--green);font-size:8px;font-family:var(--font)}
.fz .b-bar{fill:color-mix(in srgb,var(--blue) 35%,transparent)}
.fz .b-max{fill:var(--blue)}
.fz-mail{border-radius:12px;background:var(--fill2);padding:10px 12px;font-size:13px;color:var(--ink2)}
.fz-mail b{font-weight:500;color:var(--ink3);margin-right:8px}
.fz-mail-body{margin-top:6px;color:var(--ink)}
.fz-shift{display:grid;grid-template-columns:auto auto 1fr;gap:4px 14px;font-size:13px;color:var(--ink);font-variant-numeric:tabular-nums}
.fz-shift s{color:var(--ink3)}
.fz-shift i{font-style:normal;color:var(--blue);font-weight:500}
/* right rail: grouped inset lists */
.fz-rail{display:flex;flex-direction:column;gap:12px;min-width:0}
.fz-box{border-radius:16px;padding:12px 14px;background:var(--card);box-shadow:var(--shadow)}
.fz-meter{display:flex;align-items:baseline;gap:4px}
.fz-meter b{font-size:30px;font-weight:600;letter-spacing:-.03em;line-height:1.05;font-variant-numeric:tabular-nums;color:var(--red)}
.fz-meter b.cy{color:var(--blue)}
.fz-meter span{font-size:13px;color:var(--ink2)}
.fz-list{list-style:none;margin:6px 0 0;padding:0;font-size:12.5px}
.fz-list li{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:.5px solid var(--line);color:var(--ink);animation:fz-in .35s ease-out both}
.fz-list li:first-child{border-top:0}
.fz-list li span{flex:1}
.fz-list li::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;margin-top:6px;background:var(--green)}
.fz-list.shell li::before{background:var(--blue)}
.fz-list li.fz-empty::before{display:none}
.fz-list button{font-size:12px;color:var(--blue);white-space:nowrap}
.fz-empty{font-size:12.5px;color:var(--ink3)}
/* ask bar */
.fz-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--card)}
.fz-bar .fz-label{margin:0 4px 0 0}
.fz-ask{font-size:13px;padding:6px 14px;border-radius:999px;background:var(--fill)!important;color:var(--ink)}
.fz-ask:hover{background:color-mix(in srgb,var(--blue) 14%,transparent)!important;color:var(--blue)}
/* "today's app" */
/* spotlight-style intent bar */
.fz-bar{flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:10px}
.fz-input{display:flex;align-items:center;gap:8px;height:42px;padding:0 14px;border-radius:12px;background:var(--fill);font-size:15px}
.fz-spot{font-size:17px;color:var(--ink3)}
.fz-typed{color:var(--ink)}
.fz-typed::after{content:"";display:inline-block;width:2px;height:1.1em;margin-left:2px;vertical-align:-3px;background:var(--blue);animation:fz-blink 1s steps(1) infinite}
.fz-typed.fz-ph{color:var(--ink3)}
.fz-sugs{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.fz-sugs .fz-label{margin:0;min-width:44px}
.fz-ask.set{color:var(--blue)}
.fz-set{display:grid;gap:1px;border-radius:12px;overflow:hidden;background:var(--line)}
.fz-set div{display:flex;justify-content:space-between;gap:16px;padding:8px 12px;background:var(--fill2);font-size:13px}
html:not([data-theme="dark"]) .fz-set div{background:#fafafc}
.fz-set span{color:var(--ink3)}
.fz-set b{font-weight:500;color:var(--ink);text-align:right}
.fz-tools{display:flex}
.fz-tool{font-size:12.5px!important;font-weight:600;padding:4px 12px!important;border-radius:999px;color:#fff!important;background:var(--blue)!important;animation:fz-in .4s ease-out both}
.fz-dk.more i{background:var(--fill);color:var(--ink2);box-shadow:none}
/* old settings page: a wall of switches */
@keyframes fz-blink{50%{opacity:0}}
/* settings sheet: the old search field becomes the place to say what you want */
.fz-dk.gear{cursor:pointer}
.fz-dk.gear i{background:linear-gradient(180deg,#a1a1a6,#7c7c80)}
.fz-sheet{position:absolute;inset:0;z-index:4;display:flex;justify-content:center;align-items:flex-start;padding:60px 16px 16px;
  background:rgba(0,0,0,.22);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:fz-fade .25s ease-out}
.fz-sheet[hidden]{display:none}
.fz-sheet-card{width:min(540px,100%);max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:12px;padding:14px 16px 16px;
  border-radius:20px;background:var(--bg);box-shadow:0 24px 60px rgba(0,0,0,.28);animation:fz-up .35s cubic-bezier(.2,.8,.2,1)}
.fz-sheet-head{display:flex;justify-content:space-between;align-items:center}
.fz-sheet-head b{font-size:20px;font-weight:700;letter-spacing:-.02em}
.fz-x{color:var(--blue)!important;font-weight:600;font-size:15px}
.fz-groups{display:grid;gap:.5px;border-radius:12px;overflow:hidden;background:var(--line)}
.fz-groups [role="button"]{cursor:pointer}
.fz-groups [role="button"]:hover,.fz-row[role="button"]:hover{filter:brightness(.97)}
.fz-groups div{display:flex;justify-content:space-between;padding:9px 12px;background:var(--card);font-size:13.5px}
.fz-groups span{color:var(--ink3)}
.fz-groups .fz-gmore{justify-content:center;color:var(--ink3);font-size:12.5px}
@keyframes fz-fade{from{opacity:0}}
@keyframes fz-up{from{opacity:0;transform:translateY(24px) scale(.98)}}
@property --fz-a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes fz-edge{to{--fz-a:360deg}}
@keyframes fz-spin{to{transform:rotate(360deg)}}
@keyframes fz-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
@keyframes fz-pop{0%{transform:scale(.4)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes fz-ping{0%{box-shadow:0 0 0 0 rgba(10,132,255,.55)}100%{box-shadow:0 0 0 14px rgba(10,132,255,0)}}
@keyframes fz-shimmer{to{background-position:-200% 0}}
@keyframes fz-count{from{width:100%}to{width:0}}
@media (max-width:720px){
  .fz-body{grid-template-columns:1fr}
  .fz-rail{display:contents}
  .fz-dock{order:-2;flex-direction:row;flex-wrap:wrap;justify-content:space-between}
  #fz-docknew{display:contents}
}
@media (prefers-reduced-motion:reduce){.fz *,.fz *::before{animation:none!important}}
.fz-sheet .fz-sugs{flex-direction:column;align-items:flex-start;gap:6px}
.fz-sub-head{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:12px}
.fz-back{justify-self:start;color:var(--blue)!important;font-size:15px}
.fz-sub-head b{font-size:16px;font-weight:600}
.fz-rows{display:grid;gap:.5px;border-radius:12px;overflow:hidden;background:var(--line)}
.fz-row{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:40px;padding:6px 12px;background:var(--card);font-size:13.5px}
.fz-row[role="button"]{cursor:pointer}
.fz-row em{font-style:normal;color:var(--ink3)}
.fz-tg{width:42px;height:25px;border-radius:13px;background:var(--fill)!important;position:relative;flex:none;transition:background .2s}
.fz-tg::after{content:"";position:absolute;top:2px;left:2px;width:21px;height:21px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:left .2s}
.fz-tg.on{background:var(--green)!important}
.fz-tg.on::after{left:19px}
.fz-morerows{font-size:12.5px;color:var(--ink3);margin-top:8px;text-align:center}
#fz-sheet-main{display:flex;flex-direction:column;gap:12px}
#fz-sheet-main[hidden],#fz-sheet-sub[hidden]{display:none}
/* annotations: deliberately NOT Apple UI, so readers see them as notes on the demo, not app features */
.fz-anno{position:absolute;z-index:6;transform:translateY(-50%);pointer-events:none;white-space:nowrap;
  font:600 11px/1.2 ui-monospace,"SF Mono",Menlo,monospace;color:#1d1d1f;background:#ffd60a;padding:4px 8px;border-radius:6px;
  box-shadow:0 4px 12px rgba(0,0,0,.18);animation:fz-anno 2.6s ease-out forwards}
.fz-anno::before{content:"";position:absolute;left:-4px;top:50%;width:8px;height:8px;background:#ffd60a;transform:translateY(-50%) rotate(45deg)}
.fz-anno.l{transform:translate(-100%,-50%)}
.fz-anno.l::before{left:auto;right:-4px}
@keyframes fz-anno{0%{opacity:0}8%{opacity:1}80%{opacity:1}100%{opacity:0}}
.fz-narr{margin:-1rem 0 2rem;padding:2px 0 2px 12px;border-left:2px solid #ffd60a;font-size:.875em;opacity:.85}
.fz-narr b{font-weight:700;margin-right:.5em}
</style>

<div class="html-embed" lang="zh-CN">
<p class="lead">AI 开始走出聊天框，能直接改 App 本身。顺着这一点往下推，软件会变成什么样？文中有一个能上手玩的未来 App 模型。</p>
<h2>AI 走出了聊天框</h2>
<p><a href="/posts/claude-code-spawn-task-show-widget/">上一篇</a>讲了 Claude Code 桌面版里的两个工具。<code>show_widget</code> 让 Claude 在回答旁边当场画出一个能点的界面。<code>spawn_task</code> 让 Claude 在应用界面上放一张卡片，你点一下，它就另开一个会话去处理。</p>
<p>第二个值得多想一步。以前 AI 能做的，只是在对话框里回话。<code>spawn_task</code> 让它在对话框外面、在应用本身放了一个可以操作的东西。做不做，仍然由你点。</p>
<p>把这一点推到底：如果 App 里的每个地方，AI 都能先放点东西进来，App 会变成什么样？</p>
<h2>先玩一下</h2>
<p>下面是一个未来的 App。卡片里的界面都是当场生成的。AI 也不只待在卡片里：它会给图标挂角标，在停靠栏开新入口，在顶栏钉提醒，能力延伸到了整个 App。想改 App 本身，点停靠栏最下面的「设置」，在原来搜索框的位置直接说。</p>
<div class="fz not-prose" id="fz-demo">
  <div class="fz-top">
    <span class="fz-brand">Next OS</span>
    <span class="fz-orb" id="fz-orb" aria-hidden="true"></span>
    <span class="fz-status" id="fz-status">代理在后台工作</span>
    <span class="fz-pins" id="fz-pins"></span>
    <span class="fz-tools" id="fz-tools"></span>
  </div>
  <div class="fz-bar">
    <div class="fz-input"><span class="fz-spot" aria-hidden="true">⌕</span><span class="fz-typed fz-ph" id="fz-typed">想问什么，直接说</span></div>
    <div class="fz-sugs">
      <span class="fz-label">问一句</span>
      <button type="button" class="fz-ask" data-act="ask" data-q="0">这周花了多少？</button>
      <button type="button" class="fz-ask" data-act="ask" data-q="1">周五晚上订个两人位</button>
    </div>
  </div>
  <div class="fz-body">
    <div class="fz-dock" id="fz-dock" aria-label="停靠栏">
      <div class="fz-dk" data-dock="记账"><i>¥</i><span>记账</span><em class="fz-badge"></em></div>
      <div class="fz-dk" data-dock="日历"><i>◷</i><span>日历</span><em class="fz-badge"></em></div>
      <div class="fz-dk" data-dock="订阅"><i>↻</i><span>订阅</span><em class="fz-badge"></em></div>
      <div class="fz-dk" data-dock="相册"><i>▣</i><span>相册</span><em class="fz-badge"></em></div>
      <div id="fz-docknew"></div>
      <div class="fz-dk gear" data-act="settings" role="button" tabindex="0"><i>⚙</i><span>设置</span></div>
    </div>
    <div class="fz-stream" id="fz-stream" aria-live="polite"></div>
    <div class="fz-rail">
      <div class="fz-box">
        <div class="fz-label">已完成 · 可撤回</div>
        <ul class="fz-list" id="fz-ledger"></ul>
      </div>
    </div>
  </div>
  <div class="fz-sheet" id="fz-sheet" hidden>
    <div class="fz-sheet-card" role="dialog" aria-label="设置">
      <div id="fz-sheet-main">
      <div class="fz-sheet-head"><b>设置</b><button type="button" class="fz-x" data-act="closeset">完成</button></div>
      <div class="fz-input"><span class="fz-spot" aria-hidden="true">⌕</span><span class="fz-typed fz-ph" id="fz-typed2">想要什么功能、什么效果、放在哪，直接说</span></div>
      <div class="fz-sugs">
        <span class="fz-label">试试</span>
        <button type="button" class="fz-ask set" data-act="setask" data-q="3">晚上 10 点后别推工作消息，紧急的除外</button>
        <button type="button" class="fz-ask set" data-act="setask" data-q="4">把日历放到最上面，相册收起来</button>
        <button type="button" class="fz-ask set" data-act="setask" data-q="5">在顶栏加一个随手记账的按钮</button>
      </div>
      <div id="fz-sheet-out"></div>
      <div class="fz-groups"><div data-act="group" data-g="通知" role="button" tabindex="0">通知<span>12 项 ›</span></div><div data-act="group" data-g="专注与勿扰" role="button" tabindex="0">专注与勿扰<span>9 项 ›</span></div><div data-act="group" data-g="显示与外观" role="button" tabindex="0">显示与外观<span>17 项 ›</span></div><div data-act="group" data-g="隐私与安全" role="button" tabindex="0">隐私与安全<span>23 项 ›</span></div><div class="fz-gmore">共 146 项</div></div>
      </div>
      <div id="fz-sheet-sub" hidden></div>
    </div>
  </div>
</div>
<p class="fz-narr" id="fz-narr"><b>旁白</b><span id="fz-narr-t">AI 每改一处 App 本身，会在那里贴一张黄色便签，这里也会记一笔。</span></p>
<script data-astro-rerun>
(function(){
var root=document.getElementById('fz-demo');
if(!root||root.getAttribute('data-ready'))return;
root.setAttribute('data-ready','1');
function $(id){return document.getElementById(id)}
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var STATUS=['读上周的账单','对比日历','检查订阅价格','扫描相册','待命'];
function chips(list){return '<div class="fz-chips">'+list.map(function(c,i){return '<button type="button" class="fz-chip'+(i===0?' on':'')+'" data-act="pick">'+c+'</button>'}).join('')+'</div>'}
function timeline(){var x=function(h){return 18+(h-13)*58};var s='<svg viewBox="0 0 270 64" aria-hidden="true">';
for(var h=13;h<=17;h++){s+='<line x1="'+x(h)+'" y1="4" x2="'+x(h)+'" y2="50" class="t-grid"/><text x="'+x(h)+'" y="62" class="t-lab" text-anchor="middle">'+h+':00</text>'}
s+='<rect x="'+x(14)+'" y="6" width="58" height="16" rx="4" class="t-bad"/><text x="'+(x(14)+6)+'" y="17" class="t-badtext">周会</text>';
s+='<rect x="'+x(14)+'" y="28" width="58" height="16" rx="4" class="t-bad"/><text x="'+(x(14)+6)+'" y="39" class="t-badtext">客户电话</text>';
s+='<rect x="'+x(15.5)+'" y="6" width="58" height="16" rx="4" class="t-new"/><text x="'+(x(15.5)+6)+'" y="17" class="t-newtext">周会 → 15:30</text>';
return s+'</svg>'}
function mail(){return '<div class="fz-mail"><div><b>收件人</b>会员服务</div><div><b>主题</b>取消自动续费</div><div class="fz-mail-body">你好，下个周期我不再续订，请在本期结束后停止扣费。</div></div>'}
function bars(){var v=[96,210,148,120,183,402,125],d=['一','二','三','四','五','六','日'],s='<svg viewBox="0 0 260 80" aria-hidden="true">';
v.forEach(function(n,i){var hgt=n/402*56,bx=8+i*36;s+='<rect x="'+bx+'" y="'+(62-hgt)+'" width="24" height="'+hgt+'" rx="3" class="'+(n===402?'b-max':'b-bar')+'"/><text x="'+(bx+12)+'" y="74" class="t-lab" text-anchor="middle">'+d[i]+'</text>'});
return s+'</svg>'}
function shift(){return '<div class="fz-shift"><span>站会</span><s>09:30</s><i>→ 10:30</i><span>评审</span><s>14:00</s><i>→ 15:00</i><span>一对一</span><s>16:30</s><i>→ 17:30</i></div>'}
var SCENE=[
{app:'记账',ico:'¥',title:'上周 7 笔消费，6 笔已经分好类',detail:'有 1 笔拿不准：¥38 · 街角咖啡。你选一下，以后同类的它就知道了。',ui:function(){return chips(['餐饮','工作招待','其他'])},yes:'确认分类',done:'上周 7 笔消费已归类'},
{app:'日历',ico:'◷',title:'周四 14:00 有两个会撞了',detail:'把「周会」挪到 15:30，两边的人那时都有空。',ui:timeline,yes:'挪过去',done:'周会已挪到周四 15:30',pin:'周四 15:30 周会'},
{app:'订阅',ico:'↻',title:'视频会员下月起从 ¥15 涨到 ¥25',detail:'退订邮件已经写好，发不发你说了算。',ui:mail,yes:'发出退订',done:'退订邮件已发出'},
{app:'相册',ico:'▣',side:true,title:'顺路发现：相册里有 214 张重复照片',done:'214 张重复照片已移到回收站'}];
var ASKS=[
{app:'你问的',ico:'?',title:'这周一共花了 ¥1,284',detail:'按天看，周六最多（¥402）。',ui:bars,yes:'好的',done:'看过本周花费'},
{app:'你问的',ico:'?',title:'周五晚上，两人位，这三家还有空',detail:'按你以前去过的口味排的。',ui:function(){return chips(['湖边小馆 19:00','巷口面馆 18:30','屋顶烤肉 19:30'])},yes:'就订这个',done:'已订周五晚上两人位',pin:'周五晚饭'},
{app:'你问的',ico:'?',title:'明天 3 个会，推后之后是这样',detail:'没有和别的安排撞上。',ui:shift,yes:'照这个改',done:'明天 3 个会各推后 1 小时'},
{app:'改 App',ico:'⚙',title:'晚上 10 点后，工作消息静音',detail:'标了「紧急」的照常提醒。状态放在顶栏，一眼就能看到。',ui:function(){return setRows([['时间','22:00 – 08:00'],['静音','工作群、工作邮件'],['例外','标了「紧急」的'],['放在','顶栏']])},yes:'应用',done:'夜间勿扰已打开',pin:'夜间勿扰 22:00–08:00'},
{app:'改 App',ico:'⚙',title:'停靠栏这样排',detail:'相册收进「更多」，要用时点开就有。',ui:function(){return setRows([['现在','记账 · 日历 · 订阅 · 相册'],['改成','日历 · 记账 · 订阅 · 更多']])},yes:'应用',done:'停靠栏已重新排列',apply:dockApply,revert:dockRevert},
{app:'改 App',ico:'⚙',title:'顶栏加一个「记一笔」按钮',detail:'点一下就能记账，不用先打开记账。',ui:function(){return setRows([['位置','顶栏右侧'],['点了以后','弹出记账卡片，选一项就记下']])},yes:'应用',done:'顶栏加了「记一笔」按钮',apply:toolApply,revert:toolRevert}];
var QUICK={app:'记账',ico:'¥',title:'记一笔',detail:'常记的几项，点一下就行。',ui:function(){return chips(['午饭 ¥25','咖啡 ¥12','打车 ¥36'])},yes:'记下',done:'记了一笔'};
function setRows(rows){return '<div class="fz-set">'+rows.map(function(r){return '<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'}).join('')+'</div>'}
function dockApply(){var d=$('fz-dock'),cal=dock('日历');d.insertBefore(cal,d.firstChild);dock('相册').style.display='none';
var more=document.createElement('div');more.className='fz-dk more';more.innerHTML='<i>⋯</i><span>更多</span>';d.insertBefore(more,$('fz-docknew'));fly(cal,function(){touch('停靠栏重排：日历放最上，相册收进更多',cal,'重排停靠栏')})}
function dockRevert(){var d=$('fz-dock');d.insertBefore(dock('日历'),dock('记账').nextSibling);dock('相册').style.display='';var m=d.querySelector('.more');if(m)m.remove()}
function toolApply(){var b=document.createElement('button');b.type='button';b.className='fz-tool';b.setAttribute('data-act','quick');b.textContent='+ 记一笔';$('fz-tools').appendChild(b);fly(b,function(){touch('顶栏加了一个按钮：记一笔',b,'加了按钮')})}
function toolRevert(){$('fz-tools').innerHTML=''}
var DOCK0=$('fz-dock').innerHTML;
var st={level:1,timers:[],ints:0,uid:0,items:{},touched:0};
function later(fn,ms){st.timers.push(setTimeout(fn,ms))}
function reg(it){var k=++st.uid;st.items[k]=it;return k}
function empty(id,txt){var ul=$(id);if(!ul.children.length)ul.innerHTML='<li class="fz-empty" style="list-style:none">'+txt+'</li>'}
function addTo(id,html){var ul=$(id);var e=ul.querySelector('.fz-empty');if(e)ul.innerHTML='';var li=document.createElement('li');li.innerHTML=html;ul.appendChild(li);return li}
function note(html){var n=document.createElement('div');n.className='fz-note';n.innerHTML=html;$('fz-stream').appendChild(n)}
/* the orb shoots a spark at the shell element it is about to change */
function fly(el,then){if(!el){then&&then();return}
if(reduce){then&&then();ping(el);return}
var r=root.getBoundingClientRect(),o=$('fz-orb').getBoundingClientRect(),t=el.getBoundingClientRect();
var d=document.createElement('i');d.className='fz-fly';d.style.left=(o.left-r.left+o.width/2-4)+'px';d.style.top=(o.top-r.top+o.height/2-4)+'px';root.appendChild(d);
requestAnimationFrame(function(){requestAnimationFrame(function(){d.style.transform='translate('+(t.left-o.left+t.width/2-o.width/2)+'px,'+(t.top-o.top+t.height/2-o.height/2)+'px)'})});
st.timers.push(setTimeout(function(){d.remove();then&&then();ping(el)},620))}
function ping(el){el.classList.remove('fz-ping');void el.offsetWidth;el.classList.add('fz-ping')}
function touch(text,el,short){st.touched++;$('fz-narr-t').innerHTML='AI 已经改了 App 本身 <b>'+st.touched+'</b> 处。刚才：'+text+'。';
if(!el||!short)return;var r=root.getBoundingClientRect(),t=el.getBoundingClientRect(),a=document.createElement('div');a.className='fz-anno';a.textContent='AI 改了这里 · '+short;
var left=t.right-r.left+6;if(left>r.width-150){left=t.left-r.left-6;a.classList.add('l')}a.style.left=left+'px';a.style.top=(t.top-r.top+t.height/2)+'px';root.appendChild(a);
st.timers.push(setTimeout(function(){a.remove()},2600))}
function dock(app){return root.querySelector('.fz-dk[data-dock="'+app+'"]')}
function badge(app,val,say){var d=dock(app);if(!d)return;var b=d.querySelector('.fz-badge');
fly(d,function(){b.textContent=val;b.className='fz-badge'+(val?' on':'')+(val==='✓'?' ok':'');if(say)touch(say,d,val==='✓'?'标上 ✓':'挂了角标')})}
function pin(it){if(!it.pin)return;var p=document.createElement('span');p.className='fz-pin';p.textContent=it.pin;p.setAttribute('data-pin',it.pin);
$('fz-pins').appendChild(p);fly(p,function(){touch('顶栏钉了一条提醒：'+it.pin,p,'钉了提醒')})}
function unpin(it){if(!it.pin)return;var p=$('fz-pins').querySelector('[data-pin="'+it.pin+'"]');if(p)p.remove()}
function effects(it){if(SCENE.indexOf(it)>=0)badge(it.app,'✓','「'+it.app+'」图标标上 ✓');pin(it)}
function ledger(it){var k=reg(it);addTo('fz-ledger','<span>'+it.done+'</span><button type="button" data-act="unledger" data-k="'+k+'">撤回</button>')}
function head(it,tag){return '<div class="fz-head"><span class="fz-ico">'+it.ico+'</span>'+it.app+(tag?'<span class="fz-tag">'+tag+'</span>':'')+'</div>'}
function card(it,stateName,tag,first,box){var k=reg(it);var c=document.createElement('div');c.className='fz-card gen';c.setAttribute('data-k',k);
c.innerHTML='<div class="fz-gentext">正在生成界面 · 拼装组件…</div><div class="fz-skel"></div><div class="fz-skel s2"></div><div class="fz-skel s3"></div>';
var sm=box||$('fz-stream');if(first)sm.insertBefore(c,sm.firstChild);else sm.appendChild(c);later(function(){c.classList.remove('gen');fill(c,it,stateName,tag)},650);return c}
function fill(c,it,stateName,tag){var k=c.getAttribute('data-k');var h=head(it,tag)+'<div class="fz-title">'+it.title+'</div>'+(it.detail?'<p class="fz-detail">'+it.detail+'</p>':'');
if(stateName==='tell'){h+='<div class="fz-actions"><button type="button" class="fz-btn" data-act="close" data-k="'+k+'">知道了</button></div>'}
else if(stateName==='ask'){h+='<div class="fz-ui">'+it.ui()+'</div><div class="fz-actions"><button type="button" class="fz-btn go" data-act="yes" data-k="'+k+'">'+it.yes+'</button><button type="button" class="fz-btn" data-act="close" data-k="'+k+'">不要</button></div>'}
else if(stateName==='undo'){h+='<div class="fz-done">✓ '+it.done+'</div><div class="fz-actions"><button type="button" class="fz-btn" data-act="undo" data-k="'+k+'">撤回</button></div><div class="fz-count"></div>';
later(function(){if(c.isConnected&&c.querySelector('.fz-count')){c.remove();ledger(it)}},6000)}
c.innerHTML=h}
function deliver(it){
if(it.side){var k=reg(it);var e=document.createElement('div');e.className='fz-dk new';e.setAttribute('data-act','dolater');e.setAttribute('data-k',k);e.setAttribute('role','button');e.setAttribute('tabindex','0');
e.innerHTML='<i>✦</i><span>整理照片</span>';fly($('fz-docknew'),function(){$('fz-docknew').appendChild(e);ping(e);touch('停靠栏新开了一个入口：整理照片',e,'新开入口')});
note('<b>✦</b> 顺路发现一件跟今天无关的事。它在停靠栏开了一个新入口，没有打断你。');return}
if(st.level===3){ledger(it);effects(it);note('<b>✓</b> 后台做完了一件事（'+it.app+'）');return}
if(st.level===2){effects(it);card(it,'undo');return}
badge(it.app,'1','「'+it.app+'」图标挂上角标');card(it,['tell','ask'][st.level])}
function play(){st.timers.forEach(clearTimeout);st.timers=[];st.ints=0;st.items={};st.touched=0;
$('fz-stream').innerHTML='';$('fz-ledger').innerHTML='';root.querySelectorAll('.fz-anno').forEach(function(x){x.remove()});$('fz-narr-t').textContent='AI 每改一处 App 本身，会在那里贴一张黄色便签，这里也会记一笔。';$('fz-dock').innerHTML=DOCK0;$('fz-tools').innerHTML='';sheet(false);$('fz-pins').innerHTML='';
root.querySelectorAll('.fz-badge').forEach(function(b){b.className='fz-badge';b.textContent=''});
empty('fz-ledger','还没有');
SCENE.forEach(function(it,i){later(function(){$('fz-status').textContent='代理在后台工作 · '+STATUS[i];deliver(it)},500+i*1600)});
later(function(){$('fz-status').textContent='代理在后台工作 · '+STATUS[4]},500+SCENE.length*1600)}
function act(b){var a=b.getAttribute('data-act'),k=b.getAttribute('data-k'),it=st.items[k],c=b.closest('.fz-card');
if(a==='pick'){b.parentNode.querySelectorAll('.fz-chip').forEach(function(x){x.classList.toggle('on',x===b)})}
else if(a==='yes'){var pick=c.querySelector('.fz-chip.on');var done=it.done,pinTxt=it.pin;
if(it===ASKS[1]&&pick){done='已订周五 · '+pick.textContent+' · 两人位';pinTxt='周五 '+pick.textContent.split(' ')[1]+' 晚饭'}
if(it===QUICK&&pick)done='记了一笔：'+pick.textContent;
var r={done:done,pin:pinTxt,app:it.app,revert:it.revert};if(SCENE.indexOf(it)>=0){r=it;r.done=done}
if(c.closest('.fz-sheet')){var ap=it.apply;sheet(false);later(function(){if(ap)ap();ledger(r);effects(r)},280)}
else{if(it.apply)it.apply();c.remove();ledger(r);effects(r)}}
else if(a==='close'){c.remove();if(SCENE.indexOf(it)>=0)badge(it.app,'')}
else if(a==='undo'){unpin(it);var n=document.createElement('div');n.className='fz-card';n.setAttribute('data-k',k);c.replaceWith(n);fill(n,it,'ask','已撤回，等你决定');badge(it.app,'1')}
else if(a==='unledger'){b.closest('li').remove();empty('fz-ledger','还没有');unpin(it);if(it.revert)it.revert();if(SCENE.indexOf(it)>=0)badge(it.app,'');note('<b>↺</b> 撤回了：'+it.done)}
else if(a==='dolater'){b.remove();ledger(it);note('<b>✓</b> 你点开了新入口：'+it.done)}
else if(a==='ask'){var qi=ASKS[+b.getAttribute('data-q')];typeIn(b.textContent,function(){card(qi,'ask','你说的',true)})}
else if(a==='quick'){card(QUICK,'ask','顶栏按钮',true)}
else if(a==='settings'){sheet(true)}
else if(a==='closeset'){sheet(false)}
else if(a==='group'){sub(b.getAttribute('data-g'))}
else if(a==='dnd'){subDnd()}
else if(a==='back'){var to=b.getAttribute('data-to');if(to)sub(to);else showMain()}
else if(a==='tg'){b.classList.toggle('on')}
else if(a==='setask'){var si=ASKS[+b.getAttribute('data-q')];$('fz-sheet-out').innerHTML='';typeIn(b.textContent,function(){card(si,'ask','你说的',true,$('fz-sheet-out'))},'fz-typed2')}}
function sheet(open){var el=$('fz-sheet');if(open){$('fz-sheet-out').innerHTML='';showMain();el.hidden=false;var cd=el.querySelector('.fz-sheet-card');if(cd.getBoundingClientRect().top<0||cd.getBoundingClientRect().top>innerHeight*.6)cd.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'})}else el.hidden=true}
var GROUPS={'通知':[12,[['通知横幅',1],['通知预览',1],['声音',1],['角标',1],['计划摘要',0],['锁屏显示',1]]],
'专注与勿扰':[9,[['专注模式',0],['勿扰时段','dnd'],['允许重复来电',1],['共享专注状态',0]]],
'显示与外观':[17,[['深色模式',0],['自动亮度',1],['原彩显示',1],['粗体文本',0],['动态效果',1]]],
'隐私与安全':[23,[['定位服务',1],['跟踪',0],['分析与改进',0],['相机',1],['麦克风',1]]]};
function showMain(){$('fz-sheet-sub').hidden=true;$('fz-sheet-main').hidden=false}
function subPage(title,back,rows,more){$('fz-sheet-main').hidden=true;var el=$('fz-sheet-sub');el.hidden=false;
el.innerHTML='<div class="fz-sub-head"><button type="button" class="fz-back" data-act="back"'+(back?' data-to="'+back+'"':'')+'>‹ '+(back||'设置')+'</button><b>'+title+'</b></div><div class="fz-rows">'+rows+'</div>'+(more?'<div class="fz-morerows">……其余 '+more+' 项</div>':'')}
function sub(g){var d=GROUPS[g];subPage(g,'',d[1].map(function(r){return r[1]==='dnd'?'<div class="fz-row" data-act="dnd" role="button" tabindex="0"><span>'+r[0]+'</span><em>›</em></div>':'<div class="fz-row"><span>'+r[0]+'</span><button type="button" class="fz-tg'+(r[1]?' on':'')+'" data-act="tg" aria-label="'+r[0]+'"></button></div>'}).join(''),d[0]-d[1].length)}
function subDnd(){subPage('勿扰时段','专注与勿扰',[['开始','22:00'],['结束','07:00'],['例外联系人','无 ›'],['「紧急」消息','要去「通知」里另设']].map(function(r){return '<div class="fz-row"><span>'+r[0]+'</span><em>'+r[1]+'</em></div>'}).join(''))}
function typeIn(text,then,id){var t=$(id||'fz-typed'),ph=t.getAttribute('data-ph')||t.textContent;t.setAttribute('data-ph',ph);t.classList.remove('fz-ph');t.textContent='';var i=0;
(function step(){if(i<=text.length){t.textContent=text.slice(0,i++);setTimeout(step,reduce?0:28)}else{setTimeout(function(){then();setTimeout(function(){t.classList.add('fz-ph');t.textContent=ph},900)},220)}})()}
root.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(b&&root.contains(b))act(b)});
root.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.getAttribute&&e.target.getAttribute('role')==='button'){e.preventDefault();act(e.target)}});
play();
})();
</script>
<h2>软件会怎么变</h2>
<h3>1. 打开 App，事情已经准备好了</h3>
<p>今天的 App 给你一排按钮，问题要你自己去找，找到了还得自己做。模型里的 App 一打开，AI 已经把事情准备好了：账分好了，冲突找到了，退订邮件写好了。你做的事变成三种：接受、修改、驳回。</p>
<h3>2. App 不只给人用，也给 AI 用</h3>
<p>今天的 App，每个功能都做成按钮，给人点。以后每个功能还要留一个给 AI 调用的口子，比如 API 或 MCP（一种让 AI 调用外部工具的协议）。<code>spawn_task</code> 能存在，就是因为桌面应用把「放一张卡片」这件事开放给了 AI。模型里也一样：停靠栏的角标、顶栏的提醒、新开的入口，都是 App 把自己的外壳交给 AI 去改。今天的 AI 最多待在一个聊天窗口里，以后它能碰到整个 App。一个 App 向 AI 开放了多少能力，会和它的界面好不好用一样重要。</p>
<h3>3. 设置页变成一句话</h3>
<p>今天的设置页又大又全，上百个开关，一层套一层。搜索也帮不上多少忙，它只认自己起的名字：你想要的是「晚上别吵我」，它叫「勿扰时段」，藏在第四层。</p>
<p>换成另一种方式：设置页还在，但原来的搜索框变成了一句话的入口。直接说你要什么功能、什么效果、放在哪里。「晚上 10 点后别推工作消息，紧急的除外」「把日历放到最上面，相册收起来」「在顶栏加一个随手记账的按钮」。AI 当场把 App 改成你要的样子，改完不满意，撤回就行。下面那些分组也还在，想一层层点进去自己找，照样可以。App 不再是一个固定的东西，而是每个人用着用着，就长成了自己的样子。</p>
<h3>4. 界面的框架不变，里面的内容现做</h3>
<p>模型里，停靠栏、顶栏、右边的「已完成」是固定的框架。AI 平时只往里面挂角标、钉提醒；要挪动框架本身，得你开口说。卡片里的小界面才是按需生成的：撞会时是一条时间轴，问花费时是柱状图，订位时是几个选项。这就是 <code>show_widget</code> 那条路。整个界面都现场生成是行不通的：每次长得都不一样，人就不敢点了。</p>
<h3>5. 聊天不再是全部</h3>
<p>模型里没有聊天记录，只有卡片、角标、提醒和「已完成」。每件做完的事都能撤回，都能查到。聊天只是一个入口，真正被反复查看和修改的，是这些对象。</p>
<h3>6. 最难的问题：什么时候该打断你</h3>
<p>相册那张卡片学的是 <code>spawn_task</code>：跟眼前无关的事不打断你，在停靠栏新开一个入口，等你有空再点。AI 能做的事越多，越要想清楚：哪些先问你，哪些做完再告诉你，哪些干脆别打扰。人的注意力最有限，以后设计 App，要花最多心思的可能就是这件事。</p>
<h2>哪些不会变</h2>
<p>发消息、拍照这类又快又简单的事，直接按按钮永远最快，不需要 AI 先提议。所以以后的 App 更可能是两种方式并存：简单的事人自己点，复杂、重复的事 AI 先做好，人来审。</p>
<p><strong>一句话：</strong>AI 能在 App 里放东西之后，App 会从「一排等你点的按钮」变成「AI 先提、你来拍板的工作台」。外壳要稳，内容可以生成，最要省的是人的注意力。</p>
</div>
