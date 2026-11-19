---
title: "Magpie 的 Intent Routing 是怎么选模型的"
description: "每一轮开始时，一个小模型先判断这条消息是难还是易，再决定组里哪个模型先回答。"
growth: seedling
planted: 2026-11-14T13:02:58+08:00
lastTended: 2026-11-14T19:31:13+08:00
draft: false
tags:
  - "ai-agents"
  - "workflow"
  - "claude-code"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
/* Blog dark mode is html.dark (data-theme holds the palette name). */
html.dark .html-embed .mir{
  --bg:#121417; --panel:#181b1f; --ink:#e6e9ed; --sub:#a7b0ba; --line:#30363d;
  --b-line:#6ea3f0;
  background:transparent;
  color:var(--ink);
}
/* Blog already frames the article; don't double-pad. */
.html-embed .mir{max-width:none;margin:0;padding:0}
/* Keep the page's sans headings; the blog's heading serif and h2 rule otherwise win. */
.html-embed .mir h1,.html-embed .mir h2{
  font-family:var(--sans)!important;
  border:0!important;
  padding-bottom:0!important;
  color:var(--ink)!important;
  font-style:normal!important;
}
.html-embed .mir h2{font-size:22px!important;line-height:1.4!important;margin:44px 0 8px!important}
/* Do not pick up the blog's italic on blockquotes. */
.html-embed .mir blockquote,.html-embed .mir blockquote p{font-style:normal!important}
.html-embed .mir figure img{display:block;width:100%;max-width:100%;height:auto}
@media (max-width:640px){
  .html-embed .mir h2{font-size:20px!important;margin-top:36px!important}
}
/* Try a turn: scoped artifact bench. Tokens stay on the widget so they do not leak. */
.html-embed .mir-try{
  --mt-bg:#f2f5f8; --mt-surface:#ffffff; --mt-ink:#121a25; --mt-muted:#566274; --mt-line:#d3dae3;
  --mt-accent:#0c6b88; --mt-accent-soft:#e0f0f5;
  --mt-cheap:#17703f; --mt-cheap-soft:#dff2e6;
  --mt-fail:#ad3327; --mt-fail-soft:#f9e3df;
  --mt-font-body:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  --mt-font-mono:ui-monospace,"SF Mono",Menlo,Consolas,"Courier New",monospace;
  color:var(--mt-ink);
  font-family:var(--mt-font-body);
  font-size:16px;
  line-height:1.6;
  display:flex;
  flex-direction:column;
  gap:18px;
  min-width:0;
  max-width:100%;
}
html.dark .html-embed .mir-try{
  --mt-bg:#0d1219; --mt-surface:#151c27; --mt-ink:#e5eaf1; --mt-muted:#93a0b3; --mt-line:#2a3442;
  --mt-accent:#5fc4dd; --mt-accent-soft:#11303a;
  --mt-cheap:#62d092; --mt-cheap-soft:#12301f;
  --mt-fail:#f18f83; --mt-fail-soft:#3a1a17;
  color-scheme:dark;
}
.html-embed .mir-try *,.html-embed .mir-try *::before,.html-embed .mir-try *::after{box-sizing:border-box}
.html-embed .mir-try p,.html-embed .mir-try ol,.html-embed .mir-try ul,.html-embed .mir-try li,.html-embed .mir-try pre{
  margin:0; padding:0; border:0; list-style:none;
  font-size:inherit; font-family:inherit; line-height:inherit; color:inherit;
  background:transparent;
}
.html-embed .mir-try li::marker{content:none}
.html-embed .mir-try .mt-label{
  font-size:0.72rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--mt-muted);
}
.html-embed .mir-try .mt-note{color:var(--mt-muted); font-size:0.9rem; max-width:68ch}
.html-embed .mir-try .picks{display:flex; flex-wrap:wrap; gap:6px}
.html-embed .mir-try .picks button{
  font:inherit; font-size:0.88rem; font-weight:500; color:var(--mt-ink); background:var(--mt-surface);
  border:1px solid var(--mt-line); border-radius:6px; padding:6px 11px; cursor:pointer;
}
.html-embed .mir-try .picks button[aria-pressed="true"]{
  background:var(--mt-accent); border-color:var(--mt-accent); color:var(--mt-surface);
}
.html-embed .mir-try .picks button:focus-visible{outline:2px solid var(--mt-accent); outline-offset:2px}
.html-embed .mir-try .said{
  background:var(--mt-surface); border:1px solid var(--mt-line); border-radius:10px; padding:14px 18px;
  display:flex; flex-direction:column; gap:4px;
}
.html-embed .mir-try .said p{font-size:1.05rem}
.html-embed .mir-try .bench{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; align-items:start}
@media (max-width:860px){
  .html-embed .mir-try .bench{grid-template-columns:minmax(0,1fr)}
}
.html-embed .mir-try .pane{
  background:var(--mt-surface); border:1px solid var(--mt-line); border-radius:10px;
  padding:18px; display:flex; flex-direction:column; gap:12px; min-width:0;
}
.html-embed .mir-try .rules{list-style:none; margin:0; padding:0; display:flex; flex-direction:column}
.html-embed .mir-try .rules li{
  display:grid; grid-template-columns:1.6ch minmax(0,1fr); gap:2px 10px; padding-block:9px;
  border-top:1px solid var(--mt-line);
}
.html-embed .mir-try .rules li:first-child{border-top:0; padding-top:0}
.html-embed .mir-try .rules .n{font-family:var(--mt-font-mono); color:var(--mt-muted)}
.html-embed .mir-try .rules .what{font-weight:600; font-size:0.92rem}
.html-embed .mir-try .rules .state{grid-column:2; font-size:0.82rem; color:var(--mt-muted)}
.html-embed .mir-try .rules li.hit .state{color:var(--mt-ink); font-weight:600}
.html-embed .mir-try .rules li.hit{
  background:var(--mt-accent-soft); margin-inline:-18px; padding-inline:18px; border-top-color:transparent;
}
.html-embed .mir-try .rules li.hit + li{border-top-color:transparent}
.html-embed .mir-try .rules li.off .what{color:var(--mt-muted); font-weight:500}
.html-embed .mir-try pre,.prose-mycelium .html-embed .mir-try pre{
  margin:0; font-family:var(--mt-font-mono); font-size:0.76rem; line-height:1.55;
  background:var(--mt-bg); border:1px solid var(--mt-line); border-radius:8px; padding:10px 12px;
  overflow-x:auto; white-space:pre-wrap; overflow-wrap:anywhere;
  color:var(--mt-ink);
}
.html-embed .mir-try .answer{display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; font-size:0.92rem}
.html-embed .mir-try .pill{
  font-size:0.76rem; font-weight:600; padding:2px 9px; border-radius:999px; white-space:nowrap; border:1px solid transparent;
}
.html-embed .mir-try .pill.strong{background:var(--mt-accent-soft); color:var(--mt-accent); border-color:var(--mt-accent)}
.html-embed .mir-try .pill.cheap{background:var(--mt-cheap-soft); color:var(--mt-cheap); border-color:var(--mt-cheap)}
.html-embed .mir-try .pill.fail{background:var(--mt-fail-soft); color:var(--mt-fail); border-color:var(--mt-fail)}
.html-embed .mir-try .pill.none{background:var(--mt-bg); color:var(--mt-muted); border-color:var(--mt-line)}
.html-embed .mir-try .order{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}
.html-embed .mir-try .order li{
  display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 12px;
  border-radius:8px; border:1px solid var(--mt-line); background:var(--mt-bg);
}
.html-embed .mir-try .order li.first.strong{border-color:var(--mt-accent); background:var(--mt-accent-soft)}
.html-embed .mir-try .order li.first.cheap{border-color:var(--mt-cheap); background:var(--mt-cheap-soft)}
.html-embed .mir-try .order .who{font-weight:600}
.html-embed .mir-try .order .role{font-size:0.78rem; color:var(--mt-muted)}
.html-embed .mir-try .why{font-size:0.92rem}
/* Flow diagrams (post-figures/flow.css), scoped under .html-embed. Blog tokens only. */
.html-embed .fl{margin:28px 0;display:flex;flex-direction:column;align-items:center;gap:6px}
.html-embed .fl figcaption{margin-top:10px;font-size:14px;color:var(--muted-foreground);text-align:center;max-width:36em}
.html-embed .fr{display:flex;align-items:center;justify-content:center;width:100%}
.html-embed .fc{display:flex;flex-direction:column;align-items:center;width:100%}
.html-embed .fn{background:var(--muted);border:1px solid transparent;border-radius:10px;padding:10px 14px;text-align:center;flex:0 1 190px;min-width:0}
.html-embed .fn b{display:block;font-size:15px;font-weight:600;color:var(--foreground);line-height:1.35}
.html-embed .fn small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted-foreground)}
.html-embed .fn.hi{background:transparent;border:2px solid var(--accent)}
.html-embed .fn.dash{background:transparent;border:1px dashed var(--muted-foreground)}
.html-embed .fc>.fn{flex:none;width:min(100%,300px)}
.html-embed .fn.wide{width:min(100%,420px)}
.html-embed .fa{flex:1 1 70px;min-width:56px;max-width:150px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 6px;font-size:12.5px;line-height:1.3;color:var(--muted-foreground);text-align:center}
.html-embed .fa i{position:relative;display:block;width:100%;height:2px;background:currentColor}
.html-embed .fa i::after{content:"";position:absolute;right:-2px;top:-4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.html-embed .fa.v{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.html-embed .fa.v i,.html-embed .fr .fa.v i{width:2px;height:30px}
.html-embed .fa.v i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.html-embed .fa.v span{width:12em;text-align:left}
.html-embed .fo{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 14px;margin-top:10px;font-size:13px}
.html-embed .fo span{padding:4px 10px;border-radius:999px;border:1px dashed var(--muted-foreground);color:var(--muted-foreground)}
.html-embed .fo .ok{border-style:solid;border-color:var(--accent);color:var(--foreground)}
.html-embed .fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;width:100%}
.html-embed .fg .fn{flex:none}
.html-embed .fp{width:100%;border:1px dashed var(--muted-foreground);border-radius:12px;padding:10px 10px 8px}
.html-embed .pl{font-size:12.5px;color:var(--muted-foreground);text-align:center;margin-bottom:8px}
.html-embed .pl.pb{margin:8px 0 0}
@media (max-width:640px){
.html-embed .fr{flex-direction:column}
.html-embed .fr .fn{flex:none;width:min(100%,300px)}
.html-embed .fr .fa{flex:none;max-width:none;flex-direction:row-reverse;justify-content:center;gap:10px;padding:6px 0}
.html-embed .fr .fa i{width:2px;height:28px}
.html-embed .fr .fa i::after{right:auto;top:auto;left:-4px;bottom:-2px;border-top:8px solid currentColor;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:0}
.html-embed .fr .fa span{width:12em;text-align:left}
}
/* Flow extras: dashed arrow, branch columns, note line. */
.html-embed .fa.dsh i{background:repeating-linear-gradient(to right,currentColor 0 5px,transparent 5px 9px)}
.html-embed .fa.v.dsh i{background:repeating-linear-gradient(to bottom,currentColor 0 5px,transparent 5px 9px)}
.html-embed .fr>.fc{flex:1 1 0;min-width:0}
.html-embed .fl .pl.pb{max-width:36em}
@media (max-width:640px){
.html-embed .fr .fa.dsh i{background:repeating-linear-gradient(to bottom,currentColor 0 5px,transparent 5px 9px)}
.html-embed .fr>.fc{flex:none;width:100%}
.html-embed .fr>.fc+.fc{margin-top:14px}
}
/* Text figures: real text in a quiet panel with an accent rule. */
.html-embed .tx{margin:28px 0;padding:2px 0 2px 16px;border-left:2px solid var(--accent);font-size:15.5px;line-height:1.7;color:var(--foreground);min-width:0}
.html-embed .tx h3{font-family:inherit!important;font-style:normal!important;font-size:18px!important;line-height:1.4!important;font-weight:700;margin:22px 0 8px!important;color:var(--foreground)!important;border:0!important;padding:0!important}
.html-embed .tx h3:first-child{margin-top:0!important}
.html-embed .tx h4{font-family:inherit!important;font-style:normal!important;font-size:15.5px!important;font-weight:700;margin:14px 0 4px!important;color:var(--foreground)!important}
.html-embed .tx p{margin:8px 0}
.html-embed .tx ol,.html-embed .tx ul{margin:8px 0;padding-left:1.6em}
.html-embed .tx li{margin:4px 0}
.html-embed .tx li::marker{color:var(--muted-foreground)}
.html-embed .tx ol.steps{padding-left:1.8em}
.html-embed .tx ol.steps>li{margin:14px 0}
.html-embed .tx ol.steps>li::marker{color:var(--accent);font-weight:700}
.html-embed .tx ol.steps ul{list-style:circle}
.html-embed .tx .st{margin:0 0 4px;font-weight:700}
.html-embed .tx .note{font-size:14px;color:var(--muted-foreground)}
.html-embed .tx code{font-size:0.9em;background:var(--muted);color:var(--foreground);padding:1px 5px;border-radius:4px}
.prose-mycelium .html-embed .tx code::before,.prose-mycelium .html-embed .tx code::after{content:none}
.html-embed .tx pre,.prose-mycelium .html-embed .tx pre{margin:12px 0;padding:10px 14px;background:var(--muted);color:var(--foreground);border:0;border-radius:8px;overflow-x:auto;white-space:pre;font-size:13px;line-height:1.6}
.html-embed .tx pre code{background:none;padding:0;font-size:inherit}
.html-embed .tx .tw{overflow-x:auto;max-width:100%;margin:12px 0}
.html-embed .tx table{border-collapse:collapse;width:100%;font-size:14.5px;margin:0}
.html-embed .tx th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;color:var(--muted-foreground);padding:6px 10px 6px 0;border-bottom:1px solid var(--foreground)}
.html-embed .tx td{text-align:left;vertical-align:top;padding:8px 10px 8px 0;border-bottom:1px solid var(--muted)}
.html-embed .tx td:first-child,.html-embed .tx th:first-child{white-space:nowrap}
.html-embed .tx .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:4px 24px}
.html-embed .tx figcaption{margin-top:14px;font-size:14px;line-height:1.6;color:var(--muted-foreground)}
</style>

<div class="html-embed" lang="zh-CN">
<div class="mir">
<p>Magpie 是 yetone 做的开源工具，跑在你自己的电脑上。它给 Claude Code、Codex、Gemini CLI 这类 coding agent 提供一个统一的模型入口。你可以把多个模型放进同一个路由组，让 agent 选用整个组。Intent Routing 是组里的一种规则：每一轮开始时，一个小的分类模型会先判断这条消息是难还是易，再决定组里哪个模型先回答。</p>
<h2>一轮是怎么选模型的</h2>
<p>一个路由组里通常放一个强模型和一个便宜模型。新的一轮开始时，分类器会读用户的话，并判断这是困难任务还是简单任务。这个答案只决定谁先被问到，另一个模型仍然留在后面做故障转移。选定之后，这个选择会管住整一轮。因此，agent 把工具结果送回来时，请求会回到当初提出工具调用的那个模型，而不会重新分类。</p>
<figure class="fl" role="img" aria-label="一轮开始时，分类器只决定谁先上场。工具结果也会回到同一个模型。" lang="en">
  <div class="fr">
    <div class="fn"><b>User message</b><small>a new turn begins</small></div>
    <div class="fa"><span>user's words</span><i></i></div>
    <div class="fn"><b>Classifier</b><small>small model, once a turn</small></div>
  </div>
  <div class="fr">
    <div class="fc">
      <div class="fa v"><span>answers 1 · hard</span><i></i></div>
      <div class="fn hi"><b>Strong model</b><small>asked first</small></div>
      <div class="fa v dsh"><span>if it fails</span><i></i></div>
      <div class="fn"><b>Cheap model</b><small>failover</small></div>
    </div>
    <div class="fc">
      <div class="fa v"><span>answers 2 · easy</span><i></i></div>
      <div class="fn hi"><b>Cheap model</b><small>asked first</small></div>
      <div class="fa v dsh"><span>if it fails</span><i></i></div>
      <div class="fn"><b>Strong model</b><small>failover</small></div>
    </div>
  </div>
  <p class="pl pb">The choice holds for the whole turn: tool results go back to the model that asked for them.</p>
  <figcaption lang="zh-CN">图 1　一轮开始时，分类器只决定谁先上场。工具结果也会回到同一个模型。</figcaption>
</figure>
<p>分类器并不是只看到最新这一句。源码说明写明，它拿到的是开启这一轮的用户原文，长消息会保留开头 3000 个字符和结尾 1000 个字符；同时还会拿到上一条用户消息和助手上一次回复，各最多 1000 个字符，并且被告知上一轮属于哪一类。因此，用户只回一句「go on」时，分类器可以按上一轮的类别来判断。官方文档则写分类器只看最新一条消息。就这一点而言，源码说明比文档写得更具体。</p>
<h2>规则按什么顺序检查</h2>
<p>Magpie 自己有一套模板，名字叫 Hard to strong, easy to cheap。示例组用的就是这套模板写出来的四条规则。网关从上往下检查，第一条命中的规则把它指定的成员排到第一。</p>
<p>你可以点选下面的一种情况。你点选其中一种之后，请求原文、规则按顺序检查的结果、分类器是否被问起，以及谁先被问到，都会跟着改变。</p>
<div class="mir-try" id="mir-try">
  <div class="picks" id="mir-picks" role="group" aria-label="Situation"><button type="button" id="mir-pick-quick" data-id="quick" aria-pressed="true">Quick question</button><button type="button" id="mir-pick-hard" data-id="hard" aria-pressed="false">Hard task</button><button type="button" id="mir-pick-goon" data-id="goon" aria-pressed="false">“go on” after a hard turn</button><button type="button" id="mir-pick-tool" data-id="tool" aria-pressed="false">Tool result, mid-turn</button><button type="button" id="mir-pick-compact" data-id="compact" aria-pressed="false">Compaction</button><button type="button" id="mir-pick-image" data-id="image" aria-pressed="false">Message with a screenshot</button><button type="button" id="mir-pick-fail" data-id="fail" aria-pressed="false">Classifier fails, first turn</button><button type="button" id="mir-pick-failprev" data-id="failprev" aria-pressed="false">Classifier fails, after an easy turn</button><button type="button" id="mir-pick-none" data-id="none" aria-pressed="false">Classifier answers 0</button></div>
  <div class="said">
    <span class="mt-label">The request</span>
    <p id="mir-said">what does the -race flag do?</p>
  </div>
  <div class="bench" aria-live="polite">
    <div class="pane">
      <span class="mt-label">1 · Rules, checked in order</span>
      <ol class="rules" id="mir-rules"><li><span class="n">1</span><span class="what">Compaction → cheap model</span><span class="state">No: not a compaction</span></li><li><span class="n">2</span><span class="what">Carries an image → strong model</span><span class="state">No: no image</span></li><li><span class="n">3</span><span class="what">Intent: a hard task → strong model</span><span class="state">No: the turn is easy</span></li><li class="hit"><span class="n">4</span><span class="what">Intent: an easy task → cheap model</span><span class="state">Matches: the turn is easy</span></li></ol>
    </div>
    <div class="pane">
      <span class="mt-label">2 · Classifier</span>
      <div class="answer" id="mir-asked"><span class="pill none">asked once</span><span>It is sent:</span></div>
      <pre id="mir-prompt">Kinds:
1. a hard task: designing, debugging, a change across several files, or planning
2. an easy task: a quick question, a small edit, a lookup, or running a command
<span></span>
The user's message:
&lt;message&gt;
what does the -race flag do?
&lt;/message&gt;
<span></span>
The number of the kind that fits it best (0 only if none does):</pre>
      <div class="answer" id="mir-answer"><span class="pill cheap">answers 2</span><span>Easy.</span></div>
    </div>
    <div class="pane">
      <span class="mt-label">3 · Who is asked</span>
      <ol class="order" id="mir-order"><li class="first cheap"><span class="who">Cheap model</span><span class="role">asked first</span></li><li><span class="who">Strong model</span><span class="role">failover</span></li></ol>
      <p class="why" id="mir-why">Rule 4 decides. The classifier says easy, so rule 4 puts the cheap model first. The strong model stays behind it in case the cheap one fails.</p>
    </div>
  </div>
  <p class="mt-note">这里的消息和分类器答案都是示例。真正的分类器本身是一个模型，因此它给出的回答可能不同。不过，网关对每一种回答的处理，与源码里的做法一致。</p>
</div>

<script data-astro-rerun>
(function () {
  var root = document.getElementById('mir-try');
  if (!root || root.getAttribute('data-ready')) return;
  root.setAttribute('data-ready', '1');
  var HARD = 'a hard task: designing, debugging, a change across several files, or planning';
  var EASY = 'an easy task: a quick question, a small edit, a lookup, or running a command';
  var RULES = [
    { what: 'Compaction \u2192 cheap model', use: 'cheap' },
    { what: 'Carries an image \u2192 strong model', use: 'strong' },
    { what: 'Intent: a hard task \u2192 strong model', use: 'strong' },
    { what: 'Intent: an easy task \u2192 cheap model', use: 'cheap' }
  ];
  var NAME = { strong: 'Strong model', cheap: 'Cheap model' };
  var CASES = [
    { id: 'quick', label: 'Quick question', kind: 'new', said: 'what does the -race flag do?',
      cls: { say: 2 },
      why: 'The classifier says easy, so rule 4 puts the cheap model first. The strong model stays behind it in case the cheap one fails.' },
    { id: 'hard', label: 'Hard task', kind: 'new', said: 'the importer deadlocks under load. find the cause and fix it across the worker and queue packages',
      cls: { say: 1 },
      why: 'The classifier says hard, so rule 3 puts the strong model first.' },
    { id: 'goon', label: '\u201cgo on\u201d after a hard turn', kind: 'new', said: 'go on',
      cls: { prior: 'hard', say: 1 },
      why: '\u201cgo on\u201d says nothing of its own. The classifier is told the turn before was hard, and is given the previous message and reply, so it answers hard again.' },
    { id: 'tool', label: 'Tool result, mid-turn', kind: 'within', held: 4, said: '(the agent sends a tool result back, in a turn that began as easy)',
      cls: null, notAsked: 'Not asked. The turn already has its decision.',
      why: 'Same turn, so nothing is decided again. The one exception: if the conversation grows past what the cheap model can take, the rules are looked at again and the turn moves to a model with more room.' },
    { id: 'compact', label: 'Compaction', kind: 'compact', said: '(the agent asks for a summary of its conversation)',
      cls: null, notAsked: 'Not asked. A compaction is matched by itself.',
      why: 'Rule 1 sends the summary to the cheap model. This does not change the turn\u2019s decision: the requests after it go on as before.' },
    { id: 'image', label: 'Message with a screenshot', kind: 'new', images: true, said: 'why is this button misaligned? [screenshot attached]',
      cls: null, notAsked: 'Not asked. Rule 2 already matches before any intent rule could.',
      why: 'Rule 2 matches any request that carries an image, in this turn or an earlier one. Later turns of this conversation stay on the strong model too.' },
    { id: 'fail', label: 'Classifier fails, first turn', kind: 'new', said: 'rename this variable to userCount',
      cls: { error: 'No answer within the classifier timeout.' },
      why: 'No intent, so no rule matches and the group\u2019s own order is used. The strong model is listed first, so an unplaced turn costs more but is not under-served.' },
    { id: 'failprev', label: 'Classifier fails, after an easy turn', kind: 'new', said: 'and the other one too',
      cls: { prior: 'easy', error: 'No answer within the classifier timeout.', fallback: true },
      why: 'The classifier could not say, but the turn before was easy. That intent is used again, which is a better guess than none.' },
    { id: 'none', label: 'Classifier answers 0', kind: 'new', said: '(a message the classifier places in neither kind)',
      cls: { say: 0 },
      why: 'Zero means none of the kinds. No rule matches, so the group\u2019s own order is used and the strong model goes first.' }
  ];
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function intentOf(c) {
    if (!c.cls) return '';
    if (c.cls.say === 1) return 'hard';
    if (c.cls.say === 2) return 'easy';
    if (c.cls.fallback) return c.cls.prior;
    return '';
  }
  function evaluate(c) {
    var states = [], hit = 0, intent = intentOf(c);
    if (c.kind === 'within') {
      RULES.forEach(function (r, i) { states.push(i + 1 === c.held ? 'Held from the start of the turn' : 'Not looked at again'); });
      return { hit: c.held, states: states, held: true };
    }
    if (c.kind === 'compact') {
      RULES.forEach(function (r, i) { states.push(i === 0 ? 'Matches: this is a compaction' : 'Not reached'); });
      return { hit: 1, states: states };
    }
    var checks = [
      [false, '', 'No: not a compaction'],
      [!!c.images, 'Matches: the request carries an image', 'No: no image'],
      [intent === 'hard', 'Matches: the turn is hard', intent === 'easy' ? 'No: the turn is easy' : 'No: no intent to match'],
      [intent === 'easy', 'Matches: the turn is easy', 'No: no intent to match']
    ];
    checks.forEach(function (k, i) {
      if (hit) { states.push('Not reached'); return; }
      if (k[0]) { hit = i + 1; states.push(k[1]); } else { states.push(k[2]); }
    });
    return { hit: hit, states: states };
  }
  function promptFor(c) {
    var t = 'Kinds:\n1. ' + HARD + '\n2. ' + EASY + '\n';
    if (c.cls.prior) {
      var n = c.cls.prior === 'hard' ? 1 : 2;
      t += '\nWhat came before the user\'s message \u2026 (previous message and reply)\n';
      t += '\nThe user\'s message before this one, in the same conversation, was of kind ' + n + '. A message that only carries on from it \u2014 go on, yes, do it, fix that \u2014 is of kind ' + n + ' too; one that asks for something of its own is of the kind that fits it.\n';
    }
    t += '\nThe user\'s message:\n<message>\n' + c.said + '\n</message>\n\nThe number of the kind that fits it best (0 only if none does):';
    return t;
  }
  function show(c) {
    Array.prototype.forEach.call($('mir-picks').children, function (b) { b.setAttribute('aria-pressed', b.dataset.id === c.id ? 'true' : 'false'); });
    $('mir-said').textContent = c.said;
    var ev = evaluate(c);
    var rules = $('mir-rules'); rules.textContent = '';
    RULES.forEach(function (r, i) {
      var li = el('li', ev.hit === i + 1 ? 'hit' : (ev.states[i].indexOf('Not') === 0 ? 'off' : ''));
      li.appendChild(el('span', 'n', String(i + 1)));
      li.appendChild(el('span', 'what', r.what));
      li.appendChild(el('span', 'state', ev.states[i]));
      rules.appendChild(li);
    });
    var asked = $('mir-asked'), prompt = $('mir-prompt'), answer = $('mir-answer');
    asked.textContent = ''; answer.textContent = '';
    if (!c.cls) {
      asked.appendChild(el('span', 'pill none', 'not asked'));
      asked.appendChild(el('span', '', c.notAsked.replace('Not asked. ', '')));
      prompt.hidden = true;
    } else {
      asked.appendChild(el('span', 'pill none', 'asked once'));
      asked.appendChild(el('span', '', 'It is sent:'));
      prompt.hidden = false;
      prompt.textContent = promptFor(c);
      if (c.cls.error) {
        answer.appendChild(el('span', 'pill fail', 'no answer'));
        answer.appendChild(el('span', '', c.cls.error + (c.cls.fallback ? ' The turn before was ' + c.cls.prior + ', so this one is treated as ' + c.cls.prior + '.' : ' No intent.')));
      } else {
        var kind = c.cls.say === 1 ? 'strong' : c.cls.say === 2 ? 'cheap' : 'none';
        answer.appendChild(el('span', 'pill ' + kind, 'answers ' + c.cls.say));
        answer.appendChild(el('span', '', c.cls.say === 1 ? 'Hard.' : c.cls.say === 2 ? 'Easy.' : 'None of the kinds.'));
      }
    }
    var first = ev.hit ? RULES[ev.hit - 1].use : 'strong';
    var second = first === 'strong' ? 'cheap' : 'strong';
    var order = $('mir-order'); order.textContent = '';
    [[first, 'asked first', true], [second, 'failover', false]].forEach(function (o) {
      var li = el('li', o[2] ? 'first ' + o[0] : '');
      li.appendChild(el('span', 'who', NAME[o[0]]));
      li.appendChild(el('span', 'role', o[1]));
      order.appendChild(li);
    });
    $('mir-why').textContent = (ev.hit ? (ev.held ? 'Rule ' + ev.hit + ', held. ' : 'Rule ' + ev.hit + ' decides. ') : 'No rule matches. ') + c.why;
  }
  CASES.forEach(function (c) {
    var b = $('mir-pick-' + c.id);
    if (!b) {
      b = el('button', '', c.label);
      b.type = 'button';
      b.id = 'mir-pick-' + c.id;
      b.dataset.id = c.id;
      b.setAttribute('aria-pressed', 'false');
      $('mir-picks').appendChild(b);
    } else {
      b.type = 'button';
      b.dataset.id = c.id;
    }
    b.addEventListener('click', function () { show(c); });
  });
  show(CASES[0]);
})();
</script>
<p>分类器只在「一条带意图的规则有可能成为第一条命中规则」时才会被问起。如果更前面的规则已经命中，比如请求里带了图片，这次调用就不会发生。除了意图、压缩和图片，一条规则还可以加上请求长度、推理强度、来自哪个 agent、开始时间，以及工作目录这些看得见的条件。源码说明强调，这些条件不会被猜测，同一条请求每次都会按同样的方式路由。</p>
<h2>分类器失败时会怎样</h2>
<p>同一道题在 10 分钟内再问一次，会直接用记忆里的答案。分类器失败之后会被搁置 30 秒，这样后面的每一轮都不必再把超时时间等完。</p>
<figure class="tx" lang="en">
<h3>What happens on each request</h3>
<ol class="steps">
<li>
<p class="st">Is the agent compacting?</p>
<p>When the agent asks for a summary of its conversation, the first rule that matches a compaction decides, by itself. This does not become the turn's decision, so the requests after it carry on as before. A model whose context window is known to be smaller than the conversation is passed over, because it would only refuse it.</p>
</li>
<li>
<p class="st">Is this the same turn?</p>
<p>If the agent is sending tool results back, nothing is decided again. The request goes to what was chosen when the turn began. One thing can move it: the conversation growing past what that model can take. Then the rules are looked at again and it moves to a model known to take more.</p>
</li>
<li>
<p class="st">A new turn: read the facts</p>
<p>The gateway reads what is visible in the request: its length in tokens, whether it carries an image (in this turn or an earlier one), the reasoning level the agent asked for, which agent sent it, its working folder, and the time. Rules on these are never guessed. The same request is always routed the same way.</p>
</li>
<li>
<p class="st">Ask the classifier, only if needed</p>
<p>The classifier is asked only when a rule that could be the first to match is waiting on an intent. If an earlier rule already matches, for example the image rule, no call is made.</p>
<p>It is given the user's own words from the message that began the turn, without the blocks agents add to it. Long messages keep their first 3,000 and last 1,000 characters. It also gets the previous user message and the assistant's last reply, up to 1,000 characters each, and is told what kind the turn before was, so a short follow-up like "go on" is judged with what it follows.</p>
<p>The request is sent at temperature 0 with reasoning turned off where the model allows it. The answer is a single number: the kind that fits, or 0 for none.</p>
</li>
<li>
<p class="st">Handle a slow or failed classifier</p>
<ul>
<li>The same question asked again within 10 minutes is answered from memory, with no call.</li>
<li>The classifier has a timeout, set in Settings. Its own failover counts against it.</li>
<li>After a failure it is left alone for 30 seconds, so every turn does not wait out the timeout.</li>
<li>If it cannot say and the turn before had an intent, that intent is used again. If there was none, no intent matches.</li>
</ul>
</li>
<li>
<p class="st">The first rule that matches decides</p>
<p>Its member goes first. Members named by later rules that also match come next, then the rest of the group. If no rule matches, the group's own order is used, so whichever member is listed first gets the turn. That is why the strong model is listed first: an unplaced turn stays on it.</p>
</li>
<li>
<p class="st">Remember it for the turn</p>
<p>The decision is stored per group and conversation, along with the intent, and reused for every later request of the turn. The Routing view's trace shows which rule decided, what the classifier was asked, what it said, how long it took, and whether the answer came from memory.</p>
</li>
</ol>
<figcaption lang="zh-CN">图 3　每条请求按这个顺序处理。分类器失败或回答 0 时，会沿用上一轮的意图，或退回组的默认顺序。</figcaption>
</figure>
<h2>它做不到的事</h2>
<p>源码说明也列出了这项机制的短处。这些限制来自对源码的阅读，而不是线上评测。</p>
<figure class="tx" lang="en">
<h3>What it costs and where it falls short</h3>
<ul>
<li><strong>One extra call per new turn.</strong> The classifier runs before the turn goes anywhere, so a slow classifier delays the first token.</li>
<li><strong>It judges the message, not the work.</strong> "Fix the flaky test" can look easy and turn out hard. The turn stays on the cheap model unless the conversation outgrows its context window.</li>
<li><strong>Hard and easy are what you wrote.</strong> The classifier chooses among your wordings. Vague intents give vague routing.</li>
<li><strong>No feedback.</strong> Nothing checks whether the answer was good, and nothing is learned from past turns.</li>
<li><strong>Switching models loses the prompt cache.</strong> A conversation that alternates between the two re-reads its whole context uncached each time it moves, which eats into the saving.</li>
<li><strong>An image pins the conversation.</strong> With the image rule, one screenshot keeps every later turn of that conversation on the strong model.</li>
</ul>
<figcaption lang="zh-CN">图 4　源码说明里列出的六条短处。</figcaption>
</figure>
<p class="source">根据公开的 Claude Artifact <a href="https://claude.ai/artifact/Guj5eVmEapGk72iy4hgDtk">Magpie Intent Routing</a> 整理，对应开源项目 <a href="https://github.com/yetone/magpie">yetone/magpie</a> 的 commit 873b498。产品介绍参考了 <a href="https://usemagpie.ai/">usemagpie.ai</a>。</p>
</div>
</div>
