---
author: "Shumin Fu"
pubDatetime: 2026-11-04T21:11:46+08:00
title: "从 Codex 源码学 Agent 工程：系列导读"
slug: codex-agent-engineering-series
featured: false
draft: false
tags:
  - "ai-agents"
  - "codex"
  - "workflow"
description: "11 篇根据 B 站合集字幕改写的 Codex / Agent 工程笔记目录，按主题跳转各篇与源视频。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed" lang="zh-CN">
<article>
<p><strong>11 篇根据 B 站合集字幕改写的 Codex / Agent 工程笔记目录，按主题跳转各篇与源视频。</strong></p>
<p>这是一组根据 B 站合集「从 Codex 源码学 Agent 工程」AI 字幕整理改写的技术笔记。目标不是复述口号，而是把 Codex 里常见的工程机制——循环、长任务、上下文、多 Agent、规则、沙箱、长命令、工具发现、Code Mode、运行中干预、测试与遥测——写成可对照源码与自己实现的说明。</p>
<p>合集页（含未整理进本文字稿的集数，如 Computer Use / 持久化等）：<a href="https://space.bilibili.com/518390923/channel/collectiondetail?sid=9271362">B 站合集</a>。编号沿用合集标题（缺 10、12 等集时以合集为准）。</p>
<h2>目录</h2>
<ol>
<li><strong>01</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-01-loop">Agent 循环：请求、工具调用与结束条件</a> · <a href="https://www.bilibili.com/video/BV1zbHy6mEB6/">B 站视频</a></li>
<li><strong>02</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-02-long-tasks">长任务架构：Codex 如何持续工作</a> · <a href="https://www.bilibili.com/video/BV1GEHX64EwC/">B 站视频</a></li>
<li><strong>03</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-03-context-compaction">上下文压缩：满了之后怎么办</a> · <a href="https://www.bilibili.com/video/BV1CNph6SENU/">B 站视频</a></li>
<li><strong>04</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-04-multi-agent">多 Agent 协作：拆分、交接与核验</a> · <a href="https://www.bilibili.com/video/BV1MFpG63End/">B 站视频</a></li>
<li><strong>05</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-05-agents-md">项目规则：AGENTS.md 的加载、缓存与排错</a> · <a href="https://www.bilibili.com/video/BV1MLpn6AEoi/">B 站视频</a></li>
<li><strong>06</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-06-sandbox-permissions">权限与沙箱：审批、文件范围与网络</a> · <a href="https://www.bilibili.com/video/BV12wpd6ZEz1/">B 站视频</a></li>
<li><strong>07</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-07-long-commands">长命令管理：等待、输出、超时与收尾</a> · <a href="https://www.bilibili.com/video/BV1Vvpq6WE9s/">B 站视频</a></li>
<li><strong>08</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-08-tool-discovery">工具按需发现：BM25、定义与后续调用</a> · <a href="https://www.bilibili.com/video/BV144pm6zELA/">B 站视频</a></li>
<li><strong>09</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-09-code-mode">Code Mode：用代码编排工具</a> · <a href="https://www.bilibili.com/video/BV1xAJ26xE3Z/">B 站视频</a></li>
<li><strong>11</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-11-runtime-intervention">运行中干预：临时改需求怎么办</a> · <a href="https://www.bilibili.com/video/BV1yun36tEWt/">B 站视频</a></li>
<li><strong>13</strong> · <a href="https://fun-fun-zone.pages.dev/posts/codex-agent-13-testing-observability">测试与可观测性：如何验证 Agent 行为</a> · <a href="https://www.bilibili.com/video/BV1fVn86qEAh/">B 站视频</a></li>
</ol>
<h2>阅读建议</h2>
<ul>
<li>先读 01 建立「一轮 turn」心智模型，再读 02–03 看时间拉长后的状态与压缩；</li>
<li>做产品权限与运维时重点看 05–07；</li>
<li>做工具平台与编排时重点看 08–09；</li>
<li>做交互与可靠性时重点看 11 与 13。</li>
</ul>
<footer class="credit">
<p>文字稿整理发布于 FunFun Zone；视频版权与讲解归属原 UP。细节以源码与视频为准。</p>
</footer>
</article>
</div>
