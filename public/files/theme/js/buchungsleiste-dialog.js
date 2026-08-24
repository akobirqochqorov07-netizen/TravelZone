/* Buchungsleiste als Mobil-Dialog: der gelbe Buchen-Button im CTA
   öffnet die (mobil versteckte) Buchungsleiste als Overlay.
   Muster wie inquiry-/watchlist-Overlay. */
function wanderhotelsLang() {
  const attr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  const path = window.location.pathname || '';
  if (attr.startsWith('en') || path.startsWith('/en/')) return 'en';
  if (attr.startsWith('it') || path.startsWith('/it/')) return 'it';
  return 'de';
}

const WH_DIALOG_TXT = {
  title: {
    de: 'Verfügbarkeit prüfen & buchen',
    en: 'Check availability & book',
    it: 'Verifica disponibilità e prenota',
  },
  close: {
    de: 'Schließen',
    en: 'Close',
    it: 'Chiudi',
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const leiste = document.querySelector('.buchungsleiste');
  const trigger = document.querySelector('.cta .cta-buchen');
  if (!leiste || !trigger) return;

  // Schutz: DOMContentLoaded feuert auf der Seite doppelt →
  // ohne Guard würden Titel/Close-Button zweimal injiziert
  if (leiste.querySelector('.dialog-close')) return;

  const form = leiste.querySelector('form');

  const title = document.createElement('h3');
  title.className = 'dialog-title';
  title.textContent = WH_DIALOG_TXT.title[wanderhotelsLang()];
  form.prepend(title);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'dialog-close';
  closeBtn.setAttribute('aria-label', WH_DIALOG_TXT.close[wanderhotelsLang()]);
  closeBtn.innerHTML = '&times;';
  form.prepend(closeBtn);

  const open = () => {
    leiste.classList.add('dialog-open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    leiste.classList.remove('dialog-open');
    document.body.style.overflow = '';
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });

  closeBtn.addEventListener('click', close);

  // Klick auf den Backdrop (= die Leiste selbst, nicht die Karte)
  leiste.addEventListener('click', (e) => {
    if (e.target === leiste) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && leiste.classList.contains('dialog-open')) close();
  });
});

/* Anfrage-CTA → Inquiry-Overlay. Auf Hoteldetailseiten bindet das
   cm_master-Template die Öffnung selbst (window.openInquiryOverlay);
   überall sonst (z. B. Home) übernimmt dieses Binding — gleiche
   Mechanik: display:flex + body.no-scroll, Schließen über Button,
   Backdrop und Escape. */
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.cta a.cta-anfragen');
  const overlay = document.getElementById('inquiry-overlay');
  if (!trigger || !overlay) return;

  // Guard: DOMContentLoaded feuert auf der Seite doppelt; und auf
  // Detailseiten bindet das Template den Trigger bereits selbst
  if (trigger.dataset.anfrageInit || typeof window.openInquiryOverlay === 'function') return;
  trigger.dataset.anfrageInit = '1';

  const open = () => {
    overlay.style.display = 'flex';
    document.body.classList.add('no-scroll');
  };
  const close = () => {
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });

  const closeBtn = document.getElementById('close-inquiry-overlay');
  if (closeBtn) closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') close();
  });
});
