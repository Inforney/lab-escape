import { el } from '../ui/dom.js';

// Puzzle de selección (Biología): elegir exactamente las opciones correctas.
// Los botones se crean UNA sola vez; el clic solo cambia su estado visual.
export default function seleccion(host, config, ctx) {
  const elegidas = new Set();
  const grid = el('div', { class: 'pz-select' });

  const refs = config.opciones.map((o) => {
    const check = el('span', { class: 'pz-opt-check', text: '' });
    const b = el('button', { class: 'pz-opt', type: 'button' },
      el('span', { class: 'pz-opt-emoji', text: o.emoji }),
      el('span', { class: 'pz-opt-text', text: o.texto }),
      check
    );
    b.addEventListener('click', () => {
      if (elegidas.has(o.id)) elegidas.delete(o.id);
      else elegidas.add(o.id);
      actualizar();
      ctx.sfx.click();
    });
    grid.append(b);
    return { o, b, check };
  });

  const contador = el('div', { class: 'pz-hint' });

  function actualizar() {
    refs.forEach(({ o, b, check }) => {
      const activa = elegidas.has(o.id);
      b.className = 'pz-opt' + (activa ? ' pz-opt-on' : '');
      check.textContent = activa ? '✓' : '';
    });
    contador.textContent = `Seleccionados: ${elegidas.size} de ${config.exactas}`;
  }

  host.append(
    el('p', { class: 'pz-enunciado', text: config.enunciado }),
    grid,
    contador,
    el('div', { class: 'pz-actions' },
      el('button', {
        class: 'pz-btn pz-btn-primary',
        type: 'button',
        text: 'Confirmar selección',
        onclick: () => {
          const correctas = config.opciones.filter((o) => o.correcta).map((o) => o.id);
          const ok =
            elegidas.size === correctas.length &&
            correctas.every((id) => elegidas.has(id));
          if (ok) ctx.solve();
          else ctx.fail(`Selección incorrecta. Debes elegir exactamente ${config.exactas}.`);
        },
      })
    )
  );

  ctx.setAyuda(config.ayuda);
  actualizar();
}
