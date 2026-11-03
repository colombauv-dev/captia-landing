# Web Captia (captialab.com) · Cómo está conectada

La web está armada igual que la de Belara: GHL publica la página y GitHub guarda el contenido.

## 1. GHL: aloja las páginas
captialab.com apunta a GHL. Cada página tiene solo un bloque de código, pegado una sola vez:

| Página en GHL | Ruta | Código |
|---|---|---|
| Inicio | `/` | `<div id="captia-landing" data-page="home"></div>` |
| Términos | `/terminos` | `<div id="captia-landing" data-page="terminos"></div>` |
| Agenda tu demo | `/confirmacion-leadflow-inmo` | `<div id="captia-landing" data-page="agenda"></div>` |
| Privacidad | `/privacidad` | `<div id="captia-landing" data-page="privacidad"></div>` |
| Diagnóstico (lead magnet) | `/diagnostico` | `<div id="captia-landing" data-page="diagnostico"></div>` |

Debajo del `div`, en todas:
```html
<script src="https://colombauv-dev.github.io/captia-landing/loader.js"></script>
```

## 2. GitHub: guarda el contenido
```
loader.js            → el cargador que usa GHL (solo trae assets/core.js sin caché)
assets/core.js       → lógica de carga: estilos, página, footer y márgenes
pages/home.html      → textos y estructura de la página principal
pages/terminos.html  → Términos y Condiciones
pages/agenda.html    → página de agenda (calendario de GHL embebido)
pages/privacidad.html → Política de privacidad
pages/diagnostico.html → Diagnóstico Minuto Uno (lead magnet)
assets/diagnostico.js → preguntas, puntaje, estimación y envío a GHL (objeto DIAG)
assets/checklist-minuto-uno.pdf → checklist que se descarga al final
lead-magnet/          → fuente del PDF (checklist.html) y script para regenerarlo
pages/footer.html    → footer compartido por todas las páginas
assets/styles.css    → diseño (colores de marca al inicio)
assets/main.js       → chat animado, FAQ, menú móvil y calculadora
assets/favicon.svg   → ícono de la pestaña
index.html           → solo vista previa en GitHub Pages (?p=terminos, ?p=agenda, ?p=diagnostico)
```

## 3. Cómo fluye un cambio
Claude edita → sube a GitHub → GitHub Pages publica (1–2 min) → captialab.com muestra la versión nueva.
Si no ves el cambio, recarga con Ctrl+Shift+R.

## Ten en cuenta
- No cambies el nombre del repositorio ni de la cuenta de GitHub.
- La app de Claude en GitHub tiene que seguir con acceso a `captia-landing`.
- Título, descripción para Google, imagen para redes y favicon: configúralos también en los ajustes de cada página en GHL.
- Calendario de demo: ID `O0rqdAkkw1PBMRZ0QmMT` en `pages/agenda.html`.
- Supuestos de la calculadora: objeto `CALC` en `assets/main.js`.
- Diagnóstico: la URL del Inbound Webhook de GHL va en `webhook` dentro de `DIAG` (assets/diagnostico.js). Mientras esté vacía, el diagnóstico funciona pero los datos no llegan a GHL.
