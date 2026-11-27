(() => {
  const notice = document.querySelector('.rig-pending');
  if (!notice) return;
  let pending;
  function clear() {
    window.clearTimeout(pending);
    notice.hidden = true;
    notice.textContent = '';
  }
  window.addEventListener('pagehide', clear);
  window.addEventListener('pageshow', clear);
  // Browsers without native cross-document snapshots get the same stepped color wipe.
  const timing = performance.getEntriesByType('navigation')[0];
  if (!('onpagereveal' in window) && timing?.type === 'navigate' &&
      document.referrer && new URL(document.referrer).origin === location.origin &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const root = document.documentElement;
    const finish = () => root.classList.remove('rig-entering');
    root.addEventListener('animationend', event => {
      if (event.target === root && event.animationName === 'rig-sweep') finish();
    });
    window.addEventListener('pagehide', finish, { once: true });
    root.classList.add('rig-entering');
  }
  const navigation = window.navigation;
  if (navigation) {
    navigation.addEventListener('navigate', event => {
      clear();
      const target = new URL(event.destination.url);
      if (event.destination.sameDocument || event.hashChange || event.downloadRequest != null ||
          event.navigationType !== 'push' || target.origin !== location.origin ||
          !(/\.html$/.test(target.pathname) || target.pathname.endsWith('/'))) return;
      pending = window.setTimeout(() => {
        notice.hidden = false;
        notice.textContent = '正在打开下一页…';
      }, 220);
      event.signal.addEventListener('abort', clear, { once: true });
    });
    navigation.addEventListener('navigateerror', clear);
    navigation.addEventListener('navigatesuccess', clear);
  }
})();
