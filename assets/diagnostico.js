/* =========================================================
   captia — Diagnóstico Minuto Uno para gimnasios (lead magnet)
   Todo lo editable está en el objeto DIAG:
   - webhook: URL del "Inbound Webhook" del workflow de GHL
   - pdf: checklist que se descarga al final
   - questions: preguntas. En las de práctica, cada opción es
     [texto, puntos 0–3, factor para la estimación]
   - levels: textos del resultado según el puntaje
   - assumptions: supuestos de la estimación en euros
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
      { key: 'members', type: 'data',
        q: '¿Cuántos socios tiene tu gimnasio?',
        hint: 'Socios activos que pagan cuota. Una estimación basta.',
        opts: [['Menos de 300', 200], ['Entre 300 y 600', 450], ['Entre 600 y 1.000', 800], ['Entre 1.000 y 1.500', 1250], ['Más de 1.500', 1800]] },

      { key: 'leads', type: 'data',
        q: '¿Cuántas consultas de personas interesadas recibes al mes?',
        hint: 'Suma WhatsApp, Instagram, correo, web y teléfono. Piensa en un mes normal, no en septiembre ni en enero.',
        opts: [['Menos de 30', 20], ['Entre 30 y 75', 50], ['Entre 76 y 150', 110], ['Más de 150', 200]] },

      { key: 'speed', type: 'score',
        q: 'En horario de recepción, ¿cuánto tarda la primera respuesta a una consulta?',
        hint: 'Piensa en un día normal, no en el mejor día.',
        // factor = % de consultas en horario que se enfrían por demora
        opts: [['Menos de 1 minuto', 3, 0.05], ['Entre 1 y 5 minutos', 2, 0.12], ['Entre 5 minutos y 1 hora', 1, 0.25], ['Más de 1 hora', 0, 0.4], ['No lo sé', 0, 0.3]],
        weak: 'Tu primera respuesta llega tarde. Quien pregunta precios escribe a dos o tres gimnasios y se apunta en el que le contesta primero.', step: 2 },

      { key: 'offhours', type: 'score',
        q: 'Si alguien pregunta precios un domingo o a las 22:00, ¿qué pasa?',
        hint: '',
        // factor = % de consultas fuera de horario que se pierden
        opts: [['Se responde al momento, de forma automática', 3, 0.05], ['Alguien la contesta desde su móvil esa misma noche o día', 2, 0.2], ['Se responde al día siguiente o el lunes', 1, 0.5], ['A veces se queda sin respuesta', 0, 0.75]],
        weak: 'Las consultas de noche y de fin de semana esperan hasta que abre la recepción. Es justo cuando la gente tiene tiempo para buscar gimnasio.', step: 2 },

      { key: 'trial', type: 'score',
        q: 'Cuando alguien pregunta precios, ¿le propones una clase de prueba?',
        hint: '',
        opts: [['Siempre, y se la reservamos en ese momento', 3], ['Se la proponemos, pero tiene que venir o llamar para reservarla', 2], ['Solo si la pide', 1], ['No ofrecemos clase de prueba', 0]],
        weak: 'No conviertes la consulta en una clase de prueba. Quien pregunta precios está a un paso de venir, pero si no le reservas la prueba en ese momento, se enfría.', step: 3 },

      { key: 'followup', type: 'score',
        q: 'Si alguien hace la clase de prueba y no se apunta, ¿qué pasa?',
        hint: '',
        opts: [['Le escribimos al día siguiente y tenemos una secuencia de seguimiento', 3], ['Le escribimos una vez', 2], ['Depende de quién esté en recepción', 1], ['Nada, esperamos que vuelva', 0]],
        weak: 'No haces seguimiento después de la prueba. Muchas personas se apuntan después del segundo o tercer mensaje, no el mismo día.', step: 4 },

      { key: 'churn', type: 'score',
        q: 'Cuando un socio pide la baja, ¿qué hace tu equipo?',
        hint: 'Por correo, en recepción o por WhatsApp.',
        // factor = parte de las bajas recuperables que hoy se pierde
        opts: [['Le responde, le ofrece una alternativa (pausa, otra tarifa) y anota el motivo', 3, 0], ['Le responde y tramita la baja, sin ofrecerle nada', 1, 0.8], ['Tramita la baja cuando puede; a veces tarda días en contestar', 0, 1]],
        weak: 'Las bajas se tramitan sin un intento de retener al socio. Una pausa o una tarifa con menos clases puede bastar para que se quede.', step: 5 },

      { key: 'reason', type: 'score',
        q: '¿Sabes por qué se da de baja cada socio?',
        hint: '',
        opts: [['Sí, registramos el motivo de cada baja y lo revisamos', 3], ['Más o menos, lo comentamos en recepción', 1], ['No lo sabemos', 0]],
        weak: 'No sabes por qué se van tus socios, así que no puedes corregir lo que los está echando: precio, horarios o el servicio.', step: 5 },

      { key: 'measure', type: 'score',
        q: '¿Sabes cuántas consultas acaban en clase de prueba y cuántas pruebas en alta?',
        hint: '',
        opts: [['Sí, lo medimos todos los meses', 3], ['Más o menos, a ojo', 1], ['No lo medimos', 0]],
        weak: 'No mides cuántas consultas acaban en alta, así que no sabes dónde se te escapan ni si una mejora funciona.', step: 1 },

      { key: 'fee', type: 'data',
        q: '¿Cuál es la cuota media de tus socios?',
        hint: 'Lo que paga al mes un socio típico.',
        opts: [['Menos de 40 €', 35], ['Entre 40 y 60 €', 50], ['Entre 60 y 80 €', 70], ['Entre 80 y 100 €', 90], ['Más de 100 €', 110]] }
    ],

    levels: [
      { min: 70, tag: 'Cerca del Minuto Uno', title: 'Tu recepción ya está cerca del minuto uno.',
        text: 'Tienes buena parte resuelta. Lo que queda por ganar está en los detalles: noches, fines de semana, el seguimiento después de la prueba y las bajas.' },
      { min: 40, tag: 'Fuga media', title: 'Se te escapan socios en puntos concretos.',
        text: 'Tienes algunas buenas prácticas, pero hay huecos claros donde las consultas se enfrían y las bajas se van sin un intento de retenerlas.' },
      { min: 0, tag: 'Fuga alta', title: 'Estás perdiendo socios antes de hablar con ellos.',
        text: 'Hoy la respuesta depende de quién esté en recepción. Ordenar estos puntos es la forma más rápida de conseguir más altas y perder menos socios, sin gastar más en publicidad.' }
    ],

    assumptions: {
      offShare: 0.5,        // parte de las consultas que llega fuera del horario de recepción
      leadToMember: 0.15,   // de cada consulta bien atendida, cuántas acaban en alta
      newMemberMonths: 6,   // meses que se queda de media un socio nuevo
      monthlyChurn: 0.04,   // bajas al mes sobre el total de socios (4–6 % en gimnasios tradicionales)
      saveRate: 0.10,       // de cada baja, cuántas se quedan con una oferta
      savedMonths: 3,       // meses extra que se queda un socio retenido
      followupBoost: [0.25, 0.15, 0.08, 0] // pérdida extra por falta de seguimiento, según puntos 0–3
    }
  };

  const SCORE_QS = DIAG.questions.filter(q => q.type === 'score');
  const ALL = DIAG.questions;
  let answers = {};
  const qs = () => ALL;
  const total = () => qs().length;
  let step = -1;              // -1 = portada
  let contact = null;

  // formato de España con punto de miles también en cifras de 4 dígitos (6.350)
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const opt = key => { const Q = ALL.find(q => q.key === key); return Q.opts[answers[key]]; };

  /* ---------- Cálculos ---------- */
  function compute() {
    const pts = SCORE_QS.reduce((s, q) => s + opt(q.key)[1], 0);
    const score = Math.round((pts / (SCORE_QS.length * 3)) * 100);
    const level = DIAG.levels.find(l => score >= l.min);

    const A = DIAG.assumptions;
    const fee = opt('fee')[1];
    // 1) Altas que se pierden por responder tarde o no hacer seguimiento
    const leads = opt('leads')[1];
    const slow = opt('speed')[2];
    const offLoss = opt('offhours')[2];
    const extra = A.followupBoost[opt('followup')[1]];
    const lostRate = Math.min(0.85, (1 - A.offShare) * slow + A.offShare * offLoss + extra);
    const lost = leads * lostRate;                       // consultas que se enfrían al mes
    const lostJoins = lost * A.leadToMember;             // altas perdidas al mes
    const eurJoins = lostJoins * 12 * fee * A.newMemberMonths;
    // 2) Bajas que se van sin un intento de retenerlas
    const members = opt('members')[1];
    const savable = members * A.monthlyChurn * A.saveRate * opt('churn')[2]; // socios retenibles al mes
    const eurChurn = savable * 12 * fee * A.savedMonths;

    const eurYear = eurJoins + eurChurn;
    const weak = SCORE_QS
      .map(q => ({ q, pts: opt(q.key)[1] }))
      .filter(x => x.pts < 3)
      .sort((a, b) => a.pts - b.pts)
      .slice(0, 3);

    const r = { score, level, lost, weak,
      joinsYear: lostJoins * 12, savedYear: savable * 12,
      eurLow: eurYear * 0.7, eurHigh: eurYear * 1.3 };
    // texto de la estimación, igual en la web y en el correo
    r.estimate = fmt(r.eurLow) + '–' + fmt(r.eurHigh) + ' €';
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
      diag_tipo: 'Gimnasio · ' + opt('members')[0] + ' socios',
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
      <div class="q-title">¿Tu gimnasio responde en el minuto uno?</div>
      <div class="q-hint">10 preguntas sobre cómo atiendes las consultas y las bajas. Toma 2 minutos y al final recibes:</div>
      <div class="options diag-start">
        <div class="option diag-get"><span class="diag-get-num">0–100</span><span>Tu puntaje Minuto Uno</span></div>
        <div class="option diag-get"><span class="diag-get-num">Top 3</span><span>Dónde se te escapan los socios</span></div>
        <div class="option diag-get"><span class="diag-get-num">€</span><span>Cuánto te cuesta al año</span></div>
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
            <div><span>Consultas que se enfrían al mes</span><strong>~00</strong></div>
            <div><span>Lo que pierdes al año</span><strong>0.000–0.000 €</strong></div>
          </div>
          <div class="diag-weak">
            <div class="step-label" style="margin-bottom:10px">TUS PUNTOS DE FUGA</div>
            <div class="weak-item"><b>1</b><p>Tu primera respuesta llega tarde y la persona se apunta en otro gimnasio.</p></div>
            <div class="weak-item"><b>2</b><p>Las bajas se tramitan sin un intento de retener al socio.</p></div>
          </div>
        </div>
        <div class="diag-lock-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          Cuántas consultas se te enfrían, cuánto te cuesta en euros y tus 3 puntos de fuga
        </div>
      </div>

      <div class="diag-unlock">
        <div class="q-title" style="font-size:18px">Desbloquea tu informe completo</div>
        <div class="q-hint">Te mostramos el resto del resultado aquí mismo y te enviamos el Checklist Minuto Uno en PDF.</div>
      </div>
      <form class="diag-form" novalidate>
        <label>Nombre<input name="name" autocomplete="name" required placeholder="Marta Puig"></label>
        <label>Correo<input name="email" type="email" autocomplete="email" required placeholder="marta@tugimnasio.com"></label>
        <label>WhatsApp<input name="phone" type="tel" autocomplete="tel" required placeholder="+34 600 00 00 00"></label>
        <label class="diag-consent"><input type="checkbox" name="ok" required> Acepto la <a href="/privacidad" target="_blank">política de privacidad</a> y recibir el resultado y comunicaciones de captia.</label>
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
        <div><span>Consultas que se enfrían al mes</span><strong>~${fmt(r.lost)}</strong></div>
        <div><span>Lo que pierdes al año</span><strong>${r.estimate}</strong><small class="result-sub">≈ ${fmt(r.joinsYear)} altas perdidas${r.savedYear >= 1 ? ` y ${fmt(r.savedYear)} bajas sin intento de retención` : ''} al año</small></div>
      </div>

      ${r.weak.length ? `
      <div class="diag-weak">
        <div class="step-label" style="margin-bottom:10px">TUS PUNTOS DE FUGA</div>
        ${r.weak.map((w, i) => `<div class="weak-item"><b>${i + 1}</b><p>${w.q.weak} <em>→ Paso ${w.q.step} del checklist</em></p></div>`).join('')}
      </div>` : ''}

      <p class="disclaimer">Estimación referencial calculada con tus respuestas y supuestos conservadores. No es una garantía de resultados.</p>

      <div class="diag-actions">
        <a class="btn-ghost" href="${DIAG.pdf}" target="_blank" rel="noopener">Descargar checklist (PDF)</a>
        <a class="btn" href="${DIAG.demo}">Ver cómo lo resuelve captia</a>
      </div>
      <p class="diag-note">También te lo enviamos a <b>${esc(contact.email)}</b>.</p>`;
  }

  render();
})();
