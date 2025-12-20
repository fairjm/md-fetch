import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import type { ExtractOptions, ExtractedContent, PageMetadata } from '../types/index.js';
import { ExtractionError } from '../types/index.js';

export class ContentExtractor {
  /**
   * Extract content from HTML
   */
  extract(html: string, url: string, options: ExtractOptions): ExtractedContent {
    const { useReadability, selector } = options;

    try {
      const dom = new JSDOM(html, { url });
      const document = dom.window.document;

      // 提取元数据
      const metadata = this.extractMetadata(html, url);

      let content: string;

      // 如果指定了选择器，使用选择器提取
      if (selector) {
        content = this.extractBySelector(document, selector);
      }
      // 如果禁用了 readability，返回整个 body
      else if (!useReadability) {
        content = document.body.innerHTML || '';
      }
      // 使用 readability 提取主要内容
      else {
        content = this.extractWithReadability(document, url);
      }

      return {
        content,
        metadata
      };
    } catch (error) {
      throw new ExtractionError(
        url,
        `Failed to extract content: ${(error as Error).message}`
      );
    }
  }

  /**
   * Extract content using CSS selector
   */
  private extractBySelector(document: Document, selector: string): string {
    const element = document.querySelector(selector);

    if (!element) {
      throw new Error(`Selector "${selector}" not found in the document`);
    }

    return element.innerHTML;
  }

  /**
   * Extract content using Mozilla Readability
   */
  private extractWithReadability(document: Document, url: string): string {
    // Clone document for readability (它会修改 DOM)
    const documentClone = document.cloneNode(true) as Document;

    const reader = new Readability(documentClone, {
      debug: false,
      maxElemsToParse: 0, // 无限制
      nbTopCandidates: 5,
      charThreshold: 500
    });

    const article = reader.parse();

    if (!article || !article.content) {
      // 如果 readability 失败，回退到原始 body
      console.warn(`Readability failed for ${url}, falling back to full body content`);
      return document.body.innerHTML || '';
    }

    return article.content;
  }

  /**
   * Extract metadata from the page
   */
  extractMetadata(html: string, url: string): PageMetadata {
    try {
      const dom = new JSDOM(html, { url });
      const document = dom.window.document;

      // 使用 readability 获取元数据
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone);
      const article = reader.parse();

      // Helper function to get meta content
      const getMeta = (selectors: string[]): string | undefined => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          const content = element?.getAttribute('content') || element?.getAttribute('value');
          if (content) return content;
        }
        return undefined;
      };

      // Extract comprehensive metadata
      const metadata: PageMetadata = {
        url,
        title: article?.title ||
               getMeta(['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
               document.querySelector('title')?.textContent ||
               undefined,
        description: article?.excerpt ||
                    getMeta(['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) ||
                    undefined,
        author: article?.byline ||
               getMeta(['meta[name="author"]', 'meta[property="article:author"]']) ||
               undefined,
        publishedTime: getMeta(['meta[property="article:published_time"]', 'meta[name="publish_date"]', 'meta[property="og:published_time"]']) ||
                      undefined,
        modifiedTime: getMeta(['meta[property="article:modified_time"]', 'meta[property="og:updated_time"]']) ||
                     undefined,
        siteName: article?.siteName ||
                 getMeta(['meta[property="og:site_name"]']) ||
                 undefined,
        keywords: this.extractKeywords(document),
        image: getMeta(['meta[property="og:image"]', 'meta[name="twitter:image"]']) ||
              undefined,
        lang: document.documentElement.lang ||
             getMeta(['meta[property="og:locale"]']) ||
             undefined
      };

      return metadata;
    } catch (error) {
      return { url };
    }
  }

  /**
   * Extract keywords from meta tags
   */
  private extractKeywords(document: Document): string[] | undefined {
    const keywordsContent = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    if (!keywordsContent) return undefined;

    return keywordsContent
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
  }
}
