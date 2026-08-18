import Phaser from 'phaser';
import { BRAND } from '../config/brand.js';
import { ROOMS } from '../config/rooms.js';

const W = 1280;
const H = 720;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Fondo de carga
    this.add.rectangle(W / 2, H / 2, W, H, 0x151b38);
    this.add
      .text(W / 2, H / 2 - 20, 'LAB ESCAPE', {
        fontFamily: 'Oswald, sans-serif',
        fontSize: '48px',
        color: '#C4A857',
      })
      .setOrigin(0.5);
    const txt = this.add
      .text(W / 2, H / 2 + 40, 'Cargando…', {
        fontFamily: 'Open Sans, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.load.on('progress', (p) =>
      txt.setText(`Cargando… ${Math.round(p * 100)}%`)
    );

    // Carga las imágenes de fondo SOLO si están definidas en rooms.js.
    // (Deja bg.image en null para usar la escena dibujada por código.)
    ROOMS.forEach((r) => {
      if (r.bg && r.bg.image) {
        this.load.image('bg_' + r.id, 'assets/' + r.bg.image);
      }
    });
  }

  create() {
    this.scene.start('Menu');
  }
}
