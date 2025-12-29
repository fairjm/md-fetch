# md-fetch

[中文文档](./README.zh-CN.md)

A suite of CLI tools for web content processing:
- **md-fetch** - Convert web pages to clean Markdown format
- **md-fetch-screen** - Take high-quality screenshots of web pages

## Authors

Built by **Claude Code** & **Claude Sonnet**

## Table of Contents

- [md-fetch - Markdown Converter](#md-fetch---markdown-converter)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [CLI Options](#cli-options)
- [md-fetch-screen - Screenshot Tool](#md-fetch-screen---screenshot-tool)
  - [Features](#screenshot-features)
  - [Usage](#screenshot-usage)
  - [CLI Options](#screenshot-cli-options)
- [Tech Stack](#tech-stack)
- [Development](#development)

---

# md-fetch - Markdown Converter

## Features

- 🚀 Fetch web content using native fetch API
- 🌐 Headless browser mode (Puppeteer) for SPA pages
- 📄 Extract main content using Mozilla Readability
- ✨ Convert HTML to Markdown using Turndown
- 📋 **Auto-generate YAML frontmatter** (includes title, URL, author, publish date, and more metadata)
- 🎯 Custom CSS selector support for content extraction
- 🔒 Proxy support (HTTP_PROXY/HTTPS_PROXY environment variables)
- ⚙️ Configurable timeout, headers, and other options
- 🔄 Auto-retry (3 times with exponential backoff)
- 📦 Minimal dependencies

## Installation

### Development Setup

```bash
# Clone the repository (if you haven't already)
git clone <repo-url>
cd md-fetch

# Install dependencies
pnpm install
```

### Global Installation

**Using pnpm:**

```bash
# 1. Build the project
pnpm build

# 2. Setup pnpm (first time only)
pnpm setup

# 3. Link globally (recommended for development)
pnpm link --global

# 4. Now you can use md-fetch anywhere
md-fetch https://example.com
```

**Using npm:**

```bash
# 1. Build the project
pnpm build

# 2. Link globally
npm link

# 3. Now you can use md-fetch anywhere
md-fetch https://example.com
```

### Rebuild After Code Changes

```bash
# 1. Rebuild
pnpm build

# 2. No need to re-link, changes take effect automatically
md-fetch https://example.com
```

### Uninstall

**Using pnpm:**

```bash
# Unlink globally
pnpm unlink --global

# Optional: Clean up unused packages in pnpm global store
pnpm store prune
```

**Using npm:**

```bash
# Unlink globally
npm unlink -g md-fetch
```

**Remove project:**

```bash
# Simply delete the project directory
cd ..
rm -rf md-fetch  # Or use rmdir /s md-fetch on Windows
```

## Usage

### Development Mode

```bash
# Basic usage - output to stdout
pnpm dev -- https://example.com

# Save to file
pnpm dev -- https://example.com -o output.md

# Browser mode (for SPA pages)
pnpm dev -- -b https://react-app.example.com

# Disable readability, keep full HTML content
pnpm dev -- https://example.com -R
# Or use the full option name
pnpm dev -- https://example.com --no-readability

# Use custom CSS selector
pnpm dev -- https://example.com -s "article.main-content"

# Process multiple URLs
pnpm dev -- https://example.com https://httpbin.org/html

# Custom HTTP headers
pnpm dev -- https://example.com -H "Authorization: Bearer token"

# Use proxy
pnpm dev -- https://example.com --proxy http://proxy.example.com:8080

# Verbose logging
pnpm dev -- https://example.com --verbose

# View all options
pnpm dev -- --help
```

### Production Usage (After Global Installation)

```bash
# Basic usage
md-fetch https://example.com

# Save to file
md-fetch https://example.com -o article.md

# Browser mode
md-fetch -b https://react-app.example.com

# Use proxy (from environment variable)
export HTTPS_PROXY=http://proxy.example.com:8080
md-fetch https://example.com
```

## Output Example

md-fetch automatically adds YAML frontmatter at the beginning of the Markdown file with page metadata:

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

### Frontmatter Fields

- `title` - Page title (extracted from Readability, Open Graph, Twitter Cards, or `<title>` tag)
- `url` - Original URL
- `description` - Page description or excerpt
- `author` - Author information
- `siteName` - Site name
- `publishedTime` - Published date (ISO 8601 format)
- `modifiedTime` - Last modified date (ISO 8601 format)
- `keywords` - Keywords array
- `image` - Main page image (Open Graph or Twitter Cards)
- `lang` - Page language code

## CLI Options

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

## Tech Stack

- **TypeScript** - Type safety
- **Node.js ≥18** - Native fetch API
- **ES Modules** - Modern JavaScript
- **Commander** - CLI argument parsing
- **Mozilla Readability** - Smart content extraction
- **Turndown** - HTML to Markdown conversion
- **JSDOM** - DOM parsing
- **Puppeteer-core** - Headless browser support
- **Undici** - Proxy support

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev -- <url>

# Build
pnpm build

# Run tests
pnpm test
```

## How It Works

1. **Fetch** - Fetch HTML content using native fetch or Puppeteer headless browser
2. **Extract** - Extract main content using Readability or custom selector, also extract page metadata
3. **Convert** - Convert to Markdown using Turndown
4. **Generate Frontmatter** - Generate YAML frontmatter from extracted metadata
5. **Output** - Output frontmatter and Markdown content to stdout or save to file

## Proxy Support

md-fetch automatically reads proxy configuration from environment variables:

```bash
# Set proxy
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080

# Exclude certain domains
export NO_PROXY=localhost,127.0.0.1,.example.com

# Or via command line argument
md-fetch https://example.com --proxy http://proxy.example.com:8080
```

---

# md-fetch-screen - Screenshot Tool

## Screenshot Features

- 📸 Take high-quality screenshots of web pages
- 🖥️ Full-page or viewport-only screenshot modes
- 📐 Customizable viewport size (width/height)
- ✨ Device scale factor support for high-DPI screenshots (Retina displays)
- 🎨 Multiple image formats (PNG, JPEG, WebP)
- 🎯 Screenshot specific elements using CSS selectors
- 🙈 Hide unwanted elements (ads, popups, etc.)
- ⏱️ Configurable delay before screenshot
- 🔒 Proxy support
- 🌐 Headless browser mode using Puppeteer
- 📁 Automatic filename generation from URL and timestamp
- 🔄 Batch screenshot multiple URLs

## Screenshot Usage

### Basic Usage

```bash
# Basic screenshot (full page, standard resolution)
md-fetch-screen https://example.com

# Viewport-only screenshot with custom size
md-fetch-screen https://example.com --viewport -W 1440 -H 900

# High-DPI screenshot (2x scale for Retina displays)
md-fetch-screen https://example.com --scale 2

# Screenshot with verbose logging
md-fetch-screen https://example.com --verbose
```

### Advanced Usage

```bash
# Screenshot specific element
md-fetch-screen https://example.com --selector "#main-content"

# Hide ads and popups
md-fetch-screen https://example.com --hide ".ad,.popup,.cookie-banner"

# JPEG format with custom quality
md-fetch-screen https://example.com --format jpeg --quality 85

# Save to specific directory
md-fetch-screen https://example.com --output ./screenshots

# Wait for page to load, then delay 2 seconds
md-fetch-screen https://example.com --wait-until networkidle0 --delay 2000

# Batch screenshot multiple URLs
md-fetch-screen https://site1.com https://site2.com https://site3.com
```

### Understanding Width, Height, and Scale

**Full-Page Mode (default):**
- Width/Height control the browser viewport size
- The screenshot captures the entire page content
- Final image dimensions depend on actual page height

```bash
# Full page with 1920px viewport width
md-fetch-screen https://example.com -W 1920 -H 1080
```

**Viewport Mode:**
- Width/Height directly control the screenshot size
- Only captures what's visible in the viewport

```bash
# Exactly 1440x900 screenshot
md-fetch-screen https://example.com --viewport -W 1440 -H 900
```

**Scale Factor (Device Pixel Ratio):**
- `--scale 1` (default): Standard resolution
  - Viewport 1920x1080 → Image 1920x1080 pixels
- `--scale 2`: High-DPI (Retina)
  - Viewport 1920x1080 → Image 3840x2160 pixels
- `--scale 3`: Ultra high-DPI
  - Viewport 1920x1080 → Image 5760x3240 pixels

```bash
# High-quality Retina screenshot
md-fetch-screen https://example.com --scale 2

# Viewport mode with 2x scale = 2880x1800 final image
md-fetch-screen https://example.com --viewport -W 1440 -H 900 --scale 2
```

## Screenshot CLI Options

```
Usage: md-fetch-screen [options] <urls...>

Arguments:
  urls                   URLs to screenshot

Options:
  -V, --version          output the version number

  Viewport & Size:
  -f, --full-page        Full page screenshot (default)
  --viewport             Viewport-only screenshot
  -W, --width <pixels>   Viewport width in pixels (default: 1920)
  -H, --height <pixels>  Viewport height in pixels (default: 1080)
  --scale <number>       Device scale factor for high-DPI (1/2/3, default: 1)

  Output:
  --output <dir>         Output directory (default: ".")
  --format <type>        Image format: png|jpeg|webp (default: "png")
  --quality <number>     JPEG/WebP quality 0-100 (default: 90)

  Browser:
  --browser-path <path>  Custom Chrome/Chromium executable path
  --wait-until <event>   Wait condition: load|domcontentloaded|networkidle0|networkidle2
  --timeout <ms>         Timeout in milliseconds (default: 30000)
  --user-agent <string>  Custom user agent
  --proxy <url>          Proxy server URL

  Content:
  --delay <ms>           Delay before screenshot in ms (default: 0)
  --selector <css>       CSS selector to screenshot specific element
  --hide <selectors>     CSS selectors to hide (comma-separated)

  Other:
  --verbose              Enable verbose logging
  -h, --help             display help for command
```

### Filename Format

Screenshots are automatically named using the following format:
```
<domain_path_50chars>_<timestamp>.png
```

Examples:
- `example.com_20251229153045.png`
- `github.com_user_repo_issues_123_20251229153045.png`

The filename includes:
- Domain and path (up to 50 characters, sanitized for filesystem safety)
- Timestamp in format: `YYYYMMDDHHmmss`
- File extension based on format

## License

MIT
