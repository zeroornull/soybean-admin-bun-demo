export const svgIconVirtualId = 'virtual:svg-icons-register';
export const svgIconDomId = '__SVG_ICON_LOCAL__';
export const defaultSvgIconPrefix = 'icon-local';

export function toSvgSymbolId(fileName: string, prefix = defaultSvgIconPrefix) {
  const name = fileName.replace(/\.svg$/i, '').trim();
  return name ? `${prefix}-${name}` : `${prefix}-no-icon`;
}

export function svgToSymbol(svg: string, id: string) {
  const viewBox = svg.match(/viewBox="([^"]+)"/i)?.[1] || '0 0 24 24';
  const inner = svg
    .replace(/<\?xml[^>]*>/i, '')
    .replace(/<!DOCTYPE[^>]*>/i, '')
    .replace(/<svg\b[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim();

  return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
}

export function buildSvgSprite(
  files: Array<{ name: string; content: string }>,
  prefix = defaultSvgIconPrefix,
  domId = svgIconDomId
) {
  const symbols = files
    .slice()
    .sort((current, next) => current.name.localeCompare(next.name))
    .map(file => svgToSymbol(file.content, toSvgSymbolId(file.name, prefix)))
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" id="${domId}" aria-hidden="true">${symbols}</svg>`;
}

export function resolveLocalIconHref(localIcon: string | undefined, prefix = defaultSvgIconPrefix) {
  return `#${toSvgSymbolId(localIcon || 'no-icon', prefix)}`;
}
