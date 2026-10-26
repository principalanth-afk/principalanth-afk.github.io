/* ASCENSO — Base de datos completa de ejercicios
   Core para fútbol (86) + Calistenia militar (112).
   Formato: [nombre ES, nombre EN, movimiento, base, opciones]
   base > 0 = repeticiones, base < 0 = segundos.
   Opciones: s=por lado, z=zonas, e=equipo, av=evitar si (back|knee), lv=nivel 1-3, i=impacto alto */
(function (G) {
  'use strict';
  const SECTIONS = [
    { id: 'FA', group: 'futbol', type: 'stability', es: 'Planchas y anti-extensión', en: 'Planks & anti-extension' },
    { id: 'FB', group: 'futbol', type: 'antirot', es: 'Anti-rotación', en: 'Anti-rotation' },
    { id: 'FC', group: 'futbol', type: 'rotation', es: 'Rotación y potencia (golpeo y pase)', en: 'Rotation & power (striking & passing)' },
    { id: 'FD', group: 'futbol', type: 'flexion', es: 'Flexión abdominal', en: 'Abdominal flexion' },
    { id: 'FE', group: 'futbol', type: 'oblique', es: 'Oblicuos y anti-flexión lateral', en: 'Obliques & anti-lateral flexion' },
    { id: 'FF', group: 'futbol', type: 'hip', es: 'Cadera, aductores y glúteo (prevención de pubalgia)', en: 'Hips, adductors & glutes (groin injury prevention)' },
    { id: 'FG', group: 'futbol', type: 'posterior', es: 'Isquios y cadena posterior (prevención)', en: 'Hamstrings & posterior chain (prevention)' },
    { id: 'FH', group: 'futbol', type: 'ball', es: 'Específicos de fútbol con balón', en: 'Football-specific with ball' },
    { id: 'MA', group: 'militar', type: 'push', es: 'Empuje (pecho, hombros, tríceps)', en: 'Push (chest, shoulders, triceps)' },
    { id: 'MB', group: 'militar', type: 'pull', es: 'Tracción (espalda y bíceps)', en: 'Pull (back & biceps)' },
    { id: 'MC', group: 'militar', type: 'mcore', es: 'Core militar', en: 'Military core' },
    { id: 'MD', group: 'militar', type: 'legs', es: 'Piernas', en: 'Legs' },
    { id: 'ME', group: 'militar', type: 'full', es: 'Cuerpo completo y acondicionamiento', en: 'Full body & conditioning' },
    { id: 'MF', group: 'militar', type: 'prt', es: 'Entrenamiento físico del ejército (PRT)', en: 'Army physical readiness training (PRT)' },
    { id: 'MG', group: 'militar', type: 'iso', es: 'Isométricos y "castigos" clásicos', en: 'Isometrics & classic "punishment" holds' }
  ];

  const DATA = {
    FA: [
      ['Plancha frontal', 'Forearm plank', 'plank', -30],
      ['Plancha alta', 'High plank', 'plank_high', -30, { z: 'abs arms' }],
      ['Plancha con elevación de pierna', 'Plank with leg lift', 'plank_leg', 16, { z: 'abs glutes' }],
      ['Plancha con elevación de brazo', 'Plank with arm lift', 'plank_arm', 16, { z: 'abs arms' }],
      ['Plancha con brazo y pierna contrarios', 'Plank opposite arm & leg', 'plank_cross', 12, { lv: 2 }],
      ['Plancha con toque de hombro', 'Plank shoulder taps', 'shoulder_tap', 20, { z: 'abs arms' }],
      ['Plancha caminando (up-down)', 'Walking plank (up-down)', 'plank_updown', 10, { z: 'abs arms chest', lv: 2 }],
      ['Plancha con pies en fitball o banco', 'Plank with feet on fitball or bench', 'plank_feet_up', -30, { e: 'bench', lv: 2 }],
      ['Plancha RKC', 'RKC plank', 'plank_rkc', -15, { lv: 2 }],
      ['Body saw (deslizamiento con toallas)', 'Body saw (towel slide)', 'body_saw', 10, { lv: 2 }],
      ['Rollout con rueda abdominal', 'Ab wheel rollout', 'rollout', 8, { e: 'wheel', lv: 2, av: 'back' }],
      ['Rollout con fitball', 'Fitball rollout', 'rollout_ball', 10, { e: 'fitball' }],
      ['Stir the pot (círculos sobre fitball)', 'Stir the pot (fitball circles)', 'stir_pot', 10, { e: 'fitball', lv: 2 }],
      ['Dead bug básico', 'Dead bug', 'dead_bug', 20],
      ['Dead bug con banda o balón', 'Dead bug with band or ball', 'dead_bug_ball', 16, { e: 'ball' }],
      ['Hollow hold (posición banana)', 'Hollow hold (banana)', 'hollow_hold', -20, { lv: 2 }],
      ['Hollow rocks', 'Hollow rocks', 'hollow_rock', 15, { lv: 2 }],
      ['Bird dog', 'Bird dog', 'bird_dog', 16, { z: 'abs back glutes' }],
      ['Bird dog con toque de codo y rodilla', 'Bird dog elbow-to-knee', 'bird_dog_crunch', 16, { s: 1, z: 'abs back glutes' }]
    ],
    FB: [
      ['Pallof press de pie', 'Standing Pallof press', 'pallof', 10, { s: 1, e: 'band' }],
      ['Pallof press de rodillas o media rodilla', 'Kneeling Pallof press', 'pallof_kneel', 10, { s: 1, e: 'band' }],
      ['Pallof press con paso lateral', 'Pallof press with side step', 'pallof_step', 10, { s: 1, e: 'band' }],
      ['Pallof press isométrico', 'Isometric Pallof hold', 'pallof_hold', -20, { s: 1, e: 'band' }],
      ['Plancha con arrastre de peso (pull-through)', 'Plank pull-through', 'pull_through', 12, { z: 'abs arms' }],
      ['Renegade row (remo en plancha)', 'Renegade row', 'renegade_row', 12, { e: 'weights', z: 'abs back arms', lv: 2 }],
      ['Caminata de maleta (suitcase carry)', 'Suitcase carry', 'suitcase_carry', -30, { s: 1, e: 'weights' }],
      ['Plancha lateral con remo de banda', 'Side plank band row', 'side_plank_row', 10, { s: 1, e: 'band', lv: 2 }],
      ['Bear hold con elevación de mano', 'Bear hold with reach', 'bear_hold_reach', 12]
    ],
    FC: [
      ['Russian twist con balón', 'Russian twist with ball', 'russian_twist', 20],
      ['Leñador alto-bajo (woodchop)', 'High-to-low woodchop', 'woodchop_hl', 10, { s: 1, e: 'band' }],
      ['Leñador bajo-alto', 'Low-to-high woodchop', 'woodchop_lh', 10, { s: 1, e: 'band' }],
      ['Lanzamiento rotacional de balón medicinal a la pared', 'Rotational med-ball wall throw', 'rot_throw', 8, { s: 1, e: 'ball', i: 1 }],
      ['Lanzamiento lateral desde media rodilla', 'Half-kneeling side throw', 'rot_throw_kneel', 8, { s: 1, e: 'ball' }],
      ['Lanzamiento por encima de la cabeza (slam ball)', 'Overhead slam ball', 'slam', 10, { e: 'ball', i: 1, z: 'abs arms' }],
      ['Rotación con banda a la altura del pecho', 'Chest-height band rotation', 'band_rotation', 12, { s: 1, e: 'band' }],
      ['Landmine rotation', 'Landmine rotation', 'landmine', 10, { e: 'weights', lv: 2 }],
      ['Windshield wipers (limpiaparabrisas)', 'Windshield wipers', 'windshield', 10, { lv: 3, av: 'back' }],
      ['Rotación de tronco en fitball', 'Fitball trunk rotation', 'ball_rotation', 12, { e: 'fitball' }]
    ],
    FD: [
      ['Crunch clásico', 'Classic crunch', 'crunch', 20],
      ['Crunch inverso', 'Reverse crunch', 'reverse_crunch', 15],
      ['Crunch bicicleta', 'Bicycle crunch', 'bicycle', 20],
      ['V-ups', 'V-ups', 'v_up', 12, { lv: 2, av: 'back' }],
      ['Tuck-ups (rodillas al pecho)', 'Tuck-ups', 'tuck_up', 15],
      ['Elevación de piernas tumbado', 'Lying leg raise', 'leg_raise', 12, { av: 'back' }],
      ['Elevación de piernas colgado', 'Hanging leg raise', 'hang_leg_raise', 10, { e: 'bar', lv: 3 }],
      ['Toes to bar', 'Toes to bar', 'toes_to_bar', 8, { e: 'bar', lv: 3 }],
      ['Knee raises en paralelas', 'Captain\'s chair knee raise', 'dip_knee_raise', 12, { e: 'parallels', lv: 2 }],
      ['Jackknife con fitball', 'Fitball jackknife', 'jackknife', 10, { e: 'fitball', lv: 2 }],
      ['Pike con fitball', 'Fitball pike', 'pike_ball', 8, { e: 'fitball', lv: 3 }],
      ['Sit-up con lanzamiento de balón', 'Sit-up ball throw', 'situp_throw', 12, { e: 'ball' }]
    ],
    FE: [
      ['Plancha lateral', 'Side plank', 'side_plank', -25, { s: 1 }],
      ['Plancha lateral estrella', 'Star side plank', 'side_plank_star', -15, { s: 1, lv: 2 }],
      ['Plancha lateral con elevación de cadera', 'Side plank hip dips', 'side_plank_dip', 10, { s: 1 }],
      ['Plancha lateral con rotación (thread the needle)', 'Side plank thread the needle', 'side_plank_thread', 10, { s: 1, lv: 2 }],
      ['Crunch oblicuo', 'Oblique crunch', 'oblique_crunch', 15, { s: 1 }],
      ['Toque de talones (heel taps)', 'Heel taps', 'heel_taps', 20],
      ['Flexión lateral (banco romano o de pie)', 'Lateral bend', 'side_bend', 12, { s: 1 }],
      ['Elevación de piernas oblicua colgado', 'Hanging oblique raise', 'hang_oblique', 8, { s: 1, e: 'bar', lv: 3 }]
    ],
    FF: [
      ['Plancha Copenhague corta', 'Short Copenhagen plank', 'copenhagen_short', -15, { s: 1, e: 'bench', z: 'legs abs', fb: 1 }],
      ['Plancha Copenhague larga', 'Long Copenhagen plank', 'copenhagen_long', -15, { s: 1, e: 'bench', lv: 3, z: 'legs abs', fb: 1 }],
      ['Aducción isométrica con balón entre rodillas', 'Isometric ball squeeze', 'adductor_squeeze', 8, { z: 'legs', fb: 1 }],
      ['Aducción con banda de pie', 'Standing band adduction', 'band_adduction', 12, { s: 1, e: 'band', z: 'legs' }],
      ['Abducción con banda (monster walk)', 'Monster walk', 'monster_walk', 20, { e: 'band', z: 'glutes legs' }],
      ['Caminata lateral con banda', 'Lateral band walk', 'lateral_walk', 20, { e: 'band', z: 'glutes legs' }],
      ['Puente de glúteo', 'Glute bridge', 'glute_bridge', 15, { z: 'glutes' }],
      ['Puente de glúteo a una pierna', 'Single-leg glute bridge', 'glute_bridge_single', 10, { s: 1, z: 'glutes' }],
      ['Hip thrust', 'Hip thrust', 'hip_thrust', 12, { e: 'bench', z: 'glutes' }],
      ['Puente con pies en fitball', 'Fitball bridge', 'bridge_ball', 12, { e: 'fitball', z: 'glutes' }],
      ['Clamshell (almeja) con banda', 'Banded clamshell', 'clamshell', 15, { s: 1, z: 'glutes' }],
      ['Fire hydrant', 'Fire hydrant', 'fire_hydrant', 12, { s: 1, z: 'glutes' }],
      ['Plancha lateral con abducción de pierna', 'Side plank leg abduction', 'side_plank_abd', 10, { s: 1, lv: 2, z: 'glutes abs' }]
    ],
    FG: [
      ['Nórdicos de isquios', 'Nordic hamstring curl', 'nordic', 5, { lv: 3, z: 'legs', fb: 1 }],
      ['Curl de isquios con fitball', 'Fitball hamstring curl', 'ham_curl_ball', 10, { e: 'fitball', z: 'legs glutes' }],
      ['Peso muerto a una pierna', 'Single-leg deadlift', 'single_rdl', 10, { s: 1, z: 'legs glutes back' }],
      ['Superman', 'Superman', 'superman', 12, { z: 'back glutes' }],
      ['Superman alterno (swimmers)', 'Alternating superman (swimmers)', 'swimmer', 20, { z: 'back glutes' }],
      ['Hiperextensiones lumbares', 'Back extensions', 'hyperextension', 12, { e: 'bench', z: 'back', av: 'back' }],
      ['Buenos días (good mornings) con banda', 'Banded good mornings', 'good_morning', 12, { e: 'band', z: 'back legs' }]
    ],
    FH: [
      ['Plancha con pase de balón entre manos', 'Plank ball pass', 'plank_ball_pass', 16, { e: 'ball', fb: 1 }],
      ['Sit-up con recepción y devolución de balón', 'Sit-up catch & throw', 'situp_throw', 12, { e: 'ball', fb: 1 }],
      ['Russian twist con pase lateral', 'Russian twist side pass', 'russian_twist', 16, { e: 'ball', fb: 1 }],
      ['Volea desde posición hollow', 'Hollow-position volley', 'hollow_volley', 10, { e: 'ball', lv: 2, fb: 1 }],
      ['Equilibrio a una pierna con controles de balón', 'Single-leg balance with ball touches', 'balance_juggle', -30, { s: 1, e: 'ball', z: 'legs', fb: 1 }],
      ['Saltos laterales con aterrizaje estable (skater)', 'Skater jumps', 'skater', 16, { i: 1, z: 'legs glutes', av: 'knee', fb: 1 }],
      ['Aterrizaje de salto a una pierna (mantener 3 s)', 'Single-leg landing (hold 3 s)', 'land_hold', 8, { s: 1, i: 1, z: 'legs', av: 'knee', fb: 1 }],
      ['Protocolo FIFA 11+ (calentamiento de prevención)', 'FIFA 11+ (injury-prevention warm-up)', 'fifa11', -300, { warm: 1, fb: 1 }]
    ],
    MA: [
      ['Flexión estándar', 'Standard push-up', 'pushup', 12, { z: 'chest arms' }],
      ['Flexión abierta', 'Wide push-up', 'pushup_wide', 12, { z: 'chest arms' }],
      ['Flexión diamante', 'Diamond push-up', 'pushup_diamond', 10, { z: 'arms chest', lv: 2 }],
      ['Flexión declinada (pies elevados)', 'Decline push-up', 'pushup_decline', 10, { e: 'bench', z: 'chest arms', lv: 2 }],
      ['Flexión inclinada (manos elevadas)', 'Incline push-up', 'pushup_incline', 12, { e: 'bench', z: 'chest arms' }],
      ['Flexión con palmada', 'Clap push-up', 'pushup_clap', 8, { z: 'chest arms', lv: 3, i: 1 }],
      ['Flexión arqueada (archer)', 'Archer push-up', 'pushup_archer', 8, { s: 1, z: 'chest arms', lv: 3 }],
      ['Flexión a una mano (progresión)', 'One-arm push-up (progression)', 'pushup_one', 5, { s: 1, z: 'chest arms', lv: 3 }],
      ['Flexión hindú (dive bomber)', 'Dive bomber push-up', 'dive_bomber', 10, { z: 'chest arms back', lv: 2 }],
      ['Flexión pike (hombros)', 'Pike push-up', 'pike_pushup', 10, { z: 'arms' }],
      ['Flexión en pino contra la pared', 'Wall handstand push-up', 'hspu', 5, { z: 'arms', lv: 3 }],
      ['Flexión spiderman (rodilla al codo)', 'Spiderman push-up', 'pushup_spider', 10, { z: 'chest arms abs', lv: 2 }],
      ['Flexión con pausa abajo (3 s)', 'Paused push-up (3 s)', 'pushup_pause', 8, { z: 'chest arms' }],
      ['Flexión T (rotación a plancha lateral)', 'T push-up', 'pushup_t', 10, { z: 'chest arms abs', lv: 2 }],
      ['Flexión hand-release', 'Hand-release push-up', 'pushup_release', 10, { z: 'chest arms' }],
      ['Fondos en paralelas', 'Parallel bar dips', 'dips', 10, { e: 'parallels', z: 'arms chest', lv: 2 }],
      ['Fondos en banco', 'Bench dips', 'bench_dips', 12, { e: 'bench', z: 'arms' }],
      ['Flexión con nudillos', 'Knuckle push-up', 'pushup', 12, { z: 'chest arms' }]
    ],
    MB: [
      ['Dominada prona', 'Pull-up (overhand)', 'pullup', 6, { e: 'bar', z: 'back arms', lv: 2 }],
      ['Dominada supina (chin-up)', 'Chin-up', 'chinup', 6, { e: 'bar', z: 'back arms', lv: 2 }],
      ['Dominada neutra', 'Neutral-grip pull-up', 'pullup', 6, { e: 'bar', z: 'back arms', lv: 2 }],
      ['Dominada abierta', 'Wide-grip pull-up', 'pullup_wide', 5, { e: 'bar', z: 'back arms', lv: 3 }],
      ['Dominada comando', 'Commando pull-up', 'commando', 6, { e: 'bar', z: 'back arms abs', lv: 3 }],
      ['Dominada L-sit', 'L-sit pull-up', 'pullup_lsit', 4, { e: 'bar', z: 'back arms abs', lv: 3 }],
      ['Dominada negativa (bajada lenta 5 s)', 'Negative pull-up (5 s lower)', 'pullup_negative', 5, { e: 'bar', z: 'back arms' }],
      ['Remo invertido (australian pull-up)', 'Inverted row', 'inverted_row', 10, { e: 'bar', z: 'back arms' }],
      ['Colgarse de la barra (dead hang)', 'Dead hang', 'dead_hang', -30, { e: 'bar', z: 'back arms' }],
      ['Escápulas en barra (scapular pulls)', 'Scapular pulls', 'scap_pull', 10, { e: 'bar', z: 'back' }],
      ['Subida de cuerda', 'Rope climb', 'rope_climb', 3, { e: 'rope', z: 'back arms', lv: 3 }],
      ['Muscle-up', 'Muscle-up', 'muscle_up', 3, { e: 'bar', z: 'back arms chest', lv: 3 }]
    ],
    MC: [
      ['Sit-ups clásicos', 'Classic sit-ups', 'situp', 20, { av: 'back' }],
      ['Flutter kicks (patadas alternas)', 'Flutter kicks', 'flutter', 30],
      ['Scissor kicks (tijeras)', 'Scissor kicks', 'scissor', 30],
      ['Leg raises con pausa a 15 cm', 'Leg raises with 6-inch pause', 'leg_raise_pause', 10, { av: 'back' }],
      ['Leg levers', 'Leg levers', 'leg_lever', 12, { av: 'back' }],
      ['Mountain climbers', 'Mountain climbers', 'mountain_climber', 30, { i: 1 }],
      ['Mountain climbers cruzados', 'Cross-body mountain climbers', 'mountain_climber_cross', 24, { i: 1 }],
      ['V-ups', 'V-ups', 'v_up', 12, { lv: 2, av: 'back' }],
      ['Leg tuck en barra', 'Hanging leg tuck', 'hang_leg_tuck', 8, { e: 'bar', lv: 2 }],
      ['Plancha mantenida', 'Plank hold', 'plank', -60],
      ['Supine bicycle', 'Supine bicycle', 'bicycle', 20],
      ['Bent-leg body twist', 'Bent-leg body twist', 'leg_twist', 12],
      ['Cucaracha moribunda (dying cockroach)', 'Dying cockroach', 'dying_cockroach', -20],
      ['Hello Dollies', 'Hello Dollies', 'hello_dolly', 16],
      ['Escaladores lentos en plancha', 'Slow mountain climbers', 'mountain_climber_slow', 16],
      ['Sit-up con rotación', 'Sit-up twist', 'situp_twist', 16, { av: 'back' }]
    ],
    MD: [
      ['Sentadilla al aire', 'Air squat', 'squat', 25, { z: 'legs glutes' }],
      ['Sentadilla con salto', 'Jump squat', 'jump_squat', 12, { z: 'legs glutes', i: 1, av: 'knee' }],
      ['Sentadilla sumo', 'Sumo squat', 'sumo_squat', 20, { z: 'legs glutes' }],
      ['Sentadilla búlgara', 'Bulgarian split squat', 'bulgarian', 10, { s: 1, e: 'bench', z: 'legs glutes', lv: 2, av: 'knee' }],
      ['Sentadilla pistol', 'Pistol squat', 'pistol', 5, { s: 1, z: 'legs glutes', lv: 3, av: 'knee' }],
      ['Sentadilla isométrica contra la pared (wall sit)', 'Wall sit', 'wall_sit', -40, { z: 'legs' }],
      ['Zancada adelante', 'Forward lunge', 'lunge', 16, { z: 'legs glutes' }],
      ['Zancada atrás', 'Reverse lunge', 'reverse_lunge', 16, { z: 'legs glutes' }],
      ['Zancada lateral', 'Lateral lunge', 'lateral_lunge', 12, { z: 'legs glutes' }],
      ['Zancada caminando', 'Walking lunge', 'walking_lunge', 16, { z: 'legs glutes' }],
      ['Zancada con salto alterno', 'Jumping lunge', 'jump_lunge', 12, { z: 'legs glutes', lv: 2, i: 1, av: 'knee' }],
      ['Subida a cajón o banco (step-ups)', 'Step-ups', 'step_up', 12, { s: 1, e: 'bench', z: 'legs glutes' }],
      ['Elevación de talones (gemelos)', 'Calf raises', 'calf_raise', 25, { z: 'legs' }],
      ['Saltos de rana (frog jumps)', 'Frog jumps', 'frog_jump', 10, { z: 'legs glutes', lv: 2, i: 1, av: 'knee' }],
      ['Saltos de tuck (rodillas al pecho)', 'Tuck jumps', 'tuck_jump', 10, { z: 'legs abs', lv: 2, i: 1, av: 'knee' }],
      ['Salto de longitud sin impulso (broad jump)', 'Standing broad jump', 'broad_jump', 8, { z: 'legs glutes', lv: 2, i: 1, av: 'knee' }]
    ],
    ME: [
      ['Burpee clásico', 'Classic burpee', 'burpee', 10, { z: 'abs legs chest', i: 1 }],
      ['Burpee con flexión', 'Burpee with push-up', 'burpee_pushup', 8, { z: 'abs legs chest', lv: 2, i: 1 }],
      ['Burpee con salto de cajón', 'Burpee box jump', 'burpee_box', 6, { e: 'bench', z: 'legs abs', lv: 3, i: 1 }],
      ['Burpee con dominada', 'Burpee pull-up', 'burpee_pullup', 5, { e: 'bar', z: 'back legs abs', lv: 3, i: 1 }],
      ['8-count body builder', '8-count body builder', 'eight_count', 8, { z: 'abs legs chest', lv: 2, i: 1 }],
      ['Saltos de tijera (jumping jacks)', 'Jumping jacks', 'jumping_jack', 30, { z: 'legs', i: 1 }],
      ['Half jacks', 'Half jacks', 'half_jack', 30, { z: 'legs' }],
      ['Seal jacks', 'Seal jacks', 'seal_jack', 30, { z: 'chest legs', i: 1 }],
      ['Caminata de oso (bear crawl)', 'Bear crawl', 'bear_crawl', 20, { z: 'abs arms legs' }],
      ['Caminata de cangrejo (crab walk)', 'Crab walk', 'crab_walk', 20, { z: 'arms glutes' }],
      ['Arrastre bajo (low crawl, estilo comando)', 'Low crawl (commando)', 'low_crawl', 16, { z: 'arms abs' }],
      ['Arrastre alto (high crawl)', 'High crawl', 'high_crawl', 16, { z: 'arms abs' }],
      ['Sprints con cambio de dirección (shuttle run)', 'Shuttle run', 'shuttle', -30, { z: 'legs', i: 1, av: 'knee' }],
      ['Sprint–drop–push-up', 'Sprint–drop–push-up', 'sprint_drop', 6, { z: 'legs chest', lv: 2, i: 1 }],
      ['Thrusters con mochila cargada', 'Backpack thrusters', 'thruster', 12, { e: 'pack', z: 'legs arms' }],
      ['Caminata con mochila (ruck march)', 'Ruck march', 'march', -120, { e: 'pack', z: 'legs back' }],
      ['Fireman carry (cargar a un compañero)', 'Fireman carry', 'fireman', -30, { e: 'partner', z: 'legs back', lv: 3 }],
      ['Arrastre de compañero o bolsa pesada (drag)', 'Partner or heavy bag drag', 'drag', -30, { e: 'pack', z: 'legs back' }],
      ['Inchworm (caminata de manos)', 'Inchworm', 'inchworm', 8, { z: 'abs arms' }],
      ['Sprawls', 'Sprawls', 'sprawl', 10, { z: 'abs legs', i: 1 }],
      ['Rodillas altas (high knees)', 'High knees', 'high_knees', 30, { z: 'legs abs', i: 1 }],
      ['Talones a glúteos (butt kicks)', 'Butt kicks', 'butt_kicks', 30, { z: 'legs' }]
    ],
    MF: [
      ['Bend and reach', 'Bend and reach', 'bend_reach', 10, { warm: 1 }],
      ['Rear lunge (zancada atrás)', 'Rear lunge', 'reverse_lunge', 10, { warm: 1, z: 'legs' }],
      ['High jumper', 'High jumper', 'high_jumper', 10, { warm: 1, i: 1 }],
      ['Rower', 'Rower', 'rower', 10, { warm: 1 }],
      ['Squat bender', 'Squat bender', 'squat_bender', 10, { warm: 1, z: 'legs' }],
      ['Windmill (molino)', 'Windmill', 'windmill', 10, { warm: 1 }],
      ['Forward lunge (zancada adelante)', 'Forward lunge', 'lunge', 10, { warm: 1, z: 'legs' }],
      ['Prone row', 'Prone row', 'prone_row', 10, { warm: 1, z: 'back' }],
      ['Bent-leg body twist', 'Bent-leg body twist', 'leg_twist', 10, { warm: 1 }],
      ['Push-up (cadencia militar)', 'Push-up (military cadence)', 'pushup', 10, { warm: 1, z: 'chest arms' }],
      ['Power jump', 'Power jump', 'power_jump', 10, { z: 'legs', i: 1, av: 'knee' }],
      ['V-up', 'V-up', 'v_up', 10, { av: 'back' }],
      ['Mountain climber (4 tiempos)', 'Mountain climber (4-count)', 'mountain_climber_slow', 10],
      ['Leg tuck and twist', 'Leg tuck and twist', 'tuck_twist', 10],
      ['Single-leg push-up', 'Single-leg push-up', 'pushup_single_leg', 10, { z: 'chest arms', lv: 2 }],
      ['Turn and lunge', 'Turn and lunge', 'turn_lunge', 10, { z: 'legs' }],
      ['Supine bicycle', 'Supine bicycle', 'bicycle', 10],
      ['Half jacks', 'Half jacks', 'half_jack', 10],
      ['Swimmer', 'Swimmer', 'swimmer', 10, { z: 'back' }],
      ['8-count push-up', '8-count push-up', 'eight_count', 10, { z: 'chest abs', lv: 2 }]
    ],
    MG: [
      ['Plancha mantenida al máximo', 'Max plank hold', 'plank', -60, { lv: 2 }],
      ['Front leaning rest (flexión alta mantenida)', 'Front leaning rest', 'plank_high', -45, { z: 'abs arms' }],
      ['Flexión mantenida a media altura', 'Half push-up hold', 'pushup_hold', -20, { z: 'chest arms', lv: 2 }],
      ['Sentadilla isométrica contra la pared', 'Wall sit hold', 'wall_sit', -45, { z: 'legs' }],
      ['Brazos extendidos en cruz mantenidos', 'Arms-out cross hold', 'arms_cross_hold', -45, { z: 'arms' }],
      ['Hollow hold prolongado', 'Long hollow hold', 'hollow_hold', -40, { lv: 2 }],
      ['Piernas elevadas a 15 cm mantenidas', '6-inch leg hold', 'leg_hold', -30, { av: 'back' }],
      ['Dead hang al fallo', 'Dead hang to failure', 'dead_hang', -45, { e: 'bar', z: 'back arms' }]
    ]
  };

  const LIST = [];
  for (const sec of SECTIONS) {
    DATA[sec.id].forEach((row, i) => {
      const [es, en, motion, base, o0] = row; const o = o0 || {};
      LIST.push({
        id: sec.id + (i + 1), sec: sec.id, group: sec.group, type: sec.type,
        es, en, motion, mode: base < 0 ? 'time' : 'reps', base: Math.abs(base),
        side: !!o.s, zones: (o.z || 'abs').split(' '), equip: o.e || 'none',
        avoid: (o.av || '').split(' ').filter(Boolean), lv: o.lv || 1, impact: !!o.i, warm: !!o.warm, football: !!o.fb
      });
    });
  }

  // Indicaciones de técnica por familia de movimiento
  const CUES = {
    plank: { es: ['Cuerpo en línea recta de cabeza a talones', 'Aprieta glúteos y abdomen, no hundas la cadera'], en: ['Straight line from head to heels', 'Squeeze glutes and abs, don\'t let the hips sag'] },
    supine: { es: ['Zona lumbar pegada al suelo', 'Exhala al subir, controla al bajar'], en: ['Keep your lower back on the floor', 'Exhale on the way up, control on the way down'] },
    quad: { es: ['Espalda plana como una mesa', 'Movimiento lento y controlado'], en: ['Flat back like a table', 'Slow, controlled movement'] },
    stand: { es: ['Pecho arriba y abdomen firme', 'Rodillas alineadas con la punta de los pies'], en: ['Chest up, core braced', 'Knees in line with your toes'] },
    seated: { es: ['Espalda recta, inclínate atrás sin encorvarte', 'Gira desde el tronco, no solo los brazos'], en: ['Straight back, lean back without rounding', 'Rotate from the trunk, not just the arms'] },
    hang: { es: ['Hombros activos, sin balancearte', 'Sube con el abdomen, no con impulso'], en: ['Active shoulders, no swinging', 'Lift with your abs, not momentum'] },
    side: { es: ['Cadera alta, cuerpo en línea', 'Codo justo debajo del hombro'], en: ['Hips high, body in line', 'Elbow right under the shoulder'] },
    prone: { es: ['Mira al suelo, cuello neutro', 'Aprieta glúteos al elevar'], en: ['Look at the floor, neutral neck', 'Squeeze your glutes as you lift'] },
    push: { es: ['Codos a 45°, no abiertos', 'Pecho casi toca el suelo, cuerpo rígido'], en: ['Elbows at 45°, not flared', 'Chest nearly touches the floor, body rigid'] },
    pull: { es: ['Barbilla sobre la barra', 'Baja controlado hasta extender los brazos'], en: ['Chin over the bar', 'Lower under control to full extension'] },
    jump: { es: ['Aterriza suave con rodillas flexionadas', 'Rodillas hacia afuera, nunca hacia adentro'], en: ['Land softly with bent knees', 'Knees out, never caving in'] },
    full: { es: ['Ritmo constante, técnica antes que velocidad', 'Abdomen firme en la plancha'], en: ['Steady pace, form before speed', 'Brace your core in the plank'] },
    jack: { es: ['Brazos completamente arriba', 'Aterriza en la punta de los pies'], en: ['Arms all the way up', 'Land on the balls of your feet'] }
  };

  const EQUIP = [
    { id: 'none', es: 'Sin equipo', en: 'No equipment' },
    { id: 'bench', es: 'Banco, silla firme o cajón', en: 'Bench, sturdy chair or box' },
    { id: 'bar', es: 'Barra de dominadas', en: 'Pull-up bar' },
    { id: 'parallels', es: 'Paralelas (o dos sillas firmes)', en: 'Parallel bars (or two sturdy chairs)' },
    { id: 'band', es: 'Banda elástica', en: 'Resistance band' },
    { id: 'ball', es: 'Balón (fútbol o medicinal)', en: 'Ball (football or medicine ball)' },
    { id: 'fitball', es: 'Fitball', en: 'Swiss ball' },
    { id: 'wheel', es: 'Rueda abdominal', en: 'Ab wheel' },
    { id: 'weights', es: 'Mancuernas o botellas con agua', en: 'Dumbbells or water bottles' },
    { id: 'pack', es: 'Mochila con peso', en: 'Weighted backpack' },
    { id: 'partner', es: 'Compañero de entrenamiento', en: 'Training partner' },
    { id: 'rope', es: 'Cuerda para trepar', en: 'Climbing rope' }
  ];

  G.Exercises = { SECTIONS, LIST, CUES, EQUIP, byId: id => LIST.find(e => e.id === id) };
})(window);
