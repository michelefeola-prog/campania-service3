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
