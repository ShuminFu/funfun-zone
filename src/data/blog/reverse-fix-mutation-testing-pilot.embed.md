---
author: "Shumin Fu"
pubDatetime: 2026-10-16T11:28:03+08:00
title: "我们修过的 bug，测试还守着吗？"
slug: reverse-fix-mutation-testing-pilot
featured: false
draft: false
tags:
  - "testing"
  - "mutation-testing"
  - "ai-agents"
description: "把 20 个已修 bug 的修复代码撤回去，看测试会不会变红；附变异测试与大模型相关研究速览。"
---

<style>
.html-embed{display:block}
.html-embed :where(h1,h2,h3,h4){font-style:normal}
.html-embed :where(th,td){border:0}
.html-embed :where(code)::before,.html-embed :where(code)::after{content:none}
.html-embed :where(ul,ol){list-style:revert}
.html-embed{color-scheme:light; --bg:#f4f6f8; --surface:#fbfcfd; --surface-2:#edf0f3; --line:#d8dee4; --line-soft:#e6eaee; --ink:#1b232c; --ink-2:#4a5763; --ink-3:#64717d; --accent:#0b7285; --accent-ink:#095e6e; --red:#b3372b; --redbg:#f7e5e2; --red-line:#d89a92; --grn:#2f7d46; --grnbg:#e4f0e7; --grn-line:#9cc5a8; --grn-soft:#1f5b33; --amb:#a9700f; --ambbg:#f6edda; --amb-line:#e0c48a; --blu:#1c6fb8; --blubg:#e5f0fa; --blu-line:#a9ccea; --pur:#6b4fb0; --purbg:#ede8f7; --pur-line:#c3b3e4; --r:4px; --rp:9px; --content:920px; --measure:68ch; --mono:ui-monospace,"SF Mono","Cascadia Mono","JetBrains Mono",Menlo,Consolas,monospace; --sans:-apple-system,"PingFang SC","Noto Sans SC","Source Han Sans SC","Microsoft YaHei","Segoe UI",sans-serif;}
html[data-theme="dark"] .html-embed{color-scheme:dark; --bg:#151a20; --surface:#1c232b; --surface-2:#222a33; --line:#333d48; --line-soft:#2a333d; --ink:#e2e7ec; --ink-2:#a7b2bd; --ink-3:#818c98; --accent:#5bb8c9; --accent-ink:#7cc9d7; --red:#e08578; --redbg:#3a2622; --red-line:#6e4038; --grn:#6fbf85; --grnbg:#21322a; --grn-line:#3e5c4a; --grn-soft:#a9d8b6; --amb:#d9a84e; --ambbg:#362d1c; --amb-line:#5c4a2a; --blu:#6bb0e8; --blubg:#1b2a3a; --blu-line:#35506e; --pur:#b39be6; --purbg:#262036; --pur-line:#463a66;}
html[data-theme="dark"] .html-embed{color-scheme:dark; --bg:#151a20; --surface:#1c232b; --surface-2:#222a33; --line:#333d48; --line-soft:#2a333d; --ink:#e2e7ec; --ink-2:#a7b2bd; --ink-3:#818c98; --accent:#5bb8c9; --accent-ink:#7cc9d7; --red:#e08578; --redbg:#3a2622; --red-line:#6e4038; --grn:#6fbf85; --grnbg:#21322a; --grn-line:#3e5c4a; --grn-soft:#a9d8b6; --amb:#d9a84e; --ambbg:#362d1c; --amb-line:#5c4a2a; --blu:#6bb0e8; --blubg:#1b2a3a; --blu-line:#35506e; --pur:#b39be6; --purbg:#262036; --pur-line:#463a66;}
html[data-theme="light"] .html-embed{color-scheme:light;}
.html-embed *{box-sizing:border-box}
.html-embed{background:var(--bg)}
.html-embed{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px; line-height:1.75;-webkit-font-smoothing:antialiased;transition:background-color .25s ease,color .25s ease}
.html-embed .wrap{max-width:var(--content);margin:0 auto;padding:52px 26px 104px}
.html-embed a{color:var(--accent-ink);text-decoration-thickness:1px;text-underline-offset:.18em}
.html-embed a:hover{text-decoration:underline}
.html-embed :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.html-embed strong{font-weight:650;color:var(--ink)}
.html-embed code{font-family:var(--mono);font-size:.88em;background:var(--surface-2);border:1px solid var(--line-soft); padding:1px 5px;border-radius:var(--r);color:var(--ink-2);overflow-wrap:anywhere}
.html-embed p{margin:12px 0}
.html-embed h1{font-size:clamp(29px,4.2vw,42px);line-height:1.18;margin:0 0 10px;letter-spacing:-.025em; font-weight:720;text-wrap:balance;max-width:22ch}
.html-embed h2{font-size:21.5px;margin:58px 0 10px;padding-top:22px;border-top:2px solid var(--line); font-weight:750;letter-spacing:.01em;text-wrap:balance;scroll-margin-top:16px}
.html-embed h2 .n{font-family:var(--mono);color:var(--accent);font-weight:700;font-size:14px;margin-right:11px; font-variant-numeric:tabular-nums;border:1px solid var(--accent-ink);border-radius:var(--r);padding:1px 7px}
.html-embed h3{font-size:15.5px;font-weight:650;text-wrap:balance}
.html-embed .sub{color:var(--ink-3);font-size:13.5px;margin:0 0 18px;max-width:var(--measure);text-wrap:pretty}
.html-embed .themebtn{position:fixed;top:16px;right:16px;z-index:20;width:40px;height:40px;border-radius:50%; border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:15px;cursor:pointer; display:flex;align-items:center;justify-content:center;line-height:1; transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.html-embed .themebtn:hover{border-color:var(--ink-3)}
.html-embed header{margin-bottom:8px;padding-right:56px}
.html-embed .kicker{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase; color:var(--accent);margin:0 0 14px}
.html-embed h1 .zh{display:block;font-size:.52em;line-height:1.45;font-weight:560;color:var(--ink-2); margin-top:8px;letter-spacing:.005em;max-width:34ch}
.html-embed .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.html-embed .chip{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.06em;padding:3px 9px; border-radius:var(--r);border:1px solid var(--line);background:var(--surface);color:var(--ink-2);white-space:nowrap}
.html-embed .chip b{color:var(--ink);font-weight:600}
.html-embed .chip.warn{color:var(--amb);background:var(--ambbg);border-color:var(--amb-line)}
.html-embed .chip.crit{color:var(--red);background:var(--redbg);border-color:var(--red-line)}
.html-embed .chip.ok{color:var(--grn);background:var(--grnbg);border-color:var(--grn-line)}
.html-embed .chip.mute{color:var(--ink-3);background:var(--surface-2);border-color:var(--line-soft)}
.html-embed .verdict{border:1px solid var(--line);background:var(--surface);margin-top:22px}
.html-embed .verdict.ok{border-color:var(--grn-line)}
.html-embed .verdict.warn{border-color:var(--amb-line)}
.html-embed .verdict.crit{border-color:var(--red-line)}
.html-embed .verdict-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 18px;padding:20px 24px 14px; border-bottom:1px solid var(--line-soft)}
.html-embed .verdict-word{font-family:var(--mono);font-size:25px;font-weight:700;letter-spacing:.02em;color:var(--accent-ink)}
.html-embed .verdict.ok .verdict-word{color:var(--grn)}
.html-embed .verdict.warn .verdict-word{color:var(--amb)}
.html-embed .verdict.crit .verdict-word{color:var(--red)}
.html-embed .verdict-zh{font-size:16px;font-weight:650}
.html-embed .verdict-body{padding:14px 24px 18px;font-size:14.5px;color:var(--ink-2)}
.html-embed .verdict-body p{margin:8px 0}
.html-embed .vstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:1px; border-top:1px solid var(--line-soft);background:var(--line-soft)}
.html-embed .vstat{padding:14px 18px;background:var(--surface)}
.html-embed .vstat b{display:block;font-family:var(--mono);font-size:21px;font-weight:600;font-variant-numeric:tabular-nums}
.html-embed .vstat span{font-size:12px;color:var(--ink-3);letter-spacing:.03em}
.html-embed .tldr{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--accent); padding:18px 22px;margin:22px 0 4px}
.html-embed .tldr p{margin:0;color:var(--ink-2);font-size:14.5px;max-width:var(--measure);text-wrap:pretty}
.html-embed .tldr .hl{color:var(--accent-ink);font-weight:650}
.html-embed .pg-prose{max-width:var(--measure);color:var(--ink-2);text-wrap:pretty}
.html-embed .pg-prose p:first-child{margin-top:0}
.html-embed .lead{max-width:58ch;font-size:17px;line-height:1.72;color:var(--ink-2);text-wrap:pretty}
.html-embed .rule{height:1px;border:0;background:var(--line);margin:30px 0}
.html-embed .toc{border:1px solid var(--line);background:var(--surface);padding:18px 22px;margin-top:24px}
.html-embed .toc .toc-h{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase; color:var(--ink-3);margin-bottom:12px}
.html-embed .toc ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:2px 28px}
@media(max-width:620px){.html-embed .toc ol{grid-template-columns:1fr}}
.html-embed .toc a{display:flex;gap:11px;align-items:baseline;padding:5px 4px;color:var(--ink-2);font-size:13.5px; border-bottom:1px solid var(--line-soft)}
.html-embed .toc a:hover{color:var(--accent-ink);text-decoration:none;background:var(--surface-2)}
.html-embed .toc a .tn{font-family:var(--mono);color:var(--accent);font-size:12px;font-weight:700;flex:none; font-variant-numeric:tabular-nums;min-width:20px}
.html-embed .toc a.active{color:var(--accent-ink);font-weight:650;background:var(--surface-2); box-shadow:inset 2px 0 0 var(--accent)}
.html-embed .toc a.active .tn{color:var(--accent-ink)}
@media(min-width:1380px){.html-embed .toc{position:fixed;top:50%;transform:translateY(-50%); left:max(16px,calc((100vw - 880px)/2 - 236px));width:216px;margin:0; max-height:calc(100vh - 48px);overflow-y:auto;z-index:15;border:0;background:none;padding:0}
.html-embed .toc ol{grid-template-columns:1fr;gap:0}
.html-embed .toc a{font-size:12.5px;padding:6px 7px;border-bottom:0}}
.html-embed .grid{display:grid;gap:14px}
.html-embed .g2{grid-template-columns:1fr 1fr}
.html-embed .g3{grid-template-columns:repeat(3,1fr)}
.html-embed .g4{grid-template-columns:repeat(4,1fr)}
@media(max-width:720px){.html-embed .g2,.html-embed .g3,.html-embed .g4{grid-template-columns:1fr}}
.html-embed .card{background:var(--surface);border:1px solid var(--line);padding:16px 18px}
.html-embed .card h3{margin:0 0 6px;font-size:14.5px}
.html-embed .card p{margin:0;color:var(--ink-2);font-size:13.5px;text-wrap:pretty}
.html-embed .card.feature{grid-column:span 2;border-top:3px solid var(--accent)}
@media(max-width:720px){.html-embed .card.feature{grid-column:auto}}
.html-embed .stat{background:var(--surface);border:1px solid var(--line);padding:16px 18px}
.html-embed .stat .v{font-family:var(--mono);font-size:24px;font-weight:600;font-variant-numeric:tabular-nums; line-height:1.1;color:var(--ink)}
.html-embed .stat .l{color:var(--ink-3);font-size:12px;letter-spacing:.03em;margin-top:6px}
.html-embed .stat.bad .v{color:var(--red)}
.html-embed .stat.good .v{color:var(--grn)}
.html-embed .stat.warn .v{color:var(--amb)}
.html-embed .calc{background:var(--surface);border:1px solid var(--line);padding:24px;margin-top:6px;overflow-x:auto}
.html-embed .eqrow{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px;min-width:0; font-family:var(--mono);font-size:15px}
.html-embed .tok{padding:10px 14px;border-radius:var(--r);border:1px solid var(--line);text-align:center;min-width:118px}
.html-embed .tok .num{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.html-embed .tok .cap{font-size:11px;color:var(--ink-3);margin-top:3px;white-space:normal}
.html-embed .tok.in{background:var(--blubg);border-color:var(--blu-line)}
.html-embed .tok.in .num{color:var(--blu)}
.html-embed .tok.out{background:var(--purbg);border-color:var(--pur-line)}
.html-embed .tok.out .num{color:var(--pur)}
.html-embed .tok.sum{background:var(--redbg);border-color:var(--red-line)}
.html-embed .tok.sum .num{color:var(--red)}
.html-embed .tok.lim{background:var(--surface-2);border-color:var(--line)}
.html-embed .tok.lim .num{color:var(--ink)}
.html-embed .op{font-size:19px;color:var(--ink-3)}
.html-embed .calcverdict{text-align:center;margin-top:16px;font-size:14px;color:var(--red);font-weight:650}
.html-embed .calcverdict .ok{color:var(--grn)}
.html-embed .calc .note{text-align:center;color:var(--ink-3);font-size:12.5px;margin-top:6px}
.html-embed .flow{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:6px}
@media(max-width:720px){.html-embed .flow{grid-template-columns:1fr}}
.html-embed .lane{border:1px solid var(--line);background:var(--surface)}
.html-embed .lane .hd{padding:12px 18px;font-weight:650;font-size:14px;display:flex;align-items:center;gap:8px}
.html-embed .lane.good .hd{background:var(--grnbg);color:var(--grn);border-bottom:1px solid var(--grn-line)}
.html-embed .lane.bad .hd{background:var(--redbg);color:var(--red);border-bottom:1px solid var(--red-line)}
.html-embed .lane.aux .hd{background:var(--blubg);color:var(--blu);border-bottom:1px solid var(--blu-line)}
.html-embed .lane.aux .res{color:var(--blu)}
.html-embed .lane .bd{padding:16px 18px}
.html-embed .step{font-family:var(--mono);font-size:12.5px;color:var(--ink-2);padding:9px 12px;border-radius:var(--r); background:var(--surface-2);border:1px solid var(--line-soft);margin-bottom:8px}
.html-embed .arrow{text-align:center;color:var(--ink-3);font-size:13px;margin:-2px 0 6px}
.html-embed .lane .res{font-size:13px;margin-top:6px;font-weight:650}
.html-embed .lane.good .res{color:var(--grn)}
.html-embed .lane.bad .res{color:var(--red)}
.html-embed .tablebox{overflow-x:auto;margin-top:6px;border:1px solid var(--line);background:var(--surface)}
.html-embed table{width:100%;border-collapse:collapse;font-size:14px}
.html-embed th{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3); text-align:left;font-weight:500;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--surface-2)}
.html-embed td{padding:10px 14px;border-bottom:1px solid var(--line-soft);vertical-align:top;color:var(--ink)}
.html-embed tr:last-child td{border-bottom:0}
.html-embed td.y{color:var(--grn);font-weight:650;white-space:nowrap}
.html-embed td.n{color:var(--red);font-weight:650;white-space:nowrap}
.html-embed td.note{color:var(--ink-2);font-size:13.5px}
.html-embed td code{font-size:.82em}
.html-embed .layers{margin-top:6px}
.html-embed .layer{display:flex;align-items:center;gap:16px;background:var(--surface);border:1px solid var(--line); padding:14px 18px;margin-bottom:10px}
.html-embed .layer .rank{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--ink-3);min-width:30px; text-align:center;font-variant-numeric:tabular-nums}
.html-embed .layer .body{flex:1}
.html-embed .layer .body .t{font-weight:650;margin-bottom:2px;font-size:14.5px}
.html-embed .layer .body .d{color:var(--ink-2);font-size:13.5px}
.html-embed .layer .tag{font-family:var(--mono);font-size:11px;letter-spacing:.06em;padding:3px 9px;border-radius:var(--r);white-space:nowrap}
.html-embed .layer.l1{border-left:3px solid var(--grn)}
.html-embed .layer.l1 .tag{background:var(--grnbg);color:var(--grn)}
.html-embed .layer.l2{border-left:3px solid var(--blu)}
.html-embed .layer.l2 .tag{background:var(--blubg);color:var(--blu)}
.html-embed .layer.l3{border-left:3px solid var(--amb)}
.html-embed .layer.l3 .tag{background:var(--ambbg);color:var(--amb)}
.html-embed .phase{border:1px solid var(--line);background:var(--surface);padding:16px 18px}
.html-embed .phase .ph{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase; color:var(--ink-3);margin-bottom:8px}
.html-embed .phase ul{margin:0;padding-left:18px;color:var(--ink-2);font-size:13.5px}
.html-embed .phase ul li{margin:5px 0}
.html-embed .phase ul li b{color:var(--ink)}
.html-embed .filebox{border:1px solid var(--line);background:var(--surface);padding:4px 18px;margin-top:6px}
.html-embed .file{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line-soft)}
.html-embed .file:last-child{border-bottom:none}
.html-embed .file .badge{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;padding:3px 8px;border-radius:var(--r); margin-top:2px;white-space:nowrap;font-weight:600}
.html-embed .b-edit{background:var(--ambbg);color:var(--amb)}
.html-embed .b-new{background:var(--grnbg);color:var(--grn)}
.html-embed .b-keep{background:var(--blubg);color:var(--blu)}
.html-embed .file .fp{font-family:var(--mono);font-size:13px;color:var(--ink)}
.html-embed .file .fd{color:var(--ink-2);font-size:13px;margin-top:3px}
.html-embed .insight{background:var(--grnbg);border:1px solid var(--grn-line);padding:16px 20px;margin-top:6px}
.html-embed .insight b{color:var(--grn)}
.html-embed .insight p{margin:0;color:var(--grn-soft);font-size:14px;max-width:var(--measure);text-wrap:pretty}
.html-embed .footer{margin-top:64px;border-top:1px solid var(--line);padding-top:18px;font-size:12.5px;color:var(--ink-3)}
.html-embed .footer code{background:none;border:none;padding:0;color:var(--ink-3)}
.html-embed .legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--ink-2)}
.html-embed .legend span{display:inline-flex;align-items:center;gap:6px}
.html-embed .dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.html-embed .verdict,.html-embed .tldr,.html-embed .calc,.html-embed .insight{border-radius:var(--rp)}
.html-embed .toc,.html-embed .card,.html-embed .stat,.html-embed .lane,.html-embed .tablebox,.html-embed .filebox,.html-embed .phase{border-radius:var(--r)}
.html-embed .lane,.html-embed .verdict{overflow:hidden}
.html-embed .pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10.5px;font-weight:700; letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:999px; border:1px solid var(--line);background:var(--surface-2);color:var(--ink-2); white-space:nowrap;vertical-align:middle;margin-right:8px}
.html-embed .pill.grn{color:var(--grn);background:color-mix(in srgb,var(--grn) 13%,transparent);border-color:color-mix(in srgb,var(--grn) 34%,transparent)}
.html-embed .pill.amb{color:var(--amb);background:color-mix(in srgb,var(--amb) 14%,transparent);border-color:color-mix(in srgb,var(--amb) 36%,transparent)}
.html-embed .pill.blu{color:var(--blu);background:color-mix(in srgb,var(--blu) 13%,transparent);border-color:color-mix(in srgb,var(--blu) 34%,transparent)}
.html-embed .pill.pur{color:var(--pur);background:color-mix(in srgb,var(--pur) 14%,transparent);border-color:color-mix(in srgb,var(--pur) 36%,transparent)}
.html-embed .pill.red{color:var(--red);background:color-mix(in srgb,var(--red) 13%,transparent);border-color:color-mix(in srgb,var(--red) 34%,transparent)}
.html-embed .pill.teal{color:var(--accent-ink);background:color-mix(in srgb,var(--accent) 13%,transparent);border-color:color-mix(in srgb,var(--accent) 34%,transparent)}
@media(max-width:620px){.html-embed .wrap{padding:38px 18px 76px}
.html-embed header{padding-right:44px}
.html-embed h2{margin-top:46px}
.html-embed .verdict-head,.html-embed .verdict-body{padding-left:18px;padding-right:18px}
.html-embed .layer{align-items:flex-start;gap:10px}
.html-embed .layer .tag{white-space:normal}
.html-embed .file{flex-direction:column;gap:6px}}
@media (prefers-reduced-motion:reduce){.html-embed *{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
@media print{.html-embed,html[data-theme="dark"] .html-embed,html[data-theme="light"] .html-embed{color-scheme:light; --bg:#fff;--surface:#fff;--surface-2:#f3f5f7;--line:#bcc5cd;--line-soft:#dfe4e8; --ink:#111820;--ink-2:#37434e;--ink-3:#606d78;--accent:#0b6575;--accent-ink:#074f5c; --red:#8f2d25;--redbg:#f8e9e7;--red-line:#c99089; --grn:#25683a;--grnbg:#e8f2ea;--grn-line:#8eb49a;--grn-soft:#1f5431; --amb:#835706;--ambbg:#f8efdd;--amb-line:#cdb476; --blu:#195f9c;--blubg:#e8f1f9;--blu-line:#9bbdda; --pur:#594190;--purbg:#eeeaf6;--pur-line:#b7aad5;}
.html-embed *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.html-embed{font-size:11pt}
.html-embed .wrap{max-width:none;padding:0}
.html-embed .themebtn,.html-embed .toc{display:none!important}
.html-embed a{color:inherit;text-decoration:none}
.html-embed h2{break-after:avoid;page-break-after:avoid}
.html-embed .verdict,.html-embed .tldr,.html-embed .card,.html-embed .stat,.html-embed .calc,.html-embed .lane,.html-embed .tablebox,.html-embed .layer,.html-embed .phase,.html-embed .filebox,.html-embed .insight{break-inside:avoid;page-break-inside:avoid}
.html-embed .footer{margin-top:36px}}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed not-prose" lang="zh-CN">
  <header>
    <div class="kicker">测试复盘 · 变异测试 · 一次小实验</div>
    <p class="lead">把 20 个历史修复撤回去，看测试会不会报警</p>
    <div class="chips">
      <span class="chip">日期 <b>2026-10-16</b></span>
      <span class="chip">样本 <b>20 个修复</b></span>
      <span class="chip">语言 <b>Go + Python</b></span>
      <span class="chip ok">两个漏洞 <b>已补测试</b></span>
    </div>
  </header>
  <div class="verdict warn">
    <div class="verdict-head">
      <span class="verdict-word">17 / 20</span>
      <span class="verdict-zh">修 bug 时带了测试的全部守住；没带测试的，有一半能悄悄回来。</span>
    </div>
    <div class="verdict-body">
      <p>我们把 20 个已修 bug 的修复代码撤回去，<strong>只撤生产代码，测试不动</strong>，然后跑测试。17 次有测试变红，3 次没反应。</p>
      <p>没反应的 3 次里，1 次是后来的修复已经覆盖了同样的行为，撤掉也没影响。另外 2 次是<strong>真漏洞</strong>：bug 回来了，测试全绿。这两处已经补上测试，撤掉修复后新测试会红。</p>
    </div>
    <div class="vstats">
      <div class="vstat"><b>15 / 15</b><span>修复时带了测试</span></div>
      <div class="vstat"><b>2 / 4</b><span>修复时没带测试</span></div>
      <div class="vstat"><b>2</b><span>真漏洞，已补测试</span></div>
      <div class="vstat"><b>1</b><span>等价变异，不算漏洞</span></div>
    </div>
  </div>
  <section>
  <h2>先说背景：测试绿了，不等于测试有用</h2>
  <div class="pg-prose">
    <p>测试通过只能说明代码按测试写的样子跑通了，不能说明代码出错时测试会发现。</p>
    <p><strong>变异测试</strong>就是用来检查这一点的：故意往代码里放一个小 bug，看测试会不会变红。红了叫「杀死」，没红叫「存活」。每个存活的变异体都指向一处测试没守住的地方。</p>
    <p>打个比方：你雇了一个保安，想知道他是不是真在看仓库，就偷偷把一箱货挪个位置。他发现了，说明他在看；没发现，说明他在打瞌睡。</p>
    <p>我们其实一直在手工做这件事。修完 bug 后，我们会把修复撤掉，确认新写的测试会变红，然后才算修完。2026 年以来的提交说明里，提到「变异」的有 164 个，提到「假绿」的有 76 个。</p>
    <p>但我们一直没有回头系统地查过：<strong>以前修过的那些 bug，现在还有测试守着吗？</strong></p>
  </div>
  </section>
  <section>
  <h2>这次怎么做：把修复撤回去</h2>
  <div class="pg-prose">
    <p>常见的变异测试工具会随机改代码，比如把 <code>&gt;</code> 改成 <code>&gt;=</code>。这样能造出很多变异体，但其中不少没有意义，需要人一个个判断。</p>
    <p>我们换了个思路：<strong>每个修过的 bug 都留下了一个修复提交。</strong>把修复提交里的生产代码反着打回去，得到的就是一个真实出现过的 bug，不用再猜它有没有意义。</p>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="phase">
      <div class="ph">怎么挑样本</div>
      <ul>
        <li><b>主样本 17 个</b>：issue 文档里引用过的修复，2026 年 8 月之后的，生产代码改动不超过 30 行，只碰一两个文件。这批修复大多带着测试一起提交。</li>
        <li><b>对照组 5 个</b>：条件一样，但修复提交里没有测试。</li>
        <li>有 2 个已经撤不回去：一个所在的函数被重构掉了，另一个的代码已经被改回旧写法。实际判定 <b>20 个</b>。</li>
      </ul>
    </div>
    <div class="phase">
      <div class="ph">怎么判定</div>
      <ul>
        <li>只在一次性的工作副本里撤回，<b>测试文件不动</b>。</li>
        <li>先在没改过的代码上跑同一组测试，记下基线。基线本来就红的测试不算数。</li>
        <li>撤回后有<b>具名测试变红</b>，算抓住；全绿，算漏网。</li>
        <li>能直接反向打补丁就直接打；打不上就手工做一个意思相同的最小回退。</li>
      </ul>
    </div>
  </div>
  </section>
  <section>
  <h2>结果：差别在「修的时候有没有带测试」</h2>
  <div class="grid g2">
    <div class="stat good"><div class="v">15 / 15</div><div class="l">修复时带了测试：撤回去全部被抓住（另有 1 个等价变异，见下文）</div></div>
    <div class="stat bad"><div class="v">2 / 4</div><div class="l">修复时没带测试：只抓住一半，其中 1 个还要跑调用方的测试才抓得住</div></div>
  </div>
  <div class="tablebox" style="margin-top:14px">
    <table>
      <thead><tr><th>分组</th><th>判定数</th><th>抓住</th><th>没抓住</th></tr></thead>
      <tbody>
        <tr><td>修复时带了测试</td><td>16</td><td class="y">15</td><td class="note">1 个，等价变异，不是漏洞</td></tr>
        <tr><td>修复时没带测试</td><td>4</td><td class="y">2</td><td class="n">2 个真漏洞</td></tr>
        <tr><td><b>合计</b></td><td>20</td><td class="y">17</td><td class="note">击杀率 85%；去掉等价变异是 17 / 19</td></tr>
      </tbody>
    </table>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>带测试的修复，这次 15 个一个都没漏，抽查它们几乎没有新信息。值得抽查的是修复时没带测试的那一批。</p></div>
  </section>
  <section>
  <h2>两个漏洞长什么样</h2>
  <p class="sub">两个漏洞的具体代码不重要，重要的是它们的形状。这两种形状以后还会再出现。</p>
  <div class="grid g2">
    <div class="card">
      <h3><span class="pill red">形状一</span>测试数据让两个值碰巧相等</h3>
      <p>修复内容：子代理运行时记下一条证据，应该记<strong>父代理</strong>的身份，而不是子代理自己的。原来的代码记错了。</p>
      <p style="margin-top:8px">可是相关测试全都在父代理自己运行时跑。这时候「父代理」和「自己」是同一个值，记哪个都一样。修复撤回去，测试分不出来。</p>
      <p style="margin-top:8px">就像测试收银员会不会找错零钱，却每次都让顾客刚好付整钱。</p>
    </div>
    <div class="card">
      <h3><span class="pill amb">形状二</span>现成的测试装置，没套到兄弟入口上</h3>
      <p>修复内容：删除会话时要先拿一把写锁。修复给这一步加了等待上限，等不到就记一行日志然后继续，不能让删除请求一直卡着。</p>
      <p style="margin-top:8px">测试里其实已经有一个专门把锁卡住的装置，用来验证其他几个写入口会及时放弃等待。但它从没跑过删除这条路，其他删除测试又都是在锁空闲时跑的。</p>
      <p style="margin-top:8px">装置已经造好了，只是少测了一个入口。</p>
    </div>
  </div>
  <div class="insight" style="margin-top:14px">
    <p><b>共同点：</b>两处都有测试，而且测试都是绿的，读代码也看不出问题。只有把修复真的撤回去跑一遍，才能看到测试分不出对错。</p>
  </div>
  </section>
  <section>
  <h2>另外四个发现</h2>
  <div class="tablebox">
    <table>
      <thead><tr><th>现象</th><th>说明了什么</th><th>以后怎么做</th></tr></thead>
      <tbody>
        <tr>
          <td>有一个修复撤回后，本包测试全绿，跑了调用它的包才变红</td>
          <td class="note">只看本包会把它误判成漏洞</td>
          <td class="note">测试范围要包括依赖它的包</td>
        </tr>
        <tr>
          <td>有一个修复撤回后行为不变，因为后来一个更通用的修复已经覆盖了这种情况</td>
          <td class="note">这是等价变异，也说明那一行代码已经多余</td>
          <td class="note">遇到等价变异，先查是不是被后来的提交覆盖了，可以顺手清理</td>
        </tr>
        <tr>
          <td>22 个候选里有 2 个已经撤不回去</td>
          <td class="note">代码会演化，越晚回头查越难</td>
          <td class="note">「撤掉修复看红」要在<b>提交时</b>做，不要事后补</td>
        </tr>
        <tr>
          <td>第一次自己验证时，工作副本放错了位置，Go 的本地依赖路径解析失败，结果显示 <code>setup failed</code></td>
          <td class="note">这是「假红」：看着是红，其实测试根本没运行</td>
          <td class="note">只有某条<b>具名测试</b>失败才算抓住；编译失败、环境失败都不算</td>
        </tr>
      </tbody>
    </table>
  </div>
  </section>
  <section>
  <h2>和最近的研究对一下</h2>
  <div class="pg-prose">
    <p>这次的做法和几篇 2026 年的论文思路相近，可以互相对照：</p>
    <ul>
      <li><a href="https://arxiv.org/abs/2603.24560">SMART</a>（FSE 2026）用大模型生成变异体时，会先从约 13 万对真实的「出错代码 → 修复代码」里检索相似例子作为参考，生成的变异体在真实 bug 上的检出率是 92.61%。我们的反向修复是同一个思路，只不过直接用了自己项目的修复历史。</li>
      <li><a href="https://arxiv.org/abs/2607.22880">ISSTA 2026 的一篇复现研究</a>发现：被测代码本身没有 bug 时，覆盖率和变异得分有参考价值；被测代码本身已经有 bug 时，这两个指标都不可靠。测试照着有 bug 的代码写断言，bug 就被当成了正确答案。</li>
      <li><a href="https://arxiv.org/abs/2603.23443">一项软件演化研究</a>测了 8 个模型写的测试：代码语义变了以后，失败的测试里超过 99% 在旧代码上仍能通过。这说明这些测试记住的是旧行为，而不是需求。</li>
    </ul>
    <p>这些研究和我们的观察指向同一件事：测试要从需求出发，而不是照着现有代码写。形状一正好是这个问题：测试数据刚好落在对错不分的地方。</p>
  </div>
  </section>
  <section>
  <h2>流程上要改什么</h2>
  <div class="layers">
    <div class="layer l1">
      <div class="rank">1</div>
      <div class="body"><div class="t">修复提交写明「撤掉修复会变红的测试」</div>
      <div class="d">写不出来，就说明为什么没有测试。这一条决定了 15 / 15 和 2 / 4 的差别。</div></div>
      <div class="tag">提交时</div>
    </div>
    <div class="layer l1">
      <div class="rank">2</div>
      <div class="body"><div class="t">写测试时多问一句：修复前后，测试数据里的值不一样吗？</div>
      <div class="d">修复是把 A 换成 B 时，测试数据必须让 A 和 B 不同。</div></div>
      <div class="tag">写测试时</div>
    </div>
    <div class="layer l2">
      <div class="rank">3</div>
      <div class="body"><div class="t">给一类入口加了保证，就用同一个装置把所有兄弟入口都跑一遍</div>
      <div class="d">修一个，就要把同一类的都找出来。</div></div>
      <div class="tag">写测试时</div>
    </div>
    <div class="layer l3">
      <div class="rank">4</div>
      <div class="body"><div class="t">定期抽查没带测试的修复，把它们撤回去跑一遍</div>
      <div class="d">测试范围包括调用方；只认具名测试失败；遇到等价变异，先查是不是被后来的修复覆盖了。</div></div>
      <div class="tag">定期</div>
    </div>
  </div>
  <div class="pg-prose" style="margin-top:18px">
    <p><strong>还没做的：</strong>第 4 条现在还是手工的，没有做成定时任务。这次样本只有 20 个，以 Go 为主，Python 的修复只有几个，85% 这个数字不能当成整个项目的情况。</p>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>测试能不能守住 bug，主要看修 bug 时有没有顺手写一条「撤掉修复就会红」的测试。最容易漏掉的，是测试数据让对和错看起来一样的地方。</p></div>
  </section>
  <section>
  <h2>附：变异测试研究速览</h2>
  <p class="sub">做试点之前查过的资料，按问题归类，每条只留结论。</p>
  <h3>变异得分本身靠不靠谱</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>研究</th><th>结论</th></tr></thead>
      <tbody>
        <tr><td>Just 等，FSE 2014 <a href="#r1">[1]</a></td><td class="note">357 个真实 bug：排除覆盖率的影响后，杀死变异体的能力和发现真实 bug 的能力仍然显著相关。</td></tr>
        <tr><td>Papadakis 等，ICSE 2018 <a href="#r2">[2]</a></td><td class="note">控制住测试集大小后，这种相关性变弱。但测试集大小相同时，变异得分高的那组确实能发现更多真实 bug。所以变异体适合用来指导补测试，分数本身不是精确的质量刻度。</td></tr>
        <tr><td>Zhao 等，ISSTA 2026 <a href="#r3">[3]</a></td><td class="note">在大模型写的测试上复现：被测代码没有 bug 时，覆盖率和变异得分可以用来比较模型；被测代码已经有 bug 时，两者都不可靠。</td></tr>
      </tbody>
    </table>
  </div>
  <h3>工业界怎么用</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>来源</th><th>做法与结果</th></tr></thead>
      <tbody>
        <tr><td>Google <a href="#r4">[4]</a><a href="#r5">[5]</a></td><td class="note">只在代码评审的改动上跑，跳过日志这类没意义的行，只把存活的变异体指给作者看，不给总分。研究分析了近 1500 万个变异体：用了变异测试的开发者写的测试更多、质量更好；回看高优先级的真实 bug，如果当时跑过变异测试，会有一个存活的变异体提前报警。</td></tr>
        <tr><td>Meta ACH，FSE 2025 <a href="#r6">[6]</a></td><td class="note">针对隐私问题生成变异体，再让大模型写测试去杀死它们。工程师接受了 73% 的测试；571 个测试里有 277 个，如果只看行覆盖率会被丢掉。</td></tr>
      </tbody>
    </table>
  </div>
  <h3>用大模型造变异体</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>研究</th><th>结论</th></tr></thead>
      <tbody>
        <tr><td>LLM 变异测试综合研究 <a href="#r7">[7]</a></td><td class="note">大模型造的变异体更像真实 bug，检出率约 77%，规则工具约 42%。代价是编译不过、重复和等价的变异体都更多。</td></tr>
        <tr><td>SMART，FSE 2026 <a href="#r8">[8]</a></td><td class="note">从约 13 万对真实修复里检索例子再生成：有效生成率从 42.89% 升到 65.6%，真实 bug 检出率 92.61%；7B 小模型加上这个方法，可以追平或超过 GPT-4o。</td></tr>
        <tr><td>Test-aware 变异，ESEM 2026 <a href="#r9">[9]</a></td><td class="note">把现有测试也交给大模型，让它造一个能骗过这些测试的 bug。骗过现有测试、又被完整测试抓住的比例：HumanEval 87.7%，MBPP 79.1%；同条件下 mutmut 只有 4.4% 和 5.7%。</td></tr>
      </tbody>
    </table>
  </div>
  <h3>大模型写的测试质量如何</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>研究</th><th>结论</th></tr></thead>
      <tbody>
        <tr><td>单元测试生成综述 <a href="#r10">[10]</a></td><td class="note">引用的结果：大模型写的测试变异得分最高 0.546，人写的是 0.690；有的研究里接近 0，因为测的是接口、空方法这类没有逻辑的地方。</td></tr>
        <tr><td>软件演化研究，2026 <a href="#r11">[11]</a></td><td class="note">8 个模型、22,374 个程序变体：代码语义改变后，新测试通过率降到 66%；失败的测试里超过 99% 在旧代码上能通过。</td></tr>
        <tr><td>Python 类级测试，2026 <a href="#r12">[12]</a></td><td class="note">覆盖率几乎都到顶，分不出好坏，变异得分能拉开差距；选哪个模型比怎么写提示词影响更大。</td></tr>
        <tr><td>SWE-Mutation，2026 <a href="#r13">[13]</a></td><td class="note">最强的模型检出率只有 36.15%。但评审指出这些变异体没有和真实 bug 对照过，结论还不能算定论。</td></tr>
      </tbody>
    </table>
  </div>
  <h3>把存活的变异体交回给大模型</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>研究</th><th>结论</th></tr></thead>
      <tbody>
        <tr><td>MuTAP <a href="#r14">[14]</a></td><td class="note">把存活的变异体写进提示词，让模型重写测试，HumanEval 上变异得分约 94%。只在小基准上验证过。</td></tr>
        <tr><td>AdverTest，2026 <a href="#r15">[15]</a></td><td class="note">一个 agent 写测试，一个 agent 造变异体，两边对抗。Defects4J 上缺陷检出率比最好的 LLM 方法高 8.56%，比 EvoSuite 高 63.30%。</td></tr>
        <tr><td>Critic 循环实验，2026 <a href="#r16">[16]</a></td><td class="note">迭代修改能杀掉初始测试漏掉的变异体中的 78%。作者还发现，自己早先一个极显著的结果其实是模型输出被截断造成的。评测工具本身也会出错。</td></tr>
        <tr><td>实践文章，2026-08 <a href="#r17">[17]</a></td><td class="note">四个项目都没改生产代码，变异得分全部上升。其中一个解析器行覆盖率 100%，变异得分只有 61.29%。作者的建议：不要让 agent 去优化分数；把存活的变异体当作反例，写一个在原代码上通过、在变异代码上失败的测试；同时把需求交给 agent。</td></tr>
      </tbody>
    </table>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>变异测试适合用来指出测试漏在哪里，不适合拿来打分。大模型造变异体已经比规则工具更像真实 bug，但它写的测试容易照着现有代码写断言。最好的用法是让大模型出题，测试是否真的有效要另外验证。</p></div>
  </section>
  <section>
  <h2>参考资料</h2>
  <ol class="pg-prose refs" style="font-size:13.5px;padding-left:22px">
    <li id="r1">Just et al. <a href="https://homes.cs.washington.edu/~mernst/pubs/mutation-effectiveness-fse2014-abstract.html">Are mutants a valid substitute for real faults in software testing?</a> FSE 2014.</li>
    <li id="r2">Papadakis et al. <a href="https://conf.researchr.org/details/icse-2018/icse-2018-Technical-Papers/78/Are-Mutation-Scores-Correlated-with-Real-Fault-Detection-A-Large-Scale-Empirical-stu">Are Mutation Scores Correlated with Real Fault Detection?</a> ICSE 2018.</li>
    <li id="r3">Zhao, Zhou, Cohen. <a href="https://arxiv.org/abs/2607.22880">Do Coverage and Mutation Scores of LLM-Generated Test Suites Correlate with Their Effectiveness?</a> ISSTA 2026.</li>
    <li id="r4">Petrović, Ivanković. <a href="https://research.google/pubs/state-of-mutation-testing-at-google/">State of Mutation Testing at Google</a>. ICSE-SEIP 2018.</li>
    <li id="r5">Petrović et al. <a href="https://arxiv.org/abs/2103.07189">Does mutation testing improve testing practices?</a> ICSE 2021.</li>
    <li id="r6">Foster et al. <a href="https://arxiv.org/abs/2501.12862">Mutation-Guided LLM-based Test Generation at Meta</a>. FSE 2025 Industry.</li>
    <li id="r7"><a href="https://arxiv.org/abs/2406.09843">A Comprehensive Study on Large Language Models for Mutation Testing</a>. arXiv 2406.09843.</li>
    <li id="r8">Wang et al. <a href="https://arxiv.org/abs/2603.24560">Boosting LLMs for Mutation Generation (SMART)</a>. FSE 2026.</li>
    <li id="r9">Kiele et al. <a href="https://arxiv.org/abs/2609.35841">Beyond Rule-Based Mutation Testing: Test-Aware Mutant Generation Using LLMs</a>. ESEM 2026.</li>
    <li id="r10"><a href="https://arxiv.org/abs/2511.21382">Large Language Models for Unit Test Generation: Achievements, Challenges, and the Road Ahead</a>. arXiv 2511.21382.</li>
    <li id="r11">Haroon, Khan, Gulzar. <a href="https://arxiv.org/abs/2603.23443">Evaluating LLM-Based Test Generation Under Software Evolution</a>. arXiv 2603.23443.</li>
    <li id="r12">Al-Ahmad et al. <a href="https://arxiv.org/abs/2609.24341">Evaluating the effectiveness of class-level LLM-generated test suites in Python</a>. arXiv 2609.24341.</li>
    <li id="r13">Sun et al. <a href="https://arxiv.org/abs/2605.22175">SWE-Mutation: Can LLMs Generate Reliable Test Suites in Software Engineering?</a> arXiv 2605.22175.</li>
    <li id="r14">Dakhel et al. <a href="https://arxiv.org/abs/2308.16557">Effective Test Generation Using Pre-trained LLMs and Mutation Testing (MuTAP)</a>. arXiv 2308.16557.</li>
    <li id="r15">Chang et al. <a href="https://arxiv.org/abs/2602.08146">Test vs Mutant: Adversarial LLM Agents for Robust Unit Test Generation</a>. arXiv 2602.08146.</li>
    <li id="r16">Otterson. <a href="https://arxiv.org/abs/2607.23002">Adversarial Test-Hardening for AI-Written Code</a>. arXiv 2607.23002.</li>
    <li id="r17"><a href="https://www.awesome-testing.com/2026/08/mutation-testing-for-agent-written-code">Mutation Testing for Agent-Written Code</a>. awesome-testing.com, 2026-08.</li>
  </ol>
  </section>
  <footer class="footer">
    <div>方法与数据来自一次内部试点：20 个历史修复，Go 与 Python 混合代码库，2026-10。</div>
  </footer>
<!-- theme toggle: light is default; follows OS preference until the viewer clicks.
     Inline (not external) — keep this behavior in generated reports. -->
<!-- TOC scrollspy: highlights the section near the top in the .toc. Inline, self-
     contained. No-ops harmlessly if you deleted the TOC or the h2 ids. -->
</div>
