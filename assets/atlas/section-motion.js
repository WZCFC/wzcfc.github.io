(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let playId = 0;
  const players = new WeakMap();

  function resetGif(img) {
    const player = players.get(img);
    if (player) clearTimeout(player.timer);
    img.onload = img.onerror = null;
    players.delete(img);
    if (img.getAttribute('src') !== img.dataset.poster) img.src = img.dataset.poster;
  }

  function playGif(img) {
    if (motion.matches) { resetGif(img); return; }
    if (players.has(img)) return;
    const player = {};
    players.set(img, player);
    img.onload = () => {
      img.onload = null;
      player.timer = setTimeout(() => resetGif(img), Number(img.dataset.duration));
    };
    img.onerror = () => resetGif(img);
    // A new URL makes the GIF start at the first frame on every replay.
    img.src = img.dataset.gif + '?play=' + ++playId;
  }

  document.querySelectorAll('.motion-trigger').forEach(trigger => {
    const image = trigger.querySelector('.motion-art');
    trigger.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') playGif(image);
    });
    if (trigger.matches('button')) trigger.addEventListener('click', () => playGif(image));
    else trigger.addEventListener('focusin', () => playGif(image));
  });

  document.querySelectorAll('#teardown-skills .skill-entry').forEach(skill => {
    const summary = skill.querySelector('summary');
    const marker = summary.querySelector('.skill-marker');
    summary.addEventListener('click', () => {
      requestAnimationFrame(() => {
        if (skill.open) playGif(marker);
        else resetGif(marker);
      });
    });
  });

  motion.addEventListener('change', () => {
    if (motion.matches) document.querySelectorAll('img.motion-art').forEach(img => {
      if (players.has(img)) resetGif(img);
    });
  });
})();
