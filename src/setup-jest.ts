// Polyfill for jsdom which lacks CSS.escape and Element.prototype.scrollIntoView.
// Guarded by typeof Element so it doesn't break non-jsdom test environments.
if (typeof Element !== 'undefined') {
  if (typeof CSS === 'undefined') {
    (globalThis as Record<string, unknown>).CSS = {};
  }
  if (typeof CSS.escape !== 'function') {
    CSS.escape = (value: string): string => {
      return value
        .replace(/([\u0000-\u001F\u007F])/g, '\\$1')
        .replace(/^(-?\d)|[^\t\n\r ]/g, (char, startDigit) => {
          if (startDigit !== undefined) return `\\${char} `;
          return `\\${char}`;
        });
    };
  }
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = (_options?: ScrollIntoViewOptions): void => {
      // no-op — tests spy on it, so no real scrolling needed
    };
  }
}
