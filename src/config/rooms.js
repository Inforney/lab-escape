// ══════════════════════════════════════════════════════════════════
//  ARQUITECTURA MODULAR DE PUZLES
//  Cada EPISODIO (sala) se define aquí como un objeto de datos. Para
//  agregar un acertijo nuevo: (1) crea su módulo en src/puzzles/,
//  (2) regístralo en src/puzzles/registry.js y (3) añade una entrada a
//  este arreglo. El motor del juego (GameScene) no cambia.
// ══════════════════════════════════════════════════════════════════

export const TIEMPO_TOTAL_SEG = 20 * 60; // 20 minutos para escapar

export const ROOMS = [
  // ══════════ EPISODIO 1: LENGUAJE ══════════
  {
    id: 'lenguaje',
    nombre: 'Aula de Lenguaje',
    materia: 'Lenguaje y Literatura',
    emoji: '📖',
    // Slot de imagen realista: pon aquí 'bg/lenguaje.jpg' (en /public/assets)
    // y el juego la usará automáticamente. Si es null, dibuja una escena propia.
    bg: { image: null, grad: ['#2a2350', '#151129'], accent: '#C4A857' },
    intro:
      'Estás encerrado en la vieja aula de Lenguaje. Sobre el pupitre hay una carta con letras revueltas...',
    hotspots: [
      { id: 'carta', x: 0.5, y: 0.62, icono: '✉️', etiqueta: 'Carta abandonada', abrePuzzle: true },
    ],
    puzzle: {
      type: 'anagrama',
      titulo: 'La carta cifrada',
      config: {
        enunciado:
          'En la carta, una palabra clave está con sus letras desordenadas. Ordénala. Pista: es una figura literaria en la que se compara con "como".',
        respuesta: 'SIMIL',
        letras: ['M', 'Í', 'S', 'L', 'I'],
        ayuda: 'Ejemplo: "duerme COMO un tronco". La palabra es SÍMIL.',
      },
    },
    recompensa: {
      id: 'llave_oxidada',
      nombre: 'Llave oxidada',
      emoji: '🗝️',
      desc: 'Abrió la puerta hacia el laboratorio de Química.',
    },
    exito: 'La palabra correcta abre un compartimiento: encuentras una llave oxidada.',
  },

  // ══════════ EPISODIO 2: QUÍMICA ══════════
  {
    id: 'quimica',
    nombre: 'Laboratorio de Química',
    materia: 'Química',
    emoji: '⚗️',
    bg: { image: null, grad: ['#123', '#0b1622'], accent: '#4dd0e1' },
    intro:
      'El candado de la puerta está sellado. En la mesa de trabajo puedes combinar elementos para crear el ácido que lo corroerá.',
    hotspots: [
      { id: 'mesa', x: 0.5, y: 0.66, icono: '⚗️', etiqueta: 'Mesa de trabajo', abrePuzzle: true },
    ],
    puzzle: {
      type: 'quimica',
      titulo: 'Sintetiza el ácido',
      config: {
        enunciado:
          'Combina los elementos correctos para formar ÁCIDO CLORHÍDRICO (HCl), capaz de corroer el candado.',
        objetivo: ['H', 'Cl'],
        nombreObjetivo: 'HCl · Ácido clorhídrico',
        elementos: [
          { simbolo: 'H', nombre: 'Hidrógeno' },
          { simbolo: 'O', nombre: 'Oxígeno' },
          { simbolo: 'Cl', nombre: 'Cloro' },
          { simbolo: 'Na', nombre: 'Sodio' },
          { simbolo: 'C', nombre: 'Carbono' },
          { simbolo: 'S', nombre: 'Azufre' },
        ],
        ayuda: 'El ácido clorhídrico se escribe HCl: un Hidrógeno y un Cloro.',
      },
    },
    requiere: 'llave_oxidada',
    recompensa: {
      id: 'acido',
      nombre: 'Frasco de ácido',
      emoji: '🧴',
      desc: 'Ácido clorhídrico. Corroe metales y candados.',
    },
    exito: 'El ácido burbujea y corroe el candado. La puerta al laboratorio de Biología cede.',
  },

  // ══════════ EPISODIO 3: BIOLOGÍA ══════════
  {
    id: 'biologia',
    nombre: 'Laboratorio de Biología',
    materia: 'Biología',
    emoji: '🧬',
    bg: { image: null, grad: ['#0f2a20', '#08160f'], accent: '#57c98b' },
    intro:
      'Una muestra está infectada. Selecciona los organelos correctos para "curar" la célula y liberar la tarjeta de acceso.',
    hotspots: [
      { id: 'microscopio', x: 0.5, y: 0.66, icono: '🔬', etiqueta: 'Microscopio', abrePuzzle: true },
    ],
    puzzle: {
      type: 'seleccion',
      titulo: 'Cura la célula',
      config: {
        enunciado:
          'Para que la célula produzca energía y defensas, selecciona SOLO los organelos correctos. Elige exactamente 3.',
        opciones: [
          { id: 'mito', texto: 'Mitocondria', emoji: '🔋', correcta: true },
          { id: 'nucleo', texto: 'Núcleo', emoji: '🧠', correcta: true },
          { id: 'ribosoma', texto: 'Ribosoma', emoji: '⚙️', correcta: true },
          { id: 'clorofila', texto: 'Cloroplasto', emoji: '🌿', correcta: false },
          { id: 'pared', texto: 'Pared celular', emoji: '🧱', correcta: false },
        ],
        exactas: 3,
        ayuda:
          'Mitocondria (energía), Núcleo (control) y Ribosoma (proteínas) están en la célula animal. El Cloroplasto y la Pared celular son de plantas.',
      },
    },
    requiere: 'acido',
    recompensa: {
      id: 'tarjeta',
      nombre: 'Tarjeta de acceso',
      emoji: '💳',
      desc: 'Da acceso a la sala de servidores.',
    },
    exito: 'La célula sana emite una tarjeta de acceso magnética.',
  },

  // ══════════ EPISODIO 4: CIBERSEGURIDAD ══════════
  {
    id: 'cyber',
    nombre: 'Sala de Servidores',
    materia: 'Informática · Criptografía',
    emoji: '💻',
    bg: { image: null, grad: ['#0d2233', '#06121c'], accent: '#4dd0e1' },
    intro:
      'Los servidores interceptaron un mensaje cifrado. Descífralo girando el disco de César para obtener la clave.',
    hotspots: [
      { id: 'terminal', x: 0.5, y: 0.66, icono: '🖥️', etiqueta: 'Terminal', abrePuzzle: true },
    ],
    puzzle: {
      type: 'cifrado',
      titulo: 'Mensaje interceptado',
      config: {
        enunciado:
          'Cada letra fue reemplazada por otra desplazada un número fijo de posiciones (cifrado César). Gira el disco hasta leer una palabra con sentido.',
        textoCifrado: 'FODYH', // CLAVE con desplazamiento +3
        respuesta: 'CLAVE',
        ayuda:
          'Prueba con desplazamiento −3: la F retrocede a C, la O a L… La palabra es CLAVE.',
      },
    },
    requiere: 'tarjeta',
    recompensa: {
      id: 'usb',
      nombre: 'Memoria USB',
      emoji: '💾',
      desc: 'Contiene los archivos del Archivo Histórico.',
    },
    exito: 'La terminal acepta la clave y libera una memoria USB.',
  },

  // ══════════ EPISODIO 5: HISTORIA ══════════
  {
    id: 'historia',
    nombre: 'Archivo Histórico',
    materia: 'Ciencias Sociales · Historia',
    emoji: '🏛️',
    bg: { image: null, grad: ['#33240f', '#1a1208'], accent: '#C4A857' },
    intro:
      'El portal temporal está desordenado. Coloca los acontecimientos en su orden cronológico para estabilizarlo.',
    hotspots: [
      { id: 'linea', x: 0.5, y: 0.66, icono: '⏳', etiqueta: 'Línea de tiempo', abrePuzzle: true },
    ],
    puzzle: {
      type: 'orden',
      titulo: 'Restaura la línea de tiempo',
      config: {
        enunciado:
          'Ordena estos acontecimientos del MÁS ANTIGUO al MÁS RECIENTE.',
        eventos: [
          { texto: 'Llegada de Colón a América', anio: 1492, emoji: '⛵' },
          { texto: 'Independencia de Guayaquil', anio: 1820, emoji: '🇪🇨' },
          { texto: 'Batalla de Pichincha', anio: 1822, emoji: '⚔️' },
          { texto: 'Llegada del hombre a la Luna', anio: 1969, emoji: '🌙' },
        ],
        ayuda:
          'Colón (1492) → Independencia de Guayaquil (1820) → Batalla de Pichincha (1822) → Luna (1969).',
      },
    },
    requiere: 'usb',
    recompensa: {
      id: 'engranaje',
      nombre: 'Engranaje antiguo',
      emoji: '⚙️',
      desc: 'Pieza que faltaba en el mecanismo del aula de Idiomas.',
    },
    exito: 'El portal se estabiliza y cae un engranaje antiguo.',
  },

  // ══════════ EPISODIO 6: IDIOMAS ══════════
  {
    id: 'idiomas',
    nombre: 'Aula de Idiomas',
    materia: 'Inglés',
    emoji: '🗣️',
    bg: { image: null, grad: ['#2b1a3d', '#160d20'], accent: '#9b7ad0' },
    intro:
      'La cerradura pide vocabulario. Une cada palabra en inglés con su traducción al español.',
    hotspots: [
      { id: 'pizarra', x: 0.5, y: 0.66, icono: '🔤', etiqueta: 'Pizarra de vocabulario', abrePuzzle: true },
    ],
    puzzle: {
      type: 'emparejar',
      titulo: 'Vocabulario del laboratorio',
      config: {
        enunciado:
          'Toca una palabra en inglés y luego su traducción al español para unirlas.',
        pares: [
          { a: 'Key', b: 'Llave' },
          { a: 'Door', b: 'Puerta' },
          { a: 'Science', b: 'Ciencia' },
          { a: 'Danger', b: 'Peligro' },
          { a: 'Light', b: 'Luz' },
        ],
        ayuda: 'Key=Llave, Door=Puerta, Science=Ciencia, Danger=Peligro, Light=Luz.',
      },
    },
    requiere: 'engranaje',
    recompensa: {
      id: 'manual',
      nombre: 'Manual técnico',
      emoji: '📘',
      desc: 'Explica cómo alimentar el circuito del taller.',
    },
    exito: 'La cerradura se abre y encuentras un manual técnico.',
  },

  // ══════════ EPISODIO 7: FÍSICA ══════════
  {
    id: 'fisica',
    nombre: 'Taller de Física',
    materia: 'Física',
    emoji: '⚡',
    bg: { image: null, grad: ['#122b3a', '#08161f'], accent: '#e0c877' },
    intro:
      'La sala de control está sin energía. Arma el circuito eligiendo los componentes indispensables.',
    hotspots: [
      { id: 'tablero', x: 0.5, y: 0.66, icono: '🔌', etiqueta: 'Tablero eléctrico', abrePuzzle: true },
    ],
    puzzle: {
      type: 'seleccion',
      titulo: 'Cierra el circuito',
      config: {
        enunciado:
          'Para que la lámpara encienda hace falta un circuito cerrado. Elige exactamente 3 componentes indispensables.',
        opciones: [
          { id: 'pila', texto: 'Pila (fuente de voltaje)', emoji: '🔋', correcta: true },
          { id: 'cable', texto: 'Cables conductores', emoji: '🔌', correcta: true },
          { id: 'foco', texto: 'Lámpara (resistencia)', emoji: '💡', correcta: true },
          { id: 'iman', texto: 'Imán decorativo', emoji: '🧲', correcta: false },
          { id: 'madera', texto: 'Bloque de madera (aislante)', emoji: '🪵', correcta: false },
        ],
        exactas: 3,
        ayuda:
          'Un circuito necesita fuente (pila), conductor (cables) y receptor (lámpara). La madera es aislante y el imán no aporta corriente.',
      },
    },
    requiere: 'manual',
    recompensa: {
      id: 'bateria',
      nombre: 'Batería cargada',
      emoji: '🔋',
      desc: 'Alimenta el teclado de la puerta final.',
    },
    exito: '¡La lámpara enciende! Obtienes una batería cargada.',
  },

  // ══════════ EPISODIO 8: MATEMÁTICAS (FINAL) ══════════
  {
    id: 'matematicas',
    nombre: 'Sala de Control',
    materia: 'Matemáticas',
    emoji: '🔢',
    bg: { image: null, grad: ['#241a3a', '#120c20'], accent: '#C4A857' },
    intro:
      'La puerta final tiene un teclado numérico. Resuelve el acertijo para hallar el código de 4 dígitos y escapar.',
    hotspots: [
      { id: 'teclado', x: 0.5, y: 0.64, icono: '🔢', etiqueta: 'Teclado numérico', abrePuzzle: true },
    ],
    puzzle: {
      type: 'teclado',
      titulo: 'Código de escape',
      config: {
        enunciado:
          'Un triángulo tiene ángulos de 90° y 35°.\nDígito 1: el tercer ángulo dividido para 11.\nDígito 2: los lados de un cuadrado.\nDígito 3: valor de "x" si 2x + 6 = 20.\nDígito 4: los lados de un triángulo.\nIngresa el código de 4 dígitos.',
        codigo: '5473',
        ayuda:
          '3er ángulo = 180−90−35 = 55; 55÷11 = 5. Cuadrado = 4 lados. 2x+6=20 → x=7. Triángulo = 3 lados. Código: 5473.',
      },
    },
    requiere: 'bateria',
    recompensa: null, // última sala: victoria
    exito: '¡El código es correcto! La puerta se abre y escapas del laboratorio.',
    final: true,
  },
];
