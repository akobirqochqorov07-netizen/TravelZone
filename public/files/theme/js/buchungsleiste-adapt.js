/* Buchungsleiste: Modus-Wechsel je nach Hintergrund. Über Medien
   (Hero-Video/-Bild) bleibt das helle Glas; liegt hinter der Leiste
   eine helle, deckende Fläche, bekommt sie .on-light (dunkle Tönung).
   Läuft rAF-gedrosselt auf Scroll/Resize. */
document.addEventListener('DOMContentLoaded', () => {
  const leiste = document.querySelector('.buchungsleiste');
  if (!leiste) return;

  // Guard: DOMContentLoaded feuert auf der Seite doppelt
  if (leiste.dataset.adaptInit) return;
  leiste.dataset.adaptInit = '1';

  function backgroundIsLight() {
    const r = leiste.getBoundingClientRect();
    if (!r.width || !r.height) return false; // mobil versteckt

    const x = Math.max(0, Math.min(innerWidth - 1, r.left + r.width / 2));
    const y = Math.max(0, Math.min(innerHeight - 1, r.top + r.height / 2));

    // Stapel in Mal-Reihenfolge durchgehen: das erste Element mit
    // visueller Substanz hinter der Leiste entscheidet. (Ancestor-
    // Walk reicht nicht — das Hero-Video ist Geschwister-, nicht
    // Elternzweig des getroffenen Overlays.)
    for (const el of document.elementsFromPoint(x, y)) {
      if (el === leiste || leiste.contains(el)) continue;
      // Kartenflächen sind KEIN Hero: Google-Maps-Kacheln sind <img>,
      // würden also unten als Medium gewertet. Die Karte ist aber eine
      // helle, deckende Fläche → dunkle Tönung, sonst unlesbar.
      if (el.closest('.map-view, .gm-style')) return true;
      // Nur echte Medien-ELEMENTE zählen als Hero → helles Glas.
      // (background-image NICHT werten: Artikel tragen hier oft
      // dekorative SVG-Grafiken auf weißem Grund, z. B. .grafik-bottom)
      if (el.matches('img, video, picture, canvas')) return false;
      const cs = getComputedStyle(el);
      const m = cs.backgroundColor.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\)/);
      if (m && (m[4] === undefined || parseFloat(m[4]) > 0.5)) {
        const lum = (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
        return lum > 0.6;
      }
    }
    return false;
  }

  let ticking = false;
  function update() {
    ticking = false;
    leiste.classList.toggle('on-light', backgroundIsLight());
  }
  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  update();
  setTimeout(update, 500); // nach Video-/Bild-Load erneut prüfen
});
