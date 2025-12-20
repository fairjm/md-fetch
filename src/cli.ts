import { Command } from 'commander';
import { ContentProcessor } from './core/processor.js';
import type { CLIOptions, ProcessOptions } from './types/index.js';
import { DEFAULT_TIMEOUT, DEFAULT_USER_AGENT } from './constants.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

export class CLI {
  private program: Command;
  private processor: ContentProcessor;

  constructor() {
    this.program = new Command();
    this.processor = new ContentProcessor();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('md-fetch')
      .description('Convert web pages to clean Markdown using fetch, readability, and turndown')
      .version('1.0.0')
      .argument('<urls...>', 'URLs to convert to Markdown')
      .option('-o, --output <file>', 'Output to file instead of stdout')
      .option('-b, --browser', 'Use headless browser mode (for SPA pages)')
      .option('--browser-path <path>', 'Custom Chrome/Chromium executable path')
      .option('-R, --no-readability', 'Disable readability, keep full HTML content')
      .option('-s, --selector <selector>', 'Custom CSS selector to extract content')
      .option('-f, --file <path>', 'Read URLs from file (one per line) - not yet implemented')
      .option('-H, --header <header>', 'Custom HTTP header (can be repeated)', this.collectHeaders, [])
      .option('--proxy <url>', 'Proxy server URL (also reads HTTP_PROXY/HTTPS_PROXY env vars)')
      .option('-t, --timeout <ms>', 'Request timeout in milliseconds', parseInt, DEFAULT_TIMEOUT)
      .option('--config <path>', 'Custom config file path - not yet implemented')
      .option('--user-agent <string>', 'Custom user agent', DEFAULT_USER_AGENT)
      .option('--wait-until <event>', 'Browser wait condition (load|domcontentloaded|networkidle0|networkidle2)')
      .option('--concurrent <num>', 'Concurrent requests for batch mode', parseInt, 3)
      .option('--verbose', 'Enable verbose logging', false)
      .action(async (urls: string[], options: CLIOptions) => {
        await this.handleFetch(urls, options);
      });
  }

  /**
   * Collect multiple header options
   */
  private collectHeaders(value: string, previous: string[]): string[] {
    return previous.concat([value]);
  }

  /**
   * Parse headers from array of strings like "Key: Value"
   */
  private parseHeaders(headerStrings: string[]): Record<string, string> {
    const headers: Record<string, string> = {};

    for (const header of headerStrings) {
      const colonIndex = header.indexOf(':');
      if (colonIndex === -1) {
        console.warn(`Warning: Invalid header format "${header}", expected "Key: Value"`);
        continue;
      }

      const key = header.slice(0, colonIndex).trim();
      const value = header.slice(colonIndex + 1).trim();
      headers[key] = value;
    }

    return headers;
  }

  /**
   * Main handler for the fetch command
   */
  private async handleFetch(urls: string[], options: CLIOptions): Promise<void> {
    try {
      // Build process options
      const processOptions: ProcessOptions = {
        useBrowser: options.browser || false,
        useReadability: options.readability !== false, // default true
        selector: options.selector,
        fetchOptions: {
          timeout: options.timeout || DEFAULT_TIMEOUT,
          userAgent: options.userAgent || DEFAULT_USER_AGENT,
          headers: this.parseHeaders(options.header || []),
          proxy: options.proxy
        },
        browserOptions: options.browser ? {
          executablePath: options.browserPath,
          waitUntil: options.waitUntil as any,
          timeout: options.timeout || DEFAULT_TIMEOUT,
          userAgent: options.userAgent || DEFAULT_USER_AGENT,
          proxy: options.proxy
        } : undefined,
        verbose: options.verbose || false
      };

      // Process URLs
      let markdown: string;

      if (urls.length === 1) {
        // Single URL
        markdown = await this.processor.process(urls[0], processOptions);
      } else {
        // Multiple URLs (batch mode)
        const results = await this.processor.processBatch(urls, processOptions);

        // Combine results
        markdown = results
          .map((result, index) => {
            if (result.success) {
              const separator = index === 0 ? '' : '\n\n---\n\n';
              return `${separator}<!-- Source: ${result.url} -->\n\n${result.markdown}`;
            } else {
              return `<!-- Error processing ${result.url}: ${result.error?.message} -->`;
            }
          })
          .join('\n');

        // Report errors
        const errors = results.filter(r => !r.success);
        if (errors.length > 0) {
          console.error(`\nWarning: ${errors.length} of ${results.length} URLs failed to process:`);
          errors.forEach(e => {
            console.error(`  - ${e.url}: ${e.error?.message}`);
          });
        }
      }

      // Output
      if (options.output) {
        await this.writeToFile(options.output, markdown);
        if (options.verbose) {
          console.log(`\nOutput written to: ${options.output}`);
        }
      } else {
        console.log(markdown);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    } finally {
      // Cleanup resources (close browser if opened)
      await this.processor.cleanup();
    }
  }

  /**
   * Write content to file
   */
  private async writeToFile(filepath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(filepath);
      await mkdir(dir, { recursive: true });

      // Write file
      await writeFile(filepath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write to file ${filepath}: ${(error as Error).message}`);
    }
  }

  /**
   * Run the CLI
   */
  async run(argv: string[]): Promise<void> {
    await this.program.parseAsync(argv);
  }
}
