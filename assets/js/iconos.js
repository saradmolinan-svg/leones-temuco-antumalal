/* =========================================================================
   ICONOS.JS — CATÁLOGO DE ÍCONOS DEL SITIO
   -------------------------------------------------------------------------
   Los usa tanto el sitio (contenido.js) como el panel de administración
   (admin.js), para que el selector de íconos del panel muestre exactamente
   los mismos dibujos que después aparecen en la página.

   Cada ícono es el CONTENIDO de un <svg viewBox="0 0 24 24">, sin la
   etiqueta <svg> (esa la pone quien lo dibuja).

   Para agregar uno nuevo: copia una línea, cámbiale la clave y pega el
   trazado. Aparece solo en el panel.
   ========================================================================= */

window.ICONOS = {
  ojo:          { nombre: 'Visión / ojo',        d: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>' },
  diabetes:     { nombre: 'Diabetes',            d: '<path d="M12 2v20M5 7h14M7 12h10M6 17h12"/><circle cx="12" cy="12" r="9"/>' },
  hambre:       { nombre: 'Hambre / alimento',   d: '<path d="M3 11h18M5 11a7 7 0 0 1 14 0M4 15h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2ZM8 7V4M12 7V3M16 7V4"/>' },
  arbol:        { nombre: 'Medio ambiente',      d: '<path d="M12 22c5-3 8-7 8-12a8 8 0 1 0-16 0c0 5 3 9 8 12Z"/><path d="M12 22V9M12 13l3.5-3.5M12 16l-3-3"/>' },
  corazon:      { nombre: 'Corazón / cuidado',   d: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>' },
  corazonSolo:  { nombre: 'Corazón simple',      d: '<path d="M12 21c-4.5-2.7-8-6.4-8-11a5 5 0 0 1 8-3.5A5 5 0 0 1 20 10c0 4.6-3.5 8.3-8 11Z"/>' },
  escudoCheck:  { nombre: 'Escudo con visto',    d: '<path d="M12 2 3 7v6c0 5 3.8 8.7 9 9 5.2-.3 9-4 9-9V7l-9-5Z"/><path d="m9 12 2 2 4-4"/>' },
  escudo:       { nombre: 'Escudo / dignidad',   d: '<path d="M12 2 4 6v6c0 5 3.4 9.2 8 10 4.6-.8 8-5 8-10V6l-8-4Z"/><circle cx="12" cy="11" r="2.6"/><path d="M12 13.6V17"/>' },
  graduacion:   { nombre: 'Juventud / estudio',  d: '<path d="m22 9-10-5L2 9l10 5 10-5Z"/><path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/>' },
  personas:     { nombre: 'Personas / grupo',    d: '<circle cx="9" cy="8" r="3.2"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 6.5a3 3 0 0 1 0 5.6M19.5 4a6 6 0 0 1 0 10.5"/>' },
  voluntario:   { nombre: 'Voluntariado',        d: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>' },
  casa:         { nombre: 'Casa / raíz local',   d: '<path d="M12 3v18M5 8l7-5 7 5"/><path d="M3 12h4M17 12h4M5 16h3M16 16h3"/>' },
  maletin:      { nombre: 'Aporte en especies',  d: '<path d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20"/>' },
  calendario:   { nombre: 'Calendario / agenda', d: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>' },
  ubicacion:    { nombre: 'Ubicación / lugar',   d: '<path d="M12 22c5-3 8-7 8-12a8 8 0 1 0-16 0c0 5 3 9 8 12Z"/><circle cx="12" cy="10" r="3"/>' },
  libro:        { nombre: 'Libro / educación',   d: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>' },
  mano:         { nombre: 'Mano solidaria',      d: '<path d="M11 13V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M14 11.5V4.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 12V6.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1l-2.5-4a1.6 1.6 0 0 1 2.8-1.6L8 12"/>' },
  reloj:        { nombre: 'Reloj / horario',     d: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  estrella:     { nombre: 'Estrella / logro',    d: '<path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9Z"/>' },
  gota:         { nombre: 'Gota / salud',        d: '<path d="M12 2.7 6.9 8.4a7.2 7.2 0 1 0 10.2 0Z"/>' },
  medico:       { nombre: 'Salud / médico',      d: '<path d="M12 7v10M7 12h10"/><circle cx="12" cy="12" r="9"/>' },
  megafono:     { nombre: 'Difusión / prensa',   d: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M16 8.5a5 5 0 0 1 0 7M19 5.5a9 9 0 0 1 0 13"/>' }
};
