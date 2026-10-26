# ASCENSO · Core de fútbol y calistenia militar

> **SUBID DE CATEGORÍA, SUBID LA EXIGENCIA**

App web instalable en el móvil (PWA) que funciona directamente desde GitHub Pages, sin servidor ni base de datos.

## Qué hace

- **Cuestionario completo** con todas las preguntas del plan: idioma, nombre, grupo de edad, objetivo, metas extra, constitución física, mejor forma, cómo cambia tu peso, **edad exacta, peso y estatura** (con IMC), flexiones, sentadillas, flexibilidad, frecuencia, zonas objetivo, duración, molestias de espalda/rodillas, si juegas fútbol, posición, día de partido y equipo disponible.
- **198 ejercicios**: 86 de core para fútbol y 112 de calistenia militar (incluye el PRT del ejército y los isométricos clásicos).
- **Atleta animado** para cada ejercicio, con movimiento articulado real (cinemática inversa) en vista lateral o frontal según convenga.
- **Música de gimnasio generada en vivo** (Gym House, Phonk, Hard Techno, Drill/Trap) sin archivos ni derechos de autor. El atleta y el conteo van **al ritmo de la música**.
- **Conteo en número, en letra y por voz** (español o inglés).
- **Ánimo con tu nombre**: a mitad de serie, en las últimas repeticiones, en descansos y al terminar.
- **Plan de 7 días** adaptado a edad, IMC, nivel, objetivo, molestias, equipo y posición.
- **Modo futbolista** para jóvenes y jugadores: prevención (Copenhague, nórdicos, FIFA 11+), día de partido, pre-partido y post-partido.
- **10 categorías** (de Escuela a Leyenda), XP, rachas, combos e insignias. Cada categoría sube un 7 % la exigencia.
- **Cámara**: te grabas mientras entrenas (con la música y el marcador en el video) y un detector de postura cuenta tus repeticiones reales y te corrige ("Baja más", "Alinea la cadera"…). Todo se procesa en tu teléfono.
- Ajuste automático según cómo te sentiste (fácil / bien / duro).
- Funciona sin conexión después de la primera visita (excepto el detector de postura, que necesita internet la primera vez).

## Publicarla en GitHub Pages

1. Sube todo el contenido de esta carpeta a la raíz de tu repositorio (rama `main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)` → **Save**.
3. En 1-2 minutos estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
4. Ábrela en el móvil y usa **"Añadir a pantalla de inicio"** para instalarla como app.

GitHub Pages sirve por HTTPS, que es obligatorio para que el navegador permita la cámara.

## Permisos

- **Cámara**: el navegador la pide la primera vez que pulsas "Permitir cámara" o el botón de cámara en el entreno. Es opcional.
- **Sonido**: la música y la voz arrancan al tocar "Empezar entreno" (los navegadores exigen un toque).
- **Pantalla encendida**: se mantiene encendida durante el entreno (Wake Lock) si lo activas.

## Estructura

```
index.html          Página principal
manifest.json       Instalación como app
sw.js               Funcionamiento sin conexión
css/styles.css      Diseño
js/i18n.js          Textos ES/EN, números en letras, frases de ánimo
js/figure.js        Motor del atleta animado
js/motions.js       Poses clave de cada movimiento
js/exercises.js     Los 198 ejercicios
js/music.js         Música generada en vivo
js/voice.js         Voz (conteo y ánimo)
js/planner.js       Plan de 7 días, categorías, XP e insignias
js/camera.js        Grabación y detección de postura
js/app.js           Pantallas y reproductor del entreno
icons/              Iconos de la app
```

Tus datos y progreso se guardan solo en tu teléfono (localStorage). Desde Ajustes puedes exportarlos e importarlos.

## Añadir un idioma

Copia el bloque `es` de `js/i18n.js`, tradúcelo con un nuevo código (por ejemplo `pt`) y añádelo a `I18N.langs`. Los nombres de los ejercicios están en `js/exercises.js`.

---

Aviso: esta app no sustituye el consejo médico. Si tienes lesiones o condiciones de salud, consulta a un profesional antes de entrenar. Los menores deben entrenar bajo supervisión de un adulto o su entrenador.
