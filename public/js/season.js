/**
 * Travel Zone season system — extends reference season logic for 4 seasons.
 * Preserves overlay transition, history, and slider refresh behavior.
 */
(function () {
  if (window.__seasonJsInitialized) return;
  window.__seasonJsInitialized = true;

  // FIX 1: Always start at top on page reload (unless there's a hash anchor)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const KEY = 'tz-season';
  const html = document.documentElement;
  const body = document.body;

  function isValid(s) {
    return SEASONS.includes(s);
  }

  function getStored() {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  }

  function setStored(s) {
    if (!isValid(s)) return;
    try {
      sessionStorage.setItem(KEY, s);
    } catch { }
  }

  function fromUrl() {
    const s = new URLSearchParams(window.location.search).get('season');
    return isValid(s) ? s : null;
  }

  function updateUrl(season, mode = 'replace') {
    if (!isValid(season)) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('season') === season) return;
    url.searchParams.set('season', season);
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (mode === 'push') window.history.pushState({}, '', next);
    else window.history.replaceState({}, '', next);
  }

  function scrollToHash(hash, smooth = true) {
    if (!hash || hash === '#') return;
    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }

  function deferHash(smooth = false, delay = 80) {
    if (window.location.hash) {
      setTimeout(() => scrollToHash(window.location.hash, smooth), delay);
    }
  }

  function isSeasonUi(el) {
    return !!(
      el.classList.contains('season-switch') ||
      el.classList.contains('season-radio') ||
      el.classList.contains('season-label') ||
      el.closest('.switcher') ||
      el.closest('.season-toggle')
    );
  }

  function applyVisibility(season) {
    // Season change ONLY affects hero video sliders (.start-slider in #article-833)
    // Everything else stays visible regardless of season
    document.querySelectorAll('#article-833 .start-slider').forEach((el) => {
      const isMatch = el.classList.contains(season);
      el.style.display = isMatch ? '' : 'none';
      if (isMatch) {
        el.querySelectorAll('video').forEach(v => {
          try { v.muted = true; v.play().catch(() => {}); } catch(e) {}
        });
      } else {
        el.querySelectorAll('video').forEach(v => { try { v.pause(); } catch(e) {} });
      }
    });
  }

  function restoreSwitcher() {
    document
      .querySelectorAll('.switcher .spring, .switcher .summer, .switcher .autumn, .switcher .winter, .season-toggle .spring, .season-toggle .summer, .season-toggle .autumn, .season-toggle .winter')
      .forEach((el) => {
        el.style.display = '';
      });
  }

  function syncButtons(season) {
    document.querySelectorAll('.season-switch').forEach((btn) => {
      if (btn.dataset.season === season) {
        btn.classList.remove('is-clickable');
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-active');
      } else {
        btn.classList.add('is-clickable');
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('is-active');
      }
    });
    document.querySelectorAll('.season-radio').forEach((r) => {
      r.checked = r.value === season;
    });
  }

  function setDomSeason(season) {
    SEASONS.forEach((s) => {
      html.classList.remove(`season-${s}`);
      if (body) body.classList.remove(s);
    });
    html.classList.add(`season-${season}`);
    html.setAttribute('data-season', season);
    if (body) {
      body.classList.add(season);
      body.setAttribute('data-season', season);
    }
    window.SEASON = season;
    setStored(season);
  }

  function refreshSlider(season) {
    try {
      const slider = document.querySelector(`.mod_rocksolid_slider.${season}`);
      if (!slider) return;
      slider.querySelectorAll('[data-rsts-center="true"]').forEach((el) => {
        el.style.marginLeft = '';
        el.style.marginTop = '';
      });
      window.dispatchEvent(new Event('resize'));
      if (window.jQuery?.fn?.rstSlider) {
        window.jQuery(slider).trigger('resize').trigger('rsts-resize').trigger('rsts-update');
      }
      setTimeout(() => window.dispatchEvent(new Event('resize')), 180);
      // Play visible season videos
      document.querySelectorAll('.start-slider video').forEach((v) => {
        const parent = v.closest('.start-slider');
        if (parent?.classList.contains(season)) {
          v.muted = true;
          v.play?.().catch(() => { });
        } else {
          v.pause?.();
        }
      });
    } catch { }
  }

  function setSeason(season, opts = {}) {
    const {
      updateHistory = true,
      historyMode = 'replace',
      saveSession = true,
      scrollHashAfterUpdate = true,
      smoothHashScroll = false,
      updateSlider = true,
    } = opts;

    if (!isValid(season)) return;

    if (window.SEASON === season) {
      syncButtons(season);
      applyVisibility(season);
      restoreSwitcher();
      if (saveSession) setStored(season);
      if (updateHistory) updateUrl(season, historyMode);
      if (scrollHashAfterUpdate) deferHash(smoothHashScroll, 50);
      return;
    }

    setDomSeason(season);
    applyVisibility(season);
    restoreSwitcher();
    syncButtons(season);
    if (updateHistory) updateUrl(season, historyMode);
    if (saveSession) {
      fetch((window.BASE_URL||'') + '/set-season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ season }),
        credentials: 'same-origin',
      }).catch(() => { });
    }
    if (updateSlider) refreshSlider(season);
    document.dispatchEvent(new CustomEvent('season:changed', { detail: { season } }));
    if (scrollHashAfterUpdate) deferHash(smoothHashScroll, 120);
  }

  function resolveInitial() {
    const url = fromUrl();
    if (isValid(url)) return url;
    for (const s of SEASONS) {
      if (html.classList.contains(`season-${s}`)) return s;
    }
    const stored = getStored();
    if (isValid(stored)) return stored;
    return 'summer';
  }

  // Init
  setSeason(resolveInitial(), {
    updateHistory: true,
    historyMode: 'replace',
    saveSession: false,
    scrollHashAfterUpdate: true,
    smoothHashScroll: false,
    updateSlider: false,
  });

  document.querySelectorAll('.season-switch').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const season = btn.dataset.season;
      if (!isValid(season) || season === window.SEASON) return;
      setSeason(season, {
        updateHistory: true,
        historyMode: 'replace',
        saveSession: true,
        scrollHashAfterUpdate: true,
        smoothHashScroll: true,
        updateSlider: true,
      });
    });
  });

  window.addEventListener('popstate', () => {
    const s = fromUrl() || getStored();
    if (isValid(s)) {
      setSeason(s, {
        updateHistory: false,
        saveSession: false,
        scrollHashAfterUpdate: false,
        updateSlider: true,
      });
    }
  });

  window.addEventListener('load', () => {
    restoreSwitcher();
    deferHash(false, 50);
    deferHash(false, 250);
    refreshSlider(window.SEASON || 'summer');
  });

  window.TravelZoneSeason = { setSeason, SEASONS };
})();
