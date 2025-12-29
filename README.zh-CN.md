# md-fetch

[English](./README.md)

一套网页内容处理的命令行工具：
- **md-fetch** - 将网页转换为干净的 Markdown 格式
- **md-fetch-screen** - 对网页进行高质量截图

## 作者

由 **Claude Code** 和 **Claude Sonnet** 开发

## 目录

- [md-fetch - Markdown 转换器](#md-fetch---markdown-转换器)
  - [特性](#特性)
  - [安装](#安装)
  - [使用](#使用)
  - [CLI 选项](#cli-选项)
- [md-fetch-screen - 截图工具](#md-fetch-screen---截图工具)
  - [截图功能](#截图功能)
  - [截图使用方法](#截图使用方法)
  - [截图 CLI 选项](#截图-cli-选项)
- [技术栈](#技术栈)
- [开发](#开发)

---

# md-fetch - Markdown 转换器

## 特性

- 🚀 使用原生 fetch API 获取网页内容
- 🌐 支持无头浏览器模式（Puppeteer）处理 SPA 页面
- 📄 使用 Mozilla Readability 提取主要内容
- ✨ 使用 Turndown 将 HTML 转换为 Markdown
- 📋 **自动生成 YAML frontmatter**（包含标题、URL、作者、发布时间等元数据）
- 🎯 支持自定义 CSS 选择器提取内容
- 🔒 代理支持（HTTP_PROXY/HTTPS_PROXY 环境变量）
- ⚙️ 可配置的超时、headers 等选项
- 🔄 自动重试（3 次，指数退避）
- 📦 最小化依赖

## 安装

### 开发环境安装

```bash
# 克隆项目（如果还没有）
git clone <repo-url>
cd md-fetch

# 安装依赖
pnpm install
```

### 全局安装

**使用 pnpm:**

```bash
# 1. 构建项目
pnpm build

# 2. 配置 pnpm（首次使用需要）
pnpm setup

# 3. 全局链接（开发时推荐）
pnpm link --global

# 4. 现在可以在任何位置使用 md-fetch 命令
md-fetch https://example.com
```

**使用 npm:**

```bash
# 1. 构建项目
pnpm build

# 2. 全局链接
npm link

# 3. 现在可以在任何位置使用 md-fetch 命令
md-fetch https://example.com
```

### 修改代码后重新安装

```bash
# 1. 重新构建
pnpm build

# 2. 无需重新 link，构建后会自动生效
md-fetch https://example.com
```

### 卸载

**使用 pnpm:**

```bash
# 取消全局链接
pnpm unlink --global

# 可选：清理 pnpm 全局 store 中未被引用的包（释放磁盘空间）
pnpm store prune
```

**使用 npm:**

```bash
# 取消全局链接
npm unlink -g md-fetch
```

**删除项目:**

```bash
# 如果想完全删除项目，直接删除项目目录即可
cd ..
rm -rf md-fetch  # 或在 Windows 上使用 rmdir /s md-fetch
```

## 使用

### 开发模式

```bash
# 基本使用 - 输出到 stdout
pnpm dev -- https://example.com

# 保存到文件
pnpm dev -- https://example.com -o output.md

# 浏览器模式（用于 SPA 页面）
pnpm dev -- -b https://react-app.example.com

# 禁用 readability，保留完整内容
pnpm dev -- https://example.com -R
# 或使用完整选项名
pnpm dev -- https://example.com --no-readability

# 使用自定义选择器
pnpm dev -- https://example.com -s "article.main-content"

# 处理多个 URL
pnpm dev -- https://example.com https://httpbin.org/html

# 自定义 HTTP headers
pnpm dev -- https://example.com -H "Authorization: Bearer token"

# 使用代理
pnpm dev -- https://example.com --proxy http://proxy.example.com:8080

# 详细日志
pnpm dev -- https://example.com --verbose

# 查看所有选项
pnpm dev -- --help
```

### 生产使用（全局安装后）

```bash
# 基本使用
md-fetch https://example.com

# 保存到文件
md-fetch https://example.com -o article.md

# 浏览器模式
md-fetch -b https://react-app.example.com

# 使用代理（从环境变量）
export HTTPS_PROXY=http://proxy.example.com:8080
md-fetch https://example.com
```

## 输出示例

md-fetch 会自动在 Markdown 文件开头添加 YAML frontmatter，包含页面的元数据：

```markdown
---
title: "Example Domain"
url: https://example.com
description: "Example Domain description"
author: "John Doe"
siteName: "Example"
publishedTime: 2024-01-01T00:00:00Z
modifiedTime: 2024-01-15T10:30:00Z
keywords:
  - example
  - demo
  - test
image: https://example.com/og-image.jpg
lang: en
---

# Example Domain

This domain is for use in illustrative examples...
```

### Frontmatter 字段说明

- `title` - 页面标题（优先从 Readability、Open Graph、Twitter Cards 或 `<title>` 标签提取）
- `url` - 原始 URL
- `description` - 页面描述或摘要
- `author` - 作者信息
- `siteName` - 站点名称
- `publishedTime` - 发布时间（ISO 8601 格式）
- `modifiedTime` - 最后修改时间（ISO 8601 格式）
- `keywords` - 关键词数组
- `image` - 页面主图片（Open Graph 或 Twitter Cards）
- `lang` - 页面语言代码

## CLI 选项

```
Usage: md-fetch <urls...> [options]

Arguments:
  urls                         URLs to convert to Markdown

Options:
  -V, --version                output the version number
  -o, --output <file>          Output to file instead of stdout
  -b, --browser                Use headless browser mode (for SPA pages)
  --browser-path <path>        Custom Chrome/Chromium executable path
  -R, --no-readability         Disable readability, keep full HTML content
  -s, --selector <selector>    Custom CSS selector to extract content
  -H, --header <header>        Custom HTTP header (can be repeated)
  --proxy <url>                Proxy server URL (also reads HTTP_PROXY/HTTPS_PROXY env vars)
  -t, --timeout <ms>           Request timeout in milliseconds (default: 30000)
  --user-agent <string>        Custom user agent (default: "md-fetch/1.0.0")
  --wait-until <event>         Browser wait condition (load|domcontentloaded|networkidle0|networkidle2)
  --verbose                    Enable verbose logging
  -h, --help                   display help for command
```

## 技术栈

- **TypeScript** - 类型安全
- **Node.js ≥18** - 使用原生 fetch API
- **ES 模块** - 现代 JavaScript
- **Commander** - CLI 参数解析
- **Mozilla Readability** - 智能内容提取
- **Turndown** - HTML 转 Markdown
- **JSDOM** - DOM 解析
- **Puppeteer-core** - 无头浏览器支持
- **Undici** - 代理支持

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev -- <url>

# 构建
pnpm build

# 运行测试
pnpm test
```

## 工作原理

1. **Fetch** - 使用原生 fetch 或 Puppeteer 无头浏览器获取 HTML 内容
2. **Extract** - 使用 Readability 或自定义选择器提取主要内容，同时提取页面元数据
3. **Convert** - 使用 Turndown 转换为 Markdown
4. **Generate Frontmatter** - 从提取的元数据生成 YAML frontmatter
5. **Output** - 将 frontmatter 和 Markdown 内容输出到 stdout 或保存到文件

## 代理支持

md-fetch 自动从环境变量读取代理配置：

```bash
# 设置代理
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080

# 排除某些域名
export NO_PROXY=localhost,127.0.0.1,.example.com

# 或通过命令行参数
md-fetch https://example.com --proxy http://proxy.example.com:8080
```

---

# md-fetch-screen - 截图工具

## 截图功能

- 📸 对网页进行高质量截图
- 🖥️ 全页截图或仅视口截图模式
- 📐 可自定义视口尺寸（宽度/高度）
- ✨ 支持设备像素比例，可生成高清截图（Retina 显示屏）
- 🎨 多种图片格式（PNG、JPEG、WebP）
- 🎯 使用 CSS 选择器截取特定元素
- 🙈 隐藏不需要的元素（广告、弹窗等）
- ⏱️ 可配置截图前延迟
- 🔒 代理支持
- 🌐 使用 Puppeteer 的无头浏览器模式
- 📁 从 URL 和时间戳自动生成文件名
- 🔄 批量截图多个 URL

## 截图使用方法

### 基本用法

```bash
# 基本截图（全页，标准分辨率）
md-fetch-screen https://example.com

# 仅视口截图，自定义尺寸
md-fetch-screen https://example.com --viewport -W 1440 -H 900

# 高清截图（2倍像素比例，适合 Retina 显示屏）
md-fetch-screen https://example.com --scale 2

# 带详细日志的截图
md-fetch-screen https://example.com --verbose
```

### 高级用法

```bash
# 截取特定元素
md-fetch-screen https://example.com --selector "#main-content"

# 隐藏广告和弹窗
md-fetch-screen https://example.com --hide ".ad,.popup,.cookie-banner"

# JPEG 格式，自定义质量
md-fetch-screen https://example.com --format jpeg --quality 85

# 保存到指定目录
md-fetch-screen https://example.com --output ./screenshots

# 等待页面加载完成后延迟 2 秒再截图
md-fetch-screen https://example.com --wait-until networkidle0 --delay 2000

# 批量截图多个 URL
md-fetch-screen https://site1.com https://site2.com https://site3.com
```

### 理解宽度、高度和像素比例参数

**全页模式（默认）：**
- 宽度/高度控制浏览器视口大小
- 截图会捕获整个页面内容
- 最终图片尺寸取决于页面的实际高度

```bash
# 全页截图，视口宽度 1920px
md-fetch-screen https://example.com -W 1920 -H 1080
```

**视口模式：**
- 宽度/高度直接控制截图尺寸
- 只捕获视口内可见的内容

```bash
# 精确 1440x900 的截图
md-fetch-screen https://example.com --viewport -W 1440 -H 900
```

**像素比例（设备像素比）：**
- `--scale 1`（默认）：标准分辨率
  - 视口 1920x1080 → 图片 1920x1080 像素
- `--scale 2`：高清（Retina）
  - 视口 1920x1080 → 图片 3840x2160 像素
- `--scale 3`：超高清
  - 视口 1920x1080 → 图片 5760x3240 像素

```bash
# 高质量 Retina 截图
md-fetch-screen https://example.com --scale 2

# 视口模式 + 2倍像素比例 = 2880x1800 最终图片
md-fetch-screen https://example.com --viewport -W 1440 -H 900 --scale 2
```

## 截图 CLI 选项

```
用法: md-fetch-screen [options] <urls...>

参数:
  urls                   要截图的 URL

选项:
  -V, --version          输出版本号

  视口和尺寸:
  -f, --full-page        全页截图（默认）
  --viewport             仅视口截图
  -W, --width <pixels>   视口宽度（像素）（默认：1920）
  -H, --height <pixels>  视口高度（像素）（默认：1080）
  --scale <number>       设备像素比例，用于高清截图（1/2/3，默认：1）

  输出:
  --output <dir>         输出目录（默认："."）
  --format <type>        图片格式：png|jpeg|webp（默认："png"）
  --quality <number>     JPEG/WebP 质量 0-100（默认：90）

  浏览器:
  --browser-path <path>  自定义 Chrome/Chromium 可执行文件路径
  --wait-until <event>   等待条件：load|domcontentloaded|networkidle0|networkidle2
  --timeout <ms>         超时时间（毫秒）（默认：30000）
  --user-agent <string>  自定义 user agent
  --proxy <url>          代理服务器 URL

  内容:
  --delay <ms>           截图前延迟时间（毫秒）（默认：0）
  --selector <css>       CSS 选择器，用于截取特定元素
  --hide <selectors>     要隐藏的 CSS 选择器（逗号分隔）

  其他:
  --verbose              启用详细日志
  -h, --help             显示帮助信息
```

### 文件名格式

截图会自动使用以下格式命名：
```
<域名_路径_前50字符>_<时间戳>.png
```

示例：
- `example.com_20251229153045.png`
- `github.com_user_repo_issues_123_20251229153045.png`

文件名包含：
- 域名和路径（最多 50 个字符，已进行文件系统安全化处理）
- 时间戳格式：`YYYYMMDDHHmmss`
- 基于格式的文件扩展名

## 许可

MIT
