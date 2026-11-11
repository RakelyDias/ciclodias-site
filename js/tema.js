// Applied before the stylesheet so saved dark mode does not flash a light page.
(() => {
  document.documentElement.classList.remove('no-js');
  const key = 'ciclodias-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let choice = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') choice = saved;
  } catch { /* The theme also works for this session without storage. */ }
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111715' : '#ffffff');
    window.dispatchEvent(new CustomEvent('ciclo-theme-change', {detail: theme}));
  }
  window.cicloTheme = {
    get: () => document.documentElement.dataset.theme,
    toggle: () => {
      choice = window.cicloTheme.get() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch { /* Keep the in-session choice. */ }
      apply(choice);
    },
  };
  media.addEventListener('change', event => { if (!choice) apply(event.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    apply(choice || (media.matches ? 'dark' : 'light'));
  });
  apply(choice || (media.matches ? 'dark' : 'light'));
})();
