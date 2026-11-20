---
title: "看板与 Scrum"
description: "用可以点的看板和冲刺模拟器，讲清看板与 Scrum 的区别和怎么选"
growth: seedling
planted: 2026-11-20T12:49:14+08:00
draft: false
tags:
  - "agile"
  - "kanban"
  - "scrum"
---

<style>
.html-embed{display:block}
.html-embed :where(h1,h2,h3,h4){font-style:normal}
.html-embed :where(th,td){border:0}
.html-embed :where(code)::before,.html-embed :where(code)::after{content:none}
.html-embed :where(ul,ol){list-style:revert}
.html-embed{--bg:#eef1f4; --surface:#ffffff; --ink:#1c2430; --muted:#535e6e; --line:#d5dbe3; --kan:#0b6e64; --kan-soft:#d6f0ec; --scr:#4b55c9; --scr-soft:#e0e3fa; --note:#fff3b8; --note-ink:#3d3412; --hot:#b2321d; --hot-soft:#fbe1dc; --f-cn:"Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif; --f-num:"Space Grotesk","Noto Sans SC",system-ui,sans-serif;}
html[data-theme="dark"] .html-embed{--bg:#12161c; --surface:#1b2129; --ink:#e7ebf0; --muted:#9aa5b4; --line:#2e3742; --kan:#3cc4b5; --kan-soft:#173a37; --scr:#8d95f2; --scr-soft:#262a52; --note:#4a4220; --note-ink:#fbefc0; --hot:#ff7a62; --hot-soft:#45231d; color-scheme:dark}
html[data-theme="dark"] .html-embed{--bg:#12161c; --surface:#1b2129; --ink:#e7ebf0; --muted:#9aa5b4; --line:#2e3742; --kan:#3cc4b5; --kan-soft:#173a37; --scr:#8d95f2; --scr-soft:#262a52; --note:#4a4220; --note-ink:#fbefc0; --hot:#ff7a62; --hot-soft:#45231d; color-scheme:dark}
.html-embed *{box-sizing:border-box}
.html-embed{background:var(--bg);color:var(--ink);font-family:var(--f-cn);font-size:16px;line-height:1.7; padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:40px 64px}
.html-embed .wrap{max-width:1040px;margin:0 auto;display:grid;gap:56px}
.html-embed h1,.html-embed h2,.html-embed h3{text-wrap:balance;margin:0;line-height:1.3}
.html-embed h1{font-size:clamp(30px,5vw,46px);font-weight:900;letter-spacing:-.01em}
.html-embed h2{font-size:clamp(22px,3vw,28px);font-weight:700}
.html-embed h3{font-size:18px;font-weight:700}
.html-embed p{margin:0;max-width:65ch}
.html-embed .eyebrow{font-family:var(--f-num);font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.html-embed .k{color:var(--kan)}
.html-embed .s{color:var(--scr)}
.html-embed section{display:grid;gap:20px}
.html-embed .lead{font-size:18px;color:var(--muted)}
.html-embed .hero{display:grid;gap:18px}
.html-embed .bottom{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.html-embed .pill{border-radius:14px;padding:18px 20px;display:grid;gap:6px}
.html-embed .pill.k{background:var(--kan-soft);color:var(--ink)}
.html-embed .pill.s{background:var(--scr-soft);color:var(--ink)}
.html-embed .pill b{font-size:20px}
.html-embed .pill.k b{color:var(--kan)}
.html-embed .pill.s b{color:var(--scr)}
.html-embed .pill .pic{font-size:15px;color:var(--muted)}
.html-embed .boards{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.html-embed .board{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px;display:grid;gap:14px;min-width:0;align-content:start}
.html-embed .board header{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.html-embed .board.kb header h3{color:var(--kan)}
.html-embed .board.sb header h3{color:var(--scr)}
.html-embed .stat{font-family:var(--f-num);font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.html-embed .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.html-embed .col{background:var(--bg);border-radius:10px;padding:8px;min-height:190px;display:flex;flex-direction:column;gap:6px;min-width:0;transition:box-shadow .2s}
.html-embed .col .colh{margin:0 0 2px;font-size:13px;font-weight:700;display:flex;justify-content:space-between;color:var(--muted)}
.html-embed .col .colh .lim{font-family:var(--f-num);font-variant-numeric:tabular-nums}
.html-embed .col.full{box-shadow:inset 0 0 0 2px var(--hot)}
.html-embed .col.full .colh .lim{color:var(--hot)}
.html-embed .sticky{background:var(--note);color:var(--note-ink);border-radius:6px;padding:6px 8px;font-size:13px;line-height:1.4; box-shadow:0 1px 0 rgba(0,0,0,.08);animation:pop .25s ease}
.html-embed .sticky.hot{background:var(--hot-soft);color:var(--hot);font-weight:700;box-shadow:inset 0 0 0 1.5px var(--hot)}
@keyframes pop{from{transform:scale(.9);opacity:.4}to{transform:none;opacity:1}}
.html-embed .btns{display:flex;flex-wrap:wrap;gap:8px}
.html-embed button{font:inherit;font-size:14px;border-radius:999px;border:1.5px solid currentColor;background:transparent;padding:6px 14px;cursor:pointer;color:var(--ink)}
.html-embed button:focus-visible{outline:3px solid var(--scr);outline-offset:2px}
.html-embed .kb button.main{background:var(--kan);border-color:var(--kan);color:var(--surface)}
.html-embed .sb button.main{background:var(--scr);border-color:var(--scr);color:var(--surface)}
.html-embed button.urgent{color:var(--hot)}
.html-embed button:disabled{opacity:.4;cursor:not-allowed}
.html-embed .say{font-size:14px;min-height:3.4em;padding:10px 12px;border-radius:10px;background:var(--bg);color:var(--ink)}
.html-embed .say.warn{background:var(--hot-soft)}
.html-embed .sprint{display:grid;gap:6px}
.html-embed .days{display:grid;grid-template-columns:repeat(10,1fr);gap:3px}
.html-embed .day{height:10px;border-radius:3px;background:var(--line)}
.html-embed .day.on{background:var(--scr)}
.html-embed .sprint .lbl{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-family:var(--f-num)}
.html-embed .backlog{font-size:13px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.html-embed .backlog .sticky{font-size:12px;padding:3px 6px}
.html-embed .locked{font-size:12px;color:var(--scr);font-weight:700}
.html-embed .tbl{overflow-x:auto;border-radius:14px;border:1px solid var(--line);background:var(--surface)}
.html-embed table{border-collapse:collapse;width:100%;min-width:620px;font-size:15px}
.html-embed th,.html-embed td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:top}
.html-embed tr:last-child td{border-bottom:0}
.html-embed thead th{font-size:14px}
.html-embed thead th:nth-child(2){color:var(--kan)}
.html-embed thead th:nth-child(3){color:var(--scr)}
.html-embed td:first-child{font-weight:700;white-space:nowrap;color:var(--muted)}
.html-embed td small{display:block;color:var(--muted);font-size:13px}
.html-embed .quiz{display:grid;gap:12px}
.html-embed .q{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:grid;gap:10px}
.html-embed .q p{font-weight:500}
.html-embed .opts{display:flex;flex-wrap:wrap;gap:8px}
.html-embed .opts button[aria-pressed="true"].ok{background:var(--kan);border-color:var(--kan);color:var(--surface)}
.html-embed .opts button[aria-pressed="true"].os{background:var(--scr);border-color:var(--scr);color:var(--surface)}
.html-embed .meter{display:grid;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px}
.html-embed .bar{height:14px;border-radius:999px;background:var(--scr-soft);overflow:hidden;display:flex}
.html-embed .bar span{background:var(--kan);transition:width .35s ease}
.html-embed .meter .ends{display:flex;justify-content:space-between;font-size:14px;font-weight:700}
.html-embed .verdict{font-size:17px;font-weight:700}
.html-embed .mix{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px}
.html-embed .mix .tag{font-family:var(--f-num);font-weight:700;padding:4px 10px;border-radius:8px;background:linear-gradient(90deg,var(--kan-soft),var(--scr-soft))}
.html-embed .one{font-size:18px;font-weight:700;border-top:2px solid var(--ink);padding-top:16px}
.html-embed .src{font-size:13px;color:var(--muted)}
.html-embed .src a{color:inherit}
@media (max-width:760px){.html-embed .boards,.html-embed .bottom{grid-template-columns:1fr}
.html-embed .mix{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.html-embed .sticky{animation:none}
.html-embed .bar span{transition:none}}
.html-embed{background:transparent!important}  /* the blog owns the page background */
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed not-prose" lang="zh-CN">
<div class="wrap">
  <header class="hero">
    <div class="eyebrow">Agile · Kanban vs Scrum</div>
    <p class="lead">看板像<b class="k">流水的小河</b>，Scrum 像<b class="s">一班一班的火车</b>。两种都是“敏捷”做事的方法：把大活拆小，一点点做完，边做边改。区别在于活儿是<b>一直流</b>，还是<b>按趟走</b>。</p>
    <div class="bottom">
      <div class="pill k"><b>看板 Kanban</b><span>做完一件，就拉下一件。没有固定的“轮次”。</span><span class="pic">关键：限制“同时在做”的数量（WIP 上限）。</span></div>
      <div class="pill s"><b>Scrum</b><span>每 1–4 周是一趟“冲刺”（Sprint）。出发前定好装什么，路上不换。</span><span class="pic">关键：固定节奏 + 固定角色 + 每趟结束交付一次。</span></div>
    </div>
  </header>
  <section>
    <div class="eyebrow">动手试试</div>
    <h2>同一堆活，两种玩法</h2>
    <p class="lead">点按钮推着卡片走。最后都按一下红色的<b>“突然来了急活”</b>，看看两边怎么接。</p>
    <div class="boards">
      <!-- Kanban -->
      <div class="board kb" id="kb">
        <header><h3>看板 · 一直流</h3><span class="stat" id="kbStat">已完成 0 · 平均周期 – 步</span></header>
        <div class="cols">
          <div class="col" id="kTodo"><div class="colh">待办</div></div>
          <div class="col" id="kDoing"><div class="colh">进行中 <span class="lim" id="kLim">0/3</span></div></div>
          <div class="col" id="kDone"><div class="colh">完成</div></div>
        </div>
        <div class="btns">
          <button class="main" id="kPull">拉一张开始做</button>
          <button id="kFinish">做完最老的一张</button>
          <button class="urgent" id="kHot">突然来了急活</button>
        </div>
        <div class="say" id="kSay">“进行中”最多放 3 张。满了就不能再拉，要先做完一张。这样大家不会手里压一堆半成品。</div>
      </div>
      <!-- Scrum -->
      <div class="board sb" id="sb">
        <header><h3>Scrum · 按趟走</h3><span class="stat" id="sbStat">第 1 趟冲刺 · 速度 – 张/趟</span></header>
        <div class="sprint">
          <div class="days" id="days"></div>
          <div class="lbl"><span>计划会</span><span id="dayLbl">第 0 / 10 天</span><span>评审 + 回顾</span></div>
        </div>
        <div class="cols">
          <div class="col" id="sTodo"><div class="colh">本趟待办 <span class="locked" id="sLock"></span></div></div>
          <div class="col" id="sDoing"><div class="colh">进行中</div></div>
          <div class="col" id="sDone"><div class="colh">完成</div></div>
        </div>
        <div class="backlog" id="sBack"><span>产品待办（车站排队）：</span></div>
        <div class="btns">
          <button class="main" id="sNext">开始冲刺</button>
          <button class="urgent" id="sHot">突然来了急活</button>
        </div>
        <div class="say" id="sSay">先开“计划会”：从车站挑几张卡装上车。车一开，这趟的内容就锁住了。</div>
      </div>
    </div>
  </section>
  <section>
    <div class="eyebrow">逐项对比</div>
    <h2>一张表看清区别</h2>
    <div class="tbl">
      <table>
        <thead><tr><th></th><th>看板 Kanban</th><th>Scrum</th></tr></thead>
        <tbody>
          <tr><td>节奏</td><td>连续流动，没有固定周期</td><td>固定长度的冲刺，常见 2 周<small>1–4 周都行，但要一直一样长</small></td></tr>
          <tr><td>什么时候交付</td><td>持续交付：做好一件就能发一件</td><td>每趟冲刺结束时交付一次<small>也可以更频繁，但至少一趟一次</small></td></tr>
          <tr><td>角色</td><td>不强制要求任何角色<small>有的团队会请一位敏捷教练</small></td><td>三个固定角色：产品负责人、Scrum Master、开发团队</td></tr>
          <tr><td>看什么数</td><td>周期时间（cycle time）：一张卡从开始到做完要多久</td><td>速度（velocity）：一趟冲刺能做完多少<small>常用故事点来算</small></td></tr>
          <tr><td>中途能改吗</td><td>随时可以改，只要不超 WIP 上限</td><td>冲刺中尽量不改，新需求等下一趟</td></tr>
          <tr><td>板子</td><td>一直用同一块板，卡片不断流过</td><td>每趟冲刺清空，重新装一批</td></tr>
          <tr><td>固定会议</td><td>不强制<small>常见每日站会、定期复盘</small></td><td>计划会、每日站会、评审会、回顾会</td></tr>
        </tbody>
      </table>
    </div>
  </section>
  <section>
    <div class="eyebrow">怎么选</div>
    <h2>你的团队更像哪一种？</h2>
    <div class="quiz" id="quiz"></div>
    <div class="meter">
      <div class="ends"><span class="k">看板</span><span class="s">Scrum</span></div>
      <div class="bar"><span id="barK" style="width:50%"></span></div>
      <div class="verdict" id="verdict">回答上面几个问题，看看倾向。</div>
    </div>
  </section>
  <section>
    <div class="mix">
      <span class="tag">Scrumban</span>
      <div style="display:grid;gap:8px">
        <h3>不用二选一</h3>
        <p>很多团队混着用：保留 Scrum 的冲刺和回顾会，同时在板子上加 WIP 上限，像看板一样盯着流动。先选一种跑起来，再按团队的感受慢慢调。</p>
      </div>
    </div>
  </section>
  <p class="one">一句话：活儿零零碎碎、随时会插队，用看板让它一直流；目标清楚、想要稳定节奏和定期交付，用 Scrum 一趟一趟发车。</p>
  <p class="src">参考：<a href="https://www.atlassian.com/zh/agile/kanban/kanban-vs-scrum" target="_blank" rel="noopener">Atlassian · 看板与 Scrum</a>。互动板只是示意，数字为演示用。</p>
</div>
<script>
(function(){
  const $ = id => document.getElementById(id);
  const tasks = ["登录页改版","修复支付超时","导出报表","新手引导","搜索加速","消息推送","深色模式","权限设置","订单筛选","头像上传","数据看板","邮件模板"];
  let ti = 0; const nextName = () => tasks[ti++ % tasks.length];
  const mk = (t) => { const d=document.createElement("div"); d.className="sticky"+(t.hot?" hot":""); d.textContent=(t.hot?"⚡ ":"")+t.name; return d; };
  const fill = (col, list) => { col.querySelectorAll(".sticky").forEach(c=>c.remove()); list.forEach(t=>col.appendChild(mk(t))); };
  /* ---------- Kanban ---------- */
  const WIP = 3; let step = 0;
  const K = { todo:[], doing:[], done:[], cycles:[] };
  for(let i=0;i<5;i++) K.todo.push({name:nextName()});
  K.doing.push({name:nextName(), start:0});
  function kRender(msg, warn){
    fill($("kTodo"),K.todo); fill($("kDoing"),K.doing); fill($("kDone"),K.done.slice(-5));
    $("kLim").textContent = K.doing.length+"/"+WIP;
    $("kDoing").classList.toggle("full", K.doing.length>=WIP);
    const avg = K.cycles.length ? (K.cycles.reduce((a,b)=>a+b,0)/K.cycles.length).toFixed(1) : "–";
    $("kbStat").textContent = "已完成 "+K.done.length+" · 平均周期 "+avg+" 步";
    $("kFinish").disabled = !K.doing.length;
    if(msg){ $("kSay").textContent = msg; $("kSay").classList.toggle("warn", !!warn); }
  }
  $("kPull").onclick = () => {
    step++;
    if(K.doing.length>=WIP) return kRender("“进行中”已经 3 张，满了。先做完一张再拉。这就是 WIP 上限：少开工，多完工。", true);
    if(!K.todo.length) K.todo.push({name:nextName()});
    const t = K.todo.shift(); t.start = step; K.doing.push(t);
    if(K.todo.length<3) K.todo.push({name:nextName()});
    kRender("拉了「"+t.name+"」开始做。不用等谁开会，有空位就拉。");
  };
  $("kFinish").onclick = () => {
    step++;
    const t = K.doing.shift(); if(!t) return;
    K.cycles.push(step - t.start); K.done.push(t);
    kRender("「"+t.name+"」做完了，花了 "+(step-t.start)+" 步。做完就能直接发布，这叫持续交付。");
  };
  $("kHot").onclick = () => {
    K.todo.unshift({name:"线上故障", hot:true});
    kRender("急活直接放到“待办”最上面。等“进行中”空出一个位子，马上就能拉它。不用等什么“下一轮”。");
  };
  kRender();
  /* ---------- Scrum ---------- */
  const S = { day:0, sprint:1, running:false, back:[], todo:[], doing:[], done:[], vel:[] };
  for(let i=0;i<6;i++) S.back.push({name:nextName()});
  const daysEl = $("days"); for(let i=0;i<10;i++){ const d=document.createElement("div"); d.className="day"; daysEl.appendChild(d); }
  function sRender(msg, warn){
    fill($("sTodo"),S.todo); fill($("sDoing"),S.doing); fill($("sDone"),S.done);
    const bk=$("sBack"); bk.querySelectorAll(".sticky").forEach(c=>c.remove()); S.back.slice(0,6).forEach(t=>bk.appendChild(mk(t)));
    [...daysEl.children].forEach((d,i)=>d.classList.toggle("on", i<S.day));
    $("dayLbl").textContent = "第 "+S.day+" / 10 天";
    $("sLock").textContent = S.running ? "已锁定" : "";
    const v = S.vel.length ? (S.vel.reduce((a,b)=>a+b,0)/S.vel.length).toFixed(1) : "–";
    $("sbStat").textContent = "第 "+S.sprint+" 趟冲刺 · 速度 "+v+" 张/趟";
    $("sNext").textContent = !S.running ? (S.day===10 ? "评审 + 回顾，发下一趟" : "开始冲刺") : "过一天";
    if(msg){ $("sSay").textContent = msg; $("sSay").classList.toggle("warn", !!warn); }
  }
  $("sNext").onclick = () => {
    if(!S.running && S.day===10){
      S.vel.push(S.done.length); const n=S.done.length;
      S.sprint++; S.day=0; S.done=[]; S.todo=[]; S.doing=[];
      return sRender("评审会：把这趟做完的 "+n+" 张给大家看。回顾会：聊聊下趟怎么做得更好。然后板子清空，回到车站重新装车。");
    }
    if(!S.running){
      while(S.back.length<4) S.back.push({name:nextName()});
      S.todo = S.back.splice(0,4); S.running = true; S.day = 0;
      return sRender("计划会开完：这趟装了 4 张卡，车门关上。接下来 10 天只做这 4 张。");
    }
    S.day++;
    if(S.day%2===0 && S.doing.length) S.done.push(S.doing.shift());
    if(S.todo.length && S.doing.length<2) S.doing.push(S.todo.shift());
    let m = "第 "+S.day+" 天。每日站会：昨天做了啥，今天做啥，有没有卡住。";
    if(S.day===10){ S.running=false; S.back.unshift(...S.todo, ...S.doing); const left=S.todo.length+S.doing.length; S.todo=[]; S.doing=[];
      m = "冲刺结束！做完 "+S.done.length+" 张"+(left?"，没做完的 "+left+" 张退回车站。":"。")+" 点按钮开评审和回顾。"; }
    sRender(m);
  };
  $("sHot").onclick = () => {
    S.back.unshift({name:"线上故障", hot:true});
    sRender(S.running
      ? "车已经开了，这趟内容锁住。急活先去车站排第一，下一趟计划会优先装上。（真的十万火急，产品负责人可以叫停冲刺，但很少这么做。）"
      : "现在还没发车，急活排在车站第一位。开计划会时会先装它。", S.running);
  };
  sRender();
  /* ---------- Chooser ---------- */
  const Q = [
    ["新需求多久来一次？", "随时冒出来、常插队", "可以攒一攒，按周规划"],
    ["主要做什么类型的活？", "运维、支持、修 bug", "做新产品、新功能"],
    ["想要固定的角色和会议吗？", "越少越好，轻一点", "要，大家分工更清楚"],
    ["交付方式？", "做好一件发一件", "定期发一个版本"],
  ];
  const ans = Array(Q.length).fill(null);
  const quiz = $("quiz");
  Q.forEach((q,i)=>{
    const box=document.createElement("div"); box.className="q";
    box.innerHTML = "<p>"+q[0]+"</p><div class='opts'><button type='button' class='ok' id='q"+i+"k' aria-pressed='false'>"+q[1]+"</button><button type='button' class='os' id='q"+i+"s' aria-pressed='false'>"+q[2]+"</button></div>";
    quiz.appendChild(box);
    const bk=box.querySelector(".ok"), bs=box.querySelector(".os");
    bk.onclick=()=>{ans[i]="k";bk.setAttribute("aria-pressed","true");bs.setAttribute("aria-pressed","false");score();};
    bs.onclick=()=>{ans[i]="s";bs.setAttribute("aria-pressed","true");bk.setAttribute("aria-pressed","false");score();};
  });
  function score(){
    const done = ans.filter(Boolean); const k = ans.filter(a=>a==="k").length;
    const pct = done.length ? Math.round(k/done.length*100) : 50;
    $("barK").style.width = pct+"%";
    let v;
    if(done.length<Q.length) v = "已答 "+done.length+"/"+Q.length+"，继续……";
    else if(k>=3) v = "更适合看板：活儿碎、变化快，让它一直流。";
    else if(k<=1) v = "更适合 Scrum：目标清楚，按冲刺稳定交付。";
    else v = "两边都沾：试试 Scrumban，冲刺节奏 + WIP 上限。";
    $("verdict").textContent = v;
  }
})();
</script>
</div>
