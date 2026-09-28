#!/usr/bin/env node
/* =========================================================================
   FETCH-AGENDA.MJS
   -------------------------------------------------------------------------
   Lee las fechas del calendario del Distrito T4 (leonest4.cl) y escribe
   data/agenda-distrito.json, que el sitio combina con las sesiones propias
   del club y las actividades puntuales cargadas a mano en el panel.

   Uso:
     npm run agenda
     node scripts/fetch-agenda.mjs

   Sin dependencias: sólo Node 18+ (fetch nativo).
   ========================================================================= */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ   = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = resolve(RAIZ, 'data/agenda-distrito.json');
const FUENTE = 'https://leonest4.cl/';
const UA     = 'Mozilla/5.0 (compatible; LeonesAntumalalBot/1.0; +https://leonesantumalal.cl)';

/* La página trae el calendario completo incrustado en el HTML:
   `const EVENTS = { "2026-10-1": [ {...} ], ... };` */
async function traer(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

function extraerEventos(html) {
  const m = html.match(/const\s+EVENTS\s*=\s*(\{[\s\S]*?\});/);
  if (!m) throw new Error('No se encontró el calendario (EVENTS) en la página.');
  const mapa = JSON.parse(m[1]);
  const dos = (n) => String(n).padStart(2, '0');

  const eventos = [];
  Object.entries(mapa).forEach(([clave, dia]) => {
    const [a, mm, dd] = clave.split('-').map(Number);
    if (!a || !mm || !dd) return;
    const fecha = `${a}-${dos(mm)}-${dos(dd)}`;
    (Array.isArray(dia) ? dia : []).forEach((ev) => {
      if (!ev || !ev.title) return;
      const detalle = [ev.lugar, ev.modality && ev.modality !== 'Día conmemorativo' ? ev.modality : '']
        .filter(Boolean).join(' · ');
      eventos.push({
        fecha,
        titulo: ev.title.trim(),
        texto: detalle,
        hora: (ev.time || '').trim(),
        pasado: !!ev.past
      });
    });
  });
  return eventos;
}

(async () => {
  console.log('Consultando calendario del Distrito T4…\n');

  const html = await traer(FUENTE);
  const todos = extraerEventos(html);
  const eventos = todos.filter((e) => !e.pasado).map(({ pasado, ...e }) => e);

  if (!eventos.length) {
    console.error('No se obtuvo ninguna fecha vigente. Se conserva el archivo anterior.');
    process.exit(1);
  }

  eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));

  const salida = {
    generado: new Date().toISOString(),
    fuente: FUENTE,
    total: eventos.length,
    eventos
  };

  await mkdir(dirname(SALIDA), { recursive: true });

  try {
    const previo = JSON.parse(await readFile(SALIDA, 'utf8'));
    if (JSON.stringify(previo.eventos) === JSON.stringify(eventos)) {
      console.log('Sin cambios respecto de la última consulta.');
      return;
    }
  } catch { /* no existía */ }

  await writeFile(SALIDA, JSON.stringify(salida, null, 2) + '\n', 'utf8');
  console.log(`${eventos.length} fechas del distrito guardadas en data/agenda-distrito.json`);
})().catch((e) => {
  console.error('\nError:', e.message);
  process.exit(1);
});
