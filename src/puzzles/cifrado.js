import { el, normaliza } from '../ui/dom.js';

// Puzzle de Criptografía (cifrado César): girar el disco hasta descifrar.
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function desplazar(txt, n) {
  return txt
    .toUpperCase()
    .split('')
    .map((c) => {
      const i = ABC.indexOf(c);
      if (i === -1) return c;
      return ABC[(i + n + 26) % 26];
    })
    .join('');
}

export default function cifrado(host, config, ctx) {
  let n = 0;

  const cifradoTxt = el('div', { class: 'pz-cipher-src', text: config.textoCifrado });
  const salida = el('div', { class: 'pz-cipher-out' });
  const marca = el('div', { class: 'pz-cipher-shift' });

  function actualizar() {
    salida.textContent = desplazar(config.textoCifrado, n);
    marca.textContent = `Desplazamiento: ${n >= 0 ? '+' : ''}${n}`;
  }

  const menos = el('button', { class: 'pz-key pz-key-alt', type: 'button', text: '◀' });
  const mas = el('button', { class: 'pz-key pz-key-alt', type: 'button', text: '▶' });
  menos.addEventListener('click', () => {
    n = (n - 1 + 26) % 26;
    actualizar();
    ctx.sfx.tick();
  });
  mas.addEventListener('click', () => {
    n = (n + 1) % 26;
    actualizar();
    ctx.sfx.tick();
  });

  host.append(
    el('p', { class: 'pz-enunciado', text: config.enunciado }),
    el('div', { class: 'pz-cipher' },
      el('div', { class: 'pz-cipher-label', text: '🔒 Mensaje interceptado' }),
      cifradoTxt,
      el('div', { class: 'pz-cipher-arrow', text: '▼' }),
      el('div', { class: 'pz-cipher-label', text: '🔓 Descifrado' }),
      salida,
      marca
    ),
    el('div', { class: 'pz-hint', text: '👆 Gira el disco hasta que el mensaje tenga sentido' }),
    el('div', { class: 'pz-dial' }, menos, mas),
    el('div', { class: 'pz-actions' },
      el('button', {
        class: 'pz-btn pz-btn-primary',
        type: 'button',
        text: 'Descifrar',
        onclick: () => {
          if (normaliza(desplazar(config.textoCifrado, n)) === normaliza(config.respuesta)) {
            ctx.solve();
          } else {
            ctx.fail('Todavía no se entiende. Sigue girando el disco.');
          }
        },
      })
    )
  );

  ctx.setAyuda(config.ayuda);
  actualizar();
}
