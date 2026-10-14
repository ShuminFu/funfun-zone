---
author: Shumin Fu
pubDatetime: 2026-10-14T11:50:00+08:00
title: "一切网就断？一个 system 让 Clash 把自己锁死了"
slug: clash-dns-system-deadlock
featured: false
draft: false
tags:
  - network
  - clash
  - dns
  - macos
description: 从 WiFi 换到网线，Clash 必报 dns resolve failed。不是节点挂了，是 DNS 配置里的一个 system 让它“自己问自己”。用大白话讲清楚来龙去脉和修法。
---

**先说结论：** 每次从 WiFi 换到网线，Clash 就报 `dns resolve failed`，代理断一阵。节点没坏，坏在 DNS 配置里的一个 `system`：切网的那一两秒，它让 Clash 去问一个已经不存在的路由器，或者绕一圈问回自己，最后卡死。把引导用的 DNS 全换成纯 IP、去掉 `system`，就好了。

下面从头讲。不懂 DNS 也没关系。

## Table of contents

## 我看到的现象

环境是 macOS + Clash Verge Rev，开着 TUN 模式和 fake-ip。

每次把电脑从 WiFi 换到网线，日志里一定冒出这一行：

```text
dns resolve failed: context deadline exceeded
```

意思是“查域名查到超时了”。接着所有走代理的连接全断，过一会儿才恢复。

不是偶尔，是**每次切网必现**。这种“稳定复现”的毛病，反而最好查。

## 先补一课：DNS 是查号台

上网时你输入的是名字，比如 `example.com`。电脑真正要的是号码，也就是 IP 地址。

**DNS 就是查号台：** 给它名字，它告诉你号码。

代理节点也一样。很多节点的地址写的是域名，比如某个 `xxx.cloudapp.azure.com`。Clash 想连节点，**得先查到节点的 IP**。查不到，就连不上，所有走代理的流量一起停。

我那条报错，正是卡在“查节点自己的域名”这一步。

## Clash 里有三本电话簿

Clash 的 DNS 配置里有三组服务器，各管一件事：

| 配置项                    | 管什么                                      | 打个比方                 |
| ------------------------- | ------------------------------------------- | ------------------------ |
| `nameserver`              | 查普通网站的域名                            | 日常查号台               |
| `proxy-server-nameserver` | 专门查**代理节点自己**的域名                | 只给“司机”用的查号台     |
| `default-nameserver`      | 上面两组如果写的是域名，先用它查出它们的 IP | 查“查号台的号码”的查号台 |

第三组有点绕，举个例子：如果你把查号台写成 `doh.pub` 这样的域名，Clash 得先知道 `doh.pub` 的 IP 才能去问它。这时就要先问 `default-nameserver`。

**问题就出在第三组。** 我的 `default-nameserver` 第一项写的是 `system`，也就是“用系统当前的 DNS”。

## 为什么平时没事，一切网就坏

平时网络不动，节点的 IP 早就查好了，连接也早就建好了。DNS 这条链根本不用走，问题藏着。

切网那一刻，三件事同时发生：

1. **旧连接全断。** 默认路线从 WiFi 跳到网线，到节点的代理连接也跟着断了。
2. **必须重新查节点 IP。** 重连之前，得把节点域名再查一遍。
3. **网卡要重新认。** Clash 的 `auto-detect-interface` 要重新判断“现在走哪块网卡”，大约要 1–2 秒。

这三件撞在同一个窗口里，`system` 的毛病就被逼出来了。

## 卡死是怎么发生的

旧配置下，查节点 IP 要走这样一条链：

1. 要查节点域名 → 去问 `proxy-server-nameserver`。
2. 可它写的是 `doh.pub` 这类**域名** → 得先查它的 IP → 去问 `default-nameserver`。
3. `default-nameserver` 第一项是 `system` → 去问系统 DNS。

第 3 步在切网的那一两秒里有两颗雷：

**雷 A：问的是旧路由器。** 连 WiFi 时，系统 DNS 常常是家里路由器，比如 `192.168.x.1`。刚插上网线那一两秒，系统还没换成新网络给的 DNS，还在问旧路由器。可网线那边根本够不着它，只能干等，直到超时。

**雷 B：问题绕回了自己。** TUN 模式开了 `auto-route` 和 `dns-hijack: any:53`，会把本机所有 DNS 查询都抓进 Clash。网卡还没认好的那一刻，`system` 发出的查询被抓回 Clash，变成 **Clash 问 Clash**。而 Clash 自己正卡在等这个答案，于是谁也等不到谁。

就像你给查号台打电话，电话却被转回了你自己的手机。你在等对方说号码，对方就是你。

这就是**死锁**：两边都在等对方，永远等不到。

## 怎么修：全部换成纯 IP

思路很简单：**凡是“还需要再查一次”的东西，都换成“不用查”的纯 IP。** 纯 IP 不依赖任何查号台，新旧网络都能直接连。

只改了两组，改后是这样：

```yaml
default-nameserver:
  - 223.6.6.6
  - 119.29.29.29
  - 8.8.8.8

proxy-server-nameserver:
  - tls://223.5.5.5
  - https://223.6.6.6/dns-query
  - 119.29.29.29

respect-rules: false # 保持不变
```

前后对比：

| 配置项                    | 改之前                                                 | 改之后                          |
| ------------------------- | ------------------------------------------------------ | ------------------------------- |
| `default-nameserver`      | `system`、`223.6.6.6`、`8.8.8.8`，再加两个 IPv6 地址   | 三个纯 IPv4 地址，去掉 `system` |
| `proxy-server-nameserver` | `doh.pub`、`dns.alidns.com`（域名）、`tls://223.5.5.5` | 全部是 IP 形式                  |
| IPv6 引导地址             | 有（我关了 IPv6，它们只会拖慢）                        | 删掉                            |
| `respect-rules`           | `false`                                                | `false`，不动                   |

现在查节点 IP 只要一步：直接问 `tls://223.5.5.5`，拿到答案。切网时最多慢那 1–2 秒，不会再卡死。

## 三条以后配代理都能用的原则

1. **引导用的 DNS 只写纯 IP，绝不写 `system`。** 开了 TUN 劫持，`system` 迟早绕回自己。
2. **查节点的 DNS 用 IP 形式的服务器。** 比如 `tls://223.5.5.5`，一步到位，不用再引导。
3. **`respect-rules` 保持 `false`。** 不然 DNS 查询要走代理，代理又要先靠 DNS 查节点，变成先有鸡还是先有蛋。

## Clash Verge Rev 用户注意：改对文件

我用的是 Clash Verge Rev。它的 DNS 设置真正存在 `dns_config.yaml` 里（在“设置”里打开了 DNS 设置开关时生效）。

- **要改的：** `dns_config.yaml`，这是源文件。改之前先备份一份。
- **别改的：** `clash-verge.yaml`，这是运行时自动生成的，改了也会被覆盖。

改完要让 Verge 重新下发配置，二选一：

- 点“设置 → 重启核心”；
- 或者把“DNS 设置”开关关掉再打开。

## 怎么确认改好了

1. 看生成的配置里 `system` 没了：

```bash
grep -A5 'default-nameserver' clash-verge.yaml
```

2. 切一次 WiFi ⇄ 网线，看日志还会不会出现 `dns resolve failed`。

## 一句话

切网时，`system` 会让 Clash 去问一个够不着的旧路由器，或者绕回去问自己，于是卡死；把引导用的 DNS 全换成纯 IP，这条死路就没了。
