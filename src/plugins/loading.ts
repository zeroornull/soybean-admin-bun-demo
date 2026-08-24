const loadingMarkup = `
  <div
    data-app-loading
    role="status"
    aria-live="polite"
    style="display:grid;min-height:100vh;place-items:center;font-family:system-ui,sans-serif"
  >
    <span>Loading Soybean Admin…</span>
  </div>
`;

export function setupLoading() {
  const appElement = document.getElementById('app');

  if (!appElement) return;

  appElement.innerHTML = loadingMarkup;
}
