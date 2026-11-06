/* =========================================================
   CAPTIA — Diagnóstico Minuto Uno (lead magnet)
   Todo lo editable está en el objeto DIAG:
   - webhook: URL del "Inbound Webhook" del workflow de GHL
   - pdf: checklist que se descarga al final
   - questions: preguntas. En las de práctica, cada opción es
     [texto, puntos 0–3, factor para la estimación]
   - levels: textos del resultado según el puntaje
   - assumptions: supuestos de la estimación en UF
   - Preguntas con "when": solo se muestran si se cumple la condición
     (la comisión es para corredoras; el precio por unidad, para
     inmobiliarias que venden sus propios proyectos)
   ========================================================= */
(function () {
  const app = document.getElementById('diag-app');
  if (!app) return;

  const root = document.getElementById('captia-landing');
  const BASE = (root && root.getAttribute('data-base')) || 'https://colombauv-dev.github.io/captia-landing/';

  const DIAG = {
    // Pega aquí la URL del Inbound Webhook de GHL (Automatizaciones → Workflow → Trigger "Inbound Webhook")
    webhook: 'https://services.leadconnectorhq.com/hooks/LvhyaT8Bnb5KncPj1vys/webhook-trigger/0e1a4a53-bf16-47d7-9dad-439c26bd34fd',
    pdf: BASE + 'assets/checklist-minuto-uno.pdf',
    demo: '/confirmacion-leadflow-inmo',

    questions: [
      { key: 'kind', type: 'data',
        q: '¿Qué vende tu inmobiliaria?',
        hint: 'Así calculamos bien cuánto te cuesta cada cliente que se va.',
        opts: [['Mis propios proyectos (desarrollo o construyo)', 'own'], ['Propiedades de terceros (corretaje)', 'broker']] },

      { key: 'leads', type: 'data',
        q: '¿Cuántas consultas nuevas recibe tu inmobiliaria al mes?',
        hint: 'Suma todos los canales: WhatsApp, Instagram, portales, web, correo. Una estimación basta.',
        opts: [['Menos de 30', 20], ['Entre 30 y 75', 50], ['Entre 76 y 150', 110], ['Entre 151 y 300', 220], ['Más de 300', 400]] },

      { key: 'speed', type: 'score',
        q: 'En horario de oficina, ¿cuánto tarda la primera respuesta a una consulta nueva?',
        hint: 'Piensa en un día normal, no en el mejor día.',
        // factor = % de leads de horario hábil que se enfrían por demora
        opts: [['Menos de 1 minuto', 3, 0.05], ['Entre 1 y 5 minutos', 2, 0.12], ['Entre 5 minutos y 1 hora', 1, 0.25], ['Más de 1 hora', 0, 0.4], ['No lo sé', 0, 0.3]],
        weak: 'Tu primera respuesta llega tarde. El interés de una consulta se enfría en minutos y el cliente sigue preguntando a otras inmobiliarias.', step: 2 },

      { key: 'offhours', type: 'score',
        q: 'Si una consulta llega un domingo o a las 22:00, ¿qué pasa?',
        hint: '',
        // factor = % de leads fuera de horario que se pierden
        opts: [['Se responde al instante, de forma automática', 3, 0.05], ['Alguien de guardia la responde esa misma noche o día', 2, 0.2], ['Se responde el siguiente día hábil', 1, 0.5], ['A veces queda sin respuesta', 0, 0.75]],
        weak: 'Las consultas de noche y fin de semana esperan hasta el día hábil siguiente. Es justo cuando la gente tiene tiempo para buscar casa.', step: 2 },

      { key: 'channels', type: 'score',
        q: '¿Respondes igual de rápido en todos tus canales?',
        hint: 'WhatsApp, Instagram, portales inmobiliarios, formulario web, correo.',
        opts: [['Sí, todos con el mismo estándar', 3], ['WhatsApp sí, los demás van más lento', 1], ['Depende del día y del vendedor', 0]],
        weak: 'Hay canales que se responden más lento. Un cliente que escribió por Instagram o un portal vale lo mismo que uno de WhatsApp.', step: 2 },

      { key: 'qualify', type: 'score',
        q: '¿Cómo distingues a un comprador real de un curioso?',
        hint: '',
        opts: [['Hacemos siempre las mismas preguntas clave en el primer contacto', 3], ['Cada vendedor lo intuye a su manera', 1], ['No filtramos, atendemos a todos igual', 0]],
        weak: 'No filtras en el primer contacto. Tu equipo gasta el mismo tiempo en un curioso que en alguien con crédito aprobado.', step: 3 },

      { key: 'record', type: 'score',
        q: '¿Dónde queda registrado cada lead y lo que preguntó?',
        hint: '',
        opts: [['En un CRM, con etapas y responsable', 3], ['En una planilla que actualizamos', 2], ['En el WhatsApp de cada vendedor', 0], ['No queda registrado', 0]],
        weak: 'La información de cada lead vive en el teléfono de un vendedor. Si se va o se le olvida, ese cliente se pierde.', step: 4 },

      { key: 'followup', type: 'score',
        q: 'Si un lead deja de responder, ¿cuántas veces lo vuelves a contactar?',
        hint: '',
        opts: [['Tenemos una secuencia definida de 4 o más contactos', 3], ['Dos o tres veces, según el vendedor', 2], ['Una vez', 1], ['Ninguna, esperamos que vuelva', 0]],
        weak: 'El seguimiento depende de cada vendedor. Muchas ventas se cierran después del tercer o cuarto contacto, no en el primero.', step: 5 },

      { key: 'measure', type: 'score',
        q: '¿Sabes qué porcentaje de tus consultas termina en una visita agendada?',
        hint: '',
        opts: [['Sí, lo medimos todos los meses', 3], ['Más o menos, a ojo', 1], ['No lo medimos', 0]],
        weak: 'No mides cuántas consultas llegan a visita, así que no sabes dónde se te van ni si una mejora funciona.', step: 1 },

      { key: 'comm', type: 'data', when: () => kind() === 'broker',
        q: '¿Cuál es la comisión promedio por venta, en UF?',
        hint: 'Lo que gana tu inmobiliaria por cada propiedad vendida.',
        opts: [['Menos de 50 UF', 35], ['Entre 50 y 100 UF', 70], ['Entre 100 y 200 UF', 140], ['Más de 200 UF', 250], ['Prefiero no decirlo', 70]] },

      { key: 'price', type: 'data', when: () => kind() === 'own',
        q: '¿Cuál es el precio promedio de las unidades que vendes?',
        hint: 'Una estimación basta. Si prefieres no decirlo, te mostramos solo las unidades.',
        opts: [['Menos de 2.500 UF', 2000], ['Entre 2.500 y 4.000 UF', 3250], ['Entre 4.000 y 6.000 UF', 5000], ['Entre 6.000 y 10.000 UF', 8000], ['Más de 10.000 UF', 12000], ['Prefiero no decirlo', null]] }
    ],

    levels: [
      { min: 70, tag: 'Cerca del Minuto Uno', title: 'Tu inmobiliaria ya está cerca del minuto uno.',
        text: 'Tienes buena parte del proceso resuelto. Lo que queda por ganar está en los detalles: noches, fines de semana y seguimiento constante.' },
      { min: 40, tag: 'Fuga media', title: 'Se te están escapando clientes en puntos concretos.',
        text: 'Tienes algunas buenas prácticas, pero hay huecos claros donde los leads se enfrían antes de llegar a una visita.' },
      { min: 0, tag: 'Fuga alta', title: 'Estás perdiendo clientes antes de hablar con ellos.',
        text: 'Hoy la respuesta depende de quién esté disponible. Ordenar estos puntos es la forma más rápida de conseguir más visitas sin gastar más en publicidad.' }
    ],

    assumptions: {
      offShare: 0.5,       // parte de las consultas que llega fuera de horario (conservador)
      visitRate: 0.08,     // de cada lead recuperado, cuántos llegan a visita
      visitToSale: 0.2,    // de cada visita, cuántas terminan en venta
      followupBoost: [0.25, 0.15, 0.08, 0] // pérdida extra por falta de seguimiento, según puntos 0–3
    }
  };

  const SCORE_QS = DIAG.questions.filter(q => q.type === 'score');
  const ALL = DIAG.questions;
  let answers = {};
  // tipo de inmobiliaria elegido en la pregunta 1 ('own' o 'broker'); por defecto, propios
  const kind = () => (answers.kind === undefined ? 'own' : ALL[0].opts[answers.kind][1]);
  const qs = () => ALL.filter(q => !q.when || q.when());
  const total = () => qs().length;
  let step = -1;              // -1 = portada
  let contact = null;

  const fmt = n => Math.round(n).toLocaleString('es-CL');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const opt = key => { const Q = ALL.find(q => q.key === key); return Q.opts[answers[key]]; };
  // cifras chicas con un decimal (1,5 unidades); las grandes, redondeadas
  const fmtU = n => n < 10 ? (Math.round(n * 10) / 10).toLocaleString('es-CL') : fmt(n);

  /* ---------- Cálculos ---------- */
  function compute() {
    const pts = SCORE_QS.reduce((s, q) => s + opt(q.key)[1], 0);
    const score = Math.round((pts / (SCORE_QS.length * 3)) * 100);
    const level = DIAG.levels.find(l => score >= l.min);

    const A = DIAG.assumptions;
    const leads = opt('leads')[1];
    const slow = opt('speed')[2];
    const offLoss = opt('offhours')[2];
    const extra = A.followupBoost[opt('followup')[1]];
    const lostRate = Math.min(0.85, (1 - A.offShare) * slow + A.offShare * offLoss + extra);
    const lost = leads * lostRate;
    const visits = lost * A.visitRate;
    const salesYear = visits * A.visitToSale * 12;
    const own = kind() === 'own';
    const price = own ? opt('price')[1] : null;
    const ufYear = own ? (price ? salesYear * price : 0) : salesYear * opt('comm')[1];

    const weak = SCORE_QS
      .map(q => ({ q, pts: opt(q.key)[1] }))
      .filter(x => x.pts < 3)
      .sort((a, b) => a.pts - b.pts)
      .slice(0, 3);

    const r = { score, level, lost, visits, own, price,
      unitsLow: salesYear * 0.7, unitsHigh: salesYear * 1.3,
      ufLow: ufYear * 0.7, ufHigh: ufYear * 1.3, weak };
    // texto de la estimación, igual en la web y en el correo
    r.estimate = own
      ? fmtU(r.unitsLow) + '–' + fmtU(r.unitsHigh) + ' unidades al año' + (price ? ' (' + fmt(r.ufLow) + '–' + fmt(r.ufHigh) + ' UF en ventas)' : '')
      : fmt(r.ufLow) + '–' + fmt(r.ufHigh) + ' UF';
    return r;
  }

  /* ---------- Envío a GHL ---------- */
  function send(r) {
    if (!DIAG.webhook) return;
    const data = new URLSearchParams({
      first_name: contact.name.split(' ')[0],
      full_name: contact.name,
      email: contact.email,
      phone: contact.phone,
      source: 'Diagnóstico Minuto Uno',
      diag_puntaje: r.score,
      diag_nivel: r.level.tag,
      diag_leads_perdidos_mes: Math.round(r.lost),
      diag_uf_anual: r.estimate,
      diag_tipo: r.own ? 'Proyectos propios' : 'Corretaje',
      diag_puntos_fuga: r.weak.map(w => w.q.q).join(' | '),
      diag_respuestas: qs().map(q => q.key + ': ' + opt(q.key)[0]).join(' | '),
      pagina: location.href
    });
    // no-cors: GHL recibe los datos aunque el navegador no pueda leer la respuesta
    fetch(DIAG.webhook, { method: 'POST', mode: 'no-cors', body: data }).catch(() => {});
  }

  /* ---------- Vistas ---------- */
  function render() {
    if (step === -1) return renderStart();
    if (step < total()) return renderQuestion();
    if (!contact) return renderForm();
    return renderResult();
  }

  function scrollIntoCard() {
    const box = app.closest('.modal-box');
    if (box) { box.scrollTop = 0; return; }
    if (window.innerWidth < 960) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderStart() {
    app.innerHTML = `
      <div class="step-label">DIAGNÓSTICO MINUTO UNO · GRATIS</div>
      <div class="q-title">¿Tu inmobiliaria responde en el minuto uno?</div>
      <div class="q-hint">10 preguntas sobre cómo atiendes cada consulta. Toma 2 minutos y al final recibes:</div>
      <div class="options diag-start">
        <div class="option diag-get"><span class="diag-get-num">0–100</span><span>Tu puntaje Minuto Uno</span></div>
        <div class="option diag-get"><span class="diag-get-num">Top 3</span><span>Dónde se te escapan los clientes</span></div>
        <div class="option diag-get"><span class="diag-get-num">UF</span><span>Cuánto te cuesta al año responder tarde</span></div>
        <div class="option diag-get"><span class="diag-get-num">PDF</span><span>Checklist con plantillas para copiar y pegar</span></div>
      </div>
      <div class="calc-nav"><span></span><button class="btn" data-act="start">Empezar diagnóstico</button></div>`;
    app.querySelector('[data-act="start"]').addEventListener('click', () => { step = 0; render(); scrollIntoCard(); });
  }

  function renderQuestion() {
    const Q = qs()[step];
    const TOTAL = total();
    const sel = answers[Q.key];
    app.innerHTML = `
      <div class="progress"><div style="width:${(step / (TOTAL + 1)) * 100}%"></div></div>
      <div class="step-label">PREGUNTA ${step + 1} DE ${TOTAL}</div>
      <div class="q-title">${Q.q}</div>
      <div class="q-hint">${Q.hint || ''}</div>
      <div class="options">
        ${Q.opts.map((o, i) => `<button class="option ${sel === i ? 'selected' : ''}" data-i="${i}">${o[0]}</button>`).join('')}
      </div>
      <div class="calc-nav">
        ${step === 0 ? '<span></span>' : '<button class="btn-ghost" data-act="back">Atrás</button>'}
        <button class="btn" data-act="next" ${sel === undefined ? 'disabled' : ''}>${step === TOTAL - 1 ? 'Ver mi resultado' : 'Siguiente'}</button>
      </div>`;
    app.querySelectorAll('.option').forEach(b => b.addEventListener('click', () => {
      answers[Q.key] = +b.dataset.i;
      render();
      // avanza solo al elegir, con una pequeña pausa para ver la selección
      setTimeout(() => { if (qs()[step] === Q) { step++; render(); } }, 260);
    }));
    app.querySelector('[data-act="next"]').addEventListener('click', () => { step++; render(); });
    const back = app.querySelector('[data-act="back"]');
    if (back) back.addEventListener('click', () => { step--; render(); });
  }

  function renderForm() {
    const r = compute();
    const TOTAL = total();
    app.innerHTML = `
      <div class="progress"><div style="width:${(TOTAL / (TOTAL + 1)) * 100}%"></div></div>
      <div class="step-label">TU RESULTADO</div>
      <div class="diag-score">
        <div class="ring" style="--p:${r.score}"><span>${r.score}</span><small>/100</small></div>
        <div>
          <span class="diag-tag">${r.level.tag}</span>
          <div class="q-title" style="margin-top:8px">${r.level.title}</div>
        </div>
      </div>

      <div class="diag-locked" aria-hidden="true">
        <div class="diag-locked-content">
          <div class="result-grid">
            <div><span>Leads que se enfrían al mes</span><strong>~00</strong></div>
            <div><span>Oportunidad anual estimada</span><strong>000–000 UF</strong></div>
          </div>
          <div class="diag-weak">
            <div class="step-label" style="margin-bottom:10px">TUS PUNTOS DE FUGA</div>
            <div class="weak-item"><b>1</b><p>Tu primera respuesta llega tarde y el cliente sigue preguntando a otras inmobiliarias.</p></div>
            <div class="weak-item"><b>2</b><p>Las consultas de noche y fin de semana esperan hasta el siguiente día hábil.</p></div>
          </div>
        </div>
        <div class="diag-lock-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          Cuántos leads pierdes, cuánto te cuesta en UF y tus 3 puntos de fuga
        </div>
      </div>

      <div class="diag-unlock">
        <div class="q-title" style="font-size:18px">Desbloquea tu informe completo</div>
        <div class="q-hint">Te mostramos el resto del resultado aquí mismo y te enviamos el Checklist Minuto Uno en PDF.</div>
      </div>
      <form class="diag-form" novalidate>
        <label>Nombre<input name="name" autocomplete="name" required placeholder="Cristián Molina"></label>
        <label>Correo<input name="email" type="email" autocomplete="email" required placeholder="cristian@inmobiliaria.cl"></label>
        <label>WhatsApp<input name="phone" type="tel" autocomplete="tel" required placeholder="+56 9 1234 5678"></label>
        <label class="diag-consent"><input type="checkbox" name="ok" required> Acepto la <a href="/privacidad" target="_blank">política de privacidad</a> y recibir el resultado y comunicaciones de Captia.</label>
        <p class="diag-error" hidden></p>
        <div class="calc-nav">
          <button type="button" class="btn-ghost" data-act="back">Atrás</button>
          <button type="submit" class="btn">Ver informe completo</button>
        </div>
      </form>`;
    const form = app.querySelector('form');
    const err = app.querySelector('.diag-error');
    app.querySelector('[data-act="back"]').addEventListener('click', () => { step = TOTAL - 1; render(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      const phoneDigits = (f.phone || '').replace(/\D/g, '');
      let msg = '';
      if (!f.name || f.name.trim().length < 2) msg = 'Escribe tu nombre.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || '')) msg = 'Revisa tu correo.';
      else if (phoneDigits.length < 8) msg = 'Revisa tu número de WhatsApp.';
      else if (!f.ok) msg = 'Debes aceptar la política de privacidad.';
      if (msg) { err.textContent = msg; err.hidden = false; return; }
      contact = { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() };
      const r = compute();
      send(r);
      render();
      scrollIntoCard();
    });
  }

  function renderResult() {
    const r = compute();
    const first = esc(contact.name.split(' ')[0]);
    app.innerHTML = `
      <div class="step-label">TU INFORME COMPLETO</div>
      <div class="diag-score">
        <div class="ring" style="--p:${r.score}"><span>${r.score}</span><small>/100</small></div>
        <div>
          <span class="diag-tag">${r.level.tag}</span>
          <div class="q-title" style="margin-top:8px">${first}, ${r.level.title.charAt(0).toLowerCase() + r.level.title.slice(1)}</div>
          <p class="q-hint" style="margin:0">${r.level.text}</p>
        </div>
      </div>

      <div class="result-grid">
        <div><span>Leads que se enfrían al mes</span><strong>~${fmt(r.lost)}</strong></div>
        ${r.own
          ? `<div><span>Ventas que se te escapan al año</span><strong>${fmtU(r.unitsLow)}–${fmtU(r.unitsHigh)} unidades</strong>${r.price ? `<small class="result-sub">≈ ${fmt(r.ufLow)}–${fmt(r.ufHigh)} UF en ventas</small>` : ''}</div>`
          : `<div><span>Oportunidad anual estimada</span><strong>${fmt(r.ufLow)}–${fmt(r.ufHigh)} UF</strong></div>`}
      </div>

      ${r.weak.length ? `
      <div class="diag-weak">
        <div class="step-label" style="margin-bottom:10px">TUS PUNTOS DE FUGA</div>
        ${r.weak.map((w, i) => `<div class="weak-item"><b>${i + 1}</b><p>${w.q.weak} <em>→ Paso ${w.q.step} del checklist</em></p></div>`).join('')}
      </div>` : ''}

      <p class="disclaimer">Estimación referencial calculada con tus respuestas y supuestos conservadores. No es una garantía de resultados.</p>

      <div class="diag-actions">
        <a class="btn-ghost" href="${DIAG.pdf}" target="_blank" rel="noopener">Descargar checklist (PDF)</a>
        <a class="btn" href="${DIAG.demo}">Ver cómo Captia lo resuelve</a>
      </div>
      <p class="diag-note">También te lo enviamos a <b>${esc(contact.email)}</b>.</p>`;
  }

  render();
})();
