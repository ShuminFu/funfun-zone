---
author: Shumin Fu
pubDatetime: 2026-10-14T10:00:00+08:00
title: "Finish One Job, Then Keep Going: Extending a Claude Code Workflow Across Turns"
slug: claude-code-workflow-multi-turn
featured: false
draft: false
tags:
  - claude-code
  - ai-agents
  - workflow
description: How a Claude Code workflow grows across several chat turns — append a step, resume from the last run, and only pay for the new part.
---

<style>
.wf-report{color-scheme:light; --bg:#f4f6f8; --surface:#fbfcfd; --surface-2:#edf0f3; --line:#d8dee4; --line-soft:#e6eaee; --ink:#1b232c; --ink-2:#4a5763; --ink-3:#64717d; --accent:#0b7285; --accent-ink:#095e6e; --red:#b3372b; --redbg:#f7e5e2; --red-line:#d89a92; --grn:#2f7d46; --grnbg:#e4f0e7; --grn-line:#9cc5a8; --grn-soft:#1f5b33; --amb:#a9700f; --ambbg:#f6edda; --amb-line:#e0c48a; --blu:#1c6fb8; --blubg:#e5f0fa; --blu-line:#a9ccea; --pur:#6b4fb0; --purbg:#ede8f7; --pur-line:#c3b3e4; --r:4px; --rp:9px; --content:920px; --measure:68ch; --mono:ui-monospace,"SF Mono","Cascadia Mono","JetBrains Mono",Menlo,Consolas,monospace; --sans:-apple-system,"PingFang SC","Noto Sans SC","Source Han Sans SC","Microsoft YaHei","Segoe UI",sans-serif;}
html[data-theme="dark"] .wf-report{color-scheme:dark; --bg:#151a20; --surface:#1c232b; --surface-2:#222a33; --line:#333d48; --line-soft:#2a333d; --ink:#e2e7ec; --ink-2:#a7b2bd; --ink-3:#818c98; --accent:#5bb8c9; --accent-ink:#7cc9d7; --red:#e08578; --redbg:#3a2622; --red-line:#6e4038; --grn:#6fbf85; --grnbg:#21322a; --grn-line:#3e5c4a; --grn-soft:#a9d8b6; --amb:#d9a84e; --ambbg:#362d1c; --amb-line:#5c4a2a; --blu:#6bb0e8; --blubg:#1b2a3a; --blu-line:#35506e; --pur:#b39be6; --purbg:#262036; --pur-line:#463a66;}
.wf-report *{box-sizing:border-box}
.wf-report{background:var(--bg)}
.wf-report{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px; line-height:1.75;-webkit-font-smoothing:antialiased;transition:background-color .25s ease,color .25s ease}
.wf-report .wrap{max-width:var(--content);margin:0 auto;padding:52px 26px 104px}
.wf-report a{color:var(--accent-ink);text-decoration-thickness:1px;text-underline-offset:.18em}
.wf-report a:hover{text-decoration:underline}
.wf-report :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wf-report strong{font-weight:650;color:var(--ink)}
.wf-report code{font-family:var(--mono);font-size:.88em;background:var(--surface-2);border:1px solid var(--line-soft); padding:1px 5px;border-radius:var(--r);color:var(--ink-2);overflow-wrap:anywhere}
.wf-report p{margin:12px 0}
.wf-report h1{font-size:clamp(29px,4.2vw,42px);line-height:1.18;margin:0 0 10px;letter-spacing:-.025em; font-weight:720;text-wrap:balance;max-width:22ch}
.wf-report h2{font-size:21.5px;margin:58px 0 10px;padding-top:22px;border-top:2px solid var(--line); font-weight:750;letter-spacing:.01em;text-wrap:balance;scroll-margin-top:16px}
.wf-report h2 .n{font-family:var(--mono);color:var(--accent);font-weight:700;font-size:14px;margin-right:11px; font-variant-numeric:tabular-nums;border:1px solid var(--accent-ink);border-radius:var(--r);padding:1px 7px}
.wf-report h3{font-size:15.5px;font-weight:650;text-wrap:balance}
.wf-report .sub{color:var(--ink-3);font-size:13.5px;margin:0 0 18px;max-width:var(--measure);text-wrap:pretty}
.wf-report .themebtn{position:fixed;top:16px;right:16px;z-index:20;width:40px;height:40px;border-radius:50%; border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:15px;cursor:pointer; display:flex;align-items:center;justify-content:center;line-height:1; transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.wf-report .themebtn:hover{border-color:var(--ink-3)}
.wf-report header{margin-bottom:8px;padding-right:56px}
.wf-report .kicker{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase; color:var(--accent);margin:0 0 14px}
.wf-report h1 .zh{display:block;font-size:.52em;line-height:1.45;font-weight:560;color:var(--ink-2); margin-top:8px;letter-spacing:.005em;max-width:34ch}
.wf-report .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.wf-report .chip{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.06em;padding:3px 9px; border-radius:var(--r);border:1px solid var(--line);background:var(--surface);color:var(--ink-2);white-space:nowrap}
.wf-report .chip b{color:var(--ink);font-weight:600}
.wf-report .chip.warn{color:var(--amb);background:var(--ambbg);border-color:var(--amb-line)}
.wf-report .chip.crit{color:var(--red);background:var(--redbg);border-color:var(--red-line)}
.wf-report .chip.ok{color:var(--grn);background:var(--grnbg);border-color:var(--grn-line)}
.wf-report .chip.mute{color:var(--ink-3);background:var(--surface-2);border-color:var(--line-soft)}
.wf-report .verdict{border:1px solid var(--line);background:var(--surface);margin-top:22px}
.wf-report .verdict.ok{border-color:var(--grn-line)}
.wf-report .verdict.warn{border-color:var(--amb-line)}
.wf-report .verdict.crit{border-color:var(--red-line)}
.wf-report .verdict-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 18px;padding:20px 24px 14px; border-bottom:1px solid var(--line-soft)}
.wf-report .verdict-word{font-family:var(--mono);font-size:25px;font-weight:700;letter-spacing:.02em;color:var(--accent-ink)}
.wf-report .verdict.ok .verdict-word{color:var(--grn)}
.wf-report .verdict.warn .verdict-word{color:var(--amb)}
.wf-report .verdict.crit .verdict-word{color:var(--red)}
.wf-report .verdict-zh{font-size:16px;font-weight:650}
.wf-report .verdict-body{padding:14px 24px 18px;font-size:14.5px;color:var(--ink-2)}
.wf-report .verdict-body p{margin:8px 0}
.wf-report .vstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:1px; border-top:1px solid var(--line-soft);background:var(--line-soft)}
.wf-report .vstat{padding:14px 18px;background:var(--surface)}
.wf-report .vstat b{display:block;font-family:var(--mono);font-size:21px;font-weight:600;font-variant-numeric:tabular-nums}
.wf-report .vstat span{font-size:12px;color:var(--ink-3);letter-spacing:.03em}
.wf-report .tldr{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--accent); padding:18px 22px;margin:22px 0 4px}
.wf-report .tldr p{margin:0;color:var(--ink-2);font-size:14.5px;max-width:var(--measure);text-wrap:pretty}
.wf-report .tldr .hl{color:var(--accent-ink);font-weight:650}
.wf-report .prose{max-width:var(--measure);color:var(--ink-2);text-wrap:pretty}
.wf-report .prose p:first-child{margin-top:0}
.wf-report .lead{max-width:58ch;font-size:17px;line-height:1.72;color:var(--ink-2);text-wrap:pretty}
.wf-report .rule{height:1px;border:0;background:var(--line);margin:30px 0}
.wf-report .toc{border:1px solid var(--line);background:var(--surface);padding:18px 22px;margin-top:24px}
.wf-report .toc .toc-h{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase; color:var(--ink-3);margin-bottom:12px}
.wf-report .toc ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:2px 28px}
@media(max-width:620px){.wf-report .toc ol{grid-template-columns:1fr}}
.wf-report .toc a{display:flex;gap:11px;align-items:baseline;padding:5px 4px;color:var(--ink-2);font-size:13.5px; border-bottom:1px solid var(--line-soft)}
.wf-report .toc a:hover{color:var(--accent-ink);text-decoration:none;background:var(--surface-2)}
.wf-report .toc a .tn{font-family:var(--mono);color:var(--accent);font-size:12px;font-weight:700;flex:none; font-variant-numeric:tabular-nums;min-width:20px}
.wf-report .toc a.active{color:var(--accent-ink);font-weight:650;background:var(--surface-2); box-shadow:inset 2px 0 0 var(--accent)}
.wf-report .toc a.active .tn{color:var(--accent-ink)}
@media(min-width:1380px){.wf-report .toc{position:fixed;top:50%;transform:translateY(-50%); left:max(16px,calc((100vw - 880px)/2 - 236px));width:216px;margin:0; max-height:calc(100vh - 48px);overflow-y:auto;z-index:15;border:0;background:none;padding:0}
.wf-report .toc ol{grid-template-columns:1fr;gap:0}
.wf-report .toc a{font-size:12.5px;padding:6px 7px;border-bottom:0}}
.wf-report .grid{display:grid;gap:14px}
.wf-report .g2{grid-template-columns:1fr 1fr}
.wf-report .g3{grid-template-columns:repeat(3,1fr)}
.wf-report .g4{grid-template-columns:repeat(4,1fr)}
@media(max-width:720px){.wf-report .g2,.wf-report .g3,.wf-report .g4{grid-template-columns:1fr}}
.wf-report .card{background:var(--surface);border:1px solid var(--line);padding:16px 18px}
.wf-report .card h3{margin:0 0 6px;font-size:14.5px}
.wf-report .card p{margin:0;color:var(--ink-2);font-size:13.5px;text-wrap:pretty}
.wf-report .card.feature{grid-column:span 2;border-top:3px solid var(--accent)}
@media(max-width:720px){.wf-report .card.feature{grid-column:auto}}
.wf-report .stat{background:var(--surface);border:1px solid var(--line);padding:16px 18px}
.wf-report .stat .v{font-family:var(--mono);font-size:24px;font-weight:600;font-variant-numeric:tabular-nums; line-height:1.1;color:var(--ink)}
.wf-report .stat .l{color:var(--ink-3);font-size:12px;letter-spacing:.03em;margin-top:6px}
.wf-report .stat.bad .v{color:var(--red)}
.wf-report .stat.good .v{color:var(--grn)}
.wf-report .stat.warn .v{color:var(--amb)}
.wf-report .calc{background:var(--surface);border:1px solid var(--line);padding:24px;margin-top:6px;overflow-x:auto}
.wf-report .eqrow{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px;min-width:0; font-family:var(--mono);font-size:15px}
.wf-report .tok{padding:10px 14px;border-radius:var(--r);border:1px solid var(--line);text-align:center;min-width:118px}
.wf-report .tok .num{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.wf-report .tok .cap{font-size:11px;color:var(--ink-3);margin-top:3px;white-space:normal}
.wf-report .tok.in{background:var(--blubg);border-color:var(--blu-line)}
.wf-report .tok.in .num{color:var(--blu)}
.wf-report .tok.out{background:var(--purbg);border-color:var(--pur-line)}
.wf-report .tok.out .num{color:var(--pur)}
.wf-report .tok.sum{background:var(--redbg);border-color:var(--red-line)}
.wf-report .tok.sum .num{color:var(--red)}
.wf-report .tok.lim{background:var(--surface-2);border-color:var(--line)}
.wf-report .tok.lim .num{color:var(--ink)}
.wf-report .op{font-size:19px;color:var(--ink-3)}
.wf-report .calcverdict{text-align:center;margin-top:16px;font-size:14px;color:var(--red);font-weight:650}
.wf-report .calcverdict .ok{color:var(--grn)}
.wf-report .calc .note{text-align:center;color:var(--ink-3);font-size:12.5px;margin-top:6px}
.wf-report .flow{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:6px}
@media(max-width:720px){.wf-report .flow{grid-template-columns:1fr}}
.wf-report .lane{border:1px solid var(--line);background:var(--surface)}
.wf-report .lane .hd{padding:12px 18px;font-weight:650;font-size:14px;display:flex;align-items:center;gap:8px}
.wf-report .lane.good .hd{background:var(--grnbg);color:var(--grn);border-bottom:1px solid var(--grn-line)}
.wf-report .lane.bad .hd{background:var(--redbg);color:var(--red);border-bottom:1px solid var(--red-line)}
.wf-report .lane.aux .hd{background:var(--blubg);color:var(--blu);border-bottom:1px solid var(--blu-line)}
.wf-report .lane.aux .res{color:var(--blu)}
.wf-report .lane .bd{padding:16px 18px}
.wf-report .step{font-family:var(--mono);font-size:12.5px;color:var(--ink-2);padding:9px 12px;border-radius:var(--r); background:var(--surface-2);border:1px solid var(--line-soft);margin-bottom:8px}
.wf-report .arrow{text-align:center;color:var(--ink-3);font-size:13px;margin:-2px 0 6px}
.wf-report .lane .res{font-size:13px;margin-top:6px;font-weight:650}
.wf-report .lane.good .res{color:var(--grn)}
.wf-report .lane.bad .res{color:var(--red)}
.wf-report .tablebox{overflow-x:auto;margin-top:6px;border:1px solid var(--line);background:var(--surface)}
.wf-report table{width:100%;border-collapse:collapse;font-size:14px}
.wf-report th{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3); text-align:left;font-weight:500;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--surface-2)}
.wf-report td{padding:10px 14px;border-bottom:1px solid var(--line-soft);vertical-align:top;color:var(--ink)}
.wf-report tr:last-child td{border-bottom:0}
.wf-report td.y{color:var(--grn);font-weight:650;white-space:nowrap}
.wf-report td.n{color:var(--red);font-weight:650;white-space:nowrap}
.wf-report td.note{color:var(--ink-2);font-size:13.5px}
.wf-report td code{font-size:.82em}
.wf-report .layers{margin-top:6px}
.wf-report .layer{display:flex;align-items:center;gap:16px;background:var(--surface);border:1px solid var(--line); padding:14px 18px;margin-bottom:10px}
.wf-report .layer .rank{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--ink-3);min-width:30px; text-align:center;font-variant-numeric:tabular-nums}
.wf-report .layer .body{flex:1}
.wf-report .layer .body .t{font-weight:650;margin-bottom:2px;font-size:14.5px}
.wf-report .layer .body .d{color:var(--ink-2);font-size:13.5px}
.wf-report .layer .tag{font-family:var(--mono);font-size:11px;letter-spacing:.06em;padding:3px 9px;border-radius:var(--r);white-space:nowrap}
.wf-report .layer.l1{border-left:3px solid var(--grn)}
.wf-report .layer.l1 .tag{background:var(--grnbg);color:var(--grn)}
.wf-report .layer.l2{border-left:3px solid var(--blu)}
.wf-report .layer.l2 .tag{background:var(--blubg);color:var(--blu)}
.wf-report .layer.l3{border-left:3px solid var(--amb)}
.wf-report .layer.l3 .tag{background:var(--ambbg);color:var(--amb)}
.wf-report .phase{border:1px solid var(--line);background:var(--surface);padding:16px 18px}
.wf-report .phase .ph{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase; color:var(--ink-3);margin-bottom:8px}
.wf-report .phase ul{margin:0;padding-left:18px;color:var(--ink-2);font-size:13.5px}
.wf-report .phase ul li{margin:5px 0}
.wf-report .phase ul li b{color:var(--ink)}
.wf-report .filebox{border:1px solid var(--line);background:var(--surface);padding:4px 18px;margin-top:6px}
.wf-report .file{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line-soft)}
.wf-report .file:last-child{border-bottom:none}
.wf-report .file .badge{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;padding:3px 8px;border-radius:var(--r); margin-top:2px;white-space:nowrap;font-weight:600}
.wf-report .b-edit{background:var(--ambbg);color:var(--amb)}
.wf-report .b-new{background:var(--grnbg);color:var(--grn)}
.wf-report .b-keep{background:var(--blubg);color:var(--blu)}
.wf-report .file .fp{font-family:var(--mono);font-size:13px;color:var(--ink)}
.wf-report .file .fd{color:var(--ink-2);font-size:13px;margin-top:3px}
.wf-report .insight{background:var(--grnbg);border:1px solid var(--grn-line);padding:16px 20px;margin-top:6px}
.wf-report .insight b{color:var(--grn)}
.wf-report .insight p{margin:0;color:var(--grn-soft);font-size:14px;max-width:var(--measure);text-wrap:pretty}
.wf-report .footer{margin-top:64px;border-top:1px solid var(--line);padding-top:18px;font-size:12.5px;color:var(--ink-3)}
.wf-report .footer code{background:none;border:none;padding:0;color:var(--ink-3)}
.wf-report .legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--ink-2)}
.wf-report .legend span{display:inline-flex;align-items:center;gap:6px}
.wf-report .dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.wf-report .verdict,.wf-report .tldr,.wf-report .calc,.wf-report .insight{border-radius:var(--rp)}
.wf-report .toc,.wf-report .card,.wf-report .stat,.wf-report .lane,.wf-report .tablebox,.wf-report .filebox,.wf-report .phase{border-radius:var(--r)}
.wf-report .lane,.wf-report .verdict{overflow:hidden}
.wf-report .pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10.5px;font-weight:700; letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:999px; border:1px solid var(--line);background:var(--surface-2);color:var(--ink-2); white-space:nowrap;vertical-align:middle;margin-right:8px}
.wf-report .pill.grn{color:var(--grn);background:color-mix(in srgb,var(--grn) 13%,transparent);border-color:color-mix(in srgb,var(--grn) 34%,transparent)}
.wf-report .pill.amb{color:var(--amb);background:color-mix(in srgb,var(--amb) 14%,transparent);border-color:color-mix(in srgb,var(--amb) 36%,transparent)}
.wf-report .pill.blu{color:var(--blu);background:color-mix(in srgb,var(--blu) 13%,transparent);border-color:color-mix(in srgb,var(--blu) 34%,transparent)}
.wf-report .pill.pur{color:var(--pur);background:color-mix(in srgb,var(--pur) 14%,transparent);border-color:color-mix(in srgb,var(--pur) 36%,transparent)}
.wf-report .pill.red{color:var(--red);background:color-mix(in srgb,var(--red) 13%,transparent);border-color:color-mix(in srgb,var(--red) 34%,transparent)}
.wf-report .pill.teal{color:var(--accent-ink);background:color-mix(in srgb,var(--accent) 13%,transparent);border-color:color-mix(in srgb,var(--accent) 34%,transparent)}
@media(max-width:620px){.wf-report .wrap{padding:38px 18px 76px}
.wf-report header{padding-right:44px}
.wf-report h2{margin-top:46px}
.wf-report .verdict-head,.wf-report .verdict-body{padding-left:18px;padding-right:18px}
.wf-report .layer{align-items:flex-start;gap:10px}
.wf-report .layer .tag{white-space:normal}
.wf-report .file{flex-direction:column;gap:6px}}
@media (prefers-reduced-motion:reduce){.wf-report *{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
@media print{.wf-report{color-scheme:light; --bg:#fff;--surface:#fff;--surface-2:#f3f5f7;--line:#bcc5cd;--line-soft:#dfe4e8; --ink:#111820;--ink-2:#37434e;--ink-3:#606d78;--accent:#0b6575;--accent-ink:#074f5c; --red:#8f2d25;--redbg:#f8e9e7;--red-line:#c99089; --grn:#25683a;--grnbg:#e8f2ea;--grn-line:#8eb49a;--grn-soft:#1f5431; --amb:#835706;--ambbg:#f8efdd;--amb-line:#cdb476; --blu:#195f9c;--blubg:#e8f1f9;--blu-line:#9bbdda; --pur:#594190;--purbg:#eeeaf6;--pur-line:#b7aad5;}
.wf-report *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wf-report{font-size:11pt}
.wf-report .wrap{max-width:none;padding:0}
.wf-report .themebtn,.wf-report .toc{display:none!important}
.wf-report a{color:inherit;text-decoration:none}
.wf-report h2{break-after:avoid;page-break-after:avoid}
.wf-report .verdict,.wf-report .tldr,.wf-report .card,.wf-report .stat,.wf-report .calc,.wf-report .lane,.wf-report .tablebox,.wf-report .layer,.wf-report .phase,.wf-report .filebox,.wf-report .insight{break-inside:avoid;page-break-inside:avoid}
.wf-report .footer{margin-top:36px}}
.wf-report pre{font-family:var(--mono);font-size:12.5px;line-height:1.6;background:var(--surface-2);border:1px solid var(--line-soft); border-radius:var(--r);padding:12px 14px;margin:8px 0 0;overflow-x:auto;color:var(--ink)}
.wf-report pre .add{color:var(--grn);font-weight:600}
.wf-report pre .dim{color:var(--ink-3)}
.wf-report pre .hot{color:var(--amb);font-weight:600}
.wf-report .tl{position:relative;margin-top:10px;padding-left:34px}
.wf-report .tl::before{content:"";position:absolute;left:12px;top:6px;bottom:6px;width:2px;background:var(--line)}
.wf-report .turn{position:relative;margin-bottom:22px}
.wf-report .turn::before{content:attr(data-n);position:absolute;left:-34px;top:2px;width:26px;height:26px;border-radius:50%; background:var(--surface);border:2px solid var(--accent);color:var(--accent-ink);font-family:var(--mono); font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}
.wf-report .turn .who{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.wf-report .turn .say{font-size:15px;font-weight:650;margin:2px 0 8px}
.wf-report .turn .box{border:1px solid var(--line);background:var(--surface);border-radius:var(--r);padding:12px 16px}
.wf-report .turn .box ol{margin:0;padding-left:18px;color:var(--ink-2);font-size:13.5px}
.wf-report .turn .box li{margin:4px 0}
.wf-report .runs{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.wf-report .run{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:var(--r);border:1px solid var(--line);white-space:nowrap}
.wf-report .run.cache{background:var(--grnbg);color:var(--grn);border-color:var(--grn-line)}
.wf-report .run.live{background:var(--ambbg);color:var(--amb);border-color:var(--amb-line)}
.wf-report .run.id{background:var(--blubg);color:var(--blu);border-color:var(--blu-line)}
.wf-report{background:transparent;font-size:15px;line-height:1.75}
.wf-report h3{font-style:normal;margin:0 0 6px}
.wf-report h2{margin-bottom:10px}
.wf-report table th,.wf-report table td{border-left:0;border-right:0;border-top:0}
.wf-report code::before,.wf-report code::after{content:none}
.wf-report ul,.wf-report ol{list-style:revert}
.wf-report .lead{margin:0 0 4px}

</style>

<div class="wf-report not-prose">
<p class="lead">How a workflow grows across several chat turns without redoing the work that is already done</p>
<div class="chips">
<span class="chip">tool <b>Workflow</b></span>
<span class="chip">key input <b>resumeFromRunId</b></span>
<span class="chip ok">scope <b>same session only</b></span>
</div>
<div class="verdict ok">
<div class="verdict-head">
<span class="verdict-word">APPEND → RESUME</span>
<span class="verdict-zh">Add the new step at the end of the saved script, then resume from the last run.</span>
</div>
<div class="verdict-body">
<p>Every run saves its script to a file and returns a <code>runId</code>. Next turn, I edit that file and call
<code>Workflow({scriptPath, resumeFromRunId})</code>. Steps at the front that did not change come back
<strong>from the cache</strong>, instantly and for free. Only the new step runs for real.</p>
<p>One catch: the cache works on the <strong>longest unchanged prefix</strong>. Change an early step, and that step
plus everything after it runs again. So add new work at the <em>end</em>.</p>
</div>
<div class="vstats">
<div class="vstat"><b>0 tokens</b><span>for cached steps on resume</span></div>
<div class="vstat"><b>1 file</b><span>the saved script you keep editing</span></div>
<div class="vstat"><b>1 session</b><span>resume does not cross sessions</span></div>
</div>
</div>
<section aria-labelledby="s01">
<h2 id="s01"><span class="n">01</span>The four pieces</h2>
<p class="sub">Think of a recipe card plus a box of finished dishes. You can add a line to the card; the dishes already cooked stay in the box.</p>
<div class="grid g2">
<div class="card"><h3><span class="pill teal">recipe</span>The script file</h3><p>The JavaScript that says which agents to run. Each run saves it as a file in this session's folder; the tool result prints the path. I edit it with <code>Edit</code>, then pass it back as <code>scriptPath</code>.</p></div>
<div class="card"><h3><span class="pill blu">receipt</span>The run ID</h3><p>A name for one run, like <code>wf_…</code>. It points to that run's saved results. You pass it as <code>resumeFromRunId</code>.</p></div>
<div class="card"><h3><span class="pill grn">dish box</span>The journal</h3><p><code>journal.jsonl</code> in the run's folder records what each <code>agent()</code> call returned. Resume reads it. I also read it when a result looks empty or odd.</p></div>
<div class="card"><h3><span class="pill amb">order note</span><code>args</code></h3><p>Input handed to the script. It is part of the cache key: same script + same <code>args</code> = full cache hit. Use it to pass a result into a <em>different</em> workflow.</p></div>
</div>
</section>
<section aria-labelledby="s02">
<h2 id="s02"><span class="n">02</span>The whole flow, turn by turn</h2>
<p class="sub">Example: review a branch, then fix what was found, then double-check the fixes. Three chat turns, one growing script.</p>
<div class="tl">
<div class="turn" data-n="1">
<div class="who">Turn 1 · you</div>
<div class="say">"Use a workflow to review the changes on this branch."</div>
<div class="box"><ol>
<li>I call <code>Workflow({script})</code> with phases <b>Review → Verify</b>.</li>
<li>The tool returns right away with a <code>runId</code> and the saved <code>scriptPath</code>. The run continues in the background.</li>
<li>When it ends, a notification wakes me. I read the result and report the confirmed findings to you.</li>
</ol>
<div class="runs"><span class="run live">Review ×N · live</span><span class="run live">Verify ×M · live</span><span class="run id">→ run A</span></div>
</div>
</div>
<div class="turn" data-n="2">
<div class="who">Turn 2 · you</div>
<div class="say">"Good. Now fix the confirmed ones."</div>
<div class="box"><ol>
<li>I <code>Edit</code> the saved script and <b>append</b> a <b>Fix</b> phase after Verify. It uses the confirmed findings already in the script.</li>
<li>I call <code>Workflow({scriptPath, resumeFromRunId: "run A"})</code>.</li>
<li>Review and Verify did not change, so they replay from the journal in no time. Only Fix runs.</li>
</ol>
<div class="runs"><span class="run cache">Review · cached</span><span class="run cache">Verify · cached</span><span class="run live">Fix · live</span><span class="run id">→ run B</span></div>
</div>
</div>
<div class="turn" data-n="3">
<div class="who">Turn 3 · you</div>
<div class="say">"Add a final check that the tests pass."</div>
<div class="box"><ol>
<li>I append a <b>Check</b> phase and resume from the <em>latest</em> run, run B.</li>
<li>Everything before Check is cached; Check runs live.</li>
</ol>
<div class="runs"><span class="run cache">Review · cached</span><span class="run cache">Verify · cached</span><span class="run cache">Fix · cached</span><span class="run live">Check · live</span><span class="run id">→ run C</span></div>
</div>
</div>
<div class="turn" data-n="!">
<div class="who">Any turn · mid-run</div>
<div class="say">"Wait — change the plan before it finishes."</div>
<div class="box"><ol>
<li>I stop the running workflow first with <code>TaskStop</code>.</li>
<li>Then I edit the script and resume from that run's ID. Agents that already finished come from the cache.</li>
</ol></div>
</div>
</div>
<div class="tldr"><p><span class="hl">In one line:</span> each turn = edit the same file, add at the end, resume from the newest run ID. The script grows; the cost only covers the new part.</p></div>
</section>
<section aria-labelledby="s03">
<h2 id="s03"><span class="n">03</span>What the script looks like</h2>
<p class="sub">Turn 2's edit, simplified. Green lines are the append; nothing above them changes.</p><pre><span class="dim">export const meta = {
  name: 'review-then-fix',
  description: 'Review branch changes, verify, then fix confirmed findings',
  phases: [{ title: 'Review' }, { title: 'Verify' },</span> <span class="add">{ title: 'Fix' }</span><span class="dim">],
}
<span></span>
const found = await pipeline(DIMENSIONS, d =&gt; agent(d.prompt, { phase: 'Review', schema: FINDINGS }))
const confirmed = await verifyAll(found)          // unchanged → replayed from the journal</span>
<span class="add">
// --- appended in turn 2 ---
const fixes = await parallel(confirmed.map(f =&gt; () =&gt;
  agent(`Fix ${f.title} in ${f.file}`, { phase: 'Fix', isolation: 'worktree' })))
return { confirmed, fixes }</span></pre><p class="prose" style="margin-top:12px">Two small rules: the <code>meta</code> block must be a plain literal, and the script cannot use
<code>Date.now()</code>, <code>Math.random()</code>, or <code>new Date()</code>. Those would give a different answer on every replay and break the cache.
Pass a timestamp in through <code>args</code> instead.</p>
</section>
<section aria-labelledby="s04">
<h2 id="s04"><span class="n">04</span>The cache rule: longest unchanged prefix</h2>
<p class="sub">Resume walks the <code>agent()</code> calls in order. It reuses them until it meets the first one that is new or different. From there on, everything runs live.</p>
<div class="flow">
<div class="lane good">
<div class="hd">✓ Append at the end</div>
<div class="bd">
<div class="step">Review — same → cached</div>
<div class="arrow">↓</div>
<div class="step">Verify — same → cached</div>
<div class="arrow">↓</div>
<div class="step">Fix — new → live</div>
<div class="res">→ pay only for Fix</div>
</div>
</div>
<div class="lane bad">
<div class="hd">✗ Edit an early prompt</div>
<div class="bd">
<div class="step">Review — prompt changed → live</div>
<div class="arrow">↓</div>
<div class="step">Verify — after the change → live</div>
<div class="arrow">↓</div>
<div class="step">Fix — live</div>
<div class="res">→ pay for the whole run again</div>
</div>
</div>
</div>
<div class="tablebox" style="margin-top:16px">
<table>
<thead><tr><th>You change…</th><th>Effect on resume</th></tr></thead>
<tbody>
<tr><td>Nothing (same script, same <code>args</code>)</td><td class="y">✓ 100% cached</td></tr>
<tr><td>Add steps after the last one</td><td class="y">✓ old steps cached, new ones live</td></tr>
<tr><td>An early <code>agent()</code> prompt or its options</td><td class="n">✗ that step and all later steps rerun</td></tr>
<tr><td><code>args</code></td><td class="n">✗ any step whose prompt uses them reruns</td></tr>
</tbody>
</table>
</div>
<div class="insight" style="margin-top:14px"><p><b>Easy to get wrong.</b> It is tempting to think "any unchanged call is cached." In fact, only the unchanged calls <em>before the first change</em> are cached. That is why appending is the safe habit.</p></div>
</section>
<section aria-labelledby="s05">
<h2 id="s05"><span class="n">05</span>Other ways to continue</h2>
<p class="sub">Resume is the default. Pick another path when the next job is not really "more of the same run."</p>
<div class="tablebox">
<table>
<thead><tr><th>Situation</th><th>What I call</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Next job builds on this run's data</td><td class="note"><code>Workflow({scriptPath, resumeFromRunId})</code></td><td class="note">Reuses finished agents; one growing script.</td></tr>
<tr><td>Want a clean rerun of the edited script</td><td class="note"><code>Workflow({scriptPath})</code></td><td class="note">No cache; everything runs fresh.</td></tr>
<tr><td>Next job is a different kind of work</td><td class="note">New <code>Workflow({script, args})</code></td><td class="note">Feed the last result in via <code>args</code>; each workflow stays small and readable.</td></tr>
<tr><td>One script should call another</td><td class="note"><code>workflow(name or {scriptPath}, args)</code> inside the script</td><td class="note">Runs the child inline. Only one level deep.</td></tr>
<tr><td>Reuse it in later sessions</td><td class="note">Save under <code>.claude/workflows/</code>, call by <code>name</code></td><td class="note">Resume can't cross sessions; a saved workflow can be rerun anywhere.</td></tr>
</tbody>
</table>
</div>
<p class="prose" style="margin-top:12px">For big tasks, the guidance is to run phases as <strong>separate workflows in sequence</strong>—understand → design → implement → review—so I read each result before choosing the next step. That keeps you in the loop between phases.</p>
</section>
<section aria-labelledby="s06">
<h2 id="s06"><span class="n">06</span>Limits and gotchas</h2>
<div class="grid g2">
<div class="phase">
<div class="ph">Hard limits</div>
<ul>
<li><b>Same session only.</b> A new session cannot resume an old run.</li>
<li><b>Stop before you resume</b> a run that is still going (<code>TaskStop</code>).</li>
<li><b>Nesting is one level.</b> A child workflow can't call another.</li>
<li><b>Opt-in.</b> I only start a workflow when you ask (e.g. "use a workflow").</li>
</ul>
</div>
<div class="phase">
<div class="ph">Habits that keep it cheap</div>
<ul>
<li><b>Add new work at the end</b> of the script.</li>
<li><b>Don't reword</b> early prompts unless you want them to rerun.</li>
<li><b>Odd or empty result?</b> Check <code>journal.jsonl</code> before guessing.</li>
<li><b>Mention the run</b> ("extend the last workflow…") so I know which run ID to resume.</li>
</ul>
</div>
</div>
<div class="tldr"><p><span class="hl">What to tell me:</span> "Extend the last workflow with &lt;new step&gt; and resume." I'll append to the saved script, resume from the newest run ID, and only the new step will cost anything.</p></div>
</section>
<footer class="footer">
<div>Source: Claude Code <code>Workflow</code> tool description and <code>workflow-authoring</code> reference (Resume section).</div>
<div class="legend">
<span><span class="dot" style="background:var(--grn)"></span>cached / safe</span>
<span><span class="dot" style="background:var(--amb)"></span>runs live (costs tokens)</span>
<span><span class="dot" style="background:var(--red)"></span>cache broken</span>
<span><span class="dot" style="background:var(--blu)"></span>run ID</span>
</div>
</footer>
</div>
