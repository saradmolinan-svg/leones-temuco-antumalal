/* =========================================================================
   NOTICIAS.JS — Sección de noticias y comunicados
   -------------------------------------------------------------------------
   Origen de los datos (en este orden):
     1. data/noticias.json  → generado por scripts/fetch-noticias.mjs
        (localmente con `npm run noticias` o automáticamente con GitHub Actions)
     2. Refresco en vivo desde el navegador vía proxy CORS (opcional)
     3. Si todo falla, se muestran las noticias que ya venían en el JSON.
   ========================================================================= */
(() => {
  'use strict';

  const C = window.CLUB || {};
  const cfg = C.noticias || {};
  const grid = document.querySelector('#noticiasGrid');
  const estado = document.querySelector('#noticiasEstado');
  if (!grid) return;

  let todas = [];
  let filtro = 'todas';

  /* Sólo notas de prensa que hablen realmente del leonismo */
  const RELEVANTE = /\bleon(es|ismo|ístic)|\blions?\b/i;

  /* ---------- utilidades ---------- */
  const escapar = (s = '') => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const limpiar = (s = '') => escapar(
    String(s).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  );

  function fechaLarga(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function marcarEstado(texto, ok = true) {
    if (!estado) return;
    estado.querySelector('span').textContent = texto;
    estado.querySelector('i').style.background = ok ? '#22c55e' : '#f59e0b';
  }

  /* ---------- render ---------- */
  function esqueleto(n = 6) {
    grid.innerHTML = Array.from({ length: n }, () => `
      <div class="skel"><div class="skel__img"></div>
        <div class="skel__l"></div><div class="skel__l"></div><div class="skel__l"></div>
      </div>`).join('');
  }

  function tarjeta(n) {
    const img = n.imagen || 'assets/img/fotos/noticia.svg';
    return `
      <article class="noticia" data-tipo="${n.tipo}" data-rev="up">
        <div class="noticia__img">
          <span class="noticia__fuente" data-tipo="${n.tipo}">${escapar(n.fuente)}</span>
          <img src="${escapar(img)}" alt="" loading="lazy"
               onerror="this.onerror=null;this.src='assets/img/fotos/noticia.svg'">
        </div>
        <div class="noticia__cuerpo">
          <span class="noticia__fecha">${fechaLarga(n.fecha)}</span>
          <h3>${limpiar(n.titulo)}</h3>
          ${n.resumen ? `<p>${limpiar(n.resumen)}</p>` : ''}
          <span class="noticia__pie">
            Leer nota
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
          </span>
        </div>
      </article>`;
  }

  function pintar() {
    const lista = (filtro === 'todas' ? todas : todas.filter((n) => n.tipo === filtro))
      .slice(0, cfg.maximo || 9);

    if (!lista.length) {
      grid.innerHTML = `
        <p class="lead" style="grid-column:1/-1">
          Por ahora no hay publicaciones en esta categoría.
          Visita el <a href="https://www.lionsclubs.org/es" target="_blank" rel="noopener" class="link-u">sitio oficial de Lions International</a>.
        </p>`;
      return;
    }

    grid.innerHTML = lista.map((n) => `<a href="${escapar(n.enlace)}" target="_blank" rel="noopener" style="display:contents">${tarjeta(n)}</a>`).join('');
    window.LEONES?.refrescarAnimaciones?.();
  }

  /* ---------- filtros ---------- */
  document.querySelectorAll('.filtro').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.filtro').forEach((x) => x.classList.remove('activo'));
      b.classList.add('activo');
      filtro = b.dataset.filtro;
      pintar();
    });
  });

  /* ---------- carga del JSON generado ---------- */
  async function cargarLocal() {
    const r = await fetch((cfg.archivoLocal || 'data/noticias.json') + '?v=' + Date.now());
    if (!r.ok) throw new Error('sin archivo local');
    const j = await r.json();
    return { items: j.noticias || [], generado: j.generado, fuentes: j.fuentes || [] };
  }

  /* ---------- refresco en vivo (opcional) ---------- */
  async function refrescarEnVivo(fuentes) {
    if (!cfg.actualizarEnVivo || !cfg.proxyCors || !fuentes?.length) return null;

    const parser = new DOMParser();
    const resultados = await Promise.allSettled(fuentes.map(async (f) => {
      const r = await fetch(cfg.proxyCors + encodeURIComponent(f.url), { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const xml = parser.parseFromString(await r.text(), 'text/xml');
      if (xml.querySelector('parsererror')) throw new Error('xml inválido');

      const esGoogle = f.url.includes('news.google.com');

      return [...xml.querySelectorAll('item, entry')].slice(0, 8).map((it) => {
        const t = (s) => it.querySelector(s)?.textContent?.trim() || '';
        const enlace = t('link') || it.querySelector('link')?.getAttribute('href') || '';
        const desc = t('description') || t('summary') || t('content');

        // Google News escribe el título como "Titular - Medio"
        let titulo = t('title');
        const medioRss = t('source');
        let medio = medioRss || f.nombre;
        if (esGoogle) {
          if (medioRss && titulo.toLowerCase().endsWith(' - ' + medioRss.toLowerCase())) {
            titulo = titulo.slice(0, -(medioRss.length + 3));
          } else {
            const corte = titulo.lastIndexOf(' - ');
            if (corte > 20) { medio = medioRss || titulo.slice(corte + 3); titulo = titulo.slice(0, corte); }
          }
        }

        const limpioDesc = desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return {
          titulo,
          resumen: (!esGoogle && limpioDesc.length > 50) ? limpioDesc.slice(0, 230) : '',
          enlace,
          fecha: new Date(t('pubDate') || t('published') || t('updated') || Date.now()).toISOString(),
          fuente: medio.slice(0, 34),
          tipo: f.tipo,
          imagen: it.querySelector('enclosure')?.getAttribute('url')
               || (desc.match(/<img[^>]+src=["']([^"']+)/) || [])[1] || ''
        };
      }).filter((n) => n.titulo && n.enlace &&
                       (n.tipo !== 'prensa' || RELEVANTE.test(n.titulo)));
    }));

    const items = resultados.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
    return items.length ? items : null;
  }

  /* ---------- orquestación ---------- */
  (async () => {
    esqueleto();
    marcarEstado('Cargando…');

    let base = [];
    let fuentes = [];
    try {
      const local = await cargarLocal();
      base = local.items;
      fuentes = local.fuentes || [];
      todas = base;
      pintar();
      marcarEstado(local.generado
        ? 'Actualizado ' + fechaLarga(local.generado)
        : 'Contenido cargado');
    } catch {
      marcarEstado('Sin conexión al archivo de noticias', false);
    }

    // Refresco en vivo (opcional; ver assets/js/config.js)
    try {
      const nuevos = await refrescarEnVivo(fuentes);
      if (nuevos?.length) {
        const vistos = new Set();
        todas = [...nuevos, ...base]
          .filter((n) => n.enlace && !vistos.has(n.enlace) && vistos.add(n.enlace))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        pintar();
        marcarEstado('Actualizado hace instantes');
      }
    } catch { /* el respaldo local ya está en pantalla */ }

    if (!todas.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; padding:2.5rem; border:1px dashed var(--borde); border-radius:var(--radio); text-align:center">
          <p class="lead" style="margin-inline:auto">
            Aún no hay noticias cargadas. Ejecuta <code>npm run noticias</code>
            o revisa el <a href="https://www.lionsclubs.org/es" target="_blank" rel="noopener" class="link-u">sitio oficial de Lions International</a>.
          </p>
        </div>`;
      marcarEstado('Sin noticias', false);
    }
  })();
})();
