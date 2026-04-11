---
author: Shumin Fu
pubDatetime: 2026-04-11T10:00:00+08:00
title: "Claude Island：给 Claude Code 加一块灵动岛"
slug: introducing-claude-island
featured: true
draft: false
tags:
  - claude-code
  - macos
  - swift
  - open-source
description: 一个 macOS 菜单栏小工具，把 Claude Code 的会话状态和权限审批搬到 MacBook 的刘海上。
---

最近我业余时间基本都砸在这个小玩具上了：[ShuminFu/claude-island](https://github.com/ShuminFu/claude-island)。

一句话介绍：它把 MacBook 那块刘海变成了 Claude Code 的"指挥中心"，Claude 一有动静刘海就会胀开来告诉你，要你点头同意跑命令的时候直接按快捷键就行，不用切回终端。

## Table of contents

## 起因：我受够了切窗口

用 Claude Code 有个特别烦的循环：你在浏览器看文档，Claude 在后台跑着，跑到一半它要权限跑 `Bash` 或者 `Edit`，就停下来等你。问题是它不会主动提醒你——你得自己切回终端，瞄一眼，按个 y，再切回来。

如果你像我一样习惯把终端最小化，或者干脆把 Claude 丢在 tmux 的某个角落 pane 里，那就更惨了：你压根不知道它在等你，回过神来一看，十分钟过去了一个字没动。

想了一下，既然 MacBook 都已经有刘海这么一块显眼的地方了，那就让它派上点用场吧——有事喊我，没事消失。就这么个朴素的想法，做着做着变成现在这个样子。

## 它能干嘛

简单列一下：

- **刘海浮层** — Claude 有动静刘海就撑开一点，给你看个小动画、dots、转圈圈之类的。模块化的，你可以自己加
- **可以拽下来** — 不爽盯着刘海看的话，直接拖一下，它就变成一个能自由拖动的浮窗。扔回顶部会"啪"地吸回去
- **多会话一起看** — 同时跑好几个 Claude 没问题，每个会话一个小点，状态一目了然
- **一键批准/拒绝** — 快捷键直接在刘海上按，不用切窗口
- **完整聊天记录** — markdown 渲染，重启也不会丢
- **全局热键** — 用 Carbon 注册的，按键不会漏到你正在打字的窗口里（这个坑踩了好几次才填上）
- **一键跳 tmux** — 从刘海点一下直接跳到对应的 tmux pane，最小化的终端会自动弹出来，跨 Space 也行
- **Token 配额** — 可选功能，刘海上会显示两个小圆环告诉你这个月还剩多少额度

## 一些比较好玩的实现细节

这是我第一次认真写 Swift 和 macOS App，等于是从零开始边写边学。几个让我印象比较深的设计：

### 所有状态变更只走一个口子

App 里所有状态都走 `SessionStore.shared` 这一个 actor，别的地方都只能发事件进来，不能直接改状态。流程大概是这样：

```
Python hook 发 JSON 到 Unix socket
  → HookSocketServer 收到
    → SessionStore.process(.hookReceived(event))
      → 更新一个 immutable 的 SessionState
        → 通过 AsyncStream 广播出去
          → UI 层订阅后重绘
```

听起来挺复杂，但用起来爽在一个地方：调试的时候我只需要在 `process(_:)` 这一个函数里下个断点，所有事件都会从这里过一遍，再也不用满项目找"这个状态是谁改的"。

### Hook 是一段 Python 脚本

Claude Code 的 hook 机制允许你在会话的关键节点跑脚本，比如"工具调用前"、"消息结束时"这种。Claude Island 第一次启动的时候会往 `~/.claude/hooks/` 里丢一个 Python 脚本，它负责把事件打包成 JSON，通过 Unix domain socket 发给 App。

为什么是 Python 不是 Swift？说起来有点反直觉——Swift 的 CLI 冷启动太重了。hook 是那种会被 Claude Code 频繁拉起又秒退的短命进程，每次启动都要几十毫秒的话，用起来一卡一卡的。Python 3.14 配 `uv` 冷启动飞快，所以就选它了。App 首次启动会自动找 `uv` / `python3.14` / `pyenv`，找到哪个就把绝对路径写进 `~/.claude/settings.json`，之后就不用再检测了。

### JSONL 解析要小心

Claude Code 把每个会话都写成一个 JSONL 文件，长一点的动不动几十 MB。最开始我图省事直接 `String(contentsOf:)` 整个读，结果一个三小时的会话能让 App 卡半秒——这显然不行。

后来改成 tail-based 的增量解析，每次只读上次之后新增的字节。过程中又发现上游的遍历逻辑在碰到 attachment / system / snapshot 这种嵌套消息的时候会提前跳出，导致长会话被截断。这是我给这个项目修的第一个 bug，也是让我决定认真维护一个 fork 的原因。

### 权限审批其实是……模拟按键

说出来有点不体面：Claude Code 在终端里等你按 y/n 的时候，App 这边其实是通过 `TmuxController` 找到对应会话的那个 pane，然后把按键注入进去。

没办法，Claude Code 没有提供外部审批的接口，只能这么来。代价就是首次启动得授权 Accessibility——不是为了监控你，纯粹是因为"往别的应用注入按键"这个动作需要这个权限。

## 这个 fork 加了啥

上游 [engels74/claude-island](https://github.com/engels74/claude-island)（再上游是 [farouqaldori/claude-island](https://github.com/farouqaldori/claude-island)）本身已经做得挺完整了，我这个 fork 主要加了这些东西：

- **可拖拽的浮动面板** — 刘海拽下来变窗口，磁吸归位
- **全局热键不漏键** — 从 NSEvent 换到 Carbon，再也不会按一下快捷键然后发现文本框里多了个字母
- **完整聊天历史** — markdown 渲染，长会话不截断
- **更聪明的会话列表** — 智能摘要、过滤掉系统消息、hover 时的未读标记
- **键盘导航** — 审批按钮上直接显示快捷键、会话详情里能用键盘滚动
- **终端跳转体验** — 最小化的窗口自动弹出来、跨 Space、tab flash 提示、Git 分支信息
- **一堆杂七杂八的 bug** — 浮层吃掉鼠标事件、`/clear` 之后显示空会话、resize 后 hover 失效、透明区域的点击穿透……踩一个修一个

## 技术栈

顺便记录一下，给未来查文档的自己：

- Swift 6.2 / macOS 15.6+
- SwiftUI 做 UI，AppKit 桥接做无边框浮层（`NotchWindow` / `NotchPanel` 都是 `NSPanel` 子类）
- 状态管理全用 `@Observable`，不再碰 `@StateObject` / `@Published`
- 所有可变共享状态都用 actor 隔离
- 错误处理用 typed throws (SE-0413)，比 `throws` + `catch` any Error 舒服一个档次
- Sparkle 做自动更新，appcast 就托管在你现在看的这个博客 [funfun.zone](https://funfun.zone) 上

## 怎么装

macOS 15.6 以上，去 [Releases](https://github.com/ShuminFu/claude-island/releases/latest) 下最新的 DMG，拖进 Applications。

第一次打开会让你授权 Accessibility 和 Keychain——Accessibility 是用来注入 y/n 按键的，Keychain 是读 Claude Code 的 OAuth token 查额度用的（这个可以跳过），具体步骤 [README](https://github.com/ShuminFu/claude-island#installation-guide) 里都有。

源代码 Apache 2.0：<https://github.com/ShuminFu/claude-island>

如果你用了之后有什么地方崩了或者觉得哪里别扭，欢迎来 issue 区找我吐槽 🫠
