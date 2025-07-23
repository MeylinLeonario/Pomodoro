const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const bars = document.querySelectorAll(".bar");
const quoteDisplay = document.getElementById("quote");
const music = document.getElementById("backgroundMusic");
const bell = document.getElementById("bellSound");
const showHistoryBtn = document.getElementById("showHistoryBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const pomodoroView = document.getElementById("pomodoroView");

showHistoryBtn.addEventListener("click", () => {
  pomodoroView.style.display = "none";
  historySection.style.display = "block";
});

closeHistoryBtn.addEventListener("click", () => {
  historySection.style.display = "none";
  pomodoroView.style.display = "block";
});


const quotes = [
  "Focus and finish strong.",
  "One step at a time.",
  "Discipline over motivation.",
  "Breathe. Begin. Become. 🌱",
  "You’ve got this.",
  "Create what didn’t exist before.",
  "The future is yours to program.",
  "Discipline is destiny.",
  "Learn as if you will live forever.",
  "Excellence is not an act, but a habit.",
  "Veritas – Seek the truth.",
  "Small progress is still progress.",
  "Let your focus be your strength."
];

let countdown;
let remainingTime = 0;

// 👉 Esta función actualiza el texto del reloj
function updateDisplay() {
  const m = String(Math.floor(remainingTime / 60)).padStart(2, "0");
  const s = String(remainingTime % 60).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
  clearInterval(countdown);

  // Validación básica para no iniciar si el tiempo es 0
  if (remainingTime === 0) {
    alert("Selecciona una duración antes de iniciar 🍅");
    return;
  }

  // Mostrar frase motivadora
  const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = newQuote;

  if (music && document.getElementById("musicToggle").checked) {
    music.play();
  }
  


  let initialDuration = remainingTime; // guardamos el tiempo original

    countdown = setInterval(() => {
    if (remainingTime > 0) {
        remainingTime--;
        updateDisplay(); // actualiza pantalla
        if (remainingTime === 3 && bell.paused) {
          bell.play(); // ¡campanita 3 segundos antes!
        }
    } else {
        clearInterval(countdown);
        if (music) {
          music.pause();
          music.currentTime = 0;
        }
        quoteDisplay.textContent = "Time’s up! 🎉";
        registerCompletion(Math.round(initialDuration / 60));
    }
    }, 1000);
}

function pauseTimer() {
  clearInterval(countdown);
  if (music) music.pause();
}

// Cambio de duración con los botones de arriba
bars.forEach(bar => {
  bar.addEventListener("click", () => {
    clearInterval(countdown);
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    remainingTime = parseInt(bar.dataset.time) * 60;
    updateDisplay();
    quoteDisplay.textContent = "Ready when you are! 🚀";
  });
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);

const historySection = document.getElementById("history");
const countDisplay = document.getElementById("count");
const historyList = document.getElementById("list");

let dailyHistory = JSON.parse(localStorage.getItem("dailyHistory") || "{}");

updateHistoryDisplay();

function registerCompletion(durationMinutes) {
  const now = new Date();
  const dateKey = now.toLocaleDateString("sv-SE", { timeZone: "America/Santiago" });
  const time = now.toLocaleTimeString("es-CL", {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: "America/Santiago"
  });

  const subject = document.getElementById("subjectInput").value.trim() || "Sin ramo";
  const entry = `${durationMinutes} min – ${time} – ${subject}`;

  if (!dailyHistory[dateKey]) {
    dailyHistory[dateKey] = [];
  }
  dailyHistory[dateKey].push(entry);

  // Limpiar historial de más de 28 días
  const today = new Date(now.toLocaleDateString("sv-SE", { timeZone: "America/Santiago" }));
  const maxAge = 28 * 24 * 60 * 60 * 1000;
  Object.keys(dailyHistory).forEach(dateStr => {
    const entryDate = new Date(dateStr);
    if (today - entryDate > maxAge) {
      delete dailyHistory[dateStr];
    }
  });

  localStorage.setItem("dailyHistory", JSON.stringify(dailyHistory));
  updateHistoryDisplay();

  // ✅ Registra el Pomodoro para el sistema de metas
  guardarPomodoro(subject);
}


function updateHistoryDisplay() {
  historyList.innerHTML = "";
  countDisplay.textContent = Object.values(dailyHistory).flat().length;

  const sortedDates = Object.keys(dailyHistory)
    .sort((a, b) => new Date(b) - new Date(a));

  sortedDates.forEach(date => {
    const readableDate = new Date(date + "T00:00:00-04:00").toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Santiago"
    });

    const dateTitle = document.createElement("li");
    dateTitle.textContent = `📅 ${readableDate.charAt(0).toUpperCase() + readableDate.slice(1)}:`;
    dateTitle.style.fontWeight = "bold";
    dateTitle.style.marginTop = "10px";
    historyList.appendChild(dateTitle);

    dailyHistory[date].forEach(entry => {
      const [duration, time, subject] = entry.split(" – ");
      const li = document.createElement("li");
      li.textContent = `🎓 ${subject} → ${duration} @ ${time}`;
      historyList.appendChild(li);
    });
  });
}

function mostrarMetas() {
  document.getElementById("pomodoroView").style.display = "none";
  document.getElementById("metas-container").style.display = "block";
  cargarMetas();
}

function volverAlPomodoro() {
  document.getElementById("pomodoroView").style.display = "block";
  document.getElementById("metas-container").style.display = "none";
}

function agregarMeta() {
  const ramo = document.getElementById("nuevoRamo").value.trim();
  const cantidad = parseInt(document.getElementById("metaCantidad").value);
  if (!ramo || isNaN(cantidad)) return;

  const metas = JSON.parse(localStorage.getItem("metasSemanales") || "{}");
  metas[ramo] = cantidad;
  localStorage.setItem("metasSemanales", JSON.stringify(metas));

  document.getElementById("nuevoRamo").value = "";
  document.getElementById("metaCantidad").value = "";
  cargarMetas();
}

function calcularProgreso() {
  const metas = JSON.parse(localStorage.getItem("metasSemanales") || "{}");
  const historial = JSON.parse(localStorage.getItem("historialPomodoros") || "{}");

  const progreso = {};
  for (const fecha in historial) {
    historial[fecha].forEach(ramo => {
      progreso[ramo] = (progreso[ramo] || 0) + 1;
    });
  }

  const resumen = {};
  for (const ramo in metas) {
    resumen[ramo] = {
      hecho: progreso[ramo] || 0,
      meta: metas[ramo],
      completado: (progreso[ramo] || 0) >= metas[ramo]
    };
  }

  return resumen;
}

function cargarMetas() {
  const metas = JSON.parse(localStorage.getItem("metasSemanales") || "{}");
  const progreso = calcularProgreso();
  const lista = document.getElementById("listaMetas");
  lista.innerHTML = "";

  for (const ramo in metas) {
    const hecho = progreso[ramo]?.hecho || 0;
    const meta = metas[ramo];
    const completado = hecho >= meta;
    const porcentaje = Math.min(Math.round((hecho / meta) * 100), 100);

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ramo}</strong>: ${hecho} / ${meta} Pomodoros
      <progress value="${hecho}" max="${meta}"></progress>
      ${completado ? "✅ ¡Meta cumplida!" : ""}
    `;
    lista.appendChild(li);
  }
}

function guardarPomodoro(ramo) {
  const historial = JSON.parse(localStorage.getItem("historialPomodoros") || "{}");
  const hoy = new Date().toISOString().slice(0, 10);

  if (!historial[hoy]) historial[hoy] = [];
  historial[hoy].push(ramo);

  localStorage.setItem("historialPomodoros", JSON.stringify(historial));
  const metas = JSON.parse(localStorage.getItem("metasSemanales") || "{}");
  if (metas[ramo] && historial[hoy].filter(r => r === ramo).length === metas[ramo]) {
    alert(`🎯 ¡Felicidades! Alcanzaste tu meta semanal en ${ramo}.`);
  }

}

const videoElement = document.getElementById('videoInput');
const deteccionToggle = document.getElementById("deteccionToggle");

let sinRostroSeguido = 0;
let detectorActivo = false;
let camera = null;

const faceDetection = new FaceDetection({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});

faceDetection.setOptions({
  model: 'short',
  minDetectionConfidence: 0.6
});

faceDetection.onResults(results => {
  if (!detectorActivo) return;

  if (results.detections.length === 0) {
    sinRostroSeguido++;
    console.log("❌ No se detecta rostro (" + sinRostroSeguido + ")");
    if (sinRostroSeguido >= 2) {
      bell.play();
      sinRostroSeguido = 0;
    }
  } else {
    console.log("✅ Rostro detectado");
    sinRostroSeguido = 0;
  }
});

deteccionToggle.addEventListener("change", async () => {
  if (deteccionToggle.checked) {
    console.log("🔍 Iniciando detección de concentración...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      console.log("🎥 Cámara accesible");

      detectorActivo = true;

      camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceDetection.send({ image: videoElement });
        },
        width: 640,
        height: 480
      });

      camera.start();
      console.log("✅ Cámara iniciada y detector activo");
    } catch (e) {
      console.error("❌ Error al acceder a la cámara:", e);
      alert("No se pudo acceder a la cámara 🥲");
      deteccionToggle.checked = false;
    }
  } else {
    console.log("🛑 Detección desactivada");
    detectorActivo = false;
    if (camera) camera.stop();
    if (videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    videoElement.srcObject = null;
  }
});
