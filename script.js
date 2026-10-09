window.__ok = 1;
/* 1. Foto mancanti: nasconde la cornice, così non restano riquadri vuoti */
document.querySelectorAll('.frame img').forEach(function (img) {
  function hide() { img.closest('.frame').hidden = true; }
  img.addEventListener('error', hide);
  if (img.complete && img.naturalWidth === 0) hide();
});

/* 2. Foto ingrandita al clic (solo nelle pagine con gallerie) */
var lb = document.getElementById('lightbox');
if (lb) {
  var lbImg = lb.querySelector('img');
  document.querySelectorAll('button.frame').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.showModal();
    });
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('x')) lb.close();
  });
}

/* 3. Aperto o chiuso adesso, con l'ora italiana */
(function () {
  var statusEl = document.getElementById('status');
  var table = document.querySelector('.hours');
  if (!statusEl && !table) return;

  var morning = [540, 780], evening = [990, 1200];
  var HOURS = { 0: [], 1: [morning, evening], 2: [morning, evening], 3: [morning, evening],
                4: [morning, evening], 5: [morning, evening], 6: [morning] };
  var NAMES = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var WEEK = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  var parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  var d, h, m;
  parts.forEach(function (p) {
    if (p.type === 'weekday') d = WEEK[p.value];
    if (p.type === 'hour') h = parseInt(p.value, 10);
    if (p.type === 'minute') m = parseInt(p.value, 10);
  });
  var now = h * 60 + m;

  if (statusEl) {
    var text = '', state = 'closed', slots = HOURS[d], i;
    for (i = 0; i < slots.length; i++) {
      if (now >= slots[i][0] && now < slots[i][1]) {
        text = 'Aperto ora, chiude alle ' + fmt(slots[i][1]);
        state = 'open';
        break;
      }
    }
    if (!text) {
      for (i = 0; i < slots.length; i++) {
        if (now < slots[i][0]) { text = 'Chiuso ora, riapre oggi alle ' + fmt(slots[i][0]); break; }
      }
    }
    if (!text) {
      for (var k = 1; k <= 7; k++) {
        var nd = (d + k) % 7;
        if (HOURS[nd].length) {
          text = 'Chiuso ora, riapre ' + (k === 1 ? 'domani' : NAMES[nd]) + ' alle ' + fmt(HOURS[nd][0][0]);
          break;
        }
      }
    }
    statusEl.textContent = text;
    statusEl.dataset.state = state;
  }

  var row = document.querySelector('.hours tr[data-day="' + d + '"]');
  if (row) row.classList.add('today');
})();

/* 4. Comparsa allo scorrimento: foto, testi e linee a punto cucito */
(function () {
  var items = document.querySelectorAll('.rv, .fx, .rs');
  if (!items.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.style.setProperty('--d', (n * 0.09) + 's');
      n++;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

/* Lo scorrimento alle sezioni tiene conto dell'altezza reale della testata. */
(function () {
  var header = document.querySelector('header');
  if (!header) return;
  function updateHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', Math.ceil(header.getBoundingClientRect().height) + 'px');
  }
  updateHeaderHeight();
  if ('ResizeObserver' in window) {
    new ResizeObserver(updateHeaderHeight).observe(header);
  } else {
    window.addEventListener('resize', updateHeaderHeight);
  }
})();

/* Menu compatto solo su mobile. Logo, nome e menu desktop restano invariati. */
(function () {
  'use strict';
  var header = document.querySelector('header');
  var bar = header && header.querySelector('.bar');
  var nav = bar && bar.querySelector('nav');
  if (!nav || bar.querySelector('.cs-menu-toggle')) return;
  var mobile = window.matchMedia('(max-width: 700px)');
  var button = document.createElement('button');
  var originalCall = bar.querySelector(':scope > a.btn');
  if (!nav.id) nav.id = 'cs-mobile-navigation';
  nav.classList.add('cs-mobile-navigation');
  nav.querySelectorAll('a').forEach(function (link) {
    if ((link.getAttribute('href') || '').split('#')[1] === 'chi-siamo') link.classList.add('cs-mobile-about');
  });
  button.type = 'button';
  button.className = 'cs-menu-toggle';
  button.setAttribute('aria-label', 'Apri il menu');
  button.setAttribute('aria-controls', nav.id);
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  if (originalCall) {
    originalCall.classList.add('cs-header-call');
    var call = originalCall.cloneNode(true);
    call.removeAttribute('id');
    call.classList.remove('cs-header-call');
    call.classList.add('cs-mobile-call');
    nav.appendChild(call);
  }
  var style = document.createElement('style');
  style.id = 'cs-mobile-menu-style';
  style.textContent = `
.cs-menu-toggle, .cs-mobile-call { display: none !important; }
@media (max-width: 700px) {
  html { scroll-padding-top: calc(var(--cs-mobile-header-height, 100px) + 16px); }
  header .bar { flex-wrap: nowrap; gap: .4rem; }
  header .bar > .cs-header-call { display: none !important; }
  header .bar > .cs-menu-toggle {
    display: flex !important; flex-direction: column; align-items: center; justify-content: center;
    gap: 5px; flex: 0 0 44px; width: 44px; height: 44px; min-height: 44px;
    order: 2; margin-left: auto; padding: 10px; border: 1px solid var(--line);
    border-radius: 10px; color: var(--ink); background: transparent; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .cs-menu-toggle span {
    display: block; width: 22px; height: 2px; flex: 0 0 2px;
    border-radius: 2px; background: currentColor; transition: transform .2s ease, opacity .2s ease;
  }
  .cs-menu-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .cs-menu-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .cs-menu-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  header .bar nav.cs-mobile-navigation {
    display: none; position: absolute; top: calc(100% + 8px); left: 1rem; right: 1rem;
    width: auto; max-width: none; margin: 0; padding: .55rem; gap: 0;
    flex-direction: column; flex-wrap: nowrap; align-items: stretch; justify-content: flex-start;
    background: var(--paper); color: var(--ink); border: 1px solid var(--line);
    border-radius: 14px; box-shadow: 0 12px 32px rgba(0,0,0,.14);
    max-height: calc(100vh - var(--cs-mobile-header-height, 100px) - 32px);
    max-height: calc(100dvh - var(--cs-mobile-header-height, 100px) - 32px);
    overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
    white-space: normal; z-index: 60;
  }
  header .bar nav.cs-mobile-navigation.cs-menu-open {
    display: flex; animation: cs-menu-enter .18s ease-out;
  }
  header .bar nav.cs-mobile-navigation > a {
    display: flex; align-items: center; min-height: 44px; padding: .7rem 1rem;
    margin: 0; border: 0; border-radius: 8px; text-decoration: none;
    font-size: 1rem; line-height: 1.4;
  }
  header .bar nav.cs-mobile-navigation > a::after { display: none; }
  header .bar nav.cs-mobile-navigation > a:hover,
  header .bar nav.cs-mobile-navigation > a[aria-current="page"] { background: var(--mist); }
  header .bar nav.cs-mobile-navigation > a.cs-mobile-about { display: none !important; }
  header .bar nav.cs-mobile-navigation > a.cs-mobile-call {
    display: flex !important; justify-content: center; margin-top: .5rem;
    background: var(--thread-strong); color: var(--paper); border-radius: 999px;
  }
  header .bar nav.cs-mobile-navigation > a.cs-mobile-call:hover { background: var(--ink); }
}
@keyframes cs-menu-enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .cs-menu-toggle span { transition: none; }
  header .bar nav.cs-mobile-navigation.cs-menu-open { animation: none; }
}`;
  document.head.appendChild(style);
  bar.insertBefore(button, nav);
  function setOpen(open, restoreFocus) {
    nav.classList.toggle('cs-menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (!open && restoreFocus && mobile.matches) button.focus();
  }
  button.addEventListener('click', function () {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a') && mobile.matches) setOpen(false);
  });
  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  header.addEventListener('focusout', function () {
    window.setTimeout(function () {
      if (!header.contains(document.activeElement)) setOpen(false);
    }, 0);
  });
  function updateHeaderHeight() {
    document.documentElement.style.setProperty('--cs-mobile-header-height', Math.ceil(header.getBoundingClientRect().height) + 'px');
  }
  function onViewportChange() { setOpen(false); updateHeaderHeight(); }
  if (mobile.addEventListener) mobile.addEventListener('change', onViewportChange);
  else if (mobile.addListener) mobile.addListener(onViewportChange);
  window.addEventListener('resize', updateHeaderHeight);
  if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);
  updateHeaderHeight();
})();
