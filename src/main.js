import Phaser from 'phaser';
import './styles.css';
import { gameState } from './core/state.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';

// La escena se dibuja con una altura fija de 720 y un ANCHO QUE SE ADAPTA a la
// forma de la pantalla. Así el juego llena el dispositivo (móvil panorámico,
// tablet o monitor) sin barras negras a los lados.
export const ALTO_BASE = 720;
const ANCHO_MIN = 960; // pantallas cuadradas (tablet 4:3)
const ANCHO_MAX = 2000; // móviles muy panorámicos

export function anchoIdeal() {
  const rel = window.innerWidth / window.innerHeight;
  return Math.round(
    Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, ALTO_BASE * rel))
  );
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

// Al rotar el móvil o cambiar el tamaño de la ventana, recalculamos el ancho
// y volvemos a dibujar la escena activa para que ocupe toda la pantalla.
let ultimoAncho = config.width;
function reescalar() {
  const nuevo = anchoIdeal();
  game.scale.resize(nuevo, ALTO_BASE);
  game.scale.refresh();
  if (Math.abs(nuevo - ultimoAncho) > 40) {
    ultimoAncho = nuevo;
    const activa = game.scene.getScenes(true)[0];
    if (activa && activa.scene.key !== 'Boot') activa.scene.restart();
  }
}

let temporizador = null;
const reescalarConEspera = () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(reescalar, 180);
};

window.addEventListener('resize', reescalarConEspera);
window.addEventListener('orientationchange', () =>
  setTimeout(reescalar, 300)
);

// Respaldo: algunos navegadores móviles no lanzan "resize" al rotar o al
// ocultarse la barra de direcciones. El observador detecta el cambio igual.
if (window.ResizeObserver) {
  new ResizeObserver(reescalarConEspera).observe(document.documentElement);
}
