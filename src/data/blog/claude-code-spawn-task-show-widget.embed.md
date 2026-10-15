---
author: "Shumin Fu"
pubDatetime: 2026-10-14T13:39:52+08:00
modDatetime: 2026-10-15T10:39:36+08:00
title: "Claude Code 的 spawn_task 和 show_widget 是做什么的"
slug: claude-code-spawn-task-show-widget
featured: false
draft: false
tags:
  - "claude-code"
  - "ai-agents"
description: "spawn_task 把顺路看到的问题变成一张卡片，show_widget 把要你挑的东西直接画在聊天里。"
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
.html-embed p.pg-prose.note{font-size:13px;color:var(--ink-3)}
.html-embed .stages td:first-child{white-space:nowrap}
.html-embed .st-tree{border:1px solid var(--line);background:var(--surface);border-radius:var(--rp);padding:14px 18px;max-width:640px}
.html-embed .st-tree ul{list-style:none;margin:0;padding:0 0 0 13px}
.html-embed .st-tree li{position:relative;margin:0;padding:0 0 0 22px}
.html-embed .st-tree li::before{content:"";position:absolute;left:0;top:0;bottom:0;border-left:1.5px solid var(--line)}
.html-embed .st-tree li:last-child::before{bottom:auto;height:19px;width:14px;border-bottom:1.5px solid var(--line);border-bottom-left-radius:9px}
.html-embed .st-tree li:not(:last-child)::after{content:"";position:absolute;left:0;top:19px;width:14px;border-top:1.5px solid var(--line)}
.html-embed .st-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;min-height:38px;padding:4px 0}
.html-embed .st-root .st-name{font-size:15px}
.html-embed .st-ic{width:20px;height:20px;border-radius:6px;background:var(--surface-2);border:1px solid var(--line);font-size:12px;display:flex;align-items:center;justify-content:center}
.html-embed .st-name{font-size:14px;font-weight:600;color:var(--ink)}
.html-embed .st-pend .st-name{font-weight:500;color:var(--ink-3);border:1px dashed var(--line);border-radius:6px;padding:0 8px}
.html-embed .st-tag{font-size:11.5px;line-height:1.6;padding:0 8px;border-radius:999px;border:1px solid var(--line);color:var(--ink-3);white-space:nowrap}
.html-embed .st-tag.st-card{color:var(--blu);background:var(--blubg);border-color:var(--blu-line)}
.html-embed .st-tag.st-fork{color:var(--pur);background:var(--purbg);border-color:var(--pur-line)}
.html-embed .st-tag.st-start{color:var(--grn);background:var(--grnbg);border-color:var(--grn-line)}
.html-embed .st-st{font-size:12px;color:var(--ink-3);white-space:nowrap}
.html-embed .st-st.done{color:var(--grn)}
.html-embed .st-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line-soft);font-size:12px;color:var(--ink-3)}
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
.html-embed pre{font-family:var(--mono);font-size:12.5px;line-height:1.6;background:var(--surface-2);border:1px solid var(--line-soft); border-radius:var(--r);padding:12px 14px;margin:8px 0 0;overflow-x:auto;color:var(--ink)}
.html-embed pre .add{color:var(--grn);font-weight:600}
.html-embed pre .dim{color:var(--ink-3)}
.html-embed pre .hot{color:var(--amb);font-weight:600}
.html-embed .tl{position:relative;margin-top:10px;padding-left:34px}
.html-embed .tl::before{content:"";position:absolute;left:12px;top:6px;bottom:6px;width:2px;background:var(--line)}
.html-embed .turn{position:relative;margin-bottom:22px}
.html-embed .turn::before{content:attr(data-n);position:absolute;left:-34px;top:2px;width:26px;height:26px;border-radius:50%; background:var(--surface);border:2px solid var(--accent);color:var(--accent-ink);font-family:var(--mono); font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}
.html-embed .turn .who{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.html-embed .turn .say{font-size:15px;font-weight:650;margin:2px 0 8px}
.html-embed .turn .box{border:1px solid var(--line);background:var(--surface);border-radius:var(--r);padding:12px 16px}
.html-embed .turn .box ol{margin:0;padding-left:18px;color:var(--ink-2);font-size:13.5px}
.html-embed .turn .box li{margin:4px 0}
.html-embed .runs{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.html-embed .run{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:var(--r);border:1px solid var(--line);white-space:nowrap}
.html-embed .run.cache{background:var(--grnbg);color:var(--grn);border-color:var(--grn-line)}
.html-embed .run.live{background:var(--ambbg);color:var(--amb);border-color:var(--amb-line)}
.html-embed .run.id{background:var(--blubg);color:var(--blu);border-color:var(--blu-line)}
.html-embed .mock-label{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin:18px 0 6px}
.html-embed .chipmock{border:1px solid var(--line);background:var(--surface);border-radius:var(--rp);padding:14px 18px; display:flex;gap:14px;align-items:flex-start;max-width:560px}
.html-embed .chipmock .ic{flex:none;width:28px;height:28px;border-radius:50%;background:var(--blubg);color:var(--blu); display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-weight:700;font-size:14px}
.html-embed .chipmock .t{font-weight:650;font-size:14.5px}
.html-embed .chipmock .d{color:var(--ink-2);font-size:13.5px;margin-top:2px}
.html-embed .chipmock .go{margin-top:10px;display:inline-block;font-size:12.5px;font-weight:600;padding:4px 12px;border-radius:999px; border:1px solid var(--blu-line);color:var(--blu);background:var(--blubg)}
.html-embed .widgetmock{border:1px dashed var(--line);border-radius:var(--rp);padding:16px 18px;max-width:560px}
.html-embed .widgetmock .q{font-size:14px;font-weight:650;margin-bottom:12px}
.html-embed .opts{display:flex;flex-wrap:wrap;gap:10px}
.html-embed .opt{width:104px;border:1px solid var(--line);border-radius:10px;padding:10px 8px;text-align:center;background:var(--surface)}
.html-embed .opt svg{width:48px;height:48px;display:block;margin:0 auto 6px}
.html-embed .opt span{font-size:12.5px;color:var(--ink-2)}
.html-embed .opt.pick{border:2px solid var(--accent)}
.html-embed .opt.pick span{color:var(--accent-ink);font-weight:650}
.html-embed .opt.text{display:flex;align-items:center;justify-content:center;min-height:96px}
.html-embed .send{margin-top:12px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2);background:var(--surface-2); border:1px solid var(--line-soft);border-radius:var(--r);padding:8px 12px;overflow-wrap:anywhere}
.html-embed .send b{color:var(--accent-ink);font-weight:600}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed not-prose" lang="zh-CN">
  <header>
    <div class="kicker">Claude Code 桌面版 · 两个小工具 · 科普</div>
    <p class="lead">一个把顺路发现的问题记成卡片，另开会话去修；一个把选项画在聊天里，让你直接点。</p>
    <div class="chips">
      <span class="chip">环境 <b>Claude Code 桌面版</b></span>
      <span class="chip">工具 <b>spawn_task</b></span>
      <span class="chip">工具 <b>show_widget</b></span>
    </div>
  </header>
  <div class="verdict">
    <div class="verdict-head">
      <span class="verdict-word">简单说</span>
      <span class="verdict-zh">顺路看到的问题，不塞进这次的改动；要你挑的东西，直接摆在聊天里。</span>
    </div>
    <div class="verdict-body">
      <p><strong><code>spawn_task</code></strong>：Claude 干活时发现一件“该修、但不归这次管”的事，就在界面上放一张小卡片。你点一下，它变成一个新的独立会话去修。当前这一轮照常往下走。</p>
      <p><strong><code>show_widget</code></strong>：Claude 把一张图或一小段可以点的网页，直接画在回答旁边。你在里面点的选择，会像你自己打字一样发回聊天。</p>
    </div>
    <div class="vstats">
      <div class="vstat"><b>1 次点击</b><span>卡片变成新会话</span></div>
      <div class="vstat"><b>0 打断</b><span>当前这一轮继续干</span></div>
      <div class="vstat"><b>sendPrompt</b><span>控件把你的选择发回聊天</span></div>
    </div>
  </div>
  <section>
  <h2 id="s01"><span class="n">01</span>先打两个比方</h2>
  <div class="grid g2">
    <div class="card"><h3><span class="pill blu">spawn_task</span>贴在工单上的便利贴</h3><p>修车师傅给你换轮胎，发现刹车片快磨完了。他不顺手去拆刹车——那会把今天的活越搞越大。他在工单上贴一张便利贴：“刹车片该换了，要的话另开一单。”开不开，你说了算。</p></div>
    <div class="card"><h3><span class="pill teal">show_widget</span>摆在你面前的样板</h3><p>装修师傅不用嘴给你描述三种瓷砖，而是把三块样板直接摆在桌上。你用手一指：“这块。”比来回打字说“第二种偏灰那个”快得多，也不会听岔。</p></div>
  </div>
  <h2 id="s02"><span class="n">02</span>spawn_task：顺路看到的事，交给你决定</h2>
  <p class="sub">它管的是“范围”。这次的改动只做这次该做的事，其他值得修的事记下来，变成一张卡片。</p>
  <div class="layers">
    <div class="layer"><div class="rank">1</div><div class="body"><div class="t">Claude 在做 A，发现了 B</div><div class="d">B 是真问题，但跟 A 无关。比如：没人用的死代码、过期的文档、缺的测试、确认过的 TODO、顺路看到的安全问题。</div></div></div>
    <div class="layer"><div class="rank">2</div><div class="body"><div class="t">调用 <code>spawn_task</code>，写好一张卡片</div><div class="d">填标题、一两句说明，以及一份给新会话看的完整任务说明（见下表）。</div></div></div>
    <div class="layer"><div class="rank">3</div><div class="body"><div class="t">卡片出现在你的界面上，这一轮不停</div><div class="d">Claude 接着做 A，不跑题，也不等你。</div></div></div>
    <div class="layer"><div class="rank">4</div><div class="body"><div class="t">你点一下，B 变成一个新会话</div><div class="d">新会话在一个新的 git worktree（同一个仓库的另一份独立工作目录）里开工，跟你现在的改动互不干扰。</div></div></div>
    <div class="layer"><div class="rank">5</div><div class="body"><div class="t">卡片过时了，就撤回</div><div class="d">如果 B 在这次里已经顺手修了，或者有了更好的版本，Claude 用 <code>dismiss_task</code> 把卡片撤掉。你已经点过或关掉的卡片，撤不回来。</div></div></div>
  </div>
  <h3>一张卡片有四样东西</h3>
  <div class="tablebox"><table>
    <thead><tr><th>字段</th><th>给谁看</th><th>要求</th></tr></thead>
    <tbody>
      <tr><td><code>title</code></td><td>你（卡片标题）</td><td class="note">60 个字符以内，动词开头，比如 “Fix stale README badge”。</td></tr>
      <tr><td><code>tldr</code></td><td>你（卡片正文）</td><td class="note">一两句大白话：为什么现在提、新会话会做什么。不放文件路径。</td></tr>
      <tr><td><code>prompt</code></td><td>新会话（你在界面上看不到）</td><td class="note">必须自己站得住：文件路径、背景全写进去。新会话看不到这次的聊天记录。</td></tr>
      <tr><td><code>cwd</code></td><td>系统</td><td class="note">可选。问题在另一个仓库时，填那个项目的根目录。</td></tr>
    </tbody>
  </table></div>
  <div class="mock-label">示意：一张卡片大概长这样（不是真截图）</div>
  <div class="chipmock">
    <div class="ic">+</div>
    <div>
      <div class="t">Fix the 530 error on the custom domain</div>
      <div class="d">发这篇博客时发现，自定义域名一直返回 530，而 pages.dev 地址是好的。新会话会去查 Cloudflare 的域名绑定和 DNS。</div>
      <span class="go">点一下，另开会话</span>
    </div>
  </div>
  <p class="pg-prose">这个例子是真的：给这个博客发文章时，自定义域名一直打不开，但它跟“发文章”这件事无关。正确的做法就是记一张卡片，而不是在发文章的改动里顺手去改 DNS。</p>
  <h3>新会话怎么知道自己是谁开出来的</h3>
  <p class="pg-prose">它自己不知道。<b>这层关系由桌面 app 记录</b>：<code>spawn_task</code> 的参数里没有父会话，新会话的聊天记录里也没有。app 把来历写进自己的会话档案。下面是一张真实卡片点开后，新会话档案里的字段：</p>
  <div class="tablebox stages"><table>
    <thead><tr><th>字段</th><th>记的是什么</th></tr></thead>
    <tbody>
      <tr><td><code>spawnedFrom.sessionId</code></td><td class="note">父会话的 ID</td></tr>
      <tr><td><code>spawnedFrom.taskId</code></td><td class="note">那张卡片的编号，形如 <code>task_cc891ed4</code></td></tr>
      <tr><td><code>spawnedFrom.title</code></td><td class="note">卡片标题，也就是新会话的名字</td></tr>
      <tr><td><code>worktreePath</code> / <code>branch</code></td><td class="note">新建的 worktree 和分支</td></tr>
    </tbody>
  </table></div>
  <p class="pg-prose">新会话做完后，app 再按这条记录通知父会话。</p>
  <h3>为什么这层关系值得记：项目和线程都靠它</h3>
  <p class="pg-prose">Claude Code 里的“项目”，正在从一个文件夹变成一段对话：</p>
  <div class="tablebox stages"><table>
    <thead><tr><th>阶段</th><th>“项目”是什么</th><th>会话之间的关系</th></tr></thead>
    <tbody>
      <tr><td><b>1. 文件夹</b></td><td class="note">命令行版按启动目录归档会话（<code>~/.claude/projects/</code>）。</td><td class="note">没有。spawn 出来的会话跑在新 worktree 里，被当成另一个项目。</td></tr>
      <tr><td><b>2. 侧栏分组</b></td><td class="note">桌面 app 按 <code>originCwd</code>（最初的仓库）归组。</td><td class="note">app 记下 <code>spawnedFrom</code>、<code>forkedFromSessionId</code>、<code>parentSessionId</code>。子会话进父会话的分组，做完通知父会话。</td></tr>
      <tr><td><b>3. Projects</b></td><td class="note">2026 年 9 月公测。项目是一段由 Claude 当协调人的对话。</td><td class="note">协调人为每件事开一个 thread 并跟踪它；thread 做完向项目汇报。</td></tr>
    </tbody>
  </table></div>
  <p class="pg-prose">有了“谁开了谁”这条线，一个项目里的会话会长成一棵树：</p>
  <div class="mock-label">示意：一个项目里的会话关系</div>
  <div class="st-tree">
    <div class="st-row st-root"><span class="st-ic">▦</span><span class="st-name">博客改版</span><span class="st-tag">项目 · 协调对话</span></div>
    <ul>
      <li><div class="st-row"><span class="st-name">首页重新排版</span><span class="st-tag st-start">派活</span><span class="st-st">进行中</span></div>
        <ul>
          <li><div class="st-row"><span class="st-name">修复自定义域名 530</span><span class="st-tag st-card">卡片开出</span><span class="st-st done">✓ 已向上汇报</span></div></li>
          <li><div class="st-row"><span class="st-name">换一套配色试试</span><span class="st-tag st-fork">从第 12 条消息分叉</span><span class="st-st">进行中</span></div></li>
        </ul>
      </li>
      <li><div class="st-row"><span class="st-name">给旧文章补封面图</span><span class="st-tag st-start">派活</span><span class="st-st done">✓ 已向上汇报</span></div>
        <ul>
          <li class="st-pend"><div class="st-row"><span class="st-name">压缩过大的图片</span><span class="st-tag st-card">卡片</span><span class="st-st">等你点开</span></div></li>
        </ul>
      </li>
    </ul>
    <div class="st-legend"><span><span class="st-tag st-start">派活</span> 协调人开的 thread</span><span><span class="st-tag st-card">卡片开出</span> <code>spawnedFrom</code></span><span><span class="st-tag st-fork">分叉</span> <code>forkedFromSessionId</code></span></div>
  </div>
  <p class="pg-prose"><code>spawn_task</code> 像 thread 的手动版：Claude 提议，你点卡片开工。但这只是类比：thread 默认跑在云端，你在本机自己开的会话加不进项目。</p>
  <p class="pg-prose">两者靠的是同一条线：谁开了谁。官方文档写明，一个 thread 只属于开它的项目，归档项目时会一起归档。AI 会自己生出新会话，会话就长成一棵树；记住来历，软件才管得住这棵树。</p>
  <div class="tldr"><p><span class="hl">一句话：</span>项目从“一个文件夹”变成“一段对话”，靠的就是 app 记下的“谁开了谁”。</p></div>
  <p class="pg-prose note">参考：<a href="https://code.claude.com/docs/en/claude-projects">Claude Code 文档：Projects</a>，<a href="https://claude.com/blog/projects-redesigned">Projects redesigned: from folder to conversation</a>。</p>
  <h3>什么时候不该用</h3>
  <ul class="pg-prose">
    <li>只是觉得“代码有点丑”，说不出具体问题。</li>
    <li>一行就能顺手改好的小事——直接改就行。</li>
    <li>没把握的猜测。卡片要指向确定的问题。</li>
  </ul>
  <h3>它和另外两种“分活”有什么不同</h3>
  <div class="tablebox"><table>
    <thead><tr><th></th><th>谁启动</th><th>结果回到哪</th><th>适合</th></tr></thead>
    <tbody>
      <tr><td><b>Agent 子代理</b></td><td>Claude 自己</td><td>回到 Claude，这一轮里就用上</td><td class="note">帮当前任务查资料、并行干活</td></tr>
      <tr><td><b>Workflow</b></td><td>Claude（你同意之后）</td><td>回到 Claude</td><td class="note">按脚本编排一大批子代理</td></tr>
      <tr><td><b>spawn_task</b></td><td>你点卡片</td><td>一个新的独立会话</td><td class="note">跟当前任务无关、但值得修的事</td></tr>
    </tbody>
  </table></div>
  <div class="tldr"><p><span class="hl">一句话：</span>前两种是“帮我把这件事做完”，<code>spawn_task</code> 是“这件事以后再说，先记下来交给你”。</p></div>
  <h2 id="s03"><span class="n">03</span>show_widget：把要比较的东西直接摆出来</h2>
  <p class="sub">它管的是“看”。有些东西用文字说半天，不如画出来让你看一眼、点一下。</p>
  <div class="layers">
    <div class="layer"><div class="rank">1</div><div class="body"><div class="t">先读说明书：<code>read_me</code></div><div class="d">拿到聊天界面的配色变量、字体和布局规则。按要画的东西选模块：diagram、mockup、interactive、data_viz、art、chart、elicitation（让你做选择）。平台选 desktop 或 mobile。这一步你看不到。</div></div></div>
    <div class="layer"><div class="rank">2</div><div class="body"><div class="t">再画：<code>show_widget</code></div><div class="d">给它三样东西：<code>widget_code</code>（以 <code>&lt;svg</code> 开头就按图画，否则按网页画）、<code>title</code>（下划线命名，也是下载时的文件名）、<code>loading_messages</code>（画出来之前显示的 1–4 句提示）。</div></div></div>
    <div class="layer"><div class="rank">3</div><div class="body"><div class="t">控件出现在回答旁边</div><div class="d">网页里可以有脚本，等代码全部传完才执行。不写 <code>&lt;html&gt;</code>、<code>&lt;body&gt;</code> 这些外壳；背景透明；颜色用 CSS 变量，所以深色、浅色模式都会跟着变。</div></div></div>
    <div class="layer"><div class="rank">4</div><div class="body"><div class="t">你点，它就收到：<code>sendPrompt(text)</code></div><div class="d">控件里有一个全局函数。调用它，等于你在聊天框里打了这段字并发送。Claude 也能用 <code>read_widget_context</code> 读控件现在的状态。</div></div></div>
  </div>
  <h3>真实例子：这个博客的图标就是这么选出来的</h3>
  <p class="pg-prose">原来标签页上是 Astro 自带的图标。Claude 把一轮候选画成一个可以点的选择器。第一轮都不满意，于是点了“都不要，再出一轮”，还在输入框里补了一句要求。这两样被 <code>sendPrompt</code> 一起发回聊天，Claude 照着出了第二轮，最后选了 K。</p>
  <div class="mock-label">示意：选择器大概长这样</div>
  <div class="widgetmock">
    <div class="q">Favicon：选一个？</div>
    <div class="opts">
      <div class="opt pick"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#1D2A35"/><g fill="none" stroke="#03CE91" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 51V24a9 9 0 0 1 9-9h3"/><path d="M9 31h15"/><path d="M31 37a10 10 0 0 0 21 0"/></g><circle cx="35" cy="26" r="4" fill="#03CE91"/><circle cx="48" cy="26" r="4" fill="#03CE91"/></svg><span>K · fu 笑脸</span></div>
      <div class="opt text"><span>都不要，<br>再出一轮</span></div>
      <div class="opt text"><span>其他：<br>自己写要求</span></div>
    </div>
    <div class="send">点完之后发回聊天的是：<b>Favicon: 都不要，再出一轮 · Favicon (other): include element fu</b></div>
  </div>
  <p class="pg-prose">K 是一个绿色的小写 f，旁边的 u 被画成一张笑脸——“fu”就是 FunFun 的 fu。现在你在浏览器标签上看到的就是它。</p>
  <h3>它和 Artifact 有什么不同</h3>
  <div class="tablebox"><table>
    <thead><tr><th></th><th>show_widget</th><th>Artifact</th></tr></thead>
    <tbody>
      <tr><td><b>在哪</b></td><td>聊天里，回答旁边</td><td>claude.ai 上的一个独立网页，有自己的链接</td></tr>
      <tr><td><b>寿命</b></td><td>跟着这段对话</td><td>一直在，可以更新，可以分享</td></tr>
      <tr><td><b>适合</b></td><td class="note">当场看一眼、当场选</td><td class="note">要留下来、给别人看的成品</td></tr>
      <tr><td><b>怎么回话</b></td><td class="note"><code>sendPrompt</code> 直接把选择发回聊天</td><td class="note">靠评论，或者页面自己声明的能力</td></tr>
    </tbody>
  </table></div>
  <div class="tldr"><p><span class="hl">一句话：</span>要你当场挑，用 <code>show_widget</code>；要留下来给人看，用 Artifact。</p></div>
  <h2 id="s04"><span class="n">04</span>放在一起看</h2>
  <div class="flow">
    <div class="lane aux"><div class="hd">spawn_task · 往外分</div><div class="bd">
      <div class="step">干 A 时看到 B</div><div class="arrow">↓</div>
      <div class="step">B 变成一张卡片</div><div class="arrow">↓</div>
      <div class="step">你点 → 新会话修 B</div>
      <div class="res">A 的改动保持干净</div>
    </div></div>
    <div class="lane good"><div class="hd">show_widget · 往里收</div><div class="bd">
      <div class="step">要你在几样东西里挑</div><div class="arrow">↓</div>
      <div class="step">画成能点的控件</div><div class="arrow">↓</div>
      <div class="step">你点 → 选择发回聊天</div>
      <div class="res">少打字，不会听岔</div>
    </div></div>
  </div>
  <div class="insight"><p><b>共同点：</b>两样都不替你做决定。一个把“要不要修”交给你，一个把“选哪个”交给你。Claude 只负责把选择摆清楚。</p></div>
  <footer class="footer">写于 2026-10-14。依据 Claude Code 桌面版里这两个工具的说明，和一次真实的给博客换图标的过程。两处“示意”是按说明画的样子，不是真截图。</footer>
</div>
