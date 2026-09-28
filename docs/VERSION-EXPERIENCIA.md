# Versión alternativa: `experiencia.html`

Una segunda puesta en escena del sitio, inspirada en la experiencia de
[agenciautopia.cl](https://agenciautopia.cl), **con los colores oficiales Lions
y exactamente el mismo contenido** del club.

Se abre en `experiencia.html` (con el servidor local corriendo:
<http://localhost:5544/experiencia.html>).

> **No reemplaza nada.** `index.html` sigue intacto y es el sitio que ve la
> gente. Esta versión existe para compararlas y decidir.

---

## 1. Qué se tomó de esa referencia

| En agenciautopia.cl | Cómo se aplicó aquí |
|---|---|
| Portada a pantalla completa con video y una palabra gigante **por detrás** del personaje | La palabra **SERVIMOS** pasa por detrás del escudo del club. Mismo efecto de profundidad, con lo que ya teníamos |
| Nada de barra de menú clásica: una píldora flotante abajo | Píldora con el botón de acción, las redes y el menú |
| Menú de pantalla completa con enlaces enormes | Igual, con los datos de contacto al costado |
| Tipografía muy grande y contornos vacíos | Titulares hasta 13vw y la franja con letras solo de contorno |
| Fondo oscuro, fotos desaturadas | Azul Lions muy oscuro (`#030C22`) y fotos en gris que se colorean al pasar el mouse |
| Recorrido largo con secciones que respiran | 17 secciones, títulos que se quedan fijos mientras pasa el texto |

Y dos cosas que se agregaron porque calzan con un club de servicio:

- **Proyectos que se recorren en horizontal** (se arrastra con el mouse, la
  rueda o el dedo), en vez de una grilla.
- **Causas como lista larga** que se enciende al pasar por encima, en vez de
  ocho tarjetas iguales.

## 2. Qué NO se copió, y por qué

- **El video de portada.** Ese sitio se sostiene en una animación en
  stop-motion producida para ellos. El club no tiene video todavía, así que
  la portada usa la foto grande. Cuando haya video, se cambia una línea:

  ```html
  <!-- en experiencia.html, dentro de .portada__fondo -->
  <video autoplay muted loop playsinline src="assets/video/portada.mp4"></video>
  ```

- **Su paleta.** Todo quedó en Azul Lions `#00338D` y Oro Lions `#FFCD00`.
- **Su tono.** Los textos son los mismos del club, sin tocar una palabra.

## 3. Lo importante: el panel administra las dos

Las dos versiones leen **el mismo `data/contenido.json`**. Lo que se escribe en
`admin.html` cambia las dos a la vez. No hay contenido duplicado ni doble
trabajo.

Para verla con los cambios sin publicar: `experiencia.html?borrador=1`
(hay un enlace directo en el panel, en *Publicar y respaldos*).

## 4. Cómo funciona por dentro

```
experiencia.html                      La página
assets/css/experiencia.css            Sus estilos
assets/js/experiencia.js              Su motor (equivale a main.js)
assets/js/plantillas-experiencia.js   Cómo dibuja cada lista
```

`contenido.js` es el mismo de siempre y ahora acepta dos ajustes que una
página puede declarar antes de cargarlo:

| Variable | Para qué |
|---|---|
| `window.SCRIPTS_SITIO` | Qué scripts arrancan después de aplicar el contenido |
| `window.PLANTILLAS_SITIO` | Cómo se dibuja cada lista (causas, proyectos, directorio…) |

`index.html` no declara ninguna de las dos, así que sigue usando `main.js` y
las plantillas originales. Por eso el sitio actual quedó exactamente igual.

## 5. Qué le falta antes de poder reemplazar al actual

- [ ] **Fotos reales.** Este diseño depende mucho más de la imagen que el
      actual: la portada a pantalla completa y las tarjetas verticales de
      proyectos se ven pobres con los marcadores de posición.
- [ ] Idealmente, un **video corto** de un operativo para la portada.
- [ ] Revisar los textos largos: con tipografía tan grande, los títulos de más
      de 8 palabras se ven apretados.
- [ ] Decidir qué pasa con las secciones que aquí quedaron más breves.

## 6. Si deciden quedarse con esta versión

1. Renombrar: `index.html` → `index-clasico.html`, y `experiencia.html` → `index.html`.
2. Quitar de `experiencia.html` (ya renombrado) la etiqueta
   `<meta name="robots" content="noindex, nofollow">`.
3. Borrar de `robots.txt` la línea `Disallow: /experiencia.html`.
4. Actualizar en el nuevo `index.html` las etiquetas de SEO (`canonical`,
   `og:image` y el bloque `application/ld+json`), copiándolas del clásico.

Si prefieren quedarse con el actual, se borran `experiencia.html`,
`assets/css/experiencia.css`, `assets/js/experiencia.js` y
`assets/js/plantillas-experiencia.js`. Nada más depende de ellos.

## 7. Accesibilidad

Se mantuvo todo lo del sitio actual, porque para un club de Leones no es un
adorno:

- Widget de accesibilidad (texto más grande, alto contraste, menos animación).
  En el teléfono **se mueve, no se esconde**.
- Respeta `prefers-reduced-motion` del sistema operativo.
- Navegación por teclado, `aria-label` en los controles y `aria-expanded` en
  el menú y el acordeón.
- El carrusel de proyectos también se recorre con el teclado.

> Con fondo oscuro hay que cuidar el contraste: el texto secundario está al
> 62% de opacidad sobre `#030C22`, que cumple AA para tamaños normales. Si se
> baja más, deja de cumplir.
