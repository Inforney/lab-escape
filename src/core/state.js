// Estado global del juego (inventario, progreso, temporizador).
// Es un singleton simple con suscripción para actualizar la interfaz.
import { ROOMS, TIEMPO_TOTAL_SEG } from '../config/rooms.js';

class GameState {
  constructor() {
    this.reset();
    this._listeners = new Set();
  }

  reset() {
    this.salaActual = 0;              // índice de la sala en curso
    this.resueltas = new Set();       // ids de salas resueltas
    this.inventario = [];             // [{id,nombre,emoji,desc}]
    this.tiempoRestante = TIEMPO_TOTAL_SEG;
    this.pistasUsadas = 0;
    this.terminado = false;
  }

  suscribir(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit() {
    for (const fn of this._listeners) fn(this);
  }

  // ─── Inventario ───────────────────────────────
  tieneItem(id) {
    return this.inventario.some((i) => i.id === id);
  }

  agregarItem(item) {
    if (!this.tieneItem(item.id)) {
      this.inventario.push(item);
      this._emit();
    }
  }

  quitarItem(id) {
    this.inventario = this.inventario.filter((i) => i.id !== id);
    this._emit();
  }

  // ─── Progreso de salas ────────────────────────
  resolverSala(id) {
    this.resueltas.add(id);
    this._emit();
  }

  get salaResueltaActual() {
    const sala = ROOMS[this.salaActual];
    return sala ? this.resueltas.has(sala.id) : false;
  }

  avanzarSala() {
    if (this.salaActual < ROOMS.length - 1) {
      this.salaActual++;
      this._emit();
      return true;
    }
    return false; // no hay más salas: victoria
  }

  get esUltimaSala() {
    return this.salaActual >= ROOMS.length - 1;
  }

  // ─── Temporizador ─────────────────────────────
  restarTiempo(seg) {
    this.tiempoRestante = Math.max(0, this.tiempoRestante - seg);
    this._emit();
    return this.tiempoRestante;
  }

  penalizar(seg) {
    this.restarTiempo(seg);
  }

  get tiempoTexto() {
    const m = Math.floor(this.tiempoRestante / 60);
    const s = this.tiempoRestante % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

export const gameState = new GameState();
