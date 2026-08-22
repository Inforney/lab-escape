import Phaser from 'phaser';
import './styles.css';
import { gameState } from './core/state.js';
import { layout } from './core/layout.js';
import { puzzleAbierto } from './ui/modal.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';

// La escena se dibuja con una altura fija de 720 y un ANCHO QUE SE ADAPTA a la
// forma de la pantalla. Así el juego llena el dispositivo (móvil panorámico,
// tablet o monitor) sin barras negras a los lados.
export const ALTO_BASE = 720;
const ANCHO_MIN = 960; // pantallas cuadradas (tablet 4:3)
const ANCHO_MAX = 2200; // móviles muy panorámicos

// Medida real del área visible. En móvil, visualViewport es más fiable que
// window.innerWidth/innerHeight (que a veces quedan desactualizados al rotar).
function areaVisible() {
  const vv = window.visualViewport;
  const w = Math.round(vv?.width || window.innerWidth || 1280);
  const h = Math.round(vv?.height || window.innerHeight || 720);
  return { w, h };
}

export function anchoIdeal() {
  const { w, h } = areaVisible();
  const rel = w / h;
  return Math.round(Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, ALTO_BASE * rel)));
}

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: anchoIdeal(),
  height: ALTO_BASE,
  backgroundColor: '#151b38',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
  },
  input: { activePointers: 2 }, // soporte táctil
  scene: [BootScene, MenuScene, GameScene, EndScene],
};

const game = new Phaser.Game(config);
// Expuesto para depuración/pruebas en consola.
window.game = game;
window.gameState = gameState;

// ─────────────────────────────────────────────────────────────
//  Adaptación al tamaño de la pantalla (rotar el móvil, cambiar
//  el tamaño de la ventana, ocultarse la barra de direcciones…)
// ─────────────────────────────────────────────────────────────
let ultimoAncho = config.width;

function reescalar() {
  const nuevo = anchoIdeal();
  if (game.scale.width !== nuevo) {
    // OJO: en modo FIT hay que usar setGameSize(). Con resize() Phaser
    // conserva la proporción anterior y el canvas queda mal escalado.
    game.scale.setGameSize(nuevo, ALTO_BASE);
  }
  game.scale.refresh();

  // Si el ancho cambió de forma apreciable, hay que volver a dibujar la
  // escena para que todo quede bien colocado.
  if (Math.abs(nuevo - ultimoAncho) > 30) {
    ultimoAncho = nuevo;
    const activa = game.scene.getScenes(true)[0];
    if (!activa || activa.scene.key === 'Boot') return;
    if (puzzleAbierto()) {
      // Hay un puzzle abierto: no lo interrumpimos, se redibuja al cerrarlo.
      layout.pendiente = true;
    } else {
      activa.scene.restart();
    }
  }
}

// Vigilante: comprueba el tamaño periódicamente. Es la vía más fiable en
// móviles, donde algunos navegadores no lanzan "resize" al rotar.
let ultW = 0;
let ultH = 0;
function vigilar() {
  const { w, h } = areaVisible();
  if (w !== ultW || h !== ultH) {
    ultW = w;
    ultH = h;
    reescalar();
  }
}
setInterval(vigilar, 350);

// Y además reaccionamos a todos los eventos habituales.
let temporizador = null;
const reescalarConEspera = () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(reescalar, 150);
};

window.addEventListener('resize', reescalarConEspera);
window.addEventListener('load', () => setTimeout(reescalar, 120));
window.addEventListener('pageshow', reescalarConEspera);
window.addEventListener('orientationchange', () => {
  setTimeout(reescalar, 120);
  setTimeout(reescalar, 500); // segundo intento: el viewport tarda en asentarse
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', reescalarConEspera);
}
if (window.ResizeObserver) {
  new ResizeObserver(reescalarConEspera).observe(document.documentElement);
}
