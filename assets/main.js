/* =========================================================
   CAPTIA — interacciones del sitio
   ========================================================= */

/* ---------- Iconos (SVG simples) ---------- */
const ICONS = {
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>',
  diag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
  calc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/></svg>',
  close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  cal: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
};
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon] || ''; });

/* ---------- Menú móvil ---------- */
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ---------- Chat animado del hero ---------- */
const chatBody = document.getElementById('chat-body');
if (chatBody) {
  const CHAT = [
    { who: 'in',  t: 'Hola! Cuánto cuesta apuntarse?', h: '22:40' },
    { who: 'out', t: '¡Hola! 😊 Tenemos 8 clases al mes por 60 € y 10 clases al mes por 73 €. ¿Cuántos días a la semana te gustaría venir?', h: '22:40' },
    { who: 'in',  t: 'Unos 2 o 3, por la tarde', h: '22:41' },
    { who: 'out', t: 'Entonces te encaja la de 10 clases. ¿Te apetece venir a probar una clase gratis? Por la tarde hay clases a las 16:00 y a las 19:00.', h: '22:41' },
    { who: 'in',  t: 'Sí! El martes a las 19:00 me iría bien', h: '22:42' },
    { who: 'out', t: 'Perfecto. ¿Me dices tu nombre? Se lo paso a recepción para que te confirme la plaza del martes a las 19:00.', h: '22:42' },
    { who: 'in',  t: 'Laura Soler, gracias!', h: '22:43' }
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const add = el => { chatBody.appendChild(el); chatBody.scrollTop = chatBody.scrollHeight; };

  async function playChat() {
    chatBody.innerHTML = '';
    for (const m of CHAT) {
      if (m.who === 'out') {
        const typing = document.createElement('div');
        typing.className = 'msg typing';
        typing.innerHTML = '<i></i><i></i><i></i>';
        add(typing);
        await wait(1100);
        typing.remove();
      } else {
        await wait(900);
      }
      const el = document.createElement('div');
      el.className = 'msg ' + m.who;
      el.innerHTML = m.t + '<time>' + m.h + '</time>';
      add(el);
    }
    await wait(700);
    const chip = document.createElement('div');
    chip.className = 'booked';
    chip.innerHTML = ICONS.cal + ' Prueba martes 19:00 · enviada a recepción';
    add(chip);
    await wait(6000);
    playChat();
  }
  playChat();
}

/* ---------- FAQ (acordeón, uno abierto a la vez) ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      const a = item.querySelector('.faq-a');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* ---------- Diagnóstico Minuto Uno en pop-up (home) ---------- */
const diagModal = document.getElementById('diag-modal');
if (diagModal) {
  const open = () => { diagModal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { diagModal.classList.remove('open'); document.body.style.overflow = ''; };
  document.querySelectorAll('[data-open-diag]').forEach(b => b.addEventListener('click', open));
  diagModal.querySelector('.modal-close').addEventListener('click', close);
  diagModal.addEventListener('click', e => { if (e.target === diagModal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // Links a /#diagnostico (footer, campañas) abren el pop-up
  const checkHash = () => { if (location.hash === '#diagnostico') { open(); history.replaceState(null, '', location.pathname); } };
  window.addEventListener('hashchange', checkHash);
  checkHash();
}

/* ---------- Cómo funciona: las fases aparecen al hacer scroll ---------- */
(function () {
  const phases = document.querySelectorAll('.phase');
  if (!phases.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  phases.forEach(p => p.classList.add('reveal-ready'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
  phases.forEach(p => io.observe(p));
})();

/* ---------- Problema: tarjetas y línea de luz al hacer scroll ---------- */
(function () {
  const flow = document.querySelector('.flow');
  if (!flow) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  flow.classList.add('reveal-ready');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { flow.classList.add('in-view'); io.disconnect(); } });
  }, { threshold: 0.4 });
  io.observe(flow);
})();

/* ---------- Qué incluye: tarjetas por filas de tres al hacer scroll ---------- */
(function () {
  const grid = document.querySelector('.cards');
  if (!grid) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = [...grid.querySelectorAll('.card')];
  grid.classList.add('reveal-ready');
  // Cuando aparece la primera tarjeta de una fila, se muestra la fila completa
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 3;
      const i = cards.indexOf(e.target);
      const start = i - (i % cols);
      cards.slice(start, start + cols).forEach(c => { c.classList.add('in-view'); io.unobserve(c); });
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
  cards.forEach(c => io.observe(c));
})();

/* ---------- Diagnóstico (celular): el botón del header baja hasta el diagnóstico ---------- */
document.querySelectorAll('[data-scroll-diag]').forEach(btn => btn.addEventListener('click', e => {
  const target = document.getElementById('diag-app');
  if (!target) return;
  e.preventDefault();
  const y = target.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: y, behavior: 'smooth' });
}));
