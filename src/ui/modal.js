import { el } from './dom.js';
import { SFX } from '../core/audio.js';
import { obtenerPuzzle } from '../puzzles/registry.js';

const overlay = () => document.getElementById('overlay');

// Solo puede haber un puzzle abierto a la vez. Sin esto, un clic que llegara
// dos veces reconstruiría el modal y borraría el avance del jugador.
let abierto = false;
export function puzzleAbierto() {
  return abierto;
}

// Abre el puzzle de una sala como modal. Devuelve al resolverlo/cerrarlo.
export function abrirPuzzle(sala, { onSolved, onFail, onHint, onClose }) {
  if (abierto) return; // ya hay uno abierto: no reconstruir
  abierto = true;

  const cont = overlay();
  cont.innerHTML = '';
  cont.classList.add('activo');

  // Ningún evento del modal debe filtrarse al canvas del juego que está debajo.
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'].forEach(
    (ev) => cont.addEventListener(ev, (e) => e.stopPropagation())
  );

  const mod = sala.puzzle;
  const modulo = obtenerPuzzle(mod.type);

  let ayudaTexto = '';
  let ayudaMostrada = false;

  const feedback = el('div', { class: 'pz-feedback' });
  const cuerpo = el('div', { class: 'pz-body' });

  const ctx = {
    sfx: SFX,
    setAyuda(t) {
      ayudaTexto = t;
    },
    fail(msg) {
      SFX.error();
      feedback.className = 'pz-feedback pz-fb-error';
      feedback.textContent = '✖ ' + (msg || 'Incorrecto') + '  (−15 s)';
      panel.classList.remove('shake');
      void panel.offsetWidth;
      panel.classList.add('shake');
      onFail && onFail();
    },
    solve() {
      SFX.ok();
      feedback.className = 'pz-feedback pz-fb-ok';
      feedback.textContent = '✔ ' + sala.exito;
      // Bloquea reintentos.
      cuerpo.style.pointerEvents = 'none';
      // 1) Destello verde de "resuelto" sobre el panel.
      panel.classList.add('pz-solved');
      // 2) El panel sale volando y recién ahí avisamos al juego, para que la
      //    animación de la puerta se vea sin el recuadro tapándola.
      setTimeout(() => {
        panel.classList.add('pz-exit');
        cont.classList.add('pz-fading');
        setTimeout(() => {
          cerrar();
          onSolved && onSolved();
        }, 430);
      }, 1000);
    },
  };

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    cont.classList.remove('activo', 'pz-fading');
    cont.innerHTML = '';
    onClose && onClose();
  }

  const btnAyuda = el('button', {
    class: 'pz-btn pz-btn-hint',
    text: '💡 Pista (−20 s)',
    onclick: () => {
      if (!ayudaMostrada) {
        ayudaMostrada = true;
        onHint && onHint();
        btnAyuda.textContent = '💡 Pista usada';
        btnAyuda.disabled = true;
      }
      feedback.className = 'pz-feedback pz-fb-hint';
      feedback.textContent = '💡 ' + ayudaTexto;
    },
  });

  const panel = el('div', { class: 'pz-panel' },
    el('div', { class: 'pz-header' },
      el('div', { class: 'pz-header-left' },
        el('span', { class: 'pz-materia-emoji', text: sala.emoji }),
        el('div', {},
          el('div', { class: 'pz-titulo', text: mod.titulo }),
          el('div', { class: 'pz-materia', text: sala.materia })
        )
      ),
      el('button', { class: 'pz-close', text: '✕', title: 'Cerrar', onclick: () => { SFX.click(); cerrar(); } })
    ),
    cuerpo,
    feedback,
    el('div', { class: 'pz-footer' }, btnAyuda)
  );

  cont.append(el('div', { class: 'pz-backdrop', onclick: () => { SFX.click(); cerrar(); } }), panel);

  if (modulo) {
    modulo(cuerpo, mod.config, ctx);
  } else {
    cuerpo.append(el('p', { text: 'Puzzle no encontrado: ' + mod.type }));
  }
}
