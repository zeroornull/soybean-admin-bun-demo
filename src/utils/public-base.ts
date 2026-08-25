export function normalizePublicBase(value: string | undefined) {
  if (!value || value === '/') return '/';

  const withLead = value.startsWith('/') ? value : `/${value}`;

  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}
