import type { PageMetadata } from '../types/index.js';

/**
 * Generate YAML frontmatter from page metadata
 */
export function generateFrontmatter(metadata: PageMetadata): string {
  const lines: string[] = ['---'];

  // Add fields in a logical order
  if (metadata.title) {
    lines.push(`title: ${escapeYamlString(metadata.title)}`);
  }

  if (metadata.url) {
    lines.push(`url: ${metadata.url}`);
  }

  if (metadata.description) {
    lines.push(`description: ${escapeYamlString(metadata.description)}`);
  }

  if (metadata.author) {
    lines.push(`author: ${escapeYamlString(metadata.author)}`);
  }

  if (metadata.siteName) {
    lines.push(`siteName: ${escapeYamlString(metadata.siteName)}`);
  }

  if (metadata.publishedTime) {
    lines.push(`publishedTime: ${metadata.publishedTime}`);
  }

  if (metadata.modifiedTime) {
    lines.push(`modifiedTime: ${metadata.modifiedTime}`);
  }

  if (metadata.keywords && metadata.keywords.length > 0) {
    lines.push('keywords:');
    metadata.keywords.forEach(keyword => {
      lines.push(`  - ${escapeYamlString(keyword)}`);
    });
  }

  if (metadata.image) {
    lines.push(`image: ${metadata.image}`);
  }

  if (metadata.lang) {
    lines.push(`lang: ${metadata.lang}`);
  }

  lines.push('---');
  lines.push(''); // Add blank line after frontmatter

  return lines.join('\n');
}

/**
 * Escape special characters in YAML strings
 */
function escapeYamlString(str: string): string {
  // If string contains special characters, quote it
  if (
    str.includes(':') ||
    str.includes('#') ||
    str.includes('[') ||
    str.includes(']') ||
    str.includes('{') ||
    str.includes('}') ||
    str.includes('\n') ||
    str.includes('"') ||
    str.includes("'") ||
    str.startsWith(' ') ||
    str.endsWith(' ')
  ) {
    // Use double quotes and escape internal quotes
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
}
