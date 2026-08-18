import { el } from '../ui/dom.js';

// Puzzle de ordenar (Historia): colocar los eventos en la secuencia correcta.
// Botones persistentes: el clic solo cambia estado, nunca se recrean.
export default function orden(host, config, ctx) {
  const n = config.eventos.length;
  const slots = new Array(n).fill(null);
  const items = config.eventos.map((e, i) => ({ ...e, i, usado: false }));

  const fila = el('div', { class: 'pz-order-slots' });
  const banco = el('div', { class: 'pz-order-bank' });

  const slotBtns = [];
  for (let p = 0; p < n; p++) {
    const num = el('span', { class: 'pz-order-num', text: String(p + 1) });
    const txt = el('span', { class: 'pz-order-txt', text: '—' });
    const b = el('button', { class: 'pz-order-slot', type: 'button' }, num, txt);
    b.addEventListener('click', () => {
      const idx = slots[p];
      if (idx === null) return;
      items[idx].usado = false;
      slots[p] = null;
      actualizar();
      ctx.sfx.click();
    });
    slotBtns.push({ b, txt });
    fila.append(b);
  }

  const bankBtns = items.map((it) => {
    const b = el('button', { class: 'pz-order-item', type: 'button', text: `${it.emoji || '📜'}  ${it.texto}` });
    b.addEventListener('click', () => {
      if (it.usado) return;
      const hueco = slots.indexOf(null);
      if (hueco === -1) return;
      slots[hueco] = it.i;
      it.usado = true;
      actualizar();
      ctx.sfx.pick();
    });
    banco.append(b);
    return b;
  });

  function actualizar() {
    slots.forEach((idx, p) => {
      const { b, txt } = slotBtns[p];
      if (idx === null) {
        txt.textContent = '—';
        b.className = 'pz-order-slot';
      } else {
        txt.textContent = `${items[idx].emoji || '📜'}  ${items[idx].texto}`;
        b.className = 'pz-order-slot pz-order-full';
      }
    });
    items.forEach((it, i) => {
      bankBtns[i].className = 'pz-order-item' + (it.usado ? ' pz-order-off' : '');
      bankBtns[i].disabled = it.usado;
    });
  }

  host.append(
    el('p', { class: 'pz-enunciado', text: config.enunciado }),
    fila,
    el('div', { class: 'pz-hint', text: '👆 Toca un evento para colocarlo; toca una casilla llena para quitarlo' }),
    banco,
    el('div', { class: 'pz-actions' },
      el('button', {
        class: 'pz-btn pz-btn-ghost',
        type: 'button',
        text: 'Reiniciar',
        onclick: () => {
          for (let i = 0; i < n; i++) slots[i] = null;
          items.forEach((it) => (it.usado = false));
          actualizar();
          ctx.sfx.click();
        },
      }),
      el('button', {
        class: 'pz-btn pz-btn-primary',
        type: 'button',
        text: 'Comprobar orden',
        onclick: () => {
          if (slots.includes(null)) {
            ctx.fail('Coloca todos los eventos primero.');
            return;
          }
          const anios = slots.map((idx) => items[idx].anio);
          const ok = anios.every((a, i) => i === 0 || anios[i - 1] <= a);
          if (ok) ctx.solve();
          else ctx.fail('La línea de tiempo no es correcta. Revisa las fechas.');
        },
      })
    )
  );

  ctx.setAyuda(config.ayuda);
  actualizar();
}
