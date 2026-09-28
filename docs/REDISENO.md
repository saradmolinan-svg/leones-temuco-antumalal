# Rediseño "La Melena": `rediseno.html`

Página nueva, hecha desde cero. **No reemplaza nada**: `index.html` y `experiencia.html` siguen intactos.
Se abre con el servidor local (`npm run dev`) en <http://localhost:5544/rediseno.html>.

Lee el mismo `data/contenido.json` que el panel `admin.html`, así que lo que se edite en el panel también
cambia aquí. Vista previa de borrador: `rediseno.html?borrador=1`.

## Archivos
- `rediseno.html`: cascarón (las secciones las dibuja el JS con el contenido).
- `assets/css/rediseno.css`: sistema de diseño (colores Lions, tipografías Fraunces + Figtree).
- `assets/js/rediseno.js`: secciones, animaciones (GSAP + ScrollTrigger), scroll suave (Lenis), cursor, menú, formulario.
- `assets/js/rediseno-gl.js`: la escena 3D de partículas (Three.js).
- `assets/js/rediseno-respaldo.js`: copia de `contenido.json` por si el archivo no se puede leer.

## Para publicarla como portada
Renombra `index.html` a `index-anterior.html` y `rediseno.html` a `index.html`, y quita la línea
`<meta name="robots" content="noindex, nofollow">`.
