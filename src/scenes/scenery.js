// Escenografía procedimental de alto detalle: dibuja cada sala del laboratorio
// por código (sin imágenes), con iluminación, profundidad, máquinas focales
// temáticas, hologramas animados, niebla, reflejos y partículas.
import Phaser from 'phaser';
import { BRAND } from '../config/brand.js';

const W = 1280;
const H = 720;
const HOR = H * 0.52; // línea de horizonte (pared/piso)

function hx(s) {
  return parseInt(s.replace('#', ''), 16);
}
function mez(c1, c2, t) {
  const a = Phaser.Display.Color.IntegerToColor(c1);
  const b = Phaser.Display.Color.IntegerToColor(c2);
  return Phaser.Display.Color.GetColor(
    Math.round(a.red + (b.red - a.red) * t),
    Math.round(a.green + (b.green - a.green) * t),
    Math.round(a.blue + (b.blue - a.blue) * t)
  );
}

export function construirEscena(scene, sala) {
  const base = hx(sala.bg.grad[0]);
  const oscuro = hx(sala.bg.grad[1]);
  const acc = hx(sala.bg.accent);
  const ctx = { scene, sala, base, oscuro, acc };

  paredYPiso(ctx);
  detallesPared(ctx);
  maquinaFocal(ctx);
  mobiliario(ctx);
  atmosfera(ctx);
  leds(ctx);
  overlays(ctx);
}

// ══ Pared, piso, reflejo y niebla base ═══════════════════
function paredYPiso({ scene, base, oscuro, acc }) {
  const g = scene.add.graphics().setDepth(0);
  // Pared con degradado + oscurecimiento hacia el techo
  g.fillGradientStyle(
    mez(base, 0x000000, 0.35),
    mez(base, 0x000000, 0.35),
    mez(base, 0x000000, 0.05),
    mez(base, 0x000000, 0.05),
    1
  );
  g.fillRect(0, 0, W, HOR);
  // Lavado de color ambiente (tinte del acento) en el centro
  g.fillStyle(acc, 0.05);
  g.fillEllipse ? g.fillEllipse(W / 2, HOR, 900, 420) : g.fillRect(0, 0, W, HOR);

  // Piso
  const g2 = scene.add.graphics().setDepth(0);
  g2.fillGradientStyle(
    mez(oscuro, 0x000000, 0.2),
    mez(oscuro, 0x000000, 0.2),
    mez(oscuro, 0x000000, 0.55),
    mez(oscuro, 0x000000, 0.55),
    1
  );
  g2.fillRect(0, HOR, W, H - HOR);

  // Zócalo brillante en el horizonte
  const g3 = scene.add.graphics().setDepth(1);
  g3.fillStyle(acc, 0.55);
  g3.fillRect(0, HOR - 2, W, 3);
  g3.fillStyle(acc, 0.12);
  g3.fillRect(0, HOR - 14, W, 12);

  // Reflejo del brillo central en el piso (degradado vertical)
  const gr = scene.add.graphics().setDepth(1);
  gr.fillGradientStyle(acc, acc, acc, acc, 0.14, 0.14, 0, 0);
  gr.fillRect(W / 2 - 170, HOR, 340, 150);

  // Rejilla del piso en perspectiva
  const gg = scene.add.graphics().setDepth(1);
  const vpx = W / 2;
  for (let i = -12; i <= 12; i++) {
    gg.lineStyle(1, acc, 0.14);
    gg.lineBetween(vpx, HOR, vpx + i * 150, H);
  }
  for (let k = 1; k <= 9; k++) {
    const t = k / 9;
    const y = HOR + Math.pow(t, 1.9) * (H - HOR);
    gg.lineStyle(1, acc, 0.06 + t * 0.14);
    gg.lineBetween(0, y, W, y);
  }
}

// ══ Detalles de pared: pantallas, paneles, tubos, ventilas ══
function detallesPared({ scene, base, acc }) {
  const g = scene.add.graphics().setDepth(1);
  // Grandes pantallas empotradas a los lados
  pantallaMuro(scene, g, 40, 70, 210, 150, acc);
  pantallaMuro(scene, g, W - 250, 70, 210, 150, acc);

  // Paneles centrales-altos
  for (let x = 300; x < W - 300; x += 170) {
    g.lineStyle(1, mez(base, 0xffffff, 0.14), 0.22);
    g.strokeRoundedRect(x, 44, 140, 90, 6);
    g.fillStyle(mez(base, 0xffffff, 0.18), 0.25);
    g.fillCircle(x + 10, 54, 2);
    g.fillCircle(x + 130, 54, 2);
  }

  // Tuberías verticales con sombreado
  [30, W - 30].forEach((px, i) => {
    g.lineStyle(12, mez(base, 0x000000, 0.4), 0.6);
    g.lineBetween(px, 40, px, HOR + 30);
    g.lineStyle(4, mez(base, 0xffffff, 0.12), 0.5);
    g.lineBetween(px + (i ? 4 : -4), 40, px + (i ? 4 : -4), HOR + 30);
  });

  // Ventilas
  rejilla(g, 90, HOR - 54, 90, 34, acc);
  rejilla(g, W - 180, HOR - 54, 90, 34, acc);
}

function pantallaMuro(scene, g, x, y, w, h, acc) {
  g.fillStyle(0x070b16, 1);
  g.fillRoundedRect(x, y, w, h, 8);
  g.lineStyle(2, acc, 0.45);
  g.strokeRoundedRect(x, y, w, h, 8);
  // barras de datos animadas
  for (let i = 0; i < 5; i++) {
    const barra = scene.add
      .rectangle(x + 16, y + 20 + i * 24, 20 + Math.random() * (w - 60), 8, acc, 0.5)
      .setOrigin(0, 0.5)
      .setDepth(1);
    scene.tweens.add({
      targets: barra,
      scaleX: { from: 0.4, to: 1 },
      alpha: { from: 0.25, to: 0.6 },
      duration: 900 + Math.random() * 1200,
      yoyo: true,
      repeat: -1,
      delay: i * 180,
    });
  }
}

function rejilla(g, x, y, w, h, acc) {
  g.fillStyle(0x0a0f1c, 0.8);
  g.fillRoundedRect(x, y, w, h, 4);
  g.lineStyle(2, mez(acc, 0x000000, 0.3), 0.5);
  for (let yy = y + 6; yy < y + h - 2; yy += 7) g.lineBetween(x + 4, yy, x + w - 4, yy);
}

// ══ Máquina / puerta focal (distinta por materia) ════════
function maquinaFocal({ scene, sala, acc }) {
  const cx = W / 2;
  const topY = 66;
  const doorH = HOR - 20;
  const g = scene.add.graphics().setDepth(2);

  // Marco exterior con volumen
  g.fillStyle(0x0a1020, 1);
  g.fillRoundedRect(cx - 165, topY - 6, 330, doorH + 12, 14);
  g.fillStyle(0x141d33, 1);
  g.fillRoundedRect(cx - 150, topY, 300, doorH, 10);
  g.lineStyle(3, acc, 0.7);
  g.strokeRoundedRect(cx - 150, topY, 300, doorH, 10);
  // Sombras internas
  g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.5, 0.5, 0, 0);
  g.fillRoundedRect(cx - 150, topY, 300, doorH, 10);

  // Barras de luz laterales animadas
  [-150, 150].forEach((dx) => {
    const barra = scene.add
      .rectangle(cx + dx, topY + doorH / 2, 6, doorH - 24, acc, 0.7)
      .setDepth(3);
    scene.tweens.add({
      targets: barra,
      alpha: { from: 0.25, to: 0.95 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
    });
  });

  // Barrido de escáner que sube y baja por la puerta
  const scan = scene.add
    .rectangle(cx, topY + 20, 280, 4, 0xffffff, 0.25)
    .setDepth(4);
  scene.tweens.add({
    targets: scan,
    y: topY + doorH - 20,
    duration: 2600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut',
  });

  // Contenido específico
  const dibujos = {
    lenguaje: focoLenguaje,
    quimica: focoQuimica,
    biologia: focoBiologia,
    matematicas: focoMatematicas,
    cyber: focoCyber,
    historia: focoHistoria,
    idiomas: focoIdiomas,
    fisica: focoFisica,
  };
  (dibujos[sala.id] || (() => {}))(scene, cx, topY, doorH, acc);

  // Rótulo superior
  scene.add
    .text(cx, topY + 20, sala.final ? '⟵ SALIDA ⟶' : 'ACCESO RESTRINGIDO', {
      fontFamily: BRAND.fuenteTitulo,
      fontSize: '18px',
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setDepth(4)
    .setAlpha(0.4);
}

// Portal con letras holográficas flotantes
function focoLenguaje(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2 + 10;
  const g = scene.add.graphics().setDepth(3);
  g.lineStyle(2, BRAND.hex.dorado, 0.5);
  g.strokeCircle(cx, cy, 70);
  g.strokeCircle(cx, cy, 92);
  const letras = 'AΩ¶§ΣΦλβ';
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const t = scene.add
      .text(cx + Math.cos(ang) * 82, cy + Math.sin(ang) * 82, letras[i], {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '22px',
        color: '#e0c877',
      })
      .setOrigin(0.5)
      .setDepth(4)
      .setAlpha(0.85);
    scene.tweens.add({ targets: t, alpha: { from: 0.3, to: 0.9 }, duration: 800 + i * 120, yoyo: true, repeat: -1 });
  }
  const libro = scene.add.text(cx, cy, '📖', { fontSize: '56px' }).setOrigin(0.5).setDepth(4);
  scene.tweens.add({ targets: libro, y: cy - 10, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
}

// Vault con candado corroído y goteo
function focoQuimica(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2 + 10;
  const g = scene.add.graphics().setDepth(3);
  // rueda de vault
  g.lineStyle(10, mez(acc, 0x000000, 0.2), 0.8);
  g.strokeCircle(cx, cy, 58);
  g.lineStyle(6, 0x8d8676, 0.9);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.lineBetween(cx, cy, cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
  }
  g.fillStyle(0x5b5546, 1);
  g.fillCircle(cx, cy, 16);
  // candado corroído
  const cand = scene.add.text(cx, cy + 96, '🔒', { fontSize: '44px' }).setOrigin(0.5).setDepth(4);
  scene.tweens.add({ targets: cand, angle: { from: -4, to: 4 }, duration: 1600, yoyo: true, repeat: -1 });
  // gotas de ácido
  for (let i = 0; i < 3; i++) {
    const gx = cx - 30 + i * 30;
    const gota = scene.add.circle(gx, cy + 60, 3, 0x57c98b, 0.8).setDepth(4);
    scene.tweens.add({ targets: gota, y: cy + 130, alpha: 0, duration: 1800, repeat: -1, delay: i * 600 });
  }
}

// Puerta de contención con biohazard y hélice de ADN
function focoBiologia(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2 + 6;
  const bio = scene.add.text(cx, cy - 8, '☣️', { fontSize: '84px' }).setOrigin(0.5).setDepth(4).setAlpha(0.9);
  scene.tweens.add({ targets: bio, alpha: { from: 0.5, to: 1 }, duration: 1200, yoyo: true, repeat: -1 });
  const g = scene.add.graphics().setDepth(3);
  g.lineStyle(2, 0x57c98b, 0.4);
  g.strokeCircle(cx, cy, 96);
  // sellos de contención
  [-1, 1].forEach((s) => {
    const sello = scene.add.rectangle(cx + s * 130, cy, 8, doorH - 40, 0x57c98b, 0.5).setDepth(3);
    scene.tweens.add({ targets: sello, alpha: { from: 0.2, to: 0.7 }, duration: 900, yoyo: true, repeat: -1 });
  });
}

// Vault con teclado y geometría holográfica
function focoMatematicas(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2;
  // geometrías rotando
  const shapes = ['🔺', '⬛', '⬠', '⬢'];
  shapes.forEach((sh, i) => {
    const r = 40 + i * 16;
    const cont = scene.add.text(cx, cy - 20, sh, { fontSize: `${34 - i * 4}px` }).setOrigin(0.5).setDepth(4).setAlpha(0.5);
    scene.tweens.add({
      targets: cont,
      angle: 360,
      duration: 6000 + i * 2000,
      repeat: -1,
    });
    scene.tweens.add({
      targets: cont,
      x: cx + Math.cos(i) * r,
      y: cy - 20 + Math.sin(i) * r,
      duration: 3000 + i * 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  });
  // panel de teclado dibujado
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x0a1020, 1);
  g.fillRoundedRect(cx - 46, cy + 60, 92, 96, 8);
  g.lineStyle(2, acc, 0.6);
  g.strokeRoundedRect(cx - 46, cy + 60, 92, 96, 8);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      g.fillStyle(mez(acc, 0x000000, 0.25), 0.8);
      g.fillRoundedRect(cx - 38 + c * 28, cy + 68 + r * 28, 22, 22, 4);
    }
}

// Puerta blindada con lluvia de código binario
function focoCyber(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2;
  for (let i = 0; i < 7; i++) {
    const x = cx - 110 + i * 36;
    const col = scene.add
      .text(x, topY + 40, '10110\n01101\n11010', {
        fontFamily: BRAND.fuenteMono,
        fontSize: '15px',
        color: '#4dd0e1',
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(4)
      .setAlpha(0.5);
    scene.tweens.add({
      targets: col,
      y: topY + doorH - 60,
      alpha: { from: 0.55, to: 0 },
      duration: 2600 + Math.random() * 2200,
      repeat: -1,
      delay: i * 260,
    });
  }
  const cand = scene.add.text(cx, cy, '🔐', { fontSize: '62px' }).setOrigin(0.5).setDepth(5);
  scene.tweens.add({ targets: cand, scale: { from: 0.95, to: 1.08 }, duration: 1200, yoyo: true, repeat: -1 });
}

// Portal temporal con reloj y anillos
function focoHistoria(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2;
  const g = scene.add.graphics().setDepth(3);
  [50, 74, 98].forEach((r, i) => {
    g.lineStyle(2, BRAND.hex.dorado, 0.35 + i * 0.12);
    g.strokeCircle(cx, cy, r);
  });
  const reloj = scene.add.text(cx, cy, '⏳', { fontSize: '58px' }).setOrigin(0.5).setDepth(5);
  scene.tweens.add({ targets: reloj, angle: 360, duration: 8000, repeat: -1 });
  ['1492', '1822', '1969'].forEach((a, i) => {
    const ang = (i / 3) * Math.PI * 2;
    const t = scene.add
      .text(cx + Math.cos(ang) * 98, cy + Math.sin(ang) * 98, a, {
        fontFamily: BRAND.fuenteMono,
        fontSize: '16px',
        color: '#e0c877',
      })
      .setOrigin(0.5)
      .setDepth(4);
    scene.tweens.add({ targets: t, alpha: { from: 0.35, to: 1 }, duration: 1100 + i * 300, yoyo: true, repeat: -1 });
  });
}

// Puerta con letras de idiomas flotando
function focoIdiomas(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2;
  const palabras = ['KEY', 'DOOR', 'LIGHT', 'LLAVE', 'PUERTA', 'LUZ'];
  palabras.forEach((p, i) => {
    const t = scene.add
      .text(cx + (i % 2 ? 62 : -62), topY + 70 + i * 42, p, {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '20px',
        color: i < 3 ? '#9b7ad0' : '#e0c877',
      })
      .setOrigin(0.5)
      .setDepth(4)
      .setAlpha(0.75);
    scene.tweens.add({
      targets: t,
      x: t.x + (i % 2 ? -18 : 18),
      alpha: { from: 0.4, to: 0.95 },
      duration: 1800 + i * 200,
      yoyo: true,
      repeat: -1,
    });
  });
  scene.add.text(cx, cy + 110, '🔤', { fontSize: '48px' }).setOrigin(0.5).setDepth(5);
}

// Puerta sin energía: lámpara apagada y cables
function focoFisica(scene, cx, topY, doorH, acc) {
  const cy = topY + doorH / 2;
  const g = scene.add.graphics().setDepth(3);
  // cables serpenteando
  g.lineStyle(4, 0xe0c877, 0.5);
  g.beginPath();
  g.moveTo(cx - 110, topY + 60);
  g.lineTo(cx - 40, cy - 20);
  g.lineTo(cx + 40, topY + 70);
  g.lineTo(cx + 110, cy - 10);
  g.strokePath();
  const foco = scene.add.text(cx, cy, '💡', { fontSize: '64px' }).setOrigin(0.5).setDepth(5).setAlpha(0.35);
  scene.tweens.add({ targets: foco, alpha: { from: 0.2, to: 0.55 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 1800 });
  scene.add
    .text(cx, cy + 76, 'SIN ENERGÍA', {
      fontFamily: BRAND.fuenteTitulo,
      fontSize: '16px',
      color: '#e5484d',
    })
    .setOrigin(0.5)
    .setDepth(5)
    .setAlpha(0.7);
}

// ══ Mobiliario temático ══════════════════════════════════
function mobiliario({ scene, sala, acc }) {
  switch (sala.id) {
    case 'lenguaje':
      sombraPiso(scene, 150, HOR + 6, 220);
      sombraPiso(scene, W - 150, HOR + 6, 220);
      estanteriaLibros(scene, 56, HOR + 30);
      estanteriaLibros(scene, W - 240, HOR + 30);
      escritorio(scene, W / 2 - 120, HOR + 150);
      break;
    case 'quimica':
      sombraPiso(scene, 190, HOR + 96, 300);
      sombraPiso(scene, W - 170, HOR + 40, 240);
      mesaLab(scene, 70, HOR + 96);
      estanteFrascos(scene, W - 270, HOR - 30);
      break;
    case 'biologia':
      sombraPiso(scene, 150, HOR + 30, 200);
      sombraPiso(scene, W - 150, HOR + 30, 200);
      tanque(scene, 60, HOR + 30, 0x57c98b);
      tanque(scene, W - 210, HOR + 30, 0x4dd0e1);
      mesaLab(scene, W / 2 - 120, HOR + 176);
      break;
    case 'matematicas':
      sombraPiso(scene, 170, HOR + 40, 280);
      sombraPiso(scene, W - 190, HOR + 40, 300);
      panelMonitores(scene, 50, HOR - 20, acc);
      panelMonitores(scene, W - 300, HOR - 20, acc);
      break;
    case 'cyber':
      sombraPiso(scene, 150, HOR + 40, 240);
      sombraPiso(scene, W - 150, HOR + 40, 240);
      rack(scene, 60, HOR + 30, acc);
      rack(scene, W - 220, HOR + 30, 0x57c98b);
      break;
    case 'historia':
      sombraPiso(scene, 150, HOR + 6, 220);
      sombraPiso(scene, W - 150, HOR + 6, 220);
      estanteriaLibros(scene, 56, HOR + 30);
      vitrina(scene, W - 250, HOR + 30, acc);
      break;
    case 'idiomas':
      sombraPiso(scene, 160, HOR + 30, 240);
      sombraPiso(scene, W - 160, HOR + 30, 240);
      pizarra(scene, 50, HOR - 40, acc);
      estanteriaLibros(scene, W - 240, HOR + 30);
      break;
    case 'fisica':
      sombraPiso(scene, 170, HOR + 96, 300);
      sombraPiso(scene, W - 170, HOR + 40, 240);
      mesaLab(scene, 70, HOR + 96);
      tableroElectrico(scene, W - 280, HOR - 30, acc);
      break;
  }
}

// Rack de servidores con luces que parpadean
function rack(scene, x, y, acc) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x0c1420, 1);
  g.fillRoundedRect(x, y - 230, 160, 260, 6);
  g.lineStyle(2, acc, 0.4);
  g.strokeRoundedRect(x, y - 230, 160, 260, 6);
  for (let r = 0; r < 7; r++) {
    const ry = y - 220 + r * 36;
    g.fillStyle(0x18243a, 1);
    g.fillRoundedRect(x + 8, ry, 144, 28, 3);
    for (let c = 0; c < 3; c++) {
      const led = scene.add
        .circle(x + 20 + c * 14, ry + 14, 3, c === 0 ? 0x57c98b : acc, 1)
        .setDepth(4);
      scene.tweens.add({
        targets: led,
        alpha: { from: 1, to: 0.15 },
        duration: 300 + Math.random() * 900,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 800,
      });
    }
    g.fillStyle(0x0a0f1a, 1);
    g.fillRect(x + 70, ry + 8, 70, 12);
  }
}

// Vitrina de museo con piezas históricas
function vitrina(scene, x, y, acc) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x2a1f12, 1);
  g.fillRoundedRect(x, y - 200, 200, 230, 6);
  g.fillStyle(0x0f1620, 0.85);
  g.fillRect(x + 12, y - 188, 176, 150);
  g.lineStyle(2, acc, 0.5);
  g.strokeRect(x + 12, y - 188, 176, 150);
  ['🏺', '📜', '⚱️'].forEach((e, i) => {
    const t = scene.add
      .text(x + 46 + i * 54, y - 112, e, { fontSize: '36px' })
      .setOrigin(0.5)
      .setDepth(4);
    scene.tweens.add({ targets: t, y: t.y - 6, duration: 2000 + i * 400, yoyo: true, repeat: -1 });
  });
  // reflejo del vidrio
  g.fillStyle(0xffffff, 0.06);
  g.fillTriangle(x + 12, y - 188, x + 90, y - 188, x + 12, y - 60);
}

// Pizarra con vocabulario
function pizarra(scene, x, y, acc) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x1a2a1e, 1);
  g.fillRoundedRect(x, y - 150, 230, 160, 6);
  g.lineStyle(6, 0x5a3d30, 1);
  g.strokeRoundedRect(x, y - 150, 230, 160, 6);
  ['Key = Llave', 'Door = ?', 'Light = ?'].forEach((txt, i) => {
    scene.add
      .text(x + 20, y - 130 + i * 34, txt, {
        fontFamily: BRAND.fuenteTitulo,
        fontSize: '19px',
        color: '#e8f0e4',
      })
      .setDepth(4)
      .setAlpha(0.7);
  });
}

// Tablero eléctrico con interruptores
function tableroElectrico(scene, x, y, acc) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x1b2434, 1);
  g.fillRoundedRect(x, y - 150, 220, 180, 6);
  g.lineStyle(2, acc, 0.5);
  g.strokeRoundedRect(x, y - 150, 220, 180, 6);
  for (let i = 0; i < 6; i++) {
    const sx = x + 20 + (i % 3) * 66;
    const sy = y - 128 + Math.floor(i / 3) * 80;
    g.fillStyle(0x0e1524, 1);
    g.fillRoundedRect(sx, sy, 46, 58, 4);
    const pal = scene.add.rectangle(sx + 23, sy + (i % 2 ? 18 : 40), 22, 14, i % 2 ? 0x57c98b : 0xe5484d, 1).setDepth(4);
    scene.tweens.add({ targets: pal, alpha: { from: 1, to: 0.4 }, duration: 700 + i * 200, yoyo: true, repeat: -1 });
  }
  // chispa ocasional
  const chispa = scene.add.text(x + 110, y - 160, '⚡', { fontSize: '26px' }).setOrigin(0.5).setDepth(5).setAlpha(0);
  scene.tweens.add({ targets: chispa, alpha: { from: 0, to: 1 }, duration: 120, yoyo: true, repeat: -1, repeatDelay: 2200 });
}

function sombraPiso(scene, x, y, w) {
  const g = scene.add.graphics().setDepth(2);
  g.fillStyle(0x000000, 0.35);
  g.fillEllipse(x, y, w, 40);
}

function estanteriaLibros(scene, x, y) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x2e2013, 1);
  g.fillRoundedRect(x, y - 210, 184, 240, 4);
  g.fillStyle(0x1f160c, 1);
  g.fillRect(x + 6, y - 202, 172, 224);
  const cols = [0x8d6e63, 0xc4a857, 0x557c98, 0x9b5d5d, 0x5d9b7a, 0xb08a3e, 0x76608a];
  for (let sh = 0; sh < 3; sh++) {
    const sy = y - 190 + sh * 74;
    let bx = x + 12;
    while (bx < x + 166) {
      const bw = 9 + Math.random() * 11;
      const bh = 48 + Math.random() * 14;
      g.fillStyle(cols[Math.floor(Math.random() * cols.length)], 1);
      g.fillRect(bx, sy + (66 - bh), bw, bh);
      g.fillStyle(0xffffff, 0.08);
      g.fillRect(bx, sy + (66 - bh), bw, 4);
      bx += bw + 2;
    }
    g.fillStyle(0x120c07, 1);
    g.fillRect(x + 6, sy + 66, 172, 6);
  }
}

function escritorio(scene, x, y) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x5a3d30, 1);
  g.fillRoundedRect(x, y, 240, 18, 4);
  g.fillStyle(0xffffff, 0.06);
  g.fillRect(x, y, 240, 5);
  g.fillStyle(0x3a2620, 1);
  g.fillRect(x + 16, y + 18, 16, 90);
  g.fillRect(x + 208, y + 18, 16, 90);
  // papel + lámpara
  g.fillStyle(0xf4f1ea, 0.92);
  g.fillRect(x + 150, y - 28, 46, 32);
  g.fillStyle(0x000000, 0.08);
  for (let i = 0; i < 4; i++) g.fillRect(x + 156, y - 22 + i * 6, 34, 2);
  const luz = scene.add.text(x + 40, y - 18, '🕯️', { fontSize: '30px' }).setOrigin(0.5).setDepth(4);
  scene.tweens.add({ targets: luz, scale: { from: 0.94, to: 1.06 }, duration: 500, yoyo: true, repeat: -1 });
  const halo = scene.add.circle(x + 40, y - 24, 26, 0xffcf87, 0.16).setDepth(2);
  scene.tweens.add({ targets: halo, alpha: { from: 0.08, to: 0.24 }, duration: 500, yoyo: true, repeat: -1 });
}

function mesaLab(scene, x, y) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x2c3550, 1);
  g.fillRoundedRect(x, y, 250, 16, 4);
  g.fillStyle(0xffffff, 0.06);
  g.fillRect(x, y, 250, 4);
  g.fillStyle(0x20283e, 1);
  g.fillRect(x + 18, y + 16, 12, 80);
  g.fillRect(x + 220, y + 16, 12, 80);
  frasco(scene, x + 44, y, 0x57c98b);
  frasco(scene, x + 108, y, 0xe0c877);
  frasco(scene, x + 172, y, 0x4dd0e1);
  // mechero
  const fuego = scene.add.text(x + 210, y - 6, '🔥', { fontSize: '20px' }).setOrigin(0.5).setDepth(4);
  scene.tweens.add({ targets: fuego, scaleY: { from: 0.8, to: 1.15 }, duration: 240, yoyo: true, repeat: -1 });
}

function frasco(scene, x, y, color) {
  const g = scene.add.graphics().setDepth(4);
  g.fillStyle(0xffffff, 0.14);
  g.fillTriangle(x - 13, y - 36, x + 13, y - 36, x, y - 2);
  g.fillStyle(color, 0.85);
  g.fillTriangle(x - 8, y - 17, x + 8, y - 17, x, y - 3);
  g.fillStyle(0xdfe6ef, 0.9);
  g.fillRect(x - 4, y - 44, 8, 10);
  const luz = scene.add.circle(x, y - 12, 18, color, 0.2).setDepth(3);
  scene.tweens.add({ targets: luz, alpha: { from: 0.06, to: 0.3 }, duration: 1300, yoyo: true, repeat: -1 });
  // burbuja
  const b = scene.add.circle(x, y - 10, 2, 0xffffff, 0.6).setDepth(5);
  scene.tweens.add({ targets: b, y: y - 30, alpha: 0, duration: 1500, repeat: -1, delay: Math.random() * 1500 });
}

function estanteFrascos(scene, x, y) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x243044, 1);
  g.fillRoundedRect(x, y - 130, 210, 160, 4);
  g.fillStyle(0xffffff, 0.05);
  g.fillRect(x, y - 130, 210, 4);
  const colores = [0xe5484d, 0x57c98b, 0x4dd0e1, 0xe0c877, 0x9b7ad0, 0xff8f00];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const bx = x + 16 + c * 38;
      const by = y - 108 + r * 66;
      g.fillStyle(0xffffff, 0.1);
      g.fillRoundedRect(bx, by, 24, 44, 4);
      g.fillStyle(colores[(r * 5 + c) % colores.length], 0.85);
      g.fillRoundedRect(bx, by + 18, 24, 26, 4);
      g.fillStyle(0xffffff, 0.18);
      g.fillRect(bx + 3, by + 4, 4, 30);
    }
    g.fillStyle(0x141d2e, 1);
    g.fillRect(x, y - 44 + r * 66, 210, 6);
  }
}

function tanque(scene, x, y, color) {
  const g = scene.add.graphics().setDepth(3);
  g.fillStyle(0x0e1a16, 1);
  g.fillRoundedRect(x, y - 200, 150, 230, 12);
  g.fillStyle(color, 0.18);
  g.fillRoundedRect(x + 12, y - 186, 126, 204, 8);
  g.lineStyle(3, color, 0.55);
  g.strokeRoundedRect(x + 12, y - 186, 126, 204, 8);
  g.fillStyle(0xffffff, 0.1);
  g.fillRect(x + 22, y - 180, 10, 190);
  for (let i = 0; i < 7; i++) {
    const bx = x + 24 + Math.random() * 100;
    const b = scene.add.circle(bx, y + 8, 3 + Math.random() * 4, color, 0.55).setDepth(4);
    scene.tweens.add({ targets: b, y: y - 170, alpha: 0, duration: 2200 + Math.random() * 2200, repeat: -1, delay: Math.random() * 2000 });
  }
  const esp = scene.add.text(x + 75, y - 80, '🧬', { fontSize: '48px' }).setOrigin(0.5).setDepth(4).setAlpha(0.9);
  scene.tweens.add({ targets: esp, y: esp.y - 24, angle: 14, duration: 3200, yoyo: true, repeat: -1 });
}

function panelMonitores(scene, x, y, acc) {
  const g = scene.add.graphics().setDepth(3);
  const eqs = ['x²+y²=r²', 'π·r²', 'a²+b²=c²', '∑ⁿᵢ₌₁', '∫f(x)dx', 'sin θ', '90° 60° 30°', 'log₂'];
  g.fillStyle(0x111a30, 1);
  g.fillRoundedRect(x - 8, y - 150, 260, 190, 8);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const mx = x + c * 126;
      const my = y - 138 + r * 90;
      g.fillStyle(0x0a0f1e, 1);
      g.fillRoundedRect(mx, my, 110, 74, 6);
      g.lineStyle(1.5, acc, 0.5);
      g.strokeRoundedRect(mx, my, 110, 74, 6);
      const t = scene.add
        .text(mx + 55, my + 37, eqs[(r * 2 + c + Math.floor(x)) % eqs.length], {
          fontFamily: BRAND.fuenteMono,
          fontSize: '15px',
          color: '#4dd0e1',
        })
        .setOrigin(0.5)
        .setDepth(4);
      scene.tweens.add({ targets: t, alpha: { from: 0.4, to: 1 }, duration: 700 + Math.random() * 900, yoyo: true, repeat: -1 });
    }
  }
}

// ══ Atmósfera: haces de luz, niebla, partículas ══════════
function atmosfera({ scene, acc }) {
  // Cono de luz cenital
  const g = scene.add.graphics().setDepth(2);
  g.fillStyle(0xffffff, 0.045);
  g.beginPath();
  g.moveTo(W / 2 - 70, 40);
  g.lineTo(W / 2 + 70, 40);
  g.lineTo(W / 2 + 360, H);
  g.lineTo(W / 2 - 360, H);
  g.closePath();
  g.fillPath();
  g.fillStyle(acc, 0.9);
  g.fillRoundedRect(W / 2 - 80, 36, 160, 10, 4);

  // Haces laterales inclinados
  [0.18, 0.82].forEach((fx) => {
    const b = scene.add.graphics().setDepth(2);
    b.fillStyle(acc, 0.04);
    b.beginPath();
    b.moveTo(W * fx - 30, 40);
    b.lineTo(W * fx + 30, 40);
    b.lineTo(W * fx + 120, H);
    b.lineTo(W * fx + 60, H);
    b.closePath();
    b.fillPath();
  });

  // Niebla que se desliza cerca del piso
  for (let i = 0; i < 3; i++) {
    const fog = scene.add.ellipse(Math.random() * W, HOR + 40 + i * 70, 520, 120, 0xffffff, 0.03).setDepth(5);
    scene.tweens.add({ targets: fog, x: fog.x + (Math.random() > 0.5 ? 180 : -180), duration: 9000 + i * 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // Partículas de polvo flotando
  for (let i = 0; i < 40; i++) {
    const p = scene.add.circle(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 0xffffff, 0.22).setDepth(4);
    scene.tweens.add({
      targets: p,
      y: p.y - (40 + Math.random() * 70),
      x: p.x + (Math.random() * 40 - 20),
      alpha: { from: 0.22, to: 0 },
      duration: 4000 + Math.random() * 4000,
      repeat: -1,
      delay: Math.random() * 3000,
    });
  }
}

// ══ LEDs parpadeantes ════════════════════════════════════
function leds({ scene, acc }) {
  const pts = [
    [40, 28, 0x57c98b],
    [W - 40, 28, 0xe5484d],
    [W / 2 - 200, HOR - 30, acc],
    [W / 2 + 200, HOR - 30, 0x4dd0e1],
    [120, HOR - 30, 0xe0c877],
    [W - 120, HOR - 30, 0x57c98b],
  ];
  pts.forEach(([x, y, col]) => {
    const led = scene.add.circle(x, y, 4, col, 1).setDepth(5);
    const halo = scene.add.circle(x, y, 9, col, 0.3).setDepth(5);
    scene.tweens.add({ targets: [led, halo], alpha: { from: 1, to: 0.15 }, duration: 500 + Math.random() * 800, yoyo: true, repeat: -1 });
  });
}

// ══ Overlays: grade de color + scanlines + viñeta + letterbox ══
function overlays({ scene, acc }) {
  // Tinte de color global (cohesión)
  const grade = scene.add.graphics().setDepth(8);
  grade.fillStyle(acc, 0.05);
  grade.fillRect(0, 0, W, H);

  // Scanlines
  const g = scene.add.graphics().setDepth(8);
  g.fillStyle(0x000000, 0.05);
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);

  // Viñeta con bordes degradados
  const v = scene.add.graphics().setDepth(8);
  const m = 170;
  v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.6, 0.6, 0, 0);
  v.fillRect(0, 0, W, m);
  v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.75, 0.75);
  v.fillRect(0, H - m, W, m);
  v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.55, 0, 0.55, 0);
  v.fillRect(0, 0, m, H);
  v.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.55, 0, 0.55);
  v.fillRect(W - m, 0, m, H);

  // Letterbox
  const lb = scene.add.graphics().setDepth(9);
  lb.fillStyle(0x000000, 0.62);
  lb.fillRect(0, 0, W, 40);
  lb.fillRect(0, H - 92, W, 92);
}
