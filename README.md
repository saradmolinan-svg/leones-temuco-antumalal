# Club de Leones Temuco Antumalal — sitio web

Sitio web del **Club de Leones Temuco Antumalal**, Distrito T-4, Temuco, La Araucanía, Chile.
Fundado el 28 de marzo de 1983.

Hecho con HTML, CSS y JavaScript puros: **no necesita servidor, base de datos ni instalar nada**
para funcionar. Se puede publicar gratis en Netlify, Vercel, GitHub Pages o subirlo por FTP
a cualquier hosting.

---

## 1. Ver el sitio en tu computador

Haz doble clic en `index.html` y se abre en el navegador.

Las secciones que leen archivos de datos —Noticias, Instagram y **todo lo que se
edite desde el panel**— necesitan un servidor local. Para ver el sitio tal como
quedará publicado:

```bash
npm run dev
```

Luego abre <http://localhost:5544>. (Requiere Python instalado, que ya viene en Windows 11.)

El panel de administración se abre en <http://localhost:5544/admin.html>
y **siempre** necesita el servidor local: con doble clic no funciona.

---

## 2. Administrar el sitio sin tocar código

**Abre `admin.html`.** Es un panel de administración en español donde se cambian
los textos, se suben fotos, se carga la agenda y se publican los cambios, sin
abrir un solo archivo de código.

```bash
npm run dev
```

Luego entra a <http://localhost:5544/admin.html>. Si el sitio ya está publicado,
también funciona en `tusitio.cl/admin.html`.

**Qué permite hacer:**

- Editar todos los textos de la página, sección por sección.
- Subir fotos desde el computador o el teléfono: se comprimen solas.
- Agregar, ordenar, duplicar y borrar proyectos, causas, valores, integrantes del
  directorio, testimonios y preguntas frecuentes.
- Cargar actividades en la agenda, que desaparecen solas cuando pasa la fecha.
- Cambiar teléfono, WhatsApp, correo, datos bancarios y redes sociales.
- **Vista previa** antes de publicar, y **copias de seguridad** en un archivo.
- Publicar de dos formas: descargando los archivos, o **subiéndolos solo a GitHub**
  con un botón.

La primera pantalla del panel es una **lista de pendientes** que avisa qué datos
siguen siendo de ejemplo (teléfono, cuenta bancaria, nombres del directorio, fotos).

> Guía completa: **[docs/PANEL-ADMIN.md](docs/PANEL-ADMIN.md)** —
> incluye cómo proteger el panel con contraseña en el hosting.

### ¿Y si el panel se rompe?

El sitio no depende de él. El panel solo escribe `data/contenido.json`;
si ese archivo falta o queda mal, la página vuelve sola a los textos que están
escritos en `index.html`. **Nunca se cae por un error del panel.**

---

## 3. Qué edito a mano, y dónde

Todo esto también se puede editar desde el panel. Esta sección es para quien
prefiera trabajar directo sobre los archivos.

### El archivo más importante: `assets/js/config.js`

Ahí está **todo lo que cambia seguido**, en un solo lugar y con comentarios en español.
Son los **valores por defecto**: si el panel definió otro valor, manda el del panel.

| Sección | Qué controla |
|---|---|
| `identidad` | Nombre, lema, año de fundación, distrito |
| `contacto` | Correo, teléfono, **WhatsApp**, dirección, horario de sesiones, mapa |
| `redes` | Instagram, Facebook, YouTube, sitio e-Clubhouse |
| `formulario` | A dónde se envían los mensajes del formulario |
| `noticias` | Cuántas noticias mostrar y si se refrescan solas |
| `instagram` | Cómo se conecta el feed (ver punto 6) |
| `impacto` | Los números grandes animados (socios, operativos, etc.) |
| `donaciones` | Datos bancarios para transferencias |

> **Pendientes marcados con datos de ejemplo:** teléfono, WhatsApp, correo y datos bancarios
> están con valores ficticios (`+56 9 0000 0000`, `contacto@leonesantumalal.cl`,
> cuenta `000000000`). **Hay que reemplazarlos por los reales antes de publicar.**

### Los textos de las secciones

Están directamente en `index.html`. Busca el comentario de la sección
(`<!-- ══════════ PROYECTOS ══════════ -->`) y edita el texto entre las etiquetas.

### Importante al editar CSS o JS

`index.html` pide las hojas de estilo y los scripts con `?v=1` al final:

```html
<link rel="stylesheet" href="assets/css/styles.css?v=1">
<script src="assets/js/config.js?v=1"></script>
```

**Cada vez que edites un archivo `.css` o `.js`, sube ese número** (`?v=2`, `?v=3`…).
Si no lo haces, los visitantes que ya entraron seguirán viendo la versión vieja
guardada en la caché de su navegador.

### Los colores

En `assets/css/styles.css`, arriba del todo, en el bloque `:root`.
Están los colores oficiales de Lions:

```css
--azul: #00338D;   /* Azul Lions, PMS 288C */
--oro:  #FFCD00;   /* Oro Lions, PMS 123C  */
```

---

## 4. Cambiar las fotos

Todas las imágenes están en `assets/img/fotos/` y hoy son **marcadores de posición**:
gráficos generados con los colores del club que dicen "REEMPLAZAR CON FOTO DEL CLUB"
y el tamaño recomendado.

Para poner una foto real:

1. Guarda tu foto en `assets/img/fotos/` (idealmente `.jpg`, comprimida, menos de 400 KB).
2. En `index.html`, busca el nombre del archivo que reemplazas y cambia la extensión.
   Por ejemplo: `assets/img/fotos/hero.svg` → `assets/img/fotos/hero.jpg`.

| Archivo | Dónde aparece | Tamaño sugerido |
|---|---|---|
| `hero.svg` | Foto grande de portada | 1920 × 1080 |
| `sobre-1/2/3.svg` | Sección "El Club" | 1200×750 y 700×700 |
| `proyecto-1…6.svg` | Tarjetas de Proyectos | 1200×750 y 800×1000 |
| `directiva-1…4.svg` | Fotos del directorio | 700 × 700 |
| `ig-1…8.svg` | Respaldo del feed de Instagram | 600 × 600 |
| `og.svg` | Vista previa al compartir el link | 1200 × 630 |

### El escudo

- `assets/img/escudo.svg` — escudo del club para fondos claros
- `assets/img/escudo-claro.svg` — misma versión para fondos oscuros
- `assets/img/emblema-lions.svg` — solo el emblema Lions
- `assets/img/escudo-original-club.png` — el escudo real del club, como referencia

> **Importante:** el escudo en SVG es una **reconstrucción** hecha a partir del escudo
> real del club (anillo con "CLUB DE LEONES · TEMUCO - ANTUMALAL" y el emblema Lions
> al centro). El emblema de Lions Clubs International es marca registrada y tiene
> normas gráficas propias. Lo correcto es pedir el archivo oficial en alta resolución
> al Distrito T-4 o descargarlo del portal de marca de Lions, y reemplazar estos SVG
> conservando los mismos nombres de archivo. Todo el sitio se actualiza solo.

---

## 5. Noticias automáticas

La sección de Noticias se alimenta de fuentes reales, ya funcionando:

| Fuente | Tipo | Qué trae |
|---|---|---|
| **LION Magazine** (`lionmagazine.org/feed`) | Oficial | La revista oficial de Lions Clubs International |
| **Google Noticias — Temuco y La Araucanía** | Prensa | Notas sobre Clubes de Leones en la región |
| **Google Noticias — Chile** | Prensa | Notas sobre Clubes de Leones en el país |
| **Google Noticias — Leonismo** | Prensa | Cobertura general del movimiento leonístico |

Las notas de prensa se filtran: solo entran las que realmente mencionan
leones / leonismo / lions, para que no se cuelen noticias de calles o escuelas
que se llaman igual.

### Actualizarlas a mano

```bash
npm run noticias
```

Eso consulta las fuentes y reescribe `data/noticias.json`.

### Actualizarlas solas (recomendado)

Si publicas el sitio en GitHub, ya viene configurado `.github/workflows/noticias.yml`:
actualiza las noticias **dos veces al día** (08:00 y 20:00 de Chile) y publica los cambios
automáticamente. No hay que hacer nada más.

### ¿Y el refresco en vivo desde el navegador?

Viene **desactivado** (`noticias.actualizarEnVivo: false` en `config.js`).
Leer un RSS desde el navegador exige un proxy CORS de terceros; los públicos
gratuitos fallan seguido y llenan la consola de errores. No hace falta:
la GitHub Action ya deja `data/noticias.json` al día dos veces por jornada.

### Agregar o quitar fuentes

Edita el arreglo `FUENTES` al comienzo de `scripts/fetch-noticias.mjs`.
Sirve cualquier feed RSS.

> **Nota:** `lionsclubs.org` no publica un RSS abierto y bloquea la lectura automática,
> por eso se usa LION Magazine, que sí es una publicación oficial de la asociación.
> Si el Distrito T-4 abre un sitio con RSS, agregarlo ahí es cuestión de una línea.

---

## 6. Conectar Instagram

Instagram **no permite** leer un perfil público sin autorización, así que hay tres caminos.
El paso a paso está en **[docs/CONECTAR-INSTAGRAM.md](docs/CONECTAR-INSTAGRAM.md)**.

Resumen:

- **A) Behold.so** — gratis, usa la API oficial de Meta, sin marca de agua. *Recomendado.*
- **B) LightWidget / SnapWidget** — más simple, pero muestra el widget dentro de un recuadro.
- **C) Manual** — cargar las fotos a mano en `data/instagram.json`. **Es el modo activo hoy.**

Hoy el sitio muestra 8 publicaciones de ejemplo con los textos correctos del club.
Al configurar la opción A o B, se reemplazan solas por las publicaciones reales.

---

## 7. El formulario de contacto

Hoy funciona **sin configurar nada**: al enviarlo, arma el mensaje y abre WhatsApp
(o el correo, si no hay WhatsApp configurado).

Si prefieres recibirlos por correo:

1. Crea una cuenta gratis en [Formspree](https://formspree.io) y copia tu endpoint.
2. Pégalo en `assets/js/config.js` → `formulario.endpoint`.

Si publicas en Netlify, también puedes usar Netlify Forms sin costo.

---

## 8. Publicar el sitio

### Netlify (lo más fácil, gratis, con dominio propio)

1. Entra a [netlify.com](https://netlify.com) y crea una cuenta.
2. Arrastra la carpeta completa del proyecto a la zona "Deploy".
3. Listo. Netlify te da una dirección tipo `leones-antumalal.netlify.app`.
4. Para usar un dominio propio (`leonesantumalal.cl`): Site settings → Domain management.

### GitHub Pages (permite las noticias automáticas)

1. Sube la carpeta a un repositorio de GitHub.
2. Settings → Pages → Source: `main` / carpeta raíz.
3. Las noticias se actualizarán solas gracias a GitHub Actions.

### Hosting tradicional

Sube todo por FTP a la carpeta `public_html`. Funciona igual.

> Antes de publicar, cambia `https://leonesantumalal.cl/` por tu dirección real en
> `index.html` (etiquetas `canonical`, `og:image` y el bloque `application/ld+json`)
> y en `sitemap.xml`.

---

## 9. Qué trae el sitio

**Secciones:** portada, el club, 8 causas de servicio, sello de trabajo, contadores de impacto,
proyectos, valores, noticias, Instagram, agenda, directorio, testimonios,
hazte socio, donaciones, preguntas frecuentes, contacto con mapa y pie de página.

**Detalles pensados para un club de servicio:**

- **Panel de administración propio** (`admin.html`) para que la directiva
  actualice el sitio sin depender de nadie. Con vista previa, copias de
  seguridad y publicación en un clic.
- **Widget de accesibilidad** (abajo a la izquierda): agrandar el texto, alto contraste
  y reducir animaciones. Coherente con que la causa histórica de los Leones es la visión.
  Las preferencias quedan guardadas en el navegador de cada visitante.
- **Agenda que se calcula sola:** muestra siempre los próximos 2° y 4° lunes del mes.
  Nunca queda desactualizada.
- **Botón de WhatsApp** flotante con mensaje predefinido.
- **Sección de valores** con la cita fundacional de Melvin Jones, que reemplaza
  al típico bloque de "cómo trabajamos" y explica los criterios reales del club.
- **Copiar datos bancarios** con un clic en la sección de donaciones.
- **SEO listo:** título, descripción, Open Graph para redes sociales y datos estructurados
  Schema.org tipo `NGO` para que Google entienda que es una organización sin fines de lucro.
- **Respeta `prefers-reduced-motion`** del sistema operativo.
- Navegación por teclado y `aria-label` en todos los controles.

---

## 10. Estructura de archivos

```
CLUB LOS LEONES ANTUMALAL/
├── index.html                      La página completa
├── admin.html                      ← PANEL DE ADMINISTRACIÓN
├── package.json
├── robots.txt · sitemap.xml
├── assets/
│   ├── css/
│   │   ├── styles.css              Colores, tipografía, header, portada, animaciones
│   │   ├── componentes.css         Todas las secciones y componentes
│   │   └── admin.css               Estilos del panel
│   ├── js/
│   │   ├── config.js               Valores por defecto del club
│   │   ├── contenido.js            Aplica lo editado en el panel sobre la página
│   │   ├── iconos.js               Catálogo de íconos (sitio + panel)
│   │   ├── almacen.js              Guardado local del borrador del panel
│   │   ├── admin.js                Lógica del panel
│   │   ├── main.js                 Animaciones, menú, contadores, formulario, accesibilidad
│   │   ├── noticias.js             Pinta la sección de noticias
│   │   └── instagram.js            Pinta el feed de Instagram
│   └── img/
│       ├── escudo.svg              Escudo del club (fondo claro)
│       ├── escudo-claro.svg        Escudo del club (fondo oscuro)
│       ├── emblema-lions.svg       Emblema Lions solo
│       ├── escudo-original-club.png
│       └── fotos/                  ← REEMPLAZAR con fotos reales
├── data/
│   ├── contenido.json              ← Lo que escribe el panel (todos los textos)
│   ├── imagenes.json               ← Fotos subidas desde el panel, comprimidas
│   ├── noticias.json               Generado automáticamente
│   └── instagram.json              Respaldo curado del feed
├── scripts/
│   └── fetch-noticias.mjs          Consulta las fuentes de noticias
├── docs/
│   ├── PANEL-ADMIN.md              ← Guía del panel
│   └── CONECTAR-INSTAGRAM.md
└── .github/workflows/noticias.yml  Actualización automática
```

---

## 11. Lista de pendientes antes de publicar

> Todo esto se puede hacer desde **`admin.html`**, y el panel lleva la cuenta
> de lo que falta en su pantalla de Inicio.

- [ ] Reemplazar teléfono, WhatsApp y correo (panel → *Contacto*)
- [ ] Reemplazar los datos bancarios de donaciones (panel → *Datos para donar*)
- [ ] Cargar el escudo oficial en alta resolución
- [ ] Cargar fotos reales del club (panel → *Portada* y *Proyectos*)
- [ ] Poner los nombres y fotos reales del directorio (panel → *Directorio*)
- [ ] Revisar las cifras de impacto (panel → *Cifras de impacto*)
- [ ] Ajustar la dirección exacta del quincho Martin Lutero en el mapa (panel → *Contacto*)
- [ ] Revisar los testimonios: hoy son ejemplos (panel → *Testimonios*)
- [ ] Definir el dominio y actualizar las direcciones en `index.html` y `sitemap.xml`
- [ ] Proteger `admin.html` con contraseña en el hosting (ver [docs/PANEL-ADMIN.md](docs/PANEL-ADMIN.md))

---

## 12. Crédito

El pie de página incluye el sello **"Sitio web creado por websquevenden.cl"**,
enlazado a <https://websquevenden.cl>. Está en `index.html`, dentro de
`<div class="footer__bajo">`, con la clase `.credito` (estilos en
`assets/css/componentes.css`, sección 32).

---

*"Nosotros Servimos" · We Serve*
