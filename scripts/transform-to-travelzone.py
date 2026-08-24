#!/usr/bin/env python3
"""Transform WanderHotels clone HTML into Travel Zone product page."""
from pathlib import Path
import re

ROOT = Path('/Users/akobir/Desktop/travelzone')
HTML = ROOT / 'index.html'
html = HTML.read_text(encoding='utf-8')

# --- Meta / head ---
html = html.replace(
    'Your quality hiking vacation in the Alps | Wanderhotels',
    'Travel Zone — Discover Tours & Travel Experiences',
)
html = html.replace(
    'For true relaxation, because your hotel has everything you need for your hiking vacation—from backpacks to tour planning. Book your hiking getaway now!',
    'Travel Zone connects travelers with verified travel agencies and unforgettable tours across Uzbekistan and the world.',
)
html = html.replace('content="Wanderhotels"', 'content="Travel Zone"')
html = html.replace('og:url" content="https://www.wanderhotels.com/en/"', 'og:url" content="/"')
html = html.replace('href="https://www.wanderhotels.com/en/"', 'href="/"')
html = html.replace('https://www.wanderhotels.com/files/content/graphics/og-default.jpg', '/branding/travel-zone-logo.png')

# Season bootstrap: 4 seasons
old_season_boot = re.search(r'<script>\(function\(\)\{var KEY="wh-season".*?</script>', html, re.S)
if old_season_boot:
    html = html.replace(old_season_boot.group(0), '''<script>(function(){var KEY="tz-season";var SEASONS=["spring","summer","autumn","winter"];var params=new URLSearchParams(window.location.search);var seasonFromUrl=params.get("season");function isValidSeason(value){return SEASONS.indexOf(value)!==-1}
function monthSeason(){var m=new Date().getMonth()+1;if(m>=3&&m<=5)return"spring";if(m>=6&&m<=8)return"summer";if(m>=9&&m<=11)return"autumn";return"winter"}
var storedSeason=null;try{storedSeason=sessionStorage.getItem(KEY)}catch(e){}
var initialSeason=isValidSeason(seasonFromUrl)?seasonFromUrl:isValidSeason(storedSeason)?storedSeason:monthSeason();try{sessionStorage.setItem(KEY,initialSeason)}catch(e){}
document.documentElement.classList.remove("season-spring","season-summer","season-autumn","season-winter");document.documentElement.classList.add("season-"+initialSeason);document.documentElement.setAttribute("data-season",initialSeason);window.__INITIAL_SEASON__=initialSeason})()</script>''')

# Inject Travel Zone CSS early
if 'travelzone.css' not in html:
    html = html.replace(
        '</head>',
        '<link rel="stylesheet" href="/css/travelzone.css">\n<link rel="icon" href="/branding/travel-zone-logo.png">\n</head>',
    )

# --- Mega nav (4 columns) ---
NEW_NAV = '''<nav class="nav-overlay main-nav" aria-label="Main">
<ul class="nav-root">
<li class="nav-col mod_customnav gap-after-1 gap-after-4" id="nav-hotel-finden">
<div class="nav-col-inner">
<a href="#tours" title="Find Tours" data-i18n="nav.findTours">Find Tours</a>
<ul class="level_1">
<li><a href="#inquiry" title="Check availability & inquire" class="dark-header merkliste" data-i18n="nav.checkAvailability">Check availability &amp; inquire</a></li>
<li class="has-children">
<div class="nav-item">
<a href="#destinations" title="Destinations" class="full parallax" data-i18n="nav.destinations">Destinations</a>
<button class="submenu-toggle" aria-expanded="false" aria-label="Open submenu"><span class="chevron" aria-hidden="true"></span></button>
</div>
<ul class="level_2">
<li><a href="#destinations" class="full parallax">Dubai</a></li>
<li><a href="#destinations" class="full parallax">Istanbul</a></li>
<li><a href="#destinations" class="full parallax">Antalya</a></li>
<li><a href="#destinations" class="full parallax">Maldives</a></li>
<li><a href="#destinations" class="full parallax">Samarkand</a></li>
<li><a href="#destinations" class="full parallax">Chimgan</a></li>
</ul>
</li>
<li class="has-children">
<div class="nav-item">
<a href="#destinations" title="Uzbekistan" class="full parallax">Uzbekistan</a>
<button class="submenu-toggle" aria-expanded="false" aria-label="Open submenu"><span class="chevron" aria-hidden="true"></span></button>
</div>
<ul class="level_2">
<li><a href="#destinations" class="full parallax">Tashkent</a></li>
<li><a href="#destinations" class="full parallax">Samarkand</a></li>
<li><a href="#destinations" class="full parallax">Bukhara</a></li>
<li><a href="#destinations" class="full parallax">Khiva</a></li>
</ul>
</li>
<li><a href="#tours" class="full parallax" data-i18n="nav.tours">Tours</a></li>
<li><a href="#agencies" class="kriterien vertical-text parallax" data-i18n="nav.verifiedAgencies">Verified Agencies</a></li>
<li><a href="#partner" class="white kriterien vertical-text parallax" data-i18n="nav.joinPlatform">Join as a Travel Agency</a></li>
<li><a href="#about" class="kriterien vertical-text parallax" data-i18n="nav.about">About Travel Zone</a></li>
<li><a href="#contact" class="white kriterien vertical-text parallax" data-i18n="contact.title">Contact</a></li>
</ul>
</div>
</li>
<li class="nav-col mod_customnav" id="nav-aktiv-sommer">
<div class="nav-col-inner">
<strong aria-current="page" data-i18n="nav.colDestinations">Destinations</strong>
<ul class="level_1">
<li><a href="#destinations" class="vertical-text dark-header parallax">Dubai</a></li>
<li><a href="#destinations" class="vertical-text dark-header parallax">Istanbul</a></li>
<li><a href="#destinations" class="vertical-text dark-header parallax">Antalya</a></li>
<li><a href="#destinations" class="vertical-text dark-header parallax">Bali</a></li>
<li><a href="#destinations" class="vertical-text dark-header parallax">Paris</a></li>
<li><a href="#destinations" class="vertical-text dark-header parallax">London</a></li>
</ul>
</div>
</li>
<li class="nav-col mod_customnav" id="nav-aktiv-winter">
<div class="nav-col-inner">
<strong aria-current="page" data-i18n="nav.colAgencies">Travel Agencies</strong>
<ul class="level_1">
<li><a href="#agencies" class="vertical-text dark-header parallax" data-i18n="nav.verifiedAgencies">Verified Agencies</a></li>
<li><a href="#partner" class="vertical-text dark-header parallax" data-i18n="nav.joinPlatform">Join as a Travel Agency</a></li>
<li><a href="#partner" class="vertical-text dark-header parallax" data-i18n="nav.howItWorks">How it works</a></li>
<li><a href="#about" class="vertical-text dark-header parallax" data-i18n="agency.joinTitle">Grow with Travel Zone</a></li>
<li><a href="#support" class="vertical-text dark-header parallax" data-i18n="contact.supportTitle">Support</a></li>
</ul>
</div>
</li>
<li class="nav-col mod_customnav gap-after-3 gap-after-5" id="nav-wanderlust">
<div class="nav-col-inner">
<strong aria-current="page" data-i18n="nav.colAbout">Travel Zone</strong>
<ul class="level_1">
<li><a href="#about" class="no-big-einleitung" data-i18n="nav.about">About Travel Zone</a></li>
<li><a href="#about" class="vertical-text" data-i18n="nav.quality">Quality promise</a></li>
<li><a href="#contact" class="vertical-text parallax" data-i18n="contact.title">Contact</a></li>
<li><a href="#partner" data-i18n="nav.partner">Become a Partner</a></li>
<li><a href="#destinations" class="white parallax" data-i18n="cta.map">Map</a></li>
<li><a href="#tours" class="parallax" data-i18n="nav.tours">Tours</a></li>
<li><a href="#support" data-i18n="contact.supportTitle">Support</a></li>
</ul>
</div>
</li>
</ul>
</nav>'''

html = re.sub(
    r'<nav class="nav-overlay main-nav" aria-label="Main">.*?</nav>',
    NEW_NAV,
    html,
    count=1,
    flags=re.S,
)

# Header quick links + language
html = re.sub(
    r'<a href="/en/hotels"[^>]*>Hotels</a>\s*<a href="/en/offers"[^>]*>Offers</a>',
    '<a href="#tours" title="Tours" data-i18n="nav.tours">Tours</a>\n<a href="#destinations" title="Destinations" data-i18n="nav.destinations">Destinations</a>',
    html,
)

html = re.sub(
    r'<nav class="mod_changelanguage block">.*?</nav>',
    '''<nav class="mod_changelanguage block" aria-label="Language">
<ul class="level_1 lang-switch">
<li class="lang-uz"><a href="?lang=uz" data-lang="uz" hreflang="uz" aria-label="Oʻzbek">UZ</a></li>
<li class="lang-ru"><a href="?lang=ru" data-lang="ru" hreflang="ru" aria-label="Русский">RU</a></li>
<li class="lang-en"><a href="?lang=en" data-lang="en" hreflang="en" aria-label="English">EN</a></li>
</ul>
</nav>''',
    html,
    count=1,
    flags=re.S,
)

# Logos
html = html.replace('files/content/graphics/wanderhotels-logo-white.svg', '/branding/travel-zone-logo-white.png')
html = html.replace('files/content/graphics/wanderhotels-logo-beige.svg', '/branding/travel-zone-logo-beige.png')
html = html.replace('files/content/graphics/wanderhotels-logo-black.svg', '/branding/travel-zone-logo-black.png')
html = html.replace('alt="Wanderhotels Logo"', 'alt="Travel Zone Logo"')
html = html.replace('title="Wanderhotels"', 'title="Travel Zone"')
html = html.replace('Wanderhotels Logo', 'Travel Zone Logo')

# Season switcher — 4 seasons
html = re.sub(
    r'<div class="switcher">.*?</div>\s*</div>\s*<div class="mod_article block" id="article-833">',
    '''<div class="switcher">
<button class="season-switch" data-season="spring" title="Travel Zone Spring">
<img loading="lazy" src="files/content/graphics/summer.svg" height="15" width="15" alt="Spring">
<span data-i18n="seasons.spring">Spring</span>
</button>
<button class="season-switch" data-season="summer" title="Travel Zone Summer">
<img loading="lazy" src="files/content/graphics/summer.svg" height="15" width="15" alt="Summer">
<span data-i18n="seasons.summer">Summer</span>
</button>
<button class="season-switch" data-season="autumn" title="Travel Zone Autumn">
<img loading="lazy" src="files/content/graphics/winter.svg" height="15" width="15" alt="Autumn">
<span data-i18n="seasons.autumn">Autumn</span>
</button>
<button class="season-switch" data-season="winter" title="Travel Zone Winter">
<img loading="lazy" src="files/content/graphics/winter.svg" height="15" width="15" alt="Winter">
<span data-i18n="seasons.winter">Winter</span>
</button>
</div>
</div>
<div class="mod_article block" id="article-833">''',
    html,
    count=1,
    flags=re.S,
)

# Hero text
html = html.replace(
    'Mountain<br>Escapes<br>at Their<br>Best.',
    'Travel<br>Escapes<br>at Their<br>Best.',
)

# Menu label
html = html.replace('<span class="navname">MENU</span>', '<span class="navname" data-i18n="nav.menu">MENU</span>')

# Booking button
html = html.replace('>book</button>', ' data-i18n="booking.book">inquire</button>')
html = html.replace('placeholder="Arrival"', 'placeholder="Departure" data-i18n-placeholder="booking.arrival"')
html = html.replace('placeholder="Departure"', 'placeholder="Return" data-i18n-placeholder="booking.departure"', 1)

# Intro section summer
html = re.sub(
    r'(<div class="summer center einleitung content-element-group">\s*<div class="center heading--section">\s*<h1 class="mask-headline">)\s*Your hiking vacation\s*<span class="sr-only">in the Alps</span>\s*</h1>\s*<span class="rotator-mask"[^>]*>.*?</span>',
    r'''\1<span data-i18n="intro.headline">Your travel adventure</span> <span class="sr-only">around the world</span></h1>
<span class="rotator-mask" data-tz-rotator="intro.rotator" aria-hidden="true" role="presentation">
<span data-show>around the world</span>
</span>''',
    html,
    count=1,
    flags=re.S,
)

html = re.sub(
    r'(<div class="summer center einleitung[\s\S]*?<div class="rte">\s*<p>)[^<]+(</p>)',
    r'\1<span data-i18n="intro.text">Discover tours from verified travel agencies across Uzbekistan and beyond. Compare experiences, connect with experts, and book your next journey — warm, personal, and reliable.</span>\2',
    html,
    count=1,
)

# Winter intro
html = re.sub(
    r'(<div class="winter center einleitung content-element-group">\s*<div class="center heading--section">\s*<h2 class="mask-headline">)\s*Your hiking vacation\s*<span class="sr-only">in the Alps</span>\s*</h2>\s*<span class="rotator-mask"[^>]*>.*?</span>',
    r'''\1<span data-i18n="intro.headline">Your travel adventure</span> <span class="sr-only">around the world</span></h2>
<span class="rotator-mask" data-tz-rotator="intro.rotator" aria-hidden="true" role="presentation">
<span data-show>around the world</span>
</span>''',
    html,
    count=1,
    flags=re.S,
)

html = re.sub(
    r'(<div class="winter center einleitung[\s\S]*?<div class="rte">\s*<p>)[^<]+(</p>)',
    r'\1<span data-i18n="intro.text">Discover tours from verified travel agencies across Uzbekistan and beyond. Compare experiences, connect with experts, and book your next journey — warm, personal, and reliable.</span>\2',
    html,
    count=1,
)

html = html.replace(
    'What would you like us to call you?',
    '<span data-i18n="intro.namePrompt">What would you like us to call you?</span>',
)

# Catalog heading
html = html.replace('Your Wanderhotel', '<span data-i18n="catalog.headline">Your tour</span>')
html = html.replace(
    'All across the Alps, the best alpine Wanderhotels are ready to turn your dream hiking getaway into reality. Which hotel will you choose?',
    '<span data-i18n="catalog.text">Across the world, the best Travel Zone tours are ready to turn your dream getaway into reality. Which journey will you choose?</span>',
)
html = html.replace('Hotels inquiries', '<span data-i18n="catalog.inquire">Tour inquiries</span>')
html = html.replace('Book hotels', '<span data-i18n="catalog.book">Inquire about tours</span>')

# Why section
html = html.replace('Why <strong>Wanderhotels</strong>?', 'Why <strong>Travel Zone</strong>?')
html = html.replace('Our 6 best reasons', '<span data-i18n="why.subtitle">Our best reasons</span>')
html = re.sub(
    r'Our Wanderhotels in Austria[\s\S]*?best alpine Wanderhotels</strong>\.',
    '<span data-i18n="why.text">Travel Zone connects travelers with verified travel agencies in Uzbekistan and beyond. Wherever you see the Travel Zone mark, you can trust quality tours, transparent offers, and hosts who care.</span>',
    html,
    count=1,
)
html = html.replace('our quality promise', '<span data-i18n="why.cta">our quality promise</span>')

# Last section
html = html.replace(
    'The <span style="text-decoration: underline;">Mountains</span> are calling.',
    'The <span style="text-decoration: underline;">World</span> is calling.',
)
html = html.replace('Flip through the Wanderhotels!', '<span data-i18n="last.flip">Discover Travel Zone!</span>')
html = html.replace('Order hotel guide', '<span data-i18n="last.orderGuide">Explore destinations</span>')
html = html.replace('Subscribe to newsletter', '<span data-i18n="last.newsletter">Subscribe to newsletter</span>')
html = html.replace(
    'Subscribe to our newsletter &amp;<br>Win a hiking vacation',
    '<span data-i18n-html="last.win">Subscribe to our newsletter &amp;<br>Get travel inspiration</span>',
)

# Marquee
replacements_marquee = [
    ('Prime location', '<span data-i18n="marquee.prime">Prime destinations</span>'),
    ('Family warmth', '<span data-i18n="marquee.warmth">Agency care</span>'),
    ('Hiking advice from professionals', '<span data-i18n="marquee.advice">Expert travel advice</span>'),
    ('Guided hikes', '<span data-i18n="marquee.guided">Guided experiences</span>'),
    ('Carefree hiking vacation', '<span data-i18n="marquee.carefree">Carefree travel</span>'),
    ('Unique experiences', '<span data-i18n="marquee.unique">Unique experiences</span>'),
]
for a, b in replacements_marquee:
    html = html.replace(a, b)

# CTA bar
html = re.sub(r'(class="bgb"[^>]*>)([\s\S]*?<span>)Hotels(</span>)', r'\1\2<span data-i18n="cta.tours">Tours</span>', html, count=1)
html = html.replace('<span>Favorites</span>', '<span data-i18n="cta.favorites">Favorites</span>')
html = html.replace('<span>Offers</span>', '<span data-i18n="cta.offers">Offers</span>')
html = html.replace('<span>Map</span>', '<span data-i18n="cta.map">Map</span>')
html = html.replace('<span>Book</span>', '<span data-i18n="cta.book">Inquire</span>')

# Footer become member
html = html.replace('Become part of the Wanderhotels!', '<span data-i18n="footer.become">Become part of Travel Zone!</span>')
html = html.replace('Become a member', '<span data-i18n="footer.becomeCta">Become a partner</span>')
html = html.replace('© 2026 Wanderhotels', '<span data-i18n="footer.copyright">© 2026 Travel Zone</span>')
html = html.replace('Stay up to date.', '<span data-i18n="footer.stay">Stay up to date.</span>')
html = html.replace('#wanderhotels #hikingholiday', '<span data-i18n="footer.hashtags">#travelzone #tours</span>')
html = html.replace('info@wanderhotels.com', 'info@travelzone.uz')
html = html.replace('+43 676 36 21 179', '+998 99 617 73 37')
html = html.replace('tel:+436763621179', 'tel:+998996177337')
html = html.replace('Südtiroler Platz 2 / 3rd floor<br>\n9900 Lienz | Austria', '<span data-i18n="footer.address">Tashkent | Uzbekistan</span>')
html = html.replace('Tourismusverein Wanderhotels in Europa e.V.', '<span data-i18n="footer.company">Travel Zone Marketplace</span>')
html = html.replace('Monday - Thursday | 09:00 - 15:00<br>\nFriday | 09:00 - 12:00', '<span data-i18n="footer.hours">Monday - Friday | 09:00 - 18:00</span>')

# Before footer links
html = html.replace('Members Area', '<span data-i18n="footer.members">Members Area</span>')
html = html.replace('Hiking Concierge', '<span data-i18n="footer.concierge">Travel Concierge</span>')
html = html.replace('Hiking Scout', '<span data-i18n="footer.scout">Travel Scout</span>')
html = html.replace('Our Team', '<span data-i18n="footer.team">Our Team</span>')
html = html.replace('Podcasts & Press', '<span data-i18n="footer.press">Press</span>')

# Season overlays — add spring/autumn, update logos
html = re.sub(
    r'<div id="season-overlay-summer" class="season-overlay">.*?</div>\s*<div id="season-overlay-winter" class="season-overlay">.*?</div>',
    '''<div id="season-overlay-spring" class="season-overlay"><div class="season-overlay-inner"><img loading="lazy" src="/branding/travel-zone-logo-white.png" width="148" height="94" alt="Travel Zone Logo"></div></div>
<div id="season-overlay-summer" class="season-overlay"><div class="season-overlay-inner"><img loading="lazy" src="/branding/travel-zone-logo-white.png" width="148" height="94" alt="Travel Zone Logo"></div></div>
<div id="season-overlay-autumn" class="season-overlay"><div class="season-overlay-inner"><img loading="lazy" src="/branding/travel-zone-logo-white.png" width="148" height="94" alt="Travel Zone Logo"></div></div>
<div id="season-overlay-winter" class="season-overlay"><div class="season-overlay-inner"><img loading="lazy" src="/branding/travel-zone-logo-white.png" width="148" height="94" alt="Travel Zone Logo"></div></div>''',
    html,
    count=1,
    flags=re.S,
)

# Replace season.js path and add TZ scripts
html = html.replace(
    '/files/theme/js/season.js?v=609b9c3a',
    '/js/season.js',
)

# Disable hotel ajax catalog — Travel Zone app renders tours
html = html.replace(
    '<script defer src="/files/theme/js/ajax-startseite.js?v=4cefaab6"></script>',
    '<!-- hotels ajax replaced by Travel Zone tours -->',
)

if 'travelzone-app.js' not in html:
    html = html.replace(
        '</body>',
        '<script defer src="/js/travelzone-app.js"></script>\n</body>',
    )

# Global leftover brand wipe (careful)
for old, new in [
    ('Wanderhotels', 'Travel Zone'),
    ('Wanderhotel', 'Travel Zone tour'),
    ('wanderhotels.com', 'travelzone.uz'),
]:
    html = html.replace(old, new)

HTML.write_text(html, encoding='utf-8')
print('Transformed', HTML, 'bytes', HTML.stat().st_size)
# Count remaining
text = HTML.read_text(encoding='utf-8')
for needle in ['WanderHotels', 'Wanderhotels', 'wandern', 'hiking vacation in the Alps']:
    c = text.lower().count(needle.lower())
    print(f'  remaining "{needle}": {c}')
