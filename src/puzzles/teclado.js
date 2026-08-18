import { el } from '../ui/dom.js';

// Puzzle de Matemáticas: teclado numérico. Ingresar el código de 4 dígitos.
export default function teclado(host, config, ctx) {
  let entrada = '';
  const largo = config.codigo.length;

  const display = el('div', { class: 'pz-display' });

  function pintarDisplay() {
    display.innerHTML = '';
    for (let i = 0; i < largo; i++) {
      display.append(
        el('span', {
          class: 'pz-digit' + (i < entrada.length ? ' pz-digit-on' : ''),
          text: entrada[i] || '•',
        })
      );
    }
  }

  function agregar(n) {
    if (entrada.length < largo) {
      entrada += n;
      pintarDisplay();
      ctx.sfx.tick();
      if (entrada.length === largo) comprobar();
    }
  }

  function comprobar() {
    if (entrada === config.codigo) {
      ctx.solve();
    } else {
      ctx.fail('Código incorrecto.');
      entrada = '';
      pintarDisplay();
    }
  }

  const teclas = el('div', { class: 'pz-keypad' });
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].forEach((k) => {
    teclas.append(
      el('button', {
        class:
          'pz-key' + (k === 'C' || k === '⌫' ? ' pz-key-alt' : ''),
        text: k,
        onclick: () => {
          ctx.sfx.click();
          if (k === 'C') {
            entrada = '';
            pintarDisplay();
          } else if (k === '⌫') {
            entrada = entrada.slice(0, -1);
            pintarDisplay();
          } else {
            agregar(k);
          }
        },
      })
    );
  });

  host.append(
    el('p', { class: 'pz-enunciado pz-pre', text: config.enunciado }),
    display,
    teclas
  );

  ctx.setAyuda(config.ayuda);
  pintarDisplay();
}
