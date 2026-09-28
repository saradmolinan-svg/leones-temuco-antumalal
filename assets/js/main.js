/* =========================================================================
   MAIN.JS — Interacciones, animaciones y contenido dinámico
   Club de Leones Temuco Antumalal
   Sin dependencias externas.
   ========================================================================= */
(() => {
  'use strict';

  const C = window.CLUB || {};
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
                    || document.body.classList.contains('sin-animacion');

  /* ═══════════════ 1. PRELOADER ═══════════════ */
  (() => {
    const pl = $('#preloader'), barra = $('#plBarra');
    if (!pl) return;
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(p + Math.random() * 18 + 6, 100);
      if (barra) barra.style.width = p + '%';
      if (p >= 100) clearInterval(tick);
    }, 130);

    const cerrar = () => {
      if (barra) barra.style.width = '100%';
      setTimeout(() => {
        pl.classList.add('fuera');
        document.body.classList.remove('no-scroll');
        revelarVisibles();
      }, 320);
    };
    document.body.classList.add('no-scroll');
    if (document.readyState === 'complete') setTimeout(cerrar, 520);
    else addEventListener('load', () => setTimeout(cerrar, 420));
    // red de seguridad: nunca dejar la cortina puesta
    setTimeout(cerrar, 4000);
  })();

  /* ═══════════════ 2. SCROLL SUAVE (tipo Lenis, ligero) ═══════════════ */
  const scroller = (() => {
    const fino = matchMedia('(pointer:fine)').matches && innerWidth > 1024;
    if (!fino || reduce()) return null;

    let actual = scrollY, objetivo = scrollY, activo = false, raf = null;
    const lerp = (a, b, t) => a + (b - a) * t;
    const limite = () => document.documentElement.scrollHeight - innerHeight;

    function bucle() {
      actual = lerp(actual, objetivo, 0.11);
      if (Math.abs(objetivo - actual) < 0.4) { actual = objetivo; activo = false; }
      window.scrollTo(0, actual);
      raf = activo ? requestAnimationFrame(bucle) : null;
    }
    function empujar(dy) {
      objetivo = Math.max(0, Math.min(objetivo + dy, limite()));
      if (!activo) { activo = true; raf = requestAnimationFrame(bucle); }
    }
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || document.body.classList.contains('no-scroll')) return;
      e.preventDefault();
      empujar(e.deltaMode === 1 ? e.deltaY * 22 : e.deltaY);
    }, { passive: false });

    // si el scroll cambia por otra vía (teclado, anclas, barra), resincronizar
    addEventListener('scroll', () => { if (!activo) { actual = objetivo = scrollY; } }, { passive: true });

    return {
      irA(y) {
        objetivo = Math.max(0, Math.min(y, limite()));
        if (!activo) { activo = true; raf = requestAnimationFrame(bucle); }
      },
      sincronizar() { actual = objetivo = scrollY; }
    };
  })();

  /* Anclas con desplazamiento suave y offset del header */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || a.hasAttribute('data-whatsapp')) return;
      const destino = $(id);
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      const y = destino.getBoundingClientRect().top + scrollY -
                ($('#header')?.offsetHeight || 70) + 1;
      if (scroller) scroller.irA(y);
      else scrollTo({ top: y, behavior: reduce() ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ═══════════════ 3. HEADER ═══════════════ */
  const header = $('#header');
  const menu = $('#menuMovil');
  const burger = $('#burger');

  function cerrarMenu() {
    if (!menu?.classList.contains('abierto')) return;
    menu.classList.remove('abierto');
    burger?.classList.remove('abierto');
    burger?.setAttribute('aria-expanded', 'false');
    burger?.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('no-scroll');
  }
  burger?.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    burger.classList.toggle('abierto', abierto);
    burger.setAttribute('aria-expanded', String(abierto));
    burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('no-scroll', abierto);
    if (abierto) {
      $$('#menuMovil a').forEach((a, i) => a.style.transitionDelay = `${120 + i * 55}ms`);
    }
  });
  addEventListener('keydown', (e) => e.key === 'Escape' && cerrarMenu());

  /* ═══════════════ 4. SCROLL: header, progreso, parallax, nav activa ═══════════════ */
  const progreso = $('#progreso');
  const arriba = $('#arriba');
  const heroMedia = $('#heroMedia');
  const secciones = $$('main section[id]');
  const enlacesNav = $$('#nav a');

  let ticking = false;
  function alScroll() {
    const y = scrollY;

    header?.classList.toggle('fijo', y > 40);
    arriba?.classList.toggle('visible', y > 700);

    if (progreso) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progreso.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    if (heroMedia && y < innerHeight * 1.2 && !reduce()) {
      heroMedia.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.02)`;
    }

    // Sección activa en el menú
    let activa = '';
    for (const s of secciones) {
      if (s.getBoundingClientRect().top <= (header?.offsetHeight || 70) + 40) activa = s.id;
    }
    enlacesNav.forEach((a) => a.classList.toggle('activo', a.getAttribute('href') === '#' + activa));

    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(alScroll); }
  }, { passive: true });
  addEventListener('resize', () => { scroller?.sincronizar(); alScroll(); });

  arriba?.addEventListener('click', () => {
    if (scroller) scroller.irA(0);
    else scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
  });

  /* ═══════════════ 5. REVELADO AL SCROLL ═══════════════ */
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visto');
      observador.unobserve(e.target);
      if (e.target.hasAttribute('data-contador') ||
          e.target.querySelector?.('[data-contador]')) animarContadores(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  function registrarRevelados() {
    $$('[data-rev]:not(.visto), .wipe:not(.visto), .split:not(.visto)').forEach((el) => observador.observe(el));
  }
  function revelarVisibles() {
    $$('[data-rev], .wipe, .split').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92 && r.bottom > 0) {
        el.classList.add('visto');
        if (el.hasAttribute('data-contador') || el.querySelector?.('[data-contador]')) animarContadores(el);
      }
    });
  }

  /* Partir titulares en palabras enmascaradas */
  function prepararSplit() {
    $$('.split').forEach((h) => {
      if (h.dataset.listo) return;
      h.dataset.listo = '1';
      const frag = document.createDocumentFragment();
      let i = 0;
      h.childNodes.forEach((nodo) => {
        if (nodo.nodeType === 3) {
          nodo.textContent.split(/(\s+)/).forEach((tk) => {
            if (!tk.trim()) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'palabra';
            const em = document.createElement('i');
            em.textContent = tk;
            em.style.setProperty('--wd', `${i++ * 42}ms`);
            s.appendChild(em);
            frag.appendChild(s);
          });
        } else if (nodo.nodeType === 1) {
          // conserva <em>, <strong>, etc. como una sola palabra animada
          const s = document.createElement('span');
          s.className = 'palabra';
          const em = document.createElement('i');
          em.appendChild(nodo.cloneNode(true));
          em.style.setProperty('--wd', `${i++ * 42}ms`);
          s.appendChild(em);
          frag.appendChild(s);
        }
      });
      h.replaceChildren(frag);
    });
  }

  /* ═══════════════ 6. CONTADORES ═══════════════ */
  function animarContadores(raiz) {
    const objetivos = raiz.hasAttribute?.('data-contador')
      ? [raiz] : $$('[data-contador]', raiz);

    objetivos.forEach((el) => {
      if (el.dataset.corriendo) return;
      el.dataset.corriendo = '1';
      const fin = parseFloat(el.dataset.contador) || 0;
      const suf = el.dataset.sufijo || '';
      const plano = el.dataset.formato === 'plano';
      const dur = reduce() ? 0 : 1700;
      const t0 = performance.now();

      const fmt = (n) => plano ? String(Math.round(n))
                               : Math.round(n).toLocaleString('es-CL');
      (function paso(t) {
        const p = dur === 0 ? 1 : Math.min((t - t0) / dur, 1);
        el.textContent = fmt(fin * (1 - Math.pow(1 - p, 4))) + suf;
        if (p < 1) requestAnimationFrame(paso);
      })(t0);
    });
  }

  /* ═══════════════ 7. MARQUESINA (duplicar para bucle continuo) ═══════════════ */
  (() => {
    const pista = $('#marquee');
    if (!pista) return;
    pista.innerHTML += pista.innerHTML;
  })();

  /* ═══════════════ 8. CARRUSEL DE TESTIMONIOS ═══════════════ */
  (() => {
    const pista = $('#carruselPista');
    if (!pista) return;
    const prev = $('#carrPrev'), next = $('#carrNext'), puntos = $('#carrPuntos');
    const items = $$('.testimonio', pista);
    let idx = 0;

    const porVista = () => innerWidth >= 1100 ? 3 : innerWidth >= 760 ? 2 : 1;
    const maxIdx = () => Math.max(0, items.length - porVista());

    function pintar() {
      idx = Math.min(idx, maxIdx());
      const item = items[0];
      const gap = parseFloat(getComputedStyle(pista).gap) || 20;
      pista.style.transform = `translate3d(-${idx * (item.offsetWidth + gap)}px,0,0)`;
      prev.disabled = idx === 0;
      next.disabled = idx >= maxIdx();
      puntos.innerHTML = Array.from({ length: maxIdx() + 1 }, (_, i) =>
        `<span class="carrusel__punto${i === idx ? ' activo' : ''}"></span>`).join('');
    }
    prev.addEventListener('click', () => { idx--; pintar(); });
    next.addEventListener('click', () => { idx++; pintar(); });
    addEventListener('resize', pintar);

    // arrastre táctil
    let x0 = null;
    pista.addEventListener('touchstart', (e) => x0 = e.touches[0].clientX, { passive: true });
    pista.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 45) { idx += d < 0 ? 1 : -1; idx = Math.max(0, Math.min(idx, maxIdx())); pintar(); }
      x0 = null;
    }, { passive: true });

    pintar();
  })();

  /* ═══════════════ 9. ACORDEÓN ═══════════════ */
  (() => {
    const faqs = $$('#acordeon .faq');
    if (!faqs.length) return;

    function cerrar(faq) {
      const p = $('.faq__p', faq);
      // de "none" a su altura real antes de colapsar, para que la transición corra
      if (p.style.maxHeight === 'none') p.style.maxHeight = p.scrollHeight + 'px';
      requestAnimationFrame(() => { p.style.maxHeight = '0px'; });
      faq.classList.remove('abierta');
      $('.faq__b', faq)?.setAttribute('aria-expanded', 'false');
    }

    function abrir(faq) {
      const p = $('.faq__p', faq);
      faq.classList.add('abierta');
      $('.faq__b', faq)?.setAttribute('aria-expanded', 'true');
      p.style.maxHeight = p.scrollHeight + 'px';
      // al terminar se libera el tope, así el texto nunca queda cortado
      // si cambia el tamaño de letra o el ancho de la ventana
      const fin = (e) => {
        if (e.propertyName !== 'max-height') return;
        if (faq.classList.contains('abierta')) p.style.maxHeight = 'none';
        p.removeEventListener('transitionend', fin);
      };
      p.addEventListener('transitionend', fin);
    }

    faqs.forEach((faq) => {
      $('.faq__b', faq).addEventListener('click', () => {
        const estaba = faq.classList.contains('abierta');
        faqs.forEach((f) => f.classList.contains('abierta') && cerrar(f));
        if (!estaba) abrir(faq);
      });
    });

    // recalcular la abierta si cambia el ancho o el tamaño de texto
    addEventListener('resize', () => {
      const a = faqs.find((f) => f.classList.contains('abierta'));
      if (a) $('.faq__p', a).style.maxHeight = 'none';
    });
  })();

  /* ═══════════════ 10. CONTENIDO DESDE CONFIG ═══════════════ */
  const waLink = () => {
    const n = (C.contacto?.whatsapp || '').replace(/\D/g, '');
    const m = encodeURIComponent(C.contacto?.whatsappMsg || 'Hola');
    return n ? `https://wa.me/${n}?text=${m}` : (C.redes?.instagram || '#');
  };
  $$('[data-whatsapp]').forEach((a) => {
    a.href = waLink();
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* Contadores de impacto */
  (() => {
    const cont = $('#contadores');
    if (!cont || !C.impacto) return;
    cont.innerHTML = C.impacto.map((d) => `
      <div class="contador">
        <b data-contador="${d.valor}" data-sufijo="${d.sufijo || ''}" ${d.formato === 'plano' ? 'data-formato="plano"' : ''}>0</b>
        <span>${d.etiqueta}</span>
      </div>`).join('');
  })();

  /* Datos de contacto */
  (() => {
    const cont = $('#datosContacto');
    if (!cont) return;
    const k = C.contacto || {}, id = C.identidad || {};
    const ico = {
      pin: '<path d="M12 22c5-3 8-7 8-12a8 8 0 1 0-16 0c0 5 3 9 8 12Z"/><circle cx="12" cy="10" r="3"/>',
      mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
      tel: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
      reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
    };
    const fila = (i, t, v, href) => `
      <div class="dato">
        <i><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ico[i]}</svg></i>
        <div><b>${t}</b>${href ? `<a href="${href}">${v}</a>` : `<p>${v}</p>`}</div>
      </div>`;
    cont.innerHTML =
      fila('pin', 'Dónde nos reunimos', k.direccion || id.ciudad, null) +
      fila('reloj', 'Sesiones', k.horario || '', null) +
      (k.email ? fila('mail', 'Correo', k.email, 'mailto:' + k.email) : '') +
      (k.telefono ? fila('tel', 'Teléfono', k.telefono, 'tel:' + k.telefono.replace(/\s/g, '')) : '');
  })();

  /* Redes del footer */
  (() => {
    const cont = $('#redes');
    if (!cont) return;
    const r = C.redes || {};
    const svg = {
      instagram: '<rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/>',
      facebook: '<path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V11H5v4h3v7h4v-7h3l1-4h-4V7.5a.5.5 0 0 1 .5-.5H15z"/>',
      youtube: '<path d="M22 12s0-3.4-.4-5c-.3-.9-1-1.6-1.9-1.8C18 4.7 12 4.7 12 4.7s-6 0-7.7.5c-.9.2-1.6.9-1.9 1.8C2 8.6 2 12 2 12s0 3.4.4 5c.3.9 1 1.6 1.9 1.8 1.7.5 7.7.5 7.7.5s6 0 7.7-.5c.9-.2 1.6-.9 1.9-1.8.4-1.6.4-5 .4-5Z"/><path d="m10 15 5-3-5-3z"/>',
      web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>'
    };
    const enlaces = [
      ['instagram', r.instagram, 'Instagram'],
      ['facebook', r.facebook, 'Facebook'],
      ['youtube', r.youtube, 'YouTube'],
      ['web', r.sitioEclubhouse, 'Sitio oficial e-Clubhouse']
    ].filter(([, url]) => url);
    cont.innerHTML = enlaces.map(([k, url, t]) =>
      `<a href="${url}" target="_blank" rel="noopener" aria-label="${t}" title="${t}">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${svg[k]}</svg>
       </a>`).join('');
  })();

  /* Datos de donación */
  (() => {
    const cont = $('#donaDatos');
    if (!cont || !C.donaciones) return;
    const d = C.donaciones;
    const fila = (t, v, copiable) => `
      <div class="dona__fila">
        <span>${t}</span>
        <b>${v}${copiable ? ` <button class="dona__copiar" data-copiar="${v}" type="button">copiar</button>` : ''}</b>
      </div>`;
    cont.innerHTML =
      fila('Titular', d.titular) + fila('RUT', d.rut, true) + fila('Banco', d.banco) +
      fila('Tipo de cuenta', d.tipo) + fila('N° de cuenta', d.numero, true) +
      fila('Correo', d.email, true);

    cont.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-copiar]');
      if (!b) return;
      try {
        await navigator.clipboard.writeText(b.dataset.copiar);
        const t = b.textContent; b.textContent = '¡copiado!';
        setTimeout(() => b.textContent = t, 1600);
      } catch { /* el navegador puede bloquear el portapapeles */ }
    });
  })();

  /* Agenda
     Combina dos orígenes y los ordena por fecha:
       1. Las sesiones fijas (2° y 4° lunes), que se calculan solas y por eso
          nunca quedan desactualizadas.
       2. Las actividades puntuales cargadas desde el panel de administración
          (CLUB.agenda.eventos), como operativos, cenas o aniversarios.
     Todo lo configurable vive en CLUB.agenda; si no hay nada, usa los
     valores de siempre. */
  (() => {
    const cont = $('#agenda');
    if (!cont) return;
    const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const cfg = C.agenda || {};
    const lugar  = cfg.lugar || 'Centro de reuniones quincho Martin Lutero, Temuco.';
    const hora   = cfg.hora  || '20:30 h';
    const cupo   = Math.max(1, parseInt(cfg.maximo, 10) || 6);
    const escapa = (v) => String(v == null ? '' : v)
      .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function lunesDeMes(anio, mes, cual) {   // cual: 2 = segundo, 4 = cuarto
      const d = new Date(anio, mes, 1);
      const salto = (8 - d.getDay()) % 7;    // días hasta el primer lunes
      return new Date(anio, mes, 1 + salto + (cual === 2 ? 7 : 21));
    }

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const items = [];

    /* 1. Sesiones automáticas */
    if (cfg.auto !== false) {
      for (let m = 0; m < 6 && items.length < cupo * 2; m++) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() + m, 1);
        for (const cual of [2, 4]) {
          const f = lunesDeMes(d.getFullYear(), d.getMonth(), cual);
          if (f < hoy) continue;
          items.push({
            f,
            titulo: cual === 2
              ? (cfg.tituloSegundo || 'Sesión ordinaria')
              : (cfg.tituloCuarto  || 'Sesión ordinaria y trabajo de comisiones'),
            texto: lugar,
            hora,
            abierto: false
          });
        }
      }
    }

    /* 2. Actividades cargadas en el panel */
    (Array.isArray(cfg.eventos) ? cfg.eventos : []).forEach((e) => {
      if (!e || !e.fecha) return;
      const p = String(e.fecha).split('-').map(Number);          // AAAA-MM-DD
      if (p.length < 3 || !p[0]) return;
      const f = new Date(p[0], p[1] - 1, p[2]);
      if (isNaN(f) || f < hoy) return;                            // no mostrar lo ya pasado
      items.push({
        f,
        titulo: e.titulo || 'Actividad del club',
        texto: e.texto || lugar,
        hora: e.hora || hora,
        abierto: e.abierto !== false
      });
    });

    if (!items.length) { cont.innerHTML = ''; return; }

    items.sort((a, b) => a.f - b.f);

    cont.innerHTML = items.slice(0, cupo).map((ev) => `
      <article class="evento">
        <div class="evento__fecha">
          <b>${ev.f.getDate()}</b>
          <span>${MES[ev.f.getMonth()]} ${ev.f.getFullYear()}</span>
        </div>
        <div>
          <h3>${escapa(ev.titulo)}</h3>
          <p>${escapa(ev.texto)}</p>
        </div>
        <div class="evento__meta">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          ${escapa(ev.hora)}
        </div>
        <span class="evento__tag" data-t="${ev.abierto ? 'abierto' : 'socios'}">${ev.abierto ? 'Abierta a la comunidad' : 'Socios'}</span>
      </article>`).join('');
  })();

  /* Mapa y año */
  (() => {
    const m = $('#mapa');
    if (m && C.contacto?.mapaEmbed) m.src = C.contacto.mapaEmbed;
    const a = $('#anio');
    if (a) a.textContent = new Date().getFullYear();
  })();

  /* ═══════════════ 11. FORMULARIO DE CONTACTO ═══════════════ */
  (() => {
    const form = $('#formContacto');
    if (!form) return;
    const msg = $('#formMsg');

    const validar = () => {
      let ok = true;
      $$('.campo', form).forEach((campo) => {
        const inp = $('input,textarea,select', campo);
        if (!inp || !inp.required) return;
        const v = inp.value.trim();
        const malo = !v || (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
        campo.classList.toggle('error', malo);
        if (malo) ok = false;
      });
      return ok;
    };
    form.addEventListener('input', (e) => e.target.closest('.campo')?.classList.remove('error'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.className = 'form__msg';
      if (!validar()) {
        msg.className = 'form__msg mal';
        msg.textContent = 'Revisa los campos marcados antes de enviar.';
        return;
      }

      const datos = Object.fromEntries(new FormData(form));
      const endpoint = C.formulario?.endpoint;

      if (!endpoint) {
        // Sin endpoint configurado: se redacta el mensaje y se abre WhatsApp
        const txt = `Hola, soy ${datos.nombre}.\nMotivo: ${datos.motivo}\nCorreo: ${datos.email}\nTeléfono: ${datos.telefono || '—'}\n\n${datos.mensaje}`;
        const n = (C.contacto?.whatsapp || '').replace(/\D/g, '');
        if (n) open(`https://wa.me/${n}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
        else location.href = `mailto:${C.contacto?.email || ''}?subject=${encodeURIComponent('Contacto web: ' + datos.motivo)}&body=${encodeURIComponent(txt)}`;
        msg.className = 'form__msg ok';
        msg.textContent = 'Abrimos tu mensaje listo para enviar. ¡Gracias por escribirnos!';
        form.reset();
        return;
      }

      const btn = $('button[type=submit]', form);
      const etiqueta = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Enviando…';
      try {
        const r = await fetch(endpoint, {
          method: C.formulario.metodo || 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!r.ok) throw new Error(r.status);
        msg.className = 'form__msg ok';
        msg.textContent = '¡Mensaje enviado! Te responderemos a la brevedad.';
        form.reset();
      } catch {
        msg.className = 'form__msg mal';
        msg.textContent = 'No pudimos enviar el mensaje. Escríbenos por WhatsApp o al correo del club.';
      } finally {
        btn.disabled = false; btn.innerHTML = etiqueta;
      }
    });
  })();

  /* ═══════════════ 12. WIDGET DE ACCESIBILIDAD ═══════════════ */
  (() => {
    const caja = $('#a11y');
    if (!caja) return;
    const btn = $('#a11yBtn');
    const LS = 'leones-a11y';
    let estado = { escala: 1, contraste: false, movimiento: false };
    try { estado = { ...estado, ...JSON.parse(localStorage.getItem(LS) || '{}') }; } catch {}

    function aplicar() {
      document.documentElement.style.setProperty('--escala', estado.escala);
      document.body.classList.toggle('contraste', estado.contraste);
      document.body.classList.toggle('sin-animacion', estado.movimiento);
      $$('#a11yEscala .a11y__opt').forEach((b) =>
        b.classList.toggle('activo', parseFloat(b.dataset.escala) === estado.escala));
      const c = $('#a11yContraste'), m = $('#a11yMovimiento');
      c?.classList.toggle('activo', estado.contraste);
      c?.setAttribute('aria-pressed', String(estado.contraste));
      m?.classList.toggle('activo', estado.movimiento);
      m?.setAttribute('aria-pressed', String(estado.movimiento));
      try { localStorage.setItem(LS, JSON.stringify(estado)); } catch {}
    }

    btn.addEventListener('click', () => {
      const abierto = caja.classList.toggle('abierto');
      btn.setAttribute('aria-expanded', String(abierto));
    });
    document.addEventListener('click', (e) => {
      if (!caja.contains(e.target)) { caja.classList.remove('abierto'); btn.setAttribute('aria-expanded', 'false'); }
    });
    $$('#a11yEscala .a11y__opt').forEach((b) =>
      b.addEventListener('click', () => { estado.escala = parseFloat(b.dataset.escala); aplicar(); }));
    $('#a11yContraste')?.addEventListener('click', () => { estado.contraste = !estado.contraste; aplicar(); });
    $('#a11yMovimiento')?.addEventListener('click', () => {
      estado.movimiento = !estado.movimiento;
      aplicar();
      if (estado.movimiento) $$('[data-rev], .wipe, .split').forEach((el) => el.classList.add('visto'));
    });
    $('#a11yReset')?.addEventListener('click', () => {
      estado = { escala: 1, contraste: false, movimiento: false }; aplicar();
    });

    aplicar();
  })();

  /* ═══════════════ 13. ARRANQUE ═══════════════ */
  prepararSplit();
  registrarRevelados();
  alScroll();

  // Reobservar lo que inserten los módulos de noticias e Instagram
  window.LEONES = {
    refrescarAnimaciones() { prepararSplit(); registrarRevelados(); },
    scroller
  };
})();
