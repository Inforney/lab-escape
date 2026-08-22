import Phaser from 'phaser';
import { BRAND } from '../config/brand.js';
import { gameState } from '../core/state.js';
import { SFX } from '../core/audio.js';
import { TIEMPO_TOTAL_SEG, ROOMS } from '../config/rooms.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    // Fondo
    const g = this.add.graphics();
    g.fillGradientStyle(0x222c57, 0x222c57, 0x0d1226, 0x151b38, 1);
    g.fillRect(0, 0, W, H);

    // Emojis flotantes de materias
    ['🔬', '⚗️', '🧬', '🔢', '📖', '🧪', '📐', '🦠'].forEach((e) => {
      const t = this.add
        .text(Phaser.Math.Between(60, W - 60), Phaser.Math.Between(90, H - 90), e, {
          fontSize: `${Phaser.Math.Between(30, 64)}px`,
        })
        .setAlpha(0.12);
      this.tweens.add({
        targets: t,
        y: t.y - Phaser.Math.Between(20, 50),
        duration: Phaser.Math.Between(2500, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    });

    // Marco dorado
    const marco = this.add.graphics();
    marco.lineStyle(3, BRAND.hex.dorado, 0.85);
    marco.strokeRoundedRect(40, 40, W - 80, H - 80, 20);

    // Título
    this.add
      .text(W / 2, 150, '🔐', { fontSize: '68px' })
      .setOrigin(0.5);
    this.add
      .text(W / 2, 240, 'LAB ESCAPE', {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '82px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(W / 2, 300, 'PUZLE MULTIMATERIA · ESCAPE ROOM', {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '22px',
        color: BRAND.dorado,
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    // Descripción
    this.add
      .text(
        W / 2,
        372,
        `Estás atrapado en un laboratorio futurista. Supera los ${ROOMS.length} episodios de\n` +
          'Lenguaje, Química, Biología, Criptografía, Historia, Inglés, Física y\n' +
          `Matemáticas para escapar antes de que se acabe el tiempo (${TIEMPO_TOTAL_SEG / 60} min).`,
        {
          fontFamily: BRAND.fuenteTexto,
          fontSize: '17px',
          color: 'rgba(255,255,255,0.85)',
          align: 'center',
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5);

    // Botón iniciar
    this.boton(W / 2, 480, '▶  INICIAR ESCAPE', () => {
      SFX.click();
      gameState.reset();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Game'));
    });

    // Botón pantalla completa (muy útil en móvil)
    const txtFull = this.add
      .text(W / 2 + 110, 560, '⛶ Pantalla completa', {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '16px',
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    txtFull.on('pointerdown', () => {
      SFX.click();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
        txtFull.setText('⛶ Pantalla completa');
      } else {
        this.scale.startFullscreen();
        txtFull.setText('⛶ Salir de pantalla completa');
      }
    });

    // Botón sonido
    this.txtSonido = this.add
      .text(W / 2 - 110, 560, '🔊 Sonido: ON', {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '16px',
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.txtSonido.on('pointerdown', () => {
      const nuevo = !SFX.habilitado;
      SFX.toggle(nuevo);
      if (nuevo) SFX.click();
      this.txtSonido.setText(nuevo ? '🔊 Sonido: ON' : '🔇 Sonido: OFF');
    });

    this.add
      .text(W / 2, H - 62, 'Instituto Superior Tecnológico ISTPET', {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '14px',
        color: 'rgba(196,168,87,0.8)',
      })
      .setOrigin(0.5);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  boton(x, y, texto, cb) {
    const cont = this.add.container(x, y);
    const g = this.add.graphics();
    const w = 340;
    const h = 62;
    g.fillStyle(BRAND.hex.dorado, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    const t = this.add
      .text(0, 0, texto, {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '26px',
        fontStyle: '600',
        color: '#222C57',
      })
      .setOrigin(0.5);
    cont.add([g, t]);
    const zona = this.add
      .zone(x, y, w, h)
      .setInteractive({ useHandCursor: true });
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
