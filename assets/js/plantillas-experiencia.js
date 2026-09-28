/* =========================================================================
   PLANTILLAS-EXPERIENCIA.JS
   -------------------------------------------------------------------------
   Le dice a contenido.js cómo dibujar cada lista en experiencia.html.

   El contenido es EXACTAMENTE EL MISMO que el de index.html: sale de
   data/contenido.json, o sea, de lo que se escribe en el panel de
   administración. Lo único que cambia aquí es la forma de mostrarlo.

   Se carga ANTES que contenido.js.
   ========================================================================= */

/* Motor propio de esta versión (en lugar de main.js) */
window.SCRIPTS_SITIO = ['experiencia', 'noticias', 'instagram'];

window.PLANTILLAS_SITIO = {

  /* Causas: una lista larga que se enciende al pasar el mouse */
  causas: (c, i, h) => `
    <article class="causa" data-rev="up"${h.d(i, 60)}>
      <span class="causa__n">${String(i + 1).padStart(2, '0')}</span>
      <div class="causa__cuerpo">
        <h3>${h.esc(c.titulo)}</h3>
        <p>${h.limpiar(c.texto)}</p>
      </div>
      <span class="causa__ico">${h.svg(c.icono)}</span>
    </article>`,

  /* Sello de trabajo y valores comparten forma de bloque */
  sellos: (s, i, h) => `
    <article class="bloque" data-rev="up"${h.d(i, 70)}>
      <h3>${h.esc(s.titulo)}</h3>
      <p>${h.limpiar(s.texto)}</p>
    </article>`,

  valores: (v, i, h) => `
    <article class="bloque" data-rev="up"${h.d(i, 70)}>
      <span class="bloque__ico">${h.svg(v.icono)}</span>
      <h3>${h.esc(v.titulo)}</h3>
      <p>${h.limpiar(v.texto)}</p>
    </article>`,

  /* Proyectos: tarjetas verticales que se recorren en horizontal */
  proyectos: (p, i, h) => `
    <a href="${h.esc(p.enlace || '#contacto')}" class="tarjeta" data-rev="up"${h.d(i, 60)}>
      <img src="${h.esc(h.imagenSrc(p.imagen))}" alt="${h.esc(p.titulo)}" loading="lazy" data-img-ref="${h.esc(p.imagen || '')}">
      <span class="tarjeta__velo"></span>
      <div class="tarjeta__in">
        ${p.tag ? `<span class="tarjeta__tag">${h.esc(p.tag)}</span>` : ''}
        <h3>${h.esc(p.titulo)}</h3>
        <p>${h.limpiar(p.texto)}</p>
      </div>
    </a>`,

  /* Directorio: retratos en blanco y negro que se colorean al pasar */
  directiva: (m, i, h) => `
    <article class="persona" data-rev="up"${h.d(i, 70)}>
      <div class="persona__foto">
        <img src="${h.esc(h.imagenSrc(m.foto, 'assets/img/fotos/directiva-1.svg'))}" alt="${h.esc(m.nombre)}" loading="lazy" data-img-ref="${h.esc(m.foto || '')}">
      </div>
      <h3>${h.esc(m.nombre)}</h3>
      <span>${h.esc(m.cargo)}</span>
    </article>`,

  /* Testimonios: uno a la vez, a pantalla grande (los rota experiencia.js) */
  testimonios: (t, i, h) => `
    <article class="voz${i === 0 ? ' activa' : ''}">
      <p>${h.limpiar(t.texto)}</p>
      <footer>
        <span class="voz__ini">${h.esc(t.iniciales || h.iniciales(t.autor))}</span>
        <span><b>${h.esc(t.autor)}</b><em>${h.esc(t.detalle || '')}</em></span>
      </footer>
    </article>`,

  faq: (f, i, h) => `
    <div class="faq" data-rev="up"${h.d(i, 40)}>
      <button class="faq__b" aria-expanded="false">${h.esc(f.pregunta)}<span class="faq__ico"></span></button>
      <div class="faq__p"><div><p>${h.limpiar(f.respuesta)}</p></div></div>
    </div>`,

  donaOps: (o, i, h) => `
    <article class="bloque" data-rev="up"${h.d(i, 70)}>
      <span class="bloque__ico">${h.svg(o.icono)}</span>
      <h3>${h.esc(o.titulo)}</h3>
      <p>${h.limpiar(o.texto)}</p>
    </article>`,

  clubFirma: (f, i, h) => `
    <div class="firma__item"><b>${h.esc(f.dato)}</b><span>${h.esc(f.etiqueta)}</span></div>`
};
