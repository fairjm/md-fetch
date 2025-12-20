import TurndownService from 'turndown';
import type { ConversionOptions } from '../types/index.js';

export class MarkdownConverter {
  private turndownService: TurndownService;

  constructor(options: ConversionOptions = {}) {
    this.turndownService = new TurndownService({
      headingStyle: options.headingStyle || 'atx',
      codeBlockStyle: options.codeBlockStyle || 'fenced',
      bulletListMarker: options.bulletListMarker || '-',
      hr: '---',
      emDelimiter: '*',
      strongDelimiter: '**'
    });

    // 添加自定义规则
    this.setupCustomRules();
  }

  /**
   * Convert HTML to Markdown
   */
  convert(html: string): string {
    try {
      const markdown = this.turndownService.turndown(html);
      return this.cleanMarkdown(markdown);
    } catch (error) {
      throw new Error(`Failed to convert HTML to Markdown: ${(error as Error).message}`);
    }
  }

  /**
   * Setup custom conversion rules
   */
  private setupCustomRules(): void {
    // 保留图片的 alt 文本和链接
    this.turndownService.addRule('images', {
      filter: 'img',
      replacement: (content, node) => {
        const alt = (node as HTMLImageElement).alt || '';
        const src = (node as HTMLImageElement).src || '';
        const title = (node as HTMLImageElement).title || '';

        if (!src) return '';

        return title
          ? `![${alt}](${src} "${title}")`
          : `![${alt}](${src})`;
      }
    });

    // 处理代码块，保留语言标识
    this.turndownService.addRule('codeBlocks', {
      filter: (node) => {
        return node.nodeName === 'PRE' &&
               node.firstChild?.nodeName === 'CODE';
      },
      replacement: (content, node) => {
        const codeNode = node.firstChild as HTMLElement;
        const className = codeNode?.className || '';
        const language = className.match(/language-(\w+)/)?.[1] || '';

        const code = codeNode?.textContent || '';
        return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
      }
    });
  }

  /**
   * Clean up the generated Markdown
   */
  private cleanMarkdown(markdown: string): string {
    return markdown
      // 移除多余的空行（超过 2 个连续换行）
      .replace(/\n{3,}/g, '\n\n')
      // 移除行尾空格
      .replace(/[ \t]+$/gm, '')
      // 确保文件以换行符结尾
      .trim() + '\n';
  }
}
