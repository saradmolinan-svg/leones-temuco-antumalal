/* =========================================================================
   ALMACEN.JS — GUARDADO LOCAL DEL PANEL
   -------------------------------------------------------------------------
   Los borradores del panel se guardan en el navegador de quien edita, para
   que nada se pierda si se cierra la pestaña por accidente.

   · Los textos son livianos y van a localStorage.
   · Las fotos pesan mucho más, así que van a IndexedDB, que aguanta
     bastante más que localStorage (que se llena con unos pocos megas).

   Nada de esto viaja a ningún servidor: vive solo en ese computador hasta
   que se aprieta "Publicar".
   ========================================================================= */

window.ALMACEN = (() => {
  'use strict';

  const BD = 'antumalal';
  const TIENDA = 'archivos';
  const ESPERA = 5000;      // si la base no responde, se sigue sin ella
  let conexion = null;

  /* Toda operación lleva un plazo máximo. IndexedDB puede quedarse esperando
     para siempre (otra pestaña abierta, modo incógnito, perfil dañado) y el
     panel no puede quedarse en blanco por eso: sin borrador se trabaja igual,
     leyendo lo que ya está publicado. */
  function conPlazo(promesa, queHacia) {
    return Promise.race([
      promesa,
      new Promise((_, mal) => setTimeout(
        () => mal(new Error('El guardado local no respondió al ' + queHacia + '.')), ESPERA))
    ]);
  }

  function abrir() {
    if (conexion) return Promise.resolve(conexion);
    return conPlazo(new Promise((ok, mal) => {
      if (!window.indexedDB) return mal(new Error('Este navegador no permite guardar borradores.'));
      const p = indexedDB.open(BD, 1);
      p.onupgradeneeded = () => {
        if (!p.result.objectStoreNames.contains(TIENDA)) p.result.createObjectStore(TIENDA);
      };
      p.onsuccess = () => {
        conexion = p.result;
        // Si otra pestaña pide borrar o actualizar la base, hay que soltarla.
        conexion.onversionchange = () => { conexion.close(); conexion = null; };
        ok(conexion);
      };
      p.onerror = () => mal(p.error);
      p.onblocked = () => mal(new Error('La base está ocupada por otra pestaña.'));
    }), 'abrir');
  }

  function operar(modo, hacer) {
    return abrir().then((bd) => conPlazo(new Promise((ok, mal) => {
      const t = bd.transaction(TIENDA, modo);
      const pedido = hacer(t.objectStore(TIENDA));
      t.oncomplete = () => ok(pedido ? pedido.result : undefined);
      t.onerror = () => mal(t.error);
      t.onabort = () => mal(t.error);
    }), 'guardar'));
  }

  return {
    /* Objetos grandes (fotos) */
    leer:    (clave) => operar('readonly',  (s) => s.get(clave)).catch(() => null),
    guardar: (clave, valor) => operar('readwrite', (s) => s.put(valor, clave)),
    borrar:  (clave) => operar('readwrite', (s) => s.delete(clave)).catch(() => null),

    /* Objetos chicos (textos, preferencias) */
    leerChico(clave, porDefecto) {
      try {
        const v = localStorage.getItem('antumalal.' + clave);
        return v == null ? porDefecto : JSON.parse(v);
      } catch { return porDefecto; }
    },
    guardarChico(clave, valor) {
      try {
        localStorage.setItem('antumalal.' + clave, JSON.stringify(valor));
        return true;
      } catch { return false; }   // memoria llena o modo incógnito
    },
    borrarChico(clave) {
      try { localStorage.removeItem('antumalal.' + clave); } catch { /* da igual */ }
    }
  };
})();
