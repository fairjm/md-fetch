---
name: md-fetch
description: Convert web pages to Markdown or take screenshots. Use when: (1) Converting web pages to Markdown with YAML frontmatter, (2) Taking screenshots of web pages, (3) Processing SPA/dynamic content, (4) Batch processing URLs. Triggers on "convert webpage", "save article", "fetch content", "take screenshot", or when mentioning md-fetch.
---

# md-fetch

Convert web pages to Markdown or take high-quality screenshots.

## Two Tools

- **md-fetch** - Convert web pages to Markdown with YAML frontmatter
- **md-fetch-screen** - Take screenshots

## Common Usage

### Convert to Markdown

```bash
# Basic usage
md-fetch https://example.com -o article.md

# Browser mode for SPA/dynamic pages
md-fetch -b https://react-app.com -o app.md

# Custom CSS selector
md-fetch https://example.com -s "article.content" -o content.md

# Disable readability (keep full content)
md-fetch https://example.com -R -o full.md

# Multiple URLs
md-fetch https://site1.com https://site2.com
```

### Take Screenshots

```bash
# Full page screenshot
md-fetch-screen https://example.com

# Viewport-only (1440x900)
md-fetch-screen https://example.com --viewport -W 1440 -H 900

# High-DPI (2x scale for Retina)
md-fetch-screen https://example.com --scale 2

# Screenshot specific element
md-fetch-screen https://example.com --selector "#main"

# Hide unwanted elements
md-fetch-screen https://example.com --hide ".ad,.popup"
```

## Key Parameters

### md-fetch
- `-o, --output <file>` - Save to file (otherwise stdout)
- `-b, --browser` - Use headless browser for SPA pages
- `-R, --no-readability` - Keep full HTML content
- `-s, --selector <css>` - Custom CSS selector
- `--wait-until <event>` - Browser wait: `load|networkidle0|networkidle2`
- `--proxy <url>` - Proxy server
- `--verbose` - Verbose logging

### md-fetch-screen
- `--viewport` - Viewport-only screenshot (vs full page)
- `-W, --width <pixels>` - Viewport width (default: 1920)
- `-H, --height <pixels>` - Viewport height (default: 1080)
- `--scale <1|2|3>` - Device scale factor for high-DPI
- `--selector <css>` - Screenshot specific element
- `--hide <selectors>` - Hide elements (comma-separated)
- `--format <png|jpeg|webp>` - Image format
- `--delay <ms>` - Delay before screenshot
- `--output <dir>` - Output directory (default: current)

## Output Format

**Markdown** includes YAML frontmatter:
```markdown
---
title: "Page Title"
url: https://example.com
author: "Author Name"
publishedTime: 2024-01-01T00:00:00Z
---

# Content here...
```

**Screenshots** named as: `domain_path_timestamp.png`

## Common Scenarios

**SPA pages (React/Vue/Angular):**
```bash
md-fetch -b https://app.com --wait-until networkidle0 -o app.md
```

**Specific content section:**
```bash
md-fetch https://blog.com/post -s "article.post-content" -o post.md
```

**High-quality screenshot without ads:**
```bash
md-fetch-screen https://site.com --scale 2 --hide ".ad,.banner"
```

**Using proxy:**
```bash
export HTTPS_PROXY=http://proxy.example.com:8080
md-fetch https://example.com -o output.md
```

**Batch processing:**
```bash
for url in url1 url2 url3; do
  md-fetch "$url" -o "${url##*/}.md"
done
```

## Reference

For complete CLI options and advanced usage, see [cli-reference.md](references/cli-reference.md).

## Tips

- Use `-b` (browser mode) only for SPA/dynamic pages
- Test CSS selectors in browser DevTools first
- `networkidle0` waits longest but is most reliable
- Add `--verbose` for debugging
- Screenshots auto-retry 3x with exponential backoff
