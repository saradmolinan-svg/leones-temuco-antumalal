/* =========================================================================
   REDISENO-GL.JS — LA MELENA
   -------------------------------------------------------------------------
   Nube de ~14.000 partículas doradas (Three.js) que se transforma entre
   figuras a medida que se recorre la página: el emblema con melena, el
   volcán de La Araucanía, una galaxia de gente, un corazón y un campo de
   ondas. Reacciona al mouse y al scroll.

   Si el navegador no soporta WebGL o la librería no carga, no pasa nada:
   la página sigue funcionando con el fondo de luz de CSS.
   ========================================================================= */
(() => {
  'use strict';

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  const MOV_REDUCIDO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOVIL = matchMedia('(max-width: 800px)').matches || /Mobi|Android/i.test(navigator.userAgent);
  const N = MOVIL ? 7500 : 15000;
  const TAM = 8;                                   // ancho/alto en unidades del mundo de cada figura

  const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

  /* ───────────── Figuras ─────────────
     Las que se dibujan en un canvas 2D se "muestrean": se eligen N píxeles
     encendidos al azar y cada uno se vuelve una partícula. */
  function muestrear(dibujar, w, h, escalaX, escalaY, profundidad) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff'; x.strokeStyle = '#fff';
    dibujar(x, w, h);
    const d = x.getImageData(0, 0, w, h).data;
    const puntos = [];
    for (let i = 0; i < d.length; i += 4) if (d[i] > 140) puntos.push((i / 4) | 0);
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const p = puntos.length ? puntos[(Math.random() * puntos.length) | 0] : 0;
      const px = (p % w) + Math.random(), py = ((p / w) | 0) + Math.random();
      out[i * 3]     = (px / w - 0.5) * escalaX;
      out[i * 3 + 1] = -(py / h - 0.5) * escalaY;
      out[i * 3 + 2] = (Math.random() - 0.5) * profundidad;
    }
    return out;
  }

  const FIGURAS = {
    /* Emblema: el aura de partículas que rodea al medallón 3D (ver crearMoneda).
       Solo la melena de rayos: el disco lo hace la moneda de verdad. */
    emblema() {
      return muestrear((x, w, h) => {
        const cx = w / 2, cy = h / 2;
        const rayos = 48;
        for (let i = 0; i < rayos; i++) {
          const a = (i / rayos) * Math.PI * 2;
          const largo = i % 2 ? 382 : 344;
          const ancho = 0.05;
          x.beginPath();
          x.moveTo(cx + Math.cos(a - ancho) * 300, cy + Math.sin(a - ancho) * 300);
          x.lineTo(cx + Math.cos(a) * largo, cy + Math.sin(a) * largo);
          x.lineTo(cx + Math.cos(a + ancho) * 300, cy + Math.sin(a + ancho) * 300);
          x.closePath(); x.fill();
        }
        x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 396, 0, 7); x.stroke();
      }, 800, 800, TAM, TAM, 0.6);
    },

    /* Volcán de La Araucanía con líneas de nivel, columna de humo y sol */
    volcan() {
      return muestrear((x, w, h) => {
        const suelo = h * 0.86;
        // sol
        x.lineWidth = 5; x.beginPath(); x.arc(w * 0.74, h * 0.27, 92, 0, 7); x.stroke();
        x.beginPath(); x.arc(w * 0.74, h * 0.27, 46, 0, 7); x.fill();
        // cerro trasero
        x.beginPath();
        x.moveTo(-10, suelo); x.bezierCurveTo(w * 0.1, h * 0.6, w * 0.2, h * 0.52, w * 0.33, h * 0.62);
        x.bezierCurveTo(w * 0.42, h * 0.7, w * 0.44, h * 0.76, w * 0.5, suelo); x.closePath();
        x.save(); x.clip();
        for (let y = 0; y < h; y += 15) x.fillRect(0, y, w, 3.4);
        x.restore();
        // cono principal, relleno por bandas (contornos)
        x.save();
        x.beginPath();
        x.moveTo(w * 0.22, suelo);
        x.bezierCurveTo(w * 0.36, h * 0.6, w * 0.44, h * 0.33, w * 0.5, h * 0.27);
        x.lineTo(w * 0.58, h * 0.27);
        x.bezierCurveTo(w * 0.66, h * 0.36, w * 0.78, h * 0.62, w * 0.96, suelo);
        x.closePath(); x.clip();
        for (let y = h * 0.25; y < h; y += 11) x.fillRect(0, y, w, 4.2);
        x.restore();
        x.lineWidth = 5; x.beginPath();
        x.moveTo(w * 0.22, suelo);
        x.bezierCurveTo(w * 0.36, h * 0.6, w * 0.44, h * 0.33, w * 0.5, h * 0.27);
        x.lineTo(w * 0.58, h * 0.27);
        x.bezierCurveTo(w * 0.66, h * 0.36, w * 0.78, h * 0.62, w * 0.96, suelo); x.stroke();
        // humo
        for (let i = 0; i < 26; i++) {
          const t = i / 26;
          x.beginPath();
          x.arc(w * (0.54 + Math.sin(t * 5) * 0.03 + t * 0.06), h * (0.24 - t * 0.2), 5 + t * 15, 0, 7);
          x.stroke();
        }
        // línea de suelo
        x.fillRect(0, suelo, w, 5);
      }, 900, 600, TAM * 1.5, TAM, 0.9);
    },

    /* Corazón */
    corazon() {
      return muestrear((x, w, h) => {
        const cx = w / 2, cy = h / 2 + 20;
        x.beginPath();
        for (let i = 0; i <= 200; i++) {
          const t = (i / 200) * Math.PI * 2;
          const px = 16 * Math.pow(Math.sin(t), 3);
          const py = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
          const X = cx + px * 19, Y = cy - py * 19;
          i ? x.lineTo(X, Y) : x.moveTo(X, Y);
        }
        x.closePath(); x.fill();
        x.globalCompositeOperation = 'destination-out';
      }, 800, 800, TAM, TAM, 1.6);
    },

    /* Galaxia: tres brazos, un núcleo brillante */
    galaxia() {
      const out = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = Math.pow(Math.random(), 0.62) * TAM * 0.62;
        const brazo = (i % 3) * (Math.PI * 2 / 3);
        const a = brazo + r * 0.85 + rand(-0.32, 0.32) * (0.35 + r * 0.1);
        out[i * 3]     = Math.cos(a) * r;
        out[i * 3 + 1] = Math.sin(a) * r * 0.62;
        out[i * 3 + 2] = rand(-0.5, 0.5) * (1 - r / (TAM * 0.7)) * 1.6;
      }
      return out;
    },

    /* Campo de ondas (un valle visto desde arriba) */
    ondas() {
      const out = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const x = rand(-0.5, 0.5) * TAM * 1.7, z = rand(-0.5, 0.5) * TAM * 1.1;
        const y = Math.sin(x * 0.9) * 0.55 + Math.cos(z * 1.2 + x * 0.35) * 0.5 - 0.6;
        out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
      }
      return out;
    }
  };

  /* ───────────── Medallón 3D del escudo ─────────────
     Solo aparece en una sección de cierre (contacto): una moneda de oro
     con el emblema en relieve, real geometría (no partículas): dos caras,
     canto y bisel. El entorno para los reflejos se pinta a mano, cálido
     sobre azul noche. `caraCanvas` es el respaldo dibujado a mano si el
     escudo real (SVG) no se puede leer. */
  function caraCanvas(modo) {
    const S = 1024, c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const col = modo === 'color', cx = S / 2, cy = S / 2;
    const C = (color, alto) => (col ? color : alto);
    const fam = 'Fraunces, Georgia, serif';

    if (col) {
      const g = x.createRadialGradient(cx * 0.8, cy * 0.7, 60, cx, cy, S / 2);
      g.addColorStop(0, '#FFE27A'); g.addColorStop(0.55, '#F5C400'); g.addColorStop(1, '#C99A00');
      x.fillStyle = g;
    } else x.fillStyle = '#4a4a4a';
    x.fillRect(0, 0, S, S);

    const arco = (txt, radio, centro, abajo) => {
      x.font = `800 74px ${fam}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      const sp = 9, ws = [...txt].map((ch) => x.measureText(ch).width + sp);
      const total = ws.reduce((a, b) => a + b, 0) / radio;
      let ang = abajo ? centro + total / 2 : centro - total / 2;
      [...txt].forEach((ch, i) => {
        const paso = ws[i] / radio;
        ang += abajo ? -paso / 2 : paso / 2;
        x.save(); x.translate(cx + Math.cos(ang) * radio, cy + Math.sin(ang) * radio);
        x.rotate(ang + (abajo ? -Math.PI / 2 : Math.PI / 2));
        x.fillStyle = C('#0A2A78', '#ffffff'); x.fillText(ch, 0, 0); x.restore();
        ang += abajo ? -paso / 2 : paso / 2;
      });
    };
    x.strokeStyle = C('#8A6500', '#ffffff'); x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, 490, 0, 7); x.stroke();
    x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, 466, 0, 7); x.stroke();
    arco('CLUB DE LEONES', 418, -Math.PI / 2, false);
    arco('TEMUCO · ANTUMALAL', 418, Math.PI / 2, true);
    [0, Math.PI].forEach((a) => {                            // rombos laterales
      x.save(); x.translate(cx + Math.cos(a) * 418, cy + Math.sin(a) * 418); x.rotate(Math.PI / 4);
      x.fillStyle = C('#0A2A78', '#ffffff'); x.fillRect(-15, -15, 30, 30); x.restore();
    });
    x.strokeStyle = C('#8A6500', '#ffffff'); x.lineWidth = 10; x.beginPath(); x.arc(cx, cy, 352, 0, 7); x.stroke();

    // disco azul central (esmalte)
    if (col) { const g = x.createRadialGradient(cx * 0.85, cy * 0.75, 40, cx, cy, 340); g.addColorStop(0, '#1747BF'); g.addColorStop(1, '#031044'); x.fillStyle = g; }
    else x.fillStyle = '#1c1c1c';
    x.beginPath(); x.arc(cx, cy, 340, 0, 7); x.fill();

    // melena de rayos
    x.fillStyle = C('#FFCD00', '#ffffff');
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2, ancho = 0.065, largo = i % 2 ? 322 : 296;
      x.beginPath();
      x.moveTo(cx + Math.cos(a - ancho) * 214, cy + Math.sin(a - ancho) * 214);
      x.lineTo(cx + Math.cos(a) * largo, cy + Math.sin(a) * largo);
      x.lineTo(cx + Math.cos(a + ancho) * 214, cy + Math.sin(a + ancho) * 214);
      x.closePath(); x.fill();
    }
    x.strokeStyle = C('#FFCD00', '#ffffff'); x.lineWidth = 16; x.beginPath(); x.arc(cx, cy, 196, 0, 7); x.stroke();
    x.fillStyle = C('#0A2A78', '#2a2a2a'); x.beginPath(); x.arc(cx, cy, 184, 0, 7); x.fill();

    x.fillStyle = C('#FFCD00', '#ffffff'); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `800 250px ${fam}`; x.fillText('L', cx, cy - 12);
    x.font = `700 46px ${fam}`; x.fillText('1983', cx, cy + 118);
    return c;
  }

  /* Carga el escudo real del club (SVG, vector) y lo convierte en dos
     texturas: una a color (para el mapa) y otra en grises (para el
     relieve). Es fiel al logo real —incluye las cabezas de león que la
     versión dibujada a mano no tenía—, y al ser vectorial queda nítido a
     cualquier tamaño. */
  function svgAImagen(svgTexto) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgTexto);
    });
  }

  async function caraDesdeEscudo(svgBase, modo) {
    const S = 1024, c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    let svg = svgBase;
    if (modo !== 'color') {
      svg = svg.replaceAll('#00338D', '#141414').replaceAll('#FFCD00', '#f0f0f0')
        .replaceAll('#FFE87A', '#cfcfcf').replaceAll('#DFA800', '#b0b0b0');
    }
    svg = svg.replace('</defs>', '</defs><circle cx="150" cy="150" r="150" fill="url(#oroBrillo)"/>');
    const img = await svgAImagen(svg);
    x.drawImage(img, 0, 0, S, S);
    return c;
  }

  async function crearMoneda(THREE, renderer, escena, R) {
    // entorno para los reflejos (softboxes cálidos sobre azul noche)
    const e = document.createElement('canvas'); e.width = 1024; e.height = 512;
    const g = e.getContext('2d');
    const fondo = g.createLinearGradient(0, 0, 0, 512);
    fondo.addColorStop(0, '#0b2a6e'); fondo.addColorStop(0.5, '#061437'); fondo.addColorStop(1, '#010409');
    g.fillStyle = fondo; g.fillRect(0, 0, 1024, 512);
    [[120, 80, 210, 120, '#fff3cf'], [430, 40, 160, 90, '#ffffff'], [700, 130, 260, 110, '#ffd970'], [900, 60, 100, 200, '#9bbcff'], [300, 300, 200, 60, '#ffe9a8']]
      .forEach(([px, py, w, h, c]) => {
        const r = g.createLinearGradient(px, py, px + w, py + h); r.addColorStop(0, c); r.addColorStop(1, 'rgba(255,255,255,.2)');
        g.fillStyle = r; g.fillRect(px, py, w, h);
      });
    const envTex = new THREE.CanvasTexture(e);
    envTex.mapping = THREE.EquirectangularReflectionMapping; envTex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(envTex).texture;
    envTex.dispose(); pm.dispose();

    const aniso = renderer.capabilities.getMaxAnisotropy();
    let mapa, relieve;
    try {
      const svgBase = await (await fetch('assets/img/escudo.svg')).text();
      const [cColor, cAltura] = await Promise.all([caraDesdeEscudo(svgBase, 'color'), caraDesdeEscudo(svgBase, 'altura')]);
      mapa = new THREE.CanvasTexture(cColor);
      relieve = new THREE.CanvasTexture(cAltura);
    } catch (e) {
      console.warn('[GL] No se pudo leer assets/img/escudo.svg, se dibuja uno de respaldo:', e);
      mapa = new THREE.CanvasTexture(caraCanvas('color'));
      relieve = new THREE.CanvasTexture(caraCanvas('altura'));
    }
    mapa.colorSpace = THREE.SRGBColorSpace; mapa.anisotropy = aniso;
    relieve.anisotropy = aniso;

    const matCara = new THREE.MeshStandardMaterial({ map: mapa, bumpMap: relieve, bumpScale: 3.2, metalness: 0.92, roughness: 0.3, envMap: env, envMapIntensity: 1.5 });
    const matOro = new THREE.MeshStandardMaterial({ color: 0xffc800, metalness: 1, roughness: 0.22, envMap: env, envMapIntensity: 1.7 });

    const T = 0.34;
    const grupo = new THREE.Group();
    const frente = new THREE.Mesh(new THREE.CircleGeometry(R * 0.985, 128), matCara);
    frente.position.z = T / 2 + 0.002;
    const dorso = frente.clone(); dorso.rotation.y = Math.PI; dorso.position.z = -T / 2 - 0.002;
    const canto = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 128, 1, true), matOro);
    canto.rotation.x = Math.PI / 2;
    const bisel = new THREE.TorusGeometry(R * 0.99, 0.07, 24, 160);
    const b1 = new THREE.Mesh(bisel, matOro); b1.position.z = T / 2;
    const b2 = new THREE.Mesh(bisel, matOro); b2.position.z = -T / 2;
    grupo.add(frente, dorso, canto, b1, b2);

    // luces: una cálida fija, una fría de contraluz y una que sigue al mouse
    const cal = new THREE.DirectionalLight(0xfff0c8, 2.4); cal.position.set(3, 4, 7);
    const fri = new THREE.PointLight(0x5c8dff, 90, 40); fri.position.set(-6, -3, 5);
    const ptr = new THREE.PointLight(0xffe08a, 60, 30); ptr.position.set(0, 0, 4);
    escena.add(new THREE.AmbientLight(0x6f86c8, 0.5), cal, fri, ptr);

    grupo.visible = false;
    return { grupo, luzMouse: ptr, estado: { v: 0, giro: 0 } };
  }

  /* ───────────── Motor ───────────── */
  const GL = {
    listo: false,
    activo: true,
    forma: null,
    _pendiente: null
  };

  GL.init = async function (canvas) {
    let THREE;
    try { THREE = await import(THREE_URL); } catch (e) { console.warn('[GL] Three.js no cargó:', e); return false; }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { console.warn('[GL] Sin WebGL:', e); return false; }

    const dpr = Math.min(window.devicePixelRatio || 1, MOVIL ? 1.6 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const escena = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    cam.position.set(0, 0, 13);
    const grupo = new THREE.Group();
    escena.add(grupo);

    // atributos
    const geo = new THREE.BufferGeometry();
    const desde = new Float32Array(N * 3), hasta = new Float32Array(N * 3);
    const azar = new Float32Array(N), tam = new Float32Array(N);
    for (let i = 0; i < N; i++) { azar[i] = Math.random(); tam[i] = 0.5 + Math.pow(Math.random(), 3) * 2.2; }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute('aFrom', new THREE.BufferAttribute(desde, 3));
    geo.setAttribute('aTo', new THREE.BufferAttribute(hasta, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(azar, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(tam, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uMorph: { value: 1 }, uTime: { value: 0 }, uPixel: { value: dpr },
        uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseF: { value: 0 },
        uAlpha: { value: 1 }, uFuerza: { value: 0 }
      },
      vertexShader: /* glsl */`
        attribute vec3 aFrom; attribute vec3 aTo; attribute float aRand; attribute float aSize;
        uniform float uMorph, uTime, uPixel, uFuerza; uniform vec3 uMouse; uniform float uMouseF;
        varying float vR; varying float vB;
        void main() {
          float t = smoothstep(aRand * 0.45, aRand * 0.45 + 0.55, uMorph);
          vec3 p = mix(aFrom, aTo, t);
          // durante el viaje, las partículas se abren en espiral
          float v = sin(t * 3.14159);
          float ang = aRand * 6.2831 + uTime * 0.2;
          p += vec3(cos(ang), sin(ang), sin(ang * 1.7)) * v * (0.9 + aRand * 2.2);
          // respiración suave
          p += vec3(sin(uTime * 0.55 + aRand * 40.0), cos(uTime * 0.47 + aRand * 25.0), sin(uTime * 0.38 + aRand * 12.0)) * 0.045;
          // el mouse aparta las partículas
          vec2 dm = p.xy - uMouse.xy;
          float dd = length(dm);
          float f = smoothstep(1.7, 0.0, dd) * uMouseF;
          p.xy += normalize(dm + 0.0001) * f * 0.85;
          p.z += f * 0.9;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * uPixel * (29.0 / -mv.z) * (1.0 + f * 0.9);
          gl_Position = projectionMatrix * mv;
          vR = aRand;
          vB = 0.55 + 0.45 * sin(uTime * 1.3 + aRand * 60.0) + f * 1.5;
        }`,
      fragmentShader: /* glsl */`
        uniform float uAlpha;
        varying float vR; varying float vB;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          a *= a;
          vec3 oro  = vec3(1.0, 0.80, 0.0);
          vec3 claro = vec3(1.0, 0.93, 0.62);
          vec3 azul = vec3(0.35, 0.58, 1.0);
          vec3 col = mix(oro, claro, smoothstep(0.55, 1.0, vR));
          col = mix(col, azul, smoothstep(0.93, 1.0, vR) * 0.85);
          gl_FragColor = vec4(col * (0.6 + vB * 0.45), a * uAlpha * 0.82);
        }`
    });

    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    grupo.add(pts);

    const mon = await crearMoneda(THREE, renderer, escena, 2.55);
    grupo.add(mon.grupo);
    GL._mon = mon;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // posición inicial y estado
    GL.THREE = THREE; GL.renderer = renderer; GL.cam = cam; GL.grupo = grupo; GL.mat = mat; GL.geo = geo;
    GL._desde = desde; GL._hasta = hasta;
    GL._cache = {};
    GL._objetivo = { x: 0, y: 0, esc: 1, alfa: 1 };
    GL._mouse = { x: 0, y: 0, nx: 0, ny: 0, activo: false };
    GL._ray = new THREE.Raycaster();
    GL._plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const ajustar = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      GL._vis = { h: 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z };
      GL._vis.w = GL._vis.h * cam.aspect;
      if (GL._cfg) GL.colocar(GL._cfg, true);
    };
    addEventListener('resize', ajustar);
    ajustar();

    addEventListener('pointermove', (e) => {
      const m = GL._mouse;
      m.nx = (e.clientX / innerWidth) * 2 - 1;
      m.ny = -((e.clientY / innerHeight) * 2 - 1);
      m.activo = true;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { GL._mouse.activo = false; });

    // Pausa cuando la pestaña no se ve
    document.addEventListener('visibilitychange', () => { GL._oculta = document.hidden; });

    const reloj = new THREE.Clock();
    let suave = { x: 0, y: 0 };
    const v3 = new THREE.Vector3();

    const cuadro = () => {
      requestAnimationFrame(cuadro);
      if (GL._oculta || !GL.activo) return;
      const dt = Math.min(reloj.getDelta(), 0.05);
      const tSeg = MOV_REDUCIDO ? 0 : reloj.elapsedTime;
      mat.uniforms.uTime.value = tSeg;

      const o = GL._objetivo;
      const k = 1 - Math.pow(0.0009, dt);           // suavizado independiente de los FPS
      grupo.position.x += (o.x - grupo.position.x) * k;
      grupo.position.y += (o.y - grupo.position.y) * k;
      const s = grupo.scale.x + (o.esc - grupo.scale.x) * k;
      grupo.scale.setScalar(s);
      mat.uniforms.uAlpha.value += (o.alfa - mat.uniforms.uAlpha.value) * k;

      // paralaje con el mouse + giro con el scroll
      const m = GL._mouse;
      suave.x += (m.nx - suave.x) * k * 0.6;
      suave.y += (m.ny - suave.y) * k * 0.6;
      if (!MOV_REDUCIDO) {
        grupo.rotation.y = suave.x * 0.28 + Math.sin(tSeg * 0.15) * 0.05 + (GL._scroll || 0) * 0.6;
        grupo.rotation.x = -suave.y * 0.16;
      }

      // el mouse en el espacio local de la figura
      if (m.activo && !MOV_REDUCIDO) {
        GL._ray.setFromCamera({ x: m.nx, y: m.ny }, cam);
        GL._plano.constant = -grupo.position.z;
        if (GL._ray.ray.intersectPlane(GL._plano, v3)) {
          grupo.worldToLocal(v3);
          mat.uniforms.uMouse.value.copy(v3);
        }
        mat.uniforms.uMouseF.value += (1 - mat.uniforms.uMouseF.value) * k;
      } else {
        mat.uniforms.uMouseF.value += (0 - mat.uniforms.uMouseF.value) * k;
      }

      // el medallón: aparece/gira solo, flota y sigue al mouse
      const M = GL._mon, ev = M.estado.v;
      M.grupo.visible = ev > 0.005;
      if (M.grupo.visible) {
        M.grupo.scale.setScalar(Math.max(0.0001, ev));
        M.grupo.rotation.y = Math.sin(tSeg * 0.35) * 0.22 + suave.x * 0.35 + M.estado.giro;
        M.grupo.rotation.x = Math.sin(tSeg * 0.27) * 0.06 - suave.y * 0.22;
        M.grupo.position.y = Math.sin(tSeg * 0.6) * 0.09;
        if (m.activo && !MOV_REDUCIDO) M.luzMouse.position.set(mat.uniforms.uMouse.value.x, mat.uniforms.uMouse.value.y, 3.5);
        else M.luzMouse.position.set(Math.sin(tSeg * 0.5) * 3, Math.cos(tSeg * 0.4) * 2, 3.5);
      }
      renderer.render(escena, cam);
    };

    GL.listo = true;
    GL.figura('emblema', true);
    if (GL._pendiente) { const p = GL._pendiente; GL._pendiente = null; GL.ir(p.nombre, p.cfg); }
    cuadro();
    return true;
  };

  /* Prepara la figura sin animar (primer dibujo) */
  GL.figura = function (nombre, directo) {
    if (!GL.listo) return;
    const f = GL._cache[nombre] || (GL._cache[nombre] = FIGURAS[nombre]());
    if (directo) {
      GL._desde.set(f); GL._hasta.set(f);
      GL.geo.attributes.aFrom.needsUpdate = true;
      GL.geo.attributes.aTo.needsUpdate = true;
      GL.mat.uniforms.uMorph.value = 1;
      GL.forma = nombre;
    }
    return f;
  };

  /* Pasa a otra figura (con la animación de partículas) */
  GL.ir = function (nombre, cfg) {
    if (!GL.listo) { GL._pendiente = { nombre, cfg }; return; }
    if (cfg) { GL._cfg = cfg; GL.colocar(cfg); }
    GL.moneda(nombre === 'emblema');
    if (nombre === GL.forma) return;
    const f = GL.figura(nombre);
    // lo que se está viendo pasa a ser el origen del viaje
    const u = GL.mat.uniforms.uMorph;
    if (u.value < 1) { GL._desde.set(GL._hasta); }        // si venía a medias, parte desde el destino anterior
    else { GL._desde.set(GL._hasta); }
    GL._hasta.set(f);
    GL.geo.attributes.aFrom.needsUpdate = true;
    GL.geo.attributes.aTo.needsUpdate = true;
    GL.forma = nombre;
    if (window.gsap && !MOV_REDUCIDO) {
      gsap.killTweensOf(u);
      u.value = 0;
      gsap.to(u, { value: 1, duration: 2.3, ease: 'power2.inOut' });
    } else {
      u.value = 1;
    }
  };

  /* El medallón 3D solo se ve en la figura "emblema" (sección de cierre):
     entra girando desde una vuelta completa y, al irse, gira hacia adentro. */
  GL.moneda = function (ver) {
    const M = GL._mon; if (!M || M._ver === ver) return;
    M._ver = ver;
    const E = M.estado;
    if (!window.gsap || MOV_REDUCIDO) { E.v = ver ? 1 : 0; E.giro = 0; return; }
    gsap.killTweensOf(E);
    if (ver) { E.giro = -Math.PI * 2; gsap.to(E, { v: 1, giro: 0, duration: 2.2, ease: 'expo.out', delay: 0.35 }); }
    else gsap.to(E, { v: 0, giro: Math.PI, duration: 0.9, ease: 'power3.in' });
  };

  /* Dónde se para la figura en pantalla.
     cfg: { lado: -1|0|1 (izq, centro, der), esc: 0..1, alfa: 0..1, y } */
  GL.colocar = function (cfg, sinAnim) {
    if (!GL.listo || !GL._vis) return;
    const v = GL._vis;
    const movil = innerWidth < 900;
    const lado = movil ? 0 : (cfg.lado || 0);
    const cuanto = Math.min(v.w * (movil ? 0.9 : 0.5), v.h * 0.92) / TAM;
    const o = GL._objetivo;
    o.x = lado * v.w * 0.3;
    o.y = movil ? (cfg.ym || 0) * v.h * 0.5 : (cfg.y || 0) * v.h * 0.3;
    o.esc = cuanto * (cfg.esc || 1) * (movil ? (cfg.escm || 1.05) : 1.0);
    o.alfa = movil ? (cfg.alfa || 1) * 0.42 : (cfg.alfa || 1);
    if (sinAnim) {
      GL.grupo.position.x = o.x; GL.grupo.position.y = o.y;
      GL.grupo.scale.setScalar(o.esc);
      GL.mat.uniforms.uAlpha.value = o.alfa;
    }
  };

  /* progreso general del scroll (0-1): gira un poco la figura */
  GL.scroll = (p) => { GL._scroll = p; };
  GL.pausar = (v) => { GL.activo = !v; };

  window.LeonesGL = GL;
})();
