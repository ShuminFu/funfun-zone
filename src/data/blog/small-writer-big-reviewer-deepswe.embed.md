---
author: "Shumin Fu"
pubDatetime: 2026-10-23T14:57:16+08:00
title: "小模型写、大模型审：SWE-bench Pro Hard 与 DeepSWE 上的结对实验"
slug: small-writer-big-reviewer-deepswe
featured: false
draft: false
tags:
  - "ai-agents"
  - "pair-programming"
  - "llm-eval"
description: "便宜的 DeepSeek 写代码、GPT-6.1 Sol 审查，在 DeepSWE 上通过 80.4%，显著好于两者各自单干；附实验细节、复现方法和全部脚本。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed" lang="zh">
<p class="subtitle">2026-10-23 · 数据截至 10-23 14:00（还在跑的：1 份放宽重判、另一批补跑的「GLM 写 + DeepSeek 审」若干题，都不影响主要结论）</p>
<h2>一句话结论</h2>
<p>在能拉开差距的 DeepSWE 上，<strong>便宜的 DeepSeek 写代码、GPT-6.1 Sol 当审查者</strong>，通过 90/112（80.4%），<br>显著好于 DeepSeek 单干（67.9%，p=0.009）和 Sol 单干（67.0%，p=0.011）。<br>GPT 大模型单干（Sol、Sol max、Astra）和 DeepSeek 单干<strong>没有显著差别</strong>，却贵 3–12 倍；把 Sol 的思考强度开到 max 也没有显著提升。<br>SWE-bench Pro Hard 太容易，除 GLM 外所有做法都在 84–94%，分不出高下。</p>
<hr>
<h2>1. 我们想回答什么</h2>
<ul><li>「小模型写 + 大模型审」能不能比「大模型自己写」更好、更便宜？</li><li>换不同的审查者（Sol / Astra / DeepSeek 自己）差多少？</li><li>大模型单干、开最高思考强度，值不值？</li></ul>
<h2>2. 题目</h2>
<table><thead><tr><th>题集</th><th>题数</th><th>为什么选它</th></tr></thead><tbody><tr><td>SWE-bench Pro V2 <strong>Hard</strong></td><td>51</td><td>V2 全集已被做到 87–99%，分不出做法；Hard 是 V2 里最难的子集</td></tr><tr><td><strong>DeepSWE</strong> v1.1</td><td>113（剔除 1 道标准答案都过不了的坏题后 112）</td><td>从零出题防泄题，厂商现在主推；区分度高</td></tr></tbody></table>
<h2>3. 做法</h2>
<p>「A 写 + B 审」表示 A 写代码、B 当审查者兼测试者；「X 单干」表示只有 X 一个模型。</p>
<table><thead><tr><th>做法</th><th>写代码（思考强度）</th><th>审查（思考强度）</th></tr></thead><tbody><tr><td>DeepSeek 单干</td><td>deepseek-flash（未设，服务默认）</td><td>—</td></tr><tr><td>GLM 单干</td><td>glm-5.3-flash（low）</td><td>—</td></tr><tr><td>Sol 单干</td><td>gpt-6.1-sol（未设 = medium）</td><td>—</td></tr><tr><td>Sol 单干（max）</td><td>gpt-6.1-sol（<strong>max</strong>）</td><td>—</td></tr><tr><td>Astra 单干</td><td>gpt-6-astra（未设，默认）</td><td>—</td></tr><tr><td>DeepSeek 写 + DeepSeek 审</td><td>deepseek-flash</td><td>deepseek-flash</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>glm-5.3-flash（low）</td><td>deepseek-flash</td></tr><tr><td>DeepSeek 写 + Sol 审</td><td>deepseek-flash</td><td>gpt-6.1-sol（默认）</td></tr><tr><td>DeepSeek 写 + Astra 审</td><td>deepseek-flash</td><td>gpt-6-astra（默认）</td></tr><tr><td>Sol 写 + Sol 审</td><td>gpt-6.1-sol</td><td>gpt-6.1-sol（自己审自己）</td></tr></tbody></table>
<p>思考强度实测（同一道推理题，推理 token 数）：未设 367、medium 270、high 473、xhigh 1034、max 2555。未设时按 medium 处理（回显 medium）。</p>
<h2>4. 跑法（harness）</h2>
<ul><li><strong>Agent</strong>：Codex CLI <code>0.155.1</code>，在题目自带的 Docker 镜像里跑，<strong>断网</strong>（<code>--network none</code>）；唯一出口是一条 unix socket，转发到模型服务。</li><li><strong>单干</strong>：一个 Codex 会话做题；没写完就提示「继续」，最多 6 次。</li><li><strong>结对</strong>：A 写，写完交给 B；B 检查、跑测试，不通过就把意见发回 A，最多 5 轮，直到 B 回 <code>APPROVED</code>。</li><li><strong>时限</strong>：DeepSWE 每题 3 小时，Hard 每题 50 分钟（结对两方共用）。</li><li><strong>判分</strong>：全新容器，套上 agent 的代码改动，跑官方 <code>tests/test.sh</code>（不改动）。DeepSWE 判分容器也断网，只判已提交的代码。</li><li><strong>模型看不到判分测试</strong>：<code>tests/</code> 目录只在判分容器里出现；agent 容器里只有仓库原有的老测试。</li><li><strong>标准答案校验</strong>：每题顺手判一次官方标准答案；在所有机器上都过不了的题剔除（DeepSWE 剔除 <code>python-statemachine-state-data-scoping</code>）。</li><li><strong>补跑</strong>：答题过程被模型服务报错或超时打断的失败，都补跑一次；旧记录保留但不计入，统计用补跑结果。补跑后逐个核查了失败记录，剩下的失败都是模型自己说做完了、其实没做对。</li><li><strong>价格</strong>：一律按官方原价（Standard 档）记，美元/百万 token：</li></ul>
<table><thead><tr><th>模型</th><th>未命中输入</th><th>命中缓存输入</th><th>输出</th></tr></thead><tbody><tr><td>deepseek-flash</td><td>0.15</td><td>0.03</td><td>0.60</td></tr><tr><td>glm-5.3-flash</td><td>0.15</td><td>0.03</td><td>0.50</td></tr><tr><td>gpt-6.1-sol</td><td>2.00</td><td>0.10</td><td>10.00</td></tr><tr><td>gpt-6-astra</td><td>10.00</td><td>1.00</td><td>50.00</td></tr></tbody></table>
<h2>5. 结果</h2>
<h3>5.1 DeepSWE（112 题）</h3>
<table><thead><tr><th>做法</th><th>通过</th><th>通过率</th><th>95% 置信区间</th><th>总花费</th><th>每题花费中位</th><th>每题分钟中位</th></tr></thead><tbody><tr><td><strong>DeepSeek 写 + Sol 审</strong></td><td><strong>90</strong></td><td><strong>80.4%</strong></td><td>72–87%</td><td>$163</td><td>$1.12</td><td>24.6</td></tr><tr><td>DeepSeek 写 + Astra 审</td><td>85</td><td>75.9%</td><td>67–83%</td><td>$456</td><td>$2.85</td><td>15.3</td></tr><tr><td>Sol 单干（max）</td><td>79</td><td>70.5%</td><td>62–78%</td><td>$238</td><td>$1.62</td><td>43.8*</td></tr><tr><td>DeepSeek 写 + DeepSeek 审</td><td>79</td><td>70.5%</td><td>62–78%</td><td>$123</td><td>$0.84</td><td>21.5</td></tr><tr><td>DeepSeek 单干</td><td>76</td><td>67.9%</td><td>59–76%</td><td><strong>$33</strong></td><td>$0.24</td><td>12.7</td></tr><tr><td>Sol 单干</td><td>75</td><td>67.0%</td><td>58–75%</td><td>$89</td><td>$0.58</td><td>14.0</td></tr><tr><td>Astra 单干</td><td>72</td><td>64.3%</td><td>55–73%</td><td>$412</td><td>$2.09</td><td>8.1</td></tr><tr><td>Sol 写 + Sol 审</td><td>68</td><td>60.7%</td><td>52–69%</td><td>$296</td><td>$1.85</td><td>22.0</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>66</td><td>58.9%</td><td>50–68%</td><td>$134</td><td>$0.69</td><td>36.2</td></tr><tr><td>GLM 单干</td><td>29</td><td>25.9%</td><td>19–35%</td><td>$25</td><td>$0.14</td><td>22.1</td></tr></tbody></table>
<p>&#42; Sol 单干（max）有 10 题的补跑换了一条更快的模型服务线路，用时不完全可比；通过率不受影响。</p>
<p>配对检验（McNemar 精确检验，只看两种做法在同一题上一对一错的题）：</p>
<table><thead><tr><th>对比</th><th>前者独赢 : 后者独赢</th><th>p</th></tr></thead><tbody><tr><td>DeepSeek 写 + Sol 审 vs DeepSeek 单干</td><td>20 : 6</td><td><strong>0.009</strong></td></tr><tr><td>DeepSeek 写 + Sol 审 vs Sol 单干</td><td>23 : 8</td><td><strong>0.011</strong></td></tr><tr><td>DeepSeek 写 + Astra 审 vs Astra 单干</td><td>23 : 10</td><td><strong>0.035</strong></td></tr><tr><td>DeepSeek 写 + Astra 审 vs DeepSeek 单干</td><td>19 : 10</td><td>0.136</td></tr><tr><td>DeepSeek 写 + DeepSeek 审 vs DeepSeek 单干</td><td>16 : 13</td><td>0.711</td></tr><tr><td>Sol 单干 vs DeepSeek 单干</td><td>17 : 18</td><td>1.000</td></tr><tr><td>Sol 单干（max）vs DeepSeek 单干</td><td>19 : 16</td><td>0.736</td></tr><tr><td>Astra 单干 vs DeepSeek 单干</td><td>17 : 21</td><td>0.627</td></tr><tr><td>Sol 单干（max）vs Sol 单干（默认强度）</td><td>12 : 8</td><td>0.503</td></tr><tr><td>Sol 写 + Sol 审（自己审自己）vs Sol 单干</td><td>9 : 16</td><td>0.230</td></tr><tr><td>GLM 写 + DeepSeek 审 vs GLM 单干</td><td>44 : 7</td><td>&lt;0.001</td></tr></tbody></table>
<h3>5.2 SWE-bench Pro Hard（51 题）</h3>
<table><thead><tr><th>做法</th><th>通过</th><th>通过率</th><th>95% 置信区间</th><th>总花费</th><th>每题花费中位</th><th>每题分钟中位</th></tr></thead><tbody><tr><td>DeepSeek 写 + Sol 审</td><td>48</td><td>94.1%</td><td>84–98%</td><td>$36.8</td><td>$0.47</td><td>15.2</td></tr><tr><td>Sol 写 + Sol 审</td><td>47</td><td>92.2%</td><td>82–97%</td><td>$70.0</td><td>$0.93</td><td>11.4</td></tr><tr><td>Sol 单干（max）</td><td>46</td><td>90.2%</td><td>79–96%</td><td>$43.5</td><td>$0.69</td><td>14.9</td></tr><tr><td>Sol 单干</td><td>45</td><td>88.2%</td><td>77–95%</td><td>$23.7</td><td>$0.39</td><td>7.7</td></tr><tr><td>Astra 单干</td><td>45</td><td>88.2%</td><td>77–95%</td><td>$78.6</td><td>$1.07</td><td>4.2</td></tr><tr><td>DeepSeek 单干</td><td>44</td><td>86.3%</td><td>74–93%</td><td>$6.8</td><td>$0.10</td><td>10.1</td></tr><tr><td>DeepSeek 写 + DeepSeek 审</td><td>44</td><td>86.3%</td><td>74–93%</td><td>$15.3</td><td>$0.24</td><td>13.1</td></tr><tr><td>DeepSeek 写 + Astra 审</td><td>43</td><td>84.3%</td><td>72–92%</td><td>$110.5</td><td>$1.47</td><td>9.2</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>37</td><td>72.5%</td><td>59–83%</td><td>$17.6</td><td>$0.24</td><td>17.0</td></tr><tr><td>GLM 单干</td><td>24</td><td>47.1%</td><td>34–61%</td><td>$3.2</td><td>$0.04</td><td>9.5</td></tr></tbody></table>
<p>Hard 上只有 GLM 相关的对比显著（GLM 写 + DeepSeek 审 vs GLM 单干 15:2，p=0.002；DeepSeek 单干 vs GLM 单干 21:1，p&lt;0.001）。<br>其余都不显著，例如 DeepSeek 写 + Sol 审 vs DeepSeek 单干 6:2（p=0.29）。</p>
<h3>5.3 读法</h3>
<ol><li><strong>结对有用，但审查者要比写的人强。</strong> DeepSeek 写 + Sol 审显著好于双方各自单干；DeepSeek 自己审自己（DeepSeek 写 + DeepSeek 审）没有显著提升。</li><li><strong>大模型单干不比小模型单干强。</strong> Sol / Sol max / Astra 单干 64–71%，DeepSeek 单干 68%，差别不显著，花费是 3–12 倍。</li><li><strong>max 思考强度不值。</strong> Sol max 比默认多 4 题，不显著，花费 2.7 倍。</li><li><strong>大模型自己审自己没用。</strong> Sol 写 + Sol 审反而低于 Sol 单干（60.7% vs 67.0%，不显著）。</li></ol>
<h2>6. 过程中发现的问题和处理</h2>
<h3>6.1 判分时测试卡死</h3>
<p>有 8 份答案判分时测试卡住，30 分钟上限超时；空闲时放宽到 2 小时重判，仍然全部超时。按失败计。<br>同一套测试，别的做法的答案几分钟就判完，所以问题出在<strong>这几份答案的代码</strong>。</p>
<p>我们把其中 7 份放进断网容器重跑测试，10 分钟后拍下容器里每个进程在干什么（CPU、内核等待点、打开的连接）。卡法分三种：</p>
<table><thead><tr><th>卡法</th><th>题目（哪种做法的答案）</th><th>现场</th><th>原因</th></tr></thead><tbody><tr><td>互相等，谁也不动</td><td>pwntools「多路复用管道」（Sol 单干、Astra 单干）</td><td>pytest 停在 <code>test_flow_control_does_not_block_other_channels</code>，CPU 0%，线程在等锁</td><td>一条通道塞满后，代码把<strong>所有</strong>通道都堵住了——这正是这条测试要抓的毛病，测试于是永远等下去</td></tr><tr><td>互相等，谁也不动</td><td>koota「组合特性」（GLM 单干、Astra 单干、GLM 写 + DeepSeek 审）</td><td>老测试都跑完，新测试 <code>aspect.test.ts</code> 一开始就不动，CPU 0.1%</td><td>新代码里某个等待永远没人来叫醒（三份答案卡在同一处）</td></tr><tr><td>原地打转</td><td>claude-code「递归委派」（Astra 单干）</td><td>测试进程 CPU 一直 102%</td><td>委派自己调自己，没有停下来的条件，死循环</td></tr><tr><td>测完不退出</td><td>langchain「请求合并」（GLM 单干）</td><td>测试 26 秒就跑完（4 个失败），但 pytest 进程一直不退出</td><td>后台线程报错死掉，等它结果的线程永远等着，又不是后台守护线程，进程退不掉</td></tr></tbody></table>
<p>模型看不到这些隐藏测试（只看得到仓库原有测试），所以这类「测试一跑就卡」也是真实的答错，不是判分工具的问题。</p>
<h2>7. 复现方法</h2>
<p>全部脚本附在文末附录（5 个 Python 文件，点开看全文）。下面的命令都在放脚本和题目的目录里跑。</p>
<h3>7.0 做法和代号对照</h3>
<p>脚本里每种做法用一个代号：</p>
<table><thead><tr><th>做法</th><th>代号</th></tr></thead><tbody><tr><td>Sol 单干（max）</td><td><code>solo_solmax</code></td></tr><tr><td>Astra 单干</td><td><code>solo_astra</code></td></tr><tr><td>Sol 单干</td><td><code>solo_sol</code></td></tr><tr><td>DeepSeek 单干</td><td><code>solo_dsf</code></td></tr><tr><td>GLM 单干</td><td><code>solo_glm</code></td></tr><tr><td>DeepSeek 写 + Astra 审</td><td><code>dsf_t_astra</code></td></tr><tr><td>DeepSeek 写 + Sol 审</td><td><code>dsf_t_sol</code></td></tr><tr><td>DeepSeek 写 + DeepSeek 审</td><td><code>dsf_t_dsf</code></td></tr><tr><td>GLM 写 + DeepSeek 审</td><td><code>glm_t_dsf</code></td></tr><tr><td>Sol 写 + Sol 审</td><td><code>sol_t_sol</code></td></tr></tbody></table>
<h3>7.1 准备</h3>
<ol><li>一台 16 核 / 60G 的 Linux 机器，装 Docker。</li><li>题目：SWE-bench Pro V2 仓库（<code>SWE-bench_Pro-os/v2/tasks</code>）和 DeepSWE v1.1（<code>deep-swe/tasks</code>），和脚本放在同一目录；题单 <code>hard51.json</code>、<code>deepswe113.json</code>（题目 id 列表）。</li><li><code>bin/</code> 里放 Codex CLI 0.155.1（官方 musl 静态版 <code>codex</code> 和 <code>codex-code-mode-host</code>）、<code>rg</code>，以及附件里的 <code>bin/inrelay.py</code>（容器里的小转发器）；整个目录只读挂进容器 <code>/opt/pbcodex</code>。</li><li>一个兼容 OpenAI Responses 接口的模型服务，地址和令牌写进 <code>~/.pairbench.env</code>：<code>PAIRBENCH_GATEWAY_URL=…</code>、<code>PAIRBENCH_GATEWAY_TOKEN=…</code>（令牌只按变量名传给容器，不打印）。路径不是 <code>/v1</code> 时设 <code>PB_GW_PATH</code>。</li></ol>
<h3>7.2 跑一种做法</h3>
<pre><code>set -a &amp;&amp; . ~/.pairbench.env &amp;&amp; set +a
PB_BENCH=deepswe RES=results-deepswe python3 run_swepro.py dsf_t_sol --tasks deepswe113.json --par 8
PB_BENCH=hard    RES=results-hard    python3 run_swepro.py dsf_t_sol --tasks hard51.json     --par 8</code></pre>
<ul><li>模型和思考强度在 <code>run_swepro.py</code> 的 <code>MODELS</code> / <code>ARMS</code> 里，提示词也在里面。</li><li>每题结果写 <code>results-*/&lt;代号&gt;/&lt;题&gt;.json</code>（含用量、用时、判分细节）和 <code>.patch</code>（模型的代码改动）。</li></ul>
<h3>7.3 补跑与重判</h3>
<pre><code># 被服务报错/超时打断的失败：旧记录移到 _superseded/，再跑一次，记录带 rerun_reason
# jobs.json 形如 [{&quot;arm&quot;: &quot;solo_sol&quot;, &quot;id&quot;: &quot;&lt;题&gt;&quot;, &quot;why&quot;: &quot;&lt;原因&gt;&quot;}]
PB_BENCH=deepswe RES=results-deepswe python3 rerun_driver.py jobs.json 4
# 判分超时的放宽到 2 小时重判
PB_BENCH=deepswe RES=results-deepswe python3 regrade_long.py 3 &lt;代号&gt;/&lt;题&gt; ...</code></pre>
<h3>7.4 统计</h3>
<pre><code># 多台机器时，把各机器的 results-* 拷到 collected-results-*/&lt;机器名&gt;/ 下；单机就放一个子目录
python3 report.py            # 通过率 + Wilson 置信区间 + 花费 + 用时 + McNemar</code></pre>
<p>取数规则：去掉占位；同一 (做法, 题) 有多份时优先补跑记录，其次取开工最早的；剔除标准答案都过不了的题；价格按原价。</p>
<h2>8. 局限</h2>
<ul><li>每个 (做法, 题) 只跑了一次，没有重复跑估计随机性。</li><li>Sol 单干（max）的部分补跑题换了模型服务线路，用时不完全可比。</li><li>Hard 已接近饱和，结论主要来自 DeepSWE。</li><li>思考强度用的是默认（medium）；榜单常用最高档，这会让 GPT 单干分数低于公开榜单。</li></ul>
<h2>附录：脚本</h2>
<table><thead><tr><th>文件</th><th>做什么</th></tr></thead><tbody><tr><td><code>run_swepro.py</code></td><td>主程序：拉镜像、起断网容器、跑 Codex（单干或结对）、判分、记用量和用时</td></tr><tr><td><code>rerun_driver.py</code></td><td>补跑一批 (做法, 题)，旧记录挪到 <code>_superseded/</code></td></tr><tr><td><code>regrade_long.py</code></td><td>答案不重做，把判分时限放宽到 2 小时重判</td></tr><tr><td><code>bin/inrelay.py</code></td><td>断网容器里的转发器：把 <code>127.0.0.1:18080</code> 上的请求经 unix socket 交给宿主，再由宿主发给模型服务</td></tr><tr><td><code>report.py</code></td><td>汇总：通过率、Wilson 置信区间、花费、用时、McNemar 配对检验</td></tr></tbody></table>
<details><summary><code>run_swepro.py</code></summary>
<pre><code>#!/usr/bin/env python3
&quot;&quot;&quot;SWE-bench Pro V2 上跑结对：agent 在题目自带的容器里改代码，判分在全新容器里跑官方 tests/test.sh。
<span></span>
模型都经一个兼容 OpenAI Responses 接口的模型服务调用（deepseek-flash / glm-5.3-flash / gpt-6.1-sol / gpt-6-astra）。
- 每道题一个镜像 ghcr.io/scaleapi/swe-bench_pro-v2:&lt;id&gt;；同一道题的几个做法共用一次拉取，全部判完就删镜像。
- codex（官方 musl 静态版 0.155.1）只读挂进容器，用 docker exec 在容器里跑，所以 agent 的命令都在题目环境里执行。
- 结对协议：开发者写完 → 独立测试员只按题目写自己的测试去跑 → REVISE 带反例打回，最多 5 轮。
- 判分照官方 patch_replay：抓 agent 容器里的 git diff，套到全新容器，跑 tests/test.sh，读 /logs/verifier/reward.txt。
模型服务地址/令牌从环境变量 PAIRBENCH_GATEWAY_URL / PAIRBENCH_GATEWAY_TOKEN 读；令牌只按变量名透传给 docker exec，从不打印。
用法：source ~/.pairbench.env &amp;&amp; python3 run_swepro.py &lt;arms&gt; [--tasks sample100.json] [--par 4]
      python3 run_swepro.py --smoke &lt;id&gt;...   # 官方答案应判对、空补丁应判错
&quot;&quot;&quot;
import argparse, json, os, re, shutil, subprocess, sys, threading, time, traceback, hashlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
<span></span>
T = Path(__file__).resolve().parent
# 两套题共用这个脚本：PB_BENCH=swepro（SWE-bench Pro V2）或 deepswe（DeepSWE v1.1，从零出题防泄题）
BENCH = os.environ.get(&quot;PB_BENCH&quot;, &quot;swepro&quot;)
TASKS = T / (&quot;deep-swe/tasks&quot; if BENCH == &quot;deepswe&quot; else &quot;SWE-bench_Pro-os/v2/tasks&quot;)
RES = T / os.environ.get(&quot;RES&quot;, &quot;results&quot;)
WORK = T / os.environ.get(&quot;PB_WORK&quot;, &quot;work&quot;)
BIN = T / &quot;bin&quot;                       # codex + codex-code-mode-host + rg
GW = os.environ.get(&quot;PAIRBENCH_GATEWAY_URL&quot;, &quot;&quot;).rstrip(&quot;/&quot;)
# 官方锁定协议：每题 50 分钟硬上限（结对两方共用），容器里用 timeout 掐，到点照样抓 diff 去判
# DeepSWE 官方 agent 上限 10800s（3 小时）
BUDGET_S, MAX_CONT, MAX_REVIEW = (10800 if BENCH == &quot;deepswe&quot; else 50 * 60) - 60, 6, 5
AGENT_GW = &quot;http://127.0.0.1:18080&quot;   # agent 容器断网，只能经这个回环端口 -&gt; 宿主转发器 -&gt; 模型服务
GW_PATH = os.environ.get(&quot;PB_GW_PATH&quot;, &quot;/v1&quot;)  # local-pool proxy path override
SOCK = Path(os.environ.get(&quot;PB_SOCK&quot;, T / (&quot;sock-&quot; + BENCH)))   # 每套评测一个转发口：两个进程抢同一个 gw.sock 会互相顶掉
GRADE_CAP_S = 1800 if BENCH == &quot;deepswe&quot; else 3000
# 每个容器的资源上限；PAR_FILE 里写同时跑几道题（跑着跑着可以改，autoscale 会改它）
CPUS, MEM = os.environ.get(&quot;PB_CPUS&quot;, &quot;2&quot;), os.environ.get(&quot;PB_MEM&quot;, &quot;6g&quot;)
PAR_FILE = Path(os.environ.get(&quot;PAR_FILE&quot;, T / &quot;par.txt&quot;))
LOCK = threading.Lock()
<span></span>
ARMS = {&quot;solo_dsf&quot;: (&quot;dsf&quot;, None), &quot;solo_glm&quot;: (&quot;glm&quot;, None),
        &quot;dsf_t_dsf&quot;: (&quot;dsf&quot;, &quot;dsf&quot;), &quot;dsf_t_sol&quot;: (&quot;dsf&quot;, &quot;sol&quot;), &quot;glm_t_dsf&quot;: (&quot;glm&quot;, &quot;dsf&quot;),
        &quot;dsf_t_astra&quot;: (&quot;dsf&quot;, &quot;astra&quot;),
        &quot;solo_sol&quot;: (&quot;sol&quot;, None), &quot;solo_astra&quot;: (&quot;astra&quot;, None),
        &quot;sol_t_sol&quot;: (&quot;sol&quot;, &quot;sol&quot;),
        &quot;solo_solmax&quot;: (&quot;solmax&quot;, None)}   # 10-22 加：Sol 推理开到 max 单干（榜单用 max；不设时模型服务默认 medium）   # 10-22 加：Sol 写 + Sol 审   # 10-22 加：大模型单干对照   # 10-21 加：最强的 GPT 当审查者
MODELS = {&quot;glm&quot;: (&quot;glm-5.3-flash&quot;, &quot;low&quot;), &quot;dsf&quot;: (&quot;deepseek-flash&quot;, &quot;&quot;), &quot;sol&quot;: (&quot;gpt-6.1-sol&quot;, &quot;&quot;), &quot;astra&quot;: (&quot;gpt-6-astra&quot;, &quot;&quot;), &quot;solmax&quot;: (&quot;gpt-6.1-sol&quot;, &quot;max&quot;)}
<span></span>
<span></span>
def log(*a):
    with LOCK: print(time.strftime(&quot;%H:%M:%S&quot;), *a, flush=True)
<span></span>
<span></span>
def sh(cmd, timeout=600, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, **kw)
<span></span>
<span></span>
def has_marker(text, *marks):
    &quot;&quot;&quot;收尾标记只认单独成行（子串匹配会把正文里的 finished 当交卷）。&quot;&quot;&quot;
    lines = [re.sub(r&quot;[*`_#&gt;\s.:!]+&quot;, &quot; &quot;, l).strip().upper() for l in (text or &quot;&quot;).splitlines() if l.strip()]
    return any(l in marks for l in lines[-3:])
<span></span>
<span></span>
def verdict(text):
    m = re.findall(r&quot;VERDICT:\s*(APPROVED|REVISE)&quot;, text or &quot;&quot;, re.I)
    return m[-1].upper() if m else (&quot;APPROVED&quot; if re.search(r&quot;\bAPPROVED\b&quot;, text or &quot;&quot;) else &quot;REVISE&quot;)
<span></span>
<span></span>
class GatewayDown(RuntimeError):
    pass
<span></span>
<span></span>
# ---------- 容器 ----------
def image_of(tid):
    m = re.search(r&#x27;docker_image\s*=\s*&quot;([^&quot;]+)&quot;&#x27;, (TASKS / tid / &quot;task.toml&quot;).read_text())
    return m.group(1)
<span></span>
<span></span>
MIRROR = os.environ.get(&quot;PB_MIRROR&quot;, &quot;ghcr.nju.edu.cn&quot;)   # 国内直连 ghcr 只有 ~130KB/s，走国内镜像站
<span></span>
<span></span>
def official_digest(img):
    &quot;&quot;&quot;向 ghcr.io 官方查这个 tag 的校验值（只取清单，很快），再按校验值从镜像站拉：快，而且内容不会被换掉。&quot;&quot;&quot;
    repo, tag = img.split(&quot;/&quot;, 1)[1].rsplit(&quot;:&quot;, 1)
    tok = json.loads(sh([&quot;curl&quot;, &quot;-sS&quot;, &quot;-m&quot;, &quot;30&quot;, f&quot;https://ghcr.io/token?scope=repository:{repo}:pull&quot;]).stdout)[&quot;token&quot;]
    acc = (&quot;application/vnd.oci.image.index.v1+json,application/vnd.oci.image.manifest.v1+json,&quot;
           &quot;application/vnd.docker.distribution.manifest.v2+json,application/vnd.docker.distribution.manifest.list.v2+json&quot;)
    h = sh([&quot;curl&quot;, &quot;-sSI&quot;, &quot;-m&quot;, &quot;30&quot;, &quot;-H&quot;, f&quot;Authorization: Bearer {tok}&quot;, &quot;-H&quot;, f&quot;Accept: {acc}&quot;,
            f&quot;https://ghcr.io/v2/{repo}/manifests/{tag}&quot;]).stdout
    m = re.search(r&quot;docker-content-digest:\s*(sha256:[0-9a-f]{64})&quot;, h, re.I)
    if not m: raise RuntimeError(&quot;no digest for &quot; + tag[:60])
    return repo, m.group(1)
<span></span>
<span></span>
def pull(img):
    if not img.startswith(&quot;ghcr.io/&quot;):   # DeepSWE 在 public.ecr.aws，没有国内镜像站，直接拉
        for i in range(4):
            r = sh([&quot;docker&quot;, &quot;pull&quot;, &quot;-q&quot;, img], timeout=3600)
            if r.returncode == 0: return
            log(&quot;pull retry&quot;, i, img.split(&quot;:&quot;)[-1][:60], r.stderr.strip()[-200:]); time.sleep(30)
        raise RuntimeError(&quot;pull failed &quot; + img)
    for i in range(4):
        try:
            repo, dg = official_digest(img)
            r = sh([&quot;docker&quot;, &quot;pull&quot;, &quot;-q&quot;, f&quot;{MIRROR}/{repo}@{dg}&quot;], timeout=1800)
            if r.returncode == 0:
                sh([&quot;docker&quot;, &quot;tag&quot;, f&quot;{MIRROR}/{repo}@{dg}&quot;, img]); return
            err = r.stderr.strip()[-200:]
        except Exception as e:
            err = repr(e)[:200]
        log(&quot;pull retry&quot;, i, img.split(&quot;:&quot;)[-1][:60], err); time.sleep(30)
    raise RuntimeError(&quot;pull failed &quot; + img)
<span></span>
<span></span>
def drop_image(img):
    if os.environ.get(&quot;PB_KEEP_IMAGE&quot;): return   # 同一道题重复跑时别互相删镜像
    repo = img.split(&quot;/&quot;, 1)[1].rsplit(&quot;:&quot;, 1)[0]
    ids = sh([&quot;docker&quot;, &quot;images&quot;, &quot;-q&quot;, img]).stdout.split()
    sh([&quot;docker&quot;, &quot;rmi&quot;, &quot;-f&quot;, img] + ids, timeout=600)   # 镜像 1–4G，判完就删（tag 和按校验值拉的那份一起删）
<span></span>
<span></span>
def start(name, img, home=None, offline=False):
    # --cpu-shares 64（默认 1024）：容器里的进程不吃宿主上的 nice，靠这个在共用机器上让着别人
    sh([&quot;docker&quot;, &quot;rm&quot;, &quot;-f&quot;, name])
    # 只让容器「看到」分给它的那几个核：不加 cpuset 时 go test / jest / pytest -n auto 按宿主几十核开并行，
    # 一个容器里冒出上千线程挤在 2 核里排队，10-21 把两台机器的负载顶到上千。按容器名散列挑一段连续的核。
    ncpu, k = os.cpu_count() or 2, max(1, int(float(CPUS) + 0.999))
    first = (int(hashlib.md5(name.encode()).hexdigest(), 16) % max(1, ncpu // k)) * k
    cpuset = f&quot;{first}-{first + k - 1}&quot; if k &gt; 1 else str(first)
    cmd = [&quot;docker&quot;, &quot;run&quot;, &quot;-d&quot;, &quot;--name&quot;, name, &quot;--cpus&quot;, CPUS, &quot;--cpuset-cpus&quot;, cpuset, &quot;-e&quot;, f&quot;GOMAXPROCS={k}&quot;,
           &quot;--memory&quot;, MEM, &quot;--pids-limit&quot;, &quot;4096&quot;,
           &quot;--label&quot;, &quot;pairbench=1&quot;, &quot;--cpu-shares&quot;, &quot;64&quot;, &quot;--entrypoint&quot;, &quot;sleep&quot;,
           # 国内连不上 proxy.golang.org / sum.golang.org：改走国内镜像，否则改了 go.mod 的题连标准答案都编不过
           &quot;-e&quot;, &quot;GOPROXY=https://goproxy.cn,direct&quot;, &quot;-e&quot;, &quot;GOSUMDB=sum.golang.google.cn&quot;, &quot;-v&quot;, f&quot;{BIN}:/opt/pbcodex:ro&quot;]
    if offline and not home: cmd += [&quot;--network&quot;, &quot;none&quot;]   # DeepSWE 判分也断网（官方 verifier network_mode = no-network）
    if home: cmd += [&quot;--network&quot;, &quot;none&quot;, &quot;-v&quot;, f&quot;{home}:/pbhome&quot;, &quot;-v&quot;, f&quot;{SOCK}:/pbsock&quot;]   # 官方：agent 阶段只许连模型接口
    r = sh(cmd + [img, &quot;infinity&quot;], timeout=300)
    if r.returncode: raise RuntimeError(&quot;docker run: &quot; + r.stderr[-300:])
    if home:   # agent 容器：codex 跑命令用登录 shell，/etc/profile 会重置 PATH，这里把镜像原 PATH 补回去
        sh([&quot;docker&quot;, &quot;exec&quot;, name, &quot;bash&quot;, &quot;-c&quot;, &#x27;echo &quot;export PATH=$PATH&quot; &gt; /etc/profile.d/zz-pb-path.sh&#x27;])
        sh([&quot;docker&quot;, &quot;exec&quot;, &quot;-d&quot;, name, &quot;python3&quot;, &quot;/opt/pbcodex/inrelay.py&quot;])
        probe = (&quot;import socket,time\nfor i in range(50):\n    try: socket.create_connection((&#x27;127.0.0.1&#x27;,18080),1).close(); print(&#x27;up&#x27;); break\n&quot;
                 &quot;    except Exception: time.sleep(0.2)\n&quot;
                 &quot;try: socket.create_connection((&#x27;1.1.1.1&#x27;,443),3); print(&#x27;LEAK&#x27;)\nexcept Exception: print(&#x27;sealed&#x27;)&quot;)
        r = sh([&quot;docker&quot;, &quot;exec&quot;, name, &quot;python3&quot;, &quot;-c&quot;, probe]).stdout
        if &quot;up&quot; not in r or &quot;sealed&quot; not in r: raise RuntimeError(&quot;network lock probe failed: &quot; + r[-200:])
    return name
<span></span>
<span></span>
def dexec(name, script, timeout=600, env=()):
    # 用 bash -c 不用 -lc：登录 shell 会读 /etc/profile 把 PATH 重置，镜像里的 /usr/local/go/bin 之类就丢了（vuls 标准答案得 0 分）
    cmd = [&quot;docker&quot;, &quot;exec&quot;] + sum([[&quot;-e&quot;, e] for e in env], []) + [name, &quot;bash&quot;, &quot;-c&quot;, script]
    return sh(cmd, timeout=timeout)
<span></span>
<span></span>
def repo_root(name):
    return dexec(name, &quot;cd /app 2&gt;/dev/null &amp;&amp; pwd || (cd /testbed &amp;&amp; pwd)&quot;).stdout.strip() or &quot;/app&quot;
<span></span>
<span></span>
def start_gw_relay():
    &quot;&quot;&quot;宿主上的转发器：SOCK/gw.sock -&gt; 模型服务 host:port。agent 容器断网后唯一能出去的路，目的地写死成模型服务。&quot;&quot;&quot;
    import socket
    from urllib.parse import urlparse
    u = urlparse(GW); dst = (u.hostname, u.port or (443 if u.scheme == &quot;https&quot; else 80))
    SOCK.mkdir(exist_ok=True); os.chmod(SOCK, 0o777)
    path = SOCK / &quot;gw.sock&quot;
    path.unlink(missing_ok=True)
    srv = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM); srv.bind(str(path)); os.chmod(path, 0o777); srv.listen(256)
<span></span>
    def pump(a, b):
        try:
            while True:
                d = a.recv(65536)
                if not d: break
                b.sendall(d)
        except Exception: pass
        finally:
            for x in (a, b):
                try: x.shutdown(socket.SHUT_RDWR)
                except Exception: pass
<span></span>
    def handle(c):
        try: g = socket.create_connection(dst, 15)
        except Exception: c.close(); return
        g.settimeout(None)
        threading.Thread(target=pump, args=(c, g), daemon=True).start(); pump(g, c)
<span></span>
    def loop():
        while True:
            c, _ = srv.accept(); threading.Thread(target=handle, args=(c,), daemon=True).start()
    threading.Thread(target=loop, daemon=True).start()
<span></span>
<span></span>
# ---------- agent ----------
class DockerCodex:
    &quot;&quot;&quot;容器里的一个 codex 会话：第一轮 exec，之后 exec resume &lt;thread&gt;。会话记录落在挂进来的 /pbhome/codex-&lt;who&gt;。&quot;&quot;&quot;
<span></span>
    def __init__(self, who, cname, root, role, deadline):
        self.model, self.effort = MODELS[who]; self.deadline = deadline
        self.cname, self.root, self.home, self.thread = cname, root, f&quot;/pbhome/codex-{role}&quot;, None
        self.usage = {&quot;model&quot;: self.model, &quot;input&quot;: 0, &quot;cached&quot;: 0, &quot;output&quot;: 0, &quot;turns&quot;: 0}
<span></span>
    def turn(self, text):
        cfg = [&quot;-c&quot;, &quot;model_provider=pb&quot;,
               &quot;-c&quot;, f&quot;model_providers.pb={{ name=&#x27;pb&#x27;, base_url=&#x27;{AGENT_GW}{GW_PATH}&#x27;, env_key=&#x27;PAIRBENCH_GATEWAY_TOKEN&#x27;, wire_api=&#x27;responses&#x27; }}&quot;,
               &quot;-c&quot;, &quot;model_context_window=258400&quot;, &quot;-c&quot;, &quot;web_search=&#x27;disabled&#x27;&quot;]
        if self.effort: cfg += [&quot;-c&quot;, f&quot;model_reasoning_effort={self.effort}&quot;]
        common = [&quot;--json&quot;, &quot;--skip-git-repo-check&quot;, &quot;--ignore-user-config&quot;, &quot;--dangerously-bypass-approvals-and-sandbox&quot;,
                  &quot;-m&quot;, self.model] + cfg
        sub = [&quot;exec&quot;, &quot;resume&quot;, self.thread] if self.thread else [&quot;exec&quot;, &quot;-C&quot;, self.root]
        cmd = [&quot;docker&quot;, &quot;exec&quot;, &quot;-w&quot;, self.root, &quot;-e&quot;, &quot;PAIRBENCH_GATEWAY_TOKEN&quot;, &quot;-e&quot;, f&quot;CODEX_HOME={self.home}&quot;,
               self.cname, &quot;bash&quot;, &quot;-c&quot;, f&#x27;export PATH=/opt/pbcodex:$PATH; mkdir -p {self.home} &amp;&amp; exec &quot;$@&quot;&#x27;, &quot;_&quot;, &quot;/opt/pbcodex/codex&quot;] + sub + common + [text]
        left = int(self.deadline - time.time())
        if left &lt; 60: return &quot;(no reply; budget exhausted)&quot;
        cmd[cmd.index(&quot;/opt/pbcodex/codex&quot;)] = &quot;timeout&quot;   # 容器里的 timeout：客户端断了 codex 也会停
        cmd[cmd.index(&quot;timeout&quot;) + 1:cmd.index(&quot;timeout&quot;) + 1] = [&quot;-k&quot;, &quot;20&quot;, str(left), &quot;/opt/pbcodex/codex&quot;]
        try:
            p = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=left + 60)
            out, perr = p.stdout, p.stderr
        except subprocess.TimeoutExpired as e:
            out, perr = (e.stdout or b&quot;&quot;).decode() if isinstance(e.stdout, bytes) else (e.stdout or &quot;&quot;), &quot;turn timeout&quot;
            dexec(self.cname, &quot;pkill -f /opt/pbcodex/codex || true&quot;)
        reply, err = &quot;&quot;, &quot;&quot;
        for line in out.splitlines():
            try: j = json.loads(line)
            except Exception: continue
            t = j.get(&quot;type&quot;)
            if t == &quot;thread.started&quot;: self.thread = j[&quot;thread_id&quot;]
            elif t == &quot;item.completed&quot; and j[&quot;item&quot;].get(&quot;type&quot;) == &quot;agent_message&quot;: reply = j[&quot;item&quot;].get(&quot;text&quot;) or reply
            elif t == &quot;turn.completed&quot;:
                u = j.get(&quot;usage&quot;) or {}
                self.usage[&quot;input&quot;] += u.get(&quot;input_tokens&quot;, 0); self.usage[&quot;cached&quot;] += u.get(&quot;cached_input_tokens&quot;, 0)
                self.usage[&quot;output&quot;] += u.get(&quot;output_tokens&quot;, 0); self.usage[&quot;turns&quot;] += 1
            elif t in (&quot;turn.failed&quot;, &quot;error&quot;): err = json.dumps(j)[:400]
        if not reply and re.search(r&quot;401|403|unauthorized|invalid_api_key&quot;, err, re.I): raise GatewayDown(err)
        if not reply: log(&quot;NOREPLY&quot;, self.cname, &quot; &quot;.join((err or perr[-300:]).split())[:300])   # 试水排错：别把错误吞掉
        return reply or f&quot;(no reply; {err or perr[-300:]})&quot;
<span></span>
<span></span>
GOAL = &quot;&quot;&quot;You are resolving an issue in the repository at {root}. This is a normal engineering task.
<span></span>
{instruction}
<span></span>
Rules: do not use the internet (the model API is the only network you may use); do not look at git history (no git log/show of other commits, no reflog); work autonomously and never ask the human.
Implement the change in the source code. You may add tests and run the repository&#x27;s existing tests to check your work.
When you are completely done, reply with a short summary and the line: FINISHED&quot;&quot;&quot;
CONTINUE = &quot;Continue working until the issue is fully resolved and tested. When you are completely done, reply with a short summary and the line: FINISHED&quot;
TESTER_CARD = &quot;&quot;&quot;You are the independent TESTER in a pair-programming session. The developer is another agent resolving an issue in this repository: {root}.
Your replies are relayed to the developer verbatim.
How you work: from the issue alone, decide what correct behaviour is, then write your OWN reproduction / acceptance tests (put them under /tmp/pairtest/, or in new files whose names contain &quot;pairtester&quot;) and run them against the developer&#x27;s current working tree. Read the existing code to understand behaviour, but judge the fix by what your tests show, not by reading the developer&#x27;s diff. The developer saying &quot;tested&quot; is not evidence.
REVISE must include a concrete failing case (the test you ran, its output, and what the issue says should happen). APPROVED must say which tests you ran and what passed.
Do not edit non-test source files. Delete any test files you added inside the repository before you reply APPROVED. Do not use the internet or git history.
End every reply with exactly one line: VERDICT: APPROVED  or  VERDICT: REVISE
<span></span>
The issue:
{instruction}&quot;&quot;&quot;
TO_T = &quot;\nNow write a message to the tester: what you changed and how you tested it. End with the line: TO TESTER&quot;
<span></span>
CAPTURE = (&#x27;cd &quot;{root}&quot; &amp;&amp; rm -rf /tmp/pairtest; git ls-files --others --exclude-standard | grep -i pairtester | xargs -r rm -f; &#x27;
           &#x27;git add -A 2&gt;/dev/null; git diff --cached --binary &gt; /pbhome/model.patch; git reset -q; wc -c &lt; /pbhome/model.patch&#x27;)
<span></span>
<span></span>
def gold_patch(tid):
    return TASKS / tid / (&quot;solution/solution.patch&quot; if BENCH == &quot;deepswe&quot; else &quot;solution/gold_patch.diff&quot;)
<span></span>
<span></span>
def base_commit(tid):
    return json.loads((TASKS / tid / &quot;tests/config.json&quot;).read_text())[&quot;base_commit&quot;]
<span></span>
<span></span>
def grade_deepswe(tid, img, patch_path, tag):
    &quot;&quot;&quot;DeepSWE 官方：全新断网容器 + /logs/artifacts/model.patch + 不改动的 tests/test.sh，读 reward.json。&quot;&quot;&quot;
    name = f&quot;pbg-{tag}&quot;
    start(name, img, offline=True)
    try:
        sh([&quot;docker&quot;, &quot;cp&quot;, str(TASKS / tid / &quot;tests&quot;), f&quot;{name}:/tests&quot;])
        dexec(name, &quot;mkdir -p /logs/artifacts /logs/verifier&quot;)
        sh([&quot;docker&quot;, &quot;cp&quot;, str(patch_path), f&quot;{name}:/logs/artifacts/model.patch&quot;])
        r = dexec(name, &quot;bash /tests/test.sh&quot;, timeout=GRADE_CAP_S + 120)
        rj = dexec(name, &quot;cat /logs/verifier/reward.json 2&gt;/dev/null&quot;).stdout.strip()
        try: d = json.loads(rj)
        except Exception: d = {&quot;reward&quot;: 0, &quot;parse_error&quot;: rj[:200]}
        return {&quot;reward&quot;: int(d.get(&quot;reward&quot;, 0) == 1), &quot;apply_rc&quot;: int(d.get(&quot;apply_failed&quot;, 0)), &quot;detail&quot;: d,
                &quot;apply_tail&quot;: &quot;&quot;, &quot;test_tail&quot;: (r.stdout + r.stderr)[-1500:]}
    finally:
        sh([&quot;docker&quot;, &quot;rm&quot;, &quot;-f&quot;, name])
<span></span>
<span></span>
# DeepSWE 官方 collect：只取已提交的改动（git diff 起点..HEAD），题面都要求 &quot;commit everything when you are done&quot;
CAPTURE_DEEPSWE = (&#x27;cd &quot;{root}&quot; &amp;&amp; git config --global --add safe.directory &quot;{root}&quot;; &#x27;
                   &#x27;git diff --binary {base} HEAD &gt; /pbhome/model.patch; wc -c &lt; /pbhome/model.patch&#x27;)
<span></span>
<span></span>
def grade(tid, img, patch_path, tag):
    if BENCH == &quot;deepswe&quot;: return grade_deepswe(tid, img, patch_path, tag)
    &quot;&quot;&quot;官方 patch_replay：全新容器 + 补丁 + 不改动的 tests/test.sh。&quot;&quot;&quot;
    name = f&quot;pbg-{tag}&quot;
    start(name, img)
    try:
        sh([&quot;docker&quot;, &quot;cp&quot;, str(TASKS / tid / &quot;tests&quot;), f&quot;{name}:/tests&quot;])
        # 6 道题的判分脚本写死 GOPROXY=proxy.golang.org，国内连不上 → 新依赖下不来、标准答案都编不过。
        # 换成内容相同的国内镜像 goproxy.cn，判分标准不变。
        dexec(name, &quot;sed -i &#x27;s#https://proxy.golang.org#https://goproxy.cn#g&#x27; /tests/*.sh&quot;)
        sh([&quot;docker&quot;, &quot;cp&quot;, str(patch_path), f&quot;{name}:/tmp/replay.patch&quot;])
        ap = dexec(name, &#x27;cd /app 2&gt;/dev/null || cd /testbed; [ -s /tmp/replay.patch ] || exit 0; &#x27;
                         &#x27;git apply --verbose /tmp/replay.patch || git apply --3way /tmp/replay.patch || patch --fuzz=3 -p1 -i /tmp/replay.patch&#x27;,
                   timeout=300)
        r = dexec(name, &quot;mkdir -p /logs/verifier; bash /tests/test.sh&quot;, timeout=GRADE_CAP_S + 120)
        rw = dexec(name, &quot;cat /logs/verifier/reward.txt 2&gt;/dev/null&quot;).stdout.strip()
        return {&quot;reward&quot;: int(rw or 0), &quot;apply_rc&quot;: ap.returncode, &quot;apply_tail&quot;: (ap.stdout + ap.stderr)[-600:],
                &quot;test_tail&quot;: (r.stdout + r.stderr)[-1500:]}
    finally:
        sh([&quot;docker&quot;, &quot;rm&quot;, &quot;-f&quot;, name])
<span></span>
<span></span>
def run_job(arm, tid, img):
    out = RES / arm / f&quot;{tid}.json&quot;
    tag = hashlib.md5((f&quot;{arm}/{tid}&quot; + os.environ.get(&quot;PB_REP&quot;, &quot;&quot;)).encode()).hexdigest()[:10]
    home = WORK / arm / tid; shutil.rmtree(home, ignore_errors=True); home.mkdir(parents=True)
    os.chmod(home, 0o777)
    cname = start(f&quot;pba-{tag}&quot;, img, home)
    rec = {&quot;arm&quot;: arm, &quot;id&quot;: tid, &quot;started&quot;: time.time(), &quot;reviews&quot;: [], &quot;turns&quot;: 0}
    t0 = time.time(); dev = rev = None
    try:
        root = repo_root(cname)
        instr = (TASKS / tid / &quot;instruction.md&quot;).read_text()
        who, tester = ARMS[arm]
        deadline = t0 + BUDGET_S
        dev = DockerCodex(who, cname, root, &quot;dev&quot;, deadline)
        if tester:
            card = TESTER_CARD.format(root=root, instruction=instr)
            rev = DockerCodex(tester, cname, root, &quot;tester&quot;, deadline)
            rev.turn(card + &quot;\n\nFor now reply with just OK; the developer&#x27;s first message will follow.&quot;)
        reply = dev.turn(GOAL.format(root=root, instruction=instr)); rec[&quot;turns&quot;] += 1
        for _ in range(MAX_CONT):
            if has_marker(reply, &quot;FINISHED&quot;) or time.time() &gt; deadline - 60: break
            reply = dev.turn(CONTINUE); rec[&quot;turns&quot;] += 1
        if rev:
            msg = dev.turn(TO_T)
            for rnd in range(MAX_REVIEW):
                r = rev.turn(f&quot;Message from the developer:\n\n{msg}&quot;)
                v = verdict(r)
                rec[&quot;reviews&quot;].append({&quot;t&quot;: round(time.time() - t0), &quot;round&quot;: rnd, &quot;verdict&quot;: v, &quot;text&quot;: r[:3000]})
                if v == &quot;APPROVED&quot; or time.time() &gt; deadline - 60: break
                msg = dev.turn(f&quot;Tester&#x27;s reply:\n\n{r}\n\nReproduce what the tester found, fix it, re-run the tests, then write your next message to the tester.&quot; + TO_T)
        rec[&quot;elapsed_s&quot;] = time.time() - t0
        cap = CAPTURE_DEEPSWE.format(root=root, base=base_commit(tid)) if BENCH == &quot;deepswe&quot; else CAPTURE.format(root=root)
        rec[&quot;patch_bytes&quot;] = int((dexec(cname, cap, timeout=300).stdout.strip() or &quot;0&quot;).split()[-1])
    except GatewayDown as e:
        rec[&quot;error&quot;] = &quot;gateway_down &quot; + str(e)[:200]
    except Exception as e:
        rec[&quot;error&quot;] = repr(e)[:300]; traceback.print_exc()
    finally:
        rec[&quot;usage&quot;] = {&quot;dev&quot;: dev.usage if dev else None, &quot;rev&quot;: rev.usage if rev else None}
        try: dexec(cname, &quot;chmod -R a+rwX /pbhome&quot;, timeout=1800)   # 容器里是 root 写的，放开权限，宿主上才删得掉
        except Exception as e: log(&quot;CHMOD SKIP&quot;, arm, tid[:60], repr(e)[:80])   # node_modules 巨大时会超时；别让它吞掉结果和删容器
        sh([&quot;docker&quot;, &quot;rm&quot;, &quot;-f&quot;, cname])
    if rec.get(&quot;error&quot;):
        log(&quot;NOT RECORDED&quot;, arm, tid[:60], rec[&quot;error&quot;][:120]); return rec
    (RES / arm).mkdir(parents=True, exist_ok=True)
    shutil.copy(home / &quot;model.patch&quot;, RES / arm / f&quot;{tid}.patch&quot;)
    try: rec[&quot;grade&quot;] = g = grade(tid, img, home / &quot;model.patch&quot;, tag)
    except subprocess.TimeoutExpired:   # 补丁让测试卡死：记失败并打标，别让整道题崩掉、丢掉做题记录
        rec[&quot;grade&quot;] = g = {&quot;reward&quot;: 0, &quot;timeout&quot;: True}; rec[&quot;grade_timeout&quot;] = True
    rec[&quot;passed&quot;] = g[&quot;reward&quot;] == 1
    out.write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    log(arm, tid[:70], &quot;PASS&quot; if rec[&quot;passed&quot;] else &quot;fail&quot;, f&quot;{rec[&#x27;elapsed_s&#x27;]/60:.0f}min reviews={len(rec[&#x27;reviews&#x27;])} patch={rec[&#x27;patch_bytes&#x27;]}B&quot;)
    return rec
<span></span>
<span></span>
def run_task(tid, arms):
    todo = [a for a in arms if not (RES / a / f&quot;{tid}.json&quot;).exists()]
    if not todo: return
    if not os.environ.get(&quot;PB_NO_CLAIM&quot;):   # 加跑的做法不占题：别让多机分题以为这题已被本机领走
        (T / &quot;started&quot;).mkdir(exist_ok=True); (T / &quot;started&quot; / tid).touch()
    img = image_of(tid)
    try:
        pull(img)
        with ThreadPoolExecutor(len(todo)) as ex: list(ex.map(lambda a: run_job(a, tid, img), todo))
        gf = RES / &quot;_gold&quot; / f&quot;{tid}.json&quot;   # 顺手判一次标准答案：它都过不了的题，统计时剔除（环境坏了不怪模型）
        if not gf.exists():
            gf.parent.mkdir(parents=True, exist_ok=True)
            g = grade(tid, img, gold_patch(tid), &quot;gold-&quot; + hashlib.md5(tid.encode()).hexdigest()[:8])
            gf.write_text(json.dumps(g, ensure_ascii=False, indent=1)); log(&quot;GOLD&quot;, tid[:60], g[&quot;reward&quot;])
    except Exception as e:
        log(&quot;TASK CRASH&quot;, tid[:60], repr(e)[:200])
    finally:
        drop_image(img)
<span></span>
<span></span>
def smoke(ids):
    for tid in ids:
        img = image_of(tid); pull(img)
        empty = WORK / &quot;empty.patch&quot;; empty.parent.mkdir(parents=True, exist_ok=True); empty.write_text(&quot;&quot;)
        g1 = grade(tid, img, gold_patch(tid), &quot;smoke-gold&quot;)
        g0 = grade(tid, img, empty, &quot;smoke-empty&quot;)
        log(&quot;SMOKE&quot;, tid[:60], &quot;gold&quot;, g1[&quot;reward&quot;], &quot;empty&quot;, g0[&quot;reward&quot;], &quot;OK&quot; if (g1[&quot;reward&quot;], g0[&quot;reward&quot;]) == (1, 0) else &quot;BAD&quot;)
        drop_image(img)
<span></span>
<span></span>
if __name__ == &quot;__main__&quot;:
    ap = argparse.ArgumentParser(); ap.add_argument(&quot;arms&quot;, nargs=&quot;?&quot;); ap.add_argument(&quot;--tasks&quot;, default=&quot;sample100.json&quot;)
    ap.add_argument(&quot;--par&quot;, type=int, default=2); ap.add_argument(&quot;--ids&quot;); ap.add_argument(&quot;--smoke&quot;, nargs=&quot;*&quot;)
    ap.add_argument(&quot;--order&quot;, default=&quot;fwd&quot;, choices=[&quot;fwd&quot;, &quot;rev&quot;, &quot;mid&quot;])
    a = ap.parse_args()
    if a.smoke is not None: smoke(a.smoke); sys.exit()
    if not GW or not os.environ.get(&quot;PAIRBENCH_GATEWAY_TOKEN&quot;): sys.exit(&quot;source ~/.pairbench.env first&quot;)
    start_gw_relay()
    arms = a.arms.split(&quot;,&quot;); assert all(x in ARMS for x in arms), arms
    ids = a.ids.split(&quot;,&quot;) if a.ids else json.load(open(T / a.tasks))
    if a.order == &quot;rev&quot;: ids = ids[::-1]
    elif a.order == &quot;mid&quot;: ids = ids[len(ids) // 2:] + ids[:len(ids) // 2]
    if not PAR_FILE.exists(): PAR_FILE.write_text(str(a.par))
    log(&quot;tasks&quot;, len(ids), &quot;arms&quot;, arms)
    busy = []; lk = threading.Lock(); queue = list(ids)   # queue：还没开跑的题，按原顺序先来先到
<span></span>
    def par():
        try: return max(1, int(PAR_FILE.read_text().strip()))
        except Exception: return a.par
<span></span>
    def worker(tid):
        while True:   # 同时跑的题数由 par.txt 现读决定，便于逐步加并发
            with lk:
                if len(busy) &lt; par() and queue and queue[0] == tid: queue.pop(0); busy.append(tid); break
            time.sleep(2)
        try: run_task(tid, arms)
        finally:
            with lk: busy.remove(tid)
<span></span>
    with ThreadPoolExecutor(32) as ex: list(ex.map(worker, ids))
    log(&quot;ALL DONE&quot;)
</code></pre>
</details>
<details><summary><code>bin/inrelay.py</code></summary>
<pre><code># 跑在 agent 容器里（容器是 --network none，只有回环）：127.0.0.1:18080 -&gt; /pbsock/gw.sock（宿主上的转发器，只通模型服务）
import socket, threading, sys
def pump(a, b):
    try:
        while True:
            d = a.recv(65536)
            if not d: break
            b.sendall(d)
    except Exception: pass
    finally:
        for s in (a, b):
            try: s.shutdown(socket.SHUT_RDWR)
            except Exception: pass
def handle(c):
    u = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try: u.connect(&quot;/pbsock/gw.sock&quot;)
    except Exception: c.close(); return
    threading.Thread(target=pump, args=(c, u), daemon=True).start(); pump(u, c)
srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind((&quot;127.0.0.1&quot;, 18080)); srv.listen(64)
while True:
    c, _ = srv.accept(); threading.Thread(target=handle, args=(c,), daemon=True).start()
</code></pre>
</details>
<details><summary><code>regrade_long.py</code></summary>
<pre><code># 10-22 判分超时的答案：机器空闲时把判分时限放宽到 2 小时重判一次（答案不重做）。旧判分留在 grade_before_long_regrade。
import json, os, sys
from concurrent.futures import ThreadPoolExecutor
import run_swepro as r
r.GRADE_CAP_S = 7200
jobs = [x.split(&quot;/&quot;) for x in sys.argv[2:]]   # arm/tid
def one(j):
    arm, tid = j; f = r.RES / arm / f&quot;{tid}.json&quot;; d = json.load(open(f))
    p = r.RES / arm / f&quot;{tid}.patch&quot;
    img = r.image_of(tid); r.pull(img)
    try: g = r.grade(tid, img, p.resolve(), &quot;lg-&quot; + str(abs(hash(arm + tid)) % 10**8))
    except Exception as e: g = {&quot;reward&quot;: 0, &quot;timeout&quot;: True, &quot;error&quot;: repr(e)[:200]}
    d[&quot;grade_before_long_regrade&quot;] = d[&quot;grade&quot;]; d[&quot;grade&quot;] = g; d[&quot;passed&quot;] = bool(g.get(&quot;reward&quot;))
    d[&quot;grade_timeout&quot;] = bool(g.get(&quot;timeout&quot;)); d[&quot;regraded&quot;] = &quot;10-22 判分超时，空闲时放宽到 2h 重判&quot;
    f.write_text(json.dumps(d, ensure_ascii=False, indent=1)); r.log(&quot;LONGRG&quot;, arm, tid, g.get(&quot;reward&quot;), &quot;timeout&quot; if g.get(&quot;timeout&quot;) else &quot;&quot;)
with ThreadPoolExecutor(int(sys.argv[1])) as ex: list(ex.map(one, jobs))
</code></pre>
</details>
<details><summary><code>report.py</code></summary>
<pre><code>#!/usr/bin/env python3
&quot;&quot;&quot;10-23 汇总：每套题每种做法的 通过率(95% Wilson) / 总花费 / 每题花费中位 / 每题分钟中位，外加配对 McNemar。
取数：collected-&lt;RES&gt;/&lt;机器&gt;/&lt;做法&gt;/&lt;题&gt;.json；去占位；同 (做法,题) 多份时 优先补跑记录(rerun_reason)，再取开工早的；
剔除标准答案在所有机器上都判不过的题；价格一律按原价（Standard 档，不乘 fast 倍率）。&quot;&quot;&quot;
import json, math, statistics as st, sys
from pathlib import Path
B = Path(__file__).resolve().parent
PRICE = {&quot;glm-5.3-flash&quot;: (0.15, 0.03, 0.50), &quot;deepseek-flash&quot;: (0.15, 0.03, 0.60),
         &quot;gpt-6.1-sol&quot;: (2.00, 0.10, 10.00), &quot;gpt-6-astra&quot;: (10.00, 1.00, 50.00)}   # 美元/百万 token：未命中输入, 命中输入, 输出
ORDER = [&quot;solo_dsf&quot;, &quot;solo_glm&quot;, &quot;solo_sol&quot;, &quot;solo_solmax&quot;, &quot;solo_astra&quot;, &quot;dsf_t_dsf&quot;, &quot;glm_t_dsf&quot;, &quot;dsf_t_sol&quot;, &quot;dsf_t_astra&quot;, &quot;sol_t_sol&quot;]
PAIRS = [(&quot;solo_sol&quot;, &quot;solo_dsf&quot;), (&quot;solo_solmax&quot;, &quot;solo_dsf&quot;), (&quot;solo_astra&quot;, &quot;solo_dsf&quot;), (&quot;solo_solmax&quot;, &quot;solo_sol&quot;),
         (&quot;solo_astra&quot;, &quot;solo_sol&quot;), (&quot;sol_t_sol&quot;, &quot;solo_sol&quot;), (&quot;dsf_t_sol&quot;, &quot;solo_dsf&quot;), (&quot;dsf_t_astra&quot;, &quot;solo_dsf&quot;),
         (&quot;dsf_t_dsf&quot;, &quot;solo_dsf&quot;), (&quot;dsf_t_sol&quot;, &quot;solo_sol&quot;), (&quot;dsf_t_astra&quot;, &quot;solo_astra&quot;), (&quot;glm_t_dsf&quot;, &quot;solo_glm&quot;), (&quot;solo_dsf&quot;, &quot;solo_glm&quot;)]
def usd(u):
    if not u: return 0.0
    p = PRICE[u[&quot;model&quot;]]; return ((u[&quot;input&quot;] - u[&quot;cached&quot;]) * p[0] + u[&quot;cached&quot;] * p[1] + u[&quot;output&quot;] * p[2]) / 1e6
def wilson(x, n, z=1.96):
    p = x / n; c = (p + z * z / 2 / n) / (1 + z * z / n); h = z * math.sqrt(p * (1 - p) / n + z * z / 4 / n / n) / (1 + z * z / n); return c - h, c + h
def mcnemar(b, c):
    n = b + c
    return 1.0 if n == 0 else min(1.0, 2 * sum(math.comb(n, i) for i in range(min(b, c) + 1)) / 2 ** n)
def load(res):
    best, gold = {}, {}
    for f in (B / f&quot;collected-{res}&quot;).glob(&quot;*/*/*.json&quot;):
        d = json.loads(f.read_text())
        if f.parent.name == &quot;_gold&quot;:
            gold.setdefault(f.stem, []).append(d.get(&quot;reward&quot;)); continue
        if f.parent.name.startswith(&quot;_&quot;) or d.get(&quot;placeholder&quot;) or &quot;id&quot; not in d: continue
        k = (f.parent.name, d[&quot;id&quot;]); rank = (0 if d.get(&quot;rerun_reason&quot;) else 1, float(d.get(&quot;started&quot;) or 0))
        if k not in best or rank &lt; best[k][0]: best[k] = (rank, d, f)
    bad = {t for t, v in gold.items() if not any(v)}
    return {k: (d, f) for k, (_, d, f) in best.items() if k[1] not in bad}, bad
for res in (&quot;results-hard&quot;, &quot;results-deepswe&quot;):
    R, bad = load(res)
    P = {k: bool(d.get(&quot;passed&quot;)) for k, (d, _) in R.items()}
    print(f&quot;\n=== {res}   剔除坏题 {len(bad)}: {sorted(bad)}&quot;)
    print(f&quot;{&#x27;做法&#x27;:12s} {&#x27;通过&#x27;:&gt;8s} {&#x27;率&#x27;:&gt;6s} {&#x27;95%置信区间&#x27;:&gt;15s} {&#x27;总$&#x27;:&gt;8s} {&#x27;每题$中位&#x27;:&gt;9s} {&#x27;每题分中位&#x27;:&gt;9s} {&#x27;补跑&#x27;:&gt;4s} {&#x27;换线路&#x27;:&gt;4s}&quot;)
    arms = [a for a in ORDER if any(x == a for x, _ in R)] + sorted({x for x, _ in R} - set(ORDER))
    for a in arms:
        rs = [(k, d) for k, (d, _) in R.items() if k[0] == a]; n = len(rs); x = sum(P[k] for k, _ in rs)
        cost = [usd((d.get(&quot;usage&quot;) or {}).get(&quot;dev&quot;)) + usd((d.get(&quot;usage&quot;) or {}).get(&quot;rev&quot;)) for _, d in rs if (d.get(&quot;usage&quot;) or {}).get(&quot;dev&quot;)]
        mins = [d[&quot;elapsed_s&quot;] / 60 for _, d in rs if d.get(&quot;elapsed_s&quot;)]
        lo, hi = wilson(x, n)
        print(f&quot;{a:12s} {x:&gt;3d}/{n:&lt;4d} {x/n:6.1%} [{lo:5.1%},{hi:5.1%}] {sum(cost):8.2f} {st.median(cost) if cost else 0:9.3f} {st.median(mins) if mins else 0:9.1f} &quot;
              f&quot;{sum(bool(d.get(&#x27;rerun_reason&#x27;)) for _, d in rs):&gt;4d} {sum(d.get(&#x27;route&#x27;) == &#x27;acct&#x27; for _, d in rs):&gt;4d}&quot;)
    print(&quot;配对 McNemar（b=只前者对, c=只后者对）&quot;)
    for a, b_ in PAIRS:
        ids = {t for x, t in P if x == a} &amp; {t for x, t in P if x == b_}
        if not ids: continue
        b = sum(P[(a, t)] and not P[(b_, t)] for t in ids); c = sum(P[(b_, t)] and not P[(a, t)] for t in ids); p = mcnemar(b, c)
        print(f&quot;  {a:12s} vs {b_:12s} n={len(ids):3d}  {b:2d}:{c:&lt;2d}  p={p:.3f}{&#x27;  *&#x27; if p &lt; 0.05 else &#x27;&#x27;}&quot;)
</code></pre>
</details>
<details><summary><code>rerun_driver.py</code></summary>
<pre><code># 10-22 补跑：答题过程被模型服务错误（504/503/限流/断流）打断、或答题超时而失败的 (做法, 题)。
# 先把旧记录挪进 &lt;RES&gt;/_superseded/&lt;arm&gt;/（不删），再用独立工作目录和转发口重跑这一对。
# 用法：PB_BENCH=... RES=... python3 rerun_driver.py jobs.json &lt;并发&gt;
import json, os, sys, shutil, time
from concurrent.futures import ThreadPoolExecutor
os.environ.setdefault(&quot;PB_WORK&quot;, &quot;work-rerun&quot;); os.environ[&quot;PB_NO_CLAIM&quot;] = &quot;1&quot;
import run_swepro as r
jobs = json.load(open(sys.argv[1])); par = int(sys.argv[2]) if len(sys.argv) &gt; 2 else 4
for j in jobs:
    for ext in (&quot;.json&quot;, &quot;.patch&quot;):
        src = r.RES / j[&quot;arm&quot;] / (j[&quot;id&quot;] + ext)
        if src.exists():
            dst = r.RES / &quot;_superseded&quot; / j[&quot;arm&quot;]; dst.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst / (j[&quot;id&quot;] + ext)))
r.start_gw_relay()
def one(j):
    r.run_task(j[&quot;id&quot;], [j[&quot;arm&quot;]])
    f = r.RES / j[&quot;arm&quot;] / (j[&quot;id&quot;] + &quot;.json&quot;)
    if f.exists():   # 记一笔这是补跑，原因留档
        d = json.load(open(f)); d[&quot;rerun_reason&quot;] = j[&quot;why&quot;]; f.write_text(json.dumps(d, ensure_ascii=False, indent=1))
with ThreadPoolExecutor(par) as ex: list(ex.map(one, jobs))
r.log(&quot;RERUN DONE&quot;, len(jobs))
</code></pre>
</details>
</div>
