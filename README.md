# 🔐 Lab Escape · Puzle Multimateria de Escape Room

Sala de escape virtual (Escape Room 2D) donde el estudiante está atrapado en un
laboratorio futurista y debe **combinar pistas de distintas asignaturas** para
encontrar la salida antes de que se acabe el tiempo.

Desarrollado con **Phaser 3 + Vite**. Colorimetría del **Manual de Marca ISTPET**
(azul `#222C57`, dorado `#C4A857`, tipografías Oswald + Open Sans).

---

## 🎮 Los 8 episodios

| # | Episodio | Asignatura | Mecánica | Recompensa |
|---|----------|-----------|----------|-----------|
| 1 | Aula de Lenguaje | Lenguaje y Literatura | Anagrama (figura literaria) | 🗝️ Llave oxidada |
| 2 | Laboratorio de Química | Química | Combinar elementos → HCl | 🧴 Ácido |
| 3 | Laboratorio de Biología | Biología | Elegir organelos correctos | 💳 Tarjeta |
| 4 | Sala de Servidores | Criptografía | Cifrado César (disco giratorio) | 💾 USB |
| 5 | Archivo Histórico | Historia | Ordenar línea de tiempo | ⚙️ Engranaje |
| 6 | Aula de Idiomas | Inglés | Emparejar palabra–traducción | 📘 Manual |
| 7 | Taller de Física | Física | Armar circuito eléctrico | 🔋 Batería |
| 8 | Sala de Control | Matemáticas | Teclado numérico (final) | 🏆 Escape |

Cada episodio **exige el objeto** del episodio anterior, así que la progresión
está encadenada.

---

## 🧩 Arquitectura modular de puzles

Agregar un acertijo nuevo **no requiere tocar el motor del juego**:

1. Crea el módulo en `src/puzzles/miPuzzle.js` con la firma
   `export default function miPuzzle(host, config, ctx) { ... }`
   - `host`: dónde dibujar · `config`: datos del acertijo
   - `ctx.solve()` resuelto · `ctx.fail(msg)` incorrecto · `ctx.setAyuda(txt)` pista
2. Regístralo en `src/puzzles/registry.js`.
3. Añade el episodio al arreglo de `src/config/rooms.js`.

> ⚠️ **Regla importante:** crea los botones **una sola vez** y en el clic solo
> actualiza su estado. Si se destruyen y recrean dentro del propio clic, el
> toque se pierde en móvil y parece que el puzzle "se reinicia".

### Estructura

```
src/
├── config/      rooms.js (episodios) · brand.js (colores ISTPET)
├── core/        state.js (inventario/tiempo) · audio.js (SFX Web Audio)
├── puzzles/     un módulo por acertijo + registry.js
├── scenes/      Boot · Menu · Game · End · scenery.js (escenografía)
├── ui/          modal.js (contenedor de puzles) · dom.js
└── styles.css
```

---

## ▶️ Ejecutar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## 📱 Móvil

Se juega **en horizontal**. En vertical aparece un aviso para girar el
dispositivo. Los botones tienen área táctil de 44 px o más y el panel de puzles
se adapta a la pantalla.

---

## 🚀 Publicar en Render (Static Site)

1. Sube esta carpeta a un repositorio de GitHub.
2. En Render: **New → Static Site** y conecta el repositorio.
3. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Create Static Site**.

Ya está en `render.yaml`, así que también puedes usar **New → Blueprint**.

> Puedes tener varios Static Sites en la misma cuenta: este no interfiere con
> otros proyectos que ya tengas publicados.

---

## 🖼️ Fondos realistas (opcional)

El juego dibuja las salas por código, sin necesidad de imágenes. Si quieres
fondos fotorrealistas, mira `public/assets/bg/LEEME.txt`.
