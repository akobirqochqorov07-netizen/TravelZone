window.Watchlist = {
  changed() {
    document.dispatchEvent(new CustomEvent('watchlist:changed'));
  }
};

document.addEventListener('click', e => {
  const btn = e.target.closest('.ce_watchlist-component');
  if (!btn) return;

  setTimeout(() => {
    Watchlist.changed();
  }, 200);
});

/* Merkliste-Herz (mobile CTA-Bar):
   - GEFUELLT (merken_full.svg) solange >=1 Hotel auf der Merkliste (zaehler-gesteuert via #watchlist-count), sonst Outline (merken.svg)
   - PULSIERT bei jeder Aenderung (add/remove). watchlist:changed feuert pro Aktion mehrfach -> Cooldown = ein sauberer Puls.
   Nur mobil: CSS animiert .wl-pulse @max-width:799px. Sprachunabhaengig. (2026-07-07) */
(function () {
  function init() {
    var counter = document.getElementById('watchlist-count');
    if (!counter) return;
    var link = counter.closest('a');
    var heart = link && link.querySelector('img');
    if (!heart) return;
    var outlineSrc = heart.getAttribute('src');
    var filledSrc  = outlineSrc.replace('merken.svg', 'merken_full.svg');
    new Image().src = filledSrc;                       // Preload gegen Flash

    function syncFill() {
      var n = parseInt((counter.textContent || '').trim(), 10) || 0;
      var target = n > 0 ? filledSrc : outlineSrc;
      if (heart.getAttribute('src') !== target) heart.src = target;
    }
    syncFill();                                        // Initialzustand
    new MutationObserver(syncFill).observe(counter, { childList: true, characterData: true, subtree: true });

    var COOLDOWN = 1200, last = 0;
    document.addEventListener('watchlist:changed', function () {
      var now = Date.now();
      if (now - last < COOLDOWN) return;               // mehrere Dispatches einer Aktion -> ein Puls
      last = now;
      heart.classList.remove('wl-pulse');
      void heart.offsetWidth;                          // Reflow -> Animation sauber starten
      heart.classList.add('wl-pulse');
      setTimeout(function () { heart.classList.remove('wl-pulse'); }, 900);  // Sicherheitsnetz
    });
    heart.addEventListener('animationend', function () { heart.classList.remove('wl-pulse'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
