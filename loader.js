/* =========================================================
   CAPTIA — cargador para GHL (no tocar)
   Este archivo solo trae la versión más reciente de assets/core.js,
   así los cambios se ven en captialab.com sin esperar el caché.
   En GHL:
     <div id="captia-landing" data-page="home"></div>
     <script src="https://colombauv-dev.github.io/captia-landing/loader.js"></script>
   ========================================================= */
(function () {
  var root = document.getElementById('captia-landing');
  if (!root) return;
  var base = root.getAttribute('data-base') || 'https://colombauv-dev.github.io/captia-landing/';
  var s = document.createElement('script');
  s.src = base + 'assets/core.js?v=' + Date.now();
  document.body.appendChild(s);
})();
