/* Enhancements are optional; navigation, FAQs and contact links work without JS. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.documentElement.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
    reduced.addEventListener('change', function (event) {
      if (event.matches) { document.documentElement.classList.remove('motion-ready'); observer.disconnect(); }
    });
  }
  var progress = document.querySelector('.reading-progress span');
  var pending = false;
  function updateProgress() {
    var available = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (available > 0 ? Math.max(0, Math.min(1, window.scrollY / available)) : 0) + ')';
    pending = false;
  }
  window.addEventListener('scroll', function () { if (!pending) { pending = true; window.requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  var choices = {
    iniziare: ['Il primo passo', 'Partiamo dai lavori più semplici.', 'Orli, piccole riparazioni o i tuoi primi accessori: raccontaci cosa vuoi cucire. Chiedi di confrontare i comandi, l’infilatura e lo spazio di lavoro dei modelli in negozio.', 'Ciao, vorrei informazioni su una macchina per iniziare a cucire.'],
    creare: ['Il prossimo progetto', 'Più spazio alle tue idee.', 'Quali tessuti usi e quali lavori vuoi realizzare? Confronta il piano di lavoro, i punti e le regolazioni dei modelli che ti interessano. Porta un esempio del progetto in negozio.', 'Ciao, cucio già e vorrei confrontare le macchine disponibili per i miei progetti.'],
    ricamare: ['Dettagli che fanno la differenza', 'Ricami o rifiniture? Partiamo da qui.', 'Cucito e ricamo, oppure una taglia e cuci per le rifiniture: sono esigenze diverse. Raccontaci cosa vuoi ottenere e chiedi informazioni sulle funzioni e sugli accessori del singolo modello.', 'Ciao, vorrei informazioni sulle macchine per ricamo o sulle taglia e cuci.']
  };
  document.querySelectorAll('[data-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      var selected = choices[button.dataset.choice];
      if (!selected) return;
      document.querySelectorAll('[data-choice]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      ['choice-kicker', 'choice-title', 'choice-text'].forEach(function (id, index) { document.getElementById(id).textContent = selected[index]; });
      document.getElementById('choice-contact').href = 'https://wa.me/393348676958?text=' + encodeURIComponent(selected[3]);
    });
  });
  var palettes = {
    delicata: { colors: ['#eadbc5', '#d69a9d', '#849c89', '#bccbd4'], text: 'Toni morbidi: crema, rosa e salvia, per un’ispirazione delicata.' },
    vivace: { colors: ['#e46b38', '#ad456a', '#ddb43f', '#568792'], text: 'Energia e contrasti: arancio, lampone, giallo e ottanio, per un’idea vivace.' },
    naturale: { colors: ['#d1b28f', '#aa704a', '#717c59', '#e7dfd1'], text: 'Ispirazione naturale: sabbia, terracotta, oliva e avorio.' }
  };
  document.querySelectorAll('[data-palette]').forEach(function (button) {
    button.addEventListener('click', function () {
      var palette = palettes[button.dataset.palette];
      if (!palette) return;
      document.querySelectorAll('[data-palette]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      document.querySelectorAll('.swatches span').forEach(function (swatch, index) { swatch.style.setProperty('--swatch', palette.colors[index]); });
      document.getElementById('palette-description').textContent = palette.text;
    });
  });
})();
