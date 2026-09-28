/* =========================================================================
   INSTAGRAM.JS — Feed de @leonestemuco_antumalal
   -------------------------------------------------------------------------
   Instagram no permite leer un perfil público sin API. Este módulo soporta
   tres modos, definidos en assets/js/config.js → CLUB.instagram:

     A) beholdUrl   Feed JSON de behold.so (API oficial de Meta, gratis).
     B) iframeUrl   Widget incrustado (LightWidget, SnapWidget, Elfsight…).
     C) archivoLocal  data/instagram.json curado a mano (modo por defecto).

   Ver docs/CONECTAR-INSTAGRAM.md para el paso a paso.
   ========================================================================= */
(() => {
  'use strict';

  const C = window.CLUB || {};
  const cfg = C.instagram || {};
  const cont = document.querySelector('#igContenedor');
  const meta = document.querySelector('#igMeta');
  if (!cont) return;

  const PERFIL = C.redes?.instagram || 'https://www.instagram.com/';
  const escapar = (s = '') => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const recorte = (s = '', n = 110) => {
    const t = String(s).replace(/\s+/g, ' ').trim();
    return escapar(t.length > n ? t.slice(0, n).trimEnd() + '…' : t);
  };

  /* ---------- render de la grilla ---------- */
  function grilla(posts) {
    cont.innerHTML = `<div class="grid ig">${posts.map((p) => `
      <a class="ig__item" href="${escapar(p.enlace || PERFIL)}" target="_blank" rel="noopener"
         aria-label="Ver publicación en Instagram">
        <img src="${escapar(p.imagen)}" alt="${recorte(p.texto, 70) || 'Publicación de Instagram'}" loading="lazy"
             onerror="this.onerror=null;this.src='assets/img/fotos/ig-1.svg'">
        <span class="ig__over">
          ${p.texto ? `<p>${recorte(p.texto)}</p>` : ''}
          <em>
            ${p.likes != null ? `<span>♥ ${p.likes}</span>` : ''}
            ${p.comentarios != null ? `<span>💬 ${p.comentarios}</span>` : ''}
            ${p.likes == null && p.comentarios == null ? '<span>Ver en Instagram</span>' : ''}
          </em>
        </span>
      </a>`).join('')}</div>`;
    window.LEONES?.refrescarAnimaciones?.();
  }

  function aviso(texto) {
    if (meta) meta.textContent = texto;
  }

  /* ---------- A) behold.so ---------- */
  async function viaBehold(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    const posts = Array.isArray(j) ? j : (j.posts || []);
    if (!posts.length) throw new Error('feed vacío');

    if (j.profile && meta) {
      const p = j.profile;
      aviso([
        p.followersCount != null ? `${Number(p.followersCount).toLocaleString('es-CL')} seguidores` : '',
        p.mediaCount != null ? `${p.mediaCount} publicaciones` : ''
      ].filter(Boolean).join(' · ') || 'Síguenos en Instagram');
    }

    return posts.slice(0, cfg.maximo || 8).map((p) => ({
      imagen: p.sizes?.medium?.mediaUrl || p.thumbnailUrl || p.mediaUrl,
      enlace: p.permalink,
      texto: p.caption || p.prunedCaption || '',
      likes: p.likeCount ?? null,
      comentarios: p.commentsCount ?? null
    }));
  }

  /* ---------- B) iframe de widget ---------- */
  function viaIframe(url) {
    cont.innerHTML = `<iframe class="ig__iframe" src="${escapar(url)}"
      title="Publicaciones de Instagram del Club de Leones Temuco Antumalal"
      scrolling="no" allowtransparency="true" loading="lazy"></iframe>`;
    aviso('Publicaciones recientes');
  }

  /* ---------- C) archivo local curado ---------- */
  async function viaLocal(ruta) {
    const r = await fetch(ruta + '?v=' + Date.now());
    if (!r.ok) throw new Error('sin archivo');
    const j = await r.json();
    const posts = j.publicaciones || [];
    if (!posts.length) throw new Error('vacío');
    if (j.seguidores && meta) aviso(`${Number(j.seguidores).toLocaleString('es-CL')} seguidores · @${C.redes?.instagramUser || ''}`);

    // Las fotos cargadas desde el panel se guardan como "img:clave" y viven
    // en data/imagenes.json; aquí se cambian por la imagen de verdad.
    const mapa = await (window.IMAGENES_CLUB || Promise.resolve(null));
    const resolver = (v) => {
      const s = String(v || '');
      if (!s.startsWith('img:')) return s;
      return (mapa && mapa[s.slice(4)]) || 'assets/img/fotos/ig-1.svg';
    };

    return posts.slice(0, cfg.maximo || 8)
      .map((p) => Object.assign({}, p, { imagen: resolver(p.imagen) }));
  }

  /* ---------- respaldo final ---------- */
  function respaldo() {
    cont.innerHTML = `
      <div style="padding:clamp(2rem,4vw,3rem); border:1px dashed rgba(255,255,255,.22); border-radius:var(--radio); text-align:center">
        <p class="lead lead-b" style="margin:0 auto 1.5rem">
          Nuestras publicaciones más recientes están en Instagram.
          Síguenos para enterarte de cada operativo, campaña y actividad del club.
        </p>
        <a href="${escapar(PERFIL)}" target="_blank" rel="noopener" class="btn btn--oro">
          Abrir @${escapar(C.redes?.instagramUser || 'leonestemuco_antumalal')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
        </a>
      </div>`;
  }

  /* ---------- orquestación ---------- */
  (async () => {
    if (cfg.iframeUrl) { viaIframe(cfg.iframeUrl); return; }

    if (cfg.beholdUrl) {
      try { grilla(await viaBehold(cfg.beholdUrl)); return; }
      catch { /* cae al archivo local */ }
    }

    try { grilla(await viaLocal(cfg.archivoLocal || 'data/instagram.json')); }
    catch { respaldo(); }
  })();
})();
