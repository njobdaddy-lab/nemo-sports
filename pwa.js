(() => {
  const installBtn = document.getElementById('installApp');
  const installHint = document.getElementById('installHint');
  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const refreshInstallUI = () => {
    if (!installBtn) return;
    installBtn.hidden = isStandalone() || !deferredPrompt;
    if (installHint) installHint.hidden = isStandalone();
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    refreshInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    refreshInstallUI();
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      deferredPrompt = null;
      refreshInstallUI();
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Nemo Sports service worker registration failed:', error);
      });
    });
  }

  refreshInstallUI();
})();
