/* ASCENSO — Textos en español e inglés, números en letras y frases de ánimo */
(function (G) {
  'use strict';
  const T = {
    es: {
      appName: 'ASCENSO', motto: 'SUBID DE CATEGORÍA, SUBID LA EXIGENCIA', tagline: 'Core de fútbol y calistenia militar',
      start: 'EMPEZAR', next: 'PRÓXIMO PASO', cont: 'CONTINUAR', back: 'Atrás', skip: 'Omitir', chooseAll: 'Elige todos los que correspondan',
      secProfile: 'Mi perfil', secActivity: 'Actividad', secFootball: 'Fútbol y equipo', secPlan: 'Mi plan',
      qLang: 'Elige tu idioma', qName: '¿Cómo te llamas?', qNameSub: 'Usaremos tu nombre para animarte en cada serie.', namePh: 'Tu nombre',
      qAge: 'Plan de entrenamiento de calistenia', qAgeSub: 'ELIGE TU EDAD', age: 'Edad',
      ageJ: 'Juvenil', info1T: '¡La calistenia es una forma sencilla y eficaz de ponerte en forma!', info1B: 'Es un tipo de entrenamiento que <b>utiliza el peso de tu cuerpo</b>.<br><br>¡Te ayudaremos a <b>ponerte en forma en casa sin usar ningún equipo!</b>',
      qGoal: '¿Cuál es tu principal objetivo?', g_muscle: 'Ganar músculo', g_lose: 'Perder peso', g_recomp: 'Perder grasa y ganar músculos', g_fit: 'Mejorar el estado físico general',
      qMore: '¿Qué más esperas lograr con este plan?', m_tone: 'Logra un cuerpo esculpido y tonificado', m_endur: 'Aumenta la resistencia y la energía', m_post: 'Mejora tu postura y flexibilidad', m_libido: 'Aumenta el deseo sexual', m_stress: 'Reduce el estrés y duerme mejor',
      qBody: '¿Cómo describirías tu constitución física?', b_slim: 'Esbelto', b_mid: 'Constitución mediana', b_chubby: 'Regordete', b_over: 'Sobrepeso significativo',
      qBest: '¿Hace cuánto tiempo estabas en la mejor forma de tu vida?', bs_1: 'Hace menos de un año', bs_2: '1 a 2 años atrás', bs_3: 'Más de 3 años atrás', bs_never: 'Nunca',
      qWeight: '¿Cómo cambia normalmente tu peso?', w_hard: 'Me cuesta ganar peso o músculo', w_easy: 'Subo y bajo de peso fácilmente', w_slow: 'Subo de peso rápido pero lo bajo lentamente',
      qData: 'Tus datos', qDataSub: 'Con tu edad, peso y estatura ajustamos la exigencia de cada ejercicio.', ageExact: 'Edad (años)', weight: 'Peso', height: 'Estatura', bmi: 'IMC',
      qPush: '¿Cuántas flexiones puedes hacer seguidas?', p_0: 'No puedo hacer flexiones', p_1: '1-10 flexiones', p_2: '11-20 flexiones', p_3: 'Más de 20 flexiones',
      qSquat: '¿Cuántas sentadillas puedes hacer seguidas?', s_0: 'No puedo hacer sentadillas', s_1: '11-20 sentadillas', s_2: '21-40 sentadillas', s_3: 'Más de 40 sentadillas',
      qFlex: '¿Qué tan flexible eres?', f_3: 'Muy flexible', f_2: 'Bastante flexible', f_1: 'No tan bueno', f_0: 'No lo tengo claro',
      qFreq: '¿Cuántas veces has entrenado en los últimos 3 meses?', fr_3: 'Casi todos los días', fr_2: 'Varias veces a la semana', fr_1: 'Varias veces al mes', fr_0: 'No hago ejercicio',
      qZones: '¿Cuáles son tus zonas objetivo?', z_abs: 'Barriga', z_chest: 'Pectorales', z_arms: 'Brazos', z_legs: 'Piernas', z_back: 'Espalda', z_glutes: 'Glúteos',
      info2T: 'Consigue abdominales definidos en casa.', info2B: 'Trabaja en tu zona objetivo de manera efectiva con nuestro Plan de Calistenia.<br><br>Te proporcionaremos <b>entrenamientos guiados con animación</b> para que sepas exactamente qué hacer.',
      qDur: '¿Cuánto tiempo quieres que duren tus entrenamientos?', d_15: '10-15 min', d_20: '15-20 min', d_25: '20-25 min', d_30: '25+ min', d_x: 'No sé',
      qProb: '¿Tienes problemas con alguno de los siguientes?', pr_back: 'Espalda sensible', pr_knee: 'Rodillas sensibles', pr_none: 'Ninguna de las anteriores',
      qFoot: '¿Juegas al fútbol?', fo_no: 'No', fo_rec: 'Sí, por diversión', fo_team: 'Sí, en un equipo o club',
      qPos: '¿En qué posición juegas?', po_gk: 'Portero', po_def: 'Defensa', po_mid: 'Centrocampista', po_fw: 'Delantero',
      qMatch: '¿Qué día juegas partido normalmente?', md_none: 'No tengo día fijo',
      qEquip: '¿Qué equipo tienes disponible?', qEquipSub: 'El plan solo usará lo que tengas. Sin equipo también funciona.',
      qPerm: 'Permisos y sonido', qPermSub: 'La cámara es opcional: sirve para grabarte y verificar que haces bien cada ejercicio.',
      permCam: 'Permitir cámara', permCamOk: 'Cámara lista ✓', permCamNo: 'Cámara no disponible', permSound: 'Probar voz y música', permSoundOk: 'Sonido listo ✓', permWake: 'Mantener pantalla encendida durante el entreno',
      building: 'Creando tu plan…', buildSteps: ['Analizando tu perfil', 'Ajustando a tu edad e IMC', 'Seleccionando ejercicios', 'Organizando los 7 días', 'Calibrando la exigencia'],
      readyT: '¡Tu plan está listo, {n}!', readyB: 'Empiezas en la categoría', go: '¡A ENTRENAR!',
      tabHome: 'Inicio', tabPlan: 'Plan', tabLib: 'Ejercicios', tabStats: 'Progreso', tabSet: 'Ajustes',
      today: 'Hoy', week: 'Tu semana', startWorkout: 'EMPEZAR ENTRENO', rest: 'Recuperación activa', min: 'min', exercises: 'ejercicios', sets: 'series', reps: 'reps', sec: 's', perSide: 'por lado',
      warmup: 'Calentamiento', main: 'Bloque principal', cool: 'Vuelta a la calma', done: 'Hecho', regen: 'Nueva variante del plan', streak: 'Racha', days: 'días', xp: 'XP', cat: 'Categoría', exig: 'Exigencia',
      library: 'Biblioteca completa', search: 'Buscar ejercicio…', all: 'Todos', futbol: 'Core fútbol', militar: 'Calistenia militar', equipment: 'Equipo',
      preview: 'Ver demostración', set: 'Serie', of: 'de', getReady: 'Prepárate', restT: 'Descanso', nextUp: 'Siguiente', pause: 'Pausa', resume: 'Seguir', skipEx: 'Saltar', finish: 'Terminar',
      repDone: 'rep', holdLeft: 'restantes', camera: 'Cámara', camOn: 'Grabar y verificar', camOff: 'Cerrar cámara', recording: 'Grabando', saveVideo: 'Guardar video', verified: 'Verificadas',
      formGood: '¡Buena técnica!', formLow: 'Baja más', formHips: 'Alinea la cadera', formBack: 'Espalda recta', formArms: 'Extiende los brazos', formNoBody: 'Ponte de cuerpo entero frente a la cámara', formLoading: 'Cargando detector de postura…', formOffline: 'Detector no disponible sin internet: la grabación sí funciona.',
      workoutDone: '¡ENTRENO COMPLETADO!', earned: 'Has ganado', totalReps: 'Repeticiones', time: 'Tiempo', levelUp: '¡SUBISTE DE CATEGORÍA!', badges: 'Insignias', history: 'Historial', noHistory: 'Aún no has completado entrenos.',
      settings: 'Ajustes', language: 'Idioma', voice: 'Voz', music: 'Música', musicStyle: 'Estilo musical', volume: 'Volumen', units: 'Unidades', redo: 'Repetir cuestionario', reset: 'Borrar todos los datos', resetQ: '¿Seguro? Se perderá todo tu progreso.', export: 'Exportar progreso', import: 'Importar progreso', profile: 'Perfil',
      dayNames: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], dayShort: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      focus: { stab: 'Core estabilidad + prevención', push: 'Calistenia: empuje y tracción', rot: 'Core rotación + potencia', rec: 'Recuperación activa', full: 'Circuito militar cuerpo completo', ball: 'Core con balón + pliometría', prt: 'PRT del ejército', legs: 'Piernas y acondicionamiento', match: 'Día de partido: activación', pre: 'Pre-partido: activación ligera', post: 'Post-partido: regeneración', upper: 'Tren superior + core' },
      catNames: ['Escuela', 'Infantil', 'Cadete', 'Juvenil', 'Reserva', 'Segunda División', 'Primera División', 'Champions', 'Selección Nacional', 'Leyenda'],
      footMode: 'Modo futbolista', adultMode: 'Modo calistenia', safetyMinor: 'Entrena con supervisión de un adulto o tu entrenador.',
      badgeNames: { first: 'Primer entreno', streak3: 'Racha de 3 días', streak7: 'Semana perfecta', reps500: '500 repeticiones', reps2000: '2.000 repeticiones', cam: 'Técnica verificada', week: 'Plan semanal completo', level5: 'Llegaste a Reserva', legend: 'Leyenda' },
      share: 'Compartir', close: 'Cerrar', ok: 'OK', yes: 'Sí', no: 'No', camHint: 'Coloca el móvil a 2-3 metros, de lado para planchas y flexiones, de frente para jumping jacks.', cue: 'Técnica',
      rpeQ: '¿Cómo te sentiste?', rpe1: 'Fácil', rpe2: 'Bien', rpe3: 'Duro', rpeHint: 'Ajustaremos la próxima sesión.'
    },
    en: {
      appName: 'ASCENSO', motto: 'MOVE UP A CATEGORY, RAISE THE DEMAND', tagline: 'Football core & military calisthenics',
      start: 'START', next: 'NEXT STEP', cont: 'CONTINUE', back: 'Back', skip: 'Skip', chooseAll: 'Choose all that apply',
      secProfile: 'My profile', secActivity: 'Activity', secFootball: 'Football & gear', secPlan: 'My plan',
      qLang: 'Choose your language', qName: 'What\'s your name?', qNameSub: 'We\'ll use your name to push you through every set.', namePh: 'Your name',
      qAge: 'Calisthenics workout plan', qAgeSub: 'CHOOSE YOUR AGE', age: 'Age',
      ageJ: 'Youth', info1T: 'Calisthenics is a simple, effective way to get in shape!', info1B: 'It\'s a type of training that <b>uses your own body weight</b>.<br><br>We\'ll help you <b>get fit at home without any equipment!</b>',
      qGoal: 'What\'s your main goal?', g_muscle: 'Build muscle', g_lose: 'Lose weight', g_recomp: 'Lose fat and build muscle', g_fit: 'Improve overall fitness',
      qMore: 'What else do you want to achieve with this plan?', m_tone: 'A sculpted, toned body', m_endur: 'More stamina and energy', m_post: 'Better posture and flexibility', m_libido: 'Higher sex drive', m_stress: 'Less stress, better sleep',
      qBody: 'How would you describe your build?', b_slim: 'Slim', b_mid: 'Medium build', b_chubby: 'Chubby', b_over: 'Significantly overweight',
      qBest: 'How long ago were you in the best shape of your life?', bs_1: 'Less than a year ago', bs_2: '1 to 2 years ago', bs_3: 'More than 3 years ago', bs_never: 'Never',
      qWeight: 'How does your weight usually change?', w_hard: 'I struggle to gain weight or muscle', w_easy: 'I gain and lose weight easily', w_slow: 'I gain weight fast but lose it slowly',
      qData: 'Your details', qDataSub: 'Your age, weight and height set the demand of every exercise.', ageExact: 'Age (years)', weight: 'Weight', height: 'Height', bmi: 'BMI',
      qPush: 'How many push-ups can you do in a row?', p_0: 'I can\'t do push-ups', p_1: '1-10 push-ups', p_2: '11-20 push-ups', p_3: 'More than 20 push-ups',
      qSquat: 'How many squats can you do in a row?', s_0: 'I can\'t do squats', s_1: '11-20 squats', s_2: '21-40 squats', s_3: 'More than 40 squats',
      qFlex: 'How flexible are you?', f_3: 'Very flexible', f_2: 'Quite flexible', f_1: 'Not so good', f_0: 'Not sure',
      qFreq: 'How often have you trained in the last 3 months?', fr_3: 'Almost every day', fr_2: 'Several times a week', fr_1: 'Several times a month', fr_0: 'I don\'t exercise',
      qZones: 'What are your target zones?', z_abs: 'Belly', z_chest: 'Chest', z_arms: 'Arms', z_legs: 'Legs', z_back: 'Back', z_glutes: 'Glutes',
      info2T: 'Get defined abs at home.', info2B: 'Work your target zone effectively with our Calisthenics Plan.<br><br>You\'ll get <b>animated guided workouts</b> so you know exactly what to do.',
      qDur: 'How long do you want your workouts to be?', d_15: '10-15 min', d_20: '15-20 min', d_25: '20-25 min', d_30: '25+ min', d_x: 'Not sure',
      qProb: 'Do you have trouble with any of these?', pr_back: 'Sensitive back', pr_knee: 'Sensitive knees', pr_none: 'None of the above',
      qFoot: 'Do you play football?', fo_no: 'No', fo_rec: 'Yes, for fun', fo_team: 'Yes, in a team or club',
      qPos: 'What position do you play?', po_gk: 'Goalkeeper', po_def: 'Defender', po_mid: 'Midfielder', po_fw: 'Forward',
      qMatch: 'Which day do you usually play a match?', md_none: 'No fixed day',
      qEquip: 'What equipment do you have?', qEquipSub: 'The plan only uses what you have. No equipment works too.',
      qPerm: 'Permissions & sound', qPermSub: 'The camera is optional: it records you and checks your form on every exercise.',
      permCam: 'Allow camera', permCamOk: 'Camera ready ✓', permCamNo: 'Camera unavailable', permSound: 'Test voice & music', permSoundOk: 'Sound ready ✓', permWake: 'Keep screen on during workouts',
      building: 'Building your plan…', buildSteps: ['Analyzing your profile', 'Adjusting for age and BMI', 'Selecting exercises', 'Organizing the 7 days', 'Calibrating the demand'],
      readyT: 'Your plan is ready, {n}!', readyB: 'You start in the category', go: 'LET\'S TRAIN!',
      tabHome: 'Home', tabPlan: 'Plan', tabLib: 'Exercises', tabStats: 'Progress', tabSet: 'Settings',
      today: 'Today', week: 'Your week', startWorkout: 'START WORKOUT', rest: 'Active recovery', min: 'min', exercises: 'exercises', sets: 'sets', reps: 'reps', sec: 's', perSide: 'per side',
      warmup: 'Warm-up', main: 'Main block', cool: 'Cool-down', done: 'Done', regen: 'New plan variation', streak: 'Streak', days: 'days', xp: 'XP', cat: 'Category', exig: 'Demand',
      library: 'Full library', search: 'Search exercise…', all: 'All', futbol: 'Football core', militar: 'Military calisthenics', equipment: 'Equipment',
      preview: 'Watch demo', set: 'Set', of: 'of', getReady: 'Get ready', restT: 'Rest', nextUp: 'Next', pause: 'Pause', resume: 'Resume', skipEx: 'Skip', finish: 'Finish',
      repDone: 'rep', holdLeft: 'left', camera: 'Camera', camOn: 'Record & check form', camOff: 'Close camera', recording: 'Recording', saveVideo: 'Save video', verified: 'Verified',
      formGood: 'Great form!', formLow: 'Go lower', formHips: 'Line up your hips', formBack: 'Keep your back straight', formArms: 'Extend your arms', formNoBody: 'Get your whole body in front of the camera', formLoading: 'Loading pose detector…', formOffline: 'Pose detector needs internet: recording still works.',
      workoutDone: 'WORKOUT COMPLETE!', earned: 'You earned', totalReps: 'Reps', time: 'Time', levelUp: 'YOU MOVED UP A CATEGORY!', badges: 'Badges', history: 'History', noHistory: 'No workouts completed yet.',
      settings: 'Settings', language: 'Language', voice: 'Voice', music: 'Music', musicStyle: 'Music style', volume: 'Volume', units: 'Units', redo: 'Retake questionnaire', reset: 'Erase all data', resetQ: 'Are you sure? All your progress will be lost.', export: 'Export progress', import: 'Import progress', profile: 'Profile',
      dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], dayShort: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      focus: { stab: 'Core stability + prevention', push: 'Calisthenics: push & pull', rot: 'Core rotation + power', rec: 'Active recovery', full: 'Military full-body circuit', ball: 'Ball core + plyometrics', prt: 'Army PRT', legs: 'Legs & conditioning', match: 'Match day: activation', pre: 'Pre-match: light activation', post: 'Post-match: regeneration', upper: 'Upper body + core' },
      catNames: ['Academy', 'Under-12', 'Under-15', 'Youth', 'Reserves', 'Second Division', 'First Division', 'Champions', 'National Team', 'Legend'],
      footMode: 'Footballer mode', adultMode: 'Calisthenics mode', safetyMinor: 'Train under the supervision of an adult or your coach.',
      badgeNames: { first: 'First workout', streak3: '3-day streak', streak7: 'Perfect week', reps500: '500 reps', reps2000: '2,000 reps', cam: 'Form verified', week: 'Full weekly plan', level5: 'Reached Reserves', legend: 'Legend' },
      share: 'Share', close: 'Close', ok: 'OK', yes: 'Yes', no: 'No', camHint: 'Place the phone 2-3 m away: side-on for planks and push-ups, facing you for jumping jacks.', cue: 'Form',
      rpeQ: 'How did it feel?', rpe1: 'Easy', rpe2: 'Good', rpe3: 'Hard', rpeHint: 'We\'ll adjust your next session.'
    }
  };

  const MOTIV = {
    es: {
      start: ['¡Vamos {n}! A por ello.', '{n}, hoy subimos de categoría.', 'Concentración, {n}. Cada rep cuenta.', '¡Arriba {n}! Subid la exigencia.'],
      mid: ['¡Mitad hecha, {n}!', 'Vas muy bien, {n}, mantén la técnica.', 'Así se entrena, {n}.', 'Respira y sigue, {n}.'],
      last: ['¡Últimas, {n}! No aflojes.', '¡Tres más, {n}! Todo el corazón.', '¡Remata como un nueve, {n}!', 'Esto es de Primera, {n}. ¡Termina fuerte!'],
      done: ['¡Serie completada, {n}!', 'Excelente, {n}. Descansa un poco.', '¡Eso es, {n}! Así se sube de categoría.', 'Brutal, {n}.'],
      rest: ['Respira hondo, {n}. Prepárate para la siguiente.', 'Hidrátate, {n}.', 'Recupera, {n}, lo siguiente viene fuerte.'],
      level: ['¡{n}, subiste de categoría! Subid la exigencia.', '¡Ascenso conseguido, {n}! Ahora a por más.'],
      finish: ['¡Entreno completado, {n}! Eres imparable.', 'Misión cumplida, {n}. Mañana, más.', '¡Gran trabajo, {n}! Un paso más hacia la Selección.'],
      form: ['Cuida la técnica, {n}.', 'Más lento y controlado, {n}.', 'Calidad antes que cantidad, {n}.']
    },
    en: {
      start: ['Let\'s go {n}! Bring it.', '{n}, today we move up a category.', 'Focus, {n}. Every rep counts.', 'Up you go {n}! Raise the demand.'],
      mid: ['Halfway there, {n}!', 'Looking great, {n}, keep your form.', 'That\'s how you train, {n}.', 'Breathe and keep going, {n}.'],
      last: ['Last ones, {n}! Don\'t ease off.', 'Three more, {n}! All heart.', 'Finish like a striker, {n}!', 'That\'s top-flight work, {n}. Finish strong!'],
      done: ['Set complete, {n}!', 'Excellent, {n}. Take a breather.', 'That\'s it, {n}! That\'s how you climb.', 'Beast mode, {n}.'],
      rest: ['Deep breath, {n}. Get ready for the next one.', 'Hydrate, {n}.', 'Recover, {n}, the next one is tough.'],
      level: ['{n}, you moved up a category! Raise the demand.', 'Promotion earned, {n}! Now go for more.'],
      finish: ['Workout complete, {n}! You\'re unstoppable.', 'Mission accomplished, {n}. More tomorrow.', 'Great work, {n}! One step closer to the national team.'],
      form: ['Watch your form, {n}.', 'Slower and controlled, {n}.', 'Quality over quantity, {n}.']
    }
  };

  // Números en letras
  function wordsEs(n) {
    const u = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
      'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
    const d = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const c = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    if (n < 30) return u[n];
    if (n < 100) return d[Math.floor(n / 10)] + (n % 10 ? ' y ' + u[n % 10] : '');
    if (n === 100) return 'cien';
    if (n < 1000) return c[Math.floor(n / 100)] + (n % 100 ? ' ' + wordsEs(n % 100) : '');
    return String(n);
  }
  function wordsEn(n) {
    const u = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const d = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (n < 20) return u[n];
    if (n < 100) return d[Math.floor(n / 10)] + (n % 10 ? '-' + u[n % 10] : '');
    if (n < 1000) return u[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + wordsEn(n % 100) : '');
    return String(n);
  }

  const I18N = {
    lang: 'es',
    t(k) { const v = T[this.lang][k]; return v == null ? (T.es[k] == null ? k : T.es[k]) : v; },
    words(n) { return this.lang === 'en' ? wordsEn(n) : wordsEs(n); },
    motiv(kind, name) { const arr = MOTIV[this.lang][kind] || MOTIV.es[kind]; const s = arr[Math.floor(Math.random() * arr.length)]; return s.replace(/\{n\}/g, name || ''); },
    exName(e) { return this.lang === 'en' ? e.en : e.es; },
    langs: [{ id: 'es', label: 'Español', flag: '🇪🇸' }, { id: 'en', label: 'English', flag: '🇬🇧' }]
  };
  G.I18N = I18N;
})(window);
