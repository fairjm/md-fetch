# md-fetch

[中文文档](./README.zh-CN.md)

Convert web pages to clean Markdown format using fetch, readability, and turndown.

## Authors

Built by **Claude Code** & **Claude Sonnet**

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

## License

MIT
