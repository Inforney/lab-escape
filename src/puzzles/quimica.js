import { el } from '../ui/dom.js';

// Puzzle de Química: combinar elementos para formar el compuesto objetivo.
// Los botones de elementos se crean UNA sola vez (no se recrean en cada clic)
// para que el toque sea estable en mouse y en móvil.
export default function quimica(host, config, ctx) {
  let mezcla = []; // símbolos seleccionados en orden

  const items = el('div', { class: 'pz-beaker-items' });
  const vaso = el('div', { class: 'pz-beaker' },
    el('div', { class: 'pz-beaker-label', text: '⚗️ Mezcla actual' }),
    items,
    el('div', { class: 'pz-target', text: '🎯 Objetivo: ' + config.nombreObjetivo })
  );

  // Grid de elementos: persistente
  const grid = el('div', { class: 'pz-elements' });
  config.elementos.forEach((e) => {
    const b = el('button', { class: 'pz-elem', type: 'button' },
      el('span', { class: 'pz-elem-sim', text: e.simbolo }),
      el('span', { class: 'pz-elem-nom', text: e.nombre })
    );
    b.addEventListener('click', () => {
      mezcla.push(e.simbolo);
      pintarMezcla();
      ctx.sfx.pick();
    });
    grid.append(b);
  });

  // Solo la mezcla se redibuja (sus fichas nacen y mueren por naturaleza).
  function pintarMezcla() {
    items.innerHTML = '';
    if (mezcla.length === 0) {
      items.append(el('span', { class: 'pz-word-empty', text: 'Vacío' }));
      return;
    }
    mezcla.forEach((s, idx) => {
      const b = el('button', {
        class: 'pz-elem pz-elem-sel',
        type: 'button',
        text: s,
        title: 'Quitar',
      });
      b.addEventListener('click', () => {
        mezcla.splice(idx, 1);
        pintarMezcla();
        ctx.sfx.click();
      });
      items.append(b);
    });
  }

  function iguales(a, b) {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.every((v, i) => v === sb[i]);
  }

  host.append(
    el('p', { class: 'pz-enunciado', text: config.enunciado }),
    vaso,
    el('div', { class: 'pz-hint', text: '👆 Toca un elemento para agregarlo; toca uno de la mezcla para quitarlo' }),
    grid,
    el('div', { class: 'pz-actions' },
      el('button', {
        class: 'pz-btn pz-btn-ghost',
        type: 'button',
        text: 'Vaciar',
        onclick: () => {
          mezcla = [];
          pintarMezcla();
          ctx.sfx.click();
        },
      }),
      el('button', {
        class: 'pz-btn pz-btn-primary',
        type: 'button',
        text: 'Sintetizar',
        onclick: () => {
          if (mezcla.length === 0) {
            ctx.fail('La mezcla está vacía. Agrega elementos primero.');
            return;
          }
          if (iguales(mezcla, config.objetivo)) {
            ctx.solve();
          } else {
            ctx.fail('Esa combinación no forma el ácido. Revisa la fórmula.');
          }
        },
      })
    )
  );

  ctx.setAyuda(config.ayuda);
  pintarMezcla();
}
