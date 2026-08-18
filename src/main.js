import Phaser from 'phaser';
import './styles.css';
import { gameState } from './core/state.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
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

// Al rotar el móvil o cambiar el tamaño, recalcular la escala del canvas.
const reescalar = () => game.scale.refresh();
window.addEventListener('resize', reescalar);
window.addEventListener('orientationchange', () => setTimeout(reescalar, 250));
