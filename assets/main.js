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

/* ---------- Bandeja animada del hero ---------- */
const inboxList = document.getElementById('inbox-list');
if (inboxList) {
  const CH = {
    wa: { label: 'WhatsApp', svg: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>' },
    ig: { label: 'Instagram', svg: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>' },
    mail: { label: 'Correo', svg: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>' },
    web: { label: 'Web', svg: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' }
  };
  // Cada conversación: llega el mensaje, el agente responde y cambia la etiqueta
  const ROWS = [
    { ch: 'wa', name: 'Laura Soler', time: '22:40', msg: '¿Cuánto cuesta apuntarse?', reply: 'Agente: 8 clases al mes por 60 €. ¿Cuántos días quieres venir?', tags: [['Nuevo', 'new'], ['Interesado', 'lead']] },
    { ch: 'ig', name: 'Marc Vidal', time: '22:52', msg: 'Feu classes de pilates a la tarda?', reply: 'Agent: Sí, dimarts i dijous a les 19:00. Vols provar-ne una?', tags: [['Nuevo', 'new'], ['Interesado', 'lead'], ['Prueba agendada', 'ok']] },
    { ch: 'mail', name: 'Jordi Puig · socio', time: '08:15', msg: 'Quiero darme de baja este mes.', reply: 'Agente: Claro, sin problema. ¿Te va mejor una pausa de un mes?', tags: [['Baja solicitada', 'alert'], ['Motivo: viaje', 'muted']] },
    { ch: 'web', name: 'Ana Ruiz', time: '09:03', msg: '¿Tenéis parking para socios?', reply: 'Agente: Te paso con recepción para confirmártelo.', tags: [['Nuevo', 'new'], ['Pasado a recepción', 'muted']] }
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const icon = c => `<span class="ib-ch ib-${c}" title="${CH[c].label}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CH[c].svg}</svg></span>`;

  async function playInbox() {
    inboxList.innerHTML = '';
    for (const r of ROWS) {
      const li = document.createElement('li');
      li.className = 'ib-row unread';
      li.innerHTML = `${icon(r.ch)}
        <div class="ib-main">
          <div class="ib-top"><strong>${r.name}</strong><time>${r.time}</time></div>
          <p class="ib-msg">${r.msg}</p>
          <div class="ib-tags"><span class="ib-tag ${r.tags[0][1]}">${r.tags[0][0]}</span></div>
        </div>`;
      inboxList.prepend(li);
      await wait(1100);
      const msg = li.querySelector('.ib-msg');
      msg.innerHTML = '<span class="ib-typing"><i></i><i></i><i></i></span> El agente está respondiendo…';
      await wait(1200);
      msg.textContent = r.reply;
      msg.classList.add('replied');
      li.classList.remove('unread');
      const tags = li.querySelector('.ib-tags');
      for (const t of r.tags.slice(1)) {
        await wait(700);
        tags.innerHTML = `<span class="ib-tag ${t[1]} pop">${t[0]}</span>`;
      }
      await wait(700);
    }
    await wait(5000);
    playInbox();
  }
  playInbox();
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
document.querySelectorAll('.cards').forEach(grid => {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = [...grid.querySelectorAll('.card')];
  grid.classList.add('reveal-ready');
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
});

/* ---------- Diagnóstico (celular): el botón del header baja hasta el diagnóstico ---------- */
document.querySelectorAll('[data-scroll-diag]').forEach(btn => btn.addEventListener('click', e => {
  const target = document.getElementById('diag-app');
  if (!target) return;
  e.preventDefault();
  const y = target.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: y, behavior: 'smooth' });
}));
