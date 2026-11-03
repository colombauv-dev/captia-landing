/* =========================================================
   CAPTIA — lógica de carga (la llama loader.js)
   En cada página de GHL va un bloque de código como este:
     <div id="captia-landing" data-page="home"></div>
     <script src="https://colombauv-dev.github.io/captia-landing/loader.js"></script>
   data-page: home | terminos | agenda | privacidad | diagnostico
   ========================================================= */
(function () {
  var root = document.getElementById('captia-landing');
  if (!root) return;
  var BASE = root.getAttribute('data-base') || 'https://colombauv-dev.github.io/captia-landing/';
  var V = Date.now(); // evita versiones viejas en caché
  var page = root.getAttribute('data-page') || 'home';

  function addCss(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
  function addJs(src) {
    var s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  }

  // Quita márgenes y rellenos que GHL pone en las secciones, filas y columnas que contienen la web
  function stripGhlSpacing() {
    var el = root.parentElement;
    while (el && el !== document.documentElement) {
      ['margin', 'padding'].forEach(function (p) { el.style.setProperty(p, '0', 'important'); });
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('border', '0', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
      el.style.setProperty('min-height', '0', 'important');
      if (el !== document.body) el.style.setProperty('background', 'transparent', 'important');
      el = el.parentElement;
    }
    document.documentElement.style.setProperty('margin', '0', 'important');
    document.documentElement.style.setProperty('padding', '0', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
  }
  stripGhlSpacing();
  // GHL a veces vuelve a aplicar estilos después de cargar: repetimos un par de veces
  setTimeout(stripGhlSpacing, 500);
  setTimeout(stripGhlSpacing, 2000);
  window.addEventListener('load', stripGhlSpacing);

  // Fuente, estilos y favicon
  var pre = document.createElement('link');
  pre.rel = 'preconnect';
  pre.href = 'https://fonts.gstatic.com';
  pre.crossOrigin = '';
  document.head.appendChild(pre);
  addCss('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
  addCss(BASE + 'assets/styles.css?v=' + V);
  if (!document.querySelector('link[rel="icon"][data-captia]')) {
    var fav = document.createElement('link');
    fav.rel = 'icon';
    fav.type = 'image/svg+xml';
    fav.href = BASE + 'assets/favicon.svg';
    fav.setAttribute('data-captia', '');
    document.head.appendChild(fav);
  }

  // Contenido de la página
  function get(name) {
    return fetch(BASE + 'pages/' + name + '.html?v=' + V).then(function (r) { return r.text(); });
  }
  Promise.all([get(page), get('footer')])
    .then(function (parts) {
      root.innerHTML = parts[0] + parts[1];
      addJs(BASE + 'assets/main.js?v=' + V);
      if (page === 'agenda') addJs('https://link.msgsndr.com/js/form_embed.js');
      if (page === 'diagnostico') addJs(BASE + 'assets/diagnostico.js?v=' + V);
      if (location.hash) {
        var t = document.querySelector(location.hash);
        if (t) setTimeout(function () { t.scrollIntoView(); }, 300);
      }
    })
    .catch(function () {
      root.innerHTML = '<p style="padding:40px;text-align:center">No se pudo cargar la página. Recarga en unos segundos.</p>';
    });
})();
