(() => {
  const base = location.pathname.includes('/TravelZone/') ? '/TravelZone/' : '/';
  const winter = new URLSearchParams(location.search).get('activity') === 'winter-ski';
  const data = winter ? {
    kicker: 'TRAVEL ZONE · QISHKI FAOLLIK', title: 'Chimyon va Amirsoyda qishki ritm',
    lead: 'Chang‘i, cross-country, qorli sayr va tog‘dagi sokin tiklanish — barchasi bir qishki yo‘nalishda.',
    heading: 'Qishki tog‘ tajribasi, sizning sur’atingizda',
    description: 'Boshlovchi yoki tajribali sayohatchi bo‘lishingizdan qat’i nazar, qishki sayohat energiya va osoyishtalikni birlashtiradi. Travel Zone sizning darajangiz, vaqtingiz va xohishingizga mos tog‘ rejasini topishga yordam beradi.',
    promiseTitle: 'Qishki sayohat uchun Travel Zone va’dasi:',
    hero: 'assets/images/c/schneeschuhwandern-oesterreich-alpbachtal%28c%29alpbachtal-tourismus-shootandstyle-com-me4q624q2v4m2hc.webp',
    editorial: { kicker: 'CROSS-COUNTRY · QORLI YO‘LLAR', title: 'Qishning sokin tomonini kashf eting', text: 'Qorli o‘rmon yo‘llari, keng panorama va o‘z sur’atingizdagi harakat — qishki dam olish faqat tezlik emas. Biz dam olish, jihoz va qulay turar joyni bir yo‘nalishga birlashtiramiz.', image: 'assets/images/w/winterwanderung-schneelandschaft-alpenhof-rossbrand-klein%28c%29michael-perschl-qg113nrpz1vf9je.jpg' },
    promises: [['YAQIN YO‘NALISHLAR', 'Chimyon, Amirsoy va Chorvoq atrofidagi qishki tajribalar.'], ['MOS DARAJA', 'Boshlovchi uchun oson, faol sayohatchi uchun kengroq variantlar.'], ['TO‘LIQ REJA', 'Transport, jihoz, kurort va dam olish nuqtalarini birga tanlaymiz.']],
    routes: [['AMIRSOY', 'Gondola, ski-resort va tog‘ manzaralari bilan faol kun.'], ['CHIMYON', 'Tog‘ havosi, qorli yo‘llar va sokin dam olish.'], ['CHORVOQ', 'Qishki panorama, turar joy va guruh bilan dam olish.']],
    closing: 'Qorli yo‘lning o‘z hikoyasi bor.'
  } : {
    kicker: 'TRAVEL ZONE · YOZGI FAOLLIK', title: 'Tog‘ va tabiatda erkin sayohat',
    lead: 'Yashil yo‘llar, tog‘ havosi va tabiatning tinch ritmi — yozgi sayohatni o‘zingizga moslang.',
    heading: 'Yurish — shunchaki manzilga yetish emas',
    description: 'Tabiat qo‘ynida sayr qilish sur’atni sekinlashtiradi va yangi kuch beradi. Travel Zone bilan Tovoqsoy, Beldersoy, Parkent va boshqa yo‘nalishlar bo‘yicha o‘zingizga mos safarni rejalashtiring.',
    promiseTitle: 'Yozgi trekking uchun Travel Zone va’dasi:',
    hero: 'assets/images/b/gro%C3%9Fglockner-wandern-hoch-und-heilig-osttirol%28c%29tvb-osttirol-peter-maier-r99nwzv0fd34cyr.webp',
    editorial: { kicker: 'PURE HIKING · OCHIQ HAVO', title: 'Yurishning eng toza shakli', text: 'Marshrut vaqtiga emas, taassurotga qarab tanlanadi. Tovoqsoy va Beldersoydagi yo‘llardan Parkentning sokin manzaralarigacha, har kuni sizning holatingizga mos ritmda kechadi.', image: 'assets/images/y/wandern-mit-tourguide-wandern-alpen-wanderhotels-sommer-wanderung%28c%29the-visualvein-3x01xh5386pez0w.jpg' },
    promises: [['TABIIATGA YAQIN', 'Shahar shovqinidan uzoq, ochiq havodagi haqiqiy taassurotlar.'], ['ISHONCHLI TAVSIYA', 'Yo‘nalish murakkabligi, mavsum va guruhingizga mos maslahat.'], ['ERKINLIK', 'Mustaqil sayr yoki tajribali hamroh bilan harakatlanish imkoniyati.']],
    routes: [['TOVOQSOY', 'Ikki kunlik trek va tog‘ etaklaridagi sokin manzaralar.'], ['BELDERSOY', 'Sharshara, piyoda yo‘llar va toza tog‘ havosi.'], ['PARKENT', 'Uzumzorlar, adirlar va yengil tabiat sayri.']],
    closing: 'Yangi yo‘lni bugun boshlang.'
  };
  const el = id => document.getElementById(id);
  el('activity-page').classList.add(winter ? 'winter' : 'summer');
  document.title = `${data.title} — Travel Zone`;
  el('activity-hero-image').src = base + data.hero;
  el('activity-hero-image').alt = data.title;
  el('activity-kicker').textContent = data.kicker;
  el('activity-title').textContent = data.title;
  el('activity-lead').textContent = data.lead;
  el('activity-heading').textContent = data.heading;
  el('activity-description').textContent = data.description;
  el('activity-promise-title').textContent = data.promiseTitle;
  el('activity-strip-title').textContent = winter ? 'Qishki faol sayohat' : 'Yozgi faol sayohat';
  el('activity-promises-list').innerHTML = data.promises.map(([title, text], index) => `<article class="promise"><b>0${index + 1}</b><h3>${title}</h3><p>${text}</p></article>`).join('');
  el('activity-editorial-image').src = base + data.editorial.image;
  el('activity-editorial-image').alt = data.editorial.title;
  el('activity-editorial-kicker').textContent = data.editorial.kicker;
  el('activity-editorial-title').textContent = data.editorial.title;
  el('activity-editorial-text').textContent = data.editorial.text;
  el('activity-routes-title').textContent = winter ? 'Qishki tanlovlar' : 'Yozgi tanlovlar';
  el('activity-routes-list').innerHTML = data.routes.map(([title, text]) => `<article class="route"><span>TRAVEL ZONE ROUTE</span><h3>${title}</h3><p>${text}</p></article>`).join('');
  el('activity-closing-title').textContent = data.closing;
  el('activity-back').href = `${base}index.html#destinations`;
})();
