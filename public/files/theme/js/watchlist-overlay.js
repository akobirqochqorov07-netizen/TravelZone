document.addEventListener("DOMContentLoaded", (() => {
  // Guard: DOMContentLoaded feuert auf manchen Seiten doppelt —
  // ohne Guard bindet der Toggle doppelt (Overlay geht auf & sofort zu)
  if (document.body.dataset.wlOverlayInit) return;
  document.body.dataset.wlOverlayInit = "1";
  const e = document.getElementById("watchlist-overlay"),
    t = document.getElementById("watchlist-items"),
    n = document.getElementById("watchlist-overlay-count"),
    i = document.getElementById("watchlist-overlay-count-list"),
    r = document.getElementById("watchlist-count"),
    a = document.querySelector('a[title="Merkliste"], a[title="Favorites"], a[title="Favoriten"],a[title="Watchlist"], a[title="Lista preferiti"], a[title="Preferiti"]'),
    l = document.getElementById("close-watchlist"),
    o = (document.documentElement.getAttribute("lang") || "").toLowerCase(),
    s = window.location.pathname || "",
    d = o.startsWith("en") || s.startsWith("/en/") ? "en" : o.startsWith("it") || s.startsWith("/it/") ? "it" : "de",
    c = {
      empty: {
        de: "Deine Favoritenliste ist leer.",
        en: "Your favorites list is empty.",
        it: "La tua lista dei preferiti è vuota."
      },
      noTitle: {
        de: "Kein Titel",
        en: "No title",
        it: "Nessun titolo"
      },
      loadErrorConsole: {
        de: "Fehler beim Laden der Favoriten:",
        en: "Error loading favorites:",
        it: "Errore nel caricamento della lista dei preferiti:"
      },
      loadErrorUi: {
        de: "Fehler beim Laden der Favoriten.",
        en: "Error loading favorites.",
        it: "Errore nel caricamento della lista dei preferiti."
      }
    },
    u = { de: " - ", en: " · ", it: " · " };

  function decodeHtmlEntities(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(value ?? "");
    return textarea.value;
  }

  function h(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeText(value) {
    return h(decodeHtmlEntities(value));
  }

  function m(e) {
    r && (r.textContent = String(e));
    n && (n.textContent = String(e));
    i && (i.textContent = String(e));
  }

  async function g() {
    const e = await fetch("/watchlist/count", { credentials: "same-origin" });
    if (!e.ok) throw new Error("Watchlist state request failed");

    const t = await e.json(),
      n = (t?.rows || [])
        .filter((e => "ctlg_wanderhotels" === String(e?.table || "")))
        .map((e => String(e?.identifier || "").trim()))
        .filter(Boolean);

    return {
      count: t?.count || 0,
      ids: [...new Set(n)]
    };
  }

  async function p() {
    const e = await g();
    if (m(e.count), !t) return;

    if (t.innerHTML = "", !e.ids.length) {
      t.innerHTML = `<p>${c.empty[d]}</p>`;
      return;
    }

    const n = new URLSearchParams();
    n.set("hotel", e.ids.join(","));
    n.set("lang", d);

    const i = await fetch(`/api/hotelsblog?${n.toString()}`, {
      method: "GET",
      credentials: "same-origin",
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    if (!i.ok) throw new Error("Hotel overlay request failed");

    const r = await i.json(),
      a = Array.isArray(r?.results) ? r.results : [];

    t.innerHTML = "";

    a.length ? a.forEach((e => {
      const n = decodeHtmlEntities(e.title || c.noTitle[d]),
        i = e.masterUrl || "#",
        r = e.hauptbild?.[0]?.img?.src || "",
        a = e.hauptbild_winter?.[0]?.img?.src || "",
        l = ["land", "bundesland", "region"]
          .map((t => decodeHtmlEntities(e?.[t]?.[0]?.label)))
          .filter(Boolean)
          .join(u[d]),
        o = function (e) {
          const t = `<svg xmlns="http://www.w3.org/2000/svg" width="15.282" height="14.645" viewBox="0 0 15.282 14.645" class="star-icon">
      <path d="M15.242,6.03a.811.811,0,0,0-.7-.558l-4.412-.4L8.388.99a.813.813,0,0,0-1.495,0L5.15,5.071l-4.412.4A.813.813,0,0,0,.277,6.893L3.611,9.817l-.983,4.331a.812.812,0,0,0,1.209.878l3.8-2.275,3.8,2.275a.813.813,0,0,0,1.209-.878L11.67,9.817l3.335-2.924A.813.813,0,0,0,15.242,6.03Z" transform="translate(0 -0.496)" fill="#ffba00"/>
    </svg>`,
            n = parseInt(e?.[0]?.value, 10) || 0,
            i = e?.[0]?.label || "";

          if (n <= 0) return "";

          let r = '<span class="sterne-wrapper">';
          r += t.repeat(n);

          if (i.includes("+")) {
            r += '<span class="superior">S</span>';
          }

          r += "</span>";
          return r;
        }(e.unterkunftsstandard),
        s = document.createElement("div");

      s.className = "cm_listing_overlay default";
      s.dataset.watchlistId = String(e.watchlistId || e.id || "");
      s.innerHTML = `
        <a href="${h(i)}">
          <div>
            ${r ? `<figure class="image-summer"><img src="${h(r)}" alt="${safeText(n)}" loading="lazy"></figure>` : ""}
            ${a ? `<figure class="image-winter"><img src="${h(a)}" alt="${safeText(n)}" loading="lazy"></figure>` : ""}
          </div>
          <div>
            ${o}
            <h3>${safeText(n)}</h3>
            ${l ? `<div class="ort-kette">${safeText(l)}</div>` : ""}
          </div>
        </a>
      `;

      t.appendChild(s);
    })) : t.innerHTML = `<p>${c.empty[d]}</p>`;
  }

  async function w() {
    try {
      m((await g()).count);
    } catch {}
  }

  w();

  document.addEventListener("watchlist:changed", (() => {
    w();
    e && t && !e.hidden && p().catch((e => {
      console.error(c.loadErrorConsole[d], e);
      t.innerHTML = `<p>${c.loadErrorUi[d]}</p>`;
    }));
  }));

  e && t && (
    a?.addEventListener("click", (n => {
      n.preventDefault();
      e.hidden = !e.hidden;
      e.hidden || p().catch((e => {
        console.error(c.loadErrorConsole[d], e);
        t.innerHTML = `<p>${c.loadErrorUi[d]}</p>`;
      }));
    })),
    l?.addEventListener("click", (() => {
      e.hidden = !0;
    }))
  );
}));