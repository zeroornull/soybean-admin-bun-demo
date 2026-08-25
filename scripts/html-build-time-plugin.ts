import type { Plugin } from 'vite';

export function htmlBuildTimePlugin(buildTime: string): Plugin {
  return {
    name: 'html-build-time',
    transformIndexHtml(html) {
      if (html.includes('name="buildTime"')) return html;
      return html.replace('<head>', `<head>\n    <meta name="buildTime" content="${buildTime}">`);
    }
  };
}
