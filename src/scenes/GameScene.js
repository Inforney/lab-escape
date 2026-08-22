import Phaser from 'phaser';
import { BRAND } from '../config/brand.js';
import { ROOMS } from '../config/rooms.js';
import { gameState } from '../core/state.js';
import { layout } from '../core/layout.js';
import { SFX } from '../core/audio.js';
import { abrirPuzzle, puzzleAbierto } from '../ui/modal.js';
import { construirEscena } from './scenery.js';

function hexInt(str) {
  return parseInt(str.replace('#', ''), 16);
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.sala = ROOMS[gameState.salaActual];
    this.puertaAbierta = false;

    this.dibujarEscena();
    this.dibujarHotspots();
    this.dibujarHUD();
    this.dibujarUrgencia();
    this.mostrarIntro();
    this.iniciarTimer();

    SFX.ambienteOn();
  }

  // Bordes rojos que laten cuando queda poco tiempo (oculto al inicio).
  dibujarUrgencia() {
    const W = this.scale.width;
    const H = this.scale.height;
    const u = this.add.graphics().setDepth(9).setAlpha(0);
    const m = 180;
    const R = 0xe5484d;
    u.fillGradientStyle(R, R, R, R, 0.55, 0.55, 0, 0);
    u.fillRect(0, 0, W, m);
    u.fillGradientStyle(R, R, R, R, 0, 0, 0.6, 0.6);
    u.fillRect(0, H - m, W, m);
    u.fillGradientStyle(R, R, R, R, 0.5, 0, 0.5, 0);
    u.fillRect(0, 0, m, H);
    u.fillGradientStyle(R, R, R, R, 0, 0.5, 0, 0.5);
    u.fillRect(W - m, 0, m, H);
    this.urgencia = u;
  }

  // ─── Escena ──────────────────────────────────────────────
  dibujarEscena() {
    const W = this.scale.width;
    const H = this.scale.height;
    const key = 'bg_' + this.sala.id;
    if (this.sala.bg.image && this.textures.exists(key)) {
      // Fondo con imagen realista (si se agregó en /public/assets).
      const img = this.add.image(W / 2, H / 2, key).setDepth(0);
      const scale = Math.max(W / img.width, H / img.height);
      img.setScale(scale);
      // Oscurecido + letterbox para legibilidad del HUD.
      const g = this.add.graphics().setDepth(8);
      g.fillStyle(0x000000, 0.28);
      g.fillRect(0, 0, W, H);
      g.fillStyle(0x000000, 0.6);
      g.fillRect(0, 0, W, 40);
      g.fillRect(0, H - 92, W, 92);
    } else {
      // Escena de laboratorio dibujada por código.
      construirEscena(this, this.sala);
    }
  }

  // ─── Hotspots (objetos interactivos que brillan y giran) ──
  dibujarHotspots() {
    const W = this.scale.width;
    const H = this.scale.height;
    (this.sala.hotspots || []).forEach((hs) => {
      const x = hs.x * W;
      const y = hs.y * H;
      const r = 72;

      const cont = this.add.container(x, y).setDepth(6);

      // Halo suave que respira
      const halo = this.add.circle(0, 0, r * 1.2, BRAND.hex.dorado, 0.16);
      // Anillo giratorio segmentado
      const giro = this.add.graphics();
      giro.lineStyle(3, BRAND.hex.neon, 0.85);
      for (let i = 0; i < 8; i++) {
        const a0 = (i / 8) * Math.PI * 2;
        giro.beginPath();
        giro.arc(0, 0, r * 0.86, a0, a0 + 0.42);
        giro.strokePath();
      }
      // Anillo fijo
      const anillo = this.add.graphics();
      anillo.lineStyle(3, BRAND.hex.dorado, 0.9);
      anillo.strokeCircle(0, 0, r);
      // Disco interior con el icono
      const disco = this.add
        .circle(0, 0, r * 0.64, 0x0d1220, 0.7)
        .setStrokeStyle(1.5, BRAND.hex.dorado, 0.5);
      const icono = this.add
        .text(0, 0, hs.icono, { fontSize: `${Math.round(r * 0.72)}px` })
        .setOrigin(0.5);
      // Etiqueta + pista de acción
      const etiqueta = this.add
        .text(0, r + 12, hs.etiqueta, {
          fontFamily: BRAND.fuenteTexto,
          fontSize: '15px',
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: { x: 10, y: 3 },
        })
        .setOrigin(0.5, 0);
      const hint = this.add
        .text(0, r + 40, '🔍 Examinar', {
          fontFamily: BRAND.fuenteTexto,
          fontSize: '12px',
          color: BRAND.doradoClaro,
        })
        .setOrigin(0.5, 0);

      cont.add([halo, giro, anillo, disco, icono, etiqueta, hint]);
      this.hotspotCont = cont;

      this.tweens.add({ targets: halo, scale: { from: 1, to: 1.25 }, alpha: { from: 0.2, to: 0.05 }, duration: 1400, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: giro, angle: 360, duration: 9000, repeat: -1 });
      this.tweens.add({ targets: icono, y: { from: -3, to: 3 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: hint, alpha: { from: 0.4, to: 1 }, duration: 900, yoyo: true, repeat: -1 });

      const zona = this.add
        .zone(x, y, r * 2, r * 2)
        .setInteractive({ useHandCursor: true })
        .setDepth(7);
      zona.on('pointerover', () => {
        SFX.hover();
        this.tweens.add({ targets: cont, scale: 1.08, duration: 120 });
      });
      zona.on('pointerout', () =>
        this.tweens.add({ targets: cont, scale: 1, duration: 120 })
      );
      zona.on('pointerdown', () => {
        SFX.click();
        if (hs.abrePuzzle) this.intentarPuzzle();
      });
    });
  }

  intentarPuzzle() {
    if (this.puertaAbierta) return;
    if (puzzleAbierto()) return; // ya está abierto: no reabrir
    // ¿Requiere un objeto del inventario?
    if (this.sala.requiere && !gameState.tieneItem(this.sala.requiere)) {
      this.toast('🔒 Necesitas un objeto que aún no tienes.', BRAND.peligro);
      SFX.error();
      return;
    }
    // Mientras el puzzle está abierto, el juego no debe recibir clics.
    this.input.enabled = false;
    abrirPuzzle(this.sala, {
      onSolved: () => this.resolver(),
      onFail: () => gameState.penalizar(15),
      onHint: () => {
        gameState.pistasUsadas++;
        gameState.penalizar(20);
      },
      onClose: () => {
        this.input.enabled = true;
        // Si la pantalla cambió de tamaño mientras el puzzle estaba abierto
        // (por ejemplo al rotar el móvil), redibujamos la sala ahora.
        if (layout.pendiente) {
          layout.pendiente = false;
          this.time.delayedCall(60, () => this.scene.restart());
        }
      },
    });
  }

  resolver() {
    if (this.puertaAbierta) return;
    this.puertaAbierta = true;
    gameState.resolverSala(this.sala.id);
    if (this.sala.recompensa) gameState.agregarItem(this.sala.recompensa);
    SFX.unlock();
    SFX.doorSlide();

    // Estallido de luz desde la puerta focal + temblor.
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H * 0.34;
    const luz = this.add.circle(cx, cy, 12, 0xffffff, 0.95).setDepth(15);
    this.tweens.add({ targets: luz, scale: 55, alpha: 0, duration: 950, ease: 'Cubic.out', onComplete: () => luz.destroy() });
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(16);
    this.tweens.add({ targets: flash, alpha: { from: 0.5, to: 0 }, duration: 700, onComplete: () => flash.destroy() });
    this.cameras.main.shake(500, 0.006);
    if (this.hotspotCont)
      this.tweens.add({ targets: this.hotspotCont, scale: 0, alpha: 0, duration: 500 });

    this.toast('🚪 ' + this.sala.exito, BRAND.exito, 2600);
    this.actualizarHUD();

    this.time.delayedCall(2600, () => {
      if (this.sala.final || gameState.esUltimaSala) {
        this.terminar(true);
      } else {
        gameState.avanzarSala();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(420, () => this.scene.restart());
      }
    });
  }

  // ─── HUD ─────────────────────────────────────────────────
  dibujarHUD() {
    const W = this.scale.width;
    const H = this.scale.height;
    // Título de sala
    this.add
      .text(20, 12, `${this.sala.emoji}  ${this.sala.nombre.toUpperCase()}`, {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '20px',
        color: '#fff',
      })
      .setDepth(10);
    this.add
      .text(22, 40, this.sala.materia, {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '13px',
        color: BRAND.dorado,
      })
      .setDepth(10);

    // Temporizador (cápsula)
    const pill = this.add.graphics().setDepth(10);
    pill.fillStyle(0x000000, 0.5);
    pill.fillRoundedRect(W - 168, 8, 150, 46, 12);
    pill.lineStyle(1.5, BRAND.hex.dorado, 0.6);
    pill.strokeRoundedRect(W - 168, 8, 150, 46, 12);
    this.add
      .text(W - 156, 13, '⏱ TIEMPO', {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '10px',
        color: BRAND.dorado,
      })
      .setDepth(10);
    this.txtTimer = this.add
      .text(W - 28, 26, gameState.tiempoTexto, {
        fontFamily: BRAND.fuenteMono,
        fontSize: '28px',
        color: '#fff',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    // Puntos de progreso
    this.dotsCont = this.add.container(W / 2, 26).setDepth(10);
    this.pintarDots();

    // Inventario (barra inferior)
    this.invCont = this.add.container(0, H - 74).setDepth(10);
    this.pintarInventario();

    this.add
      .text(20, H - 22, 'ISTPET · Lab Escape', {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
      })
      .setDepth(10);
  }

  pintarDots() {
    this.dotsCont.removeAll(true);
    const n = ROOMS.length;
    const sep = 42;
    const ancho = (n - 1) * sep;
    // Línea que conecta los puntos
    const linea = this.add.graphics();
    linea.lineStyle(2, 0x555c7a, 0.7);
    linea.lineBetween(-ancho / 2, 0, ancho / 2, 0);
    // Tramo ya resuelto en dorado
    const resueltasN = ROOMS.filter((r, i) => i < gameState.salaActual && gameState.resueltas.has(r.id)).length;
    if (gameState.salaActual > 0) {
      linea.lineStyle(3, BRAND.hex.dorado, 0.9);
      linea.lineBetween(-ancho / 2, 0, -ancho / 2 + sep * gameState.salaActual, 0);
    }
    this.dotsCont.add(linea);
    ROOMS.forEach((r, i) => {
      const x = -ancho / 2 + i * sep;
      const resuelta = gameState.resueltas.has(r.id);
      const actual = i === gameState.salaActual;
      const c = this.add.circle(
        x,
        0,
        actual ? 10 : 7,
        resuelta ? BRAND.hex.dorado : actual ? BRAND.hex.neon : 0x39405c,
        1
      );
      if (actual) {
        c.setStrokeStyle(2, 0xffffff, 0.9);
        this.tweens.add({ targets: c, scale: { from: 1, to: 1.25 }, duration: 800, yoyo: true, repeat: -1 });
      }
      this.dotsCont.add(c);
      // emoji de la materia sobre el punto
      this.dotsCont.add(
        this.add.text(x, -22, r.emoji, { fontSize: '16px' }).setOrigin(0.5).setAlpha(resuelta || actual ? 1 : 0.4)
      );
    });
    this.dotsCont.add(
      this.add
        .text(0, 18, `SALA ${gameState.salaActual + 1} / ${n}`, {
          fontFamily: BRAND.fuenteTexto,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.7)',
        })
        .setOrigin(0.5, 0)
    );
  }

  pintarInventario() {
    this.invCont.removeAll(true);
    const inv = gameState.inventario;
    this.invCont.add(
      this.add.text(20, -20, '🎒 INVENTARIO', {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '11px',
        color: BRAND.dorado,
      })
    );
    if (inv.length === 0) {
      this.invCont.add(
        this.add.text(20, 4, 'vacío', {
          fontFamily: BRAND.fuenteTexto,
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
        })
      );
    }
    inv.forEach((it, i) => {
      const x = 20 + i * 62;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.4);
      g.fillRoundedRect(x, 0, 52, 52, 10);
      g.lineStyle(1.5, BRAND.hex.dorado, 0.8);
      g.strokeRoundedRect(x, 0, 52, 52, 10);
      const t = this.add
        .text(x + 26, 26, it.emoji, { fontSize: '26px' })
        .setOrigin(0.5);
      const zona = this.add
        .zone(x + 26, 26, 52, 52)
        .setInteractive({ useHandCursor: true });
      zona.on('pointerover', () => this.toast(`${it.emoji} ${it.nombre}: ${it.desc}`, BRAND.dorado, 1800));
      this.invCont.add([g, t, zona]);
    });
  }

  actualizarHUD() {
    this.pintarDots();
    this.pintarInventario();
  }

  // ─── Intro / toast ───────────────────────────────────────
  mostrarIntro() {
    const W = this.scale.width;
    const H = this.scale.height;
    const banner = this.add.container(W / 2, H / 2).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.82);
    g.fillRoundedRect(-360, -70, 720, 140, 16);
    g.lineStyle(2, BRAND.hex.dorado, 0.9);
    g.strokeRoundedRect(-360, -70, 720, 140, 16);
    const t = this.add
      .text(0, 0, this.sala.intro, {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '17px',
        color: '#fff',
        align: 'center',
        wordWrap: { width: 680 },
      })
      .setOrigin(0.5);
    banner.add([g, t]);
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.time.delayedCall(3200, () =>
      this.tweens.add({
        targets: banner,
        alpha: 0,
        duration: 500,
        onComplete: () => banner.destroy(),
      })
    );
  }

  toast(msg, color = '#fff', dur = 2200) {
    const W = this.scale.width;
    const H = this.scale.height;
    const y = H - 120;
    const c = this.add.container(W / 2, y).setDepth(25);
    const g = this.add.graphics();
    const width = Math.min(880, 40 + msg.length * 9);
    g.fillStyle(0x000000, 0.85);
    g.fillRoundedRect(-width / 2, -22, width, 44, 12);
    g.lineStyle(2, hexInt(color.startsWith('#') ? color : '#ffffff'), 0.9);
    g.strokeRoundedRect(-width / 2, -22, width, 44, 12);
    const t = this.add
      .text(0, 0, msg, {
        fontFamily: BRAND.fuenteTexto,
        fontSize: '15px',
        color: '#fff',
        align: 'center',
        wordWrap: { width: width - 30 },
      })
      .setOrigin(0.5);
    c.add([g, t]);
    this.tweens.add({
      targets: c,
      y: y - 10,
      alpha: { from: 1, to: 0 },
      delay: dur,
      duration: 500,
      onComplete: () => c.destroy(),
    });
  }

  // ─── Temporizador global ─────────────────────────────────
  iniciarTimer() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const t = gameState.restarTiempo(1);
        this.txtTimer.setText(gameState.tiempoTexto);
        if (t <= 60) {
          this.txtTimer.setColor('#e5484d');
          if (!this._pulsoUrg) {
            this._pulsoUrg = this.tweens.add({
              targets: this.urgencia,
              alpha: { from: 0, to: 0.85 },
              duration: 600,
              yoyo: true,
              repeat: -1,
            });
          }
          if (t % 2 === 0 && t > 0) SFX.heartbeat();
        }
        if (t <= 10 && t > 0) SFX.tick();
        if (t <= 0) {
          SFX.alarma();
          this.terminar(false);
        }
      },
    });
  }

  terminar(gano) {
    if (gameState.terminado) return;
    gameState.terminado = true;
    this.time.removeAllEvents();
    SFX.ambienteOff();
    this.scene.start('End', { gano });
  }
}
