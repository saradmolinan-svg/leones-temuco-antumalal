# Conectar el feed de Instagram

La sección de Instagram del sitio muestra las publicaciones de
**[@leonestemuco_antumalal](https://www.instagram.com/leonestemuco_antumalal/)**.

## Por qué no es automático de entrada

Instagram **no permite** que una página web lea un perfil público sin autorización.
Desde diciembre de 2024, Meta cerró la *Instagram Basic Display API*, que era la vía
sencilla. Hoy hay que usar la *Instagram Graph API*, que exige:

- Que la cuenta sea **Profesional** (Empresa o Creador de contenido), y
- Que esté **vinculada a una página de Facebook**.

Cualquiera que prometa mostrar el feed sin eso, está raspando la web y deja de
funcionar cada pocas semanas. Por eso el sitio soporta tres modos.

---

## Opción A — Behold.so *(recomendado)*

Gratis para un perfil, usa la API oficial de Meta, no pone marca de agua y entrega
un archivo JSON que el sitio lee directo. Es la opción que se ve mejor.

### Requisito previo

La cuenta `@leonestemuco_antumalal` debe ser **Profesional** y estar vinculada a una
página de Facebook del club. Se hace desde la app:

1. Instagram → Perfil → menú ☰ → **Configuración**
2. **Tipo de cuenta y herramientas** → **Cambiar a cuenta profesional**
3. Elige la categoría *Organización sin fines de lucro*
4. Cuando lo pida, **vincula la página de Facebook** del club
   (si no existe, se crea gratis en facebook.com/pages/create)

> Cambiar a cuenta profesional es reversible y no afecta las publicaciones existentes.
> Además desbloquea las estadísticas de alcance, que sirven para el club.

### Pasos

1. Entra a **<https://behold.so>** y crea una cuenta gratuita.
2. Presiona **Connect Instagram account** y autoriza con la cuenta del club.
3. Crea un *feed* y elige cuántas publicaciones mostrar (8 es lo que usa el sitio).
4. En la pestaña **Fields**, deja activados al menos:
   `permalink`, `caption`, `mediaUrl`, `sizes`, `likeCount`, `commentsCount`.
5. Copia la **Feed URL**. Se ve así:
   `https://feeds.behold.so/AbCdEf123456`
6. Pégala en `assets/js/config.js`:

```js
instagram: {
  beholdUrl: "https://feeds.behold.so/AbCdEf123456",   // ← aquí
  iframeUrl: "",
  archivoLocal: "data/instagram.json",
  maximo: 8
},
```

7. Guarda y recarga la página. Listo: las publicaciones se actualizan solas.

---

## Opción B — Widget incrustado (LightWidget o SnapWidget)

Más rápido de configurar, pero el feed queda dentro de un recuadro con estilos propios
y la versión gratuita suele mostrar una marca de agua pequeña.

1. Entra a **<https://lightwidget.com>** (o snapwidget.com) y conecta la cuenta.
2. Personaliza columnas, márgenes y color de fondo.
3. Copia **solo la URL** que aparece dentro del `src="..."` del código que te entregan.
   Se ve así: `https://cdn.lightwidget.com/widgets/abc123.html`
4. Pégala en `assets/js/config.js`:

```js
instagram: {
  beholdUrl: "",
  iframeUrl: "https://cdn.lightwidget.com/widgets/abc123.html",   // ← aquí
  archivoLocal: "data/instagram.json",
  maximo: 8
},
```

---

## Opción C — Manual *(el modo activo hoy)*

No requiere cuenta profesional ni servicios externos. Se cargan las fotos a mano.
Sirve bien si el club publica pocas veces al mes.

1. Descarga la imagen de la publicación desde Instagram.
2. Guárdala en `assets/img/fotos/` con un nombre claro, por ejemplo `ig-operativo-2026.jpg`.
3. Abre `data/instagram.json` y edita la lista `publicaciones`:

```json
{
  "imagen": "assets/img/fotos/ig-operativo-2026.jpg",
  "enlace": "https://www.instagram.com/p/CODIGO_DEL_POST/",
  "texto": "Operativo oftalmológico en la Escuela Ríos de Chile."
}
```

Para obtener el enlace de una publicación: ábrela en Instagram desde el computador
y copia la dirección de la barra del navegador.

> Deja siempre estas publicaciones cargadas aunque configures la opción A o B:
> funcionan como respaldo si el servicio externo falla, y así la sección nunca
> se ve vacía.

---

## Cómo se comporta el sitio

El módulo `assets/js/instagram.js` intenta en este orden:

1. Si hay `iframeUrl` → muestra el widget incrustado.
2. Si hay `beholdUrl` → carga el feed real desde Behold.
3. Si Behold falla o no está configurado → usa `data/instagram.json`.
4. Si tampoco hay nada → muestra un bloque con el botón "Abrir @leonestemuco_antumalal".

Nunca queda un espacio vacío en la página.

---

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Se ven las 8 imágenes de ejemplo | `beholdUrl` vacío o mal escrito | Revisa que la URL esté completa y entre comillas |
| Sección vacía con el botón azul | El JSON no cargó | Ábrelo en el navegador: debe descargar sin error |
| Behold dice "token expired" | Meta caducó el permiso | Entra a behold.so y vuelve a autorizar la cuenta |
| Las imágenes no cargan | Rutas mal escritas | Verifica que el archivo exista en `assets/img/fotos/` |
| No funciona al abrir `index.html` con doble clic | El navegador bloquea leer archivos locales | Usa `npm run dev` y abre `http://localhost:5544` |
