/**
 * Travel Zone — product layer over approved clone design.
 * Changes content/data only; preserves layout, CSS, animations.
 */
(function () {
  // Base URL: read from <base href> tag (Vite sets this correctly for both local and GitHub Pages)
  const BASE = (function() {
    const tag = document.querySelector('base[href]');
    if (!tag) return '';
    try {
      const href = tag.getAttribute('href') || '/';
      // Convert absolute URL to pathname if needed
      if (href.startsWith('http')) {
        return new URL(href).pathname.replace(/\/$/, '');
      }
      return href.replace(/\/$/, '');
    } catch(e) { return ''; }
  })();

  function baseUrl(path) {
    // Avoid double slashes
    return BASE ? BASE + path : path;
  }

  // Expose for season.js
  window.BASE_URL = BASE;

  const LANG_KEY = 'tz-lang';
  const SUPPORTED = ['uz', 'ru', 'en'];
  let dict = {};
  let lang = 'en';
  let destinations = [];
  let tours = [];
  let agencies = [];
  let contact = null;
  let seasons = null;

  const CARD_KEYS = [
    { key: 'findTours', href: '#tours', tourIdx: 0 },
    { key: 'agencies', href: '#agencies', tourIdx: 1 },
    { key: 'stories', href: '#about', tourIdx: 2 },
    { key: 'deals', href: '#tours', tourIdx: 3 },
    { key: 'concierge', href: '#contact', tourIdx: 4 },
    { key: 'partner', href: '#partner', tourIdx: 5 },
    { key: 'newsletter', href: '#contact', tourIdx: 6 },
    { key: 'scout', href: '#tours', tourIdx: 7 },
  ];

  function t(path, fallback = '') {
    const parts = path.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return fallback || path;
      cur = cur[p];
    }
    return cur == null ? fallback || path : cur;
  }

  function localized(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || Object.values(obj)[0] || '';
  }

  function priceLabel() {
    if (lang === 'ru') return 'от';
    if (lang === 'uz') return 'dan';
    return 'from';
  }

  function getInitialLang() {
    const q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
    if (SUPPORTED.includes(q)) return q;
    try {
      const stored = sessionStorage.getItem(LANG_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch { }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (nav === 'uz' || nav === 'ru') return nav;
    return 'en';
  }
  // Module-level slogan updater — accessible by season buttons + lang switcher
  function updateHeroSlogan() {
    const hero = document.querySelector('.heading--hero .rte p');
    if (!hero) return;
    const curSeason = window.SEASON || document.documentElement.getAttribute('data-season') || 'summer';
    const slogan = t(`seasons.slogans.${curSeason}`);
    if (slogan && typeof slogan === 'string') {
      const words = slogan.split(' ');
      if (words.length > 2) {
        const mid = Math.ceil(words.length / 2);
        hero.innerHTML = words.slice(0, mid).join(' ') + '<br>' + words.slice(mid).join(' ');
      } else {
        hero.innerHTML = slogan;
      }
    } else {
      hero.innerHTML = [t('hero.line1'), t('hero.line2'), t('hero.line3'), t('hero.line4')].join('<br>');
    }
  }

  async function loadJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  }

  function applyText() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (typeof val === 'string') {
        if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
        else el.textContent = val;
      }
    });

    // Handle standalone data-i18n-html (without data-i18n)
    document.querySelectorAll('[data-i18n-html]:not([data-i18n])').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (typeof val === 'string') el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });

    // Slogan update is now handled by the module-level updateHeroSlogan()
    updateHeroSlogan();

    document.querySelectorAll('[data-tz-rotator]').forEach((mask) => {
      const key = mask.getAttribute('data-tz-rotator');
      const items = t(key);
      if (!Array.isArray(items) || !items.length) return;
      mask.innerHTML = items
        .map((txt, i) => `<span${i === 0 ? ' data-show' : ''}>\n${txt}    </span>`)
        .join('');
      if (window.jQuery && typeof window.initTextRotator === 'function') {
        window.initTextRotator(mask);
      }
    });

    const catalogRotator = document.querySelector('#tours .rotator-mask--vl');
    if (catalogRotator) {
      const items = t('catalog.rotator');
      if (Array.isArray(items) && items.length) {
        catalogRotator.setAttribute('data-tz-rotator', 'catalog.rotator');
        catalogRotator.innerHTML = items
          .map((txt, i) => `<span${i === 0 ? ' data-show' : ''}>\n${txt}    </span>`)
          .join('');
        if (window.jQuery && typeof window.initTextRotator === 'function') {
          window.initTextRotator(catalogRotator);
        }
      }
    }

    document.title = t('meta.title');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-switch a').forEach((a) => {
      a.classList.toggle('is-active', a.dataset.lang === lang);
      a.setAttribute('aria-current', a.dataset.lang === lang ? 'true' : 'false');
    });
  }

  function applySeasonLabels() {
    document.querySelectorAll('.season-switch').forEach((btn) => {
      const s = btn.dataset.season;
      const span = btn.querySelector('span');
      if (span && s) span.textContent = t(`seasons.${s}`);
      btn.title = `Travel Zone ${t(`seasons.${s}`)}`;

      // Wire season click: update SEASON, dispatch event, update slogan immediately
      // Use a flag to avoid re-registering on each applySeasonLabels call
      if (!btn.dataset.tzSeasonWired) {
        btn.dataset.tzSeasonWired = '1';
        btn.addEventListener('click', () => {
          const newSeason = btn.dataset.season;
          if (!newSeason) return;
          window.SEASON = newSeason;

          // Toggle html[data-season] and body season classes immediately
          document.documentElement.setAttribute('data-season', newSeason);
          const allSeasons = ['spring', 'summer', 'autumn', 'winter'];
          allSeasons.forEach(x => {
            document.documentElement.classList.toggle('season-' + x, x === newSeason);
            document.body.classList.toggle(x, x === newSeason);
          });

          // Update active button highlight
          document.querySelectorAll('.season-switch').forEach(b => {
            b.classList.toggle('is-active', b.dataset.season === newSeason);
            b.setAttribute('aria-disabled', b.dataset.season === newSeason ? 'true' : 'false');
          });

          // Season change: only affect hero video sliders, nothing else
          document.querySelectorAll('#article-833 .start-slider').forEach(slider => {
            const isMatch = slider.classList.contains(newSeason);
            slider.style.display = isMatch ? '' : 'none';
            slider.querySelectorAll('video').forEach(v => {
              try {
                if (isMatch) { v.muted = true; v.play().catch(() => {}); }
                else v.pause();
              } catch(e) {}
            });
          });

          // Update hero slogan
          updateHeroSlogan();

          // Notify other listeners (like tour catalog)
          document.dispatchEvent(new CustomEvent('season:changed', { detail: { season: newSeason } }));
        });
      }
    });
  }

  function injectSeasonHeroes() {
    if (!seasons?.media || document.querySelector('.start-slider.spring')) return;
    const article = document.getElementById('article-833');
    const summerSlider = article?.querySelector('.start-slider.summer');
    if (!article || !summerSlider) return;

    ['spring', 'autumn'].forEach((season) => {
      const media = seasons.media[season];
      if (!media || media.useExisting) return;
      const block = document.createElement('div');
      block.className = `mod_rocksolid_slider start-slider ${season} block`;
      block.innerHTML = `
<div data-rsts-slide-class="morning">
<div class="slide-loader"><div class="spinner"></div></div>
<video muted playsinline loop autoplay preload="auto" poster="${media.poster}"
  data-rsts-background data-rsts-scale-mode="crop" style="width:100%;height:100%;object-fit:cover;">
  <source src="${media.videoMobile}" type="video/mp4" media="(max-width: 1024px)">
  <source src="${media.videoHd}" type="video/mp4" media="(min-width: 1025px)">
</video>
</div>`;
      article.insertBefore(block, summerSlider);

      // Ensure video plays when this season becomes active
      const video = block.querySelector('video');
      if (video) {
        video.muted = true;
        video.defaultMuted = true;
        // Try playing immediately (CSS may hide it, browser may block — safe to ignore)
        const tryPlay = () => { try { video.play().catch(() => { }); } catch (e) { } };
        tryPlay();
        document.addEventListener('season:changed', (e) => {
          if (e.detail?.season === season) { tryPlay(); }
          else { try { video.pause(); } catch (e) { } }
        });
      }
    });
  }

  function setCardImage(link, src, alt) {
    if (!link || !src) return;

    // Primary: set as direct background on the card link (most reliable)
    link.style.backgroundImage = `url('${src}')`;
    link.style.backgroundSize = 'cover';
    link.style.backgroundPosition = 'center center';
    link.style.backgroundRepeat = 'no-repeat';
    link.style.position = 'relative';
    link.style.overflow = 'hidden';

    // Also update any RockSolid background containers
    link.querySelectorAll('.rsts-main-image, [data-rsts-background]').forEach((bg) => {
      bg.style.backgroundImage = `url('${src}')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center center';
      bg.style.opacity = '1';
      bg.style.visibility = 'visible';
      bg.style.position = 'absolute';
      bg.style.inset = '0';
      bg.style.width = '100%';
      bg.style.height = '100%';
    });

    // Update img element
    const img = link.querySelector('img');
    if (img) {
      img.src = src;
      img.srcset = src;
      if (alt) img.alt = alt;
      img.style.position = 'absolute';
      img.style.inset = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center center';
      img.style.display = 'block';
    }

    // Update picture element
    const pic = link.querySelector('picture');
    if (pic) {
      pic.style.position = 'absolute';
      pic.style.inset = '0';
      pic.style.width = '100%';
      pic.style.height = '100%';
      pic.style.display = 'block';
    }

    link.querySelectorAll('source').forEach((s) => { s.srcset = src; });

    // Keep text overlay visible
    const rte = link.querySelector('.rte');
    if (rte) {
      rte.style.background = 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)';
      rte.style.position = 'relative';
      rte.style.zIndex = '2';
    }
    const ct = link.querySelector('.content-text');
    if (ct) {
      ct.style.position = 'relative';
      ct.style.zIndex = '2';
    }
  }

  function openCardModal(key) {
    let details = t(`cardDetails.${key}`);
    if (!details || typeof details !== 'object') {
      const card = t(`cards.${key}`);
      details = {
        title: card?.title || 'Travel Zone',
        badge: 'Travel Experience',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
        description: card?.subtitle || 'Experience Travel Zone.',
        highlights: ['Verified Travel Partner', 'Custom Packages', '24/7 Support']
      };
    }
    let modal = document.getElementById('tz-card-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tz-card-modal';
      modal.className = 'tz-modal-backdrop';
      document.body.appendChild(modal);
    }
    const highlights = Array.isArray(details.highlights) ? details.highlights : [];
    modal.innerHTML = `
      <div class="tz-modal-dialog">
        <button type="button" class="tz-modal-close" aria-label="Close">&times;</button>
        <div class="tz-modal-media">
          <img src="${details.image && details.image.startsWith("/") ? baseUrl(details.image) : details.image}" alt="${details.title}">
          <span class="tz-modal-badge">${details.badge || 'Travel Zone'}</span>
        </div>
        <div class="tz-modal-body">
          <h2>${details.title}</h2>
          <p class="tz-modal-desc">${details.description}</p>
          ${highlights.length ? `
            <div class="tz-modal-highlights">
              <h4>${t('about.travelerTitle') || 'Highlights'}</h4>
              <ul>
                ${highlights.map(h => `<li><span class="tz-check">✓</span> ${h}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="tz-modal-actions">
            <a href="#inquiry" class="tz-btn-primary tz-modal-cta">${t('cta.book') || "So'rov Yuborish"}</a>
            <button type="button" class="tz-btn-secondary tz-modal-close-btn">${t('contact.title') || "Yopish"}</button>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    const closeFn = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    modal.querySelectorAll('.tz-modal-close, .tz-modal-close-btn').forEach(btn => {
      btn.onclick = closeFn;
    });
    const cta = modal.querySelector('.tz-modal-cta');
    if (cta) {
      cta.onclick = (e) => {
        e.preventDefault();
        closeFn();
        const booking = document.getElementById('inquiry') || document.querySelector('.buchungsleiste');
        if (booking) booking.scrollIntoView({ behavior: 'smooth' });
      };
    }
    modal.onclick = (e) => {
      if (e.target === modal) closeFn();
    };
  }

  const CARD_IMAGES = {
    findTours: baseUrl('/assets/images/services/find-tours-card.png'),
    agencies: baseUrl('/assets/images/services/agencies-card.png'),
    stories: baseUrl('/assets/images/services/stories-card.png'),
    deals: baseUrl('/assets/images/services/deals-card.png'),
    concierge: baseUrl('/assets/images/services/concierge-card.jpg'),
    partner: baseUrl('/assets/images/services/b2b-card.jpg'),
    newsletter: baseUrl('/assets/images/services/newsletter-card.png'),
    scout: baseUrl('/assets/images/services/scout-reward-card.png')
  };

  function updateContentSliders() {
    document.querySelectorAll('.mod_rocksolid_slider.content-slider').forEach((slider) => {
      const links = slider.querySelectorAll('a.ba-item, a[data-rsts-slide-class="ba-item"]');
      links.forEach((link, i) => {
        const cfg = CARD_KEYS[i];
        if (!cfg) return;
        const card = t(`cards.${cfg.key}`);
        const tour = tours[cfg.tourIdx] || tours[i % tours.length];
        const dest = tour ? destinations.find((d) => d.id === tour.destinationId) : null;

        // Do NOT remove data-rsts-name or change href — that breaks the RockSolid slider
        const rte = link.querySelector('.content-text .rte');
        if (rte && card && typeof card === 'object') {
          rte.innerHTML = `<p>${card.subtitle}</p><h3>${card.title}</h3>`;
        }
        const details = t(`cardDetails.${cfg.key}`);
        const rawImg = (details && typeof details === 'object' && details.image) || CARD_IMAGES[cfg.key] || tour?.coverImage || dest?.coverImage;
        const imgSrc = rawImg && rawImg.startsWith('/') ? baseUrl(rawImg) : rawImg;
        if (imgSrc) setCardImage(link, imgSrc, localized(card?.title || tour?.title));
        const copy = link.querySelector('.rsts-copyright');
        if (copy) copy.textContent = '';

        link.onclick = (e) => {
          e.preventDefault();
          openCardModal(cfg.key);
        };
      });
    });
  }

  function updateCompareSection() {
    const compare = document.querySelector('.js-img-compare');
    if (!compare) return;
    const summerDest = destinations.find((d) => d.id === 'antalya') || destinations[0];
    const winterDest = destinations.find((d) => d.id === 'chimgan') || destinations[destinations.length - 1];
    const panels = compare.querySelectorAll(':scope > div');
    if (panels[0] && summerDest) {
      const img = panels[0].querySelector('img');
      if (img) {
        img.src = summerDest.coverImage;
        img.srcset = summerDest.coverImage;
        img.alt = localized(summerDest.name);
      }
      panels[0].querySelectorAll('source').forEach((s) => s.srcset = summerDest.coverImage);
      const label = panels[0].querySelector('.images-compare-label');
      if (label) label.innerHTML = `<strong>${t('compare.summerStrong')}</strong>${String(t('compare.summerLine')).replace(/\n/g, '<br />')}`;
    }
    if (panels[1] && winterDest) {
      const img = panels[1].querySelector('img');
      if (img) {
        img.src = winterDest.coverImage;
        img.srcset = winterDest.coverImage;
        img.alt = localized(winterDest.name);
      }
      panels[1].querySelectorAll('source').forEach((s) => s.srcset = winterDest.coverImage);
      const label = panels[1].querySelector('.images-compare-label');
      if (label) label.innerHTML = `<strong>${t('compare.winterStrong')}</strong>${String(t('compare.winterLine')).replace(/\n/g, '<br />')}`;
    }
    const left = compare.querySelector('.compare-link-left');
    const right = compare.querySelector('.compare-link-right');
    if (left) left.href = '#destinations';
    if (right) right.href = '#destinations';
  }

  function updateWhyImages() {
    // Images set directly in HTML — no override needed
  }

  function injectSections() {
    if (document.getElementById('about')) return;

    const catalogSection = document.querySelector('#catalog-list-container')?.closest('.mod_article');
    if (catalogSection) catalogSection.id = 'tours';
    const compareSection = document.getElementById('article-837');
    if (compareSection) compareSection.id = 'destinations';
    const booking = document.querySelector('.mod_form.buchungsleiste');
    if (booking) booking.id = 'inquiry';
    const marquee = document.querySelectorAll('#white')[1];
    if (marquee) marquee.id = 'marquee-section';

    const beforeFooter = document.getElementById('before-footer');
    const wrap = document.createElement('div');
    wrap.innerHTML = `
<section id="about" class="tz-about mod_article block">
  <div class="center heading--section"><h2 data-i18n="about.title">What is Travel Zone?</h2></div>
  <div class="center einleitung content-text"><div class="rte"><p data-i18n="about.text"></p></div></div>
  <div class="tz-about-steps">
    <div><h3 data-i18n="about.travelerTitle">For travelers</h3><ol id="tz-traveler-steps"></ol></div>
    <div><h3 data-i18n="about.agencyTitle">For agencies</h3><ol id="tz-agency-steps"></ol></div>
  </div>
  <div class="center buttn bigviolett content-hyperlink" id="partner"><a href="#contact" data-i18n="about.partnerCta">Become a Travel Zone Partner</a></div>
</section>
<section id="agencies" class="mod_article block" style="padding:80px var(--padd,80px);background:var(--white,#fff)">
  <div class="center heading--section"><h2 data-i18n="nav.agencies">Travel Agencies</h2></div>
  <div class="center einleitung content-text"><div class="rte"><p data-i18n="agency.joinText"></p></div></div>
  <div id="tz-agencies-grid" class="catalog-list-container-wrapper" style="margin-top:40px"></div>
</section>
<div class="tz-contact-grid" id="contact">
  <div class="tz-contact-card">
    <h3 data-i18n="contact.title">Contact</h3>
    <p data-i18n="contact.subtitle"></p>
    <div class="tz-contact-actions">
      <a href="#" data-tz-action="telegram" data-tz-type="contact" data-i18n="contact.telegram">Telegram</a>
      <a href="#" data-tz-action="call" data-tz-type="contact" data-i18n="contact.call">Call</a>
    </div>
  </div>
  <div class="tz-contact-card" id="support">
    <h3 data-i18n="contact.supportTitle">Support</h3>
    <p data-i18n="contact.supportSubtitle"></p>
    <div class="tz-contact-actions">
      <a href="#" data-tz-action="telegram" data-tz-type="support" data-i18n="contact.telegram">Telegram</a>
      <a href="#" data-tz-action="call" data-tz-type="support" data-i18n="contact.call">Call</a>
    </div>
  </div>
</div>`;
    beforeFooter?.parentNode?.insertBefore(wrap, beforeFooter);

    const traveler = document.getElementById('tz-traveler-steps');
    const agency = document.getElementById('tz-agency-steps');
    (t('about.travelerSteps') || []).forEach((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      traveler?.appendChild(li);
    });
    (t('about.agencySteps') || []).forEach((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      agency?.appendChild(li);
    });

    renderAgenciesGrid();
  }

  function renderAgenciesGrid() {
    const grid = document.getElementById('tz-agencies-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const carousel = document.createElement('div');
    carousel.className = 'tz-agencies-carousel';

    const track = document.createElement('div');
    track.className = 'tz-agencies-track';

    // Duplicate the agencies list to create seamless infinite scroll effect
    const listToRender = [...agencies, ...agencies];

    listToRender.forEach((agency) => {
      const card = document.createElement('div');
      card.className = 'tz-agency-card';
      card.innerHTML = `
        <div class="tz-agency-card-inner">
          <div class="tz-agency-card-body">
            <h3>${agency.name}${agency.verified ? ` <span class="tz-agency-badge">${t('agency.verified')}</span>` : ''}</h3>
            <p class="tz-agency-desc">${localized(agency.description).slice(0, 100)}…</p>
            <p class="tz-agency-meta">📍 ${agency.location} &nbsp;·&nbsp; ★ ${agency.rating} &nbsp;·&nbsp; ${agency.tourCount} ${t('nav.tours')}</p>
          </div>
          <div class="tz-agency-card-footer">
            <button class="tz-agency-tours-btn" data-agency-id="${agency.id}">${t('nav.tours')}</button>
          </div>
        </div>`;

      // Wire button: open agency website in new tab
      const btn = card.querySelector('.tz-agency-tours-btn');
      btn.addEventListener('click', () => {
        if (agency.website) {
          window.open(agency.website, '_blank', 'noopener noreferrer');
        }
      });

      track.appendChild(card);
    });

    carousel.appendChild(track);
    grid.appendChild(carousel);
  }

  let activeCatalogTab = 'all';

  function renderTourCatalog() {
    const container = document.querySelector('#catalog-list-container');
    if (!container) return;

    function getCategoryBadge(dest) {
      if (!dest) return { key: 'foreign', label: t('catalogTabs.foreign') || 'Chet el' };
      if (dest.country?.en === 'Uzbekistan') {
        if (dest.id === 'chimgan') return { key: 'mountains', label: t('catalogTabs.mountains') || "Tog'lar" };
        return { key: 'uzbekistan', label: t('catalogTabs.uzbekistan') || "O'zbekiston" };
      }
      if (['antalya', 'maldives', 'bali'].includes(dest.id)) {
        return { key: 'hotels', label: t('catalogTabs.hotels') || 'Kurort / Hotel' };
      }
      return { key: 'foreign', label: t('catalogTabs.foreign') || 'Chet el' };
    }

    let filteredTours = tours.filter((tour) => {
      // Agency filter (from agencies carousel button click)
      if (window._tzActiveAgencyId && tour.agencyId !== window._tzActiveAgencyId) return false;

      const dest = destinations.find((d) => d.id === tour.destinationId);
      const cat = getCategoryBadge(dest);
      if (activeCatalogTab === 'all') return true;
      if (activeCatalogTab === 'foreign') return cat.key === 'foreign' || dest?.country?.en !== 'Uzbekistan';
      if (activeCatalogTab === 'uzbekistan') return dest?.country?.en === 'Uzbekistan';
      if (activeCatalogTab === 'mountains') return dest?.id === 'chimgan' || dest?.tags?.includes('mountains') || tour.tags?.includes('mountains');
      if (activeCatalogTab === 'hotels') return ['antalya', 'maldives', 'bali'].includes(dest?.id) || dest?.tags?.includes('resort') || dest?.tags?.includes('beach');
      return true;
    });

    // If agency filter active but no tours found, show all tours of that agency regardless of tab
    if (window._tzActiveAgencyId && filteredTours.length === 0) {
      filteredTours = tours.filter(t => t.agencyId === window._tzActiveAgencyId);
    }

    if (filteredTours.length === 0) filteredTours = [...tours];

    const cardsHTML = filteredTours.map((tour) => {
      const dest = destinations.find((d) => d.id === tour.destinationId);
      const agency = agencies.find((a) => a.id === tour.agencyId);
      const catBadge = getCategoryBadge(dest);
      const location = [
        dest ? localized(dest.name) : '',
        dest?.region ? localized(dest.region) : '',
        dest?.country ? localized(dest.country) : ''
      ].filter(Boolean).join(' · ');
      return `
        <div class="tz-wh-card">
          <div class="tz-wh-card__image">
            <a href="#inquiry" draggable="false">
              <img src="${tour.coverImage}" alt="${localized(tour.title)}" loading="lazy" draggable="false">
            </a>
            <span class="tz-wh-badge ${catBadge.key}">${catBadge.label}</span>
            <button type="button" class="tz-wh-watchlist watchlist-button add-button" data-id="${tour.id}" aria-pressed="false" aria-label="${t('cta.favorites')}"></button>
          </div>
          <div class="tz-wh-card__ort">
            <span class="tz-wh-location">${location}</span>
          </div>
          <div class="tz-wh-card__body">
            <h3><a href="#inquiry" draggable="false">${localized(tour.title)}</a></h3>
            ${agency ? `<p class="tz-wh-agency">${agency.name}${agency.verified ? ` <span class="tz-wh-verified">${t('agency.verified')}</span>` : ''}</p>` : ''}
          </div>
          <div class="tz-wh-card__prices">
            <div class="tz-wh-price">
              <img src="/files/content/graphics/summer.svg" width="16" height="16" alt="Summer" onerror="this.style.display='none'">
              <span>${priceLabel()} $${tour.startingPrice}</span>
            </div>
            <div class="tz-wh-price">
              <img src="/files/content/graphics/winter.svg" width="16" height="16" alt="Winter" onerror="this.style.display='none'">
              <span>${priceLabel()} $${Math.round(tour.startingPrice * 1.15)}</span>
            </div>
          </div>
          <div class="tz-wh-card__btns">
            <a href="#inquiry" class="tz-wh-btn-outline" draggable="false">${t('catalog.inquire')}</a>
            <a href="#inquiry" class="tz-wh-btn-fill" draggable="false" data-tour-id="${tour.id}">${t('catalog.book')}</a>
          </div>
        </div>`;
    }).join('');

    // First render: build full structure
    if (!container.querySelector('.tz-catalog-tabs-bar')) {
      container.innerHTML = `
        <div class="tz-catalog-tabs-bar">
          <button type="button" class="tz-tab-btn ${activeCatalogTab === 'all' ? 'active' : ''}" data-tab="all">${t('catalogTabs.all')}</button>
          <button type="button" class="tz-tab-btn ${activeCatalogTab === 'foreign' ? 'active' : ''}" data-tab="foreign">${t('catalogTabs.foreign')}</button>
          <button type="button" class="tz-tab-btn ${activeCatalogTab === 'uzbekistan' ? 'active' : ''}" data-tab="uzbekistan">${t('catalogTabs.uzbekistan')}</button>
          <button type="button" class="tz-tab-btn ${activeCatalogTab === 'mountains' ? 'active' : ''}" data-tab="mountains">${t('catalogTabs.mountains')}</button>
          <button type="button" class="tz-tab-btn ${activeCatalogTab === 'hotels' ? 'active' : ''}" data-tab="hotels">${t('catalogTabs.hotels')}</button>
        </div>
        <div class="tz-catalog-slider-wrap">
          <div class="tz-catalog-track-wrapper">
            <div class="tz-catalog-track">${cardsHTML}</div>
          </div>
        </div>`;
    } else {
      // Tab click: only update active state and cards, keep scroll wrapper intact
      container.querySelectorAll('.tz-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === activeCatalogTab);
      });
      const trackEl = container.querySelector('.tz-catalog-track');
      if (trackEl) trackEl.innerHTML = cardsHTML;
    }

    // Wire tab buttons only on first render
    if (container.querySelectorAll('.tz-tab-btn[data-wired]').length === 0) {
      container.querySelectorAll('.tz-tab-btn').forEach((btn) => {
        btn.dataset.wired = '1';
        btn.onclick = () => {
          activeCatalogTab = btn.dataset.tab;
          window._tzActiveAgencyId = null;
          renderTourCatalog();
        };
      });
    }

    const track = container.querySelector('.tz-catalog-track-wrapper');
    const prevBtn = container.querySelector('.tz-catalog-prev');
    const nextBtn = container.querySelector('.tz-catalog-next');

    if (track && prevBtn && nextBtn) {
      prevBtn.onclick = () => track.scrollBy({ left: -360, behavior: 'smooth' });
      nextBtn.onclick = () => track.scrollBy({ left: 360, behavior: 'smooth' });
    }

    // Mouse drag scroll
    if (track) {
      let isDragging = false, startX = 0, scrollLeft = 0;
      track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
      });
      track.addEventListener('mouseleave', () => { isDragging = false; track.style.cursor = 'grab'; });
      track.addEventListener('mouseup', () => { isDragging = false; track.style.cursor = 'grab'; });
      track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        track.scrollLeft = scrollLeft - (x - startX);
      });
    }

    document.dispatchEvent(new CustomEvent('tz:catalog-updated'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

  function fixGlobalLinks() {
    document.querySelectorAll('a[href^="/en/"], a[href*="wanderhotel"], a[href*="book-a-wander"]').forEach((a) => {
      const h = a.getAttribute('href') || '';
      if (h.includes('hotel') || h.includes('wander') || h.includes('offer') || h.includes('watchlist')) {
        a.setAttribute('href', h.includes('map') ? '#destinations' : '#tours');
      } else if (h.includes('become') || h.includes('member')) {
        a.setAttribute('href', '#partner');
      } else if (h.includes('concierge') || h.includes('contact')) {
        a.setAttribute('href', '#contact');
      } else if (h.startsWith('/en/')) {
        a.setAttribute('href', '#about');
      }
    });
    document.querySelectorAll('a[href="/en/"], a[href="/"]').forEach((a) => {
      if (!a.closest('.lang-switch')) a.setAttribute('href', '/?season=' + (window.SEASON || 'summer'));
    });
    const form = document.querySelector('.buchungsleiste form');
    if (form) {
      form.setAttribute('action', '#inquiry');
      form.removeAttribute('method');
    }
    document.querySelectorAll('.cta a, .bgb').forEach((a) => {
      const txt = (a.textContent || '').toLowerCase();
      if (txt.includes('hotel')) a.setAttribute('href', '#tours');
    });
    const become = document.querySelector('.footer-inner .buttn.violett a');
    if (become) become.setAttribute('href', '#partner');
    document.querySelectorAll('.social a').forEach((a) => {
      a.setAttribute('href', '#contact');
      a.removeAttribute('target');
    });
    const before = document.querySelector('.before-buttons');
    if (before) {
      before.innerHTML = `
<a href="#partner" title="Partner"><img loading="lazy" src="files/content/graphics/partner.svg" alt=""> <span data-i18n="nav.partner">Become a Partner</span></a>
<a href="#agencies" title="Agencies"><img loading="lazy" src="files/content/graphics/wanderer.svg" alt=""> <span data-i18n="nav.agencies">Travel Agencies</span></a>
<a href="#contact" title="Contact"><img loading="lazy" src="files/content/graphics/member.svg" alt=""> <span data-i18n="contact.title">Contact</span></a>
<a href="#support" title="Support"><img loading="lazy" src="files/content/graphics/rucksack.svg" alt=""> <span data-i18n="contact.supportTitle">Support</span></a>
<a href="#about" title="About"><img loading="lazy" src="files/content/graphics/presse.svg" alt=""> <span data-i18n="nav.about">About Travel Zone</span></a>`;
    }
  }

  function wireLangSwitcher() {
    document.querySelectorAll('.lang-switch a[data-lang]').forEach((a) => {
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        const next = a.dataset.lang;
        if (!SUPPORTED.includes(next) || next === lang) return;
        await setLang(next);
      });
    });
  }

  async function setLang(next) {
    lang = next;
    try {
      sessionStorage.setItem(LANG_KEY, lang);
    } catch { }
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState({}, '', url);
    dict = await loadJson(baseUrl(`/i18n/${lang}.json`));
    applyText();
    applySeasonLabels();
    updateContentSliders();
    renderTourCatalog();
    renderAgenciesGrid();
    updateCompareSection();
    document.dispatchEvent(new CustomEvent('tz:lang', { detail: { lang } }));
  }

  function wireInquiry() {
    const form = document.querySelector('.buchungsleiste form, .mod_form.buchungsleiste form');
    if (!form) return;
    form.addEventListener('submit', (e) => e.preventDefault());
    const btn = form.querySelector('.btn-buchen, button[type="submit"]');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
      const lead = {
        id: `lead_${Date.now()}`,
        status: 'New',
        dateFrom: form.querySelector('[name="date_from"]')?.value || '',
        dateTo: form.querySelector('[name="date_to"]')?.value || '',
        travelers: Number(form.querySelector('[name="persons_adults"]')?.value || 2),
        createdAt: new Date().toISOString(),
        tourId: null,
        agencyId: null,
        contact: contact?.contact || {},
      };
      try {
        const existing = JSON.parse(localStorage.getItem('tz-leads') || '[]');
        existing.push(lead);
        localStorage.setItem('tz-leads', JSON.stringify(existing));
      } catch { }
      alert(t('inquiry.success'));
    });
  }

  function wireContactActions() {
    document.querySelectorAll('[data-tz-action]').forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        const action = el.getAttribute('data-tz-action');
        const type = el.getAttribute('data-tz-type') || 'contact';
        const data = contact?.[type];
        if (!data) return;
        if (action === 'telegram') window.open(data.telegramUrl, '_blank', 'noopener');
        else if (action === 'call') window.location.href = data.telLink;
      };
    });
  }

  async function init() {
    lang = getInitialLang();
    const [enFallback, destinationsData, toursData, agenciesData, contactData, seasonsData] =
      await Promise.all([
        loadJson(baseUrl('/i18n/en.json')).catch(() => ({})),
        loadJson(baseUrl('/data/destinations.json')).catch(() => []),
        loadJson(baseUrl('/data/tours.json')).catch(() => []),
        loadJson(baseUrl('/data/agencies.json')).catch(() => []),
        loadJson(baseUrl('/data/contact.json')).catch(() => null),
        loadJson(baseUrl('/data/seasons.json')).catch(() => null),
      ]);
    destinations = Array.isArray(destinationsData) ? destinationsData : destinationsData.destinations || [];
    tours = Array.isArray(toursData) ? toursData : toursData.tours || [];
    agencies = Array.isArray(agenciesData) ? agenciesData : agenciesData.agencies || [];
    contact = contactData;
    seasons = seasonsData;

    try {
      dict = await loadJson(baseUrl(`/i18n/${lang}.json`));
    } catch {
      dict = enFallback;
      lang = 'en';
    }

    window.TravelZone = { lang, t, localized, destinations, tours, agencies, contact, setLang };

    injectSeasonHeroes();

    // After injection, clear any inline styles on hero sliders so CSS takes over
    requestAnimationFrame(() => {
      const curSeason = window.SEASON || document.documentElement.getAttribute('data-season') || 'summer';
      document.querySelectorAll('#article-833 .start-slider').forEach(sl => {
        sl.style.display = '';
      });
      // Re-set data-season to retrigger CSS attribute selector
      document.documentElement.setAttribute('data-season', curSeason);
      // Play video for current season
      const active = document.querySelector(`#article-833 .start-slider.${curSeason}`);
      if (active) {
        active.querySelectorAll('video').forEach(v => {
          v.muted = true;
          v.play().catch(() => { });
        });
      }
    });
    injectSections();
    fixGlobalLinks();
    applyText();
    applySeasonLabels();
    updateCompareSection();
    updateWhyImages();
    wireLangSwitcher();
    wireInquiry();
    wireContactActions();
    renderTourCatalog();

    // Wire new services slider prev/next buttons
    const servicesTrack = document.querySelector('.tz-services-track');
    const servicesPrev = document.querySelector('.tz-services-prev');
    const servicesNext = document.querySelector('.tz-services-next');
    if (servicesTrack && servicesPrev && servicesNext) {
      servicesPrev.addEventListener('click', () => servicesTrack.scrollBy({ left: -340, behavior: 'smooth' }));
      servicesNext.addEventListener('click', () => servicesTrack.scrollBy({ left: 340, behavior: 'smooth' }));
    }

    // Wire service card clicks for modal
    document.querySelectorAll('.tz-service-card[data-card-key]').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openCardModal(card.dataset.cardKey);
      });
    });

    document.addEventListener('season:changed', () => {
      updateHeroSlogan();
      renderTourCatalog();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
