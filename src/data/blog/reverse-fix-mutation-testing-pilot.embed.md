---
author: "Shumin Fu"
pubDatetime: 2026-10-16T13:53:24+08:00
modDatetime: 2026-10-16T02:06:50+08:00
title: "造变异体的方法，决定变异测试能找到什么"
slug: reverse-fix-mutation-testing-pilot
featured: false
draft: false
tags:
  - "testing"
  - "mutation-testing"
  - "ai-agents"
description: "规则工具、大模型、撤回历史修复实测对比：同一套测试换一种造法，得分从 3% 变成 96%；真漏洞主要来自大模型和撤回修复。附四种工具假结果、研究速览和参考文献。"
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
    <div class="kicker">测试研究 · 变异测试 · 三方对比</div>
    <p class="lead">规则工具、大模型、撤回历史修复实测对比：同一套测试，换一种造法，得分从 3% 变成 96%；真漏洞主要来自大模型和撤回修复</p>
    <div class="chips">
      <span class="chip">日期 <b>2026-10-16</b></span>
      <span class="chip">代码 <b>Go 新代码 + Python 老代码</b></span>
      <span class="chip">变异体 <b>385 个有效</b></span>
      <span class="chip warn">工具假结果 <b>4 种</b></span>
    </div>
  </header>
  <div class="verdict">
    <div class="verdict-head">
      <span class="verdict-word">看真漏洞，不看分数</span>
      <span class="verdict-zh">造变异体的方法决定了你能找到什么；分数只在同一种造法下才能比。</span>
    </div>
    <div class="verdict-body">
      <p>测试始终是仓库里现有的那一套，大模型和工具都没写测试，只负责往代码里放假 bug（变异体）。<strong>规则工具</strong>放的假 bug，现有测试几乎全抓住了，得分 96%；<strong>大模型</strong>先读过现有测试，专挑测试看不到的地方放，现有测试几乎全没抓住，得分只有 3%–6%；<strong>撤回历史修复</strong>在两者之间。</p>
      <p>没被抓住的假 bug，正好指出了现有测试的盲区。所以得分最低的大模型那组，反而找到的真漏洞最多。只有撤回修复找回了两个已知漏洞。规则工具最便宜，但留下的大多是边角。另外，两个变异测试工具都给过假结果，不处理会直接得出错误结论。</p>
      <p>这不是说分数没用。同一种造法下，测试补强了，分数会涨，这时分数能反映测试质量。但换了造法，分数比的就是变异体的难度，不是测试。所以评估时该数的是「找到了几个真漏洞」。</p>
    </div>
    <div class="vstats">
      <div class="vstat"><b>96%</b><span>规则工具的得分（Go）</span></div>
      <div class="vstat"><b>28 / 39</b><span>大模型每 100 个变异体找到的真漏洞（Go / Python）</span></div>
      <div class="vstat"><b>2 / 2</b><span>已知漏洞，只有撤回修复找回</span></div>
      <div class="vstat"><b>4</b><span>种工具假结果</span></div>
    </div>
  </div>
  <section>
  <h2>先说清楚：变异测试是在检查测试</h2>
  <div class="pg-prose">
    <p>平时写的单元测试是保安，每天都在岗。<strong>变异测试</strong>是突击检查：故意往代码里放一个小 bug（叫「变异体」），看保安会不会发现。测试变红叫「杀死」，没变红叫「存活」。杀死的比例就是<strong>变异得分</strong>。</p>
    <p>变异测试本身不留在仓库里。它的价值是找出测试没守住的地方，然后你再补一条普通测试。</p>
    <p>这次研究的起因是之前做的一个小试点：我们把 20 个已修 bug 的修复撤回去，看现有测试会不会报警。修复时带了测试的 15 个全部被抓住，没带测试的 4 个只抓住一半。那次的结论讲的其实是「普通测试有没有用」。这次我们把重点放回变异测试本身：<strong>造变异体的方法不同，结论会差多少？</strong></p>
  </div>
  </section>
  <section>
  <h2>三种造变异体的方法</h2>
  <p class="sub">还是那个比方：同一个保安，换三种人去试探他。</p>
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
    <div class="stat"><div class="v">13% – 29%</div><div class="l">规则工具（Py / Go）</div></div>
    <div class="stat warn"><div class="v">29% – 40%</div><div class="l">大模型（Go / Py）</div></div>
    <div class="stat good"><div class="v">3 / 3</div><div class="l">撤回修复：存活的全是真漏洞</div></div>
  </div>
  <h3>已知漏洞找回了几个</h3>
  <div class="tablebox">
    <table>
      <thead><tr><th>方法</th><th>漏洞一：子代理记录证据时记错身份</th><th>漏洞二：删会话等锁没有上限</th></tr></thead>
      <tbody>
        <tr><td>规则工具</td><td class="n">没造出来</td><td class="n">没造出来</td></tr>
        <tr><td>大模型</td><td class="note">不算数：它能读到仓库历史，看到这两处后来补了测试，故意避开了</td><td class="note">同左</td></tr>
        <tr><td>撤回修复</td><td class="y">✓ 存活</td><td class="y">✓ 存活</td></tr>
      </tbody>
    </table>
  </div>
  <h3>三种方法找到的是不是同一批漏洞</h3>
  <div class="pg-prose">
    <ul>
      <li><strong>Go</strong>：规则工具的 2 个真漏洞，大模型都找到了。大模型另外找到 8 个规则工具没碰到的。撤回修复的 2 个，另外两组都没有。去重后共 12 个。</li>
      <li><strong>Python</strong>：规则 6 个、大模型 14 个，只有 1 处重叠。撤回修复唯一存活的那个，和大模型造的某一个是<strong>同一个改动</strong>。去重后共 19 个。</li>
    </ul>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>现有测试在规则工具面前得分最高，但这组找到的真漏洞最少；在大模型面前得分最低，这组找到的真漏洞却最多。变异得分只有在说明了「变异体从哪来」之后才有意义。</p></div>
  </section>
  <section>
  <h2>大模型找到的漏洞长什么样</h2>
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
    <p>大模型的噪声也不少：Go 存活的 34 个里，19 个被判「无关紧要」，多是错误分支和极少走到的组合。所以大模型这组<strong>离不开评审这一步</strong>，否则 34 个存活没法解读。</p>
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
      <div class="d">同一套测试，规则工具 96%，大模型 6%。分数只在同一种造法下才能比：用来看测试改动前后的趋势可以，跨方法比较不行。报分数时要同时说明变异体从哪来。</div></div>
      <div class="tag">度量</div>
    </div>
    <div class="layer l2">
      <div class="rank">2</div>
      <div class="body"><div class="t">规则工具的高分，是「便宜变异体」的高分</div>
      <div class="d">测试写得密的代码，简单的运算符翻转几乎都会被抓住。Go 那组留下的 7 个里，3 个只改了一个最后会被丢弃的返回值。</div></div>
      <div class="tag">规则</div>
    </div>
    <div class="layer l3">
      <div class="rank">3</div>
      <div class="body"><div class="t">大模型先看测试再造，命中最高，噪声也多</div>
      <div class="d">得分低是设计使然：它专挑测试抓不住的地方下手。存活的里约 30%–40% 是真漏洞，剩下的要靠评审筛。</div></div>
      <div class="tag">大模型</div>
    </div>
    <div class="layer l1">
      <div class="rank">4</div>
      <div class="body"><div class="t">撤回修复最准，但会随时间衰减</div>
      <div class="d">存活即真漏洞，也是唯一能找回「已经出过的 bug」的方法。代价是移植：Go 同一天密集修的 10 个只有 1 个能自动撤回，Python 老代码 30 个只有 3 个。大模型按意思移植后，25 个全部可用。</div></div>
      <div class="tag">撤回修复</div>
    </div>
    <div class="layer l1">
      <div class="rank">5</div>
      <div class="body"><div class="t">独立评审必不可少，而且可以校准</div>
      <div class="d">把已知漏洞混进去检验评审。没有这一步，大模型那组的结果没法解读。</div></div>
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
      <li>大模型能读到仓库历史，所以「已知漏洞召回」这一项对它无效。下次要在看不到后续提交的代码上生成。</li>
      <li>「真漏洞」是评审的判断，不是线上真的出过的 bug（撤回修复组除外）。</li>
    </ul>
  </div>
  <div class="tldr"><p><span class="hl">一句话：</span>规则工具适合当便宜的底线，大模型适合找新漏洞，撤回修复适合守住「修过的不再坏」。三者互补，不能互相替代。用任何一个之前，先确认工具给的结果是真的。</p></div>
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
    <div>数据来自一次内部实验：Go 与 Python 混合代码库，2026-10。</div>
  </footer>
<!-- theme toggle: light is default; follows OS preference until the viewer clicks.
     Inline (not external) — keep this behavior in generated reports. -->
<!-- TOC scrollspy: highlights the section near the top in the .toc. Inline, self-
     contained. No-ops harmlessly if you deleted the TOC or the h2 ids. -->
</div>
