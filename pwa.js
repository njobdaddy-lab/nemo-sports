(() => {
  const installBtn = document.getElementById('installApp');
  const installHint = document.getElementById('installHint');
  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;

  const refreshInstallUI = () => {
    if (!installBtn) return;
    installBtn.hidden = isStandalone();
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
    if (isStandalone()) return;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        refreshInstallUI();
      }
      return;
    }

    alert('이 브라우저에서는 자동 설치창을 바로 띄울 수 없어요.\n\n브라우저의 ⋮ 메뉴 → “앱 설치” 또는 “홈 화면에 추가”를 눌러 네모 운동회를 설치해 주세요.');
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
