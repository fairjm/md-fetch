# CLI Reference

Complete command-line options for md-fetch and md-fetch-screen.

## md-fetch

Convert web pages to Markdown format.

### Syntax

```
md-fetch <urls...> [options]
```

### Options

#### Output
- `-o, --output <file>` - Output to file instead of stdout
- Default: stdout

#### Fetch Mode
- `-b, --browser` - Use headless browser mode (for SPA pages)
- `--browser-path <path>` - Custom Chrome/Chromium executable path
- Default: Native fetch API

#### Content Processing
- `-R, --no-readability` - Disable readability, keep full HTML content
- `-s, --selector <selector>` - Custom CSS selector to extract content
- Default: Use Mozilla Readability for content extraction

#### HTTP Configuration
- `-H, --header <header>` - Custom HTTP header (can be repeated)
- `--user-agent <string>` - Custom user agent (default: "md-fetch/1.0.0")
- `-t, --timeout <ms>` - Request timeout in milliseconds (default: 30000)

#### Network
- `--proxy <url>` - Proxy server URL (also reads HTTP_PROXY/HTTPS_PROXY env vars)
- Format: `http://[user:pass@]host:port`

#### Browser Options
- `--wait-until <event>` - Browser wait condition
  - `load` - Wait for load event
  - `domcontentloaded` - Wait for DOMContentLoaded
  - `networkidle0` - Wait until no network connections for 500ms
  - `networkidle2` - Wait until ≤2 network connections for 500ms
  - Default: `load`

#### Other
- `--verbose` - Enable verbose logging
- `-V, --version` - Output version number
- `-h, --help` - Display help

### Examples

```bash
# Basic usage with output file
md-fetch https://example.com -o article.md

# Browser mode with wait condition
md-fetch -b https://react-app.com --wait-until networkidle0 -o app.md

# Custom selector and disable readability
md-fetch https://blog.com -s ".post-content" -R -o post.md

# Multiple custom headers
md-fetch https://api.example.com \
  -H "Authorization: Bearer token123" \
  -H "Accept: text/html" \
  -o response.md

# Using proxy with auth
md-fetch https://example.com \
  --proxy http://user:pass@proxy.example.com:8080 \
  -o output.md

# Extended timeout for slow sites
md-fetch https://slow-site.com -t 60000 -o slow.md
```

### Environment Variables

- `HTTP_PROXY` - HTTP proxy URL
- `HTTPS_PROXY` - HTTPS proxy URL
- `NO_PROXY` - Comma-separated list of hosts to exclude from proxy

```bash
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1,.internal.com
md-fetch https://example.com
```

## md-fetch-screen

Take high-quality screenshots of web pages.

### Syntax

```
md-fetch-screen <urls...> [options]
```

### Options

#### Viewport & Size
- `-f, --full-page` - Full page screenshot (default)
- `--viewport` - Viewport-only screenshot
- `-W, --width <pixels>` - Viewport width in pixels (default: 1920)
- `-H, --height <pixels>` - Viewport height in pixels (default: 1080)
- `--scale <number>` - Device scale factor (1, 2, or 3, default: 1)
  - 1 = Standard resolution
  - 2 = High-DPI (Retina)
  - 3 = Ultra high-DPI

#### Output
- `--output <dir>` - Output directory (default: current directory)
- `--format <type>` - Image format: `png`, `jpeg`, or `webp` (default: png)
- `--quality <number>` - JPEG/WebP quality 0-100 (default: 90)

#### Browser
- `--browser-path <path>` - Custom Chrome/Chromium executable path
- `--wait-until <event>` - Wait condition (same as md-fetch)
- `--timeout <ms>` - Timeout in milliseconds (default: 30000)
- `--user-agent <string>` - Custom user agent
- `--proxy <url>` - Proxy server URL

#### Content
- `--delay <ms>` - Delay before screenshot in ms (default: 0)
- `--selector <css>` - CSS selector to screenshot specific element
- `--hide <selectors>` - CSS selectors to hide (comma-separated)

#### Other
- `--verbose` - Enable verbose logging
- `-V, --version` - Output version number
- `-h, --help` - Display help

### Examples

```bash
# Full page screenshot (default)
md-fetch-screen https://example.com

# Viewport-only with custom dimensions
md-fetch-screen https://example.com --viewport -W 1440 -H 900

# High-DPI screenshot (2x)
md-fetch-screen https://example.com --scale 2

# Screenshot specific element only
md-fetch-screen https://example.com --selector "#main-content"

# Hide ads and popups
md-fetch-screen https://example.com --hide ".ad,.popup,.modal"

# JPEG format with quality
md-fetch-screen https://example.com --format jpeg --quality 85

# Save to specific directory
md-fetch-screen https://example.com --output ./screenshots

# Wait for content, then delay
md-fetch-screen https://dynamic-site.com \
  --wait-until networkidle0 \
  --delay 2000

# Screenshot element without ads (high-DPI)
md-fetch-screen https://example.com \
  --selector "article" \
  --hide ".ad,.banner" \
  --scale 2 \
  --format png

# Batch screenshots with custom settings
md-fetch-screen \
  https://site1.com \
  https://site2.com \
  https://site3.com \
  --viewport -W 1920 -H 1080 \
  --scale 2 \
  --output ./batch-screenshots
```

### Filename Format

Screenshots are automatically named:
```
<domain_path_50chars>_<YYYYMMDDHHmmss>.<ext>
```

Examples:
- `example.com_20251229153045.png`
- `github.com_anthropics_claude_20251229153045.png`

### Understanding Width, Height, and Scale

**Full-Page Mode (default):**
- Width/Height set browser viewport size
- Screenshot captures entire page content
- Final image height depends on actual page content

**Viewport Mode:**
- Width/Height directly control screenshot size
- Only captures visible viewport area

**Scale Factor:**
- `--scale 1`: Viewport 1920x1080 → Image 1920x1080 pixels
- `--scale 2`: Viewport 1920x1080 → Image 3840x2160 pixels (Retina)
- `--scale 3`: Viewport 1920x1080 → Image 5760x3240 pixels

```bash
# Standard 1920x1080 screenshot
md-fetch-screen https://example.com -W 1920 -H 1080

# High-DPI viewport screenshot (final: 2880x1800)
md-fetch-screen https://example.com --viewport -W 1440 -H 900 --scale 2
```

## Troubleshooting

### Common Issues

**Empty or minimal content for SPA:**
```bash
# Use browser mode
md-fetch -b https://react-app.com --wait-until networkidle0
```

**Readability removes needed content:**
```bash
# Disable readability or use selector
md-fetch https://example.com -R
md-fetch https://example.com -s ".content"
```

**Screenshot missing dynamic content:**
```bash
# Add wait and delay
md-fetch-screen https://example.com --wait-until networkidle0 --delay 2000
```

**Proxy connection fails:**
```bash
# Verify proxy format and test
md-fetch https://example.com --proxy http://proxy:8080 --verbose
```

**Browser not found:**
```bash
# Specify browser path
md-fetch -b https://example.com --browser-path /usr/bin/chromium
```

### Retry Behavior

Both tools automatically retry failed requests:
- 3 attempts total
- Exponential backoff between retries
- Retries on network errors only (not 404, etc.)
