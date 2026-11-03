/* =========================================================
   CAPTIA — interacciones del sitio
   ========================================================= */

/* ---------- Iconos (SVG simples) ---------- */
const ICONS = {
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>',
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
    { who: 'in',  t: 'Hola, me interesa la casa que tienen disponible en Chicureo.', h: '21:02' },
    { who: 'out', t: '¡Hola! En Chicureo tenemos casas disponibles desde 12.200 UF y 13.800 UF, ambas de 3 dormitorios. ¿Me indicas tu nombre y un contacto para registrar tu interés?', h: '21:02' },
    { who: 'in',  t: 'Carlos Pérez, cperez@mail.com, me interesa la de 12.200 UF.', h: '21:03' },
    { who: 'out', t: 'Excelente. ¿Cuentas con crédito hipotecario aprobado para este valor?', h: '21:03' },
    { who: 'in',  t: 'Sí, ya lo tengo aprobado.', h: '21:04' },
    { who: 'out', t: '¡Perfecto! Te propongo una visita para este lunes a las 9:00 AM para que conozcas la casa. ¿Te acomoda?', h: '21:04' },
    { who: 'in',  t: 'A las 9:00 me va bien, Gracias', h: '21:05' }
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
    chip.innerHTML = ICONS.cal + ' Visita agendada · lunes 9:00';
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

/* ---------- Calculadora de oportunidad ----------
   Los supuestos están aquí arriba para poder ajustarlos fácil.
   Cada opción tiene un valor que entra en la fórmula.            */
const CALC = {
  questions: [
    { q: '¿Cuántos leads nuevos recibe tu inmobiliaria al mes?', hint: 'Una estimación es suficiente.', key: 'leads',
      opts: [['Menos de 30', 20], ['Entre 30 y 75', 52.5], ['Entre 76 y 150', 113], ['Entre 151 y 300', 225], ['Más de 300', 400], ['No tengo el dato', 52.5]] },
    { q: '¿Cuánto tarda normalmente un lead en recibir la primera respuesta?', hint: 'Incluye noches y fines de semana.', key: 'slow',
      // % de leads diurnos que se enfrían por demora
      opts: [['Menos de 5 minutos', 0.05], ['Entre 5 y 15 minutos', 0.2], ['Entre 15 y 30 minutos', 0.3], ['Entre 30 minutos y 1 hora', 0.4], ['Más de 1 hora', 0.5], ['No tengo el dato', 0.3]] },
    { q: '¿Qué porcentaje de tus leads llega a una visita agendada?', hint: 'Consulta a visita agendada.', key: 'visit',
      opts: [['Menos del 5%', 0.04], ['Entre 5% y 10%', 0.075], ['Entre 10% y 15%', 0.125], ['Más del 15%', 0.18], ['No tengo el dato', 0.06]] },
    { q: '¿Qué parte de tus leads llega fuera del horario comercial (noche o fin de semana)?', hint: '', key: 'off',
      opts: [['Menos del 30%', 0.2], ['Entre 30% y 50%', 0.4], ['Entre 50% y 70%', 0.6], ['Más del 70%', 0.8], ['No tengo el dato', 0.62]] },
    { q: '¿Cuál es la comisión promedio por venta, en UF?', hint: '', key: 'comm',
      opts: [['Menos de 50 UF', 35], ['Entre 50 y 100 UF', 70], ['Entre 100 y 200 UF', 140], ['Más de 200 UF', 250], ['No tengo el dato', 70]] }
  ],
  offHoursLoss: 0.8,   // % de leads fuera de horario que se pierden sin respuesta inmediata
  visitToSale: 0.25    // % de visitas que terminan en venta
};

const modal = document.getElementById('calc-modal');
if (modal) {
  const box = modal.querySelector('.calc-content');
  let step = 0;
  let answers = {};

  const open = () => { step = 0; answers = {}; render(); modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };

  document.querySelectorAll('[data-open-calc]').forEach(b => b.addEventListener('click', open));
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // Abre la calculadora desde cualquier link a /#calcula
  const checkHash = () => { if (location.hash === '#calcula') { open(); history.replaceState(null, '', location.pathname); } };
  window.addEventListener('hashchange', checkHash);
  checkHash();

  function render() {
    const total = CALC.questions.length;
    if (step >= total) return renderResult();
    const Q = CALC.questions[step];
    const sel = answers[Q.key];
    box.innerHTML = `
      <div class="progress"><div style="width:${(step / total) * 100}%"></div></div>
      <div class="step-label">PREGUNTA ${step + 1} DE ${total}</div>
      <div class="q-title">${Q.q}</div>
      ${Q.hint ? `<div class="q-hint">${Q.hint}</div>` : '<div class="q-hint"></div>'}
      <div class="options">
        ${Q.opts.map((o, i) => `<button class="option ${sel === i ? 'selected' : ''}" data-i="${i}">${o[0]}</button>`).join('')}
      </div>
      <div class="calc-nav">
        ${step === 0 ? '<button class="btn-ghost" data-act="close">Cerrar</button>' : '<button class="btn-ghost" data-act="back">Atrás</button>'}
        <button class="btn" data-act="next" ${sel === undefined ? 'disabled' : ''}>${step === total - 1 ? 'Ver resultado' : 'Siguiente'}</button>
      </div>`;
    box.querySelectorAll('.option').forEach(b => b.addEventListener('click', () => { answers[Q.key] = +b.dataset.i; render(); }));
    box.querySelector('[data-act="next"]').addEventListener('click', () => { step++; render(); });
    const back = box.querySelector('[data-act="back"]');
    if (back) back.addEventListener('click', () => { step--; render(); });
    const cl = box.querySelector('[data-act="close"]');
    if (cl) cl.addEventListener('click', close);
  }

  function val(key) {
    const Q = CALC.questions.find(q => q.key === key);
    return Q.opts[answers[key]][1];
  }

  function renderResult() {
    const leads = val('leads');
    const off = val('off');
    const lostSlow = leads * (1 - off) * val('slow');
    const lostOff = leads * off * CALC.offHoursLoss;
    const lost = lostSlow + lostOff;
    const visits = lost * val('visit');
    const annualUF = visits * 12 * CALC.visitToSale * val('comm');
    const fmt = n => Math.round(n).toLocaleString('es-CL');

    box.innerHTML = `
      <div class="progress"><div style="width:100%"></div></div>
      <div class="step-label">TU OPORTUNIDAD ESTIMADA</div>
      <div class="result-hero">
        <small>Oportunidad anual estimada</small>
        <div class="big">${fmt(annualUF)} UF</div>
        <small>Leads perdidos hoy por respuesta lenta y fuera de horario.</small>
      </div>
      <div class="result-grid">
        <div><span>Leads perdidos al mes</span><strong>${fmt(lost)}</strong></div>
        <div><span>Visitas no agendadas al mes</span><strong>${fmt(visits)}</strong></div>
        <div><span>Se enfrían por respuesta lenta</span><strong>${fmt(lostSlow)} / mes</strong></div>
        <div><span>Se pierden fuera de horario</span><strong>${fmt(lostOff)} / mes</strong></div>
      </div>
      <p class="disclaimer">Estimación referencial basada en tus respuestas y en datos del rubro. No constituye una garantía de resultados.</p>
      <div class="calc-nav">
        <button class="btn-ghost" data-act="again">Calcular de nuevo</button>
        <a class="btn" href="/confirmacion-leadflow-inmo">Agenda tu demo</a>
      </div>`;
    box.querySelector('[data-act="again"]').addEventListener('click', () => { step = 0; answers = {}; render(); });
  }
}
