(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const tabpanels = Array.from(document.querySelectorAll('.tabpanel'));

  function activate(targetId, setFocus = true) {
    const target = document.getElementById(targetId);
    if (!target) return;

    // guard: ensure panels exist
    const current = tabpanels.find(p => p.classList.contains('active'));

    if (current === target) return;

    // update tabs ARIA
    tabs.forEach(t => {
      const selected = t.getAttribute('aria-controls') === targetId;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });

    // show target first to avoid brief gap; then hide current
    target.classList.add('active');

    if (current) {
      // allow overlap fade: remove active after a tick so target fades in while current fades out
      requestAnimationFrame(() => {
        current.classList.remove('active');
      });
    }

    if (setFocus) {
      const tab = tabs.find(t => t.getAttribute('aria-controls') === targetId);
      tab && tab.focus();
    }
  }

  // init: mark first panel active
  tabpanels.forEach(p => p.classList.remove('active'));
  (tabpanels[0] || null)?.classList.add('active');

  // wire tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.getAttribute('aria-controls'), true));
    tab.addEventListener('keydown', e => {
      const i = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') { activate(tabs[(i + 1) % tabs.length].getAttribute('aria-controls'), true); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { activate(tabs[(i - 1 + tabs.length) % tabs.length].getAttribute('aria-controls'), true); e.preventDefault(); }
      else if (e.key === 'Home') { activate(tabs[0].getAttribute('aria-controls'), true); e.preventDefault(); }
      else if (e.key === 'End') { activate(tabs[tabs.length - 1].getAttribute('aria-controls'), true); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { activate(tab.getAttribute('aria-controls'), true); e.preventDefault(); }
    });
  });
})();
