/**
 * ===========================================================================
 *  SORPRESAS DEL CALENDARIO DE ADVIENTO PARA ARII (1 AL 24 + BONUS 25)
 * ===========================================================================
 */

window.ADVENT_CONFIG = {
  recipientName: 'Arii',
  targetMonth: 12,
  timeZone: 'America/Lima',
  targetYear: 2026,
};

window.ADVENT_SURPRISES = {
  1: {
    day: 1,
    type: 'carta-sobre',
    typeLabel: 'Carta en sobre',
    title: 'El comienzo de nuestro primer diciembre ',
    salutation: 'Mi amada Arii,',
    paragraphs: [
      'Hoy empieza 1 diciembre y te preparé esto pensando en ti.',
      'Durante los próximos 24 días encontrarás aquí en cada regalito un detallito distinto y en cada regalito habrá algo con lo que podrás interactuar, leer y distraerte un poquis y hare que te deje pensando mucho tiempo mas de lo normal o tratare siquiera psss.',
      'Solo tienes que volver cada día para descubrir lo que prepare para ti. Ojalá cada sorpresa te saque una sonrisa enorme. ♡'
    ],
    closing: 'Con todo mi amor, siempre tuyo, tu santi.',
    secondaryHtml: '<button class="game-btn">Juego Día 1</button>'
  },
  2: {
    day: 2,
    type: 'revelado-progresivo',
    typeLabel: 'Mensaje progresivo',
    title: '7 pequeños motivos por los que te adoro',
    intro: 'Toca cada luz dorada para ir descubriendo una razón especial:',
    lines: [
      '1. Por la calidez que transmites incluso en los días más grises.',
      '2. Por tu forma tan única y tierna de ver los pequeños detalles.',
      '3. Porque contigo hasta los momentos simples se sienten especiales.',
      '4. Por tu risa, que es mi sonido favorito en todo el mundo.',
      '5. Por lo mucho que inspiras mis ganas de ser mejor cada día.',
      '6. Porque estar a tu lado se siente como llegar a casa.',
      '7. Y porque haces que esta Navidad tenga un brillo incomparable, Arii ♡'
    ],
    secondaryHtml: '<button class="game-btn">Juego Día 2</button>'
  },
  3: {
    day: 3,
    type: 'cupon',
    typeLabel: 'Cupón navideño',
    title: 'Vale por un abrazo infinito',
    couponCode: 'ARII-ABRAZO-03',
    couponTitle: 'CUPÓN ROMÁNTICO DE INVIERNO',
    benefit: 'Válido por un abrazo largo, sin prisas, con besitos incluidos y todo mi cariño cuando más lo quieras.',
    validNote: 'Sin fecha de vencimiento · Canjeable en cualquier momento ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 3</button>'
  },
  4: {
    day: 4,
    type: 'cancion',
    typeLabel: 'Canción dedicada',
    title: 'Una melodía para pensar en ti',
    songTitle: '[Tu canción especial aquí — ej. Perfect / La Vie En Rose]',
    artist: 'Dedicada especialmente para Arii',
    mediaUrl: '',
    melodyPreset: 'romantic',
    lyricsQuote: '\u201cSi pudiera elegir una melodía para acompañar este diciembre, sería cualquiera que nos encuentre tomados de la mano.\u201d',
    note: 'Puedes presionar reproducir para escuchar la cajita musical navideña (o reemplazar `mediaUrl` en data/surprises.js por tu canción favorita).',
    secondaryHtml: '<button class="game-btn">Juego Día 4</button>'
  },
  5: {
    day: 5,
    type: 'acertijo',
    typeLabel: 'Acertijo de amor',
    title: 'El secreto del farol encendido',
    riddle: 'No tengo llave ni candado, pero guardo lo más bonito que siento por ti; late fuerte cuando te veo sonreír y brilla en el muñeco de nieve y en el osito del bosque. ¿Qué soy?',
    acceptedAnswers: ['corazon', 'corazón', 'el corazon', 'el corazón', 'un corazon', 'un corazón', 'amor'],
    hint: 'Pista: Tiene forma de ♡ y aparece en todo nuestro calendario.',
    rewardMessage: '¡Exacto, mi amor! Es mi corazón, que es completamente tuyo hoy y siempre ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 5</button>'
  },
  6: {
    day: 6,
    type: 'minijuego-corazones',
    typeLabel: 'Mini juego',
    title: 'Atrapa los corazones navideños',
    instructions: 'Atrapa 10 corazones luminosos antes de que caigan para desbloquear tu mensaje secreto de hoy.',
    targetScore: 10,
    rewardTitle: '¡Lo lograste, campeona! ♡',
    rewardMessage: 'Así de rápido atrapaste mi corazón desde el primer momento. Gracias por llenar mis días de alegría, Arii.',
    secondaryHtml: '<button class="game-btn">Juego Día 6</button>'
  },
  7: {
    day: 7,
    type: 'promesas-estrellas',
    typeLabel: 'Promesas',
    title: 'Cinco estrellas, cinco promesas',
    intro: 'Toca cada estrella de la noche para encender una promesa para nosotros:',
    promises: [
      'Cuidar tu sonrisa con paciencia, ternura y detalles sinceros.',
      'Escucharte siempre con el corazón abierto, en los días buenos y en los difíciles.',
      'Seguir creando recuerdos bonitos juntos, paso a paso.',
      'Recordarte lo valiosa y especial que eres, incluso cuando lo olvides.',
      'Elegirte con amor cada nuevo día.'
    ],
    secondaryHtml: '<button class="game-btn">Juego Día 7</button>'
  },
  8: {
    day: 8,
    type: 'pregunta-interactiva',
    typeLabel: 'Pregunta para ti',
    title: 'Nuestro cuestionario de Navidad',
    intro: 'Responde estas tres preguntas para planear nuestro momento perfecto de diciembre (tus respuestas quedan guardadas aquí):',
    questions: [
      {
        id: 'q1',
        prompt: '1. Para una noche acogedora juntos, ¿qué prefieres?',
        options: ['Chocolate caliente y películas', 'Postre navideño y música suave', 'Paseo nocturno viendo luces']
      },
      {
        id: 'q2',
        prompt: '2. ¿Qué detalle te derrite más el corazón?',
        options: ['Una carta escrita a mano', 'Un abrazo sorpresa largo', 'Una canción dedicada']
      },
      {
        id: 'q3',
        prompt: '3. ¿Qué palabra describe mejor lo que quieres para nuestra Navidad?',
        options: ['Calma y ternura', 'Risas y complicidad', 'Magia y mucho amor']
      }
    ],
    finalNote: '¡Guardado! Prometo tomar en cuenta cada una de tus elecciones para consentirte como mereces ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 8</button>'
  },
  9: {
    day: 9,
    type: 'audio',
    typeLabel: 'Mensaje de voz',
    title: 'Palabras susurradas para ti',
    audioLabel: 'Nota de voz navideña para Arii',
    mediaUrl: '',
    transcript: '\u201cHola, mi amor. Si hoy tuviste un día largo, respira hondo y recuerda que aquí tienes a alguien que te piensa con muchísimo cariño, que admira todo lo que eres y que siempre está haciendo fuerza por verte feliz.\u201d',
    secondaryHtml: '<button class="game-btn">Juego Día 9</button>'
  },
  10: {
    day: 10,
    type: 'reto',
    typeLabel: 'Reto romántico',
    title: 'Misión dulce del día 10',
    challenge: 'Hoy el reto es sencillo pero mágico: escríbeme qué es lo que más ilusión te hace de esta Navidad y mándame un \u201c♡\u201d para darte un abrazo virtual inmediato (y uno real apenas nos veamos).',
    buttonText: 'Acepto el reto ♡',
    completedMessage: '¡Reto aceptado! Ya estoy esperando tu mensajito con una sonrisa ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 10</button>'
  },
  11: {
    day: 11,
    type: 'cupon',
    typeLabel: 'Cupón de cita',
    title: 'Noche de película y mantita',
    couponCode: 'ARII-CINE-11',
    couponTitle: 'PASE VIP · NOCHE NAVIDEÑA',
    benefit: 'Tú eliges la película navideña, yo llevo algo rico para compartir y prometo abrazarte durante toda la función.',
    validNote: 'Válido para nuestra próxima tarde o noche juntos ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 11</button>'
  },
  12: {
    day: 12,
    type: 'esfera-deseos',
    typeLabel: 'Esfera mágica',
    title: 'La esfera de tus deseos',
    intro: 'Hoy se abre nuestra esfera especial del calendario. Escribe un deseo para ti o para nosotros y guárdalo dentro de la esfera iluminada:',
    placeholder: 'Escribe aquí tu deseo navideño, Arii...',
    savedNote: 'Tu deseo quedó brillando dentro de esta esfera mágica ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 12</button>'
  },
  13: {
    day: 13,
    type: 'minijuego-memoria',
    typeLabel: 'Mini juego',
    title: 'Memorama del bosque encantado',
    instructions: 'Encuentra las 6 parejas navideñas para revelar la frase secreta del día 13:',
    rewardMessage: '¡Memoria brillante! Cada pieza encaja igual de bonito que tú y yo en este diciembre ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 13</button>'
  },
  14: {
    day: 14,
    type: 'recuerdo-editable',
    typeLabel: 'Postal especial',
    title: 'Un espacio para un momento nuestro',
    dateLabel: 'Diciembre · Edición especial',
    heading: '[Personaliza este espacio con un momento bonito que atesores]',
    body: 'Aquí puedes escribir el recuerdo real de una cita, una risa inolvidable, una frase que compartieron o algo que marcó tu corazón cuando comenzaron a caminar juntos.',
    footerQuote: '\u201cLos mejores momentos no necesitan adornos, porque ya brillan por sí solos cuando estás tú.\u201d',
    secondaryHtml: '<button class="game-btn">Juego Día 14</button>'
  },
  15: {
    day: 15,
    type: 'ruleta-actividad',
    typeLabel: 'Actividad juntos',
    title: 'Ruleta de planes románticos',
    intro: 'Gira la ruleta mágica para elegir nuestra próxima pequeña aventura navideña juntos:',
    activities: [
      'Preparar chocolate caliente juntos y brindar por nosotros',
      'Salir a caminar mirando las luces navideñas de la ciudad',
      'Hacer una sesión de fotos espontáneas y divertidas',
      'Elegir juntos un postre navideño y compartirlo sin prisas',
      'Escribirnos una cartita corta para abrir el próximo año',
      'Armar una playlist con nuestras canciones favoritas'
    ],
    secondaryHtml: '<button class="game-btn">Juego Día 15</button>'
  },
  16: {
    day: 16,
    type: 'carta-sobre',
    typeLabel: 'Carta dorada',
    title: 'A mitad de camino hacia Navidad',
    salutation: 'Mi preciosa Arii,',
    paragraphs: [
      'Ya pasamos la mitad de este calendario, pero lo mejor de diciembre sigue siendo compartir los días contigo.',
      'Quiero aprovechar este sobre para agradecerte por existir, por tu dulzura y por hacer que cada conversación contigo me ilumine el día.',
      'Falta muy poco para Navidad, y mi mejor regalo ya eres tú.'
    ],
    closing: 'Con muchísimo amor, hoy y siempre ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 16</button>'
  },
  17: {
    day: 17,
    type: 'video',
    typeLabel: 'Video sorpresa',
    title: 'Una escena hecha para ti',
    caption: 'Un rinconcito decorado especialmente para ver un video dedicado.',
    mediaUrl: '',
    fallbackMessage: 'Espacio reservado para tu video personal para Arii. Agrega la ruta de tu video MP4 o enlace de YouTube en `data/surprises.js` (día 17) y aparecerá aquí dentro de este marco navideño iluminado.',
    secondaryHtml: '<button class="game-btn">Juego Día 17</button>'
  },
  18: {
    day: 18,
    type: 'raspa-nieve',
    typeLabel: 'Sorpresa oculta',
    title: 'Raspa la escarcha dorada',
    instructions: 'Desliza tu dedo o cursor sobre la nieve plateada para descubrir el mensaje escondido debajo:',
    hiddenTitle: '¡Sorpresa descubierta! ♡',
    hiddenMessage: 'Hoy tienes derecho a pedir tu antojo dulce favorito y una dosis extra de mimos. Te quiero muchísimo, Arii.',
    secondaryHtml: '<button class="game-btn">Juego Día 18</button>'
  },
  19: {
    day: 19,
    type: 'candado-secreto',
    typeLabel: 'Cofre secreto',
    title: 'Abre el cofre de las fechas',
    clue: 'Pista del código (3 dígitos): ¿Cuántos regalos tiene el calendario principal hasta Nochebuena? Súmale 0 al inicio si fuera de dos... ¡no! Es un número mágico de 3 cifras: Día de Navidad (25) + el número de tu día favorito (hoy es 19 → prueba con el código navideño: 2-4-5... espera, la pista real está abajo!).',
    secretCode: '024',
    clueClean: 'Pista: El número total de regalos principales de este calendario, en tres cifras (ej. 0 _ _).',
    unlockedMessage: '¡Cofre abierto! Quiero que sepas que eres mi pensamiento bonito de todas las mañanas y de todas las noches ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 19</button>'
  },
  20: {
    day: 20,
    type: 'frasco-motivos',
    typeLabel: 'Frasco mágico',
    title: 'El frasco de los papelitos dorados',
    intro: 'Toca el frasco iluminado para sacar un mensaje sorpresa al azar (puedes sacar todos los que quieras):',
    notes: [
      'Eres mi lugar seguro en medio del ruido del mundo.',
      'Tu sonrisa tiene el superpoder de arreglarme cualquier día.',
      'Gracias por cada detalle lindo que tienes conmigo.',
      'Me encanta cómo eres exactamente tal como eres.',
      'Cada plan es mejor si estás tú en él.',
      'Te amo muchísimo más de lo que cabría en estos 24 regalos ♡'
    ],
    secondaryHtml: '<button class="game-btn">Juego Día 20</button>'
  },
  21: {
    day: 21,
    type: 'cancion',
    typeLabel: 'Melodía de invierno',
    title: 'Noche tranquila junto a ti',
    songTitle: '[Canción navideña / romántica favorita — Día 21]',
    artist: 'Para escuchar abrazados en diciembre',
    mediaUrl: '',
    melodyPreset: 'silent-night',
    lyricsQuote: '\u201cQue la paz de estas noches de diciembre abrace tu corazón y te recuerde cuánto te quiero.\u201d',
    note: 'Presiona reproducir para escuchar la melodía suave de invierno (o enlaza tu pista real en data/surprises.js).',
    secondaryHtml: '<button class="game-btn">Juego Día 21</button>'
  },
  22: {
    day: 22,
    type: 'pacto-firma',
    typeLabel: 'Promesa de invierno',
    title: 'Nuestro pequeño pacto navideño',
    pledgeText: 'Prometemos no dejar que la rutina nos quite la ternura, celebrar los logros pequeños, acompañarnos con paciencia y seguir regalándonos motivos para sonreír todo el año que viene.',
    buttonLabel: 'Firmar pacto con un ♡',
    signedText: 'Pacto sellado con amor por Arii & Tú · Diciembre ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 22</button>'
  },
  23: {
    day: 23,
    type: 'lluvia-estrellas',
    typeLabel: 'Víspera mágica',
    title: 'Solo falta un día para Nochebuena',
    intro: 'Toca cada estrella fugaz para revelar una palabra que describe la luz que traes a mi vida:',
    words: [
      { label: 'Ternura', detail: 'En cada gesto tuyo que me hace sentir querido.' },
      { label: 'Luz', detail: 'Porque iluminas hasta los momentos más simples.' },
      { label: 'Calma', detail: 'La que siento apenas escucho tu voz.' },
      { label: 'Alegría', detail: 'La que nace cada vez que sonríes.' },
      { label: 'Hogar', detail: 'Porque estar contigo siempre se siente bien.' },
      { label: 'Amor', detail: 'El que crece más bonito cada día a tu lado ♡' }
    ],
    secondaryHtml: '<button class="game-btn">Juego Día 23</button>'
  },
  24: {
    day: 24,
    type: 'gran-regalo-24',
    typeLabel: 'Gran Regalo de Nochebuena',
    title: 'Para ti, Arii, en esta Nochebuena ✨',
    salutation: 'Mi amada Arii,',
    letterParagraphs: [
      'Llegamos al regalo número 24, el corazón de todo este pequeño bosque navideño que nació para acompañarte cada día de diciembre.',
      'Si llegaste hasta aquí abriendo sorpresa por sorpresa, quiero que sientas en cada luz, en cada árbol y en cada palabra cuánto significas para mí.',
      'Gracias por existir, por compartir tu tiempo, tu cariño y tu forma tan especial de iluminar mi vida. No importa cuántos días pasen ni cuántas Navidades vengan: mi deseo más bonito siempre va a ser caminar a tu lado.',
      'Feliz Nochebuena, mi amor. Que esta noche esté llena de paz, abrazos cálidos y mucha magia para ti. Te amo con todo mi corazón ♡'
    ],
    closing: 'Por siempre tuyo, en esta y en todas las Navidades.',
    videoTitle: 'Nuestro momento especial en video',
    videoUrl: '',
    videoFallbackNote: 'Espacio reservado para tu video personal de Nochebuena para Arii (editable en `data/surprises.js` → día 24 → `videoUrl`).',
    songTitle: '[Nuestra canción de Nochebuena — editable]',
    songArtist: 'Para cerrar este 24 de diciembre juntos ♡',
    songUrl: '',
    finalConstellationText: '✨ 24 regalos abiertos · Un amor infinito para ti, Arii ♡ ✨',
    secondaryHtml: '<button class="game-btn">Juego Día 24</button>'
  },
  25: {
    day: 25,
    type: 'bonus-25',
    typeLabel: 'Bonus Navideño · 25 de Diciembre',
    title: '¡Feliz Navidad, mi amor! 🎄❤️',
    subtitle: 'Sorpresa especial de la mañana de Navidad',
    messageParagraphs: [
      '¡Por fin es 25 de diciembre! Aunque el calendario tenía 24 días, no podía dejar pasar la Navidad sin dejarte un último regalito secreto bajo el árbol.',
      'Hoy no hay pruebas, acertijos ni cuenta regresiva: solo un deseo inmenso de que tengas una Navidad hermosa, rodeada de cariño, tranquilidad y alegría.',
      'Gracias por hacer de este diciembre un recuerdo inolvidable. ¡Feliz Navidad, Arii! Gracias por existir y te amo muchísimo ♡'
    ],
    giftCoupon: 'BONUS DE NAVIDAD: Válido por un día entero de mimos, abrazos y todo mi amor sin límites ♡',
    secondaryHtml: '<button class="game-btn">Juego Día 25</button>'
  }
};
