// Registro modular de puzles: type (en rooms.js) -> módulo que lo dibuja.
// Para agregar un tipo de acertijo nuevo, impórtalo y añádelo aquí.
import anagrama from './anagrama.js';
import quimica from './quimica.js';
import seleccion from './seleccion.js';
import teclado from './teclado.js';
import cifrado from './cifrado.js';
import orden from './orden.js';
import emparejar from './emparejar.js';

export const PUZZLES = {
  anagrama,
  quimica,
  seleccion,
  teclado,
  cifrado,
  orden,
  emparejar,
};

export function obtenerPuzzle(type) {
  return PUZZLES[type] || null;
}
