// LA SUBASTA TRAMPA LIVE — LEY LERDO



// Firebase SDK modular por CDN. Configura tu proyecto en el bloque indicado abajo.



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";



import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";



import {



  getFirestore, doc, collection, setDoc, getDoc, updateDoc, onSnapshot,



  serverTimestamp, Timestamp, runTransaction



} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";







// PEGA AQUI TU CONFIG



// Import the functions you need from the SDKs you need



// TODO: Add SDKs for Firebase products that you want to use



// https://firebase.google.com/docs/web/setup#available-libraries







// Your web app's Firebase configuration



// For Firebase JS SDK v7.20.0 and later, measurementId is optional



const firebaseConfig = {



  apiKey: "AIzaSyA8GZW0_uQFZmLOAGxrIFIv7b4rdMGag74",



  authDomain: "ley-lerdo-live.firebaseapp.com",



  projectId: "ley-lerdo-live",



  storageBucket: "ley-lerdo-live.firebasestorage.app",



  messagingSenderId: "1012174759390",



  appId: "1:1012174759390:web:93e4bb9163d58551ae294f",



  measurementId: "G-X90TPT2GNT"



};







// Initialize Firebase







const QUESTIONS = [

  {

    text: "TE LLEGA UN PAPEL: TU TIERRA SE TIENE QUE VENDER POR LA LEY LERDO.",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "AMPARO",

    feedback: {

      AMPARO: "¡Bien jugado! No entregaste la tierra sin pelear el asunto. El expediente respira... por ahora.",

      QUEDARSE: "Quedarte suena valiente, pero el papel no se va a asustar solo. Aquí tocaba buscar defensa legal.",

      LEVANTARSE: "La furia se entiende, pero empezaste por el final. Primero tocaba intentar frenar el despojo por la vía legal."

    }

  },

  {

    text: "EL HACENDADO TE OFRECE COMPRARLA BARATA.",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "QUEDARSE",

    partial: { answer: "AMPARO" },

    feedback: {

      QUEDARSE: "¡Eso! No vendas por presión. El hacendado llegó con una oferta tan baja que hasta su caballo se habría ofendido.",

      AMPARO: "No vas mal: defender tus derechos tiene sentido. Pero ante una oferta tramposa, primero no aceptes vender tu tierra.",

      LEVANTARSE: "Te fuiste directo al conflicto. El hacendado ofreció comprarla barata; todavía puedes negarte y conservar tu posición."

    }

  },

  {

    text: "TE DICEN QUE TIENES DEUDA Y POR ESO PIERDES TU TIERRA.",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "AMPARO",

    feedback: {

      AMPARO: "¡Correcto! Que alguien diga «tienes deuda» no convierte el despojo en justicia. Que aparezcan los papeles y la defensa.",

      QUEDARSE: "La intención de no irte está, pero quedarte físicamente no resuelve una acusación de deuda. Toca defenderte legalmente.",

      LEVANTARSE: "Saltaste a la rebelión sin revisar el caso. Si te reclaman una deuda, primero toca impugnar y defender tus derechos."

    }

  },

  {

    text: "LLEGA UN JUEZ A SACARTE DE TU TIERRA.",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "QUEDARSE",

    feedback: {

      AMPARO: "La defensa legal importa, pero en esta situación inmediata no abandones tu tierra sin más. El expediente todavía no termina.",

      QUEDARSE: "¡Firme! No entregaste tu hogar sin resistir el desalojo. El juez tendrá que explicar muy bien ese expediente.",

      LEVANTARSE: "La rabia es comprensible, pero la situación pide resistir el desalojo sin convertirlo automáticamente en una rebelión."

    }

  },

  {

    text: "TE OFRECEN IRTE DE PEÓN A LA HACIENDA HENEQUENERA.",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "LEVANTARSE",

    partial: { answer: "QUEDARSE" },

    feedback: {

      AMPARO: "Un amparo no es una respuesta automática a una oferta de trabajo. El problema es el sistema que te deja sin opciones.",

      QUEDARSE: "Casi. No aceptar la oferta es un buen comienzo, pero la situación también exige organizarse y resistir las condiciones injustas.",

      LEVANTARSE: "¡Eso! No cambiaste tu tierra por una vida de explotación. La hacienda no acaba de contratar a otro peón."

    }

  },

  {

    text: "TE DICEN: SI SIEMBRAS, TE METEN A LA CÁRCEL.",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "QUEDARSE",

    feedback: {

      AMPARO: "La defensa legal puede ayudar, pero aquí lo inmediato es no abandonar el cultivo ni aceptar la amenaza como ley.",

      QUEDARSE: "¡Correcto! Defender tu derecho a trabajar la tierra no debería ser delito. Alguien necesita explicárselo al juez.",

      LEVANTARSE: "No toda amenaza se resuelve levantándose en armas. Aquí tocaba mantenerse y defender el derecho a sembrar."

    }

  },

  {

    text: "OTROS PUEBLOS YA SE LEVANTARON. ¿TE UNES?",

    options: ["AMPARO", "QUEDARSE", "LEVANTARSE"],

    correct: "LEVANTARSE",

    feedback: {

      AMPARO: "La vía legal no desaparece, pero el contexto ya cambió: otros pueblos se organizaron y toca decidir si te sumas.",

      QUEDARSE: "Te quedaste mirando cómo los demás se organizaban. La historia no suele esperar a que termines de pensarlo.",

      LEVANTARSE: "¡Te uniste! La organización colectiva pesa más que un pueblo enfrentando todo en solitario."

    }

  },

  {

    text: "LLEGA LA REVOLUCIÓN. ¿QUÉ PIDEN LOS PUEBLOS?",

    options: ["QUE REGRESE EL EJIDO", "MÁS HACIENDAS", "QUE SE VENDA TODO"],

    correct: "QUE REGRESE EL EJIDO",

    feedback: {

      "QUE REGRESE EL EJIDO": "¡Correcto! La demanda era recuperar la tierra comunal. El ejido vuelve al expediente como protagonista.",

      "MÁS HACIENDAS": "¿Más haciendas? Justo lo que nadie pidió. El hacendado te acaba de mandar una canasta de agradecimiento.",

      "QUE SE VENDA TODO": "Liquidar todo no era la demanda. Los pueblos buscaban recuperar la tierra, no rematar hasta las piedras."

    }

  }

];





const $ = (id) => document.getElementById(id);



const screens = ["home-screen","host-setup","player-setup","lobby-screen","game-screen","results-screen"];



let app, auth, db, user = null, roomId = null, role = null, roomData = null;



let stopRoom = null, stopPlayers = null, players = [], timerInterval = null;



let submittedFor = -1, hostGrading = new Set();



let localQuestionStart = null;



let lastQuestionStart = null;

let lastCelebratedQuestion = -1;

let podiumRendered = false;







function showScreen(id) {



  screens.forEach(s => $(s).classList.toggle("hidden", s !== id));



}



function setStatus(id, message, error = false) {



  $(id).textContent = message;



  $(id).style.color = error ? "var(--red)" : "var(--bone)";



}



function configReady() {



  return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PEGA_AQUI") &&



    firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("PEGA_AQUI");



}



async function initializeFirebase() {



  if (!configReady()) throw new Error("Falta pegar tu firebaseConfig en app.js (busca PEGA AQUI TU CONFIG).");



  if (!app) {



    app = initializeApp(firebaseConfig);



    auth = getAuth(app);



    db = getFirestore(app);



  }



  if (!auth.currentUser) await signInAnonymously(auth);



  user = auth.currentUser;



}



function makePin() { return String(Math.floor(1000 + Math.random() * 9000)); }



function cleanupListeners() {



  if (stopRoom) stopRoom();



  if (stopPlayers) stopPlayers();



  if (timerInterval) clearInterval(timerInterval);



  stopRoom = stopPlayers = timerInterval = null;



}



function ensureAnswerResult() {

  let panel = $("answer-result");

  if (panel) return panel;



  const feedback = $("answer-feedback");

  if (!feedback) return null;



  panel = document.createElement("section");

  panel.id = "answer-result";

  panel.className = "answer-result hidden";

  panel.setAttribute("aria-live", "polite");

  feedback.insertAdjacentElement("afterend", panel);

  return panel;

}



function renderAnswerResult() {

  if (role !== "player" || !roomData) return;



  const panel = ensureAnswerResult();

  if (!panel) return;



  const me = players.find(p => p.id === user.uid);

  if (!me || me.feedbackQuestion !== roomData.currentQuestion || !me.lastOutcome) {

    panel.classList.add("hidden");

    panel.innerHTML = "";

    return;

  }



  const labels = {

    correct: "CORRECTO",

    partial: "CASI... RESPUESTA PARCIAL",

    incorrect: "INCORRECTO",

    unanswered: "SIN RESPUESTA"

  };

  const classes = {

    correct: "result-correct",

    partial: "result-partial",

    incorrect: "result-incorrect",

    unanswered: "result-unanswered"

  };



  panel.className = `answer-result ${classes[me.lastOutcome] || "result-incorrect"}`;

  panel.innerHTML = "";



  const heading = document.createElement("div");

  heading.className = "answer-result-heading";

  heading.textContent = labels[me.lastOutcome] || "RESULTADO";



  const message = document.createElement("p");

  message.className = "answer-result-message";

  message.textContent = me.lastFeedback || "El expediente ha sido revisado.";



  const score = document.createElement("div");

  score.className = "answer-result-score";

  score.textContent = `+${Number(me.lastPoints || 0).toLocaleString("es-MX")} PTS`;



  const detail = document.createElement("div");

  detail.className = "answer-result-detail";

  const correctText = me.lastCorrectAnswer ? `RESPUESTA SEGÚN EL CONTEXTO: ${me.lastCorrectAnswer}` : "";

  const multiplierText = Number(me.lastMultiplier || 1) > 1 ? " · PUNTOS DOBLES ×2" : "";

  detail.textContent = `${correctText}${multiplierText}`;



  panel.append(heading, message, score);

  if (detail.textContent) panel.appendChild(detail);

  panel.classList.remove("hidden");

}



function showDoubleRound(index) {

  let banner = $("double-round-banner");

  const isDouble = (roomData?.doubleQuestions || []).includes(index);



  if (!banner) {

    const context = $("question-context");

    if (!context) return;

    banner = document.createElement("div");

    banner.id = "double-round-banner";

    banner.className = "double-round-banner hidden";

    context.insertAdjacentElement("afterend", banner);

  }



  if (!isDouble) {

    banner.classList.add("hidden");

    return;

  }



  banner.innerHTML = '<span class="double-round-tag">EVENTO ESPECIAL</span><strong>¡PUNTOS ×2!</strong><span>ESTA RONDA VALE EL DOBLE</span>';

  banner.classList.remove("hidden");



  if (lastCelebratedQuestion !== index) {

    lastCelebratedQuestion = index;

    banner.classList.remove("double-round-pop");

    void banner.offsetWidth;

    banner.classList.add("double-round-pop");

  }

}



function calculatePlayerGrade(data, question, index, multiplier) {

  const outcome = data.answer === question.correct

    ? "correct"

    : (question.partial?.answer === data.answer ? "partial" : "incorrect");



  const basePoints = outcome === "correct" ? 1000 : outcome === "partial" ? 500 : 0;

  const elapsedMs = Math.min(15000, Math.max(0, Number(data.elapsedMs ?? 15000)));

  const secondsRemaining = Math.max(0, 15 - elapsedMs / 1000);

  const speedBonus = basePoints > 0 ? Math.round((secondsRemaining / 15) * 500) : 0;

  const earnedBeforeMultiplier = basePoints + speedBonus;

  const points = earnedBeforeMultiplier * multiplier;



  return {

    score: (data.score || 0) + points,

    lastPoints: points,

    lastBasePoints: earnedBeforeMultiplier,

    lastMultiplier: multiplier,

    lastOutcome: outcome,

    lastFeedback: question.feedback?.[data.answer] || "El contexto ha sido revisado. Sigue con el siguiente expediente.",

    lastCorrectAnswer: question.correct,

    feedbackQuestion: index,

    gradedQuestion: index

  };

}



function listenToRoom() {



  cleanupListeners();



  const roomRef = doc(db, "games", roomId);



  stopRoom = onSnapshot(roomRef, snap => {



    if (!snap.exists()) { setStatus("lobby-note", "ESTA SALA YA NO EXISTE.", true); return; }



    const newData = snap.data();







const newStart = newData.questionStartedAt?.toMillis?.() ?? null;







if (newStart !== lastQuestionStart) {



  lastQuestionStart = newStart;



  localQuestionStart = Date.now();



}







roomData = newData;;



    if (roomData.status === "lobby") showScreen("lobby-screen");



    else if (roomData.status === "playing") { showScreen("game-screen"); renderQuestion(); }



    else if (roomData.status === "finished") { showScreen("results-screen"); renderResults(); }



    if (role === "host" && roomData.status === "playing") gradeIncomingAnswers();



  }, err => setStatus(role === "host" ? "lobby-note" : "answer-feedback", "ERROR DE CONEXIÓN: " + err.message, true));



  stopPlayers = onSnapshot(collection(db, "games", roomId, "players"), snap => {



    players = snap.docs.map(d => ({ id: d.id, ...d.data() }));



    players.sort((a,b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0));



    renderPlayerList();



    if (roomData?.status === "playing") {



      $("live-count").textContent = players.length;



      $("answered-count").textContent = players.filter(p => p.answeredQuestion === roomData.currentQuestion).length;



    }



    if (roomData?.status === "finished") renderResults();



    if (role === "host" && roomData?.status === "playing") gradeIncomingAnswers();



  }, err => console.error(err));



}



function renderPlayerList() {



  $("player-count").textContent = players.length;



  const list = $("player-list");



  list.innerHTML = "";



  if (!players.length) list.innerHTML = '<p class="empty-state">TODAVÍA NO HAY NADIE. COMPARTE EL PIN.</p>';



  players.forEach(p => {



    const el = document.createElement("div");



    el.className = "player-chip";



    el.textContent = p.name || "JUGADOR";



    list.appendChild(el);



  });



}



async function createRoom() {



  try {



    setStatus("host-setup-status", "CONECTANDO CON EL ARCHIVO...");



    await initializeFirebase();



    let pin = makePin();



    let ref = doc(db, "games", pin);



    for (let tries = 0; tries < 8 && (await getDoc(ref)).exists(); tries++) {



      pin = makePin(); ref = doc(db, "games", pin);



    }



    roomId = pin; role = "host";



    await setDoc(ref, {



      pin, hostUid: user.uid, status: "lobby", currentQuestion: -1,



      questionStartedAt: null, createdAt: serverTimestamp()



    });



    $("room-pin").textContent = pin;



    $("host-lobby-controls").classList.remove("hidden");



    $("lobby-note").textContent = "COMPARTE EL PIN. CUANDO ESTÉN LISTOS, EMPIEZA.";



    listenToRoom();



    showScreen("lobby-screen");



  } catch (e) { setStatus("host-setup-status", e.message, true); }



}



async function joinRoom(event) {



  event.preventDefault();



  const pin = $("pin-input").value.trim();



  const name = $("name-input").value.trim().replace(/\s+/g, " ");



  if (!/^\d{4}$/.test(pin) || !name) return;



  try {



    setStatus("join-status", "BUSCANDO LA SALA...");



    await initializeFirebase();



    const ref = doc(db, "games", pin);



    const snap = await getDoc(ref);



    if (!snap.exists() || snap.data().status !== "lobby") throw new Error("PIN INCORRECTO O LA PARTIDA YA COMENZÓ.");



    roomId = pin; role = "player"; roomData = snap.data();



    await setDoc(doc(db, "games", pin, "players", user.uid), {



      uid: user.uid, name: name.slice(0,18), score: 0,



      joinedAt: serverTimestamp(), answer: null, answeredQuestion: -1, gradedQuestion: -1



    });



    $("room-pin").textContent = pin;



    $("host-lobby-controls").classList.add("hidden");



    $("lobby-note").textContent = "YA ESTÁS DENTRO. ESPERA AL HOST.";



    listenToRoom();



    showScreen("lobby-screen");



  } catch (e) { setStatus("join-status", e.message, true); }



}



function renderQuestion() {



  if (!roomData || roomData.status !== "playing") return;



  const index = roomData.currentQuestion;



  if (index < 0 || index >= QUESTIONS.length) return;



  const q = QUESTIONS[index];



  $("question-number").textContent = `PREGUNTA ${String(index+1).padStart(2,"0")} / 08`;



  $("question-text").textContent = q.text;



  $("question-context").textContent = `EXPEDIENTE ${String(index+1).padStart(2,"0")} / LEY LERDO`;

  showDoubleRound(index);



  $("question-hint").textContent = role === "host" ? "EL SALÓN ESTÁ RESPONDIENDO. REVISA EL AVANCE EN VIVO." : "ELIGE TU RESPUESTA ANTES DE QUE SE AGOTE EL TIEMPO.";



  $("host-game-controls").classList.toggle("hidden", role !== "host");



  if (role === "host") $("next-question").textContent = index === 7 ? "VER EL PODIO ↗" : "SIGUIENTE PREGUNTA ↗";



  const options = $("answer-options");



  options.innerHTML = "";



  if (role === "player") {



    const me = players.find(p => p.id === user.uid);



    const already = me && me.answeredQuestion === index;



    q.options.forEach((option, i) => {



      const btn = document.createElement("button");



      btn.className = "answer-option" + (me?.answer === option && already ? " selected" : "");



      btn.disabled = already || secondsLeft() <= 0;



      btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65+i)} /</span>`;



      btn.append(document.createTextNode(option));



      btn.addEventListener("click", () => submitAnswer(option));



      options.appendChild(btn);



    });



    $("answer-feedback").textContent = already ? "RESPUESTA REGISTRADA. ESPERA EL VEREDICTO." : "";

    renderAnswerResult();



  } else {



    options.innerHTML = '<div class="empty-state">RESPUESTAS OCULTAS AL HOST HASTA EL CIERRE DE CADA PREGUNTA.</div>';



    $("answer-feedback").textContent = "EL HOST CONTROLA EL AVANCE DE LA PARTIDA.";



  }



  $("live-count").textContent = players.length;



  $("answered-count").textContent = players.filter(p => p.answeredQuestion === index).length;



  startTimer();



}



function secondsLeft() {



  if (localQuestionStart === null) return 15;







  const elapsed = (Date.now() - localQuestionStart) / 1000;



  return Math.max(0, 15 - elapsed);



}



function startTimer() {



  if (timerInterval) clearInterval(timerInterval);



  const tick = () => {



    const remaining = secondsLeft();



    $("timer").textContent = Math.ceil(remaining);



    $("timer-fill").style.width = `${Math.max(0, remaining / 15 * 100)}%`;



    if (remaining <= 0) {



      $("answer-options").querySelectorAll("button").forEach(b => b.disabled = true);



      if (role === "player") $("answer-feedback").textContent = "TIEMPO AGOTADO. ESPERA AL HOST.";



    }



    if (role === "host") {



      $("next-question").disabled = remaining > 0;



      $("next-question").textContent = remaining > 0



        ? `ESPERA ${Math.ceil(remaining)} SEGUNDOS`



        : "CERRAR PREGUNTA ↗";



    }



  };



  tick(); timerInterval = setInterval(tick, 150);



}



async function submitAnswer(answer) {

  if (role !== "player" || secondsLeft() <= 0) return;



  const index = roomData.currentQuestion;

  const elapsedMs = localQuestionStart === null

    ? 15000

    : Math.min(15000, Math.max(0, Date.now() - localQuestionStart));

  const playerRef = doc(db, "games", roomId, "players", user.uid);



  try {

    await runTransaction(db, async tx => {

      const snap = await tx.get(playerRef);

      if (!snap.exists()) throw new Error("NO SE ENCONTRÓ TU REGISTRO.");



      const data = snap.data();

      if (data.answeredQuestion === index) return;



      tx.update(playerRef, {

        answer,

        elapsedMs,

        answeredQuestion: index,

        answeredAt: Timestamp.now()

      });

    });



    $("answer-options").querySelectorAll("button").forEach(b => b.disabled = true);

    $("answer-feedback").textContent = "RESPUESTA REGISTRADA. EL JURADO ESTÁ REVISANDO...";

  } catch (e) {

    $("answer-feedback").textContent = e.message;

  }

}



async function gradeIncomingAnswers() {

  if (role !== "host" || !roomData || roomData.status !== "playing") return;



  const index = roomData.currentQuestion;

  const question = QUESTIONS[index];

  if (!question) return;



  const multiplier = (roomData.doubleQuestions || []).includes(index) ? 2 : 1;



  for (const p of players) {

    if (p.answeredQuestion !== index || p.gradedQuestion === index || hostGrading.has(p.id)) continue;



    hostGrading.add(p.id);

    try {

      const playerRef = doc(db, "games", roomId, "players", p.id);

      await runTransaction(db, async tx => {

        const snap = await tx.get(playerRef);

        if (!snap.exists()) return;



        const data = snap.data();

        if (data.answeredQuestion !== index || data.gradedQuestion === index) return;



        tx.update(playerRef, calculatePlayerGrade(data, question, index, multiplier));

      });

    } catch (e) {

      console.error("No se pudo calificar:", e);

    } finally {

      hostGrading.delete(p.id);

    }

  }

}



async function finalizeQuestionResults() {

  if (role !== "host" || !roomData) return;



  await gradeIncomingAnswers();



  const index = roomData.currentQuestion;

  const question = QUESTIONS[index];

  if (!question) return;



  const multiplier = (roomData.doubleQuestions || []).includes(index) ? 2 : 1;



  for (const p of players) {

    const playerRef = doc(db, "games", roomId, "players", p.id);

    try {

      await runTransaction(db, async tx => {

        const snap = await tx.get(playerRef);

        if (!snap.exists()) return;



        const data = snap.data();

        if (data.gradedQuestion === index) return;



        if (data.answeredQuestion === index) {

          tx.update(playerRef, calculatePlayerGrade(data, question, index, multiplier));

          return;

        }



        tx.update(playerRef, {

          lastPoints: 0,

          lastBasePoints: 0,

          lastMultiplier: multiplier,

          lastOutcome: "unanswered",

          lastFeedback: "No respondiste a tiempo. El expediente se cerró y esos puntos se fueron de vacaciones.",

          lastCorrectAnswer: question.correct,

          feedbackQuestion: index,

          gradedQuestion: index

        });

      });

    } catch (e) {

      console.error("No se pudo cerrar el resultado del jugador:", e);

    }

  }

}



async function advanceQuestion() {



  $("next-question").disabled = true;

  await finalizeQuestionResults();

  // Deja visible el veredicto antes de cargar el siguiente expediente.

  await new Promise(resolve => setTimeout(resolve, 1800));

  const next = roomData.currentQuestion + 1;



  if (next >= QUESTIONS.length) {



    await updateDoc(doc(db, "games", roomId), { status: "finished" });



  } else {



    await updateDoc(doc(db, "games", roomId), {



      currentQuestion: next, questionStartedAt: Timestamp.now()



    });



  }



}



function renderResults() {

  const sorted = [...players].sort((a, b) =>

    (b.score || 0) - (a.score || 0) || (a.name || "").localeCompare(b.name || "")

  );



  const resultsScreen = $("results-screen");

  let intro = $("podium-intro");

  if (!intro) {

    intro = document.createElement("div");

    intro.id = "podium-intro";

    intro.className = "podium-intro";

    $("podium").insertAdjacentElement("beforebegin", intro);

  }

  intro.innerHTML = '<span>EXPEDIENTE CERRADO</span><strong>EL VEREDICTO FINAL</strong><small>LAS CUENTAS YA NO SE PUEDEN IMPUGNAR.</small>';



  const podium = $("podium");

  podium.innerHTML = "";



  // Visual order: segundo, primero, tercero. Animation reveals 2nd, 3rd, then 1st.

  const order = [sorted[1], sorted[0], sorted[2]];

  const classes = ["second", "first", "third"];

  const ranks = ["02", "01", "03"];

  const delays = ["0.25s", "1.65s", "0.95s"];



  order.forEach((p, i) => {

    const card = document.createElement("div");

    card.className = `podium-card ${classes[i]} podium-reveal`;

    card.style.animationDelay = delays[i];



    const rank = document.createElement("div");

    rank.className = "podium-rank";

    rank.textContent = p ? ranks[i] : "—";



    const name = document.createElement("div");

    name.className = "podium-name";

    name.textContent = p?.name || "SIN REGISTRO";



    const score = document.createElement("div");

    score.className = "podium-score";

    score.textContent = p ? `${Number(p.score || 0).toLocaleString("es-MX")} PTS` : "—";



    card.append(rank, name, score);

    podium.appendChild(card);

  });



  $("all-scores").innerHTML = "";

  sorted.forEach((p, i) => {

    const row = document.createElement("div");

    row.className = "score-row";



    const name = document.createElement("span");

    name.textContent = `${String(i + 1).padStart(2, "0")} / ${p.name}`;



    const score = document.createElement("b");

    score.textContent = `${Number(p.score || 0).toLocaleString("es-MX")} PTS`;



    row.append(name, score);

    $("all-scores").appendChild(row);

  });



  $("new-game").classList.toggle("hidden", role !== "host");



  if (!podiumRendered) {

    podiumRendered = true;

    let confetti = $("confetti-layer");

    if (!confetti) {

      confetti = document.createElement("div");

      confetti.id = "confetti-layer";

      confetti.className = "confetti-layer";

      resultsScreen.appendChild(confetti);

    }

    confetti.innerHTML = "";

    for (let i = 0; i < 48; i++) {

      const piece = document.createElement("span");

      piece.className = "confetti-piece";

      piece.style.left = `${Math.random() * 100}%`;

      piece.style.setProperty("--fall-duration", `${2.4 + Math.random() * 2.2}s`);

      piece.style.setProperty("--fall-delay", `${Math.random() * 0.8}s`);

      piece.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);

      piece.style.setProperty("--spin", `${Math.random() * 900 - 450}deg`);

      confetti.appendChild(piece);

    }

    setTimeout(() => confetti?.remove(), 6000);

  }

}



$("host-mode").addEventListener("click", () => showScreen("host-setup"));



$("player-mode").addEventListener("click", () => showScreen("player-setup"));



document.querySelectorAll("[data-home]").forEach(b => b.addEventListener("click", () => showScreen("home-screen")));



$("create-room").addEventListener("click", createRoom);



$("join-form").addEventListener("submit", joinRoom);



$("start-game").addEventListener("click", startGame);



$("next-question").addEventListener("click", advanceQuestion);



$("new-game").addEventListener("click", () => { cleanupListeners(); location.reload(); });



$("pin-input").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g,"").slice(0,4));

/* =========================================================
   FLUJO DE PARTIDA 2.0 — GUÍA / VEREDICTO / PODIO
   Las funciones declaradas aquí sustituyen las versiones
   anteriores, conservando Firebase y las preguntas existentes.
========================================================= */

function ensureGuidePanel() {
  let panel = $("quick-guide");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "quick-guide";
  panel.className = "quick-guide";
  const note = $("lobby-note");
  note.insertAdjacentElement("beforebegin", panel);
  return panel;
}

function renderQuickGuide() {
  const panel = ensureGuidePanel();
  panel.innerHTML = `
    <p class="kicker">ANTES DE ABRIR EL EXPEDIENTE</p>
    <h3>GUÍA RÁPIDA DE SUPERVIVENCIA</h3>
    <p class="guide-intro">Vas a tomar decisiones frente al despojo de tierras. No todas las situaciones se resuelven de la misma manera: lee el contexto y elige tu respuesta.</p>
    <div class="guide-options">
      <article class="guide-option"><span class="guide-symbol">01</span><div><strong>LEVANTARSE</strong><p>Organizarse y resistir colectivamente cuando la situación exige una respuesta de fuerza y unión.</p></div></article>
      <article class="guide-option"><span class="guide-symbol">02</span><div><strong>AMPARO</strong><p>Buscar protección y defensa por la vía legal cuando hay una amenaza, acusación o despojo que impugnar.</p></div></article>
      <article class="guide-option"><span class="guide-symbol">03</span><div><strong>QUEDARSE</strong><p>No abandonar la tierra ni aceptar una oferta o amenaza injusta cuando todavía puedes mantener tu posición.</p></div></article>
    </div>
    <p class="guide-footnote">8 PREGUNTAS · 15 SEGUNDOS POR DECISIÓN · LAS RESPUESTAS SE REVELAN AL CERRAR CADA RONDA.</p>
    <p class="guide-wait">${role === "host" ? "Cuando el salón esté listo, inicia la partida." : "Lee la guía y espera a que el host inicie."}</p>`;
  panel.classList.remove("hidden");
  $("start-game").textContent = "COMENZAR PARTIDA ↗";
}

function hideGuidePanel() {
  const panel = $("quick-guide");
  if (panel) panel.classList.add("hidden");
  if (role === "host") $("start-game").textContent = "EMPEZAR LA PARTIDA ↗";
}

async function storeRanksBeforeRound() {
  const fresh = await Promise.all(players.map(async p => {
    const ref = doc(db, "games", roomId, "players", p.id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: p.id, ...snap.data() } : null;
  }));
  const ranked = fresh.filter(Boolean).sort((a, b) =>
    (Number(b.score) || 0) - (Number(a.score) || 0) || (a.name || "").localeCompare(b.name || "")
  );
  await Promise.all(ranked.map((p, i) =>
    updateDoc(doc(db, "games", roomId, "players", p.id), { rankBefore: i + 1 })
  ));
}

async function startGame() {
  if (roomData?.status === "lobby") {
    if (!players.length) {
      setStatus("lobby-note", "NECESITAS AL MENOS UN JUGADOR PARA EMPEZAR.", true);
      return;
    }
    await updateDoc(doc(db, "games", roomId), { status: "guide", phase: "guide" });
    return;
  }

  if (roomData?.status !== "guide") return;
  if (!players.length) {
    setStatus("lobby-note", "NECESITAS AL MENOS UN JUGADOR PARA EMPEZAR.", true);
    return;
  }

  const shuffled = Array.from({ length: QUESTIONS.length }, (_, i) => i)
    .sort(() => Math.random() - 0.5);
  const doubleCount = Math.random() < 0.65 ? 1 : 2;
  const doubleQuestions = shuffled.slice(0, doubleCount).sort((a, b) => a - b);

  lastCelebratedQuestion = -1;
  podiumRendered = false;
  await storeRanksBeforeRound();
  await updateDoc(doc(db, "games", roomId), {
    status: "playing",
    phase: "question",
    currentQuestion: 0,
    questionStartedAt: Timestamp.now(),
    doubleQuestions
  });
}

function ensureRoundStage() {
  let stage = $("round-stage");
  if (stage) return stage;
  stage = document.createElement("section");
  stage.id = "round-stage";
  stage.className = "round-stage hidden";
  $("question-hint").insertAdjacentElement("afterend", stage);
  return stage;
}

function setQuestionElementsVisible(visible) {
  ["timer", "question-number", "timer-fill", "question-context", "question-text", "question-hint", "answer-options", "answer-feedback"].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.classList.toggle("round-hidden", !visible);
  });
  const track = document.querySelector(".timer-track");
  if (track) track.classList.toggle("round-hidden", !visible);
  const doubleBanner = $("double-round-banner");
  if (doubleBanner) doubleBanner.classList.toggle("round-hidden", !visible);
  const oldResult = $("answer-result");
  if (oldResult) oldResult.classList.toggle("round-hidden", !visible);
}

function renderQuestion() {
  if (!roomData || roomData.status !== "playing") return;
  if (roomData.phase === "reveal" || roomData.phase === "standings") {
    renderRoundStage();
    return;
  }

  const stage = $("round-stage");
  if (stage) stage.classList.add("hidden");
  setQuestionElementsVisible(true);

  const index = roomData.currentQuestion;
  if (index < 0 || index >= QUESTIONS.length) return;
  const q = QUESTIONS[index];

  $("question-number").textContent = `PREGUNTA ${String(index + 1).padStart(2, "0")} / 08`;
  $("question-text").textContent = q.text;
  $("question-context").textContent = `EXPEDIENTE ${String(index + 1).padStart(2, "0")} / LEY LERDO`;
  showDoubleRound(index);
  $("question-hint").textContent = role === "host"
    ? "EL SALÓN ESTÁ RESPONDIENDO. REVISA EL AVANCE EN VIVO."
    : "ELIGE TU RESPUESTA ANTES DE QUE SE AGOTE EL TIEMPO.";

  $("host-game-controls").classList.toggle("hidden", role !== "host");
  if (role === "host") {
    $("next-question").disabled = secondsLeft() > 0;
    $("next-question").textContent = "CERRAR PREGUNTA ↗";
  }

  const options = $("answer-options");
  options.innerHTML = "";
  if (role === "player") {
    const me = players.find(p => p.id === user.uid);
    const already = me && me.answeredQuestion === index;
    q.options.forEach((option, i) => {
      const btn = document.createElement("button");
      btn.className = "answer-option" + (me?.answer === option && already ? " selected" : "");
      btn.disabled = already || secondsLeft() <= 0;
      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = `${String.fromCharCode(65 + i)} /`;
      btn.append(letter, document.createTextNode(option));
      btn.addEventListener("click", () => submitAnswer(option));
      options.appendChild(btn);
    });
    $("answer-feedback").textContent = already ? "RESPUESTA REGISTRADA. ESPERA EL VEREDICTO." : "";
    renderAnswerResult();
  } else {
    options.innerHTML = '<div class="empty-state">RESPUESTAS OCULTAS AL HOST HASTA EL CIERRE DE CADA PREGUNTA.</div>';
    $("answer-feedback").textContent = "EL HOST CONTROLA EL AVANCE DE LA PARTIDA.";
  }

  $("live-count").textContent = players.length;
  $("answered-count").textContent = players.filter(p => p.answeredQuestion === index).length;
  startTimer();
}

function renderRoundStage() {
  if (!roomData || roomData.status !== "playing") return;
  if (timerInterval) clearInterval(timerInterval);
  const index = roomData.currentQuestion;
  const question = QUESTIONS[index];
  if (!question) return;

  setQuestionElementsVisible(false);
  const stage = ensureRoundStage();
  stage.classList.remove("hidden");
  $("host-game-controls").classList.toggle("hidden", role !== "host");
  if (role === "host") {
    $("next-question").disabled = false;
    $("next-question").textContent = roomData.phase === "reveal"
      ? "VER AVANCE DEL PODIO ↗"
      : (index === QUESTIONS.length - 1 ? "VER PODIO FINAL ↗" : "SIGUIENTE PREGUNTA ↗");
  }

  if (roomData.phase === "reveal") {
    const roundPlayers = players.filter(p => p.feedbackQuestion === index)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    const answered = roundPlayers.filter(p => p.answeredQuestion === index && p.answer);
    const counts = question.options.map(option => ({ option, count: answered.filter(p => p.answer === option).length }));
    const total = counts.reduce((sum, item) => sum + item.count, 0);
    let angle = 0;
    const palette = ["#D90429", "#E8B923", "#73C991", "#6D7CFF"];
    const slices = counts.map((item, i) => {
      const start = angle;
      angle += total ? item.count / total * 360 : 0;
      return `${palette[i % palette.length]} ${start}deg ${angle}deg`;
    });
    const pieStyle = total ? `conic-gradient(${slices.join(",")})` : "conic-gradient(#383838 0deg 360deg)";

    stage.innerHTML = `
      <div class="round-stage-head"><p class="kicker">EXPEDIENTE ${String(index + 1).padStart(2, "0")} / VEREDICTO COLECTIVO</p><h2>¿QUIÉN LE ATINÓ?</h2></div>
      <div class="correct-answer-stamp"><span>RESPUESTA CORRECTA</span><strong>${escapeHTML(question.correct)}</strong></div>
      <div class="distribution-panel"><div class="pie-chart" style="background:${pieStyle}"><span>${total}<small>RESPUESTAS</small></span></div><div class="pie-legend">${counts.map((item, i) => `<div class="legend-row"><i style="background:${palette[i % palette.length]}"></i><span>${escapeHTML(item.option)}</span><b>${item.count}</b></div>`).join("")}</div></div>
      <div class="sarcasm-heading"><span>///</span> EL EXPEDIENTE TIENE OPINIONES</div>
      <div class="sarcasm-list">${roundPlayers.length ? roundPlayers.map(p => {
        const face = p.lastOutcome === "correct" ? "😏" : p.lastOutcome === "partial" ? "😬" : p.lastOutcome === "unanswered" ? "💀" : "🤡";
        const label = p.lastOutcome === "correct" ? "ACERTÓ" : p.lastOutcome === "partial" ? "CASI" : p.lastOutcome === "unanswered" ? "NO RESPONDIÓ" : "SE EQUIVOCÓ";
        const answer = p.answer || "SIN RESPUESTA";
        return `<article class="sarcasm-card outcome-${p.lastOutcome || "incorrect"}"><span class="sarcasm-face" aria-hidden="true">${face}</span><div class="sarcasm-copy"><div class="sarcasm-player">${escapeHTML(p.name || "JUGADOR")} <small>${label}</small></div><p class="sarcasm-choice">Eligió: <b>${escapeHTML(answer)}</b></p><p class="sarcasm-message">${escapeHTML(p.lastFeedback || "El expediente no dejó comentarios.")}</p>${p.streakCount === 3 && p.gradedQuestion === index ? `<strong class="streak-callout">🔥 ${escapeHTML(p.name || "ALGUIEN")} ESTÁ EN RACHA: 3 ACERTADAS SEGUIDAS</strong>` : ""}</div><strong class="sarcasm-points">+${Number(p.lastPoints || 0).toLocaleString("es-MX")}</strong></article>`;
      }).join("") : '<p class="empty-state">NO HUBO RESPUESTAS REGISTRADAS.</p>'}</div>
      ${role === "player" ? '<p class="phase-wait">EL JURADO ESTÁ PREPARANDO EL NUEVO ORDEN DEL PODIO...</p>' : '<p class="phase-wait">REVISA LOS COMENTARIOS Y AVANZA CUANDO EL SALÓN ESTÉ LISTO.</p>'}`;
  } else {
    const sorted = [...players].sort((a, b) =>
      (Number(b.score) || 0) - (Number(a.score) || 0) || (a.name || "").localeCompare(b.name || "")
    );
    const streaks = sorted.filter(p => p.streakCount === 3 && p.gradedQuestion === index);
    stage.innerHTML = `
      <div class="round-stage-head"><p class="kicker">RONDA ${String(index + 1).padStart(2, "0")} / CLASIFICACIÓN ACTUALIZADA</p><h2>EL TABLERO SE MUEVE.</h2><p class="type-copy">PUNTOS ACUMULADOS DESPUÉS DE ESTA DECISIÓN.</p></div>
      ${streaks.length ? `<div class="streak-banner">🔥 ${streaks.map(p => `${escapeHTML(p.name)} ESTÁ EN RACHA`).join(" · ")}</div>` : ""}
      <div class="live-ranking">${sorted.map((p, i) => {
        const now = i + 1;
        const before = Number(p.rankBefore || now);
        let movement = "rank-same", movementText = "SE MANTIENE";
        if (now < before) { movement = "rank-up"; movementText = `▲ SUBE ${before - now}`; }
        else if (now > before) { movement = "rank-down"; movementText = `▼ BAJA ${now - before}`; }
        let podiumNote = "";
        if (before > 3 && now <= 3) podiumNote = " · ENTRA AL PODIO";
        else if (before <= 3 && now > 3) podiumNote = " · SALE DEL PODIO";
        return `<article class="ranking-row ${movement}"><span class="ranking-place">${String(now).padStart(2, "0")}</span><div class="ranking-person"><strong>${escapeHTML(p.name || "JUGADOR")}</strong><small>${movementText}${podiumNote}</small></div><b class="ranking-score">${Number(p.score || 0).toLocaleString("es-MX")} PTS</b></article>`;
      }).join("") || '<p class="empty-state">AÚN NO HAY PARTICIPANTES.</p>'}</div>
      <p class="phase-wait">${role === "host" ? "ELIGE CUÁNDO CONTINUAR." : "ESPERA A QUE EL HOST ABRA EL SIGUIENTE EXPEDIENTE."}</p>`;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function listenToRoom() {
  cleanupListeners();
  const roomRef = doc(db, "games", roomId);

  stopRoom = onSnapshot(roomRef, snap => {
    if (!snap.exists()) {
      setStatus("lobby-note", "ESTA SALA YA NO EXISTE.", true);
      return;
    }
    const newData = snap.data();
    const newStart = newData.questionStartedAt?.toMillis?.() ?? null;
    if (newStart !== lastQuestionStart) {
      lastQuestionStart = newStart;
      localQuestionStart = Date.now();
    }
    roomData = newData;

    if (roomData.status === "lobby") {
      showScreen("lobby-screen");
      hideGuidePanel();
    } else if (roomData.status === "guide") {
      showScreen("lobby-screen");
      renderQuickGuide();
    } else if (roomData.status === "playing") {
      showScreen("game-screen");
      renderQuestion();
      if (role === "host" && roomData.phase === "question") gradeIncomingAnswers();
    } else if (roomData.status === "finished") {
      showScreen("results-screen");
      renderResults();
    }
  }, err => setStatus(role === "host" ? "lobby-note" : "answer-feedback", "ERROR DE CONEXIÓN: " + err.message, true));

  stopPlayers = onSnapshot(collection(db, "games", roomId, "players"), snap => {
    players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    players.sort((a, b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0));
    renderPlayerList();

    if (roomData?.status === "playing") {
      $("live-count").textContent = players.length;
      $("answered-count").textContent = players.filter(p => p.answeredQuestion === roomData.currentQuestion).length;
      if (roomData.phase === "reveal" || roomData.phase === "standings") renderRoundStage();
    }
    if (roomData?.status === "finished") renderResults();
    if (role === "host" && roomData?.status === "playing" && roomData.phase === "question") gradeIncomingAnswers();
  }, err => console.error(err));
}

async function finalizeQuestionResults() {
  if (role !== "host" || !roomData) return;
  await gradeIncomingAnswers();
  const index = roomData.currentQuestion;
  const question = QUESTIONS[index];
  if (!question) return;
  const multiplier = (roomData.doubleQuestions || []).includes(index) ? 2 : 1;

  for (const p of players) {
    const playerRef = doc(db, "games", roomId, "players", p.id);
    try {
      await runTransaction(db, async tx => {
        const snap = await tx.get(playerRef);
        if (!snap.exists()) return;
        const data = snap.data();
        if (data.gradedQuestion === index) return;
        if (data.answeredQuestion === index) {
          tx.update(playerRef, calculatePlayerGrade(data, question, index, multiplier));
        } else {
          tx.update(playerRef, {
            lastPoints: 0,
            lastBasePoints: 0,
            lastMultiplier: multiplier,
            lastOutcome: "unanswered",
            lastFeedback: "No respondiste a tiempo. El expediente se cerró y esos puntos se fueron de vacaciones.",
            lastCorrectAnswer: question.correct,
            feedbackQuestion: index,
            gradedQuestion: index,
            streakCount: 0
          });
        }
      });
    } catch (e) {
      console.error("No se pudo cerrar el resultado del jugador:", e);
    }
  }
}

function calculatePlayerGrade(data, question, index, multiplier) {
  const outcome = data.answer === question.correct
    ? "correct"
    : (question.partial?.answer === data.answer ? "partial" : "incorrect");
  const basePoints = outcome === "correct" ? 1000 : outcome === "partial" ? 500 : 0;
  const elapsedMs = Math.min(15000, Math.max(0, Number(data.elapsedMs ?? 15000)));
  const secondsRemaining = Math.max(0, 15 - elapsedMs / 1000);
  const speedBonus = basePoints > 0 ? Math.round((secondsRemaining / 15) * 500) : 0;
  const earnedBeforeMultiplier = basePoints + speedBonus;
  const points = earnedBeforeMultiplier * multiplier;
  const streakCount = outcome === "correct" ? (Number(data.streakCount) || 0) + 1 : 0;

  return {
    score: (data.score || 0) + points,
    lastPoints: points,
    lastBasePoints: earnedBeforeMultiplier,
    lastMultiplier: multiplier,
    lastOutcome: outcome,
    lastFeedback: question.feedback?.[data.answer] || "El contexto ha sido revisado. Sigue con el siguiente expediente.",
    lastCorrectAnswer: question.correct,
    feedbackQuestion: index,
    gradedQuestion: index,
    streakCount
  };
}

async function advanceQuestion() {
  if (role !== "host" || !roomData) return;
  const roomRef = doc(db, "games", roomId);
  const phase = roomData.phase || "question";
  $("next-question").disabled = true;

  if (phase === "question") {
    await finalizeQuestionResults();
    await updateDoc(roomRef, { phase: "reveal" });
    return;
  }

  if (phase === "reveal") {
    await updateDoc(roomRef, { phase: "standings" });
    return;
  }

  if (phase === "standings") {
    const next = roomData.currentQuestion + 1;
    if (next >= QUESTIONS.length) {
      await updateDoc(roomRef, { status: "finished", phase: "finished" });
      return;
    }
    await storeRanksBeforeRound();
    await updateDoc(roomRef, {
      currentQuestion: next,
      phase: "question",
      questionStartedAt: Timestamp.now()
    });
  }
}
