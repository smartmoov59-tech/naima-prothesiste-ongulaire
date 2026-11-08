/* Naïma Prothésiste Ongulaire — comportement du site
   GSAP + ScrollTrigger + Lenis (fichiers locaux, aucun service tiers).
   Les prix de la carte se modifient dans l'objet CARTE ci-dessous. */
(function () {
  'use strict';

  var html = document.documentElement;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  /* prefers-reduced-motion respecté ; ajouter ?static à l'adresse force aussi la version sans animation */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(window.location.search);
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var motion = !!gsap && !!ScrollTrigger && !reduce;

  var PLANITY = 'https://www.planity.com/naima-prothesiste-ongulaire-13770-venelles';
  var TEL = '+33662035332';
  var TEL_LABEL = '06 62 03 53 32';
  var DESKTOP = '(min-width: 901px)';
  var MOBILE = '(max-width: 900px)';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var lenis = null;
  var anchorStart = {};
  var menuOpen = false;

  /* =====================================================================
     1. LA CARTE (données + rendu)
     ===================================================================== */
  var NBSP = ' ';
  var CARTE = [
    { id: 'mains', tab: 'Semi-permanent mains', title: 'Semi-permanent <em>mains</em>', cta: 'planity',
      sections: [{ items: [
        { n: 'Pose sans dépose', t: '30 min', p: 30 },
        { n: 'Pose avec dépose', t: '1 h', p: 35 },
        { n: 'Pose sans dépose · gainant', d: 'Le semi-permanent gainant est conseillé aux personnes ayant des ongles fins et cassants : plus épais que le semi-permanent, plus fin que le gel.', t: '1 h', p: 35 },
        { n: 'Pose avec dépose · gainant', t: '1 h', p: 40 },
        { n: 'Pose sans dépose · Green Flash', d: 'Le 1er vernis LED qui sèche immédiatement, ultra longue tenue, retrait express avec un dissolvant sans acétone. Couleur brillante pendant 10 jours.', t: '30 min', p: 30 },
        { n: 'Pose avec dépose · Green Flash', t: '1 h', p: 35 },
        { n: 'Dépose semi-permanent', t: '30 min', p: 15 },
        { n: 'Réparation d\'ongle à l\'unité', t: '15 min', p: 5 },
        { n: 'Prothèse d\'ongle à l\'unité', t: '15 min', p: 10 }
      ] }] },
    { id: 'pieds', tab: 'Semi-permanent pieds', title: 'Semi-permanent <em>pieds</em>', cta: 'planity',
      sections: [{ items: [
        { n: 'Pose sans dépose', t: '30 min', p: 30 },
        { n: 'Pose avec dépose', t: '30 min', p: 30 },
        { n: 'Pose sans dépose · Green Flash', t: '30 min', p: 30 },
        { n: 'Pose avec dépose · Green Flash', t: '30 min', p: 30 },
        { n: 'Dépose semi-permanent', t: '30 min', p: 15 },
        { n: 'Prothèse gros orteil', d: 'Créer un ongle (arraché suite à un traumatisme) en résine ou en gel.', t: '30 min', p: 10 },
        { n: 'Réparation d\'ongle à l\'unité', t: '15 min', p: 5 }
      ] }] },
    { id: 'extensions', tab: 'Extensions d\'ongles', title: 'Extensions <em>d\'ongles</em>', cta: 'both',
      note: 'Les poses complètes se réservent par téléphone au ' + TEL_LABEL + '. La dépose et la réparation se réservent en ligne.',
      sections: [{ items: [
        { n: 'Pose complète sans rallongement (BIAB)', d: 'Pose de gel ou de résine sur ongles naturels.', t: '1 h', p: 60, call: true },
        { n: 'Pose complète avec rallongement', d: 'Gel ou résine avec une technique de rallongement adaptée à la cliente (capsules, chablons, popit…).', t: '1 h 30', p: 70, call: true },
        { n: 'Pose américaine', d: 'Pose d\'une capsule entièrement sur l\'ongle, puis application d\'un semi-permanent de votre choix.', t: '1 h 15', p: 60, call: true },
        { n: 'Dépose + soin de l\'ongle', d: 'Limage complet du produit, beauté de l\'ongle, application d\'une huile de soin.', t: '30 min', p: 25 },
        { n: 'Réparation d\'ongle à l\'unité', t: '15 min', p: 5 }
      ] }] },
    { id: 'comblage', tab: 'Comblage', title: '<em>Comblage</em>', cta: 'planity',
      sections: [
        { sub: 'Ongles courts', items: [
          { n: 'Comblage 2 semaines', t: '1 h', p: 40 },
          { n: 'Comblage 3 semaines', t: '1 h', p: 45 },
          { n: 'Comblage 4 semaines', t: '1 h 15', p: 50 },
          { n: 'Comblage 5 semaines', t: '1 h 30', p: 55 },
          { n: 'Réparation d\'ongle à l\'unité', t: '15 min', p: 5 }
        ] },
        { sub: 'Ongles longs', note: 'Quand le bord libre (la partie de l\'ongle qui dépasse du doigt) mesure plus de 2 mm.', items: [
          { n: 'Comblage 2 semaines', t: '1 h', p: 45 },
          { n: 'Comblage 3 semaines', t: '1 h 15', p: 50 },
          { n: 'Comblage 4 semaines', t: '1 h 30', p: 55 },
          { n: 'Comblage 5 semaines', t: '1 h 30', p: 60 },
          { n: 'Réparation d\'ongle à l\'unité', t: '15 min', p: 5 }
        ] }
      ] },
    { id: 'vernis', tab: 'Vernis & homme', title: 'Vernis classique <em>&amp; homme</em>', cta: 'planity',
      sections: [
        { sub: 'Pose de vernis classique', items: [
          { n: 'Pose de vernis · mains', t: '30 min', p: 20 },
          { n: 'Pose de vernis · pieds', t: '30 min', p: 20 }
        ] },
        { sub: 'Homme', items: [
          { n: 'Beauté des mains', t: '30 min', p: 20 }
        ] }
      ] },
    { id: 'supplements', tab: 'Suppléments & nail art', title: 'Suppléments <em>&amp; nail art</em>', cta: 'planity',
      sections: [{ items: [
        { n: 'French, babyboomer, paillettes…', t: '15 min', p: 5 },
        { n: 'Réparation d\'ongle à l\'unité', t: '15 min', p: 5 },
        { n: 'Nail art personnalisé (par ongle)', t: '5 min', p: 2 }
      ] }] },
    { id: 'cadeau', tab: 'Bon cadeau', title: 'Bon <em>cadeau</em>', cta: 'call',
      sections: [{ items: [
        { n: 'Bon cadeau', d: 'Pour toutes les occasions : Noël, fête des mères, anniversaire, départ en retraite, remerciements… À récupérer sur place et réservable par téléphone.', t: '', p: null, call: true }
      ] }] }
  ];

  function rowHTML(r) {
    var price = r.p == null ? 'Sur appel' : r.p + NBSP + '€';
    return '<div class="row">' +
      '<div class="row__n">' + r.n + (r.call ? '<span class="row__call">Sur appel</span>' : '') + '</div>' +
      (r.t ? '<span class="row__t">' + r.t + '</span>' : '<span></span>') +
      '<span class="row__p">' + price + '</span>' +
      (r.d ? '<p class="row__d">' + r.d + '</p>' : '') +
      '</div>';
  }

  function ctaHTML(kind) {
    var plan = '<a class="btn btn--sm" href="' + PLANITY + '" target="_blank" rel="noopener"><span class="t">Réserver en ligne</span></a>';
    var call = '<a class="btn btn--dark btn--sm" href="tel:' + TEL + '"><span class="t">Appeler le ' + TEL_LABEL + '</span></a>';
    return kind === 'call' ? call : kind === 'both' ? call + plan : plan;
  }

  function panelHTML(g) {
    var h = '<div class="panel__top"><h3>' + g.title + '</h3><div class="panel__cta">' + ctaHTML(g.cta) + '</div></div>';
    if (g.note) h += '<p class="panel__note">' + g.note + '</p>';
    g.sections.forEach(function (s) {
      if (s.sub) h += '<p class="panel__sub">' + s.sub + '</p>';
      if (s.note) h += '<p class="panel__note">' + s.note + '</p>';
      h += '<div class="rows">' + s.items.map(rowHTML).join('') + '</div>';
    });
    h += '<div class="carte__foot"><span>Paiement sur place</span><span>Réservation en ligne 24h/24</span><span>Confirmation immédiate</span></div>';
    return h;
  }

  function activateTab(id, focus) {
    var tabs = $$('.tab');
    var idx = -1;
    tabs.forEach(function (t, i) {
      var on = t.id === 'tab-' + id;
      if (on) idx = i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (idx < 0) return;
    $$('.carte__panel').forEach(function (p) { p.classList.toggle('is-active', p.id === 'panel-' + id); });
    if (focus) tabs[idx].focus();
    if (motion) {
      var rows = $$('#panel-' + id + ' .row, #panel-' + id + ' .panel__top, #panel-' + id + ' .panel__note');
      gsap.fromTo(rows, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .035, ease: 'power3.out', clearProps: 'transform,opacity' });
    }
    if (nav && nav.scrollTo && window.matchMedia(MOBILE).matches) {
      nav.scrollTo({ left: tabs[idx].offsetLeft - 20, behavior: 'smooth' });
    }
  }

  var nav = $('#carte-nav');
  function renderCarte() {
    var panels = $('#carte-panels');
    if (!nav || !panels) return;
    CARTE.forEach(function (g, i) {
      var tab = document.createElement('button');
      tab.className = 'tab'; tab.type = 'button'; tab.id = 'tab-' + g.id;
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', 'panel-' + g.id);
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false'); tab.tabIndex = i === 0 ? 0 : -1;
      tab.innerHTML = '<span>' + pad(i + 1) + '</span>' + g.tab.replace('&', '&amp;');
      tab.addEventListener('click', function () { activateTab(g.id); });
      nav.appendChild(tab);
      var p = document.createElement('div');
      p.className = 'carte__panel' + (i === 0 ? ' is-active' : '');
      p.id = 'panel-' + g.id; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', tab.id);
      p.innerHTML = panelHTML(g);
      panels.appendChild(p);
    });
    nav.addEventListener('keydown', function (e) {
      var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (!keys[e.key]) return;
      e.preventDefault();
      var cur = CARTE.findIndex(function (g) { return $('#tab-' + g.id).getAttribute('aria-selected') === 'true'; });
      var next = (cur + keys[e.key] + CARTE.length) % CARTE.length;
      activateTab(CARTE[next].id, true);
    });
  }

  /* =====================================================================
     2. HORAIRES / OUVERT MAINTENANT
     ===================================================================== */
  var HOURS = { 1: [600, 1140], 2: [600, 1065], 3: [600, 1140], 4: [600, 1065], 5: [600, 1140] };
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function parisNow() {
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      return { d: map[o.weekday], m: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function fmtH(m) { var h = Math.floor(m / 60), mi = m % 60; return mi ? h + 'h' + pad(mi) : h + 'h'; }
  function openInfo() {
    var now = parisNow(), t = HOURS[now.d];
    if (t && now.m >= t[0] && now.m < t[1]) return { open: true, day: now.d, text: 'Ouvert · jusqu\'à ' + fmtH(t[1]) };
    if (t && now.m < t[0]) return { open: false, day: now.d, text: 'Fermé · ouvre à ' + fmtH(t[0]) };
    for (var i = 1; i <= 7; i++) {
      var nd = (now.d + i) % 7;
      if (HOURS[nd]) return { open: false, day: now.d, text: 'Fermé · ouvre ' + (i === 1 ? 'demain' : DAYS[nd]) + ' à ' + fmtH(HOURS[nd][0]) };
    }
    return { open: false, day: now.d, text: 'Fermé' };
  }
  function initStatus() {
    var info = openInfo();
    $$('[data-status],[data-status-long]').forEach(function (el) {
      el.textContent = info.text + (el.hasAttribute('data-status') ? ' · réservation 24h/24' : '');
      el.classList.toggle('is-closed', !info.open);
    });
    $$('[data-hours] li').forEach(function (li) { if (+li.dataset.d === info.day) li.classList.add('is-today'); });
  }

  /* =====================================================================
     3. SMS PRÉ-REMPLI (prestations sur appel) — aucun service tiers
     ===================================================================== */
  function initSms() {
    var form = $('#sms-form');
    if (!form) return;
    var note = document.createElement('p');
    note.setAttribute('aria-live', 'polite'); note.style.cssText = 'font-size:.85rem;text-align:center;color:var(--terre);font-weight:600;min-height:1.2em';
    form.appendChild(note);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var what = $('#sms-what').value, when = $('#sms-when').value.trim(), name = $('#sms-name').value.trim();
      var body = 'Bonjour Naïma, ' + (name ? 'c\'est ' + name + '. ' : '') + 'Je souhaiterais ' + what + '.' + (when ? ' Mes disponibilités : ' + when + '.' : '') + ' Merci !';
      var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!mobile && navigator.clipboard) {
        navigator.clipboard.writeText(body).then(function () { note.textContent = 'Message copié : envoyez-le par SMS au ' + TEL_LABEL + '.'; }, function () { note.textContent = 'Envoyez ce message au ' + TEL_LABEL + ' : ' + body; });
      } else { note.textContent = ''; }
      window.location.href = 'sms:' + TEL + '?&body=' + encodeURIComponent(body);
    });
  }

  /* =====================================================================
     4. VISIONNEUSE PHOTO
     ===================================================================== */
  function initLightbox() {
    var lb = $('#lb'), tiles = $$('.tile');
    if (!lb || !tiles.length || typeof lb.showModal !== 'function') return;
    var img = $('#lb-img'), cap = $('#lb-cap'), idx = 0;
    function show(i) {
      idx = (i + tiles.length) % tiles.length;
      var t = tiles[idx], im = $('img', t);
      img.src = im.currentSrc || im.src; img.alt = im.alt;
      cap.innerHTML = t.dataset.cap + '<small>' + (idx + 1) + ' / ' + tiles.length + '</small>';
    }
    tiles.forEach(function (t, i) {
      t.addEventListener('click', function () {
        show(i); lb.showModal();
        if (lenis) lenis.stop(); else html.style.overflow = 'hidden';
      });
    });
    lb.addEventListener('close', function () { if (lenis) lenis.start(); else html.style.overflow = ''; });
    $('#lb-close').addEventListener('click', function () { lb.close(); });
    $('#lb-prev').addEventListener('click', function () { show(idx - 1); });
    $('#lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb__inner')) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* =====================================================================
     5. MENU MOBILE + ANCRES
     ===================================================================== */
  var header = $('#header'), burger = $('#burger'), menu = $('#menu');

  function openMenu() {
    menuOpen = true;
    menu.style.visibility = 'visible'; menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fermer le menu');
    header.classList.add('menu-open'); header.classList.remove('is-hidden');
    if (lenis) lenis.stop(); else html.style.overflow = 'hidden';
    if (motion) {
      gsap.killTweensOf(menu);
      gsap.fromTo(menu, { clipPath: 'circle(0px at calc(100% - 44px) 40px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 40px)', duration: 1, ease: 'power4.inOut' });
      gsap.fromTo('.menu li a', { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: .07, delay: .3 });
      gsap.fromTo('.menu__foot', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .9, delay: .8, ease: 'power3.out' });
    } else { menu.style.clipPath = 'none'; }
  }
  function closeMenu(instant) {
    if (!menuOpen) return;
    menuOpen = false;
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu');
    header.classList.remove('menu-open');
    if (lenis) lenis.start(); else html.style.overflow = '';
    var done = function () { menu.style.visibility = 'hidden'; menu.setAttribute('aria-hidden', 'true'); };
    if (motion && !instant) {
      gsap.to(menu, { clipPath: 'circle(0px at calc(100% - 44px) 40px)', duration: .8, ease: 'power4.inOut', onComplete: done });
    } else { menu.style.clipPath = 'circle(0px at calc(100% - 44px) 40px)'; done(); }
  }
  function goTo(hash) {
    var el = $(hash);
    if (!el) return;
    var y = anchorStart[hash] ? anchorStart[hash]() : el.getBoundingClientRect().top + window.pageYOffset - 70;
    if (lenis) lenis.scrollTo(y, { duration: 1.7, easing: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; } });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  function initNavigation() {
    if (burger) burger.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var h = a.getAttribute('href');
        if (!h || h.length < 2 || !$(h)) return;
        e.preventDefault();
        var tab = a.getAttribute('data-tab');
        if (tab) activateTab(tab);
        if (menuOpen) { closeMenu(); setTimeout(function () { goTo(h); }, 420); } else goTo(h);
      });
    });
    var logo = $('.logo');
    if (logo) logo.addEventListener('click', function (e) { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* =====================================================================
     6. TEXTE DÉCOUPÉ (masque qui monte)
     ===================================================================== */
  function splitText(el, mode) {
    if (el._parts) return el._parts;
    var parts = [];
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'sw'; w.setAttribute('aria-hidden', 'true');
            if (mode === 'chars') {
              Array.from(tok).forEach(function (ch) { var c = document.createElement('span'); c.className = 'sc'; c.textContent = ch; w.appendChild(c); parts.push(c); });
            } else {
              var i = document.createElement('span'); i.className = 'si'; i.textContent = tok; w.appendChild(i); parts.push(i);
            }
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') { walk(child); }
      });
    })(el);
    el._parts = parts;
    return parts;
  }

  /* =====================================================================
     7. MOUVEMENT
     ===================================================================== */
  var io;
  function onView(el, fn) {
    el._reveal = fn;
    io.observe(el);
  }

  function initScrollEngine() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        if (en.target._reveal) en.target._reveal();
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });
  }

  function videoReady() {
    return new Promise(function (res) {
      var v = $('.hero__video');
      if (!v || v.readyState >= 3) return res();
      v.addEventListener('canplay', function () { res(); }, { once: true });
      v.addEventListener('error', function () { res(); }, { once: true });
      setTimeout(res, 2400);
    });
  }

  var heroChars = [];
  function prepareHero() {
    heroChars = splitText($('.hero h1'), 'chars');
    gsap.set(heroChars, { yPercent: 118, rotate: 6 });
    gsap.set('.hero__eyebrow', { opacity: 0, y: 20 });
    gsap.set('.hero__lead', { opacity: 0, y: 30 });
    gsap.set('.hero__cta .btn', { opacity: 0, y: 34 });
    gsap.set('.hero__arch', { yPercent: 34, opacity: 0, rotate: 5 });
    gsap.set('.hero__sun', { scale: .7, opacity: 0 });
    gsap.set('.hero__bar', { opacity: 0, y: 16 });
    gsap.set('.header', { yPercent: -120 });
    gsap.set('.hero__video', { scale: 1.3 });
  }
  function heroIn() {
    var t = gsap.timeline();
    t.to('.hero__video', { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
      .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.5, ease: 'power4.out', stagger: .035 }, .1)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, .35)
      .to('.hero__lead', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, .75)
      .to('.hero__cta .btn', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .1, clearProps: 'opacity' }, .9)
      .to('.hero__arch', { yPercent: 0, opacity: 1, rotate: 0, duration: 1.8, ease: 'expo.out' }, .5)
      .to('.hero__sun', { scale: 1, opacity: 1, duration: 2.2, ease: 'expo.out' }, .2)
      .to('.hero__bar', { opacity: 1, y: 0, duration: 1 }, 1.2)
      .to('.header', { yPercent: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform' }, .9);
    return t;
  }

  function runLoader() {
    var loader = $('.loader');
    if (!loader) { heroIn(); return; }
    prepareHero();
    if (document.hidden) {
      /* onglet ouvert en arrière-plan : les animations sont figées par le navigateur, on saute le préchargeur */
      loader.remove(); html.classList.remove('is-loading'); document.body.classList.remove('is-loading');
      heroIn();
      return;
    }
    if (lenis) lenis.stop();
    var num = $('.loader__num'), bar = $('.loader__bar i'), st = { v: 0 };
    gsap.timeline()
      .to('.loader__mark circle', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
      .to('.loader__mark text', { opacity: 1, duration: .9, ease: 'power2.out' }, .7)
      .from('.loader__name', { y: 16, opacity: 0, duration: .9, ease: 'power3.out' }, .5);
    var progressDone = new Promise(function (resolve) {
      gsap.to(st, { v: 100, duration: 2.2, ease: 'power2.inOut',
        onUpdate: function () { num.textContent = Math.round(st.v); gsap.set(bar, { scaleX: st.v / 100 }); },
        onComplete: resolve });
    });
    var assets = Promise.race([Promise.all([(document.fonts && document.fonts.ready) || Promise.resolve(), videoReady()]), wait(3000)]);
    Promise.all([progressDone, assets]).then(function () {
      var ex = gsap.timeline({ onComplete: function () {
        loader.remove(); html.classList.remove('is-loading'); document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      } });
      ex.to('.loader__inner, .loader__count, .loader__bar', { opacity: 0, y: -30, duration: .6, ease: 'power3.in', stagger: .05 })
        .to('.loader__panel', { yPercent: -112, duration: 1.3, ease: 'expo.inOut' }, '-=.15')
        .add(heroIn, '-=1.05');
    });
  }

  /* ---- Effets globaux ---- */
  function initProgressAndHeader() {
    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        header.classList.toggle('is-solid', y > 40);
        if (menuOpen) return;
        if (y > 420 && self.direction === 1) header.classList.add('is-hidden');
        else if (self.direction === -1 || y <= 420) header.classList.remove('is-hidden');
      }
    });
    var dock = $('#dock');
    if (dock) ScrollTrigger.create({ trigger: '.hero', start: 'bottom 45%', onEnter: function () { dock.classList.add('is-in'); }, onLeaveBack: function () { dock.classList.remove('is-in'); } });
  }

  function initHeroParallax() {
    var t = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__video', { yPercent: 14, ease: 'none', scrollTrigger: t });
    gsap.to('.hero__sun', { y: -140, ease: 'none', scrollTrigger: t });
    gsap.to('.hero__arch', { y: -190, ease: 'none', scrollTrigger: t });
    gsap.to('.hero__content', { y: -90, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '72% top', scrub: true } });
  }

  function initReveals() {
    $$('[data-split]').forEach(function (el) {
      var parts = splitText(el, 'words');
      gsap.set(parts, { yPercent: 118, rotate: 3 });
      onView(el, function () { gsap.to(parts, { yPercent: 0, rotate: 0, duration: 1.25, ease: 'power4.out', stagger: .05 }); });
    });
    $$('[data-reveal]').forEach(function (el) {
      gsap.set(el, { y: 50, opacity: 0 });
      onView(el, function () { gsap.to(el, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }); });
    });
    $$('[data-stagger]').forEach(function (el) {
      var kids = Array.prototype.slice.call(el.children);
      gsap.set(kids, { y: 40, opacity: 0 });
      onView(el, function () { gsap.to(kids, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: .09 }); });
    });
    $$('[data-reveal-img]').forEach(function (el) {
      /* on observe le parent : un élément entièrement rogné par clip-path n'est jamais « visible » pour l'IntersectionObserver */
      gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
      onView(el.parentElement, function () { gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out' }); });
    });
    $$('.eyebrow:not(.hero__eyebrow)').forEach(function (el) {
      gsap.set(el, { opacity: 0, x: -24 });
      onView(el, function () { gsap.to(el, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }); });
    });
    // Parallax léger des petites vignettes
    $$('[data-speed]').forEach(function (el) {
      gsap.to(el, { yPercent: parseFloat(el.dataset.speed), ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // Les images bougent dans leur cadre
    $$('.tile img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // Pied de page : grand NAÏMA qui monte lettre par lettre
    var big = $('[data-footer-big]');
    if (big) {
      var chars = splitText(big, 'chars');
      gsap.set(chars, { yPercent: 105 });
      onView(big, function () { gsap.to(chars, { yPercent: 0, duration: 1.6, ease: 'power4.out', stagger: .09 }); });
    }
  }

  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), sup = $('sup', el);
      var o = { v: 0 };
      var write = function () {
        var s = o.v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        el.textContent = s;
        if (sup) { el.appendChild(sup); }
      };
      write();
      onView(el, function () { gsap.to(o, { v: end, duration: 2.4, ease: 'power3.out', onUpdate: write }); });
    });
  }

  function initMarquee() {
    var sec = $('[data-marquee]');
    if (!sec) return;
    var rows = $$('.marquee__row', sec).map(function (row) {
      var track = $('.marquee__track', row);
      track.appendChild($('.marquee__group', track).cloneNode(true));
      return { track: track, dir: parseFloat(row.dataset.dir), pos: parseFloat(row.dataset.dir) === 1 ? -50 : 0 };
    });
    var lastY = window.pageYOffset, vel = 0, boost = 0, dirSign = 1, visible = true;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '200px' }).observe(sec);
    gsap.ticker.add(function (time, dtMs) {
      var dt = Math.min(dtMs, 64) / 1000;
      var y = window.pageYOffset, dy = y - lastY; lastY = y;
      if (!visible) return;
      var v = dy / Math.max(dt, .001);
      vel += (v - vel) * .12;
      if (Math.abs(vel) > 30) dirSign = vel > 0 ? 1 : -1;
      boost += (Math.min(Math.abs(vel) / 70, 16) - boost) * .1;
      var skew = Math.max(-7, Math.min(7, vel / -140));
      rows.forEach(function (r) {
        r.pos += r.dir * (1.45 + boost) * dirSign * dt;
        if (r.pos <= -50) r.pos += 50;
        if (r.pos > 0) r.pos -= 50;
        r.track.style.transform = 'translate3d(' + r.pos + '%,0,0) skewX(' + skew + 'deg)';
      });
    });
  }

  function initTiltAndMagnet() {
    if (!fine) return;
    $$('[data-tilt], .tile').forEach(function (el) {
      var media = $('.card__media', el) || el;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(el, { rotateY: (px - .5) * 14, rotateX: -(py - .5) * 14, transformPerspective: 900, duration: .6, ease: 'power3.out', overwrite: 'auto' });
        media.style.setProperty('--mx', (px * 100) + '%'); media.style.setProperty('--my', (py * 100) + '%');
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,.6)', overwrite: 'auto' }); });
    });
    $$('.magnetic').forEach(function (el) {
      var inner = $('.t', el);
      var qx = gsap.quickTo(el, 'x', { duration: .7, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: .7, ease: 'power3.out' });
      var ix = inner && gsap.quickTo(inner, 'x', { duration: .7, ease: 'power3.out' }), iy = inner && gsap.quickTo(inner, 'y', { duration: .7, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        qx(x * .3); qy(y * .45); if (inner) { ix(x * .1); iy(y * .15); }
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); if (inner) { ix(0); iy(0); } });
    });
  }

  function initCursor() {
    var cur = $('.cursor');
    if (!cur || !fine) return;
    var xTo = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    var label = $('span', cur);
    window.addEventListener('pointermove', function (e) { xTo(e.clientX); yTo(e.clientY); cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest('a,button,summary,select,input,[data-cursor],.tile,.card') : null;
      cur.classList.remove('is-link', 'is-label');
      if (!t) return;
      var txt = t.dataset.cursor || (t.classList.contains('tile') ? 'Voir' : (t.classList.contains('card') ? 'Tarifs' : ''));
      if (txt) { label.textContent = txt; cur.classList.add('is-label'); } else cur.classList.add('is-link');
    });
  }

  function initRail() {
    var rail = $('[data-rail]'), track = $('[data-rtrack]');
    if (!rail || !track) return;
    Array.prototype.slice.call(track.children).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
    var x = 0, vel = 0, dragging = false, startX = 0, startPos = 0, lastX = 0, hover = false, visible = false;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '100px' }).observe(rail);
    rail.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    rail.addEventListener('pointerleave', function () { hover = false; });
    rail.addEventListener('pointerdown', function (e) {
      dragging = true; startX = lastX = e.clientX; startPos = x; vel = 0; rail.classList.add('is-drag');
      try { rail.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });
    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      x = startPos + (e.clientX - startX); vel = (e.clientX - lastX) * 60; lastX = e.clientX;
    });
    var end = function () { dragging = false; rail.classList.remove('is-drag'); };
    rail.addEventListener('pointerup', end); rail.addEventListener('pointercancel', end);
    gsap.ticker.add(function (time, dtMs) {
      if (!visible) return;
      var dt = Math.min(dtMs, 64) / 1000, w = track.scrollWidth / 2;
      if (!dragging) {
        x += vel * dt; vel *= .93;
        if (!hover) x -= 46 * dt;
      }
      if (w > 0) { if (x <= -w) x += w; if (x > 0) x -= w; }
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  }

  function initSalon() {
    var stage = $('.salon__stage');
    if (!stage) return;
    gsap.fromTo('[data-salon-big]', { clipPath: 'inset(16% 20% 0% 20% round 340px 340px 0px 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'none', scrollTrigger: { trigger: stage, start: 'top 88%', end: 'top 12%', scrub: true } });
    gsap.fromTo('[data-salon-big] img', { scale: 1.28, yPercent: -4 }, { scale: 1.02, yPercent: 4, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---- Sections épinglées (desktop) et versions allégées (mobile) ---- */
  function initPinned() {
    var mm = gsap.matchMedia();

    mm.add(DESKTOP, function () {
      /* Savoir-faire : storytelling pas à pas */
      var steps = $$('.story .step'), imgs = $$('.story__frame .story__img'), dots = $$('.story__dots i'), label = $('[data-story-n]');
      var n = steps.length, total = n - .5;
      gsap.set(steps.slice(1), { autoAlpha: 0, y: 40 });
      gsap.set(imgs.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      dots[0].classList.add('is-done');
      var last = 0;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.story__pin', start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * n * .85); },
          pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            var i = Math.max(0, Math.min(n - 1, Math.round(self.progress * total)));
            if (i !== last) { last = i; label.textContent = pad(i + 1); dots.forEach(function (d, j) { d.classList.toggle('is-done', j <= i); }); }
          }
        }
      });
      for (var i = 1; i < n; i++) {
        tl.to(steps[i - 1], { autoAlpha: 0, y: -40, duration: .3 }, i - .62)
          .to(steps[i], { autoAlpha: 1, y: 0, duration: .35 }, i - .32)
          .to(imgs[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: .6 }, i - .6)
          .fromTo($('img', imgs[i]), { scale: 1.3 }, { scale: 1, duration: .6 }, i - .6);
      }
      tl.to({}, { duration: .5 }, n - 1);
      var st = tl.scrollTrigger;
      anchorStart['#savoir-faire'] = function () { return st.start; };

      /* Prestations : défilement horizontal piloté par le scroll vertical */
      var sec = $('.services'), track = $('[data-track]'), bar = $('.services__progress i');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); }
        }
      });
      anchorStart['#prestations'] = function () { return tween.scrollTrigger.start; };
      $$('.card__media img').forEach(function (img) {
        gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: img.closest('.card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });

    mm.add(MOBILE, function () {
      $$('.step').forEach(function (s) {
        gsap.set(s, { y: 50, opacity: 0 });
        onView(s, function () { gsap.to(s, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }); });
      });
      $$('.card').forEach(function (c, i) {
        gsap.set(c, { opacity: 0, x: 40 });
        onView(c, function () { gsap.to(c, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: Math.min(i, 2) * .08 }); });
      });
    });
  }

  /* =====================================================================
     8. DÉMARRAGE
     ===================================================================== */
  /* Vidéo d'accueil : HD sur grand écran, version légère sur mobile / économie de données ; rien si mouvement réduit */
  function initVideo() {
    var v = $('.hero__video');
    if (!v) return;
    if (reduce) { v.removeAttribute('autoplay'); v.removeAttribute('src'); v.load(); return; }
    var conn = navigator.connection || {};
    var light = window.innerWidth < 1000 || conn.saveData || /(^|-)(slow-)?2g$/.test(conn.effectiveType || '');
    v.src = light ? v.dataset.sd : v.dataset.hd;
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* lecture automatique refusée : l'image de secours reste affichée */ });
  }

  function boot() {
    initVideo();
    renderCarte();
    initStatus();
    initSms();
    initNavigation();

    if (!motion) {
      html.classList.add('no-motion');
      var l = $('.loader'); if (l) l.remove();
      html.classList.remove('is-loading'); document.body.classList.remove('is-loading');
      menu.style.clipPath = 'circle(0px at calc(100% - 44px) 40px)';
      var dock = $('#dock'); if (dock) dock.classList.add('is-in');
      initLightbox();
      return;
    }

    initScrollEngine();
    initLightbox();
    initReveals();
    initCounters();
    initMarquee();
    initProgressAndHeader();
    initHeroParallax();
    initSalon();
    initPinned();
    initTiltAndMagnet();
    initCursor();
    initRail();
    runLoader();

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
