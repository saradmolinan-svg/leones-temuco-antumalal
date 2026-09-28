/* =========================================================================
   EXPERIENCIA.JS — MOTOR DE LA VERSIÓN INMERSIVA
   Club de Leones Temuco Antumalal
   -------------------------------------------------------------------------
   Equivale a main.js, pero para experiencia.html. Sin dependencias externas.
   Los datos salen de window.CLUB, que contenido.js ya rellenó con lo que se
   escribió en el panel de administración.
   ========================================================================= */
(() => {
  'use strict';

  const C = window.CLUB || {};
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const menos = () => matchMedia('(prefers-reduced-motion: reduce)').matches
                   || document.body.classList.contains('sin-animacion');

  const esc = (v) => String(v == null ? '' : v)
    .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ═══════════════ 1. PANTALLA DE CARGA ═══════════════ */
  (() => {
    const caja = $('#carga'), num = $('#cargaN'), barra = $('#cargaBarra');
    if (!caja) return;
    let n = 0;
    const paso = setInterval(() => {
      n = Math.min(100, n + Math.random() * 16 + 5);
      num.textContent = Math.round(n);
      barra.style.width = n + '%';
      if (n >= 100) clearInterval(paso);
    }, 110);

    const cerrar = () => {
      clearInterval(paso);
      num.textContent = '100';
      barra.style.width = '100%';
      setTimeout(() => {
        caja.classList.add('fuera');
        document.body.classList.remove('no-scroll');
        revelarVisibles();
      }, 360);
    };
    document.body.classList.add('no-scroll');
    if (document.readyState === 'complete') setTimeout(cerrar, 500);
    else window.addEventListener('load', () => setTimeout(cerrar, 400));
    setTimeout(cerrar, 4500);              // por si una imagen nunca carga
  })();

  /* ═══════════════ 2. BARRA DE PROGRESO Y PARALAJE ═══════════════ */
  const fondo = $('#portadaFondo');
  let ticking = false;

  function alScroll() {
    const y = scrollY;
    const alto = document.documentElement.scrollHeight - innerHeight;
    const barra = $('#progreso');
    if (barra) barra.style.width = (alto > 0 ? (y / alto) * 100 : 0) + '%';
    if (fondo && !menos()) fondo.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    revelarVisibles();
    ticking = false;
  }

  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(alScroll);
  }, { passive: true });

  /* ═══════════════ 3. REVELADO AL ENTRAR EN PANTALLA ═══════════════ */
  let porRevelar = [];

  function registrar() {
    porRevelar = [...$$('[data-rev]'), ...$$('.split')].filter((e) => !e.classList.contains('visible'));
  }

  function revelarVisibles() {
    if (!porRevelar.length) return;
    const limite = innerHeight * 0.88;
    porRevelar = porRevelar.filter((el) => {
      if (el.getBoundingClientRect().top > limite) return true;
      el.classList.add('visible');
      return false;
    });
  }

  /* Parte los titulares en palabras para que suban una a una */
  function prepararSplit() {
    $$('.split').forEach((el) => {
      if (el.dataset.partido) return;
      el.dataset.partido = '1';
      const trozos = [];
      let i = 0;

      const recorrer = (nodo) => {
        [...nodo.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            n.textContent.split(/(\s+)/).forEach((p) => {
              if (!p.trim()) { trozos.push(document.createTextNode(p)); return; }
              const w = document.createElement('span');
              w.className = 'palabra';
              const inner = document.createElement('i');
              inner.textContent = p;
              inner.style.setProperty('--i', i++);
              w.appendChild(inner);
              trozos.push(w);
            });
          } else if (n.nodeType === 1) {
            // Conserva el <em> dorado del titular
            const copia = n.cloneNode(false);
            const guarda = trozos.length;
            recorrer(n);
            copia.append(...trozos.splice(guarda));
            trozos.push(copia);
          }
        });
      };

      recorrer(el);
      el.replaceChildren(...trozos);
    });
  }

  /* ═══════════════ 4. MENÚ DE PANTALLA COMPLETA ═══════════════ */
  (() => {
    const btn = $('#btnMenu'), menu = $('#menu');
    if (!btn || !menu) return;
    menu.hidden = false;

    const cerrar = () => {
      document.body.classList.remove('menu-abierto', 'no-scroll');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
    };

    btn.addEventListener('click', () => {
      const abierto = document.body.classList.toggle('menu-abierto');
      document.body.classList.toggle('no-scroll', abierto);
      btn.setAttribute('aria-expanded', String(abierto));
      btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    $$('a', menu).forEach((a) => a.addEventListener('click', cerrar));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  })();

  /* Anclas con desplazamiento suave */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const destino = $(id);
      if (!destino) return;
      e.preventDefault();
      destino.scrollIntoView({ behavior: menos() ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ═══════════════ 5. CONTADORES ═══════════════ */
  function animarContadores(raiz) {
    $$('[data-contador]', raiz).forEach((el) => {
      if (el.dataset.listo) return;
      el.dataset.listo = '1';
      const fin = parseFloat(el.dataset.contador) || 0;
      const suf = el.dataset.sufijo || '';
      const plano = el.dataset.formato === 'plano';
      const fmt = (v) => (plano ? String(Math.round(v)) : Math.round(v).toLocaleString('es-CL')) + suf;

      if (menos()) { el.textContent = fmt(fin); return; }

      const dur = 1700, t0 = performance.now();
      (function paso(t) {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = fmt(fin * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(paso);
      })(t0);
    });
  }

  /* ═══════════════ 6. CONTENIDO QUE VIENE DE LA CONFIGURACIÓN ═══════════════ */

  const waLink = () => {
    const n = (C.contacto?.whatsapp || '').replace(/\D/g, '');
    const m = encodeURIComponent(C.contacto?.whatsappMsg || 'Hola');
    return n ? `https://wa.me/${n}?text=${m}` : (C.redes?.instagram || '#');
  };
  $$('[data-whatsapp]').forEach((a) => {
    a.href = waLink(); a.target = '_blank'; a.rel = 'noopener';
  });

  /* Cifras de impacto */
  (() => {
    const cont = $('#contadores');
    if (!cont || !C.impacto) return;
    cont.innerHTML = C.impacto.map((d) => `
      <div class="cifra">
        <b data-contador="${d.valor}" data-sufijo="${esc(d.sufijo || '')}" ${d.formato === 'plano' ? 'data-formato="plano"' : ''}>0</b>
        <span>${esc(d.etiqueta)}</span>
      </div>`).join('');
  })();

  /* Redes de la píldora */
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
    cont.innerHTML = [
      ['instagram', r.instagram, 'Instagram'],
      ['facebook', r.facebook, 'Facebook'],
      ['youtube', r.youtube, 'YouTube'],
      ['web', r.sitioEclubhouse, 'Sitio oficial e-Clubhouse']
    ].filter(([, url]) => url).map(([k, url, t]) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(t)}" title="${esc(t)}">
         <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${svg[k]}</svg>
       </a>`).join('');
  })();

  /* Datos de contacto */
  (() => {
    const cont = $('#datosContacto');
    if (!cont) return;
    const k = C.contacto || {}, id = C.identidad || {};
    const fila = (t, v, href) =>
      `<div class="dato"><b>${esc(t)}</b>${href ? `<a href="${esc(href)}">${esc(v)}</a>` : `<p>${esc(v)}</p>`}</div>`;
    cont.innerHTML =
      fila('Dónde nos reunimos', k.direccion || id.ciudad) +
      fila('Sesiones', k.horario || '') +
      (k.email ? fila('Correo', k.email, 'mailto:' + k.email) : '') +
      (k.telefono ? fila('Teléfono', k.telefono, 'tel:' + k.telefono.replace(/\s/g, '')) : '');

    // Los mismos datos, dentro del menú de pantalla completa
    const dir = $('#menuDireccion'), hor = $('#menuHorario'), mail = $('#menuMail'), tel = $('#menuTel');
    if (dir) dir.textContent = k.direccion || id.ciudad || '';
    if (hor) hor.textContent = k.horario || '';
    if (mail && k.email) { mail.textContent = k.email; mail.href = 'mailto:' + k.email; }
    if (tel && k.telefono) { tel.textContent = k.telefono; tel.href = 'tel:' + k.telefono.replace(/\s/g, ''); }
  })();

  /* Datos bancarios */
  (() => {
    const cont = $('#donaDatos');
    if (!cont || !C.donaciones) return;
    const d = C.donaciones;
    const fila = (t, v, copiable) => `
      <div class="dona__fila">
        <span>${esc(t)}</span>
        <b>${esc(v)}${copiable ? ` <button class="dona__copiar" data-copiar="${esc(v)}" type="button">copiar</button>` : ''}</b>
      </div>`;
    cont.innerHTML =
      fila('Titular', d.titular) + fila('RUT', d.rut, true) + fila('Banco', d.banco) +
      fila('Tipo de cuenta', d.tipo) + fila('N° de cuenta', d.numero, true) + fila('Correo', d.email, true);

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

  /* Agenda: sesiones fijas + actividades del panel (misma lógica que main.js) */
  (() => {
    const cont = $('#agenda');
    if (!cont) return;
    const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const cfg = C.agenda || {};
    const lugar = cfg.lugar || 'Centro de reuniones quincho Martin Lutero, Temuco.';
    const hora  = cfg.hora  || '20:30 h';
    const cupo  = Math.max(1, parseInt(cfg.maximo, 10) || 6);

    const lunes = (a, m, cual) => {
      const d = new Date(a, m, 1);
      return new Date(a, m, 1 + ((8 - d.getDay()) % 7) + (cual === 2 ? 7 : 21));
    };

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const items = [];

    if (cfg.auto !== false) {
      for (let m = 0; m < 6 && items.length < cupo * 2; m++) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() + m, 1);
        for (const cual of [2, 4]) {
          const f = lunes(d.getFullYear(), d.getMonth(), cual);
          if (f < hoy) continue;
          items.push({
            f,
            titulo: cual === 2 ? (cfg.tituloSegundo || 'Sesión ordinaria')
                               : (cfg.tituloCuarto || 'Sesión ordinaria y trabajo de comisiones'),
            texto: lugar, hora, abierto: false
          });
        }
      }
    }

    (Array.isArray(cfg.eventos) ? cfg.eventos : []).forEach((e) => {
      if (!e || !e.fecha) return;
      const p = String(e.fecha).split('-').map(Number);
      if (p.length < 3 || !p[0]) return;
      const f = new Date(p[0], p[1] - 1, p[2]);
      if (isNaN(f) || f < hoy) return;
      items.push({
        f, titulo: e.titulo || 'Actividad del club', texto: e.texto || lugar,
        hora: e.hora || hora, abierto: e.abierto !== false
      });
    });

    if (!items.length) { cont.innerHTML = ''; return; }
    items.sort((a, b) => a.f - b.f);

    cont.innerHTML = items.slice(0, cupo).map((ev) => `
      <article class="evento">
        <div class="evento__fecha">
          <b>${ev.f.getDate()}</b><span>${MES[ev.f.getMonth()]} ${ev.f.getFullYear()}</span>
        </div>
        <div>
          <h3>${esc(ev.titulo)}</h3>
          <p>${esc(ev.texto)}</p>
        </div>
        <div class="evento__meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          ${esc(ev.hora)}
        </div>
        <span class="evento__tag" data-t="${ev.abierto ? 'abierto' : 'socios'}">${ev.abierto ? 'Abierta a la comunidad' : 'Socios'}</span>
      </article>`).join('');
  })();

  /* Mapa, año e Instagram */
  (() => {
    const m = $('#mapa');
    if (m && C.contacto?.mapaEmbed) m.src = C.contacto.mapaEmbed;
    const a = $('#anio');
    if (a) a.textContent = new Date().getFullYear();
    const ig = $('#btnInstagram');
    if (ig && C.redes?.instagram) ig.href = C.redes.instagram;
  })();

  /* ═══════════════ 7. FRANJA QUE SE DESPLAZA ═══════════════ */
  (() => {
    const pista = $('#marquee');
    if (!pista) return;
    pista.innerHTML += pista.innerHTML;   // duplicar para que el bucle no corte
  })();

  /* ═══════════════ 8. PROYECTOS EN HORIZONTAL ═══════════════ */
  (() => {
    const pista = $('#gridProyectos'), riel = $('#rielProyectos');
    if (!pista) return;

    const actualizar = () => {
      if (!riel) return;
      const max = pista.scrollWidth - pista.clientWidth;
      const p = max > 0 ? pista.scrollLeft / max : 0;
      riel.style.transform = `translateX(${p * ((100 / 0.22) - 100)}%)`;
    };
    pista.addEventListener('scroll', actualizar, { passive: true });
    addEventListener('resize', actualizar);

    /* Arrastrar con el mouse, como en una galería */
    let arrastra = false, x0 = 0, izq0 = 0;
    pista.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;    // el táctil ya funciona solo
      arrastra = true; x0 = e.clientX; izq0 = pista.scrollLeft;
      pista.style.cursor = 'grabbing';
    });
    const soltar = () => { arrastra = false; pista.style.cursor = '' ; };
    addEventListener('pointerup', soltar);
    addEventListener('pointercancel', soltar);
    pista.addEventListener('pointermove', (e) => {
      if (!arrastra) return;
      e.preventDefault();
      pista.scrollLeft = izq0 - (e.clientX - x0);
    });

    /* La rueda del mouse también avanza en horizontal */
    pista.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = pista.scrollWidth - pista.clientWidth;
      if ((e.deltaY > 0 && pista.scrollLeft >= max) || (e.deltaY < 0 && pista.scrollLeft <= 0)) return;
      e.preventDefault();
      pista.scrollLeft += e.deltaY;
    }, { passive: false });

    setTimeout(actualizar, 300);
  })();

  /* ═══════════════ 9. TESTIMONIOS ═══════════════ */
  (() => {
    const caja = $('#carruselPista');
    if (!caja) return;
    const voces = $$('.voz', caja);
    if (!voces.length) return;

    const puntos = $('#vozPuntos');
    let actual = 0, temp = null;

    if (puntos) {
      puntos.innerHTML = voces.map((_, i) =>
        `<button class="voces__punto${i === 0 ? ' activo' : ''}" data-i="${i}" aria-label="Testimonio ${i + 1}"></button>`).join('');
    }

    function ir(i) {
      actual = (i + voces.length) % voces.length;
      voces.forEach((v, n) => v.classList.toggle('activa', n === actual));
      if (puntos) $$('.voces__punto', puntos).forEach((p, n) => p.classList.toggle('activo', n === actual));
      reiniciar();
    }

    function reiniciar() {
      clearInterval(temp);
      if (!menos() && voces.length > 1) temp = setInterval(() => ir(actual + 1), 7000);
    }

    $('#vozPrev')?.addEventListener('click', () => ir(actual - 1));
    $('#vozNext')?.addEventListener('click', () => ir(actual + 1));
    puntos?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) ir(+b.dataset.i);
    });
    reiniciar();
  })();

  /* ═══════════════ 10. PREGUNTAS FRECUENTES ═══════════════ */
  (() => {
    const caja = $('#acordeon');
    if (!caja) return;
    caja.addEventListener('click', (e) => {
      const b = e.target.closest('.faq__b');
      if (!b) return;
      const faq = b.closest('.faq');
      const abierta = faq.classList.contains('abierta');
      $$('.faq.abierta', caja).forEach((f) => {
        f.classList.remove('abierta');
        $('.faq__b', f)?.setAttribute('aria-expanded', 'false');
      });
      if (!abierta) {
        faq.classList.add('abierta');
        b.setAttribute('aria-expanded', 'true');
      }
    });
  })();

  /* ═══════════════ 11. FORMULARIO DE CONTACTO ═══════════════ */
  (() => {
    const form = $('#formContacto');
    if (!form) return;
    const msg = $('#formMsg');

    const validar = () => {
      let ok = true;
      $$('.campo', form).forEach((c) => {
        const campo = $('input,textarea', c);
        if (!campo || !campo.required) return;
        const vacio = !campo.value.trim();
        const mailMal = campo.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campo.value);
        const mal = vacio || mailMal;
        c.classList.toggle('mal', mal);
        if (mal) ok = false;
      });
      return ok;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validar()) return;

      const d = Object.fromEntries(new FormData(form));
      const destino = C.formulario?.endpoint;

      if (!destino) {
        // Sin servicio configurado: se arma el mensaje y se abre WhatsApp
        const texto = `Hola, soy ${d.nombre}.\nMotivo: ${d.motivo}\n\n${d.mensaje}\n\nCorreo: ${d.email}${d.telefono ? `\nTeléfono: ${d.telefono}` : ''}`;
        const n = (C.contacto?.whatsapp || '').replace(/\D/g, '');
        if (n) open(`https://wa.me/${n}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
        else location.href = `mailto:${C.contacto?.email || ''}?subject=${encodeURIComponent('Contacto web · ' + d.motivo)}&body=${encodeURIComponent(texto)}`;
        msg.className = 'form__msg ok';
        msg.textContent = 'Abrimos tu WhatsApp con el mensaje listo para enviar.';
        form.reset();
        return;
      }

      msg.className = 'form__msg ok';
      msg.textContent = 'Enviando…';
      try {
        const r = await fetch(destino, {
          method: C.formulario?.metodo || 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!r.ok) throw new Error(r.status);
        msg.className = 'form__msg ok';
        msg.textContent = '¡Gracias! Recibimos tu mensaje y te responderemos pronto.';
        form.reset();
      } catch {
        msg.className = 'form__msg mal';
        msg.textContent = 'No pudimos enviarlo. Escríbenos por WhatsApp o al correo del club.';
      }
    });

    $$('input,textarea', form).forEach((i) =>
      i.addEventListener('input', () => i.closest('.campo')?.classList.remove('mal')));
  })();

  /* ═══════════════ 12. ACCESIBILIDAD ═══════════════ */
  (() => {
    const caja = $('#a11y');
    if (!caja) return;
    const btn = $('#a11yBtn');
    const guardado = () => {
      try { return JSON.parse(localStorage.getItem('a11y-leones') || '{}'); } catch { return {}; }
    };
    let pref = guardado();

    function aplicar() {
      document.documentElement.style.setProperty('--escala', pref.escala || 1);
      document.body.classList.toggle('alto-contraste', !!pref.contraste);
      document.body.classList.toggle('sin-animacion', !!pref.movimiento);
      $$('#a11yEscala .a11y__opt').forEach((b) =>
        b.classList.toggle('activo', String(pref.escala || 1) === b.dataset.escala));
      $('#a11yContraste')?.setAttribute('aria-pressed', String(!!pref.contraste));
      $('#a11yMovimiento')?.setAttribute('aria-pressed', String(!!pref.movimiento));
      try { localStorage.setItem('a11y-leones', JSON.stringify(pref)); } catch { /* modo incógnito */ }
    }

    btn?.addEventListener('click', () => {
      const abierto = caja.classList.toggle('abierto');
      btn.setAttribute('aria-expanded', String(abierto));
    });
    document.addEventListener('click', (e) => {
      if (!caja.contains(e.target)) {
        caja.classList.remove('abierto');
        btn?.setAttribute('aria-expanded', 'false');
      }
    });

    $$('#a11yEscala .a11y__opt').forEach((b) => b.addEventListener('click', () => {
      pref.escala = parseFloat(b.dataset.escala); aplicar();
    }));
    $('#a11yContraste')?.addEventListener('click', () => { pref.contraste = !pref.contraste; aplicar(); });
    $('#a11yMovimiento')?.addEventListener('click', () => { pref.movimiento = !pref.movimiento; aplicar(); });
    $('#a11yReset')?.addEventListener('click', () => { pref = {}; aplicar(); });

    aplicar();
  })();

  /* ═══════════════ 13. ARRANQUE ═══════════════ */
  prepararSplit();
  registrar();
  alScroll();

  /* Los contadores se animan cuando la sección aparece en pantalla */
  const cifras = $('#contadores');
  if (cifras) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        animarContadores(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    obs.observe(cifras);
  }
  $$('.portada__dato').forEach((d) => animarContadores(d));

  /* Para que noticias.js e instagram.js puedan pedir el revelado
     de lo que inserten después */
  window.LEONES = {
    refrescarAnimaciones() { prepararSplit(); registrar(); revelarVisibles(); }
  };
})();
