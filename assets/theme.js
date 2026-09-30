(() => {
  'use strict';
  const key = 'genetik-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  function readPreference() {
    try {
      const saved = localStorage.getItem(key);
      preference = saved === 'light' || saved === 'dark' ? saved : null;
    } catch { /* Preserve the in-memory choice when storage is unavailable. */ }
  }
  readPreference();

  function applyTheme() {
    const dark = preference ? preference === 'dark' : system.matches;
    root.dataset.theme = dark ? 'dark' : 'light';
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = dark ? '#121212' : '#f7f8f5';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln';
    });
  }

  // Set the theme before the stylesheet loads to avoid a light flash on navigation.
  applyTheme();
  const systemChanged = () => { if (!preference) applyTheme(); };
  if (system.addEventListener) system.addEventListener('change', systemChanged);
  else if (system.addListener) system.addListener(systemChanged);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    applyTheme();
  });
  // Back/Forward may restore a document without rerunning its scripts.
  window.addEventListener('pageshow', () => {
    readPreference();
    applyTheme();
  });
  function initializeControls() {
    applyTheme();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, preference); } catch { /* Keep the in-memory preference. */ }
        applyTheme();
      });
    });
  }
  // Production optimizers can defer execution until after DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeControls, { once: true });
  } else {
    initializeControls();
  }
})();
