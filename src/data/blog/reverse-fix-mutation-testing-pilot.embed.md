---
author: "Shumin Fu"
pubDatetime: 2026-10-16T13:53:24+08:00
modDatetime: 2026-10-16T02:34:52+08:00
title: "造变异体的方法，决定变异测试能找到什么"
slug: reverse-fix-mutation-testing-pilot
featured: false
draft: false
tags:
  - "testing"
  - "mutation-testing"
  - "ai-agents"
description: "规则工具、大模型、撤回历史修复三种造变异体的方法实测对比：同一套测试，得分从 3% 变成 96%；真漏洞主要靠大模型造的变异体和撤回的历史修复找到。附四种工具假结果、研究速览和参考文献。"
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
.html-embed section > h3{margin:30px 0 10px}
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
.html-embed .verdict-body ul{margin:4px 0 10px;padding-left:20px;list-style:disc}
.html-embed .verdict-body li{margin:3px 0}
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
.html-embed .defquote{margin:14px 0 4px;padding:4px 0 4px 16px;border-left:2px solid var(--accent);color:var(--ink-2)}
.html-embed .defquote p{margin:6px 0}
.html-embed .defquote .src{font-size:13px;color:var(--ink-3)}
.html-embed .fig{margin:16px 0 6px}
.html-embed .fig img{display:block;width:100%;height:auto;border-radius:var(--rp);border:1px solid var(--line)}
.html-embed .fig figcaption{font-size:13px;color:var(--ink-3);margin-top:8px;line-height:1.6}
.html-embed .mflow{display:flex;flex-wrap:wrap;align-items:stretch;gap:8px;margin:14px 0 6px}
.html-embed .mflow .st{flex:1 1 120px;border:1px solid var(--line);background:var(--surface);border-radius:var(--rp);padding:10px 12px;font-size:13.5px;line-height:1.5}
.html-embed .mflow .st b{display:block;font-size:12px;color:var(--ink-3);font-weight:600;margin-bottom:2px}
.html-embed .mflow .ar{align-self:center;color:var(--ink-3);font-size:18px}
.html-embed .mflow .out{flex:1 1 200px;display:grid;gap:8px}
.html-embed .mflow .out .st.k{border-color:var(--grn-line);background:var(--grnbg)}
.html-embed .mflow .out .st.s{border-color:var(--amb-line);background:var(--ambbg)}
.html-embed .charts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0 4px}
@media (max-width:640px){.html-embed .charts{grid-template-columns:1fr}}
.html-embed .chart{border:1px solid var(--line);background:var(--surface);border-radius:var(--rp);padding:10px 10px 4px}
.html-embed .chart .ct{font-size:13.5px;font-weight:650;margin:2px 4px 4px}
.html-embed .chart svg{display:block;width:100%;height:auto}
.html-embed .chart .gl{stroke:var(--line-soft);stroke-width:1}
.html-embed .chart .ax{fill:var(--ink-3);font-size:11px}
.html-embed .chart .xl{fill:var(--ink-2);font-size:12px}
.html-embed .chart .go{stroke:var(--accent);fill:none;stroke-width:2.5}
.html-embed .chart .py{stroke:var(--amb);fill:none;stroke-width:2.5;stroke-dasharray:6 4}
.html-embed .chart .gop{fill:var(--accent)}
.html-embed .chart .pyp{fill:var(--amb)}
.html-embed .chart .gov{fill:var(--accent-ink);font-size:11.5px;font-weight:650}
.html-embed .chart .pyv{fill:var(--amb);font-size:11.5px;font-weight:650}
.html-embed .chart .hl{fill:var(--amb);opacity:.08}
.html-embed .legend{display:flex;gap:16px;font-size:12.5px;color:var(--ink-2);margin:6px 2px 0}
.html-embed .legend i{display:inline-block;width:22px;height:0;border-top:2.5px solid var(--accent);vertical-align:middle;margin-right:6px}
.html-embed .legend i.py{border-top:2.5px dashed var(--amb)}
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
    <div class="kicker">测试研究 · 变异测试 · 三方对比</div>
    <p class="lead">规则工具、大模型、撤回历史修复实测对比：同一套测试，换一种造法，得分从 3% 变成 96%；真漏洞主要靠大模型造的变异体和撤回的历史修复找到</p>
    <div class="chips">
      <span class="chip">日期 <b>2026-10-16</b></span>
      <span class="chip">代码 <b>Go 新代码 + Python 老代码</b></span>
      <span class="chip">变异体 <b>385 个有效</b></span>
      <span class="chip warn">工具假结果 <b>4 种</b></span>
    </div>
  </header>
  <div class="verdict">
    <div class="verdict-head">
      <span class="verdict-word">想找测试漏洞，让大模型造变异体</span>
      <span class="verdict-zh">想守住修过的 bug，撤回历史修复当变异体；规则工具造的变异体只适合当便宜的底线。</span>
    </div>
    <div class="verdict-body">
      <p><strong>我们做了什么：</strong>变异测试是故意往代码里放假 bug（变异体），看现有测试能不能发现，没被发现的就是测试的漏洞。假 bug 有三种造法：<strong>规则工具</strong>机械地改符号，<strong>大模型</strong>先读测试再挑盲区下手，<strong>撤回历史修复</strong>把以前修好的 bug 放回去。我们拿同一套现有测试（Go 新代码 + Python 老代码），三种造法各跑一遍。</p>
      <p><strong>发现：</strong></p>
      <ul>
        <li>大模型造的变异体最能找到真漏洞：每 100 个里有 28 个（Go）和 39 个（Python）指出了真漏洞。</li>
        <li>撤回历史修复得到的变异体，是唯一找回两个已知漏洞的；但代码一变，修复就很难撤回去。</li>
        <li>规则工具在 Go 上造了 178 个变异体，只有 2 个指出了真漏洞。</li>
        <li>同一套测试，对规则工具造的变异体得分 96%，对大模型造的变异体只有 3%–6%。测试没变，变的是变异体的难度。</li>
        <li>两个变异测试工具都给过假结果，不处理会得出错误结论。</li>
      </ul>
      <p><strong>结论：</strong>想找测试的盲区，让大模型造变异体；想守住修过的 bug 不再坏，撤回历史修复当变异体；规则工具造变异体便宜，适合当底线。比较造法时数真漏洞，不要比分数；分数只适合在同一种造法下看前后变化。</p>
    </div>
    <div class="vstats">
      <div class="vstat"><b>28 / 39</b><span>大模型造的每 100 个变异体里，指出真漏洞的个数（Go / Python）</span></div>
      <div class="vstat"><b>2 / 2</b><span>已知漏洞，只有撤回修复造的变异体找回</span></div>
      <div class="vstat"><b>96% vs 3%</b><span>同一套测试的得分，只因造法不同</span></div>
      <div class="vstat"><b>4</b><span>种工具假结果</span></div>
    </div>
  </div>
  <section>
  <h2>先说清楚：变异测试是在检查测试</h2>
  <div class="pg-prose">
    <p>平时写的单元测试是保安，每天都在岗。<strong>变异测试</strong>是突击检查：故意往代码里放一个小 bug（叫「变异体」），看保安会不会发现。测试变红叫「杀死」，没变红叫「存活」。杀死的比例就是<strong>变异得分</strong>。</p>
    <div class="mflow" role="img" aria-label="变异测试流程：放进一个假 bug，跑现有测试，变红是杀死，没变红是存活">
      <div class="st"><b>① 造</b>往代码里放一个假 bug（变异体），比如把 <code>&gt;</code> 改成 <code>&gt;=</code></div>
      <div class="ar">→</div>
      <div class="st"><b>② 跑</b>不改测试，跑仓库里现有的那套测试</div>
      <div class="ar">→</div>
      <div class="out">
        <div class="st k"><b>测试变红 = 杀死</b>测试守住了这里</div>
        <div class="st s"><b>测试没变红 = 存活</b>测试的盲区 → 判一下是不是真漏洞，是就补一条测试</div>
      </div>
    </div>
    <blockquote class="defquote">
      <p>变异得分（mutation score）= 被杀死的变异体数 ÷（变异体总数 − 等价变异体数）。它衡量的是测试集发现这批变异体的能力。</p>
      <p class="src">— 定义见 Jia &amp; Harman 的变异测试综述 <a href="#r18">[18]</a>；该定义可追溯到 DeMillo、Lipton、Sayward 1978 年提出变异测试时的说法。</p>
    </blockquote>
    <p>注意分母里是「这批变异体」。定义本身就说明了：分数是测试和变异体两方面一起决定的。研究也发现，扣掉测试集大小这个因素以后，变异得分和发现真实 bug 的能力只是弱相关 <a href="#r2">[2]</a>。</p>
    <p>本文的算法稍有不同：分母用的是「有效变异体」（能编译、能跑的），没有先扣掉等价变异体。原因是等价要逐个人工判定，我们只对存活的做了判定。所以表里的得分比按定义算的略低。比如 Go 规则组扣掉 3 个等价后是 171 ÷ 175 ≈ 98%。</p>
    <p>变异测试本身不留在仓库里。它的价值是找出测试没守住的地方，然后你再补一条普通测试。</p>
    <p>这次研究的起因是之前做的一个小试点：我们把 20 个已修 bug 的修复撤回去，看现有测试会不会报警。修复时带了测试的 15 个全部被抓住，没带测试的 4 个只抓住一半。那次的结论讲的其实是「普通测试有没有用」。这次我们把重点放回变异测试本身：<strong>造变异体的方法不同，结论会差多少？</strong></p>
  </div>
  </section>
  <section>
  <h2>三种造变异体的方法</h2>
  <p class="sub">还是那个比方：同一个保安，换三种人去试探他。</p>
  <figure class="fig">
    <img src="data:image/webp;base64,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" width="960" height="540" decoding="async" alt="夜间博物馆里一名保安守着展柜，三个闯入者用不同方式试探他：左边一个随手碰倒东西，中间一个躲在柱子后观察保安，右边一个照着旧图纸重演以前的盗窃">
    <figcaption>左：随手乱挪的人（规则工具）。中：躲在柱子后先看保安站位的人（大模型）。右：照着旧案图纸再偷一次的人（撤回历史修复）。保安始终是同一个——仓库里现有的测试。</figcaption>
  </figure>
  <div class="grid g3">
    <div class="card">
      <h3><span class="pill blu">规则工具</span>随手乱挪</h3>
      <p>工具按固定规则改代码：<code>==</code> 改成 <code>!=</code>，<code>&amp;&amp;</code> 改成 <code>||</code>，<code>continue</code> 改成 <code>break</code>。量大、便宜、全自动。Go 用 <code>gremlins</code>，Python 用 <code>mutmut</code>。</p>
    </div>
    <div class="card">
      <h3><span class="pill pur">大模型</span>先看站位再下手</h3>
      <p>把代码和相关测试一起交给大模型，让它造「它认为现有测试抓不住」的真实型 bug，比如写错 ID、少个保护条件、状态记错。参考 2026 年 test-aware 变异的做法。每个文件 12 个。</p>
    </div>
    <div class="card">
      <h3><span class="pill grn">撤回修复</span>照旧案再偷一次</h3>
      <p>把历史上的 bug 修复反向打回去，得到的是一个真实发生过的 bug。打不上的（代码已经变了），交给大模型按意思移植成最小补丁。</p>
    </div>
  </div>
  </section>
  <section>
  <h2>实验怎么做</h2>
  <div class="grid g2">
    <div class="phase">
      <div class="ph">两段代码</div>
      <ul>
        <li><b>Go 新代码</b>：一个上下文引擎包里修 bug 最多的 3 个文件，约 1,230 行，2026 年 7 月才写的。包内测试跑一遍约 27 秒。</li>
        <li><b>Python 老代码</b>：定时任务调度模块的 3 个文件，约 1,890 行，2025 年 12 月就有了，修过 30 次。相关测试 236 条，跑一遍约 5 秒。</li>
        <li>基线选在补测试<b>之前</b>的提交，所以试点里发现的两个已知漏洞还在，可以当标准答案。</li>
      </ul>
    </div>
    <div class="phase">
      <div class="ph">怎么判定</div>
      <ul>
        <li>只认<b>具名测试失败</b>或测试超时算杀死；编译、导入失败记「无效」。</li>
        <li>每个存活的变异体交给一个<b>独立评审</b>（另一个大模型 agent），它不知道变异体是谁造的、也不知道生成方的预测，分成三类：<b>真漏洞</b>、<b>无关紧要</b>、<b>等价</b>（行为没变）。</li>
        <li><b>评审校准</b>：把两个已知漏洞混在存活变异体里，不告诉评审。它两个都判成了「真漏洞，高置信」。</li>
      </ul>
    </div>
  </div>
  </section>
  <section>
  <h2>结果</h2>
  <p class="sub">先看形状：同一套测试，两张图里的线几乎上下颠倒。得分在「大模型造的变异体」这一格掉到谷底，真漏洞恰恰在这一格冲到最高。</p>
  <div class="charts"><div class="chart"><div class="ct">变异得分（越高 = 现有测试抓住得越多）</div><svg viewBox="0 0 340 230" role="img" aria-label="变异得分（越高 = 现有测试抓住得越多）"><rect class="hl" x="143.0" y="10" width="68" height="174" rx="4"/><line class="gl" x1="36" x2="320" y1="184.0" y2="184.0"/><text class="ax" x="30" y="188.0" text-anchor="end">0</text><line class="gl" x1="36" x2="320" y1="143.5" y2="143.5"/><text class="ax" x="30" y="147.5" text-anchor="end">25</text><line class="gl" x1="36" x2="320" y1="103.0" y2="103.0"/><text class="ax" x="30" y="107.0" text-anchor="end">50</text><line class="gl" x1="36" x2="320" y1="62.5" y2="62.5"/><text class="ax" x="30" y="66.5" text-anchor="end">75</text><line class="gl" x1="36" x2="320" y1="22.0" y2="22.0"/><text class="ax" x="30" y="26.0" text-anchor="end">100</text><text class="xl" x="54.0" y="222" text-anchor="middle">规则工具</text><text class="xl" x="177.0" y="222" text-anchor="middle">大模型</text><text class="xl" x="300.0" y="222" text-anchor="middle">撤回修复</text><polyline class="go" points="54.0,28.5 177.0,174.3 300.0,54.4"/><polyline class="py" points="54.0,93.3 177.0,179.1 300.0,30.1"/><circle class="gop" cx="54.0" cy="28.5" r="3.5"/><text class="gov" x="54.0" y="19.5" text-anchor="middle">96%</text><circle class="gop" cx="177.0" cy="174.3" r="3.5"/><text class="gov" x="177.0" y="165.3" text-anchor="middle">6%</text><circle class="gop" cx="300.0" cy="54.4" r="3.5"/><text class="gov" x="300.0" y="71.4" text-anchor="middle">80%</text><circle class="pyp" cx="54.0" cy="93.3" r="3.5"/><text class="pyv" x="54.0" y="110.3" text-anchor="middle">56%</text><circle class="pyp" cx="177.0" cy="179.1" r="3.5"/><text class="pyv" x="177.0" y="196.1" text-anchor="middle">3%</text><circle class="pyp" cx="300.0" cy="30.1" r="3.5"/><text class="pyv" x="300.0" y="21.1" text-anchor="middle">95%</text></svg></div><div class="chart"><div class="ct">每 100 个变异体里的真漏洞（越高 = 越能找出盲区）</div><svg viewBox="0 0 340 230" role="img" aria-label="每 100 个变异体里的真漏洞（越高 = 越能找出盲区）"><rect class="hl" x="143.0" y="10" width="68" height="174" rx="4"/><line class="gl" x1="36" x2="320" y1="184.0" y2="184.0"/><text class="ax" x="30" y="188.0" text-anchor="end">0</text><line class="gl" x1="36" x2="320" y1="143.5" y2="143.5"/><text class="ax" x="30" y="147.5" text-anchor="end">10</text><line class="gl" x1="36" x2="320" y1="103.0" y2="103.0"/><text class="ax" x="30" y="107.0" text-anchor="end">20</text><line class="gl" x1="36" x2="320" y1="62.5" y2="62.5"/><text class="ax" x="30" y="66.5" text-anchor="end">30</text><line class="gl" x1="36" x2="320" y1="22.0" y2="22.0"/><text class="ax" x="30" y="26.0" text-anchor="end">40</text><text class="xl" x="54.0" y="222" text-anchor="middle">规则工具</text><text class="xl" x="177.0" y="222" text-anchor="middle">大模型</text><text class="xl" x="300.0" y="222" text-anchor="middle">撤回修复</text><polyline class="go" points="54.0,179.5 177.0,70.6 300.0,103.0"/><polyline class="py" points="54.0,160.9 177.0,26.1 300.0,162.5"/><circle class="gop" cx="54.0" cy="179.5" r="3.5"/><text class="gov" x="54.0" y="196.5" text-anchor="middle">1.1</text><circle class="gop" cx="177.0" cy="70.6" r="3.5"/><text class="gov" x="177.0" y="87.6" text-anchor="middle">28</text><circle class="gop" cx="300.0" cy="103.0" r="3.5"/><text class="gov" x="300.0" y="94.0" text-anchor="middle">20</text><circle class="pyp" cx="54.0" cy="160.9" r="3.5"/><text class="pyv" x="54.0" y="151.9" text-anchor="middle">5.7</text><circle class="pyp" cx="177.0" cy="26.1" r="3.5"/><text class="pyv" x="177.0" y="17.1" text-anchor="middle">39</text><circle class="pyp" cx="300.0" cy="162.5" r="3.5"/><text class="pyv" x="300.0" y="179.5" text-anchor="middle">5.3</text></svg></div></div>
  <div class="legend"><span><i></i>Go 新代码</span><span><i class="py"></i>Python 老代码</span></div>
  <p class="sub" style="margin:10px 0 14px">分数低说明测试没抓住，没抓住的正是要找的盲区，所以两条线反着走。下表是完整数字。</p>
  <div class="tablebox">
    <table>
      <thead><tr><th>组</th><th>有效</th><th>杀死</th><th>存活</th><th>真漏洞</th><th>无关紧要</th><th>等价</th><th>变异得分</th><th>每 100 个的真漏洞</th></tr></thead>
      <tbody>
        <tr><td>Go · 规则</td><td>178</td><td>171</td><td>7</td><td class="n">2</td><td>2</td><td>3</td><td>96%</td><td>1.1</td></tr>
        <tr><td>Go · 大模型</td><td>36</td><td>2</td><td>34</td><td class="n">10</td><td>19</td><td>5</td><td>6%</td><td><b>28</b></td></tr>
        <tr><td>Go · 撤回修复</td><td>10</td><td>8</td><td>2</td><td class="n">2</td><td>0</td><td>0</td><td>80%</td><td>20</td></tr>
        <tr><td>Py · 规则（抽样）</td><td>106</td><td>59</td><td>47</td><td class="n">6</td><td>29</td><td>12</td><td>56%</td><td>5.7</td></tr>
        <tr><td>Py · 大模型</td><td>36</td><td>1</td><td>35</td><td class="n">14</td><td>9</td><td>12</td><td>3%</td><td><b>39</b></td></tr>
        <tr><td>Py · 撤回修复</td><td>19</td><td>18</td><td>1</td><td class="n">1</td><td>0</td><td>0</td><td>95%</td><td>5.3</td></tr>
      </tbody>
    </table>
  </div>
  <p class="sub" style="margin-top:10px">Python 规则组是从 <code>mutmut</code> 造的 885 个里按文件各抽 40 个。Python 撤回修复组：30 个修复里自动撤回 3 个、移植 16 个，另 11 个牵涉已删除的代码，没有做。</p>
  <h3>存活的里面，有多少是真漏洞</h3>
  <div class="grid g3">
    <div class="stat"><div class="v">13% – 29%</div><div class="l">规则工具造的变异体（Py / Go）</div></div>
    <div class="stat warn"><div class="v">29% – 40%</div><div class="l">大模型造的变异体（Go / Py）</div></div>
    <div class="stat good"><div class="v">3 / 3</div><div class="l">撤回修复造的变异体：存活的全是真漏洞</div></div>
  </div>
  <h3>已知漏洞找回了几个</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>方法</th><th>漏洞一：子代理记录证据时记错身份</th><th>漏洞二：删会话等锁没有上限</th></tr></thead>
      <tbody>
        <tr><td>规则工具造的</td><td class="n">没造出来</td><td class="n">没造出来</td></tr>
        <tr><td>大模型造的</td><td class="note">不算数：大模型能读到仓库历史，看到这两处后来补了测试，故意避开了</td><td class="note">同左</td></tr>
        <tr><td>撤回修复造的</td><td class="y">✓ 存活</td><td class="y">✓ 存活</td></tr>
      </tbody>
    </table>
  </div>
  <h3>三种方法找到的是不是同一批漏洞</h3>
  <div class="pg-prose">
    <ul>
      <li><strong>Go</strong>：规则工具造的变异体指出的 2 个真漏洞，大模型造的变异体也都指出了；大模型造的另外指出 8 个规则工具没碰到的。撤回修复组的 2 个，另外两组都没有。去重后共 12 个。</li>
      <li><strong>Python</strong>：规则组 6 个、大模型组 14 个，只有 1 处重叠。撤回修复组唯一存活的那个，和大模型造的某一个变异体是<strong>同一个改动</strong>。去重后共 19 个。</li>
    </ul>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>现有测试对规则工具造的变异体得分最高，但这组指出的真漏洞最少；对大模型造的变异体得分最低，这组指出的真漏洞却最多。变异得分只有在说明了「变异体从哪来」之后才有意义。</p></div>
  </section>
  <section>
  <h2>大模型造的变异体指出了哪些漏洞</h2>
  <p class="sub">挑几个评审判为高置信的，只描述行为。</p>
  <div class="tablebox">
    <table>
      <thead><tr><th>改动</th><th>后果</th></tr></thead>
      <tbody>
        <tr><td>中止判断里多加了一个「结果为空」的条件</td><td class="note">被中止的定时任务又会被记成「成功」。代码注释里记着，这正是一次线上事故的形状。</td></tr>
        <tr><td>执行锁按「任务」而不是按「员工」</td><td class="note">同一个员工的两个定时任务会并发执行，违背文档约定的串行。</td></tr>
        <tr><td>重新注册任务时不更新会话 ID</td><td class="note">改过会话的任务继续往旧会话发。撤回修复组也撞到了同一处。</td></tr>
        <tr><td>证据工具去掉等锁的 3 秒上限</td><td class="note">后台重建期间，一轮对话会一直卡着。</td></tr>
        <tr><td>已核实的证据走进默认分支</td><td class="note">模型被告知「已记为推测」，拿到错误引导。规则工具也翻出了这一处。</td></tr>
      </tbody>
    </table>
  </div>
  <div class="pg-prose" style="margin-top:14px">
    <p>大模型造的变异体噪声也不少：Go 存活的 34 个里，19 个被判「无关紧要」，多是错误分支和极少走到的组合。所以大模型组<strong>离不开评审这一步</strong>，否则 34 个存活没法解读。</p>
  </div>
  </section>
  <section>
  <h2>工具的坑：四种假结果</h2>
  <p class="sub">这一节比上面的数字更重要。每一种不处理，都会直接得出错误结论。</p>
  <div class="tablebox">
    <table>
      <thead><tr><th>现象</th><th>看上去像</th><th>实际是</th><th>怎么防</th></tr></thead>
      <tbody>
        <tr>
          <td><code>gremlins</code> 6 秒跑完 160 个，全部杀死</td>
          <td class="note">测试很强</td>
          <td class="note">它把代码复制到临时目录跑，<code>go.mod</code> 里用相对路径替换的本地依赖找不到，<b>每次都编译失败</b>，被算成杀死</td>
          <td class="note">耗时不合理就是假的。实验副本里把替换改成绝对路径</td>
        </tr>
        <tr>
          <td><code>gremlins</code> 报 19 个「没有覆盖」，不跑</td>
          <td class="note">这些行没测试</td>
          <td class="note"><code>switch</code> 里 <code>case</code> 后面的条件不进 Go 覆盖率统计，这些行其实<b>每次都跑</b>。补跑后 11 个杀死、7 个存活</td>
          <td class="note">「没覆盖」的要看是不是 <code>case</code> 条件，必要时自己生成补丁跑</td>
        </tr>
        <tr>
          <td><code>mutmut</code> 2.5.1 跑了 291 个，<b>全部存活</b></td>
          <td class="note">测试很弱</td>
          <td class="note">同一个变异体手动跑，测试是红的。问题在工具调度，不在测试</td>
          <td class="note">只用它造变异体，用自己验证过的脚本跑</td>
        </tr>
        <tr>
          <td>自己的脚本把一个变异体判成存活</td>
          <td class="note">发现了新漏洞</td>
          <td class="note">测试<b>卡死</b>，跑满 10 分钟超时，输出里没有「测试失败」那一行</td>
          <td class="note">超时单独记一类，算作检测到</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="insight" style="margin-top:14px"><p><b>规则：</b>全杀死和全存活一样可疑，先怀疑工具。只认具名测试失败；耗时、计数和日志对不上时，手动复现一个再说。</p></div>
  </section>
  <section>
  <h2>关于变异测试，学到了什么</h2>
  <div class="layers">
    <div class="layer l2">
      <div class="rank">1</div>
      <div class="body"><div class="t">变异得分不能跨方法比较</div>
      <div class="d">同一套测试，对规则工具造的变异体得分 96%，对大模型造的只有 6%。分数只在同一种造法下才能比：用来看测试改动前后的趋势可以，跨方法比较不行。报分数时要同时说明变异体从哪来。</div></div>
      <div class="tag">度量</div>
    </div>
    <div class="layer l2">
      <div class="rank">2</div>
      <div class="body"><div class="t">规则工具造的变异体得分高，因为它们便宜好抓</div>
      <div class="d">测试写得密的代码，简单的运算符翻转几乎都会被抓住。Go 那组留下的 7 个里，3 个只改了一个最后会被丢弃的返回值。</div></div>
      <div class="tag">规则</div>
    </div>
    <div class="layer l3">
      <div class="rank">3</div>
      <div class="body"><div class="t">大模型先看测试再造变异体，指出真漏洞最多，噪声也多</div>
      <div class="d">得分低是设计使然：它专挑测试抓不住的地方下手。存活的里约 30%–40% 是真漏洞，剩下的要靠评审筛。</div></div>
      <div class="tag">大模型</div>
    </div>
    <div class="layer l1">
      <div class="rank">4</div>
      <div class="body"><div class="t">撤回修复造的变异体最准，但会随时间衰减</div>
      <div class="d">存活即真漏洞，也是唯一能找回「已经出过的 bug」的方法。代价是移植：Go 同一天密集修的 10 个只有 1 个能自动撤回，Python 老代码 30 个只有 3 个。大模型按意思移植后，25 个全部可用。</div></div>
      <div class="tag">撤回修复</div>
    </div>
    <div class="layer l1">
      <div class="rank">5</div>
      <div class="body"><div class="t">独立评审必不可少，而且可以校准</div>
      <div class="d">把已知漏洞混进去检验评审。没有这一步，大模型组的结果没法解读。</div></div>
      <div class="tag">评审</div>
    </div>
  </div>
  </section>
  <section>
  <h2>成本</h2>
  <div class="tablebox">
    <table>
      <thead><tr><th>环节</th><th>大致量</th></tr></thead>
      <tbody>
        <tr><td>规则工具 · Go 全量</td><td class="note">约 3 分钟（2 个并行）。被杀死的大多很快就失败退出</td></tr>
        <tr><td>规则工具 · Python 抽样 120 个</td><td class="note">约 15 分钟</td></tr>
        <tr><td>大模型造变异体</td><td class="note">每种语言 36 个，约 16–18 万 token，4–6 分钟</td></tr>
        <tr><td>移植撤不回去的修复</td><td class="note">Go 9 个约 15 万 token，Python 16 个约 17 万 token</td></tr>
        <tr><td>独立评审</td><td class="note">每批存活约 11–15 万 token</td></tr>
        <tr><td>跑存活的变异体</td><td class="note">存活的要跑满整套测试：Go 每个 30–50 秒，一次卡死跑满 10 分钟</td></tr>
      </tbody>
    </table>
  </div>
  <p class="sub" style="margin-top:10px">评审的工作量和存活数成正比。规则工具在 Python 上抽 120 个就要判 47 个，其中大部分无关紧要。</p>
  </section>
  <section>
  <h2>怎么用到日常流程</h2>
  <div class="grid g3">
    <div class="phase">
      <div class="ph">PR 上 · 规则工具</div>
      <ul>
        <li>只跑改动的文件，当便宜的底线。</li>
        <li>注意 <code>case</code> 条件的「没覆盖」和相对路径依赖这两个坑。</li>
      </ul>
    </div>
    <div class="phase">
      <div class="ph">高风险改动 · 大模型</div>
      <ul>
        <li>让大模型先看测试，再造 3–5 个变异体。</li>
        <li>存活的交给独立评审，只把「真漏洞」给作者看。</li>
      </ul>
    </div>
    <div class="phase">
      <div class="ph">修 bug 时 · 撤回修复</div>
      <ul>
        <li>当场撤掉修复，确认新测试会红。越晚越撤不回去。</li>
        <li>定期抽查修复时没带测试的那些。</li>
      </ul>
    </div>
  </div>
  </section>
  <section>
  <h2>局限</h2>
  <div class="pg-prose">
    <ul>
      <li>每种语言只有 3 个文件；Python 规则组是抽样。</li>
      <li>造变异体的和评审的是同一类模型，可能有共同的偏好；评审只用两个已知漏洞校准过。</li>
      <li>造变异体的大模型能读到仓库历史，所以「已知漏洞召回」这一项对大模型组无效。下次要在看不到后续提交的代码上生成。</li>
      <li>「真漏洞」是评审的判断，不是线上真的出过的 bug（撤回修复组除外）。</li>
    </ul>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>规则工具造的变异体适合当便宜的底线，大模型造的适合找新漏洞，撤回修复适合守住「修过的不再坏」。三者互补，不能互相替代。用任何一个之前，先确认工具给的结果是真的。</p></div>
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
    <li id="r18">Jia, Harman. <a href="https://doi.org/10.1109/TSE.2010.62">An Analysis and Survey of the Development of Mutation Testing</a>. IEEE Transactions on Software Engineering 37(5), 2011.</li>
  </ol>
  </section>
  <footer class="footer">
    <div>数据来自一次内部实验：Go 与 Python 混合代码库，2026-10。</div>
  </footer>
<!-- theme toggle: light is default; follows OS preference until the viewer clicks.
     Inline (not external) — keep this behavior in generated reports. -->
<!-- TOC scrollspy: highlights the section near the top in the .toc. Inline, self-
     contained. No-ops harmlessly if you deleted the TOC or the h2 ids. -->
</div>
