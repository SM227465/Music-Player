// utils/htmlDecode.ts

/**
 * Decodes HTML entities in a string
 * Handles common entities like &quot;, &amp;, &apos;, &lt;, &gt;, etc.
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;

  const entities: Record<string, string> = {
    '&quot;': '"',
    '&amp;': '&',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
  };

  return text.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
};
