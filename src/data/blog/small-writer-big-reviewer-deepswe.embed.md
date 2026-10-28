---
author: "Shumin Fu"
pubDatetime: 2026-10-28T17:26:48+08:00
modDatetime: 2026-10-28
title: "小模型写、大模型审：SWE-bench Pro Hard 与 DeepSWE 上的研发大师实验"
slug: small-writer-big-reviewer-deepswe
featured: false
draft: false
tags:
  - "ai-agents"
  - "pair-programming"
  - "llm-eval"
description: "研发大师Ultra（便宜的 DeepSeek 写代码、GPT-6.1 Sol 审查）在 DeepSWE 上通过 80.4%，显著好于 DeepSeek 单干，也高于 Sol、GPT Sol Max 和 Opus 5.5 medium 单独执行（不显著）；附顾问模式、实验细节、复现方法和全部脚本。"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
</style>

<div class="html-embed" lang="zh">
<p class="subtitle">2026-10-23 · 数据截至 10-26。新增 Claude Opus 5.5 两组（用 Claude Code 跑）和一种新玩法「顾问模式」（顾问分别用 Sol 和 Opus 5.5 medium 各跑一组）；跑满时限而失败的题放宽时限重跑过一次（见第 4 节）。GPT Sol Max 用另一条模型服务线路的完整重跑数据；<br>Sol 单干、Sol 写 + Sol 审两组，有一部分题用了那条线路重跑通过的结果（两次取好），见第 4 节；研发大师Ultra 只用原线路那一次。</p>
<h2>一句话结论</h2>
<p>在能拉开差距的 DeepSWE 上，<strong>研发大师Ultra（便宜的 DeepSeek 写代码、GPT-6.1 Sol 当审查者）</strong>最好：通过 90/112（80.4%），<br>显著好于 DeepSeek 单干（67.9%，p=0.009）；也高于 Sol 单干（77.7%，两次取好）、GPT Sol Max（75.0%）和 Opus 5.5 medium 单独执行（74.1%），但不显著。<br>GPT 大模型单干（Sol、GPT Sol Max）和 <strong>Claude Opus 5.5 medium 单独执行</strong>都和 DeepSeek 单干<strong>没有显著差别</strong>，却贵不少（DeepSWE 上 2.5–12 倍，Hard 上 3–17 倍）。<br>Opus 当审查者（DeepSeek 写 + Opus 5.5 medium 审，72.3%）也没有显著好于 DeepSeek 单干。<br>让大模型只出方案、只看报告、DeepSeek 多干活的<strong>顾问模式</strong>（同样是 DeepSeek 写、Sol 审，64.3%）明显不如研发大师Ultra（7 : 25，p=0.002），连 DeepSeek 单干都没赢过。<br>顾问换成 Opus 5.5 medium（69.6%）比 Sol 顾问多过 6 题（不显著），花费只有 DeepSeek 写 + Opus 5.5 medium 审的 30%，但也没赢 DeepSeek 单干（17 : 15，p=0.86）：Opus 顾问几乎每题都说「通过」（109 / 112）。<br>SWE-bench Pro Hard 太容易，大多数做法都在 84–96%，分不出高下。</p>
<hr>
<h2>1. 我们想回答什么</h2>
<ul><li>「小模型写 + 大模型审」能不能比「大模型自己写」更好、更便宜？</li><li>换不同的审查者（Sol / Opus / DeepSeek 自己）差多少？</li><li>大模型单干、开最高思考强度，值不值？</li></ul>
<h2>2. 题目</h2>
<table><thead><tr><th>题集</th><th>题数</th><th>为什么选它</th></tr></thead><tbody><tr><td>SWE-bench Pro V2 <strong>Hard</strong></td><td>51</td><td>V2 全集已被做到 87–99%，分不出做法；Hard 是 V2 里最难的子集</td></tr><tr><td><strong>DeepSWE</strong> v1.1</td><td>113（剔除 1 道标准答案都过不了的坏题后 112）</td><td>从零出题防泄题，厂商现在主推；区分度高</td></tr></tbody></table>
<h2>3. 做法</h2>
<p>「A 写 + B 审」表示 A 写代码、B 当审查者兼测试者；「X 单干」表示只有 X 一个模型。</p>
<table><thead><tr><th>做法</th><th>写代码（思考强度）</th><th>审查（思考强度）</th></tr></thead><tbody><tr><td>研发大师Ultra（DeepSeek 写 + Sol 审）</td><td>deepseek-flash</td><td>gpt-6.1-sol（默认）</td></tr><tr><td>GPT Sol Max（Sol 单干，max 思考强度）</td><td>gpt-6.1-sol（<strong>max</strong>）</td><td>—</td></tr><tr><td>研发大师High（DeepSeek 写 + DeepSeek 审）</td><td>deepseek-flash</td><td>deepseek-flash</td></tr><tr><td>Opus 5.5 medium 单独执行</td><td>claude-opus-5-5（medium）</td><td>—</td></tr><tr><td>DeepSeek 单干</td><td>deepseek-flash（未设，服务默认）</td><td>—</td></tr><tr><td>GLM 单干</td><td>glm-5.3-flash（low）</td><td>—</td></tr><tr><td>Sol 单干</td><td>gpt-6.1-sol（未设 = medium）</td><td>—</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>glm-5.3-flash（low）</td><td>deepseek-flash</td></tr><tr><td>Sol 写 + Sol 审</td><td>gpt-6.1-sol</td><td>gpt-6.1-sol（自己审自己）</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>deepseek-flash</td><td>claude-opus-5-5（medium）</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>deepseek-flash（自己写测试、自己跑）</td><td>gpt-6.1-sol（默认；只读不写不跑）</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>deepseek-flash（自己写测试、自己跑）</td><td>claude-opus-5-5（medium；只读不写不跑）</td></tr></tbody></table>
<p><strong>顾问模式</strong>是 10-25 新加的玩法，想让便宜的模型多干活、贵的模型少干活：<br>顾问先只读代码，给出方案和 8–20 条验收用例；DeepSeek 照着把用例写成测试、写代码、跑测试，写完交一份报告；<br>顾问只看报告和代码改动、不自己跑测试，不行就把意见发回，最多 2 轮。顾问用 Sol 和 Opus 各跑一组，提示词和流程完全一样；<br>分别对比 研发大师Ultra、DeepSeek 写 + Opus 5.5 medium 审（审查者自己动手测）。</p>
<p>思考强度实测（同一道推理题，推理 token 数）：未设 367、medium 270、high 473、xhigh 1034、max 2555。未设时按 medium 处理（回显 medium）。</p>
<h2>4. 跑法（harness）</h2>
<ul><li><strong>Agent</strong>：Codex CLI <code>0.155.1</code>，在题目自带的 Docker 镜像里跑，<strong>断网</strong>（<code>--network none</code>）；唯一出口是一条 unix socket，转发到模型服务。</li><li><strong>Opus 用 Claude Code</strong>：两组 Opus 换成 Opus 自家的 agent，Claude Code <code>2.1.309</code>（同样断网、同一条 socket 出口、同样的提示词和时限）。思考强度显式设 <code>--effort medium</code>；关掉联网工具（WebSearch / WebFetch）；后台小任务和子代理也都用 Opus（服务上没有 Haiku）。在 DeepSeek 写 + Opus 5.5 medium 审里，DeepSeek 仍用 Codex，只有审查者用 Claude Code。</li><li><strong>单干</strong>：一个 Codex 会话做题；没写完就提示「继续」，最多 6 次。</li><li><strong>研发大师（写 + 审）</strong>：A 写，写完交给 B；B 检查、跑测试，不通过就把意见发回 A，最多 5 轮，直到 B 回 <code>APPROVED</code>。</li><li><strong>时限</strong>：DeepSWE 每题 3 小时，Hard 每题 50 分钟（写、审两方共用）。跑满时限而失败的题放宽时限重跑过一次（见下面）。</li><li><strong>判分</strong>：全新容器，套上 agent 的代码改动，跑官方 <code>tests/test.sh</code>（不改动）。DeepSWE 判分容器也断网，只判已提交的代码。</li><li><strong>模型看不到判分测试</strong>：<code>tests/</code> 目录只在判分容器里出现；agent 容器里只有仓库原有的老测试。</li><li><strong>标准答案校验</strong>：每题顺手判一次官方标准答案；在所有机器上都过不了的题剔除（DeepSWE 剔除 <code>python-statemachine-state-data-scoping</code>）。</li><li><strong>补跑</strong>：答题过程被模型服务报错或超时打断的失败，都补跑一次；旧记录保留但不计入，统计用补跑结果。补跑后逐个核查了失败记录，剩下的失败都是模型自己说做完了、其实没做对。</li><li><strong>GPT Sol Max 整组重跑</strong>：这组换了一条模型服务线路，从头完整重跑了一遍（同一模型、同样设置），表里用的是重跑数据。两条线路逐题对比：DeepSWE 79 vs 84 题（4 : 9，p=0.27），Hard 46 vs 45 题，没有显著差别。</li><li><strong>两组 Sol 两次取好</strong>：Sol 单干、Sol 写 + Sol 审这两组，也在另一条线路上整组重跑过（中途额度用完的题后来换账号补齐）。<strong>只在「重跑通过、原来没通过」时换成重跑结果</strong>，反过来的保留原来的通过。换掉的题数：</li></ul>
<table><thead><tr><th>做法</th><th>DeepSWE 换了</th><th>Hard 换了</th><th>DeepSWE 只用原线路时</th></tr></thead><tbody><tr><td>Sol 单干</td><td>12</td><td>3</td><td>75（67.0%）</td></tr><tr><td>Sol 写 + Sol 审</td><td>17</td><td>2</td><td>68（60.7%）</td></tr></tbody></table>
<p>  这等于这些题给了 Sol 两次机会、取好的那次，其他做法都只有一次，所以 <strong>这两组的分数偏高</strong>，和其他做法比要打折看。研发大师Ultra 也重跑过，但<strong>不换</strong>，表里只用原线路那一次。</p>
<ul><li><strong>Opus 两次中断后从头重跑</strong>：10-24 晚模型服务把 Opus 5.5 下线约 15 小时（报 <code>model_not_found</code>），刚恢复时又满载（报 <code>Too many pending requests</code>）。这期间失败或没跑到的 145 题，等服务稳定后<strong>从头重跑一次</strong>，旧记录保留但不计入。</li><li><strong>跑满时限的失败放宽时限重跑</strong>：第一轮时模型服务不稳，Opus 每一步要等很久（DeepSWE 第一批每步中位 42 秒，后来补跑时 23.5 秒），很多题时间被等光了。<br>所以「跑满时限而失败」不算模型做错，10-25 把这些题<strong>放宽时限</strong>（Hard 50 分钟 → 100 分钟，DeepSWE 3 小时 → 6 小时）各重跑一次，旧记录保留但不计入。<br>所有做法里只有三组有这种失败：Opus 5.5 medium 单独执行（Hard 18、DeepSWE 12）、DeepSeek 写 + Opus 5.5 medium 审（Hard 4、DeepSWE 1）、GLM 写 + DeepSeek 审（DeepSWE 1），一共 36 题。另有 1 题（Hard 上的 GLM 写 + DeepSeek 审）结果在另一台机器上，后来补上，放宽后仍跑满 100 分钟失败，按失败计。<br>重跑结果：Hard 22 题过了 19 题，DeepSWE 14 题过了 8 题；重跑时最长一题只用了 84 分钟，<strong>没有一题再跑满原来的时限</strong>，说明之前是被服务拖慢，不是题做不完。</li><li><strong>Opus 用量</strong>：Claude Code 每轮结束才报用量，而且 <code>--resume</code> 之后报的也是「整段会话到此为止的累计数」。旧脚本把每轮加起来，多轮的题多算了；被时限截断的那轮又报不出来。<br>- 跑了 2 轮以上的 154 份 Opus 记录，一律改用会话记录逐条累加的值（154 份都有会话记录）。<br>- 只跑 1 轮的，取「会话记录」和「结果文件」两者较大的那个（会话记录看不到后台小调用）。<br>- 重跑过的题只算计入的那一次。</li><li><strong>审查者被 503 挡住的题</strong>：研发大师Ultra 有 5 题（Hard 4、DeepSWE 1）审查者每轮都被模型服务 503 挡住、一次没回复，作废重跑；重跑时审查者都给了意见，5 题仍全部通过。</li><li><strong>顾问模式的三处处理</strong>：<br>- Sol 走另一条线路（同一模型），中途常被限流（429）。有 14 题 Sol 没有回复（方案或审查那一步拿不到），等于 DeepSeek 单干，这些<strong>作废重跑</strong>，旧记录保留但不计入。最终计入的每题 Sol 都给了方案和审查。<br>- Hard 的收卷脚本原来只取「还没提交的改动」，而顾问模式会让 DeepSeek 提交，最早 6 题收到空补丁。改成和开工时的版本比（已提交和未提交都算）后，<strong>Hard 整组重跑</strong>。<br>- 开工前残留的工作目录让一批题一开始就崩了，清掉后重跑。<br>- Opus 顾问那组 10-26 跑，Opus 和其他 Opus 组走同一条线路、同样用 Claude Code；整组一次跑完，没有作废或重跑的题。顾问每题都给了方案和审查，也没有一次改动仓库文件（每步前后比对 <code>git status</code>）。</li><li><strong>Codex 用量重算</strong>：Codex 每轮报的用量同样是「整段会话到此为止的累计数」，旧脚本把每轮加起来，跑了多轮的题被多算（例：某题 DeepSeek 写记了 13.5M 输入，真实 5.8M）。只跑一轮的不受影响。<br>- 1,603 份多轮记录，直接取会话记录里最后的累计数。<br>- 478 份找不到会话记录（工作目录已不在），按同做法、同角色、同轮数的「真实 / 原记录」比值中位数估算；拿有会话记录的题交叉验证，估算总数误差约 ±5%。<br>- 13 份写代码方的记录被时限截断、用量记成 0，会话记录也已不在，按同做法里跑了 40 分钟以上的题的用量中位数估算（GLM 单干那 1 份没有可参照的题，仍是 0）。</li><li><strong>之前发布的版本多算了</strong>：文中花费和 5.4 的 token 数都已重算。多数研发大师组的旧花费是真实值的 2–2.5 倍；Opus 5.5 medium 单独执行多算约 6%，DeepSeek 写 + Opus 5.5 medium 审多算约 60%。两个脚本都已改成只取最后一次。</li><li><strong>价格</strong>：一律按官方原价（Standard 档）记，美元/百万 token：</li></ul>
<table><thead><tr><th>模型</th><th>未命中输入</th><th>命中缓存输入</th><th>输出</th></tr></thead><tbody><tr><td>deepseek-flash</td><td>0.15</td><td>0.03</td><td>0.60</td></tr><tr><td>glm-5.3-flash</td><td>0.15</td><td>0.03</td><td>0.50</td></tr><tr><td>gpt-6.1-sol</td><td>2.00</td><td>0.10</td><td>10.00</td></tr><tr><td>claude-opus-5-5</td><td>4.00</td><td>0.20</td><td>20.00</td></tr></tbody></table>
<p>Opus 另有写缓存，按输入价的 1.25 倍记。</p>
<h2>5. 结果</h2>
<h3>5.1 DeepSWE（112 题）</h3>
<table><thead><tr><th>做法</th><th>通过</th><th>通过率</th><th>95% 置信区间</th><th>总花费</th><th>每题花费中位</th><th>每题分钟中位</th></tr></thead><tbody><tr><td><strong>研发大师Ultra</strong></td><td><strong>90</strong></td><td><strong>80.4%</strong></td><td>72–87%</td><td>$71</td><td>$0.55</td><td>24.5</td></tr><tr><td>GPT Sol Max</td><td>84</td><td>75.0%</td><td>66–82%</td><td>$117</td><td>$0.90</td><td>21.3</td></tr><tr><td>研发大师High</td><td>79</td><td>70.5%</td><td>62–78%</td><td>$52</td><td>$0.38</td><td>21.5</td></tr><tr><td>Opus 5.5 medium 单独执行</td><td>83</td><td>74.1%</td><td>65–81%</td><td>$398</td><td>$1.62</td><td>23.6</td></tr><tr><td>Sol 单干</td><td>87</td><td>77.7%</td><td>69–84%</td><td>$83</td><td>$0.58</td><td>13.5</td></tr><tr><td>Sol 写 + Sol 审</td><td>85</td><td>75.9%</td><td>67–83%</td><td>$122</td><td>$0.84</td><td>21.6</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>81</td><td>72.3%</td><td>63–80%</td><td>$433</td><td>$2.16</td><td>33.2</td></tr><tr><td>DeepSeek 单干</td><td>76</td><td>67.9%</td><td>59–76%</td><td><strong>$33</strong></td><td>$0.24</td><td>12.7</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>72</td><td>64.3%</td><td>55–73%</td><td>$75</td><td>$0.56</td><td>15.7</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>78</td><td>69.6%</td><td>61–77%</td><td>$128</td><td>$1.03</td><td>13.9</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>66</td><td>58.9%</td><td>50–68%</td><td>$46</td><td>$0.29</td><td>36.2</td></tr><tr><td>GLM 单干</td><td>29</td><td>25.9%</td><td>19–35%</td><td>$23</td><td>$0.13</td><td>22.1</td></tr></tbody></table>
<p>Sol 单干、Sol 写 + Sol 审两组部分题两次取好（见第 4 节），分数偏高。</p>
<p>配对检验（McNemar 精确检验，只看两种做法在同一题上一对一错的题）：</p>
<table><thead><tr><th>对比</th><th>前者独赢 : 后者独赢</th><th>p</th></tr></thead><tbody><tr><td>研发大师Ultra vs DeepSeek 单干</td><td>20 : 6</td><td><strong>0.009</strong></td></tr><tr><td>研发大师Ultra vs Sol 单干</td><td>13 : 10</td><td>0.678</td></tr><tr><td>研发大师Ultra vs GPT Sol Max</td><td>16 : 10</td><td>0.327</td></tr><tr><td>研发大师Ultra vs Opus 5.5 medium 单独执行</td><td>19 : 12</td><td>0.281</td></tr><tr><td>研发大师Ultra vs DeepSeek 写 + Opus 5.5 medium 审</td><td>16 : 7</td><td>0.093</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）vs 研发大师Ultra</td><td>7 : 25</td><td><strong>0.002</strong></td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）vs DeepSeek 单干</td><td>13 : 17</td><td>0.585</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）vs Sol 单干</td><td>6 : 21</td><td><strong>0.006</strong></td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）vs DeepSeek 写 + Opus 5.5 medium 审</td><td>13 : 16</td><td>0.711</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）vs Opus 5.5 medium 单独执行</td><td>9 : 14</td><td>0.405</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）vs DeepSeek 写 + Sol 审（顾问模式）</td><td>18 : 12</td><td>0.362</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）vs DeepSeek 单干</td><td>17 : 15</td><td>0.860</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）vs 研发大师Ultra</td><td>10 : 22</td><td>0.050</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审 vs DeepSeek 单干</td><td>18 : 13</td><td>0.473</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审 vs Opus 5.5 medium 单独执行</td><td>14 : 16</td><td>0.856</td></tr><tr><td>研发大师High vs DeepSeek 单干</td><td>16 : 13</td><td>0.711</td></tr><tr><td>Sol 单干 vs DeepSeek 单干</td><td>22 : 11</td><td>0.080</td></tr><tr><td>GPT Sol Max vs DeepSeek 单干</td><td>20 : 12</td><td>0.215</td></tr><tr><td>Opus 5.5 medium 单独执行 vs DeepSeek 单干</td><td>22 : 15</td><td>0.324</td></tr><tr><td>Opus 5.5 medium 单独执行 vs Sol 单干</td><td>8 : 12</td><td>0.503</td></tr><tr><td>GPT Sol Max vs Sol 单干（默认强度）</td><td>4 : 7</td><td>0.549</td></tr><tr><td>Sol 写 + Sol 审（自己审自己）vs Sol 单干</td><td>5 : 7</td><td>0.774</td></tr><tr><td>GLM 写 + DeepSeek 审 vs GLM 单干</td><td>44 : 7</td><td>&lt;0.001</td></tr></tbody></table>
<h3>5.2 SWE-bench Pro Hard（51 题）</h3>
<table><thead><tr><th>做法</th><th>通过</th><th>通过率</th><th>95% 置信区间</th><th>总花费</th><th>每题花费中位</th><th>每题分钟中位</th></tr></thead><tbody><tr><td>研发大师Ultra</td><td>48</td><td>94.1%</td><td>84–98%</td><td>$16.1</td><td>$0.29</td><td>14.6</td></tr><tr><td>GPT Sol Max</td><td>45</td><td>88.2%</td><td>77–95%</td><td>$27.4</td><td>$0.47</td><td>11.0</td></tr><tr><td>研发大师High</td><td>44</td><td>86.3%</td><td>74–93%</td><td>$8.6</td><td>$0.14</td><td>13.1</td></tr><tr><td>Opus 5.5 medium 单独执行</td><td>46</td><td>90.2%</td><td>79–96%</td><td>$124.4</td><td>$2.05</td><td>27.4</td></tr><tr><td>Sol 写 + Sol 审</td><td>49</td><td>96.1%</td><td>87–99%</td><td>$34.1</td><td>$0.51</td><td>11.4</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>49</td><td>96.1%</td><td>87–99%</td><td>$130.7</td><td>$2.60</td><td>36.5</td></tr><tr><td>Sol 单干</td><td>48</td><td>94.1%</td><td>84–98%</td><td>$22.4</td><td>$0.39</td><td>7.5</td></tr><tr><td>DeepSeek 单干</td><td>44</td><td>86.3%</td><td>74–93%</td><td>$7.3</td><td>$0.11</td><td>10.1</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>43</td><td>84.3%</td><td>72–92%</td><td>$17.9</td><td>$0.34</td><td>10.7</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>44</td><td>86.3%</td><td>74–93%</td><td>$35.9</td><td>$0.58</td><td>9.0</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>37</td><td>72.5%</td><td>59–83%</td><td>$8.6</td><td>$0.12</td><td>17.0</td></tr><tr><td>GLM 单干</td><td>24</td><td>47.1%</td><td>34–61%</td><td>$3.0</td><td>$0.04</td><td>9.5</td></tr></tbody></table>
<p>Sol 单干、Sol 写 + Sol 审两组同上，部分题两次取好。</p>
<p>Hard 上显著的只有两类：GLM 相关（GLM 写 + DeepSeek 审 vs GLM 单干 15:2，p=0.002；DeepSeek 单干 vs GLM 单干 21:1，p&lt;0.001），<br>其余都不显著，例如 研发大师Ultra vs DeepSeek 单干 6:2（p=0.29）、Opus 5.5 medium 单独执行 vs DeepSeek 单干 5:3（p=0.73）、<br>DeepSeek 写 + Sol 审（顾问模式）vs 研发大师Ultra 2:7（p=0.18）、DeepSeek 写 + Opus 5.5 medium 审（顾问模式）vs DeepSeek 写 + Opus 5.5 medium 审 2:7（p=0.18）。<br>第一轮 Opus 5.5 medium 单独执行在 Hard 上只有 31 题（60.8%），放宽时限重跑后是 46 题（见第 4 节）。</p>
<h3>5.3 读法</h3>
<ol><li><strong>研发大师有用，但要选对审查者。</strong> 研发大师Ultra 显著好于 DeepSeek 单干（p=0.009），也高于 Sol 单干（不显著，后者还两次取好）。DeepSeek 自己审自己没有显著提升；换 Opus 5.5 medium 当审查者，也没有显著好于 DeepSeek 单干。</li><li><strong>大模型单干不比小模型单干强。</strong> Sol / GPT Sol Max / Opus 5.5 medium 单独执行 74–78%，DeepSeek 单干 68%，差别都不显著，花费却是 2.5–12 倍（DeepSWE）。</li><li><strong>Opus 5.5 medium 在这里不划算。</strong> 时限放宽后，Opus 5.5 medium 单独执行 83 题，比 DeepSeek 单干多 7 题（不显著），花费 $398 vs $33；当审查者的那组 81 题、$433，比 研发大师Ultra 贵 6 倍还少 9 题。</li><li><strong>审查者要自己动手测。</strong> 顾问模式里 Sol 只出方案、看报告，不自己跑测试，结果比 Sol 自己测的那组少 18 题（p=0.002），也没赢 DeepSeek 单干。原因在 Sol 的判断上，不在轮数上（DeepSWE）：<br>- 第一轮几乎都说「要改」（107 / 112，研发大师Ultra 是 75 / 112）：只读代码，总能想到一个没测到的边角，每轮还会提新的。<br>- 说「通过」的题真通过 64%（41 / 64），说「要改」的题也有 65% 真通过（31 / 48）——它的结论分不出对错。研发大师Ultra 里 Sol 说「通过」的题 81% 真通过（89 / 110）。<br>- 所以 2 轮审完还在说「要改」的 48 题，多给轮数大概率只是多提意见；它说「通过」却没过的，例如 <code>prometheus-transactional-reload-status</code>，DeepSeek 报告「全部用例通过」，判分时 15 个目标测试一个没过。</li><li><strong>顾问模式没省钱。</strong> DeepSWE $75 vs $71，Hard $17.9 vs $16.1，略贵。<br>- Sol 那边确实省了：研发大师Ultra 里 Sol 花 $29（占 41%），顾问模式降到 $19。<br>- DeepSeek 那边多花得更多：$42 → $56。它多干的活按「重读」收钱：每走一步都把整段对话再发一遍。它要读长方案、把验收用例写成测试、自己跑、写报告，对话更长、步数更多，每题输入从 10.1M 涨到 13.4M、输出从 88k 涨到 118k。<br>- 一省一多，总价差不多，分数却低了 18 题。各做法每题的 token 用量见 5.4。</li><li><strong>顾问换成 Opus 5.5 medium：省钱了，但只是「DeepSeek 单干 + 一份方案」。</strong> DeepSWE 78 题（69.6%），花费 $128，是 DeepSeek 写 + Opus 5.5 medium 审（$433）和 Opus 5.5 medium 单独执行（$398）的 30% 左右，用时也短（中位 13.9 vs 33.2 / 23.6 分钟）；分数比这两组少 3–5 题，都不显著（13 : 16、9 : 14）。<br>- 和 Sol 顾问正好相反，Opus 顾问几乎不拦：最后说「通过」的 109 / 112 题（Hard 49 / 51），其中真通过 70%。第一轮就说「要改」的只有 39 题（Sol 顾问 107 题）。<br>- 所以它比 Sol 顾问多过 6 题（不显著），DeepSeek 返工少、对话短，DeepSeek 那边每题输入 8.3M（Sol 顾问组 13.4M）。<br>- 但和 DeepSeek 单干比只多 2 题（17 : 15，p=0.86），花费是它的 4 倍；比 研发大师Ultra 少 12 题（10 : 22，p=0.05）。两种顾问都说明同一件事：<strong>只读不跑的审查，不是拦得太多就是拦得太少，代替不了自己动手测。</strong></li><li><strong>max 思考强度不值。</strong> GPT Sol Max 和 Sol 单干 差不多（4 : 7，p=0.55），花费 1.4 倍（$117 vs $83）。</li><li><strong>大模型自己审自己没用。</strong> Sol 写 + Sol 审和 Sol 单干打平（5 : 7，p=0.77），花费 1.5 倍（$122 vs $83）。</li></ol>
<h3>5.4 每题 token 用量</h3>
<p>每种做法里每个模型每题用了多少 token（单位：千 token；输入含重复发送的上下文）。逐题明细在附件 <code>tokens-deepswe.csv</code> / <code>tokens-hard.csv</code>。</p>
<p><strong>DeepSWE（112 题）</strong></p>
<table><thead><tr><th>做法</th><th>角色</th><th>模型</th><th>输入均值</th><th>输入中位</th><th>输出均值</th><th>输出中位</th></tr></thead><tbody><tr><td>研发大师Ultra</td><td>写</td><td>deepseek-flash</td><td>10,123</td><td>8,129</td><td>87.6</td><td>74.9</td></tr><tr><td>研发大师Ultra</td><td>审</td><td>gpt-6.1-sol</td><td>404</td><td>298</td><td>5.1</td><td>5.1</td></tr><tr><td>GPT Sol Max</td><td>写</td><td>gpt-6.1-sol</td><td>3,448</td><td>2,751</td><td>48.3</td><td>43.5</td></tr><tr><td>研发大师High</td><td>写</td><td>deepseek-flash</td><td>10,048</td><td>8,042</td><td>84.6</td><td>74.5</td></tr><tr><td>研发大师High</td><td>审</td><td>deepseek-flash</td><td>2,095</td><td>1,636</td><td>40.4</td><td>36.0</td></tr><tr><td>Opus 5.5 medium 单独执行</td><td>写</td><td>claude-opus-5-5</td><td>4,270</td><td>1,681</td><td>58.7</td><td>30.9</td></tr><tr><td>DeepSeek 单干</td><td>写</td><td>deepseek-flash</td><td>8,001</td><td>6,499</td><td>73.4</td><td>66.5</td></tr><tr><td>GLM 单干</td><td>写</td><td>glm-5.3-flash</td><td>5,983</td><td>3,696</td><td>25.7</td><td>23.3</td></tr><tr><td>Sol 单干</td><td>写</td><td>gpt-6.1-sol</td><td>1,760</td><td>1,147</td><td>18.7</td><td>17.8</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>写</td><td>glm-5.3-flash</td><td>9,411</td><td>5,765</td><td>36.1</td><td>30.2</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>审</td><td>deepseek-flash</td><td>2,265</td><td>1,755</td><td>40.7</td><td>37.6</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>写</td><td>deepseek-flash</td><td>13,442</td><td>10,502</td><td>118.2</td><td>99.3</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>审</td><td>gpt-6.1-sol</td><td>437</td><td>420</td><td>3.8</td><td>3.8</td></tr><tr><td>Sol 写 + Sol 审</td><td>写</td><td>gpt-6.1-sol</td><td>2,225</td><td>1,539</td><td>20.8</td><td>18.3</td></tr><tr><td>Sol 写 + Sol 审</td><td>审</td><td>gpt-6.1-sol</td><td>352</td><td>267</td><td>6.1</td><td>5.8</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>写</td><td>deepseek-flash</td><td>11,028</td><td>7,313</td><td>97.6</td><td>75.2</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>审</td><td>claude-opus-5-5</td><td>3,959</td><td>1,239</td><td>75.9</td><td>26.7</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>写</td><td>deepseek-flash</td><td>8,332</td><td>6,316</td><td>83.4</td><td>73.0</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>审</td><td>claude-opus-5-5</td><td>471</td><td>420</td><td>10.4</td><td>9.7</td></tr></tbody></table>
<p><strong>SWE-bench Pro Hard（51 题）</strong></p>
<table><thead><tr><th>做法</th><th>角色</th><th>模型</th><th>输入均值</th><th>输入中位</th><th>输出均值</th><th>输出中位</th></tr></thead><tbody><tr><td>研发大师Ultra</td><td>写</td><td>deepseek-flash</td><td>3,661</td><td>2,660</td><td>43.2</td><td>40.9</td></tr><tr><td>研发大师Ultra</td><td>审</td><td>gpt-6.1-sol</td><td>283</td><td>255</td><td>3.9</td><td>4.1</td></tr><tr><td>GPT Sol Max</td><td>写</td><td>gpt-6.1-sol</td><td>1,534</td><td>1,318</td><td>24.7</td><td>22.7</td></tr><tr><td>研发大师High</td><td>写</td><td>deepseek-flash</td><td>2,822</td><td>2,329</td><td>38.8</td><td>38.8</td></tr><tr><td>研发大师High</td><td>审</td><td>deepseek-flash</td><td>923</td><td>635</td><td>20.1</td><td>19.5</td></tr><tr><td>Opus 5.5 medium 单独执行</td><td>写</td><td>claude-opus-5-5</td><td>2,355</td><td>1,870</td><td>56.3</td><td>29.6</td></tr><tr><td>DeepSeek 单干</td><td>写</td><td>deepseek-flash</td><td>3,379</td><td>2,316</td><td>42.3</td><td>38.8</td></tr><tr><td>GLM 单干</td><td>写</td><td>glm-5.3-flash</td><td>1,633</td><td>896</td><td>10.8</td><td>9.2</td></tr><tr><td>Sol 单干</td><td>写</td><td>gpt-6.1-sol</td><td>931</td><td>665</td><td>9.7</td><td>8.6</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>写</td><td>glm-5.3-flash</td><td>3,132</td><td>1,369</td><td>13.5</td><td>10.2</td></tr><tr><td>GLM 写 + DeepSeek 审</td><td>审</td><td>deepseek-flash</td><td>1,292</td><td>966</td><td>24.5</td><td>22.5</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>写</td><td>deepseek-flash</td><td>5,785</td><td>5,329</td><td>63.7</td><td>59.1</td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td>审</td><td>gpt-6.1-sol</td><td>307</td><td>285</td><td>2.9</td><td>2.8</td></tr><tr><td>Sol 写 + Sol 审</td><td>写</td><td>gpt-6.1-sol</td><td>871</td><td>615</td><td>9.3</td><td>8.7</td></tr><tr><td>Sol 写 + Sol 审</td><td>审</td><td>gpt-6.1-sol</td><td>349</td><td>256</td><td>5.2</td><td>4.5</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>写</td><td>deepseek-flash</td><td>3,240</td><td>2,387</td><td>44.0</td><td>40.6</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td>审</td><td>claude-opus-5-5</td><td>2,368</td><td>2,210</td><td>65.6</td><td>68.1</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>写</td><td>deepseek-flash</td><td>3,729</td><td>2,589</td><td>47.1</td><td>43.1</td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td>审</td><td>claude-opus-5-5</td><td>326</td><td>298</td><td>6.8</td><td>6.1</td></tr></tbody></table>
<h2>6. 过程中发现的问题和处理</h2>
<h3>6.1 判分时测试卡死</h3>
<p>有 5 份答案判分时测试卡住，30 分钟上限超时；空闲时放宽到 2 小时重判，仍然全部超时。按失败计。<br>同一套测试，别的做法的答案几分钟就判完，所以问题出在<strong>这几份答案的代码</strong>。</p>
<p>我们把其中 4 份放进断网容器重跑测试，10 分钟后拍下容器里每个进程在干什么（CPU、内核等待点、打开的连接）。卡法分三种：</p>
<table><thead><tr><th>卡法</th><th>题目（哪种做法的答案）</th><th>现场</th><th>原因</th></tr></thead><tbody><tr><td>互相等，谁也不动</td><td>pwntools「多路复用管道」（Sol 单干）</td><td>pytest 停在 <code>test_flow_control_does_not_block_other_channels</code>，CPU 0%，线程在等锁</td><td>一条通道塞满后，代码把<strong>所有</strong>通道都堵住了——这正是这条测试要抓的毛病，测试于是永远等下去</td></tr><tr><td>互相等，谁也不动</td><td>koota「组合特性」（GLM 单干、GLM 写 + DeepSeek 审）</td><td>老测试都跑完，新测试 <code>aspect.test.ts</code> 一开始就不动，CPU 0.1%</td><td>新代码里某个等待永远没人来叫醒（两份答案卡在同一处）</td></tr><tr><td>测完不退出</td><td>langchain「请求合并」（GLM 单干）</td><td>测试 26 秒就跑完（4 个失败），但 pytest 进程一直不退出</td><td>后台线程报错死掉，等它结果的线程永远等着，又不是后台守护线程，进程退不掉</td></tr></tbody></table>
<p>模型看不到这些隐藏测试（只看得到仓库原有测试），所以这类「测试一跑就卡」也是真实的答错，不是判分工具的问题。</p>
<h2>7. 复现方法</h2>
<p>全部脚本附在文末附录（5 个 Python 文件，点开看全文）。下面的命令都在放脚本和题目的目录里跑。</p>
<h3>7.0 做法和代号对照</h3>
<p>脚本里每种做法用一个代号：</p>
<table><thead><tr><th>做法</th><th>代号</th></tr></thead><tbody><tr><td>研发大师Ultra（DeepSeek 写 + Sol 审）</td><td><code>dsf_t_sol</code></td></tr><tr><td>GPT Sol Max（Sol 单干，max）</td><td><code>solo_solmax</code></td></tr><tr><td>研发大师High（DeepSeek 写 + DeepSeek 审）</td><td><code>dsf_t_dsf</code></td></tr><tr><td>Opus 5.5 medium 单独执行</td><td><code>solo_opus</code></td></tr><tr><td>Sol 单干</td><td><code>solo_sol</code></td></tr><tr><td>DeepSeek 单干</td><td><code>solo_dsf</code></td></tr><tr><td>GLM 单干</td><td><code>solo_glm</code></td></tr><tr><td>GLM 写 + DeepSeek 审</td><td><code>glm_t_dsf</code></td></tr><tr><td>Sol 写 + Sol 审</td><td><code>sol_t_sol</code></td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审</td><td><code>dsf_t_opus</code></td></tr><tr><td>DeepSeek 写 + Sol 审（顾问模式）</td><td><code>dsf_a_sol</code></td></tr><tr><td>DeepSeek 写 + Opus 5.5 medium 审（顾问模式）</td><td><code>dsf_a_opus</code></td></tr></tbody></table>
<h3>7.1 准备</h3>
<ol><li>一台 16 核 / 60G 的 Linux 机器，装 Docker。</li><li>题目：SWE-bench Pro V2 仓库（<code>SWE-bench_Pro-os/v2/tasks</code>）和 DeepSWE v1.1（<code>deep-swe/tasks</code>），和脚本放在同一目录；题单 <code>hard51.json</code>、<code>deepswe113.json</code>（题目 id 列表）。</li><li><code>bin/</code> 里放 Codex CLI 0.155.1（官方 musl 静态版 <code>codex</code> 和 <code>codex-code-mode-host</code>）、<code>rg</code>，以及附件里的 <code>bin/inrelay.py</code>（容器里的小转发器）；跑 Opus 还要放 Claude Code 2.1.309（<code>claude-linux-x64</code> 和 musl 版 <code>claude-linux-x64-musl</code>）。整个目录只读挂进容器 <code>/opt/pbcodex</code>。</li><li>一个兼容 OpenAI Responses 接口的模型服务，地址和令牌写进 <code>~/.pairbench.env</code>：<code>PAIRBENCH_GATEWAY_URL=…</code>、<code>PAIRBENCH_GATEWAY_TOKEN=…</code>（令牌只按变量名传给容器，不打印）。路径不是 <code>/v1</code> 时设 <code>PB_GW_PATH</code>。跑 Opus 时，同一个服务还要提供 Anthropic <code>/v1/messages</code> 接口。</li></ol>
<h3>7.2 跑一种做法</h3>
<pre><code>set -a &amp;&amp; . ~/.pairbench.env &amp;&amp; set +a
PB_BENCH=deepswe RES=results-deepswe python3 run_swepro.py dsf_t_sol --tasks deepswe113.json --par 8
PB_BENCH=hard    RES=results-hard    python3 run_swepro.py dsf_t_sol --tasks hard51.json     --par 8
# 顾问模式：PB_ADV_MODEL=sol → dsf_a_sol，PB_ADV_MODEL=opus → dsf_a_opus
PB_BENCH=deepswe RES=results-deepswe PB_ADV_MODEL=sol  python3 run_advice.py deepswe113.json 4
PB_BENCH=deepswe RES=results-deepswe PB_ADV_MODEL=opus python3 run_advice.py deepswe113.json 4</code></pre>
<ul><li>模型和思考强度在 <code>run_swepro.py</code> 的 <code>MODELS</code> / <code>ARMS</code> 里，提示词也在里面。</li><li>每题结果写 <code>results-*/&lt;代号&gt;/&lt;题&gt;.json</code>（含用量、用时、判分细节）和 <code>.patch</code>（模型的代码改动）。</li></ul>
<h3>7.3 补跑与重判</h3>
<pre><code># 被服务报错/超时打断的失败：旧记录移到 _superseded/，再跑一次，记录带 rerun_reason
# jobs.json 形如 [{&quot;arm&quot;: &quot;solo_sol&quot;, &quot;id&quot;: &quot;&lt;题&gt;&quot;, &quot;why&quot;: &quot;&lt;原因&gt;&quot;}]
PB_BENCH=deepswe RES=results-deepswe python3 rerun_driver.py jobs.json 4
# 跑满时限而失败的：放宽时限再跑（秒；这里 Hard 100 分钟、DeepSWE 6 小时）
PB_BUDGET_S=6000  PB_BENCH=hard    RES=results-hard    python3 rerun_driver.py tcap-hard.json 4
PB_BUDGET_S=21600 PB_BENCH=deepswe RES=results-deepswe python3 rerun_driver.py tcap-deepswe.json 4
# 判分超时的放宽到 2 小时重判
PB_BENCH=deepswe RES=results-deepswe python3 regrade_long.py 3 &lt;代号&gt;/&lt;题&gt; ...</code></pre>
<h3>7.4 统计</h3>
<pre><code># 多台机器时，把各机器的 results-* 拷到 collected-results-*/&lt;机器名&gt;/ 下；单机就放一个子目录
python3 report.py            # 通过率 + Wilson 置信区间 + 花费 + 用时 + McNemar
PB_ACCT_ARMS=solo_solmax PB_ACCT_PARTIAL=solo_sol,sol_t_sol python3 report.py
# 前者整组用 collected-results-*-af/ 下的重跑数据；后者在 clean-&lt;代号&gt;.json 列出的题里只换「重跑通过、原来没过」的
# Codex 用量：目录里有 codex-usage-&lt;机器名&gt;.json（codex_cost.py 按会话记录重算）时，多轮记录用它；没有的按比值估算
# Opus 用量：目录里有 opus-usage-from-transcripts.json（按会话记录重算）时，每题取它和结果文件里较大的那个</code></pre>
<p>取数规则：去掉占位；同一 (做法, 题) 有多份时优先补跑记录，其次取开工最早的；剔除标准答案都过不了的题；价格按原价。</p>
<h2>8. 局限</h2>
<ul><li>每个 (做法, 题) 只跑了一次，没有重复跑估计随机性。</li><li>GPT Sol Max 用的是换线路后的完整重跑数据；Sol 单干、Sol 写 + Sol 审部分题两次取好、分数偏高（见第 4 节）；研发大师Ultra 只用原线路一次。和其他做法比（DeepSeek、Opus、GPT Sol Max），差距要打折看。</li><li>Opus 用的是 Claude Code，其他模型用的是 Codex；agent 不同本身会影响分数。跑满时限的失败只给 Opus 和 GLM 那几组放宽时限重跑了一次（其他做法没有这种失败），等于这几题多给了一次机会。</li><li>顾问模式的 Sol 走另一条线路，作废了 14 题无回复的结果后重跑；Opus 顾问和其他 Opus 组同一条线路、同一个 agent（Claude Code），和 Sol 顾问（Codex）比时 agent 也不同。顾问的提示词只试了一版。</li><li>Hard 已接近饱和，结论主要来自 DeepSWE。</li><li>思考强度用的是默认（medium）；榜单常用最高档，这会让 GPT 单干分数低于公开榜单。</li></ul>
<h2>附录：脚本</h2>
<table><thead><tr><th>文件</th><th>做什么</th></tr></thead><tbody><tr><td><code>run_swepro.py</code></td><td>主程序：拉镜像、起断网容器、跑 Codex 或 Claude Code（单干或写 + 审）、判分、记用量和用时</td></tr><tr><td><code>run_advice.py</code></td><td>顾问模式（<code>dsf_a_sol</code> / <code>dsf_a_opus</code>，用 <code>PB_ADV_MODEL</code> 选顾问）：顾问只读代码出方案和验收用例、最后看报告；DeepSeek 写测试、写代码、跑测试</td></tr><tr><td><code>rerun_driver.py</code></td><td>补跑一批 (做法, 题)，旧记录挪到 <code>_superseded/</code>；设 <code>PB_BUDGET_S</code> 可放宽时限</td></tr><tr><td><code>regrade_long.py</code></td><td>答案不重做，把判分时限放宽到 2 小时重判</td></tr><tr><td><code>bin/inrelay.py</code></td><td>断网容器里的转发器：把 <code>127.0.0.1:18080</code> 上的请求经 unix socket 交给宿主，再由宿主发给模型服务</td></tr><tr><td><code>report.py</code></td><td>汇总：通过率、Wilson 置信区间、花费、用时、McNemar 配对检验</td></tr><tr><td><code>codex_cost.py</code></td><td>按 Codex 会话记录重算每题真实用量（旧脚本把会话累计数逐轮相加，多算了），写 <code>codex-usage-&lt;机器名&gt;.json</code> 给 <code>report.py</code> 用</td></tr><tr><td><code>tokens.py</code></td><td>每题每个模型的 token 用量，写 <code>tokens-&lt;题集&gt;.csv</code> 并出 5.4 的表</td></tr></tbody></table>
<details><summary><code>run_swepro.py</code></summary>
<pre><code>#!/usr/bin/env python3
&quot;&quot;&quot;SWE-bench Pro V2 上跑结对：agent 在题目自带的容器里改代码，判分在全新容器里跑官方 tests/test.sh。
<span></span>
模型都经一个兼容 OpenAI Responses 接口的模型服务调用（deepseek-flash / glm-5.3-flash / gpt-6.1-sol / gpt-6-astra）；Opus 经同一服务的 Anthropic 接口，用 Claude Code 跑。
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
BUDGET_S = int(os.environ.get(&quot;PB_BUDGET_S&quot;, BUDGET_S))   # 10-25：跑满时限的失败题放宽时限重跑时用
AGENT_GW = &quot;http://127.0.0.1:18080&quot;   # agent 容器断网，只能经这个回环端口 -&gt; 宿主转发器 -&gt; 模型服务
GW_PATH = os.environ.get(&quot;PB_GW_PATH&quot;, &quot;/v1&quot;)  # local-pool proxy path override
ACCT = set(filter(None, os.environ.get(&quot;PB_ACCT_MODELS&quot;, &quot;&quot;).split(&quot;,&quot;)))
CLAUDE_CODE = {&quot;opus&quot;}   # 10-24：这些模型改用 Claude Code 跑（容器里 /opt/pbcodex/claude-linux-x64[-musl]），其余仍用 Codex   # 10-23：这些模型走 /acct/v1（宿主上的路由转到另一条模型服务线路），其余走默认线路
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
        &quot;solo_solmax&quot;: (&quot;solmax&quot;, None), &quot;solo_opus&quot;: (&quot;opus&quot;, None), &quot;dsf_t_opus&quot;: (&quot;dsf&quot;, &quot;opus&quot;)}   # 10-22 加：Sol 推理开到 max 单干（榜单用 max；不设时模型服务默认 medium）   # 10-22 加：Sol 写 + Sol 审   # 10-22 加：大模型单干对照   # 10-21 加：最强的 GPT 当审查者
MODELS = {&quot;glm&quot;: (&quot;glm-5.3-flash&quot;, &quot;low&quot;), &quot;dsf&quot;: (&quot;deepseek-flash&quot;, &quot;&quot;), &quot;sol&quot;: (&quot;gpt-6.1-sol&quot;, &quot;&quot;), &quot;astra&quot;: (&quot;gpt-6-astra&quot;, &quot;&quot;), &quot;solmax&quot;: (&quot;gpt-6.1-sol&quot;, &quot;max&quot;), &quot;opus&quot;: (&quot;claude-opus-5-5&quot;, &quot;medium&quot;)}   # 10-24 加：Opus 5.5，用 Claude Code 跑
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
        self.path = &quot;/acct/v1&quot; if who in ACCT else GW_PATH
        self.cname, self.root, self.home, self.thread = cname, root, f&quot;/pbhome/codex-{role}&quot;, None
        self.usage = {&quot;model&quot;: self.model, &quot;input&quot;: 0, &quot;cached&quot;: 0, &quot;output&quot;: 0, &quot;turns&quot;: 0}
        if who in ACCT: self.usage[&quot;route&quot;] = &quot;acct&quot;
<span></span>
    def turn(self, text):
        cfg = [&quot;-c&quot;, &quot;model_provider=pb&quot;,
               &quot;-c&quot;, f&quot;model_providers.pb={{ name=&#x27;pb&#x27;, base_url=&#x27;{AGENT_GW}{self.path}&#x27;, env_key=&#x27;PAIRBENCH_GATEWAY_TOKEN&#x27;, wire_api=&#x27;responses&#x27; }}&quot;,
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
                # turn.completed 报的是整个会话到此为止的累计（resume 也接着累计），取最新值，别逐轮相加（10-26 修）
                self.usage[&quot;input&quot;] = u.get(&quot;input_tokens&quot;, 0); self.usage[&quot;cached&quot;] = u.get(&quot;cached_input_tokens&quot;, 0)
                self.usage[&quot;output&quot;] = u.get(&quot;output_tokens&quot;, 0); self.usage[&quot;turns&quot;] += 1; self.usage[&quot;usage_cum_ok&quot;] = True
            elif t in (&quot;turn.failed&quot;, &quot;error&quot;): err = json.dumps(j)[:400]
        if not reply and re.search(r&quot;401|403|unauthorized|invalid_api_key&quot;, err, re.I): raise GatewayDown(err)
        if not reply: log(&quot;NOREPLY&quot;, self.cname, &quot; &quot;.join((err or perr[-300:]).split())[:300])   # 试水排错：别把错误吞掉
        return reply or f&quot;(no reply; {err or perr[-300:]})&quot;
<span></span>
<span></span>
<span></span>
class DockerClaude:
    &quot;&quot;&quot;容器里的一个 Claude Code 会话（10-24 加，Opus 用）：第一轮 claude -p，之后 --resume &lt;session&gt;。
    提示词走 stdin；令牌只按变量名传进容器；会话记录落在 /pbhome/claude-&lt;role&gt;。断网环境里关掉联网工具。&quot;&quot;&quot;
<span></span>
    def __init__(self, who, cname, root, role, deadline):
        self.model, self.effort = MODELS[who]; self.deadline = deadline
        self.cname, self.root, self.home, self.thread = cname, root, f&quot;/pbhome/claude-{role}&quot;, None
        self.usage = {&quot;model&quot;: self.model, &quot;input&quot;: 0, &quot;cached&quot;: 0, &quot;cache_write&quot;: 0, &quot;output&quot;: 0, &quot;turns&quot;: 0,
                      &quot;harness&quot;: &quot;claude-code&quot;, &quot;cc_cost_usd&quot;: 0.0}
        os.environ[&quot;ANTHROPIC_AUTH_TOKEN&quot;] = os.environ[&quot;PAIRBENCH_GATEWAY_TOKEN&quot;]
<span></span>
    def turn(self, text):
        left = int(self.deadline - time.time())
        if left &lt; 60: return &quot;(no reply; budget exhausted)&quot;
        m = self.model
        env = {&quot;ANTHROPIC_BASE_URL&quot;: AGENT_GW, &quot;CLAUDE_CONFIG_DIR&quot;: self.home, &quot;IS_SANDBOX&quot;: &quot;1&quot;,
               &quot;CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC&quot;: &quot;1&quot;, &quot;DISABLE_AUTOUPDATER&quot;: &quot;1&quot;,
               # 模型服务上没有 Haiku：后台小活和子代理也用同一个模型
               &quot;ANTHROPIC_DEFAULT_HAIKU_MODEL&quot;: m, &quot;ANTHROPIC_DEFAULT_SONNET_MODEL&quot;: m, &quot;ANTHROPIC_DEFAULT_OPUS_MODEL&quot;: m,
               &quot;CLAUDE_CODE_SUBAGENT_MODEL&quot;: m, &quot;BASH_DEFAULT_TIMEOUT_MS&quot;: &quot;600000&quot;, &quot;BASH_MAX_TIMEOUT_MS&quot;: &quot;1800000&quot;}
        args = [&quot;-p&quot;, &quot;--output-format&quot;, &quot;stream-json&quot;, &quot;--verbose&quot;, &quot;--model&quot;, m,
                &quot;--dangerously-skip-permissions&quot;, &quot;--disallowedTools&quot;, &quot;WebSearch,WebFetch&quot;]
        if self.effort: args += [&quot;--effort&quot;, self.effort]
        if self.thread: args += [&quot;--resume&quot;, self.thread]
        pick = (&#x27;B=/opt/pbcodex/claude-linux-x64; ls /lib/ld-musl* &gt;/dev/null 2&gt;&amp;1 &amp;&amp; B=/opt/pbcodex/claude-linux-x64-musl; &#x27;
                f&#x27;mkdir -p {self.home} &amp;&amp; exec timeout -k 20 {left} &quot;$B&quot; &quot;$@&quot;&#x27;)
        cmd = [&quot;docker&quot;, &quot;exec&quot;, &quot;-i&quot;, &quot;-w&quot;, self.root, &quot;-e&quot;, &quot;ANTHROPIC_AUTH_TOKEN&quot;]
        for k, v in env.items(): cmd += [&quot;-e&quot;, f&quot;{k}={v}&quot;]
        cmd += [self.cname, &quot;bash&quot;, &quot;-c&quot;, f&quot;export PATH=$PATH:/opt/pbcodex; {pick}&quot;, &quot;_&quot;] + args
        try:
            p = subprocess.run(cmd, input=text, capture_output=True, text=True, timeout=left + 60)
            out, perr = p.stdout, p.stderr
        except subprocess.TimeoutExpired as e:
            out, perr = (e.stdout or b&quot;&quot;).decode() if isinstance(e.stdout, bytes) else (e.stdout or &quot;&quot;), &quot;turn timeout&quot;
            dexec(self.cname, &quot;pkill -f /opt/pbcodex/claude-linux || true&quot;)
        reply, err = &quot;&quot;, &quot;&quot;
        for line in out.splitlines():
            try: j = json.loads(line)
            except Exception: continue
            t = j.get(&quot;type&quot;)
            if t == &quot;system&quot; and j.get(&quot;subtype&quot;) == &quot;init&quot; and not self.thread: self.thread = j.get(&quot;session_id&quot;)
            elif t == &quot;result&quot;:
                self.thread = j.get(&quot;session_id&quot;) or self.thread
                if j.get(&quot;is_error&quot;): err = json.dumps(j)[:400]
                else: reply = j.get(&quot;result&quot;) or &quot;&quot;
                # --resume 后 result 报的是整个会话到此为止的累计，取最新值，别逐轮相加（10-26 修）
                tot = {&quot;input&quot;: 0, &quot;cached&quot;: 0, &quot;cache_write&quot;: 0, &quot;output&quot;: 0}
                for u in (j.get(&quot;modelUsage&quot;) or {}).values():   # 每个模型一份：未命中输入 / 命中缓存 / 写缓存 / 输出
                    cr, cw = u.get(&quot;cacheReadInputTokens&quot;, 0), u.get(&quot;cacheCreationInputTokens&quot;, 0)
                    tot[&quot;input&quot;] += u.get(&quot;inputTokens&quot;, 0) + cr + cw; tot[&quot;cached&quot;] += cr
                    tot[&quot;cache_write&quot;] += cw; tot[&quot;output&quot;] += u.get(&quot;outputTokens&quot;, 0)
                self.usage.update(tot); self.usage[&quot;cc_cost_usd&quot;] = float(j.get(&quot;total_cost_usd&quot;) or 0)
                self.usage[&quot;turns&quot;] += 1; self.usage[&quot;usage_cum_ok&quot;] = True
        if not reply and re.search(r&quot;401|403|unauthorized|authentication_error|invalid.api.key&quot;, err + perr, re.I): raise GatewayDown(err or perr[-300:])
        if not reply: log(&quot;NOREPLY&quot;, self.cname, &quot; &quot;.join((err or perr[-300:]).split())[:300])
        return reply or f&quot;(no reply; {err or perr[-300:]})&quot;
<span></span>
<span></span>
def agent(who, *a):
    return (DockerClaude if who in CLAUDE_CODE else DockerCodex)(who, *a)
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
        dev = agent(who, cname, root, &quot;dev&quot;, deadline)
        if tester:
            card = TESTER_CARD.format(root=root, instruction=instr)
            rev = agent(tester, cname, root, &quot;tester&quot;, deadline)
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
<details><summary><code>codex_cost.py</code></summary>
<pre><code># 10-26：Codex 用量按会话记录重算。turn.completed 报的是「会话累计」，旧代码逐轮相加 → 多轮的题多算。
# 对每个结果，找开工时间对得上的那次尝试（work*/&lt;arm&gt;/&lt;id&gt;/codex-&lt;role&gt;/sessions/**.jsonl），
# 每个会话文件取最后一条 total_token_usage（就是这个会话的真实合计），同一角色多个会话文件相加。
# 校验：只跑了 1 轮的角色，重算值必须等于结果文件里记的值。用法（容器里 root 跑）：python3 codex_cost.py &lt;主机名&gt;
import json, glob, os, sys
from datetime import datetime
host = sys.argv[1]
ROLE_DIRS = {&quot;dev&quot;: [&quot;dev&quot;], &quot;rev&quot;: [&quot;tester&quot;, &quot;advisor&quot;, &quot;rev&quot;]}
def sess_info(f):
    t0 = None; last = None
    for line in open(f, errors=&quot;ignore&quot;):
        try: e = json.loads(line)
        except Exception: continue
        if t0 is None and e.get(&quot;timestamp&quot;): t0 = datetime.fromisoformat(e[&quot;timestamp&quot;].replace(&quot;Z&quot;, &quot;+00:00&quot;)).timestamp()
        p = e.get(&quot;payload&quot;) or {}
        if p.get(&quot;type&quot;) == &quot;token_count&quot; and p.get(&quot;info&quot;): last = p[&quot;info&quot;][&quot;total_token_usage&quot;]
    return t0, last
dirs = {}   # (arm, tid) -&gt; [attempt dir]
for d in glob.glob(&quot;work*/*/*&quot;):
    if os.path.isdir(d): dirs.setdefault((d.split(&quot;/&quot;)[1], d.split(&quot;/&quot;)[2]), []).append(d)
out = {}
for b in (&quot;deepswe&quot;, &quot;hard&quot;, &quot;deepswe-af&quot;, &quot;hard-af&quot;):
    for rf in glob.glob(f&quot;results-{b}/*/*.json&quot;):
        arm = rf.split(&quot;/&quot;)[1]
        if arm.startswith(&quot;_&quot;): continue
        try: r = json.load(open(rf))
        except Exception: continue
        if &quot;id&quot; not in r or not r.get(&quot;usage&quot;): continue
        st = float(r.get(&quot;started&quot;) or 0); key = f&quot;{b}/{arm}/{r[&#x27;id&#x27;]}&quot;
        roles = {k: v for k, v in r[&quot;usage&quot;].items() if v and not str(v.get(&quot;model&quot;, &quot;&quot;)).startswith(&quot;claude&quot;)}
        if not roles: continue
        best = None
        for d in dirs.get((arm, r[&quot;id&quot;]), []):
            sess = {role: [sess_info(f) for rd in ROLE_DIRS[role] for f in glob.glob(f&quot;{d}/codex-{rd}/sessions/**/*.jsonl&quot;, recursive=True)] for role in roles}
            ts = [t for v in sess.values() for t, _ in v if t]
            if not ts: continue
            gap = min(ts) - st
            if -120 &lt; gap &lt; 3600 and (best is None or abs(gap) &lt; abs(best[1])): best = (d, gap, sess)
        rec = {&quot;host&quot;: host, &quot;recorded&quot;: {k: {x: v.get(x, 0) for x in (&quot;input&quot;, &quot;cached&quot;, &quot;output&quot;, &quot;turns&quot;)} for k, v in roles.items()}}
        if best:
            rec[&quot;dir&quot;], rec[&quot;gap_s&quot;] = best[0], round(best[1])
            for role, lst in best[2].items():
                lst = [u for _, u in lst if u]
                if lst: rec[role] = {&quot;input&quot;: sum(u[&quot;input_tokens&quot;] for u in lst), &quot;cached&quot;: sum(u[&quot;cached_input_tokens&quot;] for u in lst),
                                     &quot;output&quot;: sum(u[&quot;output_tokens&quot;] for u in lst), &quot;sessions&quot;: len(lst)}
        out[key] = rec
json.dump(out, open(f&quot;codex-usage-{host}.json&quot;, &quot;w&quot;), indent=1)
n = len(out); full = sum(all(k in v for k in v[&quot;recorded&quot;]) for v in out.values())
bad1 = [k for k, v in out.items() for role, rv in v[&quot;recorded&quot;].items() if rv[&quot;turns&quot;] == 1 and role in v and v[role][&quot;input&quot;] != rv[&quot;input&quot;]]
ok1 = sum(1 for v in out.values() for role, rv in v[&quot;recorded&quot;].items() if rv[&quot;turns&quot;] == 1 and role in v and v[role][&quot;input&quot;] == rv[&quot;input&quot;])
print(host, &quot;results&quot;, n, &quot;fully recomputed&quot;, full, &quot;| 1-turn check ok&quot;, ok1, &quot;mismatch&quot;, len(bad1), bad1[:5])
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
剔除标准答案在所有机器上都判不过的题；价格一律按原价（Standard 档，不乘 fast 倍率）。
--strict：DeepSWE 上「改了原有测试」的通过答案，按去掉那些改动后的重判结果算（strict-out-local/）。&quot;&quot;&quot;
import json, math, statistics, statistics as st, sys
from pathlib import Path
B = Path(__file__).resolve().parent
PRICE = {&quot;glm-5.3-flash&quot;: (0.15, 0.03, 0.50), &quot;deepseek-flash&quot;: (0.15, 0.03, 0.60),
         &quot;gpt-6.1-sol&quot;: (2.00, 0.10, 10.00), &quot;gpt-6-astra&quot;: (10.00, 1.00, 50.00),
         &quot;claude-opus-5-5&quot;: (4.00, 0.20, 20.00)}   # Opus 写缓存另按 1.25 倍输入价（5 分钟缓存），见 usd()   # 美元/百万 token：未命中输入, 命中输入, 输出
ORDER = [&quot;solo_dsf&quot;, &quot;solo_glm&quot;, &quot;solo_sol&quot;, &quot;solo_solmax&quot;, &quot;solo_astra&quot;, &quot;dsf_t_dsf&quot;, &quot;glm_t_dsf&quot;, &quot;dsf_t_sol&quot;, &quot;dsf_a_sol&quot;, &quot;dsf_t_astra&quot;, &quot;sol_t_sol&quot;, &quot;solo_opus&quot;, &quot;dsf_t_opus&quot;, &quot;dsf_a_opus&quot;]
PAIRS = [(&quot;solo_sol&quot;, &quot;solo_dsf&quot;), (&quot;solo_solmax&quot;, &quot;solo_dsf&quot;), (&quot;solo_astra&quot;, &quot;solo_dsf&quot;), (&quot;solo_solmax&quot;, &quot;solo_sol&quot;),
         (&quot;solo_astra&quot;, &quot;solo_sol&quot;), (&quot;sol_t_sol&quot;, &quot;solo_sol&quot;), (&quot;dsf_t_sol&quot;, &quot;solo_dsf&quot;), (&quot;dsf_t_astra&quot;, &quot;solo_dsf&quot;),
         (&quot;dsf_t_dsf&quot;, &quot;solo_dsf&quot;), (&quot;dsf_t_sol&quot;, &quot;solo_sol&quot;), (&quot;dsf_t_astra&quot;, &quot;solo_astra&quot;), (&quot;glm_t_dsf&quot;, &quot;solo_glm&quot;), (&quot;solo_dsf&quot;, &quot;solo_glm&quot;),
         (&quot;solo_opus&quot;, &quot;solo_dsf&quot;), (&quot;solo_opus&quot;, &quot;solo_sol&quot;), (&quot;dsf_t_opus&quot;, &quot;solo_dsf&quot;), (&quot;dsf_t_opus&quot;, &quot;solo_opus&quot;), (&quot;dsf_t_opus&quot;, &quot;dsf_t_sol&quot;), (&quot;dsf_t_sol&quot;, &quot;solo_solmax&quot;), (&quot;dsf_t_sol&quot;, &quot;solo_opus&quot;), (&quot;sol_t_sol&quot;, &quot;solo_dsf&quot;),
         (&quot;dsf_a_sol&quot;, &quot;dsf_t_sol&quot;), (&quot;dsf_a_sol&quot;, &quot;solo_dsf&quot;), (&quot;dsf_a_sol&quot;, &quot;solo_sol&quot;),
         (&quot;dsf_a_opus&quot;, &quot;dsf_t_opus&quot;), (&quot;dsf_a_opus&quot;, &quot;solo_opus&quot;), (&quot;dsf_a_opus&quot;, &quot;dsf_a_sol&quot;), (&quot;dsf_a_opus&quot;, &quot;solo_dsf&quot;), (&quot;dsf_a_opus&quot;, &quot;dsf_t_sol&quot;)]   # 10-26 顾问模式（顾问 Sol / Opus）
def usd(u):
    if not u: return 0.0
    p = PRICE[u[&quot;model&quot;]]; return ((u[&quot;input&quot;] - u[&quot;cached&quot;]) * p[0] + u[&quot;cached&quot;] * p[1] + u[&quot;output&quot;] * p[2] + u.get(&quot;cache_write&quot;, 0) * p[0] * 0.25) / 1e6
def wilson(x, n, z=1.96):
    p = x / n; c = (p + z * z / 2 / n) / (1 + z * z / n); h = z * math.sqrt(p * (1 - p) / n + z * z / 4 / n / n) / (1 + z * z / n); return c - h, c + h
def mcnemar(b, c):
    n = b + c
    return 1.0 if n == 0 else min(1.0, 2 * sum(math.comb(n, i) for i in range(min(b, c) + 1)) / 2 ** n)
import os
ACCT_ARMS = set(filter(None, os.environ.get(&quot;PB_ACCT_ARMS&quot;, &quot;&quot;).split(&quot;,&quot;)))   # 10-23：这些做法改用另一条线路重跑的那份（collected-&lt;RES&gt;-af），原线路那份不用
def load(res):
    best, gold = {}, {}
    files = [f for f in (B / f&quot;collected-{res}&quot;).glob(&quot;*/*/*.json&quot;) if f.parent.name not in ACCT_ARMS]
    files += [f for f in (B / f&quot;collected-{res}-af&quot;).glob(&quot;*/*/*.json&quot;) if f.parent.name in ACCT_ARMS]
    for f in files:
        d = json.loads(f.read_text())
        if f.parent.name == &quot;_gold&quot;:
            gold.setdefault(f.stem, []).append(d.get(&quot;reward&quot;)); continue
        if f.parent.name.startswith(&quot;_&quot;) or d.get(&quot;placeholder&quot;) or &quot;id&quot; not in d: continue
        k = (f.parent.name, d[&quot;id&quot;]); st0 = float(d.get(&quot;started&quot;) or 0)
        rank = (0, -st0) if d.get(&quot;rerun_reason&quot;) else (1, st0)   # 补跑优先；补跑多次（跨机器）取最新那次，没补跑的取最早那次
        d[&quot;_src&quot;] = str(f)   # 10-26：记下出处（机器、哪条线路），给 Codex 用量重算对号用
        if k not in best or rank &lt; best[k][0]: best[k] = (rank, d, f)
    # PB_ACCT_PARTIAL：这些做法只有一部分题整组重跑干净（collected-&lt;RES&gt;-af/clean-&lt;做法&gt;.json 列出题号），
    # 这些题里，只在「重跑通过、原来没通过」时换成重跑结果（两次取好，等于这些题多给了一次机会），其余题仍用原来那份
    for arm in filter(None, os.environ.get(&quot;PB_ACCT_PARTIAL&quot;, &quot;&quot;).split(&quot;,&quot;)):
        cf = B / f&quot;collected-{res}-af&quot; / f&quot;clean-{arm}.json&quot;
        if not cf.exists(): continue
        for t in json.loads(cf.read_text())[&quot;clean&quot;]:
            # 10-25：同一题在两台机器上可能各有一份（被打断的旧份 + 重跑份），有重跑份就只看重跑份
            cands = [(json.loads(f.read_text()), f) for f in (B / f&quot;collected-{res}-af&quot;).glob(f&quot;*/{arm}/{t}.json&quot;)]
            cands = [x for x in cands if not x[0].get(&quot;placeholder&quot;) and &quot;id&quot; in x[0]]
            rr = [x for x in cands if x[0].get(&quot;rerun_reason&quot;)]
            for d, f in (rr or cands)[:1]:
                old = best.get((arm, t))
                d[&quot;_src&quot;] = str(f)
                if not d.get(&quot;placeholder&quot;) and &quot;id&quot; in d and d.get(&quot;passed&quot;) and not (old and old[1].get(&quot;passed&quot;)):
                    best[(arm, t)] = ((-1, 0), d, f)
    bad = {t for t, v in gold.items() if not any(v)}
    return {k: (d, f) for k, (_, d, f) in best.items() if k[1] not in bad}, bad
def strict_fail():
    out = set()
    for f in (B / &quot;strict-out-local&quot;).glob(&quot;*.json&quot;):
        j = json.loads(f.read_text())
        if not j[&quot;grade&quot;].get(&quot;reward&quot;): out.add((j[&quot;arm&quot;], j[&quot;id&quot;]))
    return out
# 10-25：Opus（Claude Code）用量。结果文件里只记了每轮 result 事件的用量：超时被掐的那一轮没有 result，记成 0；
# 会话记录（opus-usage-from-transcripts.json）补得上被掐那轮，但看不到后台小调用（起标题等，也走 Opus）。两者取大。
OPUS_FIX = json.loads((B / &quot;opus-usage-from-transcripts.json&quot;).read_text()) if (B / &quot;opus-usage-from-transcripts.json&quot;).exists() else {}
# 10-26：Codex 的 turn.completed 报的是「会话累计」，旧代码逐轮相加，多轮的题多算了。
# codex-usage-&lt;机器&gt;.json 是按会话记录重算的真实值（codex_cost.py）；对号时要求结果文件里记的值一致，防止对错尝试。
# 只跑 1 轮的角色本来就对，直接用；会话记录已不在的（工作目录已清），按同做法、同角色、同轮数重算过的题的「真实/记录」中位比例估算。
CODEX_FIX = {}
for _f in B.glob(&quot;codex-usage-*.json&quot;):
    _h = _f.stem.split(&quot;codex-usage-&quot;)[1]
    for _k, _v in json.loads(_f.read_text()).items(): CODEX_FIX[(_h, _k)] = _v
_ratio = {}
for (_h, _k), _v in CODEX_FIX.items():
    for _role, _rv in _v[&quot;recorded&quot;].items():
        _t = _v.get(_role)
        if not _t or _rv[&quot;turns&quot;] &lt;= 1 or not _rv[&quot;input&quot;] or _t[&quot;input&quot;] &gt; _rv[&quot;input&quot;]: continue
        _arm = _k.split(&quot;/&quot;)[1]
        for _key in ((_arm, _role, _rv[&quot;turns&quot;]), (_role, _rv[&quot;turns&quot;]), (_rv[&quot;turns&quot;],)):
            _ratio.setdefault(_key, []).append({x: _t[x] / _rv[x] if _rv[x] else 1.0 for x in (&quot;input&quot;, &quot;cached&quot;, &quot;output&quot;)})
CODEX_STAT = {&quot;exact&quot;: 0, &quot;est&quot;: 0, &quot;one_turn&quot;: 0, &quot;zero_est&quot;: 0}
LONG_MED = {}   # (res, arm, role) -&gt; 跑了 40 分钟以上的题的用量中位数，给「被时限截断、记成 0」的记录估值
def codex_fixed(res, arm, d, role, u):
    if u.get(&quot;usage_cum_ok&quot;): return u   # 修过之后记的，本来就是真实值
    if not u.get(&quot;input&quot;) and not u.get(&quot;turns&quot;) and (d.get(&quot;elapsed_s&quot;) or 0) &gt;= 2400 and (res, arm, role) in LONG_MED:
        CODEX_STAT[&quot;zero_est&quot;] += 1; return {**u, **LONG_MED[(res, arm, role)], &quot;estimated&quot;: True}
    if (u.get(&quot;turns&quot;) or 0) &lt;= 1 and u.get(&quot;input&quot;): CODEX_STAT[&quot;one_turn&quot;] += 1; return u
    src = d.get(&quot;_src&quot;, &quot;&quot;); parts = src.split(&quot;/&quot;)
    try:
        ci = [i for i, x in enumerate(parts) if x.startswith(&quot;collected-results-&quot;)][-1]
        bench = parts[ci].split(&quot;collected-results-&quot;)[1]; host = parts[ci + 1]
    except IndexError: bench, host = res.split(&quot;-&quot;, 1)[1], &quot;&quot;
    rec = CODEX_FIX.get((host, f&quot;{bench}/{arm}/{d[&#x27;id&#x27;]}&quot;))
    # 记录为 0 = 那一轮被时限截断、没报用量；会话记录里有就用会话记录（10-26 审查补）
    if rec and role in rec and rec[&quot;recorded&quot;].get(role, {}).get(&quot;input&quot;) == u.get(&quot;input&quot;) and (rec[role][&quot;input&quot;] &lt;= u[&quot;input&quot;] or not u.get(&quot;input&quot;)):
        CODEX_STAT[&quot;exact&quot;] += 1; return {**u, &quot;input&quot;: rec[role][&quot;input&quot;], &quot;cached&quot;: rec[role][&quot;cached&quot;], &quot;output&quot;: rec[role][&quot;output&quot;]}
    for key in ((arm, role, u[&quot;turns&quot;]), (role, u[&quot;turns&quot;]), (u[&quot;turns&quot;],)):
        rs = _ratio.get(key)
        if rs and len(rs) &gt;= 5:
            CODEX_STAT[&quot;est&quot;] += 1
            return {**u, **{x: round(u[x] * statistics.median(r[x] for r in rs)) for x in (&quot;input&quot;, &quot;cached&quot;, &quot;output&quot;)}, &quot;estimated&quot;: True}
    return u
def opus_fixed(res, arm, d, role):
    u = (d.get(&quot;usage&quot;) or {}).get(role)
    if u and not str(u.get(&quot;model&quot;, &quot;&quot;)).startswith(&quot;claude&quot;): return codex_fixed(res, arm, d, role, u)
    v = (OPUS_FIX.get(f&quot;{res.split(&#x27;-&#x27;)[-1]}/{arm}/{d[&#x27;id&#x27;]}&quot;) or {}).get(role)
    # 10-26：Claude Code --resume 后 result 报的也是会话累计，旧代码逐轮相加 → 多轮的记录多算；多轮一律用会话记录重算值
    if v and u and u.get(&quot;model&quot;) == &quot;claude-opus-5-5&quot; and (u.get(&quot;turns&quot;) or 0) &gt;= 2: return v
    if v and (not u or u.get(&quot;model&quot;) == &quot;claude-opus-5-5&quot;) and usd(v) &gt; usd(u): return v
    return u
strict = &quot;--strict&quot; in sys.argv; SF = strict_fail() if strict else set()
for res in (&quot;results-hard&quot;, &quot;results-deepswe&quot;):
    R, bad = load(res)
    for (_a, _t), (_d, _) in R.items():   # 先算「长题」用量中位数（只用有用量的记录）
        for _role in (&quot;dev&quot;, &quot;rev&quot;):
            _u = (_d.get(&quot;usage&quot;) or {}).get(_role)
            if _u and _u.get(&quot;input&quot;) and not str(_u.get(&quot;model&quot;, &quot;&quot;)).startswith(&quot;claude&quot;) and (_d.get(&quot;elapsed_s&quot;) or 0) &gt;= 2400:
                LONG_MED.setdefault((res, _a, _role), []).append(codex_fixed(res, _a, _d, _role, _u))
    for _k, _v in list(LONG_MED.items()):
        if isinstance(_v, list): LONG_MED[_k] = {x: round(statistics.median(z[x] for z in _v)) for x in (&quot;input&quot;, &quot;cached&quot;, &quot;output&quot;)}
    P = {k: bool(d.get(&quot;passed&quot;)) and not (res.endswith(&quot;deepswe&quot;) and k in SF) for k, (d, _) in R.items()}
    print(f&quot;\n=== {res}{&#x27;（严格：改测试的按重判）&#x27; if strict else &#x27;&#x27;}   剔除坏题 {len(bad)}: {sorted(bad)}&quot;)
    print(f&quot;{&#x27;做法&#x27;:12s} {&#x27;通过&#x27;:&gt;8s} {&#x27;率&#x27;:&gt;6s} {&#x27;95%区间&#x27;:&gt;15s} {&#x27;总$&#x27;:&gt;8s} {&#x27;每题$中位&#x27;:&gt;9s} {&#x27;每题分中位&#x27;:&gt;9s} {&#x27;补跑&#x27;:&gt;4s} {&#x27;账号&#x27;:&gt;4s}&quot;)
    arms = [a for a in ORDER if any(x == a for x, _ in R)] + sorted({x for x, _ in R} - set(ORDER))
    for a in arms:
        rs = [(k, d) for k, (d, _) in R.items() if k[0] == a]; n = len(rs); x = sum(P[k] for k, _ in rs)
        cost = [usd(opus_fixed(res, a, d, &quot;dev&quot;)) + usd(opus_fixed(res, a, d, &quot;rev&quot;)) for _, d in rs if (d.get(&quot;usage&quot;) or {}).get(&quot;dev&quot;)]
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
<details><summary><code>run_advice.py</code></summary>
<pre><code>#!/usr/bin/env python3
&quot;&quot;&quot;10-25 新做法 dsf_a_opus：Opus 只动嘴（读题读代码 → 方案提示 + 文字验收用例），不写文件、不跑东西；
dsf 把用例写成测试、自己跑、自己修；最后 Opus 只看 dsf 的报告和 diff 再给意见（最多补 2 轮）。
不改 run_swepro.py（别的进程还在用它），只在本进程里把 run_job 换掉。
用法：source ~/.pairbench.env &amp;&amp; PB_BENCH=deepswe RES=results-deepswe PB_WORK=work-adv PB_SOCK=$HOME/pb-swepro/sock-adv \
      PB_KEEP_IMAGE=1 python3 run_advice.py &lt;题目清单.json&gt; &lt;并发&gt;
&quot;&quot;&quot;
import json, os, sys, time, shutil, hashlib, subprocess, traceback
from concurrent.futures import ThreadPoolExecutor
os.environ[&quot;PB_NO_CLAIM&quot;] = &quot;1&quot;
import run_swepro as r
<span></span>
# 10-25 加：顾问模式可换顾问模型（PB_ADV_MODEL=sol → 做法 dsf_a_sol）
ADV_MODEL = os.environ.get(&quot;PB_ADV_MODEL&quot;, &quot;opus&quot;)
ARM = f&quot;dsf_a_{ADV_MODEL}&quot;
r.ARMS[ARM] = (&quot;dsf&quot;, ADV_MODEL)
MAX_ADV_REVIEW = 2
<span></span>
ADVISOR = &quot;&quot;&quot;You are the ADVISOR in a pair-programming session. Another agent (the developer) will implement the change in the repository at {root}; you only give advice.
STRICT RULES: do NOT create, edit or delete any file; do NOT build, install, run tests or run programs. Only READ: ls, cat, grep, find, sed -n, head, tail. Do not use the internet or git history.
Read the issue below and the relevant code, then reply with exactly two sections:
<span></span>
PLAN: the approach in a few bullets: which files/functions to change, the order of work, and the pitfalls or edge cases that are easy to get wrong.
<span></span>
ACCEPTANCE CASES: a numbered list of 8-20 concrete cases derived from the issue. Each case = setup/input -&gt; exact expected result (return value, output, error type/message). Cover the main behaviour, every option the issue mentions, and edge cases (empty, nil/None, boundaries, invalid input, ordering). No test code, plain text only.
<span></span>
End with the line: ADVICE DONE
<span></span>
The issue:
{instruction}&quot;&quot;&quot;
<span></span>
DEV_ADVICE = &quot;&quot;&quot;
<span></span>
An advisor (a stronger model) read the issue and the code and gave the advice below. Use the plan where it helps.
Turn EVERY acceptance case into a real test you write and run yourself. Put these tests under /tmp/pairtest/ (outside the repository) so they are not part of your change; you may also add normal tests to the repository&#x27;s own test suite. Make all cases pass. If you think a case is wrong per the issue, say why instead of forcing it.
Remember to commit your work in the repository when you are done.
<span></span>
--- ADVICE ---
{advice}
--- END ADVICE ---&quot;&quot;&quot;
<span></span>
TO_A = &quot;&quot;&quot;
Now write a report for the advisor: for EACH acceptance case number: the test you wrote (file and name), the command you ran, and PASS/FAIL. Then a short summary of what you changed. Paste the real test output tail as evidence. End with the line: TO ADVISOR&quot;&quot;&quot;
<span></span>
ADV_REVIEW = &quot;&quot;&quot;Report from the developer:
<span></span>
{msg}
<span></span>
Still do NOT edit or run anything; you may read files (including /tmp/pairtest/ and `git diff`) to check the report.
Check: is every acceptance case covered by a real test that ran and passed? Does the change match the issue (read the diff)?
If good, reply with a one-line reason and VERDICT: APPROVED.
If not, list the concrete problems: missed or wrong cases, or up to 5 NEW concrete cases (input -&gt; exact expected result) the change likely gets wrong. Then VERDICT: REVISE.
End with exactly one line: VERDICT: APPROVED  or  VERDICT: REVISE&quot;&quot;&quot;
<span></span>
def dirty(cname, root):
    return r.dexec(cname, f&#x27;cd &quot;{root}&quot; &amp;&amp; git status --porcelain | head -20&#x27;).stdout.strip()
<span></span>
def run_job(arm, tid, img):
    if arm != ARM: raise RuntimeError(&quot;run_advice only runs &quot; + ARM)
    out = r.RES / arm / f&quot;{tid}.json&quot;
    tag = hashlib.md5((f&quot;{arm}/{tid}&quot; + os.environ.get(&quot;PB_REP&quot;, &quot;&quot;)).encode()).hexdigest()[:10]
    home = r.WORK / arm / tid; shutil.rmtree(home, ignore_errors=True); home.mkdir(parents=True)
    os.chmod(home, 0o777)
    cname = r.start(f&quot;pba-{tag}&quot;, img, home)
    rec = {&quot;arm&quot;: arm, &quot;id&quot;: tid, &quot;started&quot;: time.time(), &quot;reviews&quot;: [], &quot;turns&quot;: 0, &quot;advisor_violations&quot;: []}
    t0 = time.time(); dev = adv = None
    try:
        root = r.repo_root(cname)
        base0 = r.dexec(cname, f&#x27;cd &quot;{root}&quot; &amp;&amp; git rev-parse HEAD&#x27;).stdout.strip()   # 开局 HEAD，Hard 收卷以它为起点
        instr = (r.TASKS / tid / &quot;instruction.md&quot;).read_text()
        deadline = t0 + r.BUDGET_S
        dev = r.agent(&quot;dsf&quot;, cname, root, &quot;dev&quot;, deadline)
        adv = r.agent(ADV_MODEL, cname, root, &quot;advisor&quot;, deadline)
        before = dirty(cname, root)
        advice = adv.turn(ADVISOR.format(root=root, instruction=instr))
        rec[&quot;advice&quot;] = advice[:12000]; rec[&quot;advice_t&quot;] = round(time.time() - t0)
        if dirty(cname, root) != before: rec[&quot;advisor_violations&quot;].append(&quot;advice&quot;)   # 只记录，不回滚（回滚可能误伤）
        reply = dev.turn(r.GOAL.format(root=root, instruction=instr) + DEV_ADVICE.format(advice=advice)); rec[&quot;turns&quot;] += 1
        for _ in range(r.MAX_CONT):
            if r.has_marker(reply, &quot;FINISHED&quot;) or time.time() &gt; deadline - 60: break
            reply = dev.turn(r.CONTINUE); rec[&quot;turns&quot;] += 1
        msg = dev.turn(TO_A)
        for rnd in range(MAX_ADV_REVIEW):
            snap = dirty(cname, root)
            a = adv.turn(ADV_REVIEW.format(msg=msg))
            if dirty(cname, root) != snap: rec[&quot;advisor_violations&quot;].append(f&quot;review{rnd}&quot;)
            v = r.verdict(a)
            rec[&quot;reviews&quot;].append({&quot;t&quot;: round(time.time() - t0), &quot;round&quot;: rnd, &quot;verdict&quot;: v, &quot;text&quot;: a[:3000]})
            if v == &quot;APPROVED&quot; or time.time() &gt; deadline - 60: break
            msg = dev.turn(f&quot;Advisor&#x27;s reply:\n\n{a}\n\nTurn any new cases into tests under /tmp/pairtest/, fix what is wrong, re-run all your tests, commit.&quot; + TO_A)
        rec[&quot;elapsed_s&quot;] = time.time() - t0
        cap = r.CAPTURE_DEEPSWE.format(root=root, base=r.base_commit(tid)) if r.BENCH == &quot;deepswe&quot; else r.CAPTURE.format(root=root).replace(&quot;git diff --cached --binary&quot;, f&quot;git diff --cached --binary {base0}&quot;)
        rec[&quot;patch_bytes&quot;] = int((r.dexec(cname, cap, timeout=300).stdout.strip() or &quot;0&quot;).split()[-1])
    except r.GatewayDown as e:
        rec[&quot;error&quot;] = &quot;gateway_down &quot; + str(e)[:200]
    except Exception as e:
        rec[&quot;error&quot;] = repr(e)[:300]; traceback.print_exc()
    finally:
        rec[&quot;usage&quot;] = {&quot;dev&quot;: dev.usage if dev else None, &quot;rev&quot;: adv.usage if adv else None}
        try: r.dexec(cname, &quot;chmod -R a+rwX /pbhome&quot;, timeout=1800)
        except Exception as e: r.log(&quot;CHMOD SKIP&quot;, arm, tid[:60], repr(e)[:80])
        r.sh([&quot;docker&quot;, &quot;rm&quot;, &quot;-f&quot;, cname])
    if rec.get(&quot;error&quot;):
        r.log(&quot;NOT RECORDED&quot;, arm, tid[:60], rec[&quot;error&quot;][:120]); return rec
    (r.RES / arm).mkdir(parents=True, exist_ok=True)
    shutil.copy(home / &quot;model.patch&quot;, r.RES / arm / f&quot;{tid}.patch&quot;)
    try: rec[&quot;grade&quot;] = g = r.grade(tid, img, home / &quot;model.patch&quot;, tag)
    except subprocess.TimeoutExpired:
        rec[&quot;grade&quot;] = g = {&quot;reward&quot;: 0, &quot;timeout&quot;: True}; rec[&quot;grade_timeout&quot;] = True
    rec[&quot;passed&quot;] = g[&quot;reward&quot;] == 1
    out.write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    r.log(arm, tid[:70], &quot;PASS&quot; if rec[&quot;passed&quot;] else &quot;fail&quot;,
          f&quot;{rec[&#x27;elapsed_s&#x27;]/60:.0f}min reviews={len(rec[&#x27;reviews&#x27;])} viol={rec[&#x27;advisor_violations&#x27;]} patch={rec[&#x27;patch_bytes&#x27;]}B&quot;)
    return rec
<span></span>
r.run_job = run_job   # run_task 按模块全局名调用 run_job
<span></span>
if __name__ == &quot;__main__&quot;:
    if not r.GW or not os.environ.get(&quot;PAIRBENCH_GATEWAY_TOKEN&quot;): sys.exit(&quot;source ~/.pairbench.env first&quot;)
    ids = json.load(open(sys.argv[1])); par = int(sys.argv[2]) if len(sys.argv) &gt; 2 else 4
    r.start_gw_relay()
    with ThreadPoolExecutor(par) as ex: list(ex.map(lambda t: r.run_task(t, [ARM]), ids))
    r.log(&quot;ADVICE DONE ALL&quot;, len(ids))
</code></pre>
</details>
<details><summary><code>tokens.py</code></summary>
<pre><code># 10-26 每题每个模型的 token 用量：输入（含命中缓存）、其中命中缓存、输出；写 tokens-&lt;题集&gt;.csv，再打印每种做法的每题均值/中位
# 取数口径和 report.py 一致（同一份 load：补跑优先、两次取好、剔除坏题；Opus 用会话记录重算的那份）
import csv, statistics as st, os
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), &quot;report.py&quot;)).read()
exec(src[:src.index(&#x27;strict = &quot;--strict&quot;&#x27;)])
ROLE = {&quot;dev&quot;: &quot;写&quot;, &quot;rev&quot;: &quot;审&quot;}
for res in (&quot;results-deepswe&quot;, &quot;results-hard&quot;):
    R, _ = load(res); rows = []
    for (arm, tid), (d, _f) in sorted(R.items()):
        for role in (&quot;dev&quot;, &quot;rev&quot;):
            u = opus_fixed(res, arm, d, role)
            if not u: continue
            rows.append({&quot;arm&quot;: arm, &quot;task&quot;: tid, &quot;role&quot;: ROLE[role], &quot;model&quot;: u[&quot;model&quot;], &quot;input&quot;: u[&quot;input&quot;], &quot;cached&quot;: u[&quot;cached&quot;],
                         &quot;output&quot;: u[&quot;output&quot;], &quot;usd&quot;: round(usd(u), 4), &quot;passed&quot;: int(bool(d.get(&quot;passed&quot;)))})
    out = f&quot;tokens-{res.split(&#x27;-&#x27;)[-1]}.csv&quot;
    with open(out, &quot;w&quot;, newline=&quot;&quot;) as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    print(f&quot;\n=== {res}（{out}，{len(rows)} 行）  单位：千 token / 题&quot;)
    print(&quot;| 做法 | 角色 | 模型 | 题数 | 输入均值 | 输入中位 | 其中命中缓存均值 | 输出均值 | 输出中位 |&quot;)
    print(&quot;|---|---|---|---|---|---|---|---|---|&quot;)
    arms = [a for a in ORDER if any(r[&quot;arm&quot;] == a for r in rows)] + sorted({r[&quot;arm&quot;] for r in rows} - set(ORDER))
    for a in arms:
        for role in (&quot;写&quot;, &quot;审&quot;):
            xs = [r for r in rows if r[&quot;arm&quot;] == a and r[&quot;role&quot;] == role]
            if not xs: continue
            k = lambda f: [r[f] / 1000 for r in xs]
            print(f&quot;| `{a}` | {role} | {xs[0][&#x27;model&#x27;]} | {len(xs)} | {st.mean(k(&#x27;input&#x27;)):,.0f} | {st.median(k(&#x27;input&#x27;)):,.0f} | &quot;
                  f&quot;{st.mean(k(&#x27;cached&#x27;)):,.0f} | {st.mean(k(&#x27;output&#x27;)):,.1f} | {st.median(k(&#x27;output&#x27;)):,.1f} |&quot;)
</code></pre>
</details>
</div>
