import { el, normaliza } from '../ui/dom.js';

// Puzzle de Lenguaje: ordenar letras para formar la palabra (figura literaria).
// Los botones se crean UNA sola vez y solo se actualiza su estado (no se
// recrean en cada clic), para que el toque en móvil/mouse sea estable.
export default function anagrama(host, config, ctx) {
  const n = config.letras.length;
  const slots = new Array(n).fill(null); // guarda el índice de 'disponibles' o null
  const disponibles = config.letras.map((l, i) => ({ l, i, usada: false }));

  const fila = el('div', { class: 'pz-slots' });
  const banco = el('div', { class: 'pz-tiles' });

  // Casilleros (creados una vez)
  const slotBtns = [];
  for (let p = 0; p < n; p++) {
    const b = el('button', { class: 'pz-slot', type: 'button' });
    b.addEventListener('click', () => {
      const idx = slots[p];
      if (idx === null) return;
      disponibles[idx].usada = false;
      slots[p] = null;
      actualizar();
      ctx.sfx.click();
    });
    slotBtns.push(b);
    fila.append(b);
  }

  // Fichas del banco (creadas una vez)
  const bankBtns = disponibles.map((t) => {
    const b = el('button', { class: 'pz-tile', type: 'button', text: t.l });
    b.addEventListener('click', () => {
      if (t.usada) return;
      const hueco = slots.indexOf(null);
      if (hueco === -1) return; // todos llenos
      slots[hueco] = t.i;
      t.usada = true;
      actualizar();
      ctx.sfx.pick();
    });
    banco.append(b);
    return b;
  });

  function actualizar() {
    slots.forEach((idx, p) => {
      const b = slotBtns[p];
      if (idx === null) {
        b.textContent = '';
        b.className = 'pz-slot';
      } else {
        b.textContent = disponibles[idx].l;
        b.className = 'pz-slot pz-slot-full';
      }
    });
    disponibles.forEach((t, i) => {
      const b = bankBtns[i];
      b.className = 'pz-tile' + (t.usada ? ' pz-tile-off' : '');
      b.disabled = t.usada;
    });
  }

  function reiniciar() {
    for (let i = 0; i < n; i++) slots[i] = null;
    disponibles.forEach((t) => (t.usada = false));
    actualizar();
    ctx.sfx.click();
  }

  host.append(
    el('p', { class: 'pz-enunciado', text: config.enunciado }),
    fila,
    el('div', { class: 'pz-hint', text: '👆 Toca una letra para colocarla; toca un casillero lleno para quitarla' }),
    banco,
    el('div', { class: 'pz-actions' },
      el('button', { class: 'pz-btn pz-btn-ghost', type: 'button', text: 'Reiniciar', onclick: reiniciar }),
      el('button', {
        class: 'pz-btn pz-btn-primary',
        type: 'button',
        text: 'Comprobar',
        onclick: () => {
          if (slots.includes(null)) {
            ctx.fail('Completa todos los casilleros primero.');
            return;
          }
          const palabra = slots.map((idx) => disponibles[idx].l).join('');
          if (normaliza(palabra) === normaliza(config.respuesta)) {
            ctx.solve();
          } else {
            ctx.fail('Esa no es la palabra. ¡Piensa en la comparación!');
          }
        },
      })
    )
  );

  ctx.setAyuda(config.ayuda);
  actualizar();
}
