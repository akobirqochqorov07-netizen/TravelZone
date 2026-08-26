# Travel Zone issue list

This file is the working list for bugs reported during review and testing.

## Resolved

- [x] **TZ-001 — Mobile language controls crowd the header.** Language choices move inside the hamburger navigation on small screens; the logo remains centered and is larger.
- [x] **TZ-002 — Horizontal page overflow on mobile.** The “Nega Travel Zone?” section and outer page containers are constrained to the viewport; only intentional card rails may scroll horizontally.
- [x] **TZ-003 — Spring/autumn hero can lose the mountain divider.** The divider is made an explicit, stacked part of the parallax wrapper.
- [x] **TZ-004 — Language is lost after clicking a home/logo link.** Internal home links retain the selected `lang` and `season` query values.
- [x] **TZ-005 — Console: Flatpickr locale file is HTML, not JavaScript.** Removed from the page; English is Flatpickr’s built-in default.
- [x] **TZ-006 — Console: FriendlyCaptcha dynamic chunk 603 is missing.** Removed the unusable client script and hidden the static-only captcha placeholder.
- [x] **TZ-007 — Console: unsupported video preload value.** Removed the two unsupported `as="video"` preload tags; the video elements retain `preload="auto"`.

## Open product decisions

- [ ] **TZ-008 — Tour inquiry and newsletter submissions need a real backend destination.** They currently cannot be delivered to an operator from static GitHub Pages alone.
- [x] **TZ-009 — Favorites/watchlist now persists in browser storage.** Catalog heart controls, the counter and the overlay are connected without requiring a server.
- [x] **TZ-010 — GitHub Pages asset paths are normalized in the production build.** Root-page assets are relative and legacy CSS URLs are rewritten to the `/TravelZone/` deployment subpath.
- [x] **TZ-011 — Legacy cloned pages no longer ship in production.** Their server-only requests and exposed Maps key are excluded from `dist`.
