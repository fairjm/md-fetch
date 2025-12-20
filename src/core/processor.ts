import { Fetcher } from './fetcher.js';
import { BrowserFetcher } from './browser.js';
import { ContentExtractor } from './extractor.js';
import { MarkdownConverter } from './converter.js';
import { generateFrontmatter } from '../utils/frontmatter.js';
import type { ProcessOptions, FetchResult } from '../types/index.js';

export class ContentProcessor {
  private fetcher: Fetcher;
  private browserFetcher: BrowserFetcher | null = null;
  private extractor: ContentExtractor;
  private converter: MarkdownConverter;

  constructor() {
    this.fetcher = new Fetcher();
    this.extractor = new ContentExtractor();
    this.converter = new MarkdownConverter();
  }

  /**
   * Process a single URL: fetch → extract → convert
   */
  async process(url: string, options: ProcessOptions): Promise<string> {
    const { useBrowser, useReadability, selector, fetchOptions, conversionOptions, verbose } = options;

    if (verbose) {
      console.log(`Processing: ${url}`);
    }

    // Step 1: Fetch HTML
    let html: string;

    if (useBrowser) {
      if (verbose) {
        console.log('  Fetching HTML with browser...');
      }

      // 初始化浏览器（如果还没有）
      if (!this.browserFetcher) {
        this.browserFetcher = new BrowserFetcher(options.browserOptions);
      }

      html = await this.browserFetcher.fetchPage(url);
    } else {
      if (verbose) {
        console.log('  Fetching HTML...');
      }
      html = await this.fetcher.fetch(url, fetchOptions);
    }

    // Step 2: Extract content and metadata
    if (verbose) {
      console.log('  Extracting content...');
    }

    const extracted = this.extractor.extract(html, url, {
      useReadability,
      selector
    });

    // Step 3: Convert to Markdown
    if (verbose) {
      console.log('  Converting to Markdown...');
    }

    // Update converter if custom options provided
    if (conversionOptions) {
      this.converter = new MarkdownConverter(conversionOptions);
    }

    const markdownContent = this.converter.convert(extracted.content);

    // Step 4: Generate frontmatter
    if (verbose) {
      console.log('  Generating frontmatter...');
    }

    const frontmatter = generateFrontmatter(extracted.metadata);
    const markdown = frontmatter + markdownContent;

    if (verbose) {
      console.log('  ✓ Done');
    }

    return markdown;
  }

  /**
   * Process multiple URLs (batch mode)
   * Will be enhanced in Phase 3 with concurrency control
   */
  async processBatch(urls: string[], options: ProcessOptions): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    for (const url of urls) {
      try {
        const markdown = await this.process(url, options);
        results.push({ url, markdown, success: true });
      } catch (error) {
        results.push({
          url,
          error: error as Error,
          success: false
        });

        if (options.verbose) {
          console.error(`  ✗ Error processing ${url}: ${(error as Error).message}`);
        }
      }
    }

    return results;
  }

  /**
   * Cleanup resources (close browser if opened)
   */
  async cleanup(): Promise<void> {
    if (this.browserFetcher) {
      await this.browserFetcher.close();
      this.browserFetcher = null;
    }
  }
}
