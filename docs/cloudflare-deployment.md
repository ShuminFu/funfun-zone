# Astro项目与Cloudflare Pages集成部署指南

## 概述

本文档说明如何将Astro项目与Cloudflare Pages关联并实现自动部署，基于参考项目 `/Users/apple/Desktop/work/astro` 的配置。

## 关键配置文件

### 1. package.json - 核心依赖配置

```json
{
  "name": "astro-template",
  "dependencies": {
    "@astrojs/cloudflare": "12.4.0",  // Cloudflare适配器
    "astro": "^5.6.0"
  },
  "devDependencies": {
    "wrangler": "4.7.0"  // Cloudflare部署CLI工具
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro build && wrangler dev",
    "deploy": "astro build && wrangler deploy",
    "check": "astro build && tsc && wrangler deploy --dry-run"
  },
  "cloudflare": {
    "label": "Astro Framework Starter",
    "products": ["Workers"],
    "dash": true
  }
}
```

**关键依赖说明**：
- `@astrojs/cloudflare`: Astro的Cloudflare适配器，将构建产物转换为Cloudflare Workers兼容格式
- `wrangler`: Cloudflare官方CLI工具，用于本地开发和生产部署

### 2. astro.config.mjs - Astro配置

```javascript
// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],

  // 关键配置：使用Cloudflare适配器
  adapter: cloudflare({
    platformProxy: {
      enabled: true  // 启用本地开发时的Cloudflare平台模拟
    }
  }),

  // 可选：多语言配置
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-TW", "zh-CN"],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
```

**配置说明**：
- `adapter: cloudflare()`: 指定使用Cloudflare适配器进行构建
- `platformProxy.enabled`: 本地开发时模拟Cloudflare运行环境（如KV、R2等）

### 3. wrangler.json - Wrangler部署配置

```json
{
  "name": "astro-template",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./dist/_worker.js/index.js",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true
}
```

**配置说明**：
- `name`: 项目名称（将成为Worker的名称）
- `compatibility_date`: Cloudflare Workers兼容性日期
- `compatibility_flags`: 启用Node.js兼容模式
- `main`: Worker入口文件路径
- `assets.directory`: 静态资源目录
- `assets.binding`: 资源绑定名称
- `observability`: 启用可观测性（日志、追踪）
- `upload_source_maps`: 上传Source Maps用于调试

## 完整部署流程

### 方式一：本地手动部署

```bash
# 1. 安装依赖
npm install

# 2. 构建并部署到Cloudflare
npm run deploy
```

**执行流程**：
1. `astro build` - 使用Cloudflare适配器构建项目
2. 构建产物输出到 `./dist/` 目录
3. `wrangler deploy` - 读取 `wrangler.json` 配置并部署到Cloudflare

### 方式二：通过Cloudflare Dashboard自动部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create Application** → **Pages** → **Connect to Git**
4. 授权并选择GitHub仓库
5. 配置构建设置：
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**

**后续更新**：每次推送到GitHub，Cloudflare会自动触发构建和部署

### 方式三：一键部署按钮

使用项目README中的部署按钮：

```markdown
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/astro-template)
```

点击按钮后会自动：
1. Fork模板仓库
2. 连接到Cloudflare
3. 配置自动部署

## 本地开发命令

```bash
# 本地开发服务器（http://localhost:4321）
npm run dev

# 本地预览构建产物（使用Wrangler模拟Cloudflare环境）
npm run preview

# 检查构建和类型（但不实际部署）
npm run check
```

## 核心集成组件说明

| 组件 | 作用 | 配置位置 |
|------|------|----------|
| `@astrojs/cloudflare` | 将Astro构建产物转换为Cloudflare Workers兼容格式 | `astro.config.mjs` |
| `wrangler` | Cloudflare官方CLI工具，管理部署流程 | `package.json` devDependencies |
| `wrangler.json` | 定义Worker名称、兼容性、资源路径等配置 | 项目根目录 |
| `astro.config.mjs` adapter | 指定使用Cloudflare适配器 | `astro.config.mjs` |
| npm scripts | 封装构建和部署命令 | `package.json` scripts |

## 项目结构

```
astro-project/
├── astro.config.mjs      # Astro配置（含Cloudflare适配器）
├── wrangler.json         # Wrangler部署配置
├── package.json          # 依赖和脚本
├── src/
│   ├── pages/            # 页面路由
│   ├── content/          # 内容集合（博客文章等）
│   └── components/       # 组件
├── public/               # 静态资源
└── dist/                 # 构建输出（自动生成）
    ├── _worker.js/       # Worker入口
    └── [其他静态资源]
```

## 环境变量配置

如需使用环境变量，可通过以下方式配置：

### 本地开发
创建 `.dev.vars` 文件（不要提交到Git）：
```env
API_KEY=your-api-key
DATABASE_URL=your-database-url
```

### 生产环境
通过Cloudflare Dashboard配置：
1. Workers & Pages → 选择项目 → Settings → Variables
2. 添加环境变量（可选择加密）

或使用 `wrangler` CLI：
```bash
wrangler secret put API_KEY
```

## 常见问题

### 1. 构建失败
检查 `@astrojs/cloudflare` 版本是否与 `astro` 版本兼容

### 2. 部署后404
确认 `wrangler.json` 中的 `assets.directory` 路径正确（默认 `./dist`）

### 3. 本地预览与生产环境不一致
使用 `npm run preview` 而非 `npm run dev` 进行本地测试，前者更接近生产环境

## 参考资源

- [Astro Cloudflare Adapter文档](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)
- [示例项目](https://astro-template.templates.workers.dev)

## 总结

Astro与Cloudflare的集成通过三个关键配置实现：
1. **`@astrojs/cloudflare` 适配器** - 将Astro转换为Workers格式
2. **`wrangler.json` 配置** - 定义Worker运行参数
3. **`npm run deploy` 脚本** - 一键构建+部署

这种设计实现了开发和部署的无缝衔接，本地开发使用 `npm run dev`，生产部署使用 `npm run deploy` 即可。
