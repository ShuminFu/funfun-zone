---
title: "给中文博客做一次性能体检：每页少 130 KB，页面不再跳"
description: "一个 Astro 中文博客的实测记录：中文标题字体从 143 KB 降到平均 15 KB，布局跳动的真凶是标题下的描述，以及为什么预加载字体反而更慢。"
growth: seedling
planted: 2026-11-19T14:02:31+08:00
draft: false
tags:
  - "performance"
  - "accessibility"
  - "astro"
---

<style>
.html-embed{overflow-x:auto;max-width:100%}  /* a too-wide table scrolls inside the post, not the page */
.html-embed .tldr{border-left:2px solid var(--accent);padding-left:1em}
.html-embed .tw{overflow-x:auto}
.html-embed .tw table{width:100%}
.html-embed .tw td:first-child,.html-embed .tw th:first-child{white-space:nowrap}
.html-embed .tw table.num td:nth-child(n+2){font-variant-numeric:tabular-nums}
@media (max-width:640px){.html-embed .tw td:first-child,.html-embed .tw th:first-child{white-space:normal}}
</style>

<div class="html-embed" lang="zh-CN">
<p class="subtitle">一个 Astro 中文博客的实测记录：中文标题字体怎么从 143 KB 降到平均 15 KB，布局跳动的真凶是谁，为什么预加载字体反而更慢。</p>
<p class="tldr"><b>先说结论</b>：网站本来就不慢，真正的浪费藏在三处。每页都下载一个 143 KB 的中文标题字体，但一页只用到其中 74 个字；标题下面那行描述在网页字体到达时多折了一行，把正文往下推了 28px；桌面端一行有 55 个汉字，读起来累。三处都修完，每页少下载 120–130 KB，布局跳动归零，无障碍分数全部到 100。</p>
<div class="tw"><table>
<thead><tr><th>指标（模拟慢速 4G 手机）</th><th>修之前</th><th>修之后</th></tr></thead>
<tbody>
<tr><td>每页下载量</td><td>298–373 KB</td><td><b>169–250 KB</b></td></tr>
<tr><td>布局跳动 CLS（Antigravity 那篇）</td><td>0.016</td><td><b>0</b></td></tr>
<tr><td>Lighthouse 无障碍分</td><td>90–99</td><td><b>100</b></td></tr>
<tr><td>首次出字 / 主要内容出现</td><td>1.4–1.6 s / 1.6–1.8 s</td><td>基本不变</td></tr>
<tr><td>桌面端每行汉字数</td><td>55–62</td><td><b>约 40</b></td></tr>
</tbody>
</table></div>
<h2>先量，再改</h2>
<p>用了三样工具，各管一块：</p>
<ul>
<li><b>Lighthouse 命令行</b>：性能、无障碍、最佳实践、SEO 四项打分。PageSpeed Insights 的匿名接口当天配额用完了，所以在本机跑。</li>
<li><b>博客仓库自带的 <code>perf-audit.mjs</code></b>：用 Playwright 模拟慢速 4G 手机，列出每页下载了哪些文件、各多大。</li>
<li><b>一套 UX 审查探针脚本</b>：在页面里直接量对比度、点击区域大小、标题层级、无障碍名称，手机和桌面、浅色和深色各跑一遍。</li>
</ul>
<p>第一次跑 Lighthouse 就差点被骗。默认的「模拟节流」报首次出字 4.3 秒，看着很吓人。换成 <code>--throttling-method=devtools</code>，让浏览器真的限速，同一页只要 2.0 秒。默认模式是先在快网上跑，再用模型推算慢网的耗时，推算偏悲观。<b>之后所有前后对比都用真实限速，并且在同一台机器上对比修改前和修改后两个本地构建</b>，不拿线上和本地比。</p>
<h2>第一处：中文标题字体，每页只用 9%</h2>
<p>博客的标题用 Noto Serif SC 600。完整的简体中文字体有 1.5 MB，所以原来已经做过一次裁剪：构建前扫一遍所有文章的标题，只留下用到的字，得到一个 143 KB 的子集，全站共用。</p>
<p>问题是每一页都要下载这整个文件。实际量了一下每页的标题到底用了几个字：</p>
<div class="tw"><table>
<thead><tr><th></th><th>不同汉字数</th></tr></thead>
<tbody>
<tr><td>全站子集</td><td>822</td></tr>
<tr><td>一篇文章页（中位数）</td><td>74</td></tr>
<tr><td>文章列表页（最多）</td><td>300</td></tr>
</tbody>
</table></div>
<p>读者打开一篇文章，下载了 822 个字，只用到 74 个。</p>
<h3>先试了「按使用频率分片」，效果一般</h3>
<p>第一个想法是把字体切成几片，用 <code>unicode-range</code> 让浏览器只下载用得到的那几片：常用字一片，生僻字按文章分组。写了个小模拟器估算各种分法下每页要下多少（按每字约 175 字节估）：</p>
<div class="tw"><table>
<thead><tr><th>分法</th><th>每页中位数</th><th>列表页</th></tr></thead>
<tbody>
<tr><td>不分（原来）</td><td>128 KB</td><td>128 KB</td></tr>
<tr><td>出现在 ≥3 页的字放公共片，其余分 32 片</td><td>70 KB</td><td>129 KB</td></tr>
<tr><td>出现在 ≥5 页的字放公共片，其余每页一片</td><td>61 KB</td><td>160 KB</td></tr>
</tbody>
</table></div>
<p>最多省一半，列表页反而更大。原因是页面之间共用的字太多：文章页还会显示相关文章的标题，一个页面会碰到很多片。</p>
<h3>改成「每页一个字体」</h3>
<p>既然是静态站，干脆在构建完之后逐页处理：读 <code>dist/</code> 里每个 HTML，收集标题里的汉字，给这一页单独生成一个字体，再把 <code>@font-face</code> 写进这一页的 <code>&lt;head&gt;</code>。字集相同的页面共用一个文件，文件名是内容哈希，所以浏览器缓存照样有效。</p>
<pre><code>// scripts/per-page-heading-font.mjs（postbuild，节选）
for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  const chars = headingChars(html);          // h1–h4 里的汉字 + 常用标点
  if (!chars) continue;
  let entry = made.get(chars);
  if (!entry) {
    const font = await subsetFont(source, chars, { targetFormat: 'woff2' });
    const name = sha256(font).slice(0, 10) + '.woff2';
    await writeFile(join(DIST, '_astro/hf', name), font);
    entry = { url: `/_astro/hf/${name}`, size: font.length };
    made.set(chars, entry);
  }
  await writeFile(file, html.replace('&lt;/head&gt;',
    `&lt;style&gt;@font-face{font-family:'Noto Serif SC';font-weight:600;font-display:swap;` +
    `src:url(${entry.url}) format('woff2');unicode-range:…}&lt;/style&gt;&lt;/head&gt;`));
}</code></pre>
<p>结果：76 个页面，66 个字体文件，<b>平均 15 KB，最大 53 KB</b>（列表页）。本地开发时仍然用全站子集，省得每次改动都重新跑一遍。</p>
<p>这种做法最怕漏字：脚本靠正则从 HTML 里找标题，浏览器实际用这个字体渲染的元素可能更多。所以另写了一个检查：在真浏览器里逐页遍历文字节点，凡是计算样式落在这个字体上的字都记下来，再和脚本收集的字对比。<b>45 个页面，缺字 0 个。</b></p>
<h2>第二处：布局跳动，第一个猜测是错的</h2>
<p>Antigravity 那篇在手机上有 0.016 的布局跳动。数值不大（0.1 以内都算「良好」），但读者能看到：页面出来大约 1.5 秒后，正文整体往下一跳。</p>
<p>浏览器的 <code>layout-shift</code> 记录显示是标题区变高了 28px。第一反应是中文标题字体来晚了，换字体后标题多折一行。可是换成每页小字体以后，字体明明先到了，跳动还在。</p>
<p>于是每 100 毫秒记一次标题区里每个元素的高度和字体，结果很清楚：</p>
<pre><code>dcl  1023ms  H1:83  P:112   ← 描述那段还在用系统字体
SHIFT 1609ms 0.0162
t    1626ms  H1:83  P:140   ← Inter 到了，描述多折了一行</code></pre>
<p>不是标题，是标题下面那行描述。描述里混着「Google Antigravity」「Subagents、/boost」这类英文，正文英文字体 Inter 到达之前用的是系统字体，Inter 比系统字体宽 14%。Inter 一到，英文变宽，这段就多折了一行。中文字形每个字都占一个字宽，换字体不会变宽，所以前面怀疑中文字体是冤枉它了。</p>
<h3>预加载字体：跳动没了，首屏慢了</h3>
<p>常见的做法是 <code>&lt;link rel="preload"&gt;</code>，让字体尽早下载。试了四种组合，每种跑三次：</p>
<div class="tw"><table class="num">
<thead><tr><th>预加载哪些字体</th><th>首次出字</th><th>CLS</th></tr></thead>
<tbody>
<tr><td>都不预加载</td><td>~620 ms</td><td>0.017</td></tr>
<tr><td>只预加载中文标题字体</td><td>~725 ms</td><td>0.017</td></tr>
<tr><td>中文标题 + Inter</td><td>~865 ms</td><td>0</td></tr>
<tr><td>中文标题 + Inter + Source Serif 4</td><td>~980 ms</td><td>0</td></tr>
</tbody>
</table></div>
<p>跳动是没了，代价是首次出字慢了 250–350 ms。慢网下带宽就那么点，预加载的字体会和页面 CSS 抢带宽，而 CSS 不到页面就出不来。为了消掉一次 28px 的跳动，让每个读者多等三分之一秒，不划算。</p>
<h3>换个思路：让替补字体和正式字体一样宽</h3>
<p>跳动的根源是替补字体和正式字体宽度不同。CSS 的 <code>size-adjust</code> 可以把本机字体按比例放大缩小。在浏览器里用 canvas 量同一段英文的宽度：Inter 是 Arial 的 107.3%，Source Serif 4 600 是 Georgia Bold 的 93%。于是定义两个替补字体，插在字体栈里正式字体后面：</p>
<pre><code>@font-face {
  font-family: "Inter Fallback";
  src: local("Arial"), local("ArialMT");
  size-adjust: 107.3%;
  ascent-override: 90.3%;   /* Inter 自己的 ascent ÷ size-adjust */
  descent-override: 22.5%;
  line-gap-override: 0%;
}
@font-face {
  font-family: "Source Serif 4 Fallback";
  src: local("Georgia Bold"), local("Georgia-Bold");
  font-weight: 600;
  size-adjust: 93%;
  ascent-override: 98.6%;
  descent-override: 36%;
  line-gap-override: 0%;
}
<span></span>
/* tailwind.config.mjs */
sans:  ['Inter', '"Inter Fallback"', 'system-ui', 'sans-serif'],
serif: ['"Source Serif 4"', '"Source Serif 4 Fallback"', '"Noto Serif SC"', …],</code></pre>
<p>中文不受影响：Arial 和 Georgia 里都没有汉字，汉字照旧落到后面的中文字体上。</p>
<p>结果是两头都要到了：<b>首次出字约 620–660 ms，和不预加载一样快；CLS 0–0.001</b>，和全预加载一样稳。</p>
<h2>第三处：一张图标，原图 640px，显示 100px</h2>
<p>文章列表页有两张卡片插图。原图 640×640，GPU 那张 64 KB，页面上最大才显示 176px，列表里只有 76px 左右。缩成两倍显示尺寸 352px，GPU 那张降到 20 KB，另一张从 9.7 KB 降到 3 KB。顺手给 <code>&lt;img&gt;</code> 加上 <code>width</code>/<code>height</code>，图片到之前就把位置留好；列表里的图改成懒加载。</p>
<h2>第四处：一行 55 个汉字</h2>
<p>这个问题不在性能分里，是阅读审查量出来的。有目录侧栏的文章，正文宽 680px，一行约 43 个字。没有目录的文章，正文撑满 992px，18px 字号下<b>一行 55 个汉字</b>，有一篇 16px 字号的到了 62 个。视线从行尾回到下一行开头要扫很远，容易串行。</p>
<p>改法是一行 CSS：给文章容器加 <code>max-width: 46rem</code>（736px），18px 字号下约 40 个汉字，英文约 80 个字母。改完把 42 篇文章在 375、768、1280 三种宽度下都检查了一遍，没有表格或图溢出。</p>
<h2>无障碍：六个小问题</h2>
<div class="tw"><table>
<thead><tr><th>问题</th><th>量到的数</th><th>改法</th></tr></thead>
<tbody>
<tr><td>标签胶囊太小，不好点</td><td>高 20px，要求 ≥24px（WCAG 2.5.8）</td><td>最小高度 24px</td></tr>
<tr><td>主题按钮的读屏名称和看到的字不一样</td><td>看到「Classic」，读屏念「Select color theme」（2.5.3）</td><td>名称改成「Color theme: Classic」</td></tr>
<tr><td>列表页标题层级跳级</td><td>H1 下面直接是 H3</td><td>卡片标题在列表页用 H2</td></tr>
<tr><td>计数徽章对比度不够</td><td>4.02:1，要求 4.5:1</td><td>换深一档的灰</td></tr>
<tr><td>代码注释对比度不够</td><td>4.09:1</td><td>浅色模式换成 5.74:1 的灰</td></tr>
<tr><td>18 张 HTML 流程图读屏只念一句话</td><td>外层 <code>role="img"</code> 把里面的文字藏起来了</td><td>去掉，读屏能逐个念出方框里的字</td></tr>
</tbody>
</table></div>
<p>最后一条是我自己埋的坑。之前把文章里的流程图从图片改成了 HTML 方框，为了「无障碍」给外层 <code>&lt;figure&gt;</code> 加了 <code>role="img"</code> 和 <code>aria-label</code>。结果正好相反：<code>role="img"</code> 告诉读屏软件「这是一张图，里面的东西别念了」，方框里的真文字全被藏起来，只剩一句概括。<code>role="img"</code> 只该放在 <code>&lt;svg&gt;</code> 或 <code>&lt;img&gt;</code> 上。这条规则已经写进了博客仓库里画图用的规范。</p>
<h2>顺手做的</h2>
<ul>
<li>构建产物的文件名都带内容哈希，内容一改名字就变，所以给 <code>/_astro/*</code> 加了一年的 <code>immutable</code> 缓存。第二次访问基本不再下载这些文件。</li>
<li>还剩一处 0.001 的跳动：主题按钮的文字在脚本加载后从「Theme」换成当前主题名。太小，没管。</li>
</ul>
<h2>几条收获</h2>
<ul>
<li><b>先量真实限速。</b>Lighthouse 默认的模拟节流在这个站上把首次出字算成了 4.3 秒，真实限速是 2.0 秒。</li>
<li><b>别只看文件大小，看「这页用了多少」。</b>143 KB 的字体已经是裁剪过的，但每页只用 9%。</li>
<li><b>跳动先定位元素，再猜原因。</b>每 100 毫秒记一次高度，十分钟就找到了真凶。光凭直觉的话，我会一直盯着中文字体。</li>
<li><b>预加载不是免费的。</b>慢网下它和 CSS 抢带宽。能用 <code>size-adjust</code> 解决的跳动，就别靠预加载。</li>
<li><b>好心的 ARIA 可能帮倒忙。</b>不确定时，宁可不加。</li>
</ul>
</div>
