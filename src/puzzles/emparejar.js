import { el } from '../ui/dom.js';

// Puzzle de emparejar (Idiomas): unir cada palabra con su traducción.
// Se toca uno de la izquierda y luego su pareja de la derecha.
export default function emparejar(host, config, ctx) {
  const izq = config.pares.map((p, i) => ({ txt: p.a, i, hecho: false }));
  // Derecha barajada para que no coincida el orden.
  const der = config.pares
    .map((p, i) => ({ txt: p.b, i, hecho: false }))
    .sort(() => Math.random() - 0.5);

  let seleccionIzq = null;
  let resueltos = 0;

  const colIzq = el('div', { class: 'pz-match-col' });
  const colDer = el('div', { class: 'pz-match-col' });
  const marcador = el('div', { class: 'pz-hint' });

  const izqBtns = izq.map((it) => {
    const b = el('button', { class: 'pz-match', type: 'button', text: it.txt });
    b.addEventListener('click', () => {
      if (it.hecho) return;
      seleccionIzq = seleccionIzq === it ? null : it;
      actualizar();
      ctx.sfx.click();
    });
    colIzq.append(b);
    return b;
  });

  const derBtns = der.map((it) => {
    const b = el('button', { class: 'pz-match', type: 'button', text: it.txt });
    b.addEventListener('click', () => {
      if (it.hecho) return;
      if (!seleccionIzq) {
        ctx.fail('Primero elige una palabra de la columna izquierda.');
        return;
      }
      if (seleccionIzq.i === it.i) {
        seleccionIzq.hecho = true;
        it.hecho = true;
        seleccionIzq = null;
        resueltos++;
        ctx.sfx.ok();
        actualizar();
        if (resueltos === config.pares.length) {
          setTimeout(() => ctx.solve(), 350);
        }
      } else {
        seleccionIzq = null;
        actualizar();
        ctx.fail('Esa pareja no corresponde.');
      }
    });
    colDer.append(b);
    return b;
  });

  function actualizar() {
    izq.forEach((it, i) => {
      izqBtns[i].className =
        'pz-match' +
        (it.hecho ? ' pz-match-done' : '') +
        (seleccionIzq === it ? ' pz-match-sel' : '');
      izqBtns[i].disabled = it.hecho;
    });
    der.forEach((it, i) => {
      derBtns[i].className = 'pz-match' + (it.hecho ? ' pz-match-done' : '');
      derBtns[i].disabled = it.hecho;
    });
    marcador.textContent = `Parejas unidas: ${resueltos} de ${config.pares.length}`;
  }

  host.append(
    el('p', { class: 'pz-enunciado', text: config.enunciado }),
    el('div', { class: 'pz-match-grid' }, colIzq, colDer),
    marcador
  );

  ctx.setAyuda(config.ayuda);
  actualizar();
}
