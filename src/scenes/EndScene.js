import Phaser from 'phaser';
import { BRAND } from '../config/brand.js';
import { gameState } from '../core/state.js';
import { SFX } from '../core/audio.js';
import { TIEMPO_TOTAL_SEG, ROOMS } from '../config/rooms.js';

const W = 1280;
const H = 720;

export default class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  init(data) {
    this.gano = data.gano;
  }

  create() {
    const g = this.add.graphics();
    if (this.gano) {
      g.fillGradientStyle(0x1b3a2a, 0x1b3a2a, 0x0b1622, 0x151b38, 1);
    } else {
      g.fillGradientStyle(0x3a1b1b, 0x3a1b1b, 0x160b0b, 0x1a1020, 1);
    }
    g.fillRect(0, 0, W, H);

    const emoji = this.gano ? '🏆' : '⏳';
    const titulo = this.gano ? '¡ESCAPASTE!' : 'SE ACABÓ EL TIEMPO';
    const color = this.gano ? BRAND.exito : BRAND.peligro;

    this.add.text(W / 2, 170, emoji, { fontSize: '110px' }).setOrigin(0.5);
    this.add
      .text(W / 2, 300, titulo, {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '64px',
        fontStyle: '700',
        color: '#fff',
      })
      .setOrigin(0.5);

    if (this.gano) {
      const usado = TIEMPO_TOTAL_SEG - gameState.tiempoRestante;
      const m = Math.floor(usado / 60);
      const s = usado % 60;
      this.add
        .text(
          W / 2,
          375,
          `Resolviste las ${gameState.resueltas.size} salas en ${m}m ${s}s\n` +
            `Pistas usadas: ${gameState.pistasUsadas}  ·  Tiempo restante: ${gameState.tiempoTexto}`,
          {
            fontFamily: BRAND.fuenteTexto,
            fontSize: '19px',
            color: 'rgba(255,255,255,0.9)',
            align: 'center',
            lineSpacing: 8,
          }
        )
        .setOrigin(0.5);
      SFX.win();
    } else {
      this.add
        .text(
          W / 2,
          375,
          `Llegaste al episodio ${gameState.salaActual + 1} de ${ROOMS.length}.\n` +
            'El laboratorio quedó sellado... ¡Inténtalo de nuevo!',
          {
            fontFamily: BRAND.fuenteTexto,
            fontSize: '19px',
            color: 'rgba(255,255,255,0.9)',
            align: 'center',
            lineSpacing: 8,
          }
        )
        .setOrigin(0.5);
    }

    if (this.gano) this.confeti();

    this.boton(W / 2, 480, '↻  JUGAR DE NUEVO', color, () => {
      SFX.click();
      gameState.reset();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Menu'));
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  confeti() {
    const cols = [0xc4a857, 0x4dd0e1, 0x57c98b, 0xe0c877, 0xffffff, 0xe5484d];
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * W;
      const col = cols[Math.floor(Math.random() * cols.length)];
      const p = this.add.rectangle(x, -20 - Math.random() * 200, 8, 12, col, 1).setDepth(30);
      p.angle = Math.random() * 360;
      this.tweens.add({
        targets: p,
        y: H + 40,
        angle: p.angle + (Math.random() > 0.5 ? 360 : -360),
        x: x + (Math.random() * 160 - 80),
        duration: 2600 + Math.random() * 2600,
        repeat: -1,
        delay: Math.random() * 2500,
        ease: 'Sine.inOut',
      });
    }
  }

  boton(x, y, texto, colorHex, cb) {
    const cont = this.add.container(x, y);
    const g = this.add.graphics();
    const w = 320;
    const h = 60;
    const ci = parseInt(colorHex.replace('#', ''), 16);
    g.fillStyle(ci, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    const t = this.add
      .text(0, 0, texto, {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '24px',
        fontStyle: '600',
        color: '#fff',
      })
      .setOrigin(0.5);
    cont.add([g, t]);
    const zona = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zona.on('pointerover', () => {
      SFX.hover();
      this.tweens.add({ targets: cont, scale: 1.05, duration: 120 });
    });
    zona.on('pointerout', () =>
      this.tweens.add({ targets: cont, scale: 1, duration: 120 })
    );
    zona.on('pointerdown', cb);
  }
}
