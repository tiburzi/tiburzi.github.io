(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('.tabpanel'));

  const cssDuration = getComputedStyle(document.documentElement)
    .getPropertyValue('--fade-duration').trim();
  const fadeMs = cssDuration ? parseFloat(cssDuration) : 260;

  function setAria(targetId) {
    tabs.forEach(t => {
      const sel = t.getAttribute('aria-controls') === targetId;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
    });
  }

  function immediateShow(panel) {
    panel.classList.remove('fading-in', 'visible', 'fading-out', 'hidden');
  }

  async function switchTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const current = panels.find(p => !p.classList.contains('hidden') && p !== target);
    if (current === target) return;

    setAria(targetId);

    if (current) {
      current.classList.add('fading-out');
      await new Promise(r => setTimeout(r, fadeMs));
      current.classList.remove('fading-out');
      current.classList.add('hidden');
    }

    target.classList.remove('hidden', 'fading-out');
    target.classList.add('fading-in');
    requestAnimationFrame(() => target.classList.add('visible'));

    setTimeout(() => {
      target.classList.remove('fading-in', 'visible');
    }, fadeMs);

    const tab = tabs.find(t => t.getAttribute('aria-controls') === targetId);
    tab && tab.focus();
  }

  const initial = panels.find(p => !p.classList.contains('hidden')) || panels[0];
  panels.forEach(p => p.classList.add('hidden'));
  if (initial) immediateShow(initial);

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => switchTo(tab.getAttribute('aria-controls')));
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { switchTo(tabs[(idx + 1) % tabs.length].getAttribute('aria-controls')); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { switchTo(tabs[(idx - 1 + tabs.length) % tabs.length].getAttribute('aria-controls')); e.preventDefault(); }
      else if (e.key === 'Home') { switchTo(tabs[0].getAttribute('aria-controls')); e.preventDefault(); }
      else if (e.key === 'End') { switchTo(tabs[tabs.length - 1].getAttribute('aria-controls')); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { switchTo(tab.getAttribute('aria-controls')); e.preventDefault(); }
    });
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    panels.forEach(p => p.classList.remove('fading-in','fading-out','visible'));
    window.switchTo = (id) => {
      panels.forEach(p => p.classList.add('hidden'));
      const t = document.getElementById(id);
      t && immediateShow(t);
      setAria(id);
    };
  }
})();
