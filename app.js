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
  { text: "TE LLEGA UN PAPEL: TU TIERRA SE TIENE QUE VENDER POR LA LEY LERDO.", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "AMPARO" },
  { text: "EL HACENDADO TE OFRECE COMPRARLA BARATA.", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "QUEDARSE" },
  { text: "TE DICEN QUE TIENES DEUDA Y POR ESO PIERDES TU TIERRA.", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "AMPARO" },
  { text: "LLEGA UN JUEZ A SACARTE DE TU TIERRA.", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "QUEDARSE" },
  { text: "TE OFRECEN IRTE DE PEÓN A LA HACIENDA HENEQUENERA.", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "LEVANTARSE" },
  { text: "TE DICEN: SI SIEMBRAS, TE METEN A LA CÁRCEL.", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "QUEDARSE" },
  { text: "OTROS PUEBLOS YA SE LEVANTARON. ¿TE UNES?", options: ["AMPARO", "QUEDARSE", "LEVANTARSE"], correct: "LEVANTARSE" },
  { text: "LLEGA LA REVOLUCIÓN. ¿QUÉ PIDEN LOS PUEBLOS?", options: ["QUE REGRESE EL EJIDO", "MÁS HACIENDAS", "QUE SE VENDA TODO"], correct: "QUE REGRESE EL EJIDO" }
];

const $ = (id) => document.getElementById(id);
const screens = ["home-screen","host-setup","player-setup","lobby-screen","game-screen","results-screen"];
let app, auth, db, user = null, roomId = null, role = null, roomData = null;
let stopRoom = null, stopPlayers = null, players = [], timerInterval = null;
let submittedFor = -1, hostGrading = new Set();

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
function listenToRoom() {
  cleanupListeners();
  const roomRef = doc(db, "games", roomId);
  stopRoom = onSnapshot(roomRef, snap => {
    if (!snap.exists()) { setStatus("lobby-note", "ESTA SALA YA NO EXISTE.", true); return; }
    roomData = snap.data();
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
async function startGame() {
  if (!players.length) { setStatus("lobby-note", "NECESITAS AL MENOS UN JUGADOR PARA EMPEZAR.", true); return; }
  await updateDoc(doc(db, "games", roomId), {
    status: "playing", currentQuestion: 0, questionStartedAt: Timestamp.now()
  });
}
function renderQuestion() {
  if (!roomData || roomData.status !== "playing") return;
  const index = roomData.currentQuestion;
  if (index < 0 || index >= QUESTIONS.length) return;
  const q = QUESTIONS[index];
  $("question-number").textContent = `PREGUNTA ${String(index+1).padStart(2,"0")} / 08`;
  $("question-text").textContent = q.text;
  $("question-context").textContent = `EXPEDIENTE ${String(index+1).padStart(2,"0")} / LEY LERDO`;
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
    $("answer-feedback").textContent = already ? "RESPUESTA REGISTRADA. ESPERA EL SIGUIENTE EXPEDIENTE." : "";
  } else {
    options.innerHTML = '<div class="empty-state">RESPUESTAS OCULTAS AL HOST HASTA EL CIERRE DE CADA PREGUNTA.</div>';
    $("answer-feedback").textContent = "EL HOST CONTROLA EL AVANCE DE LA PARTIDA.";
  }
  $("live-count").textContent = players.length;
  $("answered-count").textContent = players.filter(p => p.answeredQuestion === index).length;
  startTimer();
}
function secondsLeft() {
  const start = roomData?.questionStartedAt?.toMillis ? roomData.questionStartedAt.toMillis() : Date.now();
  return Math.max(0, 15 - (Date.now() - start) / 1000);
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
        : (roomData.currentQuestion === 7 ? "VER EL PODIO ↗" : "SIGUIENTE PREGUNTA ↗");
    }
  };
  tick(); timerInterval = setInterval(tick, 150);
}
async function submitAnswer(answer) {
  if (role !== "player" || secondsLeft() <= 0) return;
  const index = roomData.currentQuestion;
  const playerRef = doc(db, "games", roomId, "players", user.uid);
  try {
    await runTransaction(db, async tx => {
      const snap = await tx.get(playerRef);
      if (!snap.exists()) throw new Error("NO SE ENCONTRÓ TU REGISTRO.");
      const data = snap.data();
      if (data.answeredQuestion === index) return;
      tx.update(playerRef, { answer, answeredQuestion: index, answeredAt: Timestamp.now() });
    });
    $("answer-options").querySelectorAll("button").forEach(b => b.disabled = true);
    $("answer-feedback").textContent = "RESPUESTA REGISTRADA. NO SE PUEDE CAMBIAR.";
  } catch (e) { $("answer-feedback").textContent = e.message; }
}
async function gradeIncomingAnswers() {
  if (role !== "host" || !roomData || roomData.status !== "playing") return;
  const index = roomData.currentQuestion;
  const q = QUESTIONS[index];
  if (!q) return;
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
        const answerTime = data.answeredAt?.toMillis ? data.answeredAt.toMillis() : Date.now();
        const startTime = roomData.questionStartedAt?.toMillis ? roomData.questionStartedAt.toMillis() : answerTime;
        const secondsRemaining = Math.max(0, 15 - (answerTime - startTime) / 1000);
        const points = data.answer === q.correct ? 100 + Math.floor(secondsRemaining) * 10 : 0;
        tx.update(playerRef, { score: (data.score || 0) + points, lastPoints: points, gradedQuestion: index });
      });
    } catch (e) { console.error("No se pudo calificar:", e); }
    finally { hostGrading.delete(p.id); }
  }
}
async function advanceQuestion() {
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
  const sorted = [...players].sort((a,b) => (b.score || 0) - (a.score || 0) || (a.name || "").localeCompare(b.name || ""));
  const podium = $("podium");
  podium.innerHTML = "";
  const order = [sorted[1], sorted[0], sorted[2]];
  const classes = ["second","first","third"];
  const ranks = ["02","01","03"];
  order.forEach((p,i) => {
    const card = document.createElement("div");
    card.className = `podium-card ${classes[i]}`;
    card.innerHTML = `<div class="podium-rank">${p ? ranks[i] : "—"}</div>`;
    const name = document.createElement("div"); name.className = "podium-name"; name.textContent = p?.name || "SIN REGISTRO";
    const score = document.createElement("div"); score.className = "podium-score"; score.textContent = p ? `${p.score || 0} PTS` : "—";
    card.append(name, score); podium.appendChild(card);
  });
  $("all-scores").innerHTML = "";
  sorted.forEach((p,i) => {
    const row = document.createElement("div"); row.className = "score-row";
    const name = document.createElement("span"); name.textContent = `${String(i+1).padStart(2,"0")} / ${p.name}`;
    const score = document.createElement("b"); score.textContent = `${p.score || 0} PTS`;
    row.append(name,score); $("all-scores").appendChild(row);
  });
  $("new-game").classList.toggle("hidden", role !== "host");
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
