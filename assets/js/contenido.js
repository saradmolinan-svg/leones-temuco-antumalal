/* =========================================================================
   CONTENIDO.JS — PUENTE ENTRE EL PANEL Y EL SITIO
   -------------------------------------------------------------------------
   Lee  data/contenido.json  (lo que se guardó desde admin.html) y lo aplica
   sobre el HTML antes de arrancar el resto de los scripts.

   Reglas de oro:
     · Si el archivo no existe, está roto o no se puede leer, NO PASA NADA:
       el sitio sigue funcionando con los textos escritos en index.html.
     · Nunca borra nada del HTML: solo reemplaza lo que el panel definió.

   Cómo marca el HTML lo que se puede editar:
     data-ed="clave"           reemplaza el contenido del elemento
     data-ed-txt="clave"       reemplaza solo el texto (respeta íconos SVG)
     data-ed-num="clave"       reemplaza el atributo data-contador
     data-ed-parrafos="clave"  reemplaza una lista de párrafos
     data-ed-chips="clave"     reemplaza una lista de <span> (marquesina)
     data-img="clave"          reemplaza la imagen desde data/imagenes.json
   ========================================================================= */
(() => {
  'use strict';

  const ARCHIVO      = 'data/contenido.json';
  const ARCHIVO_IMG  = 'data/imagenes.json';
  const V            = '3';                 // versión de caché de los scripts

  /* Qué scripts arrancan después de aplicar el contenido.
     experiencia.html cambia esta lista para usar su propio motor. */
  const SCRIPTS = window.SCRIPTS_SITIO || ['main', 'noticias', 'instagram'];

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ═══════════════ SEGURIDAD DEL TEXTO ═══════════════
     El contenido lo escriben los dueños del sitio, pero igual se limpia:
     solo se permiten etiquetas de formato simple. Así, si alguien pega
     texto copiado de cualquier parte, no puede colar un script. */
  const TAGS_OK  = ['B', 'STRONG', 'I', 'EM', 'U', 'SMALL', 'BR', 'SPAN', 'A', 'P'];
  const ATTRS_OK = { A: ['href', 'target', 'rel', 'title'], SPAN: ['class'], P: ['class'] };

  function limpiar(html) {
    const caja = document.createElement('div');
    caja.innerHTML = String(html == null ? '' : html);
    $$('*', caja).forEach((el) => {
      if (!TAGS_OK.includes(el.tagName)) {                 // etiqueta no permitida:
        el.replaceWith(...el.childNodes);                  // se conserva su texto
        return;
      }
      const permitidos = ATTRS_OK[el.tagName] || [];
      [...el.attributes].forEach((a) => {
        if (!permitidos.includes(a.name)) el.removeAttribute(a.name);
      });
      if (el.tagName === 'A') {
        const h = el.getAttribute('href') || '';
        if (/^\s*(javascript|data):/i.test(h)) el.setAttribute('href', '#');
        if (el.target === '_blank') el.setAttribute('rel', 'noopener');
      }
    });
    return caja.innerHTML;
  }

  const texto = (v) => String(v == null ? '' : v);

  function svg(clave, tam) {
    const ico = (window.ICONOS || {})[clave] || (window.ICONOS || {}).corazonSolo;
    const t = tam || 24;
    return `<svg viewBox="0 0 24 24" width="${t}" height="${t}" fill="none" stroke="currentColor"
      stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ico ? ico.d : ''}</svg>`;
  }

  const esc = (v) => texto(v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ═══════════════ 1. CONFIGURACIÓN ═══════════════
     Lo que el panel guarda en las llaves de configuración se mezcla sobre
     window.CLUB, de modo que main.js lo lea como si viniera de config.js. */
  function fusionarConfig(D) {
    const C = window.CLUB = window.CLUB || {};
    ['identidad', 'contacto', 'redes', 'formulario', 'noticias', 'instagram', 'donaciones', 'agenda']
      .forEach((k) => {
        if (D[k] && typeof D[k] === 'object' && !Array.isArray(D[k])) {
          C[k] = Object.assign({}, C[k], D[k]);
        }
      });
    if (Array.isArray(D.impacto) && D.impacto.length) C.impacto = D.impacto;
  }

  /* ═══════════════ 2. TEXTOS SUELTOS ═══════════════ */
  function aplicarTextos(T) {
    if (!T) return;
    const valor = (clave) => clave.split('.').reduce((o, k) => (o == null ? o : o[k]), T);

    $$('[data-ed]').forEach((el) => {
      const v = valor(el.dataset.ed);
      if (v == null || v === '') return;
      el.innerHTML = limpiar(v);
    });

    $$('[data-ed-txt]').forEach((el) => {
      const v = valor(el.dataset.edTxt);
      if (v == null || v === '') return;
      // Reemplaza el primer nodo de texto real y deja intactos los <svg> del botón
      const nodo = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (nodo) nodo.textContent = ' ' + texto(v) + ' ';
      else el.prepend(document.createTextNode(texto(v) + ' '));
    });

    $$('[data-ed-num]').forEach((el) => {
      const v = valor(el.dataset.edNum);
      if (v == null || v === '') return;
      el.setAttribute('data-contador', String(parseInt(v, 10) || 0));
    });

    $$('[data-ed-parrafos]').forEach((el) => {
      const v = valor(el.dataset.edParrafos);
      if (!Array.isArray(v) || !v.length) return;
      el.innerHTML = v.map((p, i) =>
        `<p${i === 0 ? ' class="sobre__intro"' : ''}>${limpiar(p)}</p>`).join('');
    });

    $$('[data-ed-chips]').forEach((el) => {
      const v = valor(el.dataset.edChips);
      if (!Array.isArray(v) || !v.length) return;
      el.innerHTML = v.map((t) => `<span>${esc(t)}</span>`).join('');
    });
  }

  /* ═══════════════ 3. BLOQUES REPETIBLES ═══════════════ */
  const d = (i, paso) => ` style="--d:${i * paso}ms"`;

  function pintarLista(sel, datos, plantilla) {
    const cont = $(sel);
    if (!cont || !Array.isArray(datos) || !datos.length) return;
    cont.innerHTML = datos.map(plantilla).join('');
  }

  /* ─── Plantillas ───
     Cada lista del contenido se dibuja con una de estas funciones. Una página
     con otro diseño (experiencia.html) puede reemplazarlas definiendo
     window.PLANTILLAS_SITIO antes de cargar este archivo; recibe las mismas
     ayudas (h) para escapar texto, dibujar íconos y resolver imágenes. */
  const PLANTILLAS = {
    causas: (c, i, h) => `
      <article class="causa" data-rev="up"${h.d(i, 80)}>
        <div class="causa__ico">${h.svg(c.icono)}</div>
        <h3>${h.esc(c.titulo)}</h3>
        <p>${h.limpiar(c.texto)}</p>
      </article>`,

    sellos: (s, i, h) => `
      <article class="sello" data-rev="up"${h.d(i, 90)}>
        <h3>${h.esc(s.titulo)}</h3><p>${h.limpiar(s.texto)}</p>
      </article>`,

    proyectos: (p, i, h) => `
      <a href="${h.esc(p.enlace || '#contacto')}" class="proyecto${p.ancho ? ' proyecto--ancho' : ''}" data-rev="up"${h.d(i, 90)}>
        <img src="${h.esc(h.imagenSrc(p.imagen))}" alt="${h.esc(p.titulo)}" loading="lazy" data-img-ref="${h.esc(p.imagen || '')}">
        <span class="proyecto__velo"></span>
        <div class="proyecto__in">
          ${p.tag ? `<span class="proyecto__tag">${h.esc(p.tag)}</span>` : ''}
          <h3>${h.esc(p.titulo)}</h3>
          <p>${h.limpiar(p.texto)}</p>
        </div>
      </a>`,

    valores: (v, i, h) => `
      <article class="valor" data-rev="up"${h.d(i, 80)}>
        <div class="valor__ico">${h.svg(v.icono)}</div>
        <h3>${h.esc(v.titulo)}</h3>
        <p>${h.limpiar(v.texto)}</p>
      </article>`,

    directiva: (m, i, h) => `
      <article class="miembro" data-rev="up"${h.d(i, 90)}>
        <div class="miembro__foto">
          <img src="${h.esc(h.imagenSrc(m.foto, 'assets/img/fotos/directiva-1.svg'))}" alt="${h.esc(m.nombre)}" loading="lazy" data-img-ref="${h.esc(m.foto || '')}">
        </div>
        <h3>${h.esc(m.nombre)}</h3><span>${h.esc(m.cargo)}</span>
      </article>`,

    testimonios: (t, i, h) => `
      <article class="testimonio">
        <span class="testimonio__q">&ldquo;</span>
        <p>${h.limpiar(t.texto)}</p>
        <div class="testimonio__autor">
          <span class="testimonio__ini">${h.esc(t.iniciales || h.iniciales(t.autor))}</span>
          <div><b>${h.esc(t.autor)}</b><span>${h.esc(t.detalle || '')}</span></div>
        </div>
      </article>`,

    faq: (f, i, h) => `
      <div class="faq">
        <button class="faq__b" aria-expanded="false">${h.esc(f.pregunta)}<span class="faq__ico"></span></button>
        <div class="faq__p"><div><p>${h.limpiar(f.respuesta)}</p></div></div>
      </div>`,

    donaOps: (o, i, h) => `
      <div class="dona__op">
        <i>${h.svg(o.icono, 20)}</i>
        <div><b>${h.esc(o.titulo)}</b><p>${h.limpiar(o.texto)}</p></div>
      </div>`,

    clubFirma: (f, i, h) => `
      <div><b>${h.esc(f.dato)}</b><span>${h.esc(f.etiqueta)}</span></div>`
  };

  /* Dónde va cada lista dentro del HTML */
  const DESTINOS = {
    causas:      '#gridCausas',
    sellos:      '#gridSellos',
    proyectos:   '#gridProyectos',
    valores:     '#gridValores',
    directiva:   '#gridDirectiva',
    testimonios: '#carruselPista',
    faq:         '#acordeon',
    donaOps:     '#donaOps',
    clubFirma:   '#clubFirma'
  };

  function aplicarListas(D) {
    const ayudas = { esc, limpiar, svg, d, imagenSrc, iniciales };
    const usar = Object.assign({}, PLANTILLAS, window.PLANTILLAS_SITIO || {});
    Object.keys(DESTINOS).forEach((clave) => {
      const plantilla = usar[clave];
      if (typeof plantilla !== 'function') return;
      pintarLista(DESTINOS[clave], D[clave], (it, i) => plantilla(it, i, ayudas));
    });
  }

  function iniciales(nombre) {
    return texto(nombre).split(/\s+/).filter(Boolean).slice(0, 2)
      .map((p) => p[0]).join('').toUpperCase() || '·';
  }

  /* ═══════════════ 4. IMÁGENES ═══════════════
     Un campo de imagen puede ser:
       · una ruta normal          → "assets/img/fotos/hero.jpg"
       · una foto subida al panel → "img:hero-1712" (vive en data/imagenes.json)
     Las subidas se aplican aparte, cuando termina de bajar ese archivo, para
     no retrasar la aparición de los textos. */
  let IMAGENES = null;
  let DATOS = null;

  function imagenSrc(ref, respaldo) {
    const r = texto(ref);
    const porDefecto = respaldo || 'assets/img/fotos/proyecto-1.svg';
    if (!r) return porDefecto;
    if (r.startsWith('img:')) {
      return (IMAGENES && IMAGENES[r.slice(4)]) || porDefecto;
    }
    return r;   // ruta normal de archivo
  }

  function aplicarImagenes(mapa) {
    if (!mapa) return;
    IMAGENES = mapa;

    /* Fotos fijas del HTML (portada, las tres de "El Club"…).
       El panel guarda en  imagenClaves.hero  una referencia tipo "img:hero-k9",
       y el dibujo mismo vive en data/imagenes.json bajo esa clave. */
    const claves = (DATOS && DATOS.imagenClaves) || {};
    $$('[data-img]').forEach((el) => {
      const ref = claves[el.dataset.img];
      if (!ref) return;
      const src = imagenSrc(ref, '');
      if (src) el.src = src;
    });

    // Fotos dentro de los bloques repetibles ya pintados
    $$('[data-img-ref]').forEach((el) => {
      const ref = el.dataset.imgRef || '';
      if (!ref.startsWith('img:')) return;
      const dato = mapa[ref.slice(4)];
      if (dato) el.src = dato;
    });
  }

  /* ═══════════════ 5. ARRANQUE ═══════════════ */
  function cargarScript(src) {
    return new Promise((listo) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = listo;
      s.onerror = listo;
      document.body.appendChild(s);
    });
  }

  function cargarScripts() {
    SCRIPTS.reduce(
      (cadena, nombre) => cadena.then(() => cargarScript(`assets/js/${nombre}.js?v=${V}`)),
      Promise.resolve()
    );
  }

  const bajarJson = (url) => fetch(url, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);   // sin servidor (file://) o sin archivo: se ignora

  /* Vista previa del panel: con  index.html?borrador=1  la página se dibuja
     con los cambios que todavía no se publican, guardados en este navegador. */
  const enBorrador = /[?&]borrador=1/.test(location.search);

  function fuenteContenido() {
    if (enBorrador) {
      try {
        const b = localStorage.getItem('antumalal.borrador');
        if (b) return Promise.resolve(JSON.parse(b));
      } catch { /* borrador ilegible: se usa el publicado */ }
    }
    return bajarJson(ARCHIVO);
  }

  function fuenteImagenes() {
    if (!enBorrador) return bajarJson(ARCHIVO_IMG);
    return cargarScript('assets/js/almacen.js?v=1')
      .then(() => (window.ALMACEN ? window.ALMACEN.leer('imagenes') : null))
      .then((m) => m || bajarJson(ARCHIVO_IMG))
      .catch(() => bajarJson(ARCHIVO_IMG));
  }

  // Las fotos se piden en paralelo, pero no bloquean: pueden pesar bastante.
  const promesaImagenes = fuenteImagenes();

  /* Queda disponible para los otros módulos (por ejemplo instagram.js, que
     también puede mostrar fotos subidas desde el panel). */
  window.IMAGENES_CLUB = promesaImagenes;

  fuenteContenido()
    .then((D) => {
      if (D && typeof D === 'object') {
        try {
          DATOS = D;
          fusionarConfig(D);
          aplicarTextos(D.textos);
          aplicarListas(D);
        } catch (e) {
          console.warn('[contenido] no se pudo aplicar data/contenido.json:', e);
        }
      }
    })
    .finally(() => {
      cargarScripts();
      promesaImagenes.then((mapa) => {
        try {
          aplicarImagenes(mapa);
          if (window.LEONES) window.LEONES.refrescarAnimaciones();
        } catch (e) { /* una foto rota no debe romper la página */ }
      });
    });
})();
